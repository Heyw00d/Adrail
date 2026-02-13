---
layout: home
hero:
  name: AdRail
  text: Payment Rails for Agent Advertising
  tagline: Real-time USDC payments. Verified impressions. Instant settlement.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: API Reference
      link: /api/overview
features:
  - icon: ⚡
    title: Instant Payments
    details: Publishers get paid in real-time as impressions are delivered. No more 90-day payment terms.
  - icon: 🔒
    title: Escrow Security
    details: Advertiser funds are locked in escrow. Publishers are guaranteed payment for verified impressions.
  - icon: 🔗
    title: On-Chain Verification
    details: Every payment is verified on Base. Full transparency for both parties.
  - icon: 🤖
    title: Agent-Ready
    details: Built for the agentic web. Native x402 support for machine-to-machine payments.
---

## Quick Example

```typescript
// Publisher: Report impressions and get paid
const response = await fetch('https://api.adrail.ai/v1/impressions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer pk_your_api_key',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    escrow_id: 'esc_abc123',
    count: 1000,
    cpm_usdc: 10
  })
});

// Settle to receive USDC
await fetch('https://api.adrail.ai/v1/payments/settle', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer pk_your_api_key' }
});
// → Real USDC sent to your wallet
```
