# Privacy Policy for Forge Query DevTools Extension

**Last Updated:** February 2026

## Overview

The Forge Query DevTools Extension is a developer tool designed to help you inspect, debug, and monitor queries in your React applications that use the Forge Query library.

## Data Collection

### What We Collect

**We do not collect any personal data.** The extension operates entirely locally on your machine.

### Data Accessed

The extension accesses the following data **only within the inspected tab**:
- Query keys and their associated data
- Cache statistics (hit/miss counts)
- Query status information (loading, error, success states)
- Timestamps of query executions

### Where Data is Stored

All data is:
- Stored temporarily in your browser's memory
- Never transmitted to any external servers
- Cleared when you close the DevTools panel or the browser tab

## Permissions Explained

The extension requires these permissions:

| Permission | Why It's Needed |
|------------|-----------------|
| `devtools` | To create the DevTools panel |
| `activeTab` | To inspect the currently open tab |
| `scripting` | To inject the content script that communicates with Forge Query |

## Third-Party Services

This extension does **not** use any third-party analytics, tracking, or data collection services.

## Data Sharing

We do **not** share any data with third parties. Period.

## Updates

This privacy policy may be updated occasionally. We will notify users of any significant changes through the extension's changelog.

## Contact

For privacy concerns or questions, please:
- Open an issue on [GitHub](https://github.com/forgedevstack/forge-query)
- Email: privacy@forgedevstack.com

## Your Rights

Since we don't collect any personal data, there's nothing to request, modify, or delete. You have complete control over your data at all times.

---

**TL;DR:** This extension is a local development tool. We don't collect, store, or transmit any of your data. Everything stays on your machine.

