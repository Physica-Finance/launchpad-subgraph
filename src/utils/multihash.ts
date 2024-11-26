import bs58 from './bs58'
import {Bytes} from "@graphprotocol/graph-ts";

/**
 * @typedef {Object} Multihash
 * @property {string} digest The digest output of hash function in hex with prepended '0x'
 * @property {number} hashFunction The hash function code for the function used
 * @property {number} size The length of digest
 */

class Multihash {
    constructor(digest: Uint8Array, hashFunction: u32, size: u32) {
        this.digest = digest
        this.hashFunction = hashFunction
        this.size = size
    }

    digest: Uint8Array
    hashFunction: u32
    size: u32
}

/**
 * Partition multihash string into object representing multihash
 *
 * @param {string} multihash A base58 encoded multihash string
 * @returns {Multihash}
 */
export function getBytes32FromMultiash(multihash: string): Multihash {
    const decoded = bs58.decode(multihash)

    return {
        digest: decoded.subarray(2),
        hashFunction: decoded[0],
        size: decoded[1],
    }
}

/**
 * Encode a multihash structure into base58 encoded multihash string
 *
 * @param {Multihash} multihash
 * @returns {(string|null)} base58 encoded multihash string
 */
export function getMultihashFromBytes32(multihash: Multihash): string | null {
    if (multihash.size === 0) return null

    // cut off leading "0x"
    const hashBytes = multihash.digest.slice(2)

    // prepend hashFunction and digest size
    const multihashBytes = new Bytes(2 + hashBytes.length)
    multihashBytes[0] = multihash.hashFunction
    multihashBytes[1] = multihash.size
    multihashBytes.set(hashBytes, 2)

    return multihashBytes.toBase58()
}


export function getMultihashFromContractReponseSingle(digest: Uint8Array, hashFunction: u32, size: u32): string | null {
    return getMultihashFromBytes32(new Multihash(digest, hashFunction, size))
}
