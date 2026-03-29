import type { CotRow } from "../lib/types";

const HEADERS: { key: keyof CotRow; label: string }[] = [
  { key: "market_and_exchange_names", label: "Market" },
  { key: "report_date_as_mm_dd_yyyy", label: "Report Date" },
  { key: "as_of_date_in_form_yyyymmdd", label: "As Of Date" },
  { key: "open_interest_all", label: "Open Interest" },
  { key: "prod_merc_positions_long_all", label: "Commercial Long" },
  { key: "prod_merc_positions_short_all", label: "Commercial Short" },
  { key: "swap_positions_long_all", label: "Swap Long" },
  { key: "swap_positions_short_all", label: "Swap Short" },
  { key: "m_money_positions_long_all", label: "Managed Money Long" },
  { key: "m_money_positions_short_all", label: "Managed Money Short" },
  { key: "traders_tot_all", label: "Total Traders" },
];

function rowsToMatrix(rows: CotRow[]): (string | number)[][] {
  const header = HEADERS.map((h) => h.label);
  const body = rows.map((r) => HEADERS.map((h) => r[h.key] ?? ""));
  return [header, ...body];
}

export function exportCsv(rows: CotRow[], filename = "cot_data.csv"): void {
  const matrix = rowsToMatrix(rows);
  const csv = matrix
    .map((row) =>
      row
        .map((cell) =>
          typeof cell === "string" && cell.includes(",")
            ? `"${cell.replace(/"/g, '""')}"`
            : String(cell)
        )
        .join(",")
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, filename);
}

export async function exportExcel(
  rows: CotRow[],
  filename = "cot_data.xlsx"
): Promise<void> {
  const XLSX = await import("xlsx");
  const matrix = rowsToMatrix(rows);
  const ws = XLSX.utils.aoa_to_sheet(matrix);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "COT Data");
  XLSX.writeFile(wb, filename);
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
