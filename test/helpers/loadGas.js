const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Loads one or more .gs files into a shared vm context and returns that
// context's global scope, so top-level `function foo(){}` declarations
// in the Apps Script source become callable properties on the result.
// Lets us unit-test the pure logic without touching the .gs files or
// pulling in SpreadsheetApp/Utilities/Session, which aren't defined here.
// Pass a plain object as the last argument to stub any GAS globals
// (e.g. Utilities, Session) that the code under test touches.
function loadGasModule(...args) {
  let extraGlobals = {};
  if (args.length && typeof args[args.length - 1] === 'object') {
    extraGlobals = args.pop();
  }
  const filenames = args;

  const context = { console, Set, ...extraGlobals };
  vm.createContext(context);

  // vm.createContext doesn't expose built-ins like Date as own
  // properties on the context object, only within scripts run in it.
  // Capture the ones tests need to construct realm-native values.
  vm.runInContext('this.Date = Date;', context);

  filenames.forEach(filename => {
    const filePath = path.join(__dirname, '..', '..', filename);
    const code = fs.readFileSync(filePath, 'utf8');
    vm.runInContext(code, context, { filename });
  });

  return context;
}

module.exports = { loadGasModule };
