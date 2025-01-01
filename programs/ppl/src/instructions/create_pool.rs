use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, mint_to, MintTo,Token, TokenAccount },
};
use crate::events::EVENTCreatePool;
use crate::state::LiquidityPoolAccount;
pub fn create_pool(ctx: Context<CreateLiquidityPool>, params: CreatePoolParams) -> Result<()> {
    let pool = &mut ctx.accounts.pool;

    pool.set_inner(LiquidityPool {
        creator: ctx.accounts.payer.key(),
        token: ctx.accounts.mint.key(),
        const_product: params.initial_token as u128 * params.initial_sol as u128 ,
        initial_token: params.initial_token,  
        initial_sol: params.initial_sol,
        reserve_token: params.reserve_token, 
        reserve_sol: params.reserve_sol,                 
        bump: ctx.bumps.pool,
    });

    if params.reserve_token > 0 {
        mint_to(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    authority: ctx.accounts.payer.to_account_info(),
                    to: ctx.accounts.pool_token_account.to_account_info(),
                    mint: ctx.accounts.mint.to_account_info(),
                },
            ),
            params.reserve_token,
        )?;
    }
    
    if params.reserve_sol > 0 {
        pool.transfer_sol_to_pool(
            &ctx.accounts.payer,
            &mut ctx.accounts.pool_sol_account,
            params.reserve_sol,
            &ctx.accounts.system_program,
        )?;
    }
    // pool.total_supply = ctx.accounts.mint.supply;

    emit!(
        EVENTCreatePool {
            const_product: pool.const_product,
            init_token: pool.initial_token,
            init_sol: pool.initial_sol,
            reserve_token: pool.reserve_token,
            reserve_sol: pool.reserve_sol,
            token_id: params.id,
            mint: ctx.accounts.mint.key(),
            pool: pool.key(),
            pool_token_account: ctx.accounts.pool_token_account.key(),
            txid: params.txid
        }
    );
    Ok(())
}


#[derive(Accounts)]
#[instruction(params: CreatePoolParams)]
pub struct CreateLiquidityPool<'info> {
    #[account(
        init,
        // Discriminator (8) + Pubkey (32) + Pubkey (32) + const_product (16) + initial_token (8)
        // + initial_sol (8)+ reserve_token (8) + reserve_sol (8) + Bump (1)
        space = 8 + 32 + 32 + 16 + 8 + 8 + 8 + 8 + 1,
        payer = payer,
        seeds = [b"pool", mint.key().as_ref()],
        bump,
    )]
    pub pool: Account<'info, LiquidityPool>,

    #[account(
        mut,
        seeds = [b"mint", params.id.as_bytes()],
        bump,
        mint::authority = payer,
    )]
    pub mint: Box<Account<'info, Mint>>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = pool
    )]
    pub pool_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        seeds = [b"pool_sol", mint.key().as_ref()],
        bump
    )]
    pub pool_sol_account: AccountInfo<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

#[account]
pub struct LiquidityPool {
    pub creator: Pubkey,    // Public key of the pool creator
    pub token: Pubkey,      // Public key of the token in the liquidity pool
    pub const_product: u128,// Initial amount of token
    pub initial_token: u64, // Initial amount of token
    pub initial_sol: u64,   // Initial amount of sol
    pub reserve_token: u64, // Reserve amount of token in the pool
    pub reserve_sol: u64,   // Reserve amount of sol_token in the pool
    pub bump: u8,           // Nonce for the program-derived address
}


#[derive(AnchorSerialize, AnchorDeserialize, Debug, Clone)]
pub struct CreatePoolParams {
    pub id: String,
    pub txid: String,
    pub initial_token: u64,
    pub initial_sol: u64,
    pub reserve_token: u64, 
    pub reserve_sol: u64   
}
