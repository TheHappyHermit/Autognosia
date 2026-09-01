# Taxonomies vs. Ontologies: Foundations for AI Agent Knowledge Representation

## 1. Taxonomy: Hierarchical Classification

A **taxonomy** is a hierarchical classification scheme that arranges concepts into parent-child (broader/narrower) relationships, where each child is a kind of, or a narrower case of, its parent [2]. The canonical example is Linnaean biological classification (kingdom → species). Taxonomies answer one question: *what category does this belong to?* [9].

**SKOS (Simple Knowledge Organization System)** is the W3C standard data model for representing taxonomies, thesauri, and controlled vocabularies on the Semantic Web [4][7]. SKOS models knowledge organization systems (KOS) using `skos:Concept` as the primitive unit—an abstract idea or notion, not a class or instance in the logical sense [6]. Core SKOS relations include:

- `skos:broader` / `skos:narrower` — hierarchical (transitive variants available)
- `skos:related` — associative (non-hierarchical)
- `skos:prefLabel`, `skos:altLabel`, `skos:hiddenLabel` — lexical variants
- `skos:exactMatch`, `skos:closeMatch`, `skos:broadMatch` — cross-vocabulary mapping [3][4]

**Thesauri** extend taxonomies with equivalence relationships (synonyms/preferred terms) and associative relationships (related-term links). Standards like ISO 25964 define three hierarchical subtypes—generic, partitive, and instantial—distinguishing, for example, "car is-a vehicle" from "wheel part-of car" [1][5].

The strength of a taxonomy is its simplicity; the limitation is that real-world knowledge rarely fits a single tree, and one relationship type (is-a/broader) cannot capture how things actually interact [2][9].

## 2. Ontology: Formal Conceptualization

An **ontology** is "a formal, explicit specification of a shared conceptualization" [8]—a machine-readable model of a domain that defines classes, properties, individuals, and axioms with formal, machine-interpretable semantics [5]. Unlike taxonomies, ontologies support arbitrary, formally defined relationships beyond hierarchy: part-whole, causal, temporal, spatial, and domain-specific predicates [2].

Ontologies are typically expressed in **OWL (Web Ontology Language)**, which is underpinned by **Description Logics (DLs)**—decidable fragments of first-order logic [4]. Key constructs include:

- `rdfs:subClassOf` — class subsumption with inheritance
- `rdfs:domain` / `rdfs:range` — property constraints
- `owl:inverseOf` — bidirectional property inference
- `owl:TransitiveProperty`, `owl:SymmetricProperty` — relational characteristics
- Property chains, qualified cardinality restrictions, disjointness, keys [1][4]

OWL 2 profiles (EL, QL, RL) trade expressivity for computational efficiency, enabling polynomial-time reasoning or SQL-based query answering [1]. The **Open World Assumption** (OWA) is central: unspecified information remains open rather than assumed false, distinguishing DLs from databases [4].

## 3. Key Differences

| Dimension | Taxonomy (SKOS) | Ontology (OWL/RDFS) |
|-----------|------------------|---------------------|
| **Focus** | Categories, concepts (adjectives) | Entities, relationships (nouns) |
| **Structure** | Hierarchical tree/forest | Networked graph |
| **Primary relation** | broader/narrower | Diverse, formally defined predicates |
| **Semantics** | Semi-formal, navigational | Formal, logical, machine-interpretable |
| **Reasoning** | Transitive traversal | Consistency checking, classification, inference |
| **Axioms** | None (labels/notes only) | DL axioms (TBox), assertions (ABox) |
| **Expressivity** | Low (one relation type) | High (property chains, restrictions, inverses) |
| **Cost** | Lower build/maintain cost | Higher (modelling expertise, reasoners) [1][2][5][7] |

A taxonomy says "Espresso is narrower than Coffee"; an ontology says "every Espresso is a Coffee, Coffee is a Beverage made from CoffeeBean, hasIngredient is transitive, and nothing is both Beverage and Utensil" [5].

## 4. When to Use Each

**Use a taxonomy when:**
- The primary need is navigation, browsing, or faceted search [4]
- Stakeholders need to agree on canonical labels and definitions [6]
- The domain is primarily classificatory (product catalogs, content organization)
- Lightweight semantic anchoring for RAG retrieval is sufficient [6]

**Use an ontology when:**
- Automated reasoning, consistency checking, or inference is required [1]
- Complex relational constraints must be enforced (e.g., biomedical, engineering)
- Multi-hop queries across diverse relation types are needed
- Interoperability with other formal systems is critical [8]

Most projects need the middle rung—taxonomies—and only escalate to ontologies when reasoning demands justify the cost [1].

## 5. Taxonomy-to-Ontology Lifting (Conversion)

Converting SKOS taxonomies to OWL ontologies—"lifting"—is a well-studied challenge because SKOS relations are not strictly subsumptive [3][9]. The **GenTax algorithm** (Hepp & de Bruijn) derives consistent OWL/RDF-S ontologies from hierarchical classifications by:

1. Treating the classification as a directed graph of categories
2. Defining a "Master Concept" as the super-concept for all generic classes
3. Creating category classes (units of thought) and generic classes (actual things)
4. Validating subClassOf relations via random sampling [9]

The **SKOS2OWL** tool implements this approach, converting SKOS vocabularies into OWL ontologies that can be refined in editors like Protégé [9]. The W3C SKOS-and-OWL note documents hybrid patterns: using SKOS for labeling/documentation within OWL ontologies, or extending SKOS concepts with OWL domain/range restrictions [3].

Key insight: naive conversion (treating every `skos:broader` as `rdfs:subClassOf`) often produces inconsistent ontologies because thesaurus hierarchies mix generic, partitive, and instantial relations [3][5]. Careful human-in-the-loop validation remains necessary.

## 6. Ontology Reuse of Taxonomies

SKOS and OWL are complementary: SKOS captures "useful" relations between concepts; OWL captures "true" relations [3]. Common integration patterns include:

- **Annotation vocabulary**: SKOS labels/notes on OWL classes for human readability [3]
- **Hybrid conceptualizations**: Formal OWL model for entities/properties + SKOS vocabularies for topic classification (e.g., SWED directory) [3]
- **Extended SKOS**: Adding OWL domain/range to SKOS semantic relations (e.g., `hasManufacturer` sub-property of `skos:related`) [3]

## 7. Faceted Classification

**Faceted classification** organizes knowledge via independent, orthogonal dimensions (facets) rather than monolithic hierarchies. Ranganathan's **PMEST** scheme (Personality, Matter, Energy, Space, Time) is the classic example [7]. In ontology engineering, faceted approaches:

- Partition vocabulary into mutually exclusive, exhaustive dimensions
- Represent entities as tuples in the product space of facet values
- Enable modular, scalable classification with cross-facet relationships [7]

Faceted lightweight ontologies use tree-structured node labels containing atomic concepts from background knowledge, supporting flexible categorization without rigid hierarchies [7]. This is particularly valuable for AI agents that need multi-dimensional content organization (e.g., materials science, educational systems) [7].

## 8. Folksonomies vs. Formal Taxonomies

**Folksonomies** (a portmanteau of "folk" + "taxonomy") are bottom-up, user-generated classification systems emerging from social tagging [8]. Coined by Thomas Vander Wal in 2004, they represent collaborative, decentralized annotation with free-form tags [8].

| Aspect | Folksonomy | Formal Taxonomy |
|--------|-----------|-----------------|
| **Origin** | Bottom-up, emergent | Top-down, expert-designed |
| **Vocabulary** | Unconstrained, user-driven | Controlled, curated |
| **Relations** | Co-occurrence (syntagmatic) only | Hierarchical + associative (paradigmatic) |
| **Structure** | Flat tag clouds, no hierarchy | Tree/graph with defined relations |
| **Strengths** | Inclusive, current, low cost, reflects user language | Consistent, interoperable, supports reasoning |
| **Weaknesses** | Synonymy, polysemy, ambiguity, no inference | Expensive to build, can become outdated [8][9] |

Research shows folksonomies can yield "emergent ontologies" from tag co-occurrence patterns [8], and hybrid approaches (TaxoFolk) synthesize folksonomy tags into taxonomic structures, combining flexibility with navigational precision [8]. For AI agents, folksonomies offer organic vocabulary for query expansion, while formal taxonomies provide structural grounding.

## 9. Role of LLMs in Taxonomy/Ontology Generation

Large Language Models are reshaping knowledge engineering through two complementary paradigms [9]:

**Top-down (LLMs as co-modelers):** LLMs assist human experts in translating competency questions (CQs) and domain descriptions into formal OWL ontologies. Systems like **OntoGenix** implement multi-agent workflows (Plan Sage, OntoBuilder, OntoMapper) that preprocess data, define schemas, build ontologies, and generate RDF mappings—with human validation at critical checkpoints [9]. **TaxoLLaMA** fine-tunes LLM instruction datasets for taxonomy construction, enrichment, and hypernym discovery, achieving state-of-the-art on lexical semantic tasks [9].

**Bottom-up (Ontologies for LLMs):** LLMs induce schemas from unstructured text via open information extraction, clustering, and generalization. **OLLM** (End-to-End Ontology Learning) fine-tunes LLMs to model concept subgraphs, producing taxonomic backbones at scale with custom regularizers to prevent overfitting [9]. **OntoGen** uses zero-shot prompting to extract vocabularies, taxonomies, and relationship triplets from scientific literature, achieving >80% hierarchical accuracy in reconstructing existing knowledge graphs [9].

**Practical findings:**
- LLMs excel at suggesting synonyms, clarifying term distinctions, and generating initial hierarchies in unfamiliar domains [9]
- They are less reliable for producing complete, consistent taxonomies from scratch without human validation [9]
- Prompt sensitivity is high—minor alterations significantly impact output quality [9]
- Multi-agent architectures with self-repairing mechanisms (error feedback loops) improve reliability [9]
- Human-in-the-loop remains essential for complex domains requiring conceptual rigor [9]

## 10. Practical Implications for AI Agent Knowledge Representation

For AI agent systems like Autognosia, the taxonomy-ontology distinction has concrete architectural implications:

**Memory architecture:** Graph-based agent memory systems (MAGMA, MOSS) use multi-relational graphs where ontological structure (semantic, temporal, causal, entity relations) enables policy-guided retrieval beyond vector similarity [9]. Taxonomies provide the hierarchical scaffolding for organizing knowledge nodes; ontologies enable multi-hop reasoning across relation types.

**RAG enhancement:** Taxonomies improve retrieval through preferred/alternative labels and scope notes that match user vocabulary to indexed content [6]. Ontologies enable structured SPARQL queries, consistency verification, and inference-augmented generation [9].

**Neuro-symbolic integration:** The "ontological continuum" framework positions taxonomies and ontologies as points on a spectrum from lightweight vocabularies to richly axiomatized models, enabling agents to navigate knowledge engineering decisions with principled cost/benefit tradeoffs [9].

**Recommendation:** Start with SKOS taxonomies for conceptual scaffolding and vocabulary alignment, then lift to OWL ontologies incrementally where reasoning demands justify the investment. Use LLM-assisted generation for bootstrapping, with expert validation for quality assurance.

---

## Sources

1. [Ontologies, Taxonomies and Schemas — Multigrid](https://multigrid.ai/learn/ontology-vs-taxonomy)
2. [Taxonomy vs Ontology: Key Differences — Puppygraph](https://puppygraph.com/blog/taxonomy-vs-ontology)
3. [Taxonomy vs Thesaurus vs Ontology vs Knowledge Graph — Tesseract Academy](https://tesseract.academy/courses/ontology-training-knowledge-graphs-complete-course/lessons/taxonomy-vs-thesaurus-vs-ontology-vs-knowledge-graph)
4. [Taxonomy vs. Ontology vs. Knowledge Graph — Neo4j](https://neo4j.com/blog/knowledge-graph/taxonomy-vs-ontology-vs-knowledge-graph/)
5. [Structure vs. Concept — Ontologist Substack](https://ontologist.substack.com/p/structure-vs-concept)
6. [SKOS & Knowledge Organization Skill — Agent Skills](https://agent-skills.md/skills/sparkling/claude-config/skos)
7. [Is a Taxonomy an Ontology? — Accidental Taxonomist](https://accidental-taxonomist.blogspot.com/2026/06/is-taxonomy-an-ontology.html)
8. [Ontologies, Taxonomies and Knowledge Modeling — Electronic Artefacts](https://electronicartefacts.com/publications/ontologies-taxonomies-and-knowledge-modeling)
9. [Understanding Ontologies — NCBI](https://www.ncbi.nlm.nih.gov/books/NBK584339/)
10. [OWL 2 Web Ontology Language New Features — W3C](https://www.w3.org/2012/pdf/REC-owl2-new-features-20121211.pdf)
11. [SKOS2OWL: Deriving OWL from SKOS — Heppnetz](http://www.heppnetz.de/projects/skos2owl/)
12. [Lifting EMMeT to OWL — Springer](https://link.springer.com/chapter/10.1007/978-3-319-33245-1_7)
13. [Transform SKOS to OWL — W3C](https://www.w3.org/2006/07/SWD/SKOS/skos-and-owl/master.html)
14. [SKOS with OWL: Don't be Full-ish! — CEUR-WS](https://ceur-ws.org/Vol-432/owled2008eu_submission_22.pdf)
15. [Faceted Ontologies: Modular Domain Classification — Emergent Mind](https://emergentmind.com/topics/faceted-ontologies)
16. [Applying Ranganathan's Classification Theory to LLMs — Annals of Library Studies](https://or.niscpr.res.in/index.php/ALIS/article/view/25678)
17. [OntoGenix: LLMs for Ontology Development — ScienceDirect](https://www.sciencedirect.com/science/article/pii/S0306457324004011)
18. [From Human Experts to Machines: LLM-supported KG Construction — arXiv](https://ar5iv.labs.arxiv.org/html/2403.08345)
19. [End-to-End Ontology Learning with LLMs (OLLM) — arXiv](https://ar5iv.labs.arxiv.org/html/2410.23584)
20. [Scientific KG and Ontology Generation using Open LLMs — RSC Digital Discovery](https://pubs.rsc.org/en/content/articlehtml/2026/dd/d5dd00275c)
21. [TaxoLLaMA: LLM for Taxonomic Graphs — ACL Anthology](https://aclanthology.org/2026.acl-long.1709.pdf)
22. [LLM-empowered Knowledge Graph Construction: A Survey — arXiv](https://arxiv.org/html/2510.20345v1)
23. [Graph-based Agent Memory: Taxonomy, Techniques — arXiv](https://arxiv.org/html/2602.05665v1)
24. [MAGMA: Multi-Graph Agentic Memory — ACL Anthology](https://aclanthology.org/2026.acl-long.1709.pdf)
25. [Folksonomy — Wikipedia](https://en.wikipedia.org/w?title=Folksonomy)
26. [ISO 25964: Thesauri — Glossarist](https://glossarist.org/reference/standards/iso-25964)
27. [Knowledge Graph Re-engineering Along the Ontological Continuum — arXiv](https://arxiv.org/pdf/2605.22093v1)
28. [Heather Hedden: AI Strategy and Automation — GraphRAG Info](https://graphrag.info/2026/03/26/heather-hedden-the-accidental-taxonomist-on-ai-strategy-and-automation)