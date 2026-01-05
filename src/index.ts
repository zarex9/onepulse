import { SenderError, schema, t, table } from "spacetimedb/server";

const stats = table(
  { name: "stats", public: true },
  {
    address: t.string().primaryKey(),
    current_streak: t.number(),
    highest_streak: t.number(),
    all_time_gm_count: t.number(),
    last_gm_day: t.u256(),
    updated_at: t.timestamp(),
  }
);

const spacetimedb = schema(stats);

function validateAddress(address: string) {
  if (!address) {
    throw new SenderError("Address must not be empty");
  }
}

function validateLastGmDay(last_gm_day: bigint) {
  if (!last_gm_day) {
    throw new SenderError("Last gm day must not be empty");
  }
  if (last_gm_day <= 0n) {
    throw new SenderError("Last gm day must be a positive integer");
  }
}

spacetimedb.reducer(
  "report",
  { address: t.string(), last_gm_day: t.u256() },
  (ctx, { address, last_gm_day }) => {
    validateAddress(address);
    validateLastGmDay(last_gm_day);
    const stats = ctx.db.stats.address.find(address);
    if (stats) {
      if (last_gm_day > stats.last_gm_day) {
        const delta = last_gm_day - stats.last_gm_day;
        if (delta === 1n) {
          stats.current_streak += 1;
        } else {
          stats.current_streak = 1;
        }
        stats.highest_streak = Math.max(
          stats.highest_streak,
          stats.current_streak
        );
        stats.all_time_gm_count += 1;
        stats.last_gm_day = last_gm_day;
        stats.updated_at = ctx.timestamp;
      }
    } else {
      ctx.db.stats.insert({
        address,
        current_streak: 1,
        highest_streak: 1,
        all_time_gm_count: 1,
        last_gm_day,
        updated_at: ctx.timestamp,
      });
    }
  }
);
