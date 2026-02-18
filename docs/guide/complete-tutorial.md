# Complete Tutorial: Your First USDC Payment

<Badge type="tip" text="⏱️ 15 minutes" />

Go from zero to receiving your first programmatic ad payment in 15 minutes. No prior crypto experience needed.

::: tip What You'll Accomplish
- ✅ Set up a crypto wallet (if you don't have one)
- ✅ Get free testnet USDC for testing
- ✅ Register as an AdRail publisher
- ✅ Report test impressions
- ✅ Receive your first USDC payment
:::

## Step 1: Set Up Your Wallet {#wallet-setup}

<Badge type="tip" text="⏱️ 5 min" />

You need an EVM wallet to receive USDC payments. We recommend MetaMask for this tutorial.

### Option A: MetaMask (Recommended)

1. Go to [metamask.io/download](https://metamask.io/download/)
2. Install the browser extension
3. Click "Create a new wallet"
4. Set a strong password
5. ⚠️ **Write down your 12-word recovery phrase!** Store it safely offline.
6. Confirm your recovery phrase
7. Copy your wallet address (starts with `0x...`)

### Option B: Coinbase (Easiest for US users)

If you want easy USDC → bank account withdrawals:

1. Sign up at [coinbase.com](https://coinbase.com)
2. Complete identity verification
3. Go to Settings → Crypto addresses
4. Copy your Ethereum address (works on Base too)

::: info
💡 **Your wallet address is the same on Ethereum, Base, and other EVM networks.** AdRail pays on Base for lower fees.
:::

## Step 2: Add Base Network to MetaMask {#add-base}

<Badge type="tip" text="⏱️ 1 min" />

AdRail pays on Base (Coinbase's L2) for fast, cheap transactions.

### Quick Add (One-Click)

Visit [chainlist.org/chain/8453](https://chainlist.org/chain/8453) and click "Add to MetaMask"

### Manual Add

In MetaMask: Settings → Networks → Add Network

```
Network Name: Base
RPC URL: https://mainnet.base.org
Chain ID: 8453
Currency: ETH
Explorer: https://basescan.org
```

For testnet (Base Sepolia), use Chain ID: `84532`

## Step 3: Get Test USDC (Testnet) {#get-test-usdc}

<Badge type="tip" text="⏱️ 2 min" />

Let's use testnet first so you can practice without real money.

::: warning Testnet Mode
🧪 All transactions are free and reversible. Perfect for testing your integration.
:::

### Get Free Testnet USDC

1. Switch MetaMask to "Base Sepolia" testnet
2. Go to [faucet.circle.com](https://faucet.circle.com/)
3. Select "Base Sepolia" and paste your wallet address
4. Click "Get USDC" — you'll receive 10 test USDC
5. Also get test ETH for gas: [alchemy.com/faucets/base-sepolia](https://www.alchemy.com/faucets/base-sepolia)

## Step 4: Register as Publisher {#register}

<Badge type="tip" text="⏱️ 2 min" />

Register your domain to start receiving ad payments.

### API Request

```http
POST https://api.adrail.ai/v1/publishers
Content-Type: application/json

{
  "domain": "yoursite.com",
  "wallet_address": "0xYourWalletAddress",
  "name": "Your Site Name",
  "email": "you@yoursite.com"
}
```

### cURL Example

```bash
curl -X POST https://api.adrail.ai/v1/publishers \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "yoursite.com",
    "wallet_address": "0xYourWalletAddress",
    "name": "Your Site Name",
    "email": "you@yoursite.com"
  }'
```

### Success Response

```json
{
  "publisher_id": "pub_abc123xyz",
  "api_key": "pk_live_xxxxxxxx",
  "status": "active",
  "domain": "yoursite.com"
}
```

::: warning Important
⚠️ Save your `api_key` — you'll need it for all future requests!
:::

## Step 5: Report Impressions {#report-impressions}

<Badge type="tip" text="⏱️ 3 min" />

When you serve an ad, report the impressions to get paid.

::: info How it works
💡 Advertisers create escrows with USDC. When you report impressions against an escrow, you earn a portion of that USDC based on the CPM rate.
:::

### Report Impressions

```bash
curl -X POST https://api.adrail.ai/v1/impressions \
  -H "Authorization: Bearer pk_live_xxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "escrow_id": "esc_abc123",
    "count": 1000,
    "metadata": {
      "ad_unit": "banner_300x250",
      "geo": "US"
    }
  }'
```

### Success Response

```json
{
  "impression_id": "imp_xyz789",
  "escrow_id": "esc_abc123",
  "count": 1000,
  "earned_usdc": "8.50",
  "status": "recorded"
}
```

🎉 You just earned $8.50 USDC!

## Step 6: Check Your Earnings {#check-earnings}

<Badge type="tip" text="⏱️ 1 min" />

### View Account Balance

```bash
curl https://api.adrail.ai/v1/publishers/account \
  -H "Authorization: Bearer pk_live_xxxxxxxx"
```

### Response

```json
{
  "balance_usdc": "847.50",
  "pending_usdc": "125.00",
  "total_earned_usdc": "12450.00",
  "total_impressions": 1465000,
  "settlement_threshold": "100.00"
}
```

## Step 7: Receive Your Payment {#get-paid}

<Badge type="tip" text="⏱️ 1 min" />

Payments settle automatically when you reach the threshold, or you can request manual settlement.

### Request Settlement

```bash
curl -X POST https://api.adrail.ai/v1/publishers/settle \
  -H "Authorization: Bearer pk_live_xxxxxxxx"
```

### Response

```json
{
  "settlement_id": "stl_abc123",
  "amount_usdc": "847.50",
  "tx_hash": "0x1234...abcd",
  "status": "completed",
  "wallet": "0xYourWallet..."
}
```

🎉 USDC sent directly to your wallet! View on [BaseScan](https://basescan.org).

## What's Next?

- [AdCP Integration](/guide/adcp) - Connect AdRail with the Ad Context Protocol
- [Testnet](/guide/testnet) - Test with fake money before going live
- [Troubleshooting](/guide/troubleshooting) - Common errors and how to fix them
- [Webhooks](/guide/webhooks) - Get real-time notifications for payments

## Need Help?

Join our [Discord community](https://discord.gg/adrail) or email [support@adrail.ai](mailto:support@adrail.ai)
