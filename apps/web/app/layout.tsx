import "./globals.css";
import type { Metadata } from "next";
import { SiteHeader } from "../components/site-header";
import { SiteFooter } from "../components/site-footer";

export const metadata: Metadata = {
  title: "PROTOPOPOV PRODUCTION — Курс по фотосъёмке",
  description: "Практический курс по фотографии с симулятором камеры.",
  openGraph: {
    title: "Курс по фотосъёмке от PROTOPOPOV PRODUCTION",
    description: "Практический курс по фотографии с симулятором камеры.",
    images: ["/og.jpg"],
    type: "website"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-neutral-950 text-neutral-100">
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
