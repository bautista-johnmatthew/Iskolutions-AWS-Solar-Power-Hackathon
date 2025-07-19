import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from clients import AWSClients
from routes import router

class App(FastAPI):
    """Main application class for the Iskolutions Solar Power API."""

    def __init__(
        self,
        service_name: str,
        version: str,
        description: str
    ) -> None:
        super().__init__(
            title=service_name,
            version=version,
            description=description,
        )

        self._init_config()

        # Uncomment only if you have the necessary environment variables set
        # self._init_clients()
        # self._init_middleware()

        self._init_routes()

    def _init_clients(self) -> None:
        """Initialize AWS service clients"""
        self.state.clients = AWSClients()

    def _init_middleware(self) -> None:
        """Add application middleware"""
        self.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    def _init_routes(self) -> None:
        """Register all API routes"""
        self.include_router(router)

def main() -> None:
    """Main entry point for the application"""
    return App(
        service_name="Iskolutions Solar Power API",
        version="1.0.0",
        description="API for managing solar power solutions"
    )

app = main()
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)