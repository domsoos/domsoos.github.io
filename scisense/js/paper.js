document.addEventListener('DOMContentLoaded', () => {
  const auth = window.auth;
  const db = window.db;

  // DOM Elements
  const toggleFeedbackBtn = document.getElementById('toggle-feedback-btn');
  const feedbackForm = document.getElementById('feedback-form');

  const submitNewPaperBtn = document.getElementById('submit-new-paper-btn');

  const paperTitle = document.getElementById('paper-title');
  const paperInfo = document.getElementById('paper-info');
  const paperAbstract = document.getElementById('paper-abstract');
  const newsSummaryText = document.getElementById('news-summary-text');
  const tweetsList = document.getElementById('tweets-list');
  const kgainForm = document.getElementById('kgain-form'); // Ensure this exists
  const paperIdInput = document.getElementById('paper-id'); // Ensure this exists or remove if not needed

  const prevButton = document.getElementById('prev-paper-button');
  const nextButton = document.getElementById('next-paper-button');

  const kgainSection = document.getElementById('kgain-section');

  // *** NEW: Swipe container element ***
  // Make sure you have an element with id="swipe-container" in your HTML.
  const swipeContainer = document.getElementById('swipe-container');

  // Function to open a modal
  const openModal = (modal) => {
    modal.classList.add('active');
  };

  // Function to close a modal
  const closeModalFn = (modal) => {
    modal.classList.remove('active');
  };

  // Event Listeners for Close Buttons
  const closeButtons = document.querySelectorAll('.close-modal');
  closeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const modal = button.closest('.sign-in-container') ||
                    button.closest('.sign-up-container') ||
                    button.closest('.kgain-container');
      closeModalFn(modal);
    });
  });

  // Close Modals when clicking outside the box
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('kgain-container')) {
      closeModalFn(kgainPanel);
    }
  });

  // Tab Functionality
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.getAttribute('data-tab');

      // Remove active class from all tabs
      tabs.forEach(t => t.classList.remove('active'));
      
      // Hide all tab contents
      tabContents.forEach(content => content.style.display = 'none');
      
      // Add active class to the clicked tab
      tab.classList.add('active');
      
      // Show the corresponding tab content
      const activeContent = document.getElementById(targetTab);
      if (activeContent) {
        activeContent.style.display = 'block';
        activeContent.classList.add('active');
      }
    });
  });

  // Function to get Paper ID from URL
  const getPaperIdFromURL = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
  };

  // Function to load paper details from Firestore
  function loadPaperDetails() {
    const paperId = getPaperIdFromURL();
    if (!paperId) {
      paperTitle.textContent = 'Invalid Paper ID.';
      paperInfo.textContent = '';
      document.getElementById('abstract').innerHTML = 'N/A';
      document.getElementById('news-summary-text').textContent = 'N/A';
      tweetsList.innerHTML = '<li>N/A</li>';
      return;
    }

    // Fetch the paper document from Firestore
    db.collection('papers').doc(paperId).get()
      .then((doc) => {
        if (doc.exists) {
          const paper = doc.data();

          // Populate Paper Details
          paperTitle.textContent = paper.title ? paper.title : 'Untitled Paper';

          const category = paper.category || 'general';
          console.log('Paper Category:', category);
          
          // Handle the 'date' field as a string
          let submissionDate = 'N/A';
          if (paper.date && typeof paper.date === 'string') {
            const dateObj = new Date(paper.date);
            if (!isNaN(dateObj)) {
              submissionDate = dateObj.toLocaleDateString();
            } else {
              submissionDate = paper.date;
            }
          }
          const authors = paper.authors ? paper.authors : 'Unknown Authors';
          paperInfo.textContent = `${authors} • ${submissionDate}`;

          // Populate Abstract
          const abstractContent = paper.abstract && paper.abstract !== '-' ? paper.abstract : 'N/A';
          document.getElementById('paper-abstract').textContent = abstractContent;

          // Populate News Summary
          const newsContent = paper.newshtml && paper.newshtml !== '-' ? paper.newshtml : 'N/A';
          document.getElementById('news-summary-text').innerHTML = newsContent;

          // Populate Author Tweets
          tweetsList.innerHTML = ''; // Clear existing tweets
          if (paper.tweethtml) {
			const embeddedTweetLi = document.createElement('p');
			embeddedTweetLi.innerHTML = paper.tweethtml;
			tweetsList.appendChild(embeddedTweetLi);

			// Re-scan the newly inserted blockquote
			if (window.twttr) {
			    window.twttr.widgets.load(tweetsList);
			}
		  }

          // If you have a hidden input for paperId, set its value
          if (paperIdInput) {
            paperIdInput.value = paperId;
          }
          console.log(paperId);
          setupNavigation(paperId);

          // *** NEW: Set up swipe navigation after loading the paper ***
          setupSwipeNavigation(paperId);

          // Fetch and display KGain questions
          fetchKGainQuestions(paperId, category);
        } else {
          paperTitle.textContent = 'Paper Not Found.';
          paperInfo.textContent = '';
          document.getElementById('abstract').textContent = 'N/A';
          document.getElementById('news-summary-text').textContent = 'N/A';
          tweetsList.innerHTML = '<li>N/A</li>';
          kgainSection.style.display = 'none';
        }
      })
      .catch((error) => {
        console.error('Error fetching paper:', error);
        paperTitle.textContent = 'Error Loading Paper.';
        paperInfo.textContent = '';
        document.getElementById('abstract').textContent = 'N/A';
        document.getElementById('news-summary-text').textContent = 'N/A';
        tweetsList.innerHTML = '<li>N/A</li>';
        kgainSection.style.display = 'none';
      });
  }

  // **Define Swipe Navigation Functionality**
  function setupSwipeNavigation(currentPaperId) {
    // If no swipe container is found, exit.
    if (!swipeContainer) {
      console.warn('Swipe container not found. Skipping swipe setup.');
      return;
    }

    let touchStartX = 0;
    let touchEndX = 0;
    let isSwiping = false;

    // Create the swipe indicator element with instructional text
    const swipeIndicator = document.createElement('div');
    swipeIndicator.id = 'swipe-indicator';
    swipeIndicator.textContent = 'Swipe for next article';
    swipeIndicator.style.opacity = '1'; // Fully visible initially
    swipeContainer.appendChild(swipeIndicator);

    // Automatically fade out the indicator after 3 seconds
    setTimeout(() => {
      swipeIndicator.style.transition = 'opacity 0.5s ease';
      swipeIndicator.style.opacity = '0';
    }, 3000);

    swipeContainer.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      isSwiping = true;
      // Make indicator visible when the swipe starts
      swipeIndicator.style.transition = 'opacity 0.2s ease';
      swipeIndicator.style.opacity = '0.5';
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

      // Reset indicator's styles
      swipeIndicator.style.opacity = '0';
      swipeIndicator.style.transform = 'translateX(0px)';
      isSwiping = false;

      if (Math.abs(swipeDistance) > swipeThreshold) {
        if (swipeDistance > 0) {
          console.log('Swipe Right detected');
          document.body.classList.add('swiping-right');
          setTimeout(() => {
            document.body.classList.remove('swiping-right');
            // Trigger previous paper navigation
            if (prevButton) prevButton.click();
          }, 300);
        } else {
          console.log('Swipe Left detected');
          document.body.classList.add('swiping-left');
          setTimeout(() => {
            document.body.classList.remove('swiping-left');
            // Trigger next paper navigation
            if (nextButton) nextButton.click();
          }, 300);
        }
      }
      // Reset swipe values
      touchStartX = 0;
      touchEndX = 0;
    });
  }
function fetchKGainQuestions(paperId, category) {
  if (!kgainSection) {
    console.error('KGain Section not found in the DOM.');
    return;
  }
  kgainSection.style.display = 'block';

  // Create a single form and three type-specific containers
  const kgainForm = document.createElement('form');
  kgainForm.id = 'kgain-questions-form';

  const containerA = document.createElement('div');
  containerA.id = 'kgain-container-a';
  containerA.innerHTML = '<h1>True or False</h1>';
  const containerB = document.createElement('div');
  containerB.id = 'kgain-container-b';
  containerB.innerHTML = '<h1>Easy Multiple Choice</h1>';
  const containerC = document.createElement('div');
  containerC.id = 'kgain-container-c';
  containerC.innerHTML = '<h1>Hard Multiple Choice</h1>';

  kgainForm.appendChild(containerA);
  kgainForm.appendChild(document.createElement('hr'));
  kgainForm.appendChild(containerB);
  kgainForm.appendChild(document.createElement('hr'));
  kgainForm.appendChild(containerC);

  let allQuestions = [];
  let typeA = [];
  let typeB = [];
  let typeC = [];

  db.collection('papers').doc(paperId).collection('kgainQuestions').get()
    .then((snapshot) => {
      if (snapshot.empty) {
        containerA.innerHTML += '<p>No Knowledge Gain questions available for Type 1.</p>';
        containerB.innerHTML += '<p>No Knowledge Gain questions available for Type 2.</p>';
        containerC.innerHTML += '<p>No Knowledge Gain questions available for Type 3.</p>';
        return;
      }

      // Separate questions by type
      snapshot.forEach((doc) => {
        const data = doc.data();
        const qObj = { id: doc.id, data };
        if (data.type === 'a') typeA.push(qObj);
        else if (data.type === 'b') typeB.push(qObj);
        else if (data.type === 'c') typeC.push(qObj);
      });

      // Helper: Render questions with answer options & vote checkbox that are initially hidden.
      function renderQuestions(qArr, parentDiv, typeKey) {
        qArr.forEach((qObj) => {
          const { id, data } = qObj;
          const questionDiv = document.createElement('div');
          questionDiv.classList.add('kgain-question');
          questionDiv.id = 'kgain-question-' + id; // For later feedback insertion

          const questionText = document.createElement('p');
          questionText.textContent = data.questionText;
          questionDiv.appendChild(questionText);

          const optionsDiv = document.createElement('div');
          optionsDiv.classList.add('kgain-options');
          for (const [optKey, optValue] of Object.entries(data.options)) {
            const label = document.createElement('label');
            label.textContent = optValue;
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = `question-${id}`;
            radio.value = optKey;
            label.prepend(radio);
            optionsDiv.appendChild(label);
          }
          questionDiv.appendChild(optionsDiv);

          // Voting checkbox (remains invisible after answer submission)
          const voteLabel = document.createElement('label');
          voteLabel.textContent = ' Vote for this question';
          voteLabel.classList.add('kgain-vote-label');
          voteLabel.style.display = 'none';  // HIDDEN until answers are submitted
          const voteCheck = document.createElement('input');
          
          //const voteCheck = document.createElement('input');
          voteCheck.type = 'checkbox';
          voteCheck.name = `vote-${id}`;
          voteCheck.classList.add(`vote-${typeKey}`);
          voteLabel.prepend(voteCheck);
          questionDiv.appendChild(voteLabel);

          parentDiv.appendChild(questionDiv);
        });
      }

      renderQuestions(typeA, containerA, 'a');
      renderQuestions(typeB, containerB, 'b');
      renderQuestions(typeC, containerC, 'c');

      allQuestions = [...typeA, ...typeB, ...typeC];

      // Submit Answers button (voting is separate)
      const submitAnswersButton = document.createElement('button');
      submitAnswersButton.type = 'submit';
      submitAnswersButton.textContent = 'Submit Answers';
      kgainForm.appendChild(document.createElement('hr'));
      kgainForm.appendChild(submitAnswersButton);

      kgainSection.appendChild(kgainForm);

      let answersSubmitted = false;
      kgainForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (answersSubmitted) return;
        
        const user = auth.currentUser;
        if (!user) {
          alert("Please sign in to continue.");
          return;
        }
        
        let score = 0;
        const totalQuestions = snapshot.size;
        const answers = {};

        snapshot.forEach((doc) => {
          const question = doc.data();
          const selectedOption = kgainForm[`question-${doc.id}`].value;
          if (selectedOption === question.correctAnswer) score += 10;
          answers[doc.id] = {
            selected: selectedOption,
            correct: question.correctAnswer,
            options: question.options
          };
        });

        // Display overall score at the top
        const scoreDiv = document.createElement('div');
        scoreDiv.innerHTML = `<p>You scored <strong>${score}</strong> out of <strong>${totalQuestions*10}</strong>.<br>
                              <strong>${score}</strong> points are added to the ${category} category</p>`;
        kgainForm.insertBefore(scoreDiv, containerA.nextSibling);

        // Append feedback for each question (grouped by type)
        function appendFeedback(qArr) {
          qArr.forEach((qObj) => {
            const { id } = qObj;
            const qDiv = document.getElementById('kgain-question-' + id);
            if (qDiv) {
              const feedbackP = document.createElement('p');
              const userAnswer = answers[id].selected;
              const correctAnswer = answers[id].correct;
              const isCorrect = userAnswer === correctAnswer;
              const userAnswerText = answers[id].options[userAnswer] || 'No answer selected';
              const correctAnswerText = answers[id].options[correctAnswer] || 'No correct answer';
              feedbackP.innerHTML = `Your Answer: <strong>${userAnswerText}</strong> is 
                                     ${isCorrect ? '<span style="color: green;">Correct</span>' : '<span style="color: red;">Incorrect</span>'}
                                     ${!isCorrect ? `<br>Correct Answer: <strong>${correctAnswerText}</strong>` : ''}`;
              qDiv.appendChild(feedbackP);
              // Disable answer inputs
              qDiv.querySelectorAll('input[type="radio"]').forEach(radio => radio.disabled = true);
            }
          });
        }
        appendFeedback(typeA);
        appendFeedback(typeB);
        appendFeedback(typeC);

        answersSubmitted = true;

        // Remove Submit Answers button so that only vote submission remains
        submitAnswersButton.remove();

        /* BEGIN: Reveal voting options after answers are submitted */
        kgainForm.querySelectorAll('.kgain-vote-label').forEach(label => {
          label.style.display = 'block';
        });
        /* END: Reveal voting options after answers are submitted */

        // Add a button for vote submission after feedback is shown.
        const voteButton = document.createElement('button');
        voteButton.type = 'button';
        voteButton.textContent = 'Submit Votes';
        voteButton.style.marginTop = '20px';
        kgainForm.appendChild(document.createElement('hr'));
        kgainForm.appendChild(voteButton);

        voteButton.addEventListener('click', () => {
          // Count checked votes
          let voteCount = 0;
          allQuestions.forEach((qObj) => {
            const { id } = qObj;
            const voteEl = kgainForm[`vote-${id}`];
            if (voteEl && voteEl.checked) voteCount++;
          });
          if (voteCount > 6) {
            alert('You voted for more than 6 questions. Please try again!');
            // Reset all vote checkboxes
            allQuestions.forEach((qObj) => {
              const { id } = qObj;
              const voteEl = kgainForm[`vote-${id}`];
              if (voteEl) voteEl.checked = false;
            });
            return;
          }
          // Process and update votes in Firestore
          allQuestions.forEach((qObj) => {
            const { id } = qObj;
            const voteEl = kgainForm[`vote-${id}`];
            if (voteEl && voteEl.checked) {
              const docRef = db.collection('papers')
                               .doc(paperId)
                               .collection('kgainQuestions')
                               .doc(id);
              docRef.get().then(docSnap => {
                if (!docSnap.exists) return;
                const currentVote = docSnap.data().vote || 0;
                docRef.update({ vote: currentVote + 1 });
              }).catch(err => console.error('Vote update error:', err));
            }
          });
          alert('Votes submitted successfully!');
          // Optionally disable voting after submission
          allQuestions.forEach((qObj) => {
            const { id } = qObj;
            const voteEl = kgainForm[`vote-${id}`];
            if (voteEl) voteEl.disabled = true;
          });
          voteButton.disabled = true;
        });

        // Update user points in Firestore
        updateUserPoints(score, totalQuestions, answers, category);
      });
    })
    .catch((error) => {
      console.error('Error fetching KGain questions:', error);
    });
}

  /**
   * Updates the user's points based on correct answers.
   * @param {number} score - Number of correct answers.
   * @param {number} totalQuestions - Total number of questions.
   * @param {object} answers - User's answers with correct answers.
   * @param {string} category of the article
   */
  function updateUserPoints(score, totalQuestions, answers, category) {
    const user = auth.currentUser;
    if (!user) {
      console.error('No authenticated user found.');
      return;
    }

    // Fetch user document
    db.collection('users').doc(user.uid).get()
      .then((doc) => {
        if (doc.exists) {
          const userData = doc.data();
          const currentPoints = userData.points || {};

          // Update the 'points' map
          const updatedPoints = { ...currentPoints };
          updatedPoints[category] = (currentPoints[category] || 0) + score;

          // Update user document in Firestore
          db.collection('users').doc(user.uid).update({
            points: updatedPoints
          })
          .then(() => {
            console.log('User points updated successfully.');
          })
          .catch((error) => {
            console.error('Error updating user points:', error);
          });
        } else {
          console.error('User document does not exist.');
        }
      })
      .catch((error) => {
        console.error('Error fetching user data:', error);
      });
  }

  // Call the function to load paper details
  loadPaperDetails();

  // **Define the setupNavigation Function**
  /**
   * Sets up the Previous and Next buttons based on the list of displayed papers.
   * @param {string} currentPaperId - The ID of the currently viewed paper.
   */
  function setupNavigation(currentPaperId) {
    if (!prevButton || !nextButton) {
      console.warn('Previous and/or Next buttons are not found in the DOM.');
      return;
    }
    
    // Retrieve the list of displayed paper IDs from localStorage
    const displayedPapersJSON = localStorage.getItem('displayedPapers');
    console.log('Displayed Paper IDs Stored:', displayedPapersJSON);
    if (!displayedPapersJSON) {
      console.warn('No displayed papers list found in localStorage.');
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

    // Determine Previous and Next Paper IDs
    const prevPaperId = currentIndex > 0 ? displayedPapers[currentIndex - 1] : null;
    const nextPaperId = currentIndex < displayedPapers.length - 1 ? displayedPapers[currentIndex + 1] : null;

    // **Set Up Previous Button**
    if (prevPaperId) {
      prevButton.disabled = false;
      prevButton.addEventListener('click', handlePrevClick);
    } else {
      prevButton.disabled = true; // No previous paper
    }

    // **Set Up Next Button**
    if (nextPaperId) {
      nextButton.disabled = false;
      nextButton.addEventListener('click', handleNextClick);
    } else {
      nextButton.disabled = true; // No next paper
    }

    // **Handle Previous Button Click**
    function handlePrevClick() {
      window.location.href = `paper.html?id=${prevPaperId}`;
    }

    // **Handle Next Button Click**
    function handleNextClick() {
      window.location.href = `paper.html?id=${nextPaperId}`;
    }
  }

  // Hide the feedback form by default
  //const feedbackForm = document.getElementById('feedback-form');
  feedbackForm.style.display = 'none';

  // Show the feedback form when the button is clicked
  toggleFeedbackBtn.addEventListener('click', () => {
    feedbackForm.style.display = 'block';
  });

  document.getElementById('toggle-feedback-btn').addEventListener('click', function() {
  document.getElementById('feedback-form').classList.toggle('active');
  this.classList.toggle('active');
  });

  // Toggle Feedback Form Visibility
  function toggleFeedbackForm() {
    if (feedbackForm.classList.contains('active')) {
      // Show feedback form
      document.querySelector('.feedback-form').classList.add('overflow-hidden');
      feedbackForm.style.display = 'block';
      toggleFeedbackBtn.content = "Close Form";//"↓";
      toggleFeedbackBtn.innerHTML = '<i class="fas fa-arrow-down"></i>'; // Down arrow
      toggleFeedbackBtn.setAttribute('aria-label', 'Close Feedback Form');

      // Prevent background scrolling
      //document.body.style.overflow = 'hidden';

      // Move focus to the first input field
      const firstInput = feedbackForm.querySelector('textarea, input, select');
      if (firstInput) {
        firstInput.focus();
      }
    } else {
      // Hide feedback form
      document.querySelector('.feedback-form').classList.remove('overflow-hidden');
      feedbackForm.style.display = 'none';
      toggleFeedbackBtn.content = "Leave Feedback";//"↑";
      toggleFeedbackBtn.innerHTML = '<i class="fas fa-arrow-up"></i>'; // Up arrow
      toggleFeedbackBtn.setAttribute('aria-label', 'Open Feedback Form');

      // Restore background scrolling
      document.body.style.overflow = '';
    }
  }

  // Toggle Feedback Form Visibility on second click
  toggleFeedbackBtn.addEventListener('click', toggleFeedbackForm);
});
