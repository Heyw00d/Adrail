# Testing Sandbox

Test your AdRail integration without risking real money.

::: tip Testnet Mode
All testnet transactions are free, reversible, and use fake USDC. Perfect for development and testing.
:::

## Testnet vs Mainnet

| Feature | Testnet (Sandbox) | Mainnet (Production) |
|---------|-------------------|----------------------|
| Network | Base Sepolia | Base |
| Chain ID | 84532 | 8453 |
| USDC | Fake (free) | Real |
| API Base | `api.adrail.ai` | `api.adrail.ai` |
| API Key Prefix | `pk_test_` | `pk_live_` |

## Getting Started with Testnet

### 1. Get a Testnet API Key

When you register, specify testnet mode:

```bash
curl -X POST https://api.adrail.ai/v1/publishers \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "test.yoursite.com",
    "wallet_address": "0xYourWalletAddress",
    "name": "Test Publisher",
    "email": "dev@yoursite.com",
    "testnet": true
  }'
```

You'll receive a testnet API key starting with `pk_test_`:

```json
{
  "publisher_id": "pub_test_abc123",
  "api_key": "pk_test_xxxxxxxx",
  "status": "active",
  "network": "base-sepolia"
}
```

### 2. Get Free Test USDC

You need test USDC to simulate advertiser escrows.

**Circle Faucet (Recommended):**
1. Go to [faucet.circle.com](https://faucet.circle.com/)
2. Select "Base Sepolia"
3. Enter your wallet address
4. Receive 10 test USDC

**Get Test ETH for Gas:**
1. Visit [alchemy.com/faucets/base-sepolia](https://www.alchemy.com/faucets/base-sepolia)
2. Enter your wallet address
3. Receive 0.1 test ETH

### 3. Configure MetaMask for Testnet

Add Base Sepolia network:

```
Network Name: Base Sepolia
RPC URL: https://sepolia.base.org
Chain ID: 84532
Currency: ETH
Explorer: https://sepolia.basescan.org
```

Or one-click: [chainlist.org/chain/84532](https://chainlist.org/chain/84532)

## Testing Workflows

### Test Publisher Flow

```bash
# 1. Register (testnet)
curl -X POST https://api.adrail.ai/v1/publishers \
  -d '{"domain":"test.example.com","wallet_address":"0x...","testnet":true}'

# 2. Report test impressions
curl -X POST https://api.adrail.ai/v1/impressions \
  -H "Authorization: Bearer pk_test_xxx" \
  -d '{"escrow_id":"esc_test_abc","count":1000}'

# 3. Check balance
curl https://api.adrail.ai/v1/publishers/account \
  -H "Authorization: Bearer pk_test_xxx"

# 4. Request settlement
curl -X POST https://api.adrail.ai/v1/publishers/settle \
  -H "Authorization: Bearer pk_test_xxx"
```

### Test Advertiser Flow

```bash
# 1. Register as advertiser (testnet)
curl -X POST https://api.adrail.ai/v1/advertisers \
  -d '{"name":"Test Advertiser","wallet_address":"0x...","testnet":true}'

# 2. Create test escrow
curl -X POST https://api.adrail.ai/v1/escrows \
  -H "Authorization: Bearer pk_test_xxx" \
  -d '{"amount_usdc":"100","cpm":"5.00","target_publishers":["test.example.com"]}'

# 3. Monitor escrow
curl https://api.adrail.ai/v1/escrows/esc_test_abc \
  -H "Authorization: Bearer pk_test_xxx"
```

## Test Escrows

We provide pre-funded test escrows for publisher testing:

| Escrow ID | CPM | Budget | Purpose |
|-----------|-----|--------|---------|
| `esc_test_standard` | $5.00 | $1000 | General testing |
| `esc_test_premium` | $15.00 | $500 | High-CPM testing |
| `esc_test_low` | $1.00 | $5000 | Volume testing |

Use these escrow IDs in your test impression reports.

## Debugging Tools

### Check Transaction on Testnet

View your testnet transactions:
```
https://sepolia.basescan.org/address/YOUR_WALLET_ADDRESS
```

### Verify Test USDC Balance

```bash
# Check on-chain balance
curl "https://sepolia.basescan.org/api?module=account&action=tokenbalance&contractaddress=0x...&address=YOUR_WALLET"
```

### API Request Logging

Add `?debug=true` to log detailed request/response:

```bash
curl "https://api.adrail.ai/v1/publishers/account?debug=true" \
  -H "Authorization: Bearer pk_test_xxx"
```

## Migrating to Production

When ready to go live:

1. **Register with production API key:**
```bash
curl -X POST https://api.adrail.ai/v1/publishers \
  -d '{"domain":"yoursite.com","wallet_address":"0x...","testnet":false}'
```

2. **Update your code:**
   - Replace `pk_test_` with `pk_live_`
   - Switch wallet to Base mainnet
   - Remove test escrow IDs

3. **Verify mainnet wallet:**
   - Ensure you have a small amount of ETH on Base for gas
   - Double-check your wallet address is correct

::: danger Production Checklist
Before going live:
- [ ] Tested full flow on testnet
- [ ] Correct mainnet wallet address
- [ ] API key stored securely (not in code)
- [ ] Error handling implemented
- [ ] Webhook endpoint ready (if using)
:::

## Common Testnet Issues

### "Escrow not found" on testnet

The test escrows reset daily. Use the current test escrow IDs listed above.

### Test USDC not showing in wallet

1. Add USDC token to MetaMask manually
2. Contract address (Base Sepolia): `0x...` 
3. Ensure you're on Base Sepolia network

### Settlement not arriving

Testnet settlements may take longer (up to 10 min). Check [sepolia.basescan.org](https://sepolia.basescan.org) for transaction status.
