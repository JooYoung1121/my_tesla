// 충전 데이터 레이어.
//
// 축: "무슨 충전기가 있고 / 내 차로 그걸 쓰려면 뭐가 필요하고 / 어떻게 결제하나".
//
// 사실/추정 표기 원칙(CLAUDE.md 응답 규칙 2):
//  - source "공식"  = 테슬라·정부 공식 문서에서 확인한 사실
//  - source "커뮤니티" = 오너 후기 기반 판단(= 추정)
//  - 가격·소요기간은 대부분 범위 추정치다.

export type Source = "공식" | "커뮤니티" | "확인필요";

// ── 지역 프리셋 ────────────────────────────────────────────────────────
// 생활권은 경기 남부(성남·용인·수원). zcode/zscode는 환경부 API의 지역 코드로,
// 행정표준코드(법정동 코드) 앞 2자리 / 5자리다.
export type RegionPreset = {
  id: string;
  label: string;
  zcode: string;
  zscode?: string;
  center: [number, number];
  zoom: number;
};

export const regionPresets: RegionPreset[] = [
  { id: "seongnam", label: "성남", zcode: "41", zscode: "41130", center: [37.4200, 127.1265], zoom: 12 },
  { id: "yongin", label: "용인", zcode: "41", zscode: "41460", center: [37.2411, 127.1776], zoom: 11 },
  { id: "suwon", label: "수원", zcode: "41", zscode: "41110", center: [37.2636, 127.0286], zoom: 12 },
  { id: "gyeonggi", label: "경기 전체", zcode: "41", center: [37.2750, 127.0090], zoom: 10 },
  { id: "seoul", label: "서울", zcode: "11", center: [37.5665, 126.9780], zoom: 11 }
];

// ── 환경부 API 코드 디코딩 ─────────────────────────────────────────────
// 출처: 공공데이터포털 "한국환경공단_전기자동차 충전소 정보"(서비스 B552584/EvCharger)
// https://www.data.go.kr/data/15076352/openapi.do
//
// tesla: 내 차(국내 사양 Model Y)로 이 충전기를 쓸 수 있는가.
//   "adapter"  = CCS 콤보1 어댑터를 꽂으면 쓸 수 있는 DC 급속
//   "slow"     = J1772 어댑터가 필요한 AC 완속
//   "no"       = 어댑터가 있어도 못 쓴다(차데모·AC3상·수소)
export type TeslaFit = "adapter" | "slow" | "no";

export const chargerTypes: Record<string, { label: string; short: string; tesla: TeslaFit }> = {
  "01": { label: "DC차데모", short: "차데모", tesla: "no" },
  "02": { label: "AC완속", short: "완속", tesla: "slow" },
  "03": { label: "DC차데모 + AC3상", short: "차데모+3상", tesla: "no" },
  "04": { label: "DC콤보", short: "DC콤보", tesla: "adapter" },
  "05": { label: "DC차데모 + DC콤보", short: "차데모+콤보", tesla: "adapter" },
  "06": { label: "DC차데모 + AC3상 + DC콤보", short: "3종 복합", tesla: "adapter" },
  "07": { label: "AC3상", short: "AC3상", tesla: "no" },
  "08": { label: "DC콤보(완속)", short: "콤보완속", tesla: "adapter" },
  "89": { label: "수소", short: "수소", tesla: "no" }
};

// 충전기 상태 코드(stat). 지도 마커 색이 여기서 갈린다.
export const chargerStates: Record<string, { label: string; tone: "free" | "busy" | "down" | "unknown" }> = {
  "1": { label: "통신이상", tone: "down" },
  "2": { label: "충전대기", tone: "free" },
  "3": { label: "충전중", tone: "busy" },
  "4": { label: "운영중지", tone: "down" },
  "5": { label: "점검중", tone: "down" },
  "9": { label: "상태미확인", tone: "unknown" }
};

// ── 내 차로 충전한다는 게 무슨 뜻인가 ──────────────────────────────────
// 국내 테슬라는 독자 규격 충전포트를 쓴다. 그래서 슈퍼차저 밖에서는 항상
// "어댑터를 꽂는다"는 한 단계가 더 붙는다. 이게 국내 테슬라 충전의 핵심이다.
export type ConnectorGuide = {
  id: string;
  title: string;
  need: string; // 무엇이 필요한가
  speed: string;
  where: string; // 어디에 있는가
  note: string;
  source: Source;
  url: string;
};

export const connectorGuides: ConnectorGuide[] = [
  {
    id: "supercharger",
    title: "슈퍼차저 (테슬라 전용)",
    need: "어댑터 없이 케이블을 바로 꽂는다. 앱·카드 등록도 필요 없다.",
    speed: "Model Y Premium RWD 기준 최대 175kW",
    where: "테슬라가 직접 운영. 차량 내비에서 검색하면 가용 스톨 수와 도착 예상 잔량까지 같이 나온다.",
    note: "결제는 Tesla 계정에 등록된 카드로 자동. 충전이 끝나고 자리를 안 비우면 점유료(idle fee)가 붙는다. 국내 슈퍼차저는 환경부 데이터에 안 들어가서 아래 지도에는 대부분 안 뜬다 — 슈퍼차저는 Tesla 앱/차량 내비로 찾는 게 맞다.",
    source: "공식",
    url: "https://www.tesla.com/ko_kr/findus/list/superchargers/South+Korea"
  },
  {
    id: "ccs",
    title: "DC 급속 (DC콤보 / CCS1)",
    need: "★ CCS 콤보1 어댑터가 있어야 한다. 없으면 국내 급속 충전기는 한 대도 못 쓴다.",
    speed: "충전기 출력에 따라 50 ~ 350kW (실제로는 차량·배터리 온도 상한이 먼저 걸린다)",
    where: "국내 급속 충전기의 사실상 표준. 환경부·한전·이피트·채비 등 대부분이 이 규격이다.",
    note: "어댑터 가격은 출시 기사 기준 299,200원(현재가는 공식몰에서 확인). 안전·충전 핵심 부품이라 알리 저가품은 피한다. 장거리를 다닐 계획이면 사실상 필수 장비다.",
    source: "공식",
    url: "https://shop.tesla.com/ko_kr/product/ccs-combo-1-adapter---south-korea"
  },
  {
    id: "ac",
    title: "AC 완속 (5핀 / J1772)",
    need: "J1772 어댑터가 필요하다. 차량 동봉 여부는 인수 시 트렁크에서 직접 확인할 것.",
    speed: "최대 약 16kW. 실제로는 7kW급이 많아 완충까지 밤새 걸린다.",
    where: "아파트 주차장, 마트, 공영주차장에 가장 많이 깔린 종류. 생활 충전의 주력이다.",
    note: "급속보다 배터리에 부담이 적고 요금도 싸서, 집·회사에 완속이 있으면 그게 기본 루틴이 된다. 급속은 장거리용으로만 쓰는 게 일반적인 오너 패턴이다.",
    source: "확인필요",
    url: "https://www.tesla.com/ko_kr/support/charging/product-guides"
  },
  {
    id: "chademo",
    title: "차데모 · AC3상 (못 쓰는 것)",
    need: "국내에서 테슬라용 차데모 어댑터는 판매되지 않는다. AC3상은 승용 전기차 대상이 아니다.",
    speed: "—",
    where: "구형 급속 충전기에 아직 남아 있다.",
    note: "지도에서 이 타입만 있는 충전소는 걸러야 헛걸음을 안 한다. 아래 지도의 '내 차로 되는 것만' 필터가 이걸 처리한다.",
    source: "공식",
    url: "https://www.tesla.com/ko_kr/support/charging/product-guides"
  }
];

// ── 결제·등록 방식 ─────────────────────────────────────────────────────
// "충전기 앞에 섰을 때 결제가 되느냐"가 전부다. 방식이 3가지로 갈린다.
export type PaymentRoute = {
  id: string;
  title: string;
  how: string;
  register: string; // 사전에 등록해야 하는 것
  cost: string;
  verdict: string;
  source: Source;
  url: string;
};

export const paymentRoutes: PaymentRoute[] = [
  {
    id: "env-card",
    title: "환경부 회원카드 (무공해차 통합누리집)",
    how: "카드를 충전기 리더기에 태그하면 등록된 결제카드로 자동 결제된다. 회원 요금이 비회원보다 싸다.",
    register:
      "ev.or.kr > 회원카드 신청. ★ 차량번호 입력이 필수라 번호판이 나온 뒤에만 접수된다. 카드를 받은 다음 결제카드를 따로 등록해야 실제로 결제된다 — 이 두 번째 단계를 빼먹는 사례가 흔하다.",
    cost: "카드 발급 최초 1회 무료 · 배송 1~2주",
    verdict: "가장 넓게 먹히는 범용 수단. 번호판 나오면 바로 신청해 두는 게 맞다.",
    source: "공식",
    url: "https://www.ev.or.kr/"
  },
  {
    id: "operator-app",
    title: "사업자 앱 결제",
    how: "앱에서 충전기 번호를 찍거나 QR을 스캔해 시작·종료한다. 카드 없이 폰만으로 된다.",
    register: "앱 설치 → 회원가입 → 결제수단 등록. 사업자마다 따로 가입해야 한다.",
    cost: "무료 (충전 요금 별도)",
    verdict:
      "회원카드 배송을 기다리는 동안의 대안이자, 생활권에 특정 사업자 충전기가 몰려 있으면 그쪽이 더 싸다. 단점은 사업자 앱은 자기 충전기만 결제된다는 것.",
    source: "공식",
    url: "https://www.ev.or.kr/"
  },
  {
    id: "credit",
    title: "충전기 직접 신용카드 결제",
    how: "충전기 단말에 신용카드를 그대로 꽂거나 태그한다.",
    register: "없음.",
    cost: "비회원 요금이 적용돼 회원 요금보다 비싸다.",
    verdict: "등록을 아무것도 안 했을 때의 최후 수단. 되는 충전기와 안 되는 충전기가 갈린다.",
    source: "커뮤니티",
    url: "https://www.ev.or.kr/"
  }
];

// ── 충전 앱 ────────────────────────────────────────────────────────────
export type ChargingApp = {
  name: string;
  role: string;
  when: string;
  note: string;
  url: string;
  weight: "핵심" | "보조";
  source: Source;
};

export const chargingApps: ChargingApp[] = [
  {
    name: "Tesla (공식 앱)",
    role: "슈퍼차저 검색·충전 현황·충전 제한(SoC) 설정·결제. 슈퍼차저만 쓸 거면 이거 하나로 끝난다.",
    when: "인수 당일",
    note: "차량 내비도 슈퍼차저 경로를 자동으로 계획한다. 비슈퍼차저를 섞을 때만 다른 앱이 필요해진다.",
    url: "https://www.tesla.com/ko_kr/support/tesla-app",
    weight: "핵심",
    source: "공식"
  },
  {
    name: "무공해차 통합누리집 (ev.or.kr)",
    role: "환경부 공식. 회원카드 신청처이자 전국 충전소 데이터의 원본이다.",
    when: "번호판 나온 직후 (회원카드 신청)",
    note: "다른 앱들이 여기 데이터를 받아 쓴다. 아래 지도도 이 기관의 공개 API를 그대로 부른다.",
    url: "https://www.ev.or.kr/",
    weight: "핵심",
    source: "공식"
  },
  {
    name: "EV Infra",
    role: "국내 충전소 앱 중 커버리지가 가장 넓다. 고장·대기 여부를 오너들이 실시간으로 남긴다.",
    when: "장거리 이동 전 경로상 충전소 확인",
    note: "공식 데이터가 '운영중'이라고 해도 실제로는 고장난 경우가 있다. 그 간극을 메우는 게 이 앱의 값어치다.",
    url: "https://www.evinfra.io/",
    weight: "핵심",
    source: "커뮤니티"
  },
  {
    name: "모두의충전 / 해피차저",
    role: "여러 사업자 충전기를 한 앱에서 결제하도록 묶어주는 통합 결제 앱.",
    when: "사업자별 앱을 여러 개 깔기 싫을 때",
    note: "사업자별 지원 범위가 앱마다 다르다. 생활권에 뭐가 깔려 있는지 먼저 보고 고른다.",
    url: "https://www.happycharger.co.kr/",
    weight: "보조",
    source: "커뮤니티"
  },
  {
    name: "A Better Routeplanner (ABRP)",
    role: "장거리에서 어디서 몇 %까지 충전할지 계산한다. 기온·속도·적재까지 넣어 도착 SoC를 예측한다.",
    when: "300km 넘는 장거리를 처음 계획할 때",
    note: "슈퍼차저만 탈 거면 차량 내비로 충분하다. 비슈퍼차저를 섞을 때 진가가 나온다.",
    url: "https://abetterrouteplanner.com/",
    weight: "보조",
    source: "공식"
  }
];

// ── 충전 습관 ──────────────────────────────────────────────────────────
export const chargingHabits = [
  {
    title: "일상 충전 상한 80%",
    text: "Model Y Premium RWD는 LFP가 아닌 Standard Range 팩이다. 매일 100%까지 채우지 않고 80% 안팎으로 두는 게 일반적인 권장이다. 장거리 전날만 100%로 올린다.",
    source: "커뮤니티" as Source
  },
  {
    title: "급속은 장거리용",
    text: "완속이 배터리 부담도 적고 요금도 싸다. 집·회사에 완속이 있으면 그게 기본이고, 급속은 이동 중에만 쓰는 패턴이 자리잡는다.",
    source: "커뮤니티" as Source
  },
  {
    title: "겨울 효율은 여름의 70% 선",
    text: "히터와 배터리 예열 때문에 겨울 주행거리가 눈에 띄게 준다. 첫 겨울이 오기 전에 여름 기준선을 만들어두면 비교가 된다.",
    source: "커뮤니티" as Source
  },
  {
    title: "도착 전 예열",
    text: "내비에 슈퍼차저를 목적지로 넣으면 차가 배터리를 미리 데운다. 그냥 찾아가는 것보다 충전 속도가 확실히 빠르다.",
    source: "공식" as Source
  }
];
