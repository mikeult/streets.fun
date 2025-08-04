# SAK - Solana Token Creation App

🚀 **Create, Launch, and Manage Solana Tokens with Ease**

SAK is a powerful cross-platform application that democratizes Solana token creation. Built with modern web technologies and designed for both mobile and desktop, SAK makes it simple for anyone to create and launch their own cryptocurrency tokens on the Solana blockchain through the popular Pump.fun platform.

## 🎯 About

SAK bridges the gap between complex blockchain technology and everyday users by providing an intuitive interface for token creation. Whether you're a crypto enthusiast, entrepreneur, or developer, SAK empowers you to:

- **Create Custom Tokens**: Design and mint your own Solana-based tokens with custom names, symbols, and descriptions
- **Upload Token Images**: Add visual identity to your tokens with integrated photo capture and upload
- **Secure Wallet Integration**: Connect safely using Privy's enterprise-grade wallet authentication
- **Cross-Platform Access**: Use the same app on web browsers, iOS, and Android devices
- **Real-time Management**: Track your wallet balance and manage all your created tokens in one place

The app integrates seamlessly with Pump.fun, one of the leading platforms for Solana token launches, ensuring your tokens have immediate visibility and trading capabilities.

## ✨ Key Features

### 🪙 **Token Creation & Management**
- **One-Click Token Creation**: Create Solana SPL tokens with just a few taps
- **Custom Token Metadata**: Set token name, symbol, description, and supply
- **Pump.fun Integration**: Automatic listing on Pump.fun for immediate trading
- **Token Portfolio**: View and manage all your created tokens in one dashboard
- **Transaction History**: Track all your token creation and trading activities

### 🔐 **Secure Authentication & Wallet**
- **Multiple Login Methods**: Connect via email, wallet, or social authentication
- **Privy Integration**: Enterprise-grade security with embedded wallet creation
- **Automatic Wallet Generation**: Create Solana wallets instantly after email signup
- **Real-time Balance**: Live SOL balance updates and transaction monitoring
- **Multi-Wallet Support**: Connect multiple wallets and switch between them

### 📱 **Cross-Platform Experience**
- **Progressive Web App**: Works seamlessly in any modern browser
- **Native Mobile Apps**: Full-featured iOS and Android applications
- **Responsive Design**: Optimized UI for phones, tablets, and desktop
- **Offline Capabilities**: Continue working even with limited connectivity

### 🎨 **Media & Customization**
- **Photo Integration**: Take photos or upload images for token branding
- **Image Processing**: Automatic image optimization and formatting
- **Dark/Light Themes**: Automatic theme switching based on system preferences
- **Intuitive UI**: Clean, modern interface built with Ionic and Ant Design

### ⚡ **Performance & Reliability**
- **Fast Transactions**: Optimized Solana transaction processing
- **Error Handling**: Comprehensive error management and user feedback
- **Caching**: Smart data caching for improved performance
- **Real-time Updates**: Live data synchronization across all features

## 🚀 Tech Stack

- **Frontend Framework**: React 18.2.0 with TypeScript
- **Mobile Framework**: Ionic React 8.5.0
- **Cross-Platform**: Capacitor 7.3.0 (iOS & Android)
- **Build Tool**: Vite 5.2.0
- **Styling**: TailwindCSS 4.1.8 + Ant Design 5.25.4
- **Blockchain**: Solana Web3.js 1.98.2
- **Authentication**: Privy 2.14.1
- **State Management**: TanStack React Query 5.80.7
- **Testing**: Vitest + Cypress

## 📁 Project Structure

### Root Configuration Files

#### `package.json`

Main project configuration file containing:

- Project metadata (name: "sak", version: 0.0.1)
- NPM scripts for development, building, testing, and linting
- Dependencies including Ionic React, Solana Web3.js, Privy Auth, and UI libraries
- Development dependencies for testing, linting, and build tools

#### `vite.config.ts`

Vite build configuration:

- React plugin setup with legacy browser support
- Build target set to 'esnext' with BigInt support for Solana
- Vitest configuration for unit testing
- Rollup configuration for ES module output

#### `capacitor.config.ts`

Capacitor configuration for mobile app deployment:

- App ID: `com.timur.sak`
- App name: "sak"
- Web directory: "dist"

#### `ionic.config.json`

Ionic framework configuration:

- Project type: "react-vite"
- Capacitor integration enabled
- Project ID: "34659eec"

#### `tsconfig.json` & `tsconfig.node.json`

TypeScript configuration files:

- `tsconfig.json`: Main TypeScript configuration for the application
- `tsconfig.node.json`: Node.js specific TypeScript configuration for build tools

#### `.env.local`

Environment variables configuration (432 bytes):

- Contains API keys and configuration values
- Includes Helius RPC URL for Solana connection

#### Configuration Files for Tools

- `.prettierrc`: Code formatting configuration
- `.browserslistrc`: Browser compatibility targets
- `eslint.config.js`: ESLint linting rules and configuration
- `postcss.config.mjs`: PostCSS configuration for CSS processing
- `cypress.config.ts`: End-to-end testing configuration
- `.nvmrc`: Node.js version specification
- `.gitignore`: Git ignore patterns

### Source Code (`src/`)

#### Main Application Files

##### `src/main.tsx`

Application entry point:

- Sets up QueryClient for TanStack React Query
- Configures Ant Design theme provider with dark/light mode detection
- Renders the root App component with React StrictMode

##### `src/App.tsx`

Main application component:

- Sets up Ionic React framework
- Configures routing with IonReactRouter
- Implements tab-based navigation structure
- Wraps app with PrivyProvider for authentication
- Includes bottom navigation bar

##### `src/index.css`

Global CSS styles (minimal, 23 bytes):

- Basic global styling for the application

##### `src/vite-env.d.ts`

TypeScript environment declarations for Vite

##### `src/App.test.tsx`

Basic test file for the App component

##### `src/setupTests.ts`

Test environment setup:

- Configures Jest DOM testing utilities
- Sets up testing environment for React components

### Components (`src/components/`)

#### `src/components/index.ts`

Barrel export file for components

#### `src/components/PrivyProvider.tsx`

Authentication provider component:

- Configures Privy authentication with Solana support
- Sets up wallet connection and authentication flow

#### `src/components/ProtectedRoute.tsx`

Route protection component:

- Implements authentication-based route guarding
- Redirects unauthenticated users to login page

#### `src/components/ExploreContainer.tsx` & `ExploreContainer.css`

Generic container component:

- Reusable UI component for content display
- Associated CSS styles for component styling

#### Component Directories

##### `src/components/BottomNavbar/`

Bottom navigation component directory containing the main navigation interface

##### `src/components/WalletBalance/`

Wallet balance display component directory for showing user's Solana balance

##### `src/components/CreatedTokens/`

Component directory for displaying user's created tokens list

##### `src/components/Routes/`

Routing component directory containing application route definitions

### Pages (`src/pages/`)

#### `src/pages/Login.tsx`

Login page component (2.9KB):

- Implements user authentication interface
- Integrates with Privy authentication provider

#### `src/pages/Tab2.tsx`

Main application tab (6.4KB, 223 lines):

- Primary interface for token creation and management
- Largest page component with comprehensive functionality

#### `src/pages/Tab3.tsx` & `Tab3.css`

Third tab page component:

- Additional application functionality
- Associated CSS file (empty)

#### `src/pages/CreateToken/`

Token creation page directory:

- Contains components for creating new Solana tokens
- Implements token creation form and logic

### Services (`src/services/`)

#### `src/services/solanaService.ts`

Core Solana blockchain service (3.8KB, 145 lines):

- Handles Solana Web3.js integration
- Manages transaction creation, signing, and sending
- Implements keypair generation and management
- Provides connection to Solana network

#### `src/services/tokenApi.ts`

Token API service (3.2KB, 112 lines):

- Handles API communication for token creation
- Implements HTTP requests to Pump.fun API
- Manages token launch API integration

#### `src/services/pumpFunCreatedTokensService.ts`

Pump.fun token service (6.7KB, 234 lines):

- Specialized service for Pump.fun platform integration
- Handles created tokens retrieval and management
- Implements platform-specific API calls

### Hooks (`src/hooks/`)

Custom React hooks for application logic:

#### `src/hooks/usePrivyWallet.ts`

Privy wallet integration hook (2.8KB, 97 lines):

- Manages wallet connection through Privy
- Handles wallet state and authentication

#### `src/hooks/useTokenApi.ts`

Token API hook (472 bytes, 20 lines):

- React Query hook for token API calls
- Simplifies API state management

#### `src/hooks/useWalletBalance.ts`

Wallet balance hook (987 bytes, 40 lines):

- Manages and displays wallet balance
- Handles balance updates and formatting

#### `src/hooks/useCreateTokenWithPrivy.ts`

Token creation with Privy hook (2.7KB, 84 lines):

- Combines token creation with Privy authentication
- Handles the complete token creation flow

#### `src/hooks/useCreateTokenWithPrivyHybrid.ts`

Hybrid token creation hook (3.7KB, 114 lines):

- Advanced token creation implementation
- Provides alternative token creation methods

#### `src/hooks/useCreatedTokens.ts`

Created tokens management hook (745 bytes, 29 lines):

- Manages list of user's created tokens
- Handles token data fetching and caching

#### `src/hooks/useLaunchTokenOnly.ts`

Token launch hook (1.2KB, 48 lines):

- Handles token launching process
- Separates launch logic from creation

#### `src/hooks/useCreateToken.ts`

Core token creation hook (2.5KB, 79 lines):

- Main token creation logic
- Integrates with Solana services

#### `src/hooks/usePhotoGallery.ts`

Photo gallery hook (2.5KB, 97 lines):

- Handles image selection and management
- Integrates with Capacitor Camera plugin

### Utilities (`src/utils/`)

#### `src/utils/fileUtils.ts`

File handling utilities (2.0KB, 95 lines):

- File upload and processing functions
- Image handling and conversion utilities

#### `src/utils/keypairManager.ts`

Keypair management utilities (2.8KB, 114 lines):

- Solana keypair generation and storage
- Secure key management using Capacitor Preferences

### Constants (`src/constants/`)

#### `src/constants/index.ts`

Main constants barrel export file

#### `src/constants/api.ts`

API configuration constants:

- Base URLs for API endpoints
- API configuration values

#### `src/constants/routes.ts`

Route constants:

- Application route definitions
- Navigation path constants

### Types (`src/types/`)

TypeScript type definitions directory (currently empty but structured for type definitions)

### Modules (`src/modules/`)

#### `src/modules/pump-fun/`

Pump.fun platform integration module containing:

- Specialized components for Pump.fun integration
- Platform-specific services and utilities
- Custom hooks for Pump.fun functionality
- Type definitions for Pump.fun API
- Navigation and screen components

### Examples (`src/examples/`)

Example code directory containing demonstration implementations and usage examples

### Mobile Platform Directories

#### `android/`

Android platform-specific files and configuration:

- Generated by Capacitor for Android app builds
- Contains Android Studio project files
- Platform-specific resources and configuration

#### `ios/`

iOS platform-specific files and configuration:

- Generated by Capacitor for iOS app builds
- Contains Xcode project files
- Platform-specific resources and configuration

### Build and Distribution

#### `dist/`

Production build output directory:

- Generated by Vite build process
- Contains optimized and bundled application files

#### `public/`

Static assets directory:

- `favicon.png`: Application favicon (930 bytes)
- `manifest.json`: Web app manifest for PWA functionality

#### `resources/`

Capacitor resources directory:

- Contains app icons and splash screens for mobile platforms

### Testing

#### `cypress/`

End-to-end testing directory:

- Contains Cypress test files and configuration
- E2E test scenarios and fixtures

## 🛠️ Installation & Setup

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Git** for version control

**For Mobile Development (Optional):**
- **Android Studio** (for Android builds) - [Download here](https://developer.android.com/studio)
- **Xcode** (for iOS builds, macOS only) - Available from Mac App Store

### Quick Start

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd sak
   ```

2. **Install Dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Configuration**
   ```bash
   # Create environment file
   touch .env
   
   # Add required environment variables
   echo "VITE_PRIVY_APP_ID=your_privy_app_id_here" >> .env
   echo "VITE_HELIUS_RPC_URL=your_helius_rpc_url" >> .env
   ```

   **Required Environment Variables:**
   - `VITE_PRIVY_APP_ID` - Get from [Privy Dashboard](https://dashboard.privy.io/)
   - `VITE_HELIUS_RPC_URL` - Get from [Helius](https://helius.xyz/) (or use default Solana RPC)

4. **Start Development Server**
   ```bash
   npm run dev
   # or
   ionic serve
   ```

5. **Open in Browser**
   
   Navigate to `http://localhost:5173` in your web browser.

## 🎮 Usage

### First Time Setup

1. **Open the App**: Navigate to the app in your browser or mobile device
2. **Connect Wallet**: Click "Connect Wallet or Login with Email"
3. **Choose Login Method**: 
   - **Email**: Sign up with your email address
   - **Wallet**: Connect an existing Solana wallet (Phantom, Solflare, etc.)
4. **Create Wallet** (if using email): The app will automatically create a Solana wallet for you
5. **Fund Wallet**: Add some SOL to your wallet to pay for token creation fees

### Creating Your First Token

1. **Token Details**: Fill in your token's name, symbol, and description
2. **Add Image**: Take a photo or upload an image for your token
3. **Review & Create**: Verify all details and click "Create Token"
4. **Confirm Transaction**: Approve the transaction in your wallet
5. **Success**: Your token will be created and listed on Pump.fun!

### Managing Tokens

- **View Portfolio**: See all your created tokens in the dashboard
- **Track Performance**: Monitor your token's trading activity
- **Share Tokens**: Share your token's Pump.fun page with others

### Development Commands

```bash
# Start development server with hot reload
npm run dev

# Run linting
npm run lint

# Format code with Prettier
npm run format

# Run tests
npm test

# Run end-to-end tests
npm run e2e
```

## 📦 Building for Production

### Web Application

```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview

# Build files will be in ./dist directory
```

### Mobile Applications

#### Android

```bash
# 1. Build the web app
npm run build

# 2. Sync with Capacitor
npx cap sync android

# 3. Open in Android Studio
npx cap open android

# 4. Build APK/AAB from Android Studio
# OR use command line:
npx cap build android
```

#### iOS

```bash
# 1. Build the web app
npm run build

# 2. Sync with Capacitor  
npx cap sync ios

# 3. Open in Xcode
npx cap open ios

# 4. Build IPA from Xcode
# OR use command line:
npx cap build ios
```

### Production Deployment

1. **Web Deployment**: Upload the `dist/` folder to your web server or hosting platform
2. **Mobile Stores**: Submit builds to Google Play Store and Apple App Store
3. **Environment**: Ensure production API endpoints are configured

### Build Optimization

The production build includes:
- **Code splitting** for optimal loading
- **Tree shaking** to remove unused code
- **Asset optimization** for images and fonts
- **Minification** of JavaScript and CSS
- **Service worker** for offline capabilities

## 🔧 Configuration

The application uses various configuration files:

- Environment variables in `.env.local`
- API endpoints in `src/constants/api.ts`
- Routing configuration in `src/constants/routes.ts`
- Solana network configuration in services

## 📝 API Integration

The app integrates with:

- **Pump.fun API**: For token creation and management
- **Solana RPC**: For blockchain interactions
- **Privy Auth**: For wallet authentication

Detailed API documentation is available in `TOKEN_API_README.md`.

## 🔍 Troubleshooting

### Common Issues

#### "PRIVY_APP_ID undefined"
- **Solution**: Ensure you have set `VITE_PRIVY_APP_ID` in your `.env` file
- **Check**: The environment variable name must start with `VITE_` to be accessible in the browser

#### "Wallet creation failed"
- **Solution**: Check your internet connection and Privy configuration
- **Check**: Ensure your Privy App ID is valid and active

#### "Token creation fails"
- **Solution**: Ensure you have sufficient SOL in your wallet for transaction fees
- **Check**: Verify Pump.fun API is accessible and your network connection is stable

#### Build fails on mobile
- **Solution**: Run `npx cap sync` after any dependency changes
- **Check**: Ensure Android Studio/Xcode are properly configured

### Getting Help

- **Issues**: Report bugs on GitHub Issues
- **Discussions**: Join community discussions for questions
- **Documentation**: Check the detailed project structure above for technical details

## ⚠️ Pre-production Checklist

Before launching the application into a production environment, please review the following critical points:

### 1. API Endpoints

Ensure all services are configured to use **production API endpoints**. Verify that no test or development URLs are hardcoded or configured in the environment variables for the production build.

### 2. Code Cleanup

This project contains some legacy code from a previous "alarm clock" feature, which has since been migrated to the `alarm` project. It is recommended to remove any unused components, services, and hooks related to this functionality to keep the codebase clean and optimized.

### 3. Security Review

- Verify all API keys are properly secured
- Ensure no sensitive data is exposed in the client
- Review wallet integration security measures

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests for any improvements.

---

**Built with ❤️ for the Solana ecosystem**
