const { Runner } = require('./src/runner.js');

const fs = require('fs');

let filename = 'hello_world.txt';
if (process.argv.length === 3) {
    filename = process.argv[2]
}
const code = fs.readFileSync(filename, 'utf8')
const runner = new Runner()
runner.run(code)
