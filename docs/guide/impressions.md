# Impressions

Impressions are ad views reported by publishers. Each impression earns revenue from the associated escrow.

## Reporting Impressions

### Single Report

```bash
curl -X POST https://api.adrail.ai/v1/impressions \
  -H "Authorization: Bearer pk_xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "escrow_id": "esc_abc123",
    "count": 1000,
    "cpm_usdc": 10
  }'
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `escrow_id` | string | Yes | Escrow to charge |
| `count` | number | Yes | Number of impressions |
| `cpm_usdc` | number | Yes | Cost per 1,000 impressions |
| `adcp_request_id` | string | No | AdCP reference ID |
| `metadata` | object | No | Additional data |

### Batch Report

More efficient for high volumes:

```bash
curl -X POST https://api.adrail.ai/v1/impressions/batch \
  -H "Authorization: Bearer pk_xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "escrow_id": "esc_abc123",
    "cpm_usdc": 10,
    "impressions": [
      {"count": 500, "metadata": {"geo": "US"}},
      {"count": 300, "metadata": {"geo": "UK"}},
      {"count": 200, "metadata": {"geo": "DE"}}
    ]
  }'
```

## Earnings Calculation

```
earnings = (count / 1000) × cpm_usdc
```

Example: 5,000 impressions at $8 CPM = $40 earned

## View History

```bash
curl https://api.adrail.ai/v1/impressions?limit=50 \
  -H "Authorization: Bearer pk_xxx"
```

Filter by escrow:

```bash
curl https://api.adrail.ai/v1/impressions?escrow_id=esc_abc123 \
  -H "Authorization: Bearer pk_xxx"
```

## Verification

Impressions can be verified by oracles:

```bash
curl -X POST https://api.adrail.ai/v1/impressions/imp_xyz/verify \
  -H "Content-Type: application/json" \
  -d '{
    "oracle_id": "oracle_viewability",
    "score": 85,
    "reason": "High viewability, valid traffic"
  }'
```

Scores ≥70 pass verification.

## Best Practices

1. **Report in batches** — Reduces API calls, more efficient
2. **Include metadata** — Helps with debugging and analytics
3. **Verify escrow first** — Check balance before reporting
4. **Use AdCP IDs** — Link to media buy requests for tracking
