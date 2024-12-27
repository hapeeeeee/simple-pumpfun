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
exports.accountExist = accountExist;
exports.sendTransaction = sendTransaction;
exports.getBlockTimestamp = getBlockTimestamp;
const web3_js_1 = require("@solana/web3.js");
function accountExist(connection, account) {
    return __awaiter(this, void 0, void 0, function* () {
        const info = yield connection.getAccountInfo(account);
        if (info == null || info.data.length == 0) {
            return false;
        }
        return true;
    });
}
function sendTransaction(connection, ixs, signers, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const tx = new web3_js_1.Transaction();
        for (var i = 0; i < ixs.length; i++) {
            tx.add(ixs[i]);
        }
        if (options == undefined) {
            options = {
                preflightCommitment: "confirmed",
                commitment: "confirmed",
            };
        }
        const sendOpt = options && {
            skipPreflight: options.skipPreflight,
            preflightCommitment: options.preflightCommitment || options.commitment,
        };
        tx.recentBlockhash = (yield connection.getLatestBlockhash()).blockhash;
        const signature = yield connection.sendTransaction(tx, signers, sendOpt);
        const status = (yield connection.confirmTransaction(signature, options.commitment)).value;
        if (status.err) {
            throw new Error(`Raw transaction ${signature} failed (${JSON.stringify(status)})`);
        }
        return signature;
    });
}
function getBlockTimestamp(connection) {
    return __awaiter(this, void 0, void 0, function* () {
        let slot = yield connection.getSlot();
        return yield connection.getBlockTime(slot);
    });
}
