# 마이 테슬라

Model Y Premium RWD(주니퍼) 오너용 개인 허브입니다.

외부 API도, 서버 DB도, 테슬라 계정 연동도 없습니다. 정적 사이트 하나와
브라우저 localStorage가 전부입니다.

## 날짜가 두 개입니다

| 날짜 | 무슨 일 |
|---|---|
| 2026-08-14 (금) | 서류상 인수. 차는 곧바로 틴팅업체로 탁송 |
| 2026-08-14 ~ 08-17 | 틴팅 + PPF 시공(한 패키지). 차량은 업체 보관 |
| 2026-08-18 (화) | 업체에서 직접 수령. **실제 운행 시작** |

그래서 "첫 주 / 첫 달"은 인수일이 아니라 수령일(`handoverDate`)부터 셉니다.
오늘 탭 카운트다운도 단계에 따라 기준점이 바뀝니다(인수 전 → 8/14, 시공 중 → 8/18).

## 화면 구성

| 탭 | 내용 |
|---|---|
| 오늘 | D-day, 인수 전 처리 상태, 다가오는 일정, 진행률 |
| 일정 | 편집형 캘린더 + `.ics` 내보내기 + 인수 전후 흐름 |
| 할 일 | 인수 전 / 인수·탁송(8/14) / 차량 수령(8/18) / 첫 주 / 첫 달 / 정기 |
| 차량 | 화면 사용법(물리 vs 터치) · 데이터·프라이버시 · 정비 주기와 비용 |
| 장비 | 용품(용도·주의사항 중심) · 앱/프로그램 |
| 기록 | 충전·효율·정비·하자를 직접 남기는 메모 |

## 원칙

- **Model Y RWD 전용.** 다른 트림·모델 데이터는 두지 않습니다.
- **테슬라 계정 연동 없음.** TeslaMate·Tessie 같은 서드파티 로거는 쓰지 않고,
  기록은 기록 탭에 직접 남깁니다.
- **사실과 추정을 구분.** 각 항목에 `공식`/`커뮤니티` 배지를 답니다.
  공식은 테슬라 문서로 확인한 것, 커뮤니티는 오너 후기 기반 판단입니다.

## 데이터 위치

`src/data/ownership.ts` 한 파일에 전부 있습니다.

| export | 내용 |
|---|---|
| `ownership` | 인수·수령 날짜, 차량 기본 정보 |
| `deliveryFacts` | 인수 전 처리 상태 |
| `scheduleSeed` | 캘린더 기본 일정 |
| `ownerChecklist` | 6단계 체크리스트 |
| `displayGroups` | 화면 사용법 |
| `dataTopics` | 데이터·프라이버시 |
| `gearItems` | 용품 |
| `appGroups` | 앱·프로그램 |
| `maintenanceRows` | 공식 정비 주기 |
| `specs` | Model Y Premium RWD 제원 |

일정이 바뀌면 `ownership.deliveryDate` / `ownership.handoverDate` 두 값만 고치면 됩니다.

## 저장소

전부 브라우저 localStorage입니다. 기기 간 동기화는 없습니다.

| 키 | 용도 |
|---|---|
| `my-tesla-schedule-v1` | 일정 |
| `my-tesla-owner-checklist-v1` | 체크리스트 |
| `my-tesla-gear-v1` | 용품 구매 상태 |
| `my-tesla-personal-notes-v1` | 기록 메모 |

일정은 `.ics`로 내보내 캘린더 앱에 넣어두면 기기가 바뀌어도 남습니다.

## 실행

```bash
npm install
npm run dev
```

환경변수는 필요 없습니다.

## 문서

- [알리 액세서리 조사](docs/ali-accessories.md) — 용품 데이터의 근거
- [모델 Y 프리미엄 RWD 조사](docs/model-y-premium-rwd.md) — 제원·가격 근거
