import {
  BatteryCharging,
  CalendarCheck,
  CarFront,
  ChartNoAxesCombined,
  CircleDollarSign,
  ClipboardCheck,
  FileText,
  Gauge,
  MapPinned,
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
  { label: "결정 노트", href: "#decisions" },
  { label: "오너 로그", href: "#owner-log" }
];

export const statusMetrics = [
  {
    label: "인수 준비율",
    value: "42%",
    detail: "필수 항목 19개 중 8개 정리",
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
    items: ["인도 예정월 기록", "보험 견적 시작", "등록 지역 보조금 확인"],
    progress: 55,
    icon: CalendarCheck
  },
  {
    phase: "인수 전",
    items: ["썬팅/PPF 후보 압축", "충전카드 발급", "하이패스 등록 준비"],
    progress: 38,
    icon: ShieldCheck
  },
  {
    phase: "인수 당일",
    items: ["외관 확인", "실내 기능 확인", "서류와 결제 내역 보관"],
    progress: 12,
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
