import idl from "./idl/gov.json";
import chatIdl from "./idl/chat.json";
import {BorshAccountsCoder} from "@coral-xyz/anchor/dist/cjs/coder/borsh/accounts";
import { GovernanceIdl, ChatIdl } from "./idl/idl";
import { Connection, PublicKey } from "@solana/web3.js";

export function deserialize(name: string, data: Buffer, pubkey: PublicKey, isChatAccount?: boolean) {
    const coder = isChatAccount ?
     new BorshAccountsCoder(chatIdl as ChatIdl) :
     new BorshAccountsCoder(idl as GovernanceIdl);

    // Prepend 8-byte default discriminator
    const modifiedData = Buffer.concat([Buffer.from("0".repeat(16), "hex"),data]);
    return {
        ...coder.decodeUnchecked(name, modifiedData),
        publicKey: pubkey
    }
}

export async function fetchAndDeserialize(connection: Connection, pubkey: PublicKey, name: string, isChatAccount?: boolean) {
    const account = await connection.getAccountInfo(pubkey);

    if (account?.data) {
        return deserialize(name, account.data, pubkey, isChatAccount);
    } else {
        throw Error("The account doesn't exist.");
    }
}

export async function fetchMultipleAndDeserialize(
    connection: Connection, 
    programId: PublicKey,
    name: string, 
    initialByte?: string, 
    customOffset?: number,
    customOffsetAddress?: PublicKey,
    accountSize?: number,
    isChatAccount?: boolean
) {
    const filters = [];

    if (initialByte) {
        filters.push(
            {
                memcmp: {
                    offset: 0,
                    bytes: initialByte
                }
            }
        )
    }

    if (customOffset && customOffsetAddress) {
        filters.push({
            memcmp: {
                offset: customOffset,
                bytes: customOffsetAddress.toBase58()
            }
        })
    }

    if (accountSize) {
        filters.push(
            {
                dataSize: accountSize
              },
        )
    }

    const accounts = await connection.getProgramAccounts(programId, {
        filters
    })

    const deserializeAccounts = accounts.map(acc => {
        if (acc.account.data) {
            try {
                return deserialize(name, acc.account.data, acc.pubkey, isChatAccount)
            } catch {
                return
            }
        } else {
            throw Error("The account doesn't exist.")
        }
    })

    return deserializeAccounts.filter(a => a !== undefined)
}