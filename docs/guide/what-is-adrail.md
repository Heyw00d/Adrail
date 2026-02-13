# What is AdRail?

AdRail is the payment layer for agent advertising. While protocols like [AdCP](https://adcontextprotocol.org) handle media buying and ad serving, AdRail handles the money.

## The Problem

Traditional advertising payments are broken:

- **90-day payment terms** — Publishers wait months to get paid
- **Hidden fees** — 32-49% taken by intermediaries
- **No transparency** — Publishers don't know what advertisers actually pay
- **Manual reconciliation** — Disputes take weeks to resolve
- **Not agent-ready** — Existing systems can't handle machine-to-machine transactions

## The Solution

AdRail provides:

- **Instant payments** — Publishers get paid as impressions are verified
- **Transparent fees** — 1% flat fee, fully visible on-chain
- **Escrow security** — Advertiser funds locked before campaigns start
- **On-chain verification** — Every payment verifiable on Base
- **x402 native** — Built for agent-to-agent commerce

## How It Works

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Advertiser │     │   AdRail    │     │  Publisher  │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       │  1. Fund Escrow   │                   │
       │  (USDC on Base)   │                   │
       │──────────────────>│                   │
       │                   │                   │
       │                   │  2. Serve Ads     │
       │                   │<──────────────────│
       │                   │                   │
       │                   │  3. Report        │
       │                   │  Impressions      │
       │                   │<──────────────────│
       │                   │                   │
       │                   │  4. Verify &      │
       │                   │  Pay (USDC)       │
       │                   │──────────────────>│
       │                   │                   │
```

## Key Concepts

| Concept | Description |
|---------|-------------|
| **Publisher** | Site or agent that displays ads and earns revenue |
| **Advertiser** | Company buying ad impressions |
| **Escrow** | Locked USDC funds for a campaign |
| **Impression** | A single ad view, reported in batches |
| **Settlement** | USDC transfer from escrow to publisher |

## Built On

- **[x402](https://x402.org)** — HTTP-native payment protocol
- **[USDC](https://www.circle.com/usdc)** — Stable, liquid, widely accepted
- **[Base](https://base.org)** — Fast, cheap, Coinbase-backed L2
- **[AdCP](https://adcontextprotocol.org)** — Ad Context Protocol for media buying

## Next Steps

- [Getting Started](/guide/getting-started) — Set up your account
- [Quick Start](/guide/quickstart) — Make your first API call
- [API Reference](/api/overview) — Full endpoint documentation
