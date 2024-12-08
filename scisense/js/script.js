// scisense/js/script.js

document.addEventListener('DOMContentLoaded', () => {
  // -----------------------------
  // 1. Firebase Configuration
  // -----------------------------
  const firebaseConfig = {
    apiKey: "AIzaSyCt4qYFZ2asBo7n8oiq32wDNkT0Q-j_rmc",
    authDomain: "scisense-3046c.firebaseapp.com",
    projectId: "scisense-3046c",
    // Add other Firebase config parameters if needed
  };

  // Initialize Firebase
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  window.auth = firebase.auth();
  window.db = firebase.firestore();

  // -----------------------------
  // 2. DOM Elements
  // -----------------------------
  // Authentication Elements
  const signInButton = document.getElementById('sign-in-button');
  const signInModal = document.getElementById('sign-in-modal');
  const googleSignInButton = document.getElementById('google-sign-in');
  const emailSignInForm = document.getElementById('email-sign-in-form');
  const signUpLink = document.getElementById('sign-up-link');
  const signUpModal = document.getElementById('sign-up-modal');
  const signUpForm = document.getElementById('sign-up-form');
  const passwordResetModal = document.getElementById('password-reset-modal');
  const passwordResetForm = document.getElementById('password-reset-form');
  const forgotPasswordLink = document.getElementById('forgot-password');
  const passwordResetSignInLink = document.getElementById('password-reset-sign-in-link');
  const signInLinkInSignUp = document.getElementById('sign-in-link');
  const createAccountButton = document.getElementById('create-account-button');

  // Admin and User Action Buttons
  const submitNewPaperBtn = document.getElementById('submit-paper-btn');
  const addDiscoveryBtn = document.getElementById('add-discovery-btn');

  // Discovery Modal Elements
  const discoveryModal = document.getElementById('discovery-modal');
  const closeModalSpan = discoveryModal.querySelector('.close-modal');
  const discoveryForm = document.getElementById('discovery-form');
  const discoveryLinkInput = document.getElementById('discovery-link');

  // Tabs and Categories
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');
  const categoriesDropdown = document.getElementById('categories-dropdown');

  // Leaderboard Elements (Handled Separately in leaderboard.js)
  // const leaderboardCategorySelect = document.getElementById('leaderboard-category'); // Not needed here

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
  // 5. Event Listeners for Action Buttons
  // -----------------------------
  // "Submit New Paper" Button (Admin Only)
  if (submitNewPaperBtn) {
    submitNewPaperBtn.addEventListener('click', () => {
      window.location.href = 'input_data.html'; // Ensure this page exists
    });
  }

  // "Add New Scientific Discovery" Button (Admin and Regular Users)
  if (addDiscoveryBtn) {
    addDiscoveryBtn.addEventListener('click', () => {
      openModal(discoveryModal);
    });
  }

  // -----------------------------
  // 6. Handle Discovery Modal Submission
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
  // 7. Tab Switching Functionality
  // -----------------------------
  // Function to get the currently active tab
  function getActiveTab() {
    return document.querySelector('.tab.active').getAttribute('data-tab');
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

      // Fetch and display content based on active tab and selected category
      const selectedCategory = categoriesDropdown.value === 'all' ? 'all' : categoriesDropdown.value;

      if (target === 'trending') {
        displayPapers(selectedCategory);
      } else if (target === 'most-discussed') {
        displayMostDiscussed(selectedCategory);
      }
      // Leaderboard is handled separately in leaderboard.js
    });
  });

  // -----------------------------
  // 8. Category Dropdown Filtering
  // -----------------------------
  if (categoriesDropdown) {
    categoriesDropdown.addEventListener('change', () => {
      const selectedCategory = categoriesDropdown.value === 'all' ? 'all' : categoriesDropdown.value;
      const activeTab = getActiveTab();

      if (activeTab === 'trending') {
        displayPapers(selectedCategory);
      } else if (activeTab === 'most-discussed') {
        displayMostDiscussed(selectedCategory);
      }
      // Leaderboard is handled separately
    });
  }

  // -----------------------------
  // 9. Functions to Display Papers
  // -----------------------------
  // Function to fetch and display Trending papers
  function displayPapers(category = 'all') {
    console.log('Fetching Trending papers from Firestore...');
    const contentList = document.getElementById('content-list');
    const loadingMessage = document.getElementById('loading-message');

    db.collection('papers')
      .orderBy('submittedAt', 'desc') // Order papers by 'submittedAt' field, latest first
      .onSnapshot((snapshot) => {
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
        updatePaperList(snapshot.docs, '', category, contentList, 'trending');
      }, (error) => {
        console.error('Error fetching Trending papers:', error);
        if (contentList) {
          contentList.innerHTML = '<p>Error loading papers.</p>';
        }
      });
  }

  // Function to fetch and display Most Discussed papers
  function displayMostDiscussed(category = 'all') {
    console.log('Fetching Most Discussed papers from Firestore...');
    const contentList = document.getElementById('content-list-discussed');
    const loadingMessage = document.getElementById('loading-message-discussed');

    db.collection('papers')
      .orderBy('commentsCount', 'desc') // Order papers by 'commentsCount', most first
      .onSnapshot((snapshot) => {
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
        updatePaperList(snapshot.docs, '', category, contentList, 'most-discussed');
      }, (error) => {
        console.error('Error fetching Most Discussed papers:', error);
        if (contentList) {
          contentList.innerHTML = '<p>Error loading papers.</p>';
        }
      });
  }

  // Function to update paper list based on query and category
  function updatePaperList(docs, query, category, contentList, tabType) {
    if (!contentList) return;
    contentList.innerHTML = ''; // Clear the current list

    // Filter the papers based on the query and category
    const filteredDocs = docs.filter((doc) => {
      const paper = doc.data();
      const title = (paper.title || '').toLowerCase();
      const authors = (paper.authors || '').toLowerCase();
      const tags = (paper.tags || []).map(tag => tag.toLowerCase()).join(', ');
      const paperCategory = (paper.category || '').toLowerCase(); // Assuming 'category' field exists

      // Check if the query matches the title, authors, or tags
      const matchesQuery =
        title.includes(query) ||
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
    displayPapers(initialCategory);
  } else if (initialActiveTab === 'most-discussed') {
    displayMostDiscussed(initialCategory);
  }
  // Leaderboard is handled separately in leaderboard.js
});
