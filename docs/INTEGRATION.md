# AdRail Integration Spec

## Overview

AdRail is the payment layer for AdCP (Ad Context Protocol). While AdCP handles media buying — discovery, negotiation, creative delivery — AdRail handles the money: escrow, verification, and settlement.

This document specifies how AdRail integrates with AdCP agents.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        AD TRANSACTION                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐     AdCP      ┌──────────┐                       │
│  │  Buyer   │──────────────▶│Publisher │                       │
│  │  Agent   │  Media Buy    │  Agent   │                       │
│  └────┬─────┘               └────┬─────┘                       │
│       │                          │                              │
│       │                          │                              │
│       ▼                          ▼                              │
│  ┌─────────────────────────────────────────┐                   │
│  │              AdRail                      │                   │
│  │  ┌─────────┐ ┌─────────┐ ┌───────────┐  │                   │
│  │  │ Escrow  │ │ Oracle  │ │Settlement │  │                   │
│  │  │Contract │ │  Verify │ │  Engine   │  │                   │
│  │  └─────────┘ └─────────┘ └───────────┘  │                   │
│  └─────────────────────────────────────────┘                   │
│                      │                                          │
│                      ▼                                          │
│              ┌──────────────┐                                   │
│              │  USDC on     │                                   │
│              │    Base      │                                   │
│              └──────────────┘                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Transaction Flow

### 1. Discovery (AdCP)

Buyer agent discovers publisher inventory via AdCP's Media Buy Protocol.

```
GET /.well-known/adcp/inventory.json
```

Publisher's `adagents.json` includes AdRail as authorized payment processor:

```json
{
  "authorized_agents": [
    {
      "agent_id": "adrail-escrow-v1",
      "role": "payment_processor",
      "endpoint": "https://api.adrail.ai/v1"
    }
  ]
}
```

### 2. Negotiation (AdCP)

Buyer and publisher agents negotiate via AdCP:
- Placement details
- CPM / CPC / CPA pricing
- Creative specs
- Delivery timeline

Result: **Ad Contract** (signed by both parties)

### 3. Escrow Deposit (AdRail)

Buyer agent initiates payment via AdRail:

```http
POST https://api.adrail.ai/v1/escrow/create
Content-Type: application/json
X-402-Payment: <x402 payment header>

{
  "contract_id": "adcp-contract-abc123",
  "buyer_agent": "buyer-agent-xyz",
  "publisher_agent": "publisher-agent-789",
  "amount_usdc": "100.00",
  "chain": "base",
  "verification_oracle": "doubleverify",
  "conditions": {
    "impressions_required": 10000,
    "viewability_threshold": 0.7,
    "brand_safety": true,
    "geo_targeting": ["US", "CA", "GB"]
  },
  "expiry": "2026-02-15T00:00:00Z"
}
```

Response:

```json
{
  "escrow_id": "adrail-escrow-001",
  "status": "funded",
  "contract_address": "0x...",
  "amount_locked": "100.00",
  "currency": "USDC",
  "chain": "base",
  "tx_hash": "0x...",
  "release_conditions": {
    "oracle": "doubleverify",
    "threshold": "70% viewable impressions"
  }
}
```

### 4. Ad Delivery (Publisher)

Publisher agent serves impressions. Each impression is logged with:
- Timestamp
- User context (anonymized)
- Placement ID
- Viewability signals

### 5. Verification (Oracle)

AdRail queries verification oracle:

```http
POST https://api.adrail.ai/v1/verify
{
  "escrow_id": "adrail-escrow-001",
  "oracle": "doubleverify",
  "contract_id": "adcp-contract-abc123"
}
```

Oracle response:

```json
{
  "escrow_id": "adrail-escrow-001",
  "verification_status": "passed",
  "metrics": {
    "impressions_delivered": 10842,
    "viewability_rate": 0.73,
    "brand_safety_score": 0.98,
    "invalid_traffic_rate": 0.02,
    "geo_compliance": 0.99
  },
  "oracle_signature": "0x...",
  "timestamp": "2026-02-14T23:45:00Z"
}
```

### 6. Settlement (AdRail)

Once verified, AdRail releases escrow:

```http
POST https://api.adrail.ai/v1/escrow/release
{
  "escrow_id": "adrail-escrow-001",
  "verification_proof": {
    "oracle": "doubleverify",
    "signature": "0x...",
    "metrics_hash": "0x..."
  }
}
```

Settlement executes:
- Smart contract verifies oracle signature
- USDC released to publisher wallet
- Transaction recorded on-chain
- Both agents notified

Response:

```json
{
  "escrow_id": "adrail-escrow-001",
  "status": "settled",
  "amount_released": "100.00",
  "publisher_received": "100.00",
  "adrail_fee": "0.00",
  "settlement_tx": "0x...",
  "settlement_time_ms": 1847
}
```

---

## Dispute Resolution

If verification fails or parties disagree:

### Automatic Resolution

```http
POST https://api.adrail.ai/v1/dispute/create
{
  "escrow_id": "adrail-escrow-001",
  "disputant": "buyer-agent-xyz",
  "reason": "viewability_below_threshold",
  "evidence": {
    "claimed_viewability": 0.73,
    "expected_viewability": 0.80
  }
}
```

Resolution flow:
1. **24-hour dispute window** after delivery completion
2. **Multi-oracle verification** — query additional oracles
3. **Proportional release** — if 73% met vs 80% expected, release 91.25%
4. **Refund remainder** — unused funds return to buyer

### Manual Escalation

For complex disputes:
- Human arbitration available
- Staked reputation system
- Historical transaction data considered

---

## API Reference

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v1/escrow/create` | Create and fund escrow |
| GET | `/v1/escrow/{id}` | Get escrow status |
| POST | `/v1/escrow/release` | Release escrow (with verification) |
| POST | `/v1/escrow/refund` | Refund escrow (expired/cancelled) |
| POST | `/v1/verify` | Trigger oracle verification |
| GET | `/v1/verify/{id}` | Get verification status |
| POST | `/v1/dispute/create` | Open dispute |
| GET | `/v1/dispute/{id}` | Get dispute status |

### Authentication

All requests require x402 payment header or API key:

```http
X-402-Payment: <payment token>
# or
Authorization: Bearer <api_key>
```

### Webhooks

Register webhooks for real-time updates:

```http
POST https://api.adrail.ai/v1/webhooks
{
  "url": "https://your-agent.com/webhooks/adrail",
  "events": [
    "escrow.created",
    "escrow.funded",
    "verification.complete",
    "escrow.released",
    "escrow.disputed",
    "dispute.resolved"
  ]
}
```

---

## Supported Verification Oracles

| Oracle | Capabilities | Integration Status |
|--------|--------------|-------------------|
| Moat | Viewability, attention, brand safety | Planned |
| DoubleVerify | Viewability, fraud, brand safety | Planned |
| IAS | Viewability, brand safety, context | Planned |
| Custom | Bring your own oracle | Supported |

---

## Fees

AdRail fee structure:

| Tier | Monthly Volume | Fee |
|------|----------------|-----|
| Starter | < $10,000 | 1.0% |
| Growth | $10,000 - $100,000 | 0.5% |
| Scale | $100,000 - $1M | 0.25% |
| Enterprise | > $1M | Custom |

*Publishers keep 95%+ of ad spend (vs 51-68% in traditional programmatic).*

---

## Smart Contracts

### Escrow Contract (Base)

```solidity
// Simplified interface
interface IAdRailEscrow {
    function deposit(
        bytes32 contractId,
        address publisher,
        uint256 amount,
        address oracle,
        bytes32 conditionsHash
    ) external returns (bytes32 escrowId);
    
    function release(
        bytes32 escrowId,
        bytes calldata oracleSignature,
        bytes32 metricsHash
    ) external;
    
    function dispute(
        bytes32 escrowId,
        bytes calldata evidence
    ) external;
    
    function refund(
        bytes32 escrowId
    ) external; // Only if expired
}
```

Contract addresses:
- **Base Mainnet**: `0x...` (TBD)
- **Base Sepolia**: `0x...` (TBD)

---

## Example: Full Transaction

```python
# Buyer agent
from adrail import AdRailClient

client = AdRailClient(api_key="...")

# 1. Create escrow after AdCP negotiation
escrow = client.escrow.create(
    contract_id="adcp-contract-abc123",
    publisher_agent="publisher-agent-789",
    amount_usdc=100.00,
    verification_oracle="doubleverify",
    conditions={
        "impressions_required": 10000,
        "viewability_threshold": 0.7
    }
)

print(f"Escrow created: {escrow.id}")
print(f"Funds locked: {escrow.amount_locked} USDC")

# 2. Wait for delivery + verification (webhook or poll)
# ...

# 3. Check settlement
status = client.escrow.get(escrow.id)
print(f"Status: {status.status}")  # "settled"
print(f"Publisher received: {status.amount_released} USDC")
```

---

## Getting Started

1. **Register** at [adrail.ai](https://adrail.ai)
2. **Get API key** from dashboard
3. **Add to adagents.json** — declare AdRail as your payment processor
4. **Integrate** — use SDK or REST API
5. **Test** — use Base Sepolia testnet

---

## Links

- **Website**: [adrail.ai](https://adrail.ai)
- **API Docs**: [docs.adrail.ai](https://docs.adrail.ai)
- **GitHub**: [github.com/Heyw00d/Adrail](https://github.com/Heyw00d/Adrail)
- **AdCP**: [adcontextprotocol.org](https://adcontextprotocol.org)
- **x402**: [x402.org](https://x402.org)

---

*Last updated: 2026-02-12*
