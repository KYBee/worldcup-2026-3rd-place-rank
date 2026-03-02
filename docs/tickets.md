# 3rdPlace Lab Tickets (Updated from current docs/readme.md)

## Scope Snapshot
- MVP 화면은 `Groups View`, `Schedule View`, `Simulator View`, `Round of 32 View` 4개
- 데이터팩 중심 운영: `tournament.json`, `official_results.json`, `official_results.example.json`, `annexC.sample.json`
- 핵심 규칙: `null(미입력)`와 `0-0(확정)` 구분, `official final` 잠금+override, Annex C lookup

## Status Rules
- `todo`: not started
- `doing`: in progress
- `done`: complete
- `blocked`: waiting on dependency or decision

## Tickets
| ID | Status | Priority | Area | Title | Depends On | Owner |
| --- | --- | --- | --- | --- | --- | --- |
| T-001 | todo | P0 | AppShell | React+Vite+TS 프로젝트 부트스트랩 및 기본 라우팅(`/groups`,`/schedule`,`/simulator`,`/roundof32`) 구성 | - | - |
| T-002 | todo | P0 | Architecture | `src/core`,`src/ui`,`data/tournaments/fwc-2026` 디렉터리 구조 고정 | T-001 | - |
| T-003 | todo | P0 | Quality | ESLint/Prettier/Vitest 및 npm scripts 설정 | T-001 | - |
| T-004 | todo | P0 | CoreTypes | readme 기준 타입 정의(`TournamentConfig`,`MatchDef`,`OfficialResults`,`ScenarioState`) | T-002 | - |
| T-005 | todo | P0 | DataPack | `tournament.json` 샘플 작성(48팀/12조/72경기, placeholder 데이터) | T-004 | - |
| T-006 | todo | P0 | DataPack | `official_results.json` 기본 빈 객체 파일 생성 및 로더 연동 | T-004 | - |
| T-007 | todo | P0 | DataPack | `official_results.example.json` 스키마 예시 파일 생성 | T-006 | - |
| T-008 | todo | P0 | DataPack | `annexC.sample.json` 더미 lookup 파일 생성(파이프라인 연결용) | T-004 | - |
| T-009 | todo | P0 | Validation | `tournament.json` 검증기(팀 수/조 수/경기 수/팀 참조 무결성) 구현 | T-005 | - |
| T-010 | todo | P0 | Validation | `matchId` 패턴/중복 검증(`A-M1..L-M6`) 구현 | T-005 | - |
| T-011 | todo | P0 | Results | 결과 병합 함수 구현(`scenario ?? official ?? null`) | T-004,T-006 | - |
| T-012 | todo | P0 | Results | `null` vs `0-0` 구분 상태 모델 및 serializer 구현 | T-011 | - |
| T-013 | todo | P0 | Standings | 조 순위 계산 엔진 구현(pts/gd/gf/played) | T-011 | - |
| T-014 | todo | P0 | Standings | 동률 타이브레이커 단계형 처리 구현 | T-013 | - |
| T-015 | todo | P0 | ThirdPlace | 12개 조 3위 추출 및 통합 랭킹 계산 구현 | T-014 | - |
| T-016 | todo | P0 | Bracket | 32강 슬롯 템플릿 구현(UNRESOLVED label) | T-004 | - |
| T-017 | todo | P0 | Bracket | Annex C lookup 기반 `resolveRoundOf32` 구현 | T-008,T-015,T-016 | - |
| T-018 | todo | P1 | Bracket | 브래킷 상태 계산(`unresolved/partial/resolved`) 구현 | T-017 | - |
| T-019 | todo | P0 | Selectors | 파생 selector 계층 구현(standings/thirdplace/roundof32/effectiveResults) | T-013,T-015,T-017 | - |
| T-020 | todo | P0 | State | 앱 전역 상태 구성 및 selector 연동 | T-019 | - |
| T-021 | todo | P0 | GroupsView | Groups 화면 구현(A~L 팀 구성, 팀명/국기 표시) | T-005,T-020 | - |
| T-022 | todo | P0 | GroupsView | 조 클릭 시 상세 뷰(팀 4개 + 해당 조 경기 목록) 구현 | T-021 | - |
| T-023 | todo | P0 | ScheduleView | 72경기 일정 리스트 구현(시간순 정렬, kickoff/venue optional 표시) | T-005,T-020 | - |
| T-024 | todo | P0 | ScheduleView | 일정 필터 구현(날짜/조/팀 검색) | T-023 | - |
| T-025 | todo | P0 | SimulatorView | 조별 스코어 입력 UI 구현(입력 전 null 유지) | T-012,T-020 | - |
| T-026 | todo | P0 | SimulatorView | `official final` 잠금 처리 및 override 토글 구현 | T-006,T-025 | - |
| T-027 | todo | P0 | SimulatorView | 입력 즉시 조순위+3위랭킹+32강 계산 반영 | T-019,T-025 | - |
| T-028 | todo | P0 | RoundOf32View | R32 화면 구현(UNRESOLVED/RESOLVED 2단계 표기) | T-017,T-018,T-020 | - |
| T-029 | todo | P1 | RoundOf32View | 모바일/태블릿 반응형 브래킷 레이아웃 구현 | T-028 | - |
| T-030 | todo | P1 | Export | 브래킷 PNG 다운로드 구현 | T-028 | - |
| T-031 | todo | P1 | Export | Print / Save as PDF 출력 레이아웃 구현 | T-028 | - |
| T-032 | todo | P1 | Assets | 국기/로고 에셋 로컬 서빙 경로 표준화(CORS taint 예방) | T-021,T-030 | - |
| T-033 | todo | P0 | Test | core 단위 테스트(results/standings/thirdplace/bracket) | T-017 | - |
| T-034 | todo | P0 | Test | 데이터팩 검증 테스트(tournament/official/annexC/matchId) | T-010 | - |
| T-035 | todo | P1 | Test | 화면 통합 테스트(Groups/Schedule/Simulator/R32 핵심 플로우) | T-028 | - |
| T-036 | todo | P1 | Verification | 수동 검증 시나리오 정리(null-vs-0-0, final 잠금, override, R32 resolve) | T-026,T-027,T-028 | - |
| T-037 | todo | P1 | DevOps | 정적 빌드/배포 파이프라인 설정 | T-003 | - |
