// For toggling sidebar
const sidebar = document.getElementById('sidebar');

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

// For modals
// Helper Functions
function qs(selector, parent = document) {
    return parent.querySelector(selector);
}

function qsa(selector, parent = document) {
    return parent.querySelectorAll(selector);
}

function closeAllModals() {
    qsa('.modal-container.show').forEach(m => m.classList.remove('show'))
}

function showModal(modal) {
    const isNotif = modal.querySelector('.notif-modal');

    if (!isNotif) {
        document.querySelectorAll('.modal-container.show').forEach(m => {
            m.classList.remove('show');
        });
    }

    modal.classList.add('show');
}

// Modal References
const viewProductModal = document.getElementById('viewProductModal');
const viewOrderModal = document.getElementById('viewOrderModal');

// Functions
// Injecting Image Sets
// function addSlideshow(modal, modalButton) {
//     const slideContainer = qs('.slideshow-container', modal);
//     const dotContainer = qs('.dot-container', modal);
//     const imageUrls = modalButton.dataset.images ? modalButton.dataset.images.split(',') : [];        

//     slideContainer.innerHTML = '';
//     if (dotContainer) dotContainer.innerHTML = '';

//     imageUrls.forEach((url, index) => {
//         if (url.trim()) {
//             const slideDiv = document.createElement('div');
//             slideDiv.className = 'mySlides fade';
//             slideDiv.innerHTML = `<img src="${url}" class="img-container">`;
//             slideContainer.appendChild(slideDiv);

//             if(dotContainer) {
//                 const dot = document.createElement('span');
//                 dot.className = 'dot';
//                 dot.onclick = () => currentSlide(index + 1, 'view');
//                 dotContainer.appendChild(dot);
//             }
//         }
//     })

//     const prevBtn = document.createElement('a');
//     prevBtn.className = 'prev';
//     prevBtn.innerHTML = '&#10094;';
//     prevBtn.onclick = () => plusSlides(-1, 'view');

//     const nextBtn = document.createElement('a');
//     nextBtn.className = 'next';
//     nextBtn.innerHTML = '&#10095;';
//     nextBtn.onclick = () => plusSlides(1, 'view');

//     slideContainer.appendChild(prevBtn);
//     slideContainer.appendChild(nextBtn);
//     slideContainer.id = 'slideshow-view'
// }

// Event Delegation
document.addEventListener('click', function (e) {

    // Close Modal Buttons
    if (e.target.classList.contains('close-modal')) {
        const modal = e.target.closest('.modal-container');
        if (modal) modal.classList.remove('show');
    }

    //View Order Modal
    const viewOrder = e.target.closest('.open-view-order-modal')
    if (viewOrder && viewOrderModal) {
        e.preventDefault();
        const id = viewOrder.dataset.id;

        // For Image Set
        const slideContainer = qs('.slideshow-container', viewOrderModal);
        const dotContainer = qs('.dot-container', viewOrderModal);
        const imageUrls = viewOrder.dataset.images ? viewOrder.dataset.images.split(',') : [];        

        slideContainer.innerHTML = '';
        if (dotContainer) dotContainer.innerHTML = '';

        imageUrls.forEach((url, index) => {
            if (url.trim()) {
                const slideDiv = document.createElement('div');
                slideDiv.className = 'mySlides fade';
                slideDiv.innerHTML = `<img src="${url}" class="img-container">`;
                slideContainer.appendChild(slideDiv);

                if(dotContainer) {
                    const dot = document.createElement('span');
                    dot.className = 'dot';
                    dot.onclick = () => currentSlide(index + 1, 'view');
                    dotContainer.appendChild(dot);
                }
            }
        })

        const prevBtn = document.createElement('a');
        prevBtn.className = 'prev';
        prevBtn.innerHTML = '&#10094;';
        prevBtn.onclick = () => plusSlides(-1, 'view');

        const nextBtn = document.createElement('a');
        nextBtn.className = 'next';
        nextBtn.innerHTML = '&#10095;';
        nextBtn.onclick = () => plusSlides(1, 'view');

        slideContainer.appendChild(prevBtn);
        slideContainer.appendChild(nextBtn);
        slideContainer.id = 'slideshow-view'

        // Update Status Button
        const status = viewOrder.dataset.order_status;
        const statusBtn = qs('.status-btn', viewOrderModal);
        const statusText = qs('#order_order_status', viewOrderModal);

        const statusStyles = {
            'Under Feasibility': { color: '#FAF9F6', background: '#0B1E33' },
            'Under Quotation':   { color: '#FAF9F6', background: '#013C58' },
            'In Production':     { color: '#FAF9F6', background: '#00537A' },
            'Sampled':           { color: 'inherit', background: '#F5A201' },
            'Packaged':          { color: 'inherit', background: '#EDC001' },
            'In Transit':        { color: 'inherit', background: '#00C27D' }
        };

        statusText.textContent = status;

        if (statusStyles[status]) {
            statusBtn.style.backgroundColor = statusStyles[status].background;
            statusBtn.style.color = statusStyles[status].color;
        } else {
            statusBtn.style.backgroundColor = ''; 
            statusBtn.style.color = '';
        }

        // Order Items
        const itemsData = viewOrder.dataset.items;
        const items = JSON.parse(itemsData || '[]');
        const tableBody = qs('#order-items-body', viewOrderModal);

        tableBody.innerHTML = ''; 
        let totalQty = 0;
        let totalPrice = 0;

        items.forEach(item => {
            const qty = parseInt(item.qty) || 0;
            const price = parseFloat(item.price) || 0;
            totalQty += qty;
            totalPrice += (qty * price);

            const row = `
                <tr>
                    <td class="small-r" style="width: 25%;">${item.code}</td>
                    <td class="small-r" style="width: 15%;">${item.color || '-'}</td>
                    <td class="small-r" style="width: 25%;">${item.custom || '-'}</td>
                    <td class="small-r" style="width: 15%;">${qty}</td>
                    <td class="small-r" style="width: 15%;">${price.toFixed(2)}</td>
                    <td style="width: 5%;"><i class="material-symbols-rounded" style="color: #898989; font-size: 15px; cursor: pointer;">close</i></td>
                </tr>`;
            tableBody.innerHTML += row;
        });

        const qtyDisplay = qs('#order_total_qty', viewOrderModal);
        const priceDisplay = qs('#order_total_price', viewOrderModal);

        if (qtyDisplay) qtyDisplay.textContent = totalQty;
        if (priceDisplay) {
            priceDisplay.textContent = totalPrice.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        }

        // Lead Time
        const startDateStr = viewOrder.dataset.start_of_production; // e.g., "2023-10-01"
        const deliveryDateStr = viewOrder.dataset.delivery_date;    // e.g., "2023-10-15"

        if (startDateStr && deliveryDateStr) {
            const start = new Date(startDateStr);
            const delivery = new Date(deliveryDateStr);

            // Calculate difference in milliseconds
            const diffInMs = delivery - start;

            // Convert milliseconds to days (1000ms * 60s * 60m * 24h)
            const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

            // Display the result
            const leadTimeElement = qs('#order_lead_time', viewOrderModal);
            leadTimeElement.textContent = diffInDays > 0 ? `${diffInDays} Days` : "0 Days";
        }

        qs('#order_order_id', viewOrderModal).textContent = viewOrder.dataset.order_id;
        qs('#order_customer_name', viewOrderModal).textContent = viewOrder.dataset.customer_name;
        qs('#order_company_name', viewOrderModal).textContent = viewOrder.dataset.company_name;
        qs('#order_company_address', viewOrderModal).textContent = viewOrder.dataset.company_address;
        qs('#order_budget', viewOrderModal).textContent = viewOrder.dataset.budget;
        qs('#order_order_status', viewOrderModal).textContent = viewOrder.dataset.order_status;
        qs('#order_delivery_address', viewOrderModal).textContent = viewOrder.dataset.delivery_address;
        qs('#order_contact', viewOrderModal).textContent = viewOrder.dataset.contact;
        qs('#order_contact_number', viewOrderModal).textContent = viewOrder.dataset.contact_number;
        qs('#order_contact_email', viewOrderModal).textContent = viewOrder.dataset.contact_email;
        qs('#order_mode_of_payment', viewOrderModal).textContent = viewOrder.dataset.mode_of_payment;
        qs('#order_payment_terms', viewOrderModal).textContent = viewOrder.dataset.payment_terms;
        qs('#order_packing_instructions', viewOrderModal).textContent = viewOrder.dataset.packing_instructions;
        qs('#order_start_of_production', viewOrderModal).textContent = viewOrder.dataset.start_of_production;
        qs('#order_delivery_date', viewOrderModal).textContent = viewOrder.dataset.delivery_date;
        qs('#order_transaction_platform', viewOrderModal).textContent = viewOrder.dataset.transaction_platform;
        qs('#order_account_manager', viewOrderModal).textContent = viewOrder.dataset.account_manager;
        viewOrderModal.dataset.currentOrder = JSON.stringify(viewOrder.dataset);

        showModal(viewOrderModal);

        if (typeof showSlides === 'function') showSlides(1, 'view');
    }

    // View Product Modal
    const viewProduct = e.target.closest('.open-view-modal')
    if (viewProduct && viewProductModal) {
        e.preventDefault();
        const id = viewProduct.dataset.id;
        
        // For Image Set
        const slideContainer = qs('.slideshow-container', viewProductModal);
        const dotContainer = qs('.dot-container', viewProductModal);
        const imageUrls = viewProduct.dataset.images ? viewProduct.dataset.images.split(',') : [];        

        slideContainer.innerHTML = '';
        if (dotContainer) dotContainer.innerHTML = '';

        imageUrls.forEach((url, index) => {
            if (url.trim()) {
                const slideDiv = document.createElement('div');
                slideDiv.className = 'mySlides fade';
                slideDiv.innerHTML = `<img src="${url}" class="img-container">`;
                slideContainer.appendChild(slideDiv);

                if(dotContainer) {
                    const dot = document.createElement('span');
                    dot.className = 'dot';
                    dot.onclick = () => currentSlide(index + 1, 'view');
                    dotContainer.appendChild(dot);
                }
            }
        })

        const prevBtn = document.createElement('a');
        prevBtn.className = 'prev';
        prevBtn.innerHTML = '&#10094;';
        prevBtn.onclick = () => plusSlides(-1, 'view');

        const nextBtn = document.createElement('a');
        nextBtn.className = 'next';
        nextBtn.innerHTML = '&#10095;';
        nextBtn.onclick = () => plusSlides(1, 'view');

        slideContainer.appendChild(prevBtn);
        slideContainer.appendChild(nextBtn);
        slideContainer.id = 'slideshow-view'

        // For Color Set
        const colorContainer = qs('.color-container', viewProductModal);
        const colors = viewProduct.dataset.colors ? viewProduct.dataset.colors.split(',') : [];

        colorContainer.innerHTML = '';

        colors.forEach(color => {
            if (color.trim()) {
                const colorDiv = document.createElement('div');
                colorDiv.className = 'product-highlight';
                colorDiv.innerHTML = `
                    <span style="background: ${color}"></span>
                    <p class="small-r">${color}</p>
                `;
                colorContainer.appendChild(colorDiv);
            }
        })

        qs('#view_product_code', viewProductModal).textContent = viewProduct.dataset.product_code;
        qs('#view_product_name', viewProductModal).textContent = viewProduct.dataset.product_name;
        qs('#view_category', viewProductModal).textContent = viewProduct.dataset.category;
        qs('#view_moq', viewProductModal).textContent = viewProduct.dataset.moq;
        qs('#view_starting_price', viewProductModal).textContent = viewProduct.dataset.starting_price;
        qs('#view_product_description', viewProductModal).textContent = viewProduct.dataset.product_description;

        viewProductModal.dataset.currentProduct = JSON.stringify(viewProduct.dataset);
        
        showModal(viewProductModal);

        if (typeof showSlides === 'function') showSlides(1, 'view');
    }

    // Edit Modal from View
    const editBtn = e.target.closest('.open-edit-modal');
    if (editBtn) {
        const editProductModal = document.getElementById('editProductModal');
        const viewModal = document.getElementById('viewProductModal');
        const data = JSON.parse(viewModal.dataset.currentProduct);
        const editForm = qs('form', editProductModal);

        editForm.action = `catalog/edit/${data.db_id}/`;

        qs('h1', editProductModal).textContent = `Edit ${data.product_code}`;
        qs('#edit_product_db_id', editProductModal).value = data.db_id;
        qs('#edit_product_id', editProductModal).value = data.product_code;
        qs('#edit_product_name', editProductModal).value = data.product_name;
        qs('#edit_category', editProductModal).value = data.category;
        qs('#edit_moq', editProductModal).value = data.moq;
        qs('#edit_starting_price', editProductModal).value = data.starting_price;
        qs('#edit_product_description', editProductModal).value = data.product_description;

        const colorListContainer = qs('.color-input-list', editProductModal);
        const colors = data.colors ? data.colors.split(',') : [];

        colorListContainer.innerHTML = '';

        if (colors.length === 0) {
            addColorRow(colorListContainer, '', true);
        } else {
            colors.forEach((color, index) => {
                addColorRow(colorListContainer, color.trim(), index === 0);
            });
        }

        const imageUrls = data.images ? data.images.split(',') : [];
        const fileWrappers = editProductModal.querySelectorAll('.file-upload');
        
        fileWrappers.forEach((wrapper, index) => {
            const textSpan = wrapper.querySelector('.file-text');
            if (imageUrls[index] && textSpan) {
                const filename = imageUrls[index].split('/').pop();
                textSpan.textContent = filename;
                textSpan.title = filename; 
                textSpan.style.color = "#333";
            } else if (textSpan) {
                textSpan.textContent = "Upload Image";
                textSpan.style.color = "#898989";
            }
        });

        showModal(editProductModal);
    }

    // Add and Remove Color
    const addColorBtn = e.target.closest('.add-color-btn');
    if (addColorBtn) {
        const container = addColorBtn.closest('.color-input-list');
        const newRow = document.createElement('div');
        newRow.className = 'color-input-row';
        newRow.innerHTML = `
            <div class="error-wrap">
                <input class="input" type="text" placeholder="#000000" name="colors[]" style="min-width: 90px;"
                        pattern="^#[A-Fa-f0-9]{6}$" data-error="Please enter a valid hex code (e.g. #FFFFFF)">
                <span class="error-msg"></span>
            </div>
            <button type="button" class="remove-color-btn">
                <i class="material-symbols-rounded" style="font-size: 21px;">remove</i>
            </button>
        `;
        container.appendChild(newRow);
    }

    // Handle "-" Button Click
    const removeColorBtn = e.target.closest('.remove-color-btn');
    if (removeColorBtn) {
        removeColorBtn.closest('.color-input-row').remove();
    }

    // Add Product Modal
    const addBtn = e.target.closest('.open-add-modal')
    if (addBtn) {
        const addProductModal = document.getElementById('addProductModal')
        qs('h1', addProductModal).textContent = 'Add New Product';
        if (addProductModal) showModal(addProductModal);
    }

    // Delete Modal from View
    const deleteBtn = e.target.closest('.open-delete-product-modal');
    if (deleteBtn) {
        const deleteProductModal = document.getElementById('deleteProductModal');
        const viewModal = document.getElementById('viewProductModal');
        
        // Pull the saved data from the View Modal
        const data = JSON.parse(viewModal.dataset.currentProduct);

        // Update BOTH the code and the name
        const codeDisplay = qs('#delete_product_code', deleteProductModal);
        const nameDisplay = qs('#delete_product_name', deleteProductModal);
        
        if (codeDisplay) codeDisplay.textContent = data.product_code;
        if (nameDisplay) nameDisplay.textContent = data.product_name;

        // Handle the "Yes" (Confirm) button action
        const confirmBtn = deleteProductModal.querySelector('.button-tertiary');
        if (confirmBtn) {
            confirmBtn.onclick = () => {
                window.location.href = `catalog/delete/${data.db_id}/`;
            };
        }

        showModal(deleteProductModal);
    }
});

// Escape key
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-container.show').forEach(modal => {
            if (!modal.querySelector('form')) {
                modal.classList.remove('show');
            }
        });
    }
})

// Backdrop click
document.querySelectorAll('.modal-container').forEach(modal => {
    modal.addEventListener('click', e => {
        if (e.target === modal) {
            if (!modal.querySelector('form')) {
                modal.classList.remove('show');
            }
        }
    });
});

// Change Name to File Input
document.addEventListener('change', function (e) {
    const input = e.target.closest('.file-upload input[type="file"]');
    if (!input) return;

    const span = input.closest('label').querySelector('.file-text');

    if (input.files.length === 0) {
        span.textContent = "Upload Image";
        span.style.color = "#898989";
    } else {
        span.textContent = input.files[0].name;
        span.style.color = "#333";
    }
});

// Validator for All Modals
const modalForms = document.querySelectorAll('.modal-container form');

modalForms.forEach(form => {
    // Validate on input (Real-time)
    form.addEventListener('input', function (e) {
        const field = e.target;
        if (field.classList.contains('input') || field.type === 'file') {
            validateField(field);
        }
    });

    // Validate on submit (Final check)
    form.addEventListener('submit', function (e) {
        const fields = form.querySelectorAll('.input, input[type="file"]');
        let isValid = true;

        fields.forEach(field => {
            if (!validateField(field)) isValid = false;
        });

        // Stop submission if anything is invalid
        if (!isValid) {
            e.preventDefault();
            console.log("Form validation failed.");
        }
    });
});

// Validator
function validateField(field) {
    const errorWrap = field.closest('.error-wrap');
    const errorMsg = errorWrap ? errorWrap.querySelector('.error-msg') : null;
    
    if (!field.checkValidity()) {
        if (errorMsg) {
            errorMsg.textContent = field.dataset.error || field.validationMessage;
            errorMsg.style.display = 'block';
            field.classList.add('error-border');
        }
        return false;
    } else {
        if (errorMsg) {
            errorMsg.style.display = 'none';
            field.classList.remove('error-border');
        }
        return true;
    }
}

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

// Add Color Helper Function
function addColorRow(container, value, isFirst) {
    const div = document.createElement('div');
    div.className = 'color-input-row';
    div.innerHTML = `
        <div class="error-wrap">
            <!-- ADD value="${value}" BELOW -->
            <input class="input" type="text" value="${value}" placeholder="#000000" name="colors[]" style="min-width: 90px;"
                    pattern="^#[A-Fa-f0-9]{6}$" data-error="Please enter a valid hex code (e.g. #FFFFFF)">
            <span class="error-msg"></span>
        </div>
        <button type="button" class="${isFirst ? 'add-color-btn' : 'remove-color-btn'}">
            <i class="material-symbols-rounded" style="font-size: 21px;">${isFirst ? 'add' : 'remove'}</i>
        </button>
    `;
    container.appendChild(div);
}

document.addEventListener("DOMContentLoaded", function () {
  const slideshows = document.querySelectorAll("[id^='slideshow-']");

  slideshows.forEach(slideshow => {
    const productId = slideshow.id.replace("slideshow-", "");
    slideIndexes[productId] = 1;
    showSlides(1, productId);
  });
});