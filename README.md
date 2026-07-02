# ImportFlow

> A configuration-driven CSV Import Framework for Google Apps Script that provides Hybrid Upsert, Field Mapping, and Protected Columns for scalable Google Sheets data synchronization.

---

## Overview

ImportFlow is a reusable framework built with **Google Apps Script** that simplifies importing CSV files into Google Sheets.

Instead of writing custom import logic for every spreadsheet, ImportFlow uses a configuration-driven approach that allows multiple sheets to share the same import engine while maintaining their own mappings and business rules.

The framework is designed to be modular, reusable, and easy to extend for future data integration projects.

---

# Features

## ✅ Hybrid Upsert Engine

ImportFlow automatically determines whether a CSV record should:

- Update an existing record
- Insert a new record

using a configurable unique key.

---

## ✅ Configuration Driven

Each worksheet is configured through a single configuration profile.

Example:

- Sheet Name
- Key Column
- Protected Columns
- Field Mapping
- Validation Rules

No import logic needs to change when adding a new sheet.

---

## ✅ Field Mapping

CSV column names can differ from Google Sheet column names.

Example:

| CSV Header | Google Sheet |
|------------|--------------|
| arn | ARN |
| created_at | created_at |
| merchant_company | merchant_company |

---

## ✅ Protected Columns

Prevent selected columns from being overwritten during updates.

Example:

```javascript
protectedColumns: [
    "Owner",
    "Refunded?",
    "Notes",
    "Processor"
]
```

These values remain untouched during imports.

---

## ✅ Existing Record Index

The framework reads the Google Sheet once and builds an in-memory lookup table for fast record matching.

---

## ✅ Validation

Current validation includes:

- Required CSV columns
- Missing worksheets
- Empty CSV files

---

## ✅ Modular Architecture

```
CSV-Config.gs
CSV-Utils.gs
CSV-Tools.gs
CSV-ImportEngine.gs
CSV-WriteEngine.gs
CSV-Logger.gs
CSV-Dialog.html
```

Each file has a single responsibility, making the framework easier to maintain and extend. `CSV-Dialog.html` is self-contained (CSS and JS are inlined directly in the file rather than split into separate partials) to reduce the number of server-side template-evaluation calls Apps Script has to make when opening the dialog.

---

# Import Workflow

```text
CSV File
   │
   ▼
Load Configuration
   │
   ▼
Read CSV
   │
   ▼
Validate CSV
   │
   ▼
Read Google Sheet
   │
   ▼
Build Existing Record Index
   │
   ▼
Hybrid Upsert Classification
   │
   ├──────────────┐
   │              │
Existing Key     New Key
   │              │
   ▼              ▼
Update         Insert
   │              │
   └──────┬───────┘
          ▼
    Import Summary
```

---

# Project Structure

```text
ImportFlow
│
├── CSV-Config.gs
│
├── CSV-Utils.gs
│
├── CSV-Tools.gs
│
├── CSV-ImportEngine.gs
│
├── CSV-WriteEngine.gs
│
├── CSV-Logger.gs
│
├── CSV-Dialog.html
│
├── package.json
│
└── test/
```

---

# Configuration Example

```javascript
const CSV_CONFIG = {

  AlertsTracker: {

    displayName: "POC Alerts Tracker",

    sheetName: "poc_alerts_tracker",

    headerRow: 1,

    dataStartRow: 2,

    keySheetColumn: "alert_id",

    keyCsvColumn: "alert_id",

    allowInsert: true,

    allowUpdate: true,

    protectedColumns: [

      "Owner",
      "Refunded?",
      "Notes"

    ],

    fieldMapping: {

      "alert_id": "alert_id",
      "created_at": "created_at",
      "amount": "amount",
      "arn": "ARN"

    }

  }

};
```

---

# Hybrid Upsert Logic

```text
For each CSV row

        │
        ▼

Does the key exist?

        │
   ┌────┴────┐
   │         │
  YES       NO
   │         │
   ▼         ▼

Update     Insert
```

The unique key is configurable per import profile.

---

# Current Features

- CSV Parsing
- Configuration Profiles
- Required Column Validation
- Existing Record Index
- Hybrid Upsert
- Field Mapping
- Protected Columns
- Update Existing Records
- Insert New Records
- Import Summary Dialog

---

# Future Roadmap

## v1.1

- Detect unchanged records
- Batch update optimization
- Duplicate CSV key detection
- Import audit log
- Dry-run mode (preview import without writing)

## v1.2

- Automatically create a new worksheet from a CSV file
- Automatically generate sheet headers
- Create import profiles dynamically
- Import directly into newly created worksheets
- Support multiple CSV layouts

## v1.3

- Scheduled imports using Apps Script Triggers
- Import history dashboard
- Error reporting
- Email notifications
- Rollback support

## v2.0

- Composite key (multi-column) matching
- Excel (.xlsx) import support
- JSON import support
- REST API integration
- Google Drive folder monitoring
- Data transformation pipeline
- Plugin architecture for custom processors

---

# Example Result

```json
{
    "success": true,
    "total": 41,
    "updated": 33,
    "inserted": 8,
    "skipped": 0
}
```

---

# Design Goals

- Reusable
- Configuration Driven
- Modular
- High Performance
- Easy to Extend
- Maintainable
- Multi-sheet Support
- Minimal API Calls

---

# Requirements

- Google Apps Script
- Google Sheets
- CSV Input File

---

# Contributing

Contributions, bug reports, feature requests, and improvements are welcome.

If you have ideas to improve ImportFlow, feel free to open an issue or submit a pull request.

---

# License

MIT License

Copyright (c) 2026

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files to deal in the Software without restriction, including use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software.

---

## Author

**ImportFlow** was developed as a reusable Google Apps Script framework for scalable CSV imports and data synchronization in Google Sheets.