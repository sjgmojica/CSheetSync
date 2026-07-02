/**
 * ==========================================================
 * CSV Import Engine
 * ==========================================================
 */
function processCSV(csvContent, fileName) {

  const startedAt = new Date();

  try {

    //-------------------------------------------------------
    // Load Configuration
    //-------------------------------------------------------

    const config = getImportConfig();

    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(config.sheetName);

    if (!sheet) {
      throw new Error(`Sheet "${config.sheetName}" not found.`);
    }

    //-------------------------------------------------------
    // Parse CSV
    //-------------------------------------------------------

    const csvData = Utilities.parseCsv(csvContent);

    if (csvData.length < 2) {
      throw new Error("CSV contains no data.");
    }

    const csvHeaders = csvData.shift();

    //-------------------------------------------------------
    // Read Sheet
    //-------------------------------------------------------

    const sheetHeaders = getHeaders(sheet, config.headerRow);

    //-------------------------------------------------------
    // Validate
    //-------------------------------------------------------

    validateRequiredColumns(csvHeaders, config);

    //-------------------------------------------------------
    // Build Existing Record Index
    //-------------------------------------------------------

    const existing = buildExistingIndex(
        sheet,
        config,
        sheetHeaders
    );

    //-------------------------------------------------------
    // Execute Import
    //-------------------------------------------------------

    const importResult = executeImport({
      config,
      csvHeaders,
      csvData,
      sheetHeaders,
      existing
    });

    //-------------------------------------------------------
    // Write Changes
    //-------------------------------------------------------
    const writeResult = saveChanges(
      sheet,
      importResult
    );
  
    Logger.log("Updates: " + writeResult.updated);
    Logger.log("Unchanged: " + writeResult.unchanged);
    Logger.log("Inserts: " + writeResult.inserted);
    Logger.log("Skipped: " + importResult.skipped);
    //-------------------------------------------------------
    // Summary
    //-------------------------------------------------------
    const completedAt = new Date();
    return {
      success: true,
      fileName: fileName,
      sheetName: config.sheetName,
      total: csvData.length,
      updated: 0,
      inserted: writeResult.inserted,
      unchanged:0,
      skipped: importResult.skipped,
      startedAt: formatTimestamp(startedAt),
      completedAt: formatTimestamp(completedAt),
      duration: formatDuration(startedAt, completedAt),
      message:
        `${fileName} successfully validated for ${config.displayName}.`
    };
  } catch (err) {
    return {
      success: false,
      message: err.message

    };
  }
}

/**
 * Build an index of existing sheet records.
 *
 * Returns:
 * {
 *    index: {...},
 *    data: [...]
 * }
 */
function buildExistingIndex(sheet, config, sheetHeaders) {

  const lastRow = sheet.getLastRow();

  // No existing data
  if (lastRow < config.dataStartRow) {
    return {
      index: {},
      data: []
    };
  }

  // Read all sheet data once
  const data = sheet.getRange(
    config.dataStartRow,
    1,
    lastRow - config.dataStartRow + 1,
    sheetHeaders.length
  ).getValues();

  const keyColumnIndex =
      sheetHeaders.indexOf(config.keySheetColumn);

  if (keyColumnIndex === -1) {
    throw new Error(
      `Key column "${config.keySheetColumn}" not found in sheet.`
    );
  }

  const index = {};

  data.forEach((row, i) => {
    const key = String(row[keyColumnIndex]).trim();
    if (!key) return;
    index[key] = {
      rowNumber: config.dataStartRow + i,
      dataIndex: i
    };
  });

  return {
    index,
    data
  };

}

/**
 * ==========================================================
 * Execute Hybrid Upsert
 * ==========================================================
 */
function executeImport(context) {
  const {
    config,
    csvHeaders,
    csvData,
    sheetHeaders,
    existing
  } = context;

  const updates = [];
  const inserts = [];
  let skipped = 0;

  // CSV lookup
  const csvColumnMap = getColumnMap(csvHeaders);

  // Sheet lookup
  const sheetColumnMap = getColumnMap(sheetHeaders);
  csvData.forEach(csvRow => {
    const keyColumn =getColumnIndex(config.keyCsvColumn,csvColumnMap);

    const key =normalizeValue(csvRow[keyColumn]);
    if (!key) {
      skipped++;
      return;

    }

    //----------------------------------------------------
    // Existing Record
    //----------------------------------------------------

    if (existing.index[key]) {
      updates.push({
        key,
        rowNumber: existing.index[key].rowNumber,
        dataIndex: existing.index[key].dataIndex,
        csvRow
      });

    }
    //----------------------------------------------------
    // New Record
    //----------------------------------------------------

    else {
      inserts.push(csvRow);
    }
  });

  return {
    config,
    existing,
    csvHeaders,
    sheetHeaders,
    csvColumnMap,
    sheetColumnMap,
    updates,
    inserts,
    skipped
  };
}
