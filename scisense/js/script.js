// script.js

/*
// Initialize Firebase after the Firebase SDKs have loaded
document.addEventListener('DOMContentLoaded', () => {
  // Your web app's Firebase configuration
  const { initializeApp } = require('firebase-admin/app');
  //var admin = require("firebase-admin");

  var serviceAccount = require("./private_key/scisense.json");
  //const app = initializeApp();
  const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  
  /*const firebaseConfig = {
    apiKey: "",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
  };*/

// scisense/js/script.js

document.addEventListener('DOMContentLoaded', () => {
  // Firebase configuration
  const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
  };

  // Initialize Firebase
  const app = firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.firestore();

  // DOM Elements
  const signInButton = document.getElementById('sign-in-button');
  const signInModal = document.getElementById('sign-in-modal');
  const googleSignInButton = document.getElementById('google-sign-in');
  const emailSignInForm = document.getElementById('email-sign-in-form');
  const signUpLink = document.getElementById('sign-up-link');
  const createAccountButton = document.getElementById('create-account-button');
  const feedbackForm = document.getElementById('feedback-form');

  // Show Sign-In Modal
  signInButton.addEventListener('click', () => {
    signInModal.style.display = 'flex';
  });

  // Close Modal when clicking outside the box
  window.addEventListener('click', (e) => {
    if (e.target == signInModal) {
      signInModal.style.display = 'none';
    }
  });

  // Google Sign-In
  googleSignInButton.addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
      .then((result) => {
        console.log('Google sign-in successful:', result.user);
        signInModal.style.display = 'none';
      })
      .catch((error) => {
        console.error('Google sign-in error:', error);
      });
  });

  // Email/Password Sign-In
  emailSignInForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    auth.signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        console.log('Email sign-in successful:', userCredential.user);
        signInModal.style.display = 'none';
      })
      .catch((error) => {
        console.error('Email sign-in error:', error);
      });
  });

  // Sign-Up Link
  signUpLink.addEventListener('click', (e) => {
    e.preventDefault();
    const email = prompt("Enter your email:");
    const password = prompt("Enter your password:");
    if (email && password) {
      auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
          console.log('User sign-up successful:', userCredential.user);
          signInModal.style.display = 'none';
        })
        .catch((error) => {
          console.error('User sign-up error:', error);
        });
    }
  });

  // Create Account Button (similar to sign-up)
  createAccountButton.addEventListener('click', () => {
    signInModal.style.display = 'flex';
  });

  // Handle Authentication State
  auth.onAuthStateChanged((user) => {
    if (user) {
      console.log('User is signed in:', user);
      signInButton.textContent = 'Sign Out';

      // Remove existing event listeners to prevent multiple bindings
      signInButton.replaceWith(signInButton.cloneNode(true));

      const updatedSignInButton = document.getElementById('sign-in-button');
      updatedSignInButton.addEventListener('click', () => {
        auth.signOut().then(() => {
          console.log('User signed out.');
        }).catch((error) => {
          console.error('Sign out error:', error);
        });
      });

      // Store user information in Firestore
      db.collection('users').doc(user.uid).set({
        email: user.email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        // Add additional user info if needed
      }, { merge: true });
    } else {
      signInButton.textContent = 'Sign In';
      // Remove existing event listeners to prevent multiple bindings
      signInButton.replaceWith(signInButton.cloneNode(true));

      const updatedSignInButton = document.getElementById('sign-in-button');
      updatedSignInButton.addEventListener('click', () => {
        signInModal.style.display = 'flex';
      });
    }
  });

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
    });
  }

  // Handle Feedback Form Submission
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

      // Reset Form
      feedbackForm.reset();
      alert('Thank you for your feedback!');
    });
  }

  // Dynamic Paper Details Loading
  if (window.location.pathname.endsWith('paper.html')) {
    const urlParams = new URLSearchParams(window.location.search);
    const paperId = urlParams.get('id');

    if (paperId) {
      // Fetch paper details from Firestore
      db.collection('papers').doc(paperId).get()
        .then((doc) => {
          if (doc.exists) {
            const paper = doc.data();
            document.getElementById('paper-title').textContent = paper.title;
            document.getElementById('paper-info').textContent = `${paper.authors} • ${paper.publicationDate.toDate().toDateString()}`;
            document.getElementById('paper-abstract').textContent = paper.abstract;
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
            // Paper not found
            document.getElementById('paper-details').innerHTML = '<p>Paper not found.</p>';
            document.getElementById('feedback-form').style.display = 'none';
          }
        })
        .catch((error) => {
          console.error("Error fetching paper details:", error);
          document.getElementById('paper-details').innerHTML = '<p>Error loading paper details.</p>';
          document.getElementById('feedback-form').style.display = 'none';
        });
    } else {
      // No paper ID provided
      document.getElementById('paper-details').innerHTML = '<p>No paper selected.</p>';
      document.getElementById('feedback-form').style.display = 'none';
    }
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