# ElevenLabs Voice ID Reference

## Default Voices (from ElevenLabs)

| Voice Name | Voice ID | Description |
|------------|----------|-------------|
| **Adam** | `pNInz6obpgDQGcFmaJgB` | Deep, authoritative male (default in Hermes config) |
| **Antoni** | `ErXwobaYiN019PkySvjV` | Well-rounded, natural male |
| **Arnold** | `VR6AewLTigWG4xSOukaG` | Crisp, professional male |
| **Bella** | `EXAVITQu4vr4xnSDxMaL` | Soft, friendly female |
| **Domi** | `AZnzlk1XvdvUeBnXmlld` | Strong, confident female |
| **Elli** | `MF3mGyEYCl7XYWbV9V6O` | Gentle, calm female |
| **Josh** | `TxGEqnHWrfWFTfGW9XjX` | Deep, resonant male |
| **Rachel** | `21m00Tcm4TlvDq8ikWAM` | Clear, professional female |
| **Sam** | `yoZ06aMxZJJ28mfd3POQ` | Neutral, conversational male |

## Popular Community Voices

| Voice Name | Voice ID | Notes |
|------------|----------|-------|
| **Brian** | `nPczCjzI2devNBz1zQrb` | British narrator style |
| **Liam** | `TX3LPaxmHKxFgd7VOc4V` | Warm, storytelling male |
| **Charlotte** | `XB0fDUnXU5powFXDhCwa` | British female, elegant |
| **Matilda** | `XrExE9yKZqltjR4uLz9g` | Expressive, dynamic female |
| **Thomas** | `GBv7mTt0atIp3Br8iCZE` | Deep, cinematic male |

## Model IDs

| Model ID | Description | Max Text Length | Latency |
|----------|-------------|-----------------|---------|
| `eleven_multilingual_v2` | Multilingual, high quality (default) | 5,000 chars | Medium |
| `eleven_flash_v2_5` | Ultra-low latency, English only | 2,500 chars | **Lowest** |
| `eleven_turbo_v2_5` | Fast, good quality | 5,000 chars | Low |
| `eleven_monolingual_v1` | English only, legacy | 2,500 chars | Low |

**Recommendation**: Use `eleven_multilingual_v2` for quality, `eleven_flash_v2_5` for streaming/real-time.

## Finding More Voices

```bash
# List all available voices (requires API key)
python3 -c "
import os, requests
key = os.getenv('ELEVENLABS_API_KEY')
if key:
    r = requests.get('https://api.elevenlabs.io/v1/voices', headers={'xi-api-key': key})
    for v in r.json().get('voices', []):
        print(f'{v[\"name\"]:20}  {v[\"voice_id\"]}  ({\"premade\" if v.get(\"category\") == \"premade\" else \"generated\"})')
else:
    print('ELEVENLABS_API_KEY not set')
"
```

## Voice Settings (per-request)

These can be passed in the TTS request for fine-tuning:

| Parameter | Range | Default | Effect |
|-----------|-------|---------|--------|
| `stability` | 0.0–1.0 | 0.5 | Lower = more variable/expressive |
| `similarity_boost` | 0.0–1.0 | 0.75 | Higher = closer to original voice |
| `style` | 0.0–1.0 | 0.0 | Higher = more expressive/style transfer |
| `use_speaker_boost` | bool | true | Enhances speaker similarity |

Example API call:
```json
{
  "text": "Hello world",
  "voice_id": "pNInz6obpgDQGcFmaJgB",
  "model_id": "eleven_multilingual_v2",
  "voice_settings": {
    "stability": 0.3,
    "similarity_boost": 0.8,
    "style": 0.2,
    "use_speaker_boost": true
  }
}
```