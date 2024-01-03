
var { cpu } = require('./cpu');
var { asm } = require('../assembler/asm');
var { memory } = require('./memory');
var { opcodes } = require('./opcodes');

var fs = require('fs');

class Emulator {
    constructor() {
        this.assembly = null;
        this.mapping = null;
        this.binary = null;
        this.labels = null;
        this.selectedLine = -1;
        this.error = null;
        this.memory = memory;
        this.cpu = cpu;
    }

    assemble(code) {
        try {
            this.memory.reset();
            this.assembly = asm.go(code);
            this.mapping = this.assembly.mapping;
            this.binary = this.assembly.code;
            this.labels = this.assembly.labels;


            if (this.binary.length > memory.data.length)
                throw "Binary code does not fit into the memory. Max " + memory.data.length + " bytes are allowed";

            for (var i = 0, l = this.binary.length; i < l; i++) {
                this.memory.data[i] = this.binary[i];
            }
        } catch (e) {
            if (e.line !== undefined) {
                this.error = e.line + " | " + e.error;
                this.selectedLine = e.line;
            } else {
                this.error = e.error;
            }
        }
    }

    executeStep() {
        try {
            // Execute
            var res = this.cpu.step(this.memory, opcodes);
            // Mark in code
            if (this.cpu.ip in this.mapping) {
                this.selectedLine = this.mapping[this.cpu.ip];
            }
            return res;
        } catch (e) {
            this.error = e;
            return false;
        }
    }

    run() {
        this.cpu.reset();
        while (this.executeStep() === true) {
        }
    }

    dump(file) {
        var outputJS = {}
        outputJS["memory"]=this.memory.data
        outputJS["labels"]=this.labels
        outputJS["cpu"]=this.cpu
        fs.writeFileSync(file, JSON.stringify(outputJS));
    }

    getOutput() {
        let str = ""
        for (let i = 925; i < this.memory.data.length; i++) {
            str += String.fromCharCode(this.memory.data[i])
        }
        return str
    }

    show(file = null) {
        let str = this.getOutput()
        if (file == null) {
            console.log(str)
        }
        else {
            fs.writeFileSync(file, str)
        }
    }
}

module.exports = { Emulator }
