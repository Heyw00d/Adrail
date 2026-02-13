# AdCP Integration

[AdCP](https://adcontextprotocol.org) (Ad Context Protocol) handles media buying. AdRail handles payments.

> "AdCP handles media buying, AdRail handles the money."

## How It Works Together

```
┌─────────────────────────────────────────────────────────────┐
│                        AdCP Layer                           │
│  • Ad request/response                                      │
│  • Targeting & context                                      │
│  • Creative delivery                                        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                       AdRail Layer                          │
│  • Escrow management                                        │
│  • Impression tracking                                      │
│  • USDC settlement                                          │
└─────────────────────────────────────────────────────────────┘
```

## Integration Flow

### 1. Advertiser Setup

```
AdCP: Define campaign targeting
AdRail: Fund escrow for budget
```

### 2. Ad Request

```
Publisher Agent → AdCP: "Need ad for tech context"
AdCP → Buyer Agent: "Match found, here's creative"
```

### 3. Impression & Payment

```
Publisher Agent → AdRail: "Served impression, escrow_id=xxx"
AdRail: Verify, deduct from escrow
AdRail → Publisher: Pay USDC
```

## Linking AdCP Requests

Include AdCP request IDs when reporting impressions:

```bash
curl -X POST https://api.adrail.ai/v1/impressions \
  -H "Authorization: Bearer pk_xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "escrow_id": "esc_abc123",
    "count": 1000,
    "cpm_usdc": 10,
    "adcp_request_id": "adcp_req_xyz789"
  }'
```

This links payment data back to AdCP for reconciliation.

## AAO Membership

AdRail is integrating with the [Agentic Advertising Organization](https://adcontextprotocol.org) (AAO), the industry body behind AdCP.

Benefits:
- Listed in AdCP publisher/buyer directories
- Access to AdCP signal data
- Standardized integration patterns

## Resources

- [adcontextprotocol.org](https://adcontextprotocol.org) — AdCP homepage
- [docs.adcontextprotocol.org](https://docs.adcontextprotocol.org) — Technical docs
- [AAO Membership](https://adcontextprotocol.org/join) — Join the organization
