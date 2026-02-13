# Escrows API

## Create Escrow

```
POST /v1/escrows
```

**Requires:** Advertiser API key (`ak_*`)

### Request

```json
{
  "amount_usdc": 500,
  "expires_at": "2026-03-01T00:00:00Z",
  "metadata": {
    "campaign": "spring-2026"
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `amount_usdc` | number | Yes | Amount in USDC (min: 1) |
| `expires_at` | string | No | ISO 8601 expiration date |
| `metadata` | object | No | Additional info |

### Response

```json
{
  "id": "esc_ypgJGGvZlsue",
  "amount_usdc": 500,
  "status": "pending",
  "payment_address": "0xB37337f2656D48E62190A8643F1aDCeC2eA8d4d0",
  "chain": "Base",
  "network": "eip155:8453",
  "token": "USDC",
  "usdc_contract": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  "instructions": "Send USDC to payment_address, then call POST /v1/escrows/:id/fund with tx_hash",
  "created_at": "2026-02-13T10:00:00.000Z"
}
```

---

## Fund Escrow

Confirm escrow funding with transaction hash.

```
POST /v1/escrows/:id/fund
```

### Request

```json
{
  "tx_hash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `tx_hash` | string | Yes | USDC transfer transaction hash |

### Response

```json
{
  "id": "esc_ypgJGGvZlsue",
  "amount_usdc": 500,
  "balance_usdc": 500,
  "status": "funded",
  "tx_hash": "0x1234...",
  "message": "Escrow funded successfully. Ready to activate."
}
```

::: info On-Chain Verification
AdRail verifies the transaction on-chain before marking as funded:
- Checks transaction exists and succeeded
- Verifies USDC transfer to escrow address
- Confirms amount matches escrow
:::

---

## Activate Escrow

Enable escrow for spending.

```
POST /v1/escrows/:id/activate
```

### Response

```json
{
  "id": "esc_ypgJGGvZlsue",
  "status": "active",
  "balance_usdc": 500,
  "message": "Escrow activated. Publishers can now earn against this budget."
}
```

---

## Get Escrow

```
GET /v1/escrows/:id
```

### Response

```json
{
  "id": "esc_ypgJGGvZlsue",
  "advertiser_id": "adv_Avcvp8nmNIsY",
  "amount_usdc": 500,
  "balance_usdc": 347.50,
  "spent_usdc": 152.50,
  "status": "active",
  "tx_hash": "0x1234...",
  "expires_at": null,
  "impressions": 15250,
  "created_at": "2026-02-13T10:00:00.000Z"
}
```

---

## Refund Escrow

Request refund of remaining balance.

```
POST /v1/escrows/:id/refund
```

### Response

```json
{
  "id": "esc_ypgJGGvZlsue",
  "refund_amount_usdc": 347.50,
  "refund_tx_hash": "0xabcdef...",
  "status": "refunded",
  "message": "Refund initiated"
}
```

Refunds are sent to the advertiser's registered wallet address.
