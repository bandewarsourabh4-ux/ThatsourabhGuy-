# Sales Analysis Dashboard

An interactive sales dashboard built to a fixed spec: two KPI cards, a sales
trend line, sales by country, sales by segment, a detail table, and three
slicers (Date, Country, Product) that filter everything below them.

The dashboard ships two ways:

- **`dashboard/index.html`** — a self-contained interactive build. No server, no
  build step, no dependencies: open the file and it works.
- **[`docs/POWER_BI_GUIDE.md`](docs/POWER_BI_GUIDE.md)** — the same report,
  rebuilt visual by visual in Power BI Desktop from the same CSV, with the DAX
  measures in [`docs/measures.dax`](docs/measures.dax).

_Author: sourabh_

---

## Quick start

```bash
# open the prebuilt dashboard
xdg-open dashboard/index.html      # macOS: open dashboard/index.html

# or regenerate everything from scratch (Python 3.9+, no packages needed)
python3 scripts/generate_data.py       # writes data/sales_data.csv
python3 scripts/build_dashboard.py     # writes dashboard/index.html
```

`dashboard/index.html` is committed, so cloning the repo and double-clicking the
file is enough — the two scripts are only needed to change the data or the
dashboard code.

## Using your own data

Click **Load CSV…** in the dashboard header and pick any CSV with these columns
(extra columns are ignored, `Units` is optional):

```
Date,Country,Product,Segment,Units,Sales,Profit
2024-01-01,United States,Velo,Channel Partners,92,3560.40,401.74
```

`Date` must be `YYYY-MM-DD`. The file is parsed in your browser — nothing is
uploaded anywhere. To bake a dataset in permanently instead:

```bash
python3 scripts/build_dashboard.py --csv path/to/your.csv
```

## The dashboard

| Element | Visual | Fields |
|---|---|---|
| Total Sales | Card | `Sales` |
| Total Profit | Card | `Profit` |
| Sales trend | Line chart | X: `Date` · Y: `Sales` |
| Sales by country | Clustered column chart | X: `Country` · Y: `Sales` |
| Sales by segment | Pie chart | Legend: `Segment` · Values: `Sales` |
| Detail | Table | `Country`, `Product`, `Segment`, `Sales`, `Profit` |
| Slicer 1 | Date | presets + custom range |
| Slicer 2 | Country | multi-select |
| Slicer 3 | Product | multi-select |

Layout, top to bottom — the arrangement the spec calls for:

```
┌───────────────────────────┬───────────────────────────┐
│ Total Sales               │ Total Profit              │
├───────────────┬───────────┴───────┬───────────────────┤
│ Date          │ Country           │ Product           │  slicers
├───────────────┴───────────────────┴───────────────────┤
│ Sales trend (line)                                    │
├───────────────────────────┬───────────────────────────┤
│ Sales by country (column) │ Sales by segment (pie)    │
├───────────────────────────┴───────────────────────────┤
│ Detail table                                          │
└───────────────────────────────────────────────────────┘
```

What it does beyond the static spec:

- **Every slicer scopes every visual.** Cards, charts and the table all recompute
  against the same slice, so the numbers always agree. Each slicer row shows its
  own contribution to the current filtered total.
- **The trend picks its own grain.** Ranges of 92 days or less plot daily;
  anything longer rolls up to months, so the line never turns into noise.
- **Every chart has a table twin.** The **Table** toggle on each card swaps the
  chart for the underlying numbers — no value is reachable only by hovering.
- **Light and dark.** Both themes are explicit palettes, not an inverted filter;
  the page follows the OS setting and the header toggle overrides it.
- **Keyboard and pointer parity.** Tab into a chart and arrow through the trend,
  columns and pie slices; focus shows the same readout as hover.
- **Sortable detail table** with pinned totals that always cover every filtered
  row, not just the visible page.

## Project layout

```
data/sales_data.csv        1,488 synthetic transactions, Jan 2024 – Dec 2025
scripts/generate_data.py   seeded generator for that CSV
scripts/build_dashboard.py embeds the CSV into the template -> index.html
dashboard/template.html    markup, styling and chart code (edit this)
dashboard/index.html       built, self-contained dashboard (generated)
docs/POWER_BI_GUIDE.md     step-by-step Power BI Desktop rebuild
docs/measures.dax          DAX measures for the Power BI version
docs/DESIGN_NOTES.md       why the charts look the way they do
```

## The dataset

Synthetic, seeded, and reproducible — re-running `generate_data.py` produces a
byte-identical file. The schema mirrors the well-known Power BI *Financial
Sample* workbook so the CSV drops straight into Power BI or Excel.

| Column | Type | Notes |
|---|---|---|
| `Date` | `YYYY-MM-DD` | Jan 2024 – Dec 2025 |
| `Country` | text | 6 values |
| `Product` | text | 6 values |
| `Segment` | text | 5 values |
| `Units` | integer | units sold on the transaction |
| `Sales` | decimal | units × discounted unit price, USD |
| `Profit` | decimal | sales × realised margin, USD |

Totals: **$9,160,479.56** sales, **$2,730,752.31** profit (29.8% margin). The
generator bakes in monthly seasonality (a Q4 peak), steady growth, per-country
demand weights, per-segment discounts and per-product margins, so the trend line
and the rankings have something real to show. It is not real trading data — swap
in your own extract with the same columns.

## Editing the dashboard

All the markup, CSS and chart code lives in `dashboard/template.html`;
`dashboard/index.html` is generated from it and should not be hand-edited.

```bash
# after changing the template
python3 scripts/build_dashboard.py
```

The build replaces the `/*__SALES_DATA__*/ null` placeholder in the template with
the CSV encoded as compact JSON. The template on its own still opens in a
browser — it just starts empty and waits for **Load CSV…**.
