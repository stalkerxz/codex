import "./globals.css";
import type { Metadata } from "next";
import SessionBar from "../components/session-bar";

export const metadata: Metadata = {
  title: "PostFlow",
  description: "Plan and publish content across platforms."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">
          <header className="bg-white shadow-sm">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
              <div className="text-lg font-semibold">PostFlow</div>
              <nav className="flex gap-4 text-sm text-slate-600">
                <a href="/dashboard" className="hover:text-slate-900">
                  Dashboard
                </a>
                <a href="/composer" className="hover:text-slate-900">
                  Composer
                </a>
                <a href="/social-accounts" className="hover:text-slate-900">
                  Social Accounts
                </a>
                <a href="/media" className="hover:text-slate-900">
                  Media Library
                </a>
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-6 py-6">{children}</main>
          <div className="mx-auto max-w-6xl px-6 pb-10">
            <SessionBar />
          </div>
        </div>
      </body>
    </html>
  );
}
