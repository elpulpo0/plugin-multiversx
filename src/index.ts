import type { Plugin } from "@elizaos/core";
import transfer from "./actions/transfer";
import createToken from "./actions/createToken";
import swap from "./actions/swap";
import receiveEgld from "./actions/receiveEgld";

export const multiversxPlugin: Plugin = {
    name: "multiversx",
    description: "MultiversX Plugin for Eliza",
    actions: [transfer, createToken, swap, receiveEgld],
    evaluators: [],
    providers: [],
};

export default multiversxPlugin;
