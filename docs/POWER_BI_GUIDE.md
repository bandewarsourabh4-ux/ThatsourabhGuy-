# Building the same dashboard in Power BI Desktop

`dashboard/index.html` is the working build of this spec. This guide reproduces
the identical report in Power BI Desktop from the same CSV, visual by visual, in
the order the spec lists them.

---

## 1. Load the data

1. **Home → Get data → Text/CSV** → pick `data/sales_data.csv` → **Transform Data**.
2. In Power Query, confirm the column types:

   | Column | Type |
   |---|---|
   | Date | Date |
   | Country | Text |
   | Product | Text |
   | Segment | Text |
   | Units | Whole number |
   | Sales | Decimal number |
   | Profit | Decimal number |

3. **Close & Apply.** The table lands as `sales_data`.

## 2. Add a date table (recommended)

Slicing by date is far better behaved against a marked date table than against
the fact table's own column.

```dax
Date Table =
ADDCOLUMNS (
    CALENDAR ( MIN ( sales_data[Date] ), MAX ( sales_data[Date] ) ),
    "Year", YEAR ( [Date] ),
    "Month Number", MONTH ( [Date] ),
    "Month", FORMAT ( [Date], "MMM" ),
    "Year Month", FORMAT ( [Date], "MMM yyyy" ),
    "Quarter", "Q" & QUARTER ( [Date] )
)
```

Then:

- Sort **Month** by **Month Number** (Column tools → Sort by column).
- **Table tools → Mark as date table** → `Date`.
- **Model view**: drag `Date Table[Date]` onto `sales_data[Date]` — a one-to-many,
  single-direction relationship.

Point the Date slicer and the line chart's axis at `Date Table[Date]`.

## 3. Measures

Create these in a dedicated `_Measures` table (Home → Enter data → empty table
named `_Measures`, then add each measure to it). The full set is also in
[`measures.dax`](measures.dax).

```dax
Total Sales  = SUM ( sales_data[Sales] )
Total Profit = SUM ( sales_data[Profit] )
Total Units  = SUM ( sales_data[Units] )
Profit Margin = DIVIDE ( [Total Profit], [Total Sales] )
Transactions = COUNTROWS ( sales_data )
```

Format `Total Sales` / `Total Profit` as Currency with 0 decimals, and
`Profit Margin` as Percentage with 1 decimal.

## 4. The visuals

| # | Visual | Field wells | Notes |
|---|---|---|---|
| 1 | **Card** | Fields: `[Total Sales]` | Category label on, display units Auto |
| 2 | **Card** | Fields: `[Total Profit]` | Same formatting as card 1 |
| 3 | **Line chart** | X-axis: `Date Table[Date]` · Y-axis: `[Total Sales]` | Set X-axis type to **Continuous**; drop the date hierarchy down to Month for a 24-point line |
| 4 | **Clustered column chart** | X-axis: `sales_data[Country]` · Y-axis: `[Total Sales]` | Sort descending by Total Sales; turn **Data labels** on |
| 5 | **Pie chart** | Legend: `sales_data[Segment]` · Values: `[Total Sales]` | Detail labels → Category, percent of total |
| 6 | **Table** | Columns: `Country`, `Product`, `Segment`, `[Total Sales]`, `[Total Profit]` | Turn **Totals** on in the Format pane |

Slicers (Format pane → Slicer settings):

| Slicer | Field | Style |
|---|---|---|
| 1 | `Date Table[Date]` | **Between** (range slider) |
| 2 | `sales_data[Country]` | Vertical list, multi-select |
| 3 | `sales_data[Product]` | Vertical list, multi-select |

All three slicers filter every visual on the page — leave the default
interactions alone (**Format → Edit interactions** if you ever need to change it).

## 5. Layout

Match the spec's arrangement on a 1280 × 960 page:

```
┌───────────────────────────┬───────────────────────────┐
│ Card — Total Sales        │ Card — Total Profit       │
├───────────────┬───────────┴───────┬───────────────────┤
│ Slicer: Date  │ Slicer: Country   │ Slicer: Product   │
├───────────────┴───────────────────┴───────────────────┤
│ Line chart — Sales by Date                            │
├───────────────────────────┬───────────────────────────┤
│ Column chart — Country    │ Pie chart — Segment       │
├───────────────────────────┴───────────────────────────┤
│ Table — Country, Product, Segment, Sales, Profit      │
└───────────────────────────────────────────────────────┘
```

Use **View → Gridlines + Snap to grid**, and align each row with
**Format → Align → Distribute horizontally**.

## 6. Theme (optional)

To carry the HTML build's palette into Power BI, save this as `theme.json` and
load it with **View → Themes → Browse for themes**. The eight `dataColors` are the
validated light-mode categorical order used by the HTML dashboard.

```json
{
  "name": "Sales Analysis",
  "dataColors": ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300", "#4a3aa7", "#e34948"],
  "background": "#fcfcfb",
  "foreground": "#0b0b0b",
  "tableAccent": "#2a78d6"
}
```

## 7. Publish

**Home → Publish** → pick a workspace. To keep the report refreshing, upload
`sales_data.csv` to OneDrive/SharePoint and re-point the query there before
publishing, then configure scheduled refresh in the Power BI service.
