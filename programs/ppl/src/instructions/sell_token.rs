use std::{str::FromStr, thread::sleep, time::Duration};

use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
};
use crate::create_pool::LiquidityPool;
use crate::errors::CustomError;
use crate::state::LiquidityPoolAccount;
use crate::events::EVENTSellToken;


use crate::events::EVENTDebugInfo;

pub fn sell_token_base_sol(ctx: Context<SellTokens>, params: SellTokenParams) -> Result<()> {
    let pool = &mut ctx.accounts.pool;
    let sol_amount = params.amount;
    if pool.reserve_sol < sol_amount {
        return err!(CustomError::InsufficientSolInPool);
    }

    let new_sol_in_pool = pool.reserve_sol - sol_amount;
    let new_token_in_pool = (pool.const_product / new_sol_in_pool as u128) as u64;
    if new_sol_in_pool > pool.initial_token {
        return err!(CustomError::OverflowInitialToken);
    }

    let token_amount = new_token_in_pool - pool.reserve_token;

    // pool.transfer_sol_from_pool(
    //     &ctx.accounts.seller, 
    //     sol_amount, 
    //     &ctx.accounts.system_program
    // )?;

    // pool.transfer_token_to_pool(
    //     &ctx.accounts.destination, 
    //     &ctx.accounts.pool_token_account,
    //     token_amount, 
    //     &ctx.accounts.token_program
    // )?;
    
    pool.reserve_sol -= sol_amount;
    pool.reserve_token += token_amount;

    emit!(
        EVENTSellToken {
            token_account: ctx.accounts.pool_token_account.key(),
            sol_amount: sol_amount,
            token_amount: token_amount,
            token_id: params.id,
            txid: params.txid,
        }
    );

    Ok(())
}


pub fn sell_token_base_meme(ctx: Context<SellTokens>, params: SellTokenParams) -> Result<()> {

    let pool = &mut ctx.accounts.pool;
    
    let token_amount = params.amount;
             
    let new_token_in_pool = pool.reserve_token + token_amount;
    if new_token_in_pool > pool.initial_token {
        return err!(CustomError::OverflowInitialToken);
    }    
    let new_sol_in_pool = pool.const_product / new_token_in_pool as u128;
    
    if (pool.initial_sol + pool.reserve_sol < new_sol_in_pool as u64) {
        return err!(CustomError::InsufficientSolInPool);
    }
    let sol_amount = (pool.initial_sol + pool.reserve_sol) - new_sol_in_pool as u64;

    emit!(
        EVENTDebugInfo{
            info: String::from_str("11111111").unwrap()
        }
    );
    // sleep(Duration::from_secs(2));
    pool.transfer_sol_from_pool(
        &mut ctx.accounts.pool_sol_account,
        &mut ctx.accounts.payee, 
        sol_amount, 
        ctx.bumps.pool_sol_account,
        &ctx.accounts.system_program
    )?;

    // sleep(Duration::from_secs(2));
    pool.transfer_token_to_pool(
        &ctx.accounts.user_token_account, 
        &ctx.accounts.pool_token_account,
        token_amount, 
        &ctx.accounts.seller,
        &ctx.accounts.token_program
    )?;



    pool.reserve_sol -= sol_amount;
    pool.reserve_token += token_amount;

    emit!(
        EVENTSellToken {
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
#[instruction(params: SellTokenParams)]
pub struct SellTokens<'info> {
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = pool
    )]
    pub pool_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = seller
    )]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"pool_sol", mint.key().as_ref()],
        bump
    )]
    pub pool_sol_account: AccountInfo<'info>,

    #[account(mut)]
    pub payee: AccountInfo<'info>,

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
    pub seller: Signer<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Debug, Clone)]
pub struct SellTokenParams {
    pub id: String,
    pub amount: u64,
    pub txid: String,
}
