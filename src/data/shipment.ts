// 선적 추적 설정 및 매칭 로직.
//
// 데이터 레이어 구분(중요):
//  A. 입항 스케줄(어떤 배가 언제 평택에 들어오는가) = PORT-MIS 선박운항정보 오픈API(실시간).
//     출처: data.go.kr #15006353, base = https://apis.data.go.kr/1192000/VsslEtrynd5
//  B. 내 차 매칭 = 내 계약일 + TKC 실측 리드타임(deliveryLeadStats)으로 추정한 "입항 윈도우".
//
// 차량 단위 적재 명세(모델별 대수)는 어떤 공개 API에도 없다. tkc/지지직의 모델별 수치는
// 회원 제보 + 통관정보 기반 추정값이라 여기서는 다루지 않는다. 우리는 (A)로 후보 선박을
// 좁히고 (B)로 "내 차가 탔을 법한 배"를 표시하는 데까지만 한다.

import { deliveryLeadStats, myOrder, pickLeadStat } from "./home";

// ── PORT-MIS 오픈API 설정 ──────────────────────────────────────────────
// 실제 스펙(2026-06-26 data.go.kr Swagger에서 확인):
//   GET https://apis.data.go.kr/1192000/VsslEtrynd5/Info5
//   필수: serviceKey, prtAgCd(항만청코드), sde(조회시작 YYYYMMDD), ede(조회종료 YYYYMMDD)
//   선택: deGb(I=입항일기준 기본 / O=출항일기준), clsgn(호출부호), numOfRows(최대 50), pageNo
export const PORTMIS = {
  baseUrl: "https://apis.data.go.kr/1192000/VsslEtrynd5",
  operation: "Info5",
  // 평택지방해양수산청 항만청코드. 2026-06-26 실측 확정(응답 prtAgNm="평택").
  // 참고: 030=인천, 050=경인. (/api/port/arrivals?prtAgCd=NNN&debug=1 로 확인 가능)
  prtAgCd: "031",
  portName: "평택",
  maxRows: 50
};

// 평택 동부두로 들어오는 자동차전용선(PCTC) 중 테슬라 적재 가능 선사/선박.
// GLOVIS(현대글로비스, 테슬라 한국 수입 물류 담당)가 핵심. 필요 시 보강.
export const TESLA_VESSEL_PATTERN =
  /GLOVIS|H[OÖ]EGH|MORNING|SUNRISE|CERTAINTY|SPLENDOR|SYMPHONY|CHORUS|SUCCESS|PRESTIGE/i;

// 테슬라 생산공장 출발항(한글/영문 모두): 기가상하이 / 프리몬트(샌프란시스코·베니시아).
export const TESLA_ORIGIN_PATTERN =
  /SHANGHAI|SHA\b|SAN ?FRANCISCO|BENICIA|OAKLAND|PIPAVAV|MUNDRA|상하이|상해|샌프란시스코|베니시아/i;

// 자동차전용선(PCTC) 선박종류. PORT-MIS vsslKndNm 값 기준.
export const CAR_CARRIER_PATTERN = /자동차|차량운반|car ?carrier|vehicle|PCTC|RO-?RO|로로/i;

// 입항(평택)에서 실제 인도까지의 선행일. 통관(2~4일)+탁송/PDI를 합쳐 보수적으로 가정.
// 즉 "예상 인도 시점 - PORT_LEAD_DAYS ≈ 예상 입항 시점".
export const PORT_LEAD_DAYS = 12;

// ── 정규화 타입 ────────────────────────────────────────────────────────
export type PortArrival = {
  shipName: string;
  callSign: string | null;
  arrivalAt: string | null; // ISO(YYYY-MM-DD 또는 ...THH:mm)
  departureAt: string | null;
  fromPort: string | null; // 최초출항지(없으면 전출항지) — 표시·알림용 요약
  firstPort: string | null; // 최초출항지(frstDpmprtPrtNm) — 항차의 시작점
  prevPort: string | null; // 직전출항지(prvsDpmprtPrtNm) — 평택 직전에 떠난 항
  toPort: string | null; // 차출항지
  vesselType: string | null; // 선박종류명(예: 자동차운반선)
  grossTon: number | null;
  nationality: string | null;
  berth: string | null; // 계선시설명
};

// high = 테슬라 선대명/기가팩토리 출발항, medium = 자동차운반선+해외출항, low = 자동차운반선
export type CandidateStrength = "high" | "medium" | "low";

// 판정에 쓴 개별 검사 결과. UI에서 ✓/✗ 체크리스트로 그대로 보여준다.
export type JudgmentCheck = {
  label: string; // 검사 이름(예: "테슬라 운송 선대명")
  hit: boolean;
  detail: string | null; // 검사한 값 또는 매칭된 값
};

export type CandidateVessel = PortArrival & {
  isTeslaCandidate: boolean;
  strength: CandidateStrength;
  reasons: string[]; // 후보로 본 근거(요약 — 디스코드 알림에도 씀)
  checks: JudgmentCheck[]; // 판정 근거 전체(카드 펼침에서 표시)
  dDay: number | null; // 오늘 기준 입항까지 남은 일수(음수=이미 입항)
  inMyWindow: boolean; // 내 추정 입항 윈도우 안에 들어오는가
};

// ── 날짜 유틸(순수 함수) ───────────────────────────────────────────────
function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function addDaysISO(baseISO: string, days: number) {
  const d = new Date(`${baseISO}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function daysBetween(fromISO: string, toISO: string) {
  const a = startOfDay(new Date(fromISO));
  const b = startOfDay(new Date(toISO));
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

// ── 내 차 입항 윈도우 추정(레이어 B) ──────────────────────────────────
export type ArrivalWindow = {
  trimLabel: string;
  basis: "recent" | "allTime";
  cohortLabel: string;
  contractDate: string;
  from: string; // p25 기반 빠른 쪽
  mid: string; // median
  to: string; // p75 기반 늦은 쪽
};

export function myArrivalWindow(): ArrivalWindow {
  const stat = pickLeadStat(myOrder.trim);
  return {
    trimLabel: stat.trimLabel,
    basis: stat.basis,
    cohortLabel: stat.cohortLabel,
    contractDate: myOrder.contractDate,
    from: addDaysISO(myOrder.contractDate, stat.p25 - PORT_LEAD_DAYS),
    mid: addDaysISO(myOrder.contractDate, stat.median - PORT_LEAD_DAYS),
    to: addDaysISO(myOrder.contractDate, stat.p75 - PORT_LEAD_DAYS)
  };
}

export const leadStatsSource = {
  label: deliveryLeadStats.source,
  collectedAt: deliveryLeadStats.collectedAt
};

// 국내항 판정용(한글 포함 또는 주요 국내 무역항). 해외출항 자동차선을 골라내기 위함.
const KOREAN_PORT_PATTERN =
  /[가-힣]|평택|당진|인천|부산|울산|광양|여수|목포|군산|마산|포항|동해|대산|보령|BUSAN|INCHEON|ULSAN|GWANGYANG|PYEONGTAEK|MASAN/i;

// ── 분류/매칭 ──────────────────────────────────────────────────────────
function classifyVessel(
  v: PortArrival
): { strength: CandidateStrength; reasons: string[]; checks: JudgmentCheck[] } | null {
  const nameHit = TESLA_VESSEL_PATTERN.test(v.shipName);
  const typeHit = Boolean(v.vesselType && CAR_CARRIER_PATTERN.test(v.vesselType));

  // 출발항 검사는 최초출항지·직전출항지 둘 다 본다. 자동차선은 여러 항을 도는
  // 순환 노선이라 최초출항지가 상하이가 아니어도 중간에 상하이에서 실었을 수 있고,
  // 그 경우 직전출항지가 힌트가 된다. (중간 기항지 자체는 PORT-MIS 신고에 없음)
  const gigaOrigin =
    v.prevPort && TESLA_ORIGIN_PATTERN.test(v.prevPort)
      ? { field: "직전 출항", port: v.prevPort }
      : v.firstPort && TESLA_ORIGIN_PATTERN.test(v.firstPort)
        ? { field: "최초 출항", port: v.firstPort }
        : null;
  const originHit = gigaOrigin != null;
  // 어디서 바로 왔는가: 직전출항지 우선, 없으면 최초출항지.
  const directPort = v.prevPort ?? v.firstPort;
  const foreignOrigin = Boolean(directPort && !KOREAN_PORT_PATTERN.test(directPort));

  // 자동차운반선도 아니고 테슬라 선대명도 아니면 제외.
  if (!nameHit && !typeHit) return null;

  const reasons: string[] = [];
  if (nameHit) reasons.push("테슬라 운송 선대");
  else if (v.vesselType) reasons.push(v.vesselType);
  if (gigaOrigin) reasons.push(`${gigaOrigin.field} ${gigaOrigin.port} (기가팩토리)`);
  else if (foreignOrigin && directPort) reasons.push(`직전 출항 ${directPort}`);
  else if (nameHit && directPort) reasons.push(`출발 ${directPort} (국내 연안 운항)`);

  const checks: JudgmentCheck[] = [
    {
      label: "테슬라 운송 선대명",
      hit: nameHit,
      detail: nameHit ? `선박명 "${v.shipName}" 이 알려진 선대 패턴과 일치` : `선박명 "${v.shipName}"`
    },
    {
      label: "자동차운반선(선종)",
      hit: typeHit,
      detail: v.vesselType ?? "선종 미상"
    },
    {
      label: "기가팩토리 출발항(최초·직전)",
      hit: originHit,
      detail: gigaOrigin
        ? `${gigaOrigin.field}지 ${gigaOrigin.port}`
        : [v.firstPort && `최초 ${v.firstPort}`, v.prevPort && `직전 ${v.prevPort}`]
            .filter(Boolean)
            .join(" · ") || "출항지 미상"
    },
    {
      label: "해외에서 직행",
      hit: foreignOrigin,
      detail: directPort ? `직전 출항지 ${directPort}` : "출항지 미상"
    }
  ];

  // 강도: 기가팩토리 출발 또는 선대명+해외출항 = high,
  // 선대명이지만 국내 항 출발(연안 운항, 테슬라 수입분 가능성 낮음) = medium,
  // 자동차선+해외출항 = medium, 그 외 자동차선 = low
  let strength: CandidateStrength = "low";
  if (originHit || (nameHit && foreignOrigin)) strength = "high";
  else if (nameHit || (typeHit && foreignOrigin)) strength = "medium";

  return { strength, reasons, checks };
}

const STRENGTH_RANK: Record<CandidateStrength, number> = { high: 0, medium: 1, low: 2 };

export function classifyArrivals(
  arrivals: PortArrival[],
  nowISO: string,
  window: ArrivalWindow
): CandidateVessel[] {
  return arrivals
    .map((v): CandidateVessel | null => {
      const hit = classifyVessel(v);
      if (!hit) return null;
      const dDay = v.arrivalAt ? daysBetween(nowISO, v.arrivalAt.slice(0, 10)) : null;
      const inMyWindow = v.arrivalAt
        ? v.arrivalAt.slice(0, 10) >= window.from && v.arrivalAt.slice(0, 10) <= window.to
        : false;
      return {
        ...v,
        isTeslaCandidate: true,
        strength: hit.strength,
        reasons: hit.reasons,
        checks: hit.checks,
        dDay,
        inMyWindow
      };
    })
    .filter((v): v is CandidateVessel => v !== null)
    .sort((a, b) => {
      // 내 윈도우 우선 → 강도순(테슬라 가능성) → 입항 임박순
      if (a.inMyWindow !== b.inMyWindow) return a.inMyWindow ? -1 : 1;
      if (a.strength !== b.strength) return STRENGTH_RANK[a.strength] - STRENGTH_RANK[b.strength];
      if (a.dDay == null) return 1;
      if (b.dDay == null) return -1;
      return a.dDay - b.dDay;
    });
}
