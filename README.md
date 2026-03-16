# Social Media Scrubber

This repository contains a prototype of a web‑based tool that allows users to search public social‑media posts by keywords/phrases and filter results by platform and minimum follower count.  It includes a simple Python back‑end (using Flask) and a static front‑end.

## Features

- **Keyword/phrase search:** Enter multiple phrases separated by commas or new lines.
- **Platform filters:** Select which platforms (e.g., X/Twitter, Instagram, TikTok, YouTube) to include in the search.
- **Minimum follower count:** Specify the minimum number of followers the post author should have.
- **Search modes:** Choose between exact phrase matching or keyword search.
- **Date range:** Optional start and end dates for filtering posts.
- **Modern interface:** The UI uses rounded buttons with a 2‑px border that is slightly darker than the button color.

## Running the application

1. Install Python 3.8+ and [pip](https://pip.pypa.io/en/stable/).
2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Run the server:

   ```bash
   python server.py
   ```

4. Open your browser at `http://127.0.0.1:5000/` to use the application.

The current version uses dummy data to simulate social‑media posts.  Integrating real social‑media APIs requires API keys and additional logic; see the accompanying report for guidance on how to connect to real data sources.
