// scisense/js/script.js

document.addEventListener('DOMContentLoaded', () => {
  const auth = window.auth;
  const db = window.db;

  // -----------------------------
  // 2. DOM Elements
  // -----------------------------

  // Discovery Modal Elements
  const signInButton = document.getElementById('sign-in-button');

  const discoveryModal = document.getElementById('discovery-modal');
  const closeModalSpan = discoveryModal.querySelector('.close-modal');
  const discoveryForm = document.getElementById('discovery-form');
  const discoveryLinkInput = document.getElementById('discovery-link');

      // Admin and User Action Buttons
  const submitNewPaperBtn = document.getElementById('submit-paper-btn');
  const addDiscoveryBtn = document.getElementById('add-discovery-btn');


  // Tabs and Categories
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');
  const categoriesDropdown = document.getElementById('categories-dropdown');

  // References to Search Input
  const searchInput = document.getElementById('search-input');

  // Search Container
  const searchContainer = document.getElementById('search-bar-container');

  // -----------------------------
  // 3. Modal Handling Functions
  // -----------------------------
  // Function to open a modal by adding 'active' class
  const openModal = (modal) => {
    if (modal) {
      modal.classList.add('active');
    }
  };

  // Function to close a modal by removing 'active' class
  const closeModalFn = (modal) => {
    if (modal) {
      modal.classList.remove('active');
    }
  };

  // Event Listeners for Close Buttons
  const closeButtons = document.querySelectorAll('.close-modal');
  closeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const modal = button.closest('.modal');
      closeModalFn(modal);
    });
  });

  // Close modals when clicking outside the modal content
  window.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal')) {
      closeModalFn(event.target);
    }
  });

    // -----------------------------
  // 4. Authentication State Handling
  // -----------------------------
  auth.onAuthStateChanged((user) => {
    if (user) {
      // User is signed in
      db.collection('users').doc(user.uid).get()
        .then((doc) => {
          if (doc.exists) {
            const userData = doc.data();
            signInButton.textContent = `Signed in as ${userData.name}`;

            if (userData.isAdmin) {
              // Show "Submit New Paper" and "Add Discovery" buttons for admins
              if (submitNewPaperBtn) submitNewPaperBtn.style.display = 'inline-block';
              if (addDiscoveryBtn) addDiscoveryBtn.style.display = 'inline-block';
            } else {
              // Show only "Add Discovery" button for regular users
              if (addDiscoveryBtn) addDiscoveryBtn.style.display = 'inline-block';
              if (submitNewPaperBtn) submitNewPaperBtn.style.display = 'none';
            }
          } else {
            // User document does not exist
            signInButton.textContent = `Signed in as ${user.email}`;
            // Hide both buttons
            if (submitNewPaperBtn) submitNewPaperBtn.style.display = 'none';
            if (addDiscoveryBtn) addDiscoveryBtn.style.display = 'none';
          }
        })
        .catch((error) => {
          console.error('Error fetching user data:', error);
          signInButton.textContent = `Signed in as ${user.email}`;
          // Hide both buttons in case of error
          if (submitNewPaperBtn) submitNewPaperBtn.style.display = 'none';
          if (addDiscoveryBtn) addDiscoveryBtn.style.display = 'none';
        });
    } else {
      // User is signed out
      signInButton.textContent = 'Sign In';
      // Hide both buttons
      if (submitNewPaperBtn) submitNewPaperBtn.style.display = 'none';
      if (addDiscoveryBtn) addDiscoveryBtn.style.display = 'none';
    }
  });

  // -----------------------------
  // 4. Handle Discovery Modal Submission
  // -----------------------------
  if (discoveryForm) {
    discoveryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const discoveryLink = discoveryLinkInput.value.trim();

      if (discoveryLink) {
        // Validate the URL
        const urlPattern = new RegExp('^(https?:\\/\\/)?' + // protocol
          '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
          '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
          '(\\:\\d+)?' + // port
          '(\\/[-a-z\\d%@_.~+&:]*)*' + // path
          '(\\?[;&a-z\\d%@_.,~+&:=-]*)?' + // query string
          '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator

        if (urlPattern.test(discoveryLink)) {
          // Open the discovery link in a new tab
          window.open(discoveryLink, '_blank');

          // Optionally, store the discovery in Firestore
          db.collection('discoveries').add({
            userId: auth.currentUser.uid,
            link: discoveryLink,
            addedAt: firebase.firestore.FieldValue.serverTimestamp()
          })
            .then(() => {
              alert('Scientific discovery added successfully!');
              closeModalFn(discoveryModal);
              discoveryForm.reset(); // Reset form fields
            })
            .catch((error) => {
              console.error('Error adding discovery:', error);
              alert('Failed to add discovery. Please try again.');
            });
        } else {
          alert('Please enter a valid URL.');
        }
      } else {
        alert('Discovery link cannot be empty.');
      }
    });
  }
    // -----------------------------
  // 5. Event Listeners for Action Buttons
  // -----------------------------
  // "Submit New Paper" Button (Admin Only)
  if (submitNewPaperBtn) {
    submitNewPaperBtn.addEventListener('click', () => {
      window.location.href = 'input_data.html';
    });
  }

  // "Add New Scientific Discovery" Button (Admin and Regular Users)
  if (addDiscoveryBtn) {
    addDiscoveryBtn.addEventListener('click', () => {
    	console.log("opening discovery modal:)");
      openModal(discoveryModal);
    });
  }

  // -----------------------------
  // 5. Debounce Function Implementation
  // -----------------------------
  /**
   * Creates a debounced version of the provided function.
   * @param {Function} func - The function to debounce.
   * @param {number} delay - The debounce delay in milliseconds.
   * @returns {Function} - The debounced function.
   */
  function debounce(func, delay) {
    let debounceTimer;
    return function () {
      const context = this;
      const args = arguments;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => func.apply(context, args), delay);
    };
  }

  // -----------------------------
  // 6. Tab Switching Functionality
  // -----------------------------
  // Function to get the currently active tab
  function getActiveTab() {
    const activeTab = document.querySelector('.tab.active');
    return activeTab ? activeTab.getAttribute('data-tab') : null;
  }

  // Event Listeners for Tab Buttons
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove 'active' class from all tabs
      tabs.forEach(t => t.classList.remove('active'));

      // Add 'active' class to the clicked tab
      tab.classList.add('active');

      // Hide all tab-content divs
      tabContents.forEach(content => content.style.display = 'none');

      // Show the corresponding tab-content div
      const target = tab.getAttribute('data-tab');
      const targetContent = document.getElementById(target);
      if (targetContent) {
        targetContent.style.display = 'block';
      }

      // Handle the visibility of the global categories dropdown and search bar
      if (target === 'leaderboard') {
        categoriesDropdown.style.display = 'none';
        if (searchContainer) {
          searchContainer.style.display = 'none'; // Hide search bar
        }
      } else {
        categoriesDropdown.style.display = 'inline-block'; // Adjust as per your design
        if (searchContainer) {
          searchContainer.style.display = 'block'; // Show search bar
        }
      }

      // Get the current search query
      const currentQuery = searchInput.value.trim().toLowerCase();

      // Get the selected category
      const selectedCategory = categoriesDropdown.value === 'all' ? 'all' : categoriesDropdown.value;

      // Trigger the appropriate function based on the active tab
      if (target === 'trending') {
        displayPapers(selectedCategory, currentQuery);
      } else if (target === 'most-discussed') {
        displayMostDiscussed(selectedCategory, currentQuery);
      }
      // Leaderboard is handled separately in leaderboard.js
    });
  });

  // -----------------------------
  // 7. Category Dropdown Filtering
  // -----------------------------
  if (categoriesDropdown) {
    categoriesDropdown.addEventListener('change', () => {
      const selectedCategory = categoriesDropdown.value === 'all' ? 'all' : categoriesDropdown.value;
      const activeTab = getActiveTab();

      // Get the current search query
      const currentQuery = searchInput.value.trim().toLowerCase();

      if (activeTab === 'trending') {
        displayPapers(selectedCategory, currentQuery);
      } else if (activeTab === 'most-discussed') {
        displayMostDiscussed(selectedCategory, currentQuery);
      }
      // Leaderboard is handled separately
    });
  }

  // -----------------------------
  // 8. Search Input Event Listener with Debounce
  // -----------------------------
  if (searchInput) {
    searchInput.addEventListener('input', debounce(() => {
      const query = searchInput.value.trim().toLowerCase();
      const activeTab = getActiveTab();
      const selectedCategory = categoriesDropdown.value === 'all' ? 'all' : categoriesDropdown.value;

      if (activeTab === 'trending') {
        displayPapers(selectedCategory, query);
      } else if (activeTab === 'most-discussed') {
        displayMostDiscussed(selectedCategory, query);
      }
      // No action needed for Leaderboard
    }, 300)); // 300ms debounce delay
  }
  // -----------------------------
  // 9. Functions to Display Papers
  // -----------------------------
  /**
   * Fetches and displays Trending papers based on category and search query.
   * @param {string} category - Selected category filter.
   * @param {string} query - Search query.
   */
  function displayPapers(category = 'all', query = '') {
    console.log('Fetching Trending papers from Firestore...');
    const contentList = document.getElementById('content-list');
    let loadingMessage = document.getElementById('loading-message');

    // Clear existing listener to prevent multiple listeners
    if (displayPapers.unsubscribe) {
      displayPapers.unsubscribe();
    }

    let queryRef = db.collection('papers').orderBy('submittedAt', 'desc');

    // Apply category filter if not 'all'
    if (category !== 'all') {
      queryRef = queryRef.where('category', '==', category);
    }

  	displayPapers.unsubscribe = queryRef.onSnapshot((snapshot) => {
    if (snapshot.empty) {
    	contentList.innerHTML = '';
      // If loadingMessage exists, update its content
      if (loadingMessage) {
        loadingMessage.textContent = 'No papers matched that criteria.';
        loadingMessage.style.display = 'block';
      } else if (contentList) {
        // If loadingMessage doesn't exist, create it
        loadingMessage = document.createElement('p');
        loadingMessage.id = 'loading-message';
        loadingMessage.textContent = 'No papers matched that criteria.';
        loadingMessage.style.display = 'block';
        loadingMessage.style.textAlign = 'center'; // Optional: Center the message
        loadingMessage.style.marginTop = '20px'; // Optional: Add top margin
        contentList.appendChild(loadingMessage);

      }
      // Clear any previously stored list since there are no papers
      localStorage.removeItem('displayedPapers');
      
      return;
    }

      if (loadingMessage) {
        loadingMessage.style.display = 'none';
      }

      // Initial rendering of the papers
      updatePaperList(snapshot.docs, query, category, contentList, 'trending');

      // After updating the paper list, extract the displayed paper IDs
      // We'll assume that each paper item has a link to `paper.html?id=paperId`
      const paperLinks = contentList.querySelectorAll('.paper-item a');

      // Extract the 'id' parameter from each link's href
      const displayedPaperIds = Array.from(paperLinks).map(link => {
        const url = new URL(link.href, window.location.origin);
        return url.searchParams.get('id');
      }).filter(id => id !== null); // Ensure no null values
      console.log('Displayed Paper IDs Stored:', displayedPaperIds);
      // Store the list of displayed paper IDs in localStorage
      // This list will be used by paper.js to determine Previous and Next articles
      localStorage.setItem('displayedPapers', JSON.stringify(displayedPaperIds));

    }, (error) => {
      console.error('Error fetching Trending papers:', error);
      if (contentList) {
        contentList.innerHTML = '<p>Error loading papers.</p>';
      }
    });
  }

  /**
   * Fetches and displays Most Discussed papers based on category and search query.
   * @param {string} category - Selected category filter.
   * @param {string} query - Search query.
   */
  function displayMostDiscussed(category = 'all', query = '') {
    console.log('Fetching Most Discussed papers from Firestore...');
    const contentList = document.getElementById('content-list-discussed');
    const loadingMessage = document.getElementById('loading-message-discussed');

    // Clear existing listener to prevent multiple listeners
    if (displayMostDiscussed.unsubscribe) {
      displayMostDiscussed.unsubscribe();
    }

    let queryRef = db.collection('papers').orderBy('commentsCount', 'desc');

    // Apply category filter if not 'all'
    if (category !== 'all') {
      queryRef = queryRef.where('category', '==', category);
    }

    displayMostDiscussed.unsubscribe = queryRef.onSnapshot((snapshot) => {
      if (snapshot.empty) {
        if (loadingMessage) {
          loadingMessage.textContent = 'No papers available at the moment.';
          loadingMessage.style.display = 'block';
        }
        if (contentList) {
          contentList.innerHTML = '';
          contentList.appendChild(loadingMessage);
        }
        return;
      }

      if (loadingMessage) {
        loadingMessage.style.display = 'none';
      }

      // Initial rendering of the papers
      updatePaperList(snapshot.docs, query, category, contentList, 'most-discussed');
    }, (error) => {
      console.error('Error fetching Most Discussed papers:', error);
      if (contentList) {
        contentList.innerHTML = '<p>Error loading papers.</p>';
      }
    });
  }

  /**
   * Updates the paper list in the DOM based on the provided documents, search query, and category.
   * @param {Array} docs - Array of Firestore documents.
   * @param {string} query - Search query.
   * @param {string} category - Selected category filter.
   * @param {HTMLElement} contentList - The container to display the papers.
   * @param {string} tabType - The current active tab ('trending' or 'most-discussed').
   */
  function updatePaperList(docs, query, category, contentList, tabType) {
    if (!contentList) return;
    contentList.innerHTML = ''; // Clear the current list

    // Filter the papers based on the query and category
    const filteredDocs = docs.filter((doc) => {
      const paper = doc.data();
      const title = (paper.title || '').toLowerCase();
      const news = (paper.news || '').toLowerCase();
      const authors = (paper.authors || '').toLowerCase();
      const tags = (paper.tags || []).map(tag => tag.toLowerCase()).join(', ');
      const paperCategory = (paper.category || '').toLowerCase(); 

      // Check if the query matches the title, authors, or tags
      const matchesQuery =
        title.includes(query) ||
        news.includes(query) ||
        authors.includes(query) ||
        tags.includes(query);

      // Check if the paper matches the selected category
      const matchesCategory = (category === 'all') || (paperCategory === category.toLowerCase());

      return matchesQuery && matchesCategory;
    });

    // Display filtered papers
    filteredDocs.forEach((doc, index) => {
      const paper = doc.data();
      const paperId = doc.id;

      // Create paper-item div
      const paperItem = document.createElement('div');
      paperItem.classList.add('paper-item');

      // Number
      const numberSpan = document.createElement('span');
      numberSpan.classList.add('number');
      numberSpan.textContent = `${index + 1}.`;
      paperItem.appendChild(numberSpan);

      // Title with link
      const titleH3 = document.createElement('h3');
      titleH3.classList.add('paper-title');
      const titleLink = document.createElement('a');
      titleLink.href = `paper.html?id=${paperId}`;
      titleLink.textContent = paper.title ? paper.title : 'Untitled Paper';
      titleH3.appendChild(titleLink);
      paperItem.appendChild(titleH3);

      // Paper Info
      const infoP = document.createElement('p');
      infoP.classList.add('paper-info');
      const authorsText = paper.authors ? paper.authors : 'Unknown Authors';

      // Handling the 'date' field
      let formattedDate = 'N/A';
      if (paper.date && paper.date.toDate) {
        try {
          formattedDate = paper.date.toDate().toLocaleDateString();
        } catch (error) {
          console.error('Error formatting date:', error);
        }
      }
      infoP.textContent = `${authorsText} • ${formattedDate}`;
      paperItem.appendChild(infoP);

      // Category Tag
      const categorySpan = document.createElement('span');
      categorySpan.classList.add('category-tag');
      categorySpan.textContent =
        paper.tags && paper.tags.length > 0
          ? paper.tags.join(', ')
          : 'No Category';
      paperItem.appendChild(categorySpan);

      // Engagement (Comments Count)
      const engagementSpan = document.createElement('span');
      engagementSpan.classList.add('engagement');
      const commentsCount =
        typeof paper.commentsCount === 'number' ? paper.commentsCount : 0;
      engagementSpan.textContent = `${commentsCount} Comments`;
      paperItem.appendChild(engagementSpan);

      // Append the paper-item to content-list
      contentList.appendChild(paperItem);
    });

    // If no results are found
    if (filteredDocs.length === 0) {
      contentList.innerHTML = '<p>No papers match your search and selected category.</p>';
    }
  }

  // -----------------------------
  // 10. Initialize Default Tab and Content
  // -----------------------------
  // On page load, ensure the active tab's content is displayed
  const initialActiveTab = getActiveTab();
  const initialCategory = categoriesDropdown.value === 'all' ? 'all' : categoriesDropdown.value;

  if (initialActiveTab === 'trending') {
    displayPapers(initialCategory, searchInput.value.trim().toLowerCase());
  } else if (initialActiveTab === 'most-discussed') {
    displayMostDiscussed(initialCategory, searchInput.value.trim().toLowerCase());
  }
  // Leaderboard is handled separately in leaderboard.js
});
