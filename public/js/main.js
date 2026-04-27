// Mobile Navigation Toggle for index.html
function toggleMenu() {
    const navbar = document.getElementById("navbar");
    if (navbar) {
        navbar.classList.toggle("active");
    }
}

document.addEventListener("DOMContentLoaded", function() {
    const menuToggle = document.getElementById("menuToggle");
    if (menuToggle) {
        menuToggle.addEventListener("click", toggleMenu);
    }

    const navLinks = document.querySelectorAll("#navbar a");
    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            const navbar = document.getElementById("navbar");
            if (navbar) {
                navbar.classList.remove("active");
            }
        });
    });
});

// Mobile Navigation Toggle for other pages
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

// Smooth scrolling for navigation links
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

// Contact Form Submission
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Thank you for your message! We will get back to you soon.');
        this.reset();
    });
}

// Navbar background change on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.style.backgroundColor = '#1a365d';
            navbar.style.boxShadow = '0 4px 10px rgba(0,0,0,0.2)';
        } else {
            navbar.style.backgroundColor = '#1a365d';
            navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        }
    }
});
