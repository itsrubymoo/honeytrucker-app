import type { Metadata } from "next";
import { Fraunces, Work_Sans } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";

const serif = Fraunces({ variable: "--font-serif", subsets: ["latin"] });
const sans = Work_Sans({ variable: "--font-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "honeytrucker",
  description: "a universe for creatorship and intentional living.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-stone-50 font-sans text-stone-900">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-stone-200 px-4 py-6 text-center text-xs text-stone-400">
          honeytrucker · ruby@honeytrucker.com
        </footer>
      </body>
    </html>
  );
}
