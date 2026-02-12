# AdRail

**Payment rails for agent advertising.**

AdRail is the settlement layer for agentic ad transactions. Built on x402, integrated with [AdCP](https://adcontextprotocol.org).

## What It Does

- **Escrow** — Funds held until delivery verified
- **Verification** — Oracle integration (Moat, DoubleVerify) confirms ad served
- **Settlement** — Instant USDC payouts via x402
- **Trust** — No middlemen, no delayed payments, no chargebacks

## The Problem

Today's programmatic ad stack takes 32-49% of ad spend in fees. Publishers wait 60-90 days for payment. Fraud costs $84B/year.

Agent-to-agent advertising changes everything — but it needs a payment layer that matches the speed and automation of AI.

## The Solution

AdRail handles the money so AdCP can handle the media buying.

```
Buyer Agent ──▶ AdCP (media buy) ──▶ Publisher Agent
                     │
                     ▼
              AdRail (payment)
              ├── Escrow deposit
              ├── Oracle verification
              └── Instant settlement
```

## Built On

- **x402** — HTTP 402 Payment Required protocol
- **USDC on Base** — Fast, cheap, stable
- **AdCP** — Ad Context Protocol for media transactions

## Status

🚧 Early development

## Links

- Website: [adrail.ai](https://adrail.ai)
- AdCP: [adcontextprotocol.org](https://adcontextprotocol.org)
- x402: [x402.org](https://x402.org)

---

*Publishers keep 95%+. Payments in seconds, not months.*
