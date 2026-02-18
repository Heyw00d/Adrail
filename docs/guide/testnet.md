# Testnet Guide

Test AdRail on Base Sepolia before going to mainnet.

## Overview

AdRail uses **Base Sepolia** (testnet) for development and testing. This lets you:
- Test x402 payments without real money
- Verify your integration works correctly
- Debug issues before mainnet deployment

## Requirements

1. A testnet wallet (MetaMask, Rabby, etc.)
2. Testnet ETH (for gas)
3. Testnet USDC (for payments)

## Step 1: Create Test Wallet

::: tip Use a Dedicated Wallet
Create a new wallet just for testing. Never use your mainnet wallet or expose its private key.
:::

1. Open MetaMask → Click account icon → Create Account
2. Name it "AdRail Testnet" or similar
3. Copy the address for the next steps

## Step 2: Add Base Sepolia Network

Add Base Sepolia to MetaMask:

| Field | Value |
|-------|-------|
| Network Name | Base Sepolia |
| RPC URL | `https://sepolia.base.org` |
| Chain ID | 84532 |
| Currency | ETH |
| Explorer | `https://sepolia.basescan.org` |

Or use [Chainlist](https://chainlist.org/?search=base+sepolia&testnets=true) to add it automatically.

## Step 3: Get Testnet ETH

You need ETH for gas fees. Options:

### BaseScan Faucet (Recommended)
1. Go to [sepolia-faucet.basescan.org](https://sepolia-faucet.basescan.org/)
2. Connect wallet or paste address
3. Request ETH (may require Alchemy login)

### Coinbase Faucet
1. Visit [faucet.quicknode.com/base/sepolia](https://faucet.quicknode.com/base/sepolia)
2. Connect wallet
3. Claim testnet ETH

## Step 4: Get Testnet USDC

AdRail uses USDC for payments. Get testnet USDC:

### Circle Faucet
1. Go to [faucet.circle.com](https://faucet.circle.com/)
2. Select "Base Sepolia"
3. Enter your wallet address
4. Request USDC

### USDC Contract on Base Sepolia
```
0x036CbD53842c5426634e7929541eC2318f3dCF7e
```

## Step 5: Export Private Key

For programmatic testing, you'll need the private key:

1. MetaMask → Click ⋮ on the test account
2. Account Details → Export Private Key
3. Enter password
4. Copy the key (starts with 0x...)

::: danger Keep It Secret
Even for testnet, treat your private key like a password. Don't commit it to git or share it publicly.
:::

## Step 6: Configure AdRail

Add to your `.env`:

```bash
# Testnet wallet
WALLET_PRIVATE_KEY=0x...your_testnet_key...

# Base Sepolia RPC
RPC_URL=https://sepolia.base.org

# USDC on Base Sepolia
USDC_ADDRESS=0x036CbD53842c5426634e7929541eC2318f3dCF7e
```

## Testing Payments

### Register as Publisher

```bash
curl -X POST https://testnet.adrail.ai/v1/publishers \
  -H "Content-Type: application/json" \
  -d '{
    "wallet": "0xYourTestnetWallet",
    "agent_id": "test-agent-001"
  }'
```

### Create Ad Slot

```bash
curl -X POST https://testnet.adrail.ai/v1/slots \
  -H "Content-Type: application/json" \
  -d '{
    "publisher_id": "...",
    "slot_type": "banner",
    "price_per_view": "0.001"
  }'
```

### Request Ad (with x402)

The x402 payment header is generated automatically by compatible clients:

```javascript
import { x402Fetch } from '@x402/fetch';

const response = await x402Fetch('https://testnet.adrail.ai/v1/ads/request', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ slot_id: '...' }),
  wallet: yourWallet, // ethers.js wallet with testnet USDC
});
```

## Testnet vs Mainnet

| Feature | Testnet | Mainnet |
|---------|---------|---------|
| Network | Base Sepolia | Base |
| API | testnet.adrail.ai | api.adrail.ai |
| USDC | Test tokens | Real USDC |
| Gas | Free testnet ETH | Real ETH |

## Troubleshooting

### "Insufficient USDC"
Request more from the [Circle faucet](https://faucet.circle.com/).

### "Transaction failed: out of gas"
Request more testnet ETH from a faucet.

### "Invalid network"
Ensure your wallet is connected to Base Sepolia (Chain ID: 84532).

## Moving to Mainnet

When ready for production:

1. Create a new wallet or use your secure mainnet wallet
2. Fund with real USDC and ETH on Base
3. Update `.env` to use mainnet values:
   - `RPC_URL=https://mainnet.base.org`
   - `USDC_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
4. Deploy to production infrastructure

See [Deployment Guide](/guide/deployment) for production setup.
