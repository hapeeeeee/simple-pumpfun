use anchor_lang::prelude::*;

declare_id!("9kSWmDyFUrNjkxE41edjXkrJYLt1YD5XWMMpYqcPj9nc");

pub mod errors;
pub mod events;
pub mod instructions;
use instructions::*;

#[program]
mod spl {
    use super::*;

    pub fn create_token(_ctx: Context<CreateToken>, metadata: CreateTokenParams) -> Result<()> {
        create_token::create_token(_ctx, metadata)?;
        Ok(())
    }

    pub fn mint_tokens(ctx: Context<MintTokens>, params: MintTokenParams) -> Result<()> {
        mint_token::mint_tokens(ctx, params)?;
        Ok(())
    }

    pub fn burn_tokens(ctx: Context<BurnTokens>, params: BurnTokenParams) -> Result<()> {
        burn_token::burn_tokens(ctx, params)?;
        Ok(())
    }
}

