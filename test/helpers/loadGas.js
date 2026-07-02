const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Loads one or more .gs files into a shared vm context and returns that
// context's global scope, so top-level `function foo(){}` declarations
// in the Apps Script source become callable properties on the result.
// Lets us unit-test the pure logic without touching the .gs files or
// pulling in SpreadsheetApp/Utilities/Session, which aren't defined here.
function loadGasModule(...filenames) {
  const context = { console, Set };
  vm.createContext(context);

  filenames.forEach(filename => {
    const filePath = path.join(__dirname, '..', '..', filename);
    const code = fs.readFileSync(filePath, 'utf8');
    vm.runInContext(code, context, { filename });
  });

  return context;
}

module.exports = { loadGasModule };
