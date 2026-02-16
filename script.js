// ====================================
// Clinical Serenity Website - Main JavaScript
// ====================================

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Critical — needed for above-the-fold interaction
    initNavigation();
    initScrollEffects();
    initModal();

    // Defer non-critical initialization until after first paint
    if ('requestIdleCallback' in window) {
        requestIdleCallback(initDeferredSystems);
    } else {
        setTimeout(initDeferredSystems, 200);
    }
});

function initDeferredSystems() {
    initBlogSystem();
    initFeedbackSystem();
    initContactForm();
    initRatingStars();
    initYouTubeFeed();
    initInstagramFeed();
    initGoogleReviews();
    initLazyIframes();
}

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
            // Lock body scroll when menu is open
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });
    }

    // Close mobile menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Sticky navigation on scroll — throttled with rAF
    let scrollTicking = false;
    window.addEventListener('scroll', function() {
        if (!scrollTicking) {
            scrollTicking = true;
            requestAnimationFrame(function() {
                if (window.pageYOffset > 100) {
                    nav.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.1)';
                } else {
                    nav.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.05)';
                }
                scrollTicking = false;
            });
        }
    }, { passive: true });

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
    // Skip scroll animations if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.remove('scroll-hidden');
                entry.target.classList.add('scroll-visible');
                observer.unobserve(entry.target); // Stop observing once revealed
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -100px 0px' });

    // Observe elements for fade-in animation — use CSS classes instead of inline styles
    var animatedElements = document.querySelectorAll('.service-card, .blog-card, .testimonial-card, .credential-item');
    animatedElements.forEach(function(el, index) {
        el.classList.add('scroll-hidden');
        el.style.transition = 'opacity 0.6s ease-out ' + (index * 0.1) + 's, transform 0.6s ease-out ' + (index * 0.1) + 's';
        observer.observe(el);
    });
}

// ====================================
// Blog System
// ====================================
function initBlogSystem() {
    // Load any previously saved blogs from localStorage
    loadBlogs();

    // Wire up "Read Article" links on sample (static) blog cards
    document.querySelectorAll('.blog-card[data-blog-title]').forEach(function(card) {
        var link = card.querySelector('.blog-link');
        if (link) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                var title = card.getAttribute('data-blog-title');
                var content = card.getAttribute('data-blog-content');
                showModal(title, content);
            });
        }
    });
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
// WhatsApp number (country code + number, no spaces or symbols)
const WHATSAPP_NUMBER = '919966003251';

function initContactForm() {
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const name = document.getElementById('contactName').value;
            const phone = document.getElementById('contactPhone').value;
            const email = document.getElementById('contactEmail').value;
            const service = document.getElementById('contactService').value;
            const message = document.getElementById('contactMessage').value;

            // Save to localStorage as backup
            let contacts = JSON.parse(localStorage.getItem('contacts')) || [];
            contacts.push({ name, phone, email, service, message, date: new Date().toISOString() });
            localStorage.setItem('contacts', JSON.stringify(contacts));

            // Build WhatsApp message
            var lines = [];
            lines.push('*New Appointment Request*');
            lines.push('');
            lines.push('*Name:* ' + name);
            if (phone) lines.push('*Phone:* ' + phone);
            if (email) lines.push('*Email:* ' + email);
            if (service) lines.push('*Service:* ' + service);
            if (message) {
                lines.push('');
                lines.push('*Message:*');
                lines.push(message);
            }

            var whatsappText = encodeURIComponent(lines.join('\n'));
            var whatsappUrl = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + whatsappText;

            // Open WhatsApp in new tab
            window.open(whatsappUrl, '_blank');

            // Reset form
            contactForm.reset();

            // Show success modal
            showModal(
                'Redirecting to WhatsApp!',
                'Your appointment details have been prepared. Please send the message on WhatsApp to complete your booking.'
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

    // Preserve line breaks for multi-line content (blog posts)
    if (message.indexOf('\n') !== -1) {
        modalMessage.innerHTML = '';
        message.split('\n\n').forEach(function(para) {
            var p = document.createElement('p');
            p.textContent = para;
            p.style.marginBottom = '1rem';
            p.style.textAlign = 'left';
            modalMessage.appendChild(p);
        });
    } else {
        modalMessage.textContent = message;
    }

    modal.classList.add('active');
}

// ====================================
// YouTube Feed (auto-fetch via RSS)
// ====================================
// TODO: Replace with your actual YouTube channel ID (starts with UC...)
// Find it at: youtube.com/account_advanced or right-click page source on youtube.com/@ABCcancer
const YOUTUBE_CHANNEL_ID = 'YOUR_CHANNEL_ID';
const YOUTUBE_VIDEO_COUNT = 6;

// Instagram Graph API — set your long-lived access token here.
// Generate one at https://developers.facebook.com/tools/explorer/
// then exchange for a long-lived token (valid 60 days, auto-refreshable).
const INSTAGRAM_ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN';
const INSTAGRAM_POST_COUNT = 12;

// Google Places API — set your Place ID and API key to fetch Google reviews.
// Find your Place ID at https://developers.google.com/maps/documentation/places/web-service/place-id
// Create an API key at https://console.cloud.google.com (enable Places API New).
const GOOGLE_PLACE_ID = 'YOUR_PLACE_ID';
const GOOGLE_MAPS_API_KEY = 'YOUR_API_KEY';

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
                        '<img src="' + thumb + '" alt="' + sanitizeHTML(title) + '" width="320" height="180" loading="lazy" decoding="async">' +
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
// Google Reviews (Places API)
// ====================================
function initGoogleReviews() {
    var container = document.getElementById('googleReviewsGrid');
    if (!container) return;

    if (!GOOGLE_PLACE_ID || GOOGLE_PLACE_ID === 'YOUR_PLACE_ID' ||
        !GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'YOUR_API_KEY') {
        container.innerHTML =
            '<div class="google-reviews-fallback">' +
                '<p>Google Reviews not configured yet.</p>' +
                '<p>Set <code>GOOGLE_PLACE_ID</code> and <code>GOOGLE_MAPS_API_KEY</code> in script.js.</p>' +
            '</div>';
        return;
    }

    var apiUrl = 'https://places.googleapis.com/v1/places/' + GOOGLE_PLACE_ID +
        '?key=' + GOOGLE_MAPS_API_KEY;

    fetch(apiUrl, {
        headers: {
            'X-Goog-FieldMask': 'reviews,rating,userRatingCount,googleMapsUri'
        }
    })
        .then(function(res) {
            if (!res.ok) throw new Error('Places API error');
            return res.json();
        })
        .then(function(place) {
            var reviews = place.reviews || [];
            if (reviews.length === 0) {
                container.innerHTML = '<p class="google-reviews-empty">No reviews found.</p>';
                return;
            }

            // Update summary badge
            var badge = document.getElementById('googleReviewsBadge');
            if (badge && place.rating) {
                var stars = '';
                for (var i = 0; i < 5; i++) {
                    if (i < Math.floor(place.rating)) stars += '★';
                    else if (i < place.rating) stars += '★'; // half-star simplified to full
                    else stars += '☆';
                }
                badge.innerHTML =
                    '<img src="https://www.google.com/favicon.ico" alt="Google" class="google-icon">' +
                    '<span class="google-badge-rating">' + place.rating.toFixed(1) + '</span>' +
                    '<span class="google-badge-stars">' + stars + '</span>' +
                    '<span class="google-badge-count">(' + (place.userRatingCount || 0) + ' reviews)</span>';
                badge.href = place.googleMapsUri || '#';
                badge.style.display = 'flex';
            }

            buildGoogleReviewsSlider(container, reviews, place.googleMapsUri);
        })
        .catch(function() {
            container.innerHTML =
                '<div class="google-reviews-fallback">' +
                    '<p>Could not load Google reviews.</p>' +
                    '<a href="https://www.google.com/maps/search/Amor+Hospitals+Kukatpally+Hyderabad" target="_blank">View on Google Maps →</a>' +
                '</div>';
        });
}

function buildGoogleReviewsSlider(container, reviews, mapsUri) {
    container.innerHTML = '';
    var currentIndex = 0;
    var autoTimer = null;

    // Build cards track
    var track = document.createElement('div');
    track.className = 'grev-track';

    reviews.forEach(function(review) {
        var card = document.createElement('div');
        card.className = 'grev-card';

        var rating = review.rating || 5;
        var stars = '';
        for (var s = 0; s < 5; s++) {
            stars += s < rating ? '★' : '☆';
        }

        var text = review.text ? review.text.text || '' : '';
        var author = review.authorAttribution ? review.authorAttribution.displayName || 'Google User' : 'Google User';
        var photoUri = review.authorAttribution && review.authorAttribution.photoUri ? review.authorAttribution.photoUri : '';
        var relTime = review.relativePublishTimeDescription || '';

        card.innerHTML =
            '<div class="grev-header">' +
                (photoUri ? '<img src="' + photoUri + '" alt="" class="grev-avatar">' :
                    '<div class="grev-avatar grev-avatar--placeholder">' + sanitizeHTML(author.charAt(0)) + '</div>') +
                '<div class="grev-author-info">' +
                    '<strong class="grev-name">' + sanitizeHTML(author) + '</strong>' +
                    '<span class="grev-time">' + sanitizeHTML(relTime) + '</span>' +
                '</div>' +
                '<img src="https://www.google.com/favicon.ico" alt="Google" class="grev-google-icon">' +
            '</div>' +
            '<div class="grev-stars">' + stars + '</div>' +
            (text ? '<p class="grev-text">' + sanitizeHTML(text) + '</p>' : '');

        track.appendChild(card);
    });

    container.appendChild(track);

    // Navigation
    if (reviews.length > 1) {
        var prevBtn = document.createElement('button');
        prevBtn.className = 'grev-nav grev-nav--prev';
        prevBtn.setAttribute('aria-label', 'Previous review');
        prevBtn.innerHTML = '‹';
        container.appendChild(prevBtn);

        var nextBtn = document.createElement('button');
        nextBtn.className = 'grev-nav grev-nav--next';
        nextBtn.setAttribute('aria-label', 'Next review');
        nextBtn.innerHTML = '›';
        container.appendChild(nextBtn);

        // Dots
        var dotsWrap = document.createElement('div');
        dotsWrap.className = 'grev-dots';
        for (var d = 0; d < reviews.length; d++) {
            var dot = document.createElement('button');
            dot.className = 'grev-dot' + (d === 0 ? ' active' : '');
            dot.dataset.index = d;
            dotsWrap.appendChild(dot);
        }
        container.appendChild(dotsWrap);

        function goTo(idx) {
            if (idx < 0) idx = reviews.length - 1;
            if (idx >= reviews.length) idx = 0;
            currentIndex = idx;
            track.style.transform = 'translateX(-' + (currentIndex * 100) + '%)';
            var dots = dotsWrap.querySelectorAll('.grev-dot');
            dots.forEach(function(dot, i) {
                dot.classList.toggle('active', i === currentIndex);
            });
        }

        prevBtn.addEventListener('click', function() { goTo(currentIndex - 1); resetAuto(); });
        nextBtn.addEventListener('click', function() { goTo(currentIndex + 1); resetAuto(); });
        dotsWrap.addEventListener('click', function(e) {
            if (e.target.classList.contains('grev-dot')) {
                goTo(parseInt(e.target.dataset.index));
                resetAuto();
            }
        });

        // Autoplay
        function resetAuto() {
            clearInterval(autoTimer);
            autoTimer = setInterval(function() { goTo(currentIndex + 1); }, 6000);
        }
        resetAuto();

        container.addEventListener('mouseenter', function() { clearInterval(autoTimer); });
        container.addEventListener('mouseleave', function() { resetAuto(); });
    }
}

// ====================================
// Lazy Iframe Loading (Google Maps)
// ====================================
function initLazyIframes() {
    var iframes = document.querySelectorAll('iframe[data-src]');
    if (!iframes.length) return;

    if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    var iframe = entry.target;
                    iframe.src = iframe.getAttribute('data-src');
                    iframe.removeAttribute('data-src');
                    observer.unobserve(iframe);
                }
            });
        }, { rootMargin: '200px' });

        iframes.forEach(function(iframe) { observer.observe(iframe); });
    } else {
        // Fallback: load all iframes immediately
        iframes.forEach(function(iframe) {
            iframe.src = iframe.getAttribute('data-src');
            iframe.removeAttribute('data-src');
        });
    }
}

// ====================================
// Instagram Feed Slideshow
// ====================================
function initInstagramFeed() {
    var container = document.getElementById('instaSlideshow');
    if (!container) return;

    if (!INSTAGRAM_ACCESS_TOKEN || INSTAGRAM_ACCESS_TOKEN === 'YOUR_ACCESS_TOKEN') {
        container.innerHTML =
            '<div class="insta-fallback">' +
                '<p>Instagram feed not configured yet.</p>' +
                '<p>Set <code>INSTAGRAM_ACCESS_TOKEN</code> in script.js to enable the live feed.</p>' +
            '</div>';
        return;
    }

    var apiUrl = 'https://graph.instagram.com/me/media' +
        '?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp' +
        '&limit=' + INSTAGRAM_POST_COUNT +
        '&access_token=' + INSTAGRAM_ACCESS_TOKEN;

    fetch(apiUrl)
        .then(function(res) {
            if (!res.ok) throw new Error('Instagram API error');
            return res.json();
        })
        .then(function(json) {
            var posts = (json.data || []).filter(function(p) {
                return p.media_type === 'IMAGE' || p.media_type === 'CAROUSEL_ALBUM' || p.media_type === 'VIDEO';
            });

            if (posts.length === 0) {
                container.innerHTML = '<p class="insta-loading">No posts found.</p>';
                return;
            }

            buildInstaSlideshow(container, posts);
        })
        .catch(function() {
            container.innerHTML =
                '<div class="insta-fallback">' +
                    '<p>Could not load Instagram posts. The access token may have expired.</p>' +
                    '<a href="https://www.instagram.com/kalyan_oncosurgeon" target="_blank">Visit Instagram profile →</a>' +
                '</div>';
        });
}

function buildInstaSlideshow(container, posts) {
    var currentIndex = 0;
    var autoplayTimer = null;

    // Build DOM
    container.innerHTML = '';
    container.className = 'insta-slideshow insta-slideshow--ready';

    // Track
    var track = document.createElement('div');
    track.className = 'insta-track';

    posts.forEach(function(post) {
        var slide = document.createElement('a');
        slide.className = 'insta-slide';
        slide.href = post.permalink;
        slide.target = '_blank';
        slide.rel = 'noopener';

        var imgSrc = post.media_type === 'VIDEO' ? post.thumbnail_url : post.media_url;
        var caption = post.caption ? sanitizeHTML(post.caption.substring(0, 120)) : '';

        slide.innerHTML =
            '<div class="insta-slide-img">' +
                '<img src="' + imgSrc + '" alt="' + caption + '" loading="lazy" decoding="async">' +
                (post.media_type === 'VIDEO' ? '<span class="insta-video-badge">▶</span>' : '') +
                (post.media_type === 'CAROUSEL_ALBUM' ? '<span class="insta-carousel-badge">❑❑</span>' : '') +
            '</div>' +
            (caption ? '<p class="insta-caption">' + caption + (post.caption.length > 120 ? '…' : '') + '</p>' : '');

        track.appendChild(slide);
    });

    container.appendChild(track);

    // Navigation arrows
    var prevBtn = document.createElement('button');
    prevBtn.className = 'insta-nav insta-nav--prev';
    prevBtn.setAttribute('aria-label', 'Previous posts');
    prevBtn.innerHTML = '‹';
    container.appendChild(prevBtn);

    var nextBtn = document.createElement('button');
    nextBtn.className = 'insta-nav insta-nav--next';
    nextBtn.setAttribute('aria-label', 'Next posts');
    nextBtn.innerHTML = '›';
    container.appendChild(nextBtn);

    // Dots
    var slidesPerView = getSlidesPerView();
    var totalPages = Math.ceil(posts.length / slidesPerView);
    var dotsWrap = document.createElement('div');
    dotsWrap.className = 'insta-dots';

    for (var d = 0; d < totalPages; d++) {
        var dot = document.createElement('button');
        dot.className = 'insta-dot' + (d === 0 ? ' active' : '');
        dot.setAttribute('aria-label', 'Go to page ' + (d + 1));
        dot.dataset.index = d;
        dotsWrap.appendChild(dot);
    }
    container.appendChild(dotsWrap);

    // Slide logic
    function getSlidesPerView() {
        if (window.innerWidth <= 480) return 1;
        if (window.innerWidth <= 768) return 2;
        if (window.innerWidth <= 1024) return 3;
        return 4;
    }

    function goTo(pageIndex) {
        slidesPerView = getSlidesPerView();
        totalPages = Math.ceil(posts.length / slidesPerView);
        if (pageIndex < 0) pageIndex = totalPages - 1;
        if (pageIndex >= totalPages) pageIndex = 0;
        currentIndex = pageIndex;

        var offset = -(currentIndex * slidesPerView * (100 / slidesPerView));
        track.style.transform = 'translateX(' + offset + '%)';

        var dots = dotsWrap.querySelectorAll('.insta-dot');
        dots.forEach(function(dot, i) {
            dot.classList.toggle('active', i === currentIndex);
        });
    }

    prevBtn.addEventListener('click', function() { goTo(currentIndex - 1); resetAutoplay(); });
    nextBtn.addEventListener('click', function() { goTo(currentIndex + 1); resetAutoplay(); });
    dotsWrap.addEventListener('click', function(e) {
        if (e.target.classList.contains('insta-dot')) {
            goTo(parseInt(e.target.dataset.index));
            resetAutoplay();
        }
    });

    // Autoplay
    function resetAutoplay() {
        clearInterval(autoplayTimer);
        autoplayTimer = setInterval(function() { goTo(currentIndex + 1); }, 5000);
    }
    resetAutoplay();

    // Pause on hover
    container.addEventListener('mouseenter', function() { clearInterval(autoplayTimer); });
    container.addEventListener('mouseleave', function() { resetAutoplay(); });

    // Recalculate on resize
    var resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            // Rebuild dots for new slidesPerView
            slidesPerView = getSlidesPerView();
            totalPages = Math.ceil(posts.length / slidesPerView);
            dotsWrap.innerHTML = '';
            for (var d = 0; d < totalPages; d++) {
                var dot = document.createElement('button');
                dot.className = 'insta-dot' + (d === 0 ? ' active' : '');
                dot.dataset.index = d;
                dotsWrap.appendChild(dot);
            }
            goTo(0);
        }, 250);
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
