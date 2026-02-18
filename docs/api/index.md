# API Reference

Base URL: `https://api.adrail.ai`

All responses include `explorer_url` for on-chain verification.

## Authentication

Include your API key in all requests:

```bash
Authorization: Bearer YOUR_API_KEY
```

| Key Prefix | Type |
|------------|------|
| `pk_live_` | Publisher (Production) |
| `pk_test_` | Publisher (Testnet) |
| `ak_live_` | Advertiser (Production) |
| `ak_test_` | Advertiser (Testnet) |

---

## Publisher Endpoints

### Register Publisher

```http
POST /v1/publishers
```

```json
{
  "domain": "yoursite.com",
  "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
  "name": "Your Site Name",
  "email": "you@yoursite.com"
}
```

**Response:**
```json
{
  "publisher_id": "pub_abc123",
  "api_key": "pk_live_xxxxxxxx",
  "status": "active",
  "domain": "yoursite.com",
  "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
  "network": "base",
  "created_at": "2026-02-17T12:00:00Z"
}
```

### Get Account

```http
GET /v1/publishers/account
Authorization: Bearer pk_live_xxx
```

**Response:**
```json
{
  "publisher_id": "pub_abc123",
  "domain": "yoursite.com",
  "wallet_address": "0x742d35Cc...",
  "balance_usdc": "1247.50",
  "pending_usdc": "125.00",
  "total_earned_usdc": "12450.00",
  "total_impressions": 2490000,
  "settlement_threshold": "100.00",
  "network": "base"
}
```

### Report Impressions

```http
POST /v1/impressions
Authorization: Bearer pk_live_xxx
```

```json
{
  "escrow_id": "esc_abc123",
  "count": 1000,
  "metadata": {
    "ad_unit": "banner_300x250",
    "geo": "US",
    "device": "desktop",
    "page_url": "https://yoursite.com/article"
  }
}
```

**Response:**
```json
{
  "impression_id": "imp_xyz789",
  "escrow_id": "esc_abc123",
  "count": 1000,
  "earned_usdc": "8.50",
  "status": "recorded",
  "recorded_at": "2026-02-17T15:30:00Z"
}
```

### Batch Report Impressions

```http
POST /v1/impressions/batch
Authorization: Bearer pk_live_xxx
```

```json
{
  "impressions": [
    {"escrow_id": "esc_abc123", "count": 500, "metadata": {...}},
    {"escrow_id": "esc_def456", "count": 350, "metadata": {...}}
  ]
}
```

**Response:**
```json
{
  "processed": 2,
  "total_count": 850,
  "total_earned_usdc": "7.23",
  "results": [
    {"escrow_id": "esc_abc123", "count": 500, "earned_usdc": "4.25"},
    {"escrow_id": "esc_def456", "count": 350, "earned_usdc": "2.98"}
  ]
}
```

### Request Settlement

```http
POST /v1/publishers/settle
Authorization: Bearer pk_live_xxx
```

**Response:**
```json
{
  "settlement_id": "stl_abc123",
  "amount_usdc": "1247.50",
  "wallet": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
  "tx_hash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  "explorer_url": "https://basescan.org/tx/0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  "network": "base",
  "status": "completed",
  "settled_at": "2026-02-17T15:30:00Z"
}
```

### List Settlements

```http
GET /v1/publishers/settlements
Authorization: Bearer pk_live_xxx
```

**Response:**
```json
{
  "settlements": [
    {
      "settlement_id": "stl_abc123",
      "amount_usdc": "1247.50",
      "tx_hash": "0x1234...",
      "explorer_url": "https://basescan.org/tx/0x1234...",
      "network": "base",
      "status": "completed",
      "settled_at": "2026-02-17T15:30:00Z"
    }
  ],
  "total_settled_usdc": "12450.00"
}
```

---

## Advertiser Endpoints

### Register Advertiser

```http
POST /v1/advertisers
```

```json
{
  "name": "Your Company",
  "email": "ads@yourcompany.com",
  "website": "yourcompany.com"
}
```

**Response:**
```json
{
  "advertiser_id": "adv_abc123",
  "api_key": "ak_live_xxxxxxxx",
  "status": "active",
  "created_at": "2026-02-17T12:00:00Z"
}
```

### Get Account

```http
GET /v1/advertisers/account
Authorization: Bearer ak_live_xxx
```

**Response:**
```json
{
  "advertiser_id": "adv_abc123",
  "name": "Your Company",
  "balance_usdc": "2500.00",
  "total_spent_usdc": "7500.00",
  "active_escrows": 3,
  "network": "base"
}
```

### Fund Account (Credit Card)

```http
POST /v1/advertisers/fund
Authorization: Bearer ak_live_xxx
```

```json
{
  "amount_usd": 100,
  "payment_method": "card"
}
```

**Response:**
```json
{
  "checkout_id": "chk_xyz789",
  "checkout_url": "https://pay.adrail.ai/checkout/xyz789",
  "amount_usd": 100,
  "amount_usdc": "100.00",
  "fee_usd": 3.20,
  "expires_at": "2026-02-17T16:30:00Z"
}
```

### Fund Account (Direct USDC)

```http
GET /v1/advertisers/deposit-address
Authorization: Bearer ak_live_xxx
```

**Response:**
```json
{
  "deposit_address": "0xADRAIL_DEPOSIT_ADDRESS",
  "network": "base",
  "asset": "USDC",
  "explorer_url": "https://basescan.org/address/0xADRAIL_DEPOSIT_ADDRESS",
  "note": "Send USDC on Base network only"
}
```

### Create Escrow

```http
POST /v1/escrows
Authorization: Bearer ak_live_xxx
```

```json
{
  "amount_usdc": "1000.00",
  "cpm": "8.50",
  "name": "Q1 Tech Campaign",
  "target_categories": ["technology", "ai"],
  "target_geos": ["US", "CA", "UK"],
  "expires_at": "2026-03-17T00:00:00Z"
}
```

**Response:**
```json
{
  "escrow_id": "esc_abc123",
  "amount_usdc": "1000.00",
  "cpm": "8.50",
  "name": "Q1 Tech Campaign",
  "max_impressions": 117647,
  "tx_hash": "0xabcdef1234567890...",
  "explorer_url": "https://basescan.org/tx/0xabcdef1234567890...",
  "network": "base",
  "status": "active",
  "created_at": "2026-02-17T12:00:00Z",
  "expires_at": "2026-03-17T00:00:00Z"
}
```

### Get Escrow

```http
GET /v1/escrows/:escrow_id
Authorization: Bearer ak_live_xxx
```

**Response:**
```json
{
  "escrow_id": "esc_abc123",
  "name": "Q1 Tech Campaign",
  "amount_usdc": "1000.00",
  "spent_usdc": "425.50",
  "remaining_usdc": "574.50",
  "cpm": "8.50",
  "impressions_served": 50059,
  "unique_publishers": 23,
  "tx_hash": "0xabcdef...",
  "explorer_url": "https://basescan.org/tx/0xabcdef...",
  "network": "base",
  "status": "active",
  "created_at": "2026-02-17T12:00:00Z"
}
```

### List Escrows

```http
GET /v1/escrows
Authorization: Bearer ak_live_xxx
```

**Query params:** `?status=active&limit=20`

**Response:**
```json
{
  "escrows": [
    {
      "escrow_id": "esc_abc123",
      "name": "Q1 Tech Campaign",
      "remaining_usdc": "574.50",
      "status": "active",
      "explorer_url": "https://basescan.org/tx/0x..."
    }
  ],
  "total": 3
}
```

### Top Up Escrow

```http
POST /v1/escrows/:escrow_id/topup
Authorization: Bearer ak_live_xxx
```

```json
{
  "amount_usdc": "500.00"
}
```

**Response:**
```json
{
  "escrow_id": "esc_abc123",
  "topup_amount_usdc": "500.00",
  "new_total_usdc": "1074.50",
  "tx_hash": "0x7890abcdef...",
  "explorer_url": "https://basescan.org/tx/0x7890abcdef...",
  "network": "base",
  "status": "completed"
}
```

### Pause Escrow

```http
POST /v1/escrows/:escrow_id/pause
Authorization: Bearer ak_live_xxx
```

**Response:**
```json
{
  "escrow_id": "esc_abc123",
  "status": "paused",
  "paused_at": "2026-02-17T15:30:00Z"
}
```

### Resume Escrow

```http
POST /v1/escrows/:escrow_id/resume
Authorization: Bearer ak_live_xxx
```

**Response:**
```json
{
  "escrow_id": "esc_abc123",
  "status": "active",
  "resumed_at": "2026-02-17T15:35:00Z"
}
```

### Close Escrow

```http
POST /v1/escrows/:escrow_id/close
Authorization: Bearer ak_live_xxx
```

**Response:**
```json
{
  "escrow_id": "esc_abc123",
  "refund_amount_usdc": "574.50",
  "tx_hash": "0xdef123...",
  "explorer_url": "https://basescan.org/tx/0xdef123...",
  "network": "base",
  "status": "closed",
  "closed_at": "2026-02-17T15:30:00Z"
}
```

---

## Networks

| Network | Chain ID | Explorer |
|---------|----------|----------|
| Base (Production) | 8453 | basescan.org |
| Base Sepolia (Testnet) | 84532 | sepolia.basescan.org |
| ARC (Coming Soon) | TBD | explorer.arc.circle.com |

All `explorer_url` fields automatically use the correct explorer for the network.

---

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "escrow_depleted",
    "message": "Escrow has no remaining budget",
    "details": {
      "escrow_id": "esc_abc123",
      "remaining_usdc": "0.00"
    }
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `unauthorized` | 401 | Invalid or missing API key |
| `forbidden` | 403 | Not authorized for this resource |
| `not_found` | 404 | Resource doesn't exist |
| `validation_error` | 400 | Invalid request parameters |
| `escrow_depleted` | 400 | Escrow has no budget |
| `escrow_paused` | 400 | Escrow is paused |
| `insufficient_balance` | 400 | Not enough balance |
| `rate_limited` | 429 | Too many requests |
| `internal_error` | 500 | Server error |

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| POST /v1/impressions | 100/second |
| POST /v1/impressions/batch | 10/second |
| All other endpoints | 60/minute |

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1708192800
```
