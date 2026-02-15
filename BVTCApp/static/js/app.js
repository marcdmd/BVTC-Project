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
    button.addEventListener('click', () => {
        button.closest('.modal-container')
              .classList.remove('show')
    })
})

// Escape key
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-container.show')
            .forEach(modal => modal.classList.remove('show'))
    }
})

// Backdrop click
document.querySelectorAll('.modal-container').forEach(modal => {
    modal.addEventListener('click', e => {
        if (e.target === modal) {
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
let slideIndex = 1;
showSlides(slideIndex);

// Next/previous controls
function plusSlides(n) {
  showSlides(slideIndex += n);
}

// Thumbnail image controls
function currentSlide(n) {
  showSlides(slideIndex = n);
}

function showSlides(n) {
  let i;
  let slides = document.getElementsByClassName("mySlides");
  let dots = document.getElementsByClassName("dot");
  if (n > slides.length) {slideIndex = 1}
  if (n < 1) {slideIndex = slides.length}
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndex-1].style.display = "block";
  dots[slideIndex-1].className += " active";
}