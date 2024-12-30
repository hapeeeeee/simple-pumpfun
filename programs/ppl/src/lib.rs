use anchor_lang::prelude::*;

declare_id!("EaHoDFV3PCwUEFjU6b5U4Y76dW5oP7Bu1ndga8WgksFU");

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

    pub fn proxy_initialize(
        ctx: Context<ProxyInitialize>,
        init_amount_0: u64,
        init_amount_1: u64,
        open_time: u64,
    ) -> Result<()> {
        proxy_initialize::proxy_initialize(ctx, init_amount_0, init_amount_1, open_time)?;
        Ok(())
    }

    pub fn proxy_deposit(
        ctx: Context<ProxyDeposit>,
        init_amount_0: u64,
        init_amount_1: u64,
        open_time: u64,
    ) -> Result<()> {
        proxy_deposit::proxy_deposit(ctx, init_amount_0, init_amount_1, open_time)?;
        Ok(())
    }

    pub fn proxy_swap_base_input(
        ctx: Context<ProxySwapBaseInput>,
        amount_in: u64,
        minimum_amount_out: u64,
    ) -> Result<()> {
        proxy_swap_base_input::proxy_swap_base_input(ctx, amount_in, minimum_amount_out)?;
        Ok(())
    }

    pub fn proxy_swap_base_output(
        ctx: Context<ProxySwapBaseOutput>,
        max_amount_in: u64,
        amount_out: u64,
    ) -> Result<()> {
        proxy_swap_base_output::proxy_swap_base_output(ctx, max_amount_in, amount_out)?;
        Ok(())
    }

    // ToDo: Swap A->B B->A
}

