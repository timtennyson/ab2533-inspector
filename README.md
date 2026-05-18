# AB 2533 Inspector — Santa Cruz County PLG-264

Offline, phone-first field tool for inspecting an unpermitted ADU/JADU against the
**Santa Cruz County AB 2533 Substandard Housing Checklist (PLG-264, Rev 6/4/25)** and
**HSC § 17920.3**, then generating (1) the full checklist status and (2) a
**design-team recommendations memo** organized by trade.

## Why it's built this way

- **On-device only.** All data and photos/videos live in the browser's IndexedDB.
  Nothing is uploaded. This satisfies AB 2533's *confidential third-party inspection*
  intent. Backups are explicit: **Export JSON** (includes media) / **Import JSON**.
- **Scoped to the statute, not the full CBC.** PLG-264 maps line-for-line to
  17920.3. The county confirmed **Title 24 (energy) is not enforced** — the tool
  never asks for it.
- **Safe-harbor is first-class.** 17920.3 exempts wiring/plumbing/mechanical/
  materials/exits/fire-resistive components that were *legal when built and safely
  maintained* (items 33, 34, 35, 38, 41, 42, and the (k) maintenance reference).
  These carry a **SAFE-HARBOR** badge and the recommendations explicitly tell the
  design team **not** to over-scope them to current code. This is where projects
  bleed money — handled deliberately.
- **Form quirk handled.** Form item **29** is worded inversely from every other
  item. The app normalizes it so *Compliant always = the safe condition* and flags
  it ("FORM QUIRK") so the inspector isn't tricked.
- **Smoke/CO alarms flagged RETROACTIVE** (HSC §§ 13113.8, 17926) — no
  grandfathering; the county enforces these regardless of build date.
- **MEP sign-off addendum.** The printed PLG-264 has only Owner / Licensed
  Contractor / County Inspector signature lines. The county's request for
  mechanical/electrical/plumbing sign-off is **verbal** — the report adds a trade
  sign-off addendum, but **get that requirement in writing** from the county so it
  doesn't shift per plan-checker.

## Run it

Service workers + PWA install require a secure context (`localhost` or HTTPS).

**Local test (desktop):**
```
cd ab2533-inspector
python -m http.server 8000
# open http://localhost:8000
```

**On your phone (field use):** deploy the folder to any static HTTPS host
(Netlify drop, GitHub Pages, Cloudflare Pages, or your own server), open it in
mobile Safari/Chrome, then **Add to Home Screen**. It then runs fullscreen and
fully offline; the camera button uses the native camera for per-item photo/video.

## Workflow

1. Fill **Project Information**.
2. Walk the unit; for each item set **Compliant / Violation / Unconfirmed**
   (sections F/G/H have the 3rd "Unconfirmed = concealed" state), add notes and
   photos/video.
3. Add any field-identified items (44–46).
4. Fill the sign-off names.
5. **Generate Report** → preview → **Print / Save as PDF**. Hand the
   recommendations memo to the design team for the ePlan submittal (county Step 2).

## Roadmap (agreed scope)

- **v1 (this):** single-inspector capture, offline, on-device, report + memo.
- **v2:** per-trade (M/E/P) review + e-signature workflow; optional self-hosted
  sync for multi-user sign-off.
- **v3:** prefill county application forms (PLG-200/210/230) from project data.

## Confidentiality & data handling

Client confidentiality is enforced by **architecture**, not policy:

- **The public GitHub repo contains only the app shell** (HTML/JS/CSS + the blank
  checklist structure). It holds **zero** client or inspection data.
- **All inspection data stays on the device.** Notes, photos, video, addresses,
  and owner info are written to the browser's IndexedDB on that one phone. There
  are **no network calls** in the app — no analytics, CDN, fonts, or telemetry
  (verified: the only `fetch` calls are a local `data:` URL during JSON import and
  the service worker caching same-origin app files). The hosted code physically
  cannot see inspection data.
- **Browser sync does not sync IndexedDB**, so data does not propagate to other
  devices via iCloud/Chrome sync.

Two residual leak vectors remain the operator's responsibility (accepted; not
mitigated in code by decision):

1. **A lost or stolen *unlocked* phone.** The app has no passcode of its own; it
   relies on the device lock screen + OS disk encryption. **Keep the phone
   passcode/biometrics enabled.**
2. **Files that leave the device.** "Export JSON" and "Save as PDF" produce
   **unencrypted** files containing everything. Treat them as confidential client
   records: store them only on access-controlled systems, send via secure
   channels, and delete local copies once submitted. Use "New" to clear an
   inspection from the device when no longer needed.

If the client base ever requires stronger guarantees, the planned upgrades are:
passphrase-encrypted exports (Web Crypto AES-GCM) and an app passcode with
at-rest IndexedDB encryption.

## Disclaimer

An aid, not legal or engineering advice. Completion of the checklist does not
confer legality. All findings — especially structural and safe-harbor calls —
must be independently verified by the responsible licensed professional.
