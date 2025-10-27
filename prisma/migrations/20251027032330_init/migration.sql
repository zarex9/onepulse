-- CreateTable
CREATE TABLE "gm_stats_by_address" (
    "address" VARCHAR(42) NOT NULL,
    "chainId" INTEGER NOT NULL DEFAULT 8453,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "highestStreak" INTEGER NOT NULL DEFAULT 0,
    "allTimeGmCount" INTEGER NOT NULL DEFAULT 0,
    "lastGmDay" INTEGER NOT NULL DEFAULT 0,
    "lastTxHash" TEXT,
    "fid" BIGINT,
    "displayName" TEXT,
    "username" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gm_stats_by_address_pkey" PRIMARY KEY ("address")
);

-- CreateTable
CREATE TABLE "gm_events_by_address" (
    "id" TEXT NOT NULL,
    "address" VARCHAR(42) NOT NULL,
    "chainId" INTEGER NOT NULL DEFAULT 8453,
    "gmDay" INTEGER NOT NULL,
    "txHash" TEXT,
    "blockNumber" BIGINT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gm_events_by_address_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "gm_events_by_address_txHash_key" ON "gm_events_by_address"("txHash");

-- CreateIndex
CREATE INDEX "gm_events_by_address_address_gmDay_idx" ON "gm_events_by_address"("address", "gmDay");
