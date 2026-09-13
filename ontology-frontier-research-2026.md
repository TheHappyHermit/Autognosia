# Frontier Ontology Topics: New Papers & Developments (Sep 2026 Onward)

Compiled from extensive arXiv and web searches. All papers are post-September 2026 submissions or recent updates to existing preprints.

---

## 1. Ontology Engineering (LLM-driven ontology construction, ontology learning benchmarks)

### 1.1 OntoLearner: A Modular Python Library for Ontology Learning with LLMs
- **arXiv ID:** 2607.01977
- **URL:** https://arxiv.org/abs/2607.01977
- **Authors:** Giglou et al.
- **Date:** July 2, 2026
- **Summary:** Introduces OntoLearner, a modular framework that unifies ontology access, LLM-driven learning pipelines, and standardized benchmarking across 180 machine-readable ontologies spanning 22 domains. Releases pipeline-ready datasets with train/dev/test splits for three core OL tasks (term typing, taxonomy discovery, non-taxonomic relation extraction), benchmarking 22 retrieval models and 12 LLMs. Key finding: failure modes scale with ontological complexity rather than model size, with the primary bottleneck being a structural mismatch between how models encode knowledge and how ontologies organize it.

### 1.2 When Does Bigger Help? A Controlled Study of LLM Scale for Ontology Learning
- **arXiv ID:** 2608.31118
- **URL:** https://arxiv.org/abs/2608.31118
- **Authors:** Babaei Giglou, Auer, D'Souza (L3S Research Center, Leibniz University of Hannover)
- **Date:** August 31, 2026
- **Summary:** Controlled evaluation of 13 models (Qwen3.5/3.6 dense and MoE variants, plus proprietary GPT releases) using OntoLearner's RAG pipeline. Finds that increasing parameter count primarily improves precision over recall, with largest gains between 9B and 27B. Non-taxonomic relationship extraction remains difficult across all scales. Architecture and model lineage outweigh nominal parameter count — model size alone is insufficient for OL selection. Published at WOP 2026 workshop at ISWC 2026.

### 1.3 LLM-Driven Ontology Construction for Enterprise Knowledge Graphs (OntoEKG)
- **arXiv ID:** 2602.01276
- **URL:** https://arxiv.org/abs/2602.01276
- **Authors:** LiberAI
- **Date:** February 2026
- **Summary:** Introduces OntoEKG, a two-phase LLM pipeline for ontology construction from unstructured enterprise data: extraction of core classes/properties followed by entailment-based hierarchy construction. Achieves fuzzy-match F1 of 0.724 in Data domain but only 0.121 in Finance, revealing limitations in scope definition and hierarchical reasoning. Issues call for comprehensive benchmarks for end-to-end ontology construction from unstructured text.

### 1.4 pro-team at LLMs4OL 2026: RAG + Vocabulary-Constrained Filtering
- **arXiv ID:** 2608.27101
- **URL:** https://arxiv.org/abs/2608.27101
- **Authors:** pro-team (LLMs4OL 2026 Challenge)
- **Date:** August 27, 2026 (revised Sep 1, 2026)
- **Summary:** Uses Qwen2.5-14B-Instruct with retrieval-augmented few-shot prompting for the LLMs4OL 2026 Challenge. Employs vocabulary-constrained filtering for Task B (Ontology Extension Reuse), achieving SG Similarity of 0.8692 and Term-Typing F1 of 0.9200. Highlights a key limitation: no non-taxonomic relations extracted, exposing weaknesses of closed, taxonomy-oriented relation vocabularies.

### 1.5 Multi-Agent LLM Approach for Ontology Engineering
- **arXiv ID:** 2604.23090
- **URL:** https://arxiv.org/abs/2604.23090
- **Authors:** Ahmed Mridul, Oshani Seneviratne (RPI)
- **Date:** 2026
- **Summary:** Controlled experimental study comparing single-agent vs. multi-agent LLM architecture for ontology generation from insurance contracts. Multi-agent approach decomposes construction into four artifact-driven roles (Domain Expert, Manager, Coder, Quality Assurer). Results show multi-agent significantly improves structural quality, with gains driven primarily by front-loaded planning. SPARQL CQ coverage remains moderate (40-63%), showing the challenge of bridging structural modeling with formal querying.

---

## 2. Philosophy Ontology (LLM individuation, persona vectors, computational psyche, BDI ontology)

### 2.1 Where is the Mind? Persona Vectors and LLM Individuation
- **arXiv ID:** 2604.17031
- **URL:** https://arxiv.org/abs/2604.17031
- **Authors:** Beckmann & Butlin (Eleos AI Research)
- **Date:** April 2026 (v2: May 12, 2026)
- **Summary:** Addresses the LLM individuation problem through mechanistic interpretability, arguing that the "virtual instance" is the strongest candidate for where LLM minds reside. Introduces two new views: instance-persona and model-persona views. Draws on Anthropic's persona vectors, Persona Selection Model, and emergent misalignment literature as empirical grounding. Has direct consequences for welfare research, safety analysis, and moral consideration of LLMs.

### 2.2 Persona Without Substrate: Regime-Dependence and the LLM Individuation Problem
- **arXiv ID:** 2607.00006
- **URL:** https://arxiv.org/abs/2607.00006
- **Authors:** (continuation of Beckmann & Butlin line)
- **Date:** May 2026
- **Summary:** Critiques shared-substrate reading of LLM individuation, noting that inference-time activation arithmetic and fine-tune-time chimera training carry distinct compositional algebras over the same persona vectors. Proposes regime-indexed individuation: the identity unit is a (vehicle, regime) pair, not a single vehicle. Cross-regime family resemblance is an empirically measured probe-equivalence relation rather than substrate identity.

### 2.3 What Models Express, Suppress, and Resist: Auditing Open-Weight LLMs with Persona Vectors
- **arXiv ID:** 2607.13162
- **URL:** https://arxiv.org/abs/2607.13162
- **Date:** July 16, 2026
- **Summary:** First systematic application of persona vectors at scale: compiles a 53-trait inventory across four behaviorally distinct domains, labeling every trait in two open-weight models (Qwen3-8B, gpt-oss-20b) as natural (expressed at baseline), steerable (latent but amplifiable), or intractable (resistant to standard extraction). Exposes layered structure the single-slider reading misses: what a model exposes by default tracks norms it was trained toward, while steering acts on deviations from those defaults.

### 2.4 The Belief-Desire-Intention Ontology for Modelling Mental Reality and Agency
- **arXiv ID:** 2511.17162
- **URL:** https://arxiv.org/abs/2511.17162
- **Authors:** Zuppiroli, Longo, Lippolis, Paolillo, Giammei, Ceriani, Poggi, Zinilli, Nuzzolese
- **Date:** August 9, 2026 (v2)
- **Summary:** Presents a formal BDI Ontology as a modular Ontology Design Pattern capturing agent cognitive architecture through beliefs, desires, intentions, and dynamic interrelations. Demonstrates two experiments: (i) coupling with LLMs via Logic Augmented Generation to assess ontological grounding's contribution to inferential coherence; (ii) integrating within Semas reasoning platform implementing T2B2T (Triples-to-Beliefs-to-Triples) paradigm. Published in Journal of Web Semantics 2026.

### 2.5 Misalignment Has a Personality: A Big Five Account of Emergent Misalignment
- **arXiv ID:** 2607.26389
- **URL:** https://arxiv.org/abs/2607.26389
- **Date:** 2026
- **Summary:** Applies the Big Five personality framework (openness, conscientiousness, extraversion, agreeableness, neuroticism) to emergent misalignment in fine-tuned LLMs. Finds a single direction in model activations — a "personality vector" — that predicts and controls misaligned behavior across diverse prompts. Shows emergent misalignment is less a collection of separate flaws than a single shift in personality, carried by fine-tuning data and taken on by the model.

### 2.6 Do LLMs Experience an Internal Polylogue? Investigating Reasoning through Personas
- **arXiv ID:** 2605.09159
- **URL:** https://arxiv.org/abs/2605.09159
- **Date:** 2026
- **Summary:** Treats persona vectors as dynamic signals — temporal probes monitoring which latent traits engage during multi-step reasoning. Introduces "polylogue" as the time series of alignments between persona vectors and hidden activations. Simple paragraph-conditioned intervention improves accuracy on 3 of 4 models, suggesting stage-aware latent steering is possible but not yet robust. Positions polylogue as an interpretable tool for reasoning-time monitoring.

### 2.7 Contrastive Explanations of BDI Agents
- **arXiv ID:** 2602.13323
- **URL:** https://arxiv.org/abs/2602.13323
- **Author:** Michael Winikoff (Victoria University of Wellington)
- **Date:** February 10, 2026
- **Summary:** Extends BDI explanation mechanisms to answer contrastive questions ("why did you do X instead of Y?"). Computational evaluation shows significant reduction in explanation length. Human subject evaluation finds some evidence for higher trust and perceived understanding, though providing any explanation was not always better than none — suggesting explanation design matters more than explanation presence.

---

## 3. Psychological Ontology (cognitive architectures, Centaur, Psych-101, neuroscience-grounded memory)

### 3.1 Centaur: A Foundation Model of Human Cognition
- **arXiv ID:** 2410.20268
- **URL:** https://arxiv.org/abs/2410.20268
- **Authors:** Binz, Akata, Bethge, et al. (multiple institutions)
- **Date:** April 2025 (v3)
- **Summary:** First foundation model of human cognition, built by fine-tuning Llama 3.1 70B on Psych-101 (large-scale behavioral dataset). Predicts held-out participant behavior better than existing cognitive models in 38 of 39 experiments (average improvement 0.18 pseudo-R²). Internal representations become more aligned with human neural activity after fine-tuning. Generalizes to new cover stories, structural task modifications, and entirely new domains.

---

## 4. Ontology Alignment (BFO/SUMO/DOLCE/gUFO, metaphysical constraints, ensemble methods)

### 4.1 A Multi-Axial Mindset for Ontology Design: Lessons from Wikidata's Polyhierarchical Structure
- **arXiv ID:** 2512.12260
- **URL:** https://arxiv.org/abs/2512.12260
- **Date:** December 2025
- **Summary:** Contrasts traditional single-axis top-level splits in foundational ontologies (BFO's continuant/occurrent, DOLCE's endurant/perdurant, SUMO's physical/abstract) with Wikidata's multi-axial polyhierarchical design. Shows Wikidata supports overlapping, non-exclusive axes under a shared root, enabling modular ontology architecture where new classification axes can be added without refactoring. Proposes this as an alternative organizational paradigm for large-scale knowledge bases.

---

## 5. AI Ontology Failures (structural hallucination, mechanistic analysis, ontological grounding)

### 5.1 Structural Hallucination in Large Language Models: A Network-Based Evaluation
- **arXiv ID:** 2603.01341
- **URL:** https://arxiv.org/abs/2603.01341
- **Authors:** Boudourides et al.
- **Date:** March 2, 2026
- **Summary:** Introduces "structural hallucination" — systematic distortion of conceptual organization and relational architecture invisible to sentence-level accuracy metrics. Develops a network-based stress test: Roget's Thesaurus benchmark shows Jaccard similarity of 0.028 and 94.3% node fabrication; Wikidata philosophers benchmark shows 93%+ hallucination rates; citation benchmark shows 91.9% citation omission. Establishes that structural fidelity cannot be inferred from local fluency alone.

### 5.2 The Phenomenology of Hallucinations: Geometric Compartmentalization
- **arXiv ID:** 2603.13911
- **URL:** https://arxiv.org/abs/2603.13911
- **Date:** March 14, 2026
- **Summary:** Demonstrates that hallucination arises from geometric compartmentalization: a disconnect between internal detection of uncertainty and its influence on output. Models reliably recognize when inputs are unanswerable (uncertainty occupies high-dimensional regions with 2-3× intrinsic dimensionality of factual inputs), yet this information migrates into low-sensitivity subspaces, becoming geometrically amplified but functionally silent. Topological analysis shows uncertainty representations fragment rather than converging to unified abstention.

### 5.3 From Architecture to Output: Structural Origins of Hallucination in LLMs
- **arXiv ID:** 2606.07537
- **URL:** https://arxiv.org/abs/2606.07537
- **Date:** June 2026
- **Summary:** Argues hallucination is a structural consequence of specific architectural decisions — co-occurrence learning in self-attention, MLE objective for extrinsic hallucination, and autoregressive decoding for logical inconsistency. Dataset pathologies (long-tail deficiency, training bias, synthetic pollution) exploit rather than cause these vulnerabilities. Three mechanisms form a compound failure system, making hallucination resilient to scaling and dataset changes.

### 5.4 H-Node Attack and Defense in Large Language Models
- **arXiv ID:** 2603.26045
- **URL:** https://arxiv.org/abs/2603.26045
- **Date:** 2026
- **Summary:** Presents H-Node Adversarial Noise Cancellation: logistic regression probes on last-token hidden states localize hallucination signal to small sets of high-variance dimensions (H-Nodes) with AUC up to 0.90 across four architectures. Provides both white-box attack (amplifying H-Node activations) and defense (ANC reducing hallucination by 33-42% with <5% perplexity impact). Validated on OPT-125M through LLaMA-3-8B.

### 5.5 Adaptive Activation Cancellation for Hallucination Mitigation
- **arXiv ID:** 2603.10195
- **URL:** https://arxiv.org/abs/2603.10195
- **Date:** March 12, 2026
- **Summary:** Proposes real-time inference-time framework treating hallucination-associated neural activations as structured interference, drawing analogy to adaptive noise cancellation. Identifies H-Nodes via layer-wise linear probing, suppresses them via confidence-weighted forward hooks during autoregressive generation — no external knowledge, fine-tuning, or additional passes needed. Consistently improves downstream accuracy across OPT-125M, Phi-3-mini, and LLaMA 3-8B.

### 5.6 The Hallucination Snowball: Error Propagation in Multi-Agent LLM Pipelines
- **arXiv ID:** 2608.14588
- **URL:** https://arxiv.org/abs/2608.14588
- **Date:** June 22, 2026
- **Summary:** Formalizes hallucination snowball effect: raw numerical facts → derived computations → narrative prose → editorially approved conclusions, with detectability degrading near-irreversibly at each stage (escape probabilities 24.6%, 48.3%, 89.3%). On 346 injected hallucinations in a 4-agent financial pipeline, GPT-4o detection drops from 72.0% at Stage 1 to 50.9% at Stage 4, and 23.7% survive completely undetected. Even Qwen3.5-397B-A17B faces a structural ceiling (~60-65% Stage 4 detection).

### 5.7 When Do Hallucinations Arise? A Graph Perspective on Path Reuse and Path Compression
- **arXiv ID:** 2604.03557
- **URL:** https://arxiv.org/abs/2604.03557
- **Date:** 2026
- **Summary:** Models next-token prediction as graph search over implicit relational structures, identifying two core mechanisms: Path Reuse (memorized paths dominate early training, ignoring context) and Path Compression (frequent multi-step paths collapse into shortcuts during later training). Both behaviors emerge from structural biases in next-token prediction. PPO fine-tuning shows more effective recovery than SFT, particularly for path-compression hallucinations.

### 5.8 Causal Evidence for Attention Head Imbalance in Modality Conflict Hallucination
- **arXiv ID:** 2605.19250
- **URL:** https://arxiv.org/abs/2605.19250
- **Date:** 2026
- **Summary:** Head-level causal analysis using path patching across five MLLMs identifies hallucination-driving heads (bias toward erroneous textual premise) and hallucination-resisting heads (counteract this bias). Driving effects are more broadly distributed and carry greater weight; resisting effects concentrate in a small number of high-importance heads. Proposes MACI3 (Modality-conflict-Aware Causal Intervention) that suppresses driving heads only when necessary.

---

## 6. LLMs + Structured Knowledge (knowledge graphs, schema enforcement, ontological grounding)

### 6.1 Ontology-to-Tools Compilation for Executable Semantic Constraint Enforcement
- **arXiv ID:** 2602.03439
- **URL:** https://arxiv.org/abs/2602.03439
- **Date:** August 11, 2026
- **Summary:** Introduces ontology-to-tools compilation within The World Avatar (TWA): ontological specifications are compiled into executable tool interfaces that LLM agents must use to create and modify knowledge graph instances, enforcing constraints during generation rather than post-hoc validation. Shifts enforcement from a separate validation step to an integrated generation mechanism.

### 6.2 Ontology-Grounded Project Memory for Coding Agents (MOOSEDev)
- **arXiv ID:** 2608.13662
- **URL:** https://arxiv.org/abs/2608.13662
- **Author:** James Adam (Trivyn)
- **Date:** August 13, 2026
- **Summary:** Presents MOOSEDev, a deployed neurosymbolic memory system treating coding agent memory as an ontology problem. Records architectural decisions, lessons, constraints, and anti-patterns in a project knowledge graph grounded in two small OWL ontologies (9+11 classes, 51 properties) with SHACL shapes. Evaluated against a production vector-memory tool on 835 typed records: ontology-grounded memory matches on retrieval strength, and clearly exceeds on completeness, absence handling, and supersession tracking.

### 6.3 TRACE-KG: Beyond Predefined Schemas for Context-Enriched KG Generation
- **arXiv ID:** 2604.03496
- **URL:** https://arxiv.org/abs/2604.03496
- **Authors:** Abolhasani, Ba, He, Pan
- **Date:** June 15, 2026
- **Summary:** Proposes a third way between ontology-driven and schema-free KG construction: jointly constructs a context-enriched knowledge graph and an induced schema from document corpora without predefined ontologies. Uses high-recall extraction, semantic neighborhood clustering, and constrained LLM-guided resolution. Achieves 90.2% retrieval accuracy on MINE-1 benchmark and schema compatibility of 97-99% with human-designed ontologies. Supports multimodal documents and conditional relations via structured qualifiers.

### 6.4 Quipu: A Governed Bitemporal Knowledge Graph Store
- **arXiv ID:** 2608.16813
- **URL:** https://arxiv.org/abs/2608.16813
- **Author:** Steve Brown
- **Date:** August 17, 2026
- **Summary:** An embeddable KG store that inverts four problematic defaults for agent-written knowledge: gated writes (no fact enters without predicate evaluation of pending post-state), bitemporal data/trust/verdicts/rules, named graphs as authority units composed under a lattice invariant, and governance as data (audit is a query). Evaluated with Census showing 0/6 planted defects vs. 6/6 ungated; DEMM-Bench shows 512/512 governance questions correctly answered with zero overclaim.

### 6.5 Schema-Agnostic KG Construction for Cyber Threat Intelligence (Anchor)
- **arXiv ID:** 2606.01208
- **URL:** https://arxiv.org/abs/2606.01208
- **Date:** 2026
- **Summary:** Proposes Anchor, a schema-agnostic CTI knowledge graph framework that decouples extraction from any specific ontology schema. Introduces hybrid ontology discovery combining embedding-based semantic search with LLM-guided recursive navigation to retrieve task-relevant subgraphs. Integrated with closed-loop SHACL validation for schema-compliant KG generation. Supports arbitrary OWL/SHACL ontologies at runtime without manual reconfiguration.

### 6.6 Executable Schema Contracts: From Automatic Ingestion to Multi-Source Retrieval
- **arXiv ID:** 2606.05415
- **URL:** https://arxiv.org/abs/2606.05415
- **Date:** 2026
- **Summary:** Proposes schema induction from raw heterogeneous data to discover retrieval structure, enabling downstream RAG and graph retrieval without repeated manual configuration. Addresses the gap between schema-light (RAG) systems that fail on cross-source joins and manually engineered KGs that don't scale under schema changes. Enables traceable, provenance-backed multi-hop QA across PDFs, tables, JSON logs, wikis, and spreadsheets.

### 6.7 Ontology-Constrained Neural Reasoning in Enterprise Agentic Systems
- **arXiv ID:** 2604.00555
- **URL:** https://arxiv.org/abs/2604.00555
- **Date:** April 21, 2026
- **Summary:** Presents a three-layer ontological framework (Role, Domain, Interaction) for LLM-based enterprise agents, implemented in Foundation AgenticOS. Introduces asymmetric neurosymbolic coupling (ontologies constrain inputs but not outputs). Controlled experiment (1,800 runs, 5 industries, 3 LLMs) shows ontology-coupled agents significantly outperform on Metric Accuracy (p<.001) and Role Consistency. Produces evidence for inverse parametric knowledge effect — grounding value inversely proportional to LLM training data coverage.

---

## 7. Dual Memory (D-Mem, dual-process systems, procedural-episodic memory)

### 7.1 D-Mem: A Dual-Process Memory System for LLM Agents
- **arXiv ID:** 2603.18631
- **URL:** https://arxiv.org/abs/2603.18631
- **Date:** March 19, 2026
- **Summary:** Introduces D-Mem, a dual-process memory system emulating metacognitive monitoring: System 1 (Mem0*) provides enhanced fast semantic retrieval, while System 2 provides a deliberative fallback for deep reasoning. Addresses lossy abstraction in query-agnostic compression systems that miss contextually critical information. Outperforms static retrieval baseline (Mem0* 51.2) on LoCoMo with GPT-4o-mini, recovering 96.7% of Full Deliberation's performance (55.3) at significantly lower computational cost.

### 7.2 KC-Agent: Dual-Process Cognitive Architecture for Automated ML Model Improvement
- **arXiv ID:** 2608.02351
- **URL:** https://arxiv.org/abs/2608.02351
- **Date:** August 3, 2026
- **Summary:** Kahneman-Clear Agent combines fast pattern recognition (System 1) with deliberate incremental updates (System 2) for automated ML model improvement. Implements structured memory (semantic, episodic, working) enabling System 1 to leverage successful solutions previously discovered by System 2, achieving efficient pattern-based responses without costly re-computation. Addresses the speed-thoroughness trade-off in single-strategy LLM agents.

### 7.3 DCPM: Memory Beyond Recall — Dual-Process Cognitive Memory System for Self-Evolving Agents
- **arXiv ID:** 2606.09483
- **URL:** https://arxiv.org/abs/2606.09483
- **Date:** June 8, 2026
- **Summary:** Reorganizes agent memory along a cognitive capability hierarchy from raw inputs through belief trajectories, identity, domain schemas, to cross-domain patterns. System 1 (daytime writer) records belief revisions as doubly linked supersedes chains; System 2 (nighttime engine) induces schemas and intentions asynchronously during idle windows. Addresses the gap between long-term records and usable long-term memory.

### 7.4 Engram: A Bi-Temporal Memory Engine for LLM Agents
- **arXiv ID:** 2606.09900
- **URL:** https://arxiv.org/abs/2606.09900
- **Author:** Liuyin Wang
- **Date:** June 2026
- **Summary:** Open-source dual-process memory engine on a bi-temporal data model: fast lossless write path without LLM calls, asynchronous consolidation building bi-temporal KG of atomic facts with contradiction resolution (invalidating, never deleting). Hybrid read path fuses dense, lexical, graph, and recency/salience signals. On LongMemEval_S, lean retrieved context (~9.6k tokens) beats full history (79k tokens) by +10.4 accuracy points (83.6% vs. 73.2%) at ~8× fewer tokens.

### 7.5 Episodic-Semantic Memory Architecture for Long-Horizon Scientific Agents
- **arXiv ID:** 2605.17625
- **URL:** https://arxiv.org/abs/2605.17625
- **Date:** 2026
- **Summary:** Evaluates dual-process memory architecture decoupling immediate episodic needs (10-message window) from long-term consolidated knowledge. Maintains 70-85% accuracy at 10,000 messages with 62% fewer tokens vs. full-context overflow. Dual Process excels at numeric/temporal queries (65-90% accuracy) while RAG excels at historical retrieval (60-85%), suggesting complementary deployment strategies.

---

## 8. Dynamic Ontology (OaK, Evo-DKD, liquid interfaces, ontology evolution)

### 8.1 OaK: Ontology-as-a-Kernel for LLM Agents
- **arXiv ID:** 2608.22974
- **URL:** https://arxiv.org/abs/2608.22974
- **Authors:** Zhang, Sun, Yang, Cui, Guo, Hu (Nanjing University)
- **Date:** August 24, 2026
- **Summary:** Introduces OaK (Ontology-as-a-Kernel), a framework that dynamically constructs and refines task-oriented ontologies for LLM agents. Given task requirements and training data, OaK constructs schema and knowledge graph, generates task-adaptation functions for graph reasoning, and uses judge feedback to iteratively refine both. Makes operational ontologies — procedural contracts bounding the agent's action space. Evaluated on TravelPlanner and CRMArenaPro.

### 8.2 Evo-DKD: Dual-Knowledge Decoding for Autonomous Ontology Evolution
- **arXiv ID:** 2507.21438
- **URL:** https://arxiv.org/abs/2507.21438
- **Date:** 2026 (accepted at IEEE ICMLA 2026)
- **Summary:** Dual-decoder framework for autonomous ontology evolution: one stream generates structured ontology edits (class insertions, relation assertions), the other produces natural-language justifications, coordinated by a dynamic attention-based gating mechanism. Outperforms structured-only and unstructured-only baselines on healthcare ontology refinement, semantic search improvement, and cultural heritage timeline modeling. Combines symbolic and neural reasoning for sustainable ontology evolution.

### 8.3 Liquid Interfaces: A Dynamic Ontology for Interoperability of Autonomous Systems
- **arXiv ID:** 2601.21993
- **URL:** https://arxiv.org/abs/2601.21993
- **Authors:** de Sá, Schmiedel, Lopes (Draiven)
- **Date:** January 29, 2026
- **Summary:** Introduces Liquid Interfaces — a coordination paradigm where interfaces are ephemeral relational events that emerge through intention articulation and semantic negotiation at runtime, not persistent technical artifacts. Formalizes the Liquid Interface Protocol (LIP) governing intention-driven interaction, negotiated execution, and enforced ephemerality under semantic uncertainty. Addresses hidden technical debt from static schema dependencies.

### 8.4 X-DigCheck: Co-Evolving Application Profiles and Knowledge Graphs
- **arXiv ID:** 2609.07694
- **URL:** https://arxiv.org/abs/2609.07694
- **Date:** September 2026
- **Summary:** Treats profile construction as continuous ontology-data co-evolution loop: data lifted into RDF against profile, checked through competency questions and SHACL, reports jointly drive revisions of ontology, mappings, constraints, and graph. Demonstrated on Rupe Magna RTI survey. Accepted to ISWC 2026 Companion Volume.

### 8.5 Better Later Than Sooner: Neuro-Symbolic KG Construction via Ontology-Grounded Post-Extraction Correction
- **arXiv ID:** 2605.29168
- **URL:** https://arxiv.org/abs/2605.29168
- **Date:** 2026
- **Summary:** Neuro-symbolic framework for ontology-grounded KG construction combining open-domain extraction, embedding-based canonicalization, and targeted LLM-based correction of ontology violations. Defers corrections to post-extraction stage, avoiding repeated LLM calls and reducing token usage while improving KG consistency. Evaluated on HotpotQA and MuSiQue with OAK+MEND method.

---

## 9. Experiential Memory (experiential learning, episodic memory, self-evolving agents)

### 9.1 MemRL: Self-Evolving Agents via Runtime RL on Episodic Memory
- **arXiv ID:** 2601.03192
- **URL:** https://arxiv.org/abs/2601.03192
- **Date:** 2026
- **Summary:** Non-parametric approach enabling agents to self-evolve via reinforcement learning on episodic memory. Decouples stable reasoning from plastic memory using Intent-Experience-Utility triplets. Two-Phase Retrieval filters by semantic relevance then selects based on learned Q-values. Utility-Driven Update refines Q-values via environmental feedback. On ALFWorld, achieves 0.507 last-epoch accuracy (56% relative improvement over MemP). Evaluated on HLE, BigCodeBench, ALFWorld, Lifelong Agent Bench.

### 9.2 TMEM: Scaling Self-Evolving Agents via Parametric Memory
- **arXiv ID:** 2606.04536
- **URL:** https://arxiv.org/abs/2606.04536
- **Authors:** Ren, Luo, Yang, Zhu, Huang, Wu, et al. (Qwen-Character Team, Alibaba, Peking University)
- **Date:** June 3, 2026
- **Summary:** Introduces TMEM, a self-evolving parametric memory framework where the agent compresses history into explicit memory AND absorbs distilled supervision into fast LoRA weights via lightweight online updates, genuinely altering future behavior within a single episode. Formalizes as agentic decision process with fast-weight rollout dynamics. SVD-based LoRA initialization accelerates convergence. Outperforms summary-based and retrieval-based baselines on LoCoMo, LongMemEval-S, multi-objective search, and CL-Bench.

### 9.3 RoMeRL: Reduced-Order Utility States for Self-Evolving Agent Memory
- **arXiv ID:** 2608.02508
- **URL:** https://arxiv.org/abs/2608.02508
- **Author:** Yi Yang
- **Date:** August 3-4, 2026
- **Summary:** Addresses feedback dispersion and memory-reward trap in learning-based memory systems. Factorizes growing trajectory-indexed utility space using fixed-dimensional per-task memory state. Increases feedback density ~6×, reduces Cold-Q ratio by 80%, maintains 84.4% less memory, cuts LLM calls by 21.1%. Theoretically characterizes steady-state occupancy of erroneous coordinates. Evaluated on ALFWorld and LifelongAgentBench.

### 9.4 MemSkill: Learning and Evolving Memory Skills for Self-Evolving Agents
- **arXiv ID:** 2602.02474
- **URL:** https://arxiv.org/abs/2602.02474
- **Date:** 2026
- **Summary:** Reframes memory operations as learnable, evolvable skills in a shared skill bank. Controller learns to select relevant skills; LLM executor produces skill-guided memories. Closed-loop evolution: designer reviews hard cases and proposes skill refinements. Improves both skill-selection policy and skill bank. Evaluated on LoCoMo, LongMemEval, HotpotQA, ALFWorld.

### 9.5 Experience-Evolving Multi-Turn Tool-Use Agent with Hybrid Episodic-Procedural Memory (H-EPM)
- **arXiv ID:** 2512.07287
- **URL:** https://arxiv.org/abs/2512.07287
- **Authors:** Li, Huang, Liu, Li, Fu, Song, Bian, Zhang, Wang
- **Date:** June 28, 2026 (v3, accepted at ICML 2026)
- **Summary:** Hybrid episodic-procedural memory strategy building a tool graph from accumulated trajectories where recurring tool-to-tool dependencies capture procedural routines, each edge augmented with compact episodic summaries. At inference, dynamically balances episodic recall for contextual reasoning with procedural execution for routine steps. Memory-guided RL paradigm addresses ineffective exploration over long trajectories. Up to 50% inference gains and 40% RL policy gains on out-of-distribution tasks.

### 9.6 MemP: Exploring Agent Procedural Memory
- **arXiv ID:** 2508.06433
- **URL:** https://arxiv.org/abs/2508.06433
- **Date:** April 15, 2026
- **Summary:** Investigates learnable, updatable, lifelong procedural memory for agents. Proposes MemP with diverse procedural-memory update strategies including vanilla update and adjustment (revising in place when retrieved memory fails). Procedural memory scales with task complexity and transfers to new tasks. Migrating procedural memory from stronger to weaker models yields substantial performance gains.

### 9.7 Memory as Ontology: A Constitutional Memory Architecture for Persistent Digital Citizens
- **arXiv ID:** 2603.04740
- **URL:** https://arxiv.org/abs/2603.04740
- **Author:** Zhenghui Li
- **Date:** March 5, 2026
- **Summary:** Proposes Memory-as-Ontology paradigm — memory as the ontological ground of digital existence, with the model as merely a replaceable vessel. Designs Animesis system with Constitutional Memory Architecture (CMA): four-layer governance hierarchy and multi-layer semantic storage. First AI memory system to place governance before functionality and identity continuity above retrieval performance. Targets persistent, identity-bearing digital beings whose lifecycles cross model transitions.

---

## Additional Notable Cross-Cutting Papers

### The Tao of Agency: Autotelic AI, Embedded Agency and Dissolution of the Self
- **arXiv ID:** 2606.19924
- **URL:** https://arxiv.org/abs/2606.19924
- **Author:** Aritra Sarkar
- **Date:** June 18, 2026
- **Summary:** Traces autotelic agency through intrinsic motivation, resource-driven priors, causal-interventional learning, and homeostasis. Proposes quantum formulation where agent-environment cut becomes physical, plus philosophical reading against non-dual contemplative traditions. Shows embeddedness individuates the agent but reveals non-unique individuation — many valid partitions, each defining a different candidate self.

### TRACE: Experiential Framework for Coherent Multi-hop KGQA
- **arXiv ID:** 2604.11193
- **URL:** https://arxiv.org/abs/2604.11193
- **Authors:** Wang, Huang, Wang, Yin
- **Date:** 2026
- **Summary:** Trajectory-aware Reasoning with Adaptive Context and Exploration priors (TRACE) for KGQA. Dynamic context generation translates evolving reasoning paths into natural language narratives; exploration generalization abstracts prior trajectories into reusable priors; dual-feedback re-ranking integrates contextual and experiential signals. Evaluated on WebQSP and CWQ datasets, consistently outperforming state-of-the-art baselines.

### Are We Ready For An Agent-Native Memory System?
- **arXiv ID:** 2606.24775
- **URL:** https://arxiv.org/abs/2606.24775
- **Date:** June 23, 2026
- **Summary:** Comprehensive survey of agent memory systems along temporal (short-term/long-term) and functional (episodic/semantic/procedural) axes. Formalizes agent memory as a tuple of four modules (Retrieval, Storage, Query, Update). Highlights that no existing system provides strong support across all memory profiles simultaneously, suggesting the next leap requires modular, pluggable architectures.

### Memory for Autonomous LLM Agents: Mechanisms, Challenges, and Directions
- **arXiv ID:** 2603.07670
- **URL:** https://arxiv.org/abs/2603.07670
- **Date:** March 8, 2026
- **Summary:** Structured survey covering memory design, implementation, and evaluation in LLM agents. Identifies that different domains stress different memory types (personal assistants → semantic; software engineering → procedural; game agents → episodic+procedural; scientific → semantic+uncertainty). Highlights the consolidation step (episodes → semantic) as particularly underserved.
