// 운행 준비물.
//
// 기준: "8/18에 차를 받아서 굴리기 시작할 때 없으면 곤란한 것"부터 위로.
// 인수 전 결정용 항목(시공 여부·블랙박스 설치 판단)은 이미 끝났거나 진행 중이라 뺐다.
//
// 근거: docs/ali-accessories.md (2026-07-03 커뮤니티 조사).
// why = 무엇을 해결하는가, risk = 없거나 잘못 사면 생기는 문제.

export type GearPriority = "필수" | "권장" | "나중에";
export type GearChannel = "알리" | "국내" | "공식몰";

export const PRIORITY_SLUG: Record<GearPriority, string> = {
  필수: "must",
  권장: "rec",
  나중에: "later"
};

export type GearItem = {
  id: string;
  name: string;
  category: string;
  why: string;
  risk: string;
  price: string;
  channel: GearChannel;
  timing: string;
  priority: GearPriority;
  url: string;
};

export const gearItems: GearItem[] = [
  // ── 충전·주행: 없으면 운행 자체가 막히는 것 ──
  {
    id: "ccs-adapter",
    name: "CCS 콤보1 어댑터",
    category: "충전·주행",
    why: "국내 급속 충전기(환경부·한전·이피트 등)는 전부 DC콤보다. 테슬라는 독자 규격 포트라 이 어댑터가 없으면 슈퍼차저 밖에서는 급속 충전을 한 대도 못 쓴다.",
    risk: "⚠️ 안전·충전 핵심 부품이라 알리 저가품은 피한다. 가격차도 크지 않다 — 공식몰 또는 검증 제품.",
    price: "30만 원 안팎",
    channel: "공식몰",
    timing: "장거리 계획이 생기기 전",
    priority: "권장",
    url: "https://shop.tesla.com/ko_kr/product/ccs-combo-1-adapter---south-korea"
  },
  {
    id: "j1772-adapter",
    name: "J1772 어댑터 (AC 완속용)",
    category: "충전·주행",
    why: "아파트·마트·공영주차장에 깔린 AC 완속 5핀을 쓰려면 필요하다. 생활 충전의 주력 경로다.",
    risk: "★ 차량 기본 동봉 여부를 인수 시 트렁크에서 직접 확인할 것. 있으면 살 필요가 없다.",
    price: "동봉 시 0원 / 별매 시 10만 원대",
    channel: "공식몰",
    timing: "수령 당일 확인",
    priority: "필수",
    url: "https://www.tesla.com/ko_kr/support/charging/product-guides"
  },
  {
    id: "hipass",
    name: "하이패스 단말",
    category: "충전·주행",
    why: "테슬라는 룸미러 내장 하이패스가 없다. 고속도로를 쓴다면 사실상 필수이고, 전기차는 통행료 감면도 받는다.",
    risk: "단말 구입 후 하이패스 홈페이지에서 차량 등록을 따로 해야 작동한다. RF 방식은 창문에 안 붙여도 인식된다는 후기가 많다.",
    price: "3만~8만 원",
    channel: "공식몰",
    timing: "지금",
    priority: "필수",
    url: "https://shop.tesla.com/ko_kr/product/hi-pass"
  },
  {
    id: "sentry-ssd",
    name: "센트리·블랙박스용 USB 저장장치",
    category: "충전·주행",
    why: "센트리 모드와 대시캠 녹화를 켜려면 USB 저장장치가 필수다. 이게 있으면 별도 블랙박스 없이도 상당 부분 커버된다.",
    risk: "일반 USB 메모리는 상시 쓰기에 금방 죽는다. 고내구 microSD나 소형 SSD를 쓰고 반드시 차량에서 포맷한다.",
    price: "2만~6만 원",
    channel: "국내",
    timing: "수령 전 준비",
    priority: "필수",
    url: "https://www.tesla.com/ko_kr/support/dashcam-sentry-mode"
  },
  {
    id: "mobile-connector",
    name: "모바일 커넥터",
    category: "충전·주행",
    why: "220V 콘센트로 완속 충전하는 비상용 케이블. 여행지 숙소나 단독주택에서 쓸 데가 있다.",
    risk: "차량에 기본 동봉되지 않는 경우가 있으니 수령 당일 트렁크에서 확인. 아파트 공용 콘센트 사용은 규정 위반일 수 있다.",
    price: "30만 원대",
    channel: "공식몰",
    timing: "필요 확인 후",
    priority: "나중에",
    url: "https://shop.tesla.com/ko_kr/category/charging"
  },

  // ── 보호: 안 하면 되돌릴 수 없는 것 ──
  {
    id: "screen-front",
    name: "전면 15.4인치 스크린 강화유리",
    category: "보호",
    why: "차 안 거의 모든 조작을 이 화면 하나로 한다. 지문과 잔기스가 그대로 시야에 남는다. 무광 타입은 여름 낮 반사도 같이 줄여준다.",
    risk: "유리 자체가 긁히면 복구가 안 되고 화면 교체는 고가다. 구형 모델Y용은 크기가 달라 안 맞는다 — 반드시 주니퍼 전용.",
    price: "8천~2만 원",
    channel: "알리",
    timing: "수령 직후",
    priority: "필수",
    url: "https://www.aliexpress.com/wholesale?SearchText=Tesla+Model+Y+Juniper+screen+protector"
  },
  {
    id: "screen-rear",
    name: "뒷좌석 8인치 스크린 보호필름",
    category: "보호",
    why: "주니퍼에서 새로 생긴 2열 화면. 뒷좌석 승객이 공조·미디어를 만지는 곳이라 손톱 자국이 빨리 생긴다.",
    risk: "구형에는 없던 부품이라 호환 정보가 적다. 8인치 주니퍼 전용인지 상품 사진으로 확인해야 한다.",
    price: "5천~1.2만 원",
    channel: "알리",
    timing: "수령 직후",
    priority: "권장",
    url: "https://www.aliexpress.com/wholesale?SearchText=Tesla+Model+Y+Juniper+rear+screen+protector"
  },
  {
    id: "front-camera-guard",
    name: "앞 범퍼 전방 카메라 보호 가드",
    category: "보호",
    why: "주니퍼에 새로 달린 전방 범퍼 카메라가 고속도로 돌빵에 그대로 노출된다. 투명 PC 가드나 PPF 조각으로 렌즈 앞만 덮는다.",
    risk: "⚠️ 유색·불투명 커버를 쓰면 카메라 시야가 가려져 오토파일럿 경고와 기능 제한이 뜰 수 있다. 반드시 투명 제품만.",
    price: "5천~1.5만 원",
    channel: "알리",
    timing: "수령 직후",
    priority: "권장",
    url: "https://www.aliexpress.com/wholesale?SearchText=Tesla+Model+Y+Juniper+front+camera+protector"
  },

  // ── 실내·환경 ──
  {
    id: "tpe-mats",
    name: "TPE 매트 풀세트 (실내·트렁크·프렁크)",
    category: "실내·환경",
    why: "순정 카펫은 흙과 물에 약하다. TPE는 통째로 꺼내 물로 씻을 수 있어서 관리 시간이 완전히 달라진다.",
    risk: "주니퍼 트렁크 바닥이 앞뒤 분할 구조라 분할형 라이너가 아니면 안 맞는다. 저가품은 새 차 안에서 고무 냄새가 오래 간다 — 냄새 후기를 먼저 본다.",
    price: "3만~7만 원",
    channel: "알리",
    timing: "수령 직후",
    priority: "필수",
    url: "https://www.aliexpress.com/wholesale?SearchText=Tesla+Model+Y+Juniper+TPE+floor+mat"
  },
  {
    id: "roof-sunshade",
    name: "루프 선쉐이드 (자석형)",
    category: "실내·환경",
    why: "파노라마 유리루프가 여름 정수리 열기를 그대로 통과시킨다. 8월 수령이라 이번 시즌에 바로 체감된다.",
    risk: "알리 배송이 2~4주라 지금 주문해도 8월 말에 온다. 올여름 안에 쓰려면 국내 구매를 검토할 것.",
    price: "1.5만~4만 원",
    channel: "알리",
    timing: "지금 주문",
    priority: "필수",
    url: "https://www.aliexpress.com/wholesale?SearchText=Tesla+Model+Y+Juniper+roof+sunshade"
  },
  {
    id: "front-sunshade",
    name: "앞유리 선쉐이드",
    category: "실내·환경",
    why: "야외 주차 시 실내 온도와 대시보드 열화를 줄인다. 에어컨 초기 냉방 부하도 같이 줄어든다.",
    risk: "차종 전용 재단이 아니면 접었을 때 부피가 커서 안 쓰게 된다.",
    price: "1만~3만 원",
    channel: "국내",
    timing: "수령 직후",
    priority: "권장",
    url: "https://www.aliexpress.com/wholesale?SearchText=Tesla+Model+Y+Juniper+windshield+sunshade"
  },
  {
    id: "rear-vent-cover",
    name: "뒷좌석 송풍구 커버",
    category: "실내·환경",
    why: "콘솔 뒤 송풍구가 위를 향해 열려 있어서 동전·과자 부스러기가 그대로 빨려 들어간다. 한번 들어가면 빼기 어렵다.",
    risk: "주니퍼는 송풍구 모양이 바뀌어 구형 제품이 물리적으로 안 들어간다.",
    price: "3천~1만 원",
    channel: "알리",
    timing: "수령 직후",
    priority: "권장",
    url: "https://www.aliexpress.com/wholesale?SearchText=Tesla+Model+Y+Juniper+air+vent+cover"
  },
  {
    id: "wipes",
    name: "물티슈 · 마른 수건 상시 비치",
    category: "실내·환경",
    why: "밝은 인조가죽 시트는 커피·청바지 이염이 시간이 지나면 잘 안 빠진다. 즉시 눌러 흡수하는 게 유일하게 확실한 대처다.",
    risk: "없다. 돈이 거의 안 드는 대비인데 효과는 가장 확실하다.",
    price: "1만 원 이하",
    channel: "국내",
    timing: "수령 전",
    priority: "필수",
    url: ""
  },

  // ── 나중에 판단 ──
  {
    id: "usb-hub",
    name: "글로브박스 USB 허브",
    category: "나중에 판단",
    why: "센트리용 저장장치, 하이패스 단말, 기타 기기를 동시에 물리려면 포트가 모자란다.",
    risk: "발열과 안정성이 제품별로 갈린다. 센트리 녹화용이면 안정성이 중요하다. 포트가 실제로 모자란지 겪어보고 산다.",
    price: "1만~3만 원",
    channel: "알리",
    timing: "포트가 모자랄 때",
    priority: "나중에",
    url: "https://www.aliexpress.com/wholesale?SearchText=Tesla+Model+Y+Juniper+glovebox+USB+hub"
  },
  {
    id: "console-organizer",
    name: "센터 콘솔 수납함·트레이",
    category: "나중에 판단",
    why: "콘솔이 깊기만 해서 작은 물건이 바닥에 굴러다닌다.",
    risk: "\"없는 게 더 편했다\"는 반응도 많아 취향차가 크다. 실제로 뭐가 굴러다니는지 보고 사는 게 낫다.",
    price: "5천~2만 원",
    channel: "알리",
    timing: "2~3개월 타보고",
    priority: "나중에",
    url: "https://www.aliexpress.com/wholesale?SearchText=Tesla+Model+Y+Juniper+center+console+organizer"
  },
  {
    id: "magsafe-mount",
    name: "맥세이프 무선충전 거치대",
    category: "나중에 판단",
    why: "기본 무선 충전 패드는 폰을 눕혀야 해서 화면을 못 본다.",
    risk: "기본 패드로 충분한 사람이 많다. 저가품은 발열로 충전이 느려지니 쿨링팬 내장형을 고른다.",
    price: "1.5만~5만 원",
    channel: "알리",
    timing: "2~3개월 타보고",
    priority: "나중에",
    url: "https://www.aliexpress.com/wholesale?SearchText=Tesla+Model+Y+MagSafe+cooling+mount"
  },
  {
    id: "mud-flaps",
    name: "머드플랩 (흙받이)",
    category: "나중에 판단",
    why: "비·눈길에서 바퀴가 튀긴 흙이 사이드 실과 뒷범퍼를 더럽히는 걸 줄인다.",
    risk: "도심 위주면 없어도 된다. ⚠️ 뒷바퀴용 저가품이 주차장 스토퍼 턱에 걸려 깨진 사례가 보고된다.",
    price: "1만~2.5만 원",
    channel: "알리",
    timing: "첫 겨울 전",
    priority: "나중에",
    url: "https://www.aliexpress.com/wholesale?SearchText=Tesla+Model+Y+Juniper+mud+flaps"
  }
];

// 구매 원칙 — 목록보다 이게 더 중요하다.
export const buyingRule = {
  headline: "커뮤니티 다수 의견: 미리 사지 마라",
  body: "2~3개월 순정으로 타보고 실제로 불편했던 것만 사는 게 정석이다. 예외는 두 가지뿐 — ① 안 하면 되돌릴 수 없는 손상이 생기는 것(스크린 보호), ② 계절을 놓치면 1년을 기다리는 것(루프 선쉐이드). 수납·거치대·조명 같은 편의 아이템은 지금 사면 대부분 안 쓴다.",
  source: "커뮤니티"
};
