import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from jiratron_api.main import create_app
from jiratron_api.models import (
    EstimateRecommendation,
    ExistingEstimates,
    HistoricalTargets,
    IssueInput,
    JiraIssue,
)
from jiratron_api.services import EstimationService


@pytest.fixture
def issue_input():
    return IssueInput(
        key="SYNTH-1",
        project="SYNTH",
        team="Jira support",
        issue_type="Task",
        summary="Review a workflow transition",
        description="Validate the configured transition on a test project.",
        acceptance_criteria=("Transition respects the existing permission rule.",),
    )


def test_health():
    with TestClient(create_app()) as client:
        response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {
        "status": "ok", "service": "jiratron-api", "version": "0.1.0"
    }


def test_only_health_business_endpoint_is_exposed():
    paths = create_app().openapi()["paths"]
    assert set(paths) == {"/api/health"}


def test_unknown_and_zero_estimates_are_distinct(issue_input):
    issue = JiraIssue(content=issue_input, status="Done")
    assert issue.existing_estimates.story_points is None
    assert issue.historical_targets is None
    assert HistoricalTargets(actual_logged_hours=0).actual_logged_hours == 0


@pytest.mark.parametrize("value", [-1, float("nan"), float("inf"), True, "8 hours"])
def test_invalid_numeric_targets_are_rejected(value):
    with pytest.raises(ValidationError):
        HistoricalTargets(actual_logged_hours=value)
    with pytest.raises(ValidationError):
        ExistingEstimates(story_points=value)


@pytest.mark.parametrize("field", ["actual_logged_hours", "finalized_story_points", "existing_estimates", "historical_targets"])
def test_estimation_input_rejects_target_fields(issue_input, field):
    with pytest.raises(ValidationError):
        IssueInput.model_validate({**issue_input.model_dump(), field: 8})


def test_blank_required_content_is_rejected(issue_input):
    with pytest.raises(ValidationError):
        IssueInput.model_validate({**issue_input.model_dump(), "summary": " "})


def test_labels_are_separate_and_models_serialize(issue_input):
    issue = JiraIssue(
        content=issue_input,
        status="Done",
        historical_targets=HistoricalTargets(actual_logged_hours=7, finalized_story_points=3),
    )
    assert "actual_logged_hours" not in issue.content.model_dump()
    assert JiraIssue.model_validate_json(issue.model_dump_json()) == issue


def test_service_contract_can_be_implemented_without_existing_estimates(issue_input):
    class SyntheticService:
        def estimate(self, issue: IssueInput) -> EstimateRecommendation:
            return EstimateRecommendation(
                issue_key=issue.key,
                recommended_hours=4,
                recommended_story_points=3,
                hours_rationale="Synthetic service-contract fixture only.",
                story_points_rationale="Independently specified fixture value.",
                confidence="Low",
                uncertainty=("No calibrated Python estimator is implemented.",),
                estimator_version="test-fixture-1",
                method="synthetic-contract-test",
            )

    service: EstimationService = SyntheticService()
    result = service.estimate(issue_input)
    assert result.issue_key == issue_input.key
    assert result.recommended_hours == 4
    assert result.recommended_story_points == 3
    assert result.estimator_version == "test-fixture-1"
