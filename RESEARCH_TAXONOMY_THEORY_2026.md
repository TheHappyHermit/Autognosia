# Taxonomy Theory & Knowledge Organization Research — September 2026 to Present

**Compiled:** September 2026 | **For:** Autognosia Active Wiki | **Scope:** Recent papers (Sep 2026–present) on taxonomy theory, ontology integration, library classification, metadata schemas, description logic/OWL, KOS standards, philosophical foundations

---

## 1. Taxonomy Theory — Hierarchical vs. Faceted vs. Semantic

### 1.1 SC-Taxo: Hierarchical Taxonomy Generation under Semantic Consistency Constraints using LLMs
- **Authors:** Shiqiang Cai, Nianhong Niu, Shizhu He, Kang Liu, Jun Zhao (Institute of Automation, Chinese Academy of Sciences)
- **arXiv:** `2605.00620v1` [cs.CL] — 1 May 2026
- **URL:** https://arxiv.org/abs/2605.00620
- **Claims:** Proposes SC-Taxo, a dual-path framework (structural clustering + semantic concept construction) with a four-round deep fusion mechanism (bidirectional heading generation, peer-level association modeling, parent-child vertical alignment, sibling horizontal alignment). Evaluated on TaxoBench and a curated Chinese scientific literature dataset.
- **Significance:** Addresses structural inconsistency and semantic drift in LLM-generated taxonomies. Achieves SOTA on Hierarchical Structure Retention (HSR: 75.3) and cross-lingual generalization. Demonstrates that decoupling structural induction from semantic refinement outperforms end-to-end LLM generation.

### 1.2 Context-Aware Hierarchical Taxonomy Generation for Scientific Literature
- **Authors:** (EMNLP 2025) — Aspect-guided LLM-based Top-Down Clustering
- **arXiv/ACL:** https://aclanthology.org/2025.emnlp-main.788.pdf
- **Claims:** Dynamically generates semantic aspects (research objective, methodology, data source) for paper collections; performs aspect-specific clustering via dynamic search; iteratively constructs taxonomy with topic facets as node headings.
- **Significance:** Introduces multi-aspect representation of papers, moving beyond single-vector embeddings. Facet-specific summaries enable context-aware classification at each hierarchy level.

### 1.3 Taxon: Hierarchical Tax Code Prediction with Semantically Aligned LLM Expert Guidance
- **Authors:** Jihang Li, Qing Liu, Zulong Chen, Jing Wang, Wei Wang, Chuanfei Xu, Zeyi Wen (Alibaba)
- **arXiv:** `2601.08418v2` [cs.LG] — 30 Apr 2026
- **URL:** https://arxiv.org/abs/2601.08418
- **Claims:** Feature-gating mixture-of-experts architecture routing multi-modal features across taxonomy levels; semantic consistency model distilled from LLMs as domain experts. Multi-source training pipeline (curated tax databases, invoice logs, merchant data). Deployed at Alibaba: 500K+ queries/day.
- **Significance:** Production-scale hierarchical classification with semantic verification. Demonstrates practical taxonomy alignment at commercial scale.

### 1.4 TaxMorph: Hierarchical Text Classification with LLM-Refined Taxonomies
- **Authors:** Jonas Golde, Nicolaas Paul Jedema, RaviKiran Krishnan, Phong Le (EACL 2026)
- **arXiv:** `2601.18375v1` [cs.CL] — 26 Jan 2026
- **DOI:** 10.18653/v1/2026.eacl-long.10
- **Claims:** TaxMorph uses LLMs to transform entire taxonomies (renaming, merging, splitting, reordering nodes) to match LM semantics. Consistently outperforms human-curated baselines (+2.9pp F1 on HTC benchmarks). LLMs insert intermediate nodes and refine label semantics.
- **Significance:** First framework to revise *full hierarchy* rather than individual labels. Shows human-curated taxonomies contain ambiguities that impede LM learning; LLM refinement resolves these.

### 1.5 TaxoCom: Topic Taxonomy Completion with Hierarchical Discovery of Novel Topic Clusters
- **Authors:** (par.nsf.gov) — Recursive identification of novel sub-topic clusters
- **URL:** https://par.nsf.gov/servlets/purl/10633935
- **Claims:** Completes existing topic taxonomies by recursively identifying novel sub-topic clusters using text embedding space. Addresses "novelty" relative to hierarchical semantic relationships (e.g., "hockey" not novel under "sports").
- **Significance:** Moves beyond static taxonomy construction to *completion* — extending taxonomies with newly discovered topics while preserving hierarchical coherence.

### 1.6 Hierarchy-Aware Semantic Losses for Knowledge Graph Link Prediction
- **Authors:** Filip Kronström, Ross D. King
- **arXiv:** `2608.22981v1` — 24 Aug 2026
- **URL:** https://arxiv.org/abs/2608.22981
- **Claims:** Incorporates hierarchical semantic structure into KG link prediction losses. Leverages taxonomic hierarchies to improve link prediction in knowledge graphs.
- **Significance:** Bridges taxonomy structure with KG completion — hierarchical constraints as inductive bias for semantic reasoning.

### 1.7 ATLAS: Agentic Taxonomy of Large-Scale Software Ecosystems
- **Authors:** (arXiv 2606.21597v2)
- **URL:** https://arxiv.org/html/2606.21597v2
- **Claims:** First framework to automatically construct hierarchical taxonomy for GitHub repositories and classify them end-to-end. GitHub Topics are flat/inconsistent (67% coverage). ATLAS uses LLMs with data-driven grounding to build mutually exclusive sibling categories, tree depth encoding specificity.
- **Significance:** Demonstrates taxonomy *construction from data* (not just LLM knowledge) at ecosystem scale. Multi-granularity retrieval, alternative discovery, ecosystem analysis.

---

## 2. Taxonomy vs. Ontology Distinctions and Integration

### 2.1 Ontology vs. Taxonomy in 2026: Data Governance and AI Guide (OvalEdge)
- **URL:** https://www.ovaledge.com/blog/ontology-vs-taxonomy
- **Key Distinctions:**
  - **Taxonomy:** Answers "Where does this belong?" — tree structure, parent-child relationships, classification function
  - **Ontology:** Answers "How is this connected?" — network structure, multiple relationship types, knowledge representation function
  - **Thesaurus:** Controlled vocabulary with synonym/related-term mappings
  - **Knowledge Graph:** Applied ontology + instance data
- **Significance:** Practical decision framework for enterprise data governance. Taxonomy for catalog organization; ontology for semantic reasoning and cross-system interoperability.

### 2.2 pro-team at LLMs4OL 2026: Retrieval-Augmented Generation for Ontology Learning
- **Authors:** (LLMs4OL 2026 Challenge — ISWC)
- **arXiv:** `2608.27101v2`
- **URL:** https://arxiv.org/pdf/2608.27101v2
- **Claims:** Offline retrieval-augmented few-shot prompting for ontology learning. Task A (Flagship): end-to-end primitive ontology from raw text (Semantic Graph Similarity 0.7416). Task B (Reuse): incremental extension of partial ontology (SGS 0.8692, Term-Typing F1 0.9200, Taxonomy Discovery F1 0.8540). Vocabulary-constrained filtering retains triples with endpoints in closed vocabulary.
- **Significance:** Benchmarks LLM-based ontology learning with structured evaluation. Separates taxonomy induction (Task C) from full ontology construction — clarifying the taxonomy/ontology boundary in practice.

### 2.3 Enhancing Healthcare through Ontology: Systematic Review (2026)
- **Authors:** Priyadharshini U, Vijayan R
- **Journal:** Frontiers in Artificial Intelligence — Published 19 Aug 2026
- **DOI:** 10.3389/frai.2026.1872024
- **Ontology Formalization:** O = (C, R, I, H) — Concepts, Relationships, Instances, Hierarchical relations
- **Significance:** Systematic review of ontology challenges in healthcare: data consistency, interoperability, evolving medical knowledge. Ontology as *systematic framework* for managing medical knowledge across systems.

### 2.4 Beyond Tools and Persons: Classifying Robots and AI Agents for Proportional Governance
- **Authors:** (arXiv 2604.05568v1)
- **URL:** https://arxiv.org/pdf/2604.05568v1
- **Claims:** Proposes CPST (Cyber-Physical-Social-Thinking) space theory — four dimensions (computational, embodied, relational, cognitive). Three-tier taxonomy: Confined Actors, Socially-Aware Interactors, CPST-Integrated Agents. Governance: product liability → relational duties of care → qualified legal personhood.
- **Significance:** *Ontological gap* in AI governance — current binary "tool vs. person" categories inadequate. Taxonomy grounded in integration degree across dimensions, not risk levels alone.

### 2.5 Integrating Domain-Specific Taxonomies through Metadata Harmonization
- **Authors:** Ignatius D Martin, Merlin Arlo
- **Journal:** QITP-IJLIS 6(1), 1–5 (Published 6 Jan 2026)
- **URL:** https://qitpress.com/articles/QITP-IJLIS/VOLUME_6_ISSUE_1/QITP-IJLIS_06_01_001.pdf
- **Claims:** Semi-automated harmonization framework guided by FAIR principles. Maps terms across taxonomies, resolves homonyms/synonyms, develops shared upper ontology. Uses semantic web technologies and ontology alignment.
- **Significance:** Practical integration of *disparate taxonomies* (not ontologies) via metadata harmonization. Shows taxonomy alignment as prerequisite for ontology integration.

### 2.6 Taxonomy-Aware Representation Alignment (TARA)
- **Source:** EmergentMind — Updated 5 July 2026
- **URL:** https://emergentmind.com/topics/taxonomy-aware-representation-alignment-tara
- **Claims:** Aligns multimodal representations using explicit taxonomic structures for coarse-to-fine label consistency. Dual alignment: coupled loss functions + human-in-the-loop calibration. In ontology construction: aligned object is directed prerequisite relation (Concept A required for Concept B).
- **Significance:** Taxonomic structure as *constraint* on representation learning — not just classification target but architectural inductive bias.

---

## 3. Library and Information Science Classification Systems

### 3.1 AI-Driven Cataloguing and Classification in Academic Libraries (2026)
- **Authors:** Olubiyo, Rabiu
- **Journal:** IJALIS — Accepted 29 Mar 2026
- **URL:** http://academicresearchjournals.org/IJALIS/PDF/2026/March/Olubiyo%20and%20Rabiu.pdf
- **Claims:** AI transforming conventional cataloguing (DDC, LCC, AACR2, RDA). Addresses data quality, algorithmic bias, staff competencies, financial limitations. Strategic frameworks for AI implementation.
- **Significance:** Documents the *current transition* from manual to AI-assisted classification in academic libraries. DDC/LCC remain foundational but augmented by ML.

### 3.2 Application of AI for Library Document Classification: Systematic Review
- **Source:** pure.jgu.edu.in — PRISMA framework
- **URL:** https://pure.jgu.edu.in/id/eprint/11189
- **Claims:** 27 studies analyzed; SVM and BERT most popular models. Highest accuracy: DDC with SVM (F1 0.80–0.85). Challenges: insufficient datasets, scheme complexity, ML technical limitations.
- **Significance:** Empirical evidence that *automated classification of traditional schemes (DDC, UDC, LCC, CC) is viable but incomplete* — human expertise still needed for complex schemes.

### 3.3 Comparing LCC and DDC Assignment Across LC Bibliographic Records
- **Authors:** (dcpapers.dublincore.org)
- **URL:** https://dcpapers.dublincore.org/article/952661074
- **Claims:** 4,042,962 dual-classified records analyzed. Humanities (law, arts, religion, literature, history) show high one-to-one alignment; social sciences, technology, CS show dispersed cross-system mappings. Structural asymmetry: LCC → DDC mapping sharper than DDC → LCC.
- **Significance:** Large-scale empirical comparison of the two dominant *enumerative* (LCC) vs. *hierarchical* (DDC) systems. Reveals domain-dependent alignment patterns.

### 3.4 Classification and Faceted Analysis: Ranganathan, CRG, and Consolidation of Method
- **Authors:** (Cataloging & Classification Quarterly — Published 22 Apr 2026)
- **DOI:** 10.1080/01639374.2026.2657155
- **Claims:** Distinguishes *faceted analysis* (logical-analytical process) from *faceted classification* (formal representational structure). Historical-conceptual reconstruction of Ranganathan and Classification Research Group (CRG). These operate at distinct abstraction levels — complementary, non-interchangeable.
- **Significance:** **Critical theoretical clarification** — faceting as epistemological paradigm, not mere technical mechanism. Essential for designing semantically expressive, interoperable, context-adaptive systems.

### 3.5 Ranganathan's Classification Theory Applied to LLM Epistemology
- **Authors:** (ALIS 2026 — DOI: 10.56042/alis.v72i4.25678)
- **URL:** https://doi.org/10.56042/alis.v72i4.25678
- **Claims:** Proposes Faceted Classification Module (FCM) mapping LLM claims to PMEST facets + three planes of work (Idea, Verbal, Notational). Seven-level epistemic hierarchy for certainty rating. Compared with GraphRAG; classification-based systems complement graph-based retrieval for fact-checking and cultural context.
- **Significance:** **Novel application** of classical faceted theory to *LLM hallucination detection and explainability*. Treats LLM outputs as "documents" requiring classification/validation.

### 3.6 AI Approaches for Automatic Classification in KOS: Comprehensive Analytical Study
- **Journal:** IJMR (2026) — Two versions found
- **URLs:** https://epratrustpublishing.com/IJMR/artificial-intelligence-approaches-for-automatic-classification-in-knowledge-organization-systems-a-comprehensive-analytical-study/20308
- **Claims:** Evolution of classical systems (DDC, UDC, LCC) → AI technologies (NLP, deep learning, text mining) for automatic subject assignment. Analyzes advantages, problems, future of AI in library science.
- **Significance:** Comprehensive survey bridging classical KOS and modern AI classification.

---

## 4. Metadata Schema Taxonomies (Dublin Core, Schema.org)

### 4.1 DC-NDL 2026: Improved Metadata Schema Based on Dublin Core
- **Authors:** National Diet Library (Japan)
- **Journal:** dcpapers.dublincore.org — Published 2026
- **URL:** https://dcpapers.dublincore.org/article/952647971
- **Claims:** Three-layer structure: Admin (management), Bib (resource identification), Item (institutional holdings). Adapts IFLA LRM WEMI model. New properties for metadata reuse conditions (URIs), original database/institution provenance. Discontinued some properties in favor of dcterms:publisher/date at Item level.
- **Significance:** National library-scale DC adaptation with WEMI integration and provenance tracking.

### 4.2 DataCite Metadata Schema v4.7 (March 2026)
- **Source:** CASRAI Guide
- **URL:** https://casrai.org/guides/how-to-choose-a-metadata-schema-for-a-dataset
- **Claims:** De facto standard for citable research data (DOI registration). 6 mandatory properties (Identifier, Creator, Title, Publisher, PublicationYear, ResourceType), 6 recommended, 8 optional (FundingReference, RelatedItem, etc.).
- **Significance:** Core metadata baseline for research data citation and discoverability.

### 4.3 Schema.org Version 30.0 (2026)
- **URL:** https://schema.org/version/latest
- **Key Updates:** Health-lifesci extension (385 terms, V30.0 | 2026-03-19), accessibility properties for discoverability (W3C CG Final Report 28 Jan 2026), ELI legislation extension for schema.org. Over 45M domains, 450B+ objects.
- **Schema.org OWL:** Experimental OWL definition file available (schemaorg.owl) with domainIncludes/rangeIncludes as rdfs:domain/range via owl:unionOf.
- **Significance:** **Largest deployed vocabulary** on the web. Extension mechanism (hosted sections: auto, bib, health-lifesci, meta, pending) enables domain specialization without core modification.

### 4.4 Dublin Core Metadata Element Set (DCMES) — Current Status
- **Source:** MSI Dublin Core — Indexed 2026-03-16
- **URL:** https://msi.dublincore.org/standards/dublin-core-elements
- **Claims:** 15 core properties standardized as ISO 15836, ANSI/NISO Z39.85, IETF RFC 5013. Qualified DC adds audience, provenance, rightsholder, instructional method, accrual properties. DCMI manages specifications, annual conference, training.
- **Significance:** Foundational cross-domain vocabulary; "core metadata" baseline for repository interoperability (CASRAI Core Metadata v2026.1).

### 4.5 BIBFRAME 2026 Updates (Library of Congress)
- **URL:** https://www.loc.gov/bibframe/
- **Key 2026 Activity:** BIBFRAME Update Forum (Jun 22, 2026), Conversion 3.1 (Apr 17, 2026), Conversion 3.0 (Dec 1, 2025). MARC 21→BIBFRAME specs updated Apr 2026. DCMI 2026 panel on global BIBFRAME implementation.
- **Significance:** Active transition from MARC to Linked Data bibliographic framework. BIBFRAME as *ontology* (RDF/OWL) replacing MARC's record format.

---

## 5. Description Logic and OWL as Taxonomy Formalisms

### 5.1 TAPO-Description Logic for Information Behavior: Refined OBoxes, Inference, Categorical Semantics
- **Author:** Takao Inoué (Yamato University)
- **arXiv:** `2604.21172` — 22 Apr 2026
- **URL:** https://arxiv.org/pdf/2604.21172.pdf
- **Claims:** Layered formalism: static (TBox/ABox), procedural (PBox), oracle-sensitive (OBox). Metalevel guard-judgment layer for procedural branching. Categorical semantics for TBox/ABox as categorical data.
- **Significance:** Extends classical DL beyond static representation to model *dynamic information behavior* (iterative search, conditional actions, external oracle interaction).

### 5.2 TAPO-Structured Description Logic: Procedural and Oracle-Based Extensions
- **Author:** Takao Inoué
- **arXiv:** `2602.17242` — 19 Feb 2026
- **URL:** https://arxiv.org/pdf/2602.17242.pdf
- **Claims:** PBox for imperative concept-driven programs (if-then, while); OBox for controlled external oracle interaction. Models iterative search, conditional actions on partial information.
- **Significance:** DL as *process formalism*, not just knowledge representation. Bridges KR and information behavior modeling.

### 5.3 GrOIL: Graph-Grounded Domain Ontology Induction with Constrained LLM Mediation
- **Authors:** Maruf Ahmed Mridul, Abid Talukder, Oshani Seneviratne
- **Conference:** CIKM 2026 (Nov 7–11, Rome) — arXiv: `2608.22135`
- **URL:** https://arxiv.org/pdf/2608.22135
- **Claims:** Seven-stage pipeline: documents → Unified Discourse-Hypergraphs (UDH) → class hierarchy → typed properties → restriction axioms → OWL TBox. LLM restricted to bounded semantic decisions over graph evidence (closed-vocabulary prompting). CQ coverage 0.85 vs. 0.63/0.62 baselines.
- **Significance:** **Auditable, grounded ontology induction** — no unconstrained LLM generation. Corpus grounding + vocabulary control + axiom expressivity + provenance.

### 5.4 From Subsumption to Satisfiability: LLM-Assisted Active Learning for OWL Ontologies
- **Authors:** (arXiv 2604.16672v1)
- **URL:** https://arxiv.org/pdf/2604.16672v1.pdf
- **Claims:** Reformulates subsumption tests as satisfiability (counter-concept verbalized in controlled NL). Proves only Type II errors (false negatives) — delays construction but never introduces inconsistencies. Evaluated on 13 commercial LLMs.
- **Significance:** Sound LLM-assisted ontology engineering — *formal guarantee* against logical corruption.

### 5.5 DL-ReasonSuite: Benchmark for Evaluating DL Reasoning in LLMs
- **Journal:** Applied Sciences 16(4), 1821 (2026)
- **URL:** https://mdpi.com/2076-3417/16/4/1821
- **Claims:** 4,740 tasks across 7 types, 3 tracks: DLCore (consistency, subsumption, instance checking), DLQuery (SPARQL entailment), DLBridge (NL↔OWL translation). LLMs struggle with complex query reasoning and precise OWL translation.
- **Significance:** First comprehensive benchmark for *LLM reasoning over description logics* — reveals gap between pattern recitation and genuine DL reasoning.

### 5.6 Syntactic Simplification of OWL Class Expressions (CES Algorithm)
- **Authors:** (arXiv 2608.18899v1) — 20 Aug 2026
- **URL:** https://arxiv.org/pdf/2608.18899v1
- **Claims:** Class Expression Simplifier (CES) reduces complex OWL class expressions from CEL without altering logical entailments. Measurable improvements in reasoning efficiency and verbosity reduction on medium-sized ontologies.
- **Significance:** Practical tool for *maintainable ontologies* — human-readable class expressions critical for knowledge graph construction and Web-scale reasoning.

### 5.7 Semantic Foundations for Digital Twins: Ontological Analysis with OWL/DL
- **Author:** Mohammed Elhajj
- **Journal:** Frontiers in Computer Science 8:1757450 (Published 2 Mar 2026)
- **DOI:** 10.3389/fcomp.2026.1757450
- **Claims:** Ontology-driven DT framework using OWL/DL for semantic reasoning, data representation, interoperability via standards-aligned semantic mapping. Addresses multi-domain complexity, heterogeneous sources, semantic inconsistencies.
- **Significance:** DL/OWL as *semantic integration layer* for cyber-physical systems — not just classification but real-time reasoning.

### 5.8 OWL-based Ontology for Semantic Competency Mapping in STEM Education
- **Authors:** Alibekkyzy K, Bazarova M, Sadakbayeva A, Zhomartkyzy G
- **Journal:** Frontiers in Computer Science 8:1848519 (Published 17 Jun 2026)
- **DOI:** 10.3389/fcomp.2026.1848519
- **Claims:** OWL ontology in Protégé integrating instructional methods, competencies, indicators, assessment tools, control forms. SPARQL competency questions enable automated traceability chains (pedagogical methods → measurable outcomes).
- **Significance:** OWL for *explainable assessment* — semantic competency mapping with automated validation.

---

## 6. Knowledge Organization Systems (KOS) Standards

### 6.1 NKOS 2026 Workshop (DCMI 2026, Seoul) — Networked KOS
- **URL:** https://nkos.dublincore.org/2026NKOSworkshop/NKOS2026.html
- **Themes:** (1) KOS mappings/alignment (AI/GenAI as mapping tools, multilingual archives), (2) User interaction with KOS in semantic search. Topics: AI KOS-based indexing/classification, KOS recommender systems, meaningful visualization, standards development, evaluation methods, KOS in e-research, AI applications.
- **Significance:** **Primary international forum** for KOS-as-services. 2026 focus on AI-assisted KOS mapping and user-centered retrieval.

### 6.2 ISO 25964-1 Revision (FDIS Stage, 2026)
- **Standard:** ISO/FDIS 25964-1 — Thesauri for Information Retrieval
- **URL:** https://www.iso.org/cms/live/live/en/sites/isoorg/contents/data/standard/08/94/89436.html
- **Status:** FDIS registered Jan 2026 (Stage 50.00). Revision of 2011 edition. Technical Committee ISO/TC 46/SC 9.
- **Claims:** Applicable to all vocabularies for retrieval across media types. Data model + import/export format. Monolingual/multilingual thesauri.
- **Significance:** **Major revision** driven by expanded use cases (beyond libraries/publishing). Aligns with SKOS.

### 6.3 ISO 25964-2: Interoperability with Other Vocabularies (AWI 2026)
- **Standard:** ISO/AWI 25964-2 Edition 2
- **URL:** https://www.iso.org/standard/92117.html
- **Claims:** Mapping recommendations between thesauri and other vocabularies (classification schemes, taxonomies, subject headings, terminologies, ontologies). Clause 13: pre-coordinated classes in classification schemes.
- **Significance:** **Interoperability standard** — how to align different KOS types (thesauri, taxonomies, classifications, ontologies).

### 6.4 Thesaurus Standards for Taxonomies (Taxonomy Strategies, 2026)
- **Presenters:** Heather Hedden, Joseph Busch (ISO-TC 46-SC 9-WG 8)
- **URL:** https://taxonomystrategies.com/wp-content/uploads/2026/05/TBC-London-2026-Thesaurus-Standards-for-Taxonomies-Presentation.pdf
- **Claims:** Two standard types: (1) Specifications/interoperability: MARC, Dublin Core, RDF, RDFS, SKOS; (2) Design/quality: ISO 25964, ANSI/NISO Z39.19. ISO 25964-1 revision publishing 2026. Data model standards exist for taxonomies (SKOS) but *design/quality standards do not*.
- **Significance:** Identifies **critical gap** — SKOS provides data model but no design principles for taxonomy quality. ISO 25964 revision addresses this.

### 6.5 SKOS (Simple Knowledge Organization System) — W3C Standard
- **URL:** https://www.w3.org/2004/02/skos
- **Claims:** RDF vocabulary for expressing KOS (thesauri, classification schemes, subject headings, taxonomies) on Semantic Web. SKOS Core, SKOS Mapping, SKOS Extensions. Low-cost migration path for existing KOS to Linked Data.
- **Significance:** **Bridge standard** — enables traditional KOS (thesauri, classifications) to interoperate as RDF. Used by Glossarist for 52 typed semantic relationship types across 5 standards.

### 6.6 ISO/DIS 30401: Knowledge Management Systems — Requirements (2026)
- **URL:** https://www.iso.org/cms/live/live/en/sites/isoorg/contents/data/standard/08/94/89436.html
- **Claims:** Management system standard for organizational knowledge management. Generic requirements applicable to any organization. Integrates with other MSS (quality, AI management). Certification available.
- **Significance:** **Organizational-level** KOS governance — not just technical standards but management system requirements.

---

## 7. Philosophical Foundations of Categorization

### 7.1 Aristotle's Categories — Contemporary Relevance
- **Sources:** Stanford Encyclopedia of Philosophy (revised Feb 2021), Philosophy Institute articles
- **URLs:** https://plato.stanford.edu/entries/aristotle-categories, https://philosophy.institute/metaphysics/aristotles-categories-western-metaphysics
- **Core Framework:** Ten categories — Substance (primary/secondary), Quantity, Quality, Relation, Place, Time, Position, State, Action, Affection. Two ontological relations: "said of" (essential classification, transitive) and "present in" (ontological dependence).
- **Significance for KOS:** Aristotle's categories as **top-level ontology** — still referenced in applied ontology (Basic Formal Ontology, DOLCE). "Said of" = taxonomic subsumption; "present in" = property inherence. Non-reductionist: all ten categories irreducible.

### 7.2 Kant's Categories — Transcendental Deduction
- **Sources:** Stanford Encyclopedia (Categories entry), Grokipedia, Cambridge "The Aristotelian Kant" (2026)
- **URLs:** https://plato.stanford.edu/entries/categories, https://grokipedia.com/page/Category_(Kant)
- **Core Framework:** Twelve categories from logical forms of judgment → four classes: Quantity (unity, plurality, totality), Quality (reality, negation, limitation), Relation (substance/accident, cause/effect, community), Modality (possibility, existence, necessity). A priori conditions for objective experience.
- **Significance for KOS:** Categories as *cognitive structures* (not ontological). Influences facet analysis (Ranganathan's PMEST as fundamental categories of thought). Kant's critique of Aristotle: no common principle, spurious categories.

### 7.3 Prototype Theory (Eleanor Rosch) — Cognitive Science of Categorization
- **Sources:** Wikipedia, Cognitive Psychology Reference, MIT Open Encyclopedia of Cognitive Science
- **Core Claims:** Natural categories organized around *prototypes* (most typical members) not necessary/sufficient conditions. Graded membership (robin > penguin as "bird"). Family resemblance (Wittgenstein). Basic level categorization (chair > furniture > desk chair).
- **Significance for KOS:** **Empirical challenge** to classical Aristotelian/definitional categorization. Taxonomies with sharp boundaries vs. graded typicality. Informs faceted/graded classification and "fuzzy" KOS.

### 7.4 Sellars' Conception of Categories as Classifying Conceptual Roles (2026)
- **Source:** Cambridge University Press — "Interpreting Sellars" Chapter 1 (Published online 23 Apr 2026)
- **URL:** https://cambridge.org/core/product/identifier/9781009330558%23BP2/type/BOOK_PART
- **Claims:** Categories as *functional classification* of conceptual roles. Anti-platonist: categories not abstract universals but roles in the "logical space of reasons." Connects to myth of the given, manifest vs. scientific images.
- **Significance:** **Normative/pragmatic** account of categories — classification as inferential practice, not mirroring reality. Relevant for KOS as *social-epistemic practice*.

### 7.5 Ranganathan's PMEST as Universal Fundamental Categories
- **Sources:** ISKO Encyclopedia (Facet Analysis, Facet), Britannica, Colon Classification literature
- **Core Framework:** Personality, Matter, Energy, Space, Time (PMEST) — five fundamental categories as dimensions of any subject. Colon Classification (1933, 7th ed. 1987) as analytico-synthetic system. Facets = "totality of isolates from single characteristic of division."
- **Significance:** **Most developed faceted theory** in LIS. PMEST as *universal analytic framework* — applied in 2026 to LLM claim validation (ALIS 2026). Contrasts with CRG's domain-specific categories (13+).

### 7.6 Contemporary Category Theory (Husserl, Formal vs. Material Ontology)
- **Source:** Stanford Encyclopedia (Categories entry)
- **Claims:** Husserl distinguishes categories of *meanings* from categories of *objects*; two orthogonal systems via formalization and generalization. Category mistakes as semantic vs. ontological errors.
- **Significance:** **Multi-dimensional categorization** — not single hierarchy but correlated meaning/object categories. Relevant for multi-layer KOS (SKOS concepts vs. OWL classes).

---

## Cross-Cutting Themes & Integration Points

| Theme | Key Papers/Standards | Integration Insight |
|-------|---------------------|---------------------|
| **LLM + Taxonomy** | SC-Taxo, TaxMorph, Taxon, ATLAS, GrOIL | LLMs as *taxonomists* (refinement, generation, alignment) — but require grounding, constraints, validation |
| **Taxonomy ↔ Ontology** | LLMs4OL Tasks A/B/C, OvalEdge guide, Healthcare ontology | Taxonomy = hierarchy (subsumption); Ontology = network (multiple relations). SKOS for taxonomy data model; OWL for ontology reasoning |
| **Faceted Theory Modernization** | Ranganathan/CRG (2026 papers), ILC, LLM-FCM | Faceted analysis as *epistemological method*; faceted classification as *synthetic notation*. Applied to AI explainability |
| **Metadata Standards Evolution** | DC-NDL 2026, DataCite 4.7, Schema.org 30, BIBFRAME | Convergence: DC as core, Schema.org as web vocabulary, BIBFRAME as library ontology, ISO 25964 for thesaurus quality |
| **Description Logic Advances** | TAPO-DL, GrOIL, DL-ReasonSuite, CES | DL extended: procedural (PBox), oracle (OBox), neuro-symbolic (DeepEL), LLM-assisted (active learning), simplification (CES) |
| **KOS Interoperability** | ISO 25964-1/2, SKOS, NKOS 2026 | Mapping standards maturing; AI-assisted alignment; pre-coordinated (classification) ↔ post-coordinated (thesaurus) bridging |
| **Philosophical Grounding** | Aristotle, Kant, Prototype, Sellars, Ranganathan | Multiple valid categorization paradigms: ontological (Aristotle), cognitive (Kant/Rosch), pragmatic (Sellars), analytic-synthetic (Ranganathan) |

---

## Key 2026 Developments Summary

1. **LLMs as Taxonomy Engineers** — Multiple frameworks (SC-Taxo, TaxMorph, Taxon, ATLAS, GrOIL) demonstrate LLMs can generate, refine, align, and populate taxonomies/ontologies *with constraints* (grounding, vocabulary control, procedural validation).

2. **ISO 25964 Revision Finalized** — Thesaurus standard updated for expanded use cases; explicit alignment with SKOS; addresses taxonomy design quality gap.

3. **BIBFRAME Transition Accelerating** — MARC→BIBFRAME conversion specs v3.1 (Apr 2026); global implementation panel at DCMI 2026.

4. **Description Logic Extended for Dynamics** — TAPO-DL adds procedural (PBox) and oracle (OBox) layers to static TBox/ABox; DeepEL combines DL with deep learning.

5. **Faceted Theory Applied to AI Epistemology** — Ranganathan's PMEST + planes of work used to structure LLM claim validation (ALIS 2026).

6. **Large-Scale Empirical Classification Studies** — 4M+ LC records comparing DDC/LCC; DL-ReasonSuite benchmarking LLM DL reasoning.

7. **Governance Ontologies Emerging** — CPST taxonomy for AI agents; healthcare SoS ontology (OWL 2 DL); competency mapping ontologies.

---

## Recommended Next Research Directions

1. **Taxonomy-Ontology Round-trip Engineering** — How to maintain alignment when taxonomies evolve (LLM-refined) and ontologies extend (GrOIL-style)?
2. **Faceted Classification in Vector Spaces** — PMEST facets as interpretable dimensions in embedding spaces for neurosymbolic KOS.
3. **KOS Versioning & Provenance** — DC-NDL provenance tracking + ISO 25964 mapping + BIBFRAME change management → unified KOS evolution framework.
4. **Cognitive Plausibility of KOS** — Prototype theory + Kantian categories + Ranganathan PMEST → experimental validation of classification usability.
5. **Automated KOS Mapping at Scale** — NKOS 2026 AI mapping theme + LLMs4OL Task C + Schema.org extension mechanism → cross-domain KOS alignment pipeline.

---

## Citation Index (arXiv/DOI/URL)

| ID | Citation |
|----|----------|
| [1] | Cai et al., "SC-Taxo: Hierarchical Taxonomy Generation under Semantic Consistency Constraints using Large Language Models," arXiv:2605.00620v1, 2026. |
| [2] | Golde et al., "Hierarchical Text Classification with LLM-Refined Taxonomies," EACL 2026, DOI: 10.18653/v1/2026.eacl-long.10. |
| [3] | Li et al., "Taxon: Hierarchical Tax Code Prediction with Semantically Aligned LLM Expert Guidance," arXiv:2601.08418v2, 2026. |
| [4] | Mridul et al., "GrOIL: Graph-Grounded Domain Ontology Induction with Constrained LLM Mediation," CIKM 2026, arXiv:2608.22135. |
| [5] | Inoué, "TAPO-Description Logic for Information Behavior," arXiv:2604.21172, 2026. |
| [6] | Inoué, "TAPO-Structured Description Logic," arXiv:2602.17242, 2026. |
| [7] | Elhajj, "Semantic Foundations for Digital Twins," Front. Comput. Sci. 8:1757450, 2026. |
| [8] | Alibekkyzy et al., "OWL-based Ontology for Semantic Competency Mapping," Front. Comput. Sci. 8:1848519, 2026. |
| [9] | (LLMs4OL 2026) "pro-team at LLMs4OL 2026 Tasks Flagship and Reuse," arXiv:2608.27101v2. |
| [10] | (DL-ReasonSuite) "Benchmark for Evaluating Description Logic Reasoning in LLMs," Appl. Sci. 16(4):1821, 2026. |
| [11] | Martin & Arlo, "Integrating Domain-Specific Taxonomies through Metadata Harmonization," QITP-IJLIS 6(1):1–5, 2026. |
| [12] | (DC-NDL 2026) "An Improved Metadata Schema Based on the Dublin Core," dcpapers.dublincore.org, 2026. |
| [13] | (LCC vs DDC) "Comparing LCC and DDC Assignment Across LC Bibliographic Records," dcpapers.dublincore.org, 2026. |
| [14] | (Faceted Analysis) "Classification and Faceted Analysis: Ranganathan, the CRG...," Cat. Class. Q., DOI: 10.1080/01639374.2026.2657155. |
| [15] | (Ranganathan + LLM) "Applying S.R. Ranganathan's Classification Theory to Investigate the Epistemology of KOS in LLMs," ALIS, DOI: 10.56042/alis.v72i4.25678. |
| [16] | ISO/FDIS 25964-1:2026, "Thesauri for Information Retrieval." |
| [17] | ISO/AWI 25964-2:2026, "Interoperability with Other Vocabularies." |
| [18] | Schema.org Version 30.0 (2026-03-19). |
| [19] | BIBFRAME Conversion Specifications 3.1 (2026-04-17). |
| [20] | Kronström & King, "Hierarchy-Aware Semantic Losses for KG Link Prediction," arXiv:2608.22981v1, 2026. |

---

*End of Research Compilation*