
// pub fn transfer_tokens(ctx: Context<TransferTokens>, quantity: u64) -> Result<()> {
    //     let mint_key = ctx.accounts.mint.key();
    //     let seeds = &["pool".as_bytes(), mint_key.as_ref(), &[ctx.bumps.pool]];
    //     let signer = [&seeds[..]];

    //     anchor_spl::token::transfer(
    //         CpiContext::new_with_signer(
    //             ctx.accounts.token_program.to_account_info(),
    //             anchor_spl::token::Transfer {
    //                 from: ctx.accounts.pool_token_account.to_account_info(),
    //                 to: ctx.accounts.payer_token_account.to_account_info(),
    //                 authority: ctx.accounts.pool.to_account_info(),
    //             },
    //             &signer,
    //         ),
    //         quantity,
    //     )?;

    //     let pool = &mut ctx.accounts.pool;
    //     pool.reserve_token -= quantity;
    //     Ok(())
    // }

// #[derive(Accounts)]
// pub struct TransferTokens<'info> {
//     #[account(
//         mut,
//         seeds = [b"pool", mint.key().as_ref()],
//         bump
//     )]
//     pub pool: Box<Account<'info, LiquidityPool>>,
//     #[account(mut)]
//     pub mint: Box<Account<'info, Mint>>,

//     #[account(
//         mut,
//         associated_token::mint = mint,
//         associated_token::authority = pool
//     )]
//     pub pool_token_account: Box<Account<'info, TokenAccount>>,

//     #[account(
//         init_if_needed,
//         payer = payer,
//         associated_token::mint = mint,
//         associated_token::authority = payer
//     )]
//     pub payer_token_account: Box<Account<'info, TokenAccount>>,

//     #[account(mut)]
//     pub payer: Signer<'info>,
//     pub rent: Sysvar<'info, Rent>,
//     pub system_program: Program<'info, System>,
//     pub token_program: Program<'info, Token>,
//     pub associated_token_program: Program<'info, AssociatedToken>,
// }