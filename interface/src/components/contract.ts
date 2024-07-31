import zkTune from "../ABI/ZkTune.json";
import { utils } from "zksync-ethers";

export const zkTuneABI = zkTune;

export const zkTunecontractconfig = {
  address: process.env.NEXT_PUBLIC_ZK_TUNE_ADDRESS || "",
  abi: zkTuneABI.abi,
} as const;

export const paymasterParams = utils.getPaymasterParams(process.env.NEXT_PUBLIC_PAYMASTER_ADDRESS || "", {
  type: "General",
  innerInput: new Uint8Array(),
});
