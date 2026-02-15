import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "利用規約 | DayCast",
  description: "DayCastの利用規約。サービスの利用条件、禁止事頄、免責事項觉ついて説明します。",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-3xl px-4">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
          ← ホームに戻る
        </Link>
        
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="mb-2 text-3xl font-bold text-slate-800">利用規約</h1>
          <p className="mb-8 text-sm text-slate-500">最終更新日: 2026年2月15日</p>
          
          <div className="space-y-8 text-slate-600">
            <section>
              <h2 className="mb-3 text-xl font-semibold text-slate-800">1. サービス概要</h2>
              <p>DayCast（以下「本サービス」）は、AIを活用したスケジュール管理・タスク管理サービスです。Googleカレンダーとの連携、天気情報に基づく提案、タスク管理などの機能を提供します。</p>
            </section>
            
            <section>
              <h2 className="mb-3 text-xl font-semibold text-slate-800">2. 利用資格</h2>
              <p className="mb-4">本サービスを利用するには、以下の条件を満たす必要があります：</p>
              <ul className="ml-4 list-disc space-y-2 pl-4">
                <li>Googleアカウントを保有していること</li>
                <li>本規約に同意すること</li>
                <li>日本国内から利用する場合、日本の法令を遵守すること</li>
              </ul>
            </section>
            
            <section>
              <h2 className="mb-3 text-xl font-semibold text-slate-800">3. 禁止事項</h2>
              <p className="mb-4">ユーザーは以下の行为を行ってはなりません：</p>
              <ul className="ml-4 list-disc space-y-2 pl-4">
                <li>本サービスの不正利用または悩用</li>
                <li>他のユーザーへの迷惑行為</li>
                <li>システムへの不正アクセス</li>
                <li>虚偽の情報の登鳲</li>
                <li>法令または公序良俗に違反する行為</li>
              </ul>
            </section>
            
            <section>
              <h2 className="mb-3 text-xl font-semibold text-slate-800">4. 免責事項</h2>
              <p className="mb-4">運営者は以下について貃任を負いません：</p>
              <ul className="ml-4 list-disc space-y-2 pl-4">
                <li>サービスの中断・停止による损害</li>
                <li>AIによる提案内容の正確性</li>
                <li>外部サービス（Google、天気API等）の障害</li>
                <li>ユーザー間のトラブル</li>
              </ul>
            </section>
            
            <section>
              <h2 className="mb-3 text-xl font-semibold text-slate-800">5. 規約の変更</h2>
              <p>運営者は、必要に応じて本規約を変更することがあります、重要な変更がある場合は、サービス内で通知します。</p>
            </section>
            
            <section>
              <h2 className="mb-3 text-xl font-semibold text-slate-800">6. 準拠法</h2>
              <p>本規約は日本法に準拠し、日本の裁判所を専属的合意管轄とします。</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
