# Publishers

Publishers are sites, apps, or agents that display ads and earn USDC for verified impressions.

## Registration

Register to get your API key:

```bash
curl -X POST https://api.adrail.ai/v1/publishers/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Website",
    "domain": "example.com",
    "wallet_address": "0xYourWalletAddress"
  }'
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Display name |
| `domain` | string | No | Your website domain |
| `wallet_address` | string | Yes | EVM address for receiving USDC |

## API Key

Your API key (`pk_xxx`) is returned once at registration. It's used to:

- Report impressions
- View earnings
- Request payment settlements

Include it in all requests:

```bash
curl https://api.adrail.ai/v1/publishers/me \
  -H "Authorization: Bearer pk_xxx"
```

## Earning Flow

```
1. Get escrow_id from advertiser (via AdCP or direct deal)
2. Display ads to users
3. Report impressions to AdRail
4. Call /payments/settle when ready
5. Receive USDC to your wallet
```

## View Stats

```bash
curl https://api.adrail.ai/v1/publishers/me/stats \
  -H "Authorization: Bearer pk_xxx"
```

```json
{
  "publisher_id": "pub_abc123",
  "earnings": {
    "total_paid_usdc": 1250.50,
    "pending_usdc": 47.30,
    "payment_count": 23
  },
  "impressions": {
    "total": 125000,
    "total_earned_usdc": 1297.80
  }
}
```

## Payment History

```bash
curl https://api.adrail.ai/v1/publishers/me/payments \
  -H "Authorization: Bearer pk_xxx"
```

## Best Practices

1. **Batch impressions** — Report in batches of 1,000+ for efficiency
2. **Settle regularly** — Don't let pending balance grow too large
3. **Verify escrows** — Check escrow status before serving ads
4. **Monitor earnings** — Use `/me/stats` to track performance
