#!/usr/bin/env python3
"""Research script on Time Perception and Temporal Distortion"""
from hermes_tools import web_search

# Search for key papers on time perception
searches = [
    "scalar expectancy theory Gibbon 1977 time perception",
    "scalar timing theory Church Meck 1984 interval timing",
    "striatal beat frequency model Meck Matell 2004",
    "dopamine time perception clock speed review 2020-2025",
    "oddball effect time dilation Eagleman 2008 PLOS ONE",
    "flow state time compression Csikszentmihalyi 1990",
    "retrospective prospective time estimation dual process",
    "time perception meta-analysis 2020-2025",
    "computational model interval timing drift diffusion population clock",
    "Warren Meck time perception Duke",
    "Richard Ivry time perception Berkeley",
    "Virginie van Wassenhove time perception",
]

for query in searches:
    print(f"\n=== {query} ===")
    result = web_search(query, limit=3)
    for item in result.get("data", {}).get("web", []):
        print(f"  {item['title']}: {item['url']}")