#!/usr/bin/env python3
"""
OKF Index Verification Script
Verifies that all directories in the wiki contain proper OKF index.md files
and that they're up-to-date with the latest markdown files.

This script is designed to be run as a daily cron job to ensure
OKF compliance across all wiki directories.
"""

import os
import sys
import json
import re
from datetime import datetime, timezone
from pathlib import Path

def get_md_files(directory, exclude_dirs=None):
    """Get all markdown files in a directory."""
    if exclude_dirs is None:
        exclude_dirs = ['.obsidian', '.git', '.meta', 'graphify-out', 'graphify-main-out']
    
    md_files = []
    for root, dirs, files in os.walk(directory):
        # Skip excluded directories
        rel_path = os.path.relpath(root, directory)
        if any(excluded in rel_path for excluded in exclude_dirs):
            continue
        
        for file in files:
            if file.endswith('.md'):
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, directory)
                md_files.append({
                    'path': rel_path,
                    'full_path': full_path,
                    'size': os.path.getsize(full_path),
                    'mtime': os.path.getmtime(full_path)
                })
    
    return md_files

def verify_index_file(directory, index_file):
    """Verify an index.md file exists and has OKF frontmatter.

    Link rule: a directory's index.md must link every markdown file in THAT
    directory (direct children only). Descendant directories have their own
    indexes — requiring ancestor indexes to link all descendants produced
    hundreds of false 'missing-link' issues and bloated hub pages.
    """
    issues = []
    
    if not os.path.exists(index_file):
        issues.append({
            'type': 'missing',
            'message': f'index.md not found in {directory}'
        })
        return issues
    
    try:
        with open(index_file, 'r') as f:
            content = f.read()
        
        # Check for OKF frontmatter
        if not content.startswith('---'):
            issues.append({
                'type': 'no-frontmatter',
                'message': f'index.md in {directory} lacks OKF YAML frontmatter'
            })
        
        # Check for required frontmatter fields
        if 'type:' not in content:
            issues.append({
                'type': 'missing-type',
                'message': f'index.md in {directory} missing required "type:" field'
            })
        
        if 'title:' not in content:
            issues.append({
                'type': 'missing-title',
                'message': f'index.md in {directory} missing recommended "title:" field'
            })
        
        # Check for links to markdown files (direct children only).
        # Accept wiki-links [[file]] / [[base]] / [[any/path/base]] and
        # standard markdown links [...](any/path/file.md) — Obsidian and
        # most wikis resolve all of these.
        for file in sorted(os.listdir(directory)):
            if file.endswith('.md') and file != 'index.md':
                base = os.path.splitext(file)[0]
                pat = (r'\[\[[^\]]*' + re.escape(base) + r'(\.md)?(\]|#|\|)'
                       r'|\]\([^)]*' + re.escape(file))
                if not re.search(pat, content):
                    issues.append({
                        'type': 'missing-link',
                        'message': f'index.md in {directory} missing link to {file}'
                    })
        
    except Exception as e:
        issues.append({
            'type': 'read-error',
            'message': f'Error reading index.md in {directory}: {str(e)}'
        })
    
    return issues

def verify_wiki_wellformed(wiki_root, exclude_dirs=None):
    """Verify entire wiki directory for OKF compliance.
    
    Archive/raw evidence stores (_archive, _queues, inbox/raw, raw,
    historical) hold immutable captured evidence, not curated knowledge
    pages, so they are outside the OKF index contract — same exclusion set
    the index generators use.
    """
    if exclude_dirs is None:
        exclude_dirs = ['.obsidian', '.git', '.meta', 'graphify-out', 'graphify-main-out']
    skip_patterns = ('_archive', '_queues', 'inbox/raw', '/raw/', '/historical/')
    
    total_files = 0
    total_dirs = 0
    total_issues = 0
    issues_by_type = {}
    
    for root, dirs, files in os.walk(wiki_root):
        rel_path = os.path.relpath(root, wiki_root)
        
        # Skip excluded directories
        if any(excluded in rel_path for excluded in exclude_dirs):
            continue
        # Skip archive/raw evidence stores (not part of the curated OKF tree)
        if any(pat in f'/{rel_path}/' for pat in skip_patterns):
            dirs[:] = []
            continue
        
        total_dirs += 1
        
        # Count markdown files
        md_files = [f for f in files if f.endswith('.md')]
        total_files += len(md_files)
        
        # Check index.md in this directory
        index_file = os.path.join(root, 'index.md')
        # Directories with no markdown content (pure containers) don't need
        # an index — there is nothing to link.
        if rel_path != '.' and any(f.endswith('.md') and f != 'index.md' for f in files):
            issues = verify_index_file(root, index_file)
            if issues:
                total_issues += len(issues)
                for issue in issues:
                    issue_type = issue['type']
                    if issue_type not in issues_by_type:
                        issues_by_type[issue_type] = []
                    issues_by_type[issue_type].append(issue)
    
    return {
        'wiki_root': wiki_root,
        'total_dirs': total_dirs,
        'total_files': total_files,
        'total_issues': total_issues,
        'issues_by_type': issues_by_type,
        'timestamp': datetime.now(timezone.utc).isoformat()
    }

def main():
    """Run OKF verification on all wiki directories."""
    home = os.path.expanduser('~')
    autognosia_root = os.path.join(home, '.autognosia')
    
    wikis = {
        'active_wiki': os.path.join(autognosia_root, 'active-wiki'),
        'oracle_brain': os.path.join(autognosia_root, 'oracle', 'brain')
    }
    
    results = {}
    all_issues = []
    
    for wiki_name, wiki_path in wikis.items():
        if os.path.isdir(wiki_path):
            print(f"Verifying {wiki_name} at {wiki_path}...")
            result = verify_wiki_wellformed(wiki_path)
            results[wiki_name] = result
            all_issues.extend(result['issues_by_type'])
        else:
            print(f"Warning: {wiki_name} directory not found at {wiki_path}")
    
    # Generate summary report
    report = {
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'wikis_verified': list(results.keys()),
        'summary': {
            wiki: {
                'total_dirs': results[wiki]['total_dirs'],
                'total_files': results[wiki]['total_files'],
                'total_issues': results[wiki]['total_issues']
            }
            for wiki in results.keys()
        }
    }
    
    # Print summary
    print("\n=== OKF Index Verification Report ===")
    for wiki_name, result in results.items():
        print(f"\n{wiki_name}:")
        print(f"  Directories: {result['total_dirs']}")
        print(f"  Markdown files: {result['total_files']}")
        print(f"  Issues found: {result['total_issues']}")
        
        if result['issues_by_type']:
            for issue_type, issues in result['issues_by_type'].items():
                print(f"  - {issue_type}: {len(issues)} issue(s)")
    
    # Write report to file
    report_path = os.path.join(home, '.autognosia', 'reports', 'okf_verification.json')
    os.makedirs(os.path.dirname(report_path), exist_ok=True)
    
    with open(report_path, 'w') as f:
        json.dump(report, f, indent=2)
    
    print(f"\nReport saved to: {report_path}")
    
    # Return exit code based on issues
    return 0 if all(r['total_issues'] == 0 for r in results.values()) else 1

if __name__ == '__main__':
    sys.exit(main())
