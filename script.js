// ====================================
// Clinical Serenity Website - Main JavaScript
// ====================================

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initScrollEffects();
    initBlogSystem();
    initFeedbackSystem();
    initContactForm();
    initRatingStars();
    initModal();
    initAnimations();
    initYouTubeFeed();
});

// ====================================
// Navigation
// ====================================
function initNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    const nav = document.getElementById('nav');

    // Mobile menu toggle
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Sticky navigation on scroll
    let lastScroll = 0;
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            nav.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.1)';
        } else {
            nav.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.05)';
        }

        lastScroll = currentScroll;
    });

    // Smooth scroll for anchor links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const offsetTop = target.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

// ====================================
// Scroll Effects
// ====================================
function initScrollEffects() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for fade-in animation
    const animatedElements = document.querySelectorAll('.service-card, .blog-card, .testimonial-card, .credential-item');
    animatedElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `opacity 0.6s ease-out ${index * 0.1}s, transform 0.6s ease-out ${index * 0.1}s`;
        observer.observe(el);
    });
}

// ====================================
// Blog System
// ====================================
function initBlogSystem() {
    const toggleBlogForm = document.getElementById('toggleBlogForm');
    const blogFormContainer = document.getElementById('blogFormContainer');
    const cancelBlogForm = document.getElementById('cancelBlogForm');
    const blogForm = document.getElementById('blogForm');
    const blogGrid = document.getElementById('blogGrid');

    // Load blogs from localStorage
    loadBlogs();

    // Toggle blog form
    if (toggleBlogForm) {
        toggleBlogForm.addEventListener('click', function() {
            blogFormContainer.classList.toggle('active');
        });
    }

    // Cancel blog form
    if (cancelBlogForm) {
        cancelBlogForm.addEventListener('click', function() {
            blogFormContainer.classList.remove('active');
            blogForm.reset();
        });
    }

    // Submit blog form
    if (blogForm) {
        blogForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const blogData = {
                id: Date.now(),
                title: document.getElementById('blogTitle').value,
                category: document.getElementById('blogCategory').value,
                excerpt: document.getElementById('blogExcerpt').value,
                content: document.getElementById('blogContent').value,
                image: document.getElementById('blogImage').value,
                date: new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })
            };

            // Save to localStorage
            let blogs = JSON.parse(localStorage.getItem('blogs')) || [];
            blogs.unshift(blogData);
            localStorage.setItem('blogs', JSON.stringify(blogs));

            // Add to grid
            addBlogToGrid(blogData);

            // Reset form and hide
            blogForm.reset();
            blogFormContainer.classList.remove('active');

            // Show success modal
            showModal('Blog Post Published!', 'Your article has been successfully published.');
        });
    }
}

function loadBlogs() {
    const blogs = JSON.parse(localStorage.getItem('blogs')) || [];
    const blogGrid = document.getElementById('blogGrid');

    // Clear existing dynamic blogs (keep sample posts)
    const dynamicBlogs = blogGrid.querySelectorAll('.blog-card[data-dynamic]');
    dynamicBlogs.forEach(card => card.remove());

    // Add saved blogs
    blogs.forEach(blog => {
        addBlogToGrid(blog);
    });
}

function addBlogToGrid(blogData) {
    const blogGrid = document.getElementById('blogGrid');

    const blogCard = document.createElement('article');
    blogCard.className = 'blog-card';
    blogCard.setAttribute('data-dynamic', 'true');
    blogCard.style.opacity = '0';
    blogCard.style.transform = 'translateY(30px)';

    const categoryFormatted = blogData.category
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    blogCard.innerHTML = `
        <div class="blog-image">
            <div class="blog-image-placeholder" style="${blogData.image ? `background-image: url(${blogData.image}); background-size: cover; background-position: center;` : ''}">
                <span class="blog-category">${categoryFormatted}</span>
            </div>
        </div>
        <div class="blog-content">
            <div class="blog-meta">
                <span class="blog-date">${blogData.date}</span>
            </div>
            <h3 class="blog-title">${blogData.title}</h3>
            <p class="blog-excerpt">${blogData.excerpt}</p>
            <a href="#" class="blog-link" onclick="viewBlogPost(${blogData.id}); return false;">Read Article →</a>
        </div>
    `;

    blogGrid.insertBefore(blogCard, blogGrid.firstChild);

    // Animate in
    setTimeout(() => {
        blogCard.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        blogCard.style.opacity = '1';
        blogCard.style.transform = 'translateY(0)';
    }, 100);
}

function viewBlogPost(blogId) {
    const blogs = JSON.parse(localStorage.getItem('blogs')) || [];
    const blog = blogs.find(b => b.id === blogId);

    if (blog) {
        // In a real implementation, this would open a dedicated blog post page
        // For now, we'll show it in a modal or alert
        showModal(blog.title, blog.content);
    }
}

// ====================================
// Feedback/Testimonials System
// ====================================
function initFeedbackSystem() {
    const feedbackForm = document.getElementById('feedbackForm');
    const testimonialsGrid = document.getElementById('testimonialsGrid');

    // Load testimonials from localStorage
    loadTestimonials();

    // Submit feedback form
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const rating = document.getElementById('feedbackRating').value;
            if (!rating) {
                alert('Please select a rating');
                return;
            }

            const feedbackData = {
                id: Date.now(),
                name: document.getElementById('feedbackName').value,
                email: document.getElementById('feedbackEmail').value,
                rating: parseInt(rating),
                message: document.getElementById('feedbackMessage').value,
                consent: document.getElementById('feedbackConsent').checked,
                date: new Date().toISOString()
            };

            // Save to localStorage
            let testimonials = JSON.parse(localStorage.getItem('testimonials')) || [];
            testimonials.unshift(feedbackData);
            localStorage.setItem('testimonials', JSON.stringify(testimonials));

            // Add to grid (if consent given)
            if (feedbackData.consent) {
                addTestimonialToGrid(feedbackData);
            }

            // Reset form
            feedbackForm.reset();
            resetRatingStars();

            // Show success modal
            showModal('Thank You!', 'Your feedback has been received. We appreciate you taking the time to share your experience.');
        });
    }
}

function loadTestimonials() {
    const testimonials = JSON.parse(localStorage.getItem('testimonials')) || [];
    const testimonialsGrid = document.getElementById('testimonialsGrid');

    // Clear existing dynamic testimonials (keep sample posts)
    const dynamicTestimonials = testimonialsGrid.querySelectorAll('.testimonial-card[data-dynamic]');
    dynamicTestimonials.forEach(card => card.remove());

    // Add saved testimonials (only those with consent)
    testimonials
        .filter(t => t.consent)
        .forEach(testimonial => {
            addTestimonialToGrid(testimonial);
        });
}

function addTestimonialToGrid(testimonialData) {
    const testimonialsGrid = document.getElementById('testimonialsGrid');

    const testimonialCard = document.createElement('div');
    testimonialCard.className = 'testimonial-card';
    testimonialCard.setAttribute('data-dynamic', 'true');
    testimonialCard.style.opacity = '0';
    testimonialCard.style.transform = 'translateY(30px)';

    const stars = '★'.repeat(testimonialData.rating) + '☆'.repeat(5 - testimonialData.rating);
    const initials = testimonialData.name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .join('.');

    testimonialCard.innerHTML = `
        <div class="testimonial-rating">${stars}</div>
        <p class="testimonial-text">"${testimonialData.message}"</p>
        <div class="testimonial-author">
            <strong>${initials}.</strong>
            <span>Verified Patient</span>
        </div>
    `;

    testimonialsGrid.insertBefore(testimonialCard, testimonialsGrid.firstChild);

    // Animate in
    setTimeout(() => {
        testimonialCard.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        testimonialCard.style.opacity = '1';
        testimonialCard.style.transform = 'translateY(0)';
    }, 100);
}

// ====================================
// Rating Stars
// ====================================
function initRatingStars() {
    const ratingInput = document.getElementById('ratingInput');
    const feedbackRating = document.getElementById('feedbackRating');
    const stars = ratingInput.querySelectorAll('.star');

    stars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = this.getAttribute('data-rating');
            feedbackRating.value = rating;

            // Update star display
            stars.forEach(s => {
                const starRating = s.getAttribute('data-rating');
                if (starRating <= rating) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });

        // Hover effect
        star.addEventListener('mouseenter', function() {
            const rating = this.getAttribute('data-rating');
            stars.forEach(s => {
                const starRating = s.getAttribute('data-rating');
                if (starRating <= rating) {
                    s.style.color = 'var(--accent)';
                } else {
                    s.style.color = 'var(--gray-dark)';
                }
            });
        });
    });

    // Reset on mouse leave
    ratingInput.addEventListener('mouseleave', function() {
        const currentRating = feedbackRating.value;
        stars.forEach(s => {
            const starRating = s.getAttribute('data-rating');
            if (currentRating && starRating <= currentRating) {
                s.style.color = 'var(--accent)';
            } else {
                s.style.color = 'var(--gray-dark)';
            }
        });
    });
}

function resetRatingStars() {
    const stars = document.querySelectorAll('.rating-input .star');
    stars.forEach(s => {
        s.classList.remove('active');
        s.style.color = 'var(--gray-dark)';
    });
    document.getElementById('feedbackRating').value = '';
}

// ====================================
// Contact Form
// ====================================
function initContactForm() {
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const contactData = {
                name: document.getElementById('contactName').value,
                phone: document.getElementById('contactPhone').value,
                email: document.getElementById('contactEmail').value,
                service: document.getElementById('contactService').value,
                message: document.getElementById('contactMessage').value,
                date: new Date().toISOString()
            };

            // Save to localStorage
            let contacts = JSON.parse(localStorage.getItem('contacts')) || [];
            contacts.push(contactData);
            localStorage.setItem('contacts', JSON.stringify(contacts));

            // In a real implementation, this would send data to a server
            console.log('Contact form submission:', contactData);

            // Reset form
            contactForm.reset();

            // Show success modal
            showModal(
                'Appointment Request Received!',
                'Thank you for reaching out. We will contact you within 24 hours to confirm your appointment.'
            );
        });
    }
}

// ====================================
// Modal System
// ====================================
function initModal() {
    const modal = document.getElementById('successModal');
    const closeModal = document.getElementById('closeModal');

    if (closeModal) {
        closeModal.addEventListener('click', function() {
            modal.classList.remove('active');
        });
    }

    // Close modal when clicking outside
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }

    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            modal.classList.remove('active');
        }
    });
}

function showModal(title, message) {
    const modal = document.getElementById('successModal');
    const modalTitle = modal.querySelector('.modal-title');
    const modalMessage = document.getElementById('modalMessage');

    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modal.classList.add('active');
}

// ====================================
// Animations
// ====================================
function initAnimations() {
    // Parallax effect for hero shapes
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const shapes = document.querySelectorAll('.shape');

        shapes.forEach((shape, index) => {
            const speed = 0.1 + (index * 0.05);
            const yPos = -(scrolled * speed);
            shape.style.transform = `translateY(${yPos}px)`;
        });
    });

    // Counter animation for stats (if visible)
    const stats = document.querySelectorAll('.stat-number');
    let animated = false;

    const animateStats = function() {
        if (animated) return;

        const statsSection = document.querySelector('.hero-stats');
        if (!statsSection) return;

        const rect = statsSection.getBoundingClientRect();
        const isVisible = rect.top <= window.innerHeight && rect.bottom >= 0;

        if (isVisible) {
            animated = true;
            // Stats animation would go here
            // For now, they're static but could be animated with counting effect
        }
    };

    window.addEventListener('scroll', animateStats);
    animateStats(); // Check on load
}

// ====================================
// YouTube Feed (auto-fetch via RSS)
// ====================================
// Change this to your YouTube channel ID (found in channel URL or via youtube.com/account_advanced)
const YOUTUBE_CHANNEL_ID = 'YOUR_CHANNEL_ID';
const YOUTUBE_VIDEO_COUNT = 6;

function initYouTubeFeed() {
    const grid = document.getElementById('ytGrid');
    if (!grid) return;

    const rssUrl = 'https://www.youtube.com/feeds/videos.xml?channel_id=' + YOUTUBE_CHANNEL_ID;
    // Use a public CORS proxy to fetch the RSS feed from the browser
    const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(rssUrl);

    fetch(proxyUrl)
        .then(function(res) {
            if (!res.ok) throw new Error('Feed fetch failed');
            return res.text();
        })
        .then(function(xmlText) {
            var parser = new DOMParser();
            var xml = parser.parseFromString(xmlText, 'text/xml');
            var entries = xml.querySelectorAll('entry');

            if (entries.length === 0) {
                grid.innerHTML = '<p class="yt-loading">No videos found. Check the channel ID.</p>';
                return;
            }

            grid.innerHTML = '';
            var count = Math.min(entries.length, YOUTUBE_VIDEO_COUNT);

            for (var i = 0; i < count; i++) {
                var entry = entries[i];
                var videoId = entry.querySelector('videoId').textContent;
                var title = entry.querySelector('title').textContent;
                var thumb = 'https://img.youtube.com/vi/' + videoId + '/mqdefault.jpg';

                var card = document.createElement('a');
                card.className = 'yt-card';
                card.href = 'https://www.youtube.com/watch?v=' + videoId;
                card.target = '_blank';
                card.rel = 'noopener';
                card.innerHTML =
                    '<div class="yt-thumb">' +
                        '<img src="' + thumb + '" alt="' + sanitizeHTML(title) + '" loading="lazy">' +
                        '<div class="yt-play">' +
                            '<svg viewBox="0 0 68 48"><path d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55c-2.93.78-4.63 3.26-5.42 6.19C.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z" fill="red"/><path d="M45 24L27 14v20" fill="white"/></svg>' +
                        '</div>' +
                    '</div>' +
                    '<div class="yt-info"><h4>' + sanitizeHTML(title) + '</h4></div>';

                grid.appendChild(card);
            }
        })
        .catch(function() {
            grid.innerHTML = '<p class="yt-loading">Could not load videos. <a href="https://www.youtube.com/channel/' + YOUTUBE_CHANNEL_ID + '" target="_blank">Visit YouTube channel →</a></p>';
        });
}

// ====================================
// Utility Functions
// ====================================

// Format date helper
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Sanitize HTML helper (basic protection)
function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

// Validate email helper
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// ====================================
// Admin Functions (for demonstration)
// ====================================

// Function to view all stored data (call from browser console)
function viewStoredData() {
    console.log('=== STORED DATA ===');
    console.log('Blogs:', JSON.parse(localStorage.getItem('blogs')) || []);
    console.log('Testimonials:', JSON.parse(localStorage.getItem('testimonials')) || []);
    console.log('Contacts:', JSON.parse(localStorage.getItem('contacts')) || []);
}

// Function to clear all data (call from browser console)
function clearAllData() {
    if (confirm('Are you sure you want to clear all stored data? This cannot be undone.')) {
        localStorage.removeItem('blogs');
        localStorage.removeItem('testimonials');
        localStorage.removeItem('contacts');
        location.reload();
    }
}

// Make admin functions available globally
window.viewStoredData = viewStoredData;
window.clearAllData = clearAllData;

// ====================================
// Console Welcome Message
// ====================================
console.log('%c🏥 Clinical Serenity Website', 'color: #0D7377; font-size: 20px; font-weight: bold;');
console.log('%cAdmin Functions Available:', 'color: #FF6B6B; font-weight: bold;');
console.log('- viewStoredData() - View all stored blog posts, testimonials, and contacts');
console.log('- clearAllData() - Clear all stored data');
console.log('%cWebsite ready!', 'color: #0D7377; font-weight: bold;');
