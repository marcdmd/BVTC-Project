from django.shortcuts import render, redirect
from .models import Product, ProductImage, ProductColor, Order

def catalog(request):
    if request.method == 'POST':
        # create product object
        new_product = Product.objects.create(
            product_code=request.POST.get('product-id'),
            product_name=request.POST.get('product-name'),
            category=request.POST.get('category'),
            description=request.POST.get('product-description'),
            starting_price=request.POST.get('starting-price') or 0.00,  #default to 0.00 if no input
            MOQ=request.POST.get('moq') or 1 #default to 1 if no input
        )

        # create ProductColor objects for each color input
        color_list = request.POST.getlist('colors[]')
        for color_val in color_list:
            if color_val.strip():
                ProductColor.objects.create(
                    product_id=new_product, 
                    product_color=color_val
                )

        # create ProductImage objects for each
        image_files = request.FILES.getlist('photos[]')
        for img in image_files:
            ProductImage.objects.create(
                product_id=new_product, 
                product_image=img
            )

        return redirect('catalog')

    # fetch all products including admin-inputs
    products = Product.objects.all()
    return render(request, 'bvtc_app/catalog.html', {'products': products})

def orders(request):
    orders = Order.objects.all()
    return render(request, 'bvtc_app/orders.html', {'orders': orders})

def add_order(request):
    return render(request, 'bvtc_app/add_order.html')

def add_item(request):
    products = Product.objects.all()
    return render(request, 'bvtc_app/add_item.html', {'products': products})

def quotations(request):
    return render(request, 'bvtc_app/quotations.html')