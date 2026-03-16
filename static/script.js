document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('search-form');
  const resultsDiv = document.getElementById('results');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Collect keywords (split by comma or newline)
    const keywordsInput = document.getElementById('keywords').value.trim();
    const keywords = keywordsInput
      .split(/\n|,/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    // Follower threshold
    const followerValue = document.getElementById('followers').value;
    const followerThreshold = followerValue ? parseInt(followerValue, 10) : 0;

    // Selected platforms
    const platformInputs = document.querySelectorAll('input[name="platforms"]:checked');
    const platforms = Array.from(platformInputs).map((el) => el.value);

    // Search mode
    const modeInput = document.querySelector('input[name="mode"]:checked');
    const phraseMode = modeInput ? modeInput.value : 'exact';

    // Dates
    const startDate = document.getElementById('start-date').value || null;
    const endDate = document.getElementById('end-date').value || null;

    const payload = {
      keywords: keywords,
      followerThreshold: followerThreshold,
      platforms: platforms,
      phraseMode: phraseMode,
      startDate: startDate,
      endDate: endDate,
    };

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      displayResults(data.results || []);
    } catch (error) {
      console.error('Error fetching results', error);
      resultsDiv.innerHTML = '<p>There was an error fetching results.</p>';
    }
  });

  function displayResults(results) {
    resultsDiv.innerHTML = '';
    if (results.length === 0) {
      resultsDiv.innerHTML = '<p>No results found.</p>';
      return;
    }
    results.forEach((post) => {
      const card = document.createElement('div');
      card.className = 'post-card';
      const postDate = new Date(post.date);
      card.innerHTML = `
        <div class="post-platform">${post.platform}</div>
        <div class="post-author">${post.author} – ${post.followers.toLocaleString()} followers</div>
        <div class="post-content">${post.content}</div>
        <div class="post-date">${postDate.toLocaleString()}</div>
      `;
      resultsDiv.appendChild(card);
    });
  }
});
