# Webhooks

Get real-time notifications when events happen in AdRail.

## Overview

Instead of polling the API, webhooks push events to your server instantly:

```
AdRail Event → POST to your URL → Your server processes
```

## Supported Events

### Publisher Events

| Event | Description |
|-------|-------------|
| `payment.completed` | USDC settlement sent to your wallet |
| `payment.pending` | Settlement initiated, awaiting confirmation |
| `impression.recorded` | Impressions successfully recorded |
| `balance.threshold` | Balance reached settlement threshold |

### Advertiser Events

| Event | Description |
|-------|-------------|
| `escrow.created` | New escrow created |
| `escrow.depleted` | Escrow budget exhausted |
| `escrow.low_balance` | Escrow below 20% remaining |
| `escrow.paused` | Escrow paused |
| `escrow.closed` | Escrow closed, funds returned |
| `impression.received` | Impressions reported against escrow |

## Setup Webhooks

### Create Webhook Endpoint

```bash
curl -X POST https://api.adrail.ai/v1/webhooks \
  -H "Authorization: Bearer pk_live_xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://yoursite.com/webhooks/adrail",
    "events": ["payment.completed", "balance.threshold"],
    "secret": "your_webhook_secret"
  }'
```

Response:
```json
{
  "webhook_id": "wh_abc123",
  "url": "https://yoursite.com/webhooks/adrail",
  "events": ["payment.completed", "balance.threshold"],
  "status": "active",
  "created_at": "2026-02-17T12:00:00Z"
}
```

### List Webhooks

```bash
curl https://api.adrail.ai/v1/webhooks \
  -H "Authorization: Bearer pk_live_xxx"
```

### Delete Webhook

```bash
curl -X DELETE https://api.adrail.ai/v1/webhooks/wh_abc123 \
  -H "Authorization: Bearer pk_live_xxx"
```

## Webhook Payload Format

All webhooks have this structure:

```json
{
  "id": "evt_xyz789",
  "type": "payment.completed",
  "created_at": "2026-02-17T15:30:00Z",
  "data": {
    // Event-specific data
  }
}
```

## Event Examples

### payment.completed

```json
{
  "id": "evt_xyz789",
  "type": "payment.completed",
  "created_at": "2026-02-17T15:30:00Z",
  "data": {
    "payment_id": "pay_abc123",
    "amount_usdc": "547.50",
    "wallet": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
    "tx_hash": "0x1234567890abcdef...",
    "network": "base",
    "explorer_url": "https://basescan.org/tx/0x1234..."
  }
}
```

### escrow.depleted

```json
{
  "id": "evt_abc456",
  "type": "escrow.depleted",
  "created_at": "2026-02-17T15:30:00Z",
  "data": {
    "escrow_id": "esc_abc123",
    "name": "Q1 Campaign",
    "total_spent_usdc": "1000.00",
    "impressions_served": 117647,
    "unique_publishers": 45
  }
}
```

### escrow.low_balance

```json
{
  "id": "evt_def789",
  "type": "escrow.low_balance",
  "created_at": "2026-02-17T15:30:00Z",
  "data": {
    "escrow_id": "esc_abc123",
    "name": "Q1 Campaign",
    "remaining_usdc": "150.00",
    "remaining_percent": 15,
    "estimated_impressions_left": 17647
  }
}
```

### impression.recorded

```json
{
  "id": "evt_ghi012",
  "type": "impression.recorded",
  "created_at": "2026-02-17T15:30:00Z",
  "data": {
    "impression_id": "imp_xyz",
    "escrow_id": "esc_abc123",
    "count": 1000,
    "earned_usdc": "8.50",
    "total_balance": "1,256.00"
  }
}
```

## Handling Webhooks

### Verify Signature

We sign webhooks with your secret. Always verify:

```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

// Express.js example
app.post('/webhooks/adrail', (req, res) => {
  const signature = req.headers['x-adrail-signature'];
  const isValid = verifyWebhook(
    JSON.stringify(req.body),
    signature,
    process.env.ADRAIL_WEBHOOK_SECRET
  );
  
  if (!isValid) {
    return res.status(401).send('Invalid signature');
  }
  
  // Process webhook
  handleEvent(req.body);
  res.status(200).send('OK');
});
```

### Python Example

```python
import hmac
import hashlib
from flask import Flask, request

app = Flask(__name__)

def verify_webhook(payload, signature, secret):
    expected = hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(signature, expected)

@app.route('/webhooks/adrail', methods=['POST'])
def handle_webhook():
    signature = request.headers.get('X-AdRail-Signature')
    
    if not verify_webhook(request.data.decode(), signature, WEBHOOK_SECRET):
        return 'Invalid signature', 401
    
    event = request.json
    
    if event['type'] == 'payment.completed':
        handle_payment(event['data'])
    elif event['type'] == 'escrow.depleted':
        handle_depleted(event['data'])
    
    return 'OK', 200
```

## Retry Policy

Failed webhooks are retried with exponential backoff:

| Attempt | Delay |
|---------|-------|
| 1 | Immediate |
| 2 | 1 minute |
| 3 | 5 minutes |
| 4 | 30 minutes |
| 5 | 2 hours |
| 6 | 12 hours |
| 7 | 24 hours (final) |

A webhook is considered failed if:
- Your server returns non-2xx status
- Connection timeout (10 seconds)
- DNS resolution fails

## Testing Webhooks

### Send Test Event

```bash
curl -X POST https://api.adrail.ai/v1/webhooks/wh_abc123/test \
  -H "Authorization: Bearer pk_live_xxx" \
  -d '{"event_type": "payment.completed"}'
```

### Use Webhook.site for Testing

1. Go to [webhook.site](https://webhook.site)
2. Copy your unique URL
3. Create webhook with that URL
4. Send test events and inspect payloads

## Best Practices

1. **Always verify signatures** — Never trust unverified payloads
2. **Respond quickly** — Return 200 within 5 seconds, process async
3. **Handle duplicates** — Use `event.id` for idempotency
4. **Log everything** — Store raw payloads for debugging
5. **Monitor failures** — Alert on repeated webhook failures

```javascript
// Idempotent handling example
app.post('/webhooks/adrail', async (req, res) => {
  const event = req.body;
  
  // Check if already processed
  const existing = await db.events.findOne({ eventId: event.id });
  if (existing) {
    return res.status(200).send('Already processed');
  }
  
  // Store event
  await db.events.create({ eventId: event.id, ...event });
  
  // Process async
  processEventAsync(event);
  
  // Respond immediately
  res.status(200).send('OK');
});
```

## Webhook Logs

View recent webhook deliveries:

```bash
curl https://api.adrail.ai/v1/webhooks/wh_abc123/logs \
  -H "Authorization: Bearer pk_live_xxx"
```

```json
{
  "logs": [
    {
      "id": "log_123",
      "event_id": "evt_xyz",
      "status": "delivered",
      "response_code": 200,
      "response_time_ms": 145,
      "delivered_at": "2026-02-17T15:30:00Z"
    },
    {
      "id": "log_124",
      "event_id": "evt_abc",
      "status": "failed",
      "response_code": 500,
      "retry_count": 2,
      "next_retry_at": "2026-02-17T15:35:00Z"
    }
  ]
}
```
