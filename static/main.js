// Main JavaScript for the social media scrubber dashboard
// Contains a dummy dataset and client-side filtering + chart generation

document.addEventListener('DOMContentLoaded', function() {
  // Dummy posts dataset for demonstration purposes. In a production
  // environment, this would be replaced with results from a backend API.
  const dummyPosts = [
    { platform: 'Twitter', author: 'User1', followersCount: 15000, content: 'Climate protest in New York', date: '2026-03-10' },
    { platform: 'Instagram', author: 'InfluencerA', followersCount: 50000, content: 'New regulation on environmental issues', date: '2026-03-08' },
    { platform: 'TikTok', author: 'Creator88', followersCount: 8000, content: 'climate protest goes viral', date: '2026-03-05' },
    { platform: 'YouTube', author: 'ChannelX', followersCount: 200000, content: 'Discussion about climate protest and new regulation', date: '2026-03-01' },
    { platform: 'Twitter', author: 'Journalist', followersCount: 120000, content: 'Breaking: new regulation announced', date: '2026-03-12' },
    { platform: 'Instagram', author: 'EcoWarrior', followersCount: 3500, content: 'Protest for climate action in LA', date: '2026-03-02' },
    { platform: 'TikTok', author: 'DanceStar', followersCount: 30000, content: 'Climate protests dance challenge', date: '2026-03-15' },
    { platform: 'YouTube', author: 'NewsChannel', followersCount: 1000000, content: 'In-depth analysis on new regulation and climate protests', date: '2026-03-11' }
  ];

  let chart; // reference to Chart.js instance

  const searchForm = document.getElementById('search-form');
  const resultsContainer = document.getElementById('results');
  const chartContainer = document.getElementById('chart-container');
  const clearButton = document.getElementById('clear-button');

  // Handle form submission
  searchForm.addEventListener('submit', function(e) {
    e.preventDefault();
    performSearch();
  });

  // Clear button resets the form and hides results
  clearButton.addEventListener('click', function() {
    searchForm.reset();
    resultsContainer.innerHTML = '';
    chartContainer.style.display = 'none';
    if (chart) {
      chart.destroy();
      chart = null;
    }
  });

  function performSearch() {
    const keywordsInput = document.getElementById('keywords').value.trim();
    // Split keywords by comma or newlines
    const keywords = keywordsInput.split(/[\n,]+/).map(k => k.trim()).filter(Boolean);

    const platformSelect = document.getElementById('platform-select');
    const platforms = Array.from(platformSelect.selectedOptions).map(opt => opt.value);

    const followerThreshold = parseInt(document.getElementById('follower-threshold').value) || 0;

    const searchMode = document.getElementById('search-mode').value;

    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;

    // Filter dummy posts based on selected criteria
    const filtered = dummyPosts.filter(post => {
      // Filter by platforms
      if (platforms.length && !platforms.includes(post.platform)) return false;
      // Filter by follower count
      if (post.followersCount < followerThreshold) return false;
      // Filter by date range
      if (startDate && new Date(post.date) < new Date(startDate)) return false;
      if (endDate && new Date(post.date) > new Date(endDate)) return false;
      // Filter by keywords
      if (keywords.length) {
        const content = post.content.toLowerCase();
        if (searchMode === 'exact') {
          // At least one keyword must be present in the content
          return keywords.some(keyword => content.includes(keyword.toLowerCase()));
        } else {
          // All keywords must be present in the content
          return keywords.every(keyword => content.includes(keyword.toLowerCase()));
        }
      }
      return true;
    });

    renderResults(filtered);
    updateChart(filtered);
  }

  // Render a list of post cards under the results container
  function renderResults(posts) {
    resultsContainer.innerHTML = '';
    if (!posts.length) {
      resultsContainer.innerHTML = '<p>No posts found.</p>';
      return;
    }
    posts.forEach(post => {
      const card = document.createElement('div');
      card.className = 'post-card';
      card.innerHTML = `
        <div class="post-platform">${post.platform}</div>
        <div class="post-author">${post.author} – ${post.followersCount.toLocaleString()} followers</div>
        <div class="post-content">${post.content}</div>
        <div class="post-date">${post.date}</div>
      `;
      resultsContainer.appendChild(card);
    });
  }

  // Generate or update a bar chart showing the number of posts per date
  function updateChart(posts) {
    // Destroy any existing chart before creating a new one
    if (chart) {
      chart.destroy();
      chart = null;
    }
    if (!posts.length) {
      chartContainer.style.display = 'none';
      return;
    }
    // Compute the count of posts per date
    const counts = {};
    posts.forEach(post => {
      const date = post.date;
      counts[date] = (counts[date] || 0) + 1;
    });
    const labels = Object.keys(counts).sort();
    const data = labels.map(label => counts[label]);
    const ctx = document.getElementById('postsChart').getContext('2d');
    chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Number of Posts',
          data: data,
          backgroundColor: 'rgba(78, 121, 167, 0.5)',
          borderColor: 'rgba(59, 92, 131, 1)',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
    chartContainer.style.display = 'block';
  }

});
