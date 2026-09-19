import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { BottomNav } from "@/components/BottomNav";
import { SidebarNav } from "@/components/SidebarNav";
import { ProjectProvider } from "@/lib/project-context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hank的AI家庭記帳本",
  description: "用一句話描述花費，AI 自動記帳",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-Hant"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-app">
        <ProjectProvider>
          <div className="mx-auto flex min-h-full w-full max-w-md bg-app md:max-w-3xl md:gap-6 md:px-6 lg:max-w-6xl">
            <SidebarNav />
            <div className="min-w-0 flex-1">{children}</div>
          </div>
          <BottomNav />
        </ProjectProvider>
      </body>
    </html>
  );
}
