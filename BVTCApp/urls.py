from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    path('', views.catalog, name='catalog'),
    path('catalog/edit/<int:pk>/', views.edit_product, name='edit_product'),
    path('catalog/delete/<int:pk>/', views.delete_product, name='delete_product'),

    path('orders/', views.orders, name='orders'),
    path('orders/add_order/', views.add_order, name='add_order'),
    path('orders/load_customers/', views.load_customers, name='load_customers'),
    path('orders/load_shipping/', views.load_shipping, name='load_shipping'),
    path('orders/add_order/add_item', views.add_item, name='add_item'),
    # path('orders/edit_order/<int:pk>', views.edit_order, name='edit_order'),
    # path('order/update_order_status/', views.update_order_status, name='update_order_status'),

    path('quotations/', views.quotations, name='quotations'),

    path('billings/', views.billings, name='billings'),

    path('customers/', views.customers, name='customers'),
    path('customers/add_customer/', views.add_customer, name='add_customer'),
    path('customers/add_shipping/', views.add_shipping, name='add_shipping'),
    path('delete-customer/<int:pk>/', views.delete_customer, name='delete_customer'),

    path('profile/', views.profile, name='profile'),

    # HTMX Geography Loads
    path('ajax/load-cities/', views.load_cities, name='load_cities'),
    path('ajax/load-barangays/', views.load_barangays, name='load_barangays'),
]