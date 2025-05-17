// scisense/js/input_data.js

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

  const addOptionBtn = document.getElementById('add-option-btn');
  const optionsContainer = document.getElementById('options-container');
  const correctAnswerSelect = document.getElementById('correct-answer');

  const addKGainBtn = document.getElementById('add-kgain-btn');
  const addKGainModal = document.getElementById('add-kgain-modal');
  const addKGainForm = document.getElementById('add-kgain-form');
  addKGainBtn.style.display = 'inline-block';
  const selectPaper = document.getElementById('select-paper');
  const closeModalBtns = document.querySelectorAll('.close-modal');

  const questionCountInput = document.getElementById('question-count');
  const questionFieldsContainer = document.getElementById('question-fields-container');

  // Verify essential elements are present
  if (!optionsContainer) {
    console.error("Error: 'options-container' element not found in the DOM.");
    return;
  }

  if (!correctAnswerSelect) {
    console.error("Error: 'correct-answer' select element not found in the DOM.");
    return;
  }

  // Function to open a modal
  const openModal = (modal) => {
    if (modal) {
      modal.classList.add('active');
      modal.style.display = 'block';
      console.log("KGain Modal opened.");
    } else {
      console.error("Modal element is undefined.");
    }
  };

  // Function to close a modal
  const closeModalFn = (modal) => {
    if (modal) {
      modal.classList.remove('active');
      modal.style.display = 'none';
      console.log("KGain Modal closed.");
    } else {
      console.error("Modal element is undefined.");
    }
  };

  // Fetch and populate papers in the select dropdown
  const populatePapersDropdown = () => {
    db.collection('papers2').get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          const option = document.createElement('option');
          option.value = doc.id;
          option.textContent = doc.data().title || doc.id;
          selectPaper.appendChild(option);
        });
      })
      .catch((error) => {
        console.error('Error fetching papers:', error);
      });
  };

  // Populate the dropdown on load
  populatePapersDropdown();

  // Dynamically create question fields
function createQuestionBlock(index) {
  const block = document.createElement('div');
  block.classList.add('question-block');

  block.innerHTML = `
    <h3>Question ${index + 1}</h3>
    <label>Type:</label>
    <label><input type="radio" name="questionType${index}" value="a" required>True/False</label>
    <label><input type="radio" name="questionType${index}" value="b">Easy MC</label>
    <label><input type="radio" name="questionType${index}" value="c">Hard MC</label>
    <br><br>
    <label>Question Text:</label>
    <textarea id="kgain-question-text-${index}" required></textarea>
    <br><br>
    <label>Options:</label>
    <div class="options-container-${index}">
      <div class="option">
        <input type="text" name="option" placeholder="Option A text" required />
      </div>
      <div class="option">
        <input type="text" name="option" placeholder="Option B text" required />
      </div>
    </div>
    <button type="button" class="add-option-btn" data-idx="${index}">Add Option</button>
    <br><br>
    <label>Correct Answer:</label>
    <select id="correct-answer-${index}" required>
      <option value="">--Select--</option>
    </select>
    <br><br>
    <hr/>
  `;
  return block;
}

  // Event Listener for Add KGain Button
  if (addKGainBtn) {
    addKGainBtn.addEventListener('click', () => {
      console.log("Add KGain Button Clicked");
      openModal(addKGainModal);
      updateCorrectAnswerOptions();
    });
  }

  // Event Listeners for Close Buttons
  closeModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      console.log("Close Modal Button Clicked");
      closeModalFn(addKGainModal);
    });
  });

  // Event Listener for Clicking Outside the Modal to Close
  window.addEventListener('click', (e) => {
    if (e.target === addKGainModal) {
      console.log("Clicked outside the KGain modal. Closing modal.");
      closeModalFn(addKGainModal);
    }
  });

  const br = document.createElement('br');

  // Function to update Correct Answer Dropdown based on current options
  const updateCorrectAnswerOptions = () => {
    // Clear existing options
    correctAnswerSelect.innerHTML = '<option value="">--Select--</option>';
    // Get all current option inputs
    const optionInputs = optionsContainer.querySelectorAll('input[name="option"]');
    optionInputs.forEach((input, index) => {
      const optionLabel = String.fromCharCode(65 + index); // 'A', 'B', 'C', etc.
      const optionText = input.value || `Option ${optionLabel}`;
      const option = document.createElement('option');
      option.value = optionLabel;
      option.textContent = `${optionLabel}: ${optionText}`;
      correctAnswerSelect.appendChild(option);
      correctAnswerSelect.append(br);
    });
  };

  // Function to add a new option input
  const addOption = () => {
    const optionCount = optionsContainer.querySelectorAll('.option').length;
    const optionLabel = String.fromCharCode(65 + optionCount); // 'A', 'B', 'C', etc.

    const optionDiv = document.createElement('div');
    optionDiv.classList.add('option');

    const optionInput = document.createElement('input');
    optionInput.type = 'text';
    optionInput.name = 'option';
    optionInput.placeholder = `Option ${optionLabel} text`;
    optionInput.required = true;

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.classList.add('remove-option-btn');
    removeBtn.textContent = 'Remove';

    // Event Listener for Remove Button
    removeBtn.addEventListener('click', () => {
      optionDiv.remove();
      updateCorrectAnswerOptions();
    });

    optionDiv.appendChild(optionInput);
    optionDiv.appendChild(removeBtn);
    optionsContainer.appendChild(optionDiv);

    updateCorrectAnswerOptions();
  };

  // Event Listener for Add Option Button
  if (addOptionBtn) {
    addOptionBtn.addEventListener('click', () => {
      addOption();
    });
  }

  // Handle KGain Form Submission
  if (addKGainForm) {
    addKGainForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const user = auth.currentUser;
      if (!user) {
        alert("Please sign in to continue.");
        return;
      }
      
      // Fetch user data to confirm admin status
      db.collection('users').doc(user.uid).get()
        .then((doc) => {
          if (doc.exists && doc.data().isAdmin) {
            // Proceed with adding KGain question
            const paperId = selectPaper.value;
            const questionText = document.getElementById('kgain-question-text').value.trim();
            const questionType = document.querySelector('input[name="questionType"]:checked')?.value;
            const correctAnswer = document.getElementById('correct-answer').value;

            // Collect all option texts
            const optionInputs = optionsContainer.querySelectorAll('input[name="option"]');
            const options = {};
            optionInputs.forEach((input, index) => {
              const optionKey = String.fromCharCode(65 + index); // 'A', 'B', 'C', etc.
              options[optionKey] = input.value.trim();
            });

            // Validation: Ensure at least two options are provided
            if (optionInputs.length < 2) {
              alert('Please provide at least two options.');
              return;
            }

            if (!paperId || !questionType || !questionText || !correctAnswer) {
              alert('Please fill in all required fields.');
              return;
            }

            // Add the question to Firestore
            db.collection('papers2').doc(paperId).collection('kgainQuestions').add({
              questionText: questionText,
              type: questionType,
              options: options,
              correctAnswer: correctAnswer,
              weight: 1, // Default weight
              createdAt: firebase.firestore.FieldValue.serverTimestamp()
            })
            .then(() => {
              alert('KGain question added successfully!');
              closeModalFn(addKGainModal);
              addKGainForm.reset();

              // Reset options to default two options
              optionsContainer.innerHTML = `
                <div class="option">
                  <input type="text" name="option" placeholder="Option A text" required>
                  <button type="button" class="remove-option-btn">Remove</button>
                </div>
                <div class="option">
                  <input type="text" name="option" placeholder="Option B text" required>
                  <button type="button" class="remove-option-btn">Remove</button>
                </div>
              `;
              // Reattach remove event listeners
              const removeButtons = optionsContainer.querySelectorAll('.remove-option-btn');
              removeButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                  btn.parentElement.remove();
                  updateCorrectAnswerOptions();
                });
              });
              // Reset correct answer select
              correctAnswerSelect.innerHTML = '<option value="">--Select--</option>';
            })
            .catch((error) => {
              console.error('Error adding KGain question:', error);
              alert('Failed to add KGain question. Please try again.');
            });
          } else {
            alert("You do not have permission to perform this action.");
          }
        })
        .catch((error) => {
          console.error('Error fetching user data:', error);
          alert("An error occurred. Please try again.");
        });
    });
  }

  // Manage visibility based on user role
  auth.onAuthStateChanged((user) => {
    if (user) {
      // User is signed in
      db.collection('users').doc(user.uid).get()
        .then((doc) => {
          if (doc.exists) {
            const userData = doc.data();
            signInButton.textContent = `Signed in as ${userData.name}`;

            if (userData.isAdmin) {
              // Show "Add KGain" button for admins
              if (addKGainBtn) addKGainBtn.style.display = 'inline-block';
            } else {
              // Hide admin buttons for regular users
              if (addKGainBtn) addKGainBtn.style.display = 'none';
            }
          } else {
            // User document does not exist
            signInButton.textContent = `Signed in as ${user.email}`;
            // Hide admin buttons
            if (addKGainBtn) addKGainBtn.style.display = 'none';
          }
        })
        .catch((error) => {
          console.error('Error fetching user data:', error);
          signInButton.textContent = `Signed in as ${user.email}`;
          // Hide admin buttons in case of error
          if (addKGainBtn) addKGainBtn.style.display = 'none';
        });
    } else {
      // User is signed out
      signInButton.textContent = 'Sign In';
      // Hide admin buttons
      if (addKGainBtn) addKGainBtn.style.display = 'none';
    }
  });

    // Access Control: Redirect unauthenticated users to sign-in
  auth.onAuthStateChanged((user) => {
    if (!user) {
      alert('You must be signed in to submit a new paper.');
      window.location.href = 'paper.html'; // Redirect to a relevant page
    }
  });


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
      console.log('User is signed out');
      signInButton.textContent = 'Sign In';
      window.location.href = 'index.html';
    }
  });

  // Handle Submit Paper Form Submission
  const submitPaperForm = document.getElementById('submit-paper-form');

  if (submitPaperForm) {
    submitPaperForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const user = auth.currentUser;
      if (!user) {
        alert('Please sign in to submit a new paper.');
        return;
      }

    // Get form values
    const paperTitle = document.getElementById('paper-title').value.trim();
    const authors = document.getElementById('authors').value.trim();
    const scienceAbstract = document.getElementById('science-abstract').value.trim();
    const scienceNews = document.getElementById('science-news').value.trim();
    const tweetsRaw = document.getElementById('tweets').value.trim();
    const tweetHTML= document.getElementById('tweethtml').value.trim();
    const tagsRaw = document.getElementById('tags').value.trim();
    const category = document.getElementById('category');//.value.trim();

    console.log("category of document: ", category);

    // Validate required fields
    if (!paperTitle || !scienceAbstract || !scienceNews || !tweetsRaw || !tagsRaw || !tweetHTML) {
      alert('Please fill in all required fields.');
      return;
    }

    // Process tweets and tags
    const tweets = tweetsRaw.split('\n').filter(tweet => tweet.trim() !== '');
    const tags = tagsRaw.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag !== '');

    // Prepare paper data
    const paperData = {
      title: paperTitle,
      authors: authors,
      abstract: scienceAbstract,
      newshtml: scienceNews,
      tweets: tweets,
      tags: tags,
      tweethtml: tweetHTML,
      category: category,
      submittedBy: user.uid,
      submittedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    // Save to Firestore
    db.collection('papers2').add(paperData)
      .then(() => {
        alert('Paper submitted successfully!');
        submitPaperForm.reset();
      })
      .catch((error) => {
        console.error('Error submitting paper:', error);
        alert('There was an error submitting your paper. Please try again.');
      });
  });
  }


});
