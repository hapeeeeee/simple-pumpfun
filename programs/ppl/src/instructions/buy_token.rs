use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
};
use crate::create_pool::LiquidityPool;
use crate::errors::CustomError;
use crate::state::LiquidityPoolAccount;
use crate::events::EVENTBuyToken;


pub fn buy_token_base_sol(ctx: Context<BuyTokens>, params: BuyTokenParams) -> Result<()> {

    let pool = &mut ctx.accounts.pool;

    let sol_amount = params.amount;

    let res1 = pool.const_product / (pool.initial_sol + pool.reserve_sol + sol_amount) as u128;
    let token_amount = (pool.reserve_token as u128 - res1) as u64;
    if token_amount > pool.reserve_token {
        return err!(CustomError::NotEnoughTokenInVault);
    }

    pool.transfer_sol_to_pool(
        &ctx.accounts.buyer, 
        sol_amount, 
        &ctx.accounts.system_program
    )?;


    pool.transfer_token_from_pool(
        &ctx.accounts.pool_token_account,
        &ctx.accounts.destination, 
        token_amount, 
        &ctx.accounts.token_program
    )?;
    
    pool.reserve_sol += sol_amount;
    pool.reserve_token -= token_amount;

    emit!(
        EVENTBuyToken {
            token_account: ctx.accounts.pool_token_account.key(),
            sol_amount: sol_amount,
            token_amount: token_amount,
            token_id: params.id,
            txid: params.txid,
        }
    );

    Ok(())
}


pub fn buy_token_base_meme(ctx: Context<BuyTokens>, params: BuyTokenParams) -> Result<()> {

    let pool = &mut ctx.accounts.pool;
    
    let token_amount = params.amount;
    let res1 = (pool.reserve_token - token_amount) - pool.initial_sol - pool.reserve_sol;
    let sol_amount = (pool.const_product / res1 as u128) as u64;

    if token_amount > pool.reserve_token {
        return err!(CustomError::NotEnoughTokenInVault);
    }

    pool.transfer_sol_to_pool(
        &ctx.accounts.buyer, 
        sol_amount, 
        &ctx.accounts.system_program
    )?;


    pool.transfer_token_from_pool(
        &ctx.accounts.pool_token_account,
        &ctx.accounts.destination, 
        token_amount, 
        &ctx.accounts.token_program
    )?;
    
    pool.reserve_sol += sol_amount;
    pool.reserve_token -= token_amount;

    emit!(
        EVENTBuyToken {
            token_account: ctx.accounts.pool_token_account.key(),
            sol_amount: sol_amount,
            token_amount: token_amount,
            token_id: params.id,
            txid: params.txid,
        }
    );

    Ok(())
}


#[derive(Accounts)]
#[instruction(params: BuyTokenParams)]
pub struct BuyTokens<'info> {
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = pool
    )]
    pub pool_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub destination: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"mint", params.id.as_bytes()],
        bump,
        mint::authority = payer,
    )]
    pub mint: Box<Account<'info, Mint>>,
    #[account(
        mut,
        seeds = [b"pool", mint.key().as_ref()],
        bump,
    )]
    pub pool: Account<'info, LiquidityPool>,
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut)]
    pub buyer: Signer<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Debug, Clone)]
pub struct BuyTokenParams {
    pub id: String,
    pub amount: u64,
    pub txid: String,
}
