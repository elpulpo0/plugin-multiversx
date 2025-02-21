import type { Plugin } from "@elizaos/core";
import transfer from "./actions/transfer";
import createToken from "./actions/createToken";
import swap from "./actions/swap";
import checkWallet from "./actions/checkWallet";
import getAddress from "./actions/getAddress";
import receiveEgld from "./actions/receiveEgld";

export const multiversxPlugin: Plugin = {
    name: "multiversx",
    description: "MultiversX Plugin for Eliza",
    actions: [transfer, createToken, swap, checkWallet, getAddress, receiveEgld],
    evaluators: [],
    providers: [],
};

export default multiversxPlugin;
