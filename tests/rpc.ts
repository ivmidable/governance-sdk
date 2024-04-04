import { Rpc } from "../src"
import {assert} from "chai"
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js"

describe('Governance RPC', () => {
    const connection = new Connection(clusterApiUrl('devnet'))
    const govRpc = new Rpc(connection)
    const realmAddress = new PublicKey("FfJ8awaN9Ut4d3S82DSaLBcKUV3RfvRACo9D1DyqEXAm")
    const realmName = 'devnet-main-dao'
    const tokenOwner = new PublicKey("3DvJWcHhtdhNLWMeBCh2Rma5chxyDWxoMmVvBFLihMZe")
    const tokenMint = new PublicKey("2C8StuPz5YwRCknt2vUDr8AVkPb5oMFcvnib4T1kgNkP")
    const governanceAddress = new PublicKey("78ACK8u2jggWAYZWTPvPydgUDamKjJdL43ZAgqV5zumX")
    const proposalAddress = new PublicKey("3W61aZ8B1L3jMHRuXxwpkMxYQW2kSKa1ZqT6QJBqMMDZ")
    const outstandingProposal = new PublicKey("AdRXEbB7dkAJPndBDNgzKqPAY5T8EVvJkrHVS2ip1Pbm")

    const tokenOwnerRecordAddress = govRpc.pda.tokenOwnerRecordAccount({
        realmAccount: realmAddress,
        governingTokenMintAccount: tokenMint,
        governingTokenOwner: tokenOwner
    }).publicKey

    describe('Realm Accounts', () => {
        it('should fetch all the realms', async() => {
            const realms = await govRpc.getAllRealms()
            
            realms.forEach(realm => {
                assert.typeOf(realm.name, 'string')
            })
        })

        it('should fetch realm based on the public key', async() => {
            const realmAccFromPubkey = await govRpc.getRealmByPubkey(realmAddress)
            assert.equal(realmAccFromPubkey.name, realmName)
        })

        it('should fetch realm based on its name', async() => {
            const realmAccFromPubkey = await govRpc.getRealmByName(realmName)
            assert.equal(realmAccFromPubkey.publicKey.toBase58(), realmAddress.toBase58())
        })

        it('should fetch realms having the same community mint', async() => {
            const communityMint = new PublicKey("6PhvsYjWh4iATUR6K8Bs2L7PvdLbc33VasVZxLP7YfDt")
            const realmsByMint = await govRpc.getRealmsByCommunityMint(communityMint)

            realmsByMint.forEach(realm => {
                assert.equal(realm.communityMint.toBase58(), communityMint.toBase58())
            })
        })

        it('should fetch realm config from realm address', async() => {
            const realmConfigAccountFromRealm = await govRpc.getRealmConfigByRealm(realmAddress)
            assert.equal(realmConfigAccountFromRealm.realm.toBase58(), realmAddress.toBase58())
        })     
        
        it('should fetch realm config its pubkey', async() => {
            const realmConfigAddress = govRpc.pda.realmConfigAccount({realmAccount: realmAddress}).publicKey
            const realmConfigAccountFromRealm = await govRpc.getRealmConfigByPubkey(realmConfigAddress)
            assert.equal(realmConfigAccountFromRealm.publicKey.toBase58(), realmConfigAddress.toBase58())
        })
    })

    describe("Token Owner Record", () => {
        it("should fetch token owner record from the the token owner and token mint", async() => {
            const tokenOwnerRecordAccount = await govRpc.getTokenOwnerRecord(realmAddress, tokenOwner, tokenMint)
            assert.equal(tokenOwnerRecordAccount.realm.toBase58(), realmAddress.toBase58())
            assert.equal(tokenOwnerRecordAccount.governingTokenOwner.toBase58(), tokenOwner.toBase58())
            assert.equal(tokenOwnerRecordAccount.governingTokenMint.toBase58(), tokenMint.toBase58())
        })

        it("should fetch token owner records for the given realm", async() => {
            const allTORForRealm = await govRpc.getTokenOwnerRecordsForRealm(realmAddress)

            allTORForRealm.forEach(tor => {
                assert.equal(tor.realm.toBase58(), realmAddress.toBase58())
            })
        })

        it("should fetch token owner records for the given owner", async() => {
            const allTORForOwner = await govRpc.getTokenOwnerRecordsForOwner(tokenOwner)

            allTORForOwner.forEach(tor => {
                assert.equal(tor.governingTokenOwner.toBase58(), tokenOwner.toBase58())
            })
        })

        it("should fetch token owner records for the given mint", async() => {
            const allTORForMint = await govRpc.getTokenOwnerRecordsForMint(tokenMint)

            allTORForMint.forEach(tor => {
                assert.equal(tor.governingTokenMint.toBase58(), tokenMint.toBase58())
            })
        })
    })

    describe("Governance Account", () => {
        it("should fetch governance account from its public key", async() => {
            const goveranceAccount = await govRpc.getGovernanceAccountByPubkey(governanceAddress)
            assert.equal(goveranceAccount.publicKey.toBase58(), governanceAddress.toBase58())
        })

        it("should fetch governance accounts for a given realm", async() => {
            const difRealmAddress = new PublicKey("6Hp9H5iyu5PqhZBBWXH2iomAb1rqjhF6G1CaU3xTiQcA")
            const goveranceAccountsForRealm = await govRpc.getGovernanceAccountsByRealm(difRealmAddress)

            goveranceAccountsForRealm.forEach(goverannce => {
                assert.equal(goverannce.realm.toBase58(), difRealmAddress.toBase58())
            })
        })
    })

    describe("Proposal Account", () => {
        it("should fetch proposal account from its public key", async() => {
            const proposalAccount = await govRpc.getProposalByPubkey(proposalAddress)
            assert.equal(proposalAccount.publicKey.toBase58(), proposalAddress.toBase58())
            assert.typeOf(proposalAccount.name, 'string')
        })

        it("should fetch proposal accounts for the given governance", async() => {
            const allProposalsForGovernance = await govRpc.getProposalsforGovernance(governanceAddress)
            allProposalsForGovernance.forEach(proposal => {
                assert.equal(proposal.governance.toBase58(), governanceAddress.toBase58())
            })
        })

        it("should fetch all the proposals for the given Token Owner Record", async() => {
            const allProposalsForTOR = await govRpc.getProposalsByTokenOwnerRecord(tokenOwnerRecordAddress)

            allProposalsForTOR.forEach(proposal => {
                assert.equal(proposal.tokenOwnerRecord.toBase58(), tokenOwnerRecordAddress.toBase58())
            })
        })
    })

    describe("Proposal Deposit Account", () => {
        const proposalDepositAddress = new PublicKey("4wviuQjtEYZ1Qh6ZSR22mPXSpJFwZzLWsqi5LtkcH2yi")

        it("should fetch proposal deposit account from its public key", async() => {
            const proposalDepositAccount = await govRpc.getProposalDepositByPubkey(proposalDepositAddress)
            assert.equal(proposalDepositAccount.publicKey.toBase58(), proposalDepositAddress.toBase58())
        })

        it("should fetch proposal deposit accounts from the proposal's public key", async() => {
            const proposalDepositAccounts = await govRpc.getProposalDepositByProposal(outstandingProposal)
            proposalDepositAccounts.forEach(proposal => {
                assert.equal(proposal.proposal.toBase58(), outstandingProposal.toBase58())
            })
        })
    })

    describe("Proposal Transaction Account", () => {
        it("should fetch proposal transaction from proposal key", async() => {
            const proposalWithTx = new PublicKey("4hLcVBuhrzFyF9qkNdJskWrb3j7ELcUzaYu8RKVCf5EU")
            const proposalTxsByProposal = await govRpc.getProposalTransactionsByProposal(proposalWithTx)

            proposalTxsByProposal.forEach(tx => {
                assert.equal(tx.proposal.toBase58(), proposalWithTx.toBase58())
            })
        })
    })

    describe("Signatory Record Account", () => {
        it("should fetch signatory record from its public key", async() => {
            const signatoryRecordAddress = govRpc.pda.signatoryRecordAccount({
                proposal: proposalAddress, 
                signatory: tokenOwner
            }).publicKey

            const signatoryRecordAccount = await govRpc.getSignatoryRecordByPubkey(signatoryRecordAddress)

            assert.equal(signatoryRecordAccount.publicKey.toBase58(), signatoryRecordAddress.toBase58())
        })

        it("should fetch signatory record account", async() => {
            const signatoryRecord = await govRpc.getSignatoryRecord(proposalAddress, tokenOwner)
            assert.equal(signatoryRecord.proposal.toBase58(), proposalAddress.toBase58())
            assert.equal(signatoryRecord.signatory.toBase58(), tokenOwner.toBase58())
        })

        it("should fetch signatory records from the proposal's public key", async() => {
            const signatoryRecords = await govRpc.getSignatoryRecordsForProposal(proposalAddress)
            signatoryRecords.forEach(record => {
                assert.equal(record.proposal.toBase58(), proposalAddress.toBase58())
            })
        })
    })

    describe("Vote Record Account", () => {
        it("should fetch vote record for the proposal from TOR", async() => {
            const voteRecord = await govRpc.getVoteRecord(proposalAddress, tokenOwnerRecordAddress)
            assert.equal(voteRecord.proposal.toBase58(), proposalAddress.toBase58())
            assert.equal(voteRecord.governingTokenOwner.toBase58(), tokenOwner.toBase58())
        })

        it("should fetch vote records for the proposal", async() => {
            const voteRecordsForProposal = await govRpc.getVoteRecordsForProposal(outstandingProposal)
            voteRecordsForProposal.forEach(record => {
                assert.equal(record.proposal.toBase58(), outstandingProposal.toBase58())
            })
        })

        it("should fetch vote records for the user", async() => {
            const voteRecordsForProposal = await govRpc.getVoteRecordsForUser(tokenOwner)
            voteRecordsForProposal.forEach(record => {
                assert.equal(record.governingTokenOwner.toBase58(), tokenOwner.toBase58())
            })
        })
    })
})