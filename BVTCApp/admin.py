from django.contrib import admin
from .models import (
    Product, ProductImage, ProductColor, Order, OrderItem, 
    Company, CustomerAccount, UserAccount, 
    Province, City, Barangay, ShippingDetails
)

admin.site.register(UserAccount)
admin.site.register(Product)
admin.site.register(ProductImage)
admin.site.register(ProductColor)
admin.site.register(Order)
admin.site.register(OrderItem)
admin.site.register(Company)
admin.site.register(CustomerAccount)
admin.site.register(Province)
admin.site.register(City)
admin.site.register(Barangay)
admin.site.register(ShippingDetails)