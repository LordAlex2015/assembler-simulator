const { Emulator } = require('./emulator/emulator.js');

const fs = require('fs');
const code = fs.readFileSync('hello_world.txt', 'utf8')
const emulator = new Emulator();
emulator.assemble(code);
if(emulator.error) throw new Error(emulator.error);
emulator.run();
emulator.dump('test.dat')
emulator.show();