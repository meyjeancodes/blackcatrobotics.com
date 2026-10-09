# Connect TechMedix to Muse — Setup Prompt (Custom Connector fast path)

No directory listing needed. Any Muse user can connect TechMedix today as a
**Custom Connector** (unreviewed by Meta). Copy the prompt below into Muse.

---

**Prompt to paste into Muse:**

> I want to connect TechMedix (AI maintenance intelligence for my robot fleet)
> as a custom connector. The OpenAPI spec is at
> https://blackcatrobotics.com/.well-known/techmedix-openapi.yaml
>
> Build the connector from that spec. Then ask me for my TechMedix API key
> (it starts with `tmdx_live_`) and store it securely — send it as
> `Authorization: Bearer <key>` on every call.
>
> My customer ID is: _____
>
> Rules:
> - Read tools (fleet_status, alerts_list, platform_catalog, diagnose,
>   ar_guidance, parts_advisor, tasks_list) need no confirmation.
> - Write tools (dispatch_create, alert_resolve, task_create) ALWAYS need
>   my explicit confirmation first.
> - When creating a dispatch or task, generate a UUID and send it as the
>   `Idempotency-Key` header so retries never duplicate work.
> - Never claim a payment, telemetry ingestion, or robot-control capability —
>   the connector can't do those.

---

## Getting an API key

1. Sign in to the TechMedix dashboard.
2. Go to Settings → API keys → Mint key (or ask your BlackCat admin).
3. Save the key immediately — it's shown once.

## What you can ask once connected

- "How's my fleet doing right now?"
- "What's wrong with H1-07?"
- "Show me active alerts."
- "Get AR repair guidance for the knee actuator fault on H1-07."
- "Find a replacement actuator in stock in the US."
- "Create a high-priority work order for H1-07's actuator."
- "Draft my weekly maintenance summary."
