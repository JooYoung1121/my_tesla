import {
  BatteryCharging,
  CalendarCheck,
  CarFront,
  ChartNoAxesCombined,
  CircleDollarSign,
  ClipboardCheck,
  CreditCard,
  FileText,
  Gauge,
  KeyRound,
  MapPinned,
  NotebookTabs,
  PlugZap,
  Radar,
  ShieldCheck,
  Sparkles,
  Tags,
  Wrench
} from "lucide-react";

export const navItems = [
  { label: "오늘", href: "#today" },
  { label: "정보 보드", href: "#intel" },
  { label: "인수 준비", href: "#delivery" },
  { label: "카페 후보", href: "#cafes" },
  { label: "결정 노트", href: "#decisions" },
  { label: "오너 로그", href: "#owner-log" }
];

export const statusMetrics = [
  {
    label: "인수 준비율",
    value: "29%",
    detail: "필수 항목 42개 중 12개 정리",
    tone: "red"
  },
  {
    label: "확인할 글",
    value: "27",
    detail: "썬팅·보험·충전카드 중심",
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
  { icon: Tags, label: "썬팅", count: 8 },
  { icon: CircleDollarSign, label: "보조금", count: 5 },
  { icon: Sparkles, label: "액세서리", count: 11 },
  { icon: FileText, label: "보험", count: 3 }
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
