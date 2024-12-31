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
    pub meme_amount: u64,
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
    pub init_sol: u64,
    pub init_meme: u64, 
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
pub struct EVENTSwapIn {
    pub payer_account: Pubkey,
    pub amount_in: u64,
    pub minimum_amount_out: u64,
    pub note: String,
}

#[event]
pub struct EVENTSwapOut {
    pub payer_account: Pubkey,
    pub max_amount_in: u64,
    pub amount_out: u64,
    pub note: String,
}
