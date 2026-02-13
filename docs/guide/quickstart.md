# Quick Start

A complete example: Advertiser funds a campaign, Publisher earns and gets paid.

## The Flow

1. Advertiser creates an escrow
2. Advertiser funds escrow with USDC
3. Publisher reports impressions
4. Publisher settles and receives USDC

## Step 1: Create Escrow (Advertiser)

```bash
curl -X POST https://api.adrail.ai/v1/escrows \
  -H "Authorization: Bearer ak_live_xxx" \
  -H "Content-Type: application/json" \
  -d '{"amount_usdc": 100}'
```

```json
{
  "id": "esc_abc123",
  "amount_usdc": 100,
  "status": "pending",
  "payment_address": "0xB373...",
  "chain": "Base",
  "token": "USDC",
  "instructions": "Send USDC to payment_address, then call POST /v1/escrows/:id/fund"
}
```

## Step 2: Fund Escrow

Send 100 USDC to the `payment_address` on Base, then confirm:

```bash
curl -X POST https://api.adrail.ai/v1/escrows/esc_abc123/fund \
  -H "Authorization: Bearer ak_live_xxx" \
  -H "Content-Type: application/json" \
  -d '{"tx_hash": "0x1234...abcd"}'
```

```json
{
  "id": "esc_abc123",
  "status": "funded",
  "balance_usdc": 100,
  "message": "Escrow funded successfully. Ready to activate."
}
```

## Step 3: Activate Escrow

```bash
curl -X POST https://api.adrail.ai/v1/escrows/esc_abc123/activate \
  -H "Authorization: Bearer ak_live_xxx"
```

```json
{
  "id": "esc_abc123",
  "status": "active",
  "balance_usdc": 100,
  "message": "Escrow activated. Publishers can now earn against this budget."
}
```

## Step 4: Report Impressions (Publisher)

```bash
curl -X POST https://api.adrail.ai/v1/impressions \
  -H "Authorization: Bearer pk_live_xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "escrow_id": "esc_abc123",
    "count": 1000,
    "cpm_usdc": 10
  }'
```

```json
{
  "id": "imp_xyz789",
  "count": 1000,
  "earned_usdc": 10,
  "escrow_balance_usdc": 90
}
```

## Step 5: Settle Payment (Publisher)

```bash
curl -X POST https://api.adrail.ai/v1/payments/settle \
  -H "Authorization: Bearer pk_live_xxx"
```

```json
{
  "payments": [
    {
      "id": "pay_abc123",
      "amount_usdc": 10,
      "tx_hash": "0x7890...efgh",
      "chain": "Base"
    }
  ],
  "total_paid_usdc": 10,
  "recipient_wallet": "0xPublisherWallet"
}
```

✅ **Done!** The publisher received 10 USDC directly to their wallet.

## Batch Reporting

For efficiency, report impressions in batches:

```bash
curl -X POST https://api.adrail.ai/v1/impressions/batch \
  -H "Authorization: Bearer pk_live_xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "escrow_id": "esc_abc123",
    "cpm_usdc": 10,
    "impressions": [
      {"count": 500},
      {"count": 300},
      {"count": 200}
    ]
  }'
```

## TypeScript Example

```typescript
const ADRAIL_API = 'https://api.adrail.ai';
const API_KEY = 'pk_live_xxx';

// Report impressions
async function reportImpressions(escrowId: string, count: number, cpm: number) {
  const res = await fetch(`${ADRAIL_API}/v1/impressions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      escrow_id: escrowId,
      count,
      cpm_usdc: cpm
    })
  });
  return res.json();
}

// Settle payments
async function settle() {
  const res = await fetch(`${ADRAIL_API}/v1/payments/settle`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${API_KEY}` }
  });
  return res.json();
}

// Usage
await reportImpressions('esc_abc123', 1000, 10);
const payment = await settle();
console.log(`Received ${payment.total_paid_usdc} USDC`);
```

## Next Steps

- [Escrows](/guide/escrows) — Deep dive into escrow management
- [Impressions](/guide/impressions) — Reporting best practices
- [Payments](/guide/payments) — Settlement options
