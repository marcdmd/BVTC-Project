from django.shortcuts import render

def catalog(request):
    return render(request, 'bvtc_app/catalog.html')

def orders(request):
    return render(request, 'bvtc_app/orders.html')

def add_order(request):
    return render(request, 'bvtc_app/add_order.html')

def add_item(request):
    return render(request, 'bvtc_app/add_item.html')

def quotations(request):
    return render(request, 'bvtc_app/quotations.html')