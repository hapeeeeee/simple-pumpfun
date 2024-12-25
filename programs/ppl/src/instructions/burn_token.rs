use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{burn, Burn, Mint, Token, TokenAccount},
};
use crate::events::EVENTBurnToken;

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

    emit!(
        EVENTBurnToken {
            mint: ctx.accounts.mint.key(),
            token_account: ctx.accounts.token_account.key(),
            amount: params.quantity
        }
    );

    Ok(())
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

#[derive(AnchorSerialize, AnchorDeserialize, Debug, Clone)]
pub struct BurnTokenParams {
    pub id: String,
    pub quantity: u64,
}