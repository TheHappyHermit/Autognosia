# Researcher Context Template

Copy-paste this into the `context` field when dispatching researchers:

```
The user is building a comprehensive Oracle wiki at $HOME/.autognosia/oracle/brain\ for a personal AI agent system.

CRITICAL INSTRUCTIONS:
1. You MUST write your research directly to a markdown file using write_file
2. Use web_search to verify facts, citations, and current data before writing
3. Keep entries concise (2-3 paragraphs each)
4. Include specific papers, researchers, and dates
5. Do NOT skip the write_file step — persist research to disk

Write to: $HOME/.autognosia/oracle/brain\<Domain>\Filename.md
```

## Common Pitfalls to Avoid
- Researchers doing web_search but NOT writing the file (context overflow)
- Researchers writing to wrong paths (always specify full path)
- Researchers returning summaries instead of file content
- Scope too large → context overflow → no file written

## Verification After Completion
Always run:
```bash
ls -la $HOME/.autognosia/oracle/brain/<Domain>/
wc -l $HOME/.autognosia/oracle/brain/<Domain>/*.md
```

If file is missing, the researcher hit context overflow — re-dispatch with narrower scope.
