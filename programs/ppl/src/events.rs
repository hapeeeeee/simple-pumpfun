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
    pub token_id: String, 
    pub creator: Pubkey,
    pub mint: Pubkey,
    pub txid: String,
}