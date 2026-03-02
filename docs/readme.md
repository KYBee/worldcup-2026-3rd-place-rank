# 3rdPlace Lab — Data Pack (샘플) & MVP 화면 정의

이 폴더는 **3rdPlace Lab**의 무서버/정적 호스팅 아키텍처를 전제로 한 **데이터팩(Data Pack) 샘플**입니다.  
현재 포함된 팀/조/일정은 **placeholder(가짜 데이터)** 이며, 실제 2026 월드컵 공식 데이터(48팀/조 편성/경기 일정)가 확보되면 교체하는 구조입니다.

---

## 1) MVP에서 “반드시 있는” 화면(웹)

아래 4개 화면이 **최소 제품(MVP)** 기준 핵심 화면입니다.

### A. 조별 구성 보기 (Groups View)
- 각 조(A~L)의 **팀 구성**을 한눈에 보여줍니다.
- 팀명/국기(에셋) 표시
- 조 클릭 시 해당 조 상세(팀 4개 + 그 조 경기들로 이동)

> 이 화면은 `tournament.json`의 `groups[]`, `teams{}`만으로 구성됩니다.

### B. 경기 일정 보기 (Schedule View)
- 조별리그 **전체 경기 목록(72경기)**를 날짜/시간 기준으로 보여줍니다.
- 필터: 날짜, 조(A~L), 팀 검색
- 각 경기의 킥오프 시간(`kickoffUtc`)과 장소(`venue`)는 **있으면 표시**, 없으면 숨김/대체 문구.

> 이 화면은 `tournament.json`의 `matches[]`(특히 `kickoffUtc`, `venue`)를 사용합니다.  
> ※ MVP에서는 스크래핑보다 “데이터팩 JSON 업데이트(커밋/배포)” 방식이 안정적입니다.

### C. 스코어 입력(시뮬레이터) (Simulator View)
- 경우의 수 입력기: 유저가 **조별로 경기 스코어를 입력**합니다.
- 기본 상태(대회 시작 전): 모든 경기는 입력 가능(locked 없음)
- 대회 진행 중: `official_results.json`에 `final`로 들어간 경기는 기본 잠금(Override 토글로만 변경 가능)

> 사용자는 여기서 입력한 결과로 **조 순위 + 3위 12팀 랭킹 + 32강**을 즉시 계산합니다.

### D. 32강 브래킷 보기 (Round of 32 View)
- 최종 목표 화면: 32강 매치업을 보여줍니다.
- 각 매치 카드에 **2단계 표기**를 권장합니다.
  1) UNRESOLVED (placeholder): “1A vs Best 3rd (C/E/F/H/I)” 같은 슬롯 라벨
  2) RESOLVED (scenario): 시나리오가 완성되면 “Mexico(1A) vs Japan(3E)”처럼 팀명으로 확정 표시
- 내보내기:
  - **Download PNG** (커뮤니티 공유용)
  - **Print / Save as PDF** (문서/저장용)

> 32강 매핑은 `annexC.json`(Annex C lookup table)을 통해 결정됩니다.

---

## 2) “처음에는 다 0”에 대한 처리 원칙

- UI 입력칸에는 `0 - 0`처럼 기본값이 보일 수 있지만,
- 계산 로직에서 **“미입력 경기(null)”** 과 **“0-0 무승부 확정”**는 완전히 다릅니다.

권장 구현:
- 내부적으로는 결과를 기본 `null`로 두고,
- 사용자가 저장/적용하는 순간에만 `{home:0, away:0}` 같은 스코어가 결과로 기록되도록 합니다.

---

## 3) 포함 파일

### `tournaments/fwc-2026/tournament.json`
- (샘플) 48팀(placeholder) / 12개 조(A~L) / 조별 72경기 정의
- 실제 운영 시, 여기에 **공식 팀/조/일정(날짜/시간 포함)**을 반영합니다.

### `tournaments/fwc-2026/official_results.json`
- (기본) `{}` 빈 파일 = “대회 시작 전” 상태
- 대회 진행 중에는, 끝난 경기만 `final`로 채워서 **잠금/고정 결과**로 사용합니다.

### `tournaments/fwc-2026/official_results.example.json`
- 스키마 예시(잠금 경기 1개 포함)

### `tournaments/fwc-2026/annexC.sample.json`
- **SAMPLE ONLY — 실제 FIFA Annex C가 아닙니다.**
- 파이프라인(키 생성 → 슬롯 매핑 → 브래킷 반영) 연결을 위한 더미 데이터입니다.
- 실제 서비스에서는 FIFA 규정의 Annex C 표를 추출해 `annexC.json`으로 교체합니다.

### `src/core/types.ts`
- UI/로직 분리를 위한 핵심 TypeScript 타입 모음

---

## 4) Match ID 규칙(샘플)

이 샘플은 matchId를 다음과 같이 부여합니다:

- `A-M1..A-M6` (Group A 6경기)
- ...
- `L-M1..L-M6` (Group L 6경기)

> 실제 데이터팩에서도 **matchId는 절대 바뀌지 않는 키**로 유지하는 것을 강력 추천합니다.  
> (official 결과/시나리오 저장/URL 공유가 모두 matchId를 키로 삼기 때문)

---

## 5) Export-to-image(PNG) 주의사항

브래킷을 DOM → PNG로 내보낼 때, 국기/로고 같은 이미지가 외부 도메인(CORS 미허용)에서 로드되면
캔버스가 “tainted”되어 내보내기가 실패할 수 있습니다.

권장:
- 가능하면 국기/로고 에셋을 **같은 도메인에서 서빙(프로젝트 빌드에 포함)**하세요.
