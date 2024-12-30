"use strict";
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
exports.createTokenMintAndAssociatedTokenAccount = createTokenMintAndAssociatedTokenAccount;
exports.isEqual = isEqual;
const anchor_1 = require("@coral-xyz/anchor");
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const index_1 = require("./index");
// create a token mint and a token2022 mint with transferFeeConfig
function createTokenMintAndAssociatedTokenAccount(connection, payer, mintAuthority, transferFeeConfig) {
    return __awaiter(this, void 0, void 0, function* () {
        let ixs = [];
        ixs.push(anchor_1.web3.SystemProgram.transfer({
            fromPubkey: payer.publicKey,
            toPubkey: mintAuthority.publicKey,
            lamports: anchor_1.web3.LAMPORTS_PER_SOL,
        }));
        yield (0, index_1.sendTransaction)(connection, ixs, [payer]);
        let tokenArray = [];
        let token0 = yield (0, spl_token_1.createMint)(connection, mintAuthority, mintAuthority.publicKey, null, 9);
        tokenArray.push({ address: token0, program: spl_token_1.TOKEN_PROGRAM_ID });
        let token1 = yield createMintWithTransferFee(connection, payer, mintAuthority, web3_js_1.Keypair.generate(), transferFeeConfig);
        tokenArray.push({ address: token1, program: spl_token_1.TOKEN_2022_PROGRAM_ID });
        tokenArray.sort(function (x, y) {
            const buffer1 = x.address.toBuffer();
            const buffer2 = y.address.toBuffer();
            for (let i = 0; i < buffer1.length && i < buffer2.length; i++) {
                if (buffer1[i] < buffer2[i]) {
                    return -1;
                }
                if (buffer1[i] > buffer2[i]) {
                    return 1;
                }
            }
            if (buffer1.length < buffer2.length) {
                return -1;
            }
            if (buffer1.length > buffer2.length) {
                return 1;
            }
            return 0;
        });
        token0 = tokenArray[0].address;
        token1 = tokenArray[1].address;
        //   console.log("Token 0", token0.toString());
        //   console.log("Token 1", token1.toString());
        const token0Program = tokenArray[0].program;
        const token1Program = tokenArray[1].program;
        const ownerToken0Account = yield (0, spl_token_1.getOrCreateAssociatedTokenAccount)(connection, payer, token0, payer.publicKey, false, "processed", { skipPreflight: true }, token0Program);
        yield (0, spl_token_1.mintTo)(connection, payer, token0, ownerToken0Account.address, mintAuthority, 100000000000000, [], { skipPreflight: true }, token0Program);
        // console.log(
        //   "ownerToken0Account key: ",
        //   ownerToken0Account.address.toString()
        // );
        const ownerToken1Account = yield (0, spl_token_1.getOrCreateAssociatedTokenAccount)(connection, payer, token1, payer.publicKey, false, "processed", { skipPreflight: true }, token1Program);
        // console.log(
        //   "ownerToken1Account key: ",
        //   ownerToken1Account.address.toString()
        // );
        yield (0, spl_token_1.mintTo)(connection, payer, token1, ownerToken1Account.address, mintAuthority, 100000000000000, [], { skipPreflight: true }, token1Program);
        return [
            { token0, token0Program },
            { token1, token1Program },
        ];
    });
}
function createMintWithTransferFee(connection_1, payer_1, mintAuthority_1) {
    return __awaiter(this, arguments, void 0, function* (connection, payer, mintAuthority, mintKeypair = web3_js_1.Keypair.generate(), transferFeeConfig) {
        const transferFeeConfigAuthority = web3_js_1.Keypair.generate();
        const withdrawWithheldAuthority = web3_js_1.Keypair.generate();
        const extensions = [spl_token_1.ExtensionType.TransferFeeConfig];
        const mintLen = (0, spl_token_1.getMintLen)(extensions);
        const decimals = 9;
        const mintLamports = yield connection.getMinimumBalanceForRentExemption(mintLen);
        const mintTransaction = new web3_js_1.Transaction().add(web3_js_1.SystemProgram.createAccount({
            fromPubkey: payer.publicKey,
            newAccountPubkey: mintKeypair.publicKey,
            space: mintLen,
            lamports: mintLamports,
            programId: spl_token_1.TOKEN_2022_PROGRAM_ID,
        }), (0, spl_token_1.createInitializeTransferFeeConfigInstruction)(mintKeypair.publicKey, transferFeeConfigAuthority.publicKey, withdrawWithheldAuthority.publicKey, transferFeeConfig.transferFeeBasisPoints, BigInt(transferFeeConfig.MaxFee), spl_token_1.TOKEN_2022_PROGRAM_ID), (0, spl_token_1.createInitializeMintInstruction)(mintKeypair.publicKey, decimals, mintAuthority.publicKey, null, spl_token_1.TOKEN_2022_PROGRAM_ID));
        yield (0, web3_js_1.sendAndConfirmTransaction)(connection, mintTransaction, [payer, mintKeypair], undefined);
        return mintKeypair.publicKey;
    });
}
function isEqual(amount1, amount2) {
    if (BigInt(amount1) === BigInt(amount2) ||
        BigInt(amount1) - BigInt(amount2) === BigInt(1) ||
        BigInt(amount1) - BigInt(amount2) === BigInt(-1)) {
        return true;
    }
    return false;
}
