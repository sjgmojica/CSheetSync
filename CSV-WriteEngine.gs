function saveChanges(sheet, importResult) {

  Logger.log("=== WRITE ENGINE ===");
  Logger.log("Updates to write: " + importResult.updates.length);
  Logger.log("Inserts to write: " + importResult.inserts.length);

  const dateUpdated = writeUpdates(sheet, importResult);
  const dataInserted = writeInserts(sheet, importResult);

  return {
    updated: dateUpdated.updated,
    unchanged: dateUpdated.unchanged,
    inserted: dataInserted
  };

}

/**
 * ==========================================================
 * Batch Insert New Records
 * ==========================================================
 */

function writeInserts(sheet, result) {

  const {
    config,
    inserts,
    csvHeaders,
    sheetHeaders,
    csvColumnMap,
    sheetColumnMap
  } = result;

  // Nothing to insert
  if (inserts.length === 0) {
    return 0;
  }

  const rows = [];

  inserts.forEach(csvRow => {

    // Create a blank sheet row
    const sheetRow = new Array(sheetHeaders.length).fill("");

    // Copy mapped columns
    csvHeaders.forEach(csvHeader => {

      const sheetColumn =
        getMappedSheetColumn(csvHeader, config);

      if (!sheetColumn) return;

      const csvIndex =
        csvColumnMap[csvHeader];

      const sheetIndex =
        sheetColumnMap[sheetColumn];

      if (sheetIndex === undefined) return;

      sheetRow[sheetIndex] = csvRow[csvIndex];

    });

    rows.push(sheetRow);

  });

  const startRow = sheet.getLastRow() + 1;

  sheet.getRange(
    startRow,
    1,
    rows.length,
    sheetHeaders.length
  ).setValues(rows);

  Logger.log("Inserted " + rows.length + " new rows.");

  return rows.length;

}

/**
 * ==========================================================
 * Batch Update Existing Records
 * ==========================================================
 */
function writeUpdates(sheet, result) {

  const {
    config,
    updates,
    existing,
    csvHeaders,
    sheetHeaders,
    csvColumnMap,
    sheetColumnMap
  } = result;

  if (updates.length === 0) {
    return {
      updated: 0,
      unchanged: 0
    };
  }

  let updatedCount = 0;
  let unchangedCount = 0;

  updates.forEach(update => {

    // Mutate the shared in-memory row directly
    const row = existing.data[update.dataIndex];
    let hasChanges = false;

    // Update mapped fields only
    csvHeaders.forEach(csvHeader => {

      const sheetColumn = getMappedSheetColumn(csvHeader, config);

      if (!sheetColumn) return;

      // Skip protected columns
      if (isProtectedColumn(sheetColumn, config)) {
        return;
      }

      const csvIndex = csvColumnMap[csvHeader];
      const sheetIndex = sheetColumnMap[sheetColumn];

      if (sheetIndex === undefined) {
        return;
      }

      const newValue = normalizeValue(update.csvRow[csvIndex]);
      const oldValue = normalizeValue(row[sheetIndex]);

      if (newValue !== oldValue) {
        row[sheetIndex] = newValue;
        hasChanges = true;
      }

    });

    if (hasChanges) {
      updatedCount++;
    } else {
      unchangedCount++;
    }

  }); // <-- closes updates.forEach()

  // Write every changed row back in a single batched call
  if (updatedCount > 0) {

    sheet.getRange(
      config.dataStartRow,
      1,
      existing.data.length,
      sheetHeaders.length
    ).setValues(existing.data);

  }

  Logger.log("Updated: " + updatedCount);
  Logger.log("Unchanged: " + unchangedCount);

  return {
    updated: updatedCount,
    unchanged: unchangedCount
  };

} // <-- closes writeUpdates()