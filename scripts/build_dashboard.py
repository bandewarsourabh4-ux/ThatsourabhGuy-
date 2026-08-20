#!/usr/bin/env python3
"""Embed the CSV dataset into the dashboard template.

dashboard/template.html holds the markup, styling and chart code with a
`/*__SALES_DATA__*/ null` placeholder. This script swaps that placeholder for a
compact JSON payload built from the CSV and writes dashboard/index.html, which
is fully self-contained: open it straight from disk, no server, no dependencies.

Usage:
    python3 scripts/build_dashboard.py
    python3 scripts/build_dashboard.py --csv data/sales_data.csv --out dashboard/index.html
"""

from __future__ import annotations

import argparse
import csv
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PLACEHOLDER = re.compile(r"/\*__SALES_DATA__\*/\s*null")
REQUIRED = ["Date", "Country", "Product", "Segment", "Sales", "Profit"]


def to_number(value: str) -> float:
    return float(re.sub(r"[$,\s]", "", value or "0") or 0)


def encode(csv_path: Path) -> dict:
    """CSV -> {countries, products, segments, rows} with index-encoded labels."""
    countries: list[str] = []
    products: list[str] = []
    segments: list[str] = []
    rows: list[list] = []

    def key(pool: list[str], value: str) -> int:
        if value not in pool:
            pool.append(value)
        return pool.index(value)

    with csv_path.open(newline="", encoding="utf-8-sig") as fh:
        reader = csv.DictReader(fh)
        missing = [c for c in REQUIRED if c not in (reader.fieldnames or [])]
        if missing:
            raise SystemExit(f"{csv_path}: missing column(s): {', '.join(missing)}")
        has_units = "Units" in (reader.fieldnames or [])

        for record in reader:
            date = (record["Date"] or "").strip()
            if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", date):
                continue
            rows.append(
                [
                    date,
                    key(countries, record["Country"].strip()),
                    key(products, record["Product"].strip()),
                    key(segments, record["Segment"].strip()),
                    int(to_number(record["Units"])) if has_units else 0,
                    round(to_number(record["Sales"]), 2),
                    round(to_number(record["Profit"]), 2),
                ]
            )

    if not rows:
        raise SystemExit(f"{csv_path}: no usable data rows (dates must be YYYY-MM-DD)")

    rows.sort(key=lambda r: r[0])
    return {"countries": countries, "products": products, "segments": segments, "rows": rows}


def to_fragment(html: str) -> str:
    """Strip the document wrapper, keeping <title>, <style> and the body content."""
    def grab(pattern: str) -> str:
        match = re.search(pattern, html, re.S | re.I)
        if not match:
            raise SystemExit(f"could not find {pattern} while building the fragment")
        return match.group(1).strip()

    title = grab(r"<title>(.*?)</title>")
    style = grab(r"(<style>.*?</style>)")
    body = grab(r"<body[^>]*>(.*?)</body>")
    return f"<title>{title}</title>\n{style}\n{body}\n"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--csv", default=str(ROOT / "data" / "sales_data.csv"))
    parser.add_argument("--template", default=str(ROOT / "dashboard" / "template.html"))
    parser.add_argument("--out", default=str(ROOT / "dashboard" / "index.html"))
    parser.add_argument(
        "--fragment",
        metavar="PATH",
        help="also write a body-only copy (title + styles + content, no "
             "doctype/html/head/body wrapper) for hosts that supply their own "
             "document shell",
    )
    args = parser.parse_args()

    payload = encode(Path(args.csv))
    template = Path(args.template).read_text(encoding="utf-8")
    if not PLACEHOLDER.search(template):
        raise SystemExit(f"{args.template}: /*__SALES_DATA__*/ placeholder not found")

    # </script> inside the payload would end the script block early.
    blob = json.dumps(payload, separators=(",", ":")).replace("</", "<\\/")
    html = PLACEHOLDER.sub(lambda _: blob, template, count=1)

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(html, encoding="utf-8")

    if args.fragment:
        fragment_path = Path(args.fragment)
        fragment_path.parent.mkdir(parents=True, exist_ok=True)
        fragment_path.write_text(to_fragment(html), encoding="utf-8")
        print(f"built {fragment_path} ({fragment_path.stat().st_size / 1024:.0f} KB, body-only)")

    total_sales = sum(r[5] for r in payload["rows"])
    print(f"built {out_path} ({out_path.stat().st_size / 1024:.0f} KB)")
    print(f"  {len(payload['rows']):,} rows · {len(payload['countries'])} countries · "
          f"{len(payload['products'])} products · {len(payload['segments'])} segments")
    print(f"  total sales {total_sales:,.2f}")


if __name__ == "__main__":
    main()
