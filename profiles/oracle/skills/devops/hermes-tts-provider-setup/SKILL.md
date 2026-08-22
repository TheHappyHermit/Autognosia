---
name: hermes-tts-provider-setup
category: devops
description: Configure Hermes Agent TTS/STT providers (ElevenLabs, OpenAI, XAI, Mistral, Piper, Edge), manage voice settings, and handle API keys in .env
version: 1.0.0
author: Hermes Agent
license: MIT
---

# Hermes TTS/STT Provider Setup & Configuration

## When to Use
- Switching TTS provider (e.g., from `edge` to `elevenlabs`, `openai`, `xai`, `mistral`, `piper`)
- Configuring STT provider (local Whisper, OpenAI, Mistral Voxtral, ElevenLabs Scribe)
- Setting/changing voice IDs, models, or provider-specific options
- Adding API keys to `${HOME}/.hermes/.env` for premium providers
- Debugging TTS/STT failures (missing keys, wrong model IDs, 401 errors)

## Quick Start: Switch to ElevenLabs TTS

```bash
# 1. Add API key to .env (required for ElevenLabs, OpenAI, XAI, Mistral)
echo "ELEVENLABS_API_KEY=your_key_here" >> ${HOME}/.hermes/.env

# 2. Switch TTS provider
hermes config set tts.provider elevenlabs

# 3. Verify it works
hermes --tts "Hello from ElevenLabs"
```

## Config Structure (from `${HOME}/.hermes/config.yaml`)

### TTS Section (`tts:`)
```yaml
tts:
  provider: edge          # edge | elevenlabs | openai | xai | mistral | piper
  edge:
    voice: en-US-AriaNeural
  elevenlabs:
    voice_id: pNInz6obpgDQGcFmaJgB   # Default: Adam
    model_id: eleven_multilingual_v2
  openai:
    model: gpt-4o-mini-tts
    voice: alloy
  xai:
    voice_id: eve
    language: en
    sample_rate: 24000
    bit_rate: 128000
  mistral:
    model: voxtral-mini-tts-2603
    voice_id: c69964a6-ab8b-4f8a-9465-ec0925096ec8
  piper:
    voice: en_US-lessac-medium
```

### STT Section (`stt:`)
```yaml
stt:
  enabled: true
  provider: local              # local | openai | mistral | elevenlabs
  local:
    model: base                # tiny, base, small, medium, large
    language: ''               # empty = auto-detect
  openai:
    model: whisper-1
  mistral:
    model: voxtral-mini-latest
  elevenlabs:
    model_id: scribe_v2
    language_code: ''
    tag_audio_events: false
    diarize: false
```

### Voice Section (`voice:`)
```yaml
voice:
  record_key: ctrl+b
  max_recording_seconds: 120
  auto_tts: false
  beep_enabled: true
  silence_threshold: 200
  silence_duration: 3.0
```

## Provider Requirements

| Provider | TTS | STT | API Key Required | Key Env Var | Notes |
|----------|-----|-----|------------------|-------------|-------|
| `edge` | ✅ | ❌ | No | — | Free, offline, Microsoft voices |
| `elevenlabs` | ✅ | ✅ | **Yes** | `ELEVENLABS_API_KEY` | Premium quality, 70+ languages |
| `openai` | ✅ | ✅ | **Yes** | `OPENAI_API_KEY` | GPT-4o-mini TTS, Whisper STT |
| `xai` | ✅ | ❌ | **Yes** | `XAI_API_KEY` | Grok TTS voices |
| `mistral` | ✅ | ✅ | **Yes** | `MISTRAL_API_KEY` | Voxtral models |
| `piper` | ✅ | ❌ | No | — | Local, offline, many voices |
| `local` (Whisper) | ❌ | ✅ | No | — | Runs locally, `faster-whisper` |

## Managing API Keys in `.env`

### Location
`${HOME}/.hermes/.env` (auto-loaded by Hermes at startup)

### Adding Keys
```bash
# Single key
echo "ELEVENLABS_API_KEY=sk_xxxxx" >> ${HOME}/.hermes/.env

# Multiple keys at once
cat >> ${HOME}/.hermes/.env << 'EOF'
ELEVENLABS_API_KEY=sk_xxxxx
OPENAI_API_KEY=sk-xxxxx
MISTRAL_API_KEY=xxxxx
XAI_API_KEY=xxxxx
EOF
```

### Verifying Keys Are Loaded
```bash
# Check TTS tool can see the key
python3 -c "
from hermes_tools.tts_tool import get_env_value
print('ELEVENLABS_API_KEY:', 'set' if get_env_value('ELEVENLABS_API_KEY') else 'NOT SET')
"
```

## Switching Providers via CLI

```bash
# TTS provider
hermes config set tts.provider elevenlabs
hermes config set tts.provider openai
hermes config set tts.provider edge

# TTS voice (provider-specific)
hermes config set tts.elevenlabs.voice_id EXAVITQu4vr4xnSDxMaL   # Bella
hermes config set tts.openai.voice nova

# TTS model (provider-specific)
hermes config set tts.elevenlabs.model_id eleven_flash_v2_5   # Lower latency
hermes config set tts.openai.model gpt-4o-mini-tts

# STT provider
hermes config set stt.provider elevenlabs
hermes config set stt.provider openai
hermes config set stt.provider local

# STT model
hermes config set stt.local.model small
hermes config set stt.elevenlabs.model_id scribe_v2
```

## Common Pitfalls & Fixes

### 1. "ELEVENLABS_API_KEY not set" / 401 Unauthorized
**Cause**: Premium provider selected but API key missing from `.env`
**Fix**: Add `ELEVENLABS_API_KEY=...` to `${HOME}/.hermes/.env` and restart Hermes

### 2. STT not working with `provider: elevenlabs`
**Cause**: `stt.enabled: false` or missing `stt.elevenlabs` config section
**Fix**: Ensure `stt.enabled: true` and `stt.provider: elevenlabs` in config

### 3. Voice not changing after config update
**Cause**: Hermes may cache provider client; need restart
**Fix**: Restart Hermes gateway: `systemctl --user restart hermes-gateway`

### 4. Piper voice not found
**Cause**: Voice name must match installed Piper voice exactly
**Fix**: List available: `piper --list-voices` or check `${HOME}/.local/share/piper/voices/`

### 5. Local Whisper model download fails
**Cause**: No internet or model not cached
**Fix**: Pre-download: `faster-whisper-base` downloads on first use; run once manually

## Debugging Commands

### Test TTS
```bash
# Quick test via CLI
hermes --tts "Testing text to speech"

# Via Python (bypasses CLI)
python3 -c "
import asyncio
from hermes.agent.agent import AIAgent
from hermes.config import load_config
cfg = load_config()
async def test():
    agent = AIAgent(cfg)
    await agent.tts_say('Testing TTS')
asyncio.run(test())
"
```

### Test STT
```bash
# Record and transcribe
hermes --stt

# Or with file
hermes --stt-file /path/to/audio.wav
```

### List Available Voices
```bash
# ElevenLabs (requires API key)
python3 -c "
import os, requests
key = os.getenv('ELEVENLABS_API_KEY')
if key:
    r = requests.get('https://api.elevenlabs.io/v1/voices', headers={'xi-api-key': key})
    for v in r.json().get('voices', []):
        print(f'{v[\"name\"]}: {v[\"voice_id\"]}')
else:
    print('ELEVENLABS_API_KEY not set')
"

# Piper
piper --list-voices
```

## Advanced: Custom Voice Settings

### ElevenLabs Voice Settings (via config)
```yaml
tts:
  elevenlabs:
    voice_id: pNInz6obpgDQGcFmaJgB
    model_id: eleven_multilingual_v2
    # Optional: stability, similarity_boost, style, use_speaker_boost
    # These are passed to the API per-request
```

### Streaming TTS (low latency)
```yaml
tts:
  elevenlabs:
    model_id: eleven_flash_v2_5   # Optimized for streaming
```

## References
- [Hermes TTS Documentation](https://hermes-agent.nousresearch.com/docs/user-guide/features/tts)
- [ElevenLabs API Docs](https://elevenlabs.io/docs/api-reference)
- [OpenAI TTS Guide](https://platform.openai.com/docs/guides/text-to-speech)
- [Piper TTS GitHub](https://github.com/rhasspy/piper)
- [faster-whisper](https://github.com/SYSTRAN/faster-whisper)
- `references/voice-mode-setup.md` — Complete local voice chat setup (TTS + STT + auto_tts, no phone/Twilio)
- `references/elevenlabs-voices.md` — Voice ID and model reference

## Related Skills
- `hermes-config-yaml-repair`: For fixing YAML formatting issues in config.yaml
- `hermes-fallback-provider-setup`: For model fallback provider chains (different from TTS)
- `hermes-agent-backup`: For backing up config and .env together