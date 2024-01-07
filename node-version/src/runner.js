const { Emulator } = require('./emulator/emulator.js');
const fs = require("fs");

class Runner {
    constructor() {
        this.emulator = new Emulator();
    }
    run(code) {
        this.emulator.assemble(code);
        if (this.emulator.error) {
            fs.writeFileSync("assembly_error", this.emulator.error);
            throw new Error(this.emulator.error);
        }
        this.emulator.run();
        if (this.emulator.error) {
            fs.writeFileSync("runtime_error", this.emulator.error);
            throw new Error(this.emulator.error);
        }
        this.emulator.dump('out.dat')
    }
}

module.exports = { Runner }
