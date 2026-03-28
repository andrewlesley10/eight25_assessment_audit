from __future__ import annotations

import json
import shutil
import uuid
from pathlib import Path
from unittest.mock import Mock, patch

import pytest
import requests
from fastapi.testclient import TestClient

import app as api_app
from src.fetcher import fetch_html
from src.prompt_logger import save_prompt_log
from src.schemas import AIAuditOutput
from src.utils import FetchError, validate_url


def test_validate_url_adds_https_scheme() -> None:
    assert validate_url("example.com") == "https://example.com"


def test_blocked_page_detection_raises_specific_error() -> None:
    response = Mock(spec=requests.Response)
    response.status_code = 403
    response.text = "Access denied"
    response.url = "https://example.com"
    response.headers = {"Content-Type": "text/html"}
    response.raise_for_status.side_effect = requests.HTTPError("403")

    session = Mock()
    session.get.return_value = response

    with patch("src.fetcher.requests.Session", return_value=session):
        with pytest.raises(FetchError) as exc_info:
            fetch_html("https://example.com", timeout=15, user_agent="Audit Tool")

    assert exc_info.value.code == "blocked_page"


def test_prompt_logger_saves_repair_trace() -> None:
    tmp_path = Path(__file__).resolve().parent / ".tmp" / uuid.uuid4().hex
    tmp_path.mkdir(parents=True, exist_ok=True)

    paths = save_prompt_log(
        output_dir=tmp_path,
        url="https://example.com",
        model="qwen2.5:7b",
        system_prompt="system",
        user_prompt="user",
        user_prompt_construction={"builder": "build_user_prompt(metrics)"},
        repair_prompt="repair",
        structured_metrics_input={"word_count": 10},
        initial_raw_ollama_response="{bad json",
        final_raw_ollama_response='{"ok": true}',
        parsed_final_json={"ok": True},
        error=None,
    )

    latest_json = json.loads(Path(paths["latest_json_path"]).read_text(encoding="utf-8"))
    assert latest_json["user_prompt_construction"]["builder"] == "build_user_prompt(metrics)"
    assert latest_json["repair_prompt"] == "repair"
    assert latest_json["initial_raw_ollama_response"] == "{bad json"
    assert latest_json["final_raw_ollama_response"] == '{"ok": true}'

    shutil.rmtree(tmp_path, ignore_errors=True)


def test_sample_ai_output_validates() -> None:
    sample_path = Path(__file__).resolve().parents[1] / "samples" / "sample_ai_output.json"
    data = json.loads(sample_path.read_text(encoding="utf-8"))
    parsed = AIAuditOutput.model_validate(data)
    assert len(parsed.recommendations) == 3


def test_api_healthcheck() -> None:
    client = TestClient(api_app.app)
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
