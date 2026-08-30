# MOI Real Price import input

Only use the current official Open Data batch file acquired from the Ministry of the Interior land administration service. Confirm whether the file is county-specific before passing `--county-file`.

Example:

```text
node scripts/market-radar/import-moi-real-price.mjs data/market-radar/raw/moi/<official-file>.csv --county-file --source-published-at <ISO> --data-period-start <YYYY-MM-DD> --data-period-end <YYYY-MM-DD>
```

Raw CSV / ZIP files remain ignored by Git.
