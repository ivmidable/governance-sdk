import { Program } from "@coral-xyz/anchor";
import {PublicKey } from "@solana/web3.js";
import { GovernanceIdl } from "../idl/idl";
import ixFilter from "../ix_filter";
import { GovernanceConfig } from "../types";

export default async function _setGovernanceConfigContext(
    config: GovernanceConfig,
    governanceAccount: PublicKey,
    program: Program<GovernanceIdl>,
) {
    const defaultIx = await program.methods.setGovernanceConfig(config)
    .accounts({
        governanceAccount,
    })
    .instruction()

    return ixFilter(defaultIx, "setGovernanceConfig", program);

}