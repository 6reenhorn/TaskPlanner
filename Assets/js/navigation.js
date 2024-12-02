const navLinks = document.querySelectorAll('.nav-link');
const pages = document.querySelectorAll('.page');

navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const targetId = link.getAttribute('href').replace('#', '');
    const targetPage = document.getElementById(targetId);

    const currentPage = document.querySelector('.page.active');

    if (currentPage === targetPage) return; // Do nothing if clicking the same page

    // Determine the direction
    const isNextPage = [...pages].indexOf(targetPage) > [...pages].indexOf(currentPage);

    // Add sliding classes
    currentPage.classList.add(isNextPage ? 'slide-out-left' : 'slide-out-right');
    targetPage.classList.add(isNextPage ? 'slide-in-right' : 'slide-in-left');

    // Remove the active class after animation
    setTimeout(() => {
      currentPage.classList.remove('active', 'slide-out-left', 'slide-out-right');
      targetPage.classList.remove('slide-in-left', 'slide-in-right');
      targetPage.classList.add('active');
    }, 300); // Match the CSS transition duration (0.5s)
  });
});
