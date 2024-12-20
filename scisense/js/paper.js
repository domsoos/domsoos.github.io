// scisense/js/paper.js

document.addEventListener('DOMContentLoaded', () => {
  const auth = window.auth;
  const db = window.db;

  // DOM Elements
  const toggleFeedbackBtn = document.getElementById('toggle-feedback-btn');
  const feedbackForm = document.getElementById('feedback-form');

  // KGain Elements
  const kgainArrow = document.getElementById('kgain-arrow');
  const kgainPanel = document.getElementById('kgain-panel');
  const kgainCloseBtn = document.getElementById('kgain-close');

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
  const kgainContainer = document.getElementById('kgain-container');

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

    // KGain Panel Functionality
  if (kgainArrow && kgainPanel && kgainCloseBtn) {
    kgainArrow.addEventListener('click', () => {
      kgainPanel.classList.add('active');
    });

    kgainCloseBtn.addEventListener('click', () => {
      kgainPanel.classList.remove('active');
    });
  }

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
          const newsContent = paper.news && paper.news !== '-' ? paper.news : 'N/A';
          document.getElementById('news-summary-text').textContent = newsContent;

          // Populate Author Tweets
          tweetsList.innerHTML = ''; // Clear existing tweets
          if (paper.tweets && Array.isArray(paper.tweets) && paper.tweets.length > 0) {
            paper.tweets.forEach(tweet => {
              const li = document.createElement('li');
              li.textContent = tweet && tweet !== '-' ? tweet : 'N/A';
              tweetsList.appendChild(li);
            });
          } else {
            tweetsList.innerHTML = '<li>N/A</li>';
          }

          // If you have a hidden input for paperId, set its value
          if (paperIdInput) {
            paperIdInput.value = paperId;
          }
          console.log(paperId);
          setupNavigation(paperId);
          // Fetch and display KGain questions
          fetchKGainQuestions(paperId);
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

    // **Function to Fetch and Display KGain Questions**
  function fetchKGainQuestions(paperId) {
    if (!kgainSection || !kgainContainer) {
      console.error('KGain Section or Container not found in the DOM.');
      return;
    }

    // Show the KGain section
    kgainSection.style.display = 'block';

    // Clear existing questions
    kgainContainer.innerHTML = '';

    // Fetch KGain questions from Firestore
    db.collection('papers').doc(paperId).collection('kgainQuestions').get()
      .then((snapshot) => {
        if (snapshot.empty) {
          kgainContainer.innerHTML = '<p>No Knowledge Gain questions available for this paper.</p>';
          return;
        }

        // Create a form to hold the questions
        const kgainForm = document.createElement('form');
        kgainForm.id = 'kgain-questions-form';

        snapshot.forEach((doc, index) => {
          const question = doc.data();

          // Create question container
          const questionDiv = document.createElement('div');
          questionDiv.classList.add('kgain-question');

          // Question text
          const questionText = document.createElement('p');
          questionText.textContent = `Q${index + 1}: ${question.questionText}`;
          questionDiv.appendChild(questionText);

          // Options
          const optionsDiv = document.createElement('div');
          optionsDiv.classList.add('kgain-options');

          for (const [optionKey, optionValue] of Object.entries(question.options)) {
            const optionLabel = document.createElement('label');
            optionLabel.textContent = optionValue;

            const optionInput = document.createElement('input');
            optionInput.type = 'radio';
            optionInput.name = `question-${doc.id}`;
            optionInput.value = optionKey;
            optionInput.required = true;

            optionLabel.prepend(optionInput);
            optionsDiv.appendChild(optionLabel);
          }

          questionDiv.appendChild(optionsDiv);
          kgainForm.appendChild(questionDiv);
        });

        // Submit Button
        const submitButton = document.createElement('button');
        submitButton.type = 'submit';
        submitButton.textContent = 'Submit Answers';
        kgainForm.appendChild(submitButton);

        // Append the form to the container
        kgainContainer.appendChild(kgainForm);

        // Handle Form Submission
        kgainForm.addEventListener('submit', (e) => {
          e.preventDefault();
          
          // Authenticate User
          const user = auth.currentUser;
          if (!user) {
            alert("Please sign in to continue.");
            return;
          }

          // Calculate Score
          let score = 0;
          const totalQuestions = snapshot.size;
          const answers = {};

          snapshot.forEach((doc) => {
            const question = doc.data();
            const selectedOption = kgainForm[`question-${doc.id}`].value;
            if (selectedOption === question.correctAnswer) {
              score += 1;
            }
            answers[doc.id] = {
              selected: selectedOption,
              correct: question.correctAnswer
            };
          });

          // Display Feedback
          let feedbackHTML = `<p>You scored <strong>${score}</strong> out of <strong>${totalQuestions}</strong>.</p>`;
          snapshot.forEach((doc, index) => {
            const question = doc.data();
            const userAnswer = answers[doc.id].selected;
            const correctAnswer = answers[doc.id].correct;
            const isCorrect = userAnswer === correctAnswer;
            
            feedbackHTML += `
              <div class="kgain-feedback">
                <p>Q${index + 1}: ${question.questionText}</p>
                <p>Your Answer: <strong>${userAnswer}</strong> - ${isCorrect ? '<span style="color: green;">Correct</span>' : '<span style="color: red;">Incorrect</span>'}</p>
                ${!isCorrect ? `<p>Correct Answer: <strong>${correctAnswer}</strong></p>` : ''}
              </div>
            `;
          });

          // Insert feedback into the container
          kgainContainer.innerHTML = feedbackHTML;

          // Update User Points in Firestore
          updateUserPoints(score, totalQuestions, answers);
        });
      })
      .catch((error) => {
        console.error('Error fetching KGain questions:', error);
        kgainContainer.innerHTML = '<p>Error loading Knowledge Gain questions.</p>';
      });
  }

  /**
   * Updates the user's points based on correct answers.
   * @param {number} score - Number of correct answers.
   * @param {number} totalQuestions - Total number of questions.
   * @param {object} answers - User's answers with correct answers.
   */
  function updateUserPoints(score, totalQuestions, answers) {
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

          // For simplicity, assign a fixed number of points per correct answer
          const pointsPerCorrect = 10; // Adjust as needed
          const totalPointsToAdd = score * pointsPerCorrect;

          // Update the 'points' map
          const updatedPoints = { ...currentPoints };
          // If you have categories associated with questions, update accordingly
          // For now, distribute points equally across a default category
          const defaultCategory = 'physics'; // Replace with actual category if available
          updatedPoints[defaultCategory] = (currentPoints[defaultCategory] || 0) + totalPointsToAdd;

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

    // **Optional: Remove Existing Event Listeners to Prevent Multiple Bindings**
    // This is useful if `setupNavigation` might be called multiple times
    // before navigating to another paper.
    // Use named functions or event delegation to manage listeners more effectively.
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
  
  /*
  let isPanelOpen = false;
  let originalLeftPos = 0;
  let currentWidth = 100%;
  let originalWidth = 100%;
  
  */

  /* Knowledge gain section 
  // Function to get correct answers (Replace with Firestore data fetching if needed)
  const getCorrectAnswers = (paperId) => {
    const papersData = {
      "deep-learning-approaches-in-ai": {
        kgain1: "A",
        kgain2: "A"
      },
      "language-models-are-few-shot-learners": {
        kgain1: "A",
        kgain2: "A"
      },
      "seq-2-seq": {
        kgain1: "C",
        kgain2: "B"
      }
      // Add more papers and their correct answers
    };

    return papersData[paperId] || null;
  };

  // Function to get option text for feedback
  const getOptionText = (paperId, questionName, option) => {
    const papersData = {
      "deep-learning-approaches-in-ai": {
        kgain1: {
          A: "They require large amounts of data and computational resources.",
          B: "They are always interpretable.",
          C: "They cannot be used for image recognition."
        },
        kgain2: {
          A: "Healthcare",
          B: "Agriculture",
          C: "Retail"
        }
      },
      "language-models-are-few-shot-learners": {
        kgain1: {
          A: "The ability of models to perform tasks with only a few examples.",
          B: "Models that require extensive training data.",
          C: "A method where models learn from zero examples."
        },
        kgain2: {
          A: "Enabled more flexible and efficient language understanding and generation.",
          B: "Made models slower and less accurate.",
          C: "Has no significant impact."
        }
      },
      "seq-2-seq": {
        kgain1: {
          A: "Convolutional Neural Networks (CNNs)",
          B: "Recurrent Neural Networks (RNNs)",
          C: "Sequence-to-Sequence (Seq2Seq) model with Encoder and Decoder"
        },
        kgain2: {
          A: "Image classification",
          B: "Machine translation",
          C: "Object detection"
        }
      }
      // Add more papers and their options
    };

    return papersData[paperId][questionName][option] || "";
  };
// Handle KGain Form Submission
if (kgainForm) {
  kgainForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
      alert("Please sign in to continue.");
      return;
    }

    const paperId = document.getElementById('paper-id').value;

    if (paperId !== '') {
      const correctAnswers = getCorrectAnswers(paperId);
      if (correctAnswers !== null) {
        // display the panel with answers
        kgainPanel.style.width = `${panelWidth}px`;
        kgainPanel.innerHTML = `
          <h2>Knowledge Gain Panel</h2>
          <p id="paper-title"></p>
          <button id="submit-btn">Submit</button>
          <div class="answers">
            ${correctAnswers.kgain1} 
            ${correctAnswers.kgain2}
          </div>
        `;

        const paperTitleElement = document.getElementById('paper-title');
        paperTitleElement.textContent = correctAnswers.title;

        const submitButtonElement = document.getElementById('submit-btn');
        if (submitButtonElement) {
          submitButtonElement.addEventListener('click', () => {
            // do something when the button is clicked
            console.log(correctAnswers);
            closeKGainPanel();
          });
        }

        document.addEventListener('click', (e) => {
          if (!kgainPanel.contains(e.target)) {
            closeKGainPanel();
          }
        });

        function openKGainPanel() {
          isPanelOpen = true;
          kgainArrow.style.transform = 'translateX(0)';
        }

        function closeKGainPanel() {
          isPanelOpen = false;
          kgainArrow.style.transform = 'translateX(-20%)';
          kgainPanel.style.width = `${panelWidth}px`;
        }
      } else {
        alert("Please select a paper.");
      }
    } else {
      alert("Please enter a paper ID.");
    }

   });
  }
  */

});
