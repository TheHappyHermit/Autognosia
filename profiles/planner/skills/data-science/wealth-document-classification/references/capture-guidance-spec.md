# Document Capture Guidance Engine — UX Specs

## Purpose

Real-time feedback during document capture to improve OCR confidence by 15-25%.

## Guidance Types

### 1. Orientation Correction
- **Detection:** Edge detection + text line angle analysis
- **Feedback:** "Rotate [N]° clockwise/counter-clockwise for best results"
- **Implementation:** Use OpenCV Hough line transform on text lines
- **Trigger:** Text line angle > 5° from horizontal/vertical

### 2. Distance/Resolution Warning
- **Detection:** Edge sharpness analysis (Laplacian variance)
- **Feedback:** "Move phone closer — text is too small to read clearly"
- **Implementation:** Measure edge sharpness; compare against minimum threshold
- **Trigger:** Sharpness below minimum for readable text

### 3. Lighting Feedback
- **Detection:** Histogram analysis (mean intensity, standard deviation)
- **Feedback:** "Too dark" / "Too bright" / "Add light source"
- **Implementation:** Analyze image histogram; flag under/over-exposed regions
- **Trigger:** Mean intensity < 60 (too dark) or > 220 (too bright)

### 4. Blur Detection
- **Detection:** Laplacian variance of grayscale image
- **Feedback:** "Image appears blurry — hold steady and try again"
- **Implementation:** Compute Laplacian variance; compare against blur threshold
- **Trigger:** Laplacian variance < 100 (blurry)

### 5. Edge/Frame Detection
- **Detection:** Canny edge detection + contour finding
- **Feedback:** "Document edges not fully captured" / "Align document within frame"
- **Implementation:** Compare detected document edges to image frame
- **Trigger:** Document edges < 80% of image frame

### 6. Perspective Distortion
- **Detection:** Document corner detection + perspective transform analysis
- **Feedback:** "Document is at an angle — try to photograph straight on"
- **Implementation:** Compare document corners to rectangular shape
- **Trigger:** Perspective distortion > 15°

## Implementation Architecture

```
Mobile App (Client-Side)
├── Camera preview with overlay guides
├── Real-time quality analysis (on-device ML)
├── Quality score computation
├── Guidance message rendering
└── Auto-capture trigger (when quality ≥ threshold)

Backend (Server-Side)
├── Document type classification
├── Post-capture quality assessment
├── OCR confidence scoring
└── Feedback loop for guidance improvement
```

## Quality Score Formula

```
quality_score = w1 * sharpness + w2 * lighting + w3 * edge_coverage + w4 * perspective + w5 * resolution

where:
  sharpness = min(1.0, laplacian_variance / threshold_sharpness)
  lighting = 1.0 - |mean_intensity - 128| / 128
  edge_coverage = detected_edges / frame_edges
  perspective = cos(perspective_angle)
  resolution = min(1.0, dpi / 300)

Weights (tune per document type):
  Typed PDF:  w1=0.2, w2=0.1, w3=0.1, w4=0.1, w5=0.5 (resolution dominant)
  Phone photo: w1=0.3, w2=0.25, w3=0.2, w4=0.15, w5=0.1 (sharpness dominant)
  Scanned:    w1=0.2, w2=0.2, w3=0.3, w4=0.1, w5=0.2 (edge coverage dominant)
```

## Auto-Capture Trigger

- **When quality_score ≥ 0.75:** Offer auto-capture option
- **When quality_score ≥ 0.85:** Auto-capture enabled (user can disable)
- **When quality_score < 0.50:** Block capture, show guidance

## Key UX Principles

1. **Specific feedback:** Never say "poor quality" — say exactly what's wrong and how to fix it
2. **Positive framing:** "Move closer" not "too far away"
3. **Visual guides:** Overlay frame/lines on camera preview
4. **Progressive disclosure:** Show one guidance message at a time, not all at once
5. **Auto-capture:** When quality is good enough, make it effortless to capture
