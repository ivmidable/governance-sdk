import { IdlTypes, BN, IdlAccounts, DecodeType } from "@coral-xyz/anchor";
import { GovernanceIdl } from "./idl/idl";

// export type MintMaxVoteWeightSource = IdlTypes<GovernanceIdl>["MintMaxVoterWeightSource"];
export type MintMaxVoteWeightSource = {
    type: "supplyFraction" | "absolute",
    amount: BN
}

type multiChoiceOptionsType = {
    choiceType: "fullWeight" | "weighted",
    minVoterOptions: number,
    maxVoterOptions: number,
    maxWinningOptions: number
}

// export type VoteType = IdlTypes<GovernanceIdl>["VoteType"];
export type VoteType = {
    choiceType: "single" | "multi",
    multiChoiceOptions: multiChoiceOptionsType | null
}

export type SetRealmAuthorityAction = IdlTypes<GovernanceIdl>["SetRealmAuthorityAction"];
export type RealmConfigArgs = IdlTypes<GovernanceIdl>["RealmConfigArgs"];
export type InstructionData = IdlTypes<GovernanceIdl>["InstructionData"];
export type Vote = IdlTypes<GovernanceIdl>["Vote"];
export type GovernanceConfig = IdlTypes<GovernanceIdl>["GovernanceConfig"];

export type RealmV2 = IdlAccounts<GovernanceIdl>["realmV2"];
export type TokenOwnerRecord = IdlAccounts<GovernanceIdl>["tokenOwnerRecordV2"];
export type GovernanceAccount = IdlAccounts<GovernanceIdl>["governanceV2"];