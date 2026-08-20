#!/usr/bin/env python3
"""Generate the synthetic sales dataset that backs the Sales Analysis dashboard.

The schema mirrors the classic Power BI "Financial Sample" workbook so the same
CSV can be loaded straight into Power BI, Excel or the HTML dashboard:

    Date, Country, Product, Segment, Units, Sales, Profit

The generator is seeded, so re-running it reproduces byte-identical output.

Usage:
    python3 scripts/generate_data.py [--out data/sales_data.csv]
"""

from __future__ import annotations

import argparse
import csv
import random
from datetime import date
from pathlib import Path

SEED = 20260820
START = date(2024, 1, 1)
MONTHS = 24  # Jan 2024 .. Dec 2025

COUNTRIES = {
    # country: demand multiplier
    "United States": 1.45,
    "Canada": 0.95,
    "United Kingdom": 1.10,
    "Germany": 1.05,
    "France": 0.90,
    "India": 0.80,
}

PRODUCTS = {
    # product: (unit price, gross margin)
    "Carretera": (18.0, 0.30),
    "Montana": (24.0, 0.27),
    "Paseo": (32.0, 0.34),
    "Velo": (45.0, 0.22),
    "VTT": (78.0, 0.38),
    "Amarilla": (125.0, 0.41),
}

SEGMENTS = {
    # segment: (demand multiplier, discount applied to list price)
    "Government": (1.30, 0.06),
    "Enterprise": (1.15, 0.10),
    "Midmarket": (0.85, 0.04),
    "Channel Partners": (0.70, 0.14),
    "Small Business": (0.60, 0.02),
}

# Month-of-year seasonality (index 0 == January). Q4 runs hot, Q1 runs cold.
SEASONALITY = [0.82, 0.86, 0.98, 1.02, 1.05, 1.10, 0.95, 0.92, 1.06, 1.14, 1.28, 1.36]

# Rows drawn per month out of the 180 country x product x segment combinations.
ROWS_PER_MONTH = 62


def month_starts(start: date, months: int) -> list[date]:
    out = []
    year, month = start.year, start.month
    for _ in range(months):
        out.append(date(year, month, 1))
        month += 1
        if month == 13:
            year, month = year + 1, 1
    return out


def days_in_month(d: date) -> int:
    nxt = date(d.year + 1, 1, 1) if d.month == 12 else date(d.year, d.month + 1, 1)
    return (nxt - d).days


def generate_rows() -> list[dict]:
    rng = random.Random(SEED)
    combos = [(c, p, s) for c in COUNTRIES for p in PRODUCTS for s in SEGMENTS]
    rows: list[dict] = []

    for month_index, first_of_month in enumerate(month_starts(START, MONTHS)):
        # Steady year-over-year growth on top of the seasonal shape.
        growth = 1.0 + 0.016 * month_index
        season = SEASONALITY[first_of_month.month - 1]
        for country, product, segment in rng.sample(combos, ROWS_PER_MONTH):
            unit_price, margin = PRODUCTS[product]
            seg_mult, discount = SEGMENTS[segment]

            base_units = 180 * COUNTRIES[country] * seg_mult * season * growth
            base_units *= (18.0 / unit_price) ** 0.45  # cheap products move in volume
            units = max(12, round(rng.gauss(base_units, base_units * 0.22)))

            sale_price = unit_price * (1 - discount)
            sales = round(units * sale_price, 2)
            # Margin drifts a little per transaction; discounts eat into it.
            realised_margin = max(0.02, rng.gauss(margin - discount * 0.55, 0.035))
            profit = round(sales * realised_margin, 2)

            rows.append(
                {
                    "Date": first_of_month.replace(
                        day=rng.randint(1, days_in_month(first_of_month))
                    ).isoformat(),
                    "Country": country,
                    "Product": product,
                    "Segment": segment,
                    "Units": units,
                    "Sales": f"{sales:.2f}",
                    "Profit": f"{profit:.2f}",
                }
            )

    rows.sort(key=lambda r: (r["Date"], r["Country"], r["Product"], r["Segment"]))
    return rows


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--out",
        default=str(Path(__file__).resolve().parents[1] / "data" / "sales_data.csv"),
        help="output CSV path (default: data/sales_data.csv)",
    )
    args = parser.parse_args()

    rows = generate_rows()
    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with out_path.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(
            fh, fieldnames=["Date", "Country", "Product", "Segment", "Units", "Sales", "Profit"]
        )
        writer.writeheader()
        writer.writerows(rows)

    total_sales = sum(float(r["Sales"]) for r in rows)
    total_profit = sum(float(r["Profit"]) for r in rows)
    print(f"wrote {len(rows):,} rows to {out_path}")
    print(f"  date range   {rows[0]['Date']} .. {rows[-1]['Date']}")
    print(f"  total sales  {total_sales:,.2f}")
    print(f"  total profit {total_profit:,.2f} ({total_profit / total_sales:.1%} margin)")


if __name__ == "__main__":
    main()
