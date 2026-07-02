const CSV_CONFIG = {

  AlertsTracker: {
    displayName: "POC Alerts Tracker",
    sheetName: "Alerts Tracker",
    headerRow: 1,
    dataStartRow: 2,
    keySheetColumn: "alert_id",
    keyCsvColumn: "alert_id",
    allowInsert: true,
    allowUpdate: true,
    ignoreBlankRows: true,
    trimValues: true,
    protectedColumns: [
      "transaction_date",
      "Date Action Alert",
      "Owner",
      "Refunded?",
      "Declined Reason",
      "Subcription Cancelled",
      "Email",
      "Chargeblast Account",
      "Processor",
      "Chargeblast Action Date",
      "Reference Information",
      "Notes from Chargeblast",
      "CUSTOMEREMAIL",
      "CARDBRAND"
    ],

    fieldMapping: {
      "alert_id": "alert_id",
      "created_at": "created_at",
      "alert_category": "alert_category",
      "transaction_date": "transaction_date",
      "alert_type": "alert_type",
      "amount": "amount",
      "currency": "currency",
      "card_masked": "card_masked",
      "issuer": "issuer",
      "merchant_company": "merchant_company",
      "descriptor": "descriptor",
      "source": "source",
      "reason_code": "reason_code",
      "arn": "ARN"
    }
  }
};

function getConfigBySheetName(sheetName) {
  const profiles = Object.values(CSV_CONFIG);
  for (const profile of profiles) {
    if (profile.sheetName === sheetName) {
      return profile;
    }
  }
  return null;
}