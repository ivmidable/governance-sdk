import { Program, BN } from "@coral-xyz/anchor";
import {PublicKey } from "@solana/web3.js";
import { GovernanceIdl } from "../idl/idl";
import ixFilter from "../ix_filter";
import { PdaClient } from "../pda";

export default async function _revokeGoverningTokensContext(
    amount: BN,
    realmAccount: PublicKey,
    tokenOwnerRecord: PublicKey,
    governingTokenMint: PublicKey,
    revokeAuthority: PublicKey,
    program: Program<GovernanceIdl>,
    pda: PdaClient,
) {
    const governingTokenHoldingAccount = pda.communityTokenHoldingAccount({
        realmAccount, communityMint: governingTokenMint
    }).publicKey

    const realmConfigAccount = pda.realmConfigAccount({realmAccount}).publicKey

    const defaultIx = await program.methods.revokeGoverningTokens(amount)
    .accounts({
        realmAccount,
        governingTokenMint,
        tokenOwnerRecord,
        governingTokenHoldingAccount,
        governingTokenMintAuthorityOrTokenOwner: revokeAuthority,
        realmConfigAccount
    })
    .instruction()

    return ixFilter(defaultIx, "revokeGoverningTokens", program);

}