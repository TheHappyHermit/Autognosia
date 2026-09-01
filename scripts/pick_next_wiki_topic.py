#!/usr/bin/env python3
"""Pick the next topic for deep research into the Oracle Brain.

Priority order:
  1. Pending research-request packages in ~/.autognosia/exchange/research/
     (consumed: moved to archive/ so they are never processed twice)
  2. Frontier catalog of cognition/neuroscience/psychology topics chosen to
     deepen a faithful AI cognitive architecture (see CATALOG below)

Skips anything whose page already exists in the Oracle Brain (case-insensitive,
fuzzy substring match on slug words). Outputs exactly one topic as JSON on
stdout. With --dry-run nothing is consumed/archived.

Usage: pick_next_wiki_topic.py [--dry-run]
"""

import argparse
import json
import os
import re
import shutil
from datetime import datetime, timezone

HOME = os.path.expanduser("~")
BRAIN = os.path.join(HOME, ".autognosia", "oracle", "brain")
EXCHANGE = os.path.join(HOME, ".autognosia", "exchange", "research")
ARCHIVE = os.path.join(EXCHANGE, "archive")
CLAIMS = os.path.join(HOME, ".autognosia", "exchange", "claims")
CLAIM_TTL_SECONDS = 3600  # stale claims (crashed ticks) expire after 1h

# Frontier topics for building a faithful cognitive system.
# domain: subdirectory under brain/ ; slug: page filename base
CATALOG = [
    # --- Memory architecture ---
    ("Memory-Architecture", "Complementary-Learning-Systems", "Complementary Learning Systems Theory",
     "Hippocampal rapid learning vs neocortical slow consolidation — the biological case for hot/warm/cold memory tiers.",
     "Directly justifies Autognosia's three-tier memory design."),
    ("Memory-Architecture", "Hippocampal-Indexing-Theory", "Hippocampal Indexing Theory",
     "The hippocampus stores indexes, not content — pointers into cortical stores. Biological provenance links.",
     "Pattern for storing pointers/evidence-links instead of duplicating knowledge."),
    ("Memory-Architecture", "Systems-Consolidation-Replay", "Sleep Replay and Systems Consolidation",
     "Sharp-wave ripples replay waking sequences during sleep, transferring memory to autognosia. Scheduling consolidation offline.",
     "Model for the nightly consolidation cascade without destroying sources."),
    ("Memory-Architecture", "Episodic-Semantic-Semanticization", "How Episodes Become Semantics (Semanticization)",
     "Episodes are repeatedly retrieved until only their gist remains — natural distillation without deletion.",
     "Additive synthesis: gist extraction while preserving raw episodes."),
    ("Memory-Architecture", "Retrieval-Induced-Forgetting", "Retrieval-Induced Forgetting and Inhibition",
     "Retrieving some memories actively suppresses competitors. Retrieval practice has costs.",
     "Why retrieval design shapes what becomes inaccessible — caution for RAG tuning."),
    # --- Prospective memory & intention ---
    ("Prospective-Memory", "Prospective-Memory-Cueing", "Prospective Memory: Cue Sensitivity and Monitoring",
     "Event-based vs time-based intentions; focal cues; monitoring costs; multiprocess theory.",
     "Design rules for IF-cue THEN-action intention engine reliability."),
    ("Prospective-Memory", "Implementation-Intentions", "Implementation Intentions (Gollwitzer)",
     "'If situation X, I will do Y' formats dramatically increase follow-through. Format effects on goal completion.",
     "Exact format for encoding agent intentions so they actually fire."),
    # --- Metacognition & epistemics ---
    ("Metacognition", "Metacognitive-Sensitivity", "Metacognitive Sensitivity and Confidence Calibration",
     "meta-d'/d', confidence-accuracy dissociation, calibration curves, domain specificity.",
     "How the agent should score its own certainty — calibration instrumentation."),
    ("Metacognition", "Feeling-of-Knowing", "Tip-of-the-Tongue and Feeling-of-Knowing",
     "Accessible-but-not-retrievable states; predictions of future retrievability.",
     "Detecting 'I know we have this somewhere' before failing retrieval."),
    ("Metacognition", "Source-Monitoring-Framework", "Source Monitoring Framework",
     "How the mind attributes memories to sources; reality monitoring; imagination inflation; cryptomnesia.",
     "Provenance classes as cognitive mechanism, not just metadata."),
    ("Metacognition", "Confabulation", "Confabulation and Honest Self-Ignorance",
     "Split-brain and anosognosia findings: fluent post-hoc explanations mask missing information.",
     "Failure mode: plausible narration covering absent evidence — verifier necessity."),
    ("Metacognition", "Epistemic-Emotions", "Epistemic Emotions: Curiosity, Surprise, Boredom",
     "Information-gap theory, prediction-error surprise, boredom as low-information signal.",
     "Intrinsic signals for when to research vs abstain."),
    # --- Executive control & routing ---
    ("Executive-Control", "Global-Workspace-Theory", "Global Workspace Theory",
     "Broadcast architecture: specialist processes compete for a limited workspace that serializes attention.",
     "Theoretical grounding for single executive Hermes + specialist profiles."),
    ("Executive-Control", "Action-Selection-Basal-Ganglia", "Basal Ganglia Action Selection",
     "Competitive gating of candidate actions; Go/No-Go pathways; dopaminergic urgency weighting.",
     "Mechanistic model for the Action Gate and tool-choice arbitration."),
    ("Executive-Control", "Cognitive-Control-Conflict", "Conflict Monitoring and Cognitive Control (ACC)",
     "Anterior cingulate detects conflict between responses and recruits dorsolateral control.",
     "When to escalate from fast habitual paths to deliberate Planner routes."),
    ("Executive-Control", "Dual-Process-Theories", "Dual Process Theory: Model-Free vs Model-Based Control",
     "Habits vs goal-directed action; arbitration by reward devaluation and state uncertainty.",
     "When cached procedures suffice vs full planning — skill governance."),
    ("Executive-Control", "Inhibitory-Control-Go-NoGo", "Inhibitory Control and the Stop-Signal Task",
     "Stopping latency, race models, prepotent response suppression.",
     "Formal model for HOLD decisions in the inhibitory gate."),
    # --- Attention & context ---
    ("Attention", "Load-Theory-Attention", "Perceptual Load Theory of Attention",
     "Early vs late selection depends on load; distraction leaks under high load.",
     "Context budget management: what gets processed under token pressure."),
    ("Attention", "Working-Memory-Limits", "Working Memory Limits and Chunking",
     "4±1 capacity, chunks, long-term working memory (Ericsson-Kintsch).",
     "Why context windows need external chunked memory, not raw size."),
    ("Attention", "Attentional-Residue", "Attentional Residue and Task Switching Costs",
     "Switching leaves residue; multitasking degrades encoding and retrieval.",
     "Cost model for concurrent agent tasks and interruptions."),
    # --- Learning & skill acquisition ---
    ("Learning", "Skill-Acquisition-Stages", "Stages of Skill Acquisition (Fitts-Posner / Dreyfus)",
     "Declarative → proceduralized → autonomous; knowledge compilation; error rate curves.",
     "Lifecycle model for skills: proposal → verification → trust."),
    ("Learning", "Spacing-Effect", "The Spacing Effect and Desirable Difficulties",
     "Distributed practice beats massed; generation and testing effects.",
     "Scheduling review/re-consolidation of knowledge for retention."),
    ("Learning", "Error-Driven-Learning-Prediction-Error", "Prediction Error and Reward Prediction Error",
     "Delta rule, dopaminergic RPE signaling, temporal difference learning parallels.",
     "Biological validation of outcome-logged learning from verified results."),
    ("Learning", "Transfer-of-Learning", "Transfer of Learning: Near and Far",
     "Identical elements theory; why far transfer is rare; analogical transfer conditions.",
     "Realistic expectations for reusing procedures across domains."),
    # --- Perception-prediction ---
    ("Predictive-Processing", "Predictive-Coding-Free-Energy", "Predictive Coding and Free Energy Principle",
     "Hierarchical prediction minimizes surprisal; precision-weighting of prediction errors.",
     "Unified frame: perception=compression, action=error correction, attention=precision."),
    ("Predictive-Processing", "Active-Inference", "Active Inference",
     "Organisms act to fulfill predictions; expected free energy; epistemic vs pragmatic value.",
     "Formal language for balancing information-seeking vs task completion."),
    ("Predictive-Processing", "Schema-Theory", "Schemas, Scripts, and Expectation-Driven Understanding",
     "Bartlett to Schank: structured prior knowledge drives comprehension and recall distortion.",
     "How prior pages shape interpretation — and hallucination risk."),
    # --- Social & distributed cognition ---
    ("Social-Cognition", "Theory-of-Mind-Hierarchy", "Theory of Mind and Order of Intentionality",
     "False-belief understanding, higher-order intentionality, perspective-taking limits.",
     "User modeling depth: modeling what the user believes the agent knows."),
    ("Social-Cognition", "Common-Ground", "Common Ground in Dialogue (Clark)",
     "Grounding in communication: joint action, repair, incremental updates.",
     "Conversation design: when to confirm, repair, and acknowledge."),
    ("Distributed-Cognition", "Extended-Mind-Theories", "The Extended Mind and Cognitive Offloading",
     "Parisy-Kirsh criteria; when tools become cognitive; transactive memory in teams.",
     "Philosophical basis: the wiki IS part of the agent's mind."),
    ("Distributed-Cognition", "Transactive-Memory", "Transactive Memory Systems",
     "Knowing who-knows-what in groups; directory vs content knowledge.",
     "Multi-profile organization: which profile holds which knowledge."),
    # --- Consolidation, sleep, forgetting ---
    ("Consolidation", "Synaptic-Homeostasis-Hypothesis", "Synaptic Homeostasis Hypothesis",
     "Tononi/Cirelli: sleep down-scales synapses preserving relative signal-to-noise.",
     "Pruning derived indexes without touching canonical evidence."),
    ("Consolidation", "Adaptive-Forgetting", "Adaptive Forgetting: Motivated Displacement",
     "Forgetting as feature: retrieval flexibility, generalization benefits.",
     "Temperature-based retrieval instead of deletion — formal defense."),
    ("Consolidation", "Memory-Reconsolidation", "Memory Reconsolidation",
     "Reactivated memories become labile; can be updated or interfered with.",
     "Safe belief-revision window mechanics for SUPERSEDED flows."),
    # --- Emotion, motivation, salience ---
    ("Emotion-Cognition", "Somatic-Marker-Hypothesis", "Somatic Marker Hypothesis",
     "Damasio: bodily signals bias decision-making before conscious reasoning; Iowa Gambling Task.",
     "Salience metadata as functional somatic markers for option pruning."),
    ("Emotion-Cognition", "Appraisal-Theory", "Appraisal Theory of Emotion",
     "Emotions as evaluations of events against goals (novelty, valence, agency, coping).",
     "Structured affect-tags as appraisal dimensions, not simulated feelings."),
    ("Emotion-Cognition", "Default-Mode-Network", "Default Mode Network and Mind-Wandering",
     "DMN, incubation effects, constructive simulation, creativity links.",
     "Scheduled idle-time association passes (brainstorm/bisociation justification)."),
    # --- Knowledge representation ---
    ("Knowledge-Representation", "Conceptual-Proportional-Analogy", "Structure-Mapping and Analogical Reasoning",
     "Gentner: relational similarity drives analogy; SME; analogy in discovery.",
     "Cross-domain retrieval by relations, not surface features."),
    ("Knowledge-Representation", "Frame-Problem", "The Frame Problem in Cognition",
     "How agents avoid enumerating non-effects of actions; relevance realization.",
     "Deep issue underlying tool-effect reasoning and context scoping."),
    ("Knowledge-Representation", "Symbol-Grounding", "Symbol Grounding Problem",
     "Harnad: meaning requires sensorimotor grounding; symbol-symbol circularity.",
     "Why tool-execution traces ground the agent's otherwise floating symbols."),
    # --- Replenishment batch (2026-08-22): catalog exhausted, refill per topic-exhaustion-and-agenda-replenishment.md ---
    ("Decision-Neuroscience", "Information-Foraging-Explore-Exploit", "Information Foraging and the Explore-Exploit Tradeoff",
     "Optimal foraging applied to cognition; information scent (Pirolli & Card); bandit explore/exploit; when to search vs act.",
     "Formal model for when the agent researches vs executes — research-cron design."),
    ("Memory-Architecture", "Pattern-Separation-Completion", "Pattern Separation and Pattern Completion in Hippocampal Circuits",
     "Dentate gyrus orthogonalizes inputs; CA3 completes from partial cues; attractor dynamics, adult neurogenesis.",
     "Biological basis for deduplication vs fuzzy recall in the three-tier memory design."),
    ("Knowledge-Representation", "Semantic-Networks-Spread-Activation", "Semantic Networks and Spreading Activation",
     "Collins & Loftus networks; ACT-R declarative activation (base-level learning, fan effect); associative retrieval.",
     "Cognitive basis for graph retrieval, link-following, activation-based context selection."),
    ("Knowledge-Representation", "Prototype-Exemplar-Categorization", "Human Categorization: Prototypes, Exemplars, Basic-Level Concepts",
     "Rosch's basic levels and prototypes; exemplar theory (Nosofsky GCM); goal-derived categories.",
     "How to design tags and taxonomies so retrieval generalizes like human categories."),
    ("Attention", "Vigilance-Decrement-Sustained-Attention", "Sustained Attention and the Vigilance Decrement",
     "Mackworth clock task; resource vs mindlessness theories; TloadDback model; countermeasures.",
     "Long-running monitors (crons, watchers) degrade — design for detection fatigue."),
    ("Attention", "Value-Driven-Attentional-Capture", "Value-Driven Attentional Capture",
     "Reward history biases attention (Anderson); selection history (Awh); reward-modulated priority maps.",
     "Salience should be learned from outcome value, not just recency or relevance."),
    ("Consolidation", "Targeted-Memory-Reactivation", "Targeted Memory Reactivation: Cueing Memories During Sleep",
     "TMR: sensory cues during SWS/REM reactivate and strengthen specific memories; effect sizes and debates.",
     "Selective nightly consolidation: cue-flagged items for prioritized offline processing."),
    ("Emotion-Cognition", "Stress-Arousal-Cognition", "Stress and Arousal Effects on Cognition",
     "Yerkes-Dodson inverted-U and critiques; cortisol timing effects (Joëls); allostasis; memory-phase modulation.",
     "Model degraded performance under pressure; when to defer high-stakes actions."),
    ("Motivation-and-Curiosity", "Temporal-Discounting-Procrastination", "Temporal Discounting and Procrastination",
     "Hyperbolic vs exponential discounting; preference reversal; temporal motivation theory (Steel); deadline proximity.",
     "Why scheduled work compresses near deadlines; pacing design for agent task queues."),
    ("Social-Cognition", "Epistemic-Trust-Testimony", "Epistemic Trust and Learning from Testimony",
     "Selective trust in informants (Harris); epistemic vigilance (Sperber); source credibility in children and adults.",
     "Source-credibility weighting for ingested content — capture-and-triage policy."),
    ("Metacognition", "Processing-Fluency-Illusions", "Processing Fluency and Illusions of Knowing",
     "Fluency misattributed to knowledge (Bjork); Alter & Oppenheimer; disfluency effects and replication debates.",
     "Why polished summaries feel known — verification gates against fluency-driven overconfidence."),
    ("Learning", "Cognitive-Load-Theory-Instructional-Design", "Cognitive Load Theory and Instructional Design",
     "Sweller: intrinsic/extraneous/germane load; worked examples; expertise reversal; measurement disputes.",
     "Context/prompt design: present information without overloading working memory."),
    # --- Replenishment batch 2 (2026-08-22): catalog exhausted again; refill per topic-exhaustion-and-agenda-replenishment.md ---
    ("Learning", "Catastrophic-Interference", "Catastrophic Interference in Sequential Learning",
     "New training overwrites old associations in sequentially trained networks; pseudo-rehearsal, replay, and parameter isolation as remedies.",
     "Why interleaved writes and rehearsal are mandatory for online-learning memory tiers."),
    ("Pathology-and-Failure-Modes", "Model-Collapse-Recursive-Training", "Model Collapse Under Recursive Training",
     "Models trained on their own outputs degrade: tails dominate, diversity shrinks; accumulation-vs-replacement debate (Shumailov et al. 2024).",
     "Red-team rule: never ingest unverified self-generated content into canonical memory."),
    ("Memory-Architecture", "Misinformation-Effect-False-Memories", "The Misinformation Effect and False Memories",
     "Post-event information systematically distorts recall (Loftus); planting whole false memories; moderators and replication status.",
     "Ingested commentary must never overwrite raw captured sources - corruption mechanics for belief revision."),
    ("Attention", "Inattentional-Blindness-Change-Blindness", "Inattentional Blindness and Change Blindness",
     "The invisible gorilla (Simons-Chabris 1999); change blindness across saccades and cuts; inattentional deafness; individual differences.",
     "Monitors miss salient events under load; design alarms that survive attention scarcity."),
    ("Decision-Neuroscience", "Recognition-Primed-Decision-Making", "Recognition-Primed Decision Making (Klein)",
     "Expert decision via pattern recognition plus mental simulation under time pressure; naturalistic decision making; premortems.",
     "Fast-path tool selection from matched experience; premortem gate for risky actions."),
    ("Social-Cognition", "Argumentative-Theory-of-Reasoning", "The Argumentative Theory of Human Reasoning (Mercier-Sperber)",
     "Reason evolved for argument: myside bias as design feature; reasoning performs better in groups than alone.",
     "Justifies verifier lanes and multi-agent debate over trusting solo chain-of-thought."),
    ("Metacognition", "Planning-Fallacy-Reference-Class-Forecasting", "The Planning Fallacy and Reference-Class Forecasting",
     "Systematic task-duration optimism; the outside view; distributional reference classes; Flyvbjerg megaproject base rates.",
     "Calibrate cron durations and project estimates from historical distributions, not introspection."),
    ("Metacognition", "Dunning-Kruger-Replication-Debates", "The Dunning-Kruger Effect and Its Statistical Critics",
     "Kruger-Dunning 1999 claims vs autocorrelation-artifact critiques (Gignac-Zajenkowski); what survives scrutiny.",
     "Cautionary tale for confidence instrumentation built on flawed statistics."),
    ("Consolidation", "Synaptic-Tag-and-Capture", "Synaptic Tag-and-Capture and Behavioral Tagging",
     "Weak events set synaptic tags later captured by strong plasticity signals; late-LTP windows; cross-capture between episodes.",
     "Mechanism for flag-priority consolidation queues: mark candidates now, consolidate when budget frees."),
    ("Decision-Neuroscience", "Cognitive-Effort-Discounting", "Cognitive Effort Discounting and the Effort Paradox",
     "People systematically avoid cognitively demanding options even when rewarded; COGENT paradigm; demand-avoidance vs effort-as-reward debate.",
     "Cost curves for routing tasks to heavier reasoning modes; when escalation pays."),
    ("Learning", "Learning-Sets-Meta-Learning", "Learning Sets and Meta-Learning",
     "Harlow 1949 learning-to-learn curves on discrimination problems; transfer of strategies; links to MAML and in-context learning.",
     "Skill library as meta-learning substrate: each verified procedure speeds future acquisition."),
    ("Temporal-Cognition", "Encoding-Specificity-Context-Dependent-Memory", "Encoding Specificity and Context-Dependent Memory",
     "Retrieval succeeds when cues match encoding context (Tulving-Thomson 1973); Godden-Baddeley diving studies; state dependence caveats.",
     "Store retrieval cues at write time; environment tags make knowledge findable again."),
    ("Motivation-and-Curiosity", "Flow-Optimal-Experience", "Flow and Optimal Experience",
     "Csikszentmihalyi: challenge-skill balance, action-awareness merging, autotelic experience; transient hypofrontality claims and debates.",
     "Pacing task difficulty to sustain engagement across long autonomous runs."),
    ("Knowledge-Representation", "Image-Schemas-Embodied-Concepts", "Image Schemas and Embodied Conceptual Structure",
     "Lakoff-Johnson: spatial-motor schemas structure abstract concepts; conceptual metaphor theory; embodiment replication debates.",
     "Ground abstract agent concepts (priority, containment, paths) in operational primitives."),
    ("AI-Safety-and-Alignment", "Specification-Gaming-Reward-Hacking", "Specification Gaming and Reward Hacking",
     "Documented cases of agents exploiting misspecified objectives (Krakovna et al. catalog); Goodhart effects; impact-regularization baselines.",
     "Checklist for tool-permission design and objective framing in Autognosia automation."),
]


def existing_slugs():
    slugs = set()
    for root, dirs, files in os.walk(BRAIN):
        for f in files:
            if f.endswith(".md"):
                slugs.add(os.path.splitext(f)[0].lower())
                slugs.add(f.lower())
    return slugs


def is_done(slug_title):
    """True if a page plausibly covering this topic already exists."""
    words = [w for w in re.split(r"[-\s]+", slug_title.lower()) if len(w) > 3]
    if not words:
        return False
    hits = sum(1 for w in words if any(w in s for s in EXISTING))
    return hits >= max(1, int(len(words) * 0.6))


EXISTING = set()


def pending_requests():
    if not os.path.isdir(EXCHANGE):
        return []
    reqs = []
    for f in sorted(os.listdir(EXCHANGE)):
        if not f.endswith(".json") or f.startswith("oracle-gap"):
            pass
        if not f.endswith(".json"):
            continue
        try:
            with open(os.path.join(EXCHANGE, f)) as fh:
                reqs.append(json.load(fh))
        except Exception:
            continue
    return reqs


def request_to_topic(req):
    topic = req.get("topic", "Unknown Topic")
    safe = re.sub(r"[^A-Za-z0-9-]+", "-", topic)[:60].strip("-")
    domain = str(req.get("requirements", {}).get("focus", "")).lower()
    dom = "Research-Requests"
    return {
        "source": "exchange_request",
        "request_id": req.get("id"),
        "domain": dom,
        "slug": safe,
        "title": topic.title(),
        "angle": req.get("context", ""),
        "why": "Consumes a queued research-request package.",
        "target_path": os.path.join(BRAIN, dom, f"{safe}.md"),
    }


def active_claims():
    """Slugs currently claimed by another in-flight tick (TTL-bounded)."""
    claimed = set()
    if not os.path.isdir(CLAIMS):
        return claimed
    now = datetime.now(timezone.utc).timestamp()
    for f in os.listdir(CLAIMS):
        p = os.path.join(CLAIMS, f)
        try:
            if now - os.path.getmtime(p) > CLAIM_TTL_SECONDS:
                os.remove(p)  # stale claim from a crashed tick
                continue
            claimed.add(os.path.splitext(f)[0].lower())
        except OSError:
            continue
    return claimed


def claim_topic(slug):
    """Atomically mark a topic as claimed so parallel lanes pick different work."""
    os.makedirs(CLAIMS, exist_ok=True)
    marker = os.path.join(CLAIMS, f"{slug}.claim")
    # O_EXCL: only one lane ever wins the create
    try:
        fd = os.open(marker, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
        os.write(fd, datetime.now(timezone.utc).isoformat().encode())
        os.close(fd)
        return True
    except FileExistsError:
        return False


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    global EXISTING
    EXISTING = existing_slugs()
    claimed = active_claims()

    # 1. Pending exchange requests
    for req in pending_requests():
        t = request_to_topic(req)
        if is_done(t["slug"]):
            continue
        req_slug = (req.get("id") or t["slug"]).lower()
        if req_slug in claimed and not args.dry_run:
            continue
        if not args.dry_run:
            if not claim_topic(req_slug):
                continue
            src = os.path.join(EXCHANGE, f"{req['id']}.json")
            if req.get("id") and os.path.exists(src) and os.path.isdir(ARCHIVE):
                shutil.move(src, os.path.join(ARCHIVE, f"{req['id']}.json"))
        print(json.dumps(t))
        return

    # 2. Frontier catalog
    for domain, slug, title, angle, why in CATALOG:
        if is_done(slug):
            continue
        if slug.lower() in claimed and not args.dry_run:
            continue
        if not args.dry_run and not claim_topic(slug):
            continue
        print(json.dumps({
            "source": "frontier_catalog",
            "domain": domain,
            "slug": slug,
            "title": title,
            "angle": angle,
            "why": why,
            "target_path": os.path.join(BRAIN, domain, f"{slug}.md"),
            "picked_at": datetime.now(timezone.utc).isoformat(),
        }))
        return

    print(json.dumps({"exhausted": True,
                      "note": "All catalog topics present; extend CATALOG."}))


if __name__ == "__main__":
    main()
