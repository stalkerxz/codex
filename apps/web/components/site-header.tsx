import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-white/10">
      <div className="container-base flex items-center justify-between py-6">
        <Link href="/" className="text-lg font-semibold tracking-wide">
          PROTOPOPOV PRODUCTION
        </Link>
        <nav className="flex gap-6 text-sm text-neutral-300">
          <Link href="/#program">Программа</Link>
          <Link href="/#pricing">Тарифы</Link>
          <Link href="/simulator">Практикум</Link>
          <Link href="/dashboard">Кабинет</Link>
        </nav>
      </div>
    </header>
  );
}
