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
      paperAbstract.textContent = '';
      newsSummaryText.textContent = '';
      tweetsList.innerHTML = '';
      if (feedbackForm) feedbackForm.style.display = 'none';
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
            // Optional: Format the date string if it's in a recognizable format
            const dateObj = new Date(paper.date);
            if (!isNaN(dateObj)) {
              submissionDate = dateObj.toLocaleDateString();
            } else {
              // If the date string is not in a standard format, display it as is
              submissionDate = paper.date;
            }
          }
          const authors = paper.authors ? paper.authors : 'Unknown Authors';
          paperInfo.textContent = `${authors} • ${submissionDate}`;

          // Populate Abstract
          paperAbstract.textContent = paper.abstract ? paper.abstract : 'No abstract available.';

          // Populate News Summary
          newsSummaryText.textContent = paper.news ? paper.news : 'No news summary available.';

          // Populate Author Tweets
          tweetsList.innerHTML = ''; // Clear existing tweets
          if (paper.tweets && Array.isArray(paper.tweets) && paper.tweets.length > 0) {
            paper.tweets.forEach(tweet => {
              const li = document.createElement('li');
              li.textContent = tweet;
              tweetsList.appendChild(li);
            });
          } else {
            tweetsList.innerHTML = '<li>No tweets available.</li>';
          }

          // If you have a hidden input for paperId, set its value
          if (paperIdInput) {
            paperIdInput.value = paperId;
          }
        } else {
          paperTitle.textContent = 'Paper Not Found.';
          paperInfo.textContent = '';
          paperAbstract.textContent = '';
          newsSummaryText.textContent = '';
          tweetsList.innerHTML = '';
          if (feedbackForm) feedbackForm.style.display = 'none';
        }
      })
      .catch((error) => {
        console.error('Error fetching paper:', error);
        paperTitle.textContent = 'Error Loading Paper.';
        paperInfo.textContent = '';
        paperAbstract.textContent = '';
        newsSummaryText.textContent = '';
        tweetsList.innerHTML = '';
        if (feedbackForm) feedbackForm.style.display = 'none';
      });
  }

  // Call the function to load paper details
  loadPaperDetails();

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

  /*
  // Function to load paper details
  const loadPaperDetails = () => {
    const paperId = getPaperIdFromURL();
    if (!paperId) {
      document.getElementById('paper-details').innerHTML = '<p>Invalid Paper ID.</p>';
      feedbackForm.style.display = 'none';
      return;
    }

    // Mock Data (Replace with Firestore data fetching if needed)
    const papersData = {
      "deep-learning-approaches-in-ai": {
        title: "Deep Learning Approaches in AI",
        authors: "Foo Bar, John Doe",
        publicationDate: "Jan 1, 2024",
        abstract: "This paper explores various deep learning techniques applied to artificial intelligence, highlighting their strengths and limitations in different contexts.",
        newsSummary: "A groundbreaking study unveils new deep learning methods that significantly enhance AI capabilities in natural language processing and computer vision.",
        authorTweets: [
          "Excited to share our latest research on deep learning in AI! #AI #DeepLearning",
          "Our new paper on AI approaches is now published. Check it out! #MachineLearning"
        ]
      },
      "language-models-are-few-shot-learners": {
        title: "Language Models are Few-Shot Learners",
        authors: "Tom Brown et al.",
        publicationDate: "July 22, 2020",
        abstract: "Recent work has demonstrated substantial gains on many NLP tasks and benchmarks by pre-training on a large corpus of text followed by fine-tuning on a specific task. While typically task-agnostic in architecture, this method still requires task-specific fine-tuning datasets of thousands or tens of thousands of examples. By contrast, humans can generally perform a new language task from only a few examples or from simple instructions - something which current NLP systems still largely struggle to do. Here we show that scaling up language models greatly improves task-agnostic, few-shot performance, sometimes even reaching competitiveness with prior state-of-the-art fine-tuning approaches. Specifically, we train GPT-3, an autoregressive language model with 175 billion parameters, 10x more than any previous non-sparse language model, and test its performance in the few-shot setting. For all tasks, GPT-3 is applied without any gradient updates or fine-tuning, with tasks and few-shot demonstrations specified purely via text interaction with the model. GPT-3 achieves strong performance on many NLP datasets, including translation, question-answering, and cloze tasks, as well as several tasks that require on-the-fly reasoning or domain adaptation, such as unscrambling words, using a novel word in a sentence, or performing 3-digit arithmetic. At the same time, we also identify some datasets where GPT-3's few-shot learning still struggles, as well as some datasets where GPT-3 faces methodological issues related to training on large web corpora. Finally, we find that GPT-3 can generate samples of news articles which human evaluators have difficulty distinguishing from articles written by humans. We discuss broader societal impacts of this finding and of GPT-3 in general.",
        newsSummary: "Researchers have demonstrated that advanced language models can perform tasks with minimal examples, paving the way for more versatile AI applications.",
        authorTweets: [
          "Thrilled to present our findings on few-shot learning in language models! #NLP #AIResearch",
          "Our latest paper shows the potential of language models with just a few examples. Dive into the details! #AI #MachineLearning"
        ]
      },
      "seq-2-seq": {
        title: "Sequence to sequence learning with neural networks",
        authors: "Ilya Sutskever, Oriol Vinyals, Quoc V. Le",
        publicationDate: "2014",
        abstract: "Deep Neural Networks (DNNs) are powerful models that have achieved excellent performance on difficult learning tasks. Although DNNs work well whenever large labeled training sets are available, they cannot be used to map sequences to sequences. In this paper, we present a general end-to-end approach to sequence learning that makes minimal assumptions on the sequence structure. Our method uses a multilayered Long Short-Term Memory (LSTM) to map the input sequence to a vector of a fixed dimensionality, and then another deep LSTM to decode the target sequence from the vector. Our main result is that on an English to French translation task from the WMT-14 dataset, the translations produced by the LSTM achieve a BLEU score of 34.8 on the entire test set, where the LSTM's BLEU score was penalized on out-of-vocabulary words. Additionally, the LSTM did not have difficulty on long sentences. For comparison, a phrase-based SMT system achieves a BLEU score of 33.3 on the same dataset. When we used the LSTM to rerank the 1000 hypotheses produced by the aforementioned SMT system, its BLEU score increases to 36.5, which is close to the previous state of the art. The LSTM also learned sensible phrase and sentence representations that are sensitive to word order and are relatively invariant to the active and the passive voice. Finally, we found that reversing the order of the words in all source sentences (but not target sentences) improved the LSTM's performance markedly, because doing so introduced many short term dependencies between the source and the target sentence which made the optimization problem easier.",
        newsSummary: "A new LSTM-based model boosts machine translation, outperforming traditional systems in English-to-French tasks. By reversing word order, researchers achieved a remarkable 36.5 BLEU score, hinting at LSTM's game-changing potential for sequence learning.",
        authorTweets: [
          "🚀 New breakthrough in #MachineTranslation! Our LSTM model outshines traditional methods with a BLEU score of 36.5 on English-to-French translations. #AI #NLP",
          "Big leap for sequence learning—LSTM stays strong on long sentences and complex structures. Excited to see where this takes us! #AIResearch"
        ]
      }
      // Add more papers as needed
    };

    if (paperId && papersData[paperId]) {
      const paper = papersData[paperId];
      console.log("Paper ID found", paperId);
      alert("Paper ID found in the database....");
      
      // Populate Paper Details
      document.getElementById('paper-title').textContent = paper.title;
      document.getElementById('paper-info').textContent = `${paper.authors} • ${paper.publicationDate}`;
      document.getElementById('paper-abstract').textContent = paper.abstract;
      
      // Populate News Summary
      document.getElementById('news-summary-text').textContent = paper.newsSummary;
      
      // Populate Author Tweets
      const tweetsList = document.getElementById('tweets-list');
      tweetsList.innerHTML = ''; // Clear existing tweets
      paper.authorTweets.forEach(tweet => {
        const li = document.createElement('li');
        li.textContent = tweet;
        tweetsList.appendChild(li);
      });

      // Set the hidden paper-id input
      paperIdInput.value = paperId;
    } else {
      console.log("Paper ID not found in the database...");
      alert("Paper ID not found in the database....");
      // If no valid paperId is found, display an error message
      document.getElementById('paper-details').innerHTML = '<p>Paper not found.</p>';
      document.getElementById('feedback-form').style.display = 'none';
    }

    // Function to submit feedback to Firestore
    function submitFeedback(userId, paperId, demographic, stimuliFeedback, kGainFeedback) {
      db.collection('feedback').add({
        userId: userId,
        paperId: paperId, // Associate feedback with the specific paper
        demographic: demographic, // { age, academicLevel, occupation }
        stimuliFeedback: stimuliFeedback, // { newsVsAbstracts, news1VsNews2 }
        kGainFeedback: kGainFeedback, // { question1, question2 }
        submittedAt: firebase.firestore.FieldValue.serverTimestamp(),
      })
      .then(() => {
        console.log("Feedback submitted successfully.");
      })
      .catch((error) => {
        console.error("Error submitting feedback: ", error);
        alert('There was an error submitting your feedback. Please try again later.');
      });
    }

    // Function to update user demographics in Firestore
    function updateUserDemographics(userId, demographic) {
      // Only update if at least one demographic field is provided
      const { age, academicLevel, occupation } = demographic;
      if (age || academicLevel || occupation) {
        const updates = {};
        if (age) updates.age = age;
        if (academicLevel) updates.academicLevel = academicLevel;
        if (occupation) updates.occupation = occupation;

        db.collection('users').doc(userId).update(updates)
          .then(() => {
            console.log('User demographics updated successfully.');
          })
          .catch((error) => {
            console.error('Error updating user demographics:', error);
          });
      }
    }
    */

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
