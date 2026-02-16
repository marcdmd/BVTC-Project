// For toggling sidebar
const sidebar = document.getElementById('sidebar')

document.addEventListener("DOMContentLoaded", () => {
    const isExpanded = localStorage.getItem('sidebar-expanded');
    
    if (isExpanded === 'true') {
        sidebar.classList.add('expand');
    }
});

function toggleSidebar() {
    sidebar.classList.toggle('expand')

    const isExpanded = sidebar.classList.contains('expand');
    localStorage.setItem('sidebar-expanded', isExpanded);
}

//For modals
// Open modal
document.querySelectorAll('[data-modal]').forEach(button => {
    button.addEventListener('click', e => {
        if (e.target.closest('.modal')) return;
        e.preventDefault()

        const modalId = button.dataset.modal
        const modal = document.getElementById(modalId)

        if (modal) {
            modal.classList.add('show')
        }
    })
})

// Close modal buttons
document.querySelectorAll('.close-modal').forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        button.closest('.modal-container')
              .classList.remove('show')
    })
})

// Escape key
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        e.stopPropagation();
        document.querySelectorAll('.modal-container.show')
            .forEach(modal => modal.classList.remove('show'))
    }
})

// Backdrop click
document.querySelectorAll('.modal-container').forEach(modal => {
    modal.addEventListener('click', e => {
        if (e.target === modal) {
            e.stopPropagation();
            modal.classList.remove('show')
        }
    })
})

// Change Name to File Input
document.querySelectorAll('.file-upload input[type="file"]')
    .forEach(input => {
        input.addEventListener('change', function () {

            const span = this.closest('label')
                              .querySelector('.file-text');

            if (this.files.length === 0) {
                span.textContent = "Upload Image";
                span.style.color = "#898989";
            } else {
                span.textContent = this.files[0].name;
                span.style.color = "#333";
            }
        });
    });

// Carousel
const slideIndexes = {};

function plusSlides(n, productId) {
  if (!slideIndexes[productId]) slideIndexes[productId] = 1;
  showSlides(slideIndexes[productId] += n, productId);
}

function currentSlide(n, productId) {
  slideIndexes[productId] = n;
  showSlides(n, productId);
}

function showSlides(n, productId) {
  const slideshow = document.getElementById(`slideshow-${productId}`);
  const slides = slideshow.getElementsByClassName("mySlides");
  const dots = slideshow.parentElement.querySelectorAll(`#slideshow-${productId} ~ div .dot`);

  if (n > slides.length) slideIndexes[productId] = 1;
  if (n < 1) slideIndexes[productId] = slides.length;

  for (let i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }

  for (let i = 0; i < dots.length; i++) {
    dots[i].classList.remove("active");
  }

  slides[slideIndexes[productId] - 1].style.display = "block";
  if (dots[slideIndexes[productId] - 1]) {
    dots[slideIndexes[productId] - 1].classList.add("active");
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const slideshows = document.querySelectorAll("[id^='slideshow-']");

  slideshows.forEach(slideshow => {
    const productId = slideshow.id.replace("slideshow-", "");
    slideIndexes[productId] = 1;
    showSlides(1, productId);
  });
});