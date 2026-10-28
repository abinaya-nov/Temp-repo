from typing import Protocol

from .models import EstimateRecommendation, IssueInput


class EstimationService(Protocol):
    def estimate(self, issue: IssueInput) -> EstimateRecommendation: ...
