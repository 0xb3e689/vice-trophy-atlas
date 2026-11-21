# vice-trophy-atlas

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/0xb3e689/vice-trophy-atlas/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/0xb3e689/vice-trophy-atlas/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Vice Trophy Atlas is an offline guide and tracker for the 55 official PS5 trophies of Grand Theft Auto VI (1 platinum, 2 gold, 6 silver, 46 bronze, 28 hidden). Each trophy keeps its official name, description and grade, and gets a kind, a roadmap stage, a missable or at-risk flag with the chapter it must be done before, a count stepper where the trophy tracks one, and a numbered guide in our own words where every step cites the pages it came from, plus "Cited facts" from a wider read of the web: 318/318 claims cited, 234 of them backed by 2 or more sites, 14 pages from 12 sites (PowerPyx, GTABase, Gamerfuzion, KeenGamer, Insider Gaming, GTA Boom, eGamers, TechNerdiness, XboxPlay, RankedBoost, GameTrek and LFCarry), each listed with its site name and read date (2026-11-21). Where sources disagree, 17 "Sources differ" boxes across 15 trophies show each version, who says it, and our call; a Disputed filter lists them. The wider research lives in `app/data/sources-1.json`, `sources-2.json` and `sources-3.json` and is merged into the guides by trophy id when the page loads. It has four tabs: a three-column Tracker (filters, a checklist grouped by stage, the selected guide and its sources), a seven-stage Roadmap to the platinum, a Missables table, and a Sources index. Progress is saved in localStorage and can be exported and imported as JSON. A spoiler shield hides the hidden trophies until you earn them. The URL hash links to any view, for example `#tab=roadmap` or `#trophy=28`. It is plain static files with no build step and no network requests.

## Run it

```sh
node serve.ts
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=93p1fwth&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
