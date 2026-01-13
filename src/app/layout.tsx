import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import { loadCurrentUser } from "@/features/auth/server/load-current-user";
import { CurrentUserProvider } from "@/features/auth/context/current-user-context";

export const metadata: Metadata = {
  title: "타임박스 집중 관리 - 빠른 온보딩과 멀티 디바이스 알림",
  description:
    "60초 온보딩으로 시작하고, 데스크톱·모바일 알림으로 집중을 지키세요. 데일리·위클리 리포트로 성과를 확인하세요.",
  openGraph: {
    title: "타임박스 집중 관리",
    description: "빠른 온보딩, 멀티 디바이스, 집중 알람",
    url: "https://example.com/",
    siteName: "Timebox Focus",
    images: [
      {
        url: "https://example.com/og.jpg",
        width: 1200,
        height: 630,
        alt: "타임박스 집중 관리 서비스",
      },
    ],
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "타임박스 집중 관리",
    description: "60초 온보딩, 멀티 디바이스 동기화, 집중·휴식 알람",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentUser = await loadCurrentUser();

  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="antialiased font-sans" suppressHydrationWarning>
        <Providers>
          <CurrentUserProvider initialState={currentUser}>
            {children}
          </CurrentUserProvider>
        </Providers>
      </body>
    </html>
  );
}
