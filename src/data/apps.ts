// 앱·연동 데이터 레이어.
//
// 축이 두 개다.
//  1) 필수 연동 — 안 하면 차를 못 쓰거나 기능이 안 켜지는 것 (앱 ↔ 차량/단말/카드)
//  2) 선택 연동 — Tesla 계정을 서드파티에 물려서 주행·충전 데이터를 자동 기록하는 것
//
// 2번은 2024년 이후 Tesla가 비공식 Owner API를 닫고 공식 Fleet API로 넘어가면서
// 개인 사용자 기준 난이도와 비용이 확 올라갔다. 그 현황을 같이 적어야 판단이 된다.
//
// 사실/추정 표기(CLAUDE.md 응답 규칙 2):
//  - "공식"     = 공식 문서·공식 스토어에서 확인
//  - "커뮤니티" = 오너/개발자 커뮤니티 기반(= 추정, 시점에 따라 변함)

export type Evidence = "공식" | "커뮤니티" | "확인필요";

// ── 필수 앱 ────────────────────────────────────────────────────────────
export type AppItem = {
  name: string;
  platform: string;
  cost: string;
  purpose: string;
  when: string;
  note: string;
  url: string;
  weight: "필수" | "권장" | "선택";
  evidence: Evidence;
};

export const coreApps: AppItem[] = [
  {
    name: "Tesla (공식 앱)",
    platform: "iOS · Android",
    cost: "무료",
    purpose:
      "차 키(폰키), 도어 잠금·해제, 원격 공조, 충전 제어·현황, 차량 위치, 소프트웨어 업데이트, 서비스 예약까지 전부 여기서 한다.",
    when: "인수 당일 — 차량 연결과 폰키 페어링을 현장에서 끝낸다",
    note: "폰키는 블루투스 기반이라 폰 배터리가 나가면 문을 못 연다. 키카드를 지갑에 항상 넣어둘 것.",
    url: "https://www.tesla.com/ko_kr/support/tesla-app",
    weight: "필수",
    evidence: "공식"
  },
  {
    name: "하이패스 (한국도로공사)",
    platform: "웹 · 앱",
    cost: "무료",
    purpose:
      "구입한 하이패스 단말에 차량을 등록하고 통행 내역·미납을 조회한다. 등록을 안 하면 단말이 있어도 작동하지 않는다.",
    when: "단말 수령 직후",
    note: "테슬라는 룸미러 내장 단말이 없어 별도 단말이 필요하다. 전기차는 고속도로 통행료 감면 대상이라 감면 등록도 같이 확인한다.",
    url: "https://www.hipass.co.kr/",
    weight: "필수",
    evidence: "공식"
  },
  {
    name: "무공해차 통합누리집 (ev.or.kr)",
    platform: "웹",
    cost: "무료",
    purpose: "환경부 공식. 충전 회원카드 신청처이자 전국 충전소 데이터의 원본이다.",
    when: "번호판이 나온 직후 — 차량번호가 있어야 회원카드 접수가 된다",
    note: "카드를 받은 뒤 결제카드를 따로 등록해야 실제로 결제된다. 배송 1~2주.",
    url: "https://www.ev.or.kr/",
    weight: "필수",
    evidence: "공식"
  },
  {
    name: "EV Infra",
    platform: "iOS · Android",
    cost: "무료",
    purpose: "국내 충전소 커버리지가 가장 넓다. 충전기 고장·대기 여부를 오너들이 실시간으로 남긴다.",
    when: "첫 장거리 이동 전",
    note: "공식 데이터가 '운영중'이어도 실제로는 고장인 경우가 있다. 그 간극을 메우는 게 이 앱의 값어치다.",
    url: "https://www.evinfra.io/",
    weight: "권장",
    evidence: "커뮤니티"
  },
  {
    name: "Tesla Cam Converter",
    platform: "웹 (설치 불필요)",
    cost: "무료",
    purpose: "센트리·대시캠 영상에 타임스탬프를 찍어준다. 테슬라 원본에는 화면상 시각 표기가 없어 신고용으로 그대로 쓰기 곤란하다.",
    when: "사고 영상을 제출할 일이 생기면",
    note: "USB에서 꺼낸 파일만 올리면 되고 계정 연동은 필요 없다.",
    url: "https://teslacamconverter.netlify.app/",
    weight: "선택",
    evidence: "커뮤니티"
  },
  {
    name: "WebAA",
    platform: "Android 폰 필요",
    cost: "무료",
    purpose: "차량 내장 브라우저로 안드로이드 오토를 띄워 티맵·카카오내비를 테슬라 화면에 표시한다.",
    when: "국내 내비를 큰 화면에서 쓰고 싶을 때",
    note: "비공식 방식이라 소프트웨어 업데이트로 막힐 수 있다. 아이폰은 불가. 주행 중 조작은 위험하다.",
    url: "https://webaa.dev/",
    weight: "선택",
    evidence: "커뮤니티"
  }
];

// ── 필수 연동 절차 ─────────────────────────────────────────────────────
// "무엇을 무엇에 붙이는가"를 단계로 쪼갠다. 각 단계는 실패 지점이 하나씩 있다.
export type LinkFlow = {
  id: string;
  title: string;
  target: string; // 무엇과 무엇을 잇는가
  blocker: string; // 이걸 안 하면 뭐가 막히나
  steps: string[];
  gotcha: string;
  evidence: Evidence;
  url: string;
};

export const requiredFlows: LinkFlow[] = [
  {
    id: "tesla-app",
    title: "Tesla 앱 ↔ 차량 연결 · 폰키",
    target: "Tesla 계정에 차량을 등록하고, 폰을 열쇠로 등록한다.",
    blocker: "이게 안 되면 원격 제어·충전 현황·차량 위치가 전부 안 된다. 폰으로 문도 못 연다.",
    steps: [
      "Tesla 앱 설치 후 계약에 쓴 이메일로 로그인한다. 인수 시점에 차량이 계정에 자동으로 붙는다.",
      "차 안에서 앱의 '폰키 설정'을 실행하고, 차량 화면에 뜨는 요청을 키카드로 인증한다.",
      "키카드를 센터콘솔 무선충전 패드 뒤쪽 인식 지점에 태그해 페어링을 확정한다.",
      "폰 블루투스를 켠 상태로 차에서 내렸다 다가가며 자동 잠금/해제가 되는지 확인한다.",
      "차량 화면 > 잠금 > 등록된 키 목록에서 폰키와 키카드 2장이 다 보이는지 확인한다."
    ],
    gotcha:
      "★ 폰키는 블루투스라 폰 배터리가 나가면 못 연다. 키카드는 반드시 지갑에 상시 휴대. 등록된 키 목록에 모르는 기기가 있으면 즉시 해제한다.",
    evidence: "공식",
    url: "https://www.tesla.com/ko_kr/support/tesla-app"
  },
  {
    id: "tesla-2fa",
    title: "Tesla 계정 2단계 인증",
    target: "Tesla 계정 ↔ 인증 앱(OTP).",
    blocker: "계정이 곧 차 키다. 로그인만 되면 남이 원격으로 문을 열고 주행 준비를 시킬 수 있다.",
    steps: [
      "tesla.com 계정 페이지 > 보안 > 2단계 인증에서 인증 앱 방식을 켠다.",
      "백업 코드를 발급받아 폰이 아닌 곳(비밀번호 관리자 등)에 따로 보관한다.",
      "등록된 기기·폰키 목록을 훑어 모르는 항목이 없는지 확인한다."
    ],
    gotcha: "차를 서비스센터나 지인에게 맡기기 전에 이게 켜져 있는지 한 번 더 본다.",
    evidence: "공식",
    url: "https://www.tesla.com/ko_kr/support/how-create-update-delete-tesla-account"
  },
  {
    id: "hipass",
    title: "하이패스 단말 ↔ 차량 등록",
    target: "구입한 단말과 차량번호를 하이패스 시스템에 등록한다.",
    blocker: "등록을 안 하면 단말을 꽂아도 통행료가 안 빠지고 미납으로 잡힌다.",
    steps: [
      "단말을 구입한다(테슬라 공식몰 또는 일반 단말). 테슬라는 룸미러 내장형이 없다.",
      "하이패스 홈페이지에서 회원가입 후 차량번호와 단말 번호를 등록한다.",
      "하이패스 카드(후불 신용카드 또는 선불카드)를 단말에 삽입한다.",
      "전기차 통행료 감면 등록이 같이 되어 있는지 확인한다.",
      "가까운 요금소에서 1회 통과해 실제로 인식되는지 테스트한다."
    ],
    gotcha: "번호판이 나온 뒤에야 차량 등록이 된다. 단말 배송 + 등록에 며칠 걸린다.",
    evidence: "공식",
    url: "https://www.hipass.co.kr/"
  },
  {
    id: "ev-card",
    title: "환경부 충전 회원카드 ↔ 결제카드",
    target: "회원카드를 발급받고, 거기에 실제 결제수단을 붙인다.",
    blocker: "카드만 받고 결제수단을 안 붙이면 충전기 앞에서 태그해도 결제가 안 된다.",
    steps: [
      "번호판이 나온 뒤 ev.or.kr에서 회원가입하고 회원카드를 신청한다(차량번호 필수, 최초 1회 무료).",
      "카드가 배송될 때까지 1~2주는 사업자 앱 결제로 버틴다.",
      "★ 카드를 받으면 ev.or.kr에 로그인해 결제카드를 등록한다. 이 단계를 빼먹는 사례가 가장 흔하다.",
      "생활권 충전기에서 1회 태그해 회원 요금으로 결제되는지 확인한다."
    ],
    gotcha: "회원 요금과 비회원 요금 차이가 있다. 결제카드 등록 전에는 회원 요금이 적용되지 않는다.",
    evidence: "공식",
    url: "https://www.ev.or.kr/"
  },
  {
    id: "wifi-usb",
    title: "차량 ↔ 집 Wi-Fi · 센트리 USB",
    target: "소프트웨어 업데이트 경로와 녹화 저장소를 붙인다.",
    blocker: "Wi-Fi가 없으면 큰 업데이트가 잘 안 내려온다. USB가 없으면 센트리·블랙박스가 아예 안 켜진다.",
    steps: [
      "차량 화면 > 컨트롤 > Wi-Fi에서 집(주차장에서 잡히는) 네트워크를 등록한다.",
      "고내구 USB 저장장치를 글로브박스 포트에 꽂고 차량 메뉴에서 포맷한다.",
      "컨트롤 > 안전 > 감시 모드를 켜고, 집·회사는 예외 위치로 등록할지 정한다."
    ],
    gotcha: "일반 USB 메모리는 상시 녹화에 금방 죽는다. 고내구 microSD나 소형 SSD를 쓴다.",
    evidence: "공식",
    url: "https://www.tesla.com/ko_kr/support/dashcam-sentry-mode"
  }
];

// ── 서드파티 계정 연동 ─────────────────────────────────────────────────
// Tesla 계정을 물려서 주행·충전·효율을 자동으로 기록하는 도구들.
//
// ⚠️ 전제: Tesla는 2024년부터 비공식 Owner API를 닫고 공식 Fleet API로 옮기는 중이다.
// 개인(비사업자) 사용자 입장에서 Fleet API는 Owner API보다 조회 빈도가 낮고,
// 텔레메트리도 초 단위가 아니라 분 단위이며, 대부분 유료 프록시를 끼게 된다.
// 즉 "옛날 블로그 글대로 하면 안 되는" 영역이다.
export const fleetApiStatus = {
  headline: "Owner API는 닫히는 중, Fleet API는 개인에게 불리하다",
  points: [
    "Tesla는 그동안 서드파티가 쓰던 비공식 Owner API를 종료하는 방향으로 가고 있다. 아직 되는 계정도 있지만 언제 끊겨도 이상하지 않다.",
    "공식 Fleet API는 개인 사용자 기준으로 차량 정보 조회(vehicle_data)와 명령 전송 빈도가 제한된다.",
    "기존 스트리밍은 초 단위였지만 Fleet Telemetry는 최소 분 단위다. 주행 궤적의 해상도가 떨어진다.",
    "직접 붙이려면 developer.tesla.com에서 클라이언트를 등록해야 하고, 실무에서는 Teslemetry·MyTeslaMate 같은 유료 프록시를 끼는 쪽이 일반적이다.",
    "★ 결론: 자동 기록이 꼭 필요한 게 아니라면 서둘러 붙일 이유가 없다. 붙인다면 셀프호스팅(TeslaMate)보다 관리형(Tessie·Teslascope)이 손이 훨씬 덜 간다."
  ],
  source: "공식" as Evidence,
  url: "https://docs.teslamate.org/docs/configuration/api/"
};

export type ThirdPartyTool = {
  id: string;
  name: string;
  kind: "셀프호스팅" | "관리형 서비스";
  cost: string;
  gives: string; // 뭘 얻나
  costs: string; // 뭘 치르나
  setup: string[];
  verdict: string;
  evidence: Evidence;
  url: string;
};

export const thirdPartyTools: ThirdPartyTool[] = [
  {
    id: "teslamate",
    name: "TeslaMate",
    kind: "셀프호스팅",
    cost: "소프트웨어 무료 · 서버 비용 + Fleet API 프록시 비용 별도",
    gives:
      "주행 로그, 충전 세션별 비용·전력량, 효율 추이, 배터리 열화 추정, 주차 위치 히스토리를 전부 내 DB(PostgreSQL)에 쌓는다. Grafana 대시보드가 딸려 온다. 데이터 주권이 완전히 내 쪽이다.",
    costs:
      "Docker로 상시 켜둘 서버(NAS·미니PC·VPS)가 필요하다. Fleet API 전환 이후에는 토큰 발급을 위해 프록시 서비스를 끼거나 직접 개발자 등록을 해야 해서 초기 난이도가 예전 글보다 확실히 높다.",
    setup: [
      "상시 구동할 서버를 정한다(NAS·미니PC·VPS). Docker와 docker compose를 설치한다.",
      "TeslaMate 공식 docker-compose.yml로 TeslaMate + PostgreSQL + Grafana + MQTT를 띄운다.",
      "토큰을 확보한다 — Teslemetry나 MyTeslaMate 같은 서드파티 제공자에 Tesla 계정으로 로그인해 발급받거나, developer.tesla.com에서 직접 클라이언트를 등록한다.",
      "발급받은 액세스/리프레시 토큰을 TeslaMate 웹 UI에 입력해 차량을 연결한다.",
      "Grafana에 접속해 주행·충전 대시보드가 채워지는지 확인한다.",
      "외부에서 볼 거라면 반드시 리버스 프록시 + 인증을 건다. 그대로 열어두면 차량 위치가 공개된다."
    ],
    verdict:
      "데이터를 남 서버에 안 두겠다는 사람에게만 값어치가 있다. 서버 관리를 할 생각이 없으면 이건 답이 아니다.",
    evidence: "공식",
    url: "https://docs.teslamate.org/"
  },
  {
    id: "tessie",
    name: "Tessie",
    kind: "관리형 서비스",
    cost: "유료 구독 (월 단위, 무료 체험 있음)",
    gives:
      "TeslaMate급 기록을 서버 없이 얻는다. 주행·충전 이력, 배터리 상태 리포트, 위치 알림, 자동화, 데이터 내보내기까지 앱 하나로 끝난다. Owner API 종료 같은 변화도 서비스 쪽에서 흡수한다.",
    costs: "구독료가 계속 나간다. 주행 데이터와 위치가 제3자 서버에 쌓인다.",
    setup: [
      "tessie.com에서 가입하고 Tesla 계정으로 로그인해 접근을 승인한다.",
      "차량이 목록에 뜨면 연결 완료. 이후 기록은 자동으로 쌓인다.",
      "쓰지 않기로 하면 Tesla 계정 설정에서 서드파티 앱 접근을 해제한다."
    ],
    verdict: "자동 기록을 원하는데 서버는 만지기 싫다면 가장 현실적인 선택.",
    evidence: "공식",
    url: "https://tessie.com/"
  },
  {
    id: "teslascope",
    name: "Teslascope",
    kind: "관리형 서비스",
    cost: "무료 티어 + 유료 플랜",
    gives: "주행·충전 통계와 공유 가능한 차량 프로필. 무료로 시작할 수 있어 진입 부담이 가장 낮다.",
    costs: "세밀한 기능은 유료. 마찬가지로 데이터가 제3자 서버에 쌓인다.",
    setup: [
      "teslascope.com에서 가입한다.",
      "Tesla 계정으로 로그인해 차량 접근을 승인한다.",
      "대시보드에서 기록이 들어오는지 확인한다."
    ],
    verdict: "일단 자동 기록이 어떤 건지 겪어보고 싶을 때 무료로 찔러보기 좋다.",
    evidence: "커뮤니티",
    url: "https://teslascope.com/"
  },
  {
    id: "abrp-link",
    name: "ABRP 실시간 연동",
    kind: "관리형 서비스",
    cost: "연동 기능은 프리미엄",
    gives:
      "차량의 실제 잔량·소모를 받아서 경로 계획을 실시간으로 보정한다. 수동 입력 없이 '지금 이 속도로 가면 도착 시 몇 %'가 계속 갱신된다.",
    costs: "프리미엄 구독. 연동 없이도 수동 입력으로 계획은 세울 수 있다.",
    setup: [
      "ABRP 앱에서 차량 프로필을 Model Y Premium RWD로 만든다.",
      "설정 > Live Data에서 Tesla 계정 연동 또는 Tessie·TeslaMate 같은 중계 소스를 고른다.",
      "실주행 데이터가 쌓이면 소비 모델이 내 운전 습관에 맞춰 보정된다."
    ],
    verdict: "장거리를 자주 다니게 되면 그때 붙인다. 지금은 급하지 않다.",
    evidence: "커뮤니티",
    url: "https://abetterrouteplanner.com/"
  }
];

// 연동을 끊는 법 — 붙이는 법만 적고 끊는 법을 안 적으면 반쪽이다.
export const revokeGuide = {
  title: "서드파티 연동 해제",
  steps: [
    "tesla.com 계정 페이지 > 보안 > 서드파티 앱 접근에서 해당 앱의 권한을 회수한다.",
    "TeslaMate처럼 셀프호스팅이면 컨테이너를 내리고 DB를 지운다. 서버에 위치 이력이 그대로 남는다.",
    "관리형 서비스는 계정 삭제까지 해야 저장된 주행 데이터가 정리된다. 권한 회수만으로는 과거 데이터가 남는다.",
    "차를 팔 때는 ① USB 회수 ② 차량 공장 초기화 ③ Tesla 앱에서 차량 삭제 순서를 지킨다."
  ],
  source: "공식" as Evidence,
  url: "https://www.tesla.com/ko_kr/support/how-add-or-remove-vehicles-tesla-app"
};
