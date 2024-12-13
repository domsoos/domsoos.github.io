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
        } else {
          paperTitle.textContent = 'Paper Not Found.';
          paperInfo.textContent = '';
          document.getElementById('abstract').textContent = 'N/A';
          document.getElementById('news-summary-text').textContent = 'N/A';
          tweetsList.innerHTML = '<li>N/A</li>';
        }
      })
      .catch((error) => {
        console.error('Error fetching paper:', error);
        paperTitle.textContent = 'Error Loading Paper.';
        paperInfo.textContent = '';
        document.getElementById('abstract').textContent = 'N/A';
        document.getElementById('news-summary-text').textContent = 'N/A';
        tweetsList.innerHTML = '<li>N/A</li>';
      });
  }

  // Call the function to load paper details
  loadPaperDetails();



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

  // Toggle Feedback Form Visibility
  toggleFeedbackBtn.addEventListener('click', () => {
    feedbackForm.classList.toggle('active');

    // Change button icon and aria-label based on state
    if (feedbackForm.classList.contains('active')) {
      toggleFeedbackBtn.innerHTML = '<i class="fas fa-arrow-down"></i>'; // Down arrow
      toggleFeedbackBtn.setAttribute('aria-label', 'Close Feedback Form');
      
      // Prevent background scrolling
      document.body.style.overflow = 'hidden';
      
      // Move focus to the first input field
      const firstInput = feedbackForm.querySelector('textarea, input, select');
      if (firstInput) {
        firstInput.focus();
      }
    } else {
      toggleFeedbackBtn.innerHTML = '<i class="fas fa-arrow-up"></i>'; // Up arrow
      toggleFeedbackBtn.setAttribute('aria-label', 'Open Feedback Form');
      
      // Restore background scrolling
      document.body.style.overflow = '';
    }
  });

  // Handle Feedback Form Submission
  if (feedbackForm) {
    const feedbackFormInner = document.getElementById('feedback-form-inner');

    feedbackFormInner.addEventListener('submit', (e) => {
      e.preventDefault();

      const user = auth.currentUser;
      if (!user) {
        alert('Please sign in to submit feedback.');
        return;
      }

      const paperId = getPaperIdFromURL();
      if (!paperId) {
        alert('Invalid Paper ID.');
        return;
      }

      // Collect Feedback Data
      const feedbackMessage = document.getElementById('feedback-message').value.trim();

      if (!feedbackMessage) {
        alert('Please enter your feedback.');
        return;
      }

      // Submit Feedback to Firestore
      db.collection('feedback').add({
        userId: user.uid,
        paperId: paperId,
        message: feedbackMessage,
        submittedAt: firebase.firestore.FieldValue.serverTimestamp(),
      })
      .then(() => {
        alert('Thank you for your feedback!');
        feedbackFormInner.reset();
        feedbackForm.classList.remove('active');
        toggleFeedbackBtn.innerHTML = '<i class="fas fa-arrow-up"></i>'; // Reset to up arrow
        toggleFeedbackBtn.setAttribute('aria-label', 'Open Feedback Form');
        document.body.style.overflow = ''; // Restore background scrolling
      })
      .catch((error) => {
        console.error('Error submitting feedback:', error);
        alert('There was an error submitting your feedback. Please try again later.');
      });
    });
  }

    // Handle KGain Form Submission
    if (kgainForm) {
      kgainForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const user = auth.currentUser;
        if (!user) {
          alert('Please sign in to submit your answers.');
          return;
        }

        const paperId = getPaperIdFromURL();
        if (!paperId) {
          alert('Invalid Paper ID.');
          return;
        }

        // Fetch correct answers from Firestore or a predefined object
        const correctAnswers = getCorrectAnswers(paperId);
        if (!correctAnswers) {
          alert('Cannot retrieve correct answers.');
          return;
        }

        const userAnswers = {
          kgain1: kgainForm.kgain1.value,
          kgain2: kgainForm.kgain2.value
        };

        let pointsEarned = 0;
        let feedback = '';

        // Validate answers
        if (userAnswers.kgain1 === correctAnswers.kgain1) {
          pointsEarned += 10;
          feedback += 'Question 1: Correct! +10 points.\n';
        } else {
          feedback += `Question 1: Incorrect. Correct answer: ${correctAnswers.kgain1}) ${getOptionText(paperId, 'kgain1', correctAnswers.kgain1)}\n`;
        }

        if (userAnswers.kgain2 === correctAnswers.kgain2) {
          pointsEarned += 10;
          feedback += 'Question 2: Correct! +10 points.\n';
        } else {
          feedback += `Question 2: Incorrect. Correct answer: ${correctAnswers.kgain2}) ${getOptionText(paperId, 'kgain2', correctAnswers.kgain2)}\n`;
        }

        // Update user points in Firestore
        db.collection('users').doc(user.uid).update({
          points: firebase.firestore.FieldValue.increment(pointsEarned)
        })
        .then(() => {
          feedback += `\nTotal Points Earned: ${pointsEarned}`;
          alert(feedback);
          kgainForm.reset();
          closeKGainPanel();
        })
        .catch((error) => {
          console.error('Error updating points:', error);
          alert('Failed to update points. Please try again.');
        });
      });
    }

    // Handle Feedback Form Submission
    if (feedbackForm) {
      feedbackForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const user = auth.currentUser;
        if (!user) {
          alert('Please sign in to submit feedback.');
        }

        // Collect Paper ID from Hidden Input
        const paperId = paperIdInput.value;

        // Collect Demographic Information
        const demographic = {
          age: document.getElementById('age').value || "Not provided",
          academicLevel: document.getElementById('academicLevel').value || "Not provided",
          occupation: document.getElementById('occupation').value || "Not provided",
        };

        // Collect Stimuli Feedback
        const newsVsAbstracts = document.querySelector('input[name="newsVsAbstracts"]:checked');
        const news1VsNews2 = document.querySelector('input[name="news1VsNews2"]:checked');

        if (!newsVsAbstracts || !news1VsNews2) {
          alert('Please complete all required fields in Stimuli Feedback.');
          return;
        }

        const stimuliFeedback = {
          newsVsAbstracts: newsVsAbstracts.value,
          news1VsNews2: news1VsNews2.value,
        };

        // Collect KGain Feedback
        const kGain1 = document.getElementById('kgain1').value.trim();
        const kGain2 = document.getElementById('kgain2').value.trim();

        if (!kGain1 || !kGain2) {
          alert('Please answer all KGain questions.');
          return;
        }

        const kGainFeedback = {
          question1: kGain1,
          question2: kGain2,
        };

        // Submit Feedback to Firestore
        submitFeedback(user.uid, paperId, demographic, stimuliFeedback, kGainFeedback);

        // Update User Demographics if provided
        updateUserDemographics(user.uid, demographic);

        // Reset Form
        feedbackForm.reset();
        alert('Thank you for your feedback!');
      });
    }

});
