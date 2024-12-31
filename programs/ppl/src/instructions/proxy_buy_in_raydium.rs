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
// use solana_client::rpc_client::RpcClient;
// use solana_program::pubkey::Pubkey;
// use std::str::FromStr;


#[error_code]
pub enum ErrorCode {
    #[msg("Not approved")]
    NotApproved,
}

#[derive(Accounts)]
pub struct ProxyBuyInRaydium<'info> {
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
    #[account(address = pool_state.load()?.amm_config)]
    pub amm_config: Box<Account<'info, AmmConfig>>,

    /// The program account of the pool in which the swap will be performed
    #[account(mut)]
    pub pool_state: AccountLoader<'info, PoolState>,

    /// The user token account for input token
    #[account(mut)]
    pub input_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    /// The user token account for output token
    #[account(mut)]
    pub output_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    /// The vault token account for input token
    #[account(
      mut,
      constraint = input_vault.key() == pool_state.load()?.token_0_vault || input_vault.key() == pool_state.load()?.token_1_vault
    )]
    pub input_vault: Box<InterfaceAccount<'info, TokenAccount>>,

    /// The vault token account for output token
    #[account(
      mut,
      constraint = output_vault.key() == pool_state.load()?.token_0_vault || output_vault.key() == pool_state.load()?.token_1_vault
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
    #[account(mut, address = pool_state.load()?.observation_key)]
    pub observation_state: AccountLoader<'info, ObservationState>,
}

pub fn proxy_buy_in_raydium(
    ctx: Context<ProxyBuyInRaydium>,
    amount_in: u64,
    minimum_amount_out: u64,
    note: String,
) -> Result<()> {
    let cpi_accounts = cpi::accounts::Swap {
        payer: ctx.accounts.payer.to_account_info(),
        authority: ctx.accounts.authority.to_account_info(),
        amm_config: ctx.accounts.amm_config.to_account_info(),
        pool_state: ctx.accounts.pool_state.to_account_info(),
        input_token_account: ctx.accounts.input_token_account.to_account_info(),
        output_token_account: ctx.accounts.output_token_account.to_account_info(),
        input_vault: ctx.accounts.input_vault.to_account_info(),
        output_vault: ctx.accounts.output_vault.to_account_info(),
        input_token_program: ctx.accounts.input_token_program.to_account_info(),
        output_token_program: ctx.accounts.output_token_program.to_account_info(),
        input_token_mint: ctx.accounts.input_token_mint.to_account_info(),
        output_token_mint: ctx.accounts.output_token_mint.to_account_info(),
        observation_state: ctx.accounts.observation_state.to_account_info(),
    };
    let cpi_context = CpiContext::new(ctx.accounts.cp_swap_program.to_account_info(), cpi_accounts);
    // ATA => Associated Token Account
    // ata_info => &AccountInfo
    // mint_info => &AccountInfo
    let output_token_program = ctx.accounts.output_token_program.to_account_info();
    let ata_data = output_token_program.data.borrow();
    let ata_state = StateWithExtensions::<token_2022::spl_token_2022::state::Account>::unpack(&ata_data)?;

    // Always check if you got the correct ATA for the mint
    if &ata_state.base.mint != ctx.accounts.output_token_program.to_account_info().key {
        msg!("Token account doesn't match the expected mint");
        return err!(ErrorCode::NotApproved);
    }

    msg!("balance={}", ata_state.base.amount);
    let balance_before = ata_state.base.amount;
    // let rpc_url = String::from("https://api.devnet.solana.com");
    // let connection = RpcClient::new_with_commitment(rpc_url, CommitmentConfig::confirmed());

    // let balance_before = connection
    //     .get_token_account_balance(&output_token_account)
    //     .unwrap();
    let swap_base_input_result = cpi::swap_base_input(cpi_context, amount_in, minimum_amount_out);
    if swap_base_input_result.is_ok() {
      // let balance_after = connection
      //   .get_token_account_balance(&output_token_account)
      //   .unwrap();
      // let got_meme_amount = balance_after - balance_before;
      let output_token_program = ctx.accounts.output_token_program.to_account_info();
      let ata_data = output_token_program.data.borrow();
      let ata_state = StateWithExtensions::<token_2022::spl_token_2022::state::Account>::unpack(&ata_data)?;
  
      msg!("balance 22={}", ata_state.base.amount);
      let balance_after = ata_state.base.amount;
      let got_meme_amount = balance_after - balance_before;

      let _ = token_2022::transfer_checked(
        CpiContext::new(
          ctx.accounts.output_token_program.to_account_info(),
            token_2022::TransferChecked {
              from: ctx.accounts.output_token_account.to_account_info(),
              to: ctx.accounts.user_got_meme.to_account_info(),
              authority: ctx.accounts.payer.to_account_info(),
              mint: ctx.accounts.output_token_mint.to_account_info(),
            },
        ),
        got_meme_amount,
        ctx.accounts.output_token_mint.decimals,
      );
      emit!(EVENTBuyInRaydium {
        payer_account: ctx.accounts.payer.key(),
        amount_in,
        minimum_amount_out,
        note,
      });
    }
    swap_base_input_result
}