# Publishers API

## Register Publisher

Create a new publisher account.

```
POST /v1/publishers/register
```

**Public endpoint** — no authentication required.

### Request

```json
{
  "name": "My Website",
  "domain": "example.com",
  "wallet_address": "0x1234567890abcdef1234567890abcdef12345678",
  "metadata": {
    "category": "tech",
    "monthly_traffic": 1000000
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Display name |
| `domain` | string | No | Website domain |
| `wallet_address` | string | Yes | EVM address (0x + 40 hex chars) |
| `metadata` | object | No | Additional info |

### Response

```json
{
  "id": "pub_L8ix5TXXUEny",
  "name": "My Website",
  "domain": "example.com",
  "wallet_address": "0x1234567890abcdef1234567890abcdef12345678",
  "api_key": "pk_a7Bj9hVLLpetl4YM29yzK2y4",
  "created_at": "2026-02-13T10:00:00.000Z"
}
```

::: warning
The `api_key` is only returned once. Store it securely.
:::

---

## Get Publisher Info

```
GET /v1/publishers/me
```

### Response

```json
{
  "id": "pub_L8ix5TXXUEny",
  "name": "My Website",
  "domain": "example.com",
  "wallet_address": "0x1234567890abcdef1234567890abcdef12345678",
  "metadata": null,
  "created_at": "2026-02-13T10:00:00.000Z"
}
```

---

## Get Publisher Stats

```
GET /v1/publishers/me/stats
```

### Response

```json
{
  "publisher_id": "pub_L8ix5TXXUEny",
  "earnings": {
    "total_paid_usdc": 1250.50,
    "pending_usdc": 47.30,
    "payment_count": 23
  },
  "impressions": {
    "total": 125000,
    "total_earned_usdc": 1297.80
  }
}
```

---

## Get Payment History

```
GET /v1/publishers/me/payments
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
      "amount_usdc": 85.00,
      "status": "paid",
      "tx_hash": "0x1234...",
      "created_at": "2026-02-13T10:00:00.000Z",
      "paid_at": "2026-02-13T10:00:02.000Z"
    }
  ],
  "limit": 20,
  "offset": 0
}
```
