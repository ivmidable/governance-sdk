import { IdlTypes, BN, IdlAccounts, DecodeType } from "@coral-xyz/anchor";
import { GovernanceIdl, ChatIdl } from "./idl/idl";
import { Idl, IdlTypeDef } from "@coral-xyz/anchor/dist/cjs/idl";
import { TypeDef } from "@coral-xyz/anchor/dist/cjs/program/namespace/types";
import { PublicKey } from "@solana/web3.js";

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

type TypeDefDictionary<T extends IdlTypeDef[], Defined> = {
    [K in T[number]["name"]]: TypeDef<T[number] & { name: K }, Defined> & {
      publicKey: PublicKey;
    };
};
  
type IdlAccountsWithPubkey<I extends Idl> = TypeDefDictionary<
    NonNullable<I["accounts"]>,
    IdlTypes<I>
>;

export type SetRealmAuthorityAction = IdlTypes<GovernanceIdl>["SetRealmAuthorityAction"];
export type RealmConfigArgs = IdlTypes<GovernanceIdl>["RealmConfigArgs"];
export type InstructionData = IdlTypes<GovernanceIdl>["InstructionData"];
export type Vote = IdlTypes<GovernanceIdl>["Vote"];
export type GovernanceConfig = IdlTypes<GovernanceIdl>["GovernanceConfig"];
export type MessageBody = IdlTypes<ChatIdl>["MessageBody"];

export type RealmV2 = IdlAccountsWithPubkey<GovernanceIdl>["realmV2"];
export type RealmV1 = IdlAccountsWithPubkey<GovernanceIdl>["realmV1"];
export type RealmConfig = IdlAccountsWithPubkey<GovernanceIdl>["realmConfigAccount"];
export type TokenOwnerRecord = IdlAccountsWithPubkey<GovernanceIdl>["tokenOwnerRecordV2"];
export type GovernanceAccount = IdlAccountsWithPubkey<GovernanceIdl>["governanceV2"];
export type GovernanceV1 = IdlAccountsWithPubkey<GovernanceIdl>["governanceV1"];
export type ProposalV2 = IdlAccountsWithPubkey<GovernanceIdl>["proposalV2"];
export type ProposalV1 = IdlAccountsWithPubkey<GovernanceIdl>["proposalV1"];
export type ProposalDeposit = IdlAccountsWithPubkey<GovernanceIdl>["proposalDeposit"];
export type ProposalTransaction = IdlAccountsWithPubkey<GovernanceIdl>["proposalTransactionV2"];
export type SignatoryRecord = IdlAccountsWithPubkey<GovernanceIdl>["signatoryRecordV2"];
export type VoteRecord = IdlAccountsWithPubkey<GovernanceIdl>["voteRecordV2"];
export type ChatMessage = IdlAccountsWithPubkey<ChatIdl>["chatMessage"];