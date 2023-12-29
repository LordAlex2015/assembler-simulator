const { Emulator } = require('./emulator/emulator.js');

const fs = require('fs');

let filename = 'hello_world.txt';
if (process.argv.length === 3) {
    filename = process.argv[2]
}
const code = fs.readFileSync(filename, 'utf8')
const emulator = new Emulator();
emulator.assemble(code);
if(emulator.error) throw new Error(emulator.error);
emulator.run();
if(emulator.error) throw new Error(emulator.error);
emulator.dump('out.dat')

