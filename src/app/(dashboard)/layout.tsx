import * as React from "react";
import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* 左：サイドバー */}
      <Sidebar />
      
      {/* 右：メインコンテンツエリア */}
      <main style={{ flex: 1, backgroundColor: "#f8fafc", padding: "40px" }}>
        {children}
      </main>
    </div>
  );
}