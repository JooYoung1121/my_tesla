import { NextResponse } from "next/server";

const TARGET_CAFES = [
  {
    slug: "noljatravel",
    name: "테슬라 [TKC]",
    urls: ["https://cafe.naver.com/noljatravel", "http://cafe.naver.com/noljatravel"]
  },
  {
    slug: "shootgoal",
    name: "테슬라 슈퍼 클럽",
    urls: ["https://cafe.naver.com/shootgoal", "http://cafe.naver.com/shootgoal"]
  }
];

type NaverCafeArticle = {
  title: string;
  link: string;
  description: string;
  cafename: string;
  cafeurl: string;
};

function normalizeCafeUrl(url: string) {
  return url.replace(/\/$/, "").replace(/^http:\/\//, "https://");
}

function decodeHtml(input: string) {
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function findTargetCafe(cafeurl: string) {
  const normalized = normalizeCafeUrl(cafeurl);
  return TARGET_CAFES.find((cafe) =>
    cafe.urls.map(normalizeCafeUrl).includes(normalized)
  );
}

function toSafeDisplay(value: string, fallback: number, max: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(Math.floor(parsed), 1), max);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.trim();
  const display = toSafeDisplay(searchParams.get("display") ?? "", 20, 100);
  const start = toSafeDisplay(searchParams.get("start") ?? "", 1, 1000);
  const sort = searchParams.get("sort") === "sim" ? "sim" : "date";
  const targetOnly = searchParams.get("targetOnly") !== "false";

  if (!query) {
    return NextResponse.json(
      { error: "검색어가 필요합니다." },
      { status: 400 }
    );
  }

  if (!process.env.NAVER_CLIENT_ID || !process.env.NAVER_CLIENT_SECRET) {
    return NextResponse.json(
      { error: "네이버 API 환경변수가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  const endpoint = new URL("https://openapi.naver.com/v1/search/cafearticle.json");
  endpoint.searchParams.set("query", query);
  endpoint.searchParams.set("display", String(display));
  endpoint.searchParams.set("start", String(start));
  endpoint.searchParams.set("sort", sort);

  const response = await fetch(endpoint, {
    cache: "no-store",
    headers: {
      "X-Naver-Client-Id": process.env.NAVER_CLIENT_ID,
      "X-Naver-Client-Secret": process.env.NAVER_CLIENT_SECRET
    }
  });

  const payload = await response.json();

  if (!response.ok) {
    return NextResponse.json(
      {
        error: "네이버 카페글 검색 API 호출에 실패했습니다.",
        detail: payload
      },
      { status: response.status }
    );
  }

  const items = ((payload.items ?? []) as NaverCafeArticle[]).map((item) => {
    const targetCafe = findTargetCafe(item.cafeurl);
    return {
      title: decodeHtml(item.title),
      link: item.link,
      description: decodeHtml(item.description),
      cafename: decodeHtml(item.cafename),
      cafeurl: normalizeCafeUrl(item.cafeurl),
      targetCafe: targetCafe
        ? { slug: targetCafe.slug, name: targetCafe.name }
        : null
    };
  });

  const filteredItems = targetOnly
    ? items.filter((item) => item.targetCafe)
    : items;

  return NextResponse.json({
    query,
    display,
    start,
    sort,
    total: payload.total ?? 0,
    returned: filteredItems.length,
    targetOnly,
    items: filteredItems
  });
}
