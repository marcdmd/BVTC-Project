// Variables
const sidebar = document.getElementById('sidebar');

const viewProductModal = document.getElementById('viewProductModal');
const viewOrderModal = document.getElementById('viewOrderModal');
const viewItemModal = document.getElementById('viewItemModal');

const modalForms = document.querySelectorAll('.modal form'); // For validator

const orderBody = document.getElementById('order-items-body');

const slideIndexes = {}; // For slideshow

// EVENT LISTENERS

// Event Delegation for Modals
document.addEventListener('click', function (e) {
    
    // Close Modal Buttons
    if (e.target.classList.contains('close-modal')) {
        // 1. Find the modal that specifically contains THIS button
        const modal = e.target.closest('.modal-container');
        
        if (modal) {
            // 2. Hide the modal
            modal.classList.remove('show');
            modal.style.display = 'none'; // Ensure display is reset
            
            // 3. NEW: If this was the Edit modal, don't forget to reset it
            if (modal.id === 'viewItemModal' || modal.id === 'editSummaryItemModal') {
                if (typeof resetItemModal === 'function') resetItemModal();
            }
        }
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

        // Order Items Table
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
                    <td class="small-r" style="width: 30%;">${item.code}</td>
                    <td class="small-r" style="width: 15%;">${item.color || '-'}</td>
                    <td class="small-r" style="width: 25%;">${item.custom || '-'}</td>
                    <td class="small-r" style="width: 15%;">${qty}</td>
                    <td class="small-r" style="width: 15%;">${price.toFixed(2)}</td>
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

        const startDateStr = viewOrder.dataset.start_of_production;
        const deliveryDateStr = viewOrder.dataset.delivery_date;

        if (startDateStr && deliveryDateStr) {
            const start = new Date(startDateStr);
            const delivery = new Date(deliveryDateStr);

            const diffInMs = delivery - start;

            const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

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
        slideContainer.id = 'slideshow-view';

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

    // View Item Modal
    const viewItem = e.target.closest('.open-view-item-modal');
    if (viewItem && viewItemModal) {
        e.preventDefault();
        // FIX: Changed viewProduct to viewItem
        const id = viewItem.dataset.id;
        viewItemModal.dataset.currentDbId = id;
        // For Image Set
        // FIX: Changed viewProductModal to viewItemModal
        const slideContainer = qs('.slideshow-container', viewItemModal);
        const dotContainer = qs('.dot-container', viewItemModal);
        const imageUrls = viewItem.dataset.images ? viewItem.dataset.images.split(',') : [];        

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
        slideContainer.id = 'slideshow-view';

        // For Color Set
        const colorContainer = qs('.color-container', viewItemModal);
        const colors = viewItem.dataset.colors ? viewItem.dataset.colors.split(',') : [];

        colorContainer.innerHTML = '';

        colors.forEach((color) => {
            const trimmedColor = color.trim();
            if (trimmedColor) {
                const colorDiv = document.createElement('div');
                colorDiv.className = 'product-highlight'; 
                colorDiv.style.cursor = 'pointer'; 
                
                colorDiv.innerHTML = `
                    <span style="background: ${trimmedColor}; border: 1px solid #898989;"></span>
                    <p class="smaller-r">${trimmedColor}</p>
                `;

                colorDiv.onclick = () => {
                    const isAlreadySelected = colorDiv.classList.contains('selected-color');

                    // 1. Reset ALL items to their default state first
                    colorContainer.querySelectorAll('.product-highlight').forEach(el => {
                        el.style.outline = 'none';
                        el.style.background = '#E9E6E3'; // Reset background
                        el.classList.remove('selected-color');
                    });

                    // 2. Toggle: If it wasn't selected before, select it now
                    // If it WAS selected, it stays reset (unselected)
                    if (!isAlreadySelected) {
                        colorDiv.style.outline = '1px solid #898989';
                        colorDiv.style.background = '#CBCBCB'; 
                        colorDiv.classList.add('selected-color');
                    }
                };

                colorContainer.appendChild(colorDiv);
            }
        });

        // Auto-select the first color
        const firstColor = colorContainer.querySelector('.product-highlight');
        if (firstColor) {
            firstColor.click();
        }

        qs('#view_item_code', viewItemModal).textContent = viewItem.dataset.product_code;
        qs('#view_item_name', viewItemModal).textContent = viewItem.dataset.product_name;
        qs('#view_category', viewItemModal).textContent = viewItem.dataset.category;
        qs('#view_moq', viewItemModal).textContent = viewItem.dataset.moq;
        
        // Set MOQ value for Min Quantity input
        const moqValue = viewItem.dataset.moq;

        qs('#view_moq_2', viewItemModal).textContent = moqValue;

        const quantityInput = qs('#quantity', viewItemModal);

        quantityInput.placeholder = moqValue;
        quantityInput.min = moqValue;
        quantityInput.value = moqValue;
        quantityInput.removeAttribute('max');

        viewItemModal.dataset.currentProduct = JSON.stringify(viewItem.dataset);

        showModal(viewItemModal);

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
        const confirmBtn = deleteProductModal.querySelector('.confirm_delete');
        if (confirmBtn) {
            // This injects the ID into the URL and lets the link work naturally
            confirmBtn.href = `/catalog/delete/${data.db_id}/`;
        }

        showModal(deleteProductModal);
    }

    // Open Quick Summary Modal
    const openSummary = e.target.closest('.open-quick-summary');
    if (openSummary) {
        const summaryModal = document.getElementById('viewQuickSummary');
        if (summaryModal) {
            renderOrderTable(); // Refresh table data before showing
            showModal(summaryModal); // Use your existing helper
        }
    }

    // Cancel Adding Order Modal
    const cancelAddBtn = e.target.closest('.open-cancel-add-modal');
    if (cancelAddBtn) {
        const cancelAddModal = document.getElementById('cancelAddModal');
        
        const confirmBtn = cancelAddModal.querySelector('.confirm_cancel');
        if (confirmBtn) {
            confirmBtn.href = `/orders`;
            localStorage.removeItem('pendingOrderItems');
        }

        showModal(cancelAddModal)
    }

    // Add Customer Modal
    const addCustomer = e.target.closest('.open-add-customer-modal');
    if (addCustomer) {
        const addCustomerModal = document.getElementById('addCustomerModal');
        if (addCustomerModal) showModal(addCustomerModal);
    }

    // Add Shipping Details
    const addShipping = e.target.closest('.open-add-shipping-modal');
    if (addShipping) {
        const addShippingModal = document.getElementById('addShippingModal');
        if (addShippingModal) showModal(addShippingModal);
    }
});

// For side bar
document.addEventListener("DOMContentLoaded", () => {
    const isExpanded = localStorage.getItem('sidebar-expanded');
    
    if (isExpanded === 'true') {
        sidebar.classList.add('expand');
    }

    // 1. Get today's local date in YYYY-MM-DD format
    const today = new Date().toLocaleDateString('en-CA'); 

    // 2. Target the elements
    const productionStart = document.getElementById('production-start');
    const deliveryDate = document.getElementById('delivery-date');

    // 3. Set initial minimums and logic
    if (productionStart && deliveryDate) {
        // Set both to minimum of today initially
        productionStart.setAttribute('min', today);
        deliveryDate.setAttribute('min', today);

        // Update Delivery Date's minimum whenever Production Start changes
        productionStart.addEventListener('change', function() {
            const selectedStartDate = this.value;
            deliveryDate.setAttribute('min', selectedStartDate);

            // If current delivery date is now earlier than production start, clear it
            if (deliveryDate.value && deliveryDate.value < selectedStartDate) {
                deliveryDate.value = "";
                // Trigger your validation function to show the error message
                if (typeof validateField === "function") {
                    validateField(deliveryDate);
                }
            }
        });
    }
});

// For rendering order table
document.addEventListener('DOMContentLoaded', renderOrderTable);

// Initialize totals and table whenever any page loads
document.addEventListener('DOMContentLoaded', () => {
    // 1. Update the Summary Bar (Top right of your Add Item page)
    if (document.getElementById('initial-items-label')) {
        updateOrderSummary();
    }

    // 2. Update the Table (If on the Add Order page)
    if (document.getElementById('order-items-body')) {
        renderOrderTable();
    }
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

// For slideshow
document.addEventListener("DOMContentLoaded", function () {
    const slideshows = document.querySelectorAll("[id^='slideshow-']");

    slideshows.forEach(slideshow => {
        const productId = slideshow.id.replace("slideshow-", "");
        slideIndexes[productId] = 1;
        showSlides(1, productId);
    });

    const existingDiv = document.querySelector('.for-existing');
    
    if (existingDiv) {
        htmx.process(existingDiv);
    }
});

// For Order tables
if (orderBody) {
    orderBody.addEventListener('click', function(event) {
        // 1. Check if the clicked element is an 'Edit' button
        if (event.target.classList.contains('edit-btn')) {
            const index = event.target.getAttribute('data-index');
            editItemFromSummary(parseInt(index));
        }
    
        // 2. Check if the clicked element is a 'Delete' button
        if (event.target.classList.contains('delete-btn')) {
            const index = event.target.getAttribute('data-index');
            deleteOrderItem(parseInt(index)); // Assuming you have this function
        }
    });
}

// For closing modals
window.addEventListener('click', function(event) {
    // 1. Check if the click was on the dark background container
    if (event.target.classList.contains('modal-container')) {
        const container = event.target;
        
        // 2. THE FIX: Check if there is a form inside this specific modal
        // If it contains a form, we RETURN and do nothing (preventing the close)
        if (container.querySelector('form')) {
            console.log("Modal contains a form. Ignoring backdrop click to prevent data loss.");
            return; 
        }

        // 3. If there is NO form (like your Cart Summary), proceed with closing
        container.classList.remove('show');
        container.style.display = 'none';
        
        if (typeof resetItemModal === 'function') resetItemModal();
    }
});

// FUNCTIONS
// For toggling sidebar
function toggleSidebar() {
    sidebar.classList.toggle('expand')

    const isExpanded = sidebar.classList.contains('expand');
    localStorage.setItem('sidebar-expanded', isExpanded);
}

// Helper Functions for modals
function qs(selector, parent = document) {
    return parent.querySelector(selector);
}

function qsa(selector, parent = document) {
    return parent.querySelectorAll(selector);
}

function closeAllModals() {
    const modals = document.querySelectorAll('.modal-container');
    modals.forEach(m => {
        // This is the most important line:
        m.style.display = 'none'; 
        
        // This handles your animations/classes
        m.classList.remove('show'); 
    });
    
    // Optional: Reset the item modals so they're fresh for next time
    if (typeof resetItemModal === 'function') resetItemModal();
}

function showModal(modal) {
    // 1. Check if this is a notification (like your Delete modal)
    const isNotif = modal.querySelector('.notif-modal');
    
    // 2. NEW: Check if this is the specific Edit Modal we want to stack
    const isStackable = isNotif || modal.id === 'editSummaryItemModal';

    // 3. Only close other modals if the new one is NOT stackable
    if (!isStackable) {
        document.querySelectorAll('.modal-container.show').forEach(m => {
            m.classList.remove('show');
            // If you use inline styles for display, reset them too
            m.style.display = 'none'; 
        });
    }

    // 4. Show the current modal
    modal.classList.add('show');
    modal.style.display = 'flex'; // Ensures visibility regardless of CSS state
}

// For orders and items
function saveItemToOrder(editIndex = null) {
    console.group("DEBUG: saveItemToOrder Execution");
    
    // 1. Identify which modal to pull data from
    const modalId = (editIndex !== null) ? 'editSummaryItemModal' : 'viewItemModal';
    const activeModal = document.getElementById(modalId);
    
    if (!activeModal) {
        console.error("FAILED: Could not find modal:", modalId);
        console.groupEnd();
        return;
    }

    const isEdit = (editIndex !== null);
    const prefix = isEdit ? 'edit' : 'view';
    console.log("Saving from modal:", activeModal.id, "| Prefix used:", prefix);

    const productData = JSON.parse(activeModal.getAttribute('data-current-product') || '{}');
    
    // 2. Data Extraction
    const newItem = {
        code: activeModal.querySelector(`#${prefix}_item_code`)?.textContent?.trim() || 'N/A',
        name: productData.name || activeModal.querySelector(`#${prefix}_item_name`)?.textContent?.trim(),
        category: productData.category || activeModal.querySelector(`#${prefix}_category`)?.textContent?.trim(),
        color: activeModal.querySelector('.selected-color p')?.textContent?.trim() || '-',
        custom: activeModal.querySelector('input[name="customization"]:checked')?.value || '-',
        qty: parseInt(activeModal.querySelector(isEdit ? '#edit_quantity' : '#quantity')?.value) || 0,
        note: activeModal.querySelector(isEdit ? '#edit_note' : '#note')?.value?.trim() || '',
        price: parseFloat(productData.starting_price) || 0,
        all_colors: productData.colors || '',
        moq: productData.moq || activeModal.querySelector(`#${prefix}_moq`)?.textContent?.trim() || '0'
    };

    console.log("New Item Object built:", newItem);

    // 3. Retrieve and Update Cart
    const currentOrder = JSON.parse(localStorage.getItem('pendingOrderItems')) || [];

    if (editIndex !== null) {
        console.log("MODE: UPDATE. Overwriting index:", editIndex);
        currentOrder[editIndex] = newItem;
    } else {
        console.log("MODE: ADD. Creating new item.");
        currentOrder.push(newItem);
    }

    // 4. Save to LocalStorage
    localStorage.setItem('pendingOrderItems', JSON.stringify(currentOrder));

    const orderInput = document.getElementById('orderDataInput');
    if (orderInput) {
        orderInput.value = JSON.stringify(currentOrder);
    }

    // 5. Refresh the Table
    if (typeof renderOrderTable === 'function') renderOrderTable();

    // 6. CLOSE THE MODAL
    activeModal.classList.remove('show');
    activeModal.style.display = 'none';

    // 7. THE CONDITIONAL RE-OPEN (Ghost is gone, only Summary re-opens if editing)
    if (editIndex !== null) {
        const summaryModal = document.getElementById('viewQuickSummary');
        if (summaryModal) {
            summaryModal.classList.add('show');
            summaryModal.style.display = 'flex';
            console.log("Returning to Cart Summary.");
        }
    } else {
        console.log("Item added. Summary remains hidden.");
    }

    console.groupEnd();
    updateOrderSummary();
}

function updateOrderSummary() {
    // 1. Get items from storage
    const currentOrder = JSON.parse(localStorage.getItem('pendingOrderItems')) || [];
    
    // 2. Calculate Totals
    let totalQty = 0;
    let subtotal = 0;
    
    currentOrder.forEach(item => {
        totalQty += item.qty;
        // Calculation happens here
        subtotal += (item.qty * item.price); 
    });

    // Assume 0% for now (you can change this to a dynamic variable later)
    const discountPercent = 0; 
    const discountAmount = (discountPercent / 100) * subtotal;
    const finalTotal = subtotal - discountAmount;

    // 3. Format Currency (₱ 0.00)
    const formatter = new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
    });

    // 4. Update the UI
    const itemsLabel = document.getElementById('initial-items-label');
    const totalLabel = document.getElementById('discounted-total-label');

    if (itemsLabel) {
        // Ensure you are using the 'subtotal' variable here, NOT 'item.price'
        itemsLabel.innerHTML = `Initial Items (${totalQty} Items): <b>${formatter.format(subtotal)}</b>`;
    }
    if (totalLabel) {
        totalLabel.innerHTML = `Discounted Total <i>(less ${discountPercent}%)</i>: <b>${formatter.format(finalTotal)}</b>`;
    }
}

function renderOrderTable() {
    const orderItemsBody = document.getElementById('order-items-body');
    if (!orderItemsBody) return;

    const currentOrder = JSON.parse(localStorage.getItem('pendingOrderItems')) || [];
    let grandTotal = 0;
    let totalQty = 0; // Track total items

    const formatter = new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
    });

    orderItemsBody.innerHTML = '';

    currentOrder.forEach((item, index) => {
        const subtotal = item.qty * item.price;
        grandTotal += subtotal;
        totalQty += item.qty;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.code} - ${item.name}</td>
            <td>${item.color}</td>
            <td>${item.custom}</td>
            <td>${formatter.format(item.price)}</td>
            <td>${item.qty}</td>
            <td><b>${formatter.format(subtotal)}</b></td>
            <td>
                <div class="cell-buttons">
                    <!-- REMOVED onclick, ADDED data-index -->
                    <button type="button" class="m-button-primary smaller-b edit-btn" 
                        data-index="${index}">View/Edit</button>
                    <button type="button" class="m-button-tertiary smaller-b delete-btn" 
                        data-index="${index}">Delete</button>
                </div>
            </td>
        `;

        orderItemsBody.appendChild(row);
    });

    // FOOTER ROW: Aligned to new headers
    const footerRow = document.createElement('tr');
    footerRow.innerHTML = `
        <td colspan="3"></td>
        <td style="text-align: right;"><b>TOTAL:</b></td>
        <td><b>${totalQty}</b></td> <!-- Total Qty under Quantity column -->
        <td><b>${formatter.format(grandTotal)}</b></td> <!-- Grand Total under Subtotal column -->
        <td></td>
    `;
    orderItemsBody.appendChild(footerRow);
}

function editItem(index) {
    const currentOrder = JSON.parse(localStorage.getItem('pendingOrderItems')) || [];
    const item = currentOrder[index];
    const modal = document.getElementById('viewItemModal');
    if (!item || !modal) return; // Safety check

    modal.dataset.editIndex = index;

    // 1. Rebuild the product data
    modal.dataset.currentProduct = JSON.stringify({
        colors: item.all_colors || "",
        category: item.category || "",
        moq: item.moq || "",
        starting_price: item.price || 0
    });

    // 2. Draw ONLY the colors
    renderModalColors(modal, item.all_colors);

    // 3. Fill text fields (with safety checks)
    const setTxt = (id, val) => { const el = modal.querySelector(id); if(el) el.textContent = val; };
    setTxt('#view_item_code', item.code);
    setTxt('#view_item_name', item.name);
    setTxt('#view_price', item.price);
    setTxt('#view_category', item.category);
    setTxt('#view_moq', item.moq);
    setTxt('#view_moq_2', item.moq);
    
    const noteEl = modal.querySelector('#note');
    if (noteEl) noteEl.value = item.note || '';
    
    const qtyEl = modal.querySelector('#quantity');
    if (qtyEl) qtyEl.value = item.qty;

    // 4. FIX: Select Radio (Handles spaces and case-sensitivity better)
    const radios = modal.querySelectorAll('input[name="customization"]');
    let found = false;
    radios.forEach(radio => {
        // Compare trimmed, lowercase versions to be safe
        if (radio.value.trim().toLowerCase() === item.custom.trim().toLowerCase()) {
            radio.checked = true;
            found = true;
        }
    });
    // Default to first if not found
    if (!found && radios.length > 0) radios[0].checked = true;

    // 5. Select color circle
    const colorDivs = modal.querySelectorAll('.product-highlight');
    colorDivs.forEach(div => {
        const colorName = div.querySelector('p')?.textContent.trim();
        if (colorName === item.color) div.click();
    });

    const saveBtn = modal.querySelector('#saveItemBtn');
    if (saveBtn) saveBtn.textContent = "Update Item";

    showModal(modal);
}

function editItemFromSummary(index) {
    console.group("DEBUG: Opening Edit Modal");
    const currentOrder = JSON.parse(localStorage.getItem('pendingOrderItems')) || [];
    const item = currentOrder[index];
    const modal = document.getElementById('editSummaryItemModal'); 
    
    if (!item) { console.error("FAILED: No item found in localStorage at index", index); console.groupEnd(); return; }
    if (!modal) { console.error("FAILED: Modal #editSummaryItemModal not found in DOM"); console.groupEnd(); return; }

    console.log("Item found:", item);
    console.log("Setting Update button to index:", index);

    // DYNAMICALLY UPDATE THE BUTTON
    const saveBtn = modal.querySelector('#saveItemBtn');
    if (saveBtn) {
        saveBtn.setAttribute('onclick', `saveItemToOrder(${index})`);
        console.log("Button onclick set to:", saveBtn.getAttribute('onclick'));
    } else {
        console.error("FAILED: #saveItemBtn not found inside modal");
    }

    // Attach metadata
    modal.setAttribute('data-current-product', JSON.stringify({
        name: item.name,
        colors: item.all_colors || "",
        starting_price: item.price || 0
    }));

    // Populate Fields
    const codeEl = modal.querySelector('#edit_item_code');
    if (codeEl) { codeEl.textContent = item.code; console.log("Set code to:", item.code); }
    const nameE1 = modal.querySelector('#edit_item_name');
    if (nameE1) { nameE1.textContent = item.name; console.log("Set name to:", item.name); }
    const categoryE1 = modal.querySelector('#edit_category');
    if (categoryE1) { categoryE1.textContent = item.category; console.log("Set category to:", item.category); }
    const moqE1 = modal.querySelector('#edit_moq');
    if (moqE1) { moqE1.textContent = item.moq; console.log("Set moq to:", item.moq); }
    const priceE1 = modal.querySelector('#edit_price');
    if (priceE1) { priceE1.textContent = item.price; console.log("Set price to:", item.price); }
    const noteEl = modal.querySelector('#edit_note');
    if (noteEl) noteEl.value = item.note || '';
    const qtyEl = modal.querySelector('#edit_quantity');
    if (qtyEl) {
        qtyEl.value = item.qty;
        qtyEl.min = item.moq;
        console.log("Set quantity to:", item.qty); }
    const moq2E1 = modal.querySelector('#edit_moq_2');
    if (moq2E1) { moq2E1.textContent = item.moq; console.log("Set moq2 to:", item.moq); }

    // Customization
    console.log("Attempting to auto-select customization:", item.custom);
    const customRadios = modal.querySelectorAll('.radio-input');
    setTimeout(() => {
        customRadios.forEach(radio => {
            if (radio.value.trim() === item.custom) {
                radio.checked = true;
            }
        });
    }, 150);

    // Colors
    if (typeof renderModalColors === 'function') {
        renderModalColors(modal, item.all_colors);
        setTimeout(() => {
            const colorDivs = modal.querySelectorAll('.product-highlight');
            colorDivs.forEach(div => {
                if (div.querySelector('p')?.textContent.trim() === item.color) {
                    div.click();
                }
            });
        }, 150);
    }

    showModal(modal);
    console.groupEnd();
    updateOrderSummary();
}

function deleteOrderItem(index) {
    const currentOrder = JSON.parse(localStorage.getItem('pendingOrderItems')) || [];
    if (confirm("Are you sure you want to remove this item?")) {
        currentOrder.splice(index, 1); // Remove the specific item
        localStorage.setItem('pendingOrderItems', JSON.stringify(currentOrder));

        const orderInput = document.getElementById('orderDataInput');
        if (orderInput) {
            orderInput.value = JSON.stringify(currentOrder);
        }

        renderOrderTable(); // Refresh the table
    }
}

// Function to rebuild colors specifically
function renderModalColors(modal, colorString) {
    const colorContainer = modal.querySelector('.color-container');
    const colors = colorString ? colorString.split(',') : [];
    colorContainer.innerHTML = '';

    colors.forEach(color => {
        const trimmed = color.trim();
        if (trimmed) {
            const div = document.createElement('div');
            div.className = 'product-highlight';
            div.innerHTML = `<span style="background: ${trimmed}; border: 1px solid #898989;"></span><p class="smaller-r">${trimmed}</p>`;

            div.onclick = () => {
                colorContainer.querySelectorAll('.product-highlight').forEach(el => {
                    el.style.background = '#E9E6E3';
                    el.style.outline = 'none';
                    el.classList.remove('selected-color');
                    el.style.cursor = 'pointer';
                });
                div.style.background = '#CBCBCB';
                div.style.outline = '1px solid #898989';
                div.classList.add('selected-color');
            };
            colorContainer.appendChild(div);
        }
    });
}

function resetItemModal() {
    // 1. Get both potential modals
    const viewModal = document.getElementById('viewItemModal');
    const editModal = document.getElementById('editSummaryItemModal');
    const modals = [viewModal, editModal].filter(m => m !== null);

    modals.forEach(modal => {
        // 2. Clear all inputs (numbers, textareas, and text inputs)
        const inputs = modal.querySelectorAll('input[type="number"], input[type="text"], textarea');
        inputs.forEach(input => {
            input.value = '';
            // If it's a number input, also reset the min/placeholder if needed
            if (input.type === 'number') {
                input.min = "";
                input.placeholder = "0";
            }
        });

        // 3. Reset Customization Radios to the first option
        const radios = modal.querySelectorAll('input[name="customization"]');
        radios.forEach((radio, index) => {
            radio.checked = (index === 0); 
        });

        // 4. Clear Color Selection Container
        const colorContainer = modal.querySelector('.color-container');
        if (colorContainer) {
            colorContainer.innerHTML = ''; 
        }

        // 5. Reset the Button Text and Title (Specific to the Add Modal)
        if (modal.id === 'viewItemModal') {
            const saveBtn = modal.querySelector('button[onclick="saveItemToOrder()"]');
            if (saveBtn) saveBtn.textContent = "Add to Order";
            
            const title = modal.querySelector('h1');
            if (title) title.textContent = "Add Item to Order";
        }

        // 6. Wipe the stored data and markers
        delete modal.dataset.editIndex;
        delete modal.dataset.currentProduct;
    });
}

// Validator
function validateField(field) {
    console.log('Validating:', field.name, 'Result:', field.checkValidity());
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
    if (!slideshow) return; // Exit if slideshow container is missing

    const slides = slideshow.getElementsByClassName("mySlides");
    if (slides.length === 0) return; // Exit if no slides found

    const dots = slideshow.parentElement.querySelectorAll(`#slideshow-${productId} ~ div .dot`);
    
    // Ensure the index is initialized
    if (!slideIndexes[productId]) slideIndexes[productId] = 1;

    if (n > slides.length) slideIndexes[productId] = 1;
    if (n < 1) slideIndexes[productId] = slides.length;
    
    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    
    for (let i = 0; i < dots.length; i++) {
        dots[i].classList.remove("active");
    }
    
    // Safety check before accessing the style property
    const currentSlide = slides[slideIndexes[productId] - 1];
    if (currentSlide) {
        currentSlide.style.display = "block";
    }
    
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

// OTHERS
document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', () => {
        // ... your existing code to hide the modal (e.g., modal.style.display = 'none')
        resetItemModal(); 
    });
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

// SPECIALS
// Validator for All Modals
modalForms.forEach(form => {
    // Validate on input (Real-time)
    form.addEventListener('input', function (e) {
        const field = e.target;

        if (field.hasAttribute('hx-get')) return; 

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