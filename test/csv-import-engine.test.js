const test = require('node:test');
const assert = require('node:assert/strict');
const { loadGasModule } = require('./helpers/loadGas');

const gas = loadGasModule('CSV-Utils.gs', 'CSV-ImportEngine.gs');

function baseConfig(overrides = {}) {
  return {
    keyCsvColumn: 'alert_id',
    keySheetColumn: 'alert_id',
    fieldMapping: { alert_id: 'alert_id', amount: 'amount' },
    protectedColumns: [],
    allowInsert: true,
    allowUpdate: true,
    ignoreBlankRows: true,
    ...overrides
  };
}

test('classifies a known key as an update and a new key as an insert', () => {
  const result = gas.executeImport({
    config: baseConfig(),
    csvHeaders: ['alert_id', 'amount'],
    csvData: [
      ['A1', '100'],
      ['A2', '200']
    ],
    sheetHeaders: ['alert_id', 'amount'],
    existing: {
      index: { A1: { rowNumber: 2, dataIndex: 0 } },
      data: [['A1', '50']]
    }
  });

  assert.equal(result.updates.length, 1);
  assert.equal(result.updates[0].key, 'A1');
  assert.equal(result.inserts.length, 1);
  assert.equal(result.inserts[0][0], 'A2');
  assert.equal(result.skipped, 0);
});

test('skips rows with a blank key', () => {
  const result = gas.executeImport({
    config: baseConfig(),
    csvHeaders: ['alert_id', 'amount'],
    csvData: [
      ['', '100'],
      ['A1', '200']
    ],
    sheetHeaders: ['alert_id', 'amount'],
    existing: { index: {}, data: [] }
  });

  assert.equal(result.skipped, 1);
  assert.equal(result.inserts.length, 1);
});

test('honors ignoreBlankRows for fully blank rows', () => {
  const result = gas.executeImport({
    config: baseConfig({ ignoreBlankRows: true }),
    csvHeaders: ['alert_id', 'amount'],
    csvData: [
      ['', ''],
      ['A1', '200']
    ],
    sheetHeaders: ['alert_id', 'amount'],
    existing: { index: {}, data: [] }
  });

  assert.equal(result.skipped, 1);
  assert.equal(result.inserts.length, 1);
});

test('blocks inserts when allowInsert is false', () => {
  const result = gas.executeImport({
    config: baseConfig({ allowInsert: false }),
    csvHeaders: ['alert_id', 'amount'],
    csvData: [['A1', '100']],
    sheetHeaders: ['alert_id', 'amount'],
    existing: { index: {}, data: [] }
  });

  assert.equal(result.inserts.length, 0);
  assert.equal(result.skipped, 1);
});

test('blocks updates when allowUpdate is false', () => {
  const result = gas.executeImport({
    config: baseConfig({ allowUpdate: false }),
    csvHeaders: ['alert_id', 'amount'],
    csvData: [['A1', '100']],
    sheetHeaders: ['alert_id', 'amount'],
    existing: {
      index: { A1: { rowNumber: 2, dataIndex: 0 } },
      data: [['A1', '50']]
    }
  });

  assert.equal(result.updates.length, 0);
  assert.equal(result.skipped, 1);
});

test('de-duplicates repeated new keys within the same CSV, keeping the first', () => {
  const result = gas.executeImport({
    config: baseConfig(),
    csvHeaders: ['alert_id', 'amount'],
    csvData: [
      ['A1', '100'],
      ['A1', '999']
    ],
    sheetHeaders: ['alert_id', 'amount'],
    existing: { index: {}, data: [] }
  });

  assert.equal(result.inserts.length, 1);
  assert.equal(result.inserts[0][1], '100');
  assert.equal(result.skipped, 1);
});
