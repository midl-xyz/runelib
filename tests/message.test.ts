import { Edict, Message, Rune, RuneId, Runestone, Tag } from '../src/runestones.js'

import { hexToBytes } from '../src/utils.js'
import { expect, use } from 'chai'
import chaiAsPromised from 'chai-as-promised'
use(chaiAsPromised)

describe('Test Message', () => {
    it('should correctly encode etch reveal msg', async () => {
        const msg = new Message()

        msg.addFieldVal(Tag.Flags, 3n)        // flags value == 0011, etching + terms
        msg.addFieldVal(Tag.Rune, Rune.fromName('BESTSCRYPTMINT').value)
        msg.addFieldVal(Tag.Divisibility, 2n)
        msg.addFieldVal(Tag.Symbol, 0x53n)    // "S"
        msg.addFieldVal(Tag.Amount, 100000n)  // 1000.00 (since divisibility is 2)
        msg.addFieldVal(Tag.Cap, 10000n)

        const expected = hexToBytes('020304cbfed481d8d9bdbf4c010205530aa08d0608904e')
        const actual = msg.toBuffer()
        expect(actual).to.eql(expected)
    })

    it('should correctly encode mint msg', async () => {
        const msg = new Message()

        msg.addFieldVal(Tag.Mint, 211n)  // Block #211
        msg.addFieldVal(Tag.Mint, 1n)    // Tx #1

        const expected = hexToBytes('14d3011401')
        const actual = msg.toBuffer()
        expect(actual).to.eql(expected)
    })

    it('should correctly encode transfer msg', async () => {
        const msg = new Message()

        msg.addEdict(
            new Edict(
                new RuneId(
                    211, 1   // Block #211, Tx #1
                ),
                25000n,
                2
            )
        )

        const expected = hexToBytes('00d30101a8c30102')
        const actual = msg.toBuffer()
        expect(actual).to.eql(expected)
    })

    it('should correctly encode transfer msg (multiple edicts)', async () => {
        const msg = new Message()

        msg.addEdict(
            new Edict(
                new RuneId(
                    211, 1   // Block #211, Tx #1
                ),
                25000n,
                2
            )
        )

        msg.addEdict(
            new Edict(
                new RuneId(
                    281, 1   // Block #281, Tx #1
                ),
                100n,
                1
            )
        )

        const expected = hexToBytes('00d30101a8c3010246016401')
        const actual = msg.toBuffer()
        expect(actual).to.eql(expected)
    })

    it('should correctly encode transfer msg (multiple edicts, multiple in same block)', async () => {
        const msg = new Message()

        msg.addEdict(
            new Edict(
                new RuneId(
                    211, 1   // Block #211, Tx #1
                ),
                25000n,
                2
            )
        )

        msg.addEdict(
            new Edict(
                new RuneId(
                    211, 6   // Block #211, Tx #6
                ),
                25000n,
                2
            )
        )

        msg.addEdict(
            new Edict(
                new RuneId(
                    211, 8   // Block #211, Tx #8
                ),
                25000n,
                2
            )
        )

        msg.addEdict(
            new Edict(
                new RuneId(
                    281, 1   // Block #281, Tx #1
                ),
                100n,
                1
            )
        )

        msg.addEdict(
            new Edict(
                new RuneId(
                    281, 3   // Block #281, Tx #3
                ),
                100n,
                1
            )
        )

        const expected = hexToBytes('00d30101a8c301020005a8c301020002a8c301024601640100026401')
        const actual = msg.toBuffer()
        expect(actual).to.eql(expected)
    })

    it('should correctly encode emoji symbol as a single code point', async () => {
        const stone = Runestone.create(
            {
                name: 'EMOJI',
                amount: 1,
                cap: 1,
                symbol: '🧿'
            },
            'etch'
        )
        const msg = stone.toMessage()
        const symbol = msg.getSymbol()
        expect(symbol.isSome()).to.equal(true)
        expect(symbol.value()).to.equal('🧿')
    })

    // TODO: Negative cases

})
