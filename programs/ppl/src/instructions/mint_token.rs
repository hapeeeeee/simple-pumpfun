use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{mint_to, Mint, MintTo, Token, TokenAccount},
};
use spl_associated_token_account::instruction as token_account_instruction;
use solana_program::program::invoke_signed;
use crate::events::{EVENTMintToken, EVENTMintTokenBatch};

pub fn mint_tokens(ctx: Context<MintTokens>, params: MintTokenParams) -> Result<()> {
    mint_to(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                authority: ctx.accounts.payer.to_account_info(),
                to: ctx.accounts.destination.to_account_info(),
                mint: ctx.accounts.mint.to_account_info(),
            },
        ),
        params.quantity,
    )?;
    emit!(EVENTMintToken {
        mint: ctx.accounts.mint.key(),
        token_account: ctx.accounts.destination.key(),
        amount: params.quantity,
        token_id: params.id,
        txid: params.txid,
    });
    
    Ok(())
}

pub fn mint_tokens_batch_with_create_ata<'c: 'info, 'info>(ctx: Context<'_, '_, 'c, 'info, MintTokensBatch<'info>>, params: MintTokenBatchParams) -> Result<()> {
    let remaining_accounts_len = ctx.remaining_accounts.len();
    let mint_amount_len = params.quantity.len();
    assert!(remaining_accounts_len % 2 == 0);
    assert!(remaining_accounts_len / 2 == mint_amount_len);
    for i in (0..remaining_accounts_len).step_by(2) {
        
        let user_wallet = &ctx.remaining_accounts[i];
        let user_token_account = &ctx.remaining_accounts[i+1];
        let mint_amount = params.quantity[i / 2];

        let ix = token_account_instruction::create_associated_token_account(
            ctx.accounts.payer.key,
            user_wallet.key,
            &ctx.accounts.mint.key(),
            ctx.accounts.token_program.key,
        );
        invoke_signed(
            &ix,
            &[
                ctx.accounts.payer.to_account_info(),
                user_token_account.clone(),
                user_wallet.clone(),
                ctx.accounts.mint.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
                ctx.accounts.token_program.to_account_info(),
            ],
            &[],
        )?;

        mint_to(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    authority: ctx.accounts.payer.to_account_info(),
                    to: user_token_account.clone(),
                    mint: ctx.accounts.mint.to_account_info(),
                },
            ),
            mint_amount,
        )?;
    }
    emit!(EVENTMintTokenBatch {
        mint: ctx.accounts.mint.key(),
        token_id: params.id.clone(),
        txid: params.txid.clone(),
    });
    Ok(())
}

pub fn mint_tokens_batch<'c: 'info, 'info>(ctx: Context<'_, '_, 'c, 'info, MintTokensBatch<'info>>, params: MintTokenBatchParams) -> Result<()> {
    let remaining_accounts_len = ctx.remaining_accounts.len();
    let mint_amount_len = params.quantity.len();
    assert!(remaining_accounts_len == mint_amount_len);
    for i in 0..remaining_accounts_len {
        let user_token_account = &ctx.remaining_accounts[i];
        let mint_amount = params.quantity[i];
        mint_to(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    authority: ctx.accounts.payer.to_account_info(),
                    to: user_token_account.clone(),
                    mint: ctx.accounts.mint.to_account_info(),
                },
            ),
            mint_amount,
        )?;
    }
    emit!(EVENTMintTokenBatch {
        mint: ctx.accounts.mint.key(),
        token_id: params.id.clone(),
        txid: params.txid.clone(),
    });
    Ok(())
}


#[derive(Accounts)]
// #[instruction(params: MintTokenParams)]
pub struct MintTokensBatch<'info> {
    #[account(
        mut,
        // seeds = [b"mint", params.id.as_bytes()],
        // bump,
        mint::authority = payer, // ToDo: payer
    )]
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Debug, Clone)]
pub struct MintTokenBatchParams {
    pub quantity: Vec<u64>,
    pub id: String,
    pub txid: String,
}


#[derive(Accounts)]
#[instruction(params: MintTokenParams)]
pub struct MintTokens<'info> {
    #[account(
        mut,
        seeds = [b"mint", params.id.as_bytes()],
        bump,
        mint::authority = payer, // ToDo: payer
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
    pub txid: String,
}
