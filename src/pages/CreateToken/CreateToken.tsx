import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonButton,
  IonIcon,
  IonActionSheet,
  IonText,
  IonLoading,
  IonToast,
  IonCard,
  IonCardContent,
} from '@ionic/react';
import { Upload } from 'antd';
import type { UploadFileStatus } from 'antd/es/upload/interface';
import { camera, image, add } from 'ionicons/icons';
import { useState } from 'react';

// import { WalletBalance } from '../../components';
// Using the proper Privy integration hook
import { useCreateTokenPumpFunWithPrivy } from '../../hooks/useCreateTokenPumpFunWithPrivy';
import { usePhotoGallery } from '../../hooks/usePhotoGallery';
import { usePrivyWallet } from '../../hooks/usePrivyWallet';
import { useWalletBalance } from '../../hooks/useWalletBalance';
import { useLogin } from '@privy-io/react-auth';

import './CreateToken.css';

export const CreateToken: React.FC = () => {
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [tokenDescription, setTokenDescription] = useState('');
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');

  const { photos, takePhoto, selectFromGallery, deletePhoto } = usePhotoGallery();
  const { 
    createToken, 
    isCreating, 
    error: createTokenError, 
    status: tokenCreationStatus,
    isSuccess,
    data: tokenResult,
    reset,
    walletValidation,
    walletAddress: privyWalletAddress,
    isWalletReady
  } = useCreateTokenPumpFunWithPrivy();
  
  // Check if Privy is configured
  const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID;
  const hasValidAppId = PRIVY_APP_ID && (PRIVY_APP_ID.startsWith('cl') || PRIVY_APP_ID.startsWith('cmb')) && PRIVY_APP_ID.length > 10;
  
  // Always call hooks, but handle the case when Privy is not configured
  const privyWallet = usePrivyWallet();
  const privyLogin = useLogin();
  
  const { walletAddress, ready, authenticated, hasWallet, createWallet } = hasValidAppId 
    ? privyWallet 
    : { walletAddress: null, ready: true, authenticated: false, hasWallet: false, createWallet: () => {} };
  
  const login = hasValidAppId 
    ? privyLogin.login 
    : () => alert('Please set up Privy App ID to connect wallet');
  
  // Fetch wallet balance using Privy wallet address
  const currentWalletForBalance = privyWalletAddress || walletAddress;
  const { data: balanceData, isLoading: isLoadingBalance } = useWalletBalance(
    currentWalletForBalance || null, 
    isWalletReady && !!currentWalletForBalance
  );



  const fileList = photos.map((photo, idx) => ({
    uid: String(idx),
    name: photo.filepath,
    status: 'done' as UploadFileStatus,
    url: photo.webviewPath,
  }));

  // Utility function to convert image URL to File object
  const convertUrlToFile = async (url: string, filename: string): Promise<File> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type || 'image/jpeg' });
  };

  const handleCreateToken = async () => {
    console.log('Form values:', {
      tokenName: `"${tokenName}"`,
      tokenSymbol: `"${tokenSymbol}"`,
      tokenDescription: `"${tokenDescription}"`,
      hasPhoto: photos.length > 0,
      walletAddress: privyWalletAddress || walletAddress,
      isWalletReady,
      walletValidation: walletValidation.message,
    });

    // Use the enhanced Privy wallet validation
    if (!walletValidation.isValid) {
      setToastMessage(walletValidation.message);
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    const currentWalletAddress = privyWalletAddress || walletAddress;
    if (!currentWalletAddress) {
      setToastMessage('No wallet address found');
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    if (!tokenName.trim()) {
      setToastMessage('Please enter a token name');
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    if (!tokenSymbol.trim()) {
      setToastMessage('Please enter a token symbol');
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    if (!tokenDescription.trim()) {
      setToastMessage('Please enter a token description');
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    try {
      console.log('Creating token with Pump.fun service using Privy wallet integration...');
      
      // Reset any previous state
      reset();

      // Convert photo to File object if available
      let imageFile: File | undefined;
      if (photos.length > 0 && photos[0].webviewPath) {
        try {
          console.log('Converting photo to File object...');
          imageFile = await convertUrlToFile(
            photos[0].webviewPath, 
            `${tokenSymbol}_image.jpg`
          );
          console.log('Photo converted to File, size:', imageFile.size);
        } catch (photoError) {
          console.error('Failed to convert photo to File:', photoError);
          setToastMessage(
            'Failed to process photo. Creating token without image.',
          );
          setToastColor('danger');
          setShowToast(true);
          // Continue without photo
        }
      }

      // Default image if no photo provided
      if (!imageFile) {
        // Create a simple 1x1 pixel image as fallback
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, 1, 1);
        }
        
        const blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob(resolve, 'image/png');
        });
        
        if (blob) {
          imageFile = new File([blob], `${tokenSymbol}_default.png`, { type: 'image/png' });
        }
      }

      if (!imageFile) {
        throw new Error('Failed to create image file');
      }

      // Create token metadata
      const metadata = {
        name: tokenName.trim(),
        symbol: tokenSymbol.trim(),
        description: tokenDescription.trim(),
        image: imageFile,
        twitter: '', // Could add these fields to the form
        telegram: '',
        website: '',
      };

      // Create the token (mint only, no initial buy)
      const result = await createToken({
        metadata,
      });

      if (result.success) {
        const explorerUrl = `https://explorer.solana.com/tx/${result.signature}`;
        const pumpFunUrl = `https://pump.fun/${result.mintAddress}`;
        
        setToastMessage(
          `🎉 Token created on Pump.fun! View on Explorer or Pump.fun`,
        );
        setToastColor('success');
        setShowToast(true);

        // Log for easy copying
        console.log('🎉 Token created successfully!');
        console.log('Mint Address:', result.mintAddress);
        console.log('Transaction signature:', result.signature);
        console.log('Explorer URL:', explorerUrl);
        console.log('Pump.fun URL:', pumpFunUrl);
        console.log('Metadata URI:', result.metadataUri);

        // Reset form
        setTokenName('');
        setTokenSymbol('');
        setTokenDescription('');

        // Clear photos
        photos.forEach((photo) => {
          deletePhoto(photo.filepath);
        });
      } else {
        throw new Error(result.error || 'Token creation failed');
      }
    } catch (error) {
      console.error('Token creation failed:', error);
      setToastMessage(
        `Token creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      setToastColor('danger');
      setShowToast(true);
    }
  };



  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle className="p-4">Create Token</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        {/* Authentication Check */}
        {!ready && (
          <IonText color="medium">
            <p>Loading wallet...</p>
          </IonText>
        )}

        {ready && !authenticated && (
          <IonText color="warning">
            <p>Please connect your wallet to create tokens.</p>
          </IonText>
        )}

        {/* Wallet Address Display */}
        {isWalletReady && currentWalletForBalance && (
          <div className="ion-margin-bottom">
            <IonCard>
              <IonCardContent>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <IonText color="primary">
                    <h6 style={{ margin: 0, fontWeight: 'bold' }}>Connected Wallet</h6>
                  </IonText>
                  <div style={{ textAlign: 'right' }}>
                    <IonText color="primary">
                      <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
                        {isLoadingBalance ? (
                          '...'
                        ) : balanceData ? (
                          `${balanceData.balance.toFixed(4)} SOL`
                        ) : (
                          '0.0000 SOL'
                        )}
                      </p>
                    </IonText>
                    <IonText color="medium">
                      <p style={{ margin: 0, fontSize: '11px' }}>Balance</p>
                    </IonText>
                  </div>
                </div>
                <IonText color="medium">
                  <p style={{ 
                    margin: 0, 
                    fontSize: '14px', 
                    fontFamily: 'monospace',
                    wordBreak: 'break-all'
                  }}>
                    {currentWalletForBalance}
                  </p>
                </IonText>
                <IonText color="success">
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px' }}>
                    ✅ Privy Wallet Connected
                  </p>
                </IonText>
              </IonCardContent>
            </IonCard>
          </div>
        )}

        {/* Wallet Balance Section */}
        {/* {walletAddress && (
          <WalletBalance
            publicKey={walletAddress}
            title="Your Wallet Balance"
          />
        )} */}

        <div>
          <div
            onClick={() => setShowActionSheet(true)}
            className="card-wrapper mb-6"
          >
            <Upload
              openFileDialogOnClick={false}
              listType="picture-card"
              multiple={false}
              fileList={fileList}
              onRemove={(file) => {
                deletePhoto(file.name);
              }}
              style={{
                width: '100%',
                height: '300px',
              }}
            >
              {!photos?.[0]?.webviewPath && (
                <div className="flex items-center">
                  <IonIcon icon={add} size="large" color="primary" />
                  <IonText color="primary">Upload</IonText>
                </div>
              )}
            </Upload>
          </div>

          <IonItem className="mb-4">
            <IonLabel position="stacked">Token Name</IonLabel>
            <IonInput
              value={tokenName}
              onIonChange={(e) => {
                const value = e.detail.value || '';
                setTokenName(value);
              }}
              placeholder="Enter token name"
            />
          </IonItem>

          <IonItem className="mb-4">
            <IonLabel position="stacked">Token Symbol</IonLabel>
            <IonInput
              value={tokenSymbol}
              onIonChange={(e) => {
                const value = e.detail.value || '';
                setTokenSymbol(value);
              }}
              placeholder="Enter token symbol (e.g., BTC, ETH)"
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Description</IonLabel>
            <IonTextarea
              value={tokenDescription}
              onIonChange={(e) => {
                const value = e.detail.value || '';
                console.log('Description changed:', `"${value}"`);
                setTokenDescription(value);
              }}
              placeholder="Enter token description"
              rows={4}
            />
          </IonItem>

          {!hasValidAppId ? (
            <IonButton
              expand="block"
              color="warning"
              className="ion-margin-top"
              onClick={() => alert('Set up Privy App ID in .env file:\nVITE_PRIVY_APP_ID=your_app_id_here')}
            >
              Set up Wallet Authentication
            </IonButton>
          ) : !ready ? (
            <IonButton expand="block" className="ion-margin-top" disabled>
              Loading...
            </IonButton>
          ) : !authenticated ? (
            <IonButton
              expand="block"
              color="primary"
              className="ion-margin-top"
              onClick={() => login({ loginMethods: ['email', 'wallet'] })}
            >
              Connect Wallet or Login with Email
            </IonButton>
          ) : !hasWallet ? (
            <IonButton
              expand="block"
              color="secondary"
              className="ion-margin-top"
              onClick={createWallet}
            >
              Create Solana Wallet to Continue
            </IonButton>
          ) : (
            <IonButton
              expand="block"
              onClick={handleCreateToken}
              className="ion-margin-top"
              disabled={isCreating}
            >
              {isCreating
                ? tokenCreationStatus?.message || 'Creating Token...'
                : 'Create Token on Pump.fun (Mint Only)'}
            </IonButton>
          )}



          {/* Token Creation Status */}
          {tokenCreationStatus && (
            <div className="ion-margin-top">
              <IonText color={tokenCreationStatus.step === -1 ? 'danger' : 'primary'}>
                <h4>{tokenCreationStatus.message}</h4>
              </IonText>
              {tokenCreationStatus.logs.length > 0 && (
                <div className="ion-margin-top">
                  {tokenCreationStatus.logs.map((log, index) => (
                    <IonText key={index} color="medium">
                      <p style={{ fontSize: '0.9em', margin: '4px 0' }}>{log}</p>
                    </IonText>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <IonActionSheet
          isOpen={showActionSheet}
          onDidDismiss={() => setShowActionSheet(false)}
          buttons={[
            {
              text: 'Take Photo',
              icon: camera,
              handler: takePhoto,
            },
            {
              text: 'Choose from Gallery',
              icon: image,
              handler: selectFromGallery,
            },
            {
              text: 'Cancel',
              role: 'cancel',
            },
          ]}
        />

        <IonLoading
          isOpen={isCreating}
          message="Creating token..."
        />

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={5000}
          color={toastColor}
        />
      </IonContent>
    </IonPage>
  );
};
