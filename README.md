# 마이 테슬라

Model Y Premium RWD(주니퍼) 오너용 개인 허브. 2026-08-14 인수 / 2026-08-18 수령.

인수가 끝났으므로 인수 전 도구(카운트다운·일정·검수 체크리스트·정비·제원 등)는 전부 제거했다.
지금 범위는 **실제로 차를 굴리는 데 필요한 4가지**뿐이다.

## 탭 구성

| 탭 | 내용 |
| --- | --- |
| **앱·연동** | 필요한 앱 / 필수 연동 절차(Tesla 앱·폰키, 하이패스, 충전 회원카드, Wi-Fi·센트리 USB) / 서드파티 계정 연동(TeslaMate·Tessie·Teslascope) |
| **충전** | 충전소 지도(실시간) / 충전기 종류와 어댑터 / 결제·등록 방식 / 충전 앱 |
| **준비물** | 운행에 필요한 용품. 우선순위 필터 |
| **커뮤니티** | 최신 뉴스 피드(실시간) / 커뮤니티 링크 / 공식 바로가기 |

## 실행

```bash
npm install
npm run dev
```

## 외부 데이터

| 용도 | 소스 | 키 |
| --- | --- | --- |
| 충전소 위치·상태 | [공공데이터포털 한국환경공단_전기자동차 충전소 정보](https://www.data.go.kr/data/15076352/openapi.do) (`B552584/EvCharger/getChargerInfo`) | **필요** — `.env.local`의 `EV_CHARGER_SERVICE_KEY` |
| 지도 타일 | OpenStreetMap | 불필요 |
| 뉴스 피드 | Google 뉴스 RSS | 불필요 |

키 발급 절차는 `.env.local` 주석 참고. 키가 없으면 지도는 뜨고 충전소만 안 채워지며,
화면에 발급 안내가 표시된다.

### 자동 수집에서 뺀 것

- **네이버 카페(TKC)** — RSS가 없고 로그인이 필요해 서버에서 읽을 수 없다.
- **Reddit RSS** — 서버 IP에서 403/429로 자주 막힌다(2026-08-14 직접 확인).

둘 다 커뮤니티 탭에 링크로만 둔다.

## 구조

```
src/
  app/
    api/chargers/route.ts   공공데이터포털 프록시 (키 은닉 + CORS 우회, 5분 캐시)
    api/feed/route.ts       Google 뉴스 RSS 파싱 (15분 캐시)
    components/             ChargingMap · ChargingBoard · AppsBoard · GearBoard · FeedBoard
    globals.css             다크 콕핏 디자인 시스템
  data/
    charging.ts             충전기/상태 코드, 어댑터, 결제 경로, 지역 프리셋
    apps.ts                 앱 목록, 필수 연동 절차, 서드파티 도구 + Fleet API 현황
    gear.ts                 준비물
    community.ts            피드 주제, 커뮤니티 링크
```

데이터는 전부 `src/data/*.ts`에 있다. 내용을 고칠 일이 생기면 컴포넌트가 아니라 여기를 본다.

## 표기 원칙

`공식` / `커뮤니티` / `확인필요` 배지로 근거 수준을 구분한다.
공식은 테슬라·정부 공식 문서로 확인한 사실, 커뮤니티는 오너 후기 기반 추정,
확인필요는 아직 공식 확인이 안 된 항목이다. 가격·기간은 대부분 범위 추정치다.
