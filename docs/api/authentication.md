# Authentication

AdRail uses API keys for authentication. Keys are issued at registration and determine what actions you can perform.

## API Key Types

| Prefix | Type | Permissions |
|--------|------|-------------|
| `pk_` | Publisher | Report impressions, view earnings, settle payments |
| `ak_` | Advertiser | Create escrows, fund campaigns, request refunds |

## Using Your API Key

### Authorization Header (Recommended)

```bash
curl https://api.adrail.ai/v1/publishers/me \
  -H "Authorization: Bearer pk_abc123xyz"
```

### X-API-Key Header

```bash
curl https://api.adrail.ai/v1/publishers/me \
  -H "X-API-Key: pk_abc123xyz"
```

## Getting an API Key

### Publishers

```bash
curl -X POST https://api.adrail.ai/v1/publishers/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Website",
    "wallet_address": "0x..."
  }'
```

Response includes your API key:

```json
{
  "id": "pub_abc123",
  "api_key": "pk_live_xxxxxxxxxxxxxxxx"
}
```

### Advertisers

```bash
curl -X POST https://api.adrail.ai/v1/advertisers/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Company",
    "wallet_address": "0x..."
  }'
```

::: danger Keep Your API Key Secret
- API keys are shown only once at registration
- Never commit keys to version control
- Use environment variables in production
- Rotate keys if compromised
:::

## Error Responses

### Missing Key

```json
{
  "error": "Missing API key",
  "hint": "Include Authorization: Bearer <api_key> or X-API-Key header"
}
```

### Invalid Key

```json
{
  "error": "Invalid API key"
}
```

### Wrong Key Type

```json
{
  "error": "Only publishers can report impressions"
}
```

## SDK Usage

### JavaScript/TypeScript

```typescript
const ADRAIL_API_KEY = process.env.ADRAIL_API_KEY;

async function adrailFetch(path: string, options: RequestInit = {}) {
  return fetch(`https://api.adrail.ai${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${ADRAIL_API_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
}

// Usage
const stats = await adrailFetch('/v1/publishers/me/stats').then(r => r.json());
```

### Python

```python
import os
import requests

API_KEY = os.environ['ADRAIL_API_KEY']
BASE_URL = 'https://api.adrail.ai'

def adrail_request(method, path, **kwargs):
    headers = {'Authorization': f'Bearer {API_KEY}'}
    return requests.request(method, f'{BASE_URL}{path}', headers=headers, **kwargs)

# Usage
stats = adrail_request('GET', '/v1/publishers/me/stats').json()
```
