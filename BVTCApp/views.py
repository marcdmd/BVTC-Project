from django.http import HttpResponse
from django.shortcuts import get_object_or_404, render, redirect
from django.db.models import Q
from django.db import IntegrityError 
from django.contrib import messages  
from django.utils import timezone
from .models import Product, ProductImage, ProductColor, Order, OrderItem, Company, CustomerAccount, ShippingDetails, UserAccount
from .models import Province, City, Barangay
import json

def catalog(request):
    if request.method == 'POST':
        try:
            new_product = Product.objects.create(
                product_code=request.POST.get('product-id'),
                product_name=request.POST.get('product-name'),
                category=request.POST.get('category'),
                description=request.POST.get('product-description'),
                starting_price=request.POST.get('starting-price'), 
                MOQ=request.POST.get('moq')                        
            )

            color_list = request.POST.getlist('colors[]')
            for color_val in color_list:
                if color_val.strip():
                    ProductColor.objects.create(product_id=new_product, product_color=color_val)

            image_files = request.FILES.getlist('photos[]')
            if image_files:
                for img in image_files:
                    ProductImage.objects.create(product_id=new_product, product_image=img)

            messages.success(request, "Product added successfully!")
            return redirect('catalog')

        except IntegrityError:
            messages.error(request, "Product Code already exists.")
            return redirect('catalog')

    products = Product.objects.all()
    search_query = request.GET.get('search', '').strip()
    if search_query:
        products = products.filter(Q(product_name__icontains=search_query) | Q(product_code__icontains=search_query))

    category_filter = request.GET.get('filter', 'all')
    if category_filter != 'all':
        category_dict = dict(Product.CATEGORY_CHOICES)
        mapped_category = category_dict.get(category_filter)
        if mapped_category:
            products = products.filter(category=mapped_category)

    return render(request, 'bvtc_app/catalog.html', {'products': products, 'category_choices': Product.CATEGORY_CHOICES})

def edit_product(request, pk):
    product = Product.objects.get(product_id=pk)
    if request.method == 'POST':
        product.product_name = request.POST.get('product-name', product.product_name)
        product.category = request.POST.get('category', product.category)
        product.description = request.POST.get('product-description', product.description)
        product.starting_price = request.POST.get('starting-price') or product.starting_price
        product.MOQ = request.POST.get('moq') or product.MOQ
        product.save()

        ProductColor.objects.filter(product_id=product).delete()
        for color_val in request.POST.getlist('colors[]'):
            if color_val.strip():
                ProductColor.objects.create(product_id=product, product_color=color_val)

        image_files = request.FILES.getlist('photos[]')
        if image_files:
            for img in image_files:
                ProductImage.objects.create(product_id=product, product_image=img)

        messages.success(request, "Product updated successfully!")
    return redirect('catalog')

def delete_product(request, pk):
    product = Product.objects.get(product_id=pk)
    deleted_name = product.product_name 
    product.delete()
    messages.success(request, f"'{deleted_name}' was deleted successfully!")
    return redirect('catalog')

def orders(request):
    all_orders = Order.objects.all()

    # Calculate counts for the dashboard
    context = {
        'orders': all_orders,
        'count_feasibility': all_orders.filter(order_status='Under Feasibility').count(),
        'count_quotation':   all_orders.filter(order_status='Under Quotation').count(),
        'count_production':  all_orders.filter(order_status='In Production').count(),
        'count_sampled':     all_orders.filter(order_status='Sampled').count(),
        'count_packaged':    all_orders.filter(order_status='Packaged').count(),
        'count_transit':     all_orders.filter(order_status='In Transit').count(),
    }
    
    return render(request, 'bvtc_app/orders.html', context)

def add_order(request):
    if request.method == 'POST':
        print("--- POST received ---")
        print("POST data:", request.POST)
        try:
            # get variables
            manager_id = request.POST.get('account-manager')
            selected_manager = UserAccount.objects.get(user_id=manager_id)

            customer_id = request.POST.get('customer-id')  # value from the select
            customer = CustomerAccount.objects.get(customer_id=customer_id)

            shipping_id = request.POST.get('shipping_id')
            shipping = ShippingDetails.objects.get(shipping_id=shipping_id)

            order_data_raw = request.POST.get('order_data', '[]')

            print("customer_id wow:", customer_id)          # Checkpoint 2: is the customer ID coming through?
            print("shipping_id zing:", shipping_id)          # Checkpoint 3: is the shipping ID coming through?
            print("order_data_raw hoo:", order_data_raw)

            user = UserAccount.objects.first()  # swap out once auth is added

            # map form values to model field choices
            payment_mode_map = {
                'metrobank': 'Metrobank Fund Transfer',
                'bpi': 'BPI Bank Transfer',
                'gcash': 'GCash Payment',
            }
            payment_terms_map = {
                'partial': 'Partial',
                'full': 'Full',
            }
            platform_map = {
                'email': 'Email',
                'messenger': 'Messenger',
                'viber': 'Viber',
            }

            # create order instance
            print("Attempting to create order...")
            new_order = Order.objects.create(
                customer_id=customer,
                user_id=selected_manager,
                shipping_id=shipping,
                mode_of_payment=payment_mode_map.get(request.POST.get('payment-mode'), 'Metrobank Fund Transfer'),
                payment_terms=payment_terms_map.get(request.POST.get('payment-terms'), 'Partial'),
                budget=request.POST.get('budget') or 0,
                start_of_production=request.POST.get('production-start') or timezone.now().date(),
                delivery_date=request.POST.get('delivery-date') or None,
                transaction_platform=platform_map.get(request.POST.get('transaction-platform'), 'Email'),
                link_to_logo=request.POST.get('logo-link') or None,
                packing_instructions=request.POST.get('instructions') or None,
                courier=request.POST.get('courier', 'N/A'),
            )
            print("Order created with ID:", new_order.order_id)

            # create order item rows ---
            order_items = json.loads(order_data_raw)

            total = 0
            for item in order_items:
                product = Product.objects.get(product_id=item['db_id'])
                qty   = int(item.get('qty', 1))
                base_price = float(item.get('price', 0))
                custom_price = float(item.get('custom_price', 0))

                total_unit_price = base_price + custom_price

                OrderItem.objects.create(
                    order_id=new_order,
                    product_id=product,
                    color=item.get('color', ''),
                    customization=item.get('custom', ''),
                    item_note=item.get('note', ''),
                    quantity=qty,
                    price=total_unit_price,
                )
                total += qty * total_unit_price

            # computed total save to order
            new_order.initial_total_price = total
            new_order.total_amount = total
            new_order.save()

            messages.success(request, f"Order #{new_order.order_id} created successfully!")
            return redirect('orders')

        except CustomerAccount.DoesNotExist:
            messages.error(request, "Selected customer not found.")
        except ShippingDetails.DoesNotExist:
            messages.error(request, "Selected shipping address not found.")
        except json.JSONDecodeError:
            messages.error(request, "Cart data was corrupted. Please re-add your items.")
        except Exception as e:
            print("ERROR:", type(e).__name__, "-", e)
            messages.error(request, f"Something went wrong: {e}")

        return redirect('orders')

    # --- GET: just render the form ---
    context = {
        'companies': Company.objects.all(),
        'all_customers': CustomerAccount.objects.all(),
        'managers': UserAccount.objects.all(), # NEW: Add this to the context
        'provinces': Province.objects.all().order_by('name')
    }
    return render(request, 'bvtc_app/add_order.html', context)

def edit_order(request, pk):
    order = get_object_or_404(Order, order_id=pk)
    customer_shipping_addresses = ShippingDetails.objects.filter(customer_id=order.customer_id)
    
    if request.method == 'POST':
        try:
            manager_id = request.POST.get('account-manager')
            if manager_id:
                # Fetch the instance and assign it to the order
                order.user_id = UserAccount.objects.get(user_id=manager_id)            

            # 1. Update Basic Order Fields
            ship_id = request.POST.get('shipping-id')
            if ship_id:
                order.shipping_id = ShippingDetails.objects.get(shipping_id=ship_id)
            order.customer_id_id = request.POST.get('customer-id')
            order.budget = request.POST.get('budget') or 0
            order.mode_of_payment = request.POST.get('payment-mode')
            order.payment_terms = request.POST.get('payment-terms')
            order.start_of_production = request.POST.get('production-start')
            order.delivery_date = request.POST.get('delivery-date') or None
            order.transaction_platform = request.POST.get('transaction-platform')
            order.link_to_logo = request.POST.get('logo-link')
            order.packing_instructions = request.POST.get('instructions')
            order.courier = request.POST.get('courier')
            
            # 2. Re-sync Order Items
            order_data_raw = request.POST.get('order_data', '[]')
            new_items_list = json.loads(order_data_raw)

            # Clear old items and replace (cleanest way to handle deletions/edits)
            order.orderitem_set.all().delete()
            
            total = 0
            for item in new_items_list:
                # Use product_id based on your Product model
                product = Product.objects.get(product_id=item['db_id'])
                qty = int(item.get('qty', 1))

                base_price = float(item.get('price', 0))
                custom_price = float(item.get('custom_price', 0))
                unit_total = base_price + custom_price 

                OrderItem.objects.create(
                    order_id=order,
                    product_id=product,
                    color=item.get('color', ''),
                    customization=item.get('custom', ''),
                    item_note=item.get('note', ''),
                    quantity=qty,
                    price=unit_total
                )
                total += qty * unit_total

            order.initial_total_price = total
            order.total_amount = total
            order.save()

            return redirect('orders')
        except Exception as e:
            print(f"Error updating order: {e}")

    # GET: Prepare JSON for the frontend table
    existing_items = []
    for item in order.orderitem_set.all():
        product = item.product_id
        
        total_saved_price = float(item.price)
        base_price = float(product.starting_price)
        derived_custom_price = total_saved_price - base_price

        existing_items.append({
            'db_id': item.product_id.product_id,
            'code': item.product_id.product_code,
            'name': item.product_id.product_name, # Matches your model
            'color': item.color,
            'custom': item.customization,
            'price': base_price,
            'custom_price': derived_custom_price,
            'total_price': total_saved_price,
            'qty': item.quantity,
            'note': item.item_note,
            'moq': product.MOQ,
            'all_custom_options': ",".join(product.get_custom_options()),
            'all_colors': ",".join([c.product_color for c in product.productcolor_set.all()])
        })

    context = {
        'order': order,
        'managers': UserAccount.objects.all(),
        'customer_shipping_addresses': customer_shipping_addresses, # Filtered list
        'existing_items_json': existing_items,
        'companies': Company.objects.all(),
        'provinces': Province.objects.all().order_by('name')
    }
    return render(request, 'bvtc_app/edit_order.html', context)

def cancel_order(request, pk):
    order = get_object_or_404(Order, order_id=pk)
    
    try:
        order.delete()
        messages.success(request, f"Order no.{pk} has been successfully canceled.")
        
    except Exception as e:
        messages.error(request, f"Error canceling order: {e}")

    return redirect('orders')

def update_order_status(request, pk):
    order = get_object_or_404(Order, order_id=pk)
    new_status = request.GET.get('status')
    
    if new_status:
        order.order_status = new_status
        order.save()
        return HttpResponse(status=200)  # Tells JS: "I'm done, you can refresh now!"
    return HttpResponse(status=400)

# --- UC-19: ADD CUSTOMER LOGIC ---
def add_customer(request):
    if request.method == 'POST':
        try:
            # 1. Capture Basic Info
            first_name = request.POST.get('first-name', '').strip()
            last_name = request.POST.get('last-name', '').strip()
            customer_name = f"{first_name} {last_name}"
            
            # 2. Capture Contact Details
            email = request.POST.get('email-address', '')
            contact_number = request.POST.get('contact-number', '')
            messenger = request.POST.get('messenger', '')
            viber = request.POST.get('viber', '')
            personal_address = request.POST.get('home-address', '')

            # 3. Company Logic (Preventing TIN Unique Constraint Error)
            company_details_type = request.POST.get('company-details')
            
            if company_details_type == 'new-company':
                company, created = Company.objects.get_or_create(
                    tin_number=request.POST.get('tin-number'),
                    defaults={
                        'company_name': request.POST.get('company-name'),
                        'company_address': request.POST.get('company-address'),
                        'company_logo': request.FILES.get('logo') 
                    }
                )
                if not created:
                    company.company_name = request.POST.get('company-name')
                    company.company_address = request.POST.get('company-address')
                    company.save()
            else:
                company_id = request.POST.get('company')
                company = Company.objects.get(company_id=company_id)

            # 4. Save Customer Account (Matched to Model fields)
            platforms = request.POST.getlist('transaction-platform')
            new_customer = CustomerAccount.objects.create(
                company_id=company,
                customer_name=customer_name,
                customer_email=email,
                customer_phone_number=contact_number,
                messenger=messenger,
                viber=viber,
                email_transaction='email' in platforms,
                messenger_transaction='messenger' in platforms,
                viber_transaction='viber' in platforms
            )

            if personal_address:
                ShippingDetails.objects.create(
                    customer_id=new_customer,
                    contact_person_name=customer_name,
                    contact_person_email=email,
                    contact_person_number=contact_number,
                    address_line_1=personal_address,
                    address_province="N/A", 
                    address_city="N/A",
                    address_barangay="N/A",
                    address_postal_code=0 
                )

            messages.success(request, f"Customer {customer_name} added successfully!")
            return redirect(request.META.get('HTTP_REFERER', 'customers'))

        except Exception as e:
            messages.error(request, f"An error occurred: {str(e)}")
            return redirect(request.META.get('HTTP_REFERER', 'customers'))

    return redirect('customers')

def delete_customer(request, pk):
    try:
        customer = CustomerAccount.objects.get(customer_id=pk)
        name = customer.customer_name
        customer.delete()
        messages.success(request, f"Customer '{name}' was deleted successfully.")
    except CustomerAccount.DoesNotExist:
        messages.error(request, "Customer not found.")
    return redirect('customers')

def customers(request):
    all_ships = ShippingDetails.objects.all()
    print(f"DEBUG: Found {all_ships.count()} shipping records") # Look at your terminal!

    context = {
        'all_shipping_details': all_ships, # Name must be EXACTLY this
        'all_customers': CustomerAccount.objects.all(),
        'companies': Company.objects.all(),
    }
    return render(request, 'bvtc_app/customers.html', context)

def get_shipping_buttons(request, customer_id):
    # 1. Find the customer
    customer = get_object_or_404(CustomerAccount, customer_id=customer_id)
    
    # 2. Fetch all shipping addresses linked to them
    shipping_list = ShippingDetails.objects.filter(customer_id=customer)
    
    # 3. Return the partial template with the list
    return render(request, 'bvtc_app/partials/shipping_buttons.html', {
        'shipping_list': shipping_list,
        'customer_id': customer_id
    })

def add_shipping(request):
    if request.method == "POST":
        try:
            # 1. Get the Customer (Crucial because of your ForeignKey)
            # Assuming you have a hidden input or selected customer ID in the form
            customer_id = request.POST.get('customer-id')
            customer = get_object_or_404(CustomerAccount, customer_id=customer_id)

            # 2. Get the Names from the Geography IDs

            province_obj = Province.objects.get(id=request.POST.get('province'))
            city_obj = City.objects.get(id=request.POST.get('city-municipality'))
            barangay_obj = Barangay.objects.get(id=request.POST.get('barangay'))

            # 3. Create the ShippingDetails instance
            shipping = ShippingDetails.objects.create(
                customer_id=customer,
                contact_person_name=request.POST.get('contact-person-name'),
                contact_person_email=request.POST.get('contact-person-email'),
                contact_person_number=request.POST.get('contact-person-number'),
                address_line_1=request.POST.get('address-line-1'),
                address_line_2=request.POST.get('address-line-2'),
                address_province=province_obj.name, # Storing the string name
                address_city=city_obj.name,         # Storing the string name
                address_barangay=barangay_obj.name,   # Storing the string name
                address_postal_code=int(request.POST.get('postal-code') or 0)
            )

            customers_shipping_addresses = ShippingDetails.objects.filter(customer_id=customer)
            return render(request, 'bvtc_app/partials/shipping_buttons.html', {
                'shipping_list': customers_shipping_addresses, # Match the partial loop
                'customer_id': customer_id # Needed for the PLUS button in the partial
            })
        
        except Exception as e:
            print(f"Error: {e}")
            return HttpResponse("Error saving address", status=400)

def load_customers(request):
    company_id = request.GET.get('company-id')
    customers = CustomerAccount.objects.filter(company_id_id=company_id).order_by('customer_name') if company_id else CustomerAccount.objects.none()
    return render(request, 'bvtc_app/partials/customer_options.html', {'customers': customers})

def load_shipping(request):
    customer_id = request.GET.get('customer-id') 
    addresses = ShippingDetails.objects.filter(customer_id_id=customer_id) if customer_id else ShippingDetails.objects.none()
    return render(request, 'bvtc_app/partials/shipping_options.html', {'addresses': addresses})

def add_item(request):
    edit_order_id = request.GET.get('edit_order_id')
        
    context = {
        'products': Product.objects.all(),
        'edit_order_id': edit_order_id
    }
    
    return render(request, 'bvtc_app/add_item.html', context)

def quotations(request):
    return render(request, 'bvtc_app/quotations.html')

def billings(request):
    return render(request, 'bvtc_app/billings.html')

def customers(request):
    all_customers = CustomerAccount.objects.all()

    # Search
    search_query = request.GET.get('search', '').strip()
    if search_query:
        all_customers = all_customers.filter(
            Q(customer_name__icontains=search_query) | 
            Q(customer_email__icontains=search_query) | 
            Q(company_id__company_name__icontains=search_query)
        )

    # Sort
    sort_by = request.GET.get('sort-by')
    if sort_by == 'client-name':
        all_customers = all_customers.order_by('customer_name')
    elif sort_by == 'company-name':
        all_customers = all_customers.order_by('company_id__company_name')

    return render(request, 'bvtc_app/customers.html', {
        'companies': Company.objects.all(), 
        'all_customers': all_customers,
        'provinces': Province.objects.all().order_by('name')
    })

def profile(request):
    return render(request, 'bvtc_app/profile.html')

def load_cities(request):
    province_id = request.GET.get('province')
    cities = City.objects.filter(province_id=province_id).order_by('name')
    return render(request, 'bvtc_app/partials/geo_options.html', {'items': cities, 'label': 'City/Municipality'}) 

def load_barangays(request):
    city_id = request.GET.get('city-municipality')
    barangays = Barangay.objects.filter(city_id=city_id).order_by('name')
    return render(request, 'bvtc_app/partials/geo_options.html', {'items': barangays, 'label': 'Barangay'}) 

def save_shipping_details(request):
    if request.method == "POST":
        try:
            # 1. Get the Customer (Crucial because of your ForeignKey)
            # Assuming you have a hidden input or selected customer ID in the form
            customer_id = request.POST.get('customer-id') 
            customer = CustomerAccount.objects.get(customer_id=customer_id)

            # 2. Get the Names from the Geography IDs

            province_obj = Province.objects.get(id=request.POST.get('province'))
            city_obj = City.objects.get(id=request.POST.get('city-municipality'))
            barangay_obj = Barangay.objects.get(id=request.POST.get('barangay'))

            # 3. Create the ShippingDetails instance
            shipping = ShippingDetails.objects.create(
                customer_id=customer,
                contact_person_name=request.POST.get('contact-person-name'),
                contact_person_email=request.POST.get('contact-person-email'),
                contact_person_number=request.POST.get('contact-person-number'),
                address_line_1=request.POST.get('address-line-1'),
                address_line_2=request.POST.get('address-line-2'),
                address_province=province_obj.name, # Storing the string name
                address_city=city_obj.name,         # Storing the string name
                address_barangay=barangay_obj.name,   # Storing the string name
                address_postal_code=int(request.POST.get('postal-code') or 0)
            )

            customers_shipping_addresses = ShippingDetails.objects.filter(customer_id=customer)
            return render(request, 'bvtc_app/partials/shipping_options.html', {
                'addresses': customers_shipping_addresses,
                'new_id': shipping.shipping_id  # To auto-select the new one
            })
        
        except Exception as e:
            print(f"Error: {e}")
            return HttpResponse("Error saving address", status=400)