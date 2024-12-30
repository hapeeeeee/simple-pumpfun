use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{burn, mint_to, Burn, Mint, MintTo, Token, TokenAccount},
};
use crate::events::EVENTCreatePool;

pub fn create_pool(ctx: Context<CreateLiquidityPool>, params: CreatePoolParams) -> Result<()> {
    let pool = &mut ctx.accounts.pool;

    pool.set_inner(LiquidityPool {
        creator: ctx.accounts.payer.key(),
        token: ctx.accounts.mint.key(),
        total_supply: 0_u64,
        reserve_token: 0_u64,
        reserve_sol: 0_u64,
        bump: ctx.bumps.pool,
    });

    emit!(
        EVENTCreatePool {
            token_id: params.id,
            creator: ctx.accounts.payer.key(),
            mint: ctx.accounts.mint.key(),
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
        // Discriminator (8) + Pubkey (32) + Pubkey (32) + totalsupply (8)
        // + reserve one (8) + reserve two (8) + Bump (1)
        space = 8 + 32 + 32 + 8 + 8 + 8 + 1,
        payer = payer,
        seeds = [b"pool", mint.key().as_ref()],
        bump,
    )]
    pub pool: Box<Account<'info, LiquidityPool>>,

    #[account(
        mut,
        seeds = [b"mint", params.id.as_bytes()],
        bump,
        mint::authority = payer,
    )]
    pub mint: Box<Account<'info, Mint>>,

    #[account(
        init,
        payer = payer,
        associated_token::mint = mint,
        associated_token::authority = pool
    )]
    pub pool_token_account: Box<Account<'info, TokenAccount>>,

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
    pub total_supply: u64,  // Total supply of liquidity tokens
    pub reserve_token: u64, // Reserve amount of token in the pool
    pub reserve_sol: u64,   // Reserve amount of sol_token in the pool
    pub bump: u8,           // Nonce for the program-derived address
}


#[derive(AnchorSerialize, AnchorDeserialize, Debug, Clone)]
pub struct CreatePoolParams {
    pub id: String,
    pub txid: String,
}
