# Payments

Publishers receive USDC payments for reported impressions.

## Settlement Flow

```
Impressions → Pending Balance → Settlement → USDC in Wallet
```

## Check Pending Balance

```bash
curl https://api.adrail.ai/v1/payments/pending/summary \
  -H "Authorization: Bearer pk_xxx"
```

```json
{
  "pending_usdc": 127.50,
  "total_earned_usdc": 4892.30,
  "total_paid_usdc": 4764.80,
  "wallet_address": "0xYourWallet"
}
```

## Settle Payments

Request payout of pending earnings:

```bash
curl -X POST https://api.adrail.ai/v1/payments/settle \
  -H "Authorization: Bearer pk_xxx"
```

```json
{
  "payments": [
    {
      "id": "pay_abc123",
      "escrow_id": "esc_xyz",
      "amount_usdc": 85.00,
      "tx_hash": "0x1234...",
      "chain": "Base"
    },
    {
      "id": "pay_def456",
      "escrow_id": "esc_uvw",
      "amount_usdc": 42.50,
      "tx_hash": "0x5678...",
      "chain": "Base"
    }
  ],
  "total_paid_usdc": 127.50,
  "recipient_wallet": "0xYourWallet"
}
```

## Payment History

```bash
curl https://api.adrail.ai/v1/payments?limit=20 \
  -H "Authorization: Bearer pk_xxx"
```

## Payment Details

```bash
curl https://api.adrail.ai/v1/payments/pay_abc123 \
  -H "Authorization: Bearer pk_xxx"
```

```json
{
  "id": "pay_abc123",
  "publisher_id": "pub_xxx",
  "escrow_id": "esc_xyz",
  "amount_usdc": 85.00,
  "status": "paid",
  "tx_hash": "0x1234...",
  "created_at": "2026-02-13T10:30:00Z",
  "paid_at": "2026-02-13T10:30:02Z"
}
```

## Payment Status

| Status | Description |
|--------|-------------|
| `pending` | Queued for payment |
| `verified` | Impressions verified, ready to pay |
| `paid` | USDC sent, transaction confirmed |
| `failed` | Payment failed (will retry) |

## Verify On-Chain

Every payment has a `tx_hash` you can verify on Base:

```
https://basescan.org/tx/{tx_hash}
```

## Best Practices

1. **Settle regularly** — Daily or weekly for consistent cash flow
2. **Monitor for failures** — Check payment status after settling
3. **Verify on-chain** — Confirm large payments on BaseScan
4. **Keep wallet funded** — Ensure wallet can receive tokens
