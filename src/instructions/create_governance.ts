import { Program } from "@coral-xyz/anchor";
import {PublicKey, Keypair} from "@solana/web3.js";
import { GovernanceIdl } from "../idl/idl";
import ixFilter from "../ix_filter";
import { PdaClient } from "../pda";
import {GovernanceConfig} from "../types";
 
export default async function _createGovernanceContext(
    config: GovernanceConfig,
    realmAccount: PublicKey,
    governanceAuthority: PublicKey,
    tokenOwnerRecord: PublicKey,
    payer: PublicKey,
    program: Program<GovernanceIdl>,
    pda: PdaClient,
    governanceAccountSeed?: PublicKey,
    voterWeightRecord?: PublicKey
) {

    const seed = governanceAccountSeed ?? Keypair.generate().publicKey;

    const governanceAccount = pda.governanceAccount({
        realmAccount, governedAccount: seed
    }).publicKey

    const realmConfig = pda.realmConfigAccount({realmAccount}).publicKey

    const defaultIx = await program.methods.createGovernance(config)
    .accounts({
        realmAccount,
        governanceAccount,
        governedAccount: seed,
        governingTokenOwnerRecord: tokenOwnerRecord,
        realmConfigAccount: realmConfig,
        voterWeightRecord: voterWeightRecord ?? null,
        governanceAuthority,
        payer
    })
    .instruction();

    return ixFilter(defaultIx, "createGovernance", program);
}
