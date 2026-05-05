// Variables
const sidebar = document.getElementById('sidebar');

const viewProductModal = document.getElementById('viewProductModal');
const viewOrderModal = document.getElementById('viewOrderModal');
const viewItemModal = document.getElementById('viewItemModal');

const viewCustomerModal = document.getElementById('viewCustomerModal');

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

        // For link to logo
        const logoLink = viewOrder.dataset.link_to_logo;
        const logoBtn = viewOrderModal.querySelector('.open-link-to-logo');

        if (logoBtn) {
            // 1. Check if the link exists and isn't just "None" from Django
            if (logoLink && logoLink !== "None" && logoLink.trim() !== "") {
                logoBtn.href = logoLink;
                logoBtn.target = "_blank"; // Opens in a new tab
                logoBtn.style.display = 'inline-flex'; // Show the button
                console.log("--- TRACE: Logo Link assigned ---");
            } else {
                // 2. Hide the button if there is no link
                logoBtn.style.display = 'none';
                console.log("--- TRACE: No Logo Link found, hiding button ---");
            }
        }

        // For Image Set
        const slideContainer = qs('.slideshow-container', viewOrderModal);
        const dotContainer = qs('.dot-container', viewOrderModal);
        
        // Clean empty values out of the array
        const imageUrls = (viewOrder.dataset.images ? viewOrder.dataset.images.split(',') : []).filter(url => url.trim() !== '');        

        slideContainer.innerHTML = '';
        if (dotContainer) dotContainer.innerHTML = '';

        if (imageUrls.length > 0) {
            // Show real images
            imageUrls.forEach((url, index) => {
                const slideDiv = document.createElement('div');
                slideDiv.className = 'mySlides fade';
                slideDiv.innerHTML = `<img src="${url}" class="img-container">`;
                slideContainer.appendChild(slideDiv);

                if (dotContainer) {
                    const dot = document.createElement('span');
                    dot.className = 'dot';
                    dot.onclick = () => currentSlide(index + 1, 'view');
                    dotContainer.appendChild(dot);
                }
            });

            // Add Navigation Arrows
            const prevBtn = document.createElement('a');
            prevBtn.className = 'prev';
            prevBtn.innerHTML = '❮';
            prevBtn.onclick = () => plusSlides(-1, 'view');

            const nextBtn = document.createElement('a');
            nextBtn.className = 'next';
            nextBtn.innerHTML = '❯';
            nextBtn.onclick = () => plusSlides(1, 'view');

            slideContainer.appendChild(prevBtn);
            slideContainer.appendChild(nextBtn);
        } else {
            // SHOW PLACEHOLDER ICON
            const placeholder = document.createElement('div');
            // 'flex-grow: 1' and 'height: 100%' ensures it fills the container space
            placeholder.style.cssText = `
                display: flex; 
                flex-direction: column; 
                align-items: center; 
                justify-content: center; 
                min-height: 300px; 
                height: 100%; 
                width: 100%;
                color: #CBCBCB;
                padding-top: 40px; 
            `;
            
            placeholder.innerHTML = `
                <i class="material-symbols-rounded" style="font-size: 100px; margin-bottom: 10px;">photo</i>
                <p class="small-r" style="margin: 0;">No images available</p>
            `;
            slideContainer.appendChild(placeholder);
        }

        slideContainer.id = 'slideshow-view';

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
        let subtotal = 0; // Raw total before discount

        const formatter = new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        });

        items.forEach(item => {
            const qty = parseInt(item.qty) || 0;
            const unitPrice = parseFloat(item.price) || 0;
            const rowTotal = qty * unitPrice;
            
            totalQty += qty;
            subtotal += rowTotal;

            const formattedPrice = unitPrice.toLocaleString('en-US', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
            });

            const formattedQty = qty.toLocaleString('en-US');

            const formattedSubtotal = rowTotal.toLocaleString('en-US', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
            });

            const row = `
                <tr>
                    <td style="width: 15%;" class="small-r">${item.code}</td>
                    <td style="width: 20%;" class="small-r">${item.color || '-'}, ${item.custom || '-'}</td>
                    <td style="width: 15%;" class="small-r">${formattedPrice}</td>
                    <td style="width: 15%;" class="small-r">${formattedQty}</td>
                    <td style="width: 20%;" class="small-r">${formattedSubtotal}</td>
                    <td style="width: 15%;">
                        <div class="cell-buttons">
                            <button type="button" class="m-button-primary smaller-b open-item-detail" 
                                data-item='${JSON.stringify(item)}'>
                                View
                            </button>
                        </div>
                    </td>
                </tr>`;
            tableBody.innerHTML += row;
        });
        
        // APPLY BUSINESS RULE DISCOUNTS
        let discountPercent = 0;
        if (totalQty > 1000) discountPercent = 10;
        else if (totalQty >= 501) discountPercent = 8;
        else if (totalQty >= 301) discountPercent = 5;
        else if (totalQty >= 101) discountPercent = 3;

        const finalTotal = subtotal * (1 - (discountPercent / 100));

        // 2. Update Footer Displays
        const qtyDisplay = qs('#order_total_qty', viewOrderModal);
        const qtyDisplaySecond = qs('#order_total_qty_2', viewOrderModal);
        const priceDisplay = qs('#order_total_price', viewOrderModal);
        const discountedPriceDisplay = qs('#order_discounted_total', viewOrderModal);
        const discountNote = qs('#order_discount_note', viewOrderModal);

        if (qtyDisplay) qtyDisplay.textContent = totalQty;
        if (qtyDisplaySecond) qtyDisplaySecond.textContent = totalQty;
        
        // This was likely where 'totalPrice' was causing the crash:
        if (priceDisplay) {
            priceDisplay.textContent = subtotal.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        }

        // 3. Update the Discounted Field
        if (discountedPriceDisplay) {
            discountedPriceDisplay.textContent = finalTotal.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        }

        if (discountNote) {
            discountNote.textContent = `(Less ${discountPercent}%)`;
            discountNote.style.display = 'inline'; 
        }

        // For Dates
        const startDateStr = viewOrder.dataset.start_of_production;
        const deliveryDateStr = viewOrder.dataset.delivery_date;

        if (startDateStr && deliveryDateStr) {
            const start = new Date(startDateStr);
            const delivery = new Date(deliveryDateStr);

            const diffInMs = delivery - start;

            const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

            const leadTimeElement = qs('#order_lead_time', viewOrderModal);
            if (diffInDays <= 0) {
                leadTimeElement.textContent = "0";
            } else {
                leadTimeElement.textContent = `${diffInDays} ${diffInDays === 1 ? 'Day' : 'Days'}`;
            }
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
        qs('#order_courier', viewOrderModal).textContent = viewOrder.dataset.courier;
        qs('#order_transaction_platform', viewOrderModal).textContent = viewOrder.dataset.transaction_platform;
        qs('#order_account_manager', viewOrderModal).textContent = viewOrder.dataset.account_manager;
        viewOrderModal.dataset.currentOrder = JSON.stringify(viewOrder.dataset);

        const editButton = viewOrderModal.querySelector('.open-edit-order-modal');

        // Use 'id' which you defined at the top of this function
        if (editButton && id) {
            editButton.href = `/orders/edit_order/${id}/`;
            console.log(`--- TRACE: Edit button URL set to order ${id} ---`);
        }

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
        
        const modalForm = viewItemModal.querySelector('form');
        if (modalForm) {
            modalForm.reset(); // This clears the textarea and resets the radio buttons to 'Cut & Sew'
        }

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
        qs('#view_starting_price', viewItemModal).textContent = viewItem.dataset.starting_price;
        
        // Set MOQ value for Min Quantity input
        const moqValue = viewItem.dataset.moq;

        qs('#view_moq_2', viewItemModal).textContent = moqValue;

        const quantityInput = qs('#quantity', viewItemModal);

        quantityInput.placeholder = moqValue;
        quantityInput.min = moqValue;
        quantityInput.value = moqValue;

        // Inside your viewItem click handler
        const customContainer = qs('.custom-choices', viewItemModal);
        const options = viewItem.dataset.custom_options ? viewItem.dataset.custom_options.split(',') : [];

        // 1. Clear the hardcoded static list
        customContainer.innerHTML = '';

        // Helper to make IDs (e.g., "Cut & Sew" -> "cut-sew-edit")
        const slugify = text => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

        // 2. Loop through product-specific options
        options.forEach((opt, index) => {
            const trimmedOpt = opt.trim();
            if (trimmedOpt) {
                const optId = `${slugify(trimmedOpt)}-edit`;
                
                const wrapper = document.createElement('div');
                wrapper.style.display = 'contents'; 

                wrapper.innerHTML = `
                    <input class="filter-input radio-input" type="radio" name="customization" 
                        id="${optId}" value="${trimmedOpt}" ${index === 0 ? 'checked' : ''}>
                    <label class="color-filter-label small-b" for="${optId}">${trimmedOpt}</label>
                `;
                customContainer.appendChild(wrapper);
            }
        });

        // 3. Always add the "None" option at the end
        const noneWrapper = document.createElement('div');
        noneWrapper.style.display = 'contents';
        noneWrapper.innerHTML = `
            <input class="filter-input radio-input" type="radio" name="customization" 
                id="none-edit" value="N/A" ${options.length === 0 ? 'checked' : ''}>
            <label class="color-filter-label small-b" for="none-edit">None</label>
        `;
        customContainer.appendChild(noneWrapper);

        viewItemModal.dataset.currentProduct = JSON.stringify(viewItem.dataset);

        showModal(viewItemModal);

        if (typeof showSlides === 'function') showSlides(1, 'view');
    }

    // View Item from View Order Modal
    const detailBtn = e.target.closest('.open-item-detail');
    if (detailBtn) {
        const item = JSON.parse(detailBtn.dataset.item);
        const modal = document.getElementById('itemDetailModal');

        // Basic Info
        qs('#detail_code', modal).textContent = item.code || 'N/A';
        qs('#detail_name', modal).textContent = item.name || 'Product';
        qs('#detail_color', modal).textContent = item.color || '-';
        qs('#detail_custom', modal).textContent = item.custom || '-';
        qs('#detail_qty', modal).textContent = `${item.qty || 0} pcs`;

        // Pricing Logic
        // In your system: item.price is the unit total saved in DB.
        // We need to derive the base and custom parts.
        const totalUnitPrice = parseFloat(item.price) || 0;
        const basePrice = parseFloat(item.starting_price) || 0;
        const customPrice = totalUnitPrice - basePrice;

        qs('#detail_base_price', modal).textContent = basePrice.toLocaleString(undefined, {minimumFractionDigits: 2});
        qs('#detail_custom_price', modal).textContent = customPrice.toLocaleString(undefined, {minimumFractionDigits: 2});
        qs('#detail_total_price', modal).textContent = totalUnitPrice.toLocaleString(undefined, {minimumFractionDigits: 2});

        // Note Logic - Check all possible keys
        qs('#detail_note', modal).textContent = item.item_note || 'No special instructions provided.';

        showModal(modal);
    }

    // Edit Product Modal from View
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

    // For Update Order Status
    const statusLink = e.target.closest('.update-status-link');
    if (statusLink) {
        e.preventDefault();
        
        // 1. Get Data from the main View Modal
        const newStatus = statusLink.dataset.status;
        const orderId = document.querySelector('#order_order_id').textContent;
        const confirmModal = document.getElementById('updateOrderStatusModal');

        if (!orderId) {
            console.error("Order ID not found in modal.");
            return;
        }

        // 2. Fill the Confirmation Modal with the correct text
        document.getElementById('confirm_status_order_id').textContent = orderId;
        document.getElementById('confirm_status_new_name').textContent = newStatus;

        // 3. Set the 'Yes' button action
        const yesBtn = document.getElementById('confirmStatusUpdateBtn');
        yesBtn.onclick = function() {
            // Send the request to your Django view
            fetch(`/orders/update_status/${orderId}/?status=${encodeURIComponent(newStatus)}`)
                .then(response => {
                    if (response.ok) {
                        // Success: Refresh the page to update Dashboard counts & Modal
                        window.location.reload(); 
                    } else {
                        alert("Failed to update status. Please try again.");
                    }
                });
        };

        // 4. Show the confirmation modal
        showModal(confirmModal);
    }

    // Cancel Order Confirmation
    const cancelOrderBtn = e.target.closest('.cancel-order-modal-btn');
    if (cancelOrderBtn && cancelOrderModal) {
        e.preventDefault();
        const viewOrderModal = document.getElementById('viewOrderModal');
        
        // 1. Pull the saved data from the View Modal
        // Note: We saved this earlier using viewOrderModal.dataset.currentOrder
        const data = JSON.parse(viewOrderModal.dataset.currentOrder);

        // 2. Update the Order ID in the confirmation text
        const idDisplay = qs('#cancel_order_id_display', cancelOrderModal);
        if (idDisplay) idDisplay.textContent = data.order_id;

        // 3. Set the "Yes" button link
        const confirmBtn = cancelOrderModal.querySelector('.confirm_delete');
        if (confirmBtn) {
            confirmBtn.href = `/orders/cancel_order/${data.order_id}/`;
        }

        // 4. Show the confirmation modal
        showModal(cancelOrderModal);
    }

    // Add Customer Modal
    const addCustomer = e.target.closest('.open-add-customer-modal');
    if (addCustomer) {
        const addCustomerModal = document.getElementById('addCustomerModal');
        if (addCustomerModal) showModal(addCustomerModal);
    }

    // View Customer Modal
    const viewCustomer = e.target.closest('.open-view-customer-modal');
    if (viewCustomer && viewCustomerModal) {
        e.preventDefault();
        const customerId = viewCustomer.dataset.view_customer_id;
        console.log("1. Customer ID:", customerId);
        const logoUrl = viewCustomer.dataset.view_logo;
        const logoImg = qs('#view_company_logo', viewCustomerModal);

        const rawShippingAttr = viewCustomer.dataset.shipping;
        console.log("2. Raw data-shipping string:", rawShippingAttr);

        let currentShippings = []; 
        try {
            // This regex cleans up trailing commas like [{},{}] -> [{},{}]
            const cleanedJson = (rawShippingAttr || "[]").replace(/,\s*]/, ']');
            currentShippings = JSON.parse(cleanedJson);
            console.log("Parsed Array:", currentShippings);
        } catch (err) {
            console.error("JSON PARSE ERROR:", err.message);
            console.log("Raw string was:", rawShippingAttr);
        }

        if (logoImg) {
            logoImg.src = logoUrl ? logoUrl : '/static/images/no-logo-placeholder.png';
        }
        qs('#view_customer_id', viewCustomerModal).textContent = customerId;
        qs('#view_company_name', viewCustomerModal).textContent = viewCustomer.dataset.view_company_name;
        qs('#view_company_address', viewCustomerModal).textContent = viewCustomer.dataset.view_company_address;
        qs('#view_company_tin_number', viewCustomerModal).textContent = viewCustomer.dataset.view_company_tin_number;
        qs('#view_customer_name', viewCustomerModal).textContent = viewCustomer.dataset.view_customer_name;
        qs('#view_customer_email', viewCustomerModal).textContent = viewCustomer.dataset.view_customer_email;
        qs('#view_customer_messenger', viewCustomerModal).textContent = viewCustomer.dataset.view_messenger;
        qs('#view_customer_viber', viewCustomerModal).textContent = viewCustomer.dataset.view_viber;
        qs('#view_customer_contact_number', viewCustomerModal).textContent = viewCustomer.dataset.view_customer_phone_number;
        qs('#email-transaction', viewCustomerModal).checked = (viewCustomer.dataset.view_email_transaction === 'True');
        qs('#messenger-transaction', viewCustomerModal).checked = (viewCustomer.dataset.view_messenger_transaction === 'True');
        qs('#viber-transaction', viewCustomerModal).checked = (viewCustomer.dataset.view_viber_transaction === 'True');

        const container = document.getElementById('shipping-buttons-container');
        if (container) {
            container.innerHTML = ''; 
            
            currentShippings.forEach((ship, index) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'm-button-quaternary small-m';
                btn.textContent = `Shipping Detail ${index + 1}`; 
                
                btn.onclick = () => {
                    const sModal = document.getElementById('viewShippingModal');
                    // We already have 'viewCustomerModal' in scope from the outer block
                    
                    if (sModal) {
                        // 1. Handle the "Stacking" Title logic
                        const shipNumSpan = document.getElementById('ship_number');
                        const shipCustIdSpan = document.getElementById('view_shipping_customer_id');
                        
                        if (shipNumSpan) shipNumSpan.textContent = index + 1;
                        if (shipCustIdSpan) shipCustIdSpan.textContent = customerId;

                        // 2. Map the address fields
                        // Since we split these in the button, we map them here
                        const fields = {
                            'ship_contact': ship.contact,
                            'ship_email': ship.email,
                            'ship_phone': ship.phone,
                            'ship_street': ship.street,
                            'ship_line_2': ship.line_2,
                            'ship_city': ship.city,
                            'ship_barangay': ship.barangay,
                            'ship_province': ship.province,
                            'ship_zip': ship.zip
                        };

                        // Batch update to keep it clean
                        for (const [id, value] of Object.entries(fields)) {
                            const el = document.getElementById(id);
                            if (el) el.textContent = value || 'N/A';
                        }

                        // 3. Show the modal on top
                        showModal(sModal);
                    }
                };
                container.appendChild(btn);
            });

            const addShippingBtn = document.createElement('button');
            addShippingBtn.type = 'button';
            addShippingBtn.className = 'add-color-btn';
            addShippingBtn.innerHTML = `<i class="material-symbols-rounded" style="font-size: 18px; color: #101212;">add</i>`;
            container.appendChild(addShippingBtn);
        }
        if (viewCustomerModal) showModal(viewCustomerModal);
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
    
    // Check if we are in "Edit" mode by looking at the header text
    const pageHeader = document.querySelector('h1')?.textContent || "";
    const isEditMode = pageHeader.toLowerCase().includes("edit order");

    if (productionStart && deliveryDate) {
        const today = new Date().toLocaleDateString('en-CA'); 

        // ONLY apply the "today" constraint if NOT in edit mode
        if (!isEditMode) {
            productionStart.setAttribute('min', today);
            deliveryDate.setAttribute('min', today);
            console.log("Add Mode: Minimum date set to today.");
        } else {
            console.log("Edit Mode: Minimum date constraint removed.");
        }

        // Keep the logical link: Delivery must always be after Start
        productionStart.addEventListener('change', function() {
            const selectedStartDate = this.value;
            deliveryDate.setAttribute('min', selectedStartDate);

            if (deliveryDate.value && deliveryDate.value < selectedStartDate) {
                deliveryDate.value = "";
                if (typeof validateField === "function") validateField(deliveryDate);
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
    const isStackable = isNotif ||
                        modal.id === 'editSummaryItemModal' ||
                        modal.id === 'viewShippingModal' ||
                        modal.id === 'itemDetailModal';

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

    // The Gatekeeper
    // Select all inputs inside the active modal
    const inputs = activeModal.querySelectorAll('input, select, textarea');
    let isModalValid = true;

    inputs.forEach(input => {
        // This triggers your red borders and error messages automatically
        if (!validateField(input)) {
            isModalValid = false;
        }
    });

    if (!isModalValid) {
        console.warn("Save blocked: Quantity is below MOQ or other field error.");
        return; // This stops the function here. No data is saved.
    }

    if (!activeModal) {
        console.error("FAILED: Could not find modal:", modalId);
        console.groupEnd();
        return;
    }

    const isEdit = (editIndex !== null);
    const prefix = isEdit ? 'edit' : 'view';
    console.log("Saving from modal:", activeModal.id, "| Prefix used:", prefix);

    const productData = JSON.parse(activeModal.getAttribute('data-current-product') || '{}');
    
    console.group("DEBUG: saveItemToOrder Execution");

    // 2. Data Extraction
    const baseUnitPrice = parseFloat(productData.starting_price) || 0;
    const customUnitPrice = parseFloat(activeModal.querySelector(isEdit ? '#edit_est_custom_price' : '#est_custom_price')?.value) || 0;
    const newItem = {
        db_id: productData.db_id,
        code: activeModal.querySelector(`#${prefix}_item_code`)?.textContent?.trim() || 'N/A',
        name: productData.name || activeModal.querySelector(`#${prefix}_item_name`)?.textContent?.trim(),
        category: productData.category || activeModal.querySelector(`#${prefix}_category`)?.textContent?.trim(),
        color: activeModal.querySelector('.selected-color p')?.textContent?.trim() || '-',
        custom: activeModal.querySelector('input[name="customization"]:checked')?.value || '-',
        all_custom_options: productData.custom_options || '',
        
        price: baseUnitPrice,
        custom_price: customUnitPrice,
        total_price: (baseUnitPrice + customUnitPrice),

        qty: parseInt(activeModal.querySelector(isEdit ? '#edit_quantity' : '#quantity')?.value) || 0,        
        note: activeModal.querySelector(isEdit ? '#edit_note' : '#note')?.value?.trim() || '',
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
    const currentOrder = JSON.parse(localStorage.getItem('pendingOrderItems')) || [];
    
    let totalQty = 0;
    let subtotal = 0;
    
    currentOrder.forEach(item => {
        const qty = parseInt(item.qty) || 0;
        const unitTotal = parseFloat(item.total_price) || 0;
        
        totalQty += qty;
        subtotal += (qty * unitTotal); 
    });

    // Business Rules for Discount
    let discountPercent = 0;
    if (totalQty > 1000) {
        discountPercent = 10;
    } else if (totalQty >= 501) {
        discountPercent = 8;
    } else if (totalQty >= 301) {
        discountPercent = 5;
    } else if (totalQty >= 101) {
        discountPercent = 3;
    } else {
        discountPercent = 0;
    }

    const discountAmount = (discountPercent / 100) * subtotal;
    const finalTotal = subtotal - discountAmount;

    const formatter = new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
    });

    // Update UI
    const itemsLabel = document.getElementById('initial-items-label');
    const totalLabel = document.getElementById('discounted-total-label');

    if (itemsLabel) {
        itemsLabel.innerHTML = `Initial Items (${totalQty} Items): <b>${formatter.format(subtotal)}</b>`;
    }
    
    if (totalLabel) {
        totalLabel.innerHTML = `Discounted Total (less ${discountPercent}%): <b>${formatter.format(finalTotal)}</b>`;
    }
}

// For Order Summary
function renderOrderTable() {
    const orderItemsBody = document.getElementById('order-items-body');
    if (!orderItemsBody) return;

    const currentOrder = JSON.parse(localStorage.getItem('pendingOrderItems')) || [];
    let grandTotal = 0;
    let totalQty = 0;

    const formatter = new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
    });

    orderItemsBody.innerHTML = '';

    currentOrder.forEach((item, index) => {
        const unitBase = parseFloat(item.price) || 0;
        const unitCustom = parseFloat(item.custom_price) || 0;
        const quantity = parseInt(item.qty) || 0;

        const unitTotal = parseFloat(item.total_price) || (unitBase + unitCustom);

        const subtotal = quantity * unitTotal;

        if (!isNaN(subtotal)) {
            grandTotal += subtotal;
            totalQty += quantity;
        }

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.code} - ${item.name}</td>
            <td>${item.color}</td>
            <td>${item.custom}</td>
            <td>${formatter.format(unitTotal)}</td>
            <td>${item.qty}</td>
            <td>${formatter.format(subtotal)}</td>
            <td>
                <div class="cell-buttons">
                    <button type="button" class="m-button-primary smaller-b edit-btn" 
                        data-index="${index}">View/Edit</button>
                    <button type="button" class="m-button-tertiary smaller-b delete-btn" 
                        data-index="${index}">Delete</button>
                </div>
            </td>
        `;
        orderItemsBody.appendChild(row);
    });

    // 1. Calculate Discount based on Business Rules
    let discountPercent = 0;
    if (totalQty > 1000) discountPercent = 10;
    else if (totalQty >= 501) discountPercent = 8;
    else if (totalQty >= 301) discountPercent = 5;
    else if (totalQty >= 101) discountPercent = 3;

    const discountAmount = (discountPercent / 100) * grandTotal;
    const discountedGrandTotal = grandTotal - discountAmount;

    // 2. FOOTER ROW: Total
    const footerRow = document.createElement('tr');
    footerRow.style.borderTop = "2px solid #101212";
    footerRow.innerHTML = `
        <td colspan="3"></td>
        <td style="text-align: right;"><b>TOTAL:</b></td>
        <td><b>${totalQty}</b></td>
        <td><b>${formatter.format(grandTotal)}</b></td>
        <td></td>
    `;
    orderItemsBody.appendChild(footerRow);

    // 3. SECOND FOOTER ROW: Discounted Total
    const secondFooterRow = document.createElement('tr');
    secondFooterRow.innerHTML = `
        <td colspan="3"></td>
        <td style="text-align: right">DISCOUNTED TOTAL (${discountPercent}%):</td>
        <td>${totalQty}</td>
        <td>${formatter.format(discountedGrandTotal)}</td>
        <td></td>
    `;
    orderItemsBody.appendChild(secondFooterRow);
}

function renderViewOnlyOrderTable(items, targetBodyId) {
    const body = document.getElementById(targetBodyId);
    if (!body || !items) return;

    const formatter = new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
    });

    body.innerHTML = '';
    let grandTotal = 0;
    let totalQty = 0;

    items.forEach(item => {
        // Handle your business rule: item.price is total unit price
        const unitTotal = parseFloat(item.price) || 0;
        const qty = parseInt(item.qty) || 0;
        const subtotal = unitTotal * qty;

        grandTotal += subtotal;
        totalQty += qty;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.code}</td>
            <td>${item.color}</td>
            <td>${item.custom}</td>
            <td>${qty}</td>
            <td>${formatter.format(unitTotal)}</td>
            <td><b>${formatter.format(subtotal)}</b></td>
            <td>
                <button type="button" 
                        class="m-button-primary smaller-b view-item-detail-btn" 
                        data-code="${item.code}"
                        data-name="${item.name}"
                        data-color="${item.color}"
                        data-custom="${item.custom}"
                        data-qty="${qty}"
                        data-note="${item.note || 'No notes'}"
                        data-images="${item.images || ''}">
                    View Detail
                </button>
            </td>
        `;
        body.appendChild(row);
    });

    // Calculate Discount for the View Modal
    let discountPercent = 0;
    if (totalQty > 1000) discountPercent = 10;
    else if (totalQty >= 501) discountPercent = 8;
    else if (totalQty >= 301) discountPercent = 5;
    else if (totalQty >= 101) discountPercent = 3;

    const finalTotal = grandTotal * (1 - (discountPercent / 100));

    // Update the "Total" labels in your modal (using the IDs from your HTML)
    const totalQtyEl = document.getElementById('order_total_qty');
    const totalPriceEl = document.getElementById('order_total_price');
    
    if (totalQtyEl) totalQtyEl.textContent = totalQty;
    if (totalPriceEl) totalPriceEl.textContent = formatter.format(finalTotal);
    
    // Optional: Update a discount label if you add one to the modal
    const discountLabel = document.getElementById('order_discount_note');
    if (discountLabel) {
        discountLabel.textContent = `(Applied ${discountPercent}% discount)`;
    }
}

function editItem(index) {
    const currentOrder = JSON.parse(localStorage.getItem('pendingOrderItems')) || [];
    const item = currentOrder[index];
    const modal = document.getElementById('viewItemModal');
    if (!item || !modal) return; // Safety check

    modal.dataset.editIndex = index;

    // 1. Rebuild the product data
    modal.dataset.currentProduct = JSON.stringify({
        db_id: item.db_id,
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
    console.group(`TRACE: Opening Edit Modal for Index [${index}]`);
    
    const currentOrder = JSON.parse(localStorage.getItem('pendingOrderItems')) || [];
    const item = currentOrder[index];
    const modal = document.getElementById('editSummaryItemModal'); 
    
    if (!item) { console.error("TRACE: No item found at index", index); console.groupEnd(); return; }
    if (!modal) { console.error("TRACE: Modal #editSummaryItemModal not found!"); console.groupEnd(); return; }

    console.log("TRACE: Raw Item Data:", item);

    // 1. Check Metadata sync
    const unitPrice = item.price || item.starting_price || 0;
    console.log("TRACE: Determined Unit Price:", unitPrice);

    modal.setAttribute('data-current-product', JSON.stringify({
        db_id: item.db_id,
        name: item.name,
        category: item.category,
        colors: item.all_colors || "",
        custom_options: item.all_custom_options || "", 
        starting_price: unitPrice,
        moq: item.moq
    }));

    // 2. Set Button
    const saveBtn = modal.querySelector('#saveItemBtn');
    if (saveBtn) saveBtn.setAttribute('onclick', `saveItemToOrder(${index})`);

    // 3. Trace Basic Fields
    try {
        const codeEl = modal.querySelector('#edit_item_code');
        const nameEl = modal.querySelector('#edit_item_name');
        if (codeEl) codeEl.textContent = item.code || 'N/A';
        if (nameEl) nameEl.textContent = item.name || 'Product';
        
        const priceEl = modal.querySelector('#edit_price');
        if (priceEl) priceEl.textContent = unitPrice;
        
        console.log("TRACE: Basic text fields populated.");
    } catch (err) { console.error("TRACE: Error in basic fields:", err); }

    // 4. Trace Input Fields
    const customPriceInput = modal.querySelector('#edit_est_custom_price');
    if (customPriceInput) {
        customPriceInput.value = item.custom_price || 0;
        console.log("TRACE: Custom Price Input set to:", customPriceInput.value);
    } else {
        console.warn("TRACE: Selector #edit_est_custom_price NOT FOUND");
    }

    const qtyInput = modal.querySelector('#edit_quantity');
    if (qtyInput) {
        qtyInput.value = item.qty || 0;
        console.log("TRACE: Quantity Input set to:", qtyInput.value);
    }

    const noteEl = modal.querySelector('#edit_note');
    if (noteEl) {
        // Check both 'note' (from Django Seed) and 'item_note' (just in case)
        noteEl.value = item.note || item.item_note || ''; 
        console.log("TRACE: Set note textarea to:", noteEl.value);
    }

    // 5. Trace Customization Generation
    const customContainer = modal.querySelector('.custom-choices');
    console.log("TRACE: all_custom_options string:", item.all_custom_options);
    
    const options = item.all_custom_options ? item.all_custom_options.split(',') : [];
    if (customContainer) {
        customContainer.innerHTML = ''; 
        const slugify = text => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

        options.forEach((opt) => {
            const trimmedOpt = opt.trim();
            if (trimmedOpt) {
                const optId = `${slugify(trimmedOpt)}-edit`;
                const wrapper = document.createElement('div');
                wrapper.style.display = 'contents';
                wrapper.innerHTML = `
                    <input class="filter-input radio-input" type="radio" name="customization" 
                           id="${optId}" value="${trimmedOpt}">
                    <label class="color-filter-label small-b" for="${optId}">${trimmedOpt}</label>
                `;
                customContainer.appendChild(wrapper);
            }
        });

        // Add None
        const noneWrapper = document.createElement('div');
        noneWrapper.style.display = 'contents';
        noneWrapper.innerHTML = `<input class="filter-input radio-input" type="radio" name="customization" id="none-edit" value="N/A"><label class="color-filter-label small-b" for="none-edit">None</label>`;
        customContainer.appendChild(noneWrapper);
        console.log("TRACE: Customization radios generated.");
    }

    // 6. Auto-select Radio
    const customRadios = modal.querySelectorAll('.radio-input');
    console.log("TRACE: Looking for saved customization:", item.custom);
    customRadios.forEach(radio => {
        if (radio.value.trim() === item.custom) {
            radio.checked = true;
            console.log("TRACE: Matched and checked:", radio.value);
        }
    });

    // 7. Colors
    if (typeof renderModalColors === 'function') {
        renderModalColors(modal, item.all_colors);
        setTimeout(() => {
            const colorDivs = modal.querySelectorAll('.product-highlight');
            console.log("TRACE: Found color options:", colorDivs.length);
            colorDivs.forEach(div => {
                if (div.querySelector('p')?.textContent.trim() === item.color) {
                    console.log("TRACE: Clicking color:", item.color);
                    div.click();
                }
            });
        }, 100);
    }

    showModal(modal);
    console.groupEnd();
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

// Helper for Update Order Status
function executeStatusUpdate(id, status, modalToClose) {
    console.log(`--- TRACE: Sending update for #${id} to ${status} ---`);

    fetch(`/orders/update_status/${id}/?status=${encodeURIComponent(status)}`)
        .then(response => {
            if (response.ok) {
                // A. Update the View Modal UI instantly
                const statusDisplay = qs('#order_order_status', viewOrderModal);
                statusDisplay.textContent = status;
                updateStatusButtonStyle(statusDisplay.closest('.status-btn'), status);

                // B. Close the confirmation modal
                hideModal(modalToClose);

                // C. Optional: Force a dashboard refresh or show a success toast
                console.log("--- TRACE: Database update successful ---");
            }
        })
        .catch(err => console.error("Update failed:", err));
}

// Validator
function validateField(field) {
    const errorWrap = field.closest('.error-wrap');
    const errorMsg = errorWrap ? errorWrap.querySelector('.error-msg') : null;

    // 1. CUSTOM CHECK: Force "Select" with value="" to be invalid
    let isInvalidSelect = (field.tagName === 'SELECT' && field.value === "");
    
    // 2. COMBINE: Check browser validity OR our custom select rule
    if (!field.checkValidity() || isInvalidSelect) {
        console.log('Validating:', field.name, 'Result: INVALID');
        
        if (errorMsg) {
            // Use custom data-error or a fallback message
            errorMsg.textContent = isInvalidSelect ? "Please select an option." : (field.dataset.error || field.validationMessage);
            errorMsg.style.display = 'block';
            field.classList.add('error-border');
        }
        return false;
    } else {
        // 3. VALID CASE
        console.log('Validating:', field.name, 'Result: VALID');
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
    const submitBtn = form.querySelector('button[type="submit"]');

    function updateButtonState() {
        if (!submitBtn) return;
        // checkValidity() is a built-in browser method that checks all required/pattern rules
        const isFormValid = form.checkValidity();
        submitBtn.disabled = !isFormValid;
        
        // Optional: Add a class for styling the disabled state
        submitBtn.style.opacity = isFormValid ? "1" : "0.5";
        submitBtn.style.cursor = isFormValid ? "pointer" : "not-allowed";
    }

    // 1. Real-time validation
    form.addEventListener('input', function (e) {
        const field = e.target;
        if (field.hasAttribute('hx-get')) return; 
        
        if (field.classList.contains('input') || field.type === 'file') {
            validateField(field);
            updateButtonState(); // Toggle button on every keystroke
        }
    });

    // 2. Initial check on load (in case fields are empty/required)
    updateButtonState();

    // 3. Final check on submit (Keep your existing safety)
    form.addEventListener('submit', function (e) {
        const fields = form.querySelectorAll('.input, input[type="file"]');
        let isValid = true;
        fields.forEach(field => {
            if (!validateField(field)) isValid = false;
        });

        if (!isValid) {
            e.preventDefault();
            updateButtonState();
        }
    });
});