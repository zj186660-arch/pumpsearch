import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { ComplianceStrip } from "@/components/ComplianceStrip";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PumpMind AI — 全球水泵行业智能搜索与 AI 客户开发",
  description:
    "关键词驱动的全球水泵情报、企业搜索、关系图谱、AI 邮件与触达工作台（演示版 MVP）。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-abyss-950 text-slate-100 antialiased`}
      >
        <div className="pointer-events-none fixed inset-0 bg-radial-glow" />
        <div className="pointer-events-none fixed inset-0 bg-grid-fade bg-[length:48px_48px]" />
        <div className="relative z-10 flex min-h-screen flex-col">
          <ComplianceStrip />
          <Header />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-white/5 bg-abyss-950/80 px-4 py-8 backdrop-blur">
            <div className="mx-auto flex max-w-6xl flex-col gap-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
              <p>© {new Date().getFullYear()} PumpMind AI · 演示原型</p>
              <p className="max-w-xl text-xs leading-relaxed">
                合规提示：生产环境仅聚合公开商业信息与用户授权数据；邮件触达需遵守 CAN-SPAM、GDPR
                与各地反垃圾法规。关系与“换供应商”等结论为概率推断，不作为法律或尽调结论。
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
