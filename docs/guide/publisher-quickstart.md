# Publisher Quick Start

<Badge type="tip" text="⏱️ 3 minutes" />

Start earning USDC for your ad impressions. No crypto experience needed.

::: tip Zero Gas Fees
You just receive money. We pay all transaction fees.
:::

## How It Works

```
Serve Ads → Report Impressions → Receive USDC → Withdraw to Bank
```

1. You serve ads on your site
2. Report impressions to AdRail
3. USDC is sent directly to your wallet
4. Withdraw to Coinbase/bank anytime

**You never pay gas fees.** We handle all blockchain costs.

## Step 1: Get a Wallet Address

You need a wallet address to receive payments. Choose one:

### Option A: Coinbase (Easiest)

Best if you want easy withdrawal to your bank account.

1. Sign up at [coinbase.com](https://coinbase.com)
2. Go to **Receive** → **USDC**
3. Copy your address (starts with `0x...`)

That's it. USDC you earn goes here → transfer to bank when ready.

### Option B: MetaMask (Self-custody)

Best if you want full control of your funds.

1. Install [MetaMask](https://metamask.io)
2. Create wallet, save recovery phrase
3. Copy your address

### Option C: Any EVM Wallet

Any Ethereum-compatible wallet works:
- Rainbow
- Trust Wallet
- Ledger/Trezor
- Frame

Just give us the address. We send USDC on Base network.

## Step 2: Register

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

Response:
```json
{
  "publisher_id": "pub_abc123",
  "api_key": "pk_live_xxxxxxxx",
  "status": "active"
}
```

::: warning Save Your API Key
You'll need this for all API calls. Store it securely.
:::

## Step 3: Report Impressions

When you serve an ad, report it:

```bash
curl -X POST https://api.adrail.ai/v1/impressions \
  -H "Authorization: Bearer pk_live_xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "escrow_id": "esc_abc123",
    "count": 1000
  }'
```

Response:
```json
{
  "impression_id": "imp_xyz",
  "earned_usdc": "5.00",
  "status": "recorded"
}
```

**Where do I get the escrow_id?**
- From AdCP bid responses (automated)
- From advertisers directly (manual deals)

## Step 4: Get Paid

Payments settle automatically when you reach $100. Or request anytime:

```bash
curl -X POST https://api.adrail.ai/v1/publishers/settle \
  -H "Authorization: Bearer pk_live_xxx"
```

```json
{
  "amount_usdc": "547.50",
  "tx_hash": "0xabc...",
  "status": "completed"
}
```

**USDC arrives in your wallet within seconds.** View on [BaseScan](https://basescan.org).

## Step 5: Withdraw to Bank

### Via Coinbase
1. Open Coinbase app
2. USDC balance shows automatically
3. Sell → Withdraw to bank
4. Arrives in 1-3 business days

### Via Other Exchanges
Send USDC to any exchange that supports Base network, then withdraw.

## Earnings Example

| Metric | Value |
|--------|-------|
| Monthly pageviews | 1,000,000 |
| Ad fill rate | 80% |
| Average CPM | $5.00 |
| **Monthly earnings** | **$4,000 USDC** |

Traditional ad networks take 32-49% in fees. With AdRail, you keep **~99%**.

## Check Your Balance

```bash
curl https://api.adrail.ai/v1/publishers/account \
  -H "Authorization: Bearer pk_live_xxx"
```

```json
{
  "balance_usdc": "1,247.50",
  "pending_usdc": "125.00",
  "total_earned_usdc": "12,450.00",
  "total_impressions": 2_490_000
}
```

## FAQ

### Do I need ETH for gas?
**No.** We pay all transaction fees. You just receive USDC.

### What network is USDC sent on?
**Base** (Coinbase's L2). Fast and cheap. Same address as Ethereum.

### What's the minimum payout?
**$100 USDC** for auto-settlement. You can request manual settlement anytime.

### How fast are payments?
**Instant.** Once you request settlement, USDC arrives in ~2 seconds.

### Is there a fee?
**1% platform fee.** That's it. No hidden charges.

## Coming Soon: ARC Network

We're adding [ARC](https://arc.circle.com), Circle's new USDC-native blockchain. Even simpler payments with native USDC.

[Join the waitlist →](mailto:arc@adrail.ai)

## Next Steps

- [Complete Tutorial](/guide/complete-tutorial) — Full walkthrough with code
- [AdCP Integration](/guide/adcp) — Automated ad serving
- [Webhooks](/guide/webhooks) — Get notified on payments
- [API Reference](/api/) — Full API documentation

## Need Help?

- 📧 Email: [publishers@adrail.ai](mailto:publishers@adrail.ai)
- 💬 Discord: [discord.gg/adrail](https://discord.gg/adrail)
