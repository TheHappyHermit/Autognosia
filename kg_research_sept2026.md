# Latest Knowledge Graph Construction Research (September 2026)
**Focus:** LLM-driven methods, schema induction, autonomous KG building  
**Excluded (already covered):** AutoSchemaKG (ACL 2026), TRACE-KG, LLM-empowered KG survey, KARMA, Graphusion, ODKE+, AdaptR, Neo4j/Multigrid

---

## 1. RAGA: Reading-And-Graph-building-Agent for Autonomous Knowledge Graph Construction and Retrieval-Augmented Generation
- **URL:** https://arxiv.org/abs/2605.17072
- **Date:** 16 May 2026 (arXiv)
- **Authors:** Chengrui Han, Zesheng Cheng (Qingdao University)
- **Key Findings:**
  - First framework combining full CRUD write-loop autonomy, real-time KG–vector consistency with failure compensation, evidence-anchored provenance for every knowledge entry, and auditable agent execution paradigm
  - Introduces "Read–Search–Verify–Construct" cognitive loop embedded in ReAct tool-calling cycle
  - Atomic toolset supports full KG lifecycle: paragraph reading, context browsing, fusion retrieval, entity/relation CRUD, merge operations, human review markers, deferred tasks
  - KG-vector synchronization enables hybrid symbolic-vector retrieval
  - On QASPER subset: Fusion mode achieves 61.5 Answer F1, outperforming FAISS-only by 6.1 pp
  - Limitations: Limited evaluation scale, low retrieved Evidence F1 (0.188), high construction cost, reliance on prompt constraints

---

## 2. DIAL-KG: Schema-Free Incremental Knowledge Graph Construction via Dynamic Schema Induction and Evolution-Intent Assessment
- **URL:** https://arxiv.org/abs/2603.20059
- **Date:** 20 March 2026 (arXiv), Accepted to DASFAA 2026
- **Authors:** Weidong Bao et al.
- **Key Findings:**
  - Closed-loop framework for incremental KG construction orchestrated by a Meta-Knowledge Base (MKB)
  - Three-stage cycle: (i) Dual-Track Extraction (triple generation + event extraction), (ii) Governance Adjudication (fidelity/currency checks, hallucination prevention), (iii) Schema Evolution (induce new schemas from validated knowledge)
  - MKB stores entity profiles, schema proposals (relation schemas + event schemas), governs extraction and validation
  - Evolutionary-Intent Verification distinguishes Informational vs Evolutionary events (deprecation, replacement)
  - Relation/Event Schema Induction via clustering + LLM evaluation for semantic completeness
  - Achieves SOTA on graph quality and induced schema quality; avoids full graph reconstruction
  - Latency bottleneck acknowledged; future work on SLM distillation

---

## 3. SHARP: Schema-Aware Planning and Hybrid Knowledge Toolset for Reliable Knowledge Graph Triple Verification
- **URL:** https://arxiv.org/abs/2604.04190
- **Date:** April 2026 (ACM Trans. Inf. Syst.)
- **Authors:** Xinyan Ma et al. (Harbin Institute of Technology)
- **Key Findings:**
  - Training-free autonomous agent (SHARP) reformulating triple verification as dynamic planning–retrieval–reasoning
  - Combines Memory-Augmented Mechanism + Schema-Aware Strategic Planning + Hybrid Knowledge Toolset (KG tools + external tools)
  - Enhanced ReAct loop with tool invocation for cross-verification of internal KG structure and external textual evidence
  - SOTA on FB15K-237 (87.2% Acc, 86.6% F1) and Wikidata5M-Ind (93.7% Acc, 93.4% F1) — gains of 4.2% and 12.9%
  - 98.7% Precision on Wikidata5M-Ind — suitable for high-stakes domains (medicine, law)
  - Transparent evidence chains for each judgment; avg 9.8 tool invocations/triple (FB15K-237), 6.6 (Wikidata5M-Ind)
  - Cost: ~$0.011/triple (FB15K-237), ~$0.006/triple (Wikidata5M-Ind)

---

## 4. SCOPE and SCION: A Benchmark and an Auditable Reference Pipeline for Schema Induction and Fusion from Text
- **URL:** https://arxiv.org/abs/2607.21610
- **Date:** 20 May 2026 (arXiv)
- **Authors:** Miaobo Hu, Xiaobo Guo, Shuhao Hu, Bokun Wang, Rui Chen, Xin Wang, Daren Zha, Jun Xiao
- **Key Findings:**
  - SCOPE: First train-text-only benchmark for corpus-to-schema induction/fusion — 24 public IE sources (15 RE + 9 EE) normalized to gold schema graphs
  - Systems receive only train-split texts; gold schemas reserved strictly for evaluation
  - Four schema-graph metrics: Literal, Fuzzy, Continuous, Graph
  - SCION: Auditable reference pipeline — constructs candidate space from text, applies contract-constrained LLM modules (naming, merging, filtering) under strict JSON contracts with evidence pointers
  - Optional conservative fusion with base ontology package via alignment + provenance tracking
  - SCION-lite achieves highest F1 among all baselines (released schemas, Text2Onto-style, LLM-only, extract-then-aggregate)
  - Compact open-model variant (SCION-RL) reduces proprietary LLM reliance
  - Avg ~4 LLM calls, ~$0.12 per source

---

## 5. Generative Ontology Induction (GOI): Domain-Agnostic Schema Discovery from Document Corpora Using Large Language Models
- **URL:** https://arxiv.org/abs/2607.16201
- **Date:** July 2026 (arXiv)
- **Authors:** Sergienko et al.
- **Key Findings:**
  - Domain-agnostic framework inducing "generative blueprint" — entities, dimensions, properties, relationships, constraints — from document corpora
  - Exports typed graph (6 node types, 7 edge types) in YAML/JSON
  - Introduces Node Coverage Score: fraction of structural ontology nodes appearing in generated outputs
  - Reverse-engineers generative blueprint by analyzing multiple examples of same document type
  - Addresses gaps: predefined ontology seeds, constrained domains, untyped outputs, limited cross-document canonicalization, poor non-expert visualization/validation
  - Distinguishes generative ontology (enables instance generation) from descriptive entity extraction

---

## 6. GrOIL: Graph-Grounded Domain Ontology Induction with Constrained LLM Mediation
- **URL:** https://arxiv.org/abs/2608.22135
- **Date:** August 2026 (arXiv)
- **Authors:** (Harbin Institute of Technology / others)
- **Key Findings:**
  - Seven-stage pipeline converting domain documents into complete, auditable OWL TBox + ABox without unconstrained LLM generation
  - Stage 1: Documents → Unified Discourse-Hypergraphs (UDH) capturing entity participation + discourse dependencies
  - Subsequent stages: graph evidence → class hierarchy, typed object/datatype properties, restriction axioms
  - LLM usage restricted to narrow, graph-grounded mediation tasks (naming clusters, resolving domain/range, placing classes in hierarchy)
  - Closed-vocabulary prompting enforces output vocabulary at generation time
  - Paired ABox population grounds named individuals in induced TBox, enabling SPARQL-based functional evaluation
  - Achieves strong performance on structured gap-and-overlap reasoning; vocabulary saturation evidence at scale
  - Targets high-stakes domains: insurance, legal compliance, healthcare, finance

---

## 7. Wikontic: Constructing Wikidata-Aligned, Ontology-Aware Knowledge Graphs with Large Language Models
- **URL:** https://aclanthology.org/2026.eacl-long.388 (EACL 2026) / https://github.com/screemix/Wikontic
- **Date:** March 2026 (EACL), AAAI 2026 Demo
- **Authors:** Alla Chepurova, Aydar Bulatov, Mikhail Burtsev, Yuri Kuratov
- **Key Findings:**
  - Multi-stage pipeline: LLM triplet extraction → ontology-aware refinement (Wikidata constraints) → entity deduplication/alias tracking
  - Curated Wikidata ontology DB: 2,414 relation types with subject-object constraints, recursive type hierarchies (P31/P279)
  - Two modes: Structured (Wikidata-aligned) and Dynamic (learned aliases only)
  - KG construction: <1,000 output tokens (~3× fewer than AriGraph, <1/20 of GraphRAG)
  - On MuSiQue: 96% answer entity coverage, 38-45 more unique entities than HippoRAG/AriGraph
  - QA: 76.0 F1 HotpotQA, 59.8 F1 MuSiQue (triplets-only, no text context)
  - SOTA on MINE-1: 84-86% information retention (beats GraphRAG, KGGen)
  - Only 3.5% triplets flagged ontology-misaligned
  - Open-source: https://github.com/screemix/Wikontic, demo: https://wikontic.streamlit.app/

---

## 8. OntoKG: Ontology-Oriented Knowledge Graph Construction with Intrinsic-Relational Routing
- **URL:** https://arxiv.org/abs/2604.02618
- **Date:** April 2026 (arXiv)
- **Authors:** Yitao Li, Zhanlin Liu, Anuranjan Pandey, Muni Srikanth
- **Key Findings:**
  - Ontology-oriented approach: schema designed for ontology analysis, entity disambiguation, domain customization, LLM-guided extraction
  - Core mechanism: Intrinsic-Relational Routing — classifies every property as intrinsic (node attribute) or relational (traversable edge), routes to 94 modules (56 intrinsic, 38 relational) across 8 categories
  - Case study: January 2026 Wikidata dump (~100M items) → 34.6M core entities → 34.0M nodes, 61.2M edges, 38 relationship types
  - Agentic LLM workflow for iterative schema refinement with grounding tools verifying identifiers against KG
  - 93.3% category coverage, 98.0% module assignment accuracy
  - Five ontology-oriented applications consuming schema independently: structure analysis, benchmark auditing, entity disambiguation (+2.4 macro F1 over YAGO 4.5), domain customization, LLM-guided extraction
  - Schema exported as declarative (portable across backends), implemented in Python + Rust

---

## 9. TKG-Thinker: Towards Dynamic Reasoning over Temporal Knowledge Graphs via Agentic Reinforcement Learning
- **URL:** https://arxiv.org/abs/2602.05818
- **Date:** February 2026 (arXiv v2)
- **Authors:** Zihao Jiang, Miao Peng, et al.
- **Key Findings:**
  - Agentic RL framework for Temporal KG QA (TKGQA) with autonomous planning + adaptive retrieval
  - Dual-training strategy for in-depth temporal reasoning through dynamic multi-turn TKG interactions
  - Addresses reasoning hallucinations under complex temporal constraints
  - Performs multi-hop temporal reasoning via tool-augmented agent loop
  - Benchmarked on temporal KGQA datasets

---

## 10. Better Later Than Sooner: Neuro-Symbolic Knowledge Graph Construction via Ontology-grounded Post-extraction Correction (OAK)
- **URL:** https://arxiv.org/abs/2605.29168
- **Date:** May 2026 (arXiv)
- **Authors:** (Multiple institutions)
- **Key Findings:**
  - Neuro-symbolic framework: open-domain extraction → embedding-based canonicalization → targeted LLM correction of ontology violations
  - Deferring corrections to post-extraction avoids repeated LLM calls, reduces token usage
  - Ontology consistency: 98.4% (triples), 96.8% (qualifiers)
  - Preserves downstream QA quality; SPARQL graph-patterns benchmark for symbolic querying evaluation
  - More token-efficient than Wikontic, KGGen, in-context baselines
  - First broad empirical evaluation covering ontology consistency, QA, token efficiency, symbolic querying suitability

---

## Summary Table

| Paper | Venue/Date | Focus Area | Key Innovation |
|-------|-----------|------------|----------------|
| RAGA | arXiv May 2026 | Autonomous KG agent | Read-Search-Verify-Construct loop, KG-vector sync, full CRUD autonomy |
| DIAL-KG | DASFAA 2026 | Incremental KG | Meta-Knowledge Base, dual-track extraction, schema evolution |
| SHARP | ACM TOIS Apr 2026 | Triple verification | Schema-aware planning + hybrid toolset, training-free agent |
| SCOPE/SCION | arXiv Jul 2026 | Schema induction benchmark | 24-source train-text-only benchmark, auditable JSON-contract pipeline |
| GOI | arXiv Jul 2026 | Ontology induction | Generative blueprint (6 node/7 edge types), Node Coverage Score |
| GrOIL | arXiv Aug 2026 | OWL TBox induction | 7-stage UDH pipeline, constrained LLM mediation, closed-vocab prompting |
| Wikontic | EACL/AAAI Mar 2026 | Wikidata-aligned KG | Ontology-aware refinement, alias tracking, <1K tokens build |
| OntoKG | arXiv Apr 2026 | Schema engineering | Intrinsic-relational routing, 94 modules, agentic schema refinement |
| TKG-Thinker | arXiv Feb 2026 | Temporal KG reasoning | Agentic RL, dual-training, dynamic multi-turn TKG interaction |
| OAK | arXiv May 2026 | Neuro-symbolic KG | Post-extraction correction, SPARQL pattern benchmark |

---

## Emerging Themes (Late 2026)

1. **Agentic autonomy** — RAGA, DIAL-KG, SHARP, TKG-Thinker all frame KG construction/verification as ReAct-style agent loops with tool use
2. **Schema as emergent, not predefined** — SCOPE/SCION, GOI, GrOIL, DIAL-KG push schema induction from corpus; OntoKG routes schema for downstream reuse
3. **Provenance & auditability** — RAGA (evidence anchors), SHARP (evidence chains), SCION (JSON contracts + evidence pointers), GrOIL (UDH grounding)
4. **Hybrid neuro-symbolic** — OAK (post-extraction symbolic correction), SHARP (KG tools + external), GrOIL (graph evidence + constrained LLM)
5. **Token/cost efficiency** — Wikontic (<1K tokens), SCION (~$0.12/source), OAK (avoids repeated LLM calls)
6. **High-stakes domain readiness** — GrOIL (insurance/legal/healthcare), SHARP (98.7% precision), Wikontic (ontology compliance)
7. **Benchmark maturation** — SCOPE (first train-text-only schema induction benchmark), SPARQL graph-pattern benchmark (OAK)