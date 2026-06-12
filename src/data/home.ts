import {
  BatteryCharging,
  Boxes,
  BrainCircuit,
  CalendarCheck,
  CarFront,
  ChartNoAxesCombined,
  CircleDollarSign,
  ClipboardCheck,
  CreditCard,
  Cpu,
  Factory,
  Hammer,
  FileText,
  Gauge,
  KeyRound,
  MapPinned,
  NotebookTabs,
  PlugZap,
  Radar,
  ReceiptText,
  RefreshCw,
  Route,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Tags,
  Wifi,
  Wrench
} from "lucide-react";

export const navItems = [
  { label: "오늘", href: "#today" },
  { label: "정보 보드", href: "#intel" },
  { label: "구매 계획", href: "#buying" },
  { label: "인수 준비", href: "#delivery" },
  { label: "내 메모", href: "#my-notes" },
  { label: "카페 후보", href: "#cafes" },
  { label: "결정 노트", href: "#decisions" },
  { label: "오너 로그", href: "#owner-log" }
];

export const deliveryTarget = {
  date: "2026-08-01",
  label: "2026년 8월 인수 목표",
  note: "예상 인도월 기준. 확정 일정이 나오면 날짜를 갱신한다."
};

export const statusMetrics = [
  {
    label: "인수 준비율",
    value: "29%",
    detail: "필수 항목 42개 중 12개 정리",
    tone: "red"
  },
  {
    label: "확인할 글",
    value: "96건",
    detail: "모델 Y 전용 + 테슬라 공용 최초 수집",
    tone: "blue"
  },
  {
    label: "구매 후보",
    value: "14",
    detail: "확정 3개, 보류 8개",
    tone: "green"
  }
];

export const signalCards = [
  {
    icon: Radar,
    title: "오늘의 신호",
    value: "보조금·보험·충전카드",
    detail: "인수 전 비용에 바로 영향이 있는 항목부터 본다."
  },
  {
    icon: ClipboardCheck,
    title: "이번 주 할 일",
    value: "블랙박스·썬팅 견적 비교",
    detail: "가격보다 시공 위치, AS, 보증 범위를 같이 기록한다."
  },
  {
    icon: ChartNoAxesCombined,
    title: "나중에 연결",
    value: "TeslaMate",
    detail: "차량 인수 후 실제 주행 데이터가 생기면 별도 서버로 붙인다."
  }
];

export const intelItems = [
  {
    category: "썬팅",
    title: "전면 농도와 야간 시야 후기",
    source: "네이버 카페 공개글",
    confidence: "후기 많음",
    priority: "높음",
    summary: "인수 직후 시공하는 항목이라 가격보다 시야와 AS 조건을 먼저 비교한다."
  },
  {
    category: "충전",
    title: "집밥 없을 때 충전 루틴",
    source: "커뮤니티 저장 예정",
    confidence: "검토 필요",
    priority: "중간",
    summary: "생활권 충전소, 요금제, 피크 시간대를 함께 정리해야 한다."
  },
  {
    category: "보험",
    title: "신차 특약과 자기부담금 체크",
    source: "직접 메모",
    confidence: "확인 중",
    priority: "높음",
    summary: "차량가, 운전자 범위, 블랙박스 특약, 긴급출동 조건을 한 번에 비교한다."
  },
  {
    category: "액세서리",
    title: "처음부터 사지 않아도 되는 물건",
    source: "오너 후기",
    confidence: "후기 분산",
    priority: "낮음",
    summary: "실사용 전에는 보류 목록으로 두고 인수 후 불편이 생길 때 구매한다."
  }
];

export const prepGroups = [
  {
    phase: "계약 후",
    items: ["주문 정보 기록", "예상 인도월 확인", "보조금 조건 확인"],
    progress: 45,
    icon: CalendarCheck
  },
  {
    phase: "인수 전",
    items: ["보험 견적 비교", "충전카드 발급", "썬팅/PPF 후보 압축"],
    progress: 28,
    icon: ShieldCheck
  },
  {
    phase: "인수 당일",
    items: ["외관/단차 확인", "실내 기능 확인", "서류/결제 내역 보관"],
    progress: 8,
    icon: CarFront
  },
  {
    phase: "첫 한 달",
    items: ["충전 루틴 확정", "소모품 기록 시작", "TeslaMate 도입 여부 판단"],
    progress: 8,
    icon: Gauge
  }
];

export const decisionItems = [
  {
    label: "썬팅",
    state: "비교 중",
    amount: "70만~130만",
    reason: "인수 직후 바로 체감되는 항목"
  },
  {
    label: "블랙박스",
    state: "보류",
    amount: "40만~80만",
    reason: "센트리 모드와 별도 녹화 필요성 비교"
  },
  {
    label: "충전카드",
    state: "진행",
    amount: "0원",
    reason: "발급 시간이 걸릴 수 있어 선처리"
  },
  {
    label: "트렁크 매트",
    state: "나중",
    amount: "5만~18만",
    reason: "실사용 후 필요하면 구매"
  }
];

export const ownerLogItems = [
  {
    icon: PlugZap,
    title: "충전 기록",
    text: "처음에는 수동으로 비용과 장소를 남기고, 나중에 TeslaMate 요약을 붙인다."
  },
  {
    icon: BatteryCharging,
    title: "배터리·효율",
    text: "계절, 온도, 주행 패턴에 따라 달라지는 효율을 월 단위로 본다."
  },
  {
    icon: MapPinned,
    title: "자주 가는 곳",
    text: "집, 회사, 충전소, 서비스센터를 기준점으로 정리한다."
  },
  {
    icon: Wrench,
    title: "정비·소모품",
    text: "타이어, 와이퍼, 필터, 점검 내역을 차계부처럼 남긴다."
  }
];

export const searchGroups = [
  { icon: Tags, label: "썬팅·틴팅", count: 21 },
  { icon: CircleDollarSign, label: "보조금", count: 8 },
  { icon: Sparkles, label: "공용 액세서리", count: 15 },
  { icon: FileText, label: "보험·인수", count: 11 }
];

export const teslaBasics = [
  {
    icon: Factory,
    title: "한국 Model Y 원산지",
    verdict: "주문서와 VIN으로 최종 확인",
    detail: "한국 RWD Model Y는 2023년부터 기가 상하이 생산분 수입 사례가 확인된다. 다만 차량별 원산지는 주문 상세, 등록 서류, VIN으로 최종 확인한다.",
    tags: ["기가 상하이", "VIN", "등록 서류"]
  },
  {
    icon: BrainCircuit,
    title: "FSD가 안 된다는 말",
    verdict: "공장보다 지역·하드웨어·계정 권한 문제",
    detail: "중국 공장에서 만들었다는 사실만으로 FSD 가능 여부가 갈리지는 않는다. 실제 기준은 판매 지역, 차량 구성, 구매 옵션, 어시스티드 드라이빙 하드웨어와 소프트웨어 버전이다.",
    tags: ["지역", "옵션", "하드웨어"]
  },
  {
    icon: RefreshCw,
    title: "소프트웨어 업그레이드",
    verdict: "가능하면 앱이나 차량 화면에 표시",
    detail: "지원 대상이면 Tesla 앱의 업그레이드 메뉴나 차량 터치스크린의 업그레이드 메뉴에서 FSD 관련 옵션을 볼 수 있다. 활성화 전 OTA 업데이트가 필요할 수 있다.",
    tags: ["Tesla 앱", "OTA", "업그레이드"]
  },
  {
    icon: ShieldAlert,
    title: "완전 자율주행 아님",
    verdict: "감독형 운전자 보조",
    detail: "FSD(감독형)는 이름과 달리 운전자의 적극적인 감독이 필요하다. 운전자는 항상 도로를 보고 즉시 직접 조작할 준비를 해야 한다.",
    tags: ["감독형", "운전자 책임", "레벨2"]
  }
];

export const autopilotLevels = [
  {
    label: "기본 안전 기능",
    summary: "자동 긴급 제동, 충돌 경고 같은 기본 안전 보조 기능",
    check: "차량 기본 제공 기능과 옵션 기능을 분리해서 본다."
  },
  {
    label: "오토파일럿",
    summary: "교통 인식 크루즈 컨트롤과 오토스티어 중심의 주행 보조",
    check: "차선, 속도, 앞차 추종이 핵심이며 운전자가 계속 감독한다."
  },
  {
    label: "향상된 오토파일럿",
    summary: "일부 시장에서 제공되는 자동 차선 변경, 자동 주차 등 확장 패키지",
    check: "한국 판매 구성과 구매 가능 여부는 주문/앱에서 확인한다."
  },
  {
    label: "FSD(감독형)",
    summary: "목적지 주행, 교차로 판단, 회전, 고속도로 진출입 등을 시도하는 고급 보조",
    check: "차량 구성, 지역 지원, 하드웨어, 소프트웨어 버전이 모두 맞아야 한다."
  }
];

export const teslaBasicsChecklist = [
  "인수 전 주문 상세에서 FSD 또는 오토파일럿 관련 옵션 표기 확인",
  "인수 후 차량 화면에서 컨트롤 > 소프트웨어의 어시스티드 드라이빙 컴퓨터 확인",
  "Tesla 앱 > 업그레이드 > 소프트웨어 업그레이드에 FSD 옵션이 뜨는지 확인",
  "카메라 보정, 지도 업데이트, 소프트웨어 업데이트 상태 확인",
  "FSD 후기 글은 차량 연식, 생산지, 하드웨어 세대, 배포 국가를 같이 기록"
];

export const teslaBasicsSources = [
  { label: "Tesla Model Y 공식 제원", url: "https://www.tesla.com/ko_kr/modely" },
  { label: "Tesla FSD(감독형) 매뉴얼", url: "https://www.tesla.com/ownersmanual/modely/ko_us/GUID-2CB60804-9CEA-4F4B-8B04-09B991368DC5.html" },
  { label: "Tesla FSD 지원 문서", url: "https://www.tesla.com/support/fsd" },
  { label: "중국산 Model Y 한국 수출 보도", url: "https://kr.news.cn/20230721/3b385507cdb94901ab898e6c220bf5ae/c.html" }
];

export const modelYPremiumRwdSpecs = [
  { label: "차량가", value: "4,999만 원", note: "2026-06-11 확인 기준" },
  { label: "구동", value: "RWD", note: "후륜구동" },
  { label: "배터리", value: "Standard Range", note: "공식 제원 표기" },
  { label: "주행 가능 거리", value: "400km", note: "실주행은 계절·속도 영향" },
  { label: "0-100km/h", value: "5.9초", note: "일상 주행 충분" },
  { label: "중량", value: "1,920kg", note: "Premium RWD 기준" },
  { label: "수퍼차저", value: "최대 175kW", note: "사용량 기반 과금" },
  { label: "적재공간", value: "2,138L", note: "5인승 기준" },
  { label: "디스플레이", value: "16인치+8인치", note: "중앙·후석 터치스크린" },
  { label: "전장/전고", value: "4,790/1,625mm", note: "공식 치수" },
  { label: "전폭", value: "1,980/2,130mm", note: "접이식/확장 미러 기준" },
  { label: "보증", value: "4년/8만km", note: "배터리·구동장치 8년/16만km" }
];

export const budgetBuckets = [
  {
    icon: ReceiptText,
    title: "차량·등록",
    amount: "4,999만 원 + 등록비",
    detail: "취득세는 전기차 감면 후 계산한다. 2026년 기준 전기차 취득세 감면 한도는 140만 원으로 확인된다."
  },
  {
    icon: CircleDollarSign,
    title: "보조금",
    amount: "국비 170만 원 + 지역별 지방비",
    detail: "Model Y Premium RWD 국비는 170만 원으로 확인된다. 지방비, 잔여 물량, 테슬라 자체 지원 여부는 주소지 기준으로 매번 확인한다."
  },
  {
    icon: ShieldCheck,
    title: "보험",
    amount: "연 120만~220만 원 가정",
    detail: "연령, 운전자 범위, 자차, 자기부담금, 특약에 따라 크게 달라진다. 최소 3곳 비교가 필요하다."
  },
  {
    icon: Hammer,
    title: "시공",
    amount: "85만~250만 원",
    detail: "썬팅+생활보호 PPF 중심이면 85만~150만 원, 블랙박스·코팅·프론트 PPF를 더하면 150만~250만 원대로 올라간다."
  },
  {
    icon: PlugZap,
    title: "충전 준비",
    amount: "0~40만 원",
    detail: "충전카드는 무료 발급 중심. CCS 어댑터와 모바일 커넥터는 필요성이 확인되면 공식 제품 위주로 검토한다."
  },
  {
    icon: Boxes,
    title: "알리 필수템",
    amount: "15만~45만 원",
    detail: "보호필름, 매트, 선쉐이드, 머드플랩, 수납류처럼 테슬라 공용 후기가 많고 실패 리스크가 낮은 품목부터 산다."
  }
];

export const essentialSupplies = [
  { item: "보험 견적", timing: "인수 2~3주 전", priority: "필수", memo: "운전자 범위, 자차, 자기부담금, 전기차 특약 확인" },
  { item: "충전카드", timing: "지금", priority: "필수", memo: "환경부, 이브이인프라, 해피차저 등 생활권 기준 발급" },
  { item: "하이패스", timing: "인수 전", priority: "필수", memo: "기존 단말 재사용 또는 새 단말 등록 방식 결정" },
  { item: "썬팅", timing: "인수 직후", priority: "필수", memo: "야간 시야와 전파 수신, 보증 조건을 가격보다 먼저 확인" },
  { item: "생활보호 PPF", timing: "인수 직후", priority: "권장", memo: "도어컵, 도어엣지, 충전구, 트렁크 리어 범퍼 중심" },
  { item: "블랙박스", timing: "보류", priority: "선택", memo: "센트리 모드로 충분한지, 주차 녹화/보험 특약 필요성이 있는지 판단" },
  { item: "CCS 어댑터", timing: "인수 후", priority: "상황별", memo: "장거리·지방 이동이 많으면 공식 제품 위주로 검토" },
  { item: "모바일 커넥터", timing: "집밥 검토 후", priority: "상황별", memo: "단독주택·비상 충전 환경이 있으면 유용" }
];

export const aliShoppingList = [
  {
    item: "센터/후석 디스플레이 강화유리",
    range: "1만~3만 원",
    timing: "먼저 구매",
    memo: "저렴하고 실패 리스크가 낮다. 2025~2026 Juniper/Highland 호환 표기를 확인한다.",
    url: "https://www.aliexpress.com/wholesale?SearchText=Tesla+Model+Y+Juniper+screen+protector"
  },
  {
    item: "TPE 바닥·트렁크 매트",
    range: "4만~12만 원",
    timing: "먼저 구매",
    memo: "국내 브랜드 대비 저렴하지만 냄새, 들뜸, 고정 핀 위치 후기를 확인한다.",
    url: "https://www.aliexpress.com/wholesale?SearchText=Tesla+Model+Y+Juniper+TPE+floor+mat"
  },
  {
    item: "루프 선쉐이드",
    range: "3만~11만 원",
    timing: "여름 전",
    memo: "모델 Y 글라스 루프 체감 온도 때문에 여름 인수라면 우선순위가 높다.",
    url: "https://www.aliexpress.com/wholesale?SearchText=Tesla+Model+Y+Juniper+roof+sunshade"
  },
  {
    item: "짧은 머드플랩",
    range: "1만~3만 원",
    timing: "인수 전",
    memo: "돌빵과 하단 오염 방지용. 너무 긴 제품은 간섭 후기를 확인한다.",
    url: "https://www.aliexpress.com/wholesale?SearchText=Tesla+Model+Y+Juniper+mud+flaps"
  },
  {
    item: "트렁크 문턱 보호대",
    range: "1만~3만 원",
    timing: "인수 후",
    memo: "캐리어와 짐을 자주 싣는다면 체감된다. 접착식은 탈거 흔적을 고려한다.",
    url: "https://www.aliexpress.com/wholesale?SearchText=Tesla+Model+Y+trunk+sill+protector"
  },
  {
    item: "시트 하단 에어벤트 커버",
    range: "5천~1.5만 원",
    timing: "나중",
    memo: "작은 물건이 뒷좌석 송풍구로 들어가는 것을 막는 용도다.",
    url: "https://www.aliexpress.com/wholesale?SearchText=Tesla+Model+Y+seat+air+vent+cover"
  },
  {
    item: "센터 콘솔/스크린 하단 수납함",
    range: "1만~4만 원",
    timing: "나중",
    memo: "수납 습관이 생긴 뒤 필요한 위치만 산다.",
    url: "https://www.aliexpress.com/wholesale?SearchText=Tesla+Model+Y+Juniper+center+console+organizer"
  },
  {
    item: "휠 커버",
    range: "6만~20만 원",
    timing: "보류",
    memo: "외관 만족도는 높지만 고속 주행 소음, 체결력, 순정 휠 흠집 후기를 확인한다.",
    url: "https://www.aliexpress.com/wholesale?SearchText=Tesla+Model+Y+Juniper+wheel+cover"
  },
  {
    item: "Qi2 맥세이프 거치대",
    range: "3만~7만 원",
    timing: "보류",
    memo: "차량 기본 무선 충전이 불편할 때만 산다. Qi2 인증 여부를 확인한다.",
    url: "https://www.aliexpress.com/wholesale?SearchText=Tesla+Model+Y+Qi2+MagSafe+mount"
  },
  {
    item: "전면 흡기구/카메라 커버류",
    range: "5천~2만 원",
    timing: "검증 후",
    memo: "센서, 냉각, 배수에 영향을 줄 수 있는 제품은 후기 확인 전 구매하지 않는다.",
    url: "https://www.aliexpress.com/wholesale?SearchText=Tesla+Model+Y+Juniper+camera+cover"
  }
];

export const serviceCostRows = [
  {
    work: "썬팅 단품",
    range: "55만~150만 원",
    memo: "필름 등급과 루프/후면 통시공 여부에 따라 차이가 크다."
  },
  {
    work: "썬팅 + 생활보호 PPF 패키지",
    range: "85만~150만 원",
    memo: "JB motors 85만 원대, 오리진마인드 95만 원 패키지 등 공개 사례가 있다."
  },
  {
    work: "블랙박스 추가",
    range: "30만~80만 원",
    memo: "센트리 모드와 별도 블랙박스의 필요성을 먼저 결정한다."
  },
  {
    work: "프론트 PPF",
    range: "80만~180만 원",
    memo: "범퍼, 보닛, 헤드라이트 등 시공 범위에 따라 달라진다."
  },
  {
    work: "전체 PPF",
    range: "250만~400만 원 이상",
    memo: "무광/유광, 필름 브랜드, 재단 방식에 따라 큰 차이가 난다."
  },
  {
    work: "유리막·가죽코팅·발수",
    range: "10만~100만 원",
    memo: "필수보다는 관리 성향에 가까워서 예산이 남을 때 검토한다."
  }
];

export const shopCandidates = [
  { name: "JB motors", area: "경기/수도권", note: "모델 Y 신차패키지 가격표 공개 사례. HTTPS 인증서 이슈가 있어 HTTP로 연결", url: "http://jbmotors.co.kr/content/06tesla/03_01.php" },
  { name: "오리진마인드", area: "수도권", note: "모델 Y 주니퍼 95만 원 패키지 공개 사례", url: "https://orgnmind.co.kr/90" },
  { name: "스타일매니아", area: "수도권", note: "모델 Y 주니퍼 썬팅/PPF 시공 사례 확인", url: "https://www.stylemania.co.kr/?bmode=view&idx=165250901" },
  { name: "모터스킨", area: "서울 강서", note: "전체 PPF+썬팅 가격 사례 확인", url: "https://m.oh-car.co.kr/goods/goods_view.php?goodsNo=1000066105" },
  { name: "카닥", area: "비교 플랫폼", note: "외장수리·정비 견적 비교용. 틴팅/PPF 전용 업체는 별도 비교", url: "https://cardoc.co.kr/" },
  { name: "비앤엠코리아", area: "부산", note: "부산 테슬라 신차패키지 후보", url: "https://bnmkorea.co.kr/%EB%B6%80%EC%82%B0-%ED%85%8C%EC%8A%AC%EB%9D%BC-%EC%8B%A0%EC%B0%A8%ED%8C%A8%ED%82%A4%EC%A7%80-%EB%AA%A8%EB%8D%B8y-%EC%A0%84%EB%AC%B8-%EC%8B%9C%EA%B3%B5%EC%9D%80-%EC%98%A4%EB%84%88%EC%9D%98-%EB%AF%B8/" },
  { name: "오늘의카", area: "비교 플랫폼", note: "하남·강동·송파 등 비교견적 탐색용", url: "https://m.oh-car.co.kr/" }
];

export const deliveryChecklist = [
  {
    phase: "계약·일정",
    icon: CalendarCheck,
    summary: "주문 정보와 인도 일정의 기준점을 잡는다.",
    items: [
      { text: "트림, 색상, 휠, 옵션 기록", status: "완료" },
      { text: "주문번호와 예약금 결제 내역 보관", status: "진행" },
      { text: "예상 인도월과 담당 연락 채널 기록", status: "진행" },
      { text: "차량가, 취득세, 등록비, 보험료 예산표 작성", status: "대기" },
      { text: "공동명의 여부와 등록 주소 결정", status: "대기" }
    ]
  },
  {
    phase: "보조금·결제",
    icon: CreditCard,
    summary: "지역별 보조금과 결제 한도를 미리 확인한다.",
    items: [
      { text: "거주 지역 전기차 보조금 잔여 물량 확인", status: "진행" },
      { text: "보조금 신청 서류와 마감 조건 확인", status: "대기" },
      { text: "카드 한도, 계좌 이체 한도, 캐시백 조건 점검", status: "대기" },
      { text: "잔금 결제 방식과 예상 결제일 기록", status: "대기" },
      { text: "번호판 등록 방식과 비용 확인", status: "대기" }
    ]
  },
  {
    phase: "보험·서류",
    icon: ShieldCheck,
    summary: "인수 전날 급하게 비교하지 않도록 미리 후보를 좁힌다.",
    items: [
      { text: "보험사 3곳 이상 견적 비교", status: "대기" },
      { text: "운전자 범위, 자차, 자기부담금 조건 결정", status: "대기" },
      { text: "블랙박스/첨단안전장치 특약 가능 여부 확인", status: "대기" },
      { text: "긴급출동, 견인 거리, 전기차 특약 확인", status: "대기" },
      { text: "신분증, 등본, 인감/공동명의 관련 서류 준비", status: "대기" }
    ]
  },
  {
    phase: "충전 준비",
    icon: PlugZap,
    summary: "집밥이 있든 없든 첫 달 충전 루틴을 먼저 만든다.",
    items: [
      { text: "집/회사/생활권 충전소 후보 저장", status: "진행" },
      { text: "환경부, 이브이인프라, 해피차저 등 충전카드 발급", status: "대기" },
      { text: "아파트 충전 가능 여부와 관리실 규정 확인", status: "대기" },
      { text: "슈퍼차저 위치와 첫 달 예상 이용 동선 확인", status: "대기" },
      { text: "비상 충전 케이블/어댑터 필요 여부 판단", status: "대기" }
    ]
  },
  {
    phase: "시공·액세서리",
    icon: Sparkles,
    summary: "인수 직후 필요한 것과 나중에 사도 되는 것을 분리한다.",
    items: [
      { text: "썬팅 후보 2~3곳 견적과 보증 조건 비교", status: "진행" },
      { text: "PPF 필요 부위와 시공 범위 결정", status: "대기" },
      { text: "블랙박스 설치 여부와 배선 방식 확인", status: "대기" },
      { text: "하이패스 등록 방식 확인", status: "대기" },
      { text: "매트, 수납, 보호필름은 인수 후 구매로 분리", status: "완료" }
    ]
  },
  {
    phase: "인수 당일",
    icon: KeyRound,
    summary: "흥분한 상태에서도 빠뜨리지 않도록 확인 순서를 고정한다.",
    items: [
      { text: "외관 도장, 단차, 유리, 휠 흠집 확인", status: "대기" },
      { text: "실내 시트, 트림, 디스플레이, 도어 작동 확인", status: "대기" },
      { text: "충전 포트, 케이블, 공조, 와이퍼, 조명 확인", status: "대기" },
      { text: "앱 차량 등록, 키 카드, 프로필 설정 확인", status: "대기" },
      { text: "인수 서류와 결제 영수증 사진 보관", status: "대기" }
    ]
  },
  {
    phase: "첫 주·첫 달",
    icon: NotebookTabs,
    summary: "실사용 후 불편을 보고 구매와 기록 시스템을 정한다.",
    items: [
      { text: "첫 충전 비용과 충전 위치 기록", status: "대기" },
      { text: "오토파일럿, 회생제동, 원페달 주행 적응", status: "대기" },
      { text: "타이어 공기압과 승차감 기준 기록", status: "대기" },
      { text: "실사용 후 액세서리 구매 목록 재정리", status: "대기" },
      { text: "TeslaMate 도입 여부를 1개월 뒤 판단", status: "대기" }
    ]
  }
];

export const watchedCafes = [
  {
    name: "테슬라 [TKC]",
    slug: "noljatravel",
    clubId: "26681849",
    url: "https://cafe.naver.com/noljatravel",
    note: "공개글 검색 API 결과에서 cafeurl로 후처리 가능"
  },
  {
    name: "테슬라 슈퍼 클럽",
    slug: "shootgoal",
    clubId: "10699343",
    url: "https://cafe.naver.com/shootgoal",
    note: "공개글은 검색 가능, 회원글 전체 수집은 별도 공식 읽기 API 없음"
  }
];
