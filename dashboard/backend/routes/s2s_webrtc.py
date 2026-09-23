#!/usr/bin/env python3
"""
Speech-to-Speech WebRTC proxy routes.

Forwards browser WebRTC SDP offers to the local S2S container
(running on voice_gateway_url:voice_gateway_port) and returns SDP answers.
The S2S container handles STT (parakeet-tdt), LLM (Qwen via llama.cpp),
and TTS (Kokoro-82M) internally — the dashboard just proxies the WebRTC handshake.
"""

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
import re
import requests

from dashboard.backend.config import integrations_backend

router = APIRouter()


def _get_s2s_base_endpoint(raw_settings: dict) -> str:
    """Build the S2S container base URL from settings."""
    gateway_url = raw_settings.get("voice_gateway_url", "http://10.1.1.10").rstrip("/")
    gateway_port = str(raw_settings.get("voice_gateway_port", "8765")).strip()
    if gateway_port and not re.search(r":\d+$", gateway_url):
        return f"{gateway_url}:{gateway_port}"
    return gateway_url


@router.post("/api/s2s/calls")
async def s2s_webrtc_call(request: Request):
    """
    WebRTC SDP offer proxy — forwards the browser's SDP offer to the
    local speech-to-speech container and returns the SDP answer.
    """
    raw_settings = integrations_backend.get_system_settings_raw()
    base = _get_s2s_base_endpoint(raw_settings)
    target = f"{base}/v1/realtime/calls"

    try:
        offer_sdp = await request.body()
        if not offer_sdp:
            return JSONResponse(
                status_code=400,
                content={"status": "error", "message": "SDP offer body required"}
            )

        api_key = raw_settings.get("voice_api_key", "")
        headers = {"Content-Type": "application/sdp"}
        if api_key:
            headers["Authorization"] = f"Bearer {api_key}"

        resp = requests.post(target, data=offer_sdp, headers=headers, timeout=30.0)

        if resp.status_code in (200, 201):
            answer_sdp = resp.text
            location = resp.headers.get("Location", "")
            call_id = location.split("/")[-1] if location else ""
            return JSONResponse(content={
                "status": "ok",
                "sdp": answer_sdp,
                "call_id": call_id,
                "server": target
            })
        else:
            return JSONResponse(
                status_code=resp.status_code,
                content={
                    "status": "error",
                    "message": f"S2S WebRTC HTTP {resp.status_code}: {resp.text[:200]}"
                }
            )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "message": f"S2S WebRTC failed: {str(e)}",
                "target": target
            }
        )


@router.delete("/api/s2s/calls/{call_id}")
async def s2s_webrtc_hangup(call_id: str):
    """Hang up a WebRTC call."""
    raw_settings = integrations_backend.get_system_settings_raw()
    base = _get_s2s_base_endpoint(raw_settings)
    target = f"{base}/v1/realtime/calls/{call_id}"

    try:
        api_key = raw_settings.get("voice_api_key", "")
        headers = {}
        if api_key:
            headers["Authorization"] = f"Bearer {api_key}"

        resp = requests.delete(target, headers=headers, timeout=10.0)
        return {
            "status": "ok" if resp.status_code in (200, 204) else "error",
            "code": resp.status_code
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}
