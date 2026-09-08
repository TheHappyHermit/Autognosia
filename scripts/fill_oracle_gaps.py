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

def log(msg):
    """Log to both stdout and log file."""
    timestamp = datetime.now().isoformat()
    line = f"[{timestamp}] {msg}"
    print(line)
    os.makedirs(os.path.dirname(GAP_LOG), exist_ok=True)
    with open(GAP_LOG, "a") as f:
        f.write(line + "\n")

def extract_oracle_topics():
    """Extract key topics, concepts, and themes from Oracle wiki pages."""
    topics = []
    concept_pattern = re.compile(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b')  # Title Case concepts
    
    for md_file in Path(ORACLE_WIKI).rglob("*.md"):
        try:
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
                            topics.extend(tags)
                        elif line.startswith("title:"):
                            title = line.split(":", 1)[1].strip()
                            topics.append(title)
            
            # Extract Title Case concepts from body (potential entities/topics)
            body = content.split("---", 2)[-1] if content.startswith("---") else content
            concepts = concept_pattern.findall(body)
            # Filter: 2+ words, not common words
            for c in concepts:
                if len(c.split()) >= 2 and len(c) > 5:
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
        "target_profile": "oracle-researcher",
        "deliver_to": "exchange/research",
        "requirements": {
            "verify_citations": True,
            "synthesize": True,
            "target_wiki": "oracle",
            "max_pages": 3,
            "focus": "long-term knowledge, not current events",
            "frontmatter_schema": "wiki-frontmatter.schema.json",
            "required_fields": ["okf_version", "id", "description", "type", "status", "generated"],
            "type": "research_report"
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