// Navbar Component
// Manages top navigation bar

class Navbar {
  constructor() {
    this.isInitialized = false;
  }

  init() {
    try {
      const navbar = document.querySelector('.navbar');
      if (!navbar) return;

      // Add event listeners to navbar items
      const navLinks = navbar.querySelectorAll('.nav-link');
      navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          this.handleNavigation(link);
        });
      });

      this.isInitialized = true;
      console.log('Navbar initialized');
    } catch (error) {
      console.error('Error initializing navbar:', error);
    }
  }

  handleNavigation(link) {
    try {
      // Remove active class from all links
      const allLinks = document.querySelectorAll('.nav-link, .menu-item');
      allLinks.forEach(l => l.classList.remove('active'));

      // Add active class to clicked link
      link.classList.add('active');

      // Emit navigation event
      const href = link.getAttribute('href');
      window.dispatchEvent(new CustomEvent('navigate', { detail: { target: href } }));
    } catch (error) {
      console.error('Error handling navigation:', error);
    }
  }

  setActiveLink(target) {
    try {
      const links = document.querySelectorAll('.nav-link');
      links.forEach(link => {
        if (link.getAttribute('href') === target) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    } catch (error) {
      console.error('Error setting active link:', error);
    }
  }
}
