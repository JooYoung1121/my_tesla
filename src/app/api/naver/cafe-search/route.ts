import { NextResponse } from "next/server";

// 네이버 오픈 API가 한국에 있어 Vercel 기본 리전(미국)에서는 왕복이 느리다.
export const preferredRegion = "icn1";

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

function categorizeText(text: string) {
  if (/PPF|생활보호|도어컵|도어엣지|트렁크리드|필러|스톤칩/i.test(text)) return "PPF";
  if (/썬팅|틴팅|농도|필름|버텍스|레이노|브이쿨|루마|후퍼옵틱/i.test(text)) return "썬팅";
  if (/블랙박스|주차녹화|상시전원|보조배터리|센트리/i.test(text)) return "블랙박스";
  if (/보험|특약|자차|자기부담/.test(text)) return "보험";
  if (/보조금|국비|지방비|지원금/.test(text)) return "보조금";
  if (/충전|충전카드|슈퍼차저|집밥|회사밥|어댑터|커넥터/.test(text)) return "충전";
  if (/알리|악세사리|액세서리|선쉐이드|매트|수납|하이패스|거치대|보호필름|머드플랩/.test(text)) return "액세서리";
  if (/입항|선적|평택|글로비스|VIN|배정|탁송/i.test(text)) return "입항·배정";
  if (/인수|출고|검수|체크/.test(text)) return "인수";
  return "기타";
}

function categorize(keyword: string, title: string, description: string) {
  const contentCategory = categorizeText(`${title} ${description}`);
  return contentCategory === "기타" ? categorizeText(keyword) : contentCategory;
}

function isLikelyNoise(title: string, description: string) {
  const text = `${title} ${description}`;
  return /가입인사|신규 가입|판매\s*합니다|팝니다|삽니다|양도|승계|장기렌트|리스\s*승계|커멘더\s*판매|S3XY\s*노브|모델\s*Y\s*L|모델YL|(^|[^A-Za-z0-9])YL([^A-Za-z0-9]|$)/i.test(text);
}

function keywordFocusPattern(keyword: string) {
  if (/하이패스/.test(keyword)) return /하이패스/i;
  if (/충전카드/.test(keyword)) return /충전\s*카드|충전카드/i;
  if (/집밥/.test(keyword)) return /집밥|회사밥|아파트\s*충전|완속\s*충전|충전기/i;
  if (/썬팅|틴팅/.test(keyword)) return /썬팅|틴팅|필름|농도|버텍스|레이노|브이쿨|루마|후퍼옵틱/i;
  if (/PPF|생활보호/.test(keyword)) return /PPF|생활보호|도어컵|도어엣지|트렁크리드|필러|스톤칩/i;
  if (/블랙박스/.test(keyword)) return /블랙박스|주차녹화|상시전원|보조배터리|센트리/i;
  if (/보험/.test(keyword)) return /보험|특약|자차|자기부담/i;
  if (/보조금/.test(keyword)) return /보조금|국비|지방비|지원금/i;
  if (/입항|평택/.test(keyword)) return /입항|선적|평택|선박|글로비스|배\s*(왔|들어|떴)/i;
  if (/VIN|배정/.test(keyword)) return /VIN|배정|문자|잔금/i;
  if (/탁송/.test(keyword)) return /탁송|인도센터|비대면|출고/i;
  if (/인수|체크/.test(keyword)) return /인수|인도|출고|검수|체크/i;
  if (/알리|액세서리/.test(keyword)) return /알리|악세사리|액세서리|수납|거치대|보호필름|머드플랩/i;
  if (/선쉐이드/.test(keyword)) return /선쉐이드|선세이드|차양|햇빛|루프\s*커버/i;
  if (/매트/.test(keyword)) return /매트|트렁크\s*매트|바닥\s*매트|TPE/i;
  if (/프리미엄|RWD/.test(keyword)) return /프리미엄|RWD|후륜|Standard Range|스탠다드/i;
  return null;
}

function matchesKeywordFocus(keyword: string, title: string, description: string) {
  const pattern = keywordFocusPattern(keyword);
  return !pattern || pattern.test(`${title} ${description}`);
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
    next: { revalidate: 600 },
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
    const title = decodeHtml(item.title);
    const description = decodeHtml(item.description);
    const targetCafe = findTargetCafe(item.cafeurl);
    return {
      category: categorize(query, title, description),
      title,
      link: item.link,
      description,
      cafename: decodeHtml(item.cafename),
      cafeurl: normalizeCafeUrl(item.cafeurl),
      targetCafe: targetCafe
        ? { slug: targetCafe.slug, name: targetCafe.name }
        : null
    };
  });

  const filteredItems = (targetOnly
    ? items.filter((item) => item.targetCafe)
    : items)
    .filter((item) => !isLikelyNoise(item.title, item.description))
    .filter((item) => matchesKeywordFocus(query, item.title, item.description));

  return NextResponse.json(
    {
      query,
      display,
      start,
      sort,
      total: payload.total ?? 0,
      returned: filteredItems.length,
      targetOnly,
      items: filteredItems
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400"
      }
    }
  );
}
