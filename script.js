document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger-menu');
    const nav = document.querySelector('.main-nav');
    const submenuItems = document.querySelectorAll('.has-submenu');
    
    // Create overlay element
    const overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    document.body.appendChild(overlay);

    // Handle menu hover
    hamburger.addEventListener('mouseenter', function() {
        nav.style.left = '0';
        nav.style.display = 'block';
        overlay.style.display = 'block';
        document.body.style.overflow = 'hidden';
    });

    nav.addEventListener('mouseleave', function() {
        nav.style.left = '-100%';
        nav.style.display = 'none';
        overlay.style.display = 'none';
        document.body.style.overflow = '';
    });

    // Handle submenu hover
    submenuItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            const submenu = this.querySelector('.submenu');
            if (submenu) {
                submenu.style.display = 'block';
            }
        });

        item.addEventListener('mouseleave', function() {
            const submenu = this.querySelector('.submenu');
            if (submenu) {
                submenu.style.display = 'none';
            }
        });
    });

    // Close menu when clicking overlay
    overlay.addEventListener('click', function() {
        nav.style.left = '-100%';
        nav.style.display = 'none';
        overlay.style.display = 'none';
        document.body.style.overflow = '';
    });

    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            nav.style.left = '-100%';
            nav.style.display = 'none';
            overlay.style.display = 'none';
            document.body.style.overflow = '';
        }
    });

    // Slider functionality
    const slides = document.querySelector('.slides');
    const prevButton = document.querySelector('.prev-button');
    const nextButton = document.querySelector('.next-button');
    const dotsContainer = document.querySelector('.slider-dots');
    let currentSlide = 0;
    const totalSlides = document.querySelectorAll('.slide').length;

    // Create dots
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    }

    // Update dots
    function updateDots() {
        document.querySelectorAll('.dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
    }

    // Go to specific slide
    function goToSlide(slideIndex) {
        currentSlide = slideIndex;
        slides.style.transform = `translateX(-${currentSlide * 33.333}%)`;
        updateDots();
    }

    // Next slide
    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        goToSlide(currentSlide);
    }

    // Previous slide
    function prevSlide() {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        goToSlide(currentSlide);
    }

    // Event listeners
    prevButton.addEventListener('click', prevSlide);
    nextButton.addEventListener('click', nextSlide);

    // Auto slide every 5 seconds
    setInterval(nextSlide, 5000);
}); 