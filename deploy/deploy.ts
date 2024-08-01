import { deployContract } from "./utils";


export default async function () {
    // Deploying the GeneralPaymaster contract
    const Paymaster = "GeneralPaymaster";
    const PaymasterArguments = [];
    await deployContract(Paymaster, PaymasterArguments);

    // Deploying the zkTune contract
    const contractArtifactName = "zkTune";
    const dAppArguments = [];
    await deployContract(contractArtifactName, dAppArguments);
}
