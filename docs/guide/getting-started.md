# Getting Started

Welcome to AdRail — agent-to-agent media payments with near-zero fees.

## Choose Your Path

<div class="vp-card-container">

### I'm a Publisher
**Earn USDC for ad impressions**

- Receive payments directly to your wallet
- Zero gas fees (we pay them)
- Withdraw to bank anytime

[Publisher Quick Start →](/guide/publisher-quickstart)

### I'm an Advertiser  
**Buy impressions with USDC**

- Fund with credit card or crypto
- Pay only for verified impressions
- ~99% goes to publishers

[Advertiser Quick Start →](/guide/advertiser-quickstart)

</div>

## How AdRail Works

```
┌─────────────┐    USDC     ┌─────────────┐
│  Advertiser │ ─────────▶  │   Escrow    │
│  (Buyer)    │             │   (Locked)  │
└─────────────┘             └──────┬──────┘
                                   │
                            Impressions
                                   │
                                   ▼
┌─────────────┐    USDC     ┌─────────────┐
│  Publisher  │ ◀───────────│   AdRail    │
│  (Earner)   │   (instant) │   Protocol  │
└─────────────┘             └─────────────┘
```

1. **Advertisers** fund escrows with USDC (via credit card or crypto)
2. **Publishers** serve ads and report impressions
3. **AdRail** verifies and settles payments instantly
4. **Publishers** receive USDC directly — withdraw to bank anytime

## Why USDC?

| Feature | Traditional Ads | AdRail + USDC |
|---------|-----------------|---------------|
| Fees | 32-49% | **~1%** |
| Payment speed | Net 30-90 days | **Instant** |
| Minimum payout | $100+ | **$1** |
| Global payments | Complex | **Same as local** |
| Currency risk | High | **None (pegged to USD)** |

## Networks

### Base (Primary)

AdRail runs on **Base**, Coinbase's Layer 2 network:
- Fast (~2 second finality)
- Cheap (~$0.001 per transaction)
- Battle-tested infrastructure

::: tip Zero Gas for Publishers
Publishers never pay gas. We cover all transaction costs.
:::

### ARC (Coming Soon)

We're adding support for [ARC](https://arc.circle.com), Circle's new blockchain:
- Gas fees paid in USDC (no ETH needed)
- Even simpler advertiser on-ramp
- Native USDC experience

[Join the ARC waitlist →](mailto:arc@adrail.ai)

## Integration Options

### 1. Direct API

Full control with our REST API:

```bash
# Publisher: Report impressions
curl -X POST https://api.adrail.ai/v1/impressions \
  -H "Authorization: Bearer pk_xxx" \
  -d '{"escrow_id": "esc_abc", "count": 1000}'

# Advertiser: Create escrow  
curl -X POST https://api.adrail.ai/v1/escrows \
  -H "Authorization: Bearer ak_xxx" \
  -d '{"amount_usdc": "100", "cpm": "5.00"}'
```

### 2. AdCP Integration

Automated agent-to-agent buying via the Ad Context Protocol:

- AI agents negotiate and buy programmatically
- Escrow IDs flow through bid responses
- Zero manual intervention

[AdCP Integration Guide →](/guide/adcp)

### 3. SDKs (Coming Soon)

Official libraries for popular languages:
- Node.js / TypeScript
- Python
- Go

## Quick Links

| Resource | Description |
|----------|-------------|
| [Complete Tutorial](/guide/complete-tutorial) | 15-min end-to-end walkthrough |
| [API Reference](/api/) | Full endpoint documentation |
| [Troubleshooting](/guide/troubleshooting) | Common errors & solutions |
| [Testnet](/guide/testnet) | Test without real money |

## Get Help

- 📧 **Email:** [support@adrail.ai](mailto:support@adrail.ai)
- 💬 **Discord:** [discord.gg/adrail](https://discord.gg/adrail)
- 🐦 **Twitter:** [@aaborail](https://twitter.com/adrail)
