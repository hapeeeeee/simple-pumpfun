use anchor_lang::prelude::*;

declare_id!("ijo8fHCzsMSbEsGfz8anAenQ2BdToa9SmMx15pRmomo");

pub mod errors;
pub mod events;
pub mod state;
pub mod instructions;
use instructions::*;

#[program]
pub mod spl {
    use super::*;

    pub fn create_token(_ctx: Context<CreateToken>, metadata: CreateTokenParams) -> Result<()> {
        create_token::create_token(_ctx, metadata)?;
        Ok(())
    }

    pub fn create_pool(ctx: Context<CreateLiquidityPool>, params: CreatePoolParams) -> Result<()> {
        create_pool::create_pool(ctx, params)?;
        Ok(())
    }

    pub fn mint_tokens(ctx: Context<MintTokens>, params: MintTokenParams) -> Result<()> {
        mint_token::mint_tokens(ctx, params)?;
        Ok(())
    }

    pub fn mint_tokens_batch<'c: 'info, 'info>(ctx: Context<'_, '_, 'c, 'info, MintTokensBatch<'info>>, params: MintTokenBatchParams) -> Result<()> {
        mint_token::mint_tokens_batch(ctx, params)?;
        Ok(())
    }

    pub fn mint_tokens_batch_with_create_ata<'c: 'info, 'info>(ctx: Context<'_, '_, 'c, 'info, MintTokensBatch<'info>>, params: MintTokenBatchParams) -> Result<()> {
        mint_token::mint_tokens_batch_with_create_ata(ctx, params)?;
        Ok(())
    }


    pub fn buy_tokens_base_sol(ctx: Context<BuyTokens>, params: BuyTokenParams) -> Result<()> {
        buy_token::buy_token_base_sol(ctx, params)?;
        Ok(())
    }

    pub fn buy_tokens_base_meme(ctx: Context<BuyTokens>, params: BuyTokenParams) -> Result<()> {
        buy_token::buy_token_base_meme(ctx, params)?;
        Ok(())
    }

    pub fn sell_tokens_base_meme(ctx: Context<SellTokens>, params: SellTokenParams) -> Result<()> {
        sell_token::sell_token_base_meme(ctx, params)?;
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
        lp_token_amount: u64,
        maximum_token_0_amount: u64,
        maximum_token_1_amount: u64,
        note: String,
    ) -> Result<()> {
        proxy_deposit::proxy_deposit(ctx, lp_token_amount, maximum_token_0_amount, maximum_token_1_amount, note)?;
        Ok(())
    }

    pub fn proxy_buy_in_raydium(
        ctx: Context<ProxyBuyInRaydium>,
        amount_in: u64,
        minimum_amount_out: u64,
        note: String,
    ) -> Result<()> {
        proxy_buy_in_raydium::proxy_buy_in_raydium(ctx, amount_in, minimum_amount_out, note)?;
        Ok(())
    }

    pub fn proxy_sell_in_raydium(
        ctx: Context<ProxySellInRaydium>,
        max_amount_in: u64,
        amount_out: u64,
        note: String,
    ) -> Result<()> {
        proxy_sell_in_raydium::proxy_sell_in_raydium(ctx, max_amount_in, amount_out, note)?;
        Ok(())
    }

    // ToDo: Swap A->B B->A
}

