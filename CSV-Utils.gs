/**
 * ==========================================================
 * CSV Import Framework
 * Utility Functions
 * ==========================================================
 */

/**
 * Returns the import configuration
 * for the currently active sheet.
 */
function getImportConfig() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const config = getConfigBySheetName(sheet.getName());
  if (!config) {
    throw new Error(
      `The sheet "${sheet.getName()}" is not configured for CSV import.`
    );
  }
  return config;
}


/**
 * Returns the header row as an array.
 */
function getHeaders(sheet, headerRow) {
  const lastColumn = sheet.getLastColumn();
  return sheet
    .getRange(headerRow, 1, 1, lastColumn)
    .getValues()[0];

}


/**
 * Builds a header → column index map.
 *
 * Example:
 * {
 *   "ALERT ID":0,
 *   "AUTHCODE":1
 * }
 */
function getColumnMap(headers) {
  const map = {};
  headers.forEach((header, index) => {
    map[String(header).trim()] = index;
  });
  return map;
}


/**
 * Returns TRUE if row is blank.
 */
function isBlankRow(row) {
  return row.every(value =>
    String(value).trim() === ""
  );
}


/**
 * Normalize CSV values.
 */
function normalizeValue(value) {
  if (value === null || value === undefined)
    return "";
  if (value instanceof Date) {
    return Utilities.formatDate(
      value,
      Session.getScriptTimeZone(),
      "yyyy-MM-dd"
    );
  }
  return String(value).trim();
}


/**
 * Normalize header names.
 */
function normalizeHeader(header) {
  return String(header)
    .trim()
    .toUpperCase();
}


/**
 * Returns current timestamp.
 */
function formatTimestamp(date) {
  return Utilities.formatDate(
    date,
    Session.getScriptTimeZone(),
    "yyyy-MM-dd HH:mm:ss"
  );
}


/**
 * Formats duration.
 */
function formatDuration(start, end) {
  const seconds = (end.getTime() - start.getTime()) / 1000;
  return seconds.toFixed(2) + " sec";

}


/**
 * Returns column index safely.
 */
function getColumnIndex(columnName, columnMap) {
  if (!(columnName in columnMap)) {
    throw new Error(
      `Column "${columnName}" not found.`
    );
  }
  return columnMap[columnName];
}


/**
 * Returns the mapped Google Sheet column
 * from a CSV column.
 */
function getMappedSheetColumn(csvColumn, config) {
  return config.fieldMapping[csvColumn] || null;
}


/**
 * Returns TRUE if a sheet column
 * is protected.
 */
function isProtectedColumn(sheetColumn, config) {
  return config.protectedColumns.includes(sheetColumn);
}


/**
 * Validates required CSV columns.
 */
function validateRequiredColumns(csvHeaders, config) {
  if (!config.requiredColumns)
    return;

  config.requiredColumns.forEach(column => {
    if (!csvHeaders.includes(column)) {
      throw new Error(
        `Required CSV column "${column}" is missing.`
      );
    }
  });

}