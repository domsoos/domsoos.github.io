// scisense/js/script.js

document.addEventListener('DOMContentLoaded', () => {
  // Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyCt4qYFZ2asBo7n8oiq32wDNkT0Q-j_rmc",
    authDomain: "scisense-3046c.firebaseapp.com",
    projectId: "scisense-3046c",
    //storageBucket: "YOUR_STORAGE_BUCKET",
    //messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    //appId: "YOUR_APP_ID"
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
  const createAccountButton = document.getElementById('create-account-button');
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
});
