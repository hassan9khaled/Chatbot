from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    ollama_model: str = "gemma3:1b"
    code_execution_timeout: int = 15
    static_dir: str = "static"
    templates_dir: str = "templates"

    class Config:
        env_prefix = "AI_ASSISTANT_"


settings = Settings()