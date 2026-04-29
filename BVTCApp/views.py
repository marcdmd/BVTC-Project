from django.shortcuts import render, redirect
from django.db.models import Q
from django.db import IntegrityError 
from django.contrib import messages  

from django.utils import timezone
from .models import Product, ProductImage, ProductColor, Order, OrderItem, Company, CustomerAccount, ShippingDetails
from .models import Province, City, Barangay
from django.http import JsonResponse
from django.views.decorators.http import require_POST
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
    return render(request, 'bvtc_app/orders.html', {'orders': Order.objects.all()})

def add_order(request):
    if request.method == 'POST':
        print("--- POST received ---")
        print("POST data:", request.POST)
        try:
            # get variables
            customer_id = request.POST.get('customer-id')  # value from the select
            customer = CustomerAccount.objects.get(customer_id=customer_id)

            shipping_id = request.POST.get('shipping')
            shipping = ShippingDetails.objects.get(shipping_id=shipping_id)

            order_data_raw = request.POST.get('order_data', '[]')

            print("customer_id wow:", customer_id)          # Checkpoint 2: is the customer ID coming through?
            print("shipping_id zing:", shipping_id)          # Checkpoint 3: is the shipping ID coming through?
            print("order_data_raw hoo:", order_data_raw)

            # TEMPORARY, CHANGE ONCE LOGIN IS IMPLEMENTED ------------------------------------------------------------------------------------------------------------------
            from .models import UserAccount
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
                user_id=user,
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
                price = float(item.get('price', 0))

                OrderItem.objects.create(
                    order_id=new_order,
                    product_id=product,
                    color=item.get('color', ''),
                    customization=item.get('custom', ''),
                    quantity=qty,
                    price=price,
                )
                total += qty * price

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
    companies = Company.objects.all()
    customers = CustomerAccount.objects.all()
    return render(request, 'bvtc_app/add_order.html', {'companies': Company.objects.all(), 'all_customers': CustomerAccount.objects.all(), 'provinces': Province.objects.all().order_by('name')})

ROLE_STATUS_OPTIONS = { ### shows the status options the role is allowed to select
    'Admin': [
        'Under Feasibility', 'Feasibility Report Sent', 'Under Quotation', 'In Production',
        'Sampled', 'Packaged', 'In Transit', 'Under Validation',
        'Validated', 'Sent to Customer', 'Signed', 'Issued',
    ],
    'Account Manager': [
        'Under Feasibility', 'Feasibility Report Sent', 'Under Quotation', 'In Production',
        'Sampled', 'Packaged', 'In Transit', 'Under Validation',
        'Validated', 'Sent to Customer', 'Signed', 'Issued',
    ],
    'Officer': [
        'Under Feasibility', 'Feasibility Report Sent',
    ],
    'Production': [
        'In Production', 'Sampled', 'Packaged', 'In Transit'
    ],
}

def get_allowed_statuses(user): ### function to filter order status based on user
    """
    Returns the list of statuses a user is allowed to see/set.
    Accepts a UserAccount instance or None.
    Returns all statuses if no user (temporary until login is done).
    """
    if user is None:
        return [choice[0] for choice in Order.ORDER_STATUS]
    return ROLE_STATUS_OPTIONS.get(user.user_role, [choice[0] for choice in Order.ORDER_STATUS])

# --- UC: UPDATE ORDER STATUS ---
@require_POST
def update_order_status(request, pk):
    try:
        order = Order.objects.get(order_id=pk)
    except Order.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Order not found.'}, status=404)

    new_status = request.POST.get('status', '').strip()

    # Validate: must be a valid choice
    valid_statuses = [choice[0] for choice in Order.ORDER_STATUS]
    if new_status not in valid_statuses:
        return JsonResponse({'success': False, 'error': 'Invalid status.'}, status=400)

    # Role check (placeholder until login — uses first user for now)
    # REPLACE `UserAccount.objects.first()` with `request.user` once login is done
    from .models import UserAccount
    current_user = UserAccount.objects.first()
    allowed = get_allowed_statuses(current_user)

    if new_status not in allowed:
        return JsonResponse({'success': False, 'error': 'You are not allowed to set this status.'}, status=403)

    order.order_status = new_status
    order.save()

    return JsonResponse({'success': True, 'new_status': new_status})

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
    # Back to basics: Just get the data and render it.
    return render(request, 'bvtc_app/customers.html', {
        'companies': Company.objects.all(), 
        'all_customers': CustomerAccount.objects.all()
    })

def add_shipping(request):
    # Logic for UC-20 goes here
    return redirect(request.META.get('HTTP_REFERER', 'customers'))

def load_customers(request):
    company_id = request.GET.get('company-id')
    customers = CustomerAccount.objects.filter(company_id_id=company_id).order_by('customer_name') if company_id else CustomerAccount.objects.none()
    return render(request, 'bvtc_app/partials/customer_options.html', {'customers': customers})

def load_shipping(request):
    customer_id = request.GET.get('customer-id') 
    addresses = ShippingDetails.objects.filter(customer_id_id=customer_id) if customer_id else ShippingDetails.objects.none()
    return render(request, 'bvtc_app/partials/shipping_options.html', {'addresses': addresses})

def add_item(request):
    return render(request, 'bvtc_app/add_item.html', {'products': Product.objects.all()})

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
        # 1. Get the Customer (Crucial because of your ForeignKey)
        # Assuming you have a hidden input or selected customer ID in the form
        customer_id = request.POST.get('customer_id') 
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
            address_postal_code=request.POST.get('postal-code')
        )


        return render(request, 'bvtc_app/partials/shipping_info_display.html', {
            'shipping': shipping
        })