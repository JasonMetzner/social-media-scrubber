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

  let dateChartInstance; // Chart.js instance for date-based chart
  let platformChartInstance; // Chart.js instance for platform distribution chart

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
    // Destroy existing charts if they exist
    if (dateChartInstance) {
      dateChartInstance.destroy();
      dateChartInstance = null;
    }
    if (platformChartInstance) {
      platformChartInstance.destroy();
      platformChartInstance = null;
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
    updateCharts(filtered);
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

  // Generate or update charts showing posts per date and posts per platform
  function updateCharts(posts) {
    // Destroy existing charts before drawing new ones
    if (dateChartInstance) {
      dateChartInstance.destroy();
      dateChartInstance = null;
    }
    if (platformChartInstance) {
      platformChartInstance.destroy();
      platformChartInstance = null;
    }
    if (!posts.length) {
      chartContainer.style.display = 'none';
      return;
    }

    // Compute counts per date
    const dateCounts = {};
    posts.forEach(post => {
      const date = post.date;
      dateCounts[date] = (dateCounts[date] || 0) + 1;
    });
    const dateLabels = Object.keys(dateCounts).sort();
    const dateData = dateLabels.map(label => dateCounts[label]);

    // Compute counts per platform
    const platformCounts = {};
    posts.forEach(post => {
      const platform = post.platform;
      platformCounts[platform] = (platformCounts[platform] || 0) + 1;
    });
    const platformLabels = Object.keys(platformCounts);
    const platformData = platformLabels.map(label => platformCounts[label]);

    // Colors for platforms chart (use color palette similar to CSS)
    const platformColors = [
      'rgba(78, 121, 167, 0.7)',  // Twitter
      'rgba(242, 142, 43, 0.7)', // Instagram
      'rgba(142, 186, 229, 0.7)', // TikTok (light blue)
      'rgba(227, 119, 194, 0.7)'  // YouTube (pink)
    ];

    const dateCtx = document.getElementById('dateChart').getContext('2d');
    dateChartInstance = new Chart(dateCtx, {
      type: 'bar',
      data: {
        labels: dateLabels,
        datasets: [{
          label: 'Posts by Date',
          data: dateData,
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

    const platformCtx = document.getElementById('platformChart').getContext('2d');
    platformChartInstance = new Chart(platformCtx, {
      type: 'doughnut',
      data: {
        labels: platformLabels,
        datasets: [{
          label: 'Posts by Platform',
          data: platformData,
          backgroundColor: platformColors.slice(0, platformLabels.length),
          borderColor: platformColors.slice(0, platformLabels.length).map(color => color.replace(/0\.7\)/, '1)')),
          borderWidth: 1
        }]
      },
      options: {
        plugins: {
          legend: {
            display: true,
            position: 'bottom'
          }
        }
      }
    });

    // Show chart container
    chartContainer.style.display = 'block';
  }

});
