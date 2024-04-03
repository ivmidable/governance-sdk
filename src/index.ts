import {PublicKey, Connection, TransactionInstruction, Keypair, SystemProgram, clusterApiUrl, AccountMeta} from "@solana/web3.js";
import {Program, Wallet, AnchorProvider, BN} from "@coral-xyz/anchor";
import {GovernanceIdl} from "./idl/idl";
import idl from "./idl/gov.json";
import { DEFAULT_PROGRAM_ID } from "./constant";
import { PdaClient } from "./pda";
import { GovernanceAccount, GovernanceConfig, GovernanceV1, MintMaxVoteWeightSource, ProposalDeposit, ProposalTransaction, ProposalV1, ProposalV2, RealmConfig, RealmConfigArgs, RealmV1, RealmV2, SignatoryRecord, TokenOwnerRecord, Vote, VoteRecord, VoteType } from "./types";
import * as govInstructions from "./instructions";
import {fetchAndDeserialize, fetchMultipleAndDeserialize} from "./account";

export class Rpc {
    readonly programId: PublicKey;
    readonly connection: Connection;
    readonly program: Program<GovernanceIdl>;
    readonly pda: PdaClient;
    private readonly _provider: AnchorProvider;

    constructor(
        connection: Connection,
        programId?: PublicKey,
    ) {
        this.connection = connection;
        this.programId = programId ?? DEFAULT_PROGRAM_ID;
        this._provider = new AnchorProvider(this.connection, {} as Wallet, {commitment: "confirmed"});
        this.program = new Program<GovernanceIdl>(idl as GovernanceIdl, this.programId, this._provider);
        this.pda = new PdaClient(this.programId);
    }

    // GET APIs

    /** Get realm account from its public key
     * 
     * @param realmAccount The public key of the realm account
     * @returns Realm account
     */
    async getRealmByPubkey(realmAccount: PublicKey): Promise<RealmV2> {
        return fetchAndDeserialize(this.connection, realmAccount, 'realmV2')
    }

    /** Get realm account from the name
     * 
     * @param name The name of the Realm
     * @returns Realm account
     */
    async getRealmByName(name: string): Promise<RealmV2> {
        const realmAccount = this.pda.realmAccount({name}).publicKey
        return this.getRealmByPubkey(realmAccount)
    }

    /** Get all the realm accounts
     * 
     * @returns all Realm accounts
     */
    async getAllRealms(): Promise<RealmV2[]> {
        return fetchMultipleAndDeserialize(this.connection, this.programId, 'realmV2', 'H')
    }

    /** Get Realm accounts from the community mint
     * 
     * @param communityMint Mint address of the token used as the community token
     * @returns Realms using the given token as the community mint
     */
    async getRealmsByCommunityMint(communityMint: PublicKey): Promise<RealmV2[]> {
        return fetchMultipleAndDeserialize(this.connection, this.programId, 'realmV2', 'H', 1, communityMint)
    }

    /** Get realm account V1 from its public key
     * 
     * @param realmAccount The public key of the realm account
     * @returns Realm account
     */
    async getRealmV1ByPubkey(realmAccount: PublicKey): Promise<RealmV1> {
        return fetchAndDeserialize(this.connection, realmAccount, 'realmV1')
    }

    /** Get realm account V1 from the name
     * 
     * @param name The name of the Realm
     * @returns Realm account
     */
    async getRealmV1ByName(name: string): Promise<RealmV1> {
        const realmAccount = this.pda.realmAccount({name}).publicKey
        return this.getRealmV1ByPubkey(realmAccount)
    }

    /** Get all the V1 realm accounts
     * 
     * @returns all Realm accounts
     */
    async getAllV1Realms(): Promise<RealmV1[]> {
        return fetchMultipleAndDeserialize(this.connection, this.programId, 'realmV1', '2')
    }

    /** Get V1 Realm accounts from the community mint
     * 
     * @param communityMint Mint address of the token used as the community token
     * @returns Realms using the given token as the community mint
     */
    async getV1RealmsByCommunityMint(communityMint: PublicKey): Promise<RealmV1[]> {
        return fetchMultipleAndDeserialize(this.connection, this.programId, 'realmV1', '2', 1, communityMint)
    }

    /** Get Realm config account from its public key
     * 
     * @param realmConfigAddress The public key of the Realm Config Account
     * @returns Realm Config Account
     */
    async getRealmConfigByPubkey(realmConfigAddress: PublicKey): Promise<RealmConfig> {
        return fetchAndDeserialize(this.connection, realmConfigAddress, 'realmConfigAccount')
    }

    /** Get Realm config account from the realm account's public key
     * 
     * @param realmAccount The public key of the Realm Account
     * @returns Realm Config Account
     */
    async getRealmConfigByRealm(realmAccount: PublicKey): Promise<RealmConfig> {
        const realmConfigAddress = this.pda.realmConfigAccount({realmAccount}).publicKey
        return this.getRealmConfigByPubkey(realmConfigAddress)
    }

    /** Get Token Owner Record Account from its public key
     * 
     * @param tokenOwnerRecordAddress The public key of the Token Owner Record account
     * @returns Token Owner Record account
     */
    async getTokenOwnerRecordByPubkey(tokenOwnerRecordAddress: PublicKey): Promise<TokenOwnerRecord> {
        return fetchAndDeserialize(this.connection, tokenOwnerRecordAddress, 'tokenOwnerRecordV2')
    }

    /** Get Token Owner Record Account
     * 
     * @param realmAccount The public key of the Realm Account
     * @param tokenOwner The public key of the owner
     * @param tokenMint The token address (either community mint or council mint)
     * @returns Token Owner Record Account
     */
    async getTokenOwnerRecord(
        realmAccount: PublicKey,
        tokenOwner: PublicKey,
        tokenMint: PublicKey
    ): Promise<TokenOwnerRecord> {
        const tokenOwnerRecordAddress = this.pda.tokenOwnerRecordAccount({
            realmAccount, governingTokenMintAccount: tokenMint, governingTokenOwner: tokenOwner
        }).publicKey
        return this.getTokenOwnerRecordByPubkey(tokenOwnerRecordAddress)
    }

    /** Get all the token owner records for the given realm 
     * 
     * @param realmAccount The public key of the Realm Account
     * @returns all Token Owner Records for the given realm account
     */
    async getTokenOwnerRecordsForRealm(realmAccount: PublicKey): Promise<TokenOwnerRecord[]> {
        return fetchMultipleAndDeserialize(this.connection, this.programId, 'tokenOwnerRecordV2', 'J', 1, realmAccount)
    }

    /** Get all the token owner records for the given owner 
     * 
     * @param tokenOwner The public key of the user whose token owner records to fetch
     * @returns all Token Owner Records for the given owner
     */
    async getTokenOwnerRecordsForOwner(tokenOwner: PublicKey): Promise<TokenOwnerRecord[]> {
        return fetchMultipleAndDeserialize(this.connection, this.programId, 'tokenOwnerRecordV2', 'J', 65, tokenOwner)
    }

    /** Get all the token owner records for the given mint 
     * 
     * @param tokenMint Mint address of the token whose token owner records to fetch
     * @returns all Token Owner Records for the given mint
     */
    async getTokenOwnerRecordsForMint(tokenMint: PublicKey): Promise<TokenOwnerRecord[]> {
        return fetchMultipleAndDeserialize(this.connection, this.programId, 'tokenOwnerRecordV2', 'J', 33, tokenMint)
    }

    /** Get Governance account from its public key
     * 
     * @param governanceAccount The public key of the governance account
     * @returns Governance account
     */
    async getGovernanceAccountByPubkey(governanceAccount: PublicKey): Promise<GovernanceAccount> {
        return fetchAndDeserialize(this.connection, governanceAccount, 'governanceV2')
    }

    /** Get all the governance accounts for the realm
     * 
     * @param realmAccount The public key of the Realm Account
     * @returns all Governance accounts for the given Realm
     */
    async getGovernanceAccountsByRealm(realmAccount: PublicKey): Promise<GovernanceAccount[]> {
        return await fetchMultipleAndDeserialize(this.connection, this.programId, 'governanceV2', undefined, 1, realmAccount)
    }

    /** Get V1 Governance account from its public key
     * 
     * @param governanceAccount The public key of the governance account
     * @returns Governance account
     */
    async getGovernanceAccountV1ByPubkey(governanceAccount: PublicKey): Promise<GovernanceV1> {
        return fetchAndDeserialize(this.connection, governanceAccount, 'governanceV1')
    }

    /** Get all the V1 governance accounts for the realm
     * 
     * @param realmAccount The public key of the Realm Account
     * @returns all Governance accounts for the given Realm
     */
    async getV1GovernanceAccountsByRealm(realmAccount: PublicKey): Promise<GovernanceV1[]> {
        return fetchMultipleAndDeserialize(this.connection, this.programId, 'governanceV1', '4', 1, realmAccount)
    }

    /** Get Proposal account from its public key
     * 
     * @param proposalAccount The public key of the proposal account
     * @returns Proposal account
     */
    async getProposalByPubkey(proposalAccount: PublicKey): Promise<ProposalV2> {
        return fetchAndDeserialize(this.connection, proposalAccount, 'proposalV2')
    }

    /** Get all the proposal accounts for the Governance
     * 
     * @param governanceAccount The public key of the Governance Account
     * @returns all Proposal accounts for the given Governance
     */
    async getProposalsforGovernance(governanceAccount: PublicKey): Promise<ProposalV2[]> {
        return fetchMultipleAndDeserialize(this.connection, this.programId, 'proposalV2', 'F', 1, governanceAccount)
    }

    /** Get all the proposal accounts for a user in Realm
     * 
     * @param tokenOwnerRecord The public key of the user's token owner record
     * @returns all Proposal accounts for the given user
     */
    async getProposalsByTokenOwnerRecord(tokenOwnerRecord: PublicKey): Promise<ProposalV2[]> {
        return fetchMultipleAndDeserialize(this.connection, this.programId, 'proposalV2', 'F', 66, tokenOwnerRecord)
    }

    /** Get Proposal Deposit account from its public key
     * 
     * @param proposalDepositAccount The public key of the proposal deposit account
     * @returns Proposal Deposit account
     */
    async getProposalDepositByPubkey(proposalDepositAccount: PublicKey): Promise<ProposalDeposit> {
        return fetchAndDeserialize(this.connection, proposalDepositAccount, 'proposalDeposit')
    }

    /** Get proposal deposit accounts for the given proposal
     * 
     * @param proposalAccount The public key of the proposal account
     * @returns proposal deposit accounts for the given proposal
     */
    async getProposalDepositByProposal(proposalAccount: PublicKey): Promise<ProposalDeposit[]> {
        return fetchMultipleAndDeserialize(this.connection, this.programId, 'proposalDeposit', 'Q', 1, proposalAccount)
    }

    /** Get Proposal Transaction account from its public key
     * 
     * @param proposalTransactionAccount The public key of the proposal transaction account
     * @returns Proposal Transaction account
     */
    async getProposalTransactionByPubkey(proposalTransactionAccount: PublicKey): Promise<ProposalTransaction> {
        return fetchAndDeserialize(this.connection, proposalTransactionAccount, 'proposalTransactionV2')
    }

    /** Get proposal transaction accounts for the given proposal
     * 
     * @param proposalAccount The public key of the proposal account
     * @returns proposal transaction accounts for the given proposal
     */
    async getProposalTransactionsByProposal(proposalAccount: PublicKey): Promise<ProposalTransaction[]> {
        return fetchMultipleAndDeserialize(this.connection, this.programId, 'proposalTransactionV2', 'E', 1, proposalAccount)
    }

    /** Get Signatory Record from its public key
     * 
     * @param signatoryRecordAddress The public key of the Signatory Record account
     * @returns Signatory Record account
     */
    async getSignatoryRecordByPubkey(signatoryRecordAddress: PublicKey): Promise<SignatoryRecord> {
        return fetchAndDeserialize(this.connection, signatoryRecordAddress, 'signatoryRecordV2')
    }

    /** Get Signatory Record account
     * 
     * @param proposalAccount The public key of the Proposal account
     * @param signatory The signer's public key
     * @returns Signatory Record account
     */
    async getSignatoryRecord(
        proposalAccount: PublicKey,
        signatory: PublicKey
    ): Promise<SignatoryRecord> {
        const signatoryRecordAddress = this.pda.signatoryRecordAccount({proposal: proposalAccount, signatory}).publicKey
        return this.getSignatoryRecordByPubkey(signatoryRecordAddress)
    }

    /** Get all signatory records for the proposal
     * 
     * @param proposalAccount The public key of the Proposal account
     * @returns all signatory records for the given proposal
     */
    async getSignatoryRecordsForProposal(proposalAccount: PublicKey): Promise<SignatoryRecord[]> {
        return fetchMultipleAndDeserialize(this.connection, this.programId, 'signatoryRecordV2', 'P', 1, proposalAccount)
    }

    /** Get Vote Record from its public key
     * 
     * @param voteRecordAddress The public key of the Vote Record account
     * @returns Vote Record account
     */
    async getVoteRecordByPubkey(voteRecordAddress: PublicKey): Promise<VoteRecord> {
        return fetchAndDeserialize(this.connection, voteRecordAddress, 'voteRecordV2')
    }

     /** Get Vote Record account
     * 
     * @param proposalAccount The public key of the Proposal account
     * @param tokenOwnerRecord The public key of the voter's token owner record
     * @returns Vote Record account
     */
     async getVoteRecord(
        proposalAccount: PublicKey,
        tokenOwnerRecord: PublicKey
    ): Promise<VoteRecord> {
        const voteRecordAddress = this.pda.voteRecordAccount({proposal: proposalAccount, tokenOwnerRecord}).publicKey
        return this.getVoteRecordByPubkey(voteRecordAddress)
    }


    /** Get all vote records for the proposal
     * 
     * @param proposalAccount The public key of the Proposal account
     * @returns all vote records for the given proposal
     */
    async getVoteRecordsForProposal(proposalAccount: PublicKey): Promise<VoteRecord[]> {
        return fetchMultipleAndDeserialize(this.connection, this.programId, 'voteRecordV2', 'D', 1, proposalAccount)
    }

    /** Get all vote records for the voter
     * 
     * @param voter The public key of the voter
     * @returns all vote records for the given voter
     */
    async getVoteRecordsForUser(voter: PublicKey) : Promise<VoteRecord[]> {
        return fetchMultipleAndDeserialize(this.connection, this.programId, 'voteRecordV2', 'D', 33, voter)
    }
}

export class Instructions {
    readonly programId: PublicKey;
    readonly program: Program<GovernanceIdl>;
    readonly pda: PdaClient;
    private readonly provider: AnchorProvider;

    constructor(
        programId?: PublicKey,
    ) {
        const connection = new Connection(clusterApiUrl('devnet'));
        const wallet = new Wallet(Keypair.generate());
        this.programId = programId ?? DEFAULT_PROGRAM_ID;
        this.provider = new AnchorProvider(connection, wallet, {commitment: "confirmed"});
        this.program = new Program<GovernanceIdl>(idl as GovernanceIdl, this.programId, this.provider);
        this.pda = new PdaClient(this.programId);
    }

    /**
     * Construct a CreateRealm Instruction
     *
     * @param name Name for the new realm (must be unique)
     * @param communityTokenMint Mint Account of the token to be used as community token
     * @param minCommunityWeightToCreateGovernance  Min number of community tokens required to create a governance
     * @param payer The payer of the transaction 
     * @param communityMintMaxVoterWeightSource (Optional) The default value is `{type: "supplyFraction", amount: new BN(Math.pow(10,10))}`. Max vote weight type can either be `supplyFraction` or `absolute`. For supply fraction, the amount is in percentage with `10^10` precision, e.g. `100% becomes 10^10`. For absolute, the amount is in actual tokens.
     * @param councilTokenMint (Optional) Mint Account of the token to be used as council token. Council won't be created if this isn't provided
     * @param communityTokenType (Optional) The default value is `liquid`. Defines who retains the authority over deposited tokens and which token instructions are allowed. Liquid = token owner has the authority, deposit and withdrawal is allowed. Membership = Realm has the authority, deposit is allowed, withdrawal is not allowed. Dormant = Placeholder, signifies that the voting population is not yet active. 
     * @param councilTokenType (Optional) The default value is `liquid`. Defines who retains the authority over deposited tokens and which token instructions are allowed. Liquid = token owner has the authority, deposit and withdrawal is allowed. Membership = Realm has the authority, deposit is allowed, withdrawal is not allowed. Dormant = Placeholder, signifies that the voting population is not yet active. 
     *
     *  @return Instruction to add to a transaction
    */
    async createCreateRealmInstruction (
        name: string, 
        communityTokenMint: PublicKey,
        minCommunityWeightToCreateGovernance: BN,
        payer: PublicKey,
        communityMintMaxVoterWeightSource: MintMaxVoteWeightSource = {type: "supplyFraction", amount: new BN(Math.pow(10,10))},
        councilTokenMint?: PublicKey,
        communityTokenType: "liquid" | "membership" | "dormant" = "liquid",
        councilTokenType: "liquid" | "membership" | "dormant" = "liquid",
        communityVoterWeightAddinProgramId?: PublicKey,
        maxCommunityVoterWeightAddinProgramId?: PublicKey,
        councilVoterWeightAddinProgramId?: PublicKey,
        maxCouncilVoterWeightAddinProgramId?: PublicKey,
    ) {
        return await govInstructions._createRealmContext(
            name, communityTokenMint, minCommunityWeightToCreateGovernance, communityMintMaxVoterWeightSource, 
            communityTokenType, councilTokenType, this.program, payer, this.pda, councilTokenMint, communityVoterWeightAddinProgramId,
            maxCommunityVoterWeightAddinProgramId, councilVoterWeightAddinProgramId, maxCouncilVoterWeightAddinProgramId
        )
    }

    /**
     * Construct a DepositGoverningTokens Instruction
     *
     * @param realmAccount The realm account
     * @param governingTokenMintAccount The Mint Account of the governing token (either community token or council token) for which deposit is to be made
     * @param governingTokenSourceAccount  It can be either TokenAccount (if tokens are to be transferred) or MintAccount (if tokens are to be minted)
     * @param governingTokenOwner The owner of the governing token account
     * @param governingTokenSourceAuthority It should be owner for TokenAccount and mint_authority for MintAccount
     * @param payer The payer of the transaction 
     * @param amount The amount to deposit into the realm
     *
     *  @return Instruction to add to a transaction
    */
    async createDepositGoverningTokensInstruction(
        realmAccount: PublicKey,
        governingTokenMintAccount: PublicKey,
        governingTokenSourceAccount: PublicKey,
        governingTokenOwner: PublicKey,
        governingTokenSourceAuthority: PublicKey,
        payer: PublicKey,
        amount: BN
    ) {
        return await govInstructions._depositGoverningTokensContext(
            realmAccount, governingTokenMintAccount, governingTokenSourceAccount, governingTokenOwner, 
            governingTokenSourceAuthority, amount, this.program, payer, this.pda
        );   
    }

    /**
     * Construct a WithdrawGoverningTokens Instruction
     *
     * @param realmAccount The realm account
     * @param governingTokenMintAccount The Mint Account of the governing token (either community token or council token) for which withdrawal is to be made
     * @param governingTokenDestinationAccount  The Token Account where tokens will be sent
     * @param governingTokenOwner The owner of the governing token account
     *
     *  @return Instruction to add to a transaction
    */
    async createWithdrawGoverningTokensInstruction(
        realmAccount: PublicKey,
        governingTokenMintAccount: PublicKey,
        governingTokenDestinationAccount: PublicKey,
        governingTokenOwner: PublicKey,
    ) {
        return await govInstructions._withdrawGoverningTokensContext(
            realmAccount, governingTokenMintAccount, governingTokenDestinationAccount, governingTokenOwner,
            this.program, this.pda
        )
    }

    /**
     * Construct a SetGovernanceDelegate Instruction
     *
     * @param tokenOwnerRecord Token Owner Record Account, pda(realm, governing_token_mint, governing_token_owner)
     * @param currentDelegateOrOwner Current Governance Delegate or Governing Token owner 
     * @param newGovernanceDelegate New Governance Delegate
     * 
     *  @return Instruction to add to a transaction
    */
     async createSetGovernanceDelegateInstruction(
        tokenOwnerRecord: PublicKey,
        currentDelegateOrOwner: PublicKey,
        newGovernanceDelegate: PublicKey | null,
    ) {
        return await govInstructions._setGovernanceDelegateContext(
            tokenOwnerRecord, currentDelegateOrOwner, newGovernanceDelegate, this.program
        )
    }

    /**
     * Construct a CreateGovernance Instruction
     *
     * @param config Governance Config
     * @param realmAccount The Realm Account
     * @param governanceAuthority Either the current delegate or governing token owner
     * @param tokenOwnerRecord Token Owner Record Account, pda(realm, governing_token_mint, governing_token_owner). Required only if the signer is not the realm authority
     * @param payer Payer of the transaction
     * @param governanceAccountSeed (Optional) Random public key to seed the governance account
     * 
     * @return Instruction to add to a transaction
    */
    async createCreateGovernanceInstruction(
        config: GovernanceConfig,
        realmAccount: PublicKey,
        governanceAuthority: PublicKey,
        tokenOwnerRecord: PublicKey = SystemProgram.programId,
        payer: PublicKey,
        governanceAccountSeed?: PublicKey,
        voterWeightRecord?: PublicKey
    ) {
        return await govInstructions._createGovernanceContext(
            config, realmAccount, governanceAuthority, tokenOwnerRecord, payer, this.program,
            this.pda, governanceAccountSeed, voterWeightRecord
        )
    }

    /**
     * Construct a CreateProposal Instruction
     *
     * @param name Name of the proposal
     * @param descriptionLink link to the gist/brief description of the proposal
     * @param voteType Proposal Vote Type. Either Single Choice or Multi Choice 
     * @param options The array of options
     * @param useDenyOption Indicates whether the proposal has the deny option
     * @param realmAccount The Realm Account
     * @param governanceAccount The governance account. pda(realm, governance seed)
     * @param tokenOwnerRecord Token Owner Record Account, pda(realm, governing_token_mint, governing_token_owner)
     * @param governingTokenMint The Mint Account of the governing token (either community token or council token) for which the proposal is created for
     * @param governanceAuthority Either the current delegate or governing token owner
     * @param payer Payer of the transaction
     * @param proposalSeed (Optional) Random public key to seed the proposal account
     * 
     * @return Instruction to add to a transaction
    */
    async createCreateProposalInstruction(
        name: string,
        descriptionLink: string,
        voteType: VoteType,
        options: [string],
        useDenyOption: boolean,
        realmAccount: PublicKey,
        governanceAccount: PublicKey,
        tokenOwnerRecord: PublicKey,
        governingTokenMint: PublicKey,
        governanceAuthority: PublicKey,
        payer: PublicKey,
        proposalSeed?: PublicKey,
        voterWeightRecord?: PublicKey
    ) {
        return await govInstructions._createProposalContext(
            name, descriptionLink, voteType, options, useDenyOption, realmAccount, governanceAccount,
            tokenOwnerRecord, governingTokenMint, governanceAuthority, payer, this.program, this.pda, 
            proposalSeed, voterWeightRecord
        )
    }

    /**
     * Construct a AddSignatory instruction
     *
     * @param signatory Signatory to add to the Proposal
     * @param proposalAccount Proposal account
     * @param tokenOwnerRecord Token Owner Record Account, pda(realm, governing_token_mint, governing_token_owner)
     * @param governanceAuthority Either the current delegate or governing token owner
     * @param payer Payer of the transaction
     * 
     * @return Instruction to add to a transaction
    */
    async crateAddSignatoryInstruction(
        signatory: PublicKey,
        proposalAccount: PublicKey,
        tokenOwnerRecord: PublicKey,
        governanceAuthority: PublicKey,
        payer: PublicKey,
    ) {
        return await govInstructions._addSignatoryContext(
            signatory, proposalAccount, tokenOwnerRecord, governanceAuthority, payer,
            this.program, this.pda
        )
    }

    /**
     * Construct a InsertTransaction instruction
     *
     * @param instructions Array of instructions to be inserted in the proposal
     * @param optionIndex The index of the proposal option this transaction is for
     * @param index The index where the transaction is to inserted
     * @param holdUpTime Waiting time (in seconds) between vote period ending and this being eligible for execution
     * @param governanceAccount The governance account. pda(realm, governance seed)
     * @param proposalAccount Proposal account
     * @param tokenOwnerRecord Token Owner Record Account, pda(realm, governing_token_mint, governing_token_owner)
     * @param governanceAuthority Either the current delegate or governing token owner
     * @param payer Payer of the transaction
     * 
     * @return Instruction to add to a transaction
    */
    async createInsertTransactionInstruction(
        instructions: TransactionInstruction[],
        optionIndex: number,
        index: number,
        holdUpTime: number,
        governanceAccount: PublicKey,
        proposalAccount: PublicKey,
        tokenOwnerRecord: PublicKey,
        governanceAuthority: PublicKey,
        payer: PublicKey,
    ) {
        return await govInstructions._insertTransactionContext(
            instructions, optionIndex, index, holdUpTime, governanceAccount, proposalAccount,
            tokenOwnerRecord, governanceAuthority, payer, this.program, this.pda
        )
    }

    /**
     * Construct a RemoveTransaction instruction
     *
     * @param proposalAccount Proposal account
     * @param tokenOwnerRecord Token Owner Record Account, pda(realm, governing_token_mint, governing_token_owner)
     * @param governanceAuthority Either the current delegate or governing token owner
     * @param proposalTransactionAccount Proposal Transaction Account, pda('governance', proposal, optionIndex, index)
     * @param beneficiaryAccount Beneficiary Account which would receive lamports from the disposed ProposalTransaction account
     * 
     * @return Instruction to add to a transaction
    */
    async createRemoveTransactionInstruction(
        proposalAccount: PublicKey,
        tokenOwnerRecord: PublicKey,
        governanceAuthority: PublicKey,
        proposalTransactionAccount: PublicKey,
        beneficiaryAccount: PublicKey
    ) {
        return await govInstructions._reomveTransactionContext(
            proposalAccount, tokenOwnerRecord, governanceAuthority, proposalTransactionAccount,
            beneficiaryAccount, this.program
        )
    }

    /**
     * Construct a CancelProposal instruction
     *
     * @param realmAccount The Realm Account
     * @param governanceAccount The governance account. pda(realm, governance seed)
     * @param proposalAccount Proposal account
     * @param tokenOwnerRecord Token Owner Record Account, pda(realm, governing_token_mint, governing_token_owner)
     * @param governanceAuthority Either the current delegate or governing token owner
     * 
     * @return Instruction to add to a transaction
    */
    async createCancelProposalInstruction(
        realmAccount: PublicKey,
        governanceAccount: PublicKey,
        proposalAccount: PublicKey,
        tokenOwnerRecord: PublicKey,
        governanceAuthority: PublicKey,
    ) {
        return await govInstructions._cancelProposalContext(
            realmAccount, governanceAccount, proposalAccount, tokenOwnerRecord,
            governanceAuthority, this.program
        )
    }

    /**
     * Construct a SignOffProposal instruction
     *
     * @param realmAccount The Realm Account
     * @param governanceAccount The governance account. pda(realm, governance seed)
     * @param proposalAccount Proposal account
     * @param signer Either Signatory Account or the proposal owner if signatory isn't appointed
     * @param signatoryRecordAccount (Optional) pda(proposal, signatory), required when non owner signs off the Proposal
     * @param tokenOwnerRecord (Optional) pda(realm, governing_token_mint, governing_token_owner), required when the owner signs off the proposal
     * 
     * @return Instruction to add to a transaction
    */
    async createSignOffProposalInstruction(
        realmAccount: PublicKey,
        governanceAccount: PublicKey,
        proposalAccount: PublicKey,
        signer: PublicKey,
        signatoryRecordAccount?: PublicKey,
        tokenOwnerRecord?: PublicKey,
    ) {
        return await govInstructions._signOffProposalContext(
            realmAccount, governanceAccount, proposalAccount, signer, this.program,
            signatoryRecordAccount, tokenOwnerRecord
        )
    }

    /**
     * Construct a CastVote instruction
     *
     * @param vote Vote
     * @param realmAccount The Realm Account
     * @param governanceAccount The governance account. pda(realm, governance seed)
     * @param proposalAccount Proposal account
     * @param proposalOwnerTokenOwnerRecord Proposal Owner's Token Owner Record account, pda(realm, governing_token_mint, proposal_owner)
     * @param voterTokenOwnerRecord Voter's Token Owner Record account, pda(realm, governing_token_mint, voter)
     * @param governanceAuthority Either the current delegate or governing token owner
     * @param governingTokenMint The Mint Account of the governing token (either community token or council token). For Veto vote, pass the opposite governing token mint
     * @param payer Payer of the transaction
     * 
     * 
     * @return Instruction to add to a transaction
    */
    async createCastVoteInstruction(
        vote: Vote,
        realmAccount: PublicKey,
        governanceAccount: PublicKey,
        proposalAccount: PublicKey,
        proposalOwnerTokenOwnerRecord: PublicKey,
        voterTokenOwnerRecord: PublicKey,
        governanceAuthority: PublicKey,
        governingTokenMint: PublicKey,
        payer: PublicKey,
        voterWeightRecord?: PublicKey,
        maxVoterWeightRecord?: PublicKey
    ) {
        return await govInstructions._castVoteContext(
            vote, realmAccount, governanceAccount, proposalAccount, proposalOwnerTokenOwnerRecord,
            voterTokenOwnerRecord, governanceAuthority, governingTokenMint, payer, this.program,
            this.pda, voterWeightRecord, maxVoterWeightRecord
        )
    }

    /**
     * Construct a FinalizeVote instruction
     *
     * @param realmAccount The Realm Account
     * @param governanceAccount The governance account. pda(realm, governance seed)
     * @param proposalAccount Proposal account
     * @param tokenOwnerRecord Proposal Owner's Token Owner Record account, pda(realm, governing_token_mint, proposal_owner)
     * @param governingTokenMint The Mint Account of the governing token (either community token or council token)
     * 
     * 
     * @return Instruction to add to a transaction
    */
    async createFinalizeVoteInstruction(
        realmAccount: PublicKey,
        governanceAccount: PublicKey,
        proposalAccount: PublicKey,
        tokenOwnerRecord: PublicKey,
        governingTokenMint: PublicKey,
        maxVoterWeightRecord?: PublicKey
    ) {
        return await govInstructions._finalizeVoteContext(
            realmAccount, governanceAccount, proposalAccount, tokenOwnerRecord, governingTokenMint,
            this.program, this.pda, maxVoterWeightRecord
        )
    }

    /**
     * Construct a RelinquishVote instruction
     *
     * @param realmAccount The Realm Account
     * @param governanceAccount The governance account. pda(realm, governance seed)
     * @param proposalAccount Proposal account
     * @param tokenOwnerRecord Token Owner Record account, pda(realm, governing_token_mint, governing_token_owner)
     * @param governingTokenMint The Mint Account of the governing token used for voting (either community token or council token)
     * @param governanceAuthority (Optional) Either the current delegate or governing token owner. Only needed if the proposal is still being voted on
     * @param beneficiaryAccount (Optional) Beneficiary Account which would receive lamports from the disposed VoteRecord account. Only needed if the proposal is still being voted on
     * 
     * 
     * @return Instruction to add to a transaction
    */
    async createRelinquishVoteInstruction(
        realmAccount: PublicKey,
        governanceAccount: PublicKey,
        proposalAccount: PublicKey,
        tokenOwnerRecord: PublicKey,
        governingTokenMint: PublicKey,
        governanceAuthority?: PublicKey,
        beneficiaryAccount?: PublicKey
    ) {
        return await govInstructions._relinquishVoteContext(
            realmAccount, governanceAccount, proposalAccount, tokenOwnerRecord, governingTokenMint,
            this.program, this.pda, governanceAuthority, beneficiaryAccount
        )
    }

    /**
     * Construct a ExecuteTransaction instruction
     *
     * @param governanceAccount The governance account. pda(realm, governance seed)
     * @param proposalAccount Proposal account
     * @param proposalTransactionAccount Proposal Transaction Account. pda('governance', proposal, option_index, index)
     * @param transactionAccounts Accounts that are part of the transaction, in order
     * 
     * 
     * @return Instruction to add to a transaction
    */   
    async createExecuteTransactionInstruction(
        governanceAccount: PublicKey,
        proposalAccount: PublicKey,
        proposalTransactionAccount: PublicKey,
        transactionAccounts: AccountMeta[],
    ) {
        return await govInstructions._executeTransactionContext(
            governanceAccount, proposalAccount, proposalTransactionAccount, transactionAccounts,
            this.program
        )
    }

    /**
     * Construct a CreateNativeTreasury instruction
     *
     * @param governanceAccount The governance account. pda(realm, governance seed)
     * @param payer Payer of the transaction
     * 
     * 
     * @return Instruction to add to a transaction
    */   
    async createCreateNativeTreasuryInstruction(
        governanceAccount: PublicKey,
        payer: PublicKey
    ) {
        return govInstructions._createNativeTreasuryContext(
            governanceAccount, payer, this.program, this.pda
        )
    }

    /**
     * Construct a SetGovernanceConfig instruction
     *
     * @param config Governance Config
     * @param governanceAccount The governance account. pda(realm, governance seed)
     * 
     * 
     * @return Instruction to add to a transaction
    */
    async createSetGovernanceConfigInstruction(
        config: GovernanceConfig,
        governanceAccount: PublicKey
    ) {
        return await govInstructions._setGovernanceConfigContext(
            config, governanceAccount, this.program
        )
    }

    /**
     * Construct a SetRealmAuthority instruction
     *
     * @param realmAccount The Realm Account
     * @param currentRealmAuthority The current Realm Authority
     * @param action "setChecked" - Sets realm authority and checks that the new authority is one of the realm's governances. "setUnchecked" - Sets new authority without any check. "remove" - Sets the realm authority to None.
     * @param newRealmAuthority (Optional) The new realm authority. Required when the action is not "remove"
     * 
     * 
     * @return Instruction to add to a transaction
    */
    async createSetRealmAuthorityInstruction(
        realmAccount: PublicKey,
        currentRealmAuthority: PublicKey,
        action: "setChecked" | "setUnchecked" | "remove",
        newRealmAuthority?: PublicKey
    ) {
        return await govInstructions._setRealmAuthorityContext(
            realmAccount, currentRealmAuthority, action, this.program, newRealmAuthority
        )
    }

    /**
     * Construct a SetRealmConfig instruction
     *
     * @param config New Realm Config
     * @param realmAccount The Realm Account
     * @param realmAuthority The current Realm Authority
     * @param payer Payer of the transaction
     * @param councilTokenMint (Optional) Mint Account of the token used as the council token. Required if the council is removed
     * 
     * 
     * @return Instruction to add to a transaction
    */
    async createSetRealmConfigInstruciton(
        config: RealmConfigArgs,
        realmAccount: PublicKey,
        realmAuthority: PublicKey,
        payer: PublicKey,
        councilTokenMint?: PublicKey,
        communityVoterWeightAddinProgramId?: PublicKey,
        maxCommunityVoterWeightAddinProgramId?: PublicKey,
        councilVoterWeightAddinProgramId?: PublicKey,
        maxCouncilVoterWeightAddinProgramId?: PublicKey,
    ) {
        return await govInstructions._setRealmConfigContext(
            config, realmAccount, realmAuthority, payer, this.program, this.pda, councilTokenMint, 
            communityVoterWeightAddinProgramId, maxCommunityVoterWeightAddinProgramId, 
            councilVoterWeightAddinProgramId, maxCouncilVoterWeightAddinProgramId
        )
    }

    /**
     * Construct a CreateTokenOwnerRecord instruction
     *
     * @param realmAccount The Realm Account
     * @param governingTokenOwner The owner of the governing token account
     * @param governingTokenMintAccount The Mint Account of the governing token
     * @param payer Payer of the transaction
     * 
     * 
     * @return Instruction to add to a transaction
    */
    async createCreateTokenOwnerRecordInstruction(
        realmAccount: PublicKey,
        governingTokenOwner: PublicKey,
        governingTokenMint: PublicKey,
        payer: PublicKey,
    ) {
        return await govInstructions._createTokenOwnerRecordContext(
            realmAccount, governingTokenOwner, governingTokenMint, payer, this.program,
            this.pda
        )
    }

    /**
     * Construct a RevokeGoverningTokens instruction
     *
     * @param amount The number of tokens to revoke
     * @param realmAccount The Realm Account
     * @param tokenOwnerRecord Token Owner Record Account, pda(realm, governing_token_mint, governing_token_owner)
     * @param governingTokenMintAccount The Mint Account of the governing token
     * @param revokeAuthority Either the mint authority of the governing token or governing token owner
     * 
     * 
     * @return Instruction to add to a transaction
    */
    async createRevokeGoverningTokensInstruction(
        amount: BN,
        realmAccount: PublicKey,
        tokenOwnerRecord: PublicKey,
        governingTokenMint: PublicKey,
        revokeAuthority: PublicKey,
    ) {
        return await govInstructions._revokeGoverningTokensContext(
            amount, realmAccount, tokenOwnerRecord, governingTokenMint, revokeAuthority,
            this.program, this.pda
        )
    }

    /**
     * Construct a RefundProposalDeposit instruction
     *
     * @param proposalAccount The proposal account
     * @param depositPayer Proposal deposit payer (beneficiary) account
     * 
     * 
     * @return Instruction to add to a transaction
    */
    async createRefundProposalDepositInstruction(
        proposalAccount: PublicKey,
        depositPayer: PublicKey,
    ) {
        return await govInstructions._refundProposalDepositContext(
            proposalAccount, depositPayer, this.program, this.pda
        )
    }

    /**
     * Construct a CompleteProposal instruction
     *
     * @param proposalAccount The proposal account
     * @param tokenOwnerRecord Token Owner Record Account of the proposal owner, pda(realm, governing_token_mint, proposal_owner)
     * @param completeProposalAuthority Either the current delegate or governing token owner
     * 
     * 
     * @return Instruction to add to a transaction
    */
    async createCompleteProposalInstruction(
        proposalAccount: PublicKey,
        tokenOwnerRecord: PublicKey,
        completeProposalAuthority: PublicKey,
    ) {
        return await govInstructions._completeProposalContext(
            proposalAccount, tokenOwnerRecord, completeProposalAuthority, this.program
        )
    }
}

export * from "./types";
export * from "./constant";
