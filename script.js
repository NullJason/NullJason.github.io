// GitHub api config
const GITHUB_USERNAME = 'NullJason'; 

// DOM Elements
const navMenu = document.querySelector('.nav-menu');
const hamburger = document.querySelector('.hamburger');
const filterButtons = document.querySelectorAll('.filter-btn');
const projectsContainer = document.getElementById('projects-container');
const contactForm = document.getElementById('contact-form');

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

// filter (todo)
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        const filter = button.getAttribute('data-filter');
        filterProjects(filter);
    });
});

// Animate stats 
function animateStats() {
    const stats = document.querySelectorAll('.stat-number');
    
    stats.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-count'));
        const duration = 2000; 
        const step = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            stat.textContent = Math.floor(current);
        }, 16);
    });
}

// fetch projs
async function fetchGitHubProjects() {
    try {
        const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch projects from GitHub');
        }
        
        const repos = await response.json();
        return repos.filter(repo => !repo.fork); // Filter out forked repositories
    } catch (error) {
        console.error('Error fetching GitHub projects:', error);
        return [];
    }
}

// proj card
function createProjectCard(repo) {
    const techStack = detectTechStack(repo);
    
    return `
        <div class="project-card" data-category="${techStack.category}">
            <div class="project-image">
                <i class="fas fa-code"></i>
            </div>
            <div class="project-content">
                <h3 class="project-title">${repo.name}</h3>
                <p class="project-description">${repo.description || 'No description available.'}</p>
                
                <div class="project-tech">
                    ${techStack.tags.map(tag => `<span class="tech-tag">${tag}</span>`).join('')}
                    <span class="tech-tag">${repo.language || 'Various'}</span>
                </div>
                
                <div class="project-links">
                    <a href="${repo.html_url}" class="project-link" target="_blank">
                        <i class="fab fa-github"></i> Code
                    </a>
                    ${repo.homepage ? `
                    <a href="${repo.homepage}" class="project-link" target="_blank">
                        <i class="fas fa-external-link-alt"></i> Live Demo
                    </a>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

// basically just categorizes thru a simple topic check on public repos
function detectTechStack(repo) {
    let category = 'other';
    const tags = [];
    
    if (repo.language) {
        tags.push(repo.language);
    }
    
    if (repo.topics) {
        tags.push(...repo.topics.slice(0, 3));
    }

    /* For the future 
        const name = repo.name.toLowerCase();
        const description = (repo.description || '').toLowerCase();
        const fullText = name + ' ' + description;
        const webKeywords = ['web', 'website', 'react', 'vue', 'angular', 'html', 'css', 
                            'javascript', 'node', 'express', 'django', 'flask', 'spring', 
                            'bootstrap', 'tailwind', 'frontend', 'backend', 'fullstack'];
        
        const mobileKeywords = ['mobile', 'android', 'ios', 'react-native', 'flutter', 
                               'xcode', 'kotlin', 'swift', 'app', 'application'];
        
        const algoKeywords = ['algorithm', 'data structure', 'leetcode', 'hackerrank', 
                             'codewars', 'dynamic programming', 'graph', 'tree', 'sort', 
                             'search', 'dijkstra', 'binary', 'recursion', 'backtracking'];
        
        const dataScienceKeywords = ['machine learning', 'ml', 'ai', 'data science', 
                                    'tensorflow', 'pytorch', 'neural network', 'nlp', 
                                    'computer vision', 'pandas', 'numpy'];
        
        const devopsKeywords = ['docker', 'kubernetes', 'ci/cd', 'aws', 'azure', 
                               'gcp', 'devops', 'infrastructure', 'deployment'];
                               
        const gameDevKeywords = ['unity','godot','gamedev','game', 'game development', 'game dev'];
        
        const categoryScores = {
            web: countMatches(fullText, webKeywords),
            mobile: countMatches(fullText, mobileKeywords),
            algorithms: countMatches(fullText, algoKeywords),
            dataScience: countMatches(fullText, dataScienceKeywords),
            devops: countMatches(fullText, devopsKeywords)
        };
    
        let maxScore = 0;
        for (const [cat, score] of Object.entries(categoryScores)) {
            if (score > maxScore) {
                maxScore = score;
                category = cat;
            }
        }
    
        if (maxScore === 0) {
            if (['javascript', 'typescript', 'html', 'css'].includes(repo.language?.toLowerCase())) {
                category = 'web';
            } else if (['java', 'kotlin', 'swift', 'dart'].includes(repo.language?.toLowerCase())) {
                category = 'mobile';
            } else if (['python', 'r', 'jupyter'].includes(repo.language?.toLowerCase())) {
                category = 'dataScience';
            } else if (['c', 'c++', 'java'].includes(repo.language?.toLowerCase())) {
                category = 'algorithms';
            }
        }
    
        return { category, tags };
    }
    
    function countMatches(text, keywords) {
        return keywords.filter(keyword => text.includes(keyword)).length;
    }
    */
  
    const name = repo.name.toLowerCase();
    const description = (repo.description || '').toLowerCase();
    
    if (name.includes('web') || description.includes('web') || description.includes('react') || description.includes('vue') || description.includes('angular')) {
        category = 'web';
    } else if (name.includes('mobile') || description.includes('mobile') || description.includes('android') || description.includes('ios') || description.includes('react-native')) {
        category = 'mobile';
    } else if (name.includes('game') || description.includes('game dev') || description.includes('game development') || description.includes('unity') || description.includes('godot')) {
        category = 'gamedev';
    }
    
    return { category, tags };
}

// filter projs
function filterProjects(filter) {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        if (filter === 'all' || card.getAttribute('data-category') === filter) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Load them
async function loadProjects() {
    projectsContainer.innerHTML = '<div class="loading">Loading projects from GitHub...</div>';
    
    const repos = await fetchGitHubProjects();
    
    if (repos.length === 0) {
        projectsContainer.innerHTML = '<div class="loading">Unable to load projects. Please check your GitHub username configuration.</div>';
        return;
    }
    
    projectsContainer.innerHTML = '';
    
    repos.forEach(repo => {
        const projectCard = createProjectCard(repo);
        projectsContainer.innerHTML += projectCard;
    });
}

// Contact form handler
contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData);

    try {
        const response = await fetch('/.netlify/functions/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            alert('Thank you for your message! I\'ll get back to you soon.');
            contactForm.reset();
        } else {
            throw new Error(result.error || 'Failed to send message');
        }
        
    } catch (error) {
        console.error('Contact form error:', error);
        
        const shouldUseFallback = confirm(
            'Sorry, there was an error sending your message. ' +
            'Would you like to send it via email instead?'
        );
        
        if (shouldUseFallback) {
            openEmailFallback(data);
        }
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

// Email fallback
function openEmailFallback(formData) {
    const subject = encodeURIComponent(`Portfolio Contact: ${formData.subject}`);
    const body = encodeURIComponent(
`Name: ${formData.name}
Email: ${formData.email}
Subject: ${formData.subject}

Message:
${formData.message}

---
Sent via portfolio contact form`
    );
    
    window.location.href = `mailto:your-email@gmail.com?subject=${subject}&body=${body}`;
}

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            
            if (entry.target.classList.contains('about-stats')) {
                animateStats();
            }
        }
    });
}, observer);

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
    
    loadProjects();
    
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
});

window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
    }
});
