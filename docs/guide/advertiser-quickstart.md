# Advertiser Quick Start

<Badge type="tip" text="⏱️ 5 minutes" />

Fund your first ad campaign and start buying impressions.

::: tip No Crypto Experience Needed
Pay with credit card. We handle the blockchain complexity.
:::

## How It Works

```
Credit Card → USDC → Escrow → Impressions → Publishers Get Paid
```

You fund campaigns in USDC (a dollar-pegged stablecoin). Publishers earn USDC for every impression they serve. No volatility, no complexity.

## Step 1: Create Account

```bash
curl -X POST https://api.adrail.ai/v1/advertisers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Your Company",
    "email": "ads@yourcompany.com",
    "website": "yourcompany.com"
  }'
```

Response:
```json
{
  "advertiser_id": "adv_abc123",
  "api_key": "ak_live_xxxxxxxx",
  "status": "active"
}
```

## Step 2: Fund Your Account

### Option A: Credit Card (Recommended) {#credit-card}

The fastest way to get started. No wallet needed.

```bash
curl -X POST https://api.adrail.ai/v1/advertisers/fund \
  -H "Authorization: Bearer ak_live_xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "amount_usd": 100,
    "payment_method": "card"
  }'
```

Response:
```json
{
  "checkout_url": "https://pay.adrail.ai/checkout/xyz",
  "amount_usd": 100,
  "amount_usdc": "100.00",
  "expires_in": 3600
}
```

Open the `checkout_url` to complete payment. USDC is credited instantly.

### Option B: Direct USDC Transfer {#direct-transfer}

If you already have USDC:

1. Get your deposit address:
```bash
curl https://api.adrail.ai/v1/advertisers/deposit-address \
  -H "Authorization: Bearer ak_live_xxx"
```

2. Send USDC to the provided address on **Base** network
3. Funds credited within 1 block (~2 seconds)

### Option C: Bank Transfer (ACH/Wire) {#bank-transfer}

For larger amounts ($1,000+):

```bash
curl -X POST https://api.adrail.ai/v1/advertisers/fund \
  -H "Authorization: Bearer ak_live_xxx" \
  -d '{"amount_usd": 5000, "payment_method": "bank"}'
```

We'll provide bank details. Funds credited within 1-2 business days.

## Step 3: Create Campaign Escrow

Lock funds for a specific campaign:

```bash
curl -X POST https://api.adrail.ai/v1/escrows \
  -H "Authorization: Bearer ak_live_xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "amount_usdc": "100.00",
    "cpm": "5.00",
    "name": "Q1 Brand Campaign",
    "target_categories": ["tech", "finance"],
    "target_geos": ["US", "CA", "UK"]
  }'
```

Response:
```json
{
  "escrow_id": "esc_abc123",
  "amount_usdc": "100.00",
  "cpm": "5.00",
  "max_impressions": 20000,
  "status": "active",
  "expires_at": "2026-03-17T00:00:00Z"
}
```

::: info What's an Escrow?
An escrow locks your funds for a specific campaign. Publishers report impressions against your escrow and get paid from it. You only pay for verified impressions.
:::

## Step 4: Share Escrow with Publishers

Give publishers your `escrow_id` to report impressions against:

**Via AdCP (Automated):**
Your escrow_id is automatically included in bid responses when using the Ad Context Protocol.

**Direct Integration:**
Share the escrow_id with publishers you're working with directly.

## Step 5: Monitor Spending

### Check Escrow Status

```bash
curl https://api.adrail.ai/v1/escrows/esc_abc123 \
  -H "Authorization: Bearer ak_live_xxx"
```

```json
{
  "escrow_id": "esc_abc123",
  "amount_usdc": "100.00",
  "spent_usdc": "47.50",
  "remaining_usdc": "52.50",
  "impressions_served": 9500,
  "unique_publishers": 12,
  "status": "active"
}
```

### View All Campaigns

```bash
curl https://api.adrail.ai/v1/escrows \
  -H "Authorization: Bearer ak_live_xxx"
```

## Pricing

| Item | Cost |
|------|------|
| Credit card funding | 2.9% + $0.30 |
| Direct USDC | **Free** |
| Bank transfer | **Free** (min $1,000) |
| Platform fee | 1% of spend |
| Publisher payout | ~99% of your spend |

**Compare to traditional programmatic:** 32-49% fees → AdRail: **~3% total**

## Campaign Best Practices

### Set Appropriate CPMs

| Ad Type | Typical CPM |
|---------|-------------|
| Display banner | $2-5 |
| Native content | $5-10 |
| Video pre-roll | $10-25 |
| Premium placement | $15-50 |

### Budget Recommendations

| Goal | Minimum Budget |
|------|----------------|
| Testing | $100 |
| Small campaign | $500 |
| Medium campaign | $2,000 |
| Large campaign | $10,000+ |

## Coming Soon: ARC Network

We're adding support for [ARC](https://arc.circle.com), Circle's new blockchain where gas fees are paid in USDC.

Benefits:
- Even simpler funding flow
- Native USDC transactions
- Lower fees

::: tip Early Access
Want early access to ARC? Email [arc@adrail.ai](mailto:arc@adrail.ai)
:::

## Next Steps

- [AdCP Integration](/guide/adcp) — Automated bidding with AI agents
- [Targeting Options](/guide/targeting) — Geo, category, and publisher targeting
- [Reporting API](/api/reporting) — Campaign analytics and insights
- [Webhooks](/guide/webhooks) — Real-time spend notifications

## Need Help?

- 📧 Email: [advertisers@adrail.ai](mailto:advertisers@adrail.ai)
- 💬 Discord: [discord.gg/adrail](https://discord.gg/adrail)
