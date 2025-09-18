# Status Network L2 Bridge Subgraph

A comprehensive subgraph for monitoring Status Network L2 Bridge operations, including token bridging, message passing, faucet distributions, and contract upgrades.

## Overview

This subgraph tracks:
- **L2 Token Bridge**: Token bridging between L1 and L2
- **L2 Message Service**: Cross-chain message passing
- **L2 Faucet**: Token distributions
- **Proxy Contracts**: Contract upgrades and admin changes

## Example Queries

### Token Bridge Queries

#### Get recent bridging initiations
```graphql
{
  bridgingInitiatedV2S(first: 10, orderBy: timestamp, orderDirection: desc) {
    id
    sender
    recipient
    token
    amount
    timestamp
    blockNumber
    transactionHash
  }
}
```

#### Get recent bridging finalizations
```graphql
{
  bridgingFinalizedV2S(first: 10, orderBy: timestamp, orderDirection: desc) {
    id
    nativeToken
    bridgedToken
    amount
    recipient
    timestamp
    blockNumber
    transactionHash
  }
}
```

#### Get daily bridge statistics
```graphql
{
  dailyBridgeStatsS(first: 7, orderBy: date, orderDirection: desc) {
    id
    date
    totalBridgingInitiated
    totalBridgingFinalized
    bridgingInitiatedCount
    bridgingFinalizedCount
  }
}
```

### Message Service Queries

#### Get recent messages sent
```graphql
{
  messageSents(first: 10, orderBy: timestamp, orderDirection: desc) {
    id
    from
    to
    fee
    value
    nonce
    messageHash
    timestamp
    blockNumber
    transactionHash
  }
}
```

#### Get recent message claims
```graphql
{
  messageClaimeds(first: 10, orderBy: timestamp, orderDirection: desc) {
    id
    messageHash
    timestamp
    blockNumber
    transactionHash
  }
}
```

### Faucet Queries

#### Get recent token distributions
```graphql
{
  tokensDistributeds(first: 10, orderBy: timestamp, orderDirection: desc) {
    id
    recipient
    token
    amount
    timestamp
    blockNumber
    transactionHash
  }
}
```

#### Get recent native token distributions
```graphql
{
  nativeTokensDistributeds(first: 10, orderBy: timestamp, orderDirection: desc) {
    id
    recipient
    amount
    timestamp
    blockNumber
    transactionHash
  }
}
```

### Proxy Contract Queries

#### Get contract upgrades
```graphql
{
  proxyUpgradeds(first: 10, orderBy: timestamp, orderDirection: desc) {
    id
    proxyAddress
    oldImplementation
    newImplementation
    timestamp
    blockNumber
    transactionHash
  }
}
```

#### Get admin changes
```graphql
{
  adminChangeds(first: 10, orderBy: timestamp, orderDirection: desc) {
    id
    proxyAddress
    previousAdmin
    newAdmin
    timestamp
    blockNumber
    transactionHash
  }
}
```

## Network

- **Network**: Status Sepolia
- **Subgraph**: `status-network-bridge`

## Development

```bash
# Install dependencies
npm install

# Generate types
npm run codegen

# Build subgraph
npm run build

# Deploy locally
npm run deploy-local

# Deploy to The Graph Studio
npm run deploy
```
