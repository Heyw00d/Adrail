# API Overview

Base URL: `https://api.adrail.ai`

## Authentication

All API requests (except registration and public endpoints) require authentication via API key.

Include your API key in the `Authorization` header:

```bash
Authorization: Bearer pk_xxx  # Publisher key
Authorization: Bearer ak_xxx  # Advertiser key
```

Or use the `X-API-Key` header:

```bash
X-API-Key: pk_xxx
```

## API Keys

| Prefix | Type | Can Do |
|--------|------|--------|
| `pk_` | Publisher | Report impressions, settle payments |
| `ak_` | Advertiser | Create/fund escrows, request refunds |

## Endpoints

### Public

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API info |
| GET | `/health` | Health check |
| GET | `/v1/x402/info` | x402 payment config |
| POST | `/v1/publishers/register` | Register publisher |
| POST | `/v1/advertisers/register` | Register advertiser |

### Publishers (pk_*)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/publishers/me` | Get account info |
| GET | `/v1/publishers/me/stats` | Get earnings stats |
| GET | `/v1/publishers/me/payments` | Payment history |
| POST | `/v1/impressions` | Report impressions |
| POST | `/v1/impressions/batch` | Batch report |
| GET | `/v1/impressions` | List impressions |
| POST | `/v1/payments/settle` | Settle pending earnings |
| GET | `/v1/payments` | List payments |
| GET | `/v1/payments/pending/summary` | Pending earnings |

### Advertisers (ak_*)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/advertisers/me` | Get account info |
| GET | `/v1/advertisers/me/stats` | Get spending stats |
| GET | `/v1/advertisers/me/escrows` | List escrows |
| POST | `/v1/escrows` | Create escrow |
| GET | `/v1/escrows/:id` | Get escrow |
| POST | `/v1/escrows/:id/fund` | Confirm funding |
| POST | `/v1/escrows/:id/activate` | Activate escrow |
| POST | `/v1/escrows/:id/refund` | Request refund |

## Response Format

All responses are JSON:

```json
{
  "id": "pub_abc123",
  "name": "My Publisher",
  "created_at": "2026-02-13T10:00:00Z"
}
```

## Errors

Errors include a message and status code:

```json
{
  "error": "Escrow not found",
  "status": 404
}
```

| Code | Description |
|------|-------------|
| 400 | Bad request / validation error |
| 401 | Missing or invalid API key |
| 403 | Not authorized for this resource |
| 404 | Resource not found |
| 500 | Server error |

## Rate Limits

- 100 requests/minute per API key
- Batch endpoints count as 1 request

## Pagination

List endpoints support pagination:

```bash
GET /v1/impressions?limit=50&offset=100
```

| Param | Default | Max | Description |
|-------|---------|-----|-------------|
| `limit` | 20 | 100 | Items per page |
| `offset` | 0 | - | Skip N items |
