from __future__ import annotations

from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(title="Tomato AI Service", version="1.0.0")


# --------- Models (match your Spring DTO shape) ---------

class TaskIn(BaseModel):
    id: int
    title: str
    priority: str = "medium"          # high/medium/low
    deadline: Optional[str] = None    # ISO string or null
    status: str = "active"            # active/done/completed...


class SessionIn(BaseModel):
    taskId: Optional[int] = None
    mode: str = "focus"               # focus/break
    minutes: int = 0
    startedAt: Optional[str] = None   # ISO string


class RecommendRequest(BaseModel):
    userId: int
    range: str = "7d"
    now: Optional[str] = None
    tasks: List[TaskIn] = Field(default_factory=list)
    sessions: List[SessionIn] = Field(default_factory=list)


class RecommendationOut(BaseModel):
    taskId: int
    title: str
    priority: str
    deadline: Optional[str]
    score: float
    reasons: List[str]
    suggestedPomodoros: int


class RecommendResponse(BaseModel):
    generatedAt: str
    range: str
    recommendations: List[RecommendationOut]


# --------- Helpers ---------

def parse_iso(s: Optional[str]) -> Optional[datetime]:
    if not s:
        return None
    # Support Z
    if s.endswith("Z"):
        s = s[:-1] + "+00:00"
    try:
        dt = datetime.fromisoformat(s)
        # if naive, treat as UTC
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt
    except Exception:
        return None


def clamp(x: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, x))


def safe_lower(x: Optional[str]) -> str:
    return (x or "").strip().lower()


def parse_days(range_str: str) -> int:
    r = (range_str or "7d").strip().lower()
    if r.endswith("d"):
        try:
            return int(r[:-1])
        except Exception:
            return 7
    return 7


def is_active(status: str) -> bool:
    s = safe_lower(status)
    return s not in ("done", "completed", "complete")


# --------- Core scoring (similar philosophy to your Java scoring) ---------

def recommend_top3_logic(now: datetime, range_str: str, tasks: List[TaskIn], sessions: List[SessionIn]) -> List[RecommendationOut]:
    days = parse_days(range_str)
    # We assume Spring already filtered sessions by range; but we still handle anyway.
    from_dt = now  # placeholder if startedAt missing

    # focus minutes + last focus per task
    focus_minutes: Dict[int, int] = {}
    last_focus: Dict[int, datetime] = {}

    for s in sessions:
        if safe_lower(s.mode) != "focus":
            continue
        if s.taskId is None:
            continue
        st = parse_iso(s.startedAt)
        if st is None:
            continue
        # optional extra range check
        if (now - st).days > days:
            continue
        focus_minutes[s.taskId] = focus_minutes.get(s.taskId, 0) + int(s.minutes or 0)
        prev = last_focus.get(s.taskId)
        if prev is None or st > prev:
            last_focus[s.taskId] = st

    scored: List[RecommendationOut] = []

    for t in tasks:
        if not is_active(t.status):
            continue

        pr = safe_lower(t.priority)
        pr_score = 0.8
        pr_weight = 0.85
        reasons: List[str] = []

        if pr == "high":
            pr_score = 1.8
            pr_weight = 1.35
            reasons.append("High priority")
        elif pr == "medium":
            pr_score = 1.2
            pr_weight = 1.0

        # deadline score
        due_score = 0.2
        overdue = False
        due_in_hours = 9999.0
        due_dt = parse_iso(t.deadline)

        if due_dt is not None:
            due_in_hours = (due_dt - now).total_seconds() / 3600.0
            if due_in_hours < 0:
                overdue = True
                due_score = 2.2
                reasons.append("Overdue")
            else:
                due_score = clamp(2.0 - (due_in_hours / 84.0), 0.2, 2.0)
                if due_in_hours <= 24:
                    reasons.append("Due soon")
                elif due_in_hours <= 72:
                    reasons.append("Due in a few days")

        fm = focus_minutes.get(t.id, 0)
        # invest boost: less focus -> more urge
        if fm < 25:
            invest_boost = 1.2
            reasons.append("Low focus time")
        elif fm < 60:
            invest_boost = 0.7
            reasons.append("Needs more focus")
        else:
            invest_boost = 0.15

        # stale boost
        lf = last_focus.get(t.id)
        if lf is None:
            stale_boost = 0.9
            reasons.append("Not touched recently")
        else:
            days_since = (now - lf).total_seconds() / (3600 * 24)
            if days_since >= 7:
                stale_boost = 0.9
                reasons.append("Not touched recently")
            elif days_since >= 3:
                stale_boost = 0.4
            else:
                stale_boost = 0.0

        score = (due_score + pr_score + invest_boost + stale_boost) * pr_weight

        # suggested pomodoros (cap 6)
        sug = 1
        if fm < 25:
            sug += 2
        if pr == "high":
            sug += 1
        if (not overdue) and (due_in_hours <= 24):
            sug += 1
        if overdue:
            sug += 1
        sug = int(clamp(float(sug), 1, 6))

        # dedup + limit 3
        uniq = []
        seen = set()
        for r in reasons:
            if r in seen:
                continue
            seen.add(r)
            uniq.append(r)
        uniq = uniq[:3]

        scored.append(
            RecommendationOut(
                taskId=t.id,
                title=t.title,
                priority=t.priority or "medium",
                deadline=t.deadline,
                score=round(float(score), 3),
                reasons=uniq,
                suggestedPomodoros=sug,
            )
        )

    scored.sort(key=lambda x: x.score, reverse=True)
    return scored[:3]


@app.post("/recommendations", response_model=RecommendResponse)
def recommend(req: RecommendRequest):
    now = parse_iso(req.now)
    if now is None:
        now = datetime.now(timezone.utc)

    top3 = recommend_top3_logic(now, req.range, req.tasks, req.sessions)
    return RecommendResponse(
        generatedAt=now.isoformat().replace("+00:00", "Z"),
        range=req.range,
        recommendations=top3,
    )


@app.get("/health")
def health() -> Dict[str, Any]:
    return {"ok": True}
