// scisense/js/auth.js

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


  // -----------------------------
  // 2. Helper Functions
  // -----------------------------
  // Function to open a modal
  const openModal = (modal) => {
    modal.style.display = 'block';
  };

  // Function to close a modal
  const closeModalFn = (modal) => {
    modal.style.display = 'none';
  };

  // Event Listeners for Close Buttons
  const closeButtons = document.querySelectorAll('.close-modal');
  closeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const modal = button.closest('.sign-in-container') ||
                    button.closest('.sign-up-container') ||
                    button.closest('.password-reset-container') ||
                    button.closest('.modal');
      closeModalFn(modal);
    });
  });

  // Close Modals when clicking outside the box
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('sign-in-container') || e.target.classList.contains('modal')) {
      closeModalFn(signInModal);
    }
    if (e.target.classList.contains('sign-up-container')) {
      closeModalFn(signUpModal);
    }
    if (e.target.classList.contains('password-reset-container')) {
      closeModalFn(passwordResetModal);
    }
  });

  // -----------------------------
  // 3. Event Listeners
  // -----------------------------
  // Show Sign-In Modal
  signInButton.addEventListener('click', () => {
    if (signInButton.textContent === 'Sign In') {
      openModal(signInModal);
    } else {
      // User is signed in; sign out
      auth.signOut()
        .then(() => {
          console.log('User signed out.');
          signInButton.textContent = 'Sign In';
        })
        .catch((error) => {
          console.error('Sign out error:', error);
        });
    }
  });

  // **New:** Show Sign-Up Modal from "Create Account" Button
  if (createAccountButton) {
    createAccountButton.addEventListener('click', () => {
      openModal(signUpModal);
    });
  }


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

  // Google Sign-In
  googleSignInButton.addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
      .then((result) => {
        console.log('Google sign-in successful:', result.user);
        closeModalFn(signInModal);
        signInButton.textContent = 'Sign Out';
      })
      .catch((error) => {
        console.error('Google sign-in error:', error);
        alert('Google sign-in failed. Please try again.');
      });
  });

  // Email/Password Sign-In
  if (emailSignInForm) {
    emailSignInForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
          console.log('Email sign-in successful:', userCredential.user);
          closeModalFn(signInModal);
          signInButton.textContent = 'Sign Out';
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
  }

  // Handle Sign-Up Form Submission
  if (signUpForm) {
    signUpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('sign-up-name').value.trim();
      const email = document.getElementById('sign-up-email').value.trim();
      const password = document.getElementById('sign-up-password').value;
      const confirmPassword = document.getElementById('sign-up-confirm-password').value;

      // Demographic Information
      const age = document.getElementById('age').value || "Not provided";
      const occupation = document.getElementById('occupation').value.trim() || "Not provided";

      // Categories and Knowledge Levels
      const CATEGORIES = ['nature', 'health', 'tech', 'physics', 'space', 'environment', 'society'];
      const KNOWLEDGE_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

      // Initialize knowledgeLevels and points
      const knowledgeLevels = {};
      const points = {};

      CATEGORIES.forEach(category => {
        knowledgeLevels[category] = 'N/A'; // Default knowledge level
        points[category] = 0; // Initialize points to 0
      });

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
            isAdmin: false, // Initialize isAdmin to false
            knowledgeLevels: knowledgeLevels,
            points: points,
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
  }

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

            /*if (userData.isAdmin) {
              // Show "Submit New Paper" and "Add Discovery" buttons for admins
              //if (submitNewPaperBtn) submitNewPaperBtn.style.display = 'inline-block';
              //if (addDiscoveryBtn) addDiscoveryBtn.style.display = 'inline-block';
            } else {
              // Show only "Add Discovery" button for regular users
              if (addDiscoveryBtn) addDiscoveryBtn.style.display = 'inline-block';
              if (submitNewPaperBtn) submitNewPaperBtn.style.display = 'none';
            }
            */
          } else {
            // User document does not exist
            signInButton.textContent = `${user.email}`;
            // Hide both buttons
            //if (submitNewPaperBtn) submitNewPaperBtn.style.display = 'none';
            //if (addDiscoveryBtn) addDiscoveryBtn.style.display = 'none';
          }
        })
        .catch((error) => {
          console.error('Error fetching user data:', error);
          signInButton.textContent = `Signed in as ${user.email}`;
          // Hide both buttons in case of error
          //if (submitNewPaperBtn) submitNewPaperBtn.style.display = 'none';
          //if (addDiscoveryBtn) addDiscoveryBtn.style.display = 'none';
        });
    } else {
      // User is signed out
      signInButton.textContent = 'Sign In';
      // Hide both buttons
      //if (submitNewPaperBtn) submitNewPaperBtn.style.display = 'none';
      //if (addDiscoveryBtn) addDiscoveryBtn.style.display = 'none';
    }
  });

});
