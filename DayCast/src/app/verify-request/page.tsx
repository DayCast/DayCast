export default function VerifyRequestPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-100 via-blue-50 to-white">
      <main className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg text-center">
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-3xl text-white shadow-md">
            ✉️
          </div>
        </div>

        {/* Title */}
        <h1 className="mb-2 text-xl font-bold text-slate-800">
          メールを確認してください
        </h1>
        <p className="mb-8 text-sm text-slate-500">
          ログインリンクをメールで送信しました。
          <br />
          メールを確認してリンクをクリックしてください。
        </p>

        {/* Footer */}
        <div className="mt-8 text-xs text-slate-400">
          <p>メールが届かない場合は、迷惑メールフォルダをご確認ください。</p>
        </div>
      </main>
    </div>
  );
}
