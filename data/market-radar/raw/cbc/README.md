# CBC Housing Finance import input

Use only the official Central Bank of the Republic of China (Taiwan) attachment titled **五大銀行新承做放款金額與利率統計表**. The preferred input is the XLSX attachment linked from the corresponding Central Bank monthly release.

Example:

```text
node scripts/market-radar/import-cbc-housing-finance.mjs data/market-radar/raw/cbc/<official-file>.xlsx --source-published-at <ISO> --data-period-start <YYYY-MM-DD> --data-period-end <YYYY-MM-DD>
```

Raw XLSX, XLS, CSV and PDF files remain ignored by Git. Do not substitute press coverage, third-party APIs, or manually retyped figures for the official attachment.
