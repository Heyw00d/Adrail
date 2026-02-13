# Advertisers API

## Register Advertiser

Create a new advertiser account.

```
POST /v1/advertisers/register
```

**Public endpoint** — no authentication required.

### Request

```json
{
  "name": "My Company",
  "email": "ads@example.com",
  "wallet_address": "0x1234567890abcdef1234567890abcdef12345678",
  "metadata": {
    "industry": "fintech"
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Company name |
| `email` | string | No | Contact email |
| `wallet_address` | string | Yes | EVM address (for refunds) |
| `metadata` | object | No | Additional info |

### Response

```json
{
  "id": "adv_Avcvp8nmNIsY",
  "name": "My Company",
  "email": "ads@example.com",
  "wallet_address": "0x1234567890abcdef1234567890abcdef12345678",
  "api_key": "ak_tj9w0nL2WL7S1HYqAM_D6G79",
  "created_at": "2026-02-13T10:00:00.000Z"
}
```

---

## Get Advertiser Info

```
GET /v1/advertisers/me
```

### Response

```json
{
  "id": "adv_Avcvp8nmNIsY",
  "name": "My Company",
  "email": "ads@example.com",
  "wallet_address": "0x1234567890abcdef1234567890abcdef12345678",
  "metadata": null,
  "created_at": "2026-02-13T10:00:00.000Z"
}
```

---

## Get Advertiser Stats

```
GET /v1/advertisers/me/stats
```

### Response

```json
{
  "advertiser_id": "adv_Avcvp8nmNIsY",
  "spending": {
    "total_funded_usdc": 5000.00,
    "total_spent_usdc": 3247.50,
    "total_remaining_usdc": 1752.50
  },
  "escrows": {
    "total": 5,
    "active": 2
  }
}
```

---

## List Escrows

```
GET /v1/advertisers/me/escrows
```

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | number | 20 | Items per page |
| `offset` | number | 0 | Skip N items |

### Response

```json
{
  "escrows": [
    {
      "id": "esc_abc123",
      "amount_usdc": 500.00,
      "balance_usdc": 347.50,
      "status": "active",
      "tx_hash": "0x1234...",
      "expires_at": null,
      "created_at": "2026-02-13T10:00:00.000Z"
    }
  ],
  "limit": 20,
  "offset": 0
}
```
