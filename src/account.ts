import idl from "./idl/gov.json";
import chatIdl from "./idl/chat.json";
import addinIdl from "./idl/addin.json";
import {BorshAccountsCoder} from "@coral-xyz/anchor/dist/cjs/coder/borsh/accounts";
import { GovernanceIdl, ChatIdl, AddinIdl } from "./idl/idl";
import { Connection, GetProgramAccountsConfig, GetProgramAccountsFilter, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

export function deserialize(name: string, data: Buffer, pubkey: PublicKey, programType?: "chat" | "addin") {
    const coder = programType === "chat" ?
     new BorshAccountsCoder(chatIdl as ChatIdl) :
     programType === "addin" ?
     new BorshAccountsCoder(addinIdl as AddinIdl) :
     new BorshAccountsCoder(idl as GovernanceIdl);

    // Prepend 8-byte default discriminator
    const modifiedData = Buffer.concat([Buffer.from("0".repeat(16), "hex"),data]);
    return {
        ...coder.decodeUnchecked(name, modifiedData),
        publicKey: pubkey
    }
}

export async function fetchAndDeserialize(
    connection: Connection,
    pubkey: PublicKey,
    name: string,
    programType?: "chat" | "addin"
) {
    const account = await connection.getAccountInfo(pubkey);

    if (account?.data) {
        return {...deserialize(name, account.data, pubkey, programType), balance: account.lamports / LAMPORTS_PER_SOL};
    } else {
        throw Error("The account doesn't exist.");
    }
}

export async function fetchMultipleByAddressAndDeserialize(
    connection: Connection,
    addresses: PublicKey[],
    name: string,
    programType?: "chat" | "addin"
) {
  if (addresses.length > 100) throw Error("getMultipleAccounts has a maximum of 100 accounts.")

  const accounts = await connection.getMultipleAccountsInfo(addresses);

  if(accounts.length != addresses.length) throw Error("fetchMultipleByAddressAndDeserialize: accounts.length != addresses.length!")

  const deserializeAccounts = accounts.map((acc, index) => {
      if (acc!= null && acc.data) {
            try {
                return {
                    ...deserialize(name, acc.data, addresses[index], programType),
                    balance: acc.lamports/LAMPORTS_PER_SOL
                }
            } catch {
                return
            }
        } else {
            throw Error("The account doesn't exist.")
        }
  })

  return deserializeAccounts.filter(a => a !== undefined)
}


export async function fetchMultipleAccounts(
    connection: Connection,
    programId: PublicKey,
    name: string,
    options: {
        initialByte?: string,
        customOffset?: number[],
        customOffsetAddress?: (PublicKey | string)[],
        accountSize?: number,
        programType?: "chat" | "addin",
        minSlot?: number,
        deserialize?: boolean
    }
) {
  const filters: GetProgramAccountsFilter[] = [];

    if (options.initialByte) {
        filters.push({
            memcmp: {
                offset: 0,
                bytes: options.initialByte
            }
        });
    }

    if (options.customOffset && options.customOffsetAddress) {
        options.customOffset.forEach((offset, index) => {
            const offsetValue = options.customOffsetAddress![index];
            filters.push({
                memcmp: {
                    offset,
                    bytes: typeof offsetValue === "string" ? offsetValue : offsetValue.toBase58()
                }
            });
        });
    }

    if (options.accountSize) {
        filters.push({
            dataSize: options.accountSize
        });
    }

    const getProgramAccountsConfig: GetProgramAccountsConfig = { filters };

    //if deserialize if null or undefined set it to true.
    options.deserialize ??= true;

    // Only add dataSlice if we don't need to deserialize
    if (!options.deserialize) {
        getProgramAccountsConfig.dataSlice = {
            length: 0,
            offset: 0
        };
    }

    const accounts = await connection.getProgramAccounts(programId, getProgramAccountsConfig);

    if (!options.deserialize) {
        return accounts.map(acc => acc.pubkey);
    }

    const deserializedAccounts = accounts.map(acc => {
        if (acc.account.data) {
            try {
                return {
                    ...deserialize(name, acc.account.data, acc.pubkey, options.programType),
                    balance: acc.account.lamports/LAMPORTS_PER_SOL
                };
            } catch {
                return undefined;
            }
        } else {
            throw Error("The account doesn't exist.");
        }
    });

    return deserializedAccounts.filter(a => a !== undefined);
}
