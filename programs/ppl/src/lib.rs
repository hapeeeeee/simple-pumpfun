use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    metadata::{
        create_metadata_accounts_v3, mpl_token_metadata::types::DataV2, CreateMetadataAccountsV3,
        Metadata as Metaplex,
    },
    token::{burn, mint_to, Burn, Mint, MintTo, Token, TokenAccount},
};
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
        let seeds = &["mint".as_bytes(), params.id.as_bytes(), &[ctx.bumps.mint]];
        let signer = [&seeds[..]];

        mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    authority: ctx.accounts.mint.to_account_info(),
                    to: ctx.accounts.destination.to_account_info(),
                    mint: ctx.accounts.mint.to_account_info(),
                },
                &signer,
            ),
            params.quantity,
        )?;

        Ok(())
    }

    pub fn burn_tokens(ctx: Context<BurnTokens>, params: BurnTokenParams) -> Result<()> {
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_accounts = Burn {
            mint: ctx.accounts.mint.to_account_info(),
            from: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.payer.to_account_info(),
        };

        let seeds = &["mint".as_bytes(), params.id.as_bytes(), &[ctx.bumps.mint]];
        let signer = [&seeds[..]];

        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, &signer);
        burn(cpi_ctx, params.quantity)?;

        // let pool = &mut ctx.accounts.pool;
        // pool.total_supply -= params.quantity;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(params: BurnTokenParams)]
pub struct BurnTokens<'info> {
    #[account(
        mut,
        seeds = [b"mint", params.id.as_bytes()],
        bump,
        mint::authority = mint,
    )]
    pub mint: Account<'info, Mint>,
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = payer
    )]
    pub token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

#[derive(Accounts)]
#[instruction(params: MintTokenParams)]
pub struct MintTokens<'info> {
    #[account(
        mut,
        seeds = [b"mint", params.id.as_bytes()],
        bump,
        mint::authority = mint,
    )]
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub destination: Account<'info, TokenAccount>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Debug, Clone)]
pub struct MintTokenParams {
    pub id: String,
    pub quantity: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Debug, Clone)]
pub struct BurnTokenParams {
    pub id: String,
    pub quantity: u64,
}
