
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
        const valsToTest = [0, 16, 1024, 13];
        for (let i = 0; i < valsToTest.length; i++) {
            it('Code should compile and produce the expected output', function() {
                v = valsToTest[i];
                let code =
                    `
MOV A, [x]
INC A
MOV [x], A
HLT
x: DB ${v}
`;
                const runner = new Runner()
                try {
                    runner.run(code);
                } catch (error) {
                    assert.fail()
                }
                const res = fs.readFileSync(outputFileName, 'utf8')
                parsedRes = JSON.parse(res);
                var expected = v + 1;
                var actual = runner_load16(runner, parsedRes["labels"]["x"]);
                assert.equal(expected, actual);
            });
        };
    });
});

