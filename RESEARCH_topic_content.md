## Esta Topic: SLA clock start-time policy per urgency band
### Research
- Searched for SLA clock start-time policies and urgency band SLA practices; public sources include vendor docs and ITSM practices, with no single authoritative standard for per-band policies.
- Consensus: SLA "clock" starts on the first measurable customer-affecting event; many vendors (Zendesk, ServiceNow, HubSpot) allow customization per ticket priority or channel.
- WealthForge should treat SLA clock start as configurable per urgency band and jurisdiction.
### Key findings
1. **Start-time options**: ticket creation, categorization, assignment, or first human touch. Critical alerts commonly use creation-time; lower bands use business-hour-aware start.
2. **Timezone and holiday handling**: Jurisdiction business-hour calendars drive exact calculation. Freshdesk/Atlassian show examples.
3. **Warmup/grace periods**: Different from start-time but often coupled. Configurable grace avoids SLA penalization during queue delays.
4. **Regulatory view**: FINRA, SEC, and state consumer-protection regimes treat response deadlines as time-sensitive obligations and may consider "receipt by counsel" or transmission time the start.
5. **Data model**: Use JSON/YAML table mapping urgency bands to `start_trigger`, `grace_minutes`, `calendar_id`, `first_event_timestamp_field`.
### Competitors / references
- Zendesk SLA Policies: trigger on creation or update.
- Atlassian Service Management: SLA calculator supports start/stop conditions.
- Intercom: SLA begins on conversation start.
- Freshdesk: SLA start events configurable per SLA type.
### Recommendations / what to build
- `urgency-band-sla-start-table` YAML with columns: band, trigger, timestamp field, grace minutes, calendar, clock-offset policy.
- `jurisdiction-business-day-calendar-binding` module to resolve holiday/weekend edges.
- `sla-start-event-monitor` to attest start-time and support audit logs.
- UI "urgency band card" showing SLA clock countdown from the chosen start.
- Configurable fallback: when timestamp is missing, define default start (creation vs assignment).
### Regulatory considerations
- Document chosen methodology for counsel; some state bars or regulators may require that clock start on receipt of the alert rather than system queue time.
- If alerting counsel, ensure treaty obligations and data-protection transfer times are counted if the deadline crosses jurisdictions.
### Open questions
- Should clock start on the earlier of system alert time and human acknowledgment?
- Should a "pending classification" state pause the clock?
- Retrofitted vs. greenfield migration: existing alerts may lack start-time data.
