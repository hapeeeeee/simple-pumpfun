use anchor_lang::prelude::*;
use crate::errors::CustomError;
use crate::events::EVENTInitialize;

pub fn initialize(ctx: Context<InitializeConfiguration>, fees: f64) -> Result<()> {
    let dex_config = &mut ctx.accounts.dex_configuration_account;

    if fees < 0_f64 || fees > 100_f64 {
        return err!(CustomError::InvalidFee);
    }

    dex_config.set_inner(CurveConfiguration { fees: fees });
    emit!(
        EVENTInitialize {
            fee: fees,
            dex_configuration_account: dex_config.key(),
        }
    );
    Ok(())
}
#[derive(Accounts)]
pub struct InitializeConfiguration<'info> {
    #[account(
        init,
        space = 8 + 32 + 8,  // Discriminator (8) + f64 (8)
        payer = admin,
        seeds = [b"config"],
        bump,
    )]
    pub dex_configuration_account: Box<Account<'info, CurveConfiguration>>,

    #[account(mut)]
    pub admin: Signer<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct CurveConfiguration {
    pub fees: f64,
}
