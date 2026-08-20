# Design notes

Why the dashboard looks the way it does. Each decision below is a rule the build
follows, not a preference — the point is that a future edit can be checked
against them.

## Color

The categorical palette is a fixed slot order, assigned by entity and never
cycled or re-assigned by rank. Slots used by this dashboard:

| Slot | Hue | Light | Dark | Used by |
|---|---|---|---|---|
| 1 | blue | `#2a78d6` | `#3987e5` | trend line, every column, pie slice 1 |
| 2 | orange | `#eb6834` | `#d95926` | pie slice 2 |
| 3 | aqua | `#1baf7a` | `#199e70` | pie slice 3 |
| 4 | yellow | `#eda100` | `#c98500` | pie slice 4 |
| 5 | magenta | `#e87ba4` | `#d55181` | pie slice 5 |

Both sets were run through a palette validator before use — colorblind
separation is measured, not eyeballed:

```
light (surface #fcfcfb)  lightness band PASS · chroma floor PASS
                         CVD separation PASS (worst adjacent ΔE 9.1, protan)
                         normal-vision floor PASS (worst adjacent ΔE 19.6)
                         contrast WARN — aqua/yellow/magenta below 3:1

dark  (surface #1a1a19)  all six checks PASS (worst adjacent CVD ΔE 8.4)
```

The light-mode contrast warning is why the pie ships a **keyed legend carrying
every value and share** rather than relying on the slices alone, and why every
chart has a table view. Colour is never the only channel: the pie's identity
comes from the legend, the column chart's from its axis labels.

Dark mode is a *selected* set of steps for the dark surface, not an inverted
filter over the light ones. Both modes are declared as CSS custom properties, so
the SVG marks (which reference `var(--series-n)`) re-theme without a re-render.

## Form

- **Cards over charts for single numbers.** Total Sales and Total Profit are
  figures, not one-bar charts. Each shows a compact value, the exact value
  underneath, and one line of context (transactions/units, margin).
- **One series, one colour.** The column chart is a single measure across
  countries, so every column is slot 1. Colouring each column differently, or
  darker-where-bigger, would double-encode the bar length and burn the only free
  channel.
- **No dual axes anywhere.** Sales and Profit never share a plot with two
  y-scales; the tooltip and the table carry Profit alongside Sales instead.
- **The pie stays a pie** because the spec asks for one and it fits the case:
  five segments, part-to-whole, read at a glance. A bar chart would rank them
  more precisely — the keyed legend covers that by printing the values.

## Marks

- Columns are capped at **24px** wide, with a **4px rounded cap** and a square
  baseline; the rest of each band is deliberate air.
- The trend line is **2px**, round-joined, over a **10% area wash** of the same
  hue — a wash, never a saturated block.
- The endpoint carries a **direct label** and an 8px marker with a 2px ring in
  the surface colour. Only one point is labelled: a number on every point is
  chaos and goes unread; the axis, the tooltip and the table carry the rest.
- Pie slices are separated by a **2px gap in the surface colour**, not by a
  stroke drawn around each slice.
- Gridlines and axes are **solid hairlines** one step off the surface — never
  dashed, never competing with the data.
- Big standalone numbers use proportional figures; `tabular-nums` is reserved for
  columns that align vertically (table cells, axis ticks).

## Interaction

- **Slicers sit in one row above everything they scope.** No per-chart filters —
  every visual re-renders against the same slice so the numbers always agree.
- **Tooltips enhance, never gate.** Everything a tooltip shows is also reachable
  through a direct label or the card's table view.
- **Hit targets are bigger than the marks.** Each column's hover area is its
  whole band; the trend has a crosshair that snaps to the nearest date, so the
  reader aims at a date rather than at a 2px line.
- **Keyboard parity.** Charts are tabbable; arrow keys walk the trend; focus
  produces the same readout as hover.
- **Values lead, labels follow** inside tooltips — the reader already knows the
  series and wants the number.

## Safety

Category labels come from a CSV, including one the user loads at runtime, so
they are treated as untrusted text: every label reaches the DOM through
`textContent`, never through `innerHTML` string concatenation. The build script
escapes `</` in the embedded JSON so a data value can't close the script block.
