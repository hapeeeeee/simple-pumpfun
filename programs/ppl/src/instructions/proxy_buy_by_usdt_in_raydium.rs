use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};
use anchor_spl::{
  // token::{Token, TokenAccount},
  token_2022::{
      self,
      spl_token_2022::{
          self,
          extension::{
              transfer_fee::{TransferFeeConfig, MAX_FEE_BASIS_POINTS},
              ExtensionType, StateWithExtensions,
          },
      },
  }
};
use raydium_cp_swap::{
    cpi,
    program::RaydiumCpSwap,
    states::{AmmConfig, ObservationState, PoolState},
};
use crate::events::EVENTBuyInRaydium;

// #[error_code]
// enum ErrorCode {
//     #[msg("Not approved")]
//     NotApproved,
// }

#[derive(Accounts)]
pub struct ProxyBuyByUsdtInRaydium<'info> {
    pub cp_swap_program: Program<'info, RaydiumCpSwap>,
    /// The user performing the swap
    pub payer: Signer<'info>,

    #[account(mut)]
    pub user_got_meme: Box<InterfaceAccount<'info, TokenAccount>>,
  
    /// CHECK: pool vault and lp mint authority
    #[account(
      seeds = [
        raydium_cp_swap::AUTH_SEED.as_bytes(),
      ],
      seeds::program = cp_swap_program,
      bump,
    )]
    pub authority: UncheckedAccount<'info>,

    /// The factory state to read protocol fees
    #[account(address = usdt_wsol_pool_state.load()?.amm_config)]
    pub usdt_wsol_amm_config: Box<Account<'info, AmmConfig>>,

    /// The factory state to read protocol fees
    #[account(address = wsol_meme_pool_state.load()?.amm_config)]
    pub wsol_meme_amm_config: Box<Account<'info, AmmConfig>>,

    /// The program account of the pool in which the swap will be performed
    #[account(mut)]
    pub usdt_wsol_pool_state: AccountLoader<'info, PoolState>,

    #[account(mut)]
    pub wsol_meme_pool_state: AccountLoader<'info, PoolState>,

    /// The user token account for input token
    #[account(mut)]
    pub input_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    /// The user token account for output token
    #[account(mut)]
    pub output_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    /// The vault token account for input token
    #[account(
      mut,
      constraint = input_vault.key() == usdt_wsol_pool_state.load()?.token_0_vault || input_vault.key() == usdt_wsol_pool_state.load()?.token_1_vault
    )]
    pub input_vault: Box<InterfaceAccount<'info, TokenAccount>>,

    /// The vault token account for output token
    #[account(
      mut,
      constraint = output_vault.key() == wsol_meme_pool_state.load()?.token_0_vault || output_vault.key() == wsol_meme_pool_state.load()?.token_1_vault
    )]
    pub output_vault: Box<InterfaceAccount<'info, TokenAccount>>,

    /// SPL program for input token transfers
    pub input_token_program: Interface<'info, TokenInterface>,

    /// SPL program for output token transfers
    pub output_token_program: Interface<'info, TokenInterface>,

    /// The mint of input token
    #[account(
      address = input_vault.mint
    )]
    pub input_token_mint: Box<InterfaceAccount<'info, Mint>>,

    /// The mint of output token
    #[account(
      address = output_vault.mint
    )]
    pub output_token_mint: Box<InterfaceAccount<'info, Mint>>,
    /// The program account for the most recent oracle observation
    #[account(mut, address = usdt_wsol_pool_state.load()?.observation_key)]
    pub usdt_wsol_observation_state: AccountLoader<'info, ObservationState>,

    /// The program account for the most recent oracle observation
    #[account(mut, address = wsol_meme_pool_state.load()?.observation_key)]
    pub wsol_meme_observation_state: AccountLoader<'info, ObservationState>,
}

pub fn proxy_buy_by_usdt_in_raydium(
    ctx: Context<ProxyBuyByUsdtInRaydium>,
    amount_in: u64,
    minimum_amount_out: u64,
    note: String,
) -> Result<()> {
    // step1: need create a wsol token account to accept wsol
    // output_token_account
    let usdt_wsol_cpi_accounts = cpi::accounts::Swap {
        payer: ctx.accounts.payer.to_account_info(),
        authority: ctx.accounts.authority.to_account_info(),
        amm_config: ctx.accounts.usdt_wsol_amm_config.to_account_info(),
        pool_state: ctx.accounts.usdt_wsol_pool_state.to_account_info(),
        input_token_account: ctx.accounts.input_token_account.to_account_info(),
        output_token_account: ctx.accounts.user_got_meme.to_account_info(),  // TODO
        input_vault: ctx.accounts.input_vault.to_account_info(),
        output_vault: ctx.accounts.output_vault.to_account_info(),
        input_token_program: ctx.accounts.input_token_program.to_account_info(),
        output_token_program: ctx.accounts.output_token_program.to_account_info(),
        input_token_mint: ctx.accounts.input_token_mint.to_account_info(),
        output_token_mint: ctx.accounts.output_token_mint.to_account_info(),
        observation_state: ctx.accounts.usdt_wsol_observation_state.to_account_info(),
    };
    
    let usdt_wsol_cpi_context = CpiContext::new(ctx.accounts.cp_swap_program.to_account_info(), usdt_wsol_cpi_accounts);
    let swap_base_input_result = cpi::swap_base_input(usdt_wsol_cpi_context, amount_in, minimum_amount_out);
    assert!(swap_base_input_result.is_ok());

    // step2: need create a meme token account to accept meme
    // output_token_account
    let wsol_meme_cpi_accounts = cpi::accounts::Swap {
        payer: ctx.accounts.payer.to_account_info(),
        authority: ctx.accounts.authority.to_account_info(),
        amm_config: ctx.accounts.wsol_meme_amm_config.to_account_info(),
        pool_state: ctx.accounts.wsol_meme_pool_state.to_account_info(),
        input_token_account: ctx.accounts.input_token_account.to_account_info(),
        output_token_account: ctx.accounts.user_got_meme.to_account_info(),
        input_vault: ctx.accounts.input_vault.to_account_info(),
        output_vault: ctx.accounts.output_vault.to_account_info(),
        input_token_program: ctx.accounts.input_token_program.to_account_info(),
        output_token_program: ctx.accounts.output_token_program.to_account_info(),
        input_token_mint: ctx.accounts.input_token_mint.to_account_info(),
        output_token_mint: ctx.accounts.output_token_mint.to_account_info(),
        observation_state: ctx.accounts.wsol_meme_observation_state.to_account_info(),
    };
  
    let wsol_meme_cpi_context = CpiContext::new(ctx.accounts.cp_swap_program.to_account_info(), wsol_meme_cpi_accounts);
    let swap_base_input_result = cpi::swap_base_input(wsol_meme_cpi_context, amount_in, minimum_amount_out);
    assert!(swap_base_input_result.is_ok());
    emit!(EVENTBuyInRaydium {
        payer_account: ctx.accounts.payer.key(),
        amount_in,
        minimum_amount_out,
        note,
    });
    Ok(())
}