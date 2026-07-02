/**
 * ============================================================
 * CSV Tools
 * Menu & Upload Dialog
 * ============================================================
 */

/**
 * Add custom menu when spreadsheet opens
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("CSV Tools")
    .addItem("Import CSV...", "showUploadDialog")
    //.addSeparator()
    //.addItem("View Import Log", "showImportLog") // Future
    .addToUi();
}

/**
 * Show the CSV Upload Dialog
 */
function showUploadDialog() {

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const sheetName = sheet.getName();

  // Verify configuration
  const config = getConfigBySheetName(sheetName);

  if (!config) {
    SpreadsheetApp.getUi().alert(
      "CSV Import",
      `The sheet "${sheetName}" is not configured for CSV import.`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return;
  }

  const template = HtmlService.createTemplateFromFile("CSV-Dialog");
  template.sheetName = sheetName;

  const html = template
    .evaluate()
    .setWidth(1200)
    .setHeight(700)
    .setSandboxMode(HtmlService.SandboxMode.IFRAME);

  SpreadsheetApp.getUi().showModalDialog(
    html,
    `Import CSV - ${config.displayName}`
  );

}