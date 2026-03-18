// Main JavaScript for the social media scrubber dashboard
// Provides dataset, filtering logic, chart generation and saving functionality

document.addEventListener('DOMContentLoaded', function() {
  /**
   * Dataset of social posts from various platforms. Each entry represents
   * a post or news item with metadata such as platform, author, follower
   * count, textual content, publication date, and a source URL when
   * available. Posts within the last 30 days (relative to 2026-03-17)
   * from notable U.S. entities have been included for demonstration.
   */
  const dummyPosts = [
    // AI‑related news and announcements (March 2026)
    {
      platform: 'Twitter',
      author: 'Social Media Today',
      followersCount: 200000,
      content: 'X is working on pre‑share alerts for AI‑generated content to reduce misinformation.',
      date: '2026-03-16',
      url: 'https://www.socialmediatoday.com/news/x-formerly-twitter-tests-ai-content-alerts-in-stream/814889/'
    },
    {
      platform: 'Twitter',
      author: 'Social Media Today',
      followersCount: 200000,
      content: 'X adds simplified AI video generation from multiple images with Grok, allowing up to seven images.',
      date: '2026-03-15',
      url: 'https://www.socialmediatoday.com/news/x-formerly-twitter-enables-multi-image-input-grok-video-generation/814767/'
    },
    {
      platform: 'MarketingProfs',
      author: 'MarketingProfs',
      followersCount: 300000,
      content: 'Criteo becomes the first ad tech partner in OpenAI’s ChatGPT advertising pilot, signalling the rise of conversational ads.',
      date: '2026-03-06',
      url: 'https://www.marketingprofs.com/opinions/2026/54379/ai-update-march-6-2026-ai-news-and-views-from-the-past-week'
    },
    {
      platform: 'MarketingProfs',
      author: 'MarketingProfs',
      followersCount: 300000,
      content: 'Google expands its AI Mode Canvas tool to all U.S. users, enabling document drafting and coding directly in search.',
      date: '2026-03-06',
      url: 'https://www.marketingprofs.com/opinions/2026/54379/ai-update-march-6-2026-ai-news-and-views-from-the-past-week'
    },
    {
      platform: 'BusinessOfGovernment',
      author: 'IBM Center for the Business of Government',
      followersCount: 150000,
      content: 'The White House releases a national cybersecurity strategy that prioritizes AI and quantum technologies to strengthen U.S. defenses.',
      date: '2026-03-13',
      url: 'https://www.businessofgovernment.org/blog/weekly-roundup-march-9-13-2026'
    },
    {
      platform: 'BusinessOfGovernment',
      author: 'IBM Center for the Business of Government',
      followersCount: 150000,
      content: 'DOE and Dell unveil the Doudna supercomputer mission to accelerate AI‑driven scientific discovery.',
      date: '2026-03-13',
      url: 'https://www.businessofgovernment.org/blog/weekly-roundup-march-9-13-2026'
    },
    {
      platform: 'LinkedIn',
      author: 'Sundar Pichai',
      followersCount: 800000,
      content: 'Excited to announce that Google’s AI Mode Canvas is now available to all U.S. users, unlocking creative and coding possibilities.',
      date: '2026-03-06',
      url: 'https://www.linkedin.com/company/google/'
    },
    {
      platform: 'LinkedIn',
      author: 'IBM Research',
      followersCount: 200000,
      content: 'Proud to support the DOE’s new Doudna supercomputer – a leap forward for AI‑powered research and national infrastructure.',
      date: '2026-03-12',
      url: 'https://www.linkedin.com/company/ibm/'
    },
    // Additional demonstration posts on climate/technology to illustrate filtering
    { platform: 'Twitter', author: 'User1', followersCount: 15000, content: 'Climate protest in New York', date: '2026-03-10', url: '' },
    { platform: 'Instagram', author: 'InfluencerA', followersCount: 50000, content: 'New regulation on environmental issues', date: '2026-03-08', url: '' },
    { platform: 'TikTok', author: 'Creator88', followersCount: 8000, content: 'Climate protest goes viral', date: '2026-03-05', url: '' },
    { platform: 'YouTube', author: 'ChannelX', followersCount: 200000, content: 'Discussion about climate protest and new regulation', date: '2026-03-01', url: '' },
    { platform: 'Twitter', author: 'Journalist', followersCount: 120000, content: 'Breaking: new regulation announced', date: '2026-03-12', url: '' },
    { platform: 'Instagram', author: 'EcoWarrior', followersCount: 3500, content: 'Protest for climate action in LA', date: '2026-03-02', url: '' },
    { platform: 'TikTok', author: 'DanceStar', followersCount: 30000, content: 'Climate protests dance challenge', date: '2026-03-15', url: '' },
    { platform: 'YouTube', author: 'NewsChannel', followersCount: 1000000, content: 'In-depth analysis on new regulation and climate protests', date: '2026-03-11', url: '' },
    // Additional posts on varied topics (cow, money, and political funding) for demonstration
    {
      platform: 'Instagram',
      author: 'Green Mobile Vet Services',
      followersCount: 5500,
      content: 'FUN FACT: Every cow on earth is a closed CO₂ loop. Herbivores do not create additional CO₂ or methane. Cattle harvest CO₂ from the air via the grass they eat and return it to the soil and sky; there is nothing left over to threaten the planet.',
      date: '2026-03-16',
      url: 'https://www.instagram.com/p/DV8zogFFUAE/'
    },
    {
      platform: 'Instagram',
      author: 'Jeawok Media',
      followersCount: 10000,
      content: 'Reports say a “dark money” political group has been contacting social media influencers and offering payments to post negative content about Gen Z candidate Kat Abughazaleh, raising concerns about transparency in political messaging.',
      date: '2026-03-13',
      url: 'https://www.instagram.com/reel/DV2FsyFCScL/'
    },
    {
      platform: 'News',
      author: 'Competition and Consumer Protection Commission',
      followersCount: 1000,
      content: 'One in three post‑primary students now learn about money on social media, and one in seven feel uncomfortable asking for help with money questions, according to MABS research presented at a CCPC event during Global Money Week.',
      date: '2026-03-11',
      url: 'https://www.ccpc.ie/consumers/2026/03/11/one-in-three-young-people-now-learn-about-money-on-social-media-with-tiktok-most-popular/'
    }
  ];

  let dateChartInstance = null;
  let platformChartInstance = null;

  const searchForm = document.getElementById('search-form');
  const resultsContainer = document.getElementById('results');
  const chartContainer = document.getElementById('chart-container');
  const clearButton = document.getElementById('clear-button');

  // Initialize custom platform select dropdown
  const platformWrapper = document.getElementById('platform-select-wrapper');
  if (platformWrapper) {
    const selectedDiv = platformWrapper.querySelector('.select-selected');
    const optionsList = platformWrapper.querySelector('.select-items');
    const hiddenSelect = document.getElementById('platform-select');
    // Toggle dropdown when selected area is clicked
    selectedDiv.addEventListener('click', function(e) {
      e.stopPropagation();
      // Close other custom selects if necessary (only one in this page)
      optionsList.classList.toggle('select-hide');
      selectedDiv.classList.toggle('open');
    });
    // Option click handler
    optionsList.addEventListener('click', function(e) {
      const li = e.target.closest('li');
      if (!li) return;
      const value = li.getAttribute('data-value');
      const text = li.textContent;
      selectedDiv.textContent = text;
      hiddenSelect.value = value;
      optionsList.classList.add('select-hide');
      selectedDiv.classList.remove('open');
    });
    // Close dropdown when clicking outside
    document.addEventListener('click', function() {
      optionsList.classList.add('select-hide');
      selectedDiv.classList.remove('open');
    });
  }

  // Form submission triggers search
  searchForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    await performSearch();
  });

  // Clear button resets the form and hides results/charts
  clearButton.addEventListener('click', function() {
    searchForm.reset();
    resultsContainer.innerHTML = '';
    chartContainer.style.display = 'none';
    if (dateChartInstance) {
      dateChartInstance.destroy();
      dateChartInstance = null;
    }
    if (platformChartInstance) {
      platformChartInstance.destroy();
      platformChartInstance = null;
    }
  });

  /**
   * Perform filtering based on current form values and update the UI.
   */
  async function performSearch() {
    // Collect search parameters from form
    const keywordsInput = document.getElementById('keywords').value.trim();
    const keywords = keywordsInput
      ? keywordsInput.split(/[\n,]+/).map(k => k.trim()).filter(Boolean)
      : [];
    const platformSelect = document.getElementById('platform-select');
    const selectedValue = platformSelect.value;
    const selectedPlatforms = selectedValue ? [selectedValue] : [];
    const followerThreshold = parseInt(document.getElementById('follower-threshold').value, 10) || 0;
    const searchMode = document.getElementById('search-mode').value;
    const startDate = document.getElementById('start-date').value || null;
    const endDate = document.getElementById('end-date').value || null;
    // Build payload for API
    const payload = {
      keywords,
      followerThreshold,
      platforms: selectedPlatforms,
      searchMode,
      startDate,
      endDate
    };
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();
      // Support both array and {posts: []} shapes
      const posts = Array.isArray(data) ? data : data.posts || [];
      if (posts.length) {
        renderResults(posts);
        updateCharts(posts);
        return;
      }
    } catch (error) {
      console.error('Error fetching from API:', error);
    }
    // Fallback to local filtering of dummy posts if API fails or returns no posts
    const filtered = dummyPosts.filter(post => {
      // Platform filter
      if (selectedPlatforms.length && !selectedPlatforms.includes(post.platform)) return false;
      // Follower threshold
      if (post.followersCount < followerThreshold) return false;
      // Date range filter
      if (startDate && new Date(post.date) < new Date(startDate)) return false;
      if (endDate && new Date(post.date) > new Date(endDate)) return false;
      // Keyword filter
      if (keywords.length) {
        const content = post.content.toLowerCase();
        const tokenSet = new Set();
        keywords.forEach(keyword => {
          const lowerPhrase = keyword.toLowerCase().trim();
          if (lowerPhrase) tokenSet.add(lowerPhrase);
          lowerPhrase.split(/\s+/).forEach(word => {
            const lw = word.toLowerCase();
            if (lw && (lw.length > 2 || lw === 'ai')) tokenSet.add(lw);
          });
        });
        const tokens = Array.from(tokenSet);
        if (!tokens.length) return true;
        if (searchMode === 'any') {
          return tokens.some(token => content.includes(token));
        } else {
          return tokens.every(token => content.includes(token));
        }
      }
      return true;
    });
    renderResults(filtered);
    updateCharts(filtered);
  }

  /**
   * Render the filtered posts as cards with save functionality.
   * @param {Array} posts The list of posts to render
   */
  function renderResults(posts) {
    resultsContainer.innerHTML = '';
    if (!posts.length) {
      resultsContainer.innerHTML = '<p>No posts found.</p>';
      return;
    }
    posts.forEach(post => {
      const card = document.createElement('div');
      card.className = 'post-card';
      const actions = document.createElement('div');
      actions.className = 'post-actions';
      // Save button
      const saveBtn = document.createElement('button');
      saveBtn.textContent = 'Save';
      saveBtn.className = 'save';
      saveBtn.addEventListener('click', function() {
        savePost(post);
      });
      actions.appendChild(saveBtn);
      // Build card HTML
      const urlLink = post.url ? `<a href="${post.url}" target="_blank">Source</a>` : '';
      card.innerHTML = `
        <div class="post-platform">${post.platform}</div>
        <div class="post-author">${post.author}${post.followersCount ? ' – ' + post.followersCount.toLocaleString() + ' followers' : ''}</div>
        <div class="post-content">${post.content}</div>
        ${urlLink ? `<div>${urlLink}</div>` : ''}
        <div class="post-date">${post.date}</div>
      `;
      card.appendChild(actions);
      resultsContainer.appendChild(card);
    });
  }

  /**
   * Save a post to localStorage under a platform‑specific key. Duplicate
   * entries (based on content and date) are ignored to prevent
   * multiple saves of the same post.
   * @param {Object} post The post to save
   */
  function savePost(post) {
    const key = 'saved_' + post.platform.toLowerCase();
    const saved = JSON.parse(localStorage.getItem(key) || '[]');
    // Check for duplicate
    const exists = saved.some(item => item.content === post.content && item.date === post.date);
    if (!exists) {
      saved.push(post);
      localStorage.setItem(key, JSON.stringify(saved));
      alert('Post saved to ' + post.platform + '!');
    } else {
      alert('Post already saved.');
    }
  }

  /**
   * Generate or update the bar and doughnut charts based on filtered posts.
   * @param {Array} posts The posts to summarise
   */
  function updateCharts(posts) {
    // Clean up any existing charts
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
    // Count by date
    const dateCounts = {};
    posts.forEach(post => {
      dateCounts[post.date] = (dateCounts[post.date] || 0) + 1;
    });
    const dateLabels = Object.keys(dateCounts).sort();
    const dateData = dateLabels.map(label => dateCounts[label]);
    // Count by platform
    const platformCounts = {};
    posts.forEach(post => {
      platformCounts[post.platform] = (platformCounts[post.platform] || 0) + 1;
    });
    const platformLabels = Object.keys(platformCounts);
    const platformData = platformLabels.map(label => platformCounts[label]);
    // Colors for up to five platforms (Twitter, Instagram, TikTok, YouTube, LinkedIn, etc.)
    const palette = [
      'rgba(59, 130, 246, 0.6)',  // Blue
      'rgba(239, 68, 68, 0.6)',   // Red
      'rgba(16, 185, 129, 0.6)',  // Green
      'rgba(251, 191, 36, 0.6)',  // Yellow
      'rgba(139, 92, 246, 0.6)'   // Purple for LinkedIn/others
    ];
    const borderPalette = palette.map(color => color.replace(/0\.6/, '1'));
    // Date bar chart
    const dateCtx = document.getElementById('dateChart').getContext('2d');
    dateChartInstance = new Chart(dateCtx, {
      type: 'bar',
      data: {
        labels: dateLabels,
        datasets: [{
          label: 'Posts by Date',
          data: dateData,
          backgroundColor: 'rgba(59, 130, 246, 0.6)',
          borderColor: 'rgba(59, 130, 246, 1)',
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
          legend: { display: false }
        }
      }
    });
    // Platform doughnut chart
    const platformCtx = document.getElementById('platformChart').getContext('2d');
    platformChartInstance = new Chart(platformCtx, {
      type: 'doughnut',
      data: {
        labels: platformLabels,
        datasets: [{
          label: 'Posts by Platform',
          data: platformData,
          backgroundColor: palette.slice(0, platformLabels.length),
          borderColor: borderPalette.slice(0, platformLabels.length),
          borderWidth: 1
        }]
      },
      options: {
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              color: '#E5E7EB'
            }
          }
        }
      }
    });
    chartContainer.style.display = 'block';
  }
});