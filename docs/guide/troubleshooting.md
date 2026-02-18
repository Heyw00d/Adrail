# Troubleshooting

Common errors and how to fix them.

## Registration Errors

### Error: `wallet_address is invalid`

**Cause:** Address format incorrect

**Solution:** Ensure address:
- Starts with `0x`
- Is exactly 42 characters
- Contains only valid hex characters (0-9, a-f)

**Example valid address:**
```
0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1
```

### Error: `domain already registered`

**Cause:** Another publisher owns this domain

**Solution:**
1. Verify you own the domain
2. Contact [support@adrail.ai](mailto:support@adrail.ai) with proof of ownership
3. We'll transfer the domain to your account

### Error: `invalid email format`

**Cause:** Email validation failed

**Solution:** Use a valid email format: `name@domain.com`

## Impression Reporting Errors

### Error: `escrow_not_found`

**Cause:** Invalid escrow_id or escrow expired

**Solution:**
1. Verify the escrow exists: `GET /v1/escrows/{escrow_id}`
2. Check escrow status is `active`
3. Ensure escrow hasn't been depleted

```bash
curl https://api.adrail.ai/v1/escrows/esc_abc123 \
  -H "Authorization: Bearer pk_xxx"
```

### Error: `escrow_depleted`

**Cause:** The escrow has no remaining budget

**Solution:**
1. Stop reporting impressions against this escrow
2. The advertiser needs to top up or create a new escrow
3. Check for other active escrows to report against

### Error: `unauthorized`

**Cause:** Invalid or missing API key

**Solution:**
1. Check your API key is correct
2. Include it in the Authorization header:
```bash
-H "Authorization: Bearer pk_live_xxxxxxxx"
```
3. Ensure no extra spaces or characters

### Error: `rate_limited`

**Cause:** Too many requests

**Solution:**
1. Implement exponential backoff
2. Batch impression reports (up to 10,000 per request)
3. Wait for the `Retry-After` header duration

```javascript
// Example: Batch impressions
{
  "escrow_id": "esc_abc123",
  "count": 5000,  // Batch multiple impressions
  "metadata": {...}
}
```

## Settlement Errors

### Error: `insufficient_balance`

**Cause:** Balance below minimum settlement threshold

**Solution:**
1. Check your balance: `GET /v1/publishers/account`
2. Default minimum is $100 USDC
3. Continue earning until you reach the threshold

### Error: `settlement_pending`

**Cause:** A settlement is already in progress

**Solution:**
1. Wait for the current settlement to complete (usually < 5 min)
2. Check status: `GET /v1/publishers/settlements`

### Error: `wallet_unreachable`

**Cause:** Issue sending to your wallet

**Solution:**
1. Verify wallet address is correct
2. Ensure wallet can receive on Base network
3. Check you have ETH for gas (we cover gas, but wallet must be valid)

## Network Errors

### Error: `timeout`

**Cause:** Request took too long

**Solution:**
1. Retry with exponential backoff
2. Check your network connection
3. Try a different region if consistently slow

### Error: `service_unavailable`

**Cause:** AdRail is temporarily down

**Solution:**
1. Check [status.adrail.ai](https://status.adrail.ai) for incidents
2. Retry after a few minutes
3. Queue impressions locally and batch submit later

## AdCP Integration Errors

### Error: `invalid_escrow_id_format`

**Cause:** Escrow ID from AdCP doesn't match expected format

**Solution:**
1. AdRail escrow IDs start with `esc_`
2. Ensure you're extracting the correct field from AdCP response
3. Check AdCP documentation for the `adrail_escrow_id` field

### Error: `escrow_mismatch`

**Cause:** Escrow doesn't match the publisher/domain

**Solution:**
1. Verify you're the authorized publisher for this escrow
2. Check the escrow was created for your domain
3. Contact the advertiser to verify escrow configuration

## Still Need Help?

- 📧 Email: [support@adrail.ai](mailto:support@adrail.ai)
- 💬 Discord: [discord.gg/adrail](https://discord.gg/adrail)
- 📖 API Docs: [docs.adrail.ai/api](/api/)

Include in your support request:
1. Your publisher ID
2. The exact error message
3. The request you made (redact your API key)
4. Timestamp of when it occurred
