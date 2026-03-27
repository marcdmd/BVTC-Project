from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    path('', views.catalog, name='catalog'),
    path('catalog/edit/<int:pk>/', views.edit_product, name='edit_product'),
    path('catalog/delete/<int:pk>/', views.delete_product, name='delete_product'),
    path('orders', views.orders, name='orders'),
    path('orders/add_order', views.add_order, name='add_order'),
    path('orders/add_order/add_item', views.add_item, name='add_item'),
    path('quotations', views.quotations, name='quotations'),
]