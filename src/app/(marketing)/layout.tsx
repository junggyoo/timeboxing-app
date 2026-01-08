import type { Metadata } from "next";

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
  alternates: {
    canonical: "https://example.com/",
  },
};

type MarketingLayoutProps = {
  children: React.ReactNode;
};

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <>
      {children}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Timebox Focus",
            url: "https://example.com/",
            description:
              "60초 만에 타임박스를 만들고 알람으로 집중을 지키는 생산성 도구",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://example.com/search?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />
    </>
  );
}
