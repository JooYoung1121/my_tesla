// 충전소 조회 프록시.
//
// 공공데이터포털 "한국환경공단_전기자동차 충전소 정보"(서비스 B552584/EvCharger)를
// 서버에서 대신 부른다. 브라우저에서 직접 부르지 않는 이유는 두 가지다.
//   1. 서비스키가 노출되면 안 된다.
//   2. data.go.kr은 CORS를 열어주지 않는다.
//
// 신청: https://www.data.go.kr/data/15076352/openapi.do (개발계정 자동승인, 일 1,000건)
// 키는 .env.local의 EV_CHARGER_SERVICE_KEY에 넣는다. ★ 포털의 "일반 인증키(Decoding)"
// 값을 그대로 넣을 것 — URLSearchParams가 인코딩하므로 Encoding 값을 넣으면 이중
// 인코딩돼 SERVICE_KEY_IS_NOT_REGISTERED_ERROR가 난다.

import { NextResponse } from "next/server";

const ENDPOINT = "https://apis.data.go.kr/B552584/EvCharger/getChargerInfo";

// 한 충전소(statId)에 충전기(chgerId)가 여러 대 붙는다. 지도에는 충전소 단위로 찍고
// 충전기 목록은 그 안에 접어 넣는다.
export type ChargerRow = {
  chgerId: string;
  chgerType: string;
  stat: string;
  statUpdDt: string;
  output: string;
  method: string;
};

export type Station = {
  statId: string;
  statNm: string;
  addr: string;
  location: string;
  lat: number;
  lng: number;
  useTime: string;
  busiNm: string;
  busiCall: string;
  parkingFree: boolean;
  limitYn: boolean;
  limitDetail: string;
  note: string;
  zscode: string;
  chargers: ChargerRow[];
};

function asArray<T>(value: T | T[] | undefined | null): T[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

function str(value: unknown): string {
  return value === undefined || value === null ? "" : String(value).trim();
}

export async function GET(request: Request) {
  const serviceKey = process.env.EV_CHARGER_SERVICE_KEY;
  if (!serviceKey) {
    return NextResponse.json(
      {
        error: "NO_KEY",
        message:
          "EV_CHARGER_SERVICE_KEY가 없다. 공공데이터포털에서 '한국환경공단_전기자동차 충전소 정보' 활용신청 후 일반 인증키(Decoding)를 .env.local에 넣고 dev 서버를 재시작할 것."
      },
      { status: 503 }
    );
  }

  const url = new URL(request.url);
  const zcode = url.searchParams.get("zcode") ?? "41";
  const zscode = url.searchParams.get("zscode") ?? "";
  const numOfRows = Math.min(Number(url.searchParams.get("numOfRows") ?? 2000) || 2000, 9999);

  const query = new URLSearchParams({
    serviceKey,
    pageNo: "1",
    numOfRows: String(numOfRows),
    dataType: "JSON",
    zcode
  });
  // zscode(시군구)를 지원하지 않는 경우에도 응답 항목에는 zscode가 들어 있어서
  // 아래에서 한 번 더 걸러낸다. 지원하면 전송량이 줄고, 아니어도 결과는 같다.
  if (zscode) query.set("zscode", zscode);

  let upstream: Response;
  try {
    upstream = await fetch(`${ENDPOINT}?${query.toString()}`, {
      headers: { Accept: "application/json" },
      // 충전기 상태가 섞여 있으므로 5분 캐시. 개발계정 일 1,000건 제한도 이걸로 아낀다.
      next: { revalidate: 300 }
    });
  } catch (error) {
    return NextResponse.json(
      { error: "UPSTREAM_UNREACHABLE", message: `공공데이터포털에 연결하지 못했다: ${String(error)}` },
      { status: 502 }
    );
  }

  const raw = await upstream.text();

  // 키 미등록·트래픽 초과 같은 오류는 dataType=JSON이어도 XML로 돌아온다.
  // 그대로 삼키면 "데이터 없음"으로 보이므로 원문 메시지를 그대로 올려보낸다.
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    const reason =
      raw.match(/<returnAuthMsg>([^<]*)<\/returnAuthMsg>/)?.[1] ??
      raw.match(/<errMsg>([^<]*)<\/errMsg>/)?.[1] ??
      raw.slice(0, 300);
    return NextResponse.json(
      { error: "UPSTREAM_ERROR", message: `공공데이터포털 응답 오류: ${reason}` },
      { status: 502 }
    );
  }

  const body = (parsed as { response?: { header?: Record<string, string>; body?: Record<string, unknown> } })
    ?.response;
  const resultCode = str(body?.header?.resultCode);
  if (resultCode && resultCode !== "00" && resultCode !== "0") {
    return NextResponse.json(
      { error: "UPSTREAM_ERROR", message: `${resultCode} ${str(body?.header?.resultMsg)}` },
      { status: 502 }
    );
  }

  const itemsNode = (body?.body as { items?: unknown })?.items;
  const rows = asArray(
    (itemsNode as { item?: unknown })?.item ?? (Array.isArray(itemsNode) ? itemsNode : undefined)
  ) as Array<Record<string, unknown>>;

  const byStation = new Map<string, Station>();
  for (const row of rows) {
    if (str(row.delYn) === "Y") continue; // 삭제된 충전기
    if (zscode && str(row.zscode) && str(row.zscode) !== zscode) continue;

    const lat = Number(row.lat);
    const lng = Number(row.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat === 0 || lng === 0) continue;

    const statId = str(row.statId);
    let station = byStation.get(statId);
    if (!station) {
      station = {
        statId,
        statNm: str(row.statNm),
        addr: str(row.addr),
        location: str(row.location),
        lat,
        lng,
        useTime: str(row.useTime),
        busiNm: str(row.busiNm),
        busiCall: str(row.busiCall),
        parkingFree: str(row.parkingFree) === "Y",
        limitYn: str(row.limitYn) === "Y",
        limitDetail: str(row.limitDetail),
        note: str(row.note),
        zscode: str(row.zscode),
        chargers: []
      };
      byStation.set(statId, station);
    }
    station.chargers.push({
      chgerId: str(row.chgerId),
      chgerType: str(row.chgerType).padStart(2, "0"),
      stat: str(row.stat),
      statUpdDt: str(row.statUpdDt),
      output: str(row.output),
      method: str(row.method)
    });
  }

  const stations = [...byStation.values()];
  return NextResponse.json({
    stations,
    stationCount: stations.length,
    chargerCount: stations.reduce((sum, station) => sum + station.chargers.length, 0),
    totalCount: Number(str((body?.body as { totalCount?: unknown })?.totalCount)) || rows.length,
    truncated: rows.length >= numOfRows
  });
}
