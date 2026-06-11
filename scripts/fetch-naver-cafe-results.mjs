import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");
const envPath = resolve(rootDir, ".env.local");
const outputPath = resolve(rootDir, "src/data/naver-cafe-results.ts");

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

const KEYWORDS = [
  "모델Y 프리미엄 RWD",
  "모델Y 주니퍼 인수",
  "모델Y 인수 체크",
  "모델Y 주니퍼 썬팅",
  "모델Y 썬팅",
  "테슬라 썬팅",
  "테슬라 틴팅",
  "모델Y PPF",
  "테슬라 생활보호 PPF",
  "모델Y 블랙박스",
  "테슬라 블랙박스",
  "모델Y 보험",
  "테슬라 보험",
  "모델Y 보조금",
  "테슬라 충전카드",
  "테슬라 집밥 충전",
  "모델Y 하이패스",
  "테슬라 하이패스",
  "모델Y 알리 액세서리",
  "테슬라 알리 액세서리",
  "모델Y 선쉐이드",
  "테슬라 선쉐이드",
  "모델Y 매트",
  "테슬라 매트"
];

const MAX_RESULTS_PER_KEYWORD = 6;
const MAX_TOTAL_RESULTS = 120;

function loadEnv(text) {
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

function normalizeCafeUrl(url) {
  return url.replace(/\/$/, "").replace(/^http:\/\//, "https://");
}

function decodeHtml(input) {
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function findTargetCafe(cafeurl) {
  const normalized = normalizeCafeUrl(cafeurl);
  return TARGET_CAFES.find((cafe) =>
    cafe.urls.map(normalizeCafeUrl).includes(normalized)
  );
}

function categorizeText(text) {
  if (/PPF|생활보호|도어컵|도어엣지|트렁크리드|필러|스톤칩/i.test(text)) return "PPF";
  if (/썬팅|틴팅|농도|필름|버텍스|레이노|브이쿨|루마|후퍼옵틱/i.test(text)) return "썬팅";
  if (/블랙박스|주차녹화|상시전원|보조배터리|센트리/i.test(text)) return "블랙박스";
  if (/보험|특약|자차|자기부담/.test(text)) return "보험";
  if (/보조금|국비|지방비|지원금/.test(text)) return "보조금";
  if (/충전|충전카드|슈퍼차저|집밥|회사밥|어댑터|커넥터/.test(text)) return "충전";
  if (/알리|악세사리|액세서리|선쉐이드|매트|수납|하이패스|거치대|보호필름|머드플랩/.test(text)) return "액세서리";
  if (/인수|출고|검수|체크/.test(text)) return "인수";
  return "기타";
}

function categorize(keyword, title, description) {
  const contentCategory = categorizeText(`${title} ${description}`);
  return contentCategory === "기타" ? categorizeText(keyword) : contentCategory;
}

function isLikelyNoise(title, description) {
  const text = `${title} ${description}`;
  return /가입인사|신규 가입|판매\s*합니다|팝니다|삽니다|양도|승계|장기렌트|리스\s*승계|커멘더\s*판매|S3XY\s*노브|모델\s*Y\s*L|모델YL|(^|[^A-Za-z0-9])YL([^A-Za-z0-9]|$)/i.test(text);
}

function keywordFocusPattern(keyword) {
  if (/하이패스/.test(keyword)) return /하이패스/i;
  if (/충전카드/.test(keyword)) return /충전\s*카드|충전카드/i;
  if (/집밥/.test(keyword)) return /집밥|회사밥|아파트\s*충전|완속\s*충전|충전기/i;
  if (/썬팅|틴팅/.test(keyword)) return /썬팅|틴팅|필름|농도|버텍스|레이노|브이쿨|루마|후퍼옵틱/i;
  if (/PPF|생활보호/.test(keyword)) return /PPF|생활보호|도어컵|도어엣지|트렁크리드|필러|스톤칩/i;
  if (/블랙박스/.test(keyword)) return /블랙박스|주차녹화|상시전원|보조배터리|센트리/i;
  if (/보험/.test(keyword)) return /보험|특약|자차|자기부담/i;
  if (/보조금/.test(keyword)) return /보조금|국비|지방비|지원금/i;
  if (/인수|체크/.test(keyword)) return /인수|인도|출고|검수|체크/i;
  if (/알리|액세서리/.test(keyword)) return /알리|악세사리|액세서리|수납|거치대|보호필름|머드플랩/i;
  if (/선쉐이드/.test(keyword)) return /선쉐이드|선세이드|차양|햇빛|루프\s*커버/i;
  if (/매트/.test(keyword)) return /매트|트렁크\s*매트|바닥\s*매트|TPE/i;
  if (/프리미엄|RWD/.test(keyword)) return /프리미엄|RWD|후륜|Standard Range|스탠다드/i;
  return null;
}

function matchesKeywordFocus(keyword, title, description) {
  const pattern = keywordFocusPattern(keyword);
  return !pattern || pattern.test(`${title} ${description}`);
}

async function searchCafeArticles(keyword) {
  const endpoint = new URL("https://openapi.naver.com/v1/search/cafearticle.json");
  endpoint.searchParams.set("query", keyword);
  endpoint.searchParams.set("display", "100");
  endpoint.searchParams.set("start", "1");
  endpoint.searchParams.set("sort", "date");

  const response = await fetch(endpoint, {
    headers: {
      "X-Naver-Client-Id": process.env.NAVER_CLIENT_ID,
      "X-Naver-Client-Secret": process.env.NAVER_CLIENT_SECRET
    }
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(`${keyword} 검색 실패: ${JSON.stringify(payload)}`);
  }

  return (payload.items ?? []).map((item) => {
    const title = decodeHtml(item.title);
    const description = decodeHtml(item.description);
    const targetCafe = findTargetCafe(item.cafeurl);
    return {
      keyword,
      category: categorize(keyword, title, description),
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
}

function uniqueByLink(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (seen.has(item.link)) return false;
    seen.add(item.link);
    return true;
  });
}

function toTsFile(items, searchedAt) {
  return `// 이 파일은 scripts/fetch-naver-cafe-results.mjs로 생성됩니다.
// 네이버 공개 카페글 검색 결과이며, 비공개/회원 전용 글은 포함하지 않습니다.

export const naverCafeFetchedAt = ${JSON.stringify(searchedAt)};

export const naverCafeKeywords = ${JSON.stringify(KEYWORDS, null, 2)} as const;

export const naverCafeResults = ${JSON.stringify(items, null, 2)} as const;
`;
}

try {
  loadEnv(await readFile(envPath, "utf8"));

  if (!process.env.NAVER_CLIENT_ID || !process.env.NAVER_CLIENT_SECRET) {
    throw new Error(".env.local에 NAVER_CLIENT_ID, NAVER_CLIENT_SECRET가 필요합니다.");
  }

  const batches = [];
  for (const keyword of KEYWORDS) {
    const results = await searchCafeArticles(keyword);
    const targetResults = results
      .filter((item) => item.targetCafe)
      .filter((item) => !isLikelyNoise(item.title, item.description))
      .filter((item) => matchesKeywordFocus(keyword, item.title, item.description))
      .slice(0, MAX_RESULTS_PER_KEYWORD);
    batches.push(...targetResults);
    console.log(`${keyword}: 대상 카페 ${targetResults.length}건`);
  }

  const deduped = uniqueByLink(batches)
    .slice(0, MAX_TOTAL_RESULTS);

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, toTsFile(deduped, new Date().toISOString()));

  console.log(`저장 완료: ${deduped.length}건 -> ${outputPath}`);
} catch (error) {
  console.error(error);
  process.exit(1);
}
