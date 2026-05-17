// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = Record<string, any>;

function rowsToMatrix(rows: AnyRow[]): (string | number)[][] {
  if (rows.length === 0) return [];
  const keys = Object.keys(rows[0]);
  const header = keys;
  const body = rows.map((r) => keys.map((k) => r[k] ?? ""));
  return [header, ...body];
}

export function exportCsv(rows: AnyRow[], filename = "cot_data.csv"): void {
  const matrix = rowsToMatrix(rows);
  if (matrix.length === 0) return;
  const csv = matrix
    .map((row) =>
      row
        .map((cell) =>
          typeof cell === "string" && (cell.includes(",") || cell.includes('"'))
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
  rows: AnyRow[],
  filename = "cot_data.xlsx"
): Promise<void> {
  const matrix = rowsToMatrix(rows);
  if (matrix.length === 0) return;
  const XLSX = await import("xlsx");
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
