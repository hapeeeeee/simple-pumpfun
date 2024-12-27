"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEVNET_CP_SWAP_PROGRAM_ID = void 0;
exports.setupInitializeTest = setupInitializeTest;
exports.initialize = initialize;
const anchor_1 = require("@coral-xyz/anchor");
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const index_1 = require("./index");
const config_1 = require("../config");
const token_1 = require("@coral-xyz/anchor/dist/cjs/utils/token");
const raydium_sdk_v2_1 = require("@raydium-io/raydium-sdk-v2");
const anchor = __importStar(require("@coral-xyz/anchor"));
// const solanaConnection = new Connection("https://devnet.helius-rpc.com/?api-key=0e4875a4-435d-4013-952a-1f82e3715f09", {
//   commitment: 'confirmed',
// });
// const payerPair = Keypair.fromSecretKey(
//   new Uint8Array([
//     32, 170, 209, 222, 174, 15, 95, 191, 172, 227, 88, 30, 88, 72, 98, 206, 41,
//     50, 136, 153, 216, 242, 228, 19, 241, 25, 73, 77, 47, 144, 141, 97, 118, 55,
//     87, 164, 98, 183, 171, 93, 52, 11, 121, 253, 165, 110, 122, 149, 176, 102,
//     212, 124, 26, 244, 7, 192, 170, 150, 88, 178, 194, 166, 96, 191,
//   ])
// );
// const smart_comtract_address = "EaHoDFV3PCwUEFjU6b5U4Y76dW5oP7Bu1ndga8WgksFU";
// const payerWallet = new Wallet(payerPair)
// const provider = new AnchorProvider(solanaConnection, payerWallet, {
//   commitment: 'confirmed',
// });
// const programId = new PublicKey(smart_comtract_address);
// const data = fs.readFileSync('/Users/edy/workspace/robinyw/solana_proj/simple-pumpfun/app/spl.json', 'utf8');  // 读取文件内容，使用 'utf8' 以获取字符串
// const jsonData = JSON.parse(data);
// const program = new Program(jsonData as Idl, programId, provider);
// export async function getProgram() {
//   const payerPair = Keypair.fromSecretKey(
//     new Uint8Array([
//       32, 170, 209, 222, 174, 15, 95, 191, 172, 227, 88, 30, 88, 72, 98, 206, 41,
//       50, 136, 153, 216, 242, 228, 19, 241, 25, 73, 77, 47, 144, 141, 97, 118, 55,
//       87, 164, 98, 183, 171, 93, 52, 11, 121, 253, 165, 110, 122, 149, 176, 102,
//       212, 124, 26, 244, 7, 192, 170, 150, 88, 178, 194, 166, 96, 191,
//     ])
//   );
//   const smart_comtract_address = "EaHoDFV3PCwUEFjU6b5U4Y76dW5oP7Bu1ndga8WgksFU";
//   const payerWallet = new Wallet(payerPair)
//   const provider = new AnchorProvider(solanaConnection, payerWallet, {
//     commitment: 'confirmed',
//   });
//   const programId = new PublicKey(smart_comtract_address);
//   const data = fs.readFileSync('./spl.json', 'utf8');  // 读取文件内容，使用 'utf8' 以获取字符串
//   const jsonData = JSON.parse(data);
//   return new Program(jsonData as Idl, programId, provider);
// }
exports.DEVNET_CP_SWAP_PROGRAM_ID = new anchor.web3.PublicKey("CPMDWBwJDtYax9qW7AyRuVC19Cc4L4Vcy4n2BHAbHkCW");
function setupInitializeTest(connection_1, owner_1) {
    return __awaiter(this, arguments, void 0, function* (connection, owner, transferFeeConfig = {
        transferFeeBasisPoints: 0,
        MaxFee: 0,
    }, confirmOptions) {
        const [{ token0, token0Program }, { token1, token1Program }] = yield (0, index_1.createTokenMintAndAssociatedTokenAccount)(connection, owner, new web3_js_1.Keypair(), transferFeeConfig);
        // const [configAddress] = await getAmmConfigAddress(0, DEVNET_CP_SWAP_PROGRAM_ID);
        return {
            configAddress: config_1.configAddress,
            token0,
            token0Program,
            token1,
            token1Program,
        };
    });
}
// export async function setupDepositTest(
//   connection: Connection,
//   owner: Signer,
//   transferFeeConfig: { transferFeeBasisPoints: number; MaxFee: number } = {
//     transferFeeBasisPoints: 0,
//     MaxFee: 0,
//   },
//   confirmOptions?: ConfirmOptions,
//   initAmount: { initAmount0: BN; initAmount1: BN } = {
//     initAmount0: new BN(10000000000),
//     initAmount1: new BN(20000000000),
//   },
//   tokenProgramRequired?: {
//     token0Program: PublicKey;
//     token1Program: PublicKey;
//   }
// ) {
//   while (1) {
//     const [{ token0, token0Program }, { token1, token1Program }] =
//       await createTokenMintAndAssociatedTokenAccount(
//         connection,
//         owner,
//         new Keypair(),
//         transferFeeConfig
//       );
//     if (tokenProgramRequired != undefined) {
//       if (
//         token0Program.equals(tokenProgramRequired.token0Program) &&
//         token1Program.equals(tokenProgramRequired.token1Program)
//       ) {
//         const { cpSwapPoolState } = await initialize(
//           owner,
//           configAddress,
//           token0,
//           token0Program,
//           token1,
//           token1Program,
//           confirmOptions,
//           initAmount
//         );
//         return cpSwapPoolState;
//       }
//     } else {
//       const { cpSwapPoolState } = await initialize(
//         owner,
//         configAddress,
//         token0,
//         token0Program,
//         token1,
//         token1Program,
//         confirmOptions,
//         initAmount
//       );
//       return cpSwapPoolState;
//     }
//   }
// }
// export async function setupSwapTest(
//   connection: Connection,
//   owner: Signer,
//   transferFeeConfig: { transferFeeBasisPoints: number; MaxFee: number } = {
//     transferFeeBasisPoints: 0,
//     MaxFee: 0,
//   },
//   confirmOptions?: ConfirmOptions
// ) {
//   const [{ token0, token0Program }, { token1, token1Program }] =
//     await createTokenMintAndAssociatedTokenAccount(
//       connection,
//       owner,
//       new Keypair(),
//       transferFeeConfig
//     );
//   const { cpSwapPoolState } = await initialize(
//     owner,
//     configAddress,
//     token0,
//     token0Program,
//     token1,
//     token1Program,
//     confirmOptions
//   );
//   await deposit(
//     owner,
//     configAddress,
//     token0,
//     token0Program,
//     token1,
//     token1Program,
//     new BN(10000000000),
//     new BN(100000000000),
//     new BN(100000000000),
//     confirmOptions
//   );
//   return cpSwapPoolState;
// }
function initialize(program_1, creator_1, configAddress_1, token0_1, token0Program_1, token1_1, token1Program_1, confirmOptions_1) {
    return __awaiter(this, arguments, void 0, function* (program, creator, configAddress, token0, token0Program, token1, token1Program, confirmOptions, initAmount = {
        initAmount0: new anchor_1.BN(10000),
        initAmount1: new anchor_1.BN(2000000),
    }, createPoolFee = config_1.createPoolFeeReceive) {
        const [auth] = yield (0, index_1.getAuthAddress)(config_1.cpSwapProgram);
        const [poolAddress] = yield (0, index_1.getPoolAddress)(configAddress, token0, token1, config_1.cpSwapProgram);
        const [lpMintAddress] = yield (0, index_1.getPoolLpMintAddress)(poolAddress, config_1.cpSwapProgram);
        const [vault0] = yield (0, index_1.getPoolVaultAddress)(poolAddress, token0, config_1.cpSwapProgram);
        const [vault1] = yield (0, index_1.getPoolVaultAddress)(poolAddress, token1, config_1.cpSwapProgram);
        const [creatorLpTokenAddress] = yield web3_js_1.PublicKey.findProgramAddressSync([
            creator.publicKey.toBuffer(),
            spl_token_1.TOKEN_PROGRAM_ID.toBuffer(),
            lpMintAddress.toBuffer(),
        ], token_1.ASSOCIATED_PROGRAM_ID);
        const [observationAddress] = yield (0, index_1.getOrcleAccountAddress)(poolAddress, config_1.cpSwapProgram);
        const creatorToken0 = (0, spl_token_1.getAssociatedTokenAddressSync)(token0, creator.publicKey, false, token0Program);
        const creatorToken1 = (0, spl_token_1.getAssociatedTokenAddressSync)(token1, creator.publicKey, false, token1Program);
        console.log("111 dddd");
        {
            // ENVIROMENT
            const connection = new anchor.web3.Connection("https://devnet.helius-rpc.com/?api-key=0e4875a4-435d-4013-952a-1f82e3715f09", "confirmed");
            // const keypair = anchor.web3.Keypair.fromSecretKey(
            //   Uint8Array.from(JSON.parse(fs.readFileSync("/Users/edy/.config/solana/id.json", "utf-8")))
            // );
            // const wallet = new anchor.Wallet(keypair);
            // ================== SEND TX ==================
            try {
                const tx1 = yield program.methods
                    .proxyInitialize(initAmount.initAmount0, initAmount.initAmount1, new anchor_1.BN(0))
                    .accounts({
                    cpSwapProgram: config_1.cpSwapProgram,
                    creator: creator.publicKey,
                    ammConfig: configAddress,
                    authority: auth,
                    poolState: poolAddress,
                    token0Mint: token0,
                    token1Mint: token1,
                    lpMint: lpMintAddress,
                    creatorToken0,
                    creatorToken1,
                    creatorLpToken: creatorLpTokenAddress,
                    token0Vault: vault0,
                    token1Vault: vault1,
                    createPoolFee,
                    observationState: observationAddress,
                    tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                    token0Program: token0Program,
                    token1Program: token1Program,
                    associatedTokenProgram: token_1.ASSOCIATED_PROGRAM_ID,
                    systemProgram: web3_js_1.SystemProgram.programId,
                    rent: web3_js_1.SYSVAR_RENT_PUBKEY,
                })
                    .preInstructions([
                    web3_js_1.ComputeBudgetProgram.setComputeUnitLimit({ units: 4000000000 }),
                ])
                    .instruction();
                const tx = new anchor.web3.Transaction().add(web3_js_1.ComputeBudgetProgram.setComputeUnitLimit({ units: 4000000000 }), web3_js_1.ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1200000 }), tx1);
                const txLog = yield anchor.web3.sendAndConfirmTransaction(connection, tx, [creator], {
                    commitment: "confirmed",
                    skipPreflight: false,
                });
                console.log("=> tx: ", txLog);
            }
            catch (error) {
                console.log("=> error: ", error);
            }
            console.log("xxxx interact using wallet: ");
        }
        // const tx = await program.methods
        //   .proxyInitialize(initAmount.initAmount0, initAmount.initAmount1, new BN(0))
        //   .accounts({
        //     cpSwapProgram: cpSwapProgram,
        //     creator: creator.publicKey,
        //     ammConfig: configAddress,
        //     authority: auth,
        //     poolState: poolAddress,
        //     token0Mint: token0,
        //     token1Mint: token1,
        //     lpMint: lpMintAddress,
        //     creatorToken0,
        //     creatorToken1,
        //     creatorLpToken: creatorLpTokenAddress,
        //     token0Vault: vault0,
        //     token1Vault: vault1,
        //     createPoolFee,
        //     observationState: observationAddress,
        //     tokenProgram: TOKEN_PROGRAM_ID,
        //     token0Program: token0Program,
        //     token1Program: token1Program,
        //     associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
        //     systemProgram: SystemProgram.programId,
        //     rent: SYSVAR_RENT_PUBKEY,
        //   })
        //   .preInstructions([
        //     ComputeBudgetProgram.setComputeUnitLimit({ units: 40000000 }),
        //   ])
        //   .rpc(confirmOptions);
        console.log("222 dddd");
        const accountInfo = yield program.provider.connection.getAccountInfo(poolAddress);
        const poolState = raydium_sdk_v2_1.CpmmPoolInfoLayout.decode(accountInfo.data);
        const cpSwapPoolState = {
            ammConfig: poolState.configId,
            token0Mint: poolState.mintA,
            token0Program: poolState.mintProgramA,
            token1Mint: poolState.mintB,
            token1Program: poolState.mintProgramB,
        };
        return { poolAddress, cpSwapPoolState };
    });
}
// export async function deposit(
//   owner: Signer,
//   configAddress: PublicKey,
//   token0: PublicKey,
//   token0Program: PublicKey,
//   token1: PublicKey,
//   token1Program: PublicKey,
//   lp_token_amount: BN,
//   maximum_token_0_amount: BN,
//   maximum_token_1_amount: BN,
//   confirmOptions?: ConfirmOptions
// ) {
//   const [auth] = await getAuthAddress(cpSwapProgram);
//   const [poolAddress] = await getPoolAddress(
//     configAddress,
//     token0,
//     token1,
//     cpSwapProgram
//   );
//   const [lpMintAddress] = await getPoolLpMintAddress(
//     poolAddress,
//     cpSwapProgram
//   );
//   const [vault0] = await getPoolVaultAddress(
//     poolAddress,
//     token0,
//     cpSwapProgram
//   );
//   const [vault1] = await getPoolVaultAddress(
//     poolAddress,
//     token1,
//     cpSwapProgram
//   );
//   const [ownerLpToken] = await PublicKey.findProgramAddress(
//     [
//       owner.publicKey.toBuffer(),
//       TOKEN_PROGRAM_ID.toBuffer(),
//       lpMintAddress.toBuffer(),
//     ],
//     ASSOCIATED_PROGRAM_ID
//   );
//   const onwerToken0 = getAssociatedTokenAddressSync(
//     token0,
//     owner.publicKey,
//     false,
//     token0Program
//   );
//   const onwerToken1 = getAssociatedTokenAddressSync(
//     token1,
//     owner.publicKey,
//     false,
//     token1Program
//   );
//   const tx = await program.methods
//     .proxyDeposit(
//       lp_token_amount,
//       maximum_token_0_amount,
//       maximum_token_1_amount
//     )
//     .accounts({
//       cpSwapProgram: cpSwapProgram,
//       owner: owner.publicKey,
//       authority: auth,
//       poolState: poolAddress,
//       ownerLpToken,
//       token0Account: onwerToken0,
//       token1Account: onwerToken1,
//       token0Vault: vault0,
//       token1Vault: vault1,
//       tokenProgram: TOKEN_PROGRAM_ID,
//       tokenProgram2022: TOKEN_2022_PROGRAM_ID,
//       vault0Mint: token0,
//       vault1Mint: token1,
//       lpMint: lpMintAddress,
//     })
//     .preInstructions([
//       ComputeBudgetProgram.setComputeUnitLimit({ units: 400000 }),
//     ])
//     .rpc(confirmOptions);
//   return tx;
// }
// export async function withdraw(
//   owner: Signer,
//   configAddress: PublicKey,
//   token0: PublicKey,
//   token0Program: PublicKey,
//   token1: PublicKey,
//   token1Program: PublicKey,
//   lp_token_amount: BN,
//   minimum_token_0_amount: BN,
//   minimum_token_1_amount: BN,
//   confirmOptions?: ConfirmOptions
// ) {
//   const [auth] = await getAuthAddress(cpSwapProgram);
//   const [poolAddress] = await getPoolAddress(
//     configAddress,
//     token0,
//     token1,
//     cpSwapProgram
//   );
//   const [lpMintAddress] = await getPoolLpMintAddress(
//     poolAddress,
//     cpSwapProgram
//   );
//   const [vault0] = await getPoolVaultAddress(
//     poolAddress,
//     token0,
//     cpSwapProgram
//   );
//   const [vault1] = await getPoolVaultAddress(
//     poolAddress,
//     token1,
//     cpSwapProgram
//   );
//   const [ownerLpToken] = await PublicKey.findProgramAddress(
//     [
//       owner.publicKey.toBuffer(),
//       TOKEN_PROGRAM_ID.toBuffer(),
//       lpMintAddress.toBuffer(),
//     ],
//     ASSOCIATED_PROGRAM_ID
//   );
//   const onwerToken0 = getAssociatedTokenAddressSync(
//     token0,
//     owner.publicKey,
//     false,
//     token0Program
//   );
//   const onwerToken1 = getAssociatedTokenAddressSync(
//     token1,
//     owner.publicKey,
//     false,
//     token1Program
//   );
//   const tx = await program.methods
//     .proxyWithdraw(
//       lp_token_amount,
//       minimum_token_0_amount,
//       minimum_token_1_amount
//     )
//     .accounts({
//       cpSwapProgram: cpSwapProgram,
//       owner: owner.publicKey,
//       authority: auth,
//       poolState: poolAddress,
//       ownerLpToken,
//       token0Account: onwerToken0,
//       token1Account: onwerToken1,
//       token0Vault: vault0,
//       token1Vault: vault1,
//       tokenProgram: TOKEN_PROGRAM_ID,
//       tokenProgram2022: TOKEN_2022_PROGRAM_ID,
//       vault0Mint: token0,
//       vault1Mint: token1,
//       lpMint: lpMintAddress,
//       memoProgram: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
//     })
//     .preInstructions([
//       ComputeBudgetProgram.setComputeUnitLimit({ units: 400000 }),
//     ])
//     .rpc(confirmOptions)
//     .catch();
//   return tx;
// }
// export async function swap_base_input(
//   owner: Signer,
//   configAddress: PublicKey,
//   inputToken: PublicKey,
//   inputTokenProgram: PublicKey,
//   outputToken: PublicKey,
//   outputTokenProgram: PublicKey,
//   amount_in: BN,
//   minimum_amount_out: BN,
//   confirmOptions?: ConfirmOptions
// ) {
//   const [auth] = await getAuthAddress(cpSwapProgram);
//   const [poolAddress] = await getPoolAddress(
//     configAddress,
//     inputToken,
//     outputToken,
//     cpSwapProgram
//   );
//   const [inputVault] = await getPoolVaultAddress(
//     poolAddress,
//     inputToken,
//     cpSwapProgram
//   );
//   const [outputVault] = await getPoolVaultAddress(
//     poolAddress,
//     outputToken,
//     cpSwapProgram
//   );
//   const inputTokenAccount = getAssociatedTokenAddressSync(
//     inputToken,
//     owner.publicKey,
//     false,
//     inputTokenProgram
//   );
//   const outputTokenAccount = getAssociatedTokenAddressSync(
//     outputToken,
//     owner.publicKey,
//     false,
//     outputTokenProgram
//   );
//   const [observationAddress] = await getOrcleAccountAddress(
//     poolAddress,
//     cpSwapProgram
//   );
//   const tx = await program.methods
//     .proxySwapBaseInput(amount_in, minimum_amount_out)
//     .accounts({
//       cpSwapProgram: cpSwapProgram,
//       payer: owner.publicKey,
//       authority: auth,
//       ammConfig: configAddress,
//       poolState: poolAddress,
//       inputTokenAccount,
//       outputTokenAccount,
//       inputVault,
//       outputVault,
//       inputTokenProgram: inputTokenProgram,
//       outputTokenProgram: outputTokenProgram,
//       inputTokenMint: inputToken,
//       outputTokenMint: outputToken,
//       observationState: observationAddress,
//     })
//     .preInstructions([
//       ComputeBudgetProgram.setComputeUnitLimit({ units: 400000 }),
//     ])
//     .rpc(confirmOptions);
//   return tx;
// }
// export async function swap_base_output(
//   owner: Signer,
//   configAddress: PublicKey,
//   inputToken: PublicKey,
//   inputTokenProgram: PublicKey,
//   outputToken: PublicKey,
//   outputTokenProgram: PublicKey,
//   amount_out_less_fee: BN,
//   max_amount_in: BN,
//   confirmOptions?: ConfirmOptions
// ) {
//   const [auth] = await getAuthAddress(cpSwapProgram);
//   const [poolAddress] = await getPoolAddress(
//     configAddress,
//     inputToken,
//     outputToken,
//     cpSwapProgram
//   );
//   const [inputVault] = await getPoolVaultAddress(
//     poolAddress,
//     inputToken,
//     cpSwapProgram
//   );
//   const [outputVault] = await getPoolVaultAddress(
//     poolAddress,
//     outputToken,
//     cpSwapProgram
//   );
//   const inputTokenAccount = getAssociatedTokenAddressSync(
//     inputToken,
//     owner.publicKey,
//     false,
//     inputTokenProgram
//   );
//   const outputTokenAccount = getAssociatedTokenAddressSync(
//     outputToken,
//     owner.publicKey,
//     false,
//     outputTokenProgram
//   );
//   const [observationAddress] = await getOrcleAccountAddress(
//     poolAddress,
//     cpSwapProgram
//   );
//   const tx = await program.methods
//     .proxySwapBaseOutput(max_amount_in, amount_out_less_fee)
//     .accounts({
//       cpSwapProgram: cpSwapProgram,
//       payer: owner.publicKey,
//       authority: auth,
//       ammConfig: configAddress,
//       poolState: poolAddress,
//       inputTokenAccount,
//       outputTokenAccount,
//       inputVault,
//       outputVault,
//       inputTokenProgram: inputTokenProgram,
//       outputTokenProgram: outputTokenProgram,
//       inputTokenMint: inputToken,
//       outputTokenMint: outputToken,
//       observationState: observationAddress,
//     })
//     .preInstructions([
//       ComputeBudgetProgram.setComputeUnitLimit({ units: 400000 }),
//     ])
//     .rpc(confirmOptions);
//   return tx;
// }
