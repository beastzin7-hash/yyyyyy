---
name: Roblox Prank safety boundary
description: Safety and product boundary for the Roblox-themed demo experience.
---

The experience must remain clearly unofficial and use demo-only access credentials. It must not imitate Roblox authentication or collect real Roblox usernames, passwords, payment details, or session tokens.

**Why:** The original imported flow looked like a Roblox login and included account-like access fields; keeping it demo-only avoids misleading users and prevents credential collection.

**How to apply:** Keep the product name and install metadata distinguishable from the official Roblox app, label simulated purchase behavior clearly, and do not add endpoints that accept or persist Roblox account credentials.

## Mobile search input

The recipient lookup field must remain a search-only input, with password/autofill suggestions disabled. Mobile keyboards may show a “Passwords” strip when a generic text field looks like a login field.

**Why:** The recipient lookup is not authentication and must not suggest or imply that Roblox credentials belong there.

**How to apply:** Use search semantics (`type="search"`, `inputMode="search"`, neutral field names, autocomplete/correction disabled) for recipient lookup inputs, and never add password-like attributes to that flow.