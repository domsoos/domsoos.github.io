// scisense/js/leaderboard.js

document.addEventListener('DOMContentLoaded', () => {
  // Access globally defined Firebase Auth and Firestore
  const auth = window.auth;
  const db = window.db;

  // DOM Elements
  const leaderboardTableBody = document.querySelector('#leaderboard-table tbody');

  // Function to Prompt for Knowledge Level
  function promptKnowledgeLevel(userId) {
    // Create and display modal (reuse existing modal styles)
    // ... existing modal code ...
  }

  // Function to Check and Prompt Knowledge Level
  function checkKnowledgeLevel(user) {
    if (user) {
      db.collection('users').doc(user.uid).get()
        .then((doc) => {
          if (doc.exists) {
            const userData = doc.data();
            if (!userData.knowledgeLevel) {
              promptKnowledgeLevel(user.uid);
            } else {
              fetchAndDisplayLeaderboard();
            }
          }
        })
        .catch((error) => {
          console.error('Error fetching user data:', error);
        });
    }
  }

  // Function to Fetch and Display Leaderboard
  function fetchAndDisplayLeaderboard() {
    leaderboardTableBody.innerHTML = '';

    db.collection('users').get()
      .then((snapshot) => {
        const usersData = [];
        snapshot.forEach((doc) => {
          const user = doc.data();
          if (user.knowledgeLevel && typeof user.points === 'number') {
            usersData.push({
              name: user.name || 'Anonymous',
              knowledgeLevel: user.knowledgeLevel,
              points: user.points
            });
          }
        });

        // Define knowledge level order
        const knowledgeLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

        // Sort users
        usersData.sort((a, b) => {
          const levelA = knowledgeLevels.indexOf(a.knowledgeLevel);
          const levelB = knowledgeLevels.indexOf(b.knowledgeLevel);
          if (levelA !== levelB) {
            return levelB - levelA; // Higher level first
          } else {
            return b.points - a.points; // Then higher points
          }
        });

        // Populate leaderboard
        usersData.forEach((user, index) => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${index + 1}</td>
            <td>${user.name}</td>
            <td>${user.knowledgeLevel}</td>
            <td>${user.points}</td>
          `;
          leaderboardTableBody.appendChild(row);
        });

        if (usersData.length === 0) {
          leaderboardTableBody.innerHTML = `<tr><td colspan="4">No users available for the leaderboard.</td></tr>`;
        }
      })
      .catch((error) => {
        console.error('Error fetching leaderboard:', error);
        leaderboardTableBody.innerHTML = `<tr><td colspan="4">Error loading leaderboard.</td></tr>`;
      });
  }

  // Listen for Auth State Changes
  auth.onAuthStateChanged((user) => {
    if (user) {
      checkKnowledgeLevel(user);
    } else {
      leaderboardTableBody.innerHTML = `<tr><td colspan="4">Please sign in to view the leaderboard.</td></tr>`;
    }
  });

  // Refresh Leaderboard on Tab Click
  const leaderboardTab = document.querySelector('.tab[data-tab="leaderboard"]');
  if (leaderboardTab) {
    leaderboardTab.addEventListener('click', () => {
      const user = auth.currentUser;
      if (user) {
        checkKnowledgeLevel(user);
      } else {
        leaderboardTableBody.innerHTML = `<tr><td colspan="4">Please sign in to view the leaderboard.</td></tr>`;
      }
    });
  }
});
