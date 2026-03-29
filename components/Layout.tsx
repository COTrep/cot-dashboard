import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { fetchCommodityList } from "../lib/queries";

interface Props {
  children: React.ReactNode;
  selectedCommodity?: string;
}

export default function Layout({ children, selectedCommodity }: Props) {
  const [commodities, setCommodities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommodityList()
      .then(setCommodities)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex">
      <Sidebar
        commodities={commodities}
        selected={selectedCommodity}
        loading={loading}
      />
      <main
        className="flex-1 min-h-screen overflow-y-auto"
        style={{ marginLeft: "var(--sidebar-width)" }}
      >
        {children}
      </main>
    </div>
  );
}
