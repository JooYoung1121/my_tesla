// 커뮤니티·뉴스 피드.
//
// Google 뉴스 RSS를 서버에서 파싱해 JSON으로 돌려준다. 키가 필요 없고 한국어 결과가
// 안정적으로 나온다(2026-08-14 기준 쿼리당 100건 확인).
//
// 네이버 카페(TKC)는 RSS가 없고 로그인이 필요해 읽을 수 없고, Reddit RSS는 서버
// IP에서 403/429로 막히는 일이 잦아 배포 환경에서 신뢰할 수 없다. 그래서 그 둘은
// 데이터 파일(community.ts)에 링크로만 둔다.

import { NextResponse } from "next/server";
import { feedTopics } from "@/data/community";

export type FeedItem = {
  title: string;
  link: string;
  source: string;
  publishedAt: string | null;
};

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&nbsp;": " "
};

function decode(input: string) {
  return input
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&[a-z]+;|&#39;/gi, (entity) => ENTITIES[entity.toLowerCase()] ?? entity)
    .replace(/<[^>]+>/g, "")
    .trim();
}

function pick(block: string, tag: string) {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return match ? decode(match[1]) : "";
}

export async function GET(request: Request) {
  const topicId = new URL(request.url).searchParams.get("topic") ?? feedTopics[0].id;
  const topic = feedTopics.find((candidate) => candidate.id === topicId) ?? feedTopics[0];

  const feedUrl =
    "https://news.google.com/rss/search?" +
    new URLSearchParams({ q: topic.query, hl: "ko", gl: "KR", ceid: "KR:ko" }).toString();

  let xml: string;
  try {
    const upstream = await fetch(feedUrl, {
      headers: {
        // 기본 UA로는 간헐적으로 차단된다.
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/126 Safari/537.36",
        Accept: "application/rss+xml, application/xml, text/xml"
      },
      next: { revalidate: 900 }
    });
    if (!upstream.ok) {
      return NextResponse.json(
        { error: "UPSTREAM_ERROR", message: `뉴스 피드 응답 ${upstream.status}` },
        { status: 502 }
      );
    }
    xml = await upstream.text();
  } catch (error) {
    return NextResponse.json(
      { error: "UPSTREAM_UNREACHABLE", message: `뉴스 피드를 불러오지 못했다: ${String(error)}` },
      { status: 502 }
    );
  }

  const items: FeedItem[] = [];
  for (const match of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const block = match[1];
    const title = pick(block, "title");
    const link = pick(block, "link");
    if (!title || !link) continue;

    const pubDate = pick(block, "pubDate");
    const parsedDate = pubDate ? new Date(pubDate) : null;

    items.push({
      title,
      link,
      // Google 뉴스는 제목 끝에 " - 매체명"을 붙이고 <source>에도 매체명을 넣는다.
      source: pick(block, "source") || title.split(" - ").pop() || "",
      publishedAt: parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate.toISOString() : null
    });
    if (items.length >= 24) break;
  }

  return NextResponse.json({ topic: topic.id, label: topic.label, items });
}
