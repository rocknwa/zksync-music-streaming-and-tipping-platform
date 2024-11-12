import { deployContract } from "./utils";

export default async function () {
  const Paymaster = "GeneralPaymaster";
  const PaymasterArguments = [];
  await deployContract(Paymaster, PaymasterArguments);

  const contractArtifactName = "zkTune";
  const dAppArguments = [];
  await deployContract(contractArtifactName, dAppArguments);
}
