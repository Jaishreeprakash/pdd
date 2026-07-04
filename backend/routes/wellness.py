import json
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from models.tracking import (
    ActivityRecord,
    BurnoutRecord,
    EmotionRecord,
    PhoneUsageRecord,
    SleepRecord,
    WellnessScore,
)
from schemas.tracking import DashboardData, TrendPoint, WellnessScoreResponse
from services.ai_service import AIService
from utils.auth_utils import get_current_user

router = APIRouter(prefix="/wellness", tags=["Wellness"])
ai_service = AIService()


def _safe_avg(values: List[float]) -> float:
    return round(sum(values) / len(values), 2) if values else 0.0


@router.get("/score", response_model=WellnessScoreResponse)
def get_wellness_score(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get or compute the current wellness score for the user."""
    # Try to find today's score first
    today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    existing = (
        db.query(WellnessScore)
        .filter(WellnessScore.user_id == current_user.id, WellnessScore.date >= today)
        .order_by(WellnessScore.date.desc())
        .first()
    )
    if existing:
        return existing

    # Compute from latest data
    latest_burnout = (
        db.query(BurnoutRecord)
        .filter(BurnoutRecord.user_id == current_user.id)
        .order_by(BurnoutRecord.date.desc())
        .first()
    )
    burnout_score = latest_burnout.burnout_score if latest_burnout else 50.0

    latest_sleep = (
        db.query(SleepRecord)
        .filter(SleepRecord.user_id == current_user.id)
        .order_by(SleepRecord.date.desc())
        .first()
    )
    sleep_data = (
        {
            "duration_hours": latest_sleep.duration_hours,
            "quality_score": latest_sleep.quality_score,
            "consistency_score": latest_sleep.consistency_score,
        }
        if latest_sleep
        else None
    )
    sleep_score = ai_service._sleep_to_burnout_component(sleep_data)

    latest_activity = (
        db.query(ActivityRecord)
        .filter(ActivityRecord.user_id == current_user.id)
        .order_by(ActivityRecord.date.desc())
        .first()
    )
    activity_data = (
        {
            "study_hours": latest_activity.study_hours,
            "work_hours": latest_activity.work_hours,
            "exercise_minutes": latest_activity.exercise_minutes,
            "break_count": latest_activity.break_count,
            "focus_score": latest_activity.focus_score,
        }
        if latest_activity
        else None
    )
    activity_score = ai_service._activity_to_burnout_component(activity_data)

    # Emotions last 3 days
    cutoff = datetime.now(timezone.utc) - timedelta(days=3)
    emotion_recs = (
        db.query(EmotionRecord)
        .filter(EmotionRecord.user_id == current_user.id, EmotionRecord.timestamp >= cutoff)
        .order_by(EmotionRecord.timestamp.desc())
        .limit(20)
        .all()
    )
    emotion_list = [{"dominant_emotion": e.dominant_emotion, "confidence": e.confidence} for e in emotion_recs]
    emotion_summary = ai_service.analyze_emotions(emotion_list)
    emotion_score = ai_service._emotion_to_burnout_component(
        {
            "stability_score": emotion_summary["stability_score"],
            "negative_ratio": emotion_summary["negative_ratio"],
            "dominant_emotion": emotion_summary["dominant_emotion"],
        }
    )

    wellness = ai_service.calculate_wellness_score(burnout_score, sleep_score, activity_score, emotion_score)

    ws_record = WellnessScore(
        user_id=current_user.id,
        date=datetime.now(timezone.utc),
        overall_score=wellness["overall_score"],
        stress_level=wellness["stress_level"],
        mood_score=wellness["mood_score"],
        productivity_score=wellness["productivity_score"],
    )
    db.add(ws_record)
    db.commit()
    db.refresh(ws_record)
    return ws_record


@router.get("/dashboard", response_model=DashboardData)
def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get full aggregated dashboard data combining all metrics."""
    cutoff_30 = datetime.now(timezone.utc) - timedelta(days=30)
    cutoff_7 = datetime.now(timezone.utc) - timedelta(days=7)

    # Burnout
    burnout_records = (
        db.query(BurnoutRecord)
        .filter(BurnoutRecord.user_id == current_user.id, BurnoutRecord.date >= cutoff_30)
        .order_by(BurnoutRecord.date.asc())
        .all()
    )
    current_burnout = burnout_records[-1].burnout_score if burnout_records else 50.0
    current_risk = burnout_records[-1].risk_level if burnout_records else "moderate"

    # Sleep
    sleep_records = (
        db.query(SleepRecord)
        .filter(SleepRecord.user_id == current_user.id, SleepRecord.date >= cutoff_7)
        .all()
    )
    sleep_avg_hours = _safe_avg([r.duration_hours for r in sleep_records])
    sleep_quality_avg = _safe_avg([r.quality_score for r in sleep_records])

    # Phone
    phone_records = (
        db.query(PhoneUsageRecord)
        .filter(PhoneUsageRecord.user_id == current_user.id, PhoneUsageRecord.date >= cutoff_7)
        .all()
    )
    phone_avg = _safe_avg([r.screen_time_hours for r in phone_records])

    # Activity
    activity_records = (
        db.query(ActivityRecord)
        .filter(ActivityRecord.user_id == current_user.id, ActivityRecord.date >= cutoff_7)
        .all()
    )
    exercise_avg = _safe_avg([r.exercise_minutes for r in activity_records])

    # Emotions
    emotion_records = (
        db.query(EmotionRecord)
        .filter(EmotionRecord.user_id == current_user.id, EmotionRecord.timestamp >= cutoff_7)
        .all()
    )
    emotion_list = [{"dominant_emotion": e.dominant_emotion, "confidence": e.confidence} for e in emotion_records]
    emotion_summary = ai_service.analyze_emotions(emotion_list)
    dominant_emotion = emotion_summary["dominant_emotion"]

    # Wellness
    wellness_records = (
        db.query(WellnessScore)
        .filter(WellnessScore.user_id == current_user.id, WellnessScore.date >= cutoff_30)
        .order_by(WellnessScore.date.asc())
        .all()
    )
    current_wellness = wellness_records[-1].overall_score if wellness_records else 60.0

    # Trend series
    burnout_trend = [
        TrendPoint(date=r.date.strftime("%Y-%m-%d"), value=r.burnout_score)
        for r in burnout_records
    ]
    sleep_trend = [
        TrendPoint(date=r.date.strftime("%Y-%m-%d"), value=r.duration_hours)
        for r in sorted(sleep_records, key=lambda x: x.date)
    ]
    wellness_trend = [
        TrendPoint(date=r.date.strftime("%Y-%m-%d"), value=r.overall_score)
        for r in wellness_records
    ]

    return DashboardData(
        current_burnout_score=round(current_burnout, 2),
        risk_level=current_risk,
        wellness_score=round(current_wellness, 2),
        sleep_avg_hours=sleep_avg_hours,
        sleep_quality_avg=sleep_quality_avg,
        phone_screen_time_avg=phone_avg,
        exercise_minutes_avg=exercise_avg,
        dominant_emotion=dominant_emotion,
        burnout_trend=burnout_trend,
        sleep_trend=sleep_trend,
        wellness_trend=wellness_trend,
        recommendations_count=3,
        last_updated=datetime.now(timezone.utc),
    )


@router.get("/trends")
def get_trends(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get 7-day and 30-day trend data for charts."""
    cutoff_7 = datetime.now(timezone.utc) - timedelta(days=7)
    cutoff_30 = datetime.now(timezone.utc) - timedelta(days=30)

    def _fetch_burnout(cutoff):
        recs = (
            db.query(BurnoutRecord)
            .filter(BurnoutRecord.user_id == current_user.id, BurnoutRecord.date >= cutoff)
            .order_by(BurnoutRecord.date.asc())
            .all()
        )
        return [{"date": r.date.strftime("%Y-%m-%d"), "burnout_score": r.burnout_score, "risk_level": r.risk_level} for r in recs]

    def _fetch_sleep(cutoff):
        recs = (
            db.query(SleepRecord)
            .filter(SleepRecord.user_id == current_user.id, SleepRecord.date >= cutoff)
            .order_by(SleepRecord.date.asc())
            .all()
        )
        return [{"date": r.date.strftime("%Y-%m-%d"), "duration_hours": r.duration_hours, "quality_score": r.quality_score} for r in recs]

    def _fetch_wellness(cutoff):
        recs = (
            db.query(WellnessScore)
            .filter(WellnessScore.user_id == current_user.id, WellnessScore.date >= cutoff)
            .order_by(WellnessScore.date.asc())
            .all()
        )
        return [{"date": r.date.strftime("%Y-%m-%d"), "overall_score": r.overall_score, "stress_level": r.stress_level, "mood_score": r.mood_score} for r in recs]

    def _fetch_activity(cutoff):
        recs = (
            db.query(ActivityRecord)
            .filter(ActivityRecord.user_id == current_user.id, ActivityRecord.date >= cutoff)
            .order_by(ActivityRecord.date.asc())
            .all()
        )
        return [{"date": r.date.strftime("%Y-%m-%d"), "exercise_minutes": r.exercise_minutes, "focus_score": r.focus_score, "work_hours": r.work_hours} for r in recs]

    burnout_7d = _fetch_burnout(cutoff_7)
    burnout_30d = _fetch_burnout(cutoff_30)

    # Trend prediction
    scores_30d = [r["burnout_score"] for r in burnout_30d]
    trend_prediction = ai_service.predict_trend(scores_30d)

    return {
        "seven_day": {
            "burnout": burnout_7d,
            "sleep": _fetch_sleep(cutoff_7),
            "wellness": _fetch_wellness(cutoff_7),
            "activity": _fetch_activity(cutoff_7),
        },
        "thirty_day": {
            "burnout": burnout_30d,
            "sleep": _fetch_sleep(cutoff_30),
            "wellness": _fetch_wellness(cutoff_30),
            "activity": _fetch_activity(cutoff_30),
        },
        "prediction": trend_prediction,
    }
