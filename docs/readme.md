# 3rdPlace Lab 기획안 v0.4

## 48팀 포맷 시나리오 계산기 — “3rdPlace Lab”

## 1) 제품 목표 재정의

### 핵심 문제

- 48팀 포맷(12개 조)에서 “**3위 12팀 중 상위 8팀**”이 올라가며,
- 그 조합에 따라 **32강 대진(Annex C 매핑)**이 바뀌기 때문에 팬들이 혼란.

### 해결

- 유저가 조별리그 **전체 경기(72경기)**를 스코어/승무패로 입력하며 what‑if 시나리오를 만들면,
    1. 조 순위(규정 타이브레이커 포함)
    2. 3위 12팀 통합 랭킹 + 8위 컷라인
    3. 32강 브래킷(placeholder → 확정 매치업 자동 전환)
- 을 즉시 계산/표시.

---

## 2) 사용자/사용 흐름

### 대회 시작 전(Pre‑tournament)

- 공식 결과 없음 → 모든 경기 `Scheduled`
- 유저가 72경기 모두 입력 가능
- 입력이 부족하면(몇 경기 비어있음) 순위/3위/브래킷은 “진행중/미확정” 상태로 표시

### 대회 진행 중(Live Simulation)

- 일부 경기는 `officialResult`로 고정(잠금)
- 남은 경기는 유저가 시뮬레이션 입력

### 공식 결과 반영 방식 (MVP)

- 자동 연동은 후순위
- MVP는 `official_results.json`을 **수동 업데이트(배포로 반영)**해도 충분

---

## 3) 화면(IA) 확정안

디자인 시안 기반으로, “웹 대시보드” 구조로 고정하되 추후 변경 가능.

1. **Overview (대시보드)**
    - 12개 조 요약 카드 + 현재 3위 컷라인 요약 + 브래킷 프리뷰
2. **Simulator (경기 입력)**
    - 그룹 탭(A~L) + 경기 입력 리스트 + 실시간 조 순위/3위 영향 표시
3. **Group Standings**
    - 12개 조 전체 순위표(동률/타이브레이커 적용 안내 포함)
4. **3rd Place Lab (핵심 USP)**
    - 12개 조 3위 통합 랭킹 + 8위 컷라인 + 상태 배지 + 영향 경기 하이라이트
5. **Round of 32**
    - 브래킷 전용 화면 (UNRESOLVED placeholder ↔ RESOLVED 확정)
    - Export: PNG / Print(PDF)
6. **Scenarios**
    - 저장된 시나리오 관리(local) + 공유 링크 생성
7. **Rules / About**
    - 규정 근거/면책/출처(신뢰 확보 + 광고 운영에도 도움)

> MVP에서는 로그인/프로필 화면 없음(완전 무서버 운영)
> 

---

## 4) 시스템 아키텍처(무서버/정적 호스팅)

### 목표

- 서버 없이(정적 호스팅)도:
    - 계산/시뮬레이션
    - 저장/공유
    - 브래킷 생성
    - 내보내기(PNG/PDF)
    - 광고 삽입(AdSense)
        
        를 가능하게.
        

### 구성

- **Frontend SPA** (React + Vite 또는 Next.js static export)
- **Pure TS Core Engine** (규정 계산 로직)
- **Tournament Data Pack(JSON)** (조/팀/경기/매핑 데이터)
- **Scenario Storage**
    - localStorage: 자동 저장/저장 시나리오
    - URL state: 공유 링크(압축)

### “UI <-> 계산 로직” 분리 원칙(중요)

- UI는 상태 입력/표시만
- 계산은 전부 `core/`의 순수 함수로 처리(테스트 가능)

---

## 5) 데이터 구조 설계(핵심)

### 5.1 Tournament 정의(재사용 가능 설계)

`/data/tournaments/{tournamentId}/tournament.json`

```tsx
type TournamentConfig = {
  id: string;                // "fwc-2026"
  name: { ko: string; en: string };
  format: {
    groupsCount: 12;         // A~L
    teamsPerGroup: 4;
    thirdPlaceQualifiers: 8; // 12개 중 8개
  };
  groups: Array<{
    groupId: string;         // "A"..."L"
    teamIds: string[];       // length 4
  }>;
  teams: Record<string, {
    id: string;              // "USA"
    name: { ko: string; en: string };
    flagAsset: string;       // "/flags/usa.svg"
    fifaRanking?: number;    // V2 또는 데이터팩에서 제공(규정 반영)
  }>;
  // 경기 메타(시간/장소)는 optional (없어도 시뮬 가능)
  matches: MatchDef[];       // 72개
};
```

### 5.2 Match 정의

```tsx
type MatchDef = {
  matchId: string;          // "A-M1" 같은 규칙적인 ID (중요)
  groupId: string;          // "A"
  homeTeamId: string;
  awayTeamId: string;
  kickoffUtc?: string;
  venue?: string;
  matchDay?: 1 | 2 | 3;
};
```

> “스크래핑”은 MVP에선 비추천.
> 
> 
> 이유: 사이트 구조/정책/변경 리스크가 큼.
> 
> 대신:
> 
> - 조별 매치업은 규정 패턴으로 생성 가능(자동 생성 스크립트)
> - 킥오프/도시 같은 메타는 필요하면 **데이터팩 JSON을 수동/반자동으로 업데이트**(커밋/배포)

### 5.3 공식 결과 / 시나리오 결과(2중 레이어)

`/data/tournaments/{id}/official_results.json`

```tsx
type OfficialResults = Record<string /*matchId*/, {
  home: number;
  away: number;
  status: "final";          // final만 잠금
  updatedAtUtc?: string;
}>;
```

사용자 시나리오 상태(브라우저에 저장 / URL 공유):

```tsx
type ScenarioState = {
  v: number;                 // schema version
  tournamentId: string;
  title?: string;
  // matchId -> score (only overrides / filled matches)
  results: Record<string, { home: number; away: number }>;
  // optional advanced:
  fairPlay?: Record<string /*teamId*/, number>; // V2
  createdAt: number;
  updatedAt: number;
};
```

### 5.4 “실제로 계산에 쓰는 결과” 규칙

- `effectiveResult(matchId) = scenario.results[matchId] ?? official[matchId] ?? null`
- UI 잠금 규칙:
    - `official[matchId]?.status === "final"`이면 기본 잠금
    - 단, “Override 토글” 켜면 scenario로 덮어쓰기 가능(경고 표시)

---

## 6) 코어 엔진 설계(순수 함수)

폴더 구조 예시:

```
src/
  core/
    types.ts
    results.ts              // effectiveResult merge
    standings/
      calcGroupTable.ts
      tieBreaker.ts
      explainTieBreak.ts
    thirdplace/
      rankThirdPlaces.ts
    bracket/
      bracketTemplate.ts    // placeholder 슬롯 정의
      annexCMapping.ts      // 495조합 lookup
      resolveRoundOf32.ts
    validate/
      validateDataPack.ts
  ui/...
```

### 6.1 조 순위 계산

입력: 그룹, 경기 결과(effective)

출력: standings table + tie-break explanation

```tsx
type StandingRow = {
  teamId: string;
  played: number;
  win: number; draw: number; loss: number;
  gf: number; ga: number; gd: number;
  pts: number;
};

type GroupStandings = {
  groupId: string;
  rows: StandingRow[]; // sorted
  tieBreakNotes?: Array<{
    teams: string[];
    reason: string;     // "Head-to-head applied", "GD applied" 등
  }>;
  complete: boolean;    // 해당 조 6경기 모두 결과가 있는지
};
```

**중요 포인트**

- “완전 FIFA 동일” 목표이므로, tie-break는 단계별로 설계(최소한 엔진 구조는 열어두기)
- MVP라도 “규정 단계”를 코드 구조로 반영해두면(중간 단계가 빈 값이어도) 나중에 확장 쉬움

### 6.2 3위 12팀 랭킹 + 컷라인

```tsx
type ThirdPlaceEntry = {
  groupId: string;
  teamId: string;
  pts: number; gd: number; gf: number;
  // optional: fairPlay, fifaRanking
};
type ThirdPlaceRanking = {
  entries: ThirdPlaceEntry[]; // sorted
  cutIndex: 7; // 0-based (8th)
  complete: boolean; // 모든 조의 3위가 확정 가능한 수준인지
};
```

추가로 UI용 “상태 배지” 계산:

- Likely / On the edge / Unlikely는 확률이 아니라 **휴리스틱**(문서화해서 논쟁 방지)
- 예: 8위 대비 승점 차, 득실 차로 분류

### 6.3 32강 브래킷(placeholder → 확정)

브래킷은 2단계를 반드시 지원:

- **UNRESOLVED (B표기)**: “1A vs Best 3rd (C/E/F/H/I)”
- **RESOLVED (A확정)**: “Mexico(1A) vs Japan(3E)” (시나리오 확정 결과)

구조:

```tsx
type BracketMatch = {
  matchId: string; // "R32-01"...
  slotLabel: string; // 항상 존재: "1A vs 3 C/E/F/H/I"
  resolved?: {
    homeTeamId: string;
    awayTeamId: string;
    homeLabel: string; // "Mexico (1A)"
    awayLabel: string; // "Japan (3E)"
    mappingKey?: string; // "ABEF..." (선택)
  };
  status: "unresolved" | "resolved";
};
type RoundOf32 = {
  matches: BracketMatch[];
  status: "unresolved" | "partial" | "resolved";
};
```

- *Annex C 매핑 데이터(495 조합)**는 로직이 아니라 **lookup table**로 처리:
- key: “3위로 올라온 조들의 집합” (예: `"ABEFGHIJ"`)
- value: 각 슬롯(1A,1B,…)에 어떤 3위 조가 붙는지

개발 방식 추천:

- `annexC.csv`(사람이 보기 좋음) → build script로 `annexC.json` 생성
- `resolveRoundOf32()`는 `(mappingKey) -> assignments`만 수행

---

## 7) 상태 관리/라우팅/캐싱(프론트 설계)

### 라우팅(화면)

- `/` Overview
- `/simulator`
- `/standings`
- `/thirdplace`
- `/roundof32`
- `/scenarios`
- `/rules`

### 앱 전역 상태(AppState)

최소 상태만 들고, 나머지는 “파생 계산(derived)”로 만든다.

```tsx
type AppState = {
  tournamentId: string;
  scenario: ScenarioState;
  official: OfficialResults; // 로드된 데이터팩(정적)
  ui: {
    selectedGroupId?: string;
    selectedTeamId?: string;
    overrideEnabled?: boolean;
    lang: "ko" | "en";
  };
};
```

### 파생 데이터(Selector)

- `getEffectiveResults(state)`
- `getAllGroupStandings(state)`
- `getThirdPlaceRanking(state)`
- `getRoundOf32(state)`

**장점**

- UI 교체해도 로직 재사용
- 테스트가 쉬움
- 성능 최적화(memoization) 가능

---

## 8) 저장/공유 설계

### 8.1 localStorage 정책

- `3plab:{tournamentId}:autosave` : 마지막 편집 상태
- `3plab:{tournamentId}:scenarios` : 시나리오 목록(메타 + 본문)

자동 저장:

- 입력 후 300~800ms debounce로 저장(과한 쓰기 방지)

마이그레이션:

- `scenario.v`로 버전 관리해서 스키마 변경 대비

### 8.2 URL 공유(압축)

URL에 들어갈 것만 최소화:

- tournamentId
- results map(입력된 경기만)
- v

예시:

- `/simulator#s=COMPRESSED_PAYLOAD`

압축은 라이브러리로 처리(예: lz-string/pako 등).

복원 실패 시 “버전 불일치/손상” 안내.

---

## 9) Export(브래킷 저장) 설계

브래킷 화면에 2개 버튼 제공:

1. **Download PNG**
- Export mode: 광고/버튼/입력 UI 숨기고 브래킷만 렌더
- 2x 해상도 토글
1. **Print / Save as PDF**
- print CSS로 브래킷만 출력되게 구성

> 이건 MVP에도 넣기 좋고, 커뮤니티 확산(스크린샷 공유)에 매우 도움 됨.
> 

---

## 10) 광고(AdSense) 삽입 계획

- MVP에서는 “광고 슬롯 위치”만 디자인에 반영해도 충분
- 실제 AdSense는 승인 후 코드 삽입

배치 원칙:

- 스코어 입력 버튼/슬라이더 등 **오클릭 가능 영역 주변은 피함**
- Rules/About 또는 사이드 패널/하단 여백에 배치

(동의/개인화 광고 이슈는 트래픽 발생 국가에 따라 V1~V2에서 강화)

---

## 11) 테스트/검증 계획(필수)

### 단위 테스트

- 조 순위 계산:
    - 기본 케이스(승점/득실/다득점)
    - 동률 케이스(2팀, 3팀 동률)
- 3위 랭킹:
    - 컷라인 근접 케이스
- 브래킷 매핑:
    - mappingKey가 주어졌을 때 슬롯 배정이 정확한지
    - key 정렬/정규화가 안정적인지

### 데이터 검증

- tournament.json이 12조 × 4팀, matches 72개인지
- matchId 중복, 팀 중복, 그룹 불일치 체크

---

## 12) 구현 마일스톤(추천 순서)

1. 데이터팩 스키마 확정 + 샘플 tournament.json 생성
2. `core/standings` 구현 + 테스트
3. `core/thirdplace` 구현 + 테스트
4. Simulator 화면(입력 → 파생 계산 표시)
5. Bracket placeholder 템플릿 구현
6. Annex C mapping data 형태 결정(일단 소수 샘플로 end-to-end)
7. Annex C 전체 데이터화 + `resolveRoundOf32()` 완성
8. Scenarios(저장/URL 공유)
9. Export(PNG/PDF)
10. Rules/About + 광고 슬롯

---

## 13) 아직 열어둔 선택지(디자인 이후 확정)

- 입력 UX: 스코어 입력만 vs W/D/L quick mode 병행
- My Team Mode의 강도(필터 vs 하이라이트)
- “대회 재사용 템플릿”을 어디까지 일반화할지(룰/조 수까지 완전 데이터화?)