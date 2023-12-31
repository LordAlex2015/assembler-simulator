
/* Imports */
const { Runner } = require('../src/runner.js');
const fs = require("fs");
var assert = require('assert');


/* Global variables */
const outputFileName = "out.dat"


/* Accessing runner memory */
function runner_load16(runner, address) {
    return runner.emulator.memory.load16(address);
}

describe('ASM', function() {
    describe('INC', function() {
        const valsToTest = [0, 16];
        for (let i = 0; i < valsToTest.length; i++) {
            val = valsToTest[i];
            let code =
                `
MOV A, [x]
INC A
MOV [x], A
HLT
x: DB 16
`
            const runner = new Runner()
            console.log(code);
            it('Code should compile and produce the expected output', function() {
                try {
                    runner.run(code);
                } catch (error) {
                    assert.fail()
                }
                const res = fs.readFileSync(outputFileName, 'utf8')
                parsedRes = JSON.parse(res);
                var expected = 17;
                var actual = runner_load16(runner, parsedRes["labels"]["x"]);
                assert.equal(expected, actual);
            });
        }
    });
});

