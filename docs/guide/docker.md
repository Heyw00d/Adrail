# Docker Setup

Run AdRail locally with Docker for testing and development.

## Quick Start

```bash
# Clone the repo
git clone https://github.com/Heyw00d/Adrail.git
cd Adrail

# Copy environment template
cp api/.env.example api/.env

# Edit .env with your credentials
# See Environment Variables below

# Start services
docker-compose up -d

# Check it's running
curl http://localhost:3000/health
```

## Environment Variables

Create `api/.env` with these values:

```bash
# Database (use local Postgres from docker-compose)
DATABASE_URL=postgres://adrail:adrail_dev@postgres:5432/adrail

# Wallet for x402 payments (testnet)
WALLET_PRIVATE_KEY=your_testnet_private_key

# RPC URL (Base Sepolia for testnet)
RPC_URL=https://sepolia.base.org

# Optional: Port (default 3000)
PORT=3000
```

## Testnet Setup

AdRail uses [x402](https://x402.org) for real-time payments on Base. For testing:

1. **Get testnet USDC**: Use the [Circle Testnet Faucet](https://faucet.circle.com/) to get Base Sepolia USDC
2. **Get testnet ETH**: Use [BaseScan Faucet](https://sepolia-faucet.basescan.org/) for gas
3. **Export private key**: From your test wallet (MetaMask → Account Details → Export)

::: warning Testnet Only
Never use mainnet private keys in `.env` files. Create a dedicated testnet wallet.
:::

## Services

The docker-compose setup includes:

| Service | Port | Description |
|---------|------|-------------|
| `api` | 3000 | AdRail API server |
| `postgres` | 5432 | Local PostgreSQL database |

## Commands

```bash
# Start everything
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down

# Rebuild after code changes
docker-compose build api
docker-compose up -d api

# Reset database
docker-compose down -v
docker-compose up -d
```

## Database Migrations

After starting, run migrations:

```bash
docker-compose exec api npm run db:migrate
```

## Testing Payments

With testnet configured:

```bash
# Create an ad slot
curl -X POST http://localhost:3000/v1/slots \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "test-agent",
    "slot_type": "banner",
    "price_per_view": "0.001"
  }'

# Request an ad (x402 payment required)
curl http://localhost:3000/v1/ads/request \
  -H "X-402-Payment: ..." \
  -d '{"slot_id": "..."}'
```

## Troubleshooting

### Database connection errors
```bash
# Check postgres is running
docker-compose ps postgres

# Check logs
docker-compose logs postgres
```

### Port already in use
```bash
# Change port in docker-compose.yml
ports:
  - "3001:3000"  # Map to different host port
```

### Build failures
```bash
# Clean rebuild
docker-compose build --no-cache api
```

## Production Deployment

For production, use:
- Neon or managed Postgres (not local container)
- Base Mainnet RPC and wallet
- Environment variables via secrets manager

See [Deployment Guide](/guide/deployment) for production setup.
