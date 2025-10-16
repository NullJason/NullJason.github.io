// GitHub api config
const GITHUB_USERNAME = 'NullJason'; 

// DOM Elements
const navMenu = document.querySelector('.nav-menu');
const hamburger = document.querySelector('.hamburger');
const filterButtons = document.querySelectorAll('.filter-btn');
const projectsContainer = document.getElementById('projects-container');

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
    if (stats.length === 0) return;
    
    stats.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-count'));
        const duration = 2000;
        const steps = 60; // 60fps
        const stepValue = target / (duration / (1000 / steps));
        let current = 0;
        
        const timer = setInterval(() => {
            current += stepValue;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            stat.textContent = Math.floor(current);
        }, 1000 / steps);
    });
}

// fetch projs
async function fetchGitHubProjects() {
    try {
       projectsContainer.innerHTML = '<div class="loading">Loading projects from GitHub...</div>';
        
        const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`);
        
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
        }
        
        const repos = await response.json();
        const filteredRepos = repos.filter(repo => 
            !repo.fork && 
            !repo.archived &&
            !repo.name.includes('.github.io') // Filter out GitHub Pages repos
        );
        
        return filteredRepos;
    } catch (error) {
        console.error('Error fetching GitHub projects:', error);
        projectsContainer.innerHTML = `
            <div class="loading error">
                <p>Unable to load projects from GitHub.</p>
                <p><small>Error: ${error.message}</small></p>
                <p><small>Please check your GitHub username configuration.</small></p>
            </div>
        `;
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
                <h3 class="project-title">${repo.name.replace(/-/g, ' ').replace(/_/g, ' ')}</h3>
                <p class="project-description">${repo.description || 'No description available.'}</p>
                
                <div class="project-tech">
                    ${repo.language ? `<span class="tech-tag">${repo.language}</span>` : ''}
                    ${techStack.tags.map(tag => `<span class="tech-tag">${tag}</span>`).join('')}
                </div>
                
                <div class="project-links">
                    <a href="${repo.html_url}" class="project-link" target="_blank" rel="noopener">
                        <i class="fab fa-github"></i> Code
                    </a>
                    ${repo.homepage ? `
                    <a href="${repo.homepage}" class="project-link" target="_blank" rel="noopener">
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
    try {
        const repos = await fetchGitHubProjects();
        
        if (repos.length === 0) {
            projectsContainer.innerHTML = `
                <div class="loading">
                    unable to load repos!
                    <br><small>Please try again later...</small>
                </div>
            `;
            return;
        }
        
        projectsContainer.innerHTML = '';
        
        repos.forEach(repo => {
            const projectCard = createProjectCard(repo);
            projectsContainer.innerHTML += projectCard;
        });
        
        console.log(`Loaded ${repos.length} projects from GitHub`);
        
    } catch (error) {
        console.error('Error loading projects:', error);
        projectsContainer.innerHTML = `
            <div class="loading error">
                Failed to load projects.
            </div>
        `;
    }
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
            
            if (entry.target.id === 'about') {
                setTimeout(() => animateStats(), 300);
            }
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
    console.log('Portfolio initialized');
    
    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(section);
    });
    
    const projectObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100); 
            }
        });
    }, { threshold: 0.1 });
    
    const observeProjects = () => {
        document.querySelectorAll('.project-card').forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
            projectObserver.observe(card);
        });
    };
    
    loadProjects().then(observeProjects);
    
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
