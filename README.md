# Web3 Chat System

A high-performance decentralized chat application built with React, Vite, Tailwind CSS, and Ethers.js.

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [MetaMask](https://metamask.io/) browser extension

## Smart Contract Setup

To run the smart contract locally, follow these steps:

1. **Install Hardhat (if not already present):**
   ```bash
   npm install --save-dev hardhat
   ```

2. **Start a local Ethereum node:**
   ```bash
   npx hardhat node
   ```
   *Keep this terminal open.* It will provide several test accounts and private keys.

3. **Deploy the contract:**
   In a new terminal, use [Remix](https://remix.ethereum.org/) or a local script to deploy `contract/Messenger.sol` to `http://127.0.0.1:8545`.

4. **Configure MetaMask:**
   - Add a custom network:
     - RPC URL: `http://127.0.0.1:8545`
     - Chain ID: `31337`
   - Import one of the private keys provided by `npx hardhat node`.

5. **Update Frontend:**
   Copy the deployed contract address and paste it into `src/App.jsx` at the `addressToContract` constant:
   ```javascript
   const addressToContract = "YOUR_DEPLOYED_ADDRESS";
   ```

## Frontend Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Open the application:**
   Navigate to `http://localhost:5173` in your browser.

## Troubleshooting

- **Error -32002 (Request Pending):** This happens if you click "Connect" while a MetaMask window is already open. Check your MetaMask extension for a pending notification.
- **Website Lag:** Ensure your browser supports hardware acceleration. The UI uses GPU-accelerated video backgrounds and GSAP for smooth performance.
