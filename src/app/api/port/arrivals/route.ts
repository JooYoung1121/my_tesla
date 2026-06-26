import { NextResponse } from "next/server";
import {
  PORTMIS,
  classifyArrivals,
  myArrivalWindow,
  type PortArrival
} from "@/data/shipment";

// PORT-MIS(해수부)가 한국에 있어 Vercel 기본 리전(미국)에서는 왕복이 느리다.
export const preferredRegion = "icn1";
export const revalidate = 1800; // 30분

function pick(obj: Record<string, unknown>, keys: string[]): string | null {
  for (const k of keys) {
    const v = obj[k];
    if (v != null && String(v).trim() !== "") return String(v).trim();
  }
  return null;
}

// "20260625", "202606251030", "2026-06-25 10:30" 등을 ISO로.
function toISO(raw: string | null): string | null {
  if (!raw) return null;
  const digits = raw.replace(/[^0-9]/g, "");
  if (digits.length >= 12) {
    return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}T${digits.slice(8, 10)}:${digits.slice(10, 12)}`;
  }
  if (digits.length >= 8) {
    return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
  }
  return null;
}

// PORT-MIS VsslEtrynd5/Info5 응답 필드명(확정).
function normalize(item: Record<string, unknown>): PortArrival & { prtAgNm: string | null } {
  const grossRaw = pick(item, ["grtg", "intrlGrtg"]);
  const gross = grossRaw ? Number(grossRaw.replace(/[^0-9.]/g, "")) : null;
  return {
    shipName: pick(item, ["vsslNm"]) ?? "(선박명 미상)",
    callSign: pick(item, ["clsgn"]),
    arrivalAt: toISO(pick(item, ["etryptDt", "dstnEtryptDt"])),
    departureAt: toISO(pick(item, ["tkoffDt", "tkoffPrrrnDt"])),
    fromPort: pick(item, ["frstDpmprtPrtNm", "prvsDpmprtPrtNm"]),
    toPort: pick(item, ["nxlnptPrtNm", "dstnPrtNm"]),
    vesselType: pick(item, ["vsslKndNm"]),
    grossTon: gross != null && Number.isFinite(gross) ? gross : null,
    nationality: pick(item, ["vsslNltyNm"]),
    berth: pick(item, ["laidupFcltyNm"]),
    prtAgNm: pick(item, ["prtAgNm"])
  };
}

function extractItems(payload: unknown): Record<string, unknown>[] {
  const p = payload as Record<string, any>;
  const candidates = [
    p?.response?.body?.items?.item,
    p?.response?.body?.items,
    p?.body?.items?.item,
    p?.items?.item,
    p?.items
  ];
  for (const c of candidates) {
    if (Array.isArray(c)) return c as Record<string, unknown>[];
    if (c && typeof c === "object") return [c as Record<string, unknown>];
  }
  return [];
}

function ymd(d: Date) {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}

export async function GET(request: Request) {
  const key = process.env.PORTMIS_SERVICE_KEY;
  if (!key) {
    return NextResponse.json(
      {
        error: "PORTMIS_SERVICE_KEY가 설정되지 않았습니다.",
        hint: "data.go.kr #15006353에서 활용신청 후 발급된 인증키를 .env.local의 PORTMIS_SERVICE_KEY에 넣으세요."
      },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const debug = searchParams.get("debug") === "1";
  const prtAgCd = searchParams.get("prtAgCd") ?? PORTMIS.prtAgCd;
  const days = Math.min(Math.max(Number(searchParams.get("days") ?? 21), 1), 60);

  // 조회 구간: 어제 ~ days일 뒤(이미 입항한 최근 건 + 예정 건 모두 포함).
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - 2);
  const end = new Date(now);
  end.setDate(end.getDate() + days);
  const sde = searchParams.get("sde") ?? ymd(start);
  const ede = searchParams.get("ede") ?? ymd(end);

  // numOfRows 최대 50 → 최대 4페이지(200건)까지 모은다.
  const all: Record<string, unknown>[] = [];
  let lastPayload: unknown = null;
  for (let page = 1; page <= 4; page += 1) {
    const endpoint = new URL(`${PORTMIS.baseUrl}/${PORTMIS.operation}`);
    endpoint.searchParams.set("serviceKey", key); // hex 키라 인코딩 이슈 없음
    endpoint.searchParams.set("prtAgCd", prtAgCd);
    endpoint.searchParams.set("sde", sde);
    endpoint.searchParams.set("ede", ede);
    endpoint.searchParams.set("deGb", "I"); // 입항일 기준
    endpoint.searchParams.set("numOfRows", String(PORTMIS.maxRows));
    endpoint.searchParams.set("pageNo", String(page));
    endpoint.searchParams.set("_type", "json");

    let payload: unknown;
    try {
      const res = await fetch(endpoint, { next: { revalidate: 1800 } });
      const text = await res.text();
      if (!res.ok) {
        return NextResponse.json(
          {
            error: "PORT-MIS API 호출 실패",
            status: res.status,
            detail: text.slice(0, 300),
            hint:
              res.status === 410 || /unauthor/i.test(text)
                ? "키가 아직 이 API에 인가/전파되지 않았습니다. data.go.kr에서 #15006353 '활용신청'이 승인됐는지 확인하고, 발급 직후면 수십 분~수 시간 대기 후 재시도하세요."
                : undefined
          },
          { status: 502 }
        );
      }
      try {
        payload = JSON.parse(text);
      } catch {
        return NextResponse.json(
          {
            error: "JSON 파싱 실패(상류가 XML 반환).",
            hint: "?debug=1 로 원본 확인 후 _type/dataType 조정.",
            sample: text.slice(0, 400)
          },
          { status: 502 }
        );
      }
    } catch (err) {
      return NextResponse.json(
        { error: "PORT-MIS 네트워크 오류", detail: String(err) },
        { status: 502 }
      );
    }

    lastPayload = payload;
    const items = extractItems(payload);
    all.push(...items);
    if (items.length < PORTMIS.maxRows) break; // 마지막 페이지
  }

  if (debug) {
    return NextResponse.json({
      endpoint: `${PORTMIS.baseUrl}/${PORTMIS.operation}`,
      params: { prtAgCd, sde, ede, deGb: "I" },
      count: all.length,
      sampleRaw: lastPayload
    });
  }

  const normalized = all.map(normalize);
  const portName = normalized.find((v) => v.prtAgNm)?.prtAgNm ?? PORTMIS.portName;
  const arrivals: PortArrival[] = normalized.map(({ prtAgNm: _omit, ...rest }) => rest);
  const nowISO = now.toISOString().slice(0, 10);
  const window = myArrivalWindow();
  const candidates = classifyArrivals(arrivals, nowISO, window);

  return NextResponse.json(
    {
      port: portName,
      prtAgCd,
      range: { sde, ede },
      fetchedAt: now.toISOString(),
      window,
      total: arrivals.length,
      returned: candidates.length,
      candidates
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=86400"
      }
    }
  );
}
