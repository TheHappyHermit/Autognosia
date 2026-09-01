# Unicode Character Pitfalls in Python via execute_code

## The Problem

Special Unicode characters (section sign §, trademark ™, em dash —, bullet •, etc.) cause `SyntaxError` when used directly in Python string literals passed to `execute_code`.

### Example Failure

```python
# This FAILS:
content = """
def check_irc2703_compliance(business, structure):
    \"\"\"Check if the buy-sell structure meets IRC §2703 requirements.\"\"\"
    ...
"""
```

Error: `SyntaxError: invalid character '§' (U+00A7)`

### Why It Happens

The `execute_code` tool wraps the Python code in a sandbox. Depending on the sandbox's encoding handling, Unicode characters in string literals (especially in docstrings and comments) may not be properly encoded, causing the Python parser to reject them.

## Workarounds

### Option 1: Write to temp file first, then append (RECOMMENDED)

```python
# Step 1: Write content to a temp file (write_file handles encoding correctly)
# (use write_file tool directly — NOT via execute_code)

# Step 2: Use Python to read and append to target file
content_path = '/home/josh434/.hermes/research_output/temp_research.md'
target_path = '/home/josh434/Projects/wealthforge-ai-local/knowledge_base/research_outcomes/RESEARCH.md'

with open(content_path, 'r') as f:
    content = f.read()

with open(target_path, 'a') as f:
    f.write(content)
```

### Option 2: Use ASCII-safe alternatives

| Unicode char | ASCII alternative | Example |
|---|---|---|
| § | "Section" or "Sec." | "IRC 2703" instead of "IRC §2703" |
| ™ | "TM" | "WealthForge TM" |
| — | "--" or "-" | "Connelly -- US" |
| • | "-" or "*" | list items |
| ° | "deg" | "30 deg C" |
| µ | "micro" or "u" | "micro" |
| © | "(c)" | "(c) 2026" |
| ® | "R" | "Registered R" |
| ± | "plus/minus" | "plus/minus 5%" |
| ≈ | "approximately" | "approximately equal" |
| ≠ | "not equal" | "not equal to" |
| ≤ | "less than or equal" | "less than or equal to" |
| ≥ | "greater than or equal" | "greater than or equal to" |

### Option 3: Use raw string with explicit encoding

```python
content = r"""
Some text with § and — characters
"""
# Note: r prefix helps but does NOT guarantee fix — use Option 1 when in doubt
```

## When to Use Which

- **Research content (markdown files)**: Option 1 (temp file). The content is large and contains many special chars.
- **Small Python snippets**: Option 2 (ASCII alternatives). Quick and reliable.
- **Mixed content**: Option 1 for the file write, Option 2 for inline Python code.

## Lesson Learned

From Run 211 (2026-05-23): bp-3 Buy-Sell Structure Comparator research hit this error. Fixed by writing to temp file first, then appending.
