

var { cpu } = require('./emulator/cpu');
var { asm } = require('./assembler/asm');
var { memory } = require('./emulator/memory');
var { opcodes } = require('./emulator/opcodes');

// Node.js program to demonstrate
// the fs.readFile() method

// Include fs module

var fs = require('fs');
var code = fs.readFileSync('hello_world.txt', 'utf8')

//console.log(code);
var assembly;
var mapping;
var binary;
var labels;
var selectedLine = -1
var error
function assemble(mycode, mymemory) {
    try {
        assembly = asm.go(mycode);
        mapping = assembly.mapping;
        binary = assembly.code;
        labels = assembly.labels;

        if (binary.length > mymemory.data.length)
            throw "Binary code does not fit into the memory. Max " + mymemory.data.length + " bytes are allowed";

        for (var i = 0, l = binary.length; i < l; i++) {
            mymemory.data[i] = binary[i];
            console.log(`mymemory.data[i] : ${mymemory.data[i]}`)
        }
    } catch (e) {
        if (e.line !== undefined) {
            error = e.line + " | " + e.error;
            selectedLine = e.line;
        } else {
            error = e.error;
        }
    }
};
//initialisation

executeStep = function executeStep() {
    try {
        // Execute
        var res = cpu.step(memory, opcodes);
        // Mark in code
        if (cpu.ip in mapping) {
            selectedLine = mapping[cpu.ip];
        }
        console.log(res)
        return res;
    } catch (e) {
        console.log(e)
        return false;
    }
};

var isRunning = false

function run() {
    isRunning = true;

    if (executeStep() === true) {
        run();
        console.log("running")
    } else {
        console.log("not running")
        isRunning = false;
    }
}


function stop() {
    $timeout.cancel(runner);
    $scope.isRunning = false;
}


assemble(code,memory)
//memory.data.forEach(element => console.log(element));
run()
console.log(memory.data.length)
for(let i = 231; i < 256; i++){
    console.log(memory.data[i].toString(16));
}




