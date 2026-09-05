---
name: capture-and-triage
description: Triage incoming content to wiki, db, or discard.
---

# Capture and Triage

Handle all incoming content (Telegram messages, Discord messages, voice notes, images, files, links, Web Clipper captures, email forwards) through a single triage workflow.

## Workflow

1. **Receive input** — Determine source channel (Telegram, Discord, Web Clipper, file, voice note, email).

2. **Classify input** as one of:
   - ordinary conversation
   - personal fact
   - preference
   - idea
   - decision
   - project update
   - task
   - deadline
   - waiting item
   - troubleshooting observation
   - purchase research
   - raw source
   - question to revisit

3. **Apply writeback check**:
   - Did the user state a durable personal fact?
   - Did the user state an explicit preference?
   - Did a decision become final?
   - Did a commitment, task, deadline, or waiting item emerge?
   - Did a project state change?
   - Did a test produce a verified result?
   - Did an approach fail in a reusable way?
   - Would losing this information cause future rework?

   If all answers are no, do not write anything.

4. **Route classified content**:
   - **personal fact** → Update or create page in Active Wiki (`~/.autognosia/active-wiki/personal/`)
   - **preference** → Update `system/core-preferences.md` or relevant page
   - **decision** → Create page in `active-wiki/personal/decisions/` folder
   - **task/deadline/waiting item** → Add to `organizer.db` via `organizer-state` skill
   - **project update** → Update existing project page in `active-wiki/projects/`
   - **troubleshooting** → Update project page or create troubleshooting record
   - **purchase research** → Add to `active-wiki/personal/purchases/` folder with dated prices
   - **raw source** → Save to `~/.autognosia/exchange/raw/YYYY/MM/` with metadata frontmatter
   - **idea** → Add to `active-wiki/personal/ideas/` folder
   - **question** → Add to `active-wiki/personal/questions/` folder
   - **specialist reference** (technical, factual, domain-specific) → Route to Oracle Vault (`~/.autognosia/oracle/brain/`) via library-onboarding skill

5. **Raw source captures** must include:
   ```yaml
   ---
   source_id: unique-stable-source-id
   capture_channel: telegram|discord|web-clipper|email
   captured_at: full-timestamp
   source_url:
   title:
   author:
   published:
   content_type:
   content_hash:
   why_saved:
   ---
   ```

6. **Record in organizer.db** — Add source record, mark processing status, update `log.md`.

7. **Support natural overrides**:
   - "Remember this" → Force save to appropriate location
   - "Capture this" → Save as raw source
   - "Add this to the project" → Route to specific project
   - "This is only a hypothesis" → Mark as hypothesis, do not save as fact
   - "Do not save this" → Discard
   - "Research this deeply" → Create research request
   - "Ask Oracle" → Route to Oracle profile

## Raw Source Ingestion Limits

- Update no more than 3 durable personal pages
- Create no more than 1 new durable page
- Exceed these limits only when the source genuinely requires it and record why

## Raw Source Processing

1. Detect new raw files in `~/.autognosia/exchange/raw/`
2. Compute and store content hash
3. Reject or flag duplicates
4. Read Active Wiki schema, index, and recent log
5. Find relevant existing pages
6. Determine whether source adds durable information
7. Update existing page before creating new page
8. Preserve provenance
9. Create review items for conflicts or uncertainty
10. Append concise entry to `log.md`
11. Mark source processed in `organizer.db`
