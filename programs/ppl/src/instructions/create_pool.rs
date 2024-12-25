use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    metadata::{
        create_metadata_accounts_v3, mpl_token_metadata::types::DataV2, CreateMetadataAccountsV3,
        Metadata as Metaplex,
    },
    token::{burn, mint_to, Burn, Mint, MintTo, Token, TokenAccount},
};
use crate::events::EVENTCreatePool;

pub fn create_pool(ctx: Context<CreateLiquidityPool>) -> Result<()> {
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
            creator: ctx.accounts.payer.key(),
            mint: ctx.accounts.mint.key(),
            bump: ctx.bumps.pool
        }
    );

    Ok(())
}


#[derive(Accounts)]
pub struct CreateLiquidityPool<'info> {
    #[account(
        init,
        // Discriminator (8) + Pubkey (32) + Pubkey (32) + totalsupply (8)
        // + reserve one (8) + reserve two (8) + Bump (1)
        space = 8 + 32 + 32 + 8 + 8 + 8 + 1,
        payer = payer,
        seeds = [b"pool", mint.key().as_ref()],
        bump
    )]
    pub pool: Box<Account<'info, LiquidityPool>>,

    #[account(mut)]
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


#[derive(AnchorSerialize, AnchorDeserialize, Debug, Clone)]
pub struct InitTokenParams {
    pub name: String,
    pub symbol: String,
    pub uri: String,
    pub decimals: u8,
    pub id: String,
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
