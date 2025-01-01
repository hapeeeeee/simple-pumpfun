use anchor_lang::prelude::*;


#[event]
pub struct EVENTCreateToken {
    pub name: String,
    pub symbol: String,
    pub uri: String,
    pub decimals: u8,
    pub mint: Pubkey,
    pub metadata_account: Pubkey,
    pub token_id: String,
    pub txid: String,
}

#[event]
pub struct EVENTMintToken {
    pub mint: Pubkey,
    pub token_account: Pubkey,
    pub amount: u64,
    pub token_id: String,
    pub txid: String,
}

#[event]
pub struct EVENTBuyToken {
    pub token_account: Pubkey,
    pub sol_amount: u64,
    pub token_amount: u64,
    pub token_id: String,
    pub txid: String,
}

#[event]
pub struct EVENTBurnToken {
    pub mint: Pubkey,
    pub token_account: Pubkey,
    pub amount: u64,
    pub token_id: String,
    pub txid: String,
}


// #[event]
// pub struct EVENTInitialize {
//     pub fee: f64,
//     pub dex_configuration_account: Pubkey,
// }

#[event]
pub struct EVENTCreatePool {
    pub const_product: u128,
    pub init_token: u64,
    pub init_sol: u64,
    pub reserve_token: u64,
    pub reserve_sol: u64,
    pub token_id: String, 
    pub mint: Pubkey,
    pub pool: Pubkey,
    pub pool_token_account: Pubkey,
    pub txid: String,
}

#[event]
pub struct EVENTAddLiquidity {
    pub owner_account: Pubkey,
    pub lp_token_amount: u64,
    pub maximum_token_0_amount: u64,
    pub maximum_token_1_amount: u64,
    pub note: String,
}

#[event]
pub struct EVENTBuyInRaydium {
    pub payer_account: Pubkey,
    pub amount_in: u64,
    pub minimum_amount_out: u64,
    pub note: String,
}

#[event]
pub struct EVENTSellInRaydium {
    pub payer_account: Pubkey,
    pub amount_in: u64,
    pub minimum_amount_out: u64,
    pub note: String,
}
