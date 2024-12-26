use anchor_lang::prelude::*;


#[event]
pub struct EVENTCreateToken {
    pub name: String,
    pub symbol: String,
    pub uri: String,
    pub decimals: u8,
    pub mint: Pubkey,
    pub metadata_account: Pubkey,
    // ToDo: Id
}

#[event]
pub struct EVENTMintToken {
    pub mint: Pubkey,
    pub token_account: Pubkey,
    pub amount: u64,
}

#[event]
pub struct EVENTBurnToken {
    pub mint: Pubkey,
    pub token_account: Pubkey,
    pub amount: u64,
}


// #[event]
// pub struct EVENTInitialize {
//     pub fee: f64,
//     pub dex_configuration_account: Pubkey,
// }

// #[event]
// pub struct EVENTCreatePool {
//     pub creator: Pubkey,
//     pub mint: Pubkey,
//     pub bump: u8,
// }