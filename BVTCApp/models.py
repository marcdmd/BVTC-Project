from django.db import models
from django.utils import timezone

class UserAccount(models.Model):
    USER_TITLES = [
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
    password = models.CharField(max_length=255) # need to add hashing for passwords
    user_title = models.CharField(max_length=50, choices=USER_TITLES)
    user_role = models.CharField(max_length=100, choices=USER_ROLES, default='Other')

    def __str__(self):
        return f'{self.user_name} - {self.user_title}'

class Company(models.Model):
    company_id = models.AutoField(primary_key=True)
    company_name = models.CharField(max_length=150)
    company_logo = models.ImageField(upload_to='images/')
    company_address = models.CharField(max_length=255)
    tin_number = models.CharField(max_length=15, unique=True) #should make it fixed 9 digits, error if not
    objects = models.Manager()

    def __str__(self):
        return f'{self.company_id} - {self.company_name}'
    
    class Meta:
        verbose_name_plural: str = 'Companies'

class CustomerAccount(models.Model):
    customer_id = models.AutoField(primary_key=True)
    company_id = models.ForeignKey(Company, on_delete=models.CASCADE)
    customer_name = models.CharField(max_length=100)
    customer_email = models.CharField(max_length=100)
    customer_phone_number = models.CharField(max_length=20) #should make it fixed 11 digits, error if not (maybe take note of country code or landline stuff)
    messenger = models.CharField(max_length=100, blank=True, null=True)
    viber = models.CharField(max_length=15, blank=True, null=True)
    objects = models.Manager()

    def __str__(self):
        return f'{self.customer_id} - {self.customer_name}, {self.company_id}'

    class Meta:
        verbose_name_plural: str = 'Customer Accounts'

class ShippingDetails(models.Model): # option to insert details if contact person is same as customer
    shipping_id = models.AutoField(primary_key=True)
    customer_id = models.ForeignKey(CustomerAccount, on_delete=models.CASCADE)
    contact_person_name = models.CharField(max_length=150)
    contact_person_email = models.EmailField(max_length=100)
    contact_person_number = models.CharField(max_length=20)
    address_province = models.CharField(max_length=60)
    address_city = models.CharField(max_length=60)
    address_barangay = models.CharField(max_length=60)
    address_line_1 = models.CharField(max_length=100)
    address_line_2 = models.CharField(max_length=100, blank=True, null=True)
    address_postal_code = models.IntegerField()
    objects = models.Manager()

    def __str__(self):
        return f'{self.shipping_id} - {self.customer_id}, {self.contact_person_name}'

    class Meta:
        verbose_name_plural: str = 'Shipping Details'

class Product(models.Model):
    CATEGORY_CHOICES = [
        ('Company Profile', 'Company Profile'),
        ('Individual Items', 'Individual Items'),
        ('Gift Set', 'Gift Set'),
        ('Bag', 'Bag'),
    ]
    
    product_id = models.AutoField(primary_key=True)
    product_code = models.CharField(max_length=20, unique=True, blank=True)
    product_name = models.CharField(max_length=150)
    category = models.CharField(max_length=100, choices=CATEGORY_CHOICES)
    description = models.TextField()
    starting_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    MOQ = models.PositiveIntegerField()
    objects = models.Manager()

    def __str__(self):
         return f'{self.product_code} - {self.product_name}'

class ProductImage(models.Model): #Composite Key
    product_id = models.ForeignKey(Product, on_delete=models.CASCADE)
    product_image = models.ImageField(upload_to='images/')
    objects = models.Manager()

    def __str__(self):
         return f'{self.product_id} - {self.product_image}'

    class Meta:
        verbose_name_plural: str = 'Product Images'

class ProductColor(models.Model):
    product_id = models.ForeignKey(Product, on_delete=models.CASCADE)
    product_color = models.CharField(max_length=100)
    objects = models.Manager()
    
    def __str__(self):
        return f'{self.product_id} - {self.product_color}'

    class Meta:
        verbose_name_plural: str = 'Product Colors'

class Order(models.Model):
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
		('Under Feasibility', 'Under Feasibility'),
        ('Under Quotation', 'Under Quotation'),
        ('In Production', 'In Production'),
        ('Sampled', 'Sampled'),
        ('Packaged', 'Packaged'),
        ('In Transit', 'In Transit'),
        ('Under Validation', 'Under Validation'),
        ('Validated', 'Validated'),
        ('Sent to Customer', 'Sent to Customer'),
        ('Signed', 'Signed'),
        ('Issued', 'Issued'),
    ]

    STOCK_AVAILABILITY = [
         ('Available', 'Available'), 
         ('Limited', 'Limited'), 
         ('Out of Stock', 'Out of Stock'),
    ]

    order_id = models.AutoField(primary_key=True)
    customer_id = models.ForeignKey(CustomerAccount, on_delete=models.CASCADE)
    user_id = models.ForeignKey(UserAccount, on_delete=models.CASCADE)
    shipping_id = models.ForeignKey(ShippingDetails, on_delete=models.CASCADE) # should auto filter to only show addresses that match the customer
    
    mode_of_payment = models.CharField(max_length=50, choices=PAYMENT_MODES)
    payment_terms = models.CharField(max_length=20, choices=PAYMENT_TERMS)

    budget = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    initial_total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    start_of_production = models.DateField(default=timezone.now)
    delivery_date = models.DateField(blank=True, null=True)
    lead_time = models.PositiveIntegerField(default=1)

    transaction_platform = models.CharField(max_length=50)
    link_to_logo = models.CharField(max_length=500, blank=True, null=True)

    packing_instructions = models.TextField(blank=True, null=True)
    order_status = models.CharField(max_length=50, choices=ORDER_STATUS, default='Under Feasibility')

    freight_term = models.BooleanField(default=False)
    delivery_fee = models.BooleanField(default=False)

    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    issue_date = models.DateField(default=timezone.now)

    note = models.TextField(blank=True, null=True)
    stock_availability = models.CharField(max_length=20, choices=STOCK_AVAILABILITY, default='Available', null=True)
    customization_feasibility = models.CharField(max_length=100, blank=True)
    lead_time_feasibility = models.PositiveIntegerField(default=0, blank=True, null=True)

    actual_total_price = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, null=True)

    def __str__(self):
        return f'{self.order_id} - {self.customer_id}'

class OrderItem(models.Model):
    order_id = models.ForeignKey(Order, on_delete=models.CASCADE)
    product_id = models.ForeignKey(Product, on_delete=models.CASCADE)
    color = models.CharField(max_length=7, blank=True, null=True)
    customization = models.TextField(blank=True, null=True)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    objects = models.Manager()

    def __str__(self):
        return f'{self.order_id}-{self.product_id}'

    class Meta:
        verbose_name_plural: str = 'Order Items'

class BillingStatement(models.Model):
    PAYMENT_TERMS = [
        ('Partial-Initial', 'Partial-Initial'),
        ('Partial-Final', 'Partial-Final'),
        ('Full', 'Full'),
        ]
    
    PAYMENT_STATUS = [
        ('Acknowledged', 'Acknowledged'),
        ('Issued', 'Issued'),
        ('Paid', 'Paid'),
    ]
    
    billing_statement_id = models.AutoField(primary_key=True)
    order_id = models.ForeignKey(Order, on_delete=models.CASCADE)
    payment_term = models.CharField(max_length=50, choices=PAYMENT_TERMS, default='Partial-Initial')
    billing_date = models.DateField(default=timezone.now)
    due_date = models.DateField(default=timezone.now)
    payment_status = models.CharField(max_length=50, choices=PAYMENT_STATUS, default='Acknowledged')

class Image(models.Model): #Composite Key
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
    image_path = models.ImageField(max_length=255)
    feedback = models.TextField(blank=True, null=True)
    image_type = models.CharField(max_length=20, choices=IMAGE_TYPES)
    image_status = models.CharField(max_length=15, choices=IMAGE_STATUS, default='Pending')

