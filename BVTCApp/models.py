from django.db import models

from django.db import models
from django.utils import timezone

class UserAccount(models.Model): ## double check CHOICES match ui
    USER_TITLES = [
         ('Admin', 'Admin'),
         ('Account Manager', 'Account Manager'),
         ('Production', 'Production'),
         ('Sales Officer', 'Sales Officer'),
         ('Marketing Officer', 'Marketing Officer'),
         ('Graphic Designer', 'Graphic Designer'),
    ]

    USER_ROLES = [
         ('Admin', 'Admin'),
         ('Account Manager', 'Account Manager'),
         ('Officer', 'Officer'),
         ('Other', 'Other'),
    ]
    
    user_id = models.AutoField(primary_key=True)
    user_name = models.CharField(max_length=50)
    password = models.CharField(max_length=255)
    user_title = models.CharField(max_length=50, choices=USER_TITLES)
    user_role = models.CharField(max_length=100, choices=USER_ROLES, default='Other')

class Company(models.Model):
    company_id = models.AutoField(primary_key=True)
    company_name = models.CharField(max_length=150)
    company_logo = models.CharField(max_length=255)
    company_address = models.CharField(max_length=255)
    tin_number = models.CharField(max_length=15, unique=True)

class CustomerAccount(models.Model):
    customer_id = models.AutoField(primary_key=True)
    company_id = models.ForeignKey(Company, on_delete=models.CASCADE)
    customer_name = models.CharField(max_length=100)
    customer_email = models.CharField(max_length=100)
    customer_phone_number = models.CharField(max_length=20)
    messenger = models.CharField(max_length=100, blank=True, null=True)
    viber = models.CharField(max_length=15, blank=True, null=True)

class ShippingDetails(models.Model):
    shipping_id = models.AutoField(primary_key=True)
    customer_id = models.ForeignKey(CustomerAccount, on_delete=models.CASCADE)
    contact_person = models.CharField(max_length=150)
    contact_person_email = models.EmailField(max_length=100)
    contact_person_number = models.CharField(max_length=20)
    address_province = models.CharField(max_length=60)
    address_city = models.CharField(max_length=60)
    address_barangay = models.CharField(max_length=60)
    address_line_1 = models.CharField(max_length=100)
    address_line_2 = models.CharField(max_length=100, blank=True, null=True)
    address_postal_code = models.IntegerField()

class Product(models.Model):
    product_id = models.AutoField(primary_key=True)
    product_code = models.CharField(max_length=20, unique=True, blank=True)
    product_name = models.CharField(max_length=150)
    category = models.CharField(max_length=100)
    description = models.TextField()
    starting_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    MOQ = models.PositiveIntegerField()

class ProductImage(models.Model): #Composite Key
    Product_ID = models.ForeignKey(Product, on_delete=models.CASCADE)
    Product_Image = models.CharField(max_length=255)

class ProductColor(models.Model):
	product_id = models.ForeignKey(Product, on_delete=models.CASCADE)
	product_color = models.CharField(max_length=100)

class Order(models.Model): ### double check CHOICES match ui
    PAYMENT_MODES = [
         ('Metrobank Fund Transfer', 'Metrobank Fund Transfer'),
         ('BPI Bank Transfer', 'BPI Bank Transfer'),
         ('GCash Payment', 'GCash Payment'),
    ]

    PAYMENT_TERMS = [
         ('Partial', 'Partial'),
         ('Full', 'Full'),
    ]

    ORDER_STATUS = [
         ('Pending', 'Pending'),
         ('Approved for Production', 'Approved for Production'),
         ('In Production', 'In Production'),
         ('Completed', 'Completed'),
         ('Dispatched', 'Dispatched'),
         ('Delivered', 'Delivered'),
         ('Cancelled', 'Cancelled'),
    ]

    STOCK_AVAILABILITY = [
         ('Available', 'Available'), 
         ('Limited', 'Limited'), 
         ('Out of Stock', 'Out of Stock'),

    ]

    Order_ID = models.AutoField(primary_key=True)
    Customer_ID = models.ForeignKey(CustomerAccount, on_delete=models.CASCADE)
    User_ID = models.ForeignKey(UserAccount, on_delete=models.CASCADE)
    Shipping_ID = models.ForeignKey(ShippingDetails, on_delete=models.CASCADE)
    
    mode_of_payment = models.CharField(max_length=50, choices=PAYMENT_MODES)
    payment_terms = models.CharField(max_length=20, choices=PAYMENT_TERMS)

    budget = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    initial_total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    start_of_production = models.DateField(default=timezone.now)
    delivery_date = models.DateField(blank=True, null=True)
    lead_time = models.PositiveIntegerField(default=1)

    transaction_platform = models.CharField(max_length=50)
    link_to_logo = models.CharField(max_length=500)

    packing_instructions = models.TextField(blank=True, null=True)
    order_status = models.CharField(max_length=50, choices=ORDER_STATUS, default='Pending')

    freight_term = models.BooleanField(default=False)
    delivery_fee = models.BooleanField(default=False)

    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    issue_date = models.DateField(default=timezone.now)

    note = models.TextField(blank=True, null=True)

    stock_availability = models.CharField(max_length=20, choices=STOCK_AVAILABILITY, default='Available')
    customization_feasibility = models.CharField(max_length=100)
    lead_time_feasibility = models.PositiveIntegerField(default=0)

    actual_total_price = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

class OrderItem(models.Model):
    order_id = models.ForeignKey(Order, on_delete=models.CASCADE)
    product_id = models.ForeignKey(Product, on_delete=models.CASCADE)
    color = models.CharField(max_length=7, blank=True, null=True)
    customization = models.TextField(blank=True, null=True)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

class BillingStatement(models.Model):
	billing_statement_id = models.AutoField(primary_key=True)
	order_id = models.ForeignKey(Order, on_delete=models.CASCADE)
	billing_date = models.DateField(default=timezone.now)
	due_date = models.DateField(default=timezone.now)

class Image(models.Model): ## double check CHOICES match ui, Composite Key
    IMAGE_TYPES = [
         ('Customer Provided', 'Customer Provided'),
         ('In-House', 'In-House'),
         ('Sample', 'Sample'),
    ]

    IMAGE_STATUS = [
         ('Pending', 'Pending'),
         ('Approved', 'Approved'),
         ('Rejected', 'Rejected'),
    ]

    image_id = models.AutoField(primary_key=True)
    product_id = models.ForeignKey(Product, on_delete=models.CASCADE)
    order_id = models.ForeignKey(Order, on_delete=models.CASCADE)
    image_path = models.CharField(max_length=255)
    feedback = models.TextField(blank=True, null=True)
    image_type = models.CharField(max_length=20, choices=IMAGE_TYPES)
    image_status = models.CharField(max_length=15, choices=IMAGE_STATUS, default='Pending')

