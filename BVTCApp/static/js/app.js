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
const add_button = document.querySelectorAll('.open-modal')
const modal = document.querySelector('.modal-container')
const close_button = document.querySelector('#close')

add_button.forEach(button => {
    button.addEventListener('click', e => {
        e.preventDefault()
        modal.classList.add('show')
    })
})

close_button.addEventListener('click', e => {
    modal.classList.remove('show')
})

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-container.show')
            .forEach(m => m.classList.remove('show'));
    }
});

document.querySelectorAll('.modal-container').forEach(modal => {
    modal.addEventListener('click', e => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });
});