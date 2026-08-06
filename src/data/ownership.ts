// 인수 후(오너) 데이터 레이어.
//
// 2026-08-14 Model Y Premium RWD(주니퍼) 인수 확정에 맞춰 사이트 축을
// "인수 전 정보 수집" → "인수 전후 실행"으로 옮기면서 새로 만든 파일이다.
// 인수 전 전용 데이터(리드타임 통계·보조금 계산·입항 추적)는 home.ts / shipment.ts에
// 그대로 두고 아카이브 탭에서만 쓴다.
//
// 사실/추정 표기 원칙(CLAUDE.md 응답 규칙 2):
//  - source가 "공식"인 항목은 테슬라·정부 공식 문서에서 확인한 사실
//  - source가 "커뮤니티"인 항목은 오너 후기 기반 정성 판단(= 추정)
//  - 가격·기간은 대부분 범위 추정치다

import {
  BatteryCharging,
  Boxes,
  CalendarCheck,
  CarFront,
  CreditCard,
  Gauge,
  KeyRound,
  PlugZap,
  Repeat2,
  Sparkles,
  Truck,
  Wrench
} from "lucide-react";

// ── 인수 확정 정보 ─────────────────────────────────────────────────────
// 개인용 사이트라 직접 박아둔다. 일정이 바뀌면 이 값만 고치면 전 화면에 반영된다.
//
// 중요: 인수일과 실제 차량 수령일이 다르다.
//   8/14(금) 인수 + 곧바로 틴팅업체로 탁송 → 8/14~8/17 시공 → 8/18(화) 업체에서 직접 수령.
// 그래서 "첫 주 / 첫 달"은 인수일이 아니라 수령일(handoverDate)부터 센다.
export const ownership = {
  deliveryDate: "2026-08-14", // 금 — 서류상 인수 + 업체로 탁송
  handoverDate: "2026-08-18", // 화 — 틴팅업체에서 내가 직접 수령(실제 운행 시작)
  contractDate: "2026-06-04",
  model: "Model Y Premium RWD",
  generation: "주니퍼(2025~)",
  price: "4,999만 원",
  // 수령 후 며칠까지를 "첫 달"로 볼지. 오늘 탭의 단계 판정에 쓴다.
  firstMonthDays: 30
};

// 인수 전 처리 상태. 사용자가 직접 확인해 준 사실만 confirmed로 둔다.
export type FactState = "완료" | "예약" | "확인필요";

export const deliveryFacts: Array<{
  label: string;
  state: FactState;
  detail: string;
}> = [
  {
    label: "보험 가입",
    state: "완료",
    detail: "가입 완료. 인수 당일 보험 개시일이 인도일과 같은지, 증권상 차대번호(VIN)가 실제 차량과 맞는지만 확인한다."
  },
  {
    label: "틴팅·PPF 시공",
    state: "예약",
    detail:
      "틴팅과 PPF가 한 패키지로 같은 날 진행된다. 8/14 인수 즉시 업체로 탁송해 시공하고 8/18에 직접 수령한다. 추가로 결정할 건 없고, 8/18에 시공 품질을 확인하는 일만 남았다."
  },
  {
    label: "시공 사양 목록 확보",
    state: "확인필요",
    detail:
      "8/18에 뭘 검수해야 할지는 시공 범위를 알아야 정해진다. 필름 제품명, 창별 농도, PPF를 붙이는 부위 목록을 미리 받아두면 수령 당일 대조만 하면 된다."
  },
  {
    label: "탁송 전 차량 상태 기록",
    state: "확인필요",
    detail:
      "PPF는 도장 위를 덮는 필름이라 밑에 흠집이 있으면 그대로 봉인된다. 8/14에 직접 검수하지 못한다면 업체에 입고 직후·시공 전 상태 사진을 요청해 두는 것으로 대신한다."
  },
  {
    label: "잔금 결제",
    state: "확인필요",
    detail: "앱에 최종 금액이 뜨면 카드 한도·계좌 이체 한도를 미리 올려둔다. 결제일은 보통 인도 며칠 전이다."
  },
  {
    label: "등록·번호판",
    state: "확인필요",
    detail: "테슬라 대행이면 별도 조치가 없지만, 직접 등록이면 취득세 납부와 번호판 발급 일정을 잡아야 한다."
  },
  {
    label: "충전카드",
    state: "확인필요",
    detail: "발급에 배송 기간이 있으니 인수 전에 신청해 둔다. 앱 결제만 쓸 거면 생략 가능."
  },
  {
    label: "하이패스",
    state: "확인필요",
    detail: "테슬라는 룸미러 내장 단말이 없어 별도 단말이 필요하다. 단말 구입 후 등록까지 며칠 걸린다."
  }
];

// ── 캘린더 시드 일정 ───────────────────────────────────────────────────
// 화면에서 편집·추가·삭제하면 localStorage에 저장되고, 여기 값은 "기본값 복원"에만 쓴다.
// date가 null이면 "날짜 미정" 목록으로 빠져서 사용자가 직접 날짜를 넣게 된다.
export type ScheduleKind = "인수" | "수령" | "예약" | "할일" | "정기";

export type SeedEvent = {
  id: string;
  date: string | null; // YYYY-MM-DD, null = 미정
  time: string | null; // HH:mm, null = 종일
  title: string;
  kind: ScheduleKind;
  note: string;
};

export const scheduleSeed: SeedEvent[] = [
  {
    id: "seed-delivery",
    date: "2026-08-14",
    time: null,
    title: "차량 인수 + 틴팅업체로 탁송",
    kind: "인수",
    note: "서류상 인수일. 차는 곧바로 틴팅업체로 넘어간다. 이날 할 일은 검수가 아니라 결제·서류·앱 연결·키카드 수령이다."
  },
  {
    id: "seed-tinting-window",
    date: "2026-08-15",
    time: null,
    title: "틴팅·PPF 시공 중 (8/14~8/17)",
    kind: "예약",
    note: "차가 업체에 있는 기간. 내가 할 일은 없다. 이 기간에 알리 배송분이 도착하면 수령 직후 바로 장착할 수 있다."
  },
  {
    id: "seed-handover",
    date: "2026-08-18",
    time: null,
    title: "틴팅업체에서 차량 수령",
    kind: "수령",
    note: "실제로 차를 받는 날. 미리 받아둔 시공 사양 목록을 들고 틴팅·PPF 품질과 차량 전체 검수를 한 번에 한다. 업체를 떠나기 전에 끝내야 재작업 요구가 쉽다."
  },
  {
    id: "seed-final-payment",
    date: "2026-08-11",
    time: null,
    title: "잔금 결제 준비 (카드·이체 한도 상향)",
    kind: "할일",
    note: "앱에 최종 금액이 뜨는 시점에 맞춰. 결제 실패로 인도가 밀리는 게 가장 흔한 사고다."
  },
  {
    id: "seed-insurance-check",
    date: "2026-08-12",
    time: null,
    title: "보험 증권 확인 (개시일·VIN)",
    kind: "할일",
    note: "가입은 끝났으니 개시일이 8/14인지, VIN이 배정된 실제 차량과 같은지만 대조한다."
  },
  {
    id: "seed-charge-card",
    date: "2026-08-07",
    time: null,
    title: "충전카드 발급 신청",
    kind: "할일",
    note: "카드 실물 배송에 1~2주 걸리는 곳이 있다. 인수 전에 신청해야 첫 주에 쓴다."
  },
  {
    id: "seed-hipass",
    date: "2026-08-08",
    time: null,
    title: "하이패스 단말 주문·등록",
    kind: "할일",
    note: "테슬라는 내장 단말이 없다. 단말 구입 → 하이패스 홈페이지에서 차량 등록 → 카드 삽입 순서."
  },
  {
    id: "seed-ali-order",
    date: "2026-08-06",
    time: null,
    title: "알리 1차 주문 (선쉐이드·매트·스크린 보호)",
    kind: "할일",
    note: "알리 배송 2~4주. 8월 인수라 루프 선쉐이드는 늦으면 의미가 없다. 나머지는 인수 후 실사용 뒤 주문."
  },
  {
    id: "seed-spec-confirm",
    date: "2026-08-12",
    time: null,
    title: "시공 사양 목록 받아두기 (필름 제품명·농도·PPF 부위)",
    kind: "할일",
    note: "8/18 수령 검수의 기준표가 된다. PPF를 어디까지 붙이는지 모르면 빠진 부위를 알아챌 수 없다. 문자나 카톡으로 남겨 달라고 하면 나중에 분쟁 시에도 근거가 된다."
  },
  {
    id: "seed-photo-request",
    date: "2026-08-13",
    time: null,
    title: "업체에 '시공 전 차량 상태 사진' 요청",
    kind: "할일",
    note: "필름이 올라간 뒤에는 유리 흠집·도장 하자가 누구 책임인지 가리기 어렵다. 입고 직후 사진을 남겨 달라고 미리 말해둔다."
  },
  {
    id: "seed-first-charge",
    date: "2026-08-19",
    time: null,
    title: "첫 충전 (생활권 충전소 답사 겸)",
    kind: "할일",
    note: "수령 다음 날. 급하지 않게 집 근처 충전소를 실제로 한 번 써 보면서 결제 방식까지 확인한다."
  },
  {
    id: "seed-app-setup",
    date: "2026-08-14",
    time: null,
    title: "앱 세팅 (Tesla 앱 차량 등록, 폰키 페어링)",
    kind: "할일",
    note: "차가 업체에 있어도 앱 연결은 인수 시점에 된다. 8/14에 끝내두면 시공 기간에 원격으로 차량 상태를 볼 수 있다."
  },
  {
    id: "seed-tint-cure",
    date: "2026-08-22",
    time: null,
    title: "틴팅 경화 완료 — 창문 사용 재개",
    kind: "정기",
    note: "시공 후 3~5일은 창문을 내리지 않는다. 8/18 수령 기준으로 이 날 이후 정상 사용. 초기 며칠 보이는 뿌연 얼룩은 대체로 수분이라 자연히 사라진다."
  },
  {
    id: "seed-tire-pressure",
    date: "2026-08-25",
    time: null,
    title: "타이어 공기압 확인",
    kind: "할일",
    note: "인도 시점 공기압이 규정보다 높게 들어간 경우가 있다. 운전석 도어 스티커 기준값과 대조."
  },
  {
    id: "seed-teslamate",
    date: "2026-09-18",
    time: null,
    title: "TeslaMate 도입 판단 (수령 +1개월)",
    kind: "할일",
    note: "한 달 동안 공식 앱만 써보고, 충전비·효율 추세를 자동 기록할 필요가 실제로 있는지 판단한 뒤 설치."
  },
  {
    id: "seed-first-month-review",
    date: "2026-09-18",
    time: null,
    title: "첫 달 정리 (액세서리 2차 구매 목록 확정)",
    kind: "할일",
    note: "실제로 불편했던 것만 남긴다. 인수 전에 지른 것 중 안 쓴 것도 같이 기록해두면 다음에 안 산다."
  }
];

// ── 오너 체크리스트 ────────────────────────────────────────────────────
// ChecklistManager가 그대로 받는 형태({ phase, icon, summary, items[{text, status}] }).
// status "완료"는 기본 체크 상태로 들어간다.
export const ownerChecklist = [
  {
    phase: "인수 전",
    icon: CalendarCheck,
    summary: "8/14까지 남은 며칠 동안 돈과 서류만 확실히 정리한다.",
    items: [
      { text: "보험 개시일이 인도일(8/14)과 같은지 증권에서 확인", status: "대기" },
      { text: "보험 증권 차대번호(VIN)와 배정된 차량 VIN 대조", status: "대기" },
      { text: "잔금 결제 수단 확정 및 카드·이체 한도 상향", status: "대기" },
      { text: "취득세·등록비 예상액 확인 (전기차 감면 적용 후)", status: "대기" },
      { text: "번호판 등록을 테슬라 대행으로 할지 직접 할지 확정", status: "대기" },
      { text: "충전카드 발급 신청 (배송 기간 고려)", status: "대기" },
      { text: "하이패스 단말 주문 및 차량 등록", status: "대기" },
      { text: "시공 사양 목록 받기 (필름 제품명·창별 농도·PPF 부위)", status: "대기" },
      { text: "업체에 '시공 전 차량 상태 사진' 요청해 두기", status: "대기" },
      { text: "8/14에 인도센터를 직접 갈 수 있는지 확정", status: "대기" }
    ]
  },
  {
    phase: "인수·탁송 (8/14)",
    icon: Truck,
    summary:
      "차는 이날 바로 업체로 넘어간다. 검수가 아니라 돈·서류·계정을 마무리하는 날이다. 다만 유리와 도장은 필름이 올라가기 전에 봐야 한다.",
    items: [
      { text: "잔금 결제 완료 확인", status: "대기" },
      { text: "인수 서류·결제 영수증 사진 촬영 후 보관", status: "대기" },
      { text: "Tesla 앱에 차량 연결, 폰키 페어링", status: "대기" },
      { text: "키카드 2장 수령 (탁송 기사에게 넘기지 말 것)", status: "대기" },
      { text: "VIN이 보험 증권과 일치하는지 최종 확인", status: "대기" },
      { text: "소프트웨어 버전과 오토파일럿 옵션 표기 확인", status: "대기" },
      { text: "★ 유리 흠집·도장 하자 확인 (필름 시공 전 마지막 기회)", status: "대기" },
      { text: "★ 직접 못 가면 업체 입고 직후 사진을 받아 보관", status: "대기" },
      { text: "탁송 기사 연락처와 도착 예정 시각 확보", status: "대기" },
      { text: "업체 입고 완료를 앱 위치로 교차 확인", status: "대기" }
    ]
  },
  {
    phase: "차량 수령 (8/18)",
    icon: KeyRound,
    summary:
      "실제로 차를 받는 날. 미리 받아둔 시공 사양 목록을 기준표로 놓고 대조한다. 업체 마당을 떠나고 나면 시공 하자든 차량 하자든 재작업 요구가 급격히 어려워진다.",
    items: [
      { text: "틴팅: 기포·먼지 유입 여부를 밝은 곳에서 유리별로 확인", status: "대기" },
      { text: "틴팅: 재단 마감(엣지) 들뜸과 컷팅선 확인", status: "대기" },
      { text: "틴팅: 시공 농도가 계약한 사양과 같은지 확인", status: "대기" },
      { text: "틴팅: 뒷유리 열선 손상 여부 (열선 작동시켜 확인)", status: "대기" },
      { text: "틴팅: 전면 시공 시 야간 시야를 어둡기 전에 물어보기", status: "대기" },
      { text: "PPF: 시공 부위가 사양 목록과 전부 일치하는지 대조", status: "대기" },
      { text: "PPF: 엣지 들뜸·말림 (도어컵·도어엣지처럼 곡면 부위 집중)", status: "대기" },
      { text: "PPF: 필름 아래 기포·먼지·이물질 혼입 확인", status: "대기" },
      { text: "PPF: 재단 라인이 패널 경계에서 자연스러운지", status: "대기" },
      { text: "PPF: 필름 밑에 갇힌 도장 흠집이 없는지 (입고 사진과 대조)", status: "대기" },
      { text: "외관: 도장 스크래치, 단차(도어·후드·트렁크)", status: "대기" },
      { text: "외관: 휠 기스, 타이어 제조주차, 범퍼 정렬", status: "대기" },
      { text: "외관: 시공 중 생긴 흠집이 없는지 입고 사진과 대조", status: "대기" },
      { text: "실내: 시트 오염·주름, 트림 들뜸, 헤드라이너 얼룩", status: "대기" },
      { text: "실내: 시공 과정에서 남은 물자국·공구 자국 확인", status: "대기" },
      { text: "기능: 전동 트렁크, 2열 전동 시트, 도어 4개 개폐", status: "대기" },
      { text: "기능: 창문 4짝 오토 업/다운 (시공 후 오토 학습 리셋 가능)", status: "대기" },
      { text: "기능: 전면 15.4\" / 후면 8\" 디스플레이 터치 반응", status: "대기" },
      { text: "기능: 공조, 와이퍼, 조명, 파노라마 루프 차광", status: "대기" },
      { text: "충전 포트 개폐 및 모바일 커넥터 동봉 여부 확인", status: "대기" },
      { text: "운전자 프로필 생성 (시트·미러·핸들 위치 저장)", status: "대기" },
      { text: "틴팅·PPF 시공 보증서 수령 (보증 기간·범위 확인)", status: "대기" },
      { text: "발견한 문제는 업체를 떠나기 전에 접수", status: "대기" }
    ]
  },
  {
    phase: "첫 주 (수령 후)",
    icon: CarFront,
    summary: "장착을 몰아서 끝내고, 충전을 실제로 한 번 겪어 본다.",
    items: [
      { text: "시공 후 3~5일(≈8/22)까지 창문 내리지 않기", status: "대기" },
      { text: "생활권 충전소에서 첫 충전 실행 (결제 방식까지 확인)", status: "대기" },
      { text: "슈퍼차저 1회 사용해서 과금·속도 체감 확인", status: "대기" },
      { text: "하이패스 단말 장착 및 통행 1회 테스트", status: "대기" },
      { text: "스크린 보호필름·매트·선쉐이드 장착", status: "대기" },
      { text: "충전 앱 설치 및 회원카드 등록", status: "대기" },
      { text: "회생제동·원페달 주행 적응 (급감속 습관 교정)", status: "대기" },
      { text: "오토파일럿 첫 사용은 한산한 고속도로에서", status: "대기" },
      { text: "센트리 모드·블랙박스용 USB 저장장치 포맷·장착", status: "대기" },
      { text: "지오펜스용 집·회사 주소를 내비에 저장", status: "대기" },
      { text: "경화 후 틴팅 얼룩이 남아 있으면 업체에 연락", status: "대기" }
    ]
  },
  {
    phase: "첫 달 (수령 후)",
    icon: Gauge,
    summary: "실사용 데이터가 쌓인 뒤에 판단할 것들. 인수 전 결정을 여기서 뒤집어도 된다.",
    items: [
      { text: "타이어 공기압 실측 및 도어 스티커 기준값과 대조", status: "대기" },
      { text: "충전 비용과 장소를 최소 4주 수동 기록", status: "대기" },
      { text: "실주행 효율(Wh/km) 확인 — 여름 에어컨 기준선 잡기", status: "대기" },
      { text: "블랙박스 별도 설치가 필요한지 센트리 모드로 판단", status: "대기" },
      { text: "PPF 미시공 부위에 돌빵이 실제로 생기는지 관찰 (범위 확대 판단)", status: "대기" },
      { text: "알리 2차 주문: 실제로 불편했던 것만", status: "대기" },
      { text: "TeslaMate 도입 여부 판단 및 서버 준비", status: "대기" },
      { text: "안 쓴 액세서리 기록 (다음에 안 사기 위해)", status: "대기" },
      { text: "1개월 무상 점검 대상 하자 정리해서 서비스 접수", status: "대기" }
    ]
  },
  {
    phase: "정기",
    icon: Repeat2,
    summary: "주기가 돌아올 때만 보는 항목. 날짜/주행거리를 메모란에 적어두면 다음 주기 계산이 쉽다.",
    items: [
      { text: "타이어 위치 교환 — 10,000km마다", status: "대기" },
      { text: "캐빈 에어 필터 교체 — 2년마다", status: "대기" },
      { text: "브레이크액 오염 검사 — 4년마다", status: "대기" },
      { text: "브레이크 캘리퍼 청소·윤활 — 제설염 지역 연 1회", status: "대기" },
      { text: "에어컨 건조제 백 교체 — 6년마다", status: "대기" },
      { text: "타이어 공기압 점검 — 월 1회", status: "대기" },
      { text: "자동차 보험 갱신 — 연 1회", status: "대기" },
      { text: "차량 보증 잔여 확인 — 4년/8만km (배터리·구동 8년/16만km)", status: "대기" }
    ]
  }
];

// ── 정비 주기 (공식) ───────────────────────────────────────────────────
// 출처: Tesla Model Y 오너 매뉴얼 "유지보수 정비 주기"
// https://www.tesla.com/ownersmanual/modely/ko_kr/GUID-E95DAAD9-646E-4249-9930-B109ED7B1D91.html
// (해당 페이지는 자동 조회를 403으로 막아 브라우저에서 직접 확인해야 한다.)
export const maintenanceRows = [
  {
    item: "타이어 위치 교환",
    cycle: "10,000km마다",
    note: "또는 좌우 트레드 깊이 차이가 1.5mm 이상일 때 (먼저 오는 쪽)",
    source: "공식" as const
  },
  {
    item: "캐빈 에어 필터",
    cycle: "2년마다",
    note: "HEPA 필터 장착 차량은 3년. 셀프 교체 난이도가 낮아 DIY 사례가 많다",
    source: "공식" as const
  },
  {
    item: "브레이크액 오염 검사",
    cycle: "4년마다",
    note: "검사 결과에 따라 교체. 회생제동 위주라 패드 자체는 오래 간다",
    source: "공식" as const
  },
  {
    item: "브레이크 캘리퍼 청소·윤활",
    cycle: "연 1회 또는 20,000km",
    note: "겨울 제설염을 쓰는 지역 한정 권장 항목",
    source: "공식" as const
  },
  {
    item: "에어컨 건조제 백",
    cycle: "6년마다",
    note: "Model Y 기준. 서비스센터 작업 항목",
    source: "공식" as const
  },
  {
    item: "와이퍼 블레이드",
    cycle: "필요 시",
    note: "주기 규정 없음. 소음·닦임 불량이 생기면 교체",
    source: "공식" as const
  }
];

// ── 용품 ───────────────────────────────────────────────────────────────
// 근거: docs/ali-accessories.md (2026-07-03 커뮤니티 조사).
// why = 무엇을 막거나 해결하는지, risk = 안 사거나 잘못 사면 생기는 문제.
export type GearChannel = "알리" | "국내" | "공식몰" | "시공";
export type GearPriority = "필수" | "권장" | "선택" | "보류";

// CSS 클래스에 한글을 쓰지 않도록 슬러그로 바꿔서 붙인다.
export const PRIORITY_SLUG: Record<GearPriority, string> = {
  필수: "must",
  권장: "rec",
  선택: "opt",
  보류: "hold"
};

export const FACT_SLUG: Record<FactState, string> = {
  완료: "done",
  예약: "booked",
  확인필요: "todo"
};

export const KIND_SLUG: Record<ScheduleKind, string> = {
  인수: "delivery",
  수령: "handover",
  예약: "booking",
  할일: "todo",
  정기: "routine"
};

export type GearItem = {
  id: string;
  name: string;
  category: string;
  why: string; // 용도 — 이게 왜 필요한가
  risk: string; // 없으면/잘못 사면 생기는 문제
  price: string;
  channel: GearChannel;
  timing: string;
  priority: GearPriority;
  url: string;
};

export const gearItems: GearItem[] = [
  // ── 보호 ──
  {
    id: "screen-front",
    name: "전면 15.4인치 스크린 강화유리",
    category: "화면·표면 보호",
    why: "차 안에서 거의 모든 조작을 이 화면 하나로 하기 때문에, 지문과 잔기스가 그대로 시야에 남는다. 무광 타입은 여름 낮 반사도 같이 줄여준다.",
    risk: "유리 자체가 긁히면 복구가 안 되고 화면 교체는 고가다. 구형 모델Y용은 크기가 달라 안 맞는다 — 반드시 주니퍼 전용.",
    price: "8천~2만 원",
    channel: "알리",
    timing: "인수 직후",
    priority: "필수",
    url: "https://www.aliexpress.com/wholesale?SearchText=Tesla+Model+Y+Juniper+screen+protector"
  },
  {
    id: "screen-rear",
    name: "뒷좌석 8인치 스크린 보호필름",
    category: "화면·표면 보호",
    why: "주니퍼에서 새로 생긴 2열 화면. 뒷좌석 승객이 공조·미디어를 만지는 곳이라 손톱 자국이 빨리 생긴다.",
    risk: "구형에는 없던 부품이라 호환 정보가 적다. 8인치 주니퍼 전용인지 상품 사진으로 확인해야 한다.",
    price: "5천~1.2만 원",
    channel: "알리",
    timing: "인수 직후",
    priority: "권장",
    url: "https://www.aliexpress.com/wholesale?SearchText=Tesla+Model+Y+Juniper+rear+screen+protector"
  },
  {
    id: "front-camera-guard",
    name: "앞 범퍼 전방 카메라 보호 렌즈 가드",
    category: "화면·표면 보호",
    why: "주니퍼에 새로 달린 전방 범퍼 카메라가 고속도로 돌빵에 그대로 노출된다. 투명 PC 가드나 PPF 조각으로 렌즈 앞만 덮는다.",
    risk: "⚠️ 유색·불투명 커버를 쓰면 카메라 시야가 가려져 오토파일럿 경고와 기능 제한이 뜰 수 있다. 반드시 투명 제품만.",
    price: "5천~1.5만 원",
    channel: "알리",
    timing: "인수 직후",
    priority: "권장",
    url: "https://www.aliexpress.com/wholesale?SearchText=Tesla+Model+Y+Juniper+front+camera+protector"
  },
  {
    id: "trunk-sill",
    name: "트렁크 문턱 보호 가드",
    category: "화면·표면 보호",
    why: "짐을 밀어 넣을 때 트렁크 입구 도장이 가장 먼저 까진다. TPE 가드를 얹어두면 흠집이 가드에 남는다.",
    risk: "접착식은 나중에 뗄 때 자국이 남을 수 있다. 얹는 방식인지 붙이는 방식인지 확인.",
    price: "8천~2만 원",
    channel: "알리",
    timing: "인수 후",
    priority: "선택",
    url: "https://www.aliexpress.com/wholesale?SearchText=Tesla+Model+Y+Juniper+trunk+sill+protector"
  },
  {
    id: "cabin-camera-cover",
    name: "실내 캐빈 카메라 커버",
    category: "화면·표면 보호",
    why: "룸미러 위 실내 카메라를 물리적으로 가리는 슬라이드 커버. 사생활이 신경 쓰일 때만.",
    risk: "가리면 일부 운전자 모니터링 기능이 제한될 수 있다. 개폐형을 골라야 필요할 때 열 수 있다.",
    price: "2천~6천 원",
    channel: "알리",
    timing: "인수 후",
    priority: "선택",
    url: "https://www.aliexpress.com/wholesale?SearchText=Tesla+Model+Y+cabin+camera+cover"
  },

  // ── 실내 ──
  {
    id: "tpe-mats",
    name: "TPE 매트 풀세트 (실내·트렁크·프렁크)",
    category: "실내·수납",
    why: "순정 카펫은 흙과 물에 약하다. TPE는 통째로 꺼내서 물로 씻을 수 있어서 관리 시간이 완전히 달라진다.",
    risk: "주니퍼 트렁크 바닥이 앞뒤 분할 구조라 분할형 라이너가 아니면 안 맞는다. 저가품은 새 차 안에서 고무 냄새가 오래 간다 — 냄새 후기를 먼저 본다.",
    price: "3만~7만 원",
    channel: "알리",
    timing: "인수 전~직후",
    priority: "필수",
    url: "https://www.aliexpress.com/wholesale?SearchText=Tesla+Model+Y+Juniper+TPE+floor+mat"
  },
  {
    id: "rear-vent-cover",
    name: "뒷좌석 송풍구 커버",
    category: "실내·수납",
    why: "콘솔 뒤 송풍구가 위를 향해 열려 있어서 동전·과자 부스러기가 그대로 빨려 들어간다. 한번 들어가면 빼기 어렵다.",
    risk: "주니퍼는 송풍구 모양이 바뀌어 구형 제품이 물리적으로 안 들어간다.",
    price: "3천~1만 원",
    channel: "알리",
    timing: "인수 직후",
    priority: "권장",
    url: "https://www.aliexpress.com/wholesale?SearchText=Tesla+Model+Y+Juniper+air+vent+cover"
  },
  {
    id: "console-organizer",
    name: "센터 콘솔 수납함·트레이",
    category: "실내·수납",
    why: "콘솔이 깊기만 해서 작은 물건이 바닥에 굴러다닌다. 층을 나누는 트레이로 정리한다.",
    risk: "\"없는 게 더 편했다\"는 반응도 많아 취향차가 크다. 실제로 뭐가 굴러다니는지 보고 사는 게 낫다.",
    price: "5천~2만 원",
    channel: "알리",
    timing: "인수 후 (실사용 뒤)",
    priority: "보류",
    url: "https://www.aliexpress.com/wholesale?SearchText=Tesla+Model+Y+Juniper+center+console+organizer"
  },
  {
    id: "seat-gap-filler",
    name: "시트 갭 필러",
    category: "실내·수납",
    why: "시트와 콘솔 사이 틈으로 카드·동전·폰이 떨어진다. 주행 중에 떨어지면 꺼낼 방법이 없다.",
    risk: "주니퍼 시트 레일 형상 전용인지 확인. 값이 싸서 실패 부담은 작다.",
    price: "3천~1.2만 원",
    channel: "알리",
    timing: "인수 후",
    priority: "선택",
    url: "https://www.aliexpress.com/wholesale?SearchText=Tesla+Model+Y+seat+gap+filler"
  },

  // ── 여름·환경 ──
  {
    id: "roof-sunshade",
    name: "루프 선쉐이드 (자석형)",
    category: "여름·주차 환경",
    why: "파노라마 유리루프가 여름 정수리 열기를 그대로 통과시킨다. 8월 인수라 이번 시즌에 바로 체감되는 항목이다.",
    risk: "알리 배송이 2~4주라 지금 주문해도 8월 말에 온다. 늦으면 올여름은 그냥 보내게 된다 — 국내 구매도 검토할 것.",
    price: "1.5만~4만 원",
    channel: "알리",
    timing: "지금 주문",
    priority: "필수",
    url: "https://www.aliexpress.com/wholesale?SearchText=Tesla+Model+Y+Juniper+roof+sunshade"
  },
  {
    id: "front-sunshade",
    name: "앞유리 선쉐이드",
    category: "여름·주차 환경",
    why: "야외 주차 시 실내 온도와 대시보드 열화를 줄인다. 에어컨 초기 냉방 부하도 같이 줄어든다.",
    risk: "차종 전용 재단이 아니면 접었을 때 부피가 커서 안 쓰게 된다.",
    price: "1만~3만 원",
    channel: "국내",
    timing: "인수 직후",
    priority: "권장",
    url: "https://www.aliexpress.com/wholesale?SearchText=Tesla+Model+Y+Juniper+windshield+sunshade"
  },
  {
    id: "mud-flaps",
    name: "머드플랩 (흙받이)",
    category: "여름·주차 환경",
    why: "비·눈길에서 바퀴가 튀긴 흙이 사이드 실과 뒷범퍼를 더럽히는 걸 줄인다.",
    risk: "도심 위주면 없어도 된다. ⚠️ 뒷바퀴용 저가품이 주차장 스토퍼 턱에 걸려 깨진 사례가 보고된다.",
    price: "1만~2.5만 원",
    channel: "알리",
    timing: "필요 시",
    priority: "보류",
    url: "https://www.aliexpress.com/wholesale?SearchText=Tesla+Model+Y+Juniper+mud+flaps"
  },

  // ── 전기·확장 ──
  {
    id: "usb-hub",
    name: "글로브박스 USB 허브·도킹",
    category: "전기·확장",
    why: "센트리 모드용 저장장치, 하이패스 단말, 게임패드를 동시에 물리려면 포트가 모자란다. 글로브박스 안에서 확장한다.",
    risk: "급속충전 지원 여부와 발열이 제품별로 갈린다. 센트리 녹화용이면 안정성이 중요하다.",
    price: "1만~3만 원",
    channel: "알리",
    timing: "인수 후",
    priority: "권장",
    url: "https://www.aliexpress.com/wholesale?SearchText=Tesla+Model+Y+Juniper+glovebox+USB+hub"
  },
  {
    id: "sentry-ssd",
    name: "센트리·블랙박스용 USB 저장장치",
    category: "전기·확장",
    why: "센트리 모드와 대시캠 녹화를 켜려면 USB 저장장치가 필수다. 이게 있으면 별도 블랙박스 없이도 상당 부분 커버된다.",
    risk: "일반 USB 메모리는 상시 쓰기에 금방 죽는다. 고내구 microSD나 소형 SSD를 쓰고 차량에서 포맷한다.",
    price: "2만~6만 원",
    channel: "국내",
    timing: "인수 전 준비",
    priority: "필수",
    url: "https://www.tesla.com/ko_kr/support/dashcam-sentry-mode"
  },
  {
    id: "puddle-light",
    name: "도어 프로젝션(웰컴) 라이트",
    category: "전기·확장",
    why: "문 열 때 바닥에 로고를 쏘는 조명. 실용성보다 만족도 항목인데 커뮤니티에서 \"가성비 1위\" 언급이 반복된다.",
    risk: "기능적 필요는 없다. DIY 5분이라 실패해도 손해는 작다.",
    price: "5천~1.5만 원",
    channel: "알리",
    timing: "인수 후",
    priority: "선택",
    url: "https://www.aliexpress.com/wholesale?SearchText=Tesla+Model+Y+puddle+light+projector"
  },
  {
    id: "magsafe-mount",
    name: "맥세이프 무선충전 거치대 (쿨링팬형)",
    category: "전기·확장",
    why: "기본 무선 충전 패드는 폰을 눕혀야 해서 화면을 못 본다. 세워서 보면서 충전하려면 거치대가 필요하다.",
    risk: "기본 패드로 충분한 사람이 많다. 저가품은 발열로 충전이 느려지니 쿨링팬 내장형을 고른다.",
    price: "1.5만~5만 원",
    channel: "알리",
    timing: "보류",
    priority: "보류",
    url: "https://www.aliexpress.com/wholesale?SearchText=Tesla+Model+Y+MagSafe+cooling+mount"
  },

  // ── 충전·주행 ──
  {
    id: "hipass",
    name: "하이패스 단말",
    category: "충전·주행",
    why: "테슬라는 룸미러 내장 하이패스가 없다. 고속도로를 쓴다면 사실상 필수이고, 전기차는 통행료 감면도 받는다.",
    risk: "단말 구입 후 하이패스 홈페이지에서 차량 등록을 따로 해야 작동한다. RF 방식은 창문에 안 붙여도 인식된다는 후기가 많다.",
    price: "3만~8만 원",
    channel: "공식몰",
    timing: "인수 전",
    priority: "필수",
    url: "https://shop.tesla.com/ko_kr/product/hi-pass"
  },
  {
    id: "ccs-adapter",
    name: "CCS Combo 1 어댑터",
    category: "충전·주행",
    why: "슈퍼차저가 아닌 국내 급속 충전기(환경부·한전 등)를 쓰려면 필요하다. 지방·장거리 이동이 많으면 실질적으로 필수.",
    risk: "⚠️ 안전·충전 핵심 부품이라 알리 저가품은 피한다. 가격차도 크지 않다 — 공식몰 또는 검증 제품.",
    price: "20만~30만 원대",
    channel: "공식몰",
    timing: "장거리 계획 생기면",
    priority: "권장",
    url: "https://shop.tesla.com/ko_kr/product/ccs-combo-1-adapter---south-korea"
  },
  {
    id: "mobile-connector",
    name: "모바일 커넥터",
    category: "충전·주행",
    why: "220V 콘센트로 완속 충전하는 비상용 케이블. 여행지 숙소나 단독주택에서 쓸 데가 있다.",
    risk: "차량에 기본 동봉되지 않는 경우가 있으니 인수 당일 트렁크에서 확인. 아파트 공용 콘센트 사용은 규정 위반일 수 있다.",
    price: "30만 원대",
    channel: "공식몰",
    timing: "필요 확인 후",
    priority: "선택",
    url: "https://shop.tesla.com/ko_kr/category/charging"
  },

  // ── 시공 ──
  {
    id: "tinting",
    name: "썬팅 (패키지 · 8/14~8/18 시공)",
    category: "시공",
    why: "여름 열 차단과 사생활. 인수 즉시 업체로 탁송해 시공하므로 첫 주행부터 시공된 상태로 탄다.",
    risk: "수령 후 3~5일(≈8/22)은 창문을 내리면 안 된다. 초기에 보이는 뿌연 얼룩은 대체로 수분이라 경화되며 사라지지만, 기포와 재단 들뜸은 수령 당일 업체에서 잡아야 한다.",
    price: "패키지 포함",
    channel: "시공",
    timing: "8/14 입고 · 8/18 수령",
    priority: "필수",
    url: ""
  },
  {
    id: "ppf-life",
    name: "PPF (패키지 포함 · 틴팅과 동시 시공)",
    category: "시공",
    why: "도장 위에 덮는 투명 보호 필름. 도어컵·도어엣지·충전구 주변처럼 손이 반복해서 닿는 곳과 돌빵이 잦은 앞부분의 흠집을 필름이 대신 받아낸다.",
    risk: "결정은 끝났고 검수만 남았다. 시공 부위 목록을 미리 받아 8/18에 대조할 것. 필름은 도장 위를 덮으므로, 밑에 원래 있던 흠집이 그대로 봉인됐는지 입고 사진과 비교해야 한다.",
    price: "패키지 포함",
    channel: "시공",
    timing: "8/14 입고 · 8/18 수령",
    priority: "필수",
    url: ""
  },
  {
    id: "dashcam",
    name: "블랙박스 별도 설치",
    category: "시공",
    why: "센트리 모드가 주차 감시를 상당 부분 대신한다. 별도 블랙박스는 상시 녹화 화질과 보험 특약이 필요할 때만.",
    risk: "먼저 한 달 센트리 모드를 써보고 부족한 게 뭔지 확인한 뒤 결정한다. 배선 작업이 들어가면 되돌리기 번거롭다.",
    price: "30만~80만 원",
    channel: "시공",
    timing: "첫 달 이후 판단",
    priority: "보류",
    url: ""
  }
];

// ── 앱·프로그램 ────────────────────────────────────────────────────────
// verified = 공식 스토어/공식 문서로 존재와 용도를 확인한 것.
// community = 오너 커뮤니티 추천 기반(존재는 확인, 실사용 만족도는 개인차).
export type AppEvidence = "공식" | "커뮤니티";

export type AppItem = {
  name: string;
  platform: string;
  cost: string;
  purpose: string; // 이 앱으로 뭘 하는가
  when: string; // 언제 필요한가
  note: string;
  url: string;
  priority: GearPriority;
  evidence: AppEvidence;
};

export const appGroups: Array<{
  id: string;
  title: string;
  intro: string;
  items: AppItem[];
}> = [
  {
    id: "core",
    title: "필수 — 인수 당일까지",
    intro: "이 두 개만 있으면 차는 굴러간다. 나머지는 필요해질 때 깔면 된다.",
    items: [
      {
        name: "Tesla (공식 앱)",
        platform: "iOS · Android",
        cost: "무료",
        purpose: "차 키(폰키), 도어 잠금·해제, 원격 공조, 충전 제어·현황, 차량 위치, 소프트웨어 업데이트, 서비스 예약까지 전부 여기서 한다.",
        when: "인수 당일 현장에서 차량 연결과 폰키 페어링을 끝낸다",
        note: "폰키는 블루투스 기반이라 폰 배터리가 나가면 못 연다. 키카드를 지갑에 항상 넣어둘 것.",
        url: "https://www.tesla.com/ko_kr/support/tesla-app",
        priority: "필수",
        evidence: "공식"
      },
      {
        name: "하이패스 (한국도로공사)",
        platform: "웹 · 앱",
        cost: "무료",
        purpose: "구입한 하이패스 단말에 차량을 등록하고 통행 내역·미납을 조회한다. 등록을 안 하면 단말이 있어도 작동하지 않는다.",
        when: "단말 수령 직후",
        note: "전기차는 고속도로 통행료 감면 대상이다. 감면 등록도 같이 확인한다.",
        url: "https://www.hipass.co.kr/",
        priority: "필수",
        evidence: "공식"
      }
    ]
  },
  {
    id: "charging",
    title: "충전 — 첫 주에",
    intro: "슈퍼차저만 쓸 거면 공식 앱으로 충분하다. 환경부·민간 충전기를 쓰기 시작하면 아래가 필요해진다.",
    items: [
      {
        name: "무공해차 통합누리집 (ev.or.kr)",
        platform: "웹",
        cost: "무료",
        purpose: "환경부 공식. 전국 충전소 위치·실시간 상태를 회원가입 없이 본다. 보조금 잔여 물량도 여기가 원본이다.",
        when: "충전소 정보의 기준점이 필요할 때",
        note: "앱보다 웹이 정확하다. 다른 앱들이 여기 데이터를 받아 쓴다.",
        url: "https://www.ev.or.kr/",
        priority: "권장",
        evidence: "공식"
      },
      {
        name: "EV Infra",
        platform: "iOS · Android",
        cost: "무료",
        purpose: "국내 충전소 정보 앱 중 커버리지가 가장 넓다. 충전기 고장·대기 여부를 오너들이 실시간으로 남긴다.",
        when: "장거리 이동 전 경로상 충전소 확인",
        note: "\"장거리엔 EV Infra\"가 커뮤니티의 일반적 정리다. 실제 작동 여부 후기가 핵심 가치.",
        url: "https://www.evinfra.io/",
        priority: "권장",
        evidence: "커뮤니티"
      },
      {
        name: "채비 (CHAEVI)",
        platform: "iOS · Android",
        cost: "무료 (충전 요금 별도)",
        purpose: "국내 주요 충전 사업자 앱. 자사 충전기 검색과 앱 결제를 지원한다.",
        when: "생활권에 채비 충전기가 있으면",
        note: "사업자 앱은 자기 충전기만 결제된다. 생활권에 뭐가 깔려 있는지 먼저 보고 고른다.",
        url: "https://apps.apple.com/kr/app/id1530664291",
        priority: "선택",
        evidence: "공식"
      },
      {
        name: "모두의충전 / 해피차저",
        platform: "iOS · Android",
        cost: "무료 (충전 요금 별도)",
        purpose: "여러 사업자 충전기를 한 앱에서 결제할 수 있게 묶어주는 통합 결제 앱.",
        when: "카드를 여러 장 들고 다니기 싫을 때",
        note: "커뮤니티 정리는 \"간편 결제엔 해피차저·모두의충전\". 사업자별 지원 범위는 앱 안에서 확인.",
        url: "https://www.happycharger.co.kr/",
        priority: "선택",
        evidence: "커뮤니티"
      },
      {
        name: "A Better Routeplanner (ABRP)",
        platform: "iOS · Android · 웹",
        cost: "기본 무료 (프리미엄 유료)",
        purpose: "장거리 주행 시 어디서 몇 %까지 충전할지 계산해 준다. 기온·속도·화물까지 넣어 도착 SoC를 예측한다.",
        when: "300km 넘는 장거리를 처음 계획할 때",
        note: "차량 내장 내비도 슈퍼차저 경로는 자동 계획한다. ABRP는 비(非)슈퍼차저를 섞을 때 진가가 나온다.",
        url: "https://abetterrouteplanner.com/",
        priority: "선택",
        evidence: "공식"
      }
    ]
  },
  {
    id: "data",
    title: "데이터·기록 — 첫 달 이후",
    intro: "인수 직후엔 필요 없다. 한 달쯤 타고 나서 \"지난달 충전비가 얼마였지?\"가 궁금해지면 그때 고른다.",
    items: [
      {
        name: "TeslaMate",
        platform: "셀프호스팅 (Docker)",
        cost: "무료 (서버 비용 별도)",
        purpose: "주행·충전·효율·배터리 추세를 내 서버 PostgreSQL에 영구 저장하고 Grafana로 본다. 데이터가 내 손에 남는 게 핵심.",
        when: "인수 +1개월, 아래 설치 가이드 참고",
        note: "개인 사용자는 아직 무료 Owner API로 동작한다(공식 문서 확인). 항상 켜둘 서버와 운영 부담이 조건.",
        url: "https://docs.teslamate.org/",
        priority: "권장",
        evidence: "공식"
      },
      {
        name: "Tessie",
        platform: "iOS · Android · 웹",
        cost: "유료 구독",
        purpose: "TeslaMate와 비슷한 기록·분석을 서버 운영 없이 제공한다. 배터리 열화 추정, 충전 세션 비용, 자동화까지.",
        when: "서버 운영이 부담스러우면 TeslaMate 대신",
        note: "편한 대신 데이터가 상용 서버에 남고 구독료가 든다. 셀프호스팅을 이미 정했다면 굳이 병행하지 않는다.",
        url: "https://tessie.com/",
        priority: "선택",
        evidence: "공식"
      },
      {
        name: "MyTeslaBot",
        platform: "웹 (설치 불필요)",
        cost: "무료",
        purpose: "주행·충전·효율 요약을 카카오톡으로 보내준다. 설치 없이 웹에서 연결만 하면 된다.",
        when: "가볍게 알림만 받고 싶을 때",
        note: "국내 오너 커뮤니티(클리앙)에서 추천된 개인 개발 서비스. 테슬라 계정 연동이 필요하다는 점을 감안할 것.",
        url: "https://myteslabot.netlify.app/",
        priority: "선택",
        evidence: "커뮤니티"
      },
      {
        name: "Tesla Cam Converter",
        platform: "웹 (설치 불필요)",
        cost: "무료",
        purpose: "센트리·대시캠 녹화 영상에 타임스탬프를 찍어준다. 사고나 블랙박스 신고 영상 제출 시 필요.",
        when: "영상을 제출할 일이 생기면",
        note: "테슬라 원본 영상에는 화면상 시각 표기가 없어 신고용으로 그대로 쓰기 곤란한 경우가 있다.",
        url: "https://teslacamconverter.netlify.app/",
        priority: "선택",
        evidence: "커뮤니티"
      }
    ]
  },
  {
    id: "extra",
    title: "편의·커뮤니티",
    intro: "없어도 되지만 있으면 편한 것들. 안드로이드 사용자에게 특히 쓸모가 갈린다.",
    items: [
      {
        name: "WebAA",
        platform: "Android 폰 필요",
        cost: "무료",
        purpose: "차량 내장 브라우저로 안드로이드 오토를 띄워서 티맵·카카오내비를 테슬라 화면에 표시한다.",
        when: "국내 내비를 큰 화면에서 쓰고 싶을 때",
        note: "비공식 방식이고 소프트웨어 업데이트로 막힐 수 있다. 아이폰은 사용 불가. 주행 중 조작은 위험하다.",
        url: "https://webaa.dev/",
        priority: "선택",
        evidence: "커뮤니티"
      },
      {
        name: "슬라고",
        platform: "Android (Google Play)",
        cost: "무료",
        purpose: "국내 테슬라 오너들이 충전 정보와 팁을 공유하는 커뮤니티 앱.",
        when: "국내 특화 정보가 필요할 때",
        note: "네이버 카페 TKC와 내용이 겹친다. 둘 다 볼 필요는 없다.",
        url: "https://play.google.com/store/apps/details?id=space.teslaworld.www",
        priority: "선택",
        evidence: "커뮤니티"
      },
      {
        name: "테슬라 [TKC] 네이버 카페",
        platform: "웹 · 네이버 카페 앱",
        cost: "무료",
        purpose: "국내 최대 테슬라 커뮤니티. 시공 업체 후기, 서비스센터 경험, 소프트웨어 업데이트 이슈가 가장 빨리 올라온다.",
        when: "문제가 생겼을 때 검색용",
        note: "이 사이트의 아카이브 탭에 카페 글 검색 기능이 그대로 남아 있다.",
        url: "https://cafe.naver.com/noljatravel",
        priority: "권장",
        evidence: "공식"
      }
    ]
  }
];

// ── TeslaMate 설치 단계 ────────────────────────────────────────────────
// 출처: TeslaMate 공식 문서 https://docs.teslamate.org/
// 2026-08-05 확인: 개인 사용자는 여전히 비공식 Owner API를 쓸 수 있고,
// Fleet API 전환은 Owner API가 완전히 닫힐 때까지 강제되지 않는다.
// https://docs.teslamate.org/docs/configuration/api/
export const teslamateSteps = [
  {
    step: "서버 준비",
    detail: "항상 켜둘 머신이 필요하다. RAM 2GB 이상 권장. 집 NAS, 미니 PC, 라즈베리파이 4 이상, 또는 개인 VPS 중 하나.",
    caution: "노트북이나 데스크톱을 켜뒀다 껐다 하면 데이터에 구멍이 난다. 24시간 켜둘 수 있는 장비여야 의미가 있다."
  },
  {
    step: "Docker 설치",
    detail: "Docker와 Docker Compose를 설치한다. TeslaMate는 teslamate / postgres / grafana / mosquitto 네 컨테이너를 같이 띄우는 구성이다.",
    caution: "mosquitto(MQTT)는 홈오토메이션 연동용이라 처음엔 빼도 된다."
  },
  {
    step: "docker-compose.yml 작성",
    detail: "공식 문서의 예제 compose 파일을 그대로 쓰고 DB 비밀번호와 암호화 키만 바꾼다.",
    caution: "ENCRYPTION_KEY를 잃어버리면 저장된 토큰을 복호화할 수 없다. 따로 백업해 둘 것."
  },
  {
    step: "테슬라 계정 인증",
    detail: "개인 사용자는 아직 Owner API 방식이 가능하다. TeslaMate 웹 화면에서 Refresh Token을 넣으면 연결된다.",
    caution: "Fleet API 전환은 개인에게 아직 강제되지 않는다(공식 문서). 다만 정책이 바뀔 수 있으니 설치 시점에 문서를 다시 확인한다."
  },
  {
    step: "외부 노출 차단",
    detail: "Tailscale, VPN, 또는 Cloudflare Tunnel로만 접근하게 한다. 공인 IP에 포트를 그냥 열지 않는다.",
    caution: "TeslaMate는 차량 제어가 가능한 토큰을 들고 있다. 노출되면 차 문이 열릴 수 있다는 뜻이다."
  },
  {
    step: "지오펜스·전기요금 설정",
    detail: "집·회사 좌표를 지오펜스로 등록하고 kWh당 요금을 넣는다. 이걸 넣어야 충전비가 자동 계산된다.",
    caution: "집밥/외부 충전 비중 통계가 여기서 나온다. 초기에 안 넣으면 나중에 소급이 번거롭다."
  },
  {
    step: "차량 수면 확인",
    detail: "설치 후 며칠간 차량이 정상적으로 잠드는지 확인한다. TeslaMate 설정에 suspend 관련 옵션이 있다.",
    caution: "다른 서드파티 앱(Tessie 등)과 병행하면 차가 계속 깨어 있어 대기 전력 소모가 늘어난다."
  },
  {
    step: "정기 백업",
    detail: "PostgreSQL을 pg_dump로 주기 백업한다. 이게 없으면 서버가 죽는 순간 기록이 전부 사라진다.",
    caution: "TeslaMate를 쓰는 이유가 장기 기록이므로 백업이 없으면 도입 의미가 없다."
  }
];

export const teslamateLinks = [
  { label: "TeslaMate 공식 문서", url: "https://docs.teslamate.org/" },
  { label: "Docker 설치 가이드", url: "https://docs.teslamate.org/docs/installation/docker/" },
  { label: "API 설정 (Owner vs Fleet)", url: "https://docs.teslamate.org/docs/configuration/api/" },
  { label: "GitHub 저장소", url: "https://github.com/teslamate-org/teslamate" },
  { label: "FAQ", url: "https://docs.teslamate.org/docs/faq/" }
];

// ── 인수 후 지출 ───────────────────────────────────────────────────────
export const ownerCostBuckets = [
  {
    icon: Sparkles,
    title: "시공 (예약 완료분)",
    amount: "55만~150만 원",
    detail: "썬팅이 예약된 상태. 같은 업체에서 생활보호 PPF를 추가하면 패키지가가 개별가보다 싸다."
  },
  {
    icon: Boxes,
    title: "액세서리 1차",
    amount: "10만~20만 원",
    detail: "선쉐이드, 매트, 스크린 보호, 송풍구 커버. 알리 배송 기간을 감안해 지금 주문할 것만."
  },
  {
    icon: PlugZap,
    title: "충전·주행 장비",
    amount: "5만~60만 원",
    detail: "하이패스 단말과 센트리용 저장장치는 필수. CCS 어댑터는 장거리 계획이 생기면."
  },
  {
    icon: CreditCard,
    title: "등록·세금",
    amount: "취득세 감면 후 잔액",
    detail: "2026년 전기차 취득세 감면 한도 140만 원. 보조금이 반영된 금액으로 등록세가 부과된다."
  },
  {
    icon: BatteryCharging,
    title: "월 충전비",
    amount: "월 3만~8만 원 (추정)",
    detail: "월 1,000km, 효율 6km/kWh, kWh당 300원 가정. 슈퍼차저 비중이 높으면 올라간다."
  },
  {
    icon: Wrench,
    title: "연간 유지비",
    amount: "보험료 + 정비",
    detail: "정기 정비 항목이 적어서 첫 2년은 타이어 외 지출이 거의 없다. 4년/8만km 보증 안에서 처리."
  }
];
