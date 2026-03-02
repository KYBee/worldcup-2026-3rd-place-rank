# 3rdPlace Lab Tickets (Current README Baseline)

## Goal
- 최종 목표: 모든 핵심 기능이 실제로 동작하는 상태로 배포 가능하게 만든다.
- 기준 문서: [docs/readme.md](/Users/kybee/dev/projects/world-cup-3rd/docs/readme.md)
- 핵심 기능 완료 정의:
  - 조별 리그 순위 계산 + FIFA 타이브레이커 동작
  - Schedule/Simulator 검색(영문/한글, 부분 일치) 동작
  - 32강 대진 자동 생성 동작
  - 16강/8강/4강/결승 자동 전진 동작
  - 브래킷 뷰어 UI에서 결과 확인 가능

## Assumptions
- `data/team.json`의 `fifaRanking`을 공식 비교 기준으로 사용한다.
- 페어플레이는 기본 비활성(README의 optional 항목으로 취급)이며, 확장 포인트만 남긴다.
- 경기 식별자는 `matchId`를 절대 키로 사용한다.
- 검색은 `team.en`, `team.ko` 모두 대상으로 부분 일치 처리한다.

## Status Rules
- `todo`: not started
- `doing`: in progress
- `done`: complete
- `blocked`: waiting on dependency or decision

## Ticket Board
| ID | Status | Priority | Area | Title | Depends On | Owner |
| --- | --- | --- | --- | --- | --- | --- |
| T-001 | done | P0 | Setup | 앱 초기 구조 생성 및 기본 라우팅 골격 구성 | - | - |
| T-002 | done | P0 | Setup | 디렉터리 구조 고정(`src/core`,`src/ui`,`src/pages`,`src/data`) | T-001 | - |
| T-003 | done | P0 | Data | 데이터 타입/스키마 정의(`team/group/schedule/result`) | T-002 | - |
| T-004 | done | P0 | Data | `data/*.json` 로더 및 런타임 정규화 계층 구현 | T-003 | - |
| T-005 | done | P0 | Data | 데이터 무결성 검증기 구현(팀/조/72경기/참조 일치) | T-004 | - |
| T-006 | done | P0 | Quality | 테스트/린트/포맷 명령 구성 | T-001 | - |
| T-007 | done | P0 | State | 앱 상태 모델 설계(입력 결과, 계산 결과, 화면 상태) | T-003 | - |
| T-008 | done | P0 | State | `null(미입력)` vs `0-0(확정)` 분리 저장 모델 구현 | T-007 | - |
| T-009 | done | P0 | Engine | 경기 결과 반영 기본 집계(pts/gf/ga/gd/w/d/l) 구현 | T-008 | - |
| T-010 | done | P0 | Engine | Head-to-head 통계 집계 로직 구현 | T-009 | - |
| T-011 | done | P0 | Engine | FIFA 타이브레이커 comparator 구현(H2H→Overall→Ranking) | T-010 | - |
| T-012 | done | P0 | Engine | 그룹별 최종 순위 산출 엔진 구현(A~L) | T-011 | - |
| T-013 | done | P0 | Engine | 3위 12팀 랭킹 및 상위 8팀 컷 산출 구현 | T-012 | - |
| T-014 | done | P0 | Engine | Schedule/Simulator 공용 검색 인덱스 구현(ko/en 부분일치) | T-004 | - |
| T-015 | done | P0 | Engine | Schedule 필터 엔진 구현(날짜/조/팀 검색) | T-014 | - |
| T-016 | done | P0 | Engine | 32강 슬롯 설정(JSON) 모델 및 로더 구현 | T-003 | - |
| T-017 | done | P0 | Engine | 32강 대진 생성기 구현(조1/조2/상위3위 배치) | T-013,T-016 | - |
| T-018 | done | P0 | Engine | 16강~결승 자동 전진 엔진 구현(matchId 승자 기반) | T-017 | - |
| T-019 | done | P0 | Engine | 시뮬레이션 재계산 파이프라인 구현(입력 변경 즉시 반영) | T-012,T-013,T-017 | - |
| T-020 | done | P0 | UI | 공통 레이아웃/네비게이션 구성(ui 반영) | T-001 | - |
| T-021 | done | P0 | UI | Groups View 구현(12개 조, 팀/국기 표시) | T-004,T-020 | - |
| T-022 | done | P0 | UI | Groups View에 실시간 순위표 연결 | T-012,T-021 | - |
| T-023 | done | P0 | UI | Schedule View 구현(72경기 렌더 + 날짜 구분) | T-004,T-020 | - |
| T-024 | done | P0 | UI | Schedule View 필터 UI 연결(검색/조/날짜) | T-015,T-023 | - |
| T-025 | done | P0 | UI | Simulator View 구현(조 선택 + 경기 입력 카드) | T-008,T-020 | - |
| T-026 | done | P0 | UI | Simulator 실시간 순위/3위/32강 요약 반영 | T-019,T-025 | - |
| T-027 | done | P0 | UI | Simulator 검색(영문/한글 부분 일치) 연결 | T-014,T-025 | - |
| T-028 | done | P0 | UI | Round of 32 View 구현(UNRESOLVED/RESOLVED 표기) | T-017,T-020 | - |
| T-029 | done | P0 | UI | Knockout View 확장(16강/8강/4강/결승 표시) | T-018,T-028 | - |
| T-030 | done | P0 | UI | 브래킷 수동 승자 입력/확정 UI(다음 라운드 반영) | T-018,T-029 | - |
| T-031 | todo | P1 | Export | 브래킷 PNG 내보내기 구현 | T-029 | - |
| T-032 | todo | P1 | Export | 브래킷 Print/PDF 구현 | T-029 | - |
| T-033 | todo | P1 | UX | 반응형/접근성/빈상태/오류상태 정리 | T-021,T-023,T-025,T-029 | - |
| T-034 | todo | P1 | Optional | 다국어 지원(ko/en) 토글 구현 | T-020 | - |
| T-035 | todo | P1 | Optional | 로컬 저장(LocalStorage) 자동 복원 구현 | T-025 | - |
| T-036 | todo | P1 | Optional | 공유 링크(압축 state) 생성/복원 구현 | T-035 | - |
| T-037 | todo | P0 | Test | 엔진 단위 테스트(순위/타이브레이커/3위/대진) | T-019 | - |
| T-038 | todo | P0 | Test | 데이터 검증 테스트(수량/중복/참조/형식) | T-005 | - |
| T-039 | todo | P0 | Test | 통합 테스트(입력→순위→3위→32강→다음라운드) | T-030 | - |
| T-040 | todo | P0 | Test | E2E 테스트(핵심 사용자 여정) | T-030 | - |
| T-041 | todo | P0 | Verification | 수동 QA 시나리오(검색/동률/경계조건/오류) 확정 및 수행 | T-040 | - |
| T-042 | todo | P0 | Release | CI 게이트/배포 체크리스트 확정 후 릴리스 | T-037,T-038,T-039,T-040,T-041 | - |

## Ticket Details

### T-001 Setup: 앱 초기 구조 생성 및 기본 라우팅 골격 구성
- Goal: 개발 시작 가능한 최소 앱 실행 환경 확보.
- Deliverables: 앱 엔트리, 페이지 라우트, 공통 레이아웃 파일.
- DoD:
  - `npm run dev`로 앱 실행 가능.
  - `/groups`, `/schedule`, `/simulator`, `/bracket` 라우트 진입 가능.

### T-002 Setup: 디렉터리 구조 고정
- Goal: UI/엔진/데이터 경계를 명확히 분리.
- Deliverables: `src/core`, `src/ui`, `src/pages`, `src/data` 구조.
- DoD:
  - 엔진 코드가 UI 레이어 의존 없이 빌드 가능.
  - 경로 alias 또는 import 규칙이 정해짐.

### T-003 Data: 데이터 타입/스키마 정의
- Goal: JSON 데이터 계약을 코드 레벨로 고정.
- Deliverables: Team/Group/Fixture/Result/Standing 타입.
- DoD:
  - 타입 누락 없이 `data/team.json`, `data/group.json`, `data/schedule.json`을 표현.
  - 결과 입력 타입이 `null` 상태를 명시적으로 지원.

### T-004 Data: JSON 로더/정규화 계층 구현
- Goal: 원시 JSON을 엔진 친화 형태(ID 기준)로 변환.
- Deliverables: 로더 함수, 정규화 유틸.
- DoD:
  - 팀 조회를 O(1) 맵으로 지원.
  - Fixture의 home/away가 team ID로 정규화됨.

### T-005 Data: 데이터 무결성 검증기 구현
- Goal: 잘못된 데이터로 계산이 깨지는 상황 사전 차단.
- Deliverables: 검증 함수 + 오류 리포트 포맷.
- DoD:
  - 12개 조, 조당 4팀, 총 72경기 검증.
  - 존재하지 않는 팀 참조 시 실패 처리.

### T-006 Quality: 테스트/린트/포맷 명령 구성
- Goal: 개발 속도보다 안정성을 우선하는 기본 품질 체계 마련.
- Deliverables: `lint`, `test`, `build` 스크립트.
- DoD:
  - CI에서 동일 명령 재현 가능.
  - 실패 시 원인 로그가 명확히 출력.

### T-007 State: 앱 상태 모델 설계
- Goal: 입력 상태와 계산 결과를 일관되게 관리.
- Deliverables: AppState 정의, selector 인터페이스.
- DoD:
  - 입력 변경 시 계산 selector만 재실행되도록 분리.
  - 페이지 간 이동 시 상태 손실 없음.

### T-008 State: `null` vs `0-0` 분리 저장 모델 구현
- Goal: 미입력과 무승부 확정을 엄격히 구분.
- Deliverables: score serializer/deserializer.
- DoD:
  - 입력 전 경기값은 항상 `null`.
  - 사용자가 입력 확정 시에만 `{home,away}` 생성.

### T-009~T-013 Engine: 조 순위/타이브레이커/3위 랭킹 핵심 엔진
- Goal: README 기준 FIFA 계산 규칙 구현.
- Deliverables: 집계기, H2H, comparator, group ranking, best-third ranking.
- DoD:
  - 동점 케이스에서 H2H 우선순위가 정확히 적용.
  - 최종 fallback은 FIFA ranking(숫자 낮을수록 우선).
  - 12개 조 입력 완료 시 상위 8개 3위 팀이 결정됨.

### T-014~T-015 Engine: 검색/필터 엔진
- Goal: 스케줄/시뮬레이터 공통 검색 품질 확보.
- Deliverables: `filterMatches(keyword, group, date)` 유틸.
- DoD:
  - 영문/한글 검색 모두 동작.
  - 부분일치 검색 결과가 즉시 반영.

### T-016~T-018 Engine: 32강 생성 + 이후 라운드 자동 전진
- Goal: 브래킷 자동 생성과 토너먼트 진행 계산 완성.
- Deliverables: round32 config, assignment, next-round propagation.
- DoD:
  - 32강 매치업이 규칙대로 자동 생성.
  - `Winner Mxx` 규칙으로 16강/8강/4강/결승 자동 생성.

### T-019 Engine: 시뮬레이션 재계산 파이프라인
- Goal: 입력 변경 즉시 모든 파생 결과 동기화.
- Deliverables: recompute pipeline orchestration.
- DoD:
  - 점수 1회 변경 시 Group/3rd/Bracket 모두 즉시 업데이트.
  - 계산 루틴이 순환 의존 없이 단방향으로 동작.

### T-020~T-030 UI: MVP 화면 + 브래킷 조작 UI 구현
- Goal: ui 수준의 화면/흐름을 실제 계산 엔진과 연결.
- Deliverables: Groups/Schedule/Simulator/R32/Knockout 페이지 컴포넌트.
- DoD:
  - Groups: 12조와 순위표 표시.
  - Schedule: 72경기 표시, 검색/필터 동작.
  - Simulator: 조별 입력, 실시간 결과 연동.
  - Bracket: unresolved/resolved + 라운드 전진 표시.
  - 승자 입력 시 다음 라운드 자동 반영.

### T-031~T-036 Export/Optional 기능
- Goal: 배포 이후 사용성과 확장성 확보.
- Deliverables: PNG/PDF 내보내기, i18n, localStorage, share link.
- DoD:
  - PNG/PDF가 실제 브래킷 레이아웃으로 저장됨.
  - ko/en 전환 시 주요 텍스트 누락 없음.
  - 새로고침 후 시뮬레이션 상태 복원.
  - 공유 링크로 동일 상태 재현.

### T-037~T-042 테스트/검증/릴리스 게이트
- Goal: “기능이 다 동작한다”를 증명 가능한 상태로 만들기.
- Deliverables: unit/integration/e2e/manual QA/CI gate.
- DoD:
  - P0 티켓 기능 전부 자동+수동 검증 통과.
  - 릴리스 체크리스트에서 blocker 0개.
  - main 머지 전 `lint + test + e2e + manual checklist` 결과가 기록됨.

## Execution Order (Recommended)
1. `T-001`~`T-008`
2. `T-009`~`T-019`
3. `T-020`~`T-030`
4. `T-037`~`T-042`
5. `T-031`~`T-036` (P1 Optional)
