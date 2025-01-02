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
exports.tmpPayerPair = exports.DEVNET_CP_SWAP_PROGRAM_ID = void 0;
exports.setupInitializeTest = setupInitializeTest;
exports.setupDepositTest = setupDepositTest;
exports.setupSwapTest = setupSwapTest;
exports.initialize = initialize;
exports.deposit = deposit;
exports.swap_base_input = swap_base_input;
exports.swap_base_output = swap_base_output;
exports.proxy_buy_in_raydium = proxy_buy_in_raydium;
const anchor_1 = require("@coral-xyz/anchor");
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const index_1 = require("./index");
const config_1 = require("../config");
const token_1 = require("@coral-xyz/anchor/dist/cjs/utils/token");
const raydium_sdk_v2_1 = require("@raydium-io/raydium-sdk-v2");
const anchor = __importStar(require("@coral-xyz/anchor"));
const fs = __importStar(require("fs"));
const spl_token_2 = require("@solana/spl-token");
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
exports.tmpPayerPair = web3_js_1.Keypair.fromSecretKey(new Uint8Array([
    32, 170, 209, 222, 174, 15, 95, 191, 172, 227, 88, 30, 88, 72, 98, 206, 41,
    50, 136, 153, 216, 242, 228, 19, 241, 25, 73, 77, 47, 144, 141, 97, 118, 55,
    87, 164, 98, 183, 171, 93, 52, 11, 121, 253, 165, 110, 122, 149, 176, 102,
    212, 124, 26, 244, 7, 192, 170, 150, 88, 178, 194, 166, 96, 191,
]));
function setupInitializeTest(connection_1, owner_1) {
    return __awaiter(this, arguments, void 0, function* (connection, owner, transferFeeConfig = {
        transferFeeBasisPoints: 0,
        MaxFee: 0,
    }, confirmOptions) {
        const [{ token0, token0Program }, { token1, token1Program }] = yield (0, index_1.createTokenMintAndAssociatedTokenAccount)(connection, owner, exports.tmpPayerPair, transferFeeConfig);
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
function setupDepositTest(program_1, connection_1, owner_1) {
    return __awaiter(this, arguments, void 0, function* (program, connection, owner, transferFeeConfig = {
        transferFeeBasisPoints: 0,
        MaxFee: 0,
    }, confirmOptions, initAmount = {
        initAmount0: new anchor_1.BN(10000000000),
        initAmount1: new anchor_1.BN(20000000000),
    }, tokenProgramRequired) {
        while (1) {
            const [{ token0, token0Program }, { token1, token1Program }] = yield (0, index_1.createTokenMintAndAssociatedTokenAccount)(connection, owner, new web3_js_1.Keypair(), transferFeeConfig);
            if (tokenProgramRequired != undefined) {
                if (token0Program.equals(tokenProgramRequired.token0Program) &&
                    token1Program.equals(tokenProgramRequired.token1Program)) {
                    const { cpSwapPoolState } = yield initialize(program, owner, config_1.configAddress, token0, token0Program, token1, token1Program, confirmOptions, initAmount);
                    return cpSwapPoolState;
                }
            }
            else {
                const { cpSwapPoolState } = yield initialize(program, owner, config_1.configAddress, token0, token0Program, token1, token1Program, confirmOptions, initAmount);
                return cpSwapPoolState;
            }
        }
    });
}
function setupSwapTest(program_1, connection_1, owner_1) {
    return __awaiter(this, arguments, void 0, function* (program, connection, owner, transferFeeConfig = {
        transferFeeBasisPoints: 0,
        MaxFee: 0,
    }, confirmOptions) {
        const [{ token0, token0Program }, { token1, token1Program }] = yield (0, index_1.createTokenMintAndAssociatedTokenAccount)(connection, owner, new web3_js_1.Keypair(), transferFeeConfig);
        const { cpSwapPoolState } = yield initialize(program, owner, config_1.configAddress, token0, token0Program, token1, token1Program, confirmOptions);
        yield deposit(program, owner, config_1.configAddress, token0, token0Program, token1, token1Program, new anchor_1.BN(10000000000), new anchor_1.BN(100000000000), new anchor_1.BN(100000000000), confirmOptions);
        return cpSwapPoolState;
    });
}
function initialize(program_1, creator_1, configAddress_1, token0_1, token0Program_1, token1_1, token1Program_1, confirmOptions_1) {
    return __awaiter(this, arguments, void 0, function* (program, creator, configAddress, token0, token0Program, token1, token1Program, confirmOptions, initAmount = {
        initAmount0: new anchor_1.BN(10000000000),
        initAmount1: new anchor_1.BN(20000000000),
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
function deposit(program, owner, configAddress, token0, token0Program, token1, token1Program, lp_token_amount, maximum_token_0_amount, maximum_token_1_amount, confirmOptions) {
    return __awaiter(this, void 0, void 0, function* () {
        const [auth] = yield (0, index_1.getAuthAddress)(config_1.cpSwapProgram);
        const [poolAddress] = yield (0, index_1.getPoolAddress)(configAddress, token0, token1, config_1.cpSwapProgram);
        const [lpMintAddress] = yield (0, index_1.getPoolLpMintAddress)(poolAddress, config_1.cpSwapProgram);
        const [vault0] = yield (0, index_1.getPoolVaultAddress)(poolAddress, token0, config_1.cpSwapProgram);
        const [vault1] = yield (0, index_1.getPoolVaultAddress)(poolAddress, token1, config_1.cpSwapProgram);
        const [ownerLpToken] = yield web3_js_1.PublicKey.findProgramAddress([
            owner.publicKey.toBuffer(),
            spl_token_1.TOKEN_PROGRAM_ID.toBuffer(),
            lpMintAddress.toBuffer(),
        ], token_1.ASSOCIATED_PROGRAM_ID);
        const onwerToken0 = (0, spl_token_1.getAssociatedTokenAddressSync)(token0, owner.publicKey, false, token0Program);
        const onwerToken1 = (0, spl_token_1.getAssociatedTokenAddressSync)(token1, owner.publicKey, false, token1Program);
        try {
            const connection = new anchor.web3.Connection("https://devnet.helius-rpc.com/?api-key=0e4875a4-435d-4013-952a-1f82e3715f09", "confirmed");
            const tx1 = yield program.methods
                .proxyDeposit(lp_token_amount, maximum_token_0_amount, maximum_token_1_amount, "test")
                .accounts({
                cpSwapProgram: config_1.cpSwapProgram,
                owner: owner.publicKey,
                authority: auth,
                poolState: poolAddress,
                ownerLpToken,
                token0Account: onwerToken0,
                token1Account: onwerToken1,
                token0Vault: vault0,
                token1Vault: vault1,
                tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                tokenProgram2022: spl_token_1.TOKEN_2022_PROGRAM_ID,
                vault0Mint: token0,
                vault1Mint: token1,
                lpMint: lpMintAddress,
            })
                .instruction();
            const tx = new anchor.web3.Transaction().add(web3_js_1.ComputeBudgetProgram.setComputeUnitLimit({ units: 4000000000 }), web3_js_1.ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1200000 }), tx1);
            const txLog = yield anchor.web3.sendAndConfirmTransaction(connection, tx, [owner], {
                commitment: "confirmed",
                skipPreflight: false,
            });
            console.log("=> tx: ", txLog);
        }
        catch (error) {
            console.log("=> error: ", error);
        }
    });
}
// export async function withdraw(
//   program: Program,
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
function swap_base_input(program, owner, configAddress, inputToken, inputTokenProgram, outputToken, outputTokenProgram, amount_in, minimum_amount_out, confirmOptions) {
    return __awaiter(this, void 0, void 0, function* () {
        const [auth] = yield (0, index_1.getAuthAddress)(config_1.cpSwapProgram);
        const [poolAddress] = yield (0, index_1.getPoolAddress)(configAddress, inputToken, outputToken, config_1.cpSwapProgram);
        const [inputVault] = yield (0, index_1.getPoolVaultAddress)(poolAddress, inputToken, config_1.cpSwapProgram);
        const [outputVault] = yield (0, index_1.getPoolVaultAddress)(poolAddress, outputToken, config_1.cpSwapProgram);
        const inputTokenAccount = (0, spl_token_1.getAssociatedTokenAddressSync)(inputToken, owner.publicKey, false, inputTokenProgram);
        const outputTokenAccount = (0, spl_token_1.getAssociatedTokenAddressSync)(outputToken, owner.publicKey, false, outputTokenProgram);
        const [observationAddress] = yield (0, index_1.getOrcleAccountAddress)(poolAddress, config_1.cpSwapProgram);
        try {
            const connection = new anchor.web3.Connection("https://devnet.helius-rpc.com/?api-key=0e4875a4-435d-4013-952a-1f82e3715f09", "confirmed");
            const tx1 = yield program.methods
                .proxySwapBaseInput(amount_in, minimum_amount_out)
                .accounts({
                cpSwapProgram: config_1.cpSwapProgram,
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
                .instruction();
            const tx = new anchor.web3.Transaction().add(web3_js_1.ComputeBudgetProgram.setComputeUnitLimit({ units: 4000000000 }), web3_js_1.ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1200000 }), tx1);
            const txLog = yield anchor.web3.sendAndConfirmTransaction(connection, tx, [owner], {
                commitment: "confirmed",
                skipPreflight: false,
            });
            console.log("=> tx: ", txLog);
        }
        catch (error) {
            console.log("=> error: ", error);
        }
    });
}
function swap_base_output(program, owner, configAddress, inputToken, inputTokenProgram, outputToken, outputTokenProgram, amount_out_less_fee, max_amount_in, confirmOptions) {
    return __awaiter(this, void 0, void 0, function* () {
        const [auth] = yield (0, index_1.getAuthAddress)(config_1.cpSwapProgram);
        const [poolAddress] = yield (0, index_1.getPoolAddress)(configAddress, inputToken, outputToken, config_1.cpSwapProgram);
        const [inputVault] = yield (0, index_1.getPoolVaultAddress)(poolAddress, inputToken, config_1.cpSwapProgram);
        const [outputVault] = yield (0, index_1.getPoolVaultAddress)(poolAddress, outputToken, config_1.cpSwapProgram);
        const inputTokenAccount = (0, spl_token_1.getAssociatedTokenAddressSync)(inputToken, owner.publicKey, false, inputTokenProgram);
        const outputTokenAccount = (0, spl_token_1.getAssociatedTokenAddressSync)(outputToken, owner.publicKey, false, outputTokenProgram);
        const [observationAddress] = yield (0, index_1.getOrcleAccountAddress)(poolAddress, config_1.cpSwapProgram);
        try {
            const connection = new anchor.web3.Connection("https://devnet.helius-rpc.com/?api-key=0e4875a4-435d-4013-952a-1f82e3715f09", "confirmed");
            const local_wallet_keypair = anchor.web3.Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync("/Users/edy/.config/solana/id.json", "utf-8"))));
            const input_balance1 = (yield program.provider.connection.getTokenAccountBalance(inputTokenAccount)).value.uiAmount;
            console.log("input_balance: ", input_balance1);
            const output_balance1 = (yield program.provider.connection.getTokenAccountBalance(outputTokenAccount)).value.uiAmount;
            console.log("output_balance1: ", output_balance1);
            console.log("My local config wallet address:", local_wallet_keypair.publicKey.toString());
            const local_wallet_balance1 = yield program.provider.connection.getBalance(local_wallet_keypair.publicKey);
            console.log(`local_wallet_balance1 balance: ${local_wallet_balance1} SOL`);
            const owner_balance1 = yield program.provider.connection.getBalance(owner.publicKey);
            console.log(`owner_balance1 balance: ${owner_balance1} SOL`);
            const tx1 = yield program.methods
                .proxySwapBaseOutput(max_amount_in, amount_out_less_fee)
                .accounts({
                cpSwapProgram: config_1.cpSwapProgram,
                payer: owner.publicKey,
                proxyTrader: local_wallet_keypair.publicKey,
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
                .instruction();
            const tx = new anchor.web3.Transaction().add(web3_js_1.ComputeBudgetProgram.setComputeUnitLimit({ units: 4000000000 }), web3_js_1.ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1200000 }), tx1);
            const txLog = yield anchor.web3.sendAndConfirmTransaction(connection, tx, [local_wallet_keypair, owner], {
                commitment: "confirmed",
                skipPreflight: false,
            });
            console.log("=> tx: ", txLog);
            const input_balance2 = (yield program.provider.connection.getTokenAccountBalance(inputTokenAccount)).value.uiAmount;
            console.log("input_balance2: ", input_balance2);
            const output_balance2 = (yield program.provider.connection.getTokenAccountBalance(outputTokenAccount)).value.uiAmount;
            console.log("output_balance2: ", output_balance2);
            const local_wallet_balance2 = yield program.provider.connection.getBalance(local_wallet_keypair.publicKey);
            console.log(`local_wallet_balance2 balance: ${local_wallet_balance2} SOL`);
            const owner_balance2 = yield program.provider.connection.getBalance(owner.publicKey);
            console.log(`owner_balance2 balance: ${owner_balance2} SOL`);
        }
        catch (error) {
            console.log("=> error: ", error);
        }
    });
}
function proxy_buy_in_raydium(program, owner, configAddress, inputToken, inputTokenProgram, outputToken, outputTokenProgram, amount_in, minimum_amount_out, confirmOptions) {
    return __awaiter(this, void 0, void 0, function* () {
        const [auth] = yield (0, index_1.getAuthAddress)(config_1.cpSwapProgram);
        const [poolAddress] = yield (0, index_1.getPoolAddress)(configAddress, inputToken, outputToken, config_1.cpSwapProgram);
        const [inputVault] = yield (0, index_1.getPoolVaultAddress)(poolAddress, inputToken, config_1.cpSwapProgram);
        const [outputVault] = yield (0, index_1.getPoolVaultAddress)(poolAddress, outputToken, config_1.cpSwapProgram);
        const inputTokenAccount = (0, spl_token_1.getAssociatedTokenAddressSync)(inputToken, owner.publicKey, false, inputTokenProgram);
        const outputTokenAccount = (0, spl_token_1.getAssociatedTokenAddressSync)(outputToken, owner.publicKey, false, outputTokenProgram);
        const [observationAddress] = yield (0, index_1.getOrcleAccountAddress)(poolAddress, config_1.cpSwapProgram);
        try {
            const connection = new anchor.web3.Connection("https://devnet.helius-rpc.com/?api-key=0e4875a4-435d-4013-952a-1f82e3715f09", "confirmed");
            const local_wallet_keypair = anchor.web3.Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync("/Users/edy/.config/solana/id.json", "utf-8"))));
            const input_balance1 = (yield program.provider.connection.getTokenAccountBalance(inputTokenAccount)).value.uiAmount;
            console.log("input_balance: ", input_balance1);
            const output_balance1 = (yield program.provider.connection.getTokenAccountBalance(outputTokenAccount)).value.uiAmount;
            console.log("output_balance1: ", output_balance1);
            // console.log("My local config wallet address:", local_wallet_keypair.publicKey.toString());
            // const local_wallet_balance1 = await program.provider.connection.getBalance(local_wallet_keypair.publicKey);
            // console.log(`local_wallet_balance1 balance: ${local_wallet_balance1} SOL`);
            // const owner_balance1 = await program.provider.connection.getBalance(owner.publicKey);
            // console.log(`owner_balance1 balance: ${owner_balance1} SOL`);
            // const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
            //   connection, owner, outputToken, owner.publicKey, false,
            //   "processed",
            //   { skipPreflight: true },
            //   TOKEN_2022_PROGRAM_ID
            // );
            const user_memeToken1Account = yield (0, spl_token_2.getOrCreateAssociatedTokenAccount)(program.provider.connection, local_wallet_keypair, // 付 gas
            outputToken, local_wallet_keypair.publicKey, // 用户
            false, "processed", { skipPreflight: true }, spl_token_1.TOKEN_2022_PROGRAM_ID // token2022
            );
            // const transfer = createTransferInstruction(
            //   // fromTokenAccount.address,  // 成功🏅
            //   outputTokenAccount,
            //   // fromTokenAccount.address 和 outputTokenAccount 的地址是一致的
            //   user_memeToken1Account.address,
            //   owner.publicKey,
            //   100_000,
            //   [],
            //   TOKEN_2022_PROGRAM_ID
            // );
            // console.log("inputTokenAccount = ", inputTokenAccount);
            // console.log("outputTokenAccount = ", outputTokenAccount);
            // console.log("fromTokenAccount.address = ", fromTokenAccount.address);
            // console.log("user_memeToken1Account.address = ", user_memeToken1Account.address);
            // const transferTransaction = new Transaction().add(transfer);
            // const txhash = await sendAndConfirmTransaction(connection, transferTransaction, [owner,]);
            // console.info(txhash);
            // console.info("fromTokenAccount = ", fromTokenAccount);
            // console.info("user_memeToken1Account = ", user_memeToken1Account);
            const tx1 = yield program.methods
                .proxyBuyInRaydium(amount_in, minimum_amount_out, "buy to user")
                .accounts({
                cpSwapProgram: config_1.cpSwapProgram,
                payer: owner.publicKey,
                userGotMeme: user_memeToken1Account.address,
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
                .instruction();
            const tx = new anchor.web3.Transaction().add(web3_js_1.ComputeBudgetProgram.setComputeUnitLimit({ units: 4000000000 }), web3_js_1.ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1200000 }), tx1);
            const txLog = yield anchor.web3.sendAndConfirmTransaction(connection, tx, [owner], // 给了 客户平台方的 签名
            {
                commitment: "confirmed",
                skipPreflight: false,
            });
            console.log("=> tx: ", txLog);
            const input_balance2 = (yield program.provider.connection.getTokenAccountBalance(inputTokenAccount)).value.uiAmount;
            console.log("input_balance2: ", input_balance2);
            const output_balance2 = (yield program.provider.connection.getTokenAccountBalance(outputTokenAccount)).value.uiAmount;
            console.log("output_balance2: ", output_balance2);
            const user_outtoken_balance = (yield program.provider.connection.getTokenAccountBalance(user_memeToken1Account.address)).value.uiAmount;
            console.log("user_outtoken_balance: ", user_outtoken_balance);
            // const local_wallet_balance2 = await program.provider.connection.getBalance(local_wallet_keypair.publicKey);
            // console.log(`local_wallet_balance2 balance: ${local_wallet_balance2} SOL`);
            // const owner_balance2 = await program.provider.connection.getBalance(owner.publicKey);
            // console.log(`owner_balance2 balance: ${owner_balance2} SOL`);
        }
        catch (error) {
            console.log("=> error: ", error);
        }
    });
}
