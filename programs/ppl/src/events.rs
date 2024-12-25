use anchor_lang::prelude::*;

#[event]
pub struct EVENTInitialize {
    pub fee: f64,
    pub dex_configuration_account: Pubkey,
}

#[event]
pub struct EVENTCreateToken {
    pub name: String,
    pub symbol: String,
    pub uri: String,
    pub decimals: u8,
}

#[event]
pub struct EVENTCreatePool {
    pub creator: Pubkey,
    pub mint: Pubkey,
    pub bump: u8,
}