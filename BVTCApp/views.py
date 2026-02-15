from django.shortcuts import render
from .models import Product, ProductImage, ProductColor, Order, OrderItem, Company, CustomerAccount, ShippingDetails

def catalog(request):
    products = Product.objects.all()
    return render(request, 'bvtc_app/catalog.html', {'products': products})

def orders(request):
    return render(request, 'bvtc_app/orders.html')

def add_order(request):
    return render(request, 'bvtc_app/add_order.html')

def add_item(request):
    return render(request, 'bvtc_app/add_item.html')

def quotations(request):
    return render(request, 'bvtc_app/quotations.html')