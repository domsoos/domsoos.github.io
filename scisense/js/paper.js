// scisense/js/paper.js

document.addEventListener('DOMContentLoaded', () => {
  const firebaseConfig = {
    apiKey: "AIzaSyCt4qYFZ2asBo7n8oiq32wDNkT0Q-j_rmc",
    authDomain: "scisense-3046c.firebaseapp.com",
    projectId: "scisense-3046c",
    // Add other Firebase config parameters if needed
  };

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  // Firebase is already initialized in script.js
  const db = firebase.firestore();
  const auth = firebase.auth();

  // DOM Elements
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
                    button.closest('.password-reset-container') ||
                    button.closest('.kgain-panel');
      closeModalFn(modal);
    });
  });

  // Show Sign-In Modal
  signInButton.addEventListener('click', () => {
    if (signInButton.textContent === 'Sign In') {
      openModal(signInModal);
    } else {
      // User is signed in; sign out
      auth.signOut()
        .then(() => {
          console.log('User signed out.');
        })
        .catch((error) => {
          console.error('Sign out error:', error);
        });
    }
  });

  // Show Sign-Up Modal
  signUpLink.addEventListener('click', (e) => {
    e.preventDefault();
    closeModalFn(signInModal);
    openModal(signUpModal);
  });

  // Handle navigation from Sign-Up to Sign-In
  if (signInLinkInSignUp) {
    signInLinkInSignUp.addEventListener('click', (e) => {
      e.preventDefault();
      closeModalFn(signUpModal);
      openModal(signInModal);
    });
  }

  // Show Password Reset Modal
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', (e) => {
      e.preventDefault();
      closeModalFn(signInModal);
      openModal(passwordResetModal);
    });
  }

  // Handle navigation from Password Reset to Sign-In
  if (passwordResetSignInLink) {
    passwordResetSignInLink.addEventListener('click', (e) => {
      e.preventDefault();
      closeModalFn(passwordResetModal);
      openModal(signInModal);
    });
  }

  // Close Modals when clicking outside the box
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('sign-in-container')) {
      closeModalFn(signInModal);
    }
    if (e.target.classList.contains('sign-up-container')) {
      closeModalFn(signUpModal);
    }
    if (e.target.classList.contains('password-reset-container')) {
      closeModalFn(passwordResetModal);
    }
    if (e.target.classList.contains('kgain-panel')) {
      closeModalFn(kgainPanel);
    }
  });

  // Google Sign-In
  googleSignInButton.addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
      .then((result) => {
        console.log('Google sign-in successful:', result.user);
        closeModalFn(signInModal);
      })
      .catch((error) => {
        console.error('Google sign-in error:', error);
        alert('Google sign-in failed. Please try again.');
      });
  });

  // Email/Password Sign-In
  emailSignInForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    auth.signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        console.log('Email sign-in successful:', userCredential.user);
        closeModalFn(signInModal);
      })
      .catch((error) => {
        console.error('Email sign-in error:', error);
        if (error.code === 'auth/user-not-found') {
          alert('No account found with this email.');
        } else if (error.code === 'auth/wrong-password') {
          alert('Incorrect password. Please try again.');
        } else {
          alert('Sign-in failed. Please try again.');
        }
      });
  });

  // Handle Sign-Up Form Submission
  signUpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('sign-up-name').value.trim();
    const email = document.getElementById('sign-up-email').value.trim();
    const password = document.getElementById('sign-up-password').value;
    const confirmPassword = document.getElementById('sign-up-confirm-password').value;

    // Demographic and Knowledge Level fields
    const age = document.getElementById('age').value || "Not provided";
    const occupation = document.getElementById('occupation').value.trim() || "Not provided";
    const knowledgeLevelInput = document.querySelector('input[name="knowledgeLevel"]:checked');
    const knowledgeLevel = knowledgeLevelInput ? knowledgeLevelInput.value : null;

    if (!knowledgeLevel) {
      alert('Please select your level of knowledge.');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        // Add user details to Firestore
        return db.collection('users').doc(userCredential.user.uid).set({
          name: name,
          email: email,
          age: age,
          occupation: occupation,
          knowledgeLevel: knowledgeLevel,
          points: 0, // Initialize points
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      })
      .then(() => {
        console.log('User sign-up successful and data stored.');
        closeModalFn(signUpModal);
      })
      .catch((error) => {
        console.error('User sign-up error:', error);
        if (error.code === 'auth/email-already-in-use') {
          alert('This email is already linked to an account.');
        } else if (error.code === 'auth/weak-password') {
          alert('Password is too weak. Please choose a stronger password.');
        } else {
          alert('Sign-up failed. Please try again.');
        }
      });
  });

  // Handle Password Reset Form Submission
  if (passwordResetForm) {
    passwordResetForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const resetEmail = document.getElementById('reset-email').value.trim();

      auth.sendPasswordResetEmail(resetEmail)
        .then(() => {
          console.log('Password reset email sent.');
          alert('Password reset link has been sent to your email.');
          closeModalFn(passwordResetModal);
        })
        .catch((error) => {
          console.error('Error sending password reset email:', error);
          if (error.code === 'auth/user-not-found') {
            alert('No account found with this email.');
          } else if (error.code === 'auth/invalid-email') {
            alert('Invalid email address.');
          } else {
            alert('Error sending password reset email. Please try again.');
          }
        });
    });
  }

  // Handle Authentication State and UI Updates
  auth.onAuthStateChanged((user) => {
    if (user) {
      // User is signed in
      // Fetch user's name from Firestore
      db.collection('users').doc(user.uid).get()
        .then((doc) => {
          if (doc.exists) {
            const userData = doc.data();
            signInButton.textContent = `Signed in as ${userData.name}`;
            // Show Submit New Paper Button
            if (submitNewPaperBtn) {
              submitNewPaperBtn.style.display = 'inline-block';
            }
          } else {
            signInButton.textContent = `Signed in as ${user.email}`;
            // Show Submit New Paper Button
            if (submitNewPaperBtn) {
              submitNewPaperBtn.style.display = 'inline-block';
            }
          }
        })
        .catch((error) => {
          console.error('Error fetching user data:', error);
          signInButton.textContent = `Signed in as ${user.email}`;
          // Show Submit New Paper Button
          if (submitNewPaperBtn) {
            submitNewPaperBtn.style.display = 'inline-block';
          }
        });
    } else {
      // User is signed out
      signInButton.textContent = 'Sign In';
      // Hide Submit New Paper Button
      if (submitNewPaperBtn) {
        submitNewPaperBtn.style.display = 'none'; // change this to equal to 'none' to keep it hidden
      }
    }
  });


  // Handle Create Account Button (Open Sign-Up Modal)
  if (createAccountButton) {
    createAccountButton.addEventListener('click', () => {
      openModal(signUpModal);
    });
  }

  // KGain Panel Functionality
  if (kgainArrow && kgainPanel && kgainCloseBtn) {
    kgainArrow.addEventListener('click', () => {
      kgainPanel.classList.add('active');
    });

    kgainCloseBtn.addEventListener('click', () => {
      kgainPanel.classList.remove('active');
    });
  }

    // Handle Submit New Paper Button Click
  if (submitNewPaperBtn) {
    submitNewPaperBtn.addEventListener('click', () => {
      window.location.href = 'input_data.html';
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
