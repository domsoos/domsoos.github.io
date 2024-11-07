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
