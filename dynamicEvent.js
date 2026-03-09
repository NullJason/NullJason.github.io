const toggleButton = document.getElementById('theme-toggle');
const moonIcon = document.getElementById('moon-icon');
const sunIcon = document.getElementById('sun-icon');
const themeElements = document.getElementsByClassName("theme-element");
let darkMode = true;

// Function to set the theme
function setTheme(mode) {
    darkMode = mode;
  if (darkMode == true) {
    for (const elem of themeElements) {
        elem.classList.add('dark-mode');
    }
    
    moonIcon.style.display = 'none';
    sunIcon.style.display = 'inline';
    localStorage.setItem('theme', 'dark');
  } else {
    for (const elem of themeElements) {
        elem.classList.remove('dark-mode');
    }
    moonIcon.style.display = 'inline';
    sunIcon.style.display = 'none';
    localStorage.setItem('theme', 'light');
  }
}

// Check for saved theme preference on page load
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
  setTheme(true);
} else if (savedTheme === 'light') {
  setTheme(false);
} else {
  // Optional: check user's system preference if no theme is saved
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  setTheme(prefersDark);
}


// Event listener for the toggle button
toggleButton.addEventListener('click', () => {
  setTheme(!darkMode);
});
