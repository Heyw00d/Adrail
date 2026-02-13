# Escrows

Escrows lock advertiser funds for campaigns. Publishers earn against escrow balances.

## Lifecycle

```
pending → funded → active → completed/refunded
```

| Status | Description |
|--------|-------------|
| `pending` | Created, awaiting USDC deposit |
| `funded` | USDC received, not yet activated |
| `active` | Live, publishers can earn against it |
| `completed` | Balance depleted |
| `refunded` | Remaining balance returned to advertiser |

## Create Escrow

```bash
curl -X POST https://api.adrail.ai/v1/escrows \
  -H "Authorization: Bearer ak_xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "amount_usdc": 500,
    "expires_at": "2026-03-01T00:00:00Z"
  }'
```

Response includes payment instructions:

```json
{
  "id": "esc_abc123",
  "amount_usdc": 500,
  "status": "pending",
  "payment_address": "0xB373...",
  "chain": "Base",
  "usdc_contract": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
}
```

## Fund Escrow

1. Send exact USDC amount to `payment_address` on Base
2. Get the transaction hash
3. Confirm funding:

```bash
curl -X POST https://api.adrail.ai/v1/escrows/esc_abc123/fund \
  -H "Authorization: Bearer ak_xxx" \
  -H "Content-Type: application/json" \
  -d '{"tx_hash": "0x1234567890abcdef..."}'
```

AdRail verifies the transaction on-chain before marking as funded.

## Activate Escrow

```bash
curl -X POST https://api.adrail.ai/v1/escrows/esc_abc123/activate \
  -H "Authorization: Bearer ak_xxx"
```

Now publishers can report impressions against this escrow.

## Check Balance

```bash
curl https://api.adrail.ai/v1/escrows/esc_abc123 \
  -H "Authorization: Bearer ak_xxx"
```

```json
{
  "id": "esc_abc123",
  "amount_usdc": 500,
  "balance_usdc": 347.50,
  "spent_usdc": 152.50,
  "status": "active",
  "impressions": 15250
}
```

## Request Refund

Get remaining balance back:

```bash
curl -X POST https://api.adrail.ai/v1/escrows/esc_abc123/refund \
  -H "Authorization: Bearer ak_xxx"
```

```json
{
  "refund_amount_usdc": 347.50,
  "refund_tx_hash": "0xabcdef...",
  "status": "refunded"
}
```
