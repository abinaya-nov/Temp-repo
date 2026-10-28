from fastapi import FastAPI

from . import __version__
from .models import HealthResponse


def create_app() -> FastAPI:
    application = FastAPI(title="JiraTron API", version=__version__)

    @application.get("/api/health", response_model=HealthResponse)
    def health() -> HealthResponse:
        return HealthResponse(version=__version__)

    return application


app = create_app()
