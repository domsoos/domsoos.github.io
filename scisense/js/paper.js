// scisense/js/paper.js

document.addEventListener('DOMContentLoaded', () => {
  // Example data for demonstration purposes
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

  // Function to get query parameter by name
  function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }

  // Get the 'id' parameter from the URL
  const paperId = getQueryParam('id');

  if (paperId && papersData[paperId]) {
    const paper = papersData[paperId];
    
    // Populate Paper Details
    document.getElementById('paper-title').textContent = paper.title;
    document.getElementById('paper-info').textContent = `${paper.authors} • ${paper.publicationDate}`;
    document.getElementById('paper-abstract').textContent = paper.abstract;
    
    // Populate News Summary
    document.getElementById('news-summary-text').textContent = paper.newsSummary;
    
    // Populate Author Tweets
    const tweetsList = document.getElementById('tweets-list');
    paper.authorTweets.forEach(tweet => {
      const li = document.createElement('li');
      li.textContent = tweet;
      tweetsList.appendChild(li);
    });

    // Set the hidden paper-id input
    document.getElementById('paper-id').value = paperId;
  } else {
    // If no valid paperId is found, display an error message
    document.getElementById('paper-details').innerHTML = '<p>Paper not found.</p>';
    document.getElementById('feedback-form').style.display = 'none';
  }

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

  // Function to open a modal
  const openModal = (modal) => {
    modal.style.display = 'flex';
  };

  // Function to close a modal
  const closeModal = (modal) => {
    modal.style.display = 'none';
  };

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
    closeModal(signInModal);
    openModal(signUpModal);
  });

  // Handle navigation from Sign-Up to Sign-In
  if (signInLinkInSignUp) {
    signInLinkInSignUp.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal(signUpModal);
      openModal(signInModal);
    });
  }

  // Show Password Reset Modal
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal(signInModal);
      openModal(passwordResetModal);
    });
  }

  // Handle navigation from Password Reset to Sign-In
  if (passwordResetSignInLink) {
    passwordResetSignInLink.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal(passwordResetModal);
      openModal(signInModal);
    });
  }

  // Close Modals when clicking outside the box
  window.addEventListener('click', (e) => {
    if (e.target == signInModal) {
      closeModal(signInModal);
    }
    if (e.target == signUpModal) {
      closeModal(signUpModal);
    }
    if (e.target == passwordResetModal) {
      closeModal(passwordResetModal);
    }
  });

  // Google Sign-In
  googleSignInButton.addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
      .then((result) => {
        console.log('Google sign-in successful:', result.user);
        closeModal(signInModal);
      })
      .catch((error) => {
        console.error('Google sign-in error:', error);
        alert('Google sign-in failed. Please try again.');
      });
  });

  // Email/Password Sign-In
  emailSignInForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('sign-in-email').value.trim();
    const password = document.getElementById('sign-in-password').value;

    auth.signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        console.log('Email sign-in successful:', userCredential.user);
        closeModal(signInModal);
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
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      })
      .then(() => {
        console.log('User sign-up successful and data stored.');
        closeModal(signUpModal);
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
          closeModal(passwordResetModal);
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

  // Handle Authentication State
  auth.onAuthStateChanged((user) => {
    if (user) {
      // User is signed in
      // Fetch user's name from Firestore
      db.collection('users').doc(user.uid).get()
        .then((doc) => {
          if (doc.exists) {
            const userData = doc.data();
            signInButton.textContent = `Signed in as ${userData.name}`;
          } else {
            signInButton.textContent = `Signed in as ${user.email}`;
          }
        })
        .catch((error) => {
          console.error('Error fetching user data:', error);
          signInButton.textContent = `Signed in as ${user.email}`;
        });
    } else {
      // User is signed out
      signInButton.textContent = 'Sign In';
    }
  });

  // Handle Create Account Button (Open Sign-Up Modal)
  if (createAccountButton) {
    createAccountButton.addEventListener('click', () => {
      openModal(signUpModal);
    });
  }

  // Submit Feedback Function
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

  // Update User Demographics in Firestore
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

  // Handle Feedback Form Submission
  const feedbackForm = document.getElementById('feedback-form');
  if (feedbackForm) {
    feedbackForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const user = auth.currentUser;
      if (!user) {
        alert('Please sign in to submit feedback.');
        return;
      }

      // Collect Paper ID from Hidden Input
      const paperId = document.getElementById('paper-id').value;

      // Collect Demographic Information
      const demographic = {
        age: document.getElementById('age').value || null,
        academicLevel: document.getElementById('academicLevel').value || null,
        occupation: document.getElementById('occupation').value || null,
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

  // Search Functionality (Optional)
  const searchBox = document.querySelector('.search-box');
  if (searchBox) {
    searchBox.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const query = searchBox.value.trim().toLowerCase();
        if (query) {
          // Redirect to search results page or implement search filtering
          // For simplicity, we'll just alert the search query
          alert(`Search functionality is not yet implemented for query: "${query}"`);
        }
      }
    });
  }
});