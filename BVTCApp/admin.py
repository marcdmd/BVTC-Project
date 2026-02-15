from django.contrib import admin
from .models import Product, ProductImage, ProductColor, Order, OrderItem, Company, CustomerAccount, ShippingDetails

admin.site.register(Product)
admin.site.register(ProductImage)
admin.site.register(ProductColor)
admin.site.register(Order)
admin.site.register(OrderItem)
admin.site.register(Company)
admin.site.register(CustomerAccount)
admin.site.register(ShippingDetails)