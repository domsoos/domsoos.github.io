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

  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
      if (!hamburger || !navLinks) {
      	console.log();
      	return;
      } 

      function toggleNav() {
        navLinks.classList.toggle('open');
        hamburger.innerHTML = navLinks.classList.contains('open') ? '&#10005;' : '&#9776;';
        hamburger.setAttribute('aria-expanded', navLinks.classList.contains('open'));
        document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : 'auto';
      }

      hamburger.addEventListener('click', toggleNav);
      navLinks.querySelectorAll('button').forEach(function(btn) {
        btn.addEventListener('click', function() {
          if (navLinks.classList.contains('open')) toggleNav();
        });
      });
      window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && navLinks.classList.contains('open')) toggleNav();
      });
      hamburger.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleNav();
        }
      });


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
            signInButton.textContent = `${userData.name}`;

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
            signInButton.textContent = `Sign Out`; //`${user.email}`;
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
  const ONLY_PAPERS2 = true;
  let unsubscribeA, unsubscribeB;
  let papersA = [], papersB = [];
  let unsubscribeHandles = [];
  let papersArrays     = [];

  function displayPapers(category = 'all', query = '') {
	  const contentList = document.getElementById('content-list');
	  let loadingMessage = document.getElementById('loading-message');

	  // Tear down old listeners
	  unsubscribeHandles.forEach(u => u && u());
	  unsubscribeHandles = [];
	  papersArrays     = [];

	  // Build the array of collections to watch:
	  const collections = ONLY_PAPERS2
	    ? ['papers2']
	    : ['papers', 'papers2'];

	  // Helper to merge & render both arrays
	  function mergeAndRender() {
	    // flatten all docs
	    const allDocs = papersArrays.flat();
	    if (!allDocs.length) {
	      contentList.innerHTML = '';
	      if (!loadingMessage) {
	        loadingMessage = document.createElement('p');
	        loadingMessage.id = 'loading-message';
	        contentList.appendChild(loadingMessage);
	      }
	      loadingMessage.textContent = 'No papers matched that criteria.';
	      loadingMessage.style.display = 'block';
	      return;
	    }
	    if (loadingMessage) loadingMessage.style.display = 'none';

	    // sort by submittedAt descending
	    allDocs.sort((a, b) =>
	      b.data().submittedAt.toDate() - a.data().submittedAt.toDate()
	    );
	    updatePaperList(allDocs, query, category, contentList, 'trending');

	    // 2) extract & store the current ordering of IDs:
       const ids = allDocs.map(doc => doc.id);
       localStorage.setItem('displayedPapers', JSON.stringify(ids));
	  }

	  // Attach one listener per collection
	  collections.forEach((collName, idx) => {
	    let q = db.collection(collName).orderBy('submittedAt', 'desc');
	    if (category !== 'all') q = q.where('category', '==', category);

	    unsubscribeHandles[idx] = q.onSnapshot(snap => {
	      papersArrays[idx] = snap.docs;
	      mergeAndRender();
	    }, err => {
	      console.error(`Error fetching from ${collName}:`, err);
	    });
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

    let queryRef = db.collection('papers2').orderBy('commentsCount', 'desc');

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

        // Create a new paper-item div
		const paperItem = document.createElement('div');
		paperItem.classList.add('paper-item');

		// Title Section
		const titleSection = document.createElement('h3');
		titleSection.classList.add('paper-title');
		const titleLink = document.createElement('a');
		titleLink.href = `paper.html?id=${paperId}`;
		titleLink.textContent = paper.title ? paper.title : 'Untitled Paper';
		titleSection.appendChild(titleLink);
		paperItem.appendChild(titleSection);

		// Info Section
		const infoSection = document.createElement('p');
		infoSection.classList.add('paper-info');
		const authorsText = paper.authors ? paper.authors : 'Unknown Authors';
		let formattedDate = 'N/A';
		if (paper.submittedAt && paper.submittedAt.toDate) {
		  try {
		    formattedDate = paper.submittedAt.toDate().toLocaleDateString();
		  } catch (error) {
		    console.error('Error formatting date:', error);
		  }
		}
		infoSection.textContent = `${authorsText} • ${formattedDate}`;
		paperItem.appendChild(infoSection);

		// Category and Engagement Row
		const rowSection = document.createElement('div');
		rowSection.classList.add('info-row');

		// Category Tag
		const categorySpan = document.createElement('span');
		categorySpan.classList.add('category-tag');
		categorySpan.textContent =
		  paper.tags && paper.tags.length > 0
		    ? paper.tags.join(', ')
		    : 'No Category';
		rowSection.appendChild(categorySpan);

		// Engagement (Comments Count)
		const engagementSpan = document.createElement('span');
		engagementSpan.classList.add('engagement');
		const commentsCount =
		  typeof paper.commentsCount === 'number' ? paper.commentsCount : 0;
		engagementSpan.textContent = `${commentsCount} Comments`;
		rowSection.appendChild(engagementSpan);

		// Add the rowSection to paperItem
		paperItem.appendChild(rowSection);

		// Append the paperItem to contentList
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
  
  
  const signInButtons = document.querySelectorAll('.sign-in-btn');
  const signInModal = document.getElementById('sign-in-modal');
  const closeModalButtons = document.querySelectorAll('.close-modal');
  
  // Open Modal Logic
  function openSignInModal() {
    console.log('Opening Sign-In Modal');
    signInModal.classList.add('active');
    signInModal.style.display = 'block';
  }
  
  // Close Modal Logic
  function closeSignInModal() {
    console.log('Closing Sign-In Modal');
    signInModal.classList.remove('active');
    signInModal.style.display = 'none';
  }
  
  // Attach Listeners Safely
  signInButtons.forEach(button => {
    button.addEventListener('click', openSignInModal);
  });
  
  closeModalButtons.forEach(button => {
    button.addEventListener('click', closeSignInModal);
  });
  
  // Optional: Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === signInModal) closeSignInModal();
  });
  
  
});
