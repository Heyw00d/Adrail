# Impressions API

## Report Impressions

```
POST /v1/impressions
```

**Requires:** Publisher API key (`pk_*`)

### Request

```json
{
  "escrow_id": "esc_ypgJGGvZlsue",
  "count": 1000,
  "cpm_usdc": 10,
  "adcp_request_id": "adcp_req_xyz789",
  "metadata": {
    "geo": "US",
    "device": "mobile"
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `escrow_id` | string | Yes | Escrow to charge |
| `count` | number | Yes | Number of impressions |
| `cpm_usdc` | number | Yes | Cost per 1,000 impressions |
| `adcp_request_id` | string | No | AdCP reference ID |
| `metadata` | object | No | Additional data |

### Response

```json
{
  "id": "imp_xyz789abc",
  "count": 1000,
  "earned_usdc": 10,
  "escrow_balance_usdc": 490,
  "created_at": "2026-02-13T10:00:00.000Z"
}
```

---

## Batch Report

Report multiple impression records at once.

```
POST /v1/impressions/batch
```

### Request

```json
{
  "escrow_id": "esc_ypgJGGvZlsue",
  "cpm_usdc": 10,
  "impressions": [
    {"count": 500, "metadata": {"geo": "US"}},
    {"count": 300, "metadata": {"geo": "UK"}},
    {"count": 200, "metadata": {"geo": "DE"}}
  ]
}
```

### Response

```json
{
  "batch_size": 3,
  "total_impressions": 1000,
  "total_earned_usdc": 10,
  "escrow_balance_usdc": 490,
  "impression_ids": [
    "imp_abc123",
    "imp_def456",
    "imp_ghi789"
  ]
}
```

---

## List Impressions

```
GET /v1/impressions
```

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | number | 50 | Items per page |
| `offset` | number | 0 | Skip N items |
| `escrow_id` | string | - | Filter by escrow |

### Response

```json
{
  "impressions": [
    {
      "id": "imp_xyz789abc",
      "escrow_id": "esc_ypgJGGvZlsue",
      "publisher_id": "pub_L8ix5TXXUEny",
      "count": 1000,
      "cpm_usdc": 10,
      "total_usdc": 10,
      "adcp_request_id": null,
      "created_at": "2026-02-13T10:00:00.000Z"
    }
  ],
  "limit": 50,
  "offset": 0
}
```

---

## Verify Impression

Submit oracle verification for an impression.

```
POST /v1/impressions/:id/verify
```

### Request

```json
{
  "oracle_id": "oracle_viewability",
  "score": 85,
  "reason": "High viewability, valid traffic",
  "metadata": {
    "viewability": 0.92,
    "ivt_rate": 0.02
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `oracle_id` | string | Yes | Oracle identifier |
| `score` | number | Yes | Quality score (0-100) |
| `reason` | string | No | Verification notes |
| `metadata` | object | No | Detailed metrics |

### Response

```json
{
  "id": "ver_abc123",
  "impression_id": "imp_xyz789abc",
  "status": "passed",
  "score": 85,
  "reason": "High viewability, valid traffic"
}
```

Scores ≥70 receive `passed` status; below 70 receive `failed`.
