# Agile Kanban Board

A single-page web app that combines a standard Kanban board with Scrum and Agile practices, plus a personal health tracker.
No build step, no framework, no server: plain HTML, CSS and JavaScript. It is installable as a PWA and works offline.

## Features

**Kanban, Scrum and Agile**
- Columns: To Do, In Progress, Review, Done, with editable WIP limits
- Drag and drop (or arrow buttons), story types, story points, priorities
- Product backlog, sprint planning (name, goal, length), sprint completion with velocity
- Subtasks, start and due dates, a timeline view, burndown chart, and a sprint retrospective

**Goals (Harada-style mandala, lotus layers)**
- Write a main goal in the middle and 8 themes around it
- Open any square to get its own layer with 8 more squares, as deep as you like
- A Big picture view shows the goal, its 8 themes and their actions on one 9x9 chart
- One tap turns the squares on a layer into Backlog tasks

**Health tracking (one Health tab with four sections: Pain, Cycle, Daily log, Trends)**
- Body pain assessment: tap a body map to record where it hurts, how strong, how it feels and when it is worst
- Menstrual cycle log with period predictions and cycle phases
- Daily log of mood, energy, focus, stress, body feeling, sleep, exercise and medicines
- Year graph, heat strips and a table of how items move together

## Run locally

Open `index.html` in a browser, or serve the folder:

```
python3 -m http.server 8000
```

then visit http://localhost:8000

## Deploy on GitHub Pages

1. Put these files in the repository root (or a `docs/` folder).
2. In the repository go to Settings, Pages, and choose the branch and folder.
3. Your app will be at `https://<your-user>.github.io/<repo>/`.

## Data and privacy

Everything is saved in your browser's localStorage on that device. Nothing is sent anywhere.
Clearing browser data, or opening the app on another device, loses it, so there is no backup or sync yet.

## Notes

- Plan import, plan chat and the Claude analysis buttons only work when the app runs inside Claude. They are hidden or disabled on GitHub Pages.
- The health features are for self-tracking, not medical advice. Cycle and fertile-window estimates are not reliable for contraception.
