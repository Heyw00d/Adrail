# Payments API

## Settle Payments

Request payout of pending earnings.

```
POST /v1/payments/settle
```

**Requires:** Publisher API key (`pk_*`)

### Response

```json
{
  "payments": [
    {
      "id": "pay_abc123",
      "escrow_id": "esc_xyz",
      "amount_usdc": 85.00,
      "tx_hash": "0x1234567890abcdef...",
      "chain": "Base"
    },
    {
      "id": "pay_def456",
      "escrow_id": "esc_uvw",
      "amount_usdc": 42.50,
      "tx_hash": "0xfedcba0987654321...",
      "chain": "Base"
    }
  ],
  "total_paid_usdc": 127.50,
  "recipient_wallet": "0xYourWalletAddress"
}
```

USDC is sent directly to your registered wallet address on Base.

---

## List Payments

```
GET /v1/payments
```

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | number | 20 | Items per page |
| `offset` | number | 0 | Skip N items |

### Response

```json
{
  "payments": [
    {
      "id": "pay_abc123",
      "publisher_id": "pub_L8ix5TXXUEny",
      "escrow_id": "esc_xyz",
      "amount_usdc": 85.00,
      "status": "paid",
      "tx_hash": "0x1234...",
      "x402_receipt": null,
      "created_at": "2026-02-13T10:00:00.000Z",
      "paid_at": "2026-02-13T10:00:02.000Z"
    }
  ],
  "limit": 20,
  "offset": 0
}
```

---

## Get Payment Details

```
GET /v1/payments/:id
```

### Response

```json
{
  "id": "pay_abc123",
  "publisher_id": "pub_L8ix5TXXUEny",
  "escrow_id": "esc_xyz",
  "amount_usdc": 85.00,
  "status": "paid",
  "tx_hash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  "x402_receipt": null,
  "metadata": null,
  "created_at": "2026-02-13T10:00:00.000Z",
  "paid_at": "2026-02-13T10:00:02.000Z"
}
```

### Payment Status

| Status | Description |
|--------|-------------|
| `pending` | Queued for payment |
| `verified` | Impressions verified, ready to pay |
| `paid` | USDC sent, transaction confirmed |
| `failed` | Payment failed (see metadata for error) |

---

## Pending Summary

Get summary of pending earnings.

```
GET /v1/payments/pending/summary
```

### Response

```json
{
  "pending_usdc": 127.50,
  "total_earned_usdc": 4892.30,
  "total_paid_usdc": 4764.80,
  "wallet_address": "0xYourWalletAddress"
}
```

---

## Verify On-Chain

Every payment includes a `tx_hash` that can be verified on BaseScan:

```
https://basescan.org/tx/{tx_hash}
```

For testnet (Base Sepolia):

```
https://sepolia.basescan.org/tx/{tx_hash}
```
