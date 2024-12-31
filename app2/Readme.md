# 合约文档
合约已部署到开发网,地址`EaHoDFV3PCwUEFjU6b5U4Y76dW5oP7Bu1ndga8WgksFU`,可通过`client.ts`调用合约方法,该文件需要安装`nodejs`和`typescipt`语言相关库,环境配置完成后,执行以下命令
```cmd
cd app2
npm install
tsc
node ./client.js
```
***注意:合约中写死的钱包地址需要修改为测试者的钱包地址,在client.ts中搜索Keypair.fromSecretKey()修改其中的数据***

## raydium 接口
`proxy_initialize`: 初始化raydium池子

`proxy_deposit`:向池子添加流动性

`proxy_swap_base_input`:基于付款数量的swap(花费固定数量的代币), 最少要得到指定数量的另一种代币

`proxy_swap_base_output`:基于购买数量的swap(得到固定数量的代币), 最多花费指定数量的另一种代币


# 1. `proxy_initialize`
## 1.1 传入参数
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

# 2. `proxy_deposit`
## 2.1 传入参数
```typescript
program.methods
  .proxyDeposit(
    lp_token_amount,
    maximum_token_0_amount,
    maximum_token_1_amount,
    note_string
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

## 2.2 链上的消息事件

```Rust
pub struct EVENTAddLiquidity {
    pub owner_account: Pubkey,
    pub lp_token_amount: u64,
    pub maximum_token_0_amount: u64,
    pub maximum_token_1_amount: u64,
    pub note: String,
}
```

# 3. `proxy_swap_base_input`
## 3.1 传入参数 
```typescript
program.methods
  // 参数: 花费固定数量的代币, 至少得到多少另一种代币
  .proxySwapBaseInput(amount_in, minimum_amount_out, note_string)
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

## 3.2 链上的消息事件

```Rust
#[event]
pub struct EVENTSwapIn {
    pub payer_account: Pubkey,
    pub amount_in: u64,
    pub minimum_amount_out: u64,
    pub note: String,
}
```

# 4. `proxy_swap_base_output`
## 4.1 传入参数
```typescript
program.methods
  // 参数: 得到固定数量的代币, 最多花费指定数量的另一种代币
  .proxySwapBaseOutput(max_amount_in, amount_out_less_fee, note_string)
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

## 4.2 链上的消息事件

```Rust
#[event]
pub struct EVENTSwapOut {
    pub payer_account: Pubkey,
    pub max_amount_in: u64,
    pub amount_out: u64,
    pub note: String,
}
```