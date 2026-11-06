"""Build public website files; inject public PostHog config from the environment."""
import json
import os
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'dist'
token = os.environ.get('POSTHOG_API_KEY', '')
host = os.environ.get('POSTHOG_API_HOST', '')
if not token or host not in ('https://us.i.posthog.com', 'https://eu.i.posthog.com'):
    raise SystemExit('Set POSTHOG_API_KEY and POSTHOG_API_HOST before building.')
if OUTPUT.exists():
    shutil.rmtree(OUTPUT)
OUTPUT.mkdir()
# Only public files enter the artifact. Never copy .env or Git history.
for name in ['index.html', 'pages.css', 'CNAME', 'robots.txt', 'sitemap.xml', 'images', 'assets', 'downloads', 'brag-book', 'track-your-wins', 'performance-review-accomplishments', 'privacy', 'terms', 'support']:
    source = ROOT / name
    if source.is_dir():
        shutil.copytree(source, OUTPUT / name)
    else:
        shutil.copy2(source, OUTPUT / name)
config = {'token': token, 'host': host}
(OUTPUT / 'assets/analytics-config.js').write_text('window.BRAG_ANALYTICS = ' + json.dumps(config) + ';\n')
(OUTPUT / '.nojekyll').touch()
print('Website built in dist/; analytics configuration generated from environment.')
