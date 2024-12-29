    document.addEventListener('DOMContentLoaded', function() {
      const hamburger = document.getElementById('hamburger');
      const navLinks = document.getElementById('navLinks');

      // Ensure all elements are present
      if (!hamburger || !navLinks) {
        console.error('Hamburger menu or navigation links are missing in the DOM.');
        return;
      }

      // Function to toggle navigation links
      function toggleNav() {
        navLinks.classList.toggle('open');
        // Toggle hamburger to 'X' or back to hamburger
        hamburger.innerHTML = navLinks.classList.contains('open') ? '&#10005;' : '&#9776;';
        // Update ARIA attribute
        hamburger.setAttribute('aria-expanded', navLinks.classList.contains('open'));
        // Optionally disable body scroll when nav is open
        document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : 'auto';
        console.log('Navigation toggled. Open:', navLinks.classList.contains('open'));
      }

      // Event listener for hamburger click
      hamburger.addEventListener('click', toggleNav);

      // Close navigation when a link is clicked
      navLinks.querySelectorAll('a').forEach(function(link) {
        link.addEventListener('click', function() {
          if (navLinks.classList.contains('open')) {
            toggleNav();
          }
        });
      });

      // Optional: Close navigation on resize if window is resized to larger than 845px
      window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && navLinks.classList.contains('open')) {
          toggleNav();
        }
      });

      // Accessibility: Allow toggling navigation with keyboard
      hamburger.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleNav();
        }
      });
    });