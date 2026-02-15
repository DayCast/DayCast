"use client";

import * as React from "react";
import { useState, useEffect } from "react";

export default function DashboardPage() {
  const [text, setText] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false); // AIが考えているかどうかの状態
  const [tasks, setTasks] = useState([
    { id: 1, content: "開発環境を整える", completed: true },
    { id: 2, content: "ToDoリスト機能を実装する", completed: false },
  ]);

  const handleToggle = (id: number) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleAdd = () => {
    if (!text) return;
    const newTask = { id: Date.now(), content: text, completed: false };
    setTasks([newTask, ...tasks]);
    setText("");

    // タスク追加時にAIを「思考中」にする演出
    setIsAiThinking(true);
    setTimeout(() => setIsAiThinking(false), 2000); // 2秒後に思考終了
  };

  return (
    <div>
      <h1 style={{ marginBottom: "24px", fontSize: "24px", fontWeight: "bold" }}>今日のプラン</h1>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "24px" }}>
        {/* 左側：ToDoエリア */}
        <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", minHeight: "500px" }}>
          <h2 style={{ fontSize: "18px", marginBottom: "16px" }}>タスク一覧</h2>
          <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
            <input 
              type="text" 
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="新しいタスクを入力..." 
              style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0", outline: "none" }}
            />
            <button onClick={handleAdd} style={{ backgroundColor: "#2563eb", color: "white", padding: "0 20px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold" }}>追加</button>
          </div>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {tasks.map((task) => (
              <li key={task.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", borderBottom: "1px solid #f1f5f9", cursor: "pointer" }} onClick={() => handleToggle(task.id)}>
                <input type="checkbox" checked={task.completed} onChange={() => {}} />
                <span style={{ color: task.completed ? "#94a3b8" : "#1e293b", textDecoration: task.completed ? "line-through" : "none" }}>{task.content}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 右側：AIアドバイスエリア */}
        <div style={{ backgroundColor: "#eff6ff", padding: "24px", borderRadius: "12px", border: "1px solid #bfdbfe", height: "fit-content", minHeight: "150px", position: "relative" }}>
          <h2 style={{ fontSize: "18px", marginBottom: "16px", color: "#1e40af" }}>AIの提案 🪄</h2>
          
          {isAiThinking ? (
            /* 思考中アニメーション */
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div className="dot-animation" style={{ color: "#1e40af" }}>AIがプランを分析中</div>
              <span className="dot">.</span><span className="dot">.</span><span className="dot">.</span>
            </div>
          ) : (
            <p style={{ color: "#1e40af", fontSize: "14px", lineHeight: "1.6" }}>
              「新しいタスクが追加されましたね。これなら午前中のうちに終わらせるのが効率的ですよ！」
            </p>
          )}
        </div>
      </div>

      {/* アニメーション用のCSS */}
      <style jsx>{`
        .dot {
          animation: blink 1.4s infinite both;
          font-size: 20px;
          color: #2563eb;
        }
        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes blink {
          0% { opacity: 0.2; }
          20% { opacity: 1; }
          100% { opacity: 0.2; }
        }
      `}</style>
    </div>
  );
}