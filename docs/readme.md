## FIFA World Cup 2026 Simulation & Knockout Bracket Generator

---

## 📌 1. 프로젝트 개요

이 웹앱은 다음을 자동으로 처리합니다:

✔ 조별 리그 순위 계산
✔ 동률 시 FIFA 공식 타이브레이커 적용 (FIFA Ranking 포함) ([위키백과][1])
✔ 경기 검색(영문/한글, 부분 일치)
✔ 32강 대진 자동 생성
✔ 16강, 8강 이후 자동 전진

---

## 📂 2. 데이터 구조

### teams.json

모든 팀에 대해 아래 구조로 정의합니다:

```json
{
  "<team_id>": {
    "en": "<English Name>",
    "ko": "<Korean Name>",
    "flag": "data/flags/<Flag Image File>",
    "fifaRanking": <number>
  }
}
```

* FIFA 랭킹은 **2025년 최신 랭킹 기준**
* 플레이오프 및 placeholder 팀은 모두 `60`으로 통일

---

### group.json

```json
{
  "groups": [
    {
      "groupId": "A",
      "teams": ["mexico", "south_korea", "south_africa", "european_playoff_d"]
    }
  ]
}
```

---

### schedule.json

```json
{
  "fixtures": [
    {
      "matchId": "A-01",
      "groupId": "A",
      "home": "mexico",
      "away": "south_africa",
      "kickoffUtc": "2026-06-11T18:00:00Z"
    }
  ]
}
```

---

## 🔍 3. 검색 기능

### 요구사항

* 영어/한글 검색 지원
* 부분 일치 필터링
* Schedule & Simulator 페이지 모두 적용

### 구현 예

```js
function filterMatches(keyword) {
  const term = keyword.trim().toLowerCase();
  return schedule.fixtures.filter(m => {
    const home = teams[m.home].en.toLowerCase() + teams[m.home].ko.toLowerCase();
    const away = teams[m.away].en.toLowerCase() + teams[m.away].ko.toLowerCase();
    return home.includes(term) || away.includes(term);
  });
}
```

---

## 📊 4. 조별 순위 계산 알고리즘

### 📌 순위 결정 기준 (FIFA 공식)

1. Head-to-head points
2. Head-to-head goal difference
3. Head-to-head goals scored
4. Overall goal difference
5. Overall goals scored
6. FIFA World Ranking ([위키백과][1])

> 페어플레이는 이번 프로젝트에서는 고려하지 않음.

---

### 🧠 기본 데이터 모델

```js
teamStats = {
  points: 0,
  goalDiff: 0,
  goalsFor: 0,
  goalsAgainst: 0,
  headToHead: {} // 상대별 통계
};
```

---

### 🎯 정렬/비교 함수

```js
function compareHeadToHead(a, b) {
  const h2hA = a.headToHead[b.id] || { points: 0, goalDiff: 0, goalsFor: 0 };
  const h2hB = b.headToHead[a.id] || { points: 0, goalDiff: 0, goalsFor: 0 };

  if (h2hA.points !== h2hB.points) return h2hB.points - h2hA.points;
  if (h2hA.goalDiff !== h2hB.goalDiff) return h2hB.goalDiff - h2hA.goalDiff;
  if (h2hA.goalsFor !== h2hB.goalsFor) return h2hB.goalsFor - h2hA.goalsFor;
  return null;
}

function sortGroupTeams(teams) {
  return teams.sort((a, b) => {
    if (a.points !== b.points) return b.points - a.points;

    const h2h = compareHeadToHead(a, b);
    if (h2h !== null) return h2h;

    if (a.goalDiff !== b.goalDiff) return b.goalDiff - a.goalDiff;
    if (a.goalsFor !== b.goalsFor) return b.goalsFor - a.goalsFor;

    return a.fifaRanking - b.fifaRanking; 
  });
}
```

---

## 🥉 5. 상위 8개 3위 비교

32강에는 다음이 진출합니다:
✔ All group winners (12)
✔ All runners-up (12)
✔ Top 8 ranked 3rd place teams

### 비교 기준

1. Points
2. Goal difference
3. Goals scored
4. FIFA ranking

```js
function rankThirdPlace(teams3) {
  return teams3.sort((a, b) => {
    if (a.points !== b.points) return b.points - a.points;
    if (a.goalDiff !== b.goalDiff) return b.goalDiff - a.goalDiff;
    if (a.goalsFor !== b.goalsFor) return b.goalsFor - a.goalsFor;
    return a.fifaRanking - b.fifaRanking;
  });
}
```

---

## 🏆 6. 32강 자동 대진 배치

### 📌 Slot System 구조

FIFA 공식 32강 매치업은 **고정된 슬롯 구조**로 주어져 있으며,
8개의 3위 팀은 *허용된 그룹 범위* 안에서 해당 슬롯에 배치됩니다. ([위키백과][2])

예:

| Slot                            | Matchup                                |
| ------------------------------- | -------------------------------------- |
| M73                             | Runner-up Group A vs Runner-up Group B |
| M74                             | Winner Group C vs Runner-up Group F    |
| M75                             | Winner Group E vs 3rd from (A/B/C/D/F) |
| ...                             | Others similar (Wikipedia format)      |
| (*전 매치업 목록은 전체 공식 bracket을 참고*) |                                        |

---

### 🎯 슬롯 JSON 예시

```json
{
  "M75": {
    "home": { "type": "winner", "group": "E" },
    "away": { "type": "thirdBest", "groupsAllowed": ["A","B","C","D","F"] }
  },
  ...
}
```

---

### 🧠 자동 매핑 함수

```js
function assignThirdPlace(cfg, bestThirds) {
  const candidate = bestThirds.find(t => cfg.groupsAllowed.includes(t.groupId));
  return candidate || null;
}

function generateRoundOf32(groups, bestThirds) {
  const bracket = {};
  for (const slot in round32Config) {
    const cfg = round32Config[slot];
    if (cfg.home.type === "winner") bracket[slot] = { home: groups[cfg.home.group].top1 };
    if (cfg.home.type === "runnerUp") bracket[slot].home = groups[cfg.home.group].top2;

    if (cfg.away.type === "thirdBest") {
      bracket[slot].away = assignThirdPlace(cfg.away, bestThirds);
    }
  }
  return bracket;
}
```

---

## 🏁 7. 16강 이후 자동 전진

32강 승자는 아래처럼 슬롯 ID로 자동 배정됩니다:

```
M89: Winner M73 vs Winner M75
M90: Winner M74 vs Winner M77
...
```

이런 구조는 **정적 JSON 기반으로 브래킷 룰을 미리 정의해두고**
다음 라운드는 이전 라운드 matchId 승자끼리 자동 생성하게 됩니다. ([위키백과][2])

---

## ⚙ 8. 개발 우선순위

### Must-have

1. Group ranking engine
2. Simulator score update → real-time ranking
3. Search filter UI
4. Round of 32 generator
5. Bracket viewer UI

### Optional

✔ Multi-language support (ko/en)
✔ LocalStorage sync
✔ Shareable links

---

## 📝 참고 규정

### Group Tie-breakers

순위는 다음 순서로 결정됩니다:

1. Head-to-head points
2. Head-to-head goal diff
3. Head-to-head goals for
4. Overall goal diff
5. Overall goals for
6. Fair play (optional)
7. FIFA Rank ([위키백과][1])

---

## 📌 결과

이 README는 **정량적 계산 + 공식 FIFA 브래킷 구조**를 모두 담고 있으며,
실제로 개발하면서 바로 구현 가능한 코드 틀을 포함하고 있습니다.
