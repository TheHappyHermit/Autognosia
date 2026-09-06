# Research Findings: Dual Memory, Dynamic Ontology, Experiential Memory, and Psychological Ontology (2024-2026)

---

## 1. Dual Memory Theory in AI / Cognitive Science

### Key Publications (2024-2026)

| Title | Year | Venue | URL |
|-------|------|-------|-----|
| Memory, Consciousness and Large Language Model | 2024 | arXiv | https://arxiv.org/abs/2401.02509 |
| Dual-Memory Framework in AI | 2026 | EmergentMind | https://emergentmind.com/topics/dual-memory-framework |
| Dual-Memory Representations in Computational Models | 2025 | EmergentMind | https://emergentmind.com/topics/dual-memory-representations |
| PRIME: LLM Personalization with Cognitive Dual-Memory | 2025 | arXiv | https://arxiv.org/abs/2507.04607 |
| If Attention Serves as a Cognitive Model of Human Memory Retrieval... | 2025 | ACL | https://aclanthology.org/2025.acl-long.483 |
| Dual Memory Structures: Models & Applications | 2025 | EmergentMind | https://emergentmind.com/topics/dual-memory-structures |
| Human-inspired Perspectives: A Survey on AI Long-term Memory | 2024 | arXiv | https://arxiv.org/abs/2411.00489 |
| Episodic Memory is the Missing Piece for Long-Term LLM Agents | 2025 | arXiv | https://arxiv.org/abs/2502.06975 |

### Key Findings

**Tulving's SPI Model as Foundation**: Multiple 2024-2026 papers explicitly ground dual-memory architectures in Tulving's Serial-Parallel-Independent (SPI) model, which distinguishes:
- **Episodic memory**: Instance-specific, context-rich, temporally dated experiences
- **Semantic memory**: Abstracted, generalized knowledge, rules, concepts
- **Procedural memory**: Skills, know-how, executable subroutines

**Complementary Learning Systems (CLS) Theory**: The hippocampus (fast, episodic) ↔ neocortex (slow, semantic) dichotomy is the dominant biological analog cited across 2024-2026 papers (Momennejad 2024; Kumaran et al. 2016; O'Reilly et al. 2014).

**Dual-Memory Architectures in LLMs**:
- **PRIME framework** (2025): Mirrors episodic memory to historical user engagements, semantic memory to long-term evolving user beliefs. Shows semantic memory more robust than episodic; personalized thinking (slow thinking/CoT) critical.
- **Memᵖ** (2025): Treats procedural memory as a first-class optimization object with build/retrieval/update lifecycle strategies. Reflection-based update most effective.
- **ReMe** (2025): Dynamic procedural memory with multi-faceted distillation (success patterns, failure analysis, comparative insights), context-adaptive reuse, utility-based refinement. Qwen3-8B + ReMe outperforms Qwen3-14B baseline.
- **ReasoningBank + MaTTS** (2025): Distills reasoning strategies from both successes AND failures; memory-aware test-time scaling creates positive feedback loop.

**Attention as Memory Retrieval**: Yoshida et al. (2025 ACL) find Transformer attention implements dual memory representations—syntactic structures + token sequences—with attention as general retrieval algorithm.

**Five Essential Properties of Episodic Memory for LLM Agents** (2025 position paper):
1. Instance-specific encoding
2. Contextual binding (what/where/when)
3. Single-shot learning
4. Autonoetic consciousness (mental time travel)
5. Consolidation into semantic memory

---

## 2. Dynamic Ontology Learning in AI Systems

### Key Publications (2024-2026)

| Title | Year | Venue | URL |
|-------|------|-------|-----|
| LLM-empowered Knowledge Graph Construction: A Survey | 2025 | arXiv | https://arxiv.org/abs/2510.20345 |
| DRAGON-AI: Dynamic Retrieval Augmented Generation of Ontologies | 2024 | J Biomed Semantics | https://link.springer.com/doi/10.1186/s13326-024-00320-3 |
| Methodological Exploration of Ontology Generation with LLM | 2025 | MDPI Electronics | https://mdpi.com/2079-9292/14/14/2863 |
| LLMs4OL 2025 Overview: 2nd LLM for Ontology Learning Challenge | 2025 | ISWC | https://tib-op.org/ojs/index.php/ocp/article/download/2913/2922/52931 |
| Emergent Dynamic Ontology Generation in Neurocognitive Memory Systems | 2025 | Medium | https://medium.com/@jsmith0475/emergent-dynamic-ontology-generation-in-neurocognitive-memory-systems-c036d5d78f78 |
| The Integration of AI and Ontologies: Transformations in KR | 2024 | Digital Commons | https://digitalcommons.odu.edu/cgi/viewcontent.cgi?article=1401&context=stemps_fac_pubs |
| Recent Trends in Semantic Web and Ontology-Driven KR | 2025 | MDPI | https://mdpi.com/2079-9292/14/7/1313 |
| Deep Learning for Ontology Learning: Systematic Mapping | 2025 | ETASR | https://etasr.com/index.php/ETASR/article/download/9431/4557/41812 |

### Key Findings

**Shift from Manual to LLM-Driven Ontology Engineering**:
- Traditional OE: Manual, expert-driven, METHONTOLOGY/On-To-Knowledge methodologies
- Semi-automatic "ontology learning" (OL) from text corpora struggled with evolution, modular reuse, dynamic adaptation
- **LLMs as cognitive engines**: Bridge natural language ↔ structured knowledge via (1) heterogeneous source integration via NL grounding, (2) instruction-driven orchestration, (3) implicit class inference for emergent categories

**DRAGON-AI (2024)**: RAG + LLM approach for dynamic ontology generation. Generates textual/logical components from multiple ontologies + unstructured text. High precision for relationships, but AI-generated definitions score worse than human-authored; domain experts better at discerning flaws.

**LLMs4OL 2025 Challenge**: Three tasks—Term Typing, Taxonomy Discovery, Non-Taxonomic Relation Extraction. Hybrid pipelines (commercial LLMs + domain-tuned embeddings + fine-tuning) outperformed pure LLMs. LLMs strong on Term Typing/Taxonomy Discovery; hybrid surpassed in simpler tasks via external knowledge integration.

**Dynamic/Emergent Ontology Generation** (Smith 2025): Hand-authored ontologies are brittle (capture only anticipated), static (don't evolve with corpus), mute about history. Proposes self-observing ontology with:
- Proposals governed by human adjudication
- Anchored to source documents
- Observability layer: periodic censuses, deterministic diffs, change attribution (metacognitive monitoring)
- Distinguishes structural change (learning) from population drift (corpus growth)

**Key Challenges**:
- Dynamic ontology updates & scalability in Big Data
- Heterogeneous data integration → inconsistencies, incompleteness, bias
- Flexibility to adapt to new information
- Evaluation: expert discernment needed for AI-generated definitions

---

## 3. Experiential Memory Models (Human and AI)

### Key Publications (2024-2026)

| Title | Year | Venue | URL |
|-------|------|-------|-----|
| Memory in the Age of AI Agents (Survey) | 2025 | arXiv | https://arxiv.org/abs/2512.13564 |
| Experiential Memory System (supernet-labs) | 2026 | GitHub | https://github.com/supernet-labs/experiential-memory |
| L-PEM: Lightweight Model for Parametric Experiential Memory | 2025 | OpenReview | https://openreview.net/pdf?id=ZvkkaFxmeM |
| Memᵖ: Exploring Agent Procedural Memory | 2025 | arXiv | https://arxiv.org/abs/2508.06433 |
| ReMe: Dynamic Procedural Memory for Experience-Driven Agent Evolution | 2025 | arXiv | https://arxiv.org/abs/2512.10696 |
| From Experience to Strategy: Trainable Graph Memory | 2025 | arXiv | https://arxiv.org/abs/2511.07800 |
| ReasoningBank: Scaling Agent Self-Evolving with Reasoning Memory | 2025 | arXiv | http://arxiv.org/abs/2509.25140 |
| Early Experience: Reward-Free Paradigm for Language Agents | 2025 | arXiv | https://arxiv.org/abs/2510.08558 |
| Contextual Experience Replay (CER) for Continual Learning | 2025 | ICLR | https://yitaoliu17.com/assets/pdf/ICLR_2025_CER.pdf |
| Experiential Reflective Learning (ERL) for Self-Improving LLM Agents | 2026 | arXiv | https://arxiv.org/abs/2603.24639 |
| Human-inspired Perspectives: Survey on AI Long-term Memory | 2024 | arXiv | https://arxiv.org/abs/2411.00489 |

### Key Findings

**New Taxonomy (Memory in the Age of AI Agents, 2025)**: Moves beyond long/short-term to **Forms–Functions–Dynamics** triangle:
- **Forms**: Token-level, Parametric, Latent memory
- **Functions**: Factual (knowledge from interactions), **Experiential** (incremental capability enhancement through task execution), Working (workspace during task)
- **Dynamics**: Formation, retrieval, evolution over time

**Experiential Memory = Procedural/Habit Systems**: Theoretical grounding in human nondeclarative memory—specifically procedural and habit systems (Squire 2004; Seger & Spiering 2011). Biological: distributed neural circuits for implicit skill acquisition. AI: explicit data structures (vector DBs, symbolic logs) → unique capability to introspect, edit, reason over own procedural knowledge.

**Four Abstraction Levels of Experiential Memory** (2025 survey):
1. **Case-based**: Raw trajectories/solutions as concrete exemplars
2. **Strategy-based**: High-level strategies, templates, workflows
3. **Skill-based**: Procedural knowledge → executable functions/APIs
4. **Hybrid**: Multiple representations (ExpeL, G-Memory, Memp, MemEvolve, Agent KB)

**Key 2025-2026 Frameworks**:
- **Memᵖ**: Learnable, updatable, lifelong procedural memory. Distills trajectories into step-by-step instructions + script-like abstractions. Dynamic regimen: update, correct, deprecate. Reflection-based update most effective. Transferable to weaker models.
- **ReMe**: Multi-faceted distillation (success patterns, failure triggers, comparative insights), context-adaptive reuse (scenario-aware indexing + rewriting), utility-based refinement (selective addition + utility-based deletion). Qwen3-8B + ReMe > Qwen3-14B baseline.
- **Trainable Graph Memory**: Abstracts episodic trajectories → canonical paths over finite state machine → high-level meta-cognition. RL-driven weight optimization calibrates utility. Integrated into RL training loop as explicit policy prior.
- **ReasoningBank + MaTTS**: Distills strategies from successes AND failures. Memory-aware test-time scaling: high-quality memory directs scaling → rich experiences forge stronger memory. Positive feedback loop.
- **CER**: Training-free continual learning. Accumulates/synthesizes experiences into dynamic buffer (environment dynamics + decision patterns). SOTA on VisualWebArena (31.9%), WebArena (36.7%).
- **ERL (2026)**: Reflects on single-attempt trajectories → structured heuristics (analysis + guideline with trigger conditions). LLM-based retrieval scores relevance. 56.1% on Gaia2 (+7.8% over ReAct). Heuristics transfer better than raw trajectories.
- **Early Experience**: Middle ground between imitation learning and RL. Agent's own actions → future states as supervision (implicit world modeling + self-reflection). +9.6% success rate, +9.4% OOD generalization across 8 environments.

**Experiential Memory as Foundation for Continual Learning & Self-Evolution**: Cited as enabling "era of experience" (Sutton 2025; Gao et al. 2025). Capability internalization via SFT on reasoning traces, DPO, GRPO.

---

## 4. Psychological Ontology: Mental Models vs Formal Ontologies

### Key Publications (2024-2026)

| Title | Year | Venue | URL |
|-------|------|-------|-----|
| Towards an Ontology of Mental Health: Protocol (GALENOS) | 2024-2025 | Wellcome Open Research | https://ora.ox.ac.uk/objects/uuid:154ea268-de53-47e1-a974-583f3e115960/files/r8c97kr91h |
| GALENOS Upper-Level Mental Health Ontology | 2026 | LSHTM | https://researchonline.lshtm.ac.uk/id/eprint/4682043/1/Santilli-etal-2026-The-galenos-upper-level-mental.pdf |
| Meta Mesh Ontology: Transformative Approach to Mental... | 2025 | medRxiv | https://www.medrxiv.org/content/10.1101/2025.11.04.25339387v1.full-text |
| A Formal Ontology is for Reconciling Your Mental Model... | 2025 | Semantic Arts | https://www.semanticarts.com/a-formal-ontology-is-for-reconciling-your-mental-model-with-everyone-elses |
| Norms are Relational: Cognitive Institutions... | 2025 | Cambridge | https://cambridge.org/core/services/aop-cambridge-core/content/view/942228097E39269C0D399AD0B40AEF63/S174413742510026Xa.pdf/norms-are-relational-cognitive-institutions-practices-and-the-where-question.pdf |
| How Physical Information is Used to Make Sense of Psychological World | 2025 | Nature | https://nature.com/articles/s44159-025-00514-1 |
| Ontology of Cognition | 2025 | Neuroverse | https://neuroversepod.com/post/ontology-of-cognition |
| Quantitative Paradigm & Nature of Human Mind (Replication Crisis) | 2025 | Frontiers | https://frontiersin.org/articles/10.3389/fpsyg.2025.1649683/full |
| Mem'Onto: Memory Ontology based on Tulving's SPI Model | 2025 | FOIS | https://moex.inria.fr/files/papers/felice2025a.pdf |
| Folk Psychological and Neurocognitive Ontologies | 2024 | PhilSci/ResearchGate | https://philsci-archive.pitt.edu/17269/1/Dewhurst%20forthcoming%20-%20Folk%20psychological%20and%20neurocognitive%20ontologies.pdf |
| FOIS 2025 Proceedings: Bringing Humans into Ontologies | 2025 | IOS Press | https://www.iospress.com/catalog/books/formal-ontology-in-information-systems |

### Key Findings

**Core Tension**: Every person/organization/system has an implicit **mental ontology** (things presumed to exist + how they behave). Formal ontologies attempt to make these explicit and shared (Gruber: "agreements on shared conceptualizations").

**Folk Psychology vs. Neurocognitive Ontology** (Dewhurst 2024-2025):
- Folk psychology: Everyday understanding of intentional actions (beliefs, desires, intentions)
- Neurocognitive ontology: Brain's functional organization
- **Key claim**: Folk psychological ontology may not be appropriate for describing brain's functional organization; adopting novel cognitive ontology threatens folk psychology with new form of eliminative materialism (Churchland 1980s)

**"Where" Question in Social Ontology** (Beck 2024; Hindriks 2013): Where are norms/mental models located? North's "cognitive institutionalism" places them in shared mental models (internalist). Enactivist/relational view: norms located in **relation between individuals and institutions**, not in either alone.

**Naive Psychology as Intuitive Theory** (Nature 2025):
- Humans are "intuitive dualists" with two systems: reasoning about minds vs. physical objects
- Naive physics: noisy physical simulation (mass, force, velocity, contact/support/containment) → prediction/intervention (forward) & explanation/inference (backward)
- Naive psychology: Mental model centered on **agent** (capacity to choose, hold internal states separate from world)
- **Key finding**: Despite distinct computational goals/neural substrates, the two systems rely on **same representations and interact directly**. Minds represented as solid permanent objects; mental state inferences depend on naive physics variables.

**Cognitive Ontology Crisis** (Poldrack 2010; Neuroverse 2025):
- Current cognitive concepts (memory, empathy, theory of mind, etc.) don't map cleanly to brain areas
- Brain areas are multifunctional; cognitive functions don't neatly fit neural data
- **Proposal**: Replace current mental concepts with neuroscientific concepts (eliminative materialism) OR align cognitive ontology with functional neuroimaging data
- Replication crisis as epistemological rupture: mismatch between quantitative psychology's epistemic structures and psyche's ontic nature (Luhmann's autopoietic systems)

**Mem'Onto (2025)**: Formal memory ontology based on Tulving's SPI model, adapted from CoTOn (Cognitive Theory Ontology for working memory). Covers:
- Memory Systems: Episodic, Semantic, Procedural
- Mnesic Processes: Encoding, Storage, Retrieval
- Consciousness Levels: Implicit/Explicit
- Aligned with UFO foundational ontology

**GALENOS Mental Health Ontology (2024-2026)**: Built on BFO (Basic Formal Ontology). Distinguishes:
- Mental disease (disposition: gives rise to varied processes over time) vs. affective feeling (specific process over time period)
- Goal: Shared language for evidence synthesis across anxiety, depression, psychosis
- Iterative stakeholder consultations to refine entities for clarity/scope
- Computer-readable for algorithmic categorization, linking, retrieval

**Practical Implication for AI**: Formal ontologies serve as **reconciliation layer** between divergent mental models. The structure of language used to formalize ontology can influence/distort reality representation (Guarino & Giaretta). LLMs offer dynamic knowledge representation + implicit class inference → discovery of emergent ontological categories.

---

## Cross-Cutting Themes & Synthesis

| Theme | Dual Memory | Dynamic Ontology | Experiential Memory | Psychological Ontology |
|-------|-------------|------------------|---------------------|------------------------|
| **Biological Grounding** | CLS theory (hippocampus↔neocortex) | Naive physics/psychology as intuitive theories | Procedural/habit systems (basal ganglia, cerebellum) | Folk psychology vs. neurocognitive ontology |
| **Formalization Target** | Tulving's SPI model | Gruber's "shared conceptualizations" | Sutton's "era of experience" | BFO + domain ontologies (GALENOS, Mem'Onto) |
| **Key 2024-2026 Innovation** | LLM-native dual-memory (PRIME, Memᵖ, ReMe) | LLM-driven ontology learning (DRAGON-AI, LLMs4OL) | Experiential memory as first-class optimization object (ReasoningBank, ERL) | Computational representation of mental ontology (Mem'Onto) |
| **Gap Addressed** | Catastrophic forgetting vs. rigid parameters | Brittle/static hand-authored ontologies | Passive accumulation → dynamic evolution | Mental model diversity → shared formal representation |
| **Evaluation Challenge** | Benchmarks for episodic memory in agents | Expert discernment of AI-generated definitions | Memory quality vs. model scale tradeoffs | Replication crisis as ontology mismatch |

### Notable Convergences

1. **Tulving's SPI model** appears as the common theoretical backbone across dual memory (AI), experiential memory (procedural/habit), and memory ontology (Mem'Onto).

2. **LLMs as ontology learners** → dynamic, evolving knowledge representations that mirror the **experiential memory** paradigm: learning from interaction, not just static training data.

3. **Formal ontology as metacognitive layer**: The "observability layer" in emergent dynamic ontology (periodic censuses, diffs, change attribution) parallels **metacognitive monitoring** in dual-memory architectures (System 1/System 2, Governor/Executor).

4. **Psychological ontology gap**: Human mental models are intuitive, relational, context-sensitive (naive physics + naive psychology). Formal ontologies are explicit, logical, context-independent. AI systems bridging this gap need **both** dual-memory (episodic for context, semantic for abstraction) AND dynamic ontology (evolving with experience).

---

## Recommended Follow-Up Reading

**Foundational**:
- Tulving (1972, 1985): Episodic/Semantic memory distinction
- McClelland et al. (1995); O'Reilly & Norman (2002): CLS Theory
- Gruber (1993): "Toward Principles for the Design of Ontologies"
- Sutton (2025): "Welcome to the Era of Experience"

**2024-2026 Surveys**:
- "Memory in the Age of AI Agents" (arXiv:2512.13564) — comprehensive taxonomy
- "Human-inspired Perspectives: Survey on AI Long-term Memory" (arXiv:2411.00489)
- "LLM-empowered Knowledge Graph Construction" (arXiv:2510.20345)

**Key Frameworks to Watch**:
- PRIME / Memᵖ / ReMe / ReasoningBank / ERL (experiential memory)
- DRAGON-AI / LLMs4OL (dynamic ontology)
- Mem'Onto / GALENOS (psychological/formal ontology bridge)