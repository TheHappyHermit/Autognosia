#!/usr/bin/env python3
"""
Generate 4 Midjourney renders from the revised DRAFTS pit sheet.
Saves each result as a JPG next to this script.
Tolerant: continues on per-image failure; prints what succeeded.
"""
import os, time, urllib.request, json, base64, shutil
from pathlib import Path

WORK = Path("/home/josh434/temp/2026-09-13-18-01-12")
WORK.mkdir(parents=True, exist_ok=True)

MJ_API_KEY = os.environ.get("MJ_API_KEY")
if not MJ_API_KEY:
    raise SystemExit("MJ_API_KEY not set. Set it and re-run.")

OUT = {
    "brief": WORK / "brief.jpg",
    "cover": WORK / "cover.jpg",
    "cover2": WORK / "cover2.jpg",
    "aftermath": WORK / "aftermath.jpg",
}

PROMPTS = {
    "brief": (
        "A frozen lake at dusk, a man standing center-frame alone, breath pluming in cold air, "
        "snow crusted on a wool coat, staring at broken black ice, hard backlight from a low amber streetlamp, "
        "long blue shadows, desaturated cool palette with one warm accent, low camera, wide lens, 35mm film grain, "
        "no soft glow, no lens flare, the quiet before a hard choice "
        "--ar 16:9 --style raw --stylize 250 --v 6.0 --seed 81402"
    ),
    "cover": (
        "Empty glass-walled conference room at night, overhead lights off, only cold blue city light through the far window, "
        "dead monitor reflection on a polished table, a man sits center, tie loosened, eyes flat, jacket draped over the chair back, "
        "neon spill from outside paints one cheek red, hard chiaroscuro, crushed blacks, practical light only, tight medium shot, "
        "50mm, shallow DOF, corporate noir, no softening "
        "--ar 16:9 --style raw --stylize 250 --v 6.0 --seed 81403"
    ),
    "cover2": (
        "Rain-slicked driveway at 2AM under a sodium streetlamp, puddles mirror the orange glow and a taxi's dashboard lights, "
        "a man in a soaked coat stands under the car, one hand on the roof, wedding band catching a glint of light, gritty street photography, "
        "wet asphalt texture, high contrast, cool shadows with a warm practical accent, handheld feel, slight rain motion, 35mm, "
        "no over-polish, no bloom "
        "--ar 16:9 --style raw --stylize 250 --v 6.0 --seed 81404"
    ),
    "aftermath": (
        "Hotel bathroom sink at dawn, a clenched hand on the porcelain edge, wedding ring flat on the wet basin beside a pyramid of "
        "980 crumpled napkins soaked through, cold window light, no blood shown but implied by the red ring glint and a dark stain on paper, "
        "stark, low-key, matte textures, 35mm film grain, shallow focus on hand and ring, restraint as violence, no melodrama "
        "--ar 16:9 --style raw --stylize 250 --v 6.0 --seed 81405"
    ),
}

MJ_URL = "https://api.midjourney.com/v1/generations"

def submit(prompt: str, seed: int):
    req = urllib.request.Request(
        MJ_URL,
        data=json.dumps({
            "prompt": prompt,
            "aspect_ratio": "16:9",
            "model_version": "6.0",
            "style": "raw",
            "stylize": 250,
            "seed": seed,
            "wait_for_completion": True,
            "notification_channel": None,
        }).encode(),
        headers={
            "Authorization": f"Bearer {MJ_API_KEY}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read())["id"]

def poll(job_id: str, timeout_s: int = 540) -> str:
    """Poll until job completes; return image URL or raise."""
    url = f"{MJ_URL}/{job_id}"
    headers = {"Authorization": f"Bearer {MJ_API_KEY}"}
    deadline = time.time() + timeout_s
    while time.time() < deadline:
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=30) as resp:
                payload = json.loads(resp.read())
            status = payload.get("status", "")
            if status == "completed":
                assets = payload.get("assets") or {}
                img = assets.get("image") or assets.get("legacy") or assets.get("url")
                if img:
                    return img
                raise RuntimeError(f"completed but no image URL: {payload}")
            if status in ("failed", "cancelled", "timed_out"):
                raise RuntimeError(f"job {status}: {payload.get('error') or payload.get('status')}")
        except Exception as e:
            # on network hiccup, retry after a beat
            time.sleep(5)
            continue
        time.sleep(8)
    raise TimeoutError(f"job {job_id} not complete within {timeout_s}s")

def download(url: str, path: Path):
    req = urllib.request.Request(url, headers={"User-Agent": "python/urllib"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        data = resp.read()
    path.write_bytes(data)
    print(f"  saved: {path} ({len(data)} bytes)")

def main():
    print("Drafts — 4 renders (Ben/Rebeka)\n")
    for name, prompt in PROMPTS.items():
        out = OUT[name]
        if out.exists():
            print(f"[{name}] already exists, skipping.")
            continue
        print(f"[{name}] submitting...")
        seed = {"brief": 81402, "cover": 81403, "cover2": 81404, "aftermath": 81405}[name]
        try:
            job_id = submit(prompt, seed)
            print(f"  job id: {job_id}")
            img_url = poll(job_id)
            print(f"  done, downloading...")
            download(img_url, out)
        except Exception as e:
            print(f"  FAILED: {e}")
            continue
    print("\nDone.")

if __name__ == "__main__":
    main()
