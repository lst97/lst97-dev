# TypoSync Front-End Roadmap

> Last updated: {{date}}

This document tracks all front-end tasks for TypoSync, organized by development phase.  Each task mirrors the project-wide TODO list and will be kept in sync during development.

Legend: **Status** → ☐ pending | ☐ in-progress | ☑ completed

---

## Phase 1 – Core Experience  

*Release scope: first public playable build*

| ID | Task | Status | Dependencies |
| --- | ---- | ------ | ------------ |
| FE-P1-UI-POLISH | Polish overall UI/UX, finalis color palette, pixel-border styles, component layout. | ☐ | — |
| FE-P1-STATS-BOARD | Build post-game statistics board: WPM, accuracy, timing histogram, streaks, session history. | ☐ | FE-P1-UI-POLISH |
| FE-P1-RESPONSIVE | Implement full responsive design & mobile support for canvas, controls, stats overlays. | ☐ | FE-P1-UI-POLISH |
| FE-P1-PERF | Optimism Three.js & Web Audio performance, throttle logs, minimist re-renders, maintain 60 FPS. | ☐ | FE-P1-UI-POLISH |
| FE-P1-STATE-PERSIST | Persist player stats locally / backend for progress tracking. | ☐ | FE-P1-STATS-BOARD |

---

## Phase 2 – Competitive Scene  

*Global leaderboards and shareable challenges*

| ID | Task | Status | Dependencies |
| --- | ---- | ------ | ------------ |
| FE-P2-LEADERBOARD-API | Integrate leaderboard REST endpoint & build UI with sorting, pagination, player rank highlight. | ☐ | FE-P1-STATS-BOARD, FE-P1-STATE-PERSIST |
| FE-P2-CHALLENGE-KEY | Create shareable challenge key (song hash + seed) & validation flow. | ☐ | FE-P2-LEADERBOARD-API |
| FE-P2-SHARE-UI | Social share modal/buttons with copy-to-clipboard & meta-tags for links. | ☐ | FE-P2-CHALLENGE-KEY |

---

## Phase 3 – Real-Time Multiplayer  

*Live typing races*

| ID | Task | Status | Dependencies |
| --- | ---- | ------ | ------------ |
| FE-P3-MULTIPLAYER-LOBBY | Design multiplayer lobby & matchmaking UI (room list, queue indicator, ready-up). | ☐ | FE-P2-LEADERBOARD-API |
| FE-P3-REALTIME-SYNC | WebSocket client for real-time note & event sync between players. | ☐ | FE-P3-MULTIPLAYER-LOBBY |
| FE-P3-RACE-UI | In-game race overlay: opponent progress, live WPM, victory screen. | ☐ | FE-P3-REALTIME-SYNC |

---

## Cross-Phase QA & Testing

| ID | Task | Status | Dependencies |
| --- | ---- | ------ | ------------ |
| FE-QA-TESTING | Cross-browser, accessibility, bug-bash & performance audits across all phases. | ☐ | FE-P1-PERF, FE-P2-SHARE-UI, FE-P3-RACE-UI |

---

### How to update

1. Mark the corresponding checkbox when a task changes status.
2. Keep the TODO JSON list (`.cursor-todos.json`) in sync – the automation runner uses it for reminders.
3. Add new tasks or adjust dependencies as the scope evolves.

Let's keep typing fun 🚀
