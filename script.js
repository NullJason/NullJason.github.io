
// DOM Elements
const navMenu = document.querySelector('.nav-menu');
const hamburger = document.querySelector('.hamburger');
const filterButtons = document.querySelectorAll('.filter-btn');


// mobile navi toggle
hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// closes ^ when clic
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    });
});


function calculateYearsCoding() {
    const startYear = 2021;
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    
    const years = currentYear - startYear + (currentMonth >= 0 ? 1 : 0);
    return Math.max(4, years); 
}

async function countTotalRepositories() {
    try {
        const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100`);
        if (!response.ok) throw new Error('Failed to fetch repos');
        
        const repos = await response.json();
        return repos.filter(repo => !repo.fork && !repo.archived).length;
    } catch (error) {
        console.error('Error counting repositories:', error);
        return -1;
    }
}


function animateCounter(element, target, suffix = '') {
    const duration = 2000;
    const steps = 60;
    const increment = target / (duration / (1000 / steps));
    let current = 0;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current) + suffix;
    }, 1000 / steps);
}



function formatRepoName(name) {
     return name
         .replace(/-/g, ' ')
         .replace(/_/g, ' ')
         .replace(/(^\w|\s\w)/g, letter => letter.toUpperCase());
 }


// Enhanced Intersection Observer for one-time animations
function initializeAnimations() {
    // Track which elements have been animated
    const animatedElements = new Set();
    
    // Observer for sections (fade in on scroll)
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id || 'unknown';
                if (!animatedElements.has(id)) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    animatedElements.add(id);
                }
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    
    // Observe all sections
    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        sectionObserver.observe(section);
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Portfolio initialized');
    initializeAnimations()
    // scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        const navbar = document.getElementById('navbar');
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        }
    });
});
