# Advertisers

Advertisers fund escrows to pay for ad impressions from publishers.

## Registration

```bash
curl -X POST https://api.adrail.ai/v1/advertisers/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Company",
    "email": "ads@example.com",
    "wallet_address": "0xYourWalletAddress"
  }'
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Company name |
| `email` | string | No | Contact email |
| `wallet_address` | string | Yes | EVM address (for refunds) |

## Campaign Flow

```
1. Create escrow with budget amount
2. Send USDC to escrow address
3. Confirm funding with tx_hash
4. Activate escrow
5. Share escrow_id with publishers
6. Publishers serve ads and report impressions
7. Funds automatically deducted per impression
```

## View Stats

```bash
curl https://api.adrail.ai/v1/advertisers/me/stats \
  -H "Authorization: Bearer ak_xxx"
```

```json
{
  "advertiser_id": "adv_xyz789",
  "spending": {
    "total_funded_usdc": 5000,
    "total_spent_usdc": 3247.50,
    "total_remaining_usdc": 1752.50
  },
  "escrows": {
    "total": 5,
    "active": 2
  }
}
```

## Managing Escrows

List your escrows:

```bash
curl https://api.adrail.ai/v1/advertisers/me/escrows \
  -H "Authorization: Bearer ak_xxx"
```

## Refunds

Request a refund of remaining escrow balance:

```bash
curl -X POST https://api.adrail.ai/v1/escrows/esc_xxx/refund \
  -H "Authorization: Bearer ak_xxx"
```

Refunds are sent to your registered wallet address.

## Best Practices

1. **Start small** — Test with small escrows first
2. **Monitor spend** — Check escrow balances regularly
3. **Set expiration** — Use `expires_at` to auto-close campaigns
4. **Verify publishers** — Work with trusted publishers
