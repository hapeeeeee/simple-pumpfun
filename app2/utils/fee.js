"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateFee = calculateFee;
exports.calculatePreFeeAmount = calculatePreFeeAmount;
const spl_token_1 = require("@solana/spl-token");
function calculateFee(transferFeeConfig, preFeeAmount, tokenProgram) {
    if (tokenProgram.equals(spl_token_1.TOKEN_PROGRAM_ID)) {
        return BigInt(0);
    }
    if (preFeeAmount === BigInt(0)) {
        return BigInt(0);
    }
    else {
        const numerator = preFeeAmount * BigInt(transferFeeConfig.transferFeeBasisPoints);
        const rawFee = (numerator + spl_token_1.ONE_IN_BASIS_POINTS - BigInt(1)) / spl_token_1.ONE_IN_BASIS_POINTS;
        const fee = rawFee > transferFeeConfig.MaxFee ? transferFeeConfig.MaxFee : rawFee;
        return BigInt(fee);
    }
}
function calculatePreFeeAmount(transferFeeConfig, postFeeAmount, tokenProgram) {
    if (transferFeeConfig.transferFeeBasisPoints == 0 ||
        tokenProgram.equals(spl_token_1.TOKEN_PROGRAM_ID)) {
        return postFeeAmount;
    }
    else {
        let numerator = postFeeAmount * BigInt(spl_token_1.MAX_FEE_BASIS_POINTS);
        let denominator = spl_token_1.MAX_FEE_BASIS_POINTS - transferFeeConfig.transferFeeBasisPoints;
        return (numerator + BigInt(denominator) - BigInt(1)) / BigInt(denominator);
    }
}
