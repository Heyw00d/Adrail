# Getting Started

Get up and running with AdRail in 5 minutes.

## Prerequisites

- An EVM wallet address (for receiving/sending USDC)
- USDC on Base (mainnet) or Base Sepolia (testnet)

## 1. Choose Your Role

### For Publishers (earning money)

Publishers display ads and earn USDC for verified impressions.

```bash
# Register as a publisher
curl -X POST https://api.adrail.ai/v1/publishers/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Website",
    "domain": "example.com",
    "wallet_address": "0xYourWalletAddress"
  }'
```

Response:
```json
{
  "id": "pub_abc123",
  "name": "My Website",
  "api_key": "pk_live_xxxxxxxxxxxxxxxx",
  "wallet_address": "0xYourWalletAddress"
}
```

::: warning Save Your API Key
The `api_key` is only shown once. Store it securely.
:::

### For Advertisers (spending money)

Advertisers fund escrows and pay for impressions.

```bash
# Register as an advertiser
curl -X POST https://api.adrail.ai/v1/advertisers/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Company",
    "email": "ads@example.com",
    "wallet_address": "0xYourWalletAddress"
  }'
```

Response:
```json
{
  "id": "adv_xyz789",
  "name": "My Company",
  "api_key": "ak_live_xxxxxxxxxxxxxxxx",
  "wallet_address": "0xYourWalletAddress"
}
```

## 2. Check Your Account

```bash
# Publishers
curl https://api.adrail.ai/v1/publishers/me \
  -H "Authorization: Bearer pk_live_xxxxxxxxxxxxxxxx"

# Advertisers
curl https://api.adrail.ai/v1/advertisers/me \
  -H "Authorization: Bearer ak_live_xxxxxxxxxxxxxxxx"
```

## 3. Network Configuration

AdRail runs on Base. Check the current configuration:

```bash
curl https://api.adrail.ai/v1/x402/info
```

```json
{
  "network": "eip155:8453",
  "networkName": "Base",
  "asset": "USDC",
  "usdcAddress": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  "payTo": "0x..."
}
```

## Next Steps

- **Publishers**: Learn about [reporting impressions](/guide/impressions) and [receiving payments](/guide/payments)
- **Advertisers**: Learn about [creating escrows](/guide/escrows) and funding campaigns
- **Both**: Check the [API Reference](/api/overview) for all endpoints
