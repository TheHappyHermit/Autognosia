#!/usr/bin/env python3
"""Export completed sessions older than 7 days to structured archival format.
Run weekly by the 'Session Export Weekly' cron job.
Preserves full conversation history with timestamps for long-term retrieval.
"""
import os
import sys
import sqlite3
import json
import shutil
from pathlib import Path
from datetime import datetime, timedelta

HOME = Path.home()
STATE_DB = HOME / ".hermes/state.db"
EXPORT_DIR = HOME / ".hermes/archives/sessions"

def log(msg):
    print(msg, flush=True)

def main():
    log("=" * 70)
    log("Session Export Weekly")
    log(f"Timestamp: {datetime.now().isoformat()}")
    log("=" * 70)
    
    # Create export directory
    EXPORT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Calculate 7 days ago
    cutoff = datetime.now() - timedelta(days=7)
    cutoff_ts = cutoff.timestamp()
    
    # Connect to session DB
    conn = sqlite3.connect(str(STATE_DB))
    
    # Get completed sessions older than 7 days
    log(f"\nSearching for sessions completed before {cutoff.isoformat()}...")
    
    sessions = conn.execute("""
        SELECT id, source, model, started_at, ended_at, end_reason,
               message_count, tool_call_count, title, display_name,
               profile_name, chat_id, chat_type, thread_id
        FROM sessions
        WHERE ended_at IS NOT NULL
          AND ended_at < ?
          AND archived = 0
        ORDER BY ended_at DESC
    """, (cutoff_ts,)).fetchall()
    
    if not sessions:
        log("No completed sessions found older than 7 days.")
        conn.close()
        return
    
    log(f"Found {len(sessions)} sessions to export.")
    
    exported = 0
    for session in sessions:
        session_id, source, model, started_at, ended_at, end_reason, \
            msg_count, tool_calls, title, display_name, profile_name, \
            chat_id, chat_type, thread_id = session
        
        started_dt = datetime.fromtimestamp(started_at)
        ended_dt = datetime.fromtimestamp(ended_at)
        
        # Create session directory
        safe_id = session_id.replace('/', '_')
        session_dir = EXPORT_DIR / f"{ended_dt.strftime('%Y-%m-%d')}_{safe_id}"
        
        if session_dir.exists():
            # Skip if already exported
            log(f"SKIP: {session_dir.name} (already exists)")
            continue
        
        session_dir.mkdir(parents=True)
        
        # Write session metadata
        metadata = {
            "session_id": session_id,
            "source": source,
            "model": model,
            "title": title or "Untitled",
            "display_name": display_name or "",
            "started_at": started_dt.isoformat(),
            "ended_at": ended_dt.isoformat(),
            "end_reason": end_reason or "unknown",
            "message_count": msg_count,
            "tool_call_count": tool_calls,
            "chat_id": chat_id or "",
            "chat_type": chat_type or "",
            "thread_id": thread_id or "",
            "exported_at": datetime.now().isoformat()
        }
        
        (session_dir / "session_metadata.json").write_text(
            json.dumps(metadata, indent=2, default=str)
        )
        
        # Extract messages for this session
        messages = conn.execute("""
            SELECT id, role, content, timestamp, tool_name, tool_calls
            FROM messages
            WHERE session_id = ?
            ORDER BY timestamp ASC
        """, (session_id,)).fetchall()
        
        messages_list = []
        for msg in messages:
            msg_id, role, content, timestamp, tool_name, tool_calls = msg
            
            msg_data = {
                "id": msg_id,
                "role": role,
                "content": content or "",
                "timestamp": datetime.fromtimestamp(timestamp).isoformat() if timestamp else None,
            }
            
            if tool_name:
                msg_data["tool"] = {
                    "name": tool_name,
                    "arguments": tool_calls or "",
                }
            
            messages_list.append(msg_data)
        
        # Write messages as JSONL (one message per line for easy parsing)
        messages_file = session_dir / "messages.jsonl"
        messages_file.write_text(
            json.dumps(messages_list, default=str) + "\n"
        )
        
        exported += 1
        log(f"EXPORT: {session_dir.name} ({len(messages)} messages)")
    
    conn.close()
    
    # Summary
    log("\n" + "=" * 70)
    log(f"Export Summary:")
    log(f"  Sessions exported: {exported}")
    log(f"  Export directory: {EXPORT_DIR}")
    
    # Count total exported files
    total_exports = len([d for d in EXPORT_DIR.iterdir() if d.is_dir()])
    total_size = sum(
        f.stat().st_size for f in EXPORT_DIR.rglob("*") if f.is_file()
    )
    log(f"  Total exports: {total_exports}")
    log(f"  Total size: {total_size / 1024 / 1024:.1f} MB")
    log("=" * 70)

if __name__ == "__main__":
    main()
