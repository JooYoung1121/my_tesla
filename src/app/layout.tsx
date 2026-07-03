import type { Metadata } from "next";
import { Chakra_Petch, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

// 계기판 서체: 숫자·라틴 라벨 전용(한글 본문은 Pretendard 유지).
const chakra = Chakra_Petch({
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-display"
});

// 데이터 서체: 호출부호·일시·좌표 같은 기계적 텍스트 전용.
const plexMono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-mono"
});

export const metadata: Metadata = {
  title: "마이 테슬라",
  description: "테슬라 모델 Y 인수 준비와 오너 생활을 위한 개인 정보 허브"
};

export const viewport = {
  themeColor: "#0a0a0c"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${chakra.variable} ${plexMono.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
