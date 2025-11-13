---
title: Real-Time Update Architecture Specification
version: 1.0
date_created: 2025-11-13
last_updated: 2025-11-13
owner: OnePulse Development Team
tags: [infrastructure, architecture, realtime, database, spacetimedb]
---

## Overview

## 1. Purpose & Scope

This specification defines the real-time update architecture for OnePulse, a Farcaster Mini App that tracks daily "GM" statements across multiple blockchain networks (Base, Celo, Optimism). The architecture enables live synchronization of user statistics (streaks, GM counts, rewards) between the SpacetimeDB backend and React frontend clients.

**Intended Audience:** Backend developers, frontend developers, DevOps engineers, and AI systems implementing or extending the real-time data system.

**Scope:** This specification covers:

- Client-server WebSocket communication via SpacetimeDB
- Database schema and indexing strategy
- Subscription and query patterns
- Data synchronization and conflict resolution
- Fallback mechanisms for connection failures
- React hook integration and state management

**Out of Scope:** Smart contract interactions, blockchain transaction processing, Farcaster SDK integration, and user authentication flow.

---

## 2. Definitions

| Term | Definition |
|------|-----------|
| **SpacetimeDB** | A relational database system that executes application logic inside the database and supports real-time subscriptions via WebSocket |
| **DbConnection** | TypeScript client instance that represents a WebSocket connection to SpacetimeDB and provides access to tables, reducers, and subscriptions |
| **Reducer** | Server-side function (Rust) that modifies database state and is called from the client |
| **Table** | SpacetimeDB relation (similar to SQL table) that stores structured data with primary keys and indexes |
| **Subscription** | Client request to receive real-time updates for a specific SQL query; changes trigger callbacks |
| **Snapshot** | Current state of a subscription query result at a specific moment in time |
| **Fallback** | HTTP API endpoint that provides data when real-time subscription is unavailable or slow |
| **GmStatsByAddress** | Primary table storing per-user streak counts, GM counts, and metadata indexed by address and chain_id |
| **Composite Primary Key** | `address:chain_id` - unique identifier combining wallet address and blockchain chain ID |

---

## 3. Requirements, Constraints & Guidelines

### Functional Requirements

- **REQ-001**: System SHALL establish persistent WebSocket connection from client to SpacetimeDB on app initialization
- **REQ-002**: System SHALL subscribe to `gm_stats_by_address` table for authenticated user's wallet address
- **REQ-003**: System SHALL reflect database updates in React components within 100-500ms of server state change
- **REQ-004**: System SHALL support multi-address queries (all chains for a single address)
- **REQ-005**: System SHALL execute `report_gm` reducer to update streak calculations after on-chain transaction
- **REQ-006**: System SHALL prevent duplicate subscriptions for the same address
- **REQ-007**: System SHALL maintain client-side snapshot of subscription data for rapid UI updates
- **REQ-008**: System SHALL notify UI components when subscription becomes ready (data first received)

### Data Integrity & Consistency

- **CON-001**: Primary key format MUST be `{lowercase_address}:{chain_id}` (e.g., `0xabc123:8453`)
- **CON-002**: Address field MUST be stored in lowercase for consistent querying and deduplication
- **CON-003**: Chain ID MUST be one of: 8453 (Base), 42220 (Celo), 10 (Optimism)
- **CON-004**: Streak calculations MUST use on-chain `last_gm_day` value as source of truth
- **CON-005**: `current_streak` SHALL reset to 1 if gap between `last_gm_day` values exceeds 1 day
- **CON-006**: `highest_streak` MUST never decrease; it tracks the maximum `current_streak` ever recorded

### Performance & Reliability

- **PER-001**: Initial subscription response time MUST be < 2 seconds
- **PER-002**: Individual table updates (insert/update/delete) MUST be applied within 500ms
- **PER-003**: Client-side snapshot caching MUST be enabled to reduce server load
- **PER-004**: Fallback HTTP endpoint MUST return results within 1 second
- **PER-005**: Concurrent subscriptions per client MUST NOT exceed 10
- **PER-006**: Connection pool MUST maintain singleton DbConnection per application instance (SSR-unsafe)

### Fallback & Resilience

- **RES-001**: System SHALL implement HTTP fallback when subscription unavailable or delayed
- **RES-002**: Fallback MUST trigger if subscription not ready after 2 seconds (configurable)
- **RES-003**: Fallback data MUST be refreshed at most every 2 seconds to avoid rate limiting
- **RES-004**: System SHALL handle connection disconnections gracefully and attempt auto-reconnect
- **RES-005**: System SHALL clear cached data on address change to prevent stale data display

### Security & Access Control

- **SEC-001**: All client-server communication MUST use WebSocket Secure (WSS) in production
- **SEC-002**: Authentication token MUST be persisted in `localStorage` after connection established
- **SEC-003**: Reducer calls MUST validate caller identity and authorization (handled by SpacetimeDB)
- **SEC-004**: SQL queries in subscriptions MUST use direct WHERE conditions (no string interpolation in SQL)
- **SEC-005**: Personal data (FID, username, display_name) MUST only be read/written by authorized users

### Guidelines

- **GUD-001**: Always use `useSyncExternalStore` for server state subscriptions in React components
- **GUD-002**: Normalize addresses to lowercase before querying for consistency
- **GUD-003**: Implement proper loading/ready states in UI; never assume subscription is ready
- **GUD-004**: Use React `useEffect` to manage subscription lifecycle tied to address prop changes
- **GUD-005**: Implement proper cleanup in `useEffect` return functions to prevent memory leaks
- **GUD-006**: Avoid direct mutation of snapshot data; treat it as immutable
- **GUD-007**: Log connection state changes (connect, disconnect, error) for debugging

---

## 4. Interfaces & Data Contracts

### 4.1 SpacetimeDB Table Schema

#### GmStatsByAddress Table

```rust
#[table(
    name = gm_stats_by_address,
    public,
    index(name = address_chainid, btree(columns = [address, chain_id]))
)]
pub struct GmStatsByAddress {
    #[primary_key]
    address_chain: String,        // Composite key: "0xabc123:8453"
    
    #[index(btree)]
    address: String,              // Wallet address (lowercase)
    
    #[index(btree)]
    chain_id: i32,                // Blockchain ID (8453, 42220, 10)
    
    current_streak: i32,          // Consecutive days of GM
    highest_streak: i32,          // Maximum streak ever achieved
    all_time_gm_count: i32,       // Total GMs across all time
    last_gm_day: i32,             // Last day timestamp (Unix seconds)
    
    last_tx_hash: Option<String>, // Most recent transaction hash
    fid: Option<i64>,             // Farcaster ID (optional)
    display_name: Option<String>, // User's display name (optional)
    username: Option<String>,     // User's Farcaster username (optional)
    
    updated_at: Timestamp,        // Last modification timestamp
}
```

### 4.2 Reducer Interface

#### report_gm Reducer

**Purpose:** Update user GM statistics after on-chain transaction confirmation

**Signature (Rust):**

```rust
#[reducer]
pub fn report_gm(
    ctx: &ReducerContext,
    address: String,              // User's wallet address
    chain_id: i32,                // Blockchain ID
    last_gm_day_onchain: i32,     // On-chain value (source of truth)
    tx_hash: Option<String>,      // Transaction hash
    fid: Option<i64>,             // Farcaster ID
    display_name: Option<String>, // Display name
    username: Option<String>,     // Username
) -> Result<(), String>
```

**Call from TypeScript:**

```typescript
connection.reducers.reportGm(
  "0xabc123...",    // address
  8453,             // chainId
  12345,            // lastGmDay
  "0xhash...",      // txHash
  12345n,           // fid
  "Alice",          // displayName
  "alice"           // username
);
```

**Behavior:**

- If no existing record exists, create one with `current_streak = 1`
- If record exists:
  - If `last_gm_day_onchain > last_gm_day`:
    - If delta = 1 day: increment `current_streak`
    - If delta > 1 day: reset `current_streak` to 1
    - Update `highest_streak` if new streak exceeds it
    - Increment `all_time_gm_count`
  - If `last_gm_day_onchain == last_gm_day`: no changes (duplicate call)

### 4.3 Subscription Query Patterns

#### Subscribe to All Records (Initial Connection)

```typescript
connection.subscriptionBuilder()
  .subscribe(["SELECT * FROM gm_stats_by_address"])
```

#### Subscribe to User's Address

```typescript
connection.subscriptionBuilder()
  .subscribe([
    `SELECT * FROM gm_stats_by_address WHERE address = '${address.toLowerCase()}'`
  ])
```

### 4.4 DbConnection Configuration

**TypeScript Interface:**

```typescript
interface DbConnectionBuilder {
  withUri(uri: string): DbConnectionBuilder;           // WebSocket URI
  withModuleName(name: string): DbConnectionBuilder;   // SpacetimeDB module
  withToken(token: string): DbConnectionBuilder;       // Auth token
  onConnect(callback: (conn, identity, token) => void): DbConnectionBuilder;
  onDisconnect(callback: () => void): DbConnectionBuilder;
  onConnectError(callback: (ctx, error) => void): DbConnectionBuilder;
  build(): DbConnection;
}
```

**Environment Variables:**

```bash
SPACETIMEDB_HOST=wss://your-spacetimedb-host.com
SPACETIMEDB_MODULE=onepulse
SPACETIMEDB_TOKEN=<optional-auth-token>
```

---

## 5. Acceptance Criteria

- **AC-001**: Given a connected client, When a user is viewing their GM stats, Then the UI reflects database updates within 500ms of server state change

- **AC-002**: Given an address subscription is not ready, When 2 seconds elapse, Then the system SHALL fetch fallback data via HTTP and display it to the user

- **AC-003**: Given a user with existing stats, When `report_gm` reducer is called with `last_gm_day_onchain = prev + 1`, Then `current_streak` SHALL increment by 1

- **AC-004**: Given a user with `current_streak = 5`, When `report_gm` reducer is called with `last_gm_day_onchain = prev + 2`, Then `current_streak` SHALL reset to 1

- **AC-005**: Given duplicate `report_gm` calls with identical `last_gm_day_onchain`, When second call executes, Then stats SHALL NOT change

- **AC-006**: Given a client disconnects, When reconnection occurs, Then subscriptions SHALL be automatically re-established within 1 second

- **AC-007**: Given multiple chains (Base, Celo, Optimism), When querying stats for a single address, Then system SHALL return separate records per chain, keyed by composite primary key

- **AC-008**: Given a component using `useGmStats(address, chainId)`, Then it SHALL return `isReady` flag indicating subscription state

- **AC-009**: Given subscription ready state changes, When `isReady` changes from false to true, Then all subscribed components SHALL re-render with live data

- **AC-010**: Given multiple browser tabs open, When both tabs load the same app, Then each tab SHALL maintain independent DbConnection instance (no cross-tab connection sharing)

---

## 6. Test Automation Strategy

### Unit Tests

- **Test Reducer Logic:** Verify streak calculations for all edge cases (consecutive days, gaps, duplicates)
- **Test Subscription Snapshot:** Verify snapshot updates correctly when table records change
- **Test Address Normalization:** Verify lowercase conversion and deduplication

### Integration Tests

- **Test DbConnection Lifecycle:** Establish, subscribe, update, disconnect
- **Test Fallback Mechanism:** Verify HTTP fallback triggers when subscription delayed
- **Test Multi-Address Queries:** Verify correct records returned for address + chain combinations

### End-to-End Tests

- **Test Full User Flow:** Connect → Subscribe → Report GM → Verify UI update
- **Test Reconnection:** Disconnect network → Verify auto-reconnect → Verify data consistency
- **Test Concurrent Subscriptions:** Multiple addresses subscribed simultaneously

### Test Frameworks & Tools

- **Unit/Integration:** Jest with Rust test modules
- **E2E:** Playwright or Cypress targeting local SpacetimeDB instance
- **Performance:** k6 or Locust for subscription load testing
- **CI/CD:** GitHub Actions with automated test suite

---

## 7. Rationale & Context

### Why SpacetimeDB?

SpacetimeDB was chosen for OnePulse because:

1. **Real-time capabilities:** Native WebSocket support for subscriptions without polling
2. **Reduced complexity:** Application logic colocated with data (Rust reducers in database)
3. **Scalability:** Eliminates separate application server layer
4. **Developer experience:** TypeScript client generation from Rust schema

### Why Composite Primary Key?

The `address:chain_id` composite key design:

- Enables efficient lookups by address AND chain together
- Prevents duplicate records per chain per address
- Simplifies B-tree indexing on both columns
- Maintains referential integrity without foreign keys

### Why Fallback HTTP Endpoint?

Real-time subscriptions may be unavailable due to:

- Network latency during initial WebSocket handshake
- User with slow/unstable connection
- SpacetimeDB temporary unavailability

The fallback ensures UX consistency by fetching server data via HTTP while subscription establishes.

### Why Client-Side Snapshot Caching?

- **Performance:** React re-renders use cached snapshot without waiting for server
- **Responsiveness:** UI updates appear instant (optimistic updates)
- **Resilience:** Display last-known state if connection drops temporarily

---

## 8. Dependencies & External Integrations

### External Systems

- **EXT-001**: SpacetimeDB Server - Relational database with real-time subscriptions via WebSocket
  - Integration Type: WebSocket (WSS in production)
  - Required Capabilities: Table storage, indexing, reducers, subscription streaming
  - SLA: 99.5% uptime required for production

### Third-Party Services

- **SVC-001**: SpacetimeDB Hosting (e.g., Managed SpacetimeDB or Self-Hosted)
  - Required Capabilities: Multi-region deployment, automatic failover, monitoring
  - Backup & Recovery: Daily snapshots with 30-day retention

### Infrastructure Dependencies

- **INF-001**: WebSocket Infrastructure - Must support persistent connections from browsers
  - Requirement: Allow WSS (WebSocket Secure) on port 443 or custom ports
  - CDN Compatibility: CDNs must support WebSocket pass-through

- **INF-002**: Database Storage - Persistent storage for table data
  - Capacity: Minimum 10GB initial, auto-scaling for growth
  - Backup: Automated daily backups with point-in-time recovery

### Technology Platform Dependencies

- **PLT-001**: Node.js Runtime (Frontend)
  - Requirement: Node.js 18+ or Bun runtime for development
  - Constraint: Client libraries must support ES2022 or later

- **PLT-002**: Rust Runtime (Backend Reducers)
  - Requirement: Rust 1.70+ for compiling SpacetimeDB modules
  - Constraint: Must be compatible with SpacetimeDB 1.6+

### Data Dependencies

- **DAT-001**: On-Chain Transaction Data
  - Source: Ethereum-compatible blockchains (Base, Celo, Optimism)
  - Requirement: Must provide confirmed `last_gm_day` from smart contract state
  - Frequency: Per transaction (on-demand)

---

## 9. Examples & Edge Cases

### Example 1: Successful GM Report Flow

```typescript
// User says GM on Base blockchain
const txHash = "0xabc...";
const lastGmDay = 19000;  // Days since epoch

// Call reducer to update stats
gmStatsByAddressStore.reportGm({
  address: "0x123abc...",
  chainId: 8453,
  lastGmDay,
  txHash,
  fid: 12345n,
  displayName: "Alice",
  username: "alice"
});

// SpacetimeDB updates table:
// If previous last_gm_day was 18999:
// - current_streak increments by 1
// - all_time_gm_count increments
// - highest_streak updates if needed
// - updated_at set to current timestamp

// React component re-renders with new data
const { stats, isReady } = useGmStats("0x123abc...", 8453);
// stats.currentStreak = 5 (for example)
```

### Example 2: Duplicate GM Report (Same Day)

```typescript
// User accidentally calls report_gm twice with same data
gmStatsByAddressStore.reportGm({
  address: "0x123abc...",
  chainId: 8453,
  lastGmDay: 19000,  // Same as previous call
  txHash: "0xdef...",
  fid: 12345n,
  displayName: "Alice",
  username: "alice"
});

// SpacetimeDB comparison:
// if (19000 > 19000) is FALSE
// → No changes to streak or counts
// → Prevents double-counting
```

### Example 3: Multi-Day Gap (Streak Reset)

```typescript
// User missed 2 days, then says GM on day 19002
gmStatsByAddressStore.reportGm({
  address: "0x123abc...",
  chainId: 8453,
  lastGmDay: 19002,
  txHash: "0xghi...",
  fid: 12345n,
  displayName: "Alice",
  username: "alice"
});

// SpacetimeDB calculation:
// delta = 19002 - 19000 = 2 days
// if (delta == 1) is FALSE → current_streak = 1
// highest_streak UNCHANGED (not reset, only tracks max)
```

### Example 4: Fallback HTTP Fetch Trigger

```typescript
// User navigates to stats page
// Subscription takes > 2 seconds to apply (slow network)

// useGmStatsFallback triggers HTTP fetch
const response = await fetch("/api/gm/stats?address=0x123abc...&chainId=8453");
const fallbackData = await response.json();
// { currentStreak: 5, highestStreak: 12, allTimeGmCount: 42, lastGmDay: 19000 }

// UI displays fallback data while subscription loads in background
// Once subscription ready, UI switches to live data
// Fallback prevents "loading" state from persisting
```

### Example 5: Multi-Chain Query

```typescript
// User queries stats across all chains
const { stats } = useGmStats("0x123abc...");  // No chainId specified

// Subscription: SELECT * FROM gm_stats_by_address WHERE address = '0x123abc...'
// Returns multiple records:
// [
//   { address: "0x123abc...", chain_id: 8453, current_streak: 5, ... },  // Base
//   { address: "0x123abc...", chain_id: 42220, current_streak: 3, ... }, // Celo
//   { address: "0x123abc...", chain_id: 10, current_streak: 1, ... }     // Optimism
// ]

// Component receives stats aggregated across all chains
```

### Example 6: Connection Failure & Reconnection

```typescript
// WebSocket disconnects (network issue)
connectionStatus.isConnected = false;
connectionStatus.isSubscribed = false;

// onDisconnect callback triggered
notifyConnectionDisconnected();

// UI shows "connecting..." indicator

// DbConnection auto-reconnects after delay
// onConnect callback re-establishes subscription
// Snapshot restored from server
// UI returns to live data

// User experiences brief "reconnecting" message, data resumes updating
```

### Example 7: Address Change Clears Old Data

```typescript
// User switches from viewing wallet A to wallet B
useEffect(() => {
  if (!address) return;
  
  // Old subscription for address A is cleared
  // New subscription for address B is started
  gmStatsByAddressStore.refreshForAddress(address);
  
  // cachedSnapshot reset to []
  // New data fetched for address B
  // UI does not show stale data from A
}, [address]);
```

### Edge Case: Concurrent Subscriptions Same Address

```typescript
// Component A requests subscription to address X
gmStatsByAddressStore.subscribeToAddress("0x123...");

// Component B simultaneously requests subscription to same address
gmStatsByAddressStore.subscribeToAddress("0x123...");

// Store logic prevents duplicate subscriptions:
// if (this.subscribedAddress?.toLowerCase() === addr && this.subscriptionReady) {
//   return;  // Already subscribed
// }

// Only ONE subscription to SpacetimeDB is created
// Both components receive updates from same snapshot
```

---

## 10. Validation Criteria

To validate compliance with this specification, the following checks MUST pass:

| Criterion | Validation Method | Pass Criteria |
|-----------|------------------|---------------|
| **Table Schema** | Inspect `server/src/lib.rs` | All fields match specification; indexes present; primary key composite format correct |
| **Subscription Queries** | Review code in `stores/gm-store.ts` | Queries use WHERE clause with address; no string interpolation in dynamic SQL |
| **Reducer Logic** | Test `report_gm` function | Streak calculations correct; no double-counting; proper primary key handling |
| **Client Connection** | Test `connection-factory.ts` | Singleton pattern enforced; token persistence in localStorage; error handlers defined |
| **React Hook Integration** | Audit `hooks/use-gm-stats.ts` | Uses `useSyncExternalStore`; manages subscriptions in useEffect; proper cleanup |
| **Fallback Mechanism** | Test `use-gm-stats-internal.ts` | HTTP fallback triggers after 2 seconds; respects cache; no excessive polling |
| **Multi-Chain Support** | Query multiple chain IDs | Separate records returned; no cross-chain data pollution |
| **Performance** | Load test with k6 | Subscription response < 2s; table updates apply < 500ms; no connection timeouts |
| **Error Handling** | Trigger connection failures | Graceful degradation; retry logic; user-facing error messages; no uncaught exceptions |
| **Security** | Security audit | WSS used in production; authentication token required; SQL injection impossible |

---

## 11. Related Specifications & Further Reading

- [SpacetimeDB Official Documentation](https://spacetimedb.com/docs)
- [SpacetimeDB TypeScript Client API](https://spacetimedb.com/docs/SDKs/typescript-sdk)
- [React useSyncExternalStore Hook](https://react.dev/reference/react/useSyncExternalStore)
- [WebSocket API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [OnePulse Smart Contract Specification](./spec-design-daily-gm-contracts.md) (if available)
- [OnePulse Architecture Specification](./spec-architecture-system-overview.md) (if available)

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-13 | AI Assistant | Initial specification document |

---

## End of Real-Time Update Architecture Specification
