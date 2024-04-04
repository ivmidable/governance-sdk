import idl from "./idl/gov.json";
import {BorshAccountsCoder} from "@coral-xyz/anchor/dist/cjs/coder/borsh/accounts";
import { GovernanceIdl } from "./idl/idl";
import { Connection, PublicKey } from "@solana/web3.js";

const coder = new BorshAccountsCoder(idl as GovernanceIdl);

export function deserialize(name: string, data: Buffer, pubkey: PublicKey) {
    // Prepend 8-byte default discriminator
    const modifiedData = Buffer.concat([Buffer.from("0".repeat(16), "hex"),data]);
    return {
        ...coder.decodeUnchecked(name, modifiedData),
        publicKey: pubkey
    }
}

export async function fetchAndDeserialize(connection: Connection, pubkey: PublicKey, name: string) {
    const account = await connection.getAccountInfo(pubkey);

    if (account?.data) {
        return deserialize(name, account.data, pubkey);
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
    customOffsetAddress?: PublicKey
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

    const accounts = await connection.getProgramAccounts(programId, {
        filters
    })

    const deserializeAccounts = accounts.map(acc => {
        if (acc.account.data) {
            try {
                return deserialize(name, acc.account.data, acc.pubkey)
            } catch {
                return
            }
        } else {
            throw Error("The account doesn't exist.")
        }
    })

    return deserializeAccounts.filter(a => a !== undefined)
}