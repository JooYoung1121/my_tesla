# 디스코드 입항 알림

평택항 테슬라 후보 선박을 디스코드 채널로 알린다. 봇이 아니라 **웹훅** 방식이라 서버·토큰 관리가 필요 없다.

## 동작 방식

- `GET /api/port/notify` — Vercel Cron이 **매일 09:00 KST**(`vercel.json`의 `0 0 * * *` UTC)에 호출.
  **주목할 후보**(내 입항 구간과 겹치거나, 7일 내 입항하는 가능성 중간 이상)가 있을 때만 발송한다. 없으면 조용히 skip — 빈 알림이 매일 오지 않는다.
- `POST /api/port/notify` — 사이트의 "디스코드로 보내기" 버튼. 후보가 없어도 현재 상태를 강제 발송한다.
- 메시지: 내 예상 입항 구간 + 후보 선박 최대 10척(선박명, 입항일시·D-day, 출발항→선석, 판정 근거).

## 설정 (1회)

1. 디스코드에서 알림 받을 채널 → **채널 편집 > 연동 > 웹후크 > 새 웹후크** → 이름 정하고 **웹후크 URL 복사**.
2. 환경변수 등록:
   - 로컬: `.env.local`에 `DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...`
   - Vercel: 프로젝트 Settings > Environment Variables에 같은 값 등록 후 재배포.
3. (선택) 크론 엔드포인트 보호: Vercel 환경변수에 `CRON_SECRET` 등록. 등록하면 Vercel Cron이 자동으로 `Authorization: Bearer <CRON_SECRET>`을 붙이고, 외부의 무단 GET 호출은 401로 거부된다.

## 테스트

```bash
# 강제 발송 (웹훅 URL이 설정돼 있어야 함)
curl -X POST http://localhost:3000/api/port/notify

# 크론 조건 확인 (주목할 후보 없으면 sent:false 반환)
curl http://localhost:3000/api/port/notify
```

## 왜 봇이 아니라 웹훅인가

- 단방향 알림만 필요해서 웹훅으로 충분하다. 봇은 토큰 관리, 게이트웨이 연결, 호스팅이 추가로 필요하다.
- 나중에 양방향(명령어로 조회 등)이 필요해지면 그때 봇으로 확장한다.

## 한계

- Vercel 무료 플랜 크론은 하루 1회 트리거 정밀도가 시간 단위라 09:00 정각에서 몇 분 밀릴 수 있다.
- "새로 신고된 배만" 알리는 중복 제거는 상태 저장소(KV/DB)가 없어 미구현. 대신 하루 1회 다이제스트 + 주목 후보 필터로 노이즈를 줄였다.
