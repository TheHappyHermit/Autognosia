# Zstd Dictionary Compression for Security/Cryptographic Chain Data

**Research findings for CONTINUITY security-context contract system**
**Date:** 2026-09-12

---

## 1. How Zstd Dictionary Training Works on Structured Data

### The Algorithm (COVER)

Zstd dictionary training uses the **COVER algorithm** ("Effective Construction of Relative Lempel-Ziv Dictionaries" by Liao, Petri, Moffat, Wirth). Here's what it actually does:

1. **Parameters**: `k` (segment size) and `d` (dmer/subsegment size, typically 6-8)
2. **Scoring**: For every possible segment of size `k` in the training data, compute a score = sum of frequencies of all its subsegments of size `d` across ALL samples
3. **Selection**: Pick the highest-scoring segments to fill the dictionary
4. **Placement**: Best content goes at the **end** of the dictionary (smallest LZ77 offsets = cheapest to reference)

**FastCover** (the default `--train` mode) uses a hash table of size `2^f` (f=20 default) to track dmer frequencies, with `accel` parameter controlling speed/accuracy tradeoff.

### What It Captures

The dictionary captures **byte-level substrings** that appear frequently across samples — not semantic tokens. For JSON/CBOR with repeated field names like `"stage"`, `"role"`, `"signer"`, the trainer finds:
- The raw UTF-8 bytes of field names
- Common prefixes/suffixes
- Structural bytes (CBOR type markers, JSON delimiters)
- Common paths/sequences that appear together

### Training Requirements

| Parameter | Recommendation |
|-----------|---------------|
| Sample count | >100, ideally thousands |
| Total sample size | ~100x target dictionary size |
| Minimum sample size | 8 bytes (below this, training fails) |
| Dictionary size | ~100KB default; 110KB zstd CLI default |

**Key insight from zstd developers**: "Dictionary training will fail if there are not enough samples to construct a dictionary, or if most of the samples are too small (< 8 bytes being the lower limit)."

### Raw Content vs Trained Dictionaries

Zstd supports two dictionary types:
- **Trained**: Magic bytes + dict ID + entropy tables (Huffman + FSE) + content. The entropy tables save ~100 bytes per block on small data.
- **Raw content**: Just bytes. Works everywhere but misses entropy table savings.

For browser transport (RFC 9842 `dcz`), **raw content is required** — browsers strip the zstd header and use bytes verbatim for LZ matching.

---

## 2. Optimal Dictionary Size vs Compression Ratio — Real Numbers

### Official Zstd Benchmarks (from zstd README)

| Collection | Direct Compression | With Dictionary | Gain | Avg Unit Size |
|------------|-------------------|-----------------|------|---------------|
| Small JSON records | x1.331–x1.366 | x5.860–x6.830 | **~4.7x** | 300 bytes (200–400) |
| Mercurial events | x2.322–x2.538 | x3.377–x4.462 | **~1.5x** | 1.5 KB (20–200 KB) |
| Large JSON docs | x3.813–x4.043 | x8.935–x13.366 | **~2.8x** | 6 KB (800–20 KB) |

### Key Size Thresholds

- **< 100KB files**: Dictionary provides massive gains (4–6x on small JSON)
- **First few KB**: Dictionary gains are concentrated here; after that, zstd uses decoded content as history
- **> 100KB**: Dictionary benefit diminishes rapidly
- **> 1MB**: Dictionary can actually **hurt** compression ratio (STAR-lite found this for ATProto repos)
- **Sweet spot**: 100KB dictionary for most use cases; 1MB for ATProto firehose

### ATProto-Specific Numbers

- **1MB dictionary**: Sweet spot for firehose frames (Sovereign Logs)
- **110KB dictionary**: "Goldilocks" for general ATProto use
- **~80% compression ratio** achieved with dictionary + clustering + deduplication
- **~65% bandwidth reduction** in Jetstream v2 (dict-zstd)
- **40 Mbps → 4 Mbps** firehose reduction (Sovereign Logs)

### Browser/HTTP Dictionary Transport Numbers

- **YouTube JS**: 78–90% reduction vs Brotli for returning users (dictionary = old bundle)
- **Real React app**: 312 KB → 26 KB (92% reduction, weekly deploys)
- **Google search HTML**: ~50% reduction
- **Discord gateway**: ratio 6→10, size 270B→166B (40% bandwidth reduction)
- **64KB dictionary**: Sweet spot for web assets (WebPerfClinic)

### Roblox Feature Flags (large JSON, ~435KB)

- 2048/4048 byte chunks, 1 copy each: **90x compression ratio** with 512KB dictionary
- Same data with 550KB dictionary: **14x ratio** (sensitive to maxdict size!)
- Key finding: "Having more training data even though we're intentionally trying to overfit doesn't always help"

---

## 3. Distribution Mechanisms for Zstd Dictionaries

### Pattern A: RFC 9842 Compression Dictionary Transport (Modern Web Standard)

**How it works:**
1. Server responds with `Use-As-Dictionary: match="/app/*.js"` header
2. Browser stores the response as a dictionary
3. On subsequent requests, browser sends `Available-Dictionary: :<sha256>:` + `Accept-Encoding: dcb, dcz`
4. Server compresses against the dictionary, responds with `Content-Encoding: dcz`
5. `Vary: Accept-Encoding, Available-Dictionary` required for cache correctness

**Critical quirk for `dcz`**: Browsers use dictionaries as **raw content** — strip the zstd header (magic `37 a4 30 ec`, dict ID, entropy tables) before use. If you compress with a trained dictionary but the browser expects raw content, decompression fails with `ERR_UNEXPECTED_CONTENT_DICTIONARY_HEADER`.

**Browser support**: Chrome 123+, Edge 130+, Safari 26.3+ (2026)

### Pattern B: ATProto/Jetstream (Negotiated Fetch)

**How it works:**
1. Client fetches dictionary over HTTPS once at startup
2. Negotiates compression on WebSocket connection
3. Server compresses each frame with the dictionary
4. Client decompresses transparently

**Numbers**: ~60–65% bandwidth reduction. Dictionary is baked into the client for some implementations (usability tradeoff).

**Limitation noted on Hacker News**: "It's impossible to use the compressed version of the stream without using a client that has the baked-in ZSTD dictionary."

### Pattern C: Ramjet (Content-Addressed with ETags)

**How it works:**
1. Dictionary identified by hash, stored in meta keyspace
2. Dictionary changes detected on restart
3. Clients download via `GET /dictionary` endpoint
4. Supports `If-None-Match` with CID-based ETags

This is the most relevant pattern for CONTINUITY's multi-cluster federation scenario.

### Pattern D: TLS Certificate Compression (RFC 8879)

**How it works:**
1. Client sends `compress_certificate` extension in ClientHello with supported algorithms: `zlib(1)`, `brotli(2)`, `zstd(3)`
2. Server compresses Certificate message with chosen algorithm
3. `CompressedCertificate` message replaces `Certificate message`

**Dictionary usage**: RFC 8879 explicitly states: *"It is possible to define a certificate compression algorithm that uses a preshared dictionary to achieve a higher compression ratio. This document does not define any such algorithms, but additional codepoints may be allocated for such use per the policy in Section 3.1.1.1.3."*

**Abridged Certs draft** (IETF 121) proposed a Zstd dictionary for pass 2 compression of end-entity certificates, but abandoned it for complexity:
- Draft 00 with Zstd dict: p50 = 1060 bytes
- After switching to Brotli without dict: p50 = 1256 bytes (only ~200 byte penalty)

### Pattern E: Bundled/Static Dictionary

Ship the dictionary with the client binary or fetch from a well-known URL. Used by:
- ATProto SDKs (baked-in dictionary)
- Cloudflare shared dictionaries (fetched once, cached forever)
- Any controlled deployment where you control both endpoints

---

## 4. Hand-Crafted vs Trained Dictionaries

### When Hand-Crafting Wins

**For CONTINUITY specifically, hand-crafting is likely superior because:**

1. **Schema is fully known and stable**: Field names (`stage`, `role`, `signer`, `contract`, `sequence`, `predecessor`) are fixed by the spec
2. **Deterministic output**: Same dictionary every time — auditable, reproducible, no training pipeline
3. **No training data needed**: Don't need to collect real chains to build the dictionary
4. **Security context**: You can verify the dictionary matches the spec exactly
5. **Optimal placement**: You can ensure the most common patterns are at the end of the dictionary (smallest offsets)

**How to hand-craft effectively:**
1. Concatenate all fixed strings, field names, common paths from the spec
2. Include common CBOR type markers and structural bytes
3. Order content so most-frequent patterns are at the END
4. Use `ZDICT_finalizeDictionary()` to add entropy tables (requires a few representative samples for statistics)
5. Result: A trained-format dictionary with hand-picked content + optimized entropy tables

### When Training Wins

1. **Emergent patterns**: Real data has patterns not obvious from the schema (common CID prefixes, common DID formats, common timestamp formats)
2. **Optimal ratio**: COVER algorithm finds the mathematically optimal substring set
3. **Automation**: Can retrain periodically as data evolves
4. **No manual effort**: Don't need to analyze the schema yourself

### The Middle Ground (Recommended for CONTINUITY)

**Hand-crafted base + trained entropy tables:**
1. Build dictionary content from the spec (all field names, paths, fixed strings)
2. Collect a few hundred real chains as samples
3. Run `ZDICT_finalizeDictionary()` with your content + real samples
4. This gives you deterministic content with optimized entropy tables

**Alternative — single representative sample:**
Zstd devs note: "Just re-use the first bucket as a starting point for compression and decompression... there is no training... just re-use the first bucket." For highly-similar data, one representative sample as dictionary works nearly as well as full training.

### What the Zstd Developers Say

From GitHub issue #3283:
> "Taking a few stripes of 16-32 bytes randomly from samples and just stick them together as a dictionary works good. However, I found a very good and precise dictionary and while concatenating it, it works better than random stripes, not that good if I just apply huffman algo on them."

From GitHub issue #4127:
> "One suggestion could be to use one complete JSON file as a point of reference, that would become the dictionary. Assuming that most other files are highly related to this one, the common portions should be found during the compression process."

---

## 5. Prior Art: ATProto's Zstd Dictionary Approach

### What They Did

ATProto firehose frames are small (200 bytes for a "Like") DAG-CBOR objects with massive repetition of schema strings: `app.bsky.feed.like`, `did:plc:`, `rev`, etc.

**Training:**
- 10,000–20,000 real frames (~20MB raw data)
- 110KB–1MB dictionary size
- Standard `zstd::dict::from_samples()` / `zstd --train`

**Results:**
- ~80% compression ratio (40 Mbps → 4 Mbps)
- Jetstream v2: ~65% bandwidth reduction
- "Schema moved into dictionary, compressed output contains almost nothing but actual unique data"

### Lessons for CONTINUITY

1. **Small frames are the ideal use case**: CONTINUITY receipts are small CBOR objects — exactly where dictionaries shine
2. **1MB dictionary may be warranted**: If CONTINUITY chains have many unique paths/fields, a larger dictionary captures more schema
3. **Clustering matters**: ATProto achieved 80% with "clustered vertical logging strategies" + custom dag-cbor slicer — the dictionary alone isn't the whole story
4. **STAR-lite finding**: Dictionary training "performed poorly on large sample of real atproto repositories" — for files >1MB, dictionaries compress WORSE. CONTINUITY chains are small, so this is fine.
5. **Deduplication + dictionary**: The biggest gains come from combining dictionary with deduplication of repeated structures
6. **Distribution via HTTPS fetch + ETag**: Ramjet's approach (GET /dictionary with If-None-Match) is the cleanest for multi-cluster deployment

### What NOT to Do

From STAR-lite research: "Using dictionaries actually compresses worse for repos over 1MiB, which represents 84% of the input sample when weighted by disk usage." Don't use dictionaries on large CONTINUITY chain batches — only on individual receipts.

---

## 6. TLS Certificate Compression (RFC 8879) + Dictionaries

### Current State

RFC 8879 defines `zstd(3)` as a certificate compression algorithm but **does not define any dictionary usage**. The RFC explicitly leaves the door open:

> "It is possible to define a certificate compression algorithm that uses a preshared dictionary to achieve a higher compression ratio. This document does not define any such algorithms, but additional codepoints may be allocated for such use per the policy in Section 3.1.1.1.3."

### Abridged Certs Draft (IETF 121)

The most serious attempt to use Zstd dictionaries for TLS certificates:
- **Pass 1**: Compress chain to end-entity cert using pre-shared CA list
- **Pass 2 (original)**: Zstd with pre-shared dictionary → p50 = 1060 bytes
- **Pass 2 (revised)**: Brotli without dictionary → p50 = 1256 bytes

The dictionary approach was abandoned because:
1. "Defining the pre-shared dictionary relied on a messy algorithm for sampling from CT logs"
2. "Zstd is not currently widely deployed for TLS Certificate Compression"
3. Complexity outweighed the ~15% improvement

### Relevance to CONTINUITY

The TLS certificate compression story shows:
1. Dictionary distribution is the hard part (how do both sides get the same dict?)
2. The IETF is open to dictionary-based codepoints but no standard exists yet
3. For CONTINUITY (controlled deployment), you don't need IETF standardization — just negotiate dictionary ID out-of-band

---

## 7. Real-World Benchmarks Summary

### Small JSON/CBOR with Repeated Field Names

| System | Data Size | Dictionary Size | Compression | Notes |
|--------|-----------|-----------------|-------------|-------|
| Zstd official (Small JSON) | 200–400B | ~100KB | x5.86–x6.83 | vs x1.33 without dict |
| ATProto firehose | ~200B | 1MB | ~80% reduction | With clustering |
| Discord gateway | ~270B | N/A (streaming) | 270B→166B | Ratio 6→10 |
| Roblox feature flags | ~435KB | 512KB | 60–90x ratio | Sensitive to dict size |
| HTTP Toolkit toy example | ~65B | ~50B (1 sample) | 65B→28B | 57% smaller |

### Key Takeaway for CONTINUITY

For small CBOR receipts (200–500 bytes) with repeated field names, expect **4–7x compression ratio improvement** from a well-crafted dictionary. This is consistent across all benchmarks.

---

## 8. Recommendations for CONTINUITY

### Dictionary Construction: Hand-Crafted + Finalize

**Recommended approach:**
1. **Build content from spec**: Concatenate all field names (`stage`, `role`, `signer`, `contract`, `sequence`, `predecessor`), common paths, CBOR type markers, fixed strings
2. **Order by frequency**: Most common patterns at the END of the dictionary
3. **Size**: Start with 32–64KB (CONTINUITY schema is smaller than ATProto's)
4. **Finalize**: Run `ZDICT_finalizeDictionary()` with ~100 real chains as samples to get entropy tables
5. **Validate**: Test against real chain data; if ratio is <3x, consider training instead

### Distribution: Content-Addressed with Negotiation

**For different deployment contexts:**

| Context | Distribution Pattern |
|---------|---------------------|
| Local sidecar | Dictionary bundled with sidecar binary |
| Remote agent | HTTPS fetch with SHA-256 verification (like Ramjet) |
| Multi-cluster federation | Content-addressed dictionary with hash in protocol header; fetch from well-known URL if unknown |

**Protocol-level approach:**
- Include `dictionary_id` (SHA-256 of dictionary) in the CONTINUITY envelope header
- If verifier doesn't have the dictionary, fetch from a configured URL
- Cache dictionary locally, refresh on hash mismatch
- This is self-describing: the chain carries its own dictionary reference

### Security Considerations

1. **Dictionary is not secret**: It's shared state, not a key. But it MUST be authenticated.
2. **Content-addressing**: Use SHA-256 of dictionary bytes as the ID. Any tampering changes the hash.
3. **CRIME-style attacks**: If an attacker can influence dictionary content AND observe compressed sizes, they can infer secrets. For CONTINUITY, the dictionary is public spec data, so this is not a concern.
4. **Resource exhaustion**: Bound dictionary size (max 1MB) and decompression memory. RFC 8879 mandates this for TLS.

### Three-Layer Pipeline Integration

CONTINUITY's existing pipeline (CBOR integer keys → delta encoding → Zstd dictionary) is well-designed:

1. **CBOR integer keys**: Eliminates field name strings at the serialization layer
2. **Delta encoding**: Exploits sequential patterns in chain data
3. **Zstd dictionary**: Captures remaining structural patterns

**Wait — if CBOR integer keys already eliminate field names, what does the dictionary capture?**

The dictionary captures:
- Common CBOR structural bytes (map/array markers, integer encodings)
- Common values (stage names, role identifiers, status codes)
- Common sequences of integer keys (the "shape" of a typical receipt)
- Fixed strings that remain (signer identifiers, contract URIs, predecessor hashes)
- Delta-encoded sequences that repeat across chains

Even with integer keys, a dictionary trained on real chains will find common byte patterns in the CBOR encoding. A hand-crafted dictionary should include:
- Common CBOR header bytes for the schema
- Common integer key sequences
- Common value patterns (if any values repeat frequently)

---

## Source URLs

1. **Zstd dictionary training (zdict.h header comments)**: https://github.com/facebook/zstd/blob/dev/lib/dictBuilder/zdict.h
2. **Zstd manual — dictionary builder**: http://github.com/facebook/zstd/blob/dev/programs/zstd.1.md
3. **ATProto Zstd dictionary compression (Sovereign Logs)**: https://sovereignlogs.leaflet.pub/3menlklaqt222
4. **Jetstream v2 dict-zstd compression**: https://atproto.blue/en/latest/atproto_jetstream
5. **ATProto SDK changelog (v0.0.70)**: https://github.com/MarshalX/atproto/releases/tag/v0.0.70
6. **Ramjet Zstd dictionary compression**: https://tangled.org/ngerakines.me/ramjet
7. **STAR-lite compression summary (ATProto)**: https://tangled.org/microcosm.blue/star/blob/main/star-lite/compression-summary.md
8. **RFC 8878 (Zstandard)**: https://www.rfc-editor.org/rfc/rfc8878.html
9. **RFC 8879 (TLS Certificate Compression)**: https://www.rfc-editor.org/rfc/rfc8879.html
10. **RFC 9842 (Compression Dictionary Transport)**: https://rfc-editor.org/rfc/rfc9842.pdf
11. **MDN Compression Dictionary Transport**: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Compression_dictionary_transport
12. **Cloudflare shared dictionaries**: https://developers.cloudflare.com/speed/optimization/content/shared-dictionaries
13. **WebPerfClinic — Compression Dictionaries**: https://webperfclinic.com/article/compression-dictionaries-transport-cut-javascript-payload-2026
14. **HTTP Toolkit — Dictionary Compression**: https://httptoolkit.com/blog/dictionary-compression-performance-zstd-brotli/
15. **Zstd GitHub issue #3283 (custom Huffman dict)**: https://github.com/facebook/zstd/issues/3283
16. **Zstd GitHub issue #4127 (Roblox dict training)**: https://github.com/facebook/zstd/issues/4127
17. **Zstd GitHub issue #1694 (single-sample dict)**: https://github.com/facebook/zstd/issues/1694
18. **Zstd GitHub issue #3603 (log file dict)**: https://github.com/facebook/zstd/issues/3603
19. **IETF 121 Abridged Certs slides (Zstd dict for TLS)**: https://datatracker.ietf.org/meeting/121/materials/slides-121-tls-abridged-certificates-update-draft-ietf-tls-cert-abridge-01.pdf
20. **IETF 106 dict security slides (Facebook)**: https://datatracker.ietf.org/meeting/106/materials/slides-106-httpbis-sessa-dictionary-security-00
21. **MCP server compression dictionary security**: https://skillaudit.dev/seo/mcp-server-compression-dictionary-transport-security
22. **Zstd API manual**: https://facebook.github.io/zstd/zstd_manual.html
23. **Python compression.zstd docs**: https://docs.python.org/3.14/library/compression.zstd.html
24. **Dart zstd dictionaries**: https://pub.dev/documentation/dart_zstd/latest
25. **Safari 26.3 zstd support**: https://youngju.dev/blog/2026-07-17-content-encoding-zstd-dictionary-transport.en
26. **Zstd COVER algorithm (python-zstandard docs)**: https://python-zstandard.readthedocs.io/en/latest/dictionaries.html
27. **structured-zstd (Rust dict builder)**: https://docs.rs/structured-zstd/latest/structured_zstd/dictionary/index.html
28. **compression-dictionary-transport-kit (GitHub gist)**: https://gist.github.com/ddoronin/a3e9007ae67daf154678b0a41d8f40d0
29. **Zstd benchmark data (Silesia corpus)**: https://github.com/facebook/zstd?tab=readme-ov-file
30. **Cronfeed Zstd ecosystem map**: https://cronfeed.work/oss-zstandard-ecosystem-map-speed-ratio-dictionary-boundary-2026
