// Create a reusable search bar function

function createSearchBar(containerId, placeholder) {
    const container = document.getElementById(containerId);
  
    if (!container) {
      console.error(`Container with ID "${containerId}" not found.`);
      return;
    }
  
    // Create the search bar
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = placeholder;
    input.id = 'search-input';

    input.classList.add('search-box'); // add search-box styles from global css
  
    // Append elements to the container
    container.appendChild(input);
  }
  
