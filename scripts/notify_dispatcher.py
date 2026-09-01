#!/usr/bin/env python3
"""
Multi-Channel Notification Dispatcher for Autognosia.
Dispatches reminders and alerts across user-configured communication channels:
- Telegram Bot API
- Discord Webhook
- Email (SMTP)
- Phone / SMS (Twilio)
- Local Desktop / Console Fallback

Zero-dependency core: uses standard library (urllib, smtplib, os, json).
"""

import os
import sys
import json
import urllib.request
import urllib.parse
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, Optional, List

# Load environment variables from Autognosia/Hermes config if available
def load_env_configs():
    env_files = [
        Path.home() / ".hermes" / ".env",
        Path(__file__).resolve().parent.parent / "docker" / ".env",
        Path.home() / ".autognosia" / "secrets" / ".env"
    ]
    for env_path in env_files:
        if env_path.exists():
            try:
                with open(env_path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            k, v = line.split("=", 1)
                            k = k.strip()
                            v = v.strip().strip('"').strip("'")
                            if k not in os.environ:
                                os.environ[k] = v
            except Exception:
                pass

load_env_configs()

class NotificationDispatcher:
    def __init__(self):
        # Telegram
        self.tg_token = os.environ.get("TELEGRAM_BOT_TOKEN")
        self.tg_chat_id = os.environ.get("TELEGRAM_CHAT_ID")

        # Discord
        self.discord_webhook = os.environ.get("DISCORD_WEBHOOK_URL")

        # Email
        self.smtp_host = os.environ.get("SMTP_HOST")
        self.smtp_port = int(os.environ.get("SMTP_PORT", 587))
        self.smtp_user = os.environ.get("SMTP_USER")
        self.smtp_pass = os.environ.get("SMTP_PASSWORD")
        self.email_to = os.environ.get("NOTIFICATION_EMAIL_TO")

        # Twilio (SMS/Voice)
        self.twilio_sid = os.environ.get("TWILIO_ACCOUNT_SID")
        self.twilio_auth = os.environ.get("TWILIO_AUTH_TOKEN")
        self.twilio_from = os.environ.get("TWILIO_FROM_PHONE")
        self.user_phone = os.environ.get("USER_PHONE_NUMBER")

    def dispatch(self, title: str, body: str = "", channel: str = "all") -> Dict[str, Any]:
        """Dispatch notification across target channels."""
        results = {}
        message_formatted = f"🔔 [Autognosia REMINDER]\n\n{title}"
        if body:
            message_formatted += f"\n\nDetails: {body}"

        # 1. Telegram
        if channel in ["all", "telegram"] and self.tg_token and self.tg_chat_id:
            results["telegram"] = self._send_telegram(message_formatted)
        elif channel == "telegram":
            results["telegram"] = {"status": "skipped", "reason": "TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not configured"}

        # 2. Discord
        if channel in ["all", "discord"] and self.discord_webhook:
            results["discord"] = self._send_discord(title, body)
        elif channel == "discord":
            results["discord"] = {"status": "skipped", "reason": "DISCORD_WEBHOOK_URL not configured"}

        # 3. Email
        if channel in ["all", "email"] and self.smtp_host and self.smtp_user and self.email_to:
            results["email"] = self._send_email(f"Reminder: {title}", message_formatted)
        elif channel == "email":
            results["email"] = {"status": "skipped", "reason": "SMTP or NOTIFICATION_EMAIL_TO not configured"}

        # 4. Twilio SMS
        if channel in ["sms", "phone"] and self.twilio_sid and self.twilio_auth and self.user_phone:
            results["sms"] = self._send_sms(message_formatted)

        # 5. Local / Desktop Fallback (always logged)
        results["local"] = self._send_local(title, body)

        return results

    def _send_telegram(self, text: str) -> Dict[str, Any]:
        try:
            url = f"https://api.telegram.org/bot{self.tg_token}/sendMessage"
            payload = json.dumps({"chat_id": self.tg_chat_id, "text": text}).encode("utf-8")
            req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=5) as res:
                return {"status": "success", "code": res.status}
        except Exception as e:
            return {"status": "error", "error": str(e)}

    def _send_discord(self, title: str, body: str) -> Dict[str, Any]:
        try:
            embed = {
                "title": f"🔔 Hermes Reminder: {title}",
                "description": body or "Scheduled time reached.",
                "color": 372138 # cyan hex
            }
            payload = json.dumps({"embeds": [embed]}).encode("utf-8")
            req = urllib.request.Request(self.discord_webhook, data=payload, headers={"Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=5) as res:
                return {"status": "success", "code": res.status}
        except Exception as e:
            return {"status": "error", "error": str(e)}

    def _send_email(self, subject: str, body: str) -> Dict[str, Any]:
        try:
            msg = MIMEMultipart()
            msg["From"] = self.smtp_user
            msg["To"] = self.email_to
            msg["Subject"] = subject
            msg.attach(MIMEText(body, "plain"))

            server = smtplib.SMTP(self.smtp_host, self.smtp_port, timeout=8)
            server.starttls()
            if self.smtp_pass:
                server.login(self.smtp_user, self.smtp_pass)
            server.sendmail(self.smtp_user, self.email_to, msg.as_string())
            server.quit()
            return {"status": "success"}
        except Exception as e:
            return {"status": "error", "error": str(e)}

    def _send_sms(self, text: str) -> Dict[str, Any]:
        try:
            url = f"https://api.twilio.com/2010-04-01/Accounts/{self.twilio_sid}/Messages.json"
            data = urllib.parse.urlencode({
                "To": self.user_phone,
                "From": self.twilio_from or self.twilio_sid,
                "Body": text[:1600]
            }).encode("utf-8")
            
            import base64
            auth_header = "Basic " + base64.b64encode(f"{self.twilio_sid}:{self.twilio_auth}".encode()).decode()
            req = urllib.request.Request(url, data=data, headers={"Authorization": auth_header})
            with urllib.request.urlopen(req, timeout=8) as res:
                return {"status": "success", "code": res.status}
        except Exception as e:
            return {"status": "error", "error": str(e)}

    def _send_local(self, title: str, body: str) -> Dict[str, Any]:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        try:
            print(f"[{timestamp}] [REMINDER] {title} {f'({body})' if body else ''}")
        except Exception:
            pass
        return {"status": "success", "timestamp": timestamp}

# Global instance
dispatcher = NotificationDispatcher()

if __name__ == "__main__":
    test_title = "Test Reminder from Autognosia"
    test_body = "This is a verification test of the multi-channel notification dispatcher."
    print("Testing Notification Dispatcher...")
    res = dispatcher.dispatch(test_title, test_body)
    print(json.dumps(res, indent=2))
