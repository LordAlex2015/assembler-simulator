
var { cpu } = require('./cpu');
var { asm } = require('../assembler/asm');
var { memory } = require('./memory');
var { opcodes } = require('./opcodes');

var fs = require('fs');
var code = fs.readFileSync('hello_world.txt', 'utf8')

class Emulator{
    constructor(){
        this.assembly = null;
        this.mapping = null;
        this.binary = null;
        this.labels = null;
        this.selectedLine = -1;
        this.error = null;
        this.memory = memory;
        this.cpu = cpu;
    }

    assemble(code){
        try {
            this.assembly = asm.go(code);
            this.mapping = this.assembly.mapping;
            this.binary = this.assembly.code;
            this.labels = this.assembly.labels;
    
            if (this.binary.length > memory.data.length)
                throw "Binary code does not fit into the memory. Max " + memory.data.length + " bytes are allowed";
    
            for (var i = 0, l = this.binary.length; i < l; i++) {
                this.memory.data[i] = this.binary[i];
                console.log(`memory.data[i] : ${memory.data[i]}`)
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
            console.log(res)
            return res;
        } catch (e) {
            console.log(e)
            return false;
        }
    }
    
    run() {
        while (this.executeStep() === true) {
            console.log("running")
        }
            
        console.log("not running")
    }

    dump(file = null) {
        if (file == null) {
            console.log("Memory dump:")
            for (var i = 0, l = this.memory.data.length; i < l; i++) {
                if(i != 0 && i % 16 == 0) console.log("\n")
                console.log(this.memory.data[i].toString(16).padStart(2, '0') + " ")
            }
            return
        }

        var f = fs.createWriteStream(file);
        for (var i = 0, l = this.memory.data.length; i < l; i++) {
            if(i != 0 && i % 16 == 0) f.write("\n")
            f.write(this.memory.data[i].toString(16).padStart(2, '0') + " ")
        }
    }

    getOutput(){
        let str = ""
        for(let i = 925; i < this.memory.data.length; i++){
            str += String.fromCharCode(this.memory.data[i])
        }
        return str
    }

    show(file = null) {
        let str = this.getOutput()
        if(file == null){
            console.log(str)
        }
        else{
            fs.writeFileSync(file, str)
        }
    }
}

module.exports = { Emulator }