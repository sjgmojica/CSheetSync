const test = require('node:test');
const assert = require('node:assert/strict');
const { loadGasModule } = require('./helpers/loadGas');

const gas = loadGasModule('CSV-Utils.gs');

test('normalizeValue trims strings and handles null/undefined', () => {
  assert.equal(gas.normalizeValue('  hello  '), 'hello');
  assert.equal(gas.normalizeValue(null), '');
  assert.equal(gas.normalizeValue(undefined), '');
  assert.equal(gas.normalizeValue(42), '42');
});

test('normalizeValue formats Date objects as yyyy-MM-dd instead of String()', () => {
  // Sheet cells come back as real Date objects; comparing them to a
  // plain CSV date string via String(date) never matches (see the
  // MISMATCH bug this test guards against). Stub Utilities/Session
  // since the real Apps Script runtime isn't available here.
  const calls = [];
  const gasWithDates = loadGasModule('CSV-Utils.gs', {
    Utilities: {
      formatDate: (date, tz, fmt) => {
        calls.push({ date, tz, fmt });
        return '2026-06-12';
      }
    },
    Session: {
      getScriptTimeZone: () => 'Asia/Manila'
    }
  });

  // Built with the vm context's own Date constructor: `instanceof Date`
  // inside the sandbox only recognizes dates from its own realm.
  const d = new gasWithDates.Date('2026-06-11T16:00:00.000Z');
  const result = gasWithDates.normalizeValue(d);

  assert.equal(result, '2026-06-12');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].date, d);
  assert.equal(calls[0].tz, 'Asia/Manila');
  assert.equal(calls[0].fmt, 'yyyy-MM-dd');
});

test('isBlankRow detects fully blank rows only', () => {
  assert.equal(gas.isBlankRow(['', '  ', '']), true);
  assert.equal(gas.isBlankRow(['', 'x', '']), false);
});

test('getColumnMap builds a trimmed header index map', () => {
  const map = gas.getColumnMap(['Alert ID', ' Amount ', 'Currency']);
  assert.deepEqual({ ...map }, { 'Alert ID': 0, Amount: 1, Currency: 2 });
});

test('getColumnIndex returns the index or throws when missing', () => {
  const map = { A: 0 };
  assert.equal(gas.getColumnIndex('A', map), 0);
  assert.throws(() => gas.getColumnIndex('B', map), /Column "B" not found/);
});

test('getMappedSheetColumn returns the mapped column or null', () => {
  const config = { fieldMapping: { alert_id: 'alert_id' } };
  assert.equal(gas.getMappedSheetColumn('alert_id', config), 'alert_id');
  assert.equal(gas.getMappedSheetColumn('unknown', config), null);
});

test('isProtectedColumn checks the protectedColumns list', () => {
  const config = { protectedColumns: ['Owner'] };
  assert.equal(gas.isProtectedColumn('Owner', config), true);
  assert.equal(gas.isProtectedColumn('Amount', config), false);
});

test('validateRequiredColumns throws when a required column is missing', () => {
  const config = { requiredColumns: ['alert_id', 'amount'] };
  assert.doesNotThrow(() =>
    gas.validateRequiredColumns(['alert_id', 'amount', 'extra'], config)
  );
  assert.throws(
    () => gas.validateRequiredColumns(['alert_id'], config),
    /Required CSV column "amount" is missing/
  );
});

test('validateRequiredColumns is a no-op when config has no requiredColumns', () => {
  assert.doesNotThrow(() => gas.validateRequiredColumns([], {}));
});
