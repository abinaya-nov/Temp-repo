from datetime import datetime
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field


NonNegativeNumber = Annotated[float, Field(ge=0, allow_inf_nan=False, strict=True)]
RequiredText = Annotated[str, Field(min_length=1, pattern=r"\S")]


class Contract(BaseModel):
    model_config = ConfigDict(extra="forbid", frozen=True)


class Comment(Contract):
    author: RequiredText
    body: RequiredText
    authored_at: datetime | None = None


class IssueInput(Contract):
    key: RequiredText
    project: RequiredText
    team: RequiredText | None = None
    issue_type: RequiredText
    summary: RequiredText
    description: str = ""
    acceptance_criteria: tuple[str, ...] = ()
    comments: tuple[Comment, ...] = ()
    snapshot_at: datetime | None = None


class ExistingEstimates(Contract):
    story_points: NonNegativeNumber | None = None
    original_estimate_hours: NonNegativeNumber | None = None


class HistoricalTargets(Contract):
    actual_logged_hours: NonNegativeNumber | None = None
    finalized_story_points: NonNegativeNumber | None = None


class JiraIssue(Contract):
    content: IssueInput
    status: RequiredText
    priority: RequiredText | None = None
    assignee: str | None = None
    resolution: str | None = None
    created_at: datetime | None = None
    resolved_at: datetime | None = None
    existing_estimates: ExistingEstimates = Field(default_factory=ExistingEstimates)
    historical_targets: HistoricalTargets | None = None


class EstimateRecommendation(Contract):
    issue_key: RequiredText
    recommended_hours: NonNegativeNumber
    recommended_story_points: NonNegativeNumber
    hours_rationale: RequiredText
    story_points_rationale: RequiredText
    confidence: Literal["Low", "Medium", "High"]
    uncertainty: tuple[str, ...] = ()
    estimator_version: RequiredText
    method: RequiredText


class HealthResponse(Contract):
    status: Literal["ok"] = "ok"
    service: Literal["jiratron-api"] = "jiratron-api"
    version: str
