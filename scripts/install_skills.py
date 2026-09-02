#!/usr/bin/env python3
"""
Install all repo skills to ${HOME}/.hermes/skills/ directory.

This script copies skills from the repository into the Hermes Agent
skills directory so they're available immediately after setup.

Supports nested category subdirectories (e.g., skills/research/web-research-fallbacks/).
Each directory containing a SKILL.md is installed as a separate skill.
"""

import os
import shutil
import sys
from pathlib import Path


def main():
    repo_skills = Path(__file__).parent.parent / "skills"
    installed_skills = Path.home() / ".hermes" / "skills"
    
    if not repo_skills.exists():
        print(f"[skip] Skills directory not found: {repo_skills}")
        return 0
    
    # Create skills directory if it doesn't exist
    installed_skills.mkdir(parents=True, exist_ok=True)
    
    installed_count = 0
    skipped_count = 0
    
    # Recursively find all SKILL.md files
    for skill_md in repo_skills.rglob("SKILL.md"):
        skill_dir = skill_md.parent
        target = installed_skills / skill_dir.name
        
        if not target.exists():
            shutil.copytree(skill_dir, target)
            print(f"[installed] {skill_dir.name}")
            installed_count += 1
        else:
            print(f"[skipped] {skill_dir.name} (already installed)")
            skipped_count += 1
    
    print(f"\nSummary: {installed_count} installed, {skipped_count} skipped")
    return 0


if __name__ == "__main__":
    sys.exit(main())
