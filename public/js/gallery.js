let engineersData = [];
let currentSlide = 0;
let slideshowInterval = null;
let isSlideshowActive = false;

async function loadEngineers() {
    const gallery = document.getElementById('engineersGallery');
    
    try {
        const response = await fetch('/api/engineer/public');
        const data = await response.json();

        if (data.success && data.engineers.length > 0) {
            engineersData = data.engineers;
            renderGridView();
            renderSlideshow();
        } else {
            gallery.innerHTML = `
                <div class="gallery-item" style="grid-column: 1 / -1;">
                    <div class="gallery-item-content" style="text-align: center;">
                        <h3>No engineers found</h3>
                        <p>Engineers will appear here once added to the system</p>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading engineers:', error);
        gallery.innerHTML = `
            <div class="gallery-item" style="grid-column: 1 / -1;">
                <div class="gallery-item-content" style="text-align: center;">
                    <h3>Error loading engineers</h3>
                    <p>Please try again later</p>
                </div>
            </div>
        `;
    }
}

function handleImageError(img) {
    img.src = 'images/engineers/default.png';
}

function renderGridView() {
    const gallery = document.getElementById('engineersGallery');
    gallery.innerHTML = '';

    engineersData.forEach((engineer, index) => {
        // Use imag folder images based on engineer index
        const imageNumber = (index % 8) + 1;
        const photoUrl = `/imag/${imageNumber}.jpeg`;

        const card = `
            <div class="gallery-item">
                <img src="${photoUrl}" alt="${engineer.name}">
                <div class="gallery-item-content">
                    <h3>VR Group</h3>
                </div>
            </div>
        `;
        gallery.innerHTML += card;
    });

    // Add error handling to all images
    document.querySelectorAll('.gallery-item img').forEach(img => {
        img.onerror = function() {
            handleImageError(this);
        };
    });
}

function renderSlideshow() {
    const slideshowContent = document.getElementById('slideshowContent');
    const slideshowDots = document.getElementById('slideshowDots');

    // Check if slideshow elements exist
    if (!slideshowContent || !slideshowDots) {
        console.warn('Slideshow elements not found, skipping slideshow render');
        return;
    }

    slideshowContent.innerHTML = '';
    slideshowDots.innerHTML = '';

    engineersData.forEach((engineer, index) => {
        // Use imag folder images based on engineer index
        const imageNumber = (index % 8) + 1;
        const photoUrl = `/imag/${imageNumber}.jpeg`;

        const slide = `
            <div class="slideshow-slide ${index === 0 ? 'active' : ''}" data-index="${index}">
                <img src="${photoUrl}" alt="${engineer.name}">
                <div class="slideshow-info">
                    <h3>VR Group</h3>
                </div>
            </div>
        `;
        slideshowContent.innerHTML += slide;

        const dot = `<span class="slideshow-dot ${index === 0 ? 'active' : ''}" data-slide-index="${index}"></span>`;
        slideshowDots.innerHTML += dot;
    });

    // Add error handling to all slideshow images
    document.querySelectorAll('.slideshow-slide img').forEach(img => {
        img.onerror = function() {
            handleImageError(this);
        };
    });

    // Add click handlers to dots
    document.querySelectorAll('.slideshow-dot').forEach(dot => {
        dot.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-slide-index'));
            goToSlide(index);
        });
    });
}

function setGridView() {
    document.getElementById('engineersGallery').classList.remove('hidden');
    document.getElementById('slideshowContainer').classList.add('hidden');
    document.getElementById('viewGridBtn').classList.add('active');
    document.getElementById('viewSlideshowBtn').classList.remove('active');
    stopSlideshow();
}

function setSlideshowView() {
    document.getElementById('engineersGallery').classList.add('hidden');
    document.getElementById('slideshowContainer').classList.remove('hidden');
    document.getElementById('viewGridBtn').classList.remove('active');
    document.getElementById('viewSlideshowBtn').classList.add('active');
    startSlideshow();
}

function changeSlide(direction) {
    const slides = document.querySelectorAll('.slideshow-slide');
    const dots = document.querySelectorAll('.slideshow-dot');
    
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');
    
    currentSlide = (currentSlide + direction + slides.length) % slides.length;
    
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
}

function goToSlide(index) {
    const slides = document.querySelectorAll('.slideshow-slide');
    const dots = document.querySelectorAll('.slideshow-dot');
    
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');
    
    currentSlide = index;
    
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
}

function startSlideshow() {
    if (!isSlideshowActive) {
        isSlideshowActive = true;
        slideshowInterval = setInterval(() => {
            changeSlide(1);
        }, 3000); // Change slide every 3 seconds
    }
}

function stopSlideshow() {
    if (slideshowInterval) {
        clearInterval(slideshowInterval);
        slideshowInterval = null;
    }
    isSlideshowActive = false;
}

// Load engineers when page loads
document.addEventListener('DOMContentLoaded', loadEngineers);
