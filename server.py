from flask import Flask, request, jsonify, render_template
from datetime import datetime

app = Flask(__name__, static_url_path='/static', static_folder='static', template_folder='templates')


@app.route('/')
def index():
    """Render the main page."""
    return render_template('index.html')


@app.route('/api/search', methods=['POST'])
def search():
    """Handle search requests.

    The client sends a JSON body with keys:
    - keywords: list of strings
    - followerThreshold: integer
    - platforms: list of strings
    - phraseMode: 'exact' or 'keyword'
    - startDate: ISO date string or null
    - endDate: ISO date string or null

    This function returns dummy data for demonstration.  In a real application,
    you would integrate with social‑media APIs or commercial data providers.
    """
    data = request.get_json(force=True)
    keywords = data.get('keywords', [])
    follower_threshold = int(data.get('followerThreshold', 0))
    platforms = data.get('platforms', [])
    phrase_mode = data.get('phraseMode', 'exact')
    start_date = data.get('startDate')
    end_date = data.get('EndDate') if data.get('EndDate') else data.get('endDate')

    # Simulated posts for demonstration
    dummy_posts = [
        {
            "platform": "X",
            "author": "InfluencerA",
            "followers": 50000,
            "content": f"Example post about {keywords[0] if keywords else 'topic'}.",
            "date": "2026-03-15T10:00:00Z",
        },
        {
            "platform": "TikTok",
            "author": "CreatorB",
            "followers": 200000,
            "content": f"Another {phrase_mode} mention: {keywords[0] if keywords else 'topic'} goes viral.",
            "date": "2026-03-14T14:20:00Z",
        },
    ]

    # Filter by platform and follower threshold
    results = []
    for post in dummy_posts:
        if follower_threshold and post['followers'] < follower_threshold:
            continue
        if platforms and post['platform'] not in platforms:
            continue
        # Filter by dates (if provided)
        post_date = datetime.fromisoformat(post['date'].replace('Z', '+00:00'))
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
        results.append(post)

    return jsonify({"results": results})


if __name__ == '__main__':
    app.run(debug=True)
