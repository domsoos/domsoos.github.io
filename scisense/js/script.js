// scisense/js/script.js

document.addEventListener('DOMContentLoaded', () => {
  // Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyCt4qYFZ2asBo7n8oiq32wDNkT0Q-j_rmc",
    authDomain: "scisense-3046c.firebaseapp.com",
    projectId: "scisense-3046c",
    // Add other Firebase config parameters if needed
  };

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.firestore();

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

  const submitNewPaperBtn = document.getElementById('submit-new-paper-btn');

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
      signInButton.textContent = 'Sign In to Input New Papers and MORE';
      // Hide Submit New Paper Button
      if (submitNewPaperBtn) {
        submitNewPaperBtn.style.display = 'inline-block'; // change this to equal to 'none' to keep it hidden
      }
    }
  });


  // Handle Create Account Button (Open Sign-Up Modal)
  if (createAccountButton) {
    createAccountButton.addEventListener('click', () => {
      openModal(signUpModal);
    });
  }


    // Handle Submit New Paper Button Click
  if (submitNewPaperBtn) {
    submitNewPaperBtn.addEventListener('click', () => {
      window.location.href = 'input_data.html';
    });
  }

  const contentList = document.getElementById('content-list');
  const loadingMessage = document.getElementById('loading-message');

  // Function to fetch and display papers
  function displayPapers() {
    console.log('Fetching papers from Firestore...');
    const searchInput = document.getElementById('search-input');
  
    db.collection('papers')
      .orderBy('submittedAt', 'desc') // Order papers by 'submittedAt' field, latest first
      .onSnapshot((snapshot) => {
        if (snapshot.empty) {
          if (loadingMessage) {
            loadingMessage.textContent = 'No papers available at the moment.';
          }
          return;
        }
  
        if (loadingMessage) {
          loadingMessage.style.display = 'none';
        }
  
        // Event listener for search input
        searchInput.addEventListener('input', () => {
          const query = searchInput.value.toLowerCase();
          updatePaperList(snapshot.docs, query);
        });
  
        // Initial rendering of the papers
        updatePaperList(snapshot.docs, '');
      }, (error) => {
        console.error('Error fetching papers:', error);
        contentList.innerHTML = '<p>Error loading papers.</p>';
      });
  }

  function updatePaperList(docs, query) {
    contentList.innerHTML = ''; // Clear the current list
  
    // Filter the papers based on the query
    const filteredDocs = docs.filter((doc) => {
      const paper = doc.data();
      const title = (paper.title || '').toLowerCase();
      const authors = (paper.authors || '').toLowerCase();
      const tags = (paper.tags || []).map(tag => tag.toLowerCase()).join(', ');
  
      // Check if the query matches the title, authors, or tags
      return (
        title.includes(query) ||
        authors.includes(query) ||
        tags.includes(query)
      );
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
      const authors = paper.authors ? paper.authors : 'Unknown Authors';
  
      // Handling the 'date' field
      let formattedDate = 'N/A';
      if (paper.date && paper.date.toDate) {
        try {
          formattedDate = paper.date.toDate().toLocaleDateString();
        } catch (error) {
          console.error('Error formatting date:', error);
        }
      }
      infoP.textContent = `${authors} • ${formattedDate}`;
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
      contentList.innerHTML = '<p>No papers match your search.</p>';
    }
  }
  
  displayPapers();

});
