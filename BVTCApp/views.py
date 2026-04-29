import json

from django.shortcuts import render, redirect
from django.db.models import Q
from django.db import IntegrityError # For TC 5: Duplicate code checking
from django.contrib import messages  # For alerts
from .models import Product, ProductImage, ProductColor, Order, Company, CustomerAccount, ShippingDetails, OrderItem
from django.utils import timezone

def catalog(request):
    if request.method == 'POST':
        try:
            # Attempt to create the product (NO DEFAULTS for Price/MOQ)
            new_product = Product.objects.create(
                product_code=request.POST.get('product-id'),
                product_name=request.POST.get('product-name'),
                category=request.POST.get('category'),
                description=request.POST.get('product-description'),
                starting_price=request.POST.get('starting-price'), 
                MOQ=request.POST.get('moq')                        
            )

            # create ProductColor objects for each color input
            color_list = request.POST.getlist('colors[]')
            for color_val in color_list:
                if color_val.strip():
                    ProductColor.objects.create(
                        product_id=new_product, 
                        product_color=color_val
                    )

            # Append Images
            image_files = request.FILES.getlist('photos[]')
            if image_files:
                for img in image_files:
                    ProductImage.objects.create(product_id=new_product, product_image=img)

            # Success message
            messages.success(request, "Product added successfully!")
            return redirect('catalog')

        except IntegrityError:
            # TC 5: Catches duplicate product code error
            messages.error(request, "Product Code already exists.")
            return redirect('catalog')

    # --- GET REQUEST: FETCHING, SEARCHING, AND FILTERING ---
    products = Product.objects.all()

    search_query = request.GET.get('search', '').strip()
    if search_query:
        products = products.filter(
            Q(product_name__icontains=search_query) | 
            Q(product_code__icontains=search_query)
        )

    category_filter = request.GET.get('filter', 'all')
    if category_filter != 'all':
        category_dict = dict(Product.CATEGORY_CHOICES)
        mapped_category = category_dict.get(category_filter)
        
        if mapped_category:
            products = products.filter(category=mapped_category)

    context = {
        'products': products,
        'category_choices': Product.CATEGORY_CHOICES,
    }

    return render(request, 'bvtc_app/catalog.html', context)

def edit_product(request, pk):
    # Fetch the specific product we want to edit
    product = Product.objects.get(product_id=pk)

    if request.method == 'POST':
        product.product_name = request.POST.get('product-name', product.product_name)
        product.category = request.POST.get('category', product.category)
        product.description = request.POST.get('product-description', product.description)
        
        product.starting_price = request.POST.get('starting-price') or product.starting_price
        product.MOQ = request.POST.get('moq') or product.MOQ
        
        product.save()

        ProductColor.objects.filter(product_id=product).delete()
        
        color_list = request.POST.getlist('colors[]')
        for color_val in color_list:
            if color_val.strip():
                ProductColor.objects.create(product_id=product, product_color=color_val)

        image_files = request.FILES.getlist('photos[]')
        if image_files:
            for img in image_files:
                ProductImage.objects.create(product_id=product, product_image=img)

        # edit success message popup
        messages.success(request, "Product updated successfully!")

    return redirect('catalog')

def delete_product(request, pk):
    product = Product.objects.get(product_id=pk)
    
    # save product name for deletion message
    deleted_name = product.product_name 
    
    product.delete()

    #delete success message
    messages.success(request, f"'{deleted_name}' was deleted successfully!")
    
    return redirect('catalog')

def orders(request):
    orders = Order.objects.all()
    return render(request, 'bvtc_app/orders.html', {'orders': orders})

def add_order(request):
    companies = Company.objects.all()
    customers = CustomerAccount.objects.all()
    return render(request, 'bvtc_app/add_order.html', {'companies': companies, 'all_customers': customers})

def load_customers(request):
    print("You called?")
    company_id = request.GET.get('company-id')
    if company_id:
        customers = CustomerAccount.objects.filter(company_id_id=company_id).order_by('customer_name')
    else:
        customers = CustomerAccount.objects.none()
    
    return render(request, 'bvtc_app/partials/customer_options.html', {'customers': customers})

def load_shipping(request):
    customer_id = request.GET.get('customer-id') 
    if customer_id:
        addresses = ShippingDetails.objects.filter(customer_id_id=customer_id)
    else:
        addresses = ShippingDetails.objects.none()

    return render(request, 'bvtc_app/partials/shipping_options.html', {'addresses': addresses})

def add_item(request):
    products = Product.objects.all()
    return render(request, 'bvtc_app/add_item.html', {'products': products})

def quotations(request):
    return render(request, 'bvtc_app/quotations.html')

def billings(request):
    return render(request, 'bvtc_app/billings.html')

def customers(request):
    companies = Company.objects.all()
    customers = CustomerAccount.objects.all()
    return render(request, 'bvtc_app/customers.html', {'companies': companies, 'all_customers': customers})

def profile(request):
    return render(request, 'bvtc_app/profile.html')

def add_order(request):
    if request.method == 'POST':
        try:
            # get variables
            customer_id = request.POST.get('customer-name')  # value from the select
            customer = CustomerAccount.objects.get(customer_id=customer_id)

            shipping_id = request.POST.get('shipping')
            shipping = ShippingDetails.objects.get(shipping_id=shipping_id)

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

            # create order item rows ---
            order_data_raw = request.POST.get('order_data', '[]')
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
            messages.error(request, f"Something went wrong: {e}")

        return redirect('add_order')

    # render form
    companies = Company.objects.all()
    customers = CustomerAccount.objects.all()
    return render(request, 'bvtc_app/add_order.html', {'companies': companies, 'all_customers': customers})