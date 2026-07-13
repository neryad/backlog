# Privacy Policy — Playlogged

**Last updated:** 2026-07-12

---

## 1. Introduction

Welcome to Playlogged. This Privacy Policy explains how the app handles your information.

Playlogged is built by **Neryad**, a solo indie developer. The app is designed to work **offline-first** — you can use it entirely without an account.

---

## 2. Information We Collect

### 2.1 If You Use the App Without an Account (Offline Mode)

All data you create — your game library, statuses, personal ratings, notes, and hours played — is stored **only on your device** using a local SQLite database. No data ever leaves your device. If you delete the app, all data is permanently removed.

### 2.2 If You Create an Account (Cloud Sync)

When you create an account via email and password, the following additional data is collected and stored on our cloud infrastructure (Supabase):

- **Email address** — used solely for authentication; stored in Supabase Auth
- **Username and display name** — stored in your profile; visible publicly if you write a review
- **Game library** — titles, statuses, personal ratings, notes, and hours played; synced to the cloud to enable cross-device backup and community features
- **Avatar** — an auto-generated pixel-art image based on your username (via DiceBear); visible publicly
- **Platform IDs** — optional PSN, Xbox Gamertag, Switch Friend Code, Steam ID, and Epic Games ID

You can delete your account and all associated data at any time via the app (About → Data → Delete Account).

### 2.3 Public Reviews

If you mark a game entry as public, your **username, rating, and written notes** will be visible to anyone browsing the app's community features. You can control this per-entry via the toggle in the game detail screen.

### 2.4 What We Do NOT Collect

We do **not** collect:
- Real names (beyond display name)
- Phone numbers
- Location data
- Contacts or address book
- Device identifiers (IDFA, AAID)
- Usage analytics (there are no analytics SDKs)
- Crash reports (there are no crash reporters)
- Advertising identifiers (there are no ads)
- Browsing or search history
- Payment information (donations go through Ko-fi/PayPal directly)

---

## 3. Data Storage and Security

Your local SQLite database is your primary data store. Cloud sync is optional and opt-in. Even if you have an account, your data continues to work fully offline.

Cloud data is transmitted over HTTPS and stored in Supabase with Row-Level Security (RLS) policies that restrict access to your own data. Publicly shared content (reviews) is accessible to all users as designed.

---

## 4. Third-Party Services

Playlogged connects to a small number of external services for specific features:

### IGDB (Internet Game Database)
When you search for a game, the app sends your search query to the [IGDB API](https://www.igdb.com/api) (operated by Twitch Interactive, Inc.) via a serverless proxy. This is used solely to retrieve game titles, cover art, release dates, and descriptions.

No personal information is sent as part of these requests. Please review [Twitch's Privacy Policy](https://www.twitch.tv/p/legal/privacy-notice/) for more information.

### Supabase
Account authentication, cloud sync, and community features are powered by [Supabase](https://supabase.com). Data stored in Supabase is subject to [Supabase's Privacy Policy](https://supabase.com/privacy) and their EU/US hosting agreements.

### DiceBear (Avatars)
User avatars are auto-generated via the [DiceBear API](https://dicebear.com) using your username as a seed. DiceBear does not store personal information.

### Donation Links (Ko-fi / PayPal)
The app contains optional links to external donation platforms. Tapping these links will open an external browser or app. Any information you provide on those platforms is governed by their own privacy policies:

- [Ko-fi Privacy Policy](https://more.ko-fi.com/privacy)
- [PayPal Privacy Policy](https://www.paypal.com/us/legalhub/privacy-full)

Playlogged does not receive or process any payment or financial information.

---

## 5. Children's Privacy

Playlogged is not directed at children under the age of 13 (or under 16 in the European Economic Area). We do not knowingly collect personal information from children.

If you are a parent or guardian and believe your child has provided us with personal information, please contact us at neryadg@gmail.com and we will delete it.

---

## 6. Data Subject Rights (GDPR)

If you are in the European Economic Area (EEA), you have the following rights under the General Data Protection Regulation (GDPR):

- **Right to access** — request a copy of your personal data
- **Right to rectification** — correct inaccurate data
- **Right to erasure** — delete your account and all associated data (available in-app)
- **Right to data portability** — request a machine-readable export of your data
- **Right to object** — object to the processing of your data

To exercise these rights, contact us at neryadg@gmail.com.

### Legal Basis for Processing (GDPR Art. 6)

We process your personal data on the following legal bases:
- **Performance of a contract (Art. 6(1)(b))** — cloud sync and community features require data processing to function
- **Consent (Art. 6(1)(a))** — making reviews public is based on your explicit per-entry consent

---

## 7. Changes to This Policy

We may update this Privacy Policy from time to time. Any changes will be reflected with an updated "Last updated" date at the top of this document. We encourage you to review this policy periodically.

Continued use of the app after any changes constitutes your acceptance of the updated policy.

---

## 8. California Privacy Rights (CCPA)

If you are a resident of California, you have the right to:

- **Know** what personal information we collect about you
- **Request deletion** of your personal information
- **Opt out** of the sale or sharing of your personal information

**Playlogged does not sell or share your personal information.** We do not transfer data to third parties for monetary or other valuable consideration. To exercise your rights, contact us at neryadg@gmail.com.

We will not discriminate against you for exercising your CCPA rights.

---

## 9. Contact

If you have any questions about this Privacy Policy, please reach out:

**Neryad**
📧 neryadg@gmail.com
🌐 https://playlogged.app
