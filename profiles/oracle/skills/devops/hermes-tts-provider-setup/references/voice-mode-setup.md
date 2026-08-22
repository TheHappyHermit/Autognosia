# Complete Voice Mode Setup — Local Voice Chat (No Phone/Twilio)

> For users who want to **speak to Hermes and hear replies** locally via TUI — not receive phone calls.

## Prerequisites

```bash
# 1. ElevenLabs API key (for premium TTS)
echo "ELEVENLABS_API_KEY=your_key" >> ${HOME}/.hermes/.env

# 2. Install local Whisper (for STT)
cd ${HOME}/.hermes/hermes-agent && source venv/bin/activate
pip install faster-whisper -q

# 3. Verify whisper CLI available
which whisper
```

## One-Command Config

```bash
# TTS → ElevenLabs
hermes config set tts.provider elevenlabs
hermes config set tts.elevenlabs.voice_id pNInz6obpgDQGcFmaJgB   # Adam (default)
hermes config set tts.elevenlabs.model_id eleven_multilingual_v2

# STT → Local Whisper
hermes config set stt.provider local
hermes config set stt.local.model base

# Voice mode: hold Ctrl+B to speak, auto-play replies
hermes config set voice.auto_tts true
hermes config set voice.record_key ctrl+b
```

## Verify

```bash
# Test TTS
hermes --t2s "Voice mode ready"  # or use text_to_speech_tool via Python

# Test STT (requires audio file)
python3 -c "
from hermes_tools.transcription_tools import transcribe_audio
result = transcribe_audio('/path/to/test.wav', model='base')
print(result)
"

# Full voice chat
hermes --tui
# Hold Ctrl+B → speak → release → Hermes replies with ElevenLabs voice
```

## Key Distinction: ElevenLabs "Skills" vs Hermes Built-in

| | ElevenLabs Agent Skills | Hermes Built-in TTS/STT |
|---|---|---|
| **Format** | Markdown folders (Agent Skills spec) | `SKILL.md` + Python tools |
| **Installed via** | `npx skills add elevenlabs/skills` | Already in Hermes |
| **Target** | Cursor, Claude Code, Codex | Hermes Agent runtime |
| **Capabilities** | Sound FX, Music, Voice Changer, ConvAI Agents | TTS, STT, Voice Mode |
| **Phone calls** | Yes (via ElevenAgents + Twilio) | No (different architecture) |

> The blog post showing "Hermes answering phone calls" uses **ElevenLabs ConvAI Agents** calling Hermes via `/v1/chat/completions` — that's the **ElevenAgents** product, not a skill you install into Hermes.

## Voice Mode Config Reference

```yaml
# ${HOME}/.hermes/config.yaml
tts:
  provider: elevenlabs
  elevenlabs:
    voice_id: pNInz6obpgDQGcFmaJgB
    model_id: eleven_multilingual_v2

stt:
  enabled: true
  provider: local
  local:
    model: base

voice:
  record_key: ctrl+b
  max_recording_seconds: 120
  auto_tts: true
  beep_enabled: true
  silence_threshold: 200
  silence_duration: 3.0
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "ELEVENLABS_API_KEY not set" | Add to `${HOME}/.hermes/.env` |
| STT returns empty / fails | `pip install faster-whisper` in Hermes venv |
| `whisper` command not found | Same — install in the correct venv |
| Audio plays but no transcription | Check `stt.enabled: true` and `stt.provider: local` |
| Voice doesn't change after config | `systemctl --user restart hermes-gateway` |

## Files Modified in This Session

- `${HOME}/.hermes/.env` — Added `ELEVENLABS_API_KEY`
- `${HOME}/.hermes/config.yaml` — TTS/STT/voice settings (via `hermes config set`)
- `${HOME}/.hermes/hermes-agent/venv` — Installed `faster-whisper`