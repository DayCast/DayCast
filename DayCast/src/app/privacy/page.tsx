import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "プライバシーポリシー | DayCast",
  description: "DayCastのプライバシーポリシー",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-3xl px-4">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">← ホームに戻る</Link>
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="mb-2 text-3xl font-bold text-slate-800">プライバシーポリシー</h1>
          <p className="mb-8 text-sm text-slate-500">最終更新日: 2026年2月15日</p>
          <div className="space-y-8 text-slate-600">
            <section>
              <h2 className="mb-3 text-xl font-semibold text-slate-800">1. 収集する情報</h2>
              <p className="mb-4">DayCastでは、サービス提供のために以下の情報を収集します：</p>
              <ul className="ml-4 list-disc space-y-2 pl-4">
                <li><strong>アカウント情報：</strong>氏名、メールアドレス、プロフィール画像（Googleアカウント経由）</li>
                <li><strong>カレンダーデータ：</strong>Googleカレンダーと連携した場合の予定情報（タイトル、日時、場所）</li>
                <li><strong>タスク情報：</strong>作成したTodo、優先度、期限</li>
                <li><strong>位置情報：</strong>天気予報取得のための都市名</li>
              </ul>
            </section>
            <section>
              <h2 className="mb-3 text-xl font-semibold text-slate-800">2. 情報の利用目的</h2>
              <p className="mb-4">収集した情報は以下の目的で利用します：</p>
              <ul className="ml-4 list-disc space-y-2 pl-4">
                <li>スケジュール管理機能の提供・最適化</li>
                <li>AIによる予定・タスクの提案</li>
                <li>天気情報に基づく持ち物提案</li>
                <li>サービスの改善・新機能開発</li>
                <li>ユーザーサポートの提供</li>
              </ul>
            </section>
            <section>
              <h2 className="mb-3 text-xl font-semibold text-slate-800">3. 第三者サービスとの連携</h2>
              <p className="mb-4">DayCastは以下の第三者サービスと連携しています：</p>
              <div className="space-y-4">
                <div className="rounded-lg bg-slate-50 p-4">
                  <h3 className="mb-1 font-medium text-slate-700">Google Gemini API</h3>
                  <p className="text-sm">AIによる予定提案・分析機能に使用します。</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <h3 className="mb-1 font-medium text-slate-700">Google Calendar API</h3>
                  <p className="text-sm">Googleカレンダーとの同期に使用します。</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <h3 className="mb-1 font-medium text-slate-700">OpenWeatherMap API</h3>
                  <p className="text-sm">天気予報情報の取得に使用します。</p>
                </div>
              </div>
            </section>
            <section>
              <h2 className="mb-3 text-xl font-semibold text-slate-800">4. データの保護</h2>
              <p>お客様の個人情報を保護するため、適切な技術的・組織的措置を講じています。データは暗号化された接続（HTTPS）を通じて転送され、安全なサーバーに保存されます。</p>
            </section>
            <section>
              <h2 className="mb-3 text-xl font-semibold text-slate-800">5. ユーザーの権利</h2>
              <p className="mb-4">ユーザーには以下の権利があります：</p>
              <ul className="ml-4 list-disc space-y-2 pl-4">
                <li>保存されている個人データへのアクセス</li>
                <li>不正確なデータの訂正</li>
                <li>アカウントおよび関連データの削除</li>
                <li>データ処理への同意の撤回</li>
                <li>外部サービス連携の解除</li>
              </ul>
              <p className="mt-4">これらの権利を行使する場合は、設定ページから操作するか、サポートまでお問い合わせください。</p>
            </section>
            <section>
              <h2 className="mb-3 text-xl font-semibold text-slate-800">6. お問い合わせ</h2>
              <p>プライバシーポリシーに関するご質問やご要望は、サポートまでお問い合わせください。</p>
            </section>
          </div>
        </div>
        <div className="mt-6 text-center">
          <Link href="/terms" className="text-sm text-slate-500 hover:text-slate-700">利用規約はこちら →</Link>
        </div>
      </div>
    </div>
  );
}
