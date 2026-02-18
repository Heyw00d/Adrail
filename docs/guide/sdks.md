# SDKs & Libraries

Official AdRail SDKs for popular languages.

::: tip Coming Soon
Full SDKs are in development. Code examples below show the planned interface.
:::

## Node.js / TypeScript

### Installation

```bash
npm install @adrail/sdk
# or
yarn add @adrail/sdk
```

### Quick Start

```typescript
import { AdRail } from '@adrail/sdk';

// Initialize client
const adrail = new AdRail({
  apiKey: 'pk_live_xxxxxxxx',
  network: 'base' // or 'base-sepolia' for testnet
});

// Publisher: Report impressions
const result = await adrail.impressions.report({
  escrowId: 'esc_abc123',
  count: 1000,
  metadata: {
    adUnit: 'banner_300x250',
    geo: 'US'
  }
});

console.log(`Earned: $${result.earnedUsdc} USDC`);

// Publisher: Check balance
const account = await adrail.publishers.getAccount();
console.log(`Balance: $${account.balanceUsdc}`);

// Publisher: Request settlement
const settlement = await adrail.publishers.settle();
console.log(`Settled: ${settlement.txHash}`);
```

### Advertiser Usage

```typescript
import { AdRail } from '@adrail/sdk';

const adrail = new AdRail({
  apiKey: 'ak_live_xxxxxxxx'
});

// Create escrow
const escrow = await adrail.escrows.create({
  amountUsdc: '1000.00',
  cpm: '8.50',
  name: 'Q1 Tech Campaign',
  targetCategories: ['technology', 'ai']
});

console.log(`Escrow ID: ${escrow.id}`);

// Check escrow status
const status = await adrail.escrows.get(escrow.id);
console.log(`Remaining: $${status.remainingUsdc}`);

// Top up escrow
await adrail.escrows.topUp(escrow.id, { amountUsdc: '500.00' });

// Close escrow (refund remaining)
await adrail.escrows.close(escrow.id);
```

### TypeScript Types

```typescript
interface Impression {
  impressionId: string;
  escrowId: string;
  count: number;
  earnedUsdc: string;
  status: 'recorded' | 'settled';
}

interface Escrow {
  id: string;
  amountUsdc: string;
  spentUsdc: string;
  remainingUsdc: string;
  cpm: string;
  impressionsServed: number;
  status: 'active' | 'paused' | 'depleted' | 'closed';
}

interface Settlement {
  settlementId: string;
  amountUsdc: string;
  txHash: string;
  status: 'pending' | 'completed' | 'failed';
  wallet: string;
}
```

## Python

### Installation

```bash
pip install adrail
```

### Quick Start

```python
from adrail import AdRail

# Initialize client
client = AdRail(api_key='pk_live_xxxxxxxx')

# Report impressions
result = client.impressions.report(
    escrow_id='esc_abc123',
    count=1000,
    metadata={
        'ad_unit': 'banner_300x250',
        'geo': 'US'
    }
)
print(f"Earned: ${result.earned_usdc} USDC")

# Check balance
account = client.publishers.get_account()
print(f"Balance: ${account.balance_usdc}")

# Request settlement
settlement = client.publishers.settle()
print(f"Settled: {settlement.tx_hash}")
```

### Advertiser Usage

```python
from adrail import AdRail

client = AdRail(api_key='ak_live_xxxxxxxx')

# Create escrow
escrow = client.escrows.create(
    amount_usdc='1000.00',
    cpm='8.50',
    name='Q1 Tech Campaign',
    target_categories=['technology', 'ai']
)
print(f"Escrow ID: {escrow.id}")

# Check status
status = client.escrows.get(escrow.id)
print(f"Remaining: ${status.remaining_usdc}")

# Top up
client.escrows.top_up(escrow.id, amount_usdc='500.00')

# Close
client.escrows.close(escrow.id)
```

### Async Support

```python
import asyncio
from adrail import AsyncAdRail

async def main():
    client = AsyncAdRail(api_key='pk_live_xxx')
    
    # Batch report impressions
    results = await asyncio.gather(
        client.impressions.report(escrow_id='esc_1', count=500),
        client.impressions.report(escrow_id='esc_2', count=300),
        client.impressions.report(escrow_id='esc_3', count=200),
    )
    
    total_earned = sum(r.earned_usdc for r in results)
    print(f"Total earned: ${total_earned}")

asyncio.run(main())
```

## Go

### Installation

```bash
go get github.com/adrail/adrail-go
```

### Quick Start

```go
package main

import (
    "fmt"
    "github.com/adrail/adrail-go"
)

func main() {
    // Initialize client
    client := adrail.NewClient("pk_live_xxxxxxxx")
    
    // Report impressions
    result, err := client.Impressions.Report(&adrail.ImpressionParams{
        EscrowID: "esc_abc123",
        Count:    1000,
        Metadata: map[string]string{
            "ad_unit": "banner_300x250",
            "geo":     "US",
        },
    })
    if err != nil {
        panic(err)
    }
    fmt.Printf("Earned: $%s USDC\n", result.EarnedUSDC)
    
    // Check balance
    account, _ := client.Publishers.GetAccount()
    fmt.Printf("Balance: $%s\n", account.BalanceUSDC)
    
    // Request settlement
    settlement, _ := client.Publishers.Settle()
    fmt.Printf("Settled: %s\n", settlement.TxHash)
}
```

### Advertiser Usage

```go
package main

import (
    "fmt"
    "github.com/adrail/adrail-go"
)

func main() {
    client := adrail.NewClient("ak_live_xxxxxxxx")
    
    // Create escrow
    escrow, _ := client.Escrows.Create(&adrail.EscrowParams{
        AmountUSDC:       "1000.00",
        CPM:              "8.50",
        Name:             "Q1 Tech Campaign",
        TargetCategories: []string{"technology", "ai"},
    })
    fmt.Printf("Escrow ID: %s\n", escrow.ID)
    
    // Check status
    status, _ := client.Escrows.Get(escrow.ID)
    fmt.Printf("Remaining: $%s\n", status.RemainingUSDC)
    
    // Top up
    client.Escrows.TopUp(escrow.ID, "500.00")
    
    // Close
    client.Escrows.Close(escrow.ID)
}
```

## HTTP/cURL Reference

All SDKs wrap our REST API. You can always use HTTP directly:

### Headers

```bash
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

### Base URLs

| Environment | URL |
|-------------|-----|
| Production | `https://api.adrail.ai` |
| Testnet | `https://api.adrail.ai` (use `pk_test_` key) |

### Common Endpoints

```bash
# Publisher
POST   /v1/impressions          # Report impressions
GET    /v1/publishers/account   # Get balance
POST   /v1/publishers/settle    # Request settlement

# Advertiser  
POST   /v1/escrows              # Create escrow
GET    /v1/escrows/:id          # Get escrow status
POST   /v1/escrows/:id/topup    # Top up escrow
POST   /v1/escrows/:id/close    # Close escrow

# Both
GET    /v1/webhooks             # List webhooks
POST   /v1/webhooks             # Create webhook
```

## Error Handling

All SDKs throw typed errors:

### Node.js

```typescript
import { AdRailError, EscrowDepletedError } from '@adrail/sdk';

try {
  await adrail.impressions.report({...});
} catch (error) {
  if (error instanceof EscrowDepletedError) {
    console.log('Escrow is depleted, stop serving this campaign');
  } else if (error instanceof AdRailError) {
    console.log(`API Error: ${error.code} - ${error.message}`);
  }
}
```

### Python

```python
from adrail.exceptions import AdRailError, EscrowDepletedError

try:
    client.impressions.report(...)
except EscrowDepletedError:
    print('Escrow is depleted')
except AdRailError as e:
    print(f'API Error: {e.code} - {e.message}')
```

### Go

```go
result, err := client.Impressions.Report(...)
if err != nil {
    if adrail.IsEscrowDepleted(err) {
        fmt.Println("Escrow is depleted")
    } else {
        fmt.Printf("Error: %v\n", err)
    }
}
```

## Contributing

SDKs are open source:

- Node.js: [github.com/adrail/adrail-node](https://github.com/adrail/adrail-node)
- Python: [github.com/adrail/adrail-python](https://github.com/adrail/adrail-python)
- Go: [github.com/adrail/adrail-go](https://github.com/adrail/adrail-go)

Issues and PRs welcome!

## Need Another Language?

Request an SDK: [sdk-requests@adrail.ai](mailto:sdk-requests@adrail.ai)

Community SDKs:
- PHP: Coming soon
- Ruby: Coming soon
- Rust: Coming soon
