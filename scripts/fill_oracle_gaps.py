#!/usr/bin/env python3
"""
Oracle Knowledge Expansion — Nightly Cron Script

This script runs as a no-agent cron job to identify knowledge EXPANSION
opportunities for the Oracle long-term wiki. It analyzes what's already in
the Oracle wiki and uses the Researcher to actively learn about related
topics, adjacent domains, and deeper context that would enrich the knowledge
base.

This is NOT about stale pages (Oracle knowledge like "what Einstein said"
doesn't change in 90 days). It's about actively expanding the knowledge
space around existing Oracle content.

Active Wiki content eventually decants down to Oracle, so we don't need
to cross-reference Active Wiki — we focus purely on expanding Oracle's
long-term knowledge.
"""

import os
import sys
import json
import subprocess
import re
from datetime import datetime
from pathlib import Path
from collections import Counter

AUTOGNOSIA_HOME = os.path.expanduser("~/.autognosia")
ORACLE_WIKI = os.path.join(AUTOGNOSIA_HOME, "oracle", "brain")
EXCHANGE_DIR = os.path.join(AUTOGNOSIA_HOME, "exchange", "research")
GAP_LOG = os.path.join(AUTOGNOSIA_HOME, "logs", "oracle-expansion.log")

# Domains the Oracle is actually about (not radio/homelab/cybersecurity noise)
CORE_DOMAINS = {"AI_ML", "Neuroscience", "Neuroscience_Methods", "Consciousness_Studies",
                "Philosophy_of_Mind", "Philosophy-of-Mind", "Entities", "Entities/index.md",
                "Agent-Systems", "AI_Cognition_Theory", "Cognitive_Science", "Psychology",
                "AI_Cognition-Theory", "cross-domain", "domains", "AI_Ethics",
                "Medical", "Health", "Education", "Research", "Learning"}

# Noise words that appear frequently but aren't real knowledge topics
NOISE_WORDS = {"puget sound", "seattle", "example", "use cases", "basic usage",
               "key references", "specific example", "key features", "frequency range",
               "audio", "video", "image", "text", "data", "system", "model", "tool",
               "software", "hardware", "device", "network", "protocol", "interface",
               "guide", "tutorial", "manual", "setup", "installation", "configuration",
               "getting started", "introduction", "overview", "summary", "conclusion",
               "appendix", "reference", "resources", "links", "see also", "next steps",
               "table of contents", "contents", "index", "home", "about", "contact",
               "privacy", "terms", "policy", "disclaimer", "copyright", "license",
               "open source", "free", "paid", "subscription", "premium", "upgrade",
               "download", "install", "update", "patch", "fix", "bug", "issue", "error",
               "warning", "note", "tip", "troubleshooting", "debug", "performance",
               "optimization", "benchmark", "test", "experiment", "study", "analysis",
               "report", "document", "paper", "article", "blog", "post", "comment",
               "review", "critique", "feedback", "suggestion", "recommendation", "advice",
               "help", "support", "faq", "question", "answer", "solution", "workaround"}

# Stop words for concept extraction
STOP_WORDS = {"the", "and", "for", "with", "from", "this", "that", "these", "those",
              "their", "there", "these", "those", "which", "where", "when", "what",
              "how", "why", "who", "all", "any", "both", "each", "few", "more",
              "most", "other", "some", "such", "no", "nor", "not", "only", "own",
              "same", "so", "than", "too", "very", "just", "because", "as", "until",
              "while", "of", "at", "by", "to", "about", "into", "through", "during",
              "before", "after", "above", "below", "between", "under", "again",
              "further", "then", "once", "here", "thus", "also", "even", "still",
              "back", "up", "down", "out", "off", "over", "new", "old", "high",
              "long", "first", "last", "next", "early", "late", "way", "kind",
              "type", "part", "thing", "things", "one", "two", "three", "four",
              "five", "six", "seven", "eight", "nine", "ten", "many", "much", "well",
              "make", "made", "go", "get", "give", "take", "say", "said", "know",
              "think", "see", "come", "want", "use", "found", "try", "work", "call",
              "need", "become", "could", "should", "would", "must", "might", "may",
              "can", "will", "been", "being", "having", "doing", "let", "put",
              "mean", "keep", "let", "begin", "show", "hear", "play", "run",
              "move", "live", "believe", "bring", "happen", "write", "provide",
              "sit", "stand", "lose", "pay", "meet", "include", "continue", "set",
              "learn", "change", "lead", "understand", "watch", "follow", "stop",
              "create", "speak", "read", "allow", "add", "spend", "grow", "open",
              "walk", "win", "offer", "remember", "love", "consider", "appear",
              "buy", "wait", "serve", "die", "send", "expect", "build", "stay",
              "fall", "cut", "reach", "kill", "remain", "suggest", "raise", "pass",
              "sell", "require", "belong", "report", "discuss", "explain", "answer",
              "demonstrate", "observe", "examine", "investigate", "evaluate", "assess",
              "compare", "contrast", "relate", "connect", "combine", "integrate",
              "transform", "improve", "enhance", "develop", "design", "implement",
              "deploy", "configure", "install", "setup", "manage", "operate", "maintain"}

def log(msg):
    """Log to both stdout and log file."""
    timestamp = datetime.now().isoformat()
    line = f"[{timestamp}] {msg}"
    print(line)
    os.makedirs(os.path.dirname(GAP_LOG), exist_ok=True)
    with open(GAP_LOG, "a") as f:
        f.write(line + "\n")

def _file_is_core_content(md_file):
    """Check if a file belongs to a core Oracle domain (not radio, homelab, etc.)."""
    rel = md_file.relative_to(ORACLE_WIKI)
    parts = [p.lower() for p in rel.parts]
    rel_str = rel.as_posix()
    # Skip archive, raw, system, AGENTS.md, SCHEMA.md, index.md, log.md
    if any(p in ("_archive", "raw", "system", "AGENTS", "SCHEMA", "HOW-TO-USE",
                 "log", "WELCOME", "index") for p in parts):
        return False
    # Skip radio/cybersecurity/homelab domains
    if any(p in ("radio-rf", "cybersecurity", "homelab", "personal-finance",
                 "health-and-routines", "purchases", "projects") for p in parts):
        return False
    # Skip files under domains/ (domain index files, not core knowledge)
    if "domains" in parts:
        return False
    return True

def _is_noise(phrase):
    """Check if a phrase is a noise word (not a real knowledge topic)."""
    lower = phrase.lower()
    if lower in NOISE_WORDS:
        return True
    if lower in STOP_WORDS:
        return True
    # Single words are noise
    if len(phrase.split()) == 1:
        return True
    # Very short phrases (< 2 words) are noise
    if len(phrase) < 8:
        return True
    # Check if phrase starts with a stop word pattern
    first = phrase.split()[0].lower()
    if first in {"the", "a", "an", "of", "and", "for", "with", "from", "into",
                 "about", "over", "under", "between", "through", "during"}:
        return True
    return False

def extract_oracle_topics():
    """Extract key topics, concepts, and themes from Oracle wiki pages."""
    topics = []
    concept_pattern = re.compile(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b')  # Title Case concepts
    
    for md_file in Path(ORACLE_WIKI).rglob("*.md"):
        try:
            if not _file_is_core_content(md_file):
                continue
            content = md_file.read_text(encoding="utf-8")
            
            # Extract from frontmatter
            if content.startswith("---"):
                parts = content.split("---", 2)
                if len(parts) >= 2:
                    fm = parts[1]
                    # tags
                    for line in fm.split("\n"):
                        if line.startswith("tags:"):
                            tags = [t.strip() for t in line.split(":", 1)[1].split(",")]
                            for t in tags:
                                if t and not _is_noise(t):
                                    topics.append(t)
                            break  # Only process first tags line
                    # title
                    for line in fm.split("\n"):
                        if line.startswith("title:"):
                            title = line.split(":", 1)[1].strip()
                            if title and not _is_noise(title):
                                topics.append(title)
                            break
            
            # Extract Title Case concepts from body (potential entities/topics)
            body = content.split("---", 2)[-1] if content.startswith("---") else content
            concepts = concept_pattern.findall(body)
            # Filter: 2+ words, not noise, not too common
            for c in concepts:
                if len(c.split()) >= 2 and len(c) > 5:
                    if not _is_noise(c):
                        topics.append(c)
                    
        except Exception as e:
            log(f"Error reading {md_file}: {e}")
    
    # Count frequency, return top topics and counts
    topic_counts = Counter(topics)
    top_topics = [topic for topic, count in topic_counts.most_common(50)]
    return top_topics, topic_counts

def identify_expansion_directions(topics, topic_counts):
    """Identify directions to expand knowledge based on existing topics."""
    expansions = []
    
    # Common expansion patterns
    expansion_templates = [
        ("historical context of {topic}", "Historical background and evolution"),
        ("modern applications of {topic}", "Current real-world applications and use cases"),
        ("critiques and limitations of {topic}", "Known criticisms, failures, and boundary conditions"),
        ("related frameworks to {topic}", "Alternative or complementary frameworks and methodologies"),
        ("key figures in {topic}", "Influential people, their contributions, and intellectual lineage"),
        ("open problems in {topic}", "Unsolved questions and active research areas"),
        ("case studies of {topic}", "Detailed real-world examples and lessons learned"),
        ("prerequisites for {topic}", "Foundational knowledge needed to understand this deeply"),
    ]
    
    # Select top topics and generate expansion directions
    for topic in topics[:15]:  # Top 15 topics
        for template, description in expansion_templates:
            if len(expansions) >= 30:  # Cap total expansions
                break
            expansions.append({
                "topic": topic,
                "direction": template.format(topic=topic),
                "description": description,
                "priority": "high" if topic_counts.get(topic, 0) > 2 else "normal"
            })
    
    return expansions[:20]  # Return top 20 expansion opportunities

def create_research_request(topic, direction, description, priority="normal"):
    """Create a research request package for the Researcher profile."""
    os.makedirs(EXCHANGE_DIR, exist_ok=True)
    
    request = {
        "id": f"oracle-expand-{datetime.now().strftime('%Y%m%d-%H%M%S')}-{abs(hash(direction)) % 10000:04d}",
        "topic": direction,
        "context": f"Oracle knowledge expansion: {description} for '{topic}'. This expands long-term knowledge around existing Oracle content.",
        "priority": priority,
        "created_at": datetime.now().isoformat(),
        "source": "oracle-knowledge-expansion",
        "target_profile": "researcher",
        "deliver_to": "exchange/research",
        "requirements": {
            "verify_citations": True,
            "synthesize": True,
            "target_wiki": "oracle",
            "max_pages": 3,
            "focus": "long-term knowledge, not current events"
        },
        "metadata": {
            "seed_topic": topic,
            "expansion_type": "knowledge_expansion",
            "oracle_anchor": topic
        }
    }
    
    req_file = os.path.join(EXCHANGE_DIR, f"{request['id']}.json")
    with open(req_file, "w") as f:
        json.dump(request, f, indent=2)
    
    log(f"Created research request: {req_file} — {direction}")
    return req_file

def main():
    log("=== Oracle Knowledge Expansion Started ===")
    
    # 1. Extract existing Oracle topics
    topics, topic_counts = extract_oracle_topics()
    log(f"Extracted {len(topics)} key topics from Oracle wiki")
    
    if not topics:
        log("No topics found in Oracle wiki — skipping expansion")
        print(json.dumps({"timestamp": datetime.now().isoformat(), "requests_created": 0, "reason": "empty_oracle"}))
        return
    
    # 2. Identify expansion directions
    expansions = identify_expansion_directions(topics, topic_counts)
    log(f"Identified {len(expansions)} knowledge expansion directions")
    
    # 3. Create research requests (max 5 per night)
    requests_created = 0
    for exp in expansions:
        if requests_created >= 5:
            break
        create_research_request(
            exp["topic"],
            exp["direction"],
            exp["description"],
            exp["priority"]
        )
        requests_created += 1
    
    # 4. Summary
    log(f"=== Oracle Knowledge Expansion Complete: {requests_created} research requests created ===")
    
    summary = {
        "timestamp": datetime.now().isoformat(),
        "oracle_topics_analyzed": len(topics),
        "expansion_directions_identified": len(expansions),
        "research_requests_created": requests_created,
        "top_seed_topics": topics[:10]
    }
    print(json.dumps(summary))

if __name__ == "__main__":
    main()