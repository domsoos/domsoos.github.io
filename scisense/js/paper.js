// scisense/js/paper.js

document.addEventListener('DOMContentLoaded', () => {
  // Example data for demonstration purposes
  const papersData = {
    "deep-learning-approaches-in-ai": {
      title: "Deep Learning Approaches in AI",
      authors: "John Doe, Jane Smith",
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
      abstract: "This study examines the capabilities of language models in few-shot learning scenarios, demonstrating their effectiveness across various tasks.",
      newsSummary: "Researchers have demonstrated that advanced language models can perform tasks with minimal examples, paving the way for more versatile AI applications.",
      authorTweets: [
        "Thrilled to present our findings on few-shot learning in language models! #NLP #AIResearch",
        "Our latest paper shows the potential of language models with just a few examples. Dive into the details! #AI #MachineLearning"
      ]
    }
    // Add more papers as needed
  };

  // Function to get query parameters
  function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }

  // Get the 'id' parameter from URL
  const paperId = getQueryParam('id');

  if (paperId && papersData[paperId]) {
    const paper = papersData[paperId];

    // Populate the paper details
    document.getElementById('paper-title').textContent = paper.title;
    document.getElementById('paper-info').textContent = `${paper.authors} • ${paper.publicationDate}`;
    document.getElementById('paper-abstract').textContent = paper.abstract;
    document.getElementById('news-summary-text').textContent = paper.newsSummary;

    // Populate the author tweets
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

  // Handle Feedback Form Submission
  const feedbackForm = document.getElementById('feedback-form');
  if (feedbackForm) {
    feedbackForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Retrieve form values
      const age = document.getElementById('age').value;
      const academicLevel = document.getElementById('academicLevel').value;
      const occupation = document.getElementById('occupation').value;
      const newsVsAbstracts = document.querySelector('input[name="newsVsAbstracts"]:checked');
      const news1VsNews2 = document.querySelector('input[name="news1VsNews2"]:checked');
      const kgain1 = document.getElementById('kgain1').value;
      const kgain2 = document.getElementById('kgain2').value;

      // Basic validation
      if (!newsVsAbstracts || !news1VsNews2 || !kgain1 || !kgain2) {
        alert('Please fill in all required fields.');
        return;
      }

      // Here you can handle the feedback data as needed
      // For demonstration, we'll log it to the console
      const feedback = {
        age: age || 'Not provided',
        academicLevel: academicLevel || 'Not provided',
        occupation: occupation || 'Not provided',
        newsVsAbstracts: newsVsAbstracts.value,
        news1VsNews2: news1VsNews2.value,
        kgain1: kgain1,
        kgain2: kgain2,
        paperId: paperId
      };

      console.log('Feedback Submitted:', feedback);

      // Reset the form
      feedbackForm.reset();
      alert('Thank you for your feedback!');
    });
  }
});
