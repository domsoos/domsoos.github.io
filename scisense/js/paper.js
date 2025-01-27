document.addEventListener('DOMContentLoaded', () => {
  const auth = window.auth;
  const db = window.db;

  // DOM Elements
  const toggleFeedbackBtn = document.getElementById('toggle-feedback-btn');
  const feedbackForm = document.getElementById('feedback-form');
  const kgainArrow = document.getElementById('kgain-arrow');
  const kgainPanel = document.getElementById('kgain-panel');
  const kgainCloseBtn = document.getElementById('kgain-close');
  const submitNewPaperBtn = document.getElementById('submit-new-paper-btn');
  const paperTitle = document.getElementById('paper-title');
  const paperInfo = document.getElementById('paper-info');
  const paperAbstract = document.getElementById('paper-abstract');
  const newsSummaryText = document.getElementById('news-summary-text');
  const tweetsList = document.getElementById('tweets-list');
  const paperIdInput = document.getElementById('paper-id');
  const prevButton = document.getElementById('prev-paper-button');
  const nextButton = document.getElementById('next-paper-button');
  const swipeContainer = document.getElementById('swipe-container');

  // Function to get Paper ID from URL
  const getPaperIdFromURL = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
  };

  const currentPaperId = getPaperIdFromURL();
  console.log('Current Paper ID:', currentPaperId);

  if (!currentPaperId) {
    console.error('Invalid Paper ID. Cannot load paper details.');
    displayErrorMessage('Invalid Paper ID. Please try again.');
    return;
  }

  // Function to display error messages
  function displayErrorMessage(message) {
    if (paperTitle) paperTitle.textContent = message;
    if (paperInfo) paperInfo.textContent = '';
    if (paperAbstract) paperAbstract.textContent = 'N/A';
    if (newsSummaryText) newsSummaryText.textContent = 'N/A';
    if (tweetsList) tweetsList.innerHTML = '<li>N/A</li>';
  }

  // Function to load paper details from Firestore
  function loadPaperDetails() {
    const paperId = getPaperIdFromURL();
    if (!paperId) {
      displayErrorMessage('Invalid Paper ID. Please try again.');
      return;
    }

    db.collection('papers')
      .doc(paperId)
      .get()
      .then((doc) => {
        if (doc.exists) {
          const paper = doc.data();
          console.log('Loaded paper:', paper);

          // Populate Paper Details
          paperTitle.textContent = paper.title || 'Untitled Paper';
          const authors = paper.authors || 'Unknown Authors';
          const submissionDate = paper.date
            ? new Date(paper.date).toLocaleDateString()
            : 'N/A';
          paperInfo.textContent = `${authors} • ${submissionDate}`;
          paperAbstract.textContent = paper.abstract || 'N/A';
          newsSummaryText.textContent = paper.news || 'N/A';

          // Populate Tweets
          tweetsList.innerHTML = '';
          if (Array.isArray(paper.tweets) && paper.tweets.length > 0) {
            paper.tweets.forEach((tweet) => {
              const li = document.createElement('li');
              li.textContent = tweet;
              tweetsList.appendChild(li);
            });
          } else {
            tweetsList.innerHTML = '<li>N/A</li>';
          }

          // Set up navigation buttons
          setupNavigation(paperId);
        } else {
          displayErrorMessage('Paper Not Found.');
        }
      })
      .catch((error) => {
        console.error('Error fetching paper:', error);
        displayErrorMessage('Error Loading Paper. Please try again.');
      });
  }

  // Call the function to load paper details
  loadPaperDetails();

  // Tab Functionality
  function setupTabs() {
    const tabs = document.querySelectorAll('.tab'); // Select all tabs
    const tabContents = document.querySelectorAll('.tab-content'); // Select all tab contents
  
    if (!tabs || !tabContents) {
      console.error('Tabs or Tab Content elements are missing in the DOM.');
      return;
    }
  
    // Loop through each tab and add click event
    tabs.forEach((tab) => {
      tab.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent default behavior (e.g., navigation)
  
        const targetTab = tab.getAttribute('data-tab'); // Get the target tab from data-tab attribute
  
        // Remove 'active' class from all tabs and hide all tab contents
        tabs.forEach((t) => t.classList.remove('active'));
        tabContents.forEach((content) => {
          content.style.display = 'none';
          content.classList.remove('active');
        });
  
        // Add 'active' class to the clicked tab
        tab.classList.add('active');
  
        // Show the corresponding tab content
        const activeContent = document.getElementById(targetTab);
        if (activeContent) {
          activeContent.style.display = 'block';
          activeContent.classList.add('active');
        } else {
          console.error(`No content found for tab: ${targetTab}`);
        }
      });
    });
  
    // Automatically show the first tab on load
    const firstTab = tabs[0];
    const firstTabContent = tabContents[0];
    if (firstTab && firstTabContent) {
      firstTab.classList.add('active');
      firstTabContent.style.display = 'block';
      firstTabContent.classList.add('active');
    }
  }
  

setupTabs();

  /**
   * Adds swipe navigation for switching between papers.
   */
  function setupSwipeNavigation(currentPaperId) {
    console.log('Setting up swipe navigation for:', currentPaperId);
  
    if (!swipeContainer) {
      console.warn('Swipe container not found. Skipping swipe setup.');
      return;
    }
  
    let touchStartX = 0;
    let touchEndX = 0;
    let isSwiping = false;
  
    // Visual cue for swipe progress
    const swipeIndicator = document.createElement('div');
    swipeIndicator.id = 'swipe-indicator';
    swipeContainer.appendChild(swipeIndicator);
  
    swipeContainer.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      isSwiping = true;
      swipeIndicator.style.opacity = '0.5'; // Make indicator visible
    });
  
    swipeContainer.addEventListener('touchmove', (e) => {
      if (!isSwiping) return;
      touchEndX = e.changedTouches[0].screenX;
  
      const swipeProgress = touchEndX - touchStartX;
      swipeIndicator.style.transform = `translateX(${swipeProgress}px)`;
    });
  
    swipeContainer.addEventListener('touchend', () => {
      const swipeDistance = touchEndX - touchStartX;
      const swipeThreshold = 100; // Minimum distance for a valid swipe
  
      swipeIndicator.style.opacity = '0'; // Hide indicator
      swipeIndicator.style.transform = 'translateX(0px)'; // Reset position
      isSwiping = false;
  
      if (Math.abs(swipeDistance) > swipeThreshold) {
        if (swipeDistance > 0) {
          console.log('Swipe Right detected');
          document.body.classList.add('swiping-right');
          setTimeout(() => {
            document.body.classList.remove('swiping-right');
            prevButton?.click();
          }, 300); // Delay navigation for animation
        } else {
          console.log('Swipe Left detected');
          document.body.classList.add('swiping-left');
          setTimeout(() => {
            document.body.classList.remove('swiping-left');
            nextButton?.click();
          }, 300); // Delay navigation for animation
        }
      }
  
      // Reset swipe values
      touchStartX = 0;
      touchEndX = 0;
    });
  }  

  setupSwipeNavigation(currentPaperId);

  /**
   * Sets up the Previous and Next buttons based on the list of displayed papers.
   * @param {string} currentPaperId - The ID of the currently viewed paper.
   */
  function setupNavigation(currentPaperId) {
    console.log('Setting up navigation for paper:', currentPaperId);

    if (!prevButton || !nextButton) {
      console.warn('Previous and/or Next buttons are not found in the DOM.');
      return;
    }

    const displayedPapersJSON = localStorage.getItem('displayedPapers');
    if (!displayedPapersJSON) {
      console.warn('No displayed papers found in localStorage.');
      prevButton.disabled = true;
      nextButton.disabled = true;
      return;
    }

    const displayedPapers = JSON.parse(displayedPapersJSON);
    const currentIndex = displayedPapers.indexOf(currentPaperId);

    if (currentIndex === -1) {
      console.warn('Current paper ID not found in the displayed papers list.');
      prevButton.disabled = true;
      nextButton.disabled = true;
      return;
    }

    const prevPaperId = currentIndex > 0 ? displayedPapers[currentIndex - 1] : null;
    const nextPaperId =
      currentIndex < displayedPapers.length - 1 ? displayedPapers[currentIndex + 1] : null;

    // Set up Previous Button
    if (prevPaperId) {
      prevButton.disabled = false;
      prevButton.addEventListener('click', () => {
        window.location.href = `paper.html?id=${prevPaperId}`;
      });
    } else {
      prevButton.disabled = true;
    }

    // Set up Next Button
    if (nextPaperId) {
      nextButton.disabled = false;
      nextButton.addEventListener('click', () => {
        window.location.href = `paper.html?id=${nextPaperId}`;
      });
    } else {
      nextButton.disabled = true;
    }
  }

// Event Listeners for Feedback Button
if (toggleFeedbackBtn && feedbackForm) {
  toggleFeedbackBtn.addEventListener('click', () => {
    feedbackForm.classList.toggle('active');
  });
}

const takeQuizButton = document.getElementById('take-quiz-button');
const paperDetailsSection = document.getElementById('paper-details');
const feedbackSection = document.getElementById('feedback-section');
const feedbackSteps = document.querySelectorAll('.feedback-step'); // All steps
const progressBar = document.getElementById('progress'); // Progress bar element
const backToContentButton = document.createElement('button');

let currentStepIndex = 0; // Track the current feedback step

// Function to show a specific feedback step
function showFeedbackStep(index) {
  feedbackSteps.forEach((step, i) => {
    step.style.display = i === index ? 'block' : 'none'; // Show only the current step
  });
  updateProgressBar(index); // Update progress bar
}

// Function to update the progress bar width
function updateProgressBar(index) {
  const progressPercentage = ((index + 1) / feedbackSteps.length) * 100;
  progressBar.style.width = `${progressPercentage}%`;
}

// Take Quiz Button - Start Feedback Section
takeQuizButton.addEventListener('click', () => {
  // Hide paper details and show feedback form
  paperDetailsSection.style.display = 'none';
  feedbackSection.style.display = 'block';
  currentStepIndex = 0; // Reset to first step
  showFeedbackStep(currentStepIndex);
});

// "Next" button functionality
const nextButtons = document.querySelectorAll('.next-btn');
nextButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    if (currentStepIndex < feedbackSteps.length - 1) {
      currentStepIndex++;
      showFeedbackStep(currentStepIndex);
    }
  });
});

// "Back" button functionality
const backButtons = document.querySelectorAll('.back-btn');
backButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    if (currentStepIndex > 0) {
      currentStepIndex--;
      showFeedbackStep(currentStepIndex);
    }
  });
});

// Add "Back to Content" button functionality
backToContentButton.textContent = 'Back to Content';
backToContentButton.classList.add('back-to-content-button');
feedbackSection.appendChild(backToContentButton);

backToContentButton.addEventListener('click', () => {
  feedbackSection.style.display = 'none';
  paperDetailsSection.style.display = 'block';
});

// Transition to Knowledge Gain Panel after Feedback Submission
feedbackForm.addEventListener('submit', (e) => {
  e.preventDefault();
  feedbackSection.style.display = 'none';
  kgainPanel.style.display = 'block';
});

// Initialize the first step and progress bar
showFeedbackStep(currentStepIndex);

});
