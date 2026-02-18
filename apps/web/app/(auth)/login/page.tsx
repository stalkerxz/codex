export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <p className="mt-2 text-sm text-slate-600">Use your PostFlow credentials to access your workspace.</p>
      <form className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-medium">Email</label>
          <input className="mt-1 w-full rounded border border-slate-300 px-3 py-2" type="email" placeholder="name@company.com" />
        </div>
        <div>
          <label className="text-sm font-medium">Password</label>
          <input className="mt-1 w-full rounded border border-slate-300 px-3 py-2" type="password" placeholder="********" />
        </div>
        <button type="submit" className="w-full rounded bg-slate-900 px-4 py-2 text-white">
          Sign in
        </button>
      </form>
    </div>
  );
}
