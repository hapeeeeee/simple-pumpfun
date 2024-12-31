use std::str::FromStr;

use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Mint, Token, TokenAccount, burn, Burn,},
};
use crate::create_pool::LiquidityPool;
use crate::errors::CustomError;
use crate::state::LiquidityPoolAccount;
use crate::events::EVENTBuyToken;


pub fn buy_token_base_sol(ctx: Context<BuyTokens>, params: BuyTokenParams) -> Result<()> {

    let pool = &mut ctx.accounts.pool;

    let sol = params.amount;
    let meme = params.amount * 100 as u64;

    if meme > pool.reserve_token {
        return err!(CustomError::NotEnoughTokenInVault);
    }

    pool.transfer_sol_to_pool(
        &ctx.accounts.buyer, 
        sol, 
        &ctx.accounts.system_program
    )?;


    pool.transfer_token_from_pool(
        &ctx.accounts.pool_token_account,
        &ctx.accounts.destination, 
        meme, 
        &ctx.accounts.token_program
    )?;
    
    pool.reserve_sol += sol;
    pool.reserve_token -= meme;

    emit!(
        EVENTBuyToken {
            token_account: ctx.accounts.pool_token_account.key(),
            sol_amount: sol,
            meme_amount: meme,
            token_id: params.id,
            txid: params.txid,
        }
    );

    Ok(())
}


pub fn buy_token_base_meme(ctx: Context<BuyTokens>, params: BuyTokenParams) -> Result<()> {

    let pool = &mut ctx.accounts.pool;

    let sol = params.amount / 100 as u64;
    let meme = params.amount;

    if meme > pool.reserve_token {
        return err!(CustomError::NotEnoughTokenInVault);
    }

    pool.transfer_sol_to_pool(
        &ctx.accounts.buyer, 
        sol, 
        &ctx.accounts.system_program
    )?;


    pool.transfer_token_from_pool(
        &ctx.accounts.pool_token_account,
        &ctx.accounts.destination, 
        meme, 
        &ctx.accounts.token_program
    )?;
    
    pool.reserve_sol += sol;
    pool.reserve_token -= meme;

    emit!(
        EVENTBuyToken {
            token_account: ctx.accounts.pool_token_account.key(),
            sol_amount: sol,
            meme_amount: meme,
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
