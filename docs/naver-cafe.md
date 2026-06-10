# 네이버 카페 수집 메모

최종 업데이트: 2026-06-10

## 결론

네이버 공식 API만 기준으로 보면, 카페 글은 “공개 게시판 글 검색”까지만 안정적으로 가져올 수 있다.

가입한 카페의 회원 전용 글, 특정 게시판 전체 목록, 전체 최신 글 피드, 댓글, 첨부파일을 공식 읽기 API로 가져오는 방식은 확인되지 않았다.

## 공식 API로 가능한 것

네이버 검색 API의 카페글 검색은 네이버 카페의 공개 게시판 글을 검색한 결과를 반환한다.

가능한 데이터:

- 제목
- 링크
- 요약
- 카페명
- 카페 URL

요청 파라미터:

- `query`
- `display`
- `start`
- `sort`

중요한 제한:

- 비로그인 방식 오픈 API다.
- 클라이언트 아이디와 시크릿이 필요하다.
- 하루 호출 한도는 검색 API 기준 25,000회다.
- 특정 카페만 지정하는 공식 파라미터는 문서상 확인되지 않았다.
- 따라서 전체 검색 결과를 가져온 뒤 `cafeurl` 값으로 후처리 필터링하는 방식이 현실적이다.

공식 문서:

- https://developers.naver.com/docs/serviceapi/search/cafearticle/cafearticle.md

## 공식 API로 어려운 것

다음은 공식 카페글 검색 API만으로는 어렵다.

- 특정 카페의 전체 최신글 목록 가져오기
- 특정 카페의 특정 게시판 전체 글 가져오기
- 회원 전용 글 가져오기
- 로그인한 내 계정 기준으로 가입 카페 글 읽기
- 댓글과 첨부파일까지 안정적으로 가져오기

네이버 로그인 기반 카페 API는 카페 가입과 글쓰기 중심이다. 읽기 API로 보기는 어렵다.

공식 문서:

- https://developers.naver.com/docs/login/cafe-api/cafe-api.md

## 감시할 카페

### 테슬라 [TKC]

- URL: https://cafe.naver.com/noljatravel
- 모바일 URL: https://m.cafe.naver.com/noljatravel
- slug: `noljatravel`
- clubId: `26681849`
- 제목: `★테슬라 [TKC] 모델S 모델3 모델X 모델Y 사이버트럭 FSD 전기차`

### 테슬라 슈퍼 클럽

- URL: https://cafe.naver.com/shootgoal
- 모바일 URL: https://m.cafe.naver.com/shootgoal
- slug: `shootgoal`
- clubId: `10699343`
- 제목: `★테슬라 슈퍼 클럽 - 모델Y 주니퍼 모델3 하이랜드 사이버트럭`

## 추천 구현 방식

1. 네이버 개발자 센터에서 검색 API 앱을 만든다.
2. Vercel 환경변수에 `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET`를 저장한다.
3. 서버 API 라우트에서 카페글 검색 API를 호출한다.
4. 검색어는 `모델Y 썬팅`, `모델Y 보험`, `테슬라 충전카드`, `모델Y 인수`처럼 관리한다.
5. 응답의 `cafeurl`이 감시 대상 카페와 일치하는 결과만 우선 저장한다.
6. 저장한 글에 태그, 중요도, 메모, 읽음/숨김 상태를 붙인다.

## 주의

로그인 세션을 이용한 크롤링은 구현 자체는 가능할 수 있지만 안정성과 약관, 계정 보호 측면에서 위험하다. 이 프로젝트는 공식 API와 공개 검색 결과를 우선 사용한다.
