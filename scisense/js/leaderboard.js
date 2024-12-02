// scisense/js/leaderboard.js

document.addEventListener('DOMContentLoaded', () => {
  // Access globally defined Firebase Auth and Firestore
  const auth = window.auth;
  const db = window.db;

  // DOM Elements
  const leaderboardTableBody = document.querySelector('#leaderboard-table tbody');

  // Function to Prompt for Knowledge Level
  function promptKnowledgeLevel(userId) {
    // Create a modal for input
    const modal = document.createElement('div');
    modal.id = 'knowledge-level-modal';
    modal.classList.add('modal');

    modal.innerHTML = `
      <div class="modal-content">
        <span class="close-modal">&times;</span>
        <h2>Set Your Knowledge Level</h2>
        <form id="knowledge-level-form">
          <label for="knowledge-level">Select your knowledge level:</label>
          <select id="knowledge-level" name="knowledge-level" required>
            <option value="">--Select--</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
            <option value="Expert">Expert</option>
          </select>
          <button type="submit">Submit</button>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    // Show the modal
    modal.style.display = 'block';

    // Close Modal Function
    const closeModal = () => {
      modal.style.display = 'none';
      modal.remove();
    };

    // Event Listener for Close Button
    modal.querySelector('.close-modal').addEventListener('click', closeModal);

    // Event Listener for Outside Click
    window.addEventListener('click', (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });

    // Handle Form Submission
    const knowledgeLevelForm = document.getElementById('knowledge-level-form');
    knowledgeLevelForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const selectedLevel = document.getElementById('knowledge-level').value;

      if (selectedLevel) {
        // Update Firestore with the knowledge level
        db.collection('users').doc(userId).update({
          knowledgeLevel: selectedLevel
        })
        .then(() => {
          alert('Knowledge level updated successfully!');
          closeModal();
          // Refresh the leaderboard
          fetchAndDisplayLeaderboard();
        })
        .catch((error) => {
          console.error('Error updating knowledge level:', error);
          alert('Failed to update knowledge level. Please try again.');
        });
      }
    });
  }

  // Function to Display Sign-Out Message
  function displaySignOutMessage() {
    leaderboardTableBody.innerHTML = `
      <tr>
        <td colspan="4">Please sign in to view the leaderboard.</td>
      </tr>
    `;
  }

  // Function to Fetch and Display Leaderboard
  function fetchAndDisplayLeaderboard() {
    // Clear existing leaderboard entries
    leaderboardTableBody.innerHTML = '';

    // Fetch all users with their knowledgeLevel and points
    db.collection('users').get()
      .then((snapshot) => {
        const usersData = [];
        snapshot.forEach((doc) => {
          const user = doc.data();
          // Include all users, even without knowledgeLevel
          usersData.push({
            name: user.name || 'Anonymous',
            knowledgeLevel: user.knowledgeLevel || 'N/A',
            points: typeof user.points === 'number' ? user.points : 0
          });
        });

        // Define the order of knowledge levels
        const knowledgeLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

        // Sort users based on knowledge level and points
        usersData.sort((a, b) => {
          const levelA = knowledgeLevels.indexOf(a.knowledgeLevel);
          const levelB = knowledgeLevels.indexOf(b.knowledgeLevel);

          // Users with 'N/A' knowledge level are ranked lower
          if (a.knowledgeLevel === 'N/A' && b.knowledgeLevel !== 'N/A') return 1;
          if (b.knowledgeLevel === 'N/A' && a.knowledgeLevel !== 'N/A') return -1;

          if (levelA !== levelB) {
            return levelB - levelA; // Higher knowledge level first
          } else {
            return b.points - a.points; // Then higher points
          }
        });

        // Populate the leaderboard table
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

        // Handle case when no users have data
        if (usersData.length === 0) {
          leaderboardTableBody.innerHTML = `
            <tr>
              <td colspan="4">No users available for the leaderboard.</td>
            </tr>
          `;
        }
      })
      .catch((error) => {
        console.error('Error fetching users for leaderboard:', error);
        leaderboardTableBody.innerHTML = `
          <tr>
            <td colspan="4">Error loading leaderboard.</td>
          </tr>
        `;
      });
  }

  // Function to Check and Prompt Knowledge Level
  function checkKnowledgeLevel(user) {
    if (user) {
      db.collection('users').doc(user.uid).get()
        .then((doc) => {
          if (doc.exists) {
            const userData = doc.data();
            if (!userData.knowledgeLevel) {
              // Prompt the user to input knowledge level
              promptKnowledgeLevel(user.uid);
            }
            // Proceed to display leaderboard regardless of knowledgeLevel
            fetchAndDisplayLeaderboard();
          } else {
            console.warn('No such user document!');
            // Optionally, prompt for knowledge level
            promptKnowledgeLevel(user.uid);
            fetchAndDisplayLeaderboard();
          }
        })
        .catch((error) => {
          console.error('Error fetching user data:', error);
          // Optionally, prompt for knowledge level
          promptKnowledgeLevel(user.uid);
          fetchAndDisplayLeaderboard();
        });
    } else {
      // User is signed out, display message
      displaySignOutMessage();
    }
  }

  // Listen for Auth State Changes
  auth.onAuthStateChanged((user) => {
    checkKnowledgeLevel(user);
  });

  // Refresh Leaderboard on Tab Click
  const leaderboardTab = document.querySelector('.tab[data-tab="leaderboard"]');
  if (leaderboardTab) {
    leaderboardTab.addEventListener('click', () => {
      const user = auth.currentUser;
      checkKnowledgeLevel(user);
    });
  }
});