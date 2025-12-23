use spacetimedb::{ReducerContext, Table, Timestamp, reducer, table};

#[table(
    name = gm_stats_by_address,
    public,
    index(name = address_chainid, btree(columns = [address, chain_id])),
)]
#[derive(Debug, Clone)]
pub struct GmStatsByAddress {
    #[primary_key]
    address_chain: String,
    #[index(btree)]
    address: String,
    #[index(btree)]
    chain_id: i32,
    current_streak: i32,
    highest_streak: i32,
    all_time_gm_count: i32,
    last_gm_day: i32,
    last_tx_hash: Option<String>,
    fid: Option<i64>,
    display_name: Option<String>,
    username: Option<String>,
    #[index(btree)]
    updated_at: Timestamp,
}

#[table(
    name = gm_stats_by_address_v2,
    public,
    index(name = address_chainid, btree(columns = [address, chain_id])),
)]
#[derive(Debug, Clone)]
pub struct GmStatsByAddressV2 {
    #[primary_key]
    address_chain: String,
    #[index(btree)]
    address: String,
    #[index(btree)]
    chain_id: i32,
    current_streak: i32,
    highest_streak: i32,
    all_time_gm_count: i32,
    last_gm_day: i32,
    last_tx_hash: Option<String>,
    fid: Option<i64>,
    display_name: Option<String>,
    username: Option<String>,
    pfp_url: Option<String>,
    primary_wallet: Option<String>,
    #[index(btree)]
    updated_at: Timestamp,
}

fn pk_for(address: &str, chain_id: i32) -> String {
    format!("{}:{}", address, chain_id)
}

fn find_gm_stats(ctx: &ReducerContext, address_chain: &String) -> Option<GmStatsByAddressV2> {
    if let Some(stats) = ctx.db.gm_stats_by_address_v2().address_chain().find(address_chain) {
        return Some(stats);
    }

    if let Some(old_stats) = ctx
        .db
        .gm_stats_by_address()
        .address_chain()
        .find(address_chain)
    {
        let migrated_stats = GmStatsByAddressV2 {
            address_chain: old_stats.address_chain.clone(),
            address: old_stats.address.clone(),
            chain_id: old_stats.chain_id,
            current_streak: old_stats.current_streak,
            highest_streak: old_stats.highest_streak,
            all_time_gm_count: old_stats.all_time_gm_count,
            last_gm_day: old_stats.last_gm_day,
            last_tx_hash: old_stats.last_tx_hash.clone(),
            fid: old_stats.fid,
            display_name: old_stats.display_name.clone(),
            username: old_stats.username.clone(),
            pfp_url: None,
            primary_wallet: None,
            updated_at: old_stats.updated_at,
        };
        ctx.db.gm_stats_by_address_v2().insert(migrated_stats.clone());
        return Some(migrated_stats);
    }

    None
}

pub fn update_gm_stats(
    ctx: &ReducerContext,
    stats: GmStatsByAddressV2,
) {
    ctx.db.gm_stats_by_address().address_chain().update(
        GmStatsByAddress {
            address_chain: stats.address_chain.clone(),
            address: stats.address.clone(),
            chain_id: stats.chain_id,
            current_streak: stats.current_streak,
            highest_streak: stats.highest_streak,
            all_time_gm_count: stats.all_time_gm_count,
            last_gm_day: stats.last_gm_day,
            last_tx_hash: stats.last_tx_hash.clone(),
            fid: stats.fid,
            display_name: stats.display_name.clone(),
            username: stats.username.clone(),
            updated_at: stats.updated_at,
        }
    );
    ctx.db.gm_stats_by_address_v2().address_chain().update(
        stats
    );
}

#[reducer]
pub fn create_gm_stats(
    ctx: &ReducerContext,
    address: String,
    chain_id: i32,
    last_gm_day_onchain: i32,
    tx_hash: Option<String>,
    fid: Option<i64>,
    display_name: Option<String>,
    username: Option<String>,
    pfp_url: Option<String>,
    primary_wallet: Option<String>,
) {
    let addr = address.trim();
    let pk = pk_for(addr, chain_id);
    ctx.db.gm_stats_by_address().insert(GmStatsByAddress {
            address_chain: pk.clone(),
            address: addr.to_string(),
            chain_id,
            current_streak: 1,
            highest_streak: 1,
            all_time_gm_count: 1,
            last_gm_day: last_gm_day_onchain,
            last_tx_hash: tx_hash.clone(),
            fid,
            display_name: display_name.clone(),
            username: username.clone(),
            updated_at: ctx.timestamp,
        });
    ctx.db.gm_stats_by_address_v2().insert(GmStatsByAddressV2 {
            address_chain: pk.clone(),
            address: addr.to_string(),
            chain_id,
            current_streak: 1,
            highest_streak: 1,
            all_time_gm_count: 1,
            last_gm_day: last_gm_day_onchain,
            last_tx_hash: tx_hash.clone(),
            fid,
            display_name: display_name.clone(),
            username: username.clone(),
            pfp_url,
            primary_wallet,
            updated_at: ctx.timestamp,
        });
}


#[reducer]
pub fn report_gm(
    ctx: &ReducerContext,
    address: String,
    chain_id: i32,
    last_gm_day_onchain: i32,
    tx_hash: Option<String>,
    fid: Option<i64>,
    display_name: Option<String>,
    username: Option<String>,
    pfp_url: Option<String>,
    primary_wallet: Option<String>,
) -> Result<(), String> {
    let addr = address.trim();
    let pk = pk_for(addr, chain_id);
    if let Some(mut stats) = find_gm_stats(ctx, &pk) {
        if last_gm_day_onchain > stats.last_gm_day {
            let delta = last_gm_day_onchain - stats.last_gm_day;
            if delta == 1 {
                stats.current_streak += 1;
            } else {
                stats.current_streak = 1;
            }
            stats.highest_streak = stats.highest_streak.max(stats.current_streak);
            stats.all_time_gm_count += 1;
            stats.last_gm_day = last_gm_day_onchain;
        }

        stats.last_tx_hash = tx_hash.or(stats.last_tx_hash);
        stats.fid = fid.or(stats.fid);
        stats.display_name = display_name.or(stats.display_name);
        stats.username = username.or(stats.username);
        stats.pfp_url = pfp_url.or(stats.pfp_url);
        stats.primary_wallet = primary_wallet.or(stats.primary_wallet);
        stats.updated_at = ctx.timestamp;
        update_gm_stats(
            ctx, stats
        );
    } else {
        create_gm_stats(
            ctx,
            address,
            chain_id,
            last_gm_day_onchain,
            tx_hash,
            fid,
            display_name,
            username,
            pfp_url,
            primary_wallet,
        );
    }
    Ok(())
}
