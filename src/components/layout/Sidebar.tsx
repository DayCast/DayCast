import * as React from "react";
import styles from "./Sidebar.module.css";

export const Sidebar = () => {
  const menuItems = ["ダッシュボード", "タスク", "スケジュール", "設定"];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.title}>
        <span>💎</span> DayCast
      </div>
      <nav>
        <ul className={styles.menuList}>
          {menuItems.map((item, index) => (
            <li 
              key={item} 
              className={`${styles.menuItem} ${index === 0 ? styles.active : ""}`}
            >
              {item}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};