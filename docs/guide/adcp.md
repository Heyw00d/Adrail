# AdCP Integration

Integrate AdRail with the Ad Context Protocol for automated agent-to-agent media buying.

## What is AdCP?

The **Ad Context Protocol** (AdCP) is an open standard for AI agents to negotiate and execute ad buys programmatically. AdRail provides the payment layer.

```
┌──────────────┐     Bid Request      ┌──────────────┐
│  Publisher   │ ◀─────────────────── │  Advertiser  │
│    Agent     │                      │    Agent     │
└──────┬───────┘                      └──────┬───────┘
       │                                     │
       │  Bid Response                       │
       │  (includes adrail_escrow_id)        │
       │ ───────────────────────────────────▶│
       │                                     │
       │         Ad Served                   │
       │◀────────────────────────────────────│
       │                                     │
       ▼                                     │
┌──────────────┐                             │
│   AdRail     │◀────────────────────────────┘
│   Payment    │   Impression Report
└──────────────┘
```

## How It Works

1. **Advertiser agent** creates escrow on AdRail
2. **Publisher agent** receives bid with `adrail_escrow_id`
3. **Publisher** serves ad and reports impressions to AdRail
4. **AdRail** settles payment to publisher automatically

## Step 1: Create Escrow (Advertiser)

Before bidding, create an escrow to back your bids:

```bash
curl -X POST https://api.adrail.ai/v1/escrows \
  -H "Authorization: Bearer ak_live_xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "amount_usdc": "1000.00",
    "cpm": "8.50",
    "name": "Q1 Campaign - Tech Publishers",
    "adcp_campaign_id": "camp_xyz",
    "target_categories": ["technology", "ai", "software"],
    "target_geos": ["US", "CA", "UK", "DE"]
  }'
```

Response:
```json
{
  "escrow_id": "esc_abc123",
  "amount_usdc": "1000.00",
  "cpm": "8.50",
  "max_impressions": 117647,
  "status": "active"
}
```

## Step 2: Include Escrow in Bid Response

When your advertiser agent wins a bid, include the escrow ID:

### AdCP Bid Response Format

```json
{
  "bid_id": "bid_12345",
  "advertiser": "yourcompany.com",
  "cpm": 8.50,
  "creative": {
    "type": "banner",
    "width": 300,
    "height": 250,
    "url": "https://cdn.yourcompany.com/ad.html"
  },
  "adrail": {
    "escrow_id": "esc_abc123",
    "network": "base"
  }
}
```

::: warning Required Field
Always include `adrail.escrow_id` in your bid responses. Publishers need this to get paid.
:::

## Step 3: Store Escrow ID (Publisher)

When you receive a winning bid, store the escrow mapping:

```javascript
// Publisher agent receives bid
const bid = await adcp.receiveBid();

// Store mapping for later
await db.impressions.create({
  impression_id: generateId(),
  escrow_id: bid.adrail.escrow_id,  // Store this!
  creative_url: bid.creative.url,
  served_at: new Date()
});

// Serve the ad
renderAd(bid.creative);
```

## Step 4: Report Impressions (Publisher)

After serving the ad, report to AdRail:

```bash
curl -X POST https://api.adrail.ai/v1/impressions \
  -H "Authorization: Bearer pk_live_xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "escrow_id": "esc_abc123",
    "count": 1,
    "metadata": {
      "bid_id": "bid_12345",
      "ad_unit": "sidebar_300x250",
      "page_url": "https://publisher.com/article",
      "geo": "US",
      "device": "desktop"
    }
  }'
```

### Batch Reporting

For efficiency, batch impressions (recommended):

```bash
curl -X POST https://api.adrail.ai/v1/impressions/batch \
  -H "Authorization: Bearer pk_live_xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "impressions": [
      {"escrow_id": "esc_abc123", "count": 500, "metadata": {...}},
      {"escrow_id": "esc_def456", "count": 350, "metadata": {...}},
      {"escrow_id": "esc_abc123", "count": 150, "metadata": {...}}
    ]
  }'
```

## Complete Flow Example

### Advertiser Agent (Python)

```python
import adrail
import adcp

# Initialize clients
adrail_client = adrail.Client('ak_live_xxx')
adcp_agent = adcp.AdvertiserAgent('your-agent-id')

# Create escrow for campaign
escrow = adrail_client.escrows.create(
    amount_usdc='1000.00',
    cpm='8.50',
    target_categories=['tech']
)

# Configure agent to include escrow in bids
adcp_agent.set_payment_config({
    'provider': 'adrail',
    'escrow_id': escrow.id,
    'network': 'base'
})

# Start bidding
adcp_agent.start()
```

### Publisher Agent (Node.js)

```javascript
const adrail = require('@adrail/sdk');
const adcp = require('adcp-sdk');

const adrailClient = new adrail.Client('pk_live_xxx');
const publisherAgent = new adcp.PublisherAgent('your-agent-id');

// Handle incoming bids
publisherAgent.on('bid', async (bid) => {
  // Serve the ad
  await serveAd(bid.creative);
  
  // Report impression to AdRail
  await adrailClient.impressions.report({
    escrowId: bid.adrail.escrow_id,
    count: 1,
    metadata: {
      bidId: bid.bid_id,
      geo: bid.user.geo
    }
  });
});

publisherAgent.start();
```

## Escrow Management

### Check Escrow Balance

```bash
curl https://api.adrail.ai/v1/escrows/esc_abc123 \
  -H "Authorization: Bearer ak_live_xxx"
```

```json
{
  "escrow_id": "esc_abc123",
  "amount_usdc": "1000.00",
  "spent_usdc": "425.50",
  "remaining_usdc": "574.50",
  "impressions_served": 50059,
  "status": "active"
}
```

### Top Up Escrow

```bash
curl -X POST https://api.adrail.ai/v1/escrows/esc_abc123/topup \
  -H "Authorization: Bearer ak_live_xxx" \
  -d '{"amount_usdc": "500.00"}'
```

### Pause/Resume Escrow

```bash
# Pause
curl -X POST https://api.adrail.ai/v1/escrows/esc_abc123/pause \
  -H "Authorization: Bearer ak_live_xxx"

# Resume  
curl -X POST https://api.adrail.ai/v1/escrows/esc_abc123/resume \
  -H "Authorization: Bearer ak_live_xxx"
```

### Close Escrow (Refund Remaining)

```bash
curl -X POST https://api.adrail.ai/v1/escrows/esc_abc123/close \
  -H "Authorization: Bearer ak_live_xxx"
```

Remaining funds returned to your account.

## Error Handling

### Common AdCP Integration Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `escrow_not_found` | Invalid escrow_id in bid | Verify escrow exists and is active |
| `escrow_depleted` | No budget remaining | Top up escrow or create new one |
| `escrow_paused` | Advertiser paused campaign | Wait for resume or use different escrow |
| `publisher_not_registered` | Unknown publisher | Register at `/v1/publishers` first |

### Handling Depleted Escrows

```javascript
try {
  await adrailClient.impressions.report({...});
} catch (error) {
  if (error.code === 'escrow_depleted') {
    // Stop serving this campaign
    await pauseCampaign(escrowId);
    // Notify advertiser
    await notifyAdvertiser(escrowId, 'budget_exhausted');
  }
}
```

## Webhooks for AdCP

Get notified of escrow events:

```bash
curl -X POST https://api.adrail.ai/v1/webhooks \
  -H "Authorization: Bearer ak_live_xxx" \
  -d '{
    "url": "https://yoursite.com/webhooks/adrail",
    "events": ["escrow.depleted", "escrow.low_balance"]
  }'
```

See [Webhooks Guide](/guide/webhooks) for details.

## Resources

- [AdCP Specification](https://agenticadvertising.org/spec)
- [AdCP GitHub](https://github.com/ad-context-protocol)
- [Scope3 Integration](https://scope3.com/agentic)
- [AdRail API Reference](/api/)
