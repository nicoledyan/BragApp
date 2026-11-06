# Website discovery update — November 6, 2026

Prepared for nicoledyan/BragApp, the source for https://bragbag.app.

## Review

- Brag-book guide: free copyable template and designed, fillable PDF download, three explicitly illustrative examples, existing app screenshot, and search/social metadata that describes the actual resource.
- Performance-review guide: worked example, evidence worksheet, copy control and designed, fillable PDF download, and updated search/social metadata.
- Homepage and wins guide link to the resources. Sitemap modification dates reflect edited content.
- Optional PostHog website analytics: visits, referring domains, campaign source, App Store clicks, template copies and resource downloads. No replay, automatic DOM capture, clipboard contents, or app-account identification. Analytics starts only after consent, and only on bragbag.app / www.bragbag.app. Local previews send no analytics.
- Privacy page explains the new website behavior and footer control. Counts cover consenting browsers, not all visitors. App Store clicks are not confirmed downloads.

## Preview and checks

Local preview: http://127.0.0.1:8765/brag-book/ and /performance-review-accomplishments/. Both downloads now use one-page designed PDFs, with page previews; plain-text downloads were removed.

Run `node scripts/check-analytics.cjs` for consent, opt-out, loading-race, preview-exclusion, campaign and privacy checks. Build with POSTHOG_API_KEY and POSTHOG_API_HOST set in the environment, then run `python3 scripts/build.py`. The generated dist artifact includes only allowlisted public files. It does not include .env, Git history, scripts, or this note.

## Dashboard

https://us.posthog.com/project/327282/dashboard/2314133

Six saved insights, website-filtered and test-account-filtered. Empty until website tracking is deployed. All six queries were executed successfully; zero data is not a historical traffic estimate.

## Publishing, pending approval

Current GitHub Pages source is main at / with legacy publishing. This update prepares an Actions-based build so the public project token is configured in repository variables rather than source code.

1. Set BragApp repository variables POSTHOG_API_KEY (existing public project token, not a personal API key) and POSTHOG_API_HOST (https://us.i.posthog.com).
2. Switch GitHub Pages publishing to GitHub Actions, preserving bragbag.app and HTTPS settings.
3. Merge the reviewed branch and run the included Pages workflow.
4. Verify live pages, resources, and the consent behavior. Verify genuine website events in PostHog without counting the smoke test as visitor traffic.
5. Inspect updated pages in Search Console and request recrawling where available. The sitemap is already submitted successfully (last read October 31, seven discovered pages).

Bing: signed in with the user-authorized Google basic identity permission. No sites were registered. Prepared bragbag.app for manual HTML-tag verification; the public verification tag is included in the homepage. Finish verification and submit sitemap.xml after publication. No Search Console OAuth import permission was requested.

No ranking, AI citation, or installation result is guaranteed by this update.
