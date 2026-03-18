"""
Flask application for the social media scrubber with optional live data integration.

This application exposes an `/api/search` endpoint that aggregates posts from
various social platforms.  For demonstration it returns a dummy post when
no real data sources are configured.  To enable live data, set the
appropriate API credentials as environment variables; see individual
fetch functions for details.
"""

from flask import Flask, request, jsonify, render_template
from datetime import datetime
import os
import requests

app = Flask(
    __name__,
    static_url_path='/static',
    static_folder='static',
    template_folder='templates',
)


@app.route('/')
def index():
    """Render the main page."""
    return render_template('index.html')


def fetch_x_posts(keywords, follower_threshold, start_date, end_date):
    """Fetch recent posts from X (Twitter) using the v2 search API.

    Requires an environment variable ``X_BEARER_TOKEN`` containing a valid
    bearer token.  The search query is built by OR‑joining all keywords.
    Each result includes the author's follower count, taken from the
    ``public_metrics`` field on the user object【264735042976041†L1992-L1999】.

    Args:
        keywords (list[str]): search terms; an empty list skips the fetch.
        follower_threshold (int): minimum followers required.
        start_date, end_date (str or None): ISO date strings for filtering.

    Returns:
        list[dict]: posts with keys ``platform``, ``author``, ``followers``,
        ``content``, ``date``.
    """
    bearer_token = os.getenv('X_BEARER_TOKEN')
    if not bearer_token or not keywords:
        return []
    query = ' OR '.join([kw for kw in keywords if kw])
    url = 'https://api.twitter.com/2/tweets/search/recent'
    params = {
        'query': query,
        'max_results': 50,
        'tweet.fields': 'created_at,author_id,public_metrics',
        'expansions': 'author_id',
        'user.fields': 'username,name,public_metrics',
    }
    headers = {'Authorization': f'Bearer {bearer_token}'}
    try:
        resp = requests.get(url, params=params, headers=headers, timeout=10)
        if resp.status_code != 200:
            return []
        data = resp.json()
        users = {u['id']: u for u in data.get('includes', {}).get('users', [])}
        posts = []
        for tweet in data.get('data', []):
            user = users.get(tweet['author_id'])
            if not user:
                continue
            followers_count = user.get('public_metrics', {}).get('followers_count', 0)
            if follower_threshold and followers_count < follower_threshold:
                continue
            post_date = datetime.fromisoformat(tweet['created_at'].replace('Z', '+00:00'))
            if start_date:
                try:
                    start_dt = datetime.fromisoformat(start_date)
                    if post_date < start_dt:
                        continue
                except Exception:
                    pass
            if end_date:
                try:
                    end_dt = datetime.fromisoformat(end_date)
                    if post_date > end_dt:
                        continue
                except Exception:
                    pass
            posts.append({
                'platform': 'X',
                'author': user.get('username') or user.get('name'),
                'followers': followers_count,
                'content': tweet.get('text', ''),
                'date': tweet['created_at'],
            })
        return posts
    except Exception:
        return []


def fetch_google_results(keywords, follower_threshold, start_date, end_date):
    """Search Google Custom Search for the given keywords and return web results.

    This uses the Google Programmable Search Engine (Custom Search) API.  It
    expects two environment variables:

      - ``GOOGLE_API_KEY``: Google API key
      - ``GOOGLE_CSE_ID``: Custom search engine ID

    Date and follower thresholds are ignored for these results.  Returns
    a list of dictionaries similar to other fetch functions.
    """
    api_key = os.getenv('GOOGLE_API_KEY')
    cse_id = os.getenv('GOOGLE_CSE_ID')
    if not api_key or not cse_id or not keywords:
        return []
    query = ' '.join([kw for kw in keywords if kw])
    url = 'https://www.googleapis.com/customsearch/v1'
    params = {
        'q': query,
        'key': api_key,
        'cx': cse_id,
        'num': 10,
    }
    try:
        resp = requests.get(url, params=params, timeout=10)
        if resp.status_code != 200:
            return []
        data = resp.json()
        results = []
        for item in data.get('items', []):
            title = item.get('title', '')
            snippet = item.get('snippet', '')
            content = f"{title}: {snippet}".strip()
            link = item.get('link', '')
            results.append({
                'platform': 'Web',
                'author': item.get('displayLink', ''),
                'followers': 0,
                'content': content,
                'date': datetime.utcnow().isoformat() + 'Z',
                'url': link,
            })
        return results
    except Exception:
        return []


def fetch_instagram_posts(keywords, follower_threshold, start_date, end_date):
    """Placeholder for Instagram API integration."""
    # Implementation would call the Instagram Graph API using INSTAGRAM_ACCESS_TOKEN
    return []


def fetch_linkedin_posts(keywords, follower_threshold, start_date, end_date):
    """Placeholder for LinkedIn API integration."""
    return []


def fetch_tiktok_posts(keywords, follower_threshold, start_date, end_date):
    """Placeholder for TikTok API integration."""
    return []


def fetch_youtube_posts(keywords, follower_threshold, start_date, end_date):
    """Placeholder for YouTube API integration."""
    return []


@app.route('/api/search', methods=['POST'])
def search():
    """Handle search requests from the front‑end.

    JSON body keys:
      - keywords: list[str]
      - followerThreshold: int
      - platforms: list[str]
      - startDate: str or null
      - endDate: str or null

    Returns a JSON object with ``results``, a list of posts.  If no
    live integrations return data, a dummy post is provided so the UI
    remains functional.
    """
    data = request.get_json(force=True)
    keywords = data.get('keywords', [])
    follower_threshold = int(data.get('followerThreshold', 0))
    platforms = data.get('platforms', [])
    start_date = data.get('startDate')
    end_date = data.get('EndDate') if data.get('EndDate') else data.get('endDate')

    target_platforms = [p.lower() for p in platforms] if platforms else []
    results = []
    # Google search results (web) are always included if no platform filter or "web" is selected.
    if not target_platforms or 'web' in target_platforms:
        results.extend(fetch_google_results(keywords, follower_threshold, start_date, end_date))
    if not target_platforms or 'x' in target_platforms:
        results.extend(fetch_x_posts(keywords, follower_threshold, start_date, end_date))
    if not target_platforms or 'instagram' in target_platforms:
        results.extend(fetch_instagram_posts(keywords, follower_threshold, start_date, end_date))
    if not target_platforms or 'linkedin' in target_platforms:
        results.extend(fetch_linkedin_posts(keywords, follower_threshold, start_date, end_date))
    if not target_platforms or 'tiktok' in target_platforms:
        results.extend(fetch_tiktok_posts(keywords, follower_threshold, start_date, end_date))
    if not target_platforms or 'youtube' in target_platforms:
        results.extend(fetch_youtube_posts(keywords, follower_threshold, start_date, end_date))

    if not results:
        # Provide a placeholder result if no live data returned
        results = [
            {
                'platform': 'X',
                'author': 'DemoUser',
                'followers': 100000,
                'content': f'Example post about {keywords[0] if keywords else "topic"}.',
                'date': datetime.utcnow().isoformat() + 'Z',
            }
        ]
    return jsonify({'results': results})


if __name__ == '__main__':
    app.run(debug=True)