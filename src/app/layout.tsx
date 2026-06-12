import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="ko">
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
