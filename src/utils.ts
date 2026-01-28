/**
 * Prepends a '0' to an odd character length word to ensure it has an even number of characters.
 * @param {string} word - The input word.
 * @returns {string} - The word with a leading '0' if it's an odd character length; otherwise, the original word.
 */
export const zero2 = (word: string): string => {
    if (word.length % 2 === 1) {
        return '0' + word
    } else {
        return word
    }
}

/**
 * Converts an array of numbers to a hexadecimal string representation.
 * @param {number[]} msg - The input array of numbers.
 * @returns {string} - The hexadecimal string representation of the input array.
 */
export const toHex = (msg: number[]): string => {
    let res = ''
    for (let i = 0; i < msg.length; i++) {
        res += zero2(msg[i].toString(16))
    }
    return res
}

export function chunks<T>(bin: T[], chunkSize: number): T[][] {

    const chunks: T[][] = [];
    let offset = 0;

    while (offset < bin.length) {
        const chunk = bin.slice(offset, offset + chunkSize);
        chunks.push(chunk);
        offset += chunkSize;
    }

    return chunks;
}

export function chunkBytes(bin: Uint8Array, chunkSize: number): Uint8Array[] {
    const chunks: Uint8Array[] = [];
    let offset = 0;

    while (offset < bin.length) {
        const chunk = bin.subarray(offset, offset + chunkSize);
        chunks.push(chunk);
        offset += chunkSize;
    }

    return chunks;
}

export function writeUInt8(buf: Uint8Array, value: number, offset = 0): void {
    buf[offset] = value & 0xff;
}

export function writeUInt16LE(buf: Uint8Array, value: number, offset = 0): void {
    buf[offset] = value & 0xff;
    buf[offset + 1] = (value >> 8) & 0xff;
}

export function writeUInt32LE(buf: Uint8Array, value: number, offset = 0): void {
    buf[offset] = value & 0xff;
    buf[offset + 1] = (value >> 8) & 0xff;
    buf[offset + 2] = (value >> 16) & 0xff;
    buf[offset + 3] = (value >> 24) & 0xff;
}

export function toPushData(data: Uint8Array): Uint8Array {
    const res: Array<Uint8Array> = []

    const dLen = data.length
    if (dLen < 0x4c) {
        const dLenBuff = new Uint8Array(1)
        writeUInt8(dLenBuff, dLen)
        res.push(dLenBuff)
    } else if (dLen <= 0xff) {
        // OP_PUSHDATA1
        res.push(Uint8Array.of(0x4c))

        const dLenBuff = new Uint8Array(1)
        writeUInt8(dLenBuff, dLen)
        res.push(dLenBuff)
    } else if (dLen <= 0xffff) {
        // OP_PUSHDATA2
        res.push(Uint8Array.of(0x4d))

        const dLenBuff = new Uint8Array(2)
        writeUInt16LE(dLenBuff, dLen)
        res.push(dLenBuff)
    } else {
        // OP_PUSHDATA4
        res.push(Uint8Array.of(0x4e))

        const dLenBuff = new Uint8Array(4)
        writeUInt32LE(dLenBuff, dLen)
        res.push(dLenBuff)
    }

    res.push(data)

    return concatBytes(...res)
}

export function concatBytes(...arrays: Uint8Array[]): Uint8Array {
    if (arrays.length === 0) {
        return new Uint8Array(0);
    }
    const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const arr of arrays) {
        result.set(arr, offset);
        offset += arr.length;
    }
    return result;
}

export function hexToBytes(hex: string): Uint8Array {
    const clean = hex.length % 2 === 0 ? hex : '0' + hex;
    const bytes = new Uint8Array(clean.length / 2);
    for (let i = 0; i < clean.length; i += 2) {
        bytes[i / 2] = parseInt(clean[i] + clean[i + 1], 16);
    }
    return bytes;
}

export function bytesToHex(bytes: Uint8Array): string {
    let result = '';
    for (const byte of bytes) {
        result += byte.toString(16).padStart(2, '0');
    }
    return result;
}

const encoder = new TextEncoder();
export function utf8ToBytes(str: string): Uint8Array {
    return encoder.encode(str);
}
