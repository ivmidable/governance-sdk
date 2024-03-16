
// // POST APIs

//     /**
//      * Send a CreateRealm transaction
//      *
//      * @param name Name for the new realm (must be unique)
//      * @param communityTokenMint Mint Account of the token to be used as community token
//      * @param minCommunityWeightToCreateGovernance  Min number of community tokens required to create a governance
//      * @param communityMintMaxVoterWeightSource (Optional) The default value is `{type: "supplyFraction", amount: new BN(Math.pow(10,10))}`. Max vote weight type can either be `supplyFraction` or `absolute`. For supply fraction, the amount is in percentage with `10^10` precision, e.g. `100% becomes 10^10`. For absolute, the amount is in actual tokens.
//      * @param councilTokenMint (Optional) Mint Account of the token to be used as council token. Council won't be created if this isn't provided
//      * @param communityTokenType (Optional) The default value is `liquid`. Defines who retains the authority over deposited tokens and which token instructions are allowed. Liquid = token owner has the authority, deposit and withdrawal is allowed. Membership = Realm has the authority, deposit is allowed, withdrawal is not allowed. Dormant = Placeholder, signifies that the voting population is not yet active. 
//      * @param councilTokenType (Optional) The default value is `liquid`. Defines who retains the authority over deposited tokens and which token instructions are allowed. Liquid = token owner has the authority, deposit and withdrawal is allowed. Membership = Realm has the authority, deposit is allowed, withdrawal is not allowed. Dormant = Placeholder, signifies that the voting population is not yet active. 
//      * 
//      *  @return Signature of the confirmed transaction
//     */
//      async createRealm(
//         name: string, 
//         communityTokenMint: PublicKey,
//         minCommunityWeightToCreateGovernance: BN,
//         communityMintMaxVoterWeightSource: MintMaxVoteWeightSource = {type: "supplyFraction", amount: new BN(Math.pow(10,10))},
//         councilTokenMint?: PublicKey,
//         communityTokenType: "liquid" | "membership" | "dormant" = "liquid",
//         councilTokenType: "liquid" | "membership" | "dormant" = "liquid",
//         communityVoterWeightAddinProgramId?: PublicKey,
//         maxCommunityVoterWeightAddinProgramId?: PublicKey,
//         councilVoterWeightAddinProgramId?: PublicKey,
//         maxCouncilVoterWeightAddinProgramId?: PublicKey,
//     ) {
//         const ix = await instructions._createRealmContext(
//             name, communityTokenMint, minCommunityWeightToCreateGovernance, communityMintMaxVoterWeightSource, 
//             communityTokenType, councilTokenType, this.program, this._provider.publicKey, this.pda, councilTokenMint, 
//             communityVoterWeightAddinProgramId, maxCommunityVoterWeightAddinProgramId, councilVoterWeightAddinProgramId, 
//             maxCouncilVoterWeightAddinProgramId
//         );
        
//         return await this.sendTx(ix)
//     }

//     /**
//      * Send a DepositGoverningTokens transaction
//      *
//      * @param realmAccount The realm account
//      * @param governingTokenMintAccount The Mint Account of the governing token (either community token or council token) for which deposit is to be made
//      * @param governingTokenSourceAccount  It can be either TokenAccount (if tokens are to be transferred) or MintAccount (if tokens are to be minted)
//      * @param governingTokenOwner The owner of the governing token account
//      * @param governingTokenSourceAuthority It should be owner for TokenAccount and mint_authority for MintAccount
//      * @param amount The amount to deposit into the realm
//      *
//      *  @return Signature of the confirmed transaction
//     */
//     async depositGoverningTokens(
//         realmAccount: PublicKey,
//         governingTokenMintAccount: PublicKey,
//         governingTokenSourceAccount: PublicKey,
//         governingTokenOwner: PublicKey,
//         governingTokenSourceAuthority: PublicKey,
//         amount: BN
//     ) {
//         const ix = await instructions._depositGoverningTokensContext(
//             realmAccount, governingTokenMintAccount, governingTokenSourceAccount, governingTokenOwner, 
//             governingTokenSourceAuthority, amount, this.program, this._provider.publicKey, this.pda
//         );

//         return await this.sendTx(ix)
//     }

//     /**
//      * Send a WithdrawGoverningTokens transaction
//      *
//      * @param realmAccount The realm account
//      * @param governingTokenMintAccount The Mint Account of the governing token (either community token or council token) for which withdrawal is to be made
//      * @param governingTokenDestinationAccount  The Token Account where tokens will be sent
//      * @param governingTokenOwner The owner of the governing token account
//      *
//      *  @return Signature of the confirmed transaction
//     */
//      async withdrawGoverningTokens(
//         realmAccount: PublicKey,
//         governingTokenMintAccount: PublicKey,
//         governingTokenDestinationAccount: PublicKey,
//         governingTokenOwner: PublicKey,
//     ) {
//         const ix = await instructions._withdrawGoverningTokensContext(
//             realmAccount, governingTokenMintAccount, governingTokenDestinationAccount, governingTokenOwner,
//             this.program, this.pda
//         )

//         return await this.sendTx(ix)
//     }

//     /**
//      * Send a SetGovernanceDelegate transaction
//      *
//      * @param tokenOwnerRecord Token Owner Record Account, pda(realm, governing_token_mint, governing_token_owner)
//      * @param currentDelegateOrOwner Current Governance Delegate or Governing Token owner 
//      * @param newGovernanceDelegate New Governance Delegate
//      * 
//      *  @return Signature of the confirmed transaction
//     */
//     async setGovernanceDelegate(
//         tokenOwnerRecord: PublicKey,
//         currentDelegateOrOwner: PublicKey,
//         newGovernanceDelegate: PublicKey | null,
//     ) {
//         const ix = await instructions._setGovernanceDelegateContext(
//             tokenOwnerRecord, currentDelegateOrOwner, newGovernanceDelegate, this.program
//         )

//         return await this.sendTx(ix)
//     }

//     /**
//      * Send a CreateGovernance transaction
//      *
//      * @param config Governance Config
//      * @param realmAccount The Realm Account
//      * @param governanceAuthority Either the current delegate or governing token owner
//      * @param tokenOwnerRecord Token Owner Record Account, pda(realm, governing_token_mint, governing_token_owner). Required only if the signer is not the realm authority
//      * @param governanceAccountSeed (Optional) Random public key to seed the governance account
//      * 
//      *  @return Signature of the confirmed transaction
//     */
//     async createGovernance(
//         config: GovernanceConfig,
//         realmAccount: PublicKey,
//         governanceAuthority: PublicKey,
//         tokenOwnerRecord: PublicKey = SystemProgram.programId,
//         governanceAccountSeed?: PublicKey,
//         voterWeightRecord?: PublicKey
//     ) {
//         const ix = await instructions._createGovernanceContext(
//             config, realmAccount, governanceAuthority, tokenOwnerRecord, this._provider.publicKey, this.program,
//             this.pda, governanceAccountSeed, voterWeightRecord
//         )

//         return await this.sendTx(ix)
//     }

//     /**
//      * Send a CreateProposal transaction
//      *
//      * @param name Name of the proposal
//      * @param descriptionLink link to the gist/brief description of the proposal
//      * @param voteType Proposal Vote Type. Either Single Choice or Multi Choice 
//      * @param options The array of options
//      * @param useDenyOption Indicates whether the proposal has the deny option
//      * @param realmAccount The Realm Account
//      * @param governanceAccount The governance account. pda(realm, governance seed)
//      * @param tokenOwnerRecord Token Owner Record Account, pda(realm, governing_token_mint, governing_token_owner)
//      * @param governingTokenMint The Mint Account of the governing token (either community token or council token) for which the proposal is created for
//      * @param governanceAuthority Either the current delegate or governing token owner
//      * @param proposalSeed (Optional) Random public key to seed the proposal account
//      * 
//      * @return Signature of the confirmed transaction
//     */
//     async createProposal(
//         name: string,
//         descriptionLink: string,
//         voteType: VoteType,
//         options: [string],
//         useDenyOption: boolean,
//         realmAccount: PublicKey,
//         governanceAccount: PublicKey,
//         tokenOwnerRecord: PublicKey,
//         governingTokenMint: PublicKey,
//         governanceAuthority: PublicKey,
//         proposalSeed?: PublicKey,
//         voterWeightRecord?: PublicKey
//     ) {
//         const ix = await instructions._createProposalContext(
//             name, descriptionLink, voteType, options, useDenyOption, realmAccount, governanceAccount,
//             tokenOwnerRecord, governingTokenMint, governanceAuthority, this._provider.publicKey, this.program, this.pda, 
//             proposalSeed, voterWeightRecord
//         )

//         return await this.sendTx(ix)
//     }

//     /**
//      * Send a AddSignatory transaction
//      *
//      * @param governanceAccount The governance account. pda(realm, governance seed)
//      * @param proposalAccount Proposal account associated with the governance
//      * @param signatory Signatory to add to the Proposal
//      * 
//      * @return Signature of the confirmed transaction
//     */
//     async addSignatory(
//         signatory: PublicKey,
//         governanceAccount: PublicKey,
//         proposalAccount: PublicKey,
        
//     ) {
//         const ix = await instructions._addSignatoryContext()
//     }