import type { Plugin } from "@elizaos/core";
import transfer from "./actions/transfer";
import createToken from "./actions/createToken";
import createLiquidityPool from "./actions/createLiquidityPool";
import swap from "./actions/swap";
import checkWallet from "./actions/checkWallet";
import getAddress from "./actions/getAddress";
import receiveEgld from "./actions/receiveEgld";
import lendEgld from "./actions/hatom/lendEgld";
import addCollateral from "./actions/hatom/addCollateral";
import createBirthdayWarp from "./actions/warps/createBirthdayWarp"

export const multiversxPlugin: Plugin = {
    name: "multiversx",
    description: "MultiversX Plugin for Eliza",
    actions: [transfer, createToken, createLiquidityPool, swap, checkWallet, getAddress, receiveEgld, lendEgld, createBirthdayWarp, addCollateral],
    evaluators: [],
    providers: [],
};

export default multiversxPlugin;
