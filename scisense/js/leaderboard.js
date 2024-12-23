// scisense/js/leaderboard.js

document.addEventListener('DOMContentLoaded', () => {
  // Access globally defined Firebase Auth and Firestore
  const auth = window.auth;
  const db = window.db;

  // DOM Elements
  const leaderboardTableBody = document.querySelector('#leaderboard-table tbody');
  const leaderboardCategorySelect = document.getElementById('leaderboard-category');
  const CATEGORIES = ['nature', 'health', 'tech', 'physics', 'space', 'environment', 'society', 'general'];
  const KNOWLEDGE_LEVELS = ['Novice', 'Junior Researcher', 'Expert'];

  // Function to Prompt for Knowledge Levels
  function promptKnowledgeLevels(userId) {
    // Create a modal for input
    const modal = document.createElement('div');
    modal.id = 'knowledge-level-modal';
    modal.classList.add('modal');

    // Generate form fields for each category
    let formFields = '';
    CATEGORIES.forEach(category => {
      formFields += `
        <label for="${category}-knowledge-level">${capitalizeFirstLetter(category)} Knowledge Level:</label>
        <select id="${category}-knowledge-level" name="${category}-knowledge-level" required>
          <option value="">--Select--</option>
      `;
      KNOWLEDGE_LEVELS.forEach(level => {
        formFields += `<option value="${level}">${level}</option>`;
      });
      formFields += `</select><br><br>`;
    });

    modal.innerHTML = `
      <div class="modal-content">
        <span class="close-modal">&times;</span>
        <h2>Set Your Knowledge Levels</h2>
        <form id="knowledge-level-form">
          ${formFields}
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
      const updatedKnowledgeLevels = {};

      let allValid = true;
      CATEGORIES.forEach(category => {
        const selectedLevel = document.getElementById(`${category}-knowledge-level`).value;
        if (selectedLevel) {
          updatedKnowledgeLevels[category] = selectedLevel;
        } else {
          allValid = false;
          alert(`Please select a knowledge level for ${capitalizeFirstLetter(category)}.`);
        }
      });

      if (allValid) {
        // Update Firestore with the knowledge levels
        db.collection('users').doc(userId).update({
          knowledgeLevels: updatedKnowledgeLevels
        })
        .then(() => {
          alert('Knowledge levels updated successfully!');
          closeModal();
          // Refresh the leaderboard
          const selectedCategory = leaderboardCategorySelect.value;
          fetchAndDisplayLeaderboard(selectedCategory);
        })
        .catch((error) => {
          console.error('Error updating knowledge levels:', error);
          alert('Failed to update knowledge levels. Please try again.');
        });
      }
    });
  }

  // Helper Function to Capitalize First Letter
  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  // Function to Display Sign-Out Message
  function displaySignOutMessage() {
    leaderboardTableBody.innerHTML = `
      <tr>
        <td colspan="4">Please sign in to view the leaderboard.</td>
      </tr>
    `;
  }

  // Function to Fetch and Display Leaderboard based on Category
  function fetchAndDisplayLeaderboard(category) {
    // Clear existing leaderboard entries and show loading message
    leaderboardTableBody.innerHTML = `
      <tr>
        <td colspan="4">Loading leaderboard...</td>
      </tr>
    `;

    // Define the Firestore query
    let query = db.collection('users');

    if (category !== 'all') {
      query = query.where(`knowledgeLevels.${category}`, '!=', 'N/A');
    }

    query.get()
      .then((snapshot) => {
        if (snapshot.empty) {
          leaderboardTableBody.innerHTML = `
            <tr>
              <td colspan="4">No users available for the selected category.</td>
            </tr>
          `;
          return;
        }

        // Process and sort users based on 'points' in the selected category
        const users = [];
        snapshot.forEach(doc => {
          const user = doc.data();
          const points = user.points && user.points[category] ? user.points[category] : 0;
          if (user.knowledgeLevels && user.knowledgeLevels[category] && user.knowledgeLevels[category] !== 'N/A') {
            users.push({
              name: user.name,
              knowledgeLevel: user.knowledgeLevels[category],
              points: points
            });
          }
        });

        // Sort users by points descending
        users.sort((a, b) => b.points - a.points);

        // Populate leaderboard table
        leaderboardTableBody.innerHTML = ''; // Clear existing entries

        users.forEach((user, index) => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${index + 1}</td>
            <td>${user.name}</td>
            <td>${user.knowledgeLevel}</td>
            <td>${user.points}</td>
          `;
          leaderboardTableBody.appendChild(row);
        });

        // If no users match the criteria
        if (users.length === 0) {
          leaderboardTableBody.innerHTML = `
            <tr>
              <td colspan="4">Please select a category</td>
            </tr>
          `;
        }
      })
      .catch((error) => {
        console.error('Error fetching leaderboard data:', error);
        leaderboardTableBody.innerHTML = `
          <tr>
            <td colspan="4">Error loading leaderboard.</td>
          </tr>
        `;
      });
  }

  // Function to Check and Prompt Knowledge Levels
  function checkKnowledgeLevels(user) {
    if (user) {
      db.collection('users').doc(user.uid).get()
        .then((doc) => {
          if (doc.exists) {
            const userData = doc.data();
            let missingCategories = [];

            CATEGORIES.forEach(category => {
              if (!userData.knowledgeLevels || !userData.knowledgeLevels[category] || userData.knowledgeLevels[category] === 'N/A') {
                missingCategories.push(category);
              }
            });

            if (missingCategories.length > 0) {
              // Prompt the user to input missing knowledge levels
              promptKnowledgeLevels(user.uid);
            }

            // Proceed to display leaderboard
            const selectedCategory = leaderboardCategorySelect.value;
            fetchAndDisplayLeaderboard(selectedCategory);
          } else {
            console.warn('No such user document!');
            // Optionally, prompt for knowledge levels
            promptKnowledgeLevels(user.uid);
            const selectedCategory = leaderboardCategorySelect.value;
            fetchAndDisplayLeaderboard(selectedCategory);
          }
        })
        .catch((error) => {
          console.error('Error fetching user data:', error);
          // Optionally, prompt for knowledge levels
          promptKnowledgeLevels(user.uid);
          const selectedCategory = leaderboardCategorySelect.value;
          fetchAndDisplayLeaderboard(selectedCategory);
        });
    } else {
      // User is signed out, display message
      displaySignOutMessage();
    }
  }

  // Listen for Auth State Changes
  auth.onAuthStateChanged((user) => {
    checkKnowledgeLevels(user);
  });

  // Event Listener for Category Selection in Leaderboard
  if (leaderboardCategorySelect) {
    leaderboardCategorySelect.addEventListener('change', (e) => {
      const selectedCategory = e.target.value;
      fetchAndDisplayLeaderboard(selectedCategory);
    });
  }

  // Refresh Leaderboard on Tab Click
  const leaderboardTab = document.querySelector('.tab[data-tab="leaderboard"]');
  if (leaderboardTab) {
    leaderboardTab.addEventListener('click', () => {
      const user = auth.currentUser;
      checkKnowledgeLevels(user);
    });
  }
});
