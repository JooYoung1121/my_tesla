// 커뮤니티·피드 데이터 레이어.
//
// 두 종류를 구분한다.
//  1) feedTopics — 서버에서 실시간으로 긁어오는 것. Google 뉴스 RSS를 쓴다.
//  2) communityLinks — 긁을 수 없어서 링크로만 두는 것.
//
// 왜 Google 뉴스 RSS인가:
//   네이버 카페(TKC)는 RSS가 없고 로그인이 필요해 서버에서 읽을 수 없다.
//   Reddit RSS는 서버 IP에서 403/429로 자주 막혀 배포 환경에서 신뢰할 수 없다
//   (2026-08-14 직접 테스트 확인). Google 뉴스 RSS는 키 없이 한국어 결과를
//   안정적으로 준다. 그래서 "뉴스는 실시간, 카페는 링크"로 나눴다.

export type FeedTopic = {
  id: string;
  label: string;
  query: string; // Google 뉴스 검색어
  hint: string;
};

export const feedTopics: FeedTopic[] = [
  { id: "modely", label: "모델Y", query: "테슬라 모델Y", hint: "내 차종 관련 소식" },
  { id: "tesla-kr", label: "테슬라 국내", query: "테슬라 코리아 OR 테슬라 국내", hint: "가격·정책·서비스센터" },
  { id: "charging", label: "충전", query: "전기차 충전 요금 OR 충전소", hint: "충전 요금·인프라 변화" },
  { id: "software", label: "소프트웨어", query: "테슬라 소프트웨어 업데이트 OR FSD", hint: "업데이트·기능 변경" },
  { id: "ev-policy", label: "전기차 정책", query: "전기차 보조금 OR 전기차 정책", hint: "세제·보조금·규제" }
];

export type CommunityLink = {
  name: string;
  kind: string;
  why: string;
  note: string;
  url: string;
};

export const communityLinks: CommunityLink[] = [
  {
    name: "테슬라 [TKC] 네이버 카페",
    kind: "국내 최대 커뮤니티",
    why: "시공 업체 후기, 서비스센터 경험, 소프트웨어 업데이트 이슈가 가장 빨리 올라온다.",
    note: "로그인이 필요하고 RSS가 없어서 이 사이트에서 자동으로 읽어올 수 없다. 문제가 생겼을 때 카페 안에서 검색하는 용도.",
    url: "https://cafe.naver.com/noljatravel"
  },
  {
    name: "슬라고",
    kind: "국내 오너 앱",
    why: "국내 테슬라 오너들이 충전 정보와 팁을 공유한다.",
    note: "Android 전용. TKC와 내용이 상당히 겹쳐서 둘 다 볼 필요는 없다.",
    url: "https://play.google.com/store/apps/details?id=space.teslaworld.www"
  },
  {
    name: "EV Infra 커뮤니티",
    kind: "충전 특화",
    why: "충전기 고장·대기 제보가 실시간으로 올라온다. 장거리 전에 경로상 충전소를 확인하는 용도.",
    note: "앱 안의 충전소별 후기가 핵심이다. 공식 데이터가 '운영중'이어도 여기서 고장 제보를 먼저 본다.",
    url: "https://www.evinfra.io/"
  },
  {
    name: "Tesla Motors Club",
    kind: "해외 포럼",
    why: "하드웨어·펌웨어 이슈는 해외에서 먼저 터지고 원인 분석도 깊다.",
    note: "영어. 국내 사양(충전 규격·어댑터)과 다른 전제가 섞여 있으니 그대로 적용하지 말 것.",
    url: "https://teslamotorsclub.com/"
  },
  {
    name: "r/TeslaModelY",
    kind: "해외 레딧",
    why: "주니퍼 세대 실사용 후기와 액세서리 호환 정보가 빠르다.",
    note: "영어. 서버에서 자동 수집이 막혀 있어 링크로만 둔다.",
    url: "https://www.reddit.com/r/TeslaModelY/"
  },
  {
    name: "Tesla 공식 릴리즈 노트",
    kind: "공식",
    why: "소문 말고 실제로 뭐가 바뀌었는지는 여기가 원본이다.",
    note: "차량 화면 > 소프트웨어에서도 같은 내용을 본다.",
    url: "https://www.tesla.com/ko_kr/support/software-updates"
  }
];

// 자주 여는 공식 페이지
export const quickLinks = [
  { label: "Tesla 앱 지원", url: "https://www.tesla.com/ko_kr/support/tesla-app" },
  { label: "Model Y 오너 매뉴얼", url: "https://www.tesla.com/ko_kr/support/model-y" },
  { label: "소프트웨어 업데이트", url: "https://www.tesla.com/ko_kr/support/software-updates" },
  { label: "충전 어댑터 매뉴얼", url: "https://www.tesla.com/ko_kr/support/charging/product-guides" },
  { label: "무공해차 통합누리집", url: "https://www.ev.or.kr/" },
  { label: "하이패스", url: "https://www.hipass.co.kr/" },
  { label: "서비스 예약", url: "https://www.tesla.com/ko_kr/support/service-visits" }
];
