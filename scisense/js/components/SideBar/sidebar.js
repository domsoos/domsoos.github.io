const menuToggle = document.getElementById('menu-toggle');
const sidebar = document.getElementById('sidebar');
const closeBtn = document.getElementById('close-btn');

// Open Sidebar
menuToggle.addEventListener('click', () => {
  sidebar.classList.add('open');
});

// Close Sidebar
closeBtn.addEventListener('click', () => {
  sidebar.classList.remove('open');
});
