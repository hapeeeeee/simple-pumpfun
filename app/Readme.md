# 合约文档
合约已部署到开发网,地址`EaHoDFV3PCwUEFjU6b5U4Y76dW5oP7Bu1ndga8WgksFU`,可通过`client.ts`调用合约方法,该文件需要安装`nodejs`和`typescipt`语言相关库,环境配置完成后,执行以下命令
```cmd
cd app
npm install
tsc
node ./client.js
```
***注意:合约中写死的钱包地址需要修改为测试者的钱包地址,在client.ts中搜索Keypair.fromSecretKey()修改其中的数据***

## 目前有7个接口可供调试

`createToken`:创建代币的所有信息

`mintToken`:向指定账户铸币

`burnToken`:账户所有者销毁自己的代币

`proxy_initialize`: 初始化raydium池子

`proxy_deposit`:向池子添加流动性

`proxy_swap_base_input`:基于付款数量的swap(花费固定数量的代币), 最少要得到指定数量的另一种代币

`proxy_swap_base_output`:基于购买数量的swap(得到固定数量的代币), 最多花费指定数量的另一种代币


## 1. `createToken`
### 1.1 传入参数
```rust
#[derive(Accounts)]
#[instruction(params: CreateTokenParams)]
pub struct CreateToken<'info> {
    #[account(mut)]
    /// CHECK: UncheckedAccount
    pub metadata: UncheckedAccount<'info>,         // 元数据的账户地址
    #[account(
        init,
        seeds = [b"mint", params.id.as_bytes()],
        bump,
        payer = payer,
        mint::decimals = params.decimals,
        mint::authority = payer, 
    )]
    pub mint: Account<'info, Mint>,                // 代币的Mint地址
    #[account(mut)]
    pub payer: Signer<'info>,                    // 代币创建者+gas付费者
    pub rent: Sysvar<'info, Rent>,              // 四个系统固定程序地址
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub token_metadata_program: Program<'info, Metaplex>,
}

// Token的独有信息
#[derive(AnchorSerialize, AnchorDeserialize, Debug, Clone)]
pub struct CreateTokenParams {                  
    pub name: String,       
    pub symbol: String,
    pub uri: String,                       // Token信息的打包json
    pub decimals: u8,                      // Token精度
    pub id: String,                        // Tokenid唯一标志,建议随机生成
}
```

## 1.2 调用
参考[client.ts](./client.ts)

## 1.3 链上的消息事件

```Rust
#[event]
pub struct EVENTCreateToken {
    pub name: String,
    pub symbol: String,
    pub uri: String,
    pub decimals: u8,
    pub mint: Pubkey,               // Mint地址
    pub metadata_account: Pubkey,   // 元数据地址
    pub token_id: String,           // TokenId
}
```

链下监听器
```ts
// 创建Create函数监听器
  const listenerCreateToken = program.addEventListener(
    "EVENTCreateToken",
    (event, slot) => {
      console.log(
        `EVENTCreateToken: id = ${event.tokenId}, name = ${event.name},symbol = ${event.symbol}`
      );
    }
  );
```

## 1.4 创建结果
创建成功可在[`https://explorer.solana.com/address/Cbb3yypZ21pEgua8UC5Z5TB9Egw5UhkYH9CQfFw3p4Vu/tokens?cluster=devnet`](https://explorer.solana.com/address/Cbb3yypZ21pEgua8UC5Z5TB9Egw5UhkYH9CQfFw3p4Vu/tokens?cluster=devnet)查看Token信息,其中`Cbb3yypZ21pEgua8UC5Z5TB9Egw5UhkYH9CQfFw3p4Vu`是新Token的`Mint`地址,该地址可在`client.js`的输出日志中搜索`metadatamint address: xxxxxxxxx`找到



# 2. mintToken
### 2.1 传入参数
```rust

#[derive(Accounts)]
#[instruction(params: MintTokenParams)]
pub struct MintTokens<'info> {
    #[account(
        mut,
        seeds = [b"mint", params.id.as_bytes()],
        bump,
        mint::authority = payer, // ToDo: payer
    )]
    pub mint: Account<'info, Mint>,             // Token的地址
    #[account(mut)]
    pub destination: Account<'info, TokenAccount>, // 目标的tokenaccount,可以是创建者的,也可以是其他人的
    #[account(mut)]
    pub payer: Signer<'info>,             // token创建者+gas付费
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Debug, Clone)]
pub struct MintTokenParams {
    pub id: String,
    pub quantity: u64,      // 铸币数量
}

```

## 2.2 调用
参考[client.ts](./client.ts)

## 2.3 链上的消息事件

```Rust
#[event]
pub struct EVENTMintToken {
    pub mint: Pubkey,
    pub token_account: Pubkey,
    pub amount: u64,
    pub token_id: String,
}
```

链下监听器
```ts
// 创建Mint函数监听器
  const listenerMintToken = program.addEventListener(
    "EVENTMintToken",
    (event, slot) => {
      console.log(
        `EVENTMintToken: id= ${event.tokenId}, dest_token_account = ${event.tokenAccount.toBase58()},amount = ${
          event.amount
        }`
      );
    }
  );
```

## 2.4 Mint结果
铸币成功可在[`https://explorer.solana.com/address/8xU46cXdK7hc27qj8DEDuBdy8dAoTqwafAddgJCTmZcr/tokens?cluster=devnet`](https://explorer.solana.com/address/8xU46cXdK7hc27qj8DEDuBdy8dAoTqwafAddgJCTmZcr/tokens?cluster=devnet)查看拥有的信息,其中`8xU46cXdK7hc27qj8DEDuBdy8dAoTqwafAddgJCTmZcr`是TokenAccount的所属者的钱包地址,该地址可在`client.js`的输出日志中搜索`My address: xxxxxxxxx`或者`UserPair.publickey: PublicKey [PublicKey(`找到

***注意:是在钱包地址的页面查看,而不是钱包对应的TokenAccount页面查看***




# 3. burnToken
### 3.1 传入参数
```rust

#[derive(Accounts)]
#[instruction(params: BurnTokenParams)]
pub struct BurnTokens<'info> {
    #[account(
        mut,
        seeds = [b"mint", params.id.as_bytes()],
        bump,
    )]
    pub mint: Account<'info, Mint>,     // 代币的mint地址
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = payer
    )]
    pub token_account: Account<'info, TokenAccount>,    // 想要burn的tokenaccount地址
    #[account(mut)]
    pub payer: Signer<'info>,       // 签名者+gas付费,注意这个账户必须拥有token_account的所有权,即只能burn自己拥有的代币
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
```

------------------------------------------------------------------

## 3.2 调用
参考[client.ts](./client.ts)

## 3.3 链上的消息事件

```Rust
#[event]
pub struct EVENTBurnToken {
    pub mint: Pubkey,
    pub token_account: Pubkey,
    pub amount: u64,
    pub token_id: String,
}
```

链下监听器
```ts
// 创建burn函数监听器
  const listenerBurnToken = program.addEventListener(
    "EVENTBurnToken",
    (event, slot) => {
      console.log(
        `EVENTBurnToken: id= ${event.tokenId},token_account = ${event.tokenAccount.toBase58()},amount = ${
          event.amount
        }`
      );
    }
  );
```

## 3.4 burn结果
同[2.4 Mint结果](#24-mint结果)



# 4. `proxy_initialize`
## 4.1 传入参数
```typescript
program.methods
  // 函数参数:
  /// * `init_amount_0` - the initial amount_0 to deposit
  /// * `init_amount_1` - the initial amount_1 to deposit
  /// * `open_time` - the timestamp allowed for swap
  .proxyInitialize(init_amount_0, init_amount_1, open_time)
  .accounts({
    cpSwapProgram: cpSwapProgram,  // devnet addr: "CPMDWBwJDtYax9qW7AyRuVC19Cc4L4Vcy4n2BHAbHkCW"; 来自 raydium 开发网
    creator: creator.publicKey,  // 谁要创建池子, 它的签名账户公钥 
    ammConfig: configAddress,  // devnet addr: "9zSzfkYy6awexsHvmggeH36pfVUdDGyCcwmjT3AQPBj6"; 来自 raydium 开发网
    authority: auth,  // 用 utils/pda.ts 里的 getAuthAddress(cpSwapProgram)得到授权
    // eg: const [auth] = await getAuthAddress(cpSwapProgram);
    poolState: poolAddress,  // 根据 cpSwapProgram,configAddress 和两种token的mint地址 获取,
    // 用 utils/pda.ts 里的 getPoolAddress()
    // eg:
    //   const [poolAddress] = await getPoolAddress(
    //   configAddress,
    //   token0,
    //   token1,
    //   cpSwapProgram
    // );
    token0Mint: token0,  // token0 的mint地址
    token1Mint: token1,  // token1 的mint地址
    lpMint: lpMintAddress,  // 根据 cpSwapProgram, poolAddress 得到, 用 utils/pda.ts 里的 getPoolLpMintAddress()
    // eg:
    //   const [lpMintAddress] = await getPoolLpMintAddress(
    //   poolAddress,
    //   cpSwapProgram
    // );
    creatorToken0,  // 获取 creator 对于 token0 的账户地址
    // 要用到 @solana/spl-token 里的 getAssociatedTokenAddressSync() 
    // eg:
    // const creatorToken0 = getAssociatedTokenAddressSync(
    //   token0,
    //   creator.publicKey,
    //   false,
    //   token0Program
    // );
    creatorToken1,  // 获取 creator 对于 token1 的账户地址
    creatorLpToken: creatorLpTokenAddress,  // creator 接收 流动池代币 地址
    // eg:
    // const [creatorLpTokenAddress] = await PublicKey.findProgramAddressSync(
    //   [
    //     creator.publicKey.toBuffer(),
    //     TOKEN_PROGRAM_ID.toBuffer(),  // TOKEN_PROGRAM_ID 来自 @solana/spl-token
    //     lpMintAddress.toBuffer(),
    //   ],
    //   ASSOCIATED_PROGRAM_ID
    // );
    token0Vault: vault0,  // 通过结合特定的种子数据、池的公钥和 cpSwapProgram 来生成 token0 的金库地址
    // 用 utils/pda.ts 里的 getPoolVaultAddress()
    // eg:
    // const [vault0] = await getPoolVaultAddress(
    //   poolAddress,
    //   token0,
    //   cpSwapProgram
    // );
    token1Vault: vault1,  // 通过结合特定的种子数据、池的公钥和 cpSwapProgram 来生成 token1 的金库地址
    createPoolFee,  // = new PublicKey("G11FKBRaAkHAKuLCgLM6K6NUc9rTjPAznRCjZifrTQe2"); 来自 raydium 开发网
    observationState: observationAddress,
    // 用 utils/pda.ts 里的 getOrcleAccountAddress()
    // eg:
    // const [observationAddress] = await getOrcleAccountAddress(
    //   poolAddress,
    //   cpSwapProgram
    // );
    tokenProgram: TOKEN_PROGRAM_ID,
    token0Program: token0Program,
    token1Program: token1Program,
    associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
    systemProgram: SystemProgram.programId,
    rent: SYSVAR_RENT_PUBKEY,
  })
```


# 5. `proxy_deposit`
## 5.1 传入参数
```typescript
program.methods
  .proxyDeposit(
    lp_token_amount,
    maximum_token_0_amount,
    maximum_token_1_amount
  )
  .accounts({
    cpSwapProgram: cpSwapProgram,
    owner: owner.publicKey,  // 谁要添加流动性, 它的签名账户公钥 
    authority: auth,  // 用 utils/pda.ts 里的 getAuthAddress(cpSwapProgram)得到授权
    // eg: const [auth] = await getAuthAddress(cpSwapProgram);
    poolState: poolAddress,  // 根据 cpSwapProgram,configAddress 和两种token的mint地址 获取,
    // 用 utils/pda.ts 里的 getPoolAddress()
    // eg:
    //   const [poolAddress] = await getPoolAddress(
    //   configAddress,
    //   token0,
    //   token1,
    //   cpSwapProgram
    // );
    ownerLpToken,  // 根据 lpMintAddress 得到
    // eg:
    // const [ownerLpToken] = await PublicKey.findProgramAddress(
    //   [
    //     owner.publicKey.toBuffer(),
    //     TOKEN_PROGRAM_ID.toBuffer(),
    //     lpMintAddress.toBuffer(),
    //   ],
    //   ASSOCIATED_PROGRAM_ID  // ASSOCIATED_PROGRAM_ID 来自于 "@coral-xyz/anchor/dist/cjs/utils/token"
    // );
    token0Account: onwerToken0,  // 获取 owner 对于 token0 的账户地址
    // eg:
    // const onwerToken0 = getAssociatedTokenAddressSync(
    //   token0,
    //   owner.publicKey,
    //   false,
    //   token0Program
    // );
    token1Account: onwerToken1,  // 获取 owner 对于 token1 的账户地址
    token0Vault: vault0,  // 通过结合特定的种子数据、池的公钥和 cpSwapProgram 来生成 token0 的金库地址
    // 用 utils/pda.ts 里的 getPoolVaultAddress()
    // eg:
    // const [vault0] = await getPoolVaultAddress(
    //   poolAddress,
    //   token0,
    //   cpSwapProgram
    // );
    token1Vault: vault1,  // 通过结合特定的种子数据、池的公钥和 cpSwapProgram 来生成 token1 的金库地址
    tokenProgram: TOKEN_PROGRAM_ID,
    tokenProgram2022: TOKEN_2022_PROGRAM_ID,
    vault0Mint: token0,
    vault1Mint: token1,
    lpMint: lpMintAddress,
  })
```

# 6. `proxy_swap_base_input`
## 6.1 传入参数 
```typescript
program.methods
  // 参数: 花费固定数量的代币, 至少得到多少另一种代币
  .proxySwapBaseInput(amount_in, minimum_amount_out)
  .accounts({
    cpSwapProgram: cpSwapProgram,
    payer: owner.publicKey,  // 谁要交换代币, 它的签名账户公钥 
    authority: auth,  // 同上
    ammConfig: configAddress,  // 同上
    poolState: poolAddress,  // 同上
    inputTokenAccount,  // 获取 owner 对于 要花费的某种代币 的账户地址
    // eg:
    // const inputTokenAccount = getAssociatedTokenAddressSync(
    //   inputToken,
    //   owner.publicKey,
    //   false,
    //   inputTokenProgram
    // );
    outputTokenAccount,  // 获取 owner 对于 要得到的某种代币 的账户地址
    inputVault, // 通过结合特定的种子数据、池的公钥和 cpSwapProgram 来生成 input token 的金库地址
    // 用 utils/pda.ts 里的 getPoolVaultAddress()
    // eg:
    // const [vault0] = await getPoolVaultAddress(
    //   poolAddress,
    //   token0,
    //   cpSwapProgram
    // );
    outputVault,
    inputTokenProgram: inputTokenProgram,
    outputTokenProgram: outputTokenProgram,
    inputTokenMint: inputToken,
    outputTokenMint: outputToken,
    observationState: observationAddress,
  })
```

# 7. `proxy_swap_base_output`
## 7.1 传入参数
```typescript
program.methods
  // 参数: 得到固定数量的代币, 最多花费指定数量的另一种代币
  .proxySwapBaseOutput(max_amount_in, amount_out_less_fee)
  .accounts({
    cpSwapProgram: cpSwapProgram,
    payer: owner.publicKey,
    authority: auth,
    ammConfig: configAddress,
    poolState: poolAddress,
    inputTokenAccount,
    outputTokenAccount,
    inputVault,
    outputVault,
    inputTokenProgram: inputTokenProgram,
    outputTokenProgram: outputTokenProgram,
    inputTokenMint: inputToken,
    outputTokenMint: outputToken,
    observationState: observationAddress,
  })
```

