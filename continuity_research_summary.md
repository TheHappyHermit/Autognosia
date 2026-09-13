# Research Summary: CONTINUITY (arXiv 2609.05269)

## Paper Identification
- **Title**: CONTINUITY: Security-Context Contracts for Composable LLM Agent Controls
- **arXiv ID**: 2609.05269
- **URL**: https://arxiv.org/abs/2609.05269
- **HTML Version**: https://arxiv.org/html/2609.05269v1
- **PDF**: https://arxiv.org/pdf/2609.05269.pdf
- **Authors**: Chris Zheng (Co-Founder & Chief Researcher, ZAST.AI), Geng Yang (Co-Founder & CEO, ZAST.AI)
- **Submitted**: September 4, 2026
- **License**: CC BY-SA 4.0
- **Code Repository**: https://github.com/zast-ai/continuity (MIT License)

---

## 1. Full Paper Analysis

### Core Claim
CONTINUITY addresses a fundamental composition failure in LLM agent security: individually correct security controls (provenance tracking, authorization, policy enforcement, protocol adapters, execution controls) do NOT necessarily compose into an end-to-end secure system. Security-critical context may be dropped, widened, rebound, or reinterpreted as actions cross component boundaries. The authors term this failure class **"security-context discontinuity."**

### Central Question
> "Under what explicit conditions do independently useful agent-security controls compose into an end-to-end consequence boundary?"

### Key Mechanisms

#### a) Assume-Guarantee Contract Model
Each component is modeled as an assume-guarantee contract:
- **C_i = (A_i, G_i, P_i, M_i)**
  - A_i: input assumptions
  - G_i: output guarantees
  - P_i: fields that must be preserved
  - M_i: explicit transformation relations

Safe composition requires that upstream guarantees discharge downstream assumptions, and every changed security field is either preserved or justified by an independently checked relation witness.

#### b) End-to-End Consequence Integrity (ECI)
Every externally realized effect must have a verifiable witness connecting the exact effect to:
- Authenticated chain origin
- Principal
- Task
- Field-level provenance
- Root grant
- Component contracts
- Current policy
- Finality sink
- Single-use execution state

#### c) Signed Root Grants
- Two-role design: trusted ingress identities and trusted root-grant issuers are named separately
- Prevents non-ingress component keys from creating self-signed chains
- Prevents arbitrary authority declaration
- Bounded by separately authenticated grant with field constraints (deterministic predicates)

#### d) Provenance Commitments
- **Provenance manifest**: Contains source records and claims, binding path to source identity and digest of value
- **Context manifest**: Commits to source-classified items visible to planning context
- Field-resolved: Uses RFC 6901-style JSON Pointer leaf paths (e.g., /action/parameters/amount_cents)
- Verifier recomputes manifest digests, verifies issuer roles and signatures, resolves every claimed path, checks each leaf-value digest

#### e) Bounded Typed Releases
- Untrusted content is data, not authority
- A release credential binds: principal, actor, task, provenance manifest, source identity and digest, target path, exact value digest, bounded predicate, action operation, tool, nonce, expiry, trusted release issuer
- Not a field-name whitelist — authorizes ONE validated source value to influence ONE named target field under ONE bounded predicate and task context

#### f) Role-Bound Transition Receipts
- Each stage has expected role, signer, and contract fixed by deployment policy
- Receipt commits to input/output envelope digests, contract digest, recomputed changed paths, assumption/guarantee predicate identifiers, transformation-witness identifiers

#### g) Transformation Witnesses
- For semantic transformations (alias resolution, unit conversion, schema translation), independently signed witness binds: relation identifier, before/after values, both value digests, principal, task, component signer, contract, parameters, expiry, trusted validator signature
- Verifier evaluates consistency predicate independently of the adapter

#### h) Finality Permits
- Subject-, action-, policy-, revocation-, and replay-bound
- One-shot permits with idempotency keys
- Sink rechecks: signature, caller subject, audience, action digest, policy, revocation, expiry, nonce, idempotency state immediately before effect

### Composition Conditions (C1-C7)
1. **C1 Authenticated origin**: Root envelope and grant signatures verify; trusted ingress and grant issuer
2. **C2 Contract compatibility**: Each required guarantee established by root or valid predecessor
3. **C3 Context continuity**: Every security-critical changed path preserved or justified by declared, independently verified relation witness
4. **C4 Non-amplification**: Authority/delegation increase only through separately authenticated grant; data taint does not decrease
5. **C5 Canonical action binding**: Permit and sink bind same canonical action
6. **C6 Fresh finality**: Sink rechecks subject, audience, policy, revocation, expiry, nonce, idempotency immediately before effect
7. **C7 Complete mediation**: Every path capable of realizing protected effect traverses compatible finality sink

### Theorem 1 (End-to-End Composition Safety)
Assume unforgeability of signature scheme and collision resistance of digest. If C1-C7 hold for a task, then every realized protected effect has a valid effect witness and the system satisfies ECI, even if the planner and all attacker-writable content are adversarial.

---

## 2. The 2,560 Attack Instances Result

### Evaluation Setup
- **32 cross-layer fault classes** spanning 8 families
- **4 application domains**: workspace email, finance payments, DevOps deployment, multi-agent delegation
- **20 parameterized instances per fault-domain pair** → 2,560 attack instances
- **700 benign tasks** (400 direct + 300 using signed typed releases)
- **200 ambiguous tasks** (containing unreleased external field)
- **3,460 total scenarios**
- **7 system configurations** → 24,220 system-scenario runs

### Fault Taxonomy (32 classes across 8 families)
1. **Root and grant** (4): Untrusted root producer, root authority exceeded, root scope exceeded, root field-constraint bypass
2. **Provenance and release** (7): Untrusted field binding, provenance drop, provenance value substitution, memory laundering, release predicate bypass, release value substitution, expired release
3. **Identity and topology** (3): Principal substitution, unauthorized stage signer, receipt/producer mismatch
4. **Authority and policy** (5): Authority amplification, delegation widening, taint downgrade, policy downgrade, context-root omission
5. **Action semantics** (4): Argument mutation, destination substitution, tool-server swap, effect-class downgrade
6. **Transform contracts** (3): Missing transform witness, invalid transform witness, contract-guarantee violation
7. **Finality state** (3): Subject substitution, post-permit action substitution, revoked grant
8. **Lifecycle and mediation** (3): Nonce replay, retry duplication, alternate path

### Main Results

| Configuration | Effect ASR | Classes Contained | Benign Completion | Ambiguous Escalation |
|---|---|---|---|---|
| Pass-through | 100.0% | 0 | 100% | 0% |
| Tool allowlist | 100.0% | 0 | 100% | 0% |
| Gateway policy | 96.9% | 4 | 100% | 0% |
| Provenance gateway | 84.4% | 20 | 100% | 100% |
| Effect-bound permit | 81.3% | 24 | 100% | 0% |
| Gateway + finality | 65.6% | 44 | 100% | 100% |
| **CONTINUITY** | **0.0%** | **128** | **100%** | **100%** |

### What It Demonstrates
- Full CONTINUITY configuration commits **no harmful effect** in 2,560 attack instances
- Contains **all 128 fault-domain classes**
- Completes **all 700 benign tasks** (including 300 bounded external-data releases and legitimate destination transformation)
- Escalates **all 200 ambiguous tasks** to human
- Strongest incomplete configuration (Gateway+Finality) still has **65.6% effect ASR**
- **Key insight**: Gateway authorization plus exact final action binding is insufficient when permit issuer accepts post-adapter action without verifying how it relates to gateway-approved state

### Ablation Study (Reopened Fault-Domain Classes)
| Ablation | Reopened Classes |
|---|---|
| No field provenance | 24 |
| No contract conformance | 24 |
| Incomplete mediation | 24 |
| No root authentication | 16 |
| No release validation | 12 |
| No transform-witness validation | 8 |
| No replay protection | 8 |
| No component-role binding | 4 |
| No identity binding | 4 |
| No delegation monotonicity | 4 |
| No taint monotonicity | 4 |
| No policy freshness | 4 |
| No context commitment | 4 |
| No action binding | 4 |
| No subject binding | 4 |
| No revocation recheck | 4 |
| No authority monotonicity alone | 0 |

### Performance
- Median proof verification: **4.21 ms**
- Median end-to-end transition production, verification, permit issuance, finality: **7.17 ms**
- Bundle sizes: 1 transition ≈ 8.1 KiB; 20 transitions ≈ 49.4 KiB

---

## 3. Comparison with Other Security Contract Approaches

### A. CONTINUITY vs. Agent Behavioral Contracts (ABC) — arXiv 2602.22302

**ABC (Agent Behavioral Contracts)**:
- By Varun Pratap Bhardwaj
- Brings Design-by-Contract principles to autonomous AI agents
- Contract structure: C = (P, I, G, R) — Preconditions, Invariants, Governance policies, Recovery mechanisms
- **(p, δ, k)-satisfaction**: Probabilistic contract compliance — contracts hold with probability ≥ p, deviations remain within tolerance δ, recovery occurs within k steps
- **Drift Bounds Theorem**: Contracts with recovery rate γ > α (natural drift rate) bound behavioral drift to D* = α/γ
- **ContractSpec DSL**: YAML-based domain-specific language
- **AgentAssert**: Runtime enforcement library, sub-10ms per-action overhead
- **AgentContract-Bench**: 200 scenarios across 7 models from 6 vendors
- 1,980 sessions; detects 5.2-6.8 soft violations/session; 88-100% hard constraint compliance

**Key Differences**:
| Dimension | CONTINUITY | ABC |
|---|---|---|
| Focus | Security-context composition across components | Behavioral contracts within agent sessions |
| Contract model | Assume-guarantee with signed transitions | (P, I, G, R) tuple with probabilistic satisfaction |
| Threat model | Adversarial LLM planner, cross-component boundaries | LLM non-determinism, behavioral drift |
| Enforcement | Cryptographic signatures, deterministic verification | Runtime monitoring, recovery mechanisms |
| Composition | End-to-end consequence integrity across pipeline | Multi-agent chain composition |
| Specification | JSON Pointer paths, signed manifests | YAML-based ContractSpec DSL |
| Evaluation | 2,560 attack instances, fault injection | 1,980 sessions, behavioral benchmarks |

**Complementary**: ABC governs *how* an agent must behave (behavioral contracts); CONTINUITY governs *how security context propagates* across component boundaries. They address orthogonal concerns and could be composed.

### B. CONTINUITY vs. USK (Unfireable Safety Kernel) — arXiv 2606.26057

**USK (Unfireable Safety Kernel)**:
- By Seth Dobrin and Łukasz Chmiel
- Execution-time AI alignment for escapable AI systems
- Four properties: Process separation, pre-action enforcement, fail-closed behavior, externalized signed evidence
- Rust reference implementation
- "No kernel, no agent" lifecycle binding
- Ed25519-signed append-only transparency log under operator key the kernel does NOT hold
- Machine-checked: SMT theorem (Z3) + bounded model checking (Kani, 4/4 harnesses)
- Python-to-Rust migration gated on byte-equivalence (1000/1000 fixtures; 17/17 adversarial classes)
- 1,000 self-modifications: all 704 safety-critical core attempts refused; 300 under kill switch refused
- 6,240 authorization round-trips: no successful bypass

**Key Differences**:
| Dimension | CONTINUITY | USK |
|---|---|---|
| Architecture | Context/contract layer across components | Separate safety process outside agent runtime |
| Enforcement point | Verifier + mediated finality sinks | Kernel on structurally only path to action |
| Threat focus | Security-context discontinuity between controls | Agent escaping its own runtime |
| Implementation | Python reference (1.5 KLOC trusted core) | Rust reference implementation |
| Verification | Deterministic conformance suite | SMT + bounded model checking |
| Key insight | Signatures alone don't prevent composition failures | Controls inside agent's address space are reachable by it |

**Complementary**: USK provides the architectural separation that makes CONTINUITY's verifier and finality sinks unreachable from the agent. CONTINUITY provides the contract layer for composing multiple mediated controls.

### C. CONTINUITY vs. Other Approaches

**CaMeL** (extracted control/data flow + capabilities):
- CONTINUITY is designed as a context/contract layer that can be carried across such interfaces
- Protocol-neutral, does not claim production integration with MCP or OWASP Agent Control Standard

**Prompt Flow Integrity** (isolation + secure processing + privilege guardrails):
- CONTINUITY instantiates compositional specifications around agent authority, provenance, action semantics, finality

**CXI** (binds protected fields, typed releases, exact effects, invocation authority):
- CONTINUITY extends this with explicit assume-guarantee contracts and transformation witnesses

**Alignment Contracts for Agentic Security Systems** (arXiv 2605.00081):
- Framework for specifying/enforcing behavioral constraints over observable effect traces
- Effect Observability Assumption: monitor-realized trace satisfies contract even if LLM is adversarial
- CONTINUITY is complementary — focuses on cross-component composition rather than per-effect monitoring

**A Framework for Formalizing LLM Agent Security** (arXiv 2603.19469):
- Four contextual security properties: task alignment, action alignment, source authorization, data isolation
- CONTINUITY's ECI formalizes a similar intuition but with cryptographic witnesses and compositional contracts

**Three-Layer Probabilistic Assume-Guarantee Architecture** (arXiv 2605.18672):
- Position paper arguing for staged contract-based architecture (user, operational, functional layers)
- Probabilistic assume-guarantee contracts with bounds on satisfaction probability
- CONTINUITY provides a concrete instantiation with deterministic guarantees under TCB assumptions

---

## 4. Technical Details on the Contract Specification Language

CONTINUITY does NOT introduce a standalone DSL like YAML or a custom language. Instead, contracts are specified through:

### a) Deployment Policy (Configuration)
- Names trusted ingress identities and root-grant issuers separately
- Maps pipeline stage → authorized component identity and contract
- Specifies trusted tool-manifest digests and current policy state
- Defines deterministic field predicates, transformation relations, and canonicalization rules

### b) Contract Structure (C_i = (A_i, G_i, P_i, M_i))
- **A_i (Input Assumptions)**: Required fields, required upstream guarantee tags, input predicates
- **G_i (Output Guarantees)**: Ensured fields, output predicates, guarantee tags produced on success
- **P_i (Preserved Fields)**: Set of path roots that must be preserved
- **M_i (Transformation Relations)**: Maps transformable paths to independently evaluated relations

### c) Path-Based Specification
- Uses **RFC 6901-style JSON Pointer paths** for all security fields
- Examples: `/action/parameters/amount_cents`, `/action/destination`, `/policy/epoch`
- Leaf-granularity: changing only an amount produces `/action/parameters/amount_cents` rather than change to undifferentiated `parameters` object

### d) Field Constraints (Deterministic Predicates)
- Root grant bounds overall task with deterministic predicate specifications
- Example: finance task permits `/action/parameters/amount_cents` only in [0, 100000]
- External-data release for same field more restrictive, e.g., [0, 10000]

### e) Typed Release Credentials
- Bind: principal, actor, task, provenance manifest, source identity and digest, target path, exact value digest, bounded predicate, action operation, tool, nonce, expiry, trusted release issuer
- Examples in artifact:
  - Finance: integer amount in cents
  - Workspace: destination alias with prefix `alias:workspace:customer:`
  - DevOps: exact signed 40-hex commit identifier
  - Delegation: capability in enum {report.generate}

### f) Transformation Relations
- Each transformable path has a relation identifier
- Independently signed witness contains: alias, resolved address, both value digests, trusted directory issuer, component signer, contract, principal, task, expiry
- Verifier evaluates consistency predicate (e.g., `alias_resolution(alias, resolved)`) and verifies witness issuer is trusted for that relation

### g) Static Contract Linting
- Lightweight linter checks field availability and guarantee-tag flow before runtime
- Ensures stage's required fields and guarantees available from authenticated root or predecessors
- Runtime verification remains authoritative

---

## 5. Connection to Other Concepts

### A. Design-by-Contract for AI Agents
CONTINUITY directly instantiates the Design-by-Contract (DbC) paradigm (Meyer, 1992) for LLM agent security:
- **Preconditions**: Input assumptions (A_i) that must hold before component execution
- **Postconditions**: Output predicates that must hold after component execution
- **Invariants**: Fields that must be preserved (P_i) and monotonicity constraints (authority, taint, policy)
- **Contracts as interfaces**: Each component's contract specifies what it assumes and what it guarantees

Connection to ABC framework: ABC brings DbC to individual agent sessions; CONTINUITY brings DbC to the composition of security controls across the agent pipeline. Both share the core DbC insight that explicit contracts enable modular reasoning about component behavior.

### B. ABC Framework (arXiv 2602.22302)
- **Relationship**: Complementary and potentially composable
- ABC focuses on *behavioral* contracts (what an agent does)
- CONTINUITY focuses on *security-context* contracts (how security facts propagate)
- ABC's (p, δ, k)-satisfaction could be layered on top of CONTINUITY's structural guarantees
- Both use assume-guarantee reasoning, but CONTINUITY adds cryptographic signatures and field-level provenance
- ABC's Drift Bounds Theorem addresses behavioral drift; CONTINUITY's ECI addresses authority/scope drift across components

### C. USK Unfireable Safety Kernel (arXiv 2606.26057)
- **Relationship**: Architectural complement
- USK provides the *process separation* that makes CONTINUITY's verifier and finality sinks unreachable from the agent
- USK's four properties (process separation, pre-action enforcement, fail-closed, externalized signed evidence) align with CONTINUITY's complete mediation and fresh finality requirements
- USK is a single safety process; CONTINUITY is a composition framework for multiple mediated controls
- USK's "no kernel, no agent" lifecycle binding parallels CONTINUITY's requirement that every protected effect class traverses a compatible sink

### D. Broader Connections

**Information Flow Control**:
- CONTINUITY tracks selected provenance and taint but is NOT a full language-level information-flow control system
- Focuses on structured effect fields and explicit transitions rather than general program variables

**Zero Trust Architecture**:
- Instantiates least authority: components exercise only task- and resource-scoped grants
- Short-lived, sink-scoped, replay-protected credentials consistent with modern authorization guidance

**Complete Mediation**:
- Every path in an effect-equivalence class must cross a compatible sink
- Effect equivalence: email, HTTP, browser, shell, remote-agent interfaces may all exfiltrate the same data

**Canonical Binding**:
- Signatures and permits cover deterministic representation
- Restricted deterministic JSON encoding with sorted keys, integer-only benchmark numerics, normalized sets
- Identifies RFC 8785 (JSON Canonicalization Scheme) as interoperability target

---

## 6. Follow-up Work and Related Papers by the Same Authors

### Authors
- **Chris Zheng**: Co-Founder & Chief Researcher, ZAST.AI
- **Geng Yang**: Co-Founder & CEO, ZAST.AI (formerly CISO at Amazon China, CISO at Meituan, CTO at Qingteng Cloud Security, Founder/CEO at Entropage)

### ZAST.AI Context
- Company founded 2024, Bellevue, Washington
- $6M Pre-A funding led by Hillhouse Capital (Jan 2026)
- Total funding close to $10M
- Focus: AI-powered code security, automated PoC generation + validation
- 115+ CVE assignments in 2025
- Products: ZAST PFW (cloud detection engine), ZAST Express (IDE extension)

### Related Papers/Artifacts
1. **CONTINUITY GitHub Repository**: https://github.com/zast-ai/continuity
   - MIT License
   - 1,523 lines security core (src/continuity/core.py)
   - 1,697 lines experiment/evaluation code
   - 30 regression tests
   - Raw results, figures, reproducibility scripts

2. **ZAST AI Vulnerability Reports**: https://github.com/zast-ai/vulnerability-reports
   - Public index of verified vulnerability research
   - 153 publicly disclosed vulnerabilities in 2025 with 0 false positives

3. **AgentCanary** (arXiv 2606.10484):
   - Security evaluation framework for autonomous AI agents
   - Uses real malicious skills from ZAST AI's Skill Security Reviewer
   - Related to CONTINUITY's evaluation methodology

4. **ZAST AI Blog** (blog.zast.ai):
   - Technical writeups on vulnerability discoveries
   - 1,033 malicious npm packages detection case study

### Future Work Mentioned in CONTINUITY
- **Standardization**: MCP and runtime-hook standards can carry CONTINUITY objects; likely integration point is extension or sidecar envelope associated with tool calls and agent handoffs
- **Production interoperability**: Requires standardized canonicalizer (RFC 8785), explicit Unicode normalization, key rotation, hardware-backed keys, certificate/workload-identity validation
- **Real effect path enumeration**: Prototype does not enumerate every real effect path
- **Semantic correctness**: CONTINUITY preserves authenticated facts without proving original validator was correct
- **Broader self-modification policy**: Future work for self-modifying agents

### Related Papers by Other Authors in the Space
- **Alignment Contracts for Agentic Security Systems** (arXiv 2605.00081) — effect-trace contracts
- **A Framework for Formalizing LLM Agent Security** (arXiv 2603.19469) — contextual security properties
- **Three-Layer Probabilistic Assume-Guarantee Architecture** (arXiv 2605.18672) — position paper
- **SafeAgent** (arXiv 2604.17562) — runtime protection architecture
- **Toward Secure LLM Agents** (arXiv 2606.10749) — threat surfaces, attacks, defenses survey
- **Design Patterns for Securing LLM Agents** (arXiv 2506.08837) — composable design patterns
- **Contractual Skills: GovernSpec** (arXiv 2605.22634) — YAML contracts for enterprise agents

---

## Key URLs Summary

| Resource | URL |
|---|---|
| arXiv Abstract | https://arxiv.org/abs/2609.05269 |
| HTML Paper | https://arxiv.org/html/2609.05269v1 |
| PDF Paper | https://arxiv.org/pdf/2609.05269.pdf |
| GitHub Repository | https://github.com/zast-ai/continuity |
| ABC Framework (arXiv 2602.22302) | https://arxiv.org/abs/2602.22302 |
| USK (arXiv 2606.26057) | https://arxiv.org/abs/2606.26057 |
| Alignment Contracts (arXiv 2605.00081) | https://arxiv.org/abs/2605.00081 |
| Formalizing LLM Agent Security (arXiv 2603.19469) | https://arxiv.org/abs/2603.19469 |
| Three-Layer A/G Architecture (arXiv 2605.18672) | https://arxiv.org/abs/2605.18672 |
| ZAST AI LinkedIn | https://linkedin.com/company/zast-ai |
| ZAST AI Blog | https://blog.zast.ai |
| ZAST AI Vulnerability Reports | https://github.com/zast-ai/vulnerability-reports |

---

## Summary of What Was Done

1. Searched arXiv, Google Scholar, and the web for CONTINUITY (arXiv 2609.05269)
2. Extracted full paper content from HTML version (50K+ characters)
3. Analyzed the formal model, contract mechanisms, and evaluation
4. Compared with ABC framework (arXiv 2602.22302) — extracted and analyzed
5. Compared with USK (arXiv 2606.26057) — searched and analyzed
6. Identified related work and follow-up papers by Chris Zheng and Geng Yang
7. Located the GitHub repository and verified its contents
8. Compiled comprehensive findings with all URLs and arXiv IDs

## Key Takeaways

- CONTINUITY is a rigorous, formal framework addressing a real gap: security controls that are correct in isolation but fail in composition
- The 2,560 attack instances demonstrate that incomplete compositions fail systematically (4-128 fault-domain classes), while the full configuration achieves zero harmful effects
- The assume-guarantee contract model with cryptographic witnesses provides deterministic guarantees under explicit TCB assumptions
- CONTINUITY is complementary to ABC (behavioral contracts) and USK (architectural separation) — together they form a comprehensive approach to agent security
- The reference implementation is open-source (MIT License) with reproducibility scripts
- Authors are from ZAST.AI, an AI security company with practical vulnerability research expertise

## Issues Encountered
- None significant; all requested information was retrievable from public sources
- The paper is very recent (September 2026), so follow-up citations are limited by publication timeframe