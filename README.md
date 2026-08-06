# 마이 테슬라

테슬라 모델 Y(주니퍼) 오너 생활을 위한 개인용 허브입니다.

인수 확정에 맞춰 사이트 축을 "인수 전 정보 수집"에서 "인수 전후 실행"으로
개편했습니다. 인수 전 전용 기능(입항 추적, 인도일 추정, 보조금 계산기)은
삭제하지 않고 **기록 > 인수 전 아카이브**로 접어 보관합니다.

**날짜가 두 개입니다.**

| 날짜 | 무슨 일 |
|---|---|
| 2026-08-14 (금) | 서류상 인수. 차는 곧바로 틴팅업체로 탁송 |
| 2026-08-14 ~ 08-17 | 틴팅 시공. 차량은 업체 보관 |
| 2026-08-18 (화) | 업체에서 직접 수령. **실제 운행 시작** |

그래서 "첫 주 / 첫 달"은 인수일이 아니라 수령일(`handoverDate`)부터 셉니다.
오늘 탭의 카운트다운도 단계에 따라 기준점이 바뀝니다(인수 전 → 8/14, 시공 중 → 8/18).

이 레포는 테슬라 공식 앱을 대체하지 않습니다.

## 화면 구성

| 탭 | 내용 |
|---|---|
| 오늘 | D-day, 인수 전 처리 상태, 다가오는 일정, 진행률 |
| 일정 | 편집형 캘린더(localStorage) + `.ics` 내보내기 + 인수 전후 흐름 |
| 할 일 | 인수 전 / 인수·탁송(8/14) / 차량 수령(8/18) / 첫 주 / 첫 달 / 정기 체크리스트 |
| 차량 | 화면 사용법(물리 vs 터치) · 데이터·프라이버시 · 정비 주기와 비용 |
| 장비 | 용품(용도·주의사항 중심) · 앱/프로그램 |
| 기록 | 내 메모 · 카페 검색 · 테슬라 기초 · 인수 전 아카이브 |

## 데이터 위치

- `src/data/ownership.ts` — 인수 후 데이터(일정 시드, 오너 체크리스트, 용품, 앱, 화면 사용법, 데이터·프라이버시, 정비 주기, TeslaMate 설치 단계)
- `src/data/home.ts` — 인수 전 데이터(리드타임 통계, 보조금 설정, 인수 전 체크리스트 등). 아카이브에서만 사용
- `src/data/shipment.ts` — PORT-MIS 입항 추적 설정·분류 로직. 아카이브에서만 사용

일정이 바뀌면 `src/data/ownership.ts`의 `ownership.deliveryDate` / `ownership.handoverDate`
두 값만 고치면 전 화면에 반영됩니다.

## 저장소

일정·체크리스트·용품 상태·메모는 모두 브라우저 localStorage에 저장됩니다.
서버 DB는 없습니다. 다른 기기와 공유하려면 일정 탭의 `.ics` 내보내기를 씁니다.

| 키 | 용도 |
|---|---|
| `my-tesla-schedule-v1` | 일정 |
| `my-tesla-owner-checklist-v1` | 오너 체크리스트 |
| `my-tesla-checklist-v1` | 인수 전 체크리스트(아카이브) |
| `my-tesla-gear-v1` | 용품 구매 상태 |
| `my-tesla-personal-notes-v1` | 개인 메모 |

## 환경변수 (`.env.local`)

| 키 | 용도 |
|---|---|
| `NAVER_CLIENT_ID` / `NAVER_CLIENT_SECRET` | 네이버 카페 공개글 검색 API |
| `PORTMIS_SERVICE_KEY` | 해수부 PORT-MIS 선박운항정보 오픈API (아카이브 전용) |

> 디스코드 입항 알림(`DISCORD_WEBHOOK_URL`, `/api/port/notify`, Vercel Cron)은
> 2026-08-05에 완전히 제거했습니다. 배포 환경에 환경변수가 남아 있다면 지워도 됩니다.

## 실행

```bash
npm install
npm run dev
```

## 문서

- [전략 문서](docs/strategy.md)
- [TeslaMate 설명](docs/teslamate.md)
- [테슬라 기초 지식](docs/tesla-basics.md)
- [알리 액세서리 조사](docs/ali-accessories.md)
- [네이버 카페 수집 메모](docs/naver-cafe.md)
- [모델 Y 프리미엄 RWD 구매 조사](docs/model-y-premium-rwd.md)
- [외부 입항 추적 서비스 조사](docs/tracker-apps.md) — 아카이브 참고용
