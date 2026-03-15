// Sidebar Component
// Manages sidebar menu

class Sidebar {
  constructor() {
    this.isInitialized = false;
    this.activeItem = null;
  }

  init() {
    try {
      const sidebar = document.querySelector('.sidebar');
      if (!sidebar) return;

      // Add event listeners to menu items
      const menuItems = sidebar.querySelectorAll('.menu-item');
      menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
          e.preventDefault();
          this.handleMenuClick(item);
        });
      });

      this.isInitialized = true;
      console.log('Sidebar initialized');
    } catch (error) {
      console.error('Error initializing sidebar:', error);
    }
  }

  handleMenuClick(item) {
    try {
      // Remove active class from all items
      const allItems = document.querySelectorAll('.menu-item');
      allItems.forEach(i => i.classList.remove('active'));

      // Add active class to clicked item
      item.classList.add('active');
      this.activeItem = item.getAttribute('href');

      // Emit navigation event
      const href = item.getAttribute('href');
      window.dispatchEvent(new CustomEvent('navigate', { detail: { target: href } }));
    } catch (error) {
      console.error('Error handling menu click:', error);
    }
  }

  setActiveItem(target) {
    try {
      const items = document.querySelectorAll('.menu-item');
      items.forEach(item => {
        if (item.getAttribute('href') === target) {
          item.classList.add('active');
          this.activeItem = target;
        } else {
          item.classList.remove('active');
        }
      });
    } catch (error) {
      console.error('Error setting active item:', error);
    }
  }

  getActiveItem() {
    return this.activeItem;
  }
}
