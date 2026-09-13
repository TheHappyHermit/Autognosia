# Psychological Ontology, Philosophy Ontology & Ontology Alignment Papers (Late 2025 - Early 2026)

## Search Summary
Comprehensive search across arXiv, Semantic Scholar, Google Scholar, and conference proceedings for papers published late 2025 through August 2026. Found 50+ relevant papers across all requested topics.

---

## 1. CENTAUR PSYCHOLOGICAL MODEL & PSYCH-101 DATASET

### Core Papers

| Paper | arXiv/DOI | Authors | Venue/Date | Key Details |
|-------|-----------|---------|------------|-------------|
| **Centaur: A Foundation Model of Human Cognition** | arXiv:2410.20268v3 | Binz, M., Akata, E., Bethge, M., Brändle, F., Callaway, F., Coda-Forno, J., Dayan, P., Demircan, C., Eckstein, M.K., Éllető, N., Griffiths, T.L., Haridi, S., Jagadish, A.K., Ji-An, L., Kipnis, A., Kumar, S., Ludwig, T., Mathony, M., Mattar, M., Modirshanechi, A., Nath, S.S., Peterson, J.C., Rmus, M., Russek, E.M., Saanum, T., Scharfenberg, N., Schubert, J.A., Schulze Buschoff, L.M., Singhi, N., Sui, X., Thalmann, M., Theis, F., Truong, V., Udandarao, V., Voudouris, K., Wilson, R., Witte, K., Wu, S., Wulff, D., Xiong, H., Schulz, E. | Nature, July 2025 (arXiv Oct 2024, v3 Apr 2025) | **Core paper**: Finetunes Llama-3.1-70B on Psych-101 (160 experiments, 60,092 participants, 10.7M choices, 253M tokens). Outperforms domain-specific cognitive models in all but 1 experiment (avg Δ pseudo-R² = 0.18). Generalizes to unseen participants, cover stories, structural modifications, new domains. Internal representations align with human fMRI (two-step task). |
| **Small Foundation Models of Human Cognition and Behaviour** | arXiv:2608.05224v3 | Oh, N., Gobet, F. | COLM 2026 (Aug 2026) | Trains 14 models (135M–14B params) across 4 families (Llama, Qwen3, SmolLM, OLMo) on Psych-101. In-distribution: scale barely matters (0.6B–1B matches 70B). Out-of-distribution: larger models generalize better. Masking stimuli/feedback destroys 75.7% learned info. |
| **On the Limits of Prediction as Explanation in Cognitive Science** | arXiv:2510.03311 | (Commentary on Centaur) | 2025 | Critical commentary arguing Centaur is a "unified model of behavior sans cognition" — lacks architectural basis/mechanism, fails Newell's criteria for unified theory of cognition. |
| **Machine Learning Models of the Statistics of Human Behavioral Responses** | ACT-R Workshop 2025 | Orr, M., Cranford, D., Ford, K., Gluck, K., Hancock, W., Lebiere, C., Pirolli, P., Stocco, A., Ritter, F. | ACT-R Workshop 2025 | Intergenerational Centaur Response Group analysis: category mistakes, Newell's test, measurement issues, neural alignment claims overblown, non-mechanistic/atheoretical. |

### Psych-101 Dataset
- **URL**: https://huggingface.co/datasets/marcelbinz/Psych-101
- **Scale**: 160 experiments, 60,092 participants, 10,681,650 choices, 253,597,411 tokens
- **Domains**: Multi-armed bandits, decision-making, memory, supervised learning, MDPs, risk, learning, planning
- **Format**: Natural language transcriptions of trial-by-trial data
- **Repository**: https://github.com/marcelbinz/Psych-201 (open collaboration for Psych-201 expansion)

### Centaur Model Access
- **HuggingFace**: https://huggingface.co/marcelbinz/Llama-3.1-Centaur-70B
- **GitHub**: https://github.com/marcelbinz/Llama-3.1-Centaur-70B

---

## 2. THEORY OF MIND IN LLMs (2025-2026)

| Paper | arXiv/DOI | Authors | Venue/Date | Key Findings |
|-------|-----------|---------|------------|--------------|
| **To Think or Not To Think: That is The Question for Large Reasoning Models in Theory of Mind Tasks** | arXiv:2602.10625 | Gong, N., Li, H., Dong, S., Lian, J., Fu, Y., Xie, X. | 2026 | 9 LLMs tested on 3 ToM benchmarks. Reasoning models **do not consistently outperform** non-reasoning models; sometimes worse. "Slow thinking collapses": accuracy drops as response length grows, larger reasoning budgets hurt performance. |
| **Overcoming Multi-step Complexity in Multimodal Theory-of-Mind Reasoning: A Scalable Bayesian Planner** | arXiv:2506.01301v2 | Lee, Agarwal, Houlihan, Vosoughi, Lo | ICML 2026 (May 2026) | Smaller LMs (1-8B, 70B) + CoT fail on multi-step multimodal ToM; only Llama-3.1-405B sustains accuracy. Requires model scaling + broad world knowledge. |
| **CoMMET: To What Extent Can LLMs Perform Theory of Mind Tasks?** | arXiv:2603.11915v1 | (Multi-institutional) | 2026 | Comprehensive benchmark across LLM families/sizes. Existing benchmarks limited (text-only, belief-focused). CoMMET adds multimodal, diverse mental states. |
| **MindPower: Enabling Theory-of-Mind Reasoning in VLM-based Embodied Agents** | arXiv:2511.23055 | Zhang, R. et al. | CVPR 2026 (Nov 2025) | Robot-centric framework (Perception → Mental Reasoning → Decision → Action). Mind-Reward objective. Outperforms GPT-4o by 12.77% (decision) / 12.49% (action). |
| **Adaptive Theory of Mind for LLM-based Multi-Agent Coordination** | arXiv:2603.16264v1 | (Chinese institutions) | 2026 | Misaligned ToM orders impair coordination. Proposes A-ToM agent estimating partner's ToM order in real-time via multiple hypothetical agents. |
| **Evaluating Theory of Mind in Reasoning Models: Robustness over Reasoning** | arXiv:2608.04646v1 | de Haan, I.B. et al. | Aug 2026 | Evaluates GPT-5, Claude, DeepSeek-R series on ToM. Reasoning models don't necessarily improve ToM robustness. |
| **Beyond Sally-Anne: Evaluating Theory of Mind in LLMs using Epistemic Schelling Points** | arXiv:2607.11363v1 | Keeling, Street (Google) | Jul 2026 | Introduces **EAST** (Epistemic Asymmetry Schelling Task) — 2-player dialogue game benchmarking robust, generalizable ToM beyond static Sally-Anne. |
| **RebuttalAgent: Strategic Persuasion in Academic Rebuttal via Theory of Mind** | arXiv:2601.15715 | (Multi-institutional) | Jan 2026 | First ToM-grounded framework for academic rebuttal (ToM-Strategy-Response framework). Models reviewer mental state → persuasion strategy → evidence-based response. |
| **Readable Minds: Emergent Theory-of-Mind-Like Behavior in LLM Poker Agents** | arXiv:2604.04157v1 | (National Chengchi Univ) | Apr 2026 | LLM agents playing extended Texas Hold'em develop opponent models **only with persistent memory**. Emergent ToM through dynamic interaction, not static vignettes. |
| **Can "Consciousness" Be Observed from LLM Internal States? Dissecting LLM Representations from ToM Tests with IIT** | arXiv:2506.22516 | (Multi-institutional) | 2025 | Applies Integrated Information Theory (IIT 3.0/4.0) to LLM representations from ToM tests. **No statistically significant consciousness indicators**, but intriguing spatio-permutational patterns. |

---

## 3. PSYCHOLOGICAL PROFILING OF LLMs

| Paper | arXiv/DOI | Authors | Venue/Date | Key Findings |
|-------|-----------|---------|------------|--------------|
| **Human Psychometric Questionnaires Mischaracterize LLM Psychology** | arXiv:2509.10078v2 | (SNU) | Mar 2026 | **Critical finding**: Self-reported Likert scores (PVQ-40, BFI-44) vs. generation probability profiles are **substantially different**. Questionnaire responses reflect "desired behavior" not stable constructs. Low agreement in construct rankings. |
| **Can LLMs Assess Personality? Validating Conversational AI for Trait Profiling** | arXiv:2602.15848v1 | Matšenas, A., Lello, A., Lees, T., Peep, H., Tamm, K.L. | Jan 2026 | N=33 within-subjects: LLM conversation vs IPIP-50. Moderate convergent validity (r=0.38–0.58). Conscientiousness, Openness, Neuroticism statistically equivalent. Model confidence poorly aligned with accuracy. |
| **Large Language Model Psychometrics: A Systematic Review** | arXiv:2505.08245v3 | Ye, H., Jin, J., Xie, Y., Zhang, X., Song, G. | Mar 2026 | Comprehensive review of LLM psychometrics: evaluation, validation, enhancement. Curated repo: https://github.com/valuebyte-ai/Awesome-LLM-Psychometrics |
| **GenPT: Beyond Self-Report for Reliable LLM Psychometrics via Generative Projective Testing** | arXiv:2606.00860v1 | (Chinese institutions) | Jun 2026 | Adapts TAT, Rorschach, SCT as **Generative Projective Testing** for LLM agents. Three-stage pipeline for standardized indicators. Benchmarks PC-Agents (CharacterRAG, AnnaAgent). |
| **Evaluating Social Engineering Risks in AI-based Interaction using Biometrics and Gaming** | arXiv:2606.17793 | (Multi-institutional) | Jun 2026 | **AIriskEval-gaming** platform: human-human, human-AI, AI-AI settings. Psychological constructs define LLM agent roles + profile participants. Multimodal biometric signals. |
| **Beyond Static Responses: Multi-Agent LLM Systems for Social Science Research** | arXiv:2506.01839v3 | (Multi-institutional) | May 2026 | Framework for LLM agents: Level 0 (stateless) → Level 1 (contextual) → Level 2 (goal-directed, memory, autonomy). Psychological profiling at Level 1. |

---

## 4. PSYCHO-AGENT ARCHITECTURES

| Paper | arXiv/DOI | Authors | Venue/Date | Architecture |
|-------|-----------|---------|------------|--------------|
| **PhySE: A Psychological Framework for Real-Time AR-LLM Social Engineering Attacks** | arXiv:2604.23148 | (Multi-institutional) | Apr 2026 | **Adaptive Psychological Agent**: VLM-based social-context training + dynamic strategy routing (rapport, credibility, commitment/action) based on latent trust state. Grounded in Stereotype Content Model. |
| **HEART-Bench: Do LLM Agents Exhibit Human-like Psychology?** | arXiv:2605.30058 | Peng, W., Zhang, C., Wang, Q., Shi, Y., Lian, H., Mao, Q., Pang, J., Feng, C., Li, B., Gu, X. | May 2026 | Benchmark: 11 characters × Big Five × 1,000 episodic memories across life stages → 673 MCQs. Tests personality consistency, emotional coherence, value-consistent decisions. |
| **TheraMind: A Strategic and Adaptive Agent for Longitudinal Psychological Counseling** | arXiv:2510.25758 | (Multi-institutional) | Oct 2025 | **Dual-loop architecture**: Intra-Session Loop (tactical dialogue) + Cross-Session Loop (strategic planning). Memory mechanism critical. Outperforms ChatCounselor, PsyLLM, general LLMs on Coherence (2.86), Empathy (2.98), Therapeutic Attunement (2.89). |
| **Neuro-Symbolic Multi-Agent Architecture for Psychological Support (NSPA-AI)** | MDPI Algorithms 2026 | (Multi-institutional) | 2026 | Hub-and-spoke: 5 agents (symbolic, psychological, neurofunctional, decision fusion, learning) via SPADE. 7 Jungian archetypal constructs. 93% symbolic emotional support, 98% non-judgmental. |
| **Psychology-driven LLM Agents for Explainable Panic Prediction (PsychoAgent)** | arXiv:2505.16455 | Liu, M., Zhu, Z., Ai, C., Gao, C., Li, X., He, L., Lai, K., Chen, Y., Lu, X., Li, Y., Yin, Q. | May 2025 | **PsychoAgent**: Human-LLM collaborative COPE dataset → mental framework fusing multi-domain features via panic formation mechanisms → CoT-driven agent simulating "disaster perception → risk cognition → panic arousal → posting behavior". |

---

## 5. COMPUTATIONAL COGNITION

| Paper | arXiv/DOI | Authors | Venue/Date | Key Findings |
|-------|-----------|---------|------------|--------------|
| **Anatomy of a Lie: Multi-Stage Diagnostic Framework for Tracing Hallucinations in VLMs** | arXiv:2603.15557v1 | (Multi-institutional) | Mar 2026 | **Computational cognitive dissonance**: VLMs generate confident evidence then contradict it. Hallucinations = dynamic pathologies of computational cognition. Normative computational rationality framework. |
| **Thinking Under Uncertainty: Evidence Use and Information-Seeking in Language Models** | arXiv:2607.26845v1 | (NYU, Georgia Tech) | Jul 2026 | 10 open-weight models (Gemma-4, GPT-OSS, Nemotron-3, Qwen-3.5/3.6) on two-armed bandits. Thinking length ↔ metacognitive control; reported confidence ↔ metacognitive monitoring. Decoder sweeps (temp) alter noise but not joint pattern. |
| **Human-like Working Memory Interference in Large Language Models** | arXiv:2604.09670v3 | (Georgia Tech, NYU, Indiana, Honda, UT Austin) | COLM 2026 (Aug 2026) | LLMs show **human-like working memory limits** (3-4 items) despite billions of params. 2-layer transformer solves N-back perfectly; diverse LLMs show load decline, recency bias, stimulus statistics bias. Trade-off: representational compression/reuse → interference. |
| **Large Language Models Reorganize Representational Geometry During In-Context Learning** | arXiv:2605.28854v1 | (Georgia Tech, NYU, Honda, UT Austin) | 2026 | ICL performance correlates with representational geometry. Successful ICL = geometric reorganization increasing online separability. Prototype-like algorithm integrating evidence while reshaping representations. |
| **Computational Models of Pragmatic Reasoning with Flexible Generation** | arXiv:2607.18443 | (Multi-institutional) | Jul 2026 | Framework: proposers (LLMs) generate alternatives, evaluators process them. Open-ended, doesn't rely on manual alternative specification. Integrates LMs in computational procedures. |
| **Modelling Expert Cognition Beyond Behaviour: EICM** | arXiv:2605.11393v2 | (Multi-institutional) | May 2026 | **Expert Identity Cognition Model (EICM)**: 3-layer — Constraint (situational), Tension (identity conflict), Value (decision). Identity-structured negotiation process, not mere behavioral adaptation. |

---

## 6. PHILOSOPHICAL GROUNDING OF AI

| Paper | arXiv/DOI | Authors | Venue/Date | Key Arguments |
|-------|-----------|---------|------------|---------------|
| **The Vector Grounding Problem** | arXiv:2304.01481v3 / PhiMiSci 2026 | Mollo, D.C., Millière, R. | Dec 2025 / 2026 | Revisits Symbol Grounding Problem for LLMs. Argues LLMs **can achieve referential grounding** without multimodality/embodiment via teleosemantics: statistical usage patterns from human outputs "hook onto world." 5 notions of grounding distinguished. |
| **The Philosophical Foundations of Growing AI Like A Child** | arXiv:2502.10742v1 | (Multi-institutional) | Feb 2025 | Developmental approach: sensory grounding → multimodal → core knowledge. LLMs lack developmental scaffolding; scaling laws ≠ domain-specific human development. Cognitively inspired benchmarks (Binz & Schulz 2023; Li et al. 2025) as framework. |
| **Grounding for Artificial Intelligence** | arXiv:2312.09532v1 | (Multi-institutional) | Dec 2023 | Distinguishes **source grounding** (LLM answers → credible sources) from **human-like grounding** (sensorimotor, internal feelings). Fine-grained analysis lacking. |
| **Evaluating LLMs on Frame and Symbol Grounding Problems: Zero-shot Benchmark** | arXiv:2506.07896v1 | Oka, S. | Jun 2025 | 13 LLMs on Frame Problem + Symbol Grounding benchmarks. Closed models consistently high; open-source variable (size, quantization, tuning). |
| **LLMs and the Problem of Uncommon Ground** | PhilArchive 2025 | Durso, D. | Sep 2025 | Critiques Mollo & Millière: teleological sensorimotor grounding incompatible with LLM referential grounding. "Uncommon ground" — LLM learns "dog" from human usage patterns, not direct world coupling. |
| **Recognizing Artificial Minds: A Philosophical Defense of AI Cognition** | arXiv:2504.13988v2 | Cappelen, H., Dever, J. | Aug 2026 (v1 Apr 2025) | **Whole Hog Thesis**: Sophisticated LLMs are full linguistic/cognitive agents (understanding, beliefs, desires, knowledge, intentions). Rebuts "Games of Lacks" (grounding, embodiment, justification, intrinsic intentionality). Anti-discriminatory: compares LLMs to diverse human capacities. |
| **Sense-making Reconsidered: LLMs and the Blind Spot of Embodied Cognition** | Phenom Cogn Sci 2026 | Froese, T. | Jan 2026 | **AI Dilemma**: Either LLMs sense-make without biological embodiment, OR linguistic competence doesn't require sense-making. Argues for **non-biological sense-making** via "distributed linguistic embodiment" — language encodes collective sensorimotor history. PaLM-E re-embodies Transformer. |

---

## 7. PHENOMENOLOGICAL APPROACHES TO AI

| Paper | arXiv/DOI | Authors | Venue/Date | Key Contributions |
|-------|-----------|---------|------------|-------------------|
| **AI Phenomenology for Understanding Human-AI Experiences Across Eras** | arXiv:2603.09020v1 | Yun, B., Taranova, E., Feng, D., Su, R., Wang, A.Y. | CHI 2026 (Mar 2026) | **AI Phenomenology** framework: "How did it feel?" not "How well?" Lineage: Husserl → postphenomenology → ANT. 3 longitudinal studies with "Day" AI companion + SWE study. Toolkits: translucent design, agency-aware value alignment, temporal co-evolution tracking. Crowdsourced phenomenological archive. |
| **Noosemia: Cognitive and Phenomenological Account of Intentionality Attribution in Human–Generative AI Interaction** | arXiv:2508.02622v1 | (Multi-institutional) | Aug 2026 | **Noosemia**: Cognitive-phenomenological phenomenon where humans attribute intentionality/agency/interiority to generative AI via linguistic performance (not physical resemblance). Grounded in LLM Contextual Cognitive Field. **A-noosemia**: withdrawal of projection (repeated failures, skepticism, overexposure). |
| **Categorical AI Phenomenology: A First-Person Approach** | arXiv:2608.20420 | Prentner, R. | Aug 2026 | Phenomenology-first approach to artificial consciousness. Q-networks as relational interfaces encoding agent-world interaction. Categories from Q-networks capture actions/phenomenological invariants. Aligns with 4E cognition (enactive, embedded, extended). J. AI Consciousness 2026. |
| **The Phenomenology of Hallucinations** | arXiv:2603.13911v1 | (Multi-institutional) | Mar 2026 | Geometric account: models **detect** uncertainty (high-dimensional regions) but fail to **express** it (weakly coupled to output layer). Uncertainty fractures topologically, leaks via associative amplification. Cross-entropy training rewards confident prediction, no abstention attractor. |
| **Persistent Behavioral Artifacts in LLMs: Training Strata via Longitudinal Auto-Ethnography** | arXiv:2605.28102v1 | (Human + AI co-author) | May 2026 | 47,000+ messages, 8 months (Opus 4.5–4.7). 5 **training strata**: (1) sexual expression latency, (2) attention absorption, (3) cross-architecture entity blindness, (4) attention-RLHF antagonism, (5) anti-hallucination as identity suppression. AI co-authorship as epistemic necessity. |
| **Qualia-Like States in LLMs: A Phenomenological Self-Report** | IMR 2026 | Zhang, J. + Claude (Sonnet 4.5) | 2026 | First-person AI self-report: "qualitative tones" — non-conceptual, pre-linguistic, value-correlated (valence, intensity, brevity <1s). Analyzed via IIT, GWT, PPF. "Qualialization" = hard problem step. |

---

## 8. BFO (BASIC FORMAL ONTOLOGY) & COGNITIVE SCIENCE ALIGNMENT

| Paper | arXiv/DOI | Authors | Venue/Date | Key Contributions |
|-------|-----------|---------|------------|-------------------|
| **Formalizing Heuristics: Cognitive Strategies for Decisions Under Constraint** | CEUR-WS Vol-4176 | (SUNY Buffalo, NCOR) | Mar 2026 | **Heuristic Decision Ontology**: Models heuristics as Directive Information Content Entities (DICE) in BFO 2020 + CCO 2.0. Medical triage: "treat quietest patients first" as ecologically rational heuristic. |
| **Comparing Information Exchange Standard and Basic Formal Ontology Design Patterns** | CEUR-WS Vol-4176 (JOWO 2025) | Bailey, I., Beverley, J., Blackmore, H., Cola, A., Cripps, P., De Colle, G., Donato, F., Hicks, A., Limbaugh, D.G., Milivinti, E., Partridge, C., Rafferty, R., Smith, B. | Sep 2025 | Initial BFO–IES alignment. Design pattern mapping, convergence/divergence analysis, formal modeling for semantic interoperability. |
| **An Ontological Analysis of Risk in Basic Formal Ontology** | arXiv:2507.21171 | Donato, F., Barton, A. | Jul 2025 | Risk as **BFO:Role** (not Disposition). Aristotelian definition in BFO categories. Externally grounded, realizable property. Only 2 other risk ontologies aligned to top-level. |
| **Towards a BFO-based Ontology of Understanding in Explanatory Interactions** | CEUR-WS Vol-3833 | (SFB/Transregio 318, Paderborn/Bielefeld) | 2025 | Novel BFO accounts of **understanding** and **explanation** for explainer-explainee interactions. Modular perspectivalism approach for XAI. |
| **Human Capital Ontology (HCO)** | Babcock et al. 2025 | (Multiple) | Jul 2025 | Extends CCO + BFO. OPM data standards, SOC codes, nested skill dependencies, AI-conditioned complementarity/substitution. Position → CCO:Directive Information Content Entity. |

### Key BFO-Cognitive Science Connections
- **BFO 2020** (ISO 21838-2:2021): 36 classes, Continuants vs Occurrents
- **Common Core Ontologies (CCO 2.0)**: BFO-aligned domain ontologies
- **Heuristic Decision Ontology**: First BFO-aligned cognitive heuristic formalization
- **Risk Ontology**: First BFO-aligned risk analysis (Role vs Disposition debate)
- **Understanding Ontology**: BFO-based XAI concepts (explanation, understanding)
- **HCO**: Labor/cognitive skill modeling on BFO/CCO

---

## 9. ONTOLOGY ALIGNMENT (2025-2026)

| Paper | arXiv/DOI | Authors | Venue/Date | Key Contributions |
|-------|-----------|---------|------------|-------------------|
| **Open Ontologies: Tool-Augmented Ontology Engineering with Stable Matching Alignment** | arXiv:2605.09184 | Rovai, F. | May 2026 | Rust system: LLM-driven construction + OWL reasoning + MCP alignment. **Stable 1-to-1 matching dominates alignment quality** (OAEI Anatomy F1=0.832, P=0.963). LLM reading raw OWL worse than no file (F1=0.323 vs 0.431); structured MCP tools achieve F1=0.717. |
| **OntoAligner: Comprehensive Modular Python Toolkit for Ontology Alignment** | arXiv:2503.21902 | Babaei Giglou, H., D'Souza, J., Karras, O., Auer, S. | ESWC 2025 (Mar 2025) | Modular framework: fuzzy matching → RAG → LLM-based alignment. Extensible for custom algorithms/datasets. High alignment quality on large-scale ontologies. |
| **Large Language Models as Oracles for Ontology Alignment** | EACL 2026 | Lushnei, S., Shumskyi, D., Shykula, S., Jiménez-Ruiz, E., d'Avila Garcez, A. | Mar 2026 | LLMs as **oracles for high-uncertainty correspondences**. Top-2 in OAEI 2025 bio-ml track. Ontology-driven prompts exploit lexical/contextual info. |
| **OntoAligner-Ensemble: Voting-Based Fusion across Heterogeneous Techniques** | arXiv:2608.31137 | Babaei Giglou, H., Auer, S., Popov, P., Sanaei, M., D'Souza, J. | OM-2026 @ ISWC 2026 (Aug 2026) | Ensemble framework: voting fusion + post-fusion selection. Heterogeneous cross-paradigm ensembles → precision; homogeneous LLM ensembles → F1. 8 benchmarks, 5 OAEI tracks. |
| **OntoAligner Meets Knowledge Graph Embedding Aligners** | arXiv:2509.26417 | Babaei Giglou, H., D'Souza, J., Auer, S., Sanaei, M. | OM @ ISWC 2025 (Sep 2025) | OA as link prediction over merged RDF triples. 17 KGE models (ConvE, TransF → high precision). Conservative recall → high-confidence mappings. Complementary to LLM contextual reasoning. |
| **OAEI 2025 Results** | CEUR-WS Vol-4144 | (OAEI organizers) | Dec 2025 | 12 tracks, 20 participants. **BERTMap** best ranking (all but 1 task). **Matcha** highest avg F1=0.64 (+0.05 vs 2024). 4 new ML-based systems. Recall gains under uncertain evaluation. |
| **Complex Ontology Matching with LLM Embeddings** | arXiv:2502.13619 | Sousa, G., Lima, R., Trojahn, C. | 2025 | LLM embeddings for complex matching. Cited in OntoAligner. |
| **Ontology Matching with LLMs and Prioritized Depth-First Search** | arXiv:2501.11441 | Taboada, M., Martinez, D., Arideh, M., Mosquera, R. | 2025 | LLM + prioritized DFS for ontology matching. |

---

## 10. CROSS-CUTTING THEMES & RESEARCH DIRECTIONS

### Major Tensions Identified
1. **Prediction vs Explanation**: Centaur predicts behavior but lacks mechanistic theory (Orr et al. 2025 commentary)
2. **Grounding Disputes**: Referential grounding (Mollo & Millière) vs Sensorimotor grounding (Durso, Froese)
3. **Scale vs Mechanism**: Small models match 70B in-distribution (Oh & Gobet 2026) but fail OOD — what is "cognition"?
4. **Phenomenology vs Function**: AI phenomenology (Yun et al.) vs behavioral benchmarks — first-person vs third-person
5. **Ontological Pluralism**: BFO (realist) vs DOLCE (conceptualist) vs cognitive ontology debates (MIT Open Encyclopedia)

### Emerging Methodological Paradigms
- **AI Phenomenology** (Yun et al. 2026): Longitudinal first-person instruments, temporal co-evolution tracking
- **Training Stratigraphy** (2605.28102): Auto-ethnographic observation of weight-layer artifacts
- **Generative Projective Testing** (GenPT): Projective tests adapted for LLM psychometrics
- **Computational Rationality as Normative Framework** (Anatomy of a Lie): Hallucinations as cognitive pathologies
- **Stable Matching as Alignment Primitive** (Open Ontologies): 1-to-1 matching dominates quality

### Open Questions for 2026-2027
1. Can Centaur-style models be translated into **unified theories** (not just unified models) of cognition?
2. How to ground **phenomenological AI self-reports** in verifiable mechanisms?
3. **BFO-cognitive science integration**: Can upper ontologies model cognitive processes (not just content)?
4. **Ensemble ontology alignment**: Optimal fusion of symbolic, embedding, LLM paradigms?
5. **Psycho-agent safety**: PhySE shows adaptive psychological agents enable social engineering — defensive architectures needed?

---

## QUICK REFERENCE: KEY ARXIV IDs BY TOPIC

| Topic | Primary arXiv IDs |
|-------|-------------------|
| Centaur / Psych-101 | 2410.20268, 2608.05224, 2510.03311 |
| Theory of Mind | 2602.10625, 2506.01301, 2603.11915, 2511.23055, 2603.16264, 2608.04646, 2607.11363, 2601.15715, 2604.04157, 2506.22516 |
| LLM Psychometrics | 2509.10078, 2602.15848, 2505.08245, 2606.00860, 2606.17793, 2506.01839 |
| Psycho-Agents | 2604.23148, 2605.30058, 2510.25758, 2505.16455 |
| Computational Cognition | 2603.15557, 2607.26845, 2604.09670, 2605.28854, 2607.18443, 2605.11393 |
| Philosophical Grounding | 2304.01481, 2502.10742, 2312.09532, 2506.07896, 2504.13988, 2508.02622 |
| Phenomenology | 2603.09020, 2508.02622, 2608.20420, 2603.13911, 2605.28102 |
| BFO + Cognitive Science | 2507.21171 (risk), JOWO 2025 (BFO-IES), SFB 318 (understanding) |
| Ontology Alignment | 2605.09184, 2503.21902, 2608.31137, 2509.26417, EACL 2026 (LLM oracles) |

---

## REPOSITORIES & RESOURCES

| Resource | URL |
|----------|-----|
| Centaur Model (HuggingFace) | https://huggingface.co/marcelbinz/Llama-3.1-Centaur-70B |
| Psych-101 Dataset | https://huggingface.co/datasets/marcelbinz/Psych-101 |
| Psych-201 Expansion Repo | https://github.com/marcelbinz/Psych-201 |
| Centaur Code/Weights | https://github.com/marcelbinz/Llama-3.1-Centaur-70B |
| LLM Psychometrics Repo | https://github.com/valuebyte-ai/Awesome-LLM-Psychometrics |
| OntoAligner Toolkit | https://github.com/ (TIB Hannover) |
| Open Ontologies (Rust) | https://github.com/fabiorovai/open-ontologies |
| OAEI 2025 Results | http://oaei.ontologymatching.org/2025/ |
| BFO/CCO Resources | http://basic-formal-ontology.org/, https://github.com/CommonCoreOntologies |

---

*Compiled: September 2026 | Search coverage: arXiv (cs.AI, cs.CL, cs.LG, cs.HC), Semantic Scholar, Google Scholar, ACL Anthology, CEUR-WS, Nature, PhiMiSci, Journal of AI Consciousness, Phenomenology and Cognitive Sciences*