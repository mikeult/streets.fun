import {
  Keypair,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
  Connection,
  TransactionInstruction,
  type AccountMeta,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
} from '@solana/spl-token';
import * as borsh from 'borsh';
import BN from 'bn.js';

const SLIPPAGE_BASIS_POINTS = 2500; // 25%

const INITIAL_VIRTUAL_TOKEN_RESERVES = new BN('1073000000000000');
const INITIAL_VIRTUAL_SOL_RESERVES = new BN('30000000000');
const CONSTANT_PRODUCT = INITIAL_VIRTUAL_TOKEN_RESERVES.mul(INITIAL_VIRTUAL_SOL_RESERVES);

const PUMP_FUN_PROGRAM_ID = new PublicKey(
  '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P'
);
const MPL_TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
);
// Using pump.fun's direct IPFS endpoint for metadata upload
const PUMP_FUN_API_URL = 'https://pump.fun/api/ipfs';
const PUMP_FUN_ACCOUNT = new PublicKey('Ce6TQqeHC9p8KetsN6JsjHK7UTZk7nasjjnr7XxXp9F1');

export interface CreateTokenMetadata {
  name: string;
  symbol: string;
  description: string;
  twitter?: string;
  telegram?: string;
  website?: string;
  image: File;
}

export interface PumpFunTokenResult {
  success: boolean;
  signature?: string;
  error?: string;
  inspectorUrl?: string;
  mintAddress?: string;
  metadataUri?: string;
}

export interface TokenCreationStatus {
  message: string;
  step: number;
  logs: string[];
}

export type StatusCallback = (status: TokenCreationStatus) => void;

/**
 * Upload token metadata to pump.fun via proxy to avoid CORS issues
 */
export async function uploadMetadata(
  metadata: CreateTokenMetadata
): Promise<string> {
  const formData = new FormData();
  formData.append('file', metadata.image);
  formData.append('name', metadata.name);
  formData.append('symbol', metadata.symbol);
  formData.append('description', metadata.description);
  formData.append('twitter', metadata.twitter || '');
  formData.append('telegram', metadata.telegram || '');
  formData.append('website', metadata.website || '');
  formData.append('showName', 'true');

  const response = await fetch(PUMP_FUN_API_URL, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to upload metadata: ${errorText}`);
  }

  const result = await response.json();
  return result.metadataUri;
}

/**
 * Generate a new mint keypair locally
 */
export function generateMintKeypair(): Keypair {
  return Keypair.generate();
}

/**
 * Create and launch token on pump.fun with initial buy
 */
export async function createAndLaunchToken(
  connection: Connection,
  creator: Keypair,
  metadata: CreateTokenMetadata,
  buyAmountSol: number,
  statusCallback: StatusCallback
): Promise<PumpFunTokenResult> {
  // Generate mint keypair locally
  const mint = generateMintKeypair();
  let metadataUri = '';
  let transaction: VersionedTransaction | null = null;

  try {
    statusCallback({ message: 'Uploading metadata to IPFS...', step: 0, logs: [] });
    metadataUri = await uploadMetadata(metadata);
    statusCallback({ 
      message: 'Metadata uploaded successfully!', 
      step: 1, 
      logs: [`Metadata URI: ${metadataUri}`] 
    });

    statusCallback({ 
      message: 'Building transaction...', 
      step: 1, 
      logs: [`Metadata URI: ${metadataUri}`, `Mint Address: ${mint.publicKey.toBase58()}`] 
    });

    const createInstruction = await getCreateInstruction(
      creator.publicKey,
      mint.publicKey,
      metadata.name,
      metadata.symbol,
      metadataUri
    );

    const creatorAta = await getAssociatedTokenAddress(mint.publicKey, creator.publicKey);
    const createAtaInstruction = createAssociatedTokenAccountIdempotentInstruction(
      creator.publicKey, // payer
      creatorAta,        // ata
      creator.publicKey, // owner
      mint.publicKey     // mint
    );

    const [globalAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from('global')],
      PUMP_FUN_PROGRAM_ID
    );
    const globalAccountInfo = await connection.getAccountInfo(globalAccount);
    if (!globalAccountInfo) {
      throw new Error('Failed to fetch global account info');
    }

    const feeRecipient = new PublicKey(globalAccountInfo.data.slice(41, 73));

    statusCallback({ 
      message: 'Calculating buy amount...', 
      step: 1, 
      logs: [`Metadata URI: ${metadataUri}`, `Mint Address: ${mint.publicKey.toBase58()}`] 
    });

    const solInLamports = new BN(buyAmountSol * 1_000_000_000);

    const tokenOut = INITIAL_VIRTUAL_TOKEN_RESERVES.sub(
        CONSTANT_PRODUCT.div(INITIAL_VIRTUAL_SOL_RESERVES.add(solInLamports))
    );

    if (tokenOut.isNeg()) {
        throw new Error('Calculation resulted in a negative token amount. Your SOL input is likely too low.');
    }

    const maxSolCost = solInLamports.mul(new BN(10000 + SLIPPAGE_BASIS_POINTS)).div(new BN(10000));

    const buyInstruction = await getBuyInstruction(
      creator.publicKey,
      mint.publicKey,
      feeRecipient,
      tokenOut,
      maxSolCost
    );

    const instructions = [createInstruction, createAtaInstruction, buyInstruction];

    let { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

    const messageV0 = new TransactionMessage({
      payerKey: creator.publicKey,
      recentBlockhash: blockhash,
      instructions,
    }).compileToV0Message();

    transaction = new VersionedTransaction(messageV0);
    transaction.sign([creator, mint]);

    const signature = await connection.sendTransaction(transaction, { maxRetries: 5 });

    statusCallback({
      message: `Transaction sent. Waiting for confirmation...`,
      step: 2,
      logs: [
        `Metadata URI: ${metadataUri}`, 
        `Mint Address: ${mint.publicKey.toBase58()}`, 
        `Signature: ${signature}`
      ],
    });

    let retries = 10;
    while (retries > 0) {
        try {
            const confirmation = await connection.confirmTransaction({
                signature,
                blockhash,
                lastValidBlockHeight
            }, 'confirmed');

            if (confirmation.value.err) {
                throw new Error(`Transaction failed to confirm: ${confirmation.value.err}`);
            }

            break;
        } catch (error) {
            if (retries === 1) {
                const status = await connection.getSignatureStatus(signature, { searchTransactionHistory: true });
                if (status.value?.confirmationStatus === 'confirmed' || status.value?.confirmationStatus === 'finalized') {
                    break;
                }

                throw error;
            }
            await new Promise(resolve => setTimeout(resolve, 3000));
            retries--;
        }
    }

    statusCallback({
      message: 'Token created and launched successfully!',
      step: 3,
      logs: [
        `Metadata URI: ${metadataUri}`, 
        `Mint Address: ${mint.publicKey.toBase58()}`, 
        `Signature: ${signature}`
      ],
    });

    return {
      success: true,
      signature: signature,
      mintAddress: mint.publicKey.toBase58(),
      metadataUri: metadataUri,
    };
  } catch (error) {
    let inspectorUrl: string | undefined = undefined;
    if (transaction) {
        const serializedMessage = Buffer.from(transaction.message.serialize()).toString('base64');
        inspectorUrl = `https://explorer.solana.com/tx/inspector?message=${encodeURIComponent(serializedMessage)}`;
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      inspectorUrl,
      mintAddress: mint.publicKey.toBase58(),
      metadataUri: metadataUri || undefined,
    };
  }
}

async function getCreateInstruction(
  creator: PublicKey,
  mint: PublicKey,
  name: string,
  symbol: string,
  uri: string
): Promise<TransactionInstruction> {
  const discriminator = Buffer.from([24, 30, 200, 40, 5, 28, 7, 119]);

  // Define the struct for Borsh v2
  class CreateTokenStruct {
    discriminator: Uint8Array;
    name: string;
    symbol: string;
    uri: string;
    creator: Uint8Array;

    constructor(props: {
      discriminator: Uint8Array;
      name: string;
      symbol: string;
      uri: string;
      creator: Uint8Array;
    }) {
      this.discriminator = props.discriminator;
      this.name = props.name;
      this.symbol = props.symbol;
      this.uri = props.uri;
      this.creator = props.creator;
    }
  }

  const schema = {
    struct: {
      discriminator: { array: { type: "u8", len: 8 } },
      name: "string",
      symbol: "string",
      uri: "string",
      creator: { array: { type: "u8", len: 32 } },
    },
  };

  const data = borsh.serialize(
    schema,
    new CreateTokenStruct({
      discriminator: new Uint8Array(discriminator),
      name,
      symbol,
      uri,
      creator: new Uint8Array(creator.toBuffer()),
    })
  );

  const [mintAuthority] = PublicKey.findProgramAddressSync(
    [Buffer.from('mint-authority')],
    PUMP_FUN_PROGRAM_ID
  );

  const [bondingCurve] = PublicKey.findProgramAddressSync(
    [Buffer.from('bonding-curve'), mint.toBuffer()],
    PUMP_FUN_PROGRAM_ID
  );

  const [metadata] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('metadata'),
      MPL_TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    MPL_TOKEN_METADATA_PROGRAM_ID
  );

  const associatedBondingCurve = await getAssociatedTokenAddress(
    mint,
    bondingCurve,
    true
  );

  const [globalAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from('global')],
    PUMP_FUN_PROGRAM_ID
  );

  const [eventAuthority] = PublicKey.findProgramAddressSync(
    [Buffer.from('__event_authority')],
    PUMP_FUN_PROGRAM_ID
  );

  const keys: AccountMeta[] = [
    { pubkey: mint, isSigner: true, isWritable: true },
    { pubkey: mintAuthority, isSigner: false, isWritable: false },
    { pubkey: bondingCurve, isSigner: false, isWritable: true },
    { pubkey: associatedBondingCurve, isSigner: false, isWritable: true },
    { pubkey: globalAccount, isSigner: false, isWritable: false },
    {
      pubkey: MPL_TOKEN_METADATA_PROGRAM_ID,
      isSigner: false,
      isWritable: false,
    },
    { pubkey: metadata, isSigner: false, isWritable: true },
    { pubkey: creator, isSigner: true, isWritable: true },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    {
      pubkey: ASSOCIATED_TOKEN_PROGRAM_ID,
      isSigner: false,
      isWritable: false,
    },
    { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    { pubkey: eventAuthority, isSigner: false, isWritable: false },
    { pubkey: PUMP_FUN_PROGRAM_ID, isSigner: false, isWritable: false },
  ];

  return new TransactionInstruction({
    keys,
    programId: PUMP_FUN_PROGRAM_ID,
    data,
  });
}

async function getBuyInstruction(
  creator: PublicKey,
  mint: PublicKey,
  feeRecipient: PublicKey,
  amount: BN,
  maxSolCost: BN
): Promise<TransactionInstruction> {
  const buyer = creator;
  const discriminator = Buffer.from([102, 6, 61, 18, 1, 218, 235, 234]);

  // Define the struct for Borsh v2
  class BuyTokenStruct {
    discriminator: Uint8Array;
    amount: BN;
    maxSolCost: BN;

    constructor(props: {
      discriminator: Uint8Array;
      amount: BN;
      maxSolCost: BN;
    }) {
      this.discriminator = props.discriminator;
      this.amount = props.amount;
      this.maxSolCost = props.maxSolCost;
    }
  }

  const schema = {
    struct: {
      discriminator: { array: { type: "u8", len: 8 } },
      amount: "u64",
      maxSolCost: "u64",
    },
  };

  const data = borsh.serialize(
    schema,
    new BuyTokenStruct({
      discriminator: new Uint8Array(discriminator),
      amount: amount,
      maxSolCost: maxSolCost,
    })
  );

  const [globalAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from('global')],
    PUMP_FUN_PROGRAM_ID
  );

  const [bondingCurve] = PublicKey.findProgramAddressSync(
    [Buffer.from('bonding-curve'), mint.toBuffer()],
    PUMP_FUN_PROGRAM_ID
  );
  
  const [creatorVault] = PublicKey.findProgramAddressSync(
    [Buffer.from('creator-vault'), creator.toBuffer()],
    PUMP_FUN_PROGRAM_ID
  );

  const associatedBondingCurve = await getAssociatedTokenAddress(
    mint,
    bondingCurve,
    true
  );

  const associatedUser = await getAssociatedTokenAddress(mint, buyer);

  const keys: AccountMeta[] = [
    { pubkey: globalAccount, isSigner: false, isWritable: false },
    { pubkey: feeRecipient, isSigner: false, isWritable: true },
    { pubkey: mint, isSigner: false, isWritable: false },
    { pubkey: bondingCurve, isSigner: false, isWritable: true },
    { pubkey: associatedBondingCurve, isSigner: false, isWritable: true },
    { pubkey: associatedUser, isSigner: false, isWritable: true },
    { pubkey: buyer, isSigner: true, isWritable: true },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: creatorVault, isSigner: false, isWritable: true },
    { pubkey: PUMP_FUN_ACCOUNT, isSigner: false, isWritable: false },
    { pubkey: PUMP_FUN_PROGRAM_ID, isSigner: false, isWritable: false },
  ];

  return new TransactionInstruction({
    keys,
    programId: PUMP_FUN_PROGRAM_ID,
    data,
  });
}