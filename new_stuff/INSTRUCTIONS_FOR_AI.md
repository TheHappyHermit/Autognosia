# AI Agent Instructions: Autognosia New Architecture Diagrams & Text Box Replacements

> **Instructions for the AI Agent:**
> 1. Copy all 22 `.jpg` image files located in this `new_stuff/` directory into the repository's `assets/` directory (e.g. `assets/<image_name>.jpg`).
> 2. Open `README.md` and insert each image at the specified section header below using standard centered HTML tags:
>    ```html
>    <p align="center">
>      <img src="assets/<filename>.jpg" alt="<Descriptive Alt Text>" width="100%" />
>    </p>
>    ```
> 3. Remove the corresponding ASCII / plain text boxes, arrows, or legacy diagrams that each image replaces, as detailed in the matrix below.
> 4. Run the validation script at the bottom of this file to verify that all images resolve with zero broken links.

---

## Complete Placement & Text Box Replacement Matrix

| # | Image Filename | Target Section in `README.md` | Action / Text Box Replaced |
| :- | :--- | :--- | :--- |
| 1 | **`autognosia_banner.jpg`** | Top of file (Hero Banner) | Replaces legacy/old banner with glowing `AUTOGNOSIA: PERSISTENT COGNITIVE ARCHITECTURE FOR HERMES AGENTS`. |
| 2 | **`cognitive_memory_taxonomy.jpg`** | `# The Problem With "Memory"` | Embedded under section header, replacing plain list of temporal memory questions. |
| 3 | **`system_architecture_map.jpg`** | `# Architecture Overview` | Embedded after the subsystem breakdown table to visualize the full Autognosia system architecture. |
| 4 | **`graphify_retrieval_flow.jpg`** | `## Graphify's Role in Retrieval` | **REPLACES TEXT BOX:** 8-stage retrieval sequence (`1. Structured query → Honcho... 8. Refresh derived graphs`). |
| 5 | **`organizer_vs_kanban_division.jpg`** | `# Personal Organizer vs Hermes Kanban` | **REPLACES TEXT BOX:** The text block with arrows (`Hermes Kanban → work for AI` vs `Personal Organizer → work for human`). |
| 6 | **`prospective_event_triggering.jpg`** | `# Prospective Memory Reuses Hermes Automation` | **REPLACES TEXT BOX:** The text block with arrows (`time → cron`, `external push event → webhook`, `task state → organizer event`, `conversation cue → hook`). |
| 7 | **`additive_synthesis_principle.jpg`** | `# Additive Synthesis` | **REPLACES TEXT BOX:** The ASCII comparison boxes (`50 pages of research + concise synthesis` vs `50 pages ↓ 600-word summary ↓ delete`). |
| 8 | **`epistemic_action_gate.jpg`** | `# Epistemic Control — Evidence Is Not Belief` | Replaces legacy diagram with the updated Autognosia Epistemic Control & Inhibitory Action Gate. |
| 9 | **`epistemic_belief_lifecycle.jpg`** | `# Provenance Classes & Belief Revision` | **REPLACES TEXT BOXES:** Replaces the text lists and arrow blocks for Provenance Classes (`USER_STATED` down to `MODEL_INFERENCE`) and Belief Revision (`SUPERSEDED` vs `CURRENT`). |
| 10 | **`planner_world_model_contract.jpg`** | `# Planner — Simulation and Consequences` | **REPLACES TEXT BOX:** The 10-line text box (`CURRENT STATE`, `TARGET STATE`, `DEPENDENCIES`, ..., `ROLLBACK`, `VERIFICATION`). |
| 11 | **`action_gate_decision_matrix.jpg`** | `# Inhibitory Control — The Action Gate` | **REPLACES TEXT BOX:** The pre-operation safety checklist and outcome box (`PASS → act` vs `HOLD → clarify / research / plan`). |
| 12 | **`consequence_gated_execution.jpg`** | `# Value of Information` & `# Experience-Based Competence` | **REPLACES TEXT BOXES:** The consequence examples (`Add milk → proceed`, `Cancel subscription → ask`) and competence benchmarks (`Direct: 11/18` vs `Planner → Main → Verifier: 13/14`). |
| 13 | **`cognitive_routing_modes.jpg`** | `# Reasoning-Mode Selection` | Replaces legacy routing diagram with the updated Autognosia Metacognitive Routing Modes & Dispatch Topology. |
| 14 | **`experience_competence_loop.jpg`** | `# Experience Index — Learning From Reality` | Replaces legacy diagram with the Autognosia Experience Index & Adaptive Competence Loop using `autognosia.db`. |
| 15 | **`three_layer_verification_protocol.jpg`** | `# Auditor — Judgment Only When Reality Has No Simple Test` | **REPLACES TEXT BOX:** The 3-stage text flow (`deterministic check ↓ authoritative evidence ↓ Auditor only if necessary`). |
| 16 | **`procedural_learning_evolution.jpg`** | `# Procedural Learning — Native Hermes Skills` | **REPLACES TEXT BOX:** The ASCII arrow flow (`Operational Experience → Verified Lesson → Proposal → Review → Active Skill Execution`). |
| 17 | **`knowledge_lifecycle_pipeline.jpg`** | `# Knowledge Lifecycle Pipeline` | Replaces legacy pipeline with the 5-stage Knowledge Decanting & Memory Lifecycle diagram. |
| 18 | **`knowledge_reactivation_flow.jpg`** | `# Reactivation` | **REPLACES TEXT BOX:** The ASCII box showing active working pages referencing Oracle Vault records without mutating history. |
| 19 | **`context_capacity_vs_attention.jpg`** | `# Why Not Just Use a Massive Context Window?` | **REPLACES TEXT BOX:** The ASCII diagram contrasting Naive Context Bloat (1,000,000 tokens) with Autognosia 5-stage synthesis. |
| 20 | **`vm_deployment_topology.jpg`** | `# Deployment: Self-Hosted on Linux VM` | Replaces legacy topology diagram with the Autognosia Self-Hosted VM Deployment Topology. |
| 21 | **`metacognitive_routing_flow.jpg`** | `# Metacognitive Routing` | Replaces legacy diagram with the Autognosia Metacognitive Routing Engine diagram. |
| 22 | **`autognosia_cognitive_loop.jpg`** | `# The Short Version` | The master full-circle cognitive loop diagram unifying all subsystems at the conclusion of the README. |

---

## Detailed Section Embed Snippets

### 1. Hero Banner
**Location:** Very top of `README.md`
```html
<p align="center">
  <img src="assets/autognosia_banner.jpg" alt="Autognosia Banner" width="100%" />
</p>
```

### 2. Cognitive Memory Taxonomy
**Location:** Under `# The Problem With "Memory"`
```html
<p align="center">
  <img src="assets/cognitive_memory_taxonomy.jpg" alt="Autognosia Cognitive Question & Memory Taxonomy" width="100%" />
</p>
```

### 3. System Architecture Map
**Location:** Under `# Architecture Overview`
```html
<p align="center">
  <img src="assets/system_architecture_map.jpg" alt="Autognosia System Architecture Map" width="100%" />
</p>
```

### 4. Graphify Retrieval Flow
**Location:** Under `## Graphify's Role in Retrieval` (replacing 8-stage text box)
```html
## Graphify's Role in Retrieval

<p align="center">
  <img src="assets/graphify_retrieval_flow.jpg" alt="Autognosia Graphify Relationship & Multi-Hop Retrieval Flow" width="100%" />
</p>
```

### 5. Human vs Agent Task Orchestration
**Location:** Under `# Personal Organizer vs Hermes Kanban` (replacing text box with arrows)
```html
# Personal Organizer vs Hermes Kanban

The distinction is intentional.

<p align="center">
  <img src="assets/organizer_vs_kanban_division.jpg" alt="Autognosia Human vs Agent Task Orchestration" width="100%" />
</p>

Both contain tasks. They represent different kinds of actors and authority.
```

### 6. Prospective Event Triggering Architecture
**Location:** Under `# Prospective Memory Reuses Hermes Automation` (replacing text box with arrows)
```html
# Prospective Memory Reuses Hermes Automation

Autognosia does not create another scheduling engine. It maps intentions onto existing execution primitives:

<p align="center">
  <img src="assets/prospective_event_triggering.jpg" alt="Autognosia Prospective Event-Triggering Architecture" width="100%" />
</p>
```

### 7. Additive Multi-Resolution Synthesis
**Location:** Under `# Additive Synthesis` (replacing `50 pages + concise synthesis` vs `50 pages ↓ summary ↓ delete` text boxes)
```html
# Additive Synthesis

Autognosia preserves raw ground evidence while generating high-density executive summaries:

<p align="center">
  <img src="assets/additive_synthesis_principle.jpg" alt="Autognosia Additive Multi-Resolution Synthesis" width="100%" />
</p>

Future models may reinterpret old evidence better. The raw evidence should always remain preserved.
```

### 8. Epistemic Action Gate
**Location:** Under `# Epistemic Control — Evidence Is Not Belief`
```html
<p align="center">
  <img src="assets/epistemic_action_gate.jpg" alt="Autognosia Epistemic Control & Inhibitory Action Gate" width="100%" />
</p>
```

### 9. Epistemic Belief Lifecycle & Provenance Hierarchy
**Location:** Under `# Provenance Classes & Belief Revision` (replacing text boxes)
```html
# Provenance Classes & Belief Revision

<p align="center">
  <img src="assets/epistemic_belief_lifecycle.jpg" alt="Autognosia Epistemic Belief Lifecycle & Provenance Hierarchy" width="100%" />
</p>

This prevents the most dangerous long-term-memory failure mode: an unverified model inference silently getting stored, retrieved months later, and hallucinated as *"you explicitly told me..."*. Knowledge evolves without erasing historical ground truth: outdated facts transition to `SUPERSEDED` while current discoveries become `VERIFIED`.
```

### 10. Planner World-Model & State Contract
**Location:** Under `# Planner — Simulation and Consequences` (replacing 10-line text box)
```html
# Planner — Simulation and Consequences

Some requests should not go straight from language to action. Planner evaluates state transitions and simulates consequences before execution:

<p align="center">
  <img src="assets/planner_world_model_contract.jpg" alt="Autognosia Planner World-Model & State Evaluation Contract" width="100%" />
</p>

This is Autognosia's practical world-model layer. It predicts consequences ahead of time; the Verifier later observes reality.
```

### 11. Inhibitory Action Gate Decision Matrix
**Location:** Under `# Inhibitory Control — The Action Gate` (replacing checklist & PASS/HOLD text box)
```html
# Inhibitory Control — The Action Gate

The Autognosia Action Gate operates before consequential operations:

<p align="center">
  <img src="assets/action_gate_decision_matrix.jpg" alt="Autognosia Inhibitory Action Gate Decision Matrix" width="100%" />
</p>
```

### 12. Consequence-Gated Execution & Competence Routing
**Location:** Under `# Value of Information` (replacing example & competence text boxes)
```html
# Value of Information

<p align="center">
  <img src="assets/consequence_gated_execution.jpg" alt="Autognosia Consequence-Gated Execution & Competence Routing" width="100%" />
</p>

Future tasks of the same class preferentially use the empirically verified route logged in `autognosia.db`. That is practical metacognition: not subjective model confidence, but **"this routing topology has empirically succeeded more often."**
```

### 13. Metacognitive Routing Engine
**Location:** Under `# Metacognitive Routing`
```html
<p align="center">
  <img src="assets/metacognitive_routing_flow.jpg" alt="Hermes Metacognitive Routing Engine" width="100%" />
</p>
```

### 14. Cognitive Routing Modes & Dispatch Topology
**Location:** Under `# Reasoning-Mode Selection`
```html
<p align="center">
  <img src="assets/cognitive_routing_modes.jpg" alt="Autognosia Metacognitive Routing Modes & Dispatch Topology" width="100%" />
</p>
```

### 15. Experience Index & Adaptive Competence Loop
**Location:** Under `# Experience Index — Learning From Reality`
```html
<p align="center">
  <img src="assets/experience_competence_loop.jpg" alt="Autognosia Experience Index & Adaptive Competence Loop" width="100%" />
</p>
```

### 16. Three-Layer Reality Verification Protocol
**Location:** Under `# Auditor — Judgment Only When Reality Has No Simple Test` (replacing text box with arrows)
```html
# Auditor — Judgment Only When Reality Has No Simple Test

The verification order is strictly layered:

<p align="center">
  <img src="assets/three_layer_verification_protocol.jpg" alt="Autognosia Three-Layer Reality Verification Protocol" width="100%" />
</p>
```

### 17. Procedural Learning & Skill Evolution Pipeline
**Location:** Under `# Procedural Learning — Native Hermes Skills` (replacing text box with arrows)
```html
# Procedural Learning — Native Hermes Skills

The result of repeated experience is a native, governed Hermes Skill:

<p align="center">
  <img src="assets/procedural_learning_evolution.jpg" alt="Autognosia Procedural Learning & Skill Evolution Pipeline" width="100%" />
</p>
```

### 18. Knowledge Lifecycle Pipeline
**Location:** Under `# Knowledge Lifecycle Pipeline`
```html
<p align="center">
  <img src="assets/knowledge_lifecycle_pipeline.jpg" alt="Autognosia Knowledge Decanting & Lifecycle Pipeline" width="100%" />
</p>
```

### 19. Historical Knowledge Reactivation Flow
**Location:** Under `# Reactivation` (replacing text box with arrows)
```html
# Reactivation

<p align="center">
  <img src="assets/knowledge_reactivation_flow.jpg" alt="Autognosia Historical Knowledge Reactivation Flow" width="100%" />
</p>
```

### 20. Context Capacity vs Focused Attention
**Location:** Under `# Why Not Just Use a Massive Context Window?` (replacing ASCII diagram)
```html
# Why Not Just Use a Massive Context Window?

<p align="center">
  <img src="assets/context_capacity_vs_attention.jpg" alt="Autognosia Context Capacity vs Focused Attention" width="100%" />
</p>
```

### 21. Self-Hosted VM Deployment Topology
**Location:** Under `# Deployment: Self-Hosted on Linux VM`
```html
<p align="center">
  <img src="assets/vm_deployment_topology.jpg" alt="Autognosia Self-Hosted VM Deployment Topology" width="100%" />
</p>
```

### 22. The Complete Autognosia Cognitive Loop
**Location:** Under `# The Short Version`
```html
# The Short Version

Autognosia aims for:

<p align="center">
  <img src="assets/autognosia_cognitive_loop.jpg" alt="The Complete Autognosia Cognitive Loop" width="100%" />
</p>

All while keeping the evidence that made the system smarter.
```

---

## Automated Validation Script

Run this script to verify that all images exist in `assets/` and resolve in `README.md`:

```python
import os, re

with open('README.md', 'r', encoding='utf-8') as f:
    content = f.read()

images = re.findall(r'<img\s+src=["\']([^"\']+)["\']', content)
print(f"Total image tags in README.md: {len(images)}")

all_ok = True
for idx, path in enumerate(images, 1):
    exists = os.path.exists(path)
    status = "OK" if exists else "MISSING"
    size = os.path.getsize(path) if exists else 0
    print(f"{idx:2d}. [{status}] {path} ({size:,} bytes)")
    if not exists:
        all_ok = False

if all_ok:
    print("\nSUCCESS: All images exist and resolve with 100% accuracy!")
```
