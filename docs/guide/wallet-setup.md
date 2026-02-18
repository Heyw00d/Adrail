# Wallet Setup Guide

Get your wallet ready to receive USDC payments from AdRail in about 5 minutes.

::: tip New to Crypto?
Don't worry — this guide assumes zero crypto experience. We'll walk through everything step by step.
:::

## What You'll Need

- An email address
- A smartphone or computer
- 5 minutes

## What is an EVM Wallet?

An **EVM wallet** is like a bank account for cryptocurrency. "EVM" stands for Ethereum Virtual Machine — it's the technology that powers Ethereum and compatible networks like **Base** (where AdRail payments happen).

Your wallet has:
- **Public address** — Like an account number. Starts with `0x` and is 42 characters long. Safe to share.
- **Private key / Secret phrase** — Like your PIN. **Never share this with anyone.**

## Step 1: Create Your Wallet

Choose one of these options:

### Option A: Coinbase Wallet (Easiest)

Best for: Beginners, US users, easy fiat on/off ramps

1. Download **Coinbase Wallet** app ([iOS](https://apps.apple.com/app/coinbase-wallet/id1278383455) | [Android](https://play.google.com/store/apps/details?id=org.toshi))
2. Open the app → **Create new wallet**
3. Set up Face ID / PIN for security
4. **Write down your 12-word recovery phrase** on paper
   ::: danger Keep This Safe!
   Your recovery phrase is the ONLY way to restore your wallet. Store it offline, never digitally. Never share it.
   :::
5. Confirm the phrase by selecting words in order
6. Done! Tap **Receive** to see your wallet address

### Option B: MetaMask (More Control)

Best for: Developers, power users, browser integration

1. Go to [metamask.io](https://metamask.io) and install the browser extension
2. Click **Create a new wallet**
3. Create a strong password
4. **Write down your 12-word Secret Recovery Phrase** on paper
   ::: danger Keep This Safe!
   Never store this digitally. Never share it. MetaMask will never ask for it.
   :::
5. Confirm the phrase
6. Done! Click the account name to copy your address

### Option C: Rainbow Wallet (Mobile-First)

Best for: Mobile users who want a clean UI

1. Download **Rainbow** ([iOS](https://apps.apple.com/app/rainbow-ethereum-wallet/id1457119021) | [Android](https://play.google.com/store/apps/details?id=me.rainbow))
2. Tap **Create wallet**
3. Back up your secret phrase
4. Your wallet is ready!

## Step 2: Add Base Network

AdRail payments are on **Base**, a fast and low-cost Ethereum Layer 2 network by Coinbase.

### Coinbase Wallet
Base is already supported! Just select "Base" when viewing assets or receiving.

### MetaMask
1. Go to [chainlist.org](https://chainlist.org)
2. Search for "Base"
3. Click **Add to MetaMask** for "Base" (Chain ID: 8453)
4. Approve the network addition

Or manually add:
- **Network Name:** Base
- **RPC URL:** `https://mainnet.base.org`
- **Chain ID:** `8453`
- **Currency Symbol:** ETH
- **Block Explorer:** `https://basescan.org`

### Rainbow
Base is built-in! No setup needed.

## Step 3: Get Your Wallet Address

Your wallet address is what you'll give to AdRail to receive payments.

1. Open your wallet app
2. Tap **Receive** or click your account name
3. Copy the address (starts with `0x`, 42 characters)

Example address:
```
0x742d35Cc6634C0532925a3b844Bc454e4438f44e
```

::: tip Verify the Format
✅ Starts with `0x`  
✅ Exactly 42 characters  
✅ Only contains 0-9 and a-f (case-insensitive)
:::

## Step 4: Fund Your Wallet (Optional)

To **receive** AdRail payments, you don't need any funds — payments come to you!

However, to **withdraw** or **swap** USDC later, you'll need a tiny amount of ETH on Base for gas fees (usually < $0.01 per transaction).

### Getting ETH on Base

**Option 1: Bridge from Coinbase**
1. Buy ETH on [Coinbase](https://coinbase.com)
2. Send to your wallet on Base network
3. Coinbase handles the bridging automatically

**Option 2: Use the Base Bridge**
1. Go to [bridge.base.org](https://bridge.base.org)
2. Connect your wallet
3. Bridge ETH from Ethereum to Base

**Option 3: Buy directly on Base**
1. Use [Coinbase Onramp](https://www.coinbase.com/onramp) to buy directly to Base

::: tip Start Small
$5-10 of ETH on Base will cover thousands of transactions.
:::

## Step 5: Verify Your Setup

Before registering with AdRail, confirm:

- [ ] You have a wallet address starting with `0x`
- [ ] Your wallet supports Base network
- [ ] You've securely stored your recovery phrase offline

## Converting USDC to Cash

Once you receive USDC payments from AdRail, here's how to convert to your local currency:

### Option 1: Coinbase (Easiest)
1. Send USDC from your wallet to your Coinbase account
2. Sell USDC for USD
3. Withdraw to your bank account

### Option 2: Direct Off-Ramp
- [Coinbase Onramp](https://coinbase.com) — US, UK, EU
- [MoonPay](https://moonpay.com) — Global
- [Ramp](https://ramp.network) — EU, UK

### Option 3: Keep as USDC
USDC is a stablecoin pegged 1:1 to USD. Many people keep it as digital dollars for:
- Instant transfers to anyone with a wallet
- Earning yield on DeFi platforms
- Paying for other crypto services

## Troubleshooting

### "Invalid wallet address" error
- Ensure address starts with `0x`
- Check it's exactly 42 characters
- No spaces or extra characters

### "Network not supported"
- Make sure you're using Base network, not Ethereum mainnet
- Add Base to your wallet (see Step 2)

### Lost recovery phrase
- Unfortunately, there's no way to recover it
- Your funds are permanently inaccessible
- Always store the phrase safely before adding funds

## Next Steps

Ready to start earning? 

→ [Register as a Publisher](/guide/publishers)  
→ [Quick Start Guide](/guide/quickstart)  
→ [API Overview](/api/overview)

## Security Best Practices

::: warning Protect Yourself
1. **Never share your recovery phrase** — No legitimate service will ever ask for it
2. **Use a hardware wallet for large amounts** — Ledger or Trezor
3. **Verify URLs carefully** — Phishing sites look identical to real ones
4. **Start small** — Test with small amounts first
:::

---

**Need help?** Join our [Discord](https://discord.gg/adrail) or email [support@adrail.ai](mailto:support@adrail.ai)
