# AdRail Integration Spec

## Overview

AdRail is the real-time payment layer for agent advertising. While AdCP handles media buying, AdRail handles streaming payments — continuous, per-batch settlements with instant quality feedback.

**Core concept:** Pay per 1,000 impressions. Evaluate quality. Continue or stop. No upfront escrow, no delayed payments.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         STREAMING PAYMENT FLOW                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────┐                                      ┌──────────┐             │
│  │  Buyer   │◀─────── Quality Feedback ───────────│Publisher │             │
│  │  Agent   │                                      │  Agent   │             │
│  └────┬─────┘                                      └────┬─────┘             │
│       │                                                 │                    │
│       │ Request batch                                   │ Deliver 1K        │
│       ▼                                                 ▼                    │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │                          AdRail                                  │        │
│  │                                                                  │        │
│  │   ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐  │        │
│  │   │ Verify  │────▶│ Evaluate│────▶│  Pay    │────▶│  Next   │  │        │
│  │   │  Batch  │     │ Quality │     │ Instant │     │  Batch  │  │        │
│  │   └─────────┘     └─────────┘     └─────────┘     └─────────┘  │        │
│  │                                        │                        │        │
│  └────────────────────────────────────────┼────────────────────────┘        │
│                                           │                                  │
│                                           ▼                                  │
│                                    ┌──────────────┐                         │
│                                    │  Publisher   │                         │
│                                    │  Hot Wallet  │                         │
│                                    └──────┬───────┘                         │
│                                           │ 24h auto-sweep                  │
│                                           ▼                                  │
│                                    ┌──────────────┐                         │
│                                    │  Fireblocks  │                         │
│                                    │    Vault     │                         │
│                                    └──────────────┘                         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Streaming Payment Flow

### 1. Start Stream

Buyer agent initiates a payment stream with the publisher:

```http
POST https://api.adrail.ai/v1/stream/start
Content-Type: application/json
Authorization: Bearer <api_key>

{
  "buyer_agent": "buyer-agent-xyz",
  "publisher_agent": "publisher-agent-789",
  "adcp_contract": "adcp-contract-abc123",
  "targeting": {
    "geo": ["US", "CA", "GB"],
    "context": ["technology", "finance"],
    "device": ["desktop", "mobile"]
  },
  "pricing": {
    "model": "cpm",
    "rate_usdc": "10.00"
  },
  "quality_threshold": {
    "min_viewability": 0.70,
    "max_ivt": 0.05,
    "brand_safety": true
  },
  "batch_size": 1000,
  "max_budget_usdc": "10000.00"
}
```

Response:

```json
{
  "stream_id": "stream-001",
  "status": "active",
  "buyer_agent": "buyer-agent-xyz",
  "publisher_agent": "publisher-agent-789",
  "batch_size": 1000,
  "cpm_usdc": "10.00",
  "cost_per_batch_usdc": "10.00",
  "quality_threshold": {
    "min_viewability": 0.70,
    "max_ivt": 0.05,
    "brand_safety": true
  },
  "budget_remaining_usdc": "10000.00",
  "created_at": "2026-02-12T19:00:00Z"
}
```

### 2. Deliver Batch

Publisher serves 1,000 impressions and reports delivery:

```http
POST https://api.adrail.ai/v1/stream/{stream_id}/batch
Content-Type: application/json
Authorization: Bearer <publisher_api_key>

{
  "stream_id": "stream-001",
  "batch_number": 1,
  "impressions": 1000,
  "metrics": {
    "viewability_rate": 0.78,
    "ivt_rate": 0.02,
    "brand_safety_score": 0.98,
    "avg_attention_seconds": 2.4,
    "geo_compliance": 0.99
  },
  "impression_ids": ["imp-001", "imp-002", "..."],
  "timestamp": "2026-02-12T19:01:00Z"
}
```

### 3. Evaluate Quality

AdRail evaluates the batch against buyer's quality threshold:

```json
{
  "stream_id": "stream-001",
  "batch_number": 1,
  "evaluation": {
    "viewability": { "actual": 0.78, "threshold": 0.70, "pass": true },
    "ivt": { "actual": 0.02, "threshold": 0.05, "pass": true },
    "brand_safety": { "actual": 0.98, "threshold": 0.90, "pass": true }
  },
  "quality_score": 0.82,
  "decision": "APPROVED"
}
```

### 4. Instant Payment

Payment released immediately:

```json
{
  "stream_id": "stream-001",
  "batch_number": 1,
  "payment": {
    "amount_usdc": "10.00",
    "recipient": "publisher-agent-789",
    "wallet": "0x...",
    "chain": "base",
    "tx_hash": "0x7f3a...",
    "settlement_time_ms": 1247
  },
  "stream_status": {
    "total_impressions": 1000,
    "total_paid_usdc": "10.00",
    "budget_remaining_usdc": "9990.00",
    "batches_completed": 1
  }
}
```

### 5. Continue or Stop

**If quality passes:** Buyer automatically requests next batch.

**If quality fails:** Stream pauses, buyer notified:

```json
{
  "stream_id": "stream-001",
  "batch_number": 5,
  "evaluation": {
    "viewability": { "actual": 0.58, "threshold": 0.70, "pass": false }
  },
  "quality_score": 0.52,
  "decision": "REJECTED",
  "action": "STREAM_PAUSED",
  "message": "Quality below threshold. Stream paused. Resume or terminate?"
}
```

Buyer can:
- **Resume** with adjusted threshold
- **Terminate** stream (no further payments)
- **Switch** to different publisher

---

## Vault Integration (Fireblocks)

Publishers connect their Fireblocks vault for automatic treasury management.

### Configure Vault

```http
POST https://api.adrail.ai/v1/vault/configure
Content-Type: application/json
Authorization: Bearer <publisher_api_key>

{
  "fireblocks_vault_id": "vault-123",
  "fireblocks_api_key": "<encrypted>",
  "hot_wallet_address": "0x...",
  "sweep_settings": {
    "frequency": "24h",
    "threshold_usdc": "1000.00",
    "retain_usdc": "100.00"
  }
}
```

### Sweep Schedule

- **Frequency:** Every 24 hours (configurable)
- **Threshold:** Sweep when hot wallet exceeds threshold
- **Retain:** Keep minimum balance for operational liquidity

### Sweep Execution

```json
{
  "sweep_id": "sweep-001",
  "timestamp": "2026-02-13T00:00:00Z",
  "hot_wallet_balance_before": "5847.32",
  "amount_swept": "5747.32",
  "hot_wallet_balance_after": "100.00",
  "fireblocks_vault_id": "vault-123",
  "tx_hash": "0x...",
  "status": "completed"
}
```

---

## API Reference

### Stream Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v1/stream/start` | Start payment stream |
| GET | `/v1/stream/{id}` | Get stream status |
| POST | `/v1/stream/{id}/batch` | Report batch delivery |
| POST | `/v1/stream/{id}/pause` | Pause stream |
| POST | `/v1/stream/{id}/resume` | Resume stream |
| POST | `/v1/stream/{id}/terminate` | End stream |

### Vault Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v1/vault/configure` | Configure Fireblocks vault |
| GET | `/v1/vault/status` | Get vault + hot wallet status |
| POST | `/v1/vault/sweep` | Trigger manual sweep |
| GET | `/v1/vault/sweeps` | List sweep history |

### Webhook Events

```json
{
  "events": [
    "stream.started",
    "stream.batch_approved",
    "stream.batch_rejected",
    "stream.paused",
    "stream.terminated",
    "payment.sent",
    "payment.confirmed",
    "vault.sweep_started",
    "vault.sweep_completed"
  ]
}
```

---

## Quality Metrics

AdRail supports these quality signals:

| Metric | Description | Typical Threshold |
|--------|-------------|-------------------|
| `viewability_rate` | % impressions viewable (MRC standard) | ≥ 70% |
| `ivt_rate` | Invalid traffic rate | ≤ 5% |
| `brand_safety_score` | Brand safety compliance | ≥ 90% |
| `geo_compliance` | % in target geography | ≥ 95% |
| `attention_seconds` | Avg time in viewport | ≥ 1s |

Buyers set their own thresholds. Publishers who consistently meet them earn more budget.

---

## Escrow Mode (Optional)

For large contracted buys, AdRail supports traditional escrow:

```http
POST https://api.adrail.ai/v1/escrow/create
{
  "amount_usdc": "50000.00",
  "contract_id": "adcp-contract-xyz",
  "release_conditions": {
    "impressions": 5000000,
    "min_viewability": 0.70,
    "deadline": "2026-03-01T00:00:00Z"
  },
  "custodian": "fireblocks"
}
```

Escrow requires:
- Custodian integration (Fireblocks)
- Oracle verification for release
- Higher minimum transaction size

*Most users should use streaming payments. Escrow is for enterprise contracted buys.*

---

## Fees

| Model | Fee | Notes |
|-------|-----|-------|
| Streaming | 1% | Per-batch, deducted from payment |
| Escrow | 0.5% | On release, requires custodian |

Volume discounts available for $100K+/month.

---

## SDKs

### Python

```python
from adrail import AdRailClient

client = AdRailClient(api_key="...")

# Start stream
stream = client.stream.start(
    publisher_agent="pub-123",
    cpm_usdc=10.00,
    batch_size=1000,
    quality_threshold={"min_viewability": 0.70}
)

# Stream runs automatically
# Webhook notifies on each batch payment
```

### Node.js

```javascript
import { AdRail } from '@adrail/sdk';

const client = new AdRail({ apiKey: '...' });

const stream = await client.stream.start({
  publisherAgent: 'pub-123',
  cpmUsdc: '10.00',
  batchSize: 1000,
  qualityThreshold: { minViewability: 0.70 }
});
```

---

## Example: Full Integration

```python
from adrail import AdRailClient

client = AdRailClient(api_key="...")

# 1. Configure vault (one-time)
client.vault.configure(
    fireblocks_vault_id="vault-123",
    sweep_threshold_usdc=1000,
    sweep_frequency="24h"
)

# 2. Start accepting streams
@client.on("stream.started")
def handle_stream(stream):
    print(f"New stream: {stream.id}, CPM: ${stream.cpm_usdc}")

@client.on("payment.confirmed")
def handle_payment(payment):
    print(f"Received ${payment.amount_usdc} for batch {payment.batch_number}")
    print(f"Total earned today: ${client.vault.hot_wallet_balance}")

# 3. Serve impressions
@client.on("stream.batch_requested")
def serve_batch(request):
    # Serve 1,000 impressions
    impressions = ad_server.serve(request.stream_id, count=1000)
    
    # Report delivery
    client.stream.report_batch(
        stream_id=request.stream_id,
        impressions=len(impressions),
        metrics=calculate_metrics(impressions)
    )

# Run
client.listen()
```

---

## Links

- **Website**: [adrail.ai](https://adrail.ai)
- **API Docs**: [docs.adrail.ai](https://docs.adrail.ai)
- **GitHub**: [github.com/Heyw00d/Adrail](https://github.com/Heyw00d/Adrail)
- **AdCP**: [adcontextprotocol.org](https://adcontextprotocol.org)
- **x402**: [x402.org](https://x402.org)
- **Fireblocks**: [fireblocks.com](https://fireblocks.com)

---

*Real-time payments for real-time advertising.*

*Last updated: 2026-02-12*
