import React from "react";

interface Props {
  type: "commodity" | "financial";
}

const COMMODITY_ROWS = [
  { legacy: "Commercials", disaggregated: "Producer/Merchant + Swap Dealers", description: "Hedgers institucionales" },
  { legacy: "Non-Commercial / Funds", disaggregated: "Managed Money", description: "Fondos especulativos" },
];

const FINANCIAL_ROWS = [
  { legacy: "Dealer Intermediary", disaggregated: "Dealer", description: "Bancos e intermediarios" },
  { legacy: "Asset Manager", disaggregated: "Asset Manager", description: "Institucional largo plazo" },
  { legacy: "Non-Commercial / Funds", disaggregated: "Leveraged Funds", description: "Fondos especulativos" },
  { legacy: "Other Reportables", disaggregated: "Other Reportables", description: "Otros grandes participantes" },
  { legacy: "Non-Reportable", disaggregated: "Nonreportable", description: "Participantes bajo umbral" },
];

export default function LegacyEquivalencePanel({ type }: Props) {
  const rows = type === "commodity" ? COMMODITY_ROWS : FINANCIAL_ROWS;

  return (
    <div className="mb-6 bg-slate-900/60 border border-slate-800 rounded-xl p-4">
      <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-3">
        Equivalencias — Términos legacy vs. grupos Disaggregated
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left pb-2 pr-6 text-slate-500 font-normal whitespace-nowrap">Término Legacy</th>
              <th className="text-left pb-2 pr-6 text-slate-500 font-normal whitespace-nowrap">Grupo Disaggregated</th>
              <th className="text-left pb-2 text-slate-500 font-normal whitespace-nowrap">Descripción</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.legacy} className="border-b border-slate-800/40">
                <td className="py-1.5 pr-6 text-slate-300 whitespace-nowrap">{r.legacy}</td>
                <td className="py-1.5 pr-6 text-slate-400 whitespace-nowrap">{r.disaggregated}</td>
                <td className="py-1.5 text-slate-500 whitespace-nowrap">{r.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {type === "commodity" && (
        <p className="mt-3 text-[10px] font-mono text-slate-600 border-t border-slate-800 pt-2">
          ⚠ Other Reportables no disponible en Commodities (formato Disaggregated). Solo disponible en Financials (formato TFF).
        </p>
      )}
    </div>
  );
}
