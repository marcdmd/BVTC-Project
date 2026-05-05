from django.db import models
from django.utils import timezone
from decimal import Decimal

class UserAccount(models.Model):    
    USER_ROLES = [
       ('Admin', 'Admin'),
       ('Account Manager', 'Account Manager'),
       ('Officer', 'Officer'),
       ('Production', 'Production'),
       ('Graphic Designer', 'Graphic Designer'),
       ('Other', 'Other')
       ]
    
    user_id = models.AutoField(primary_key=True)
    user_name = models.CharField(max_length=50)
    password = models.CharField(max_length=255) # need to add hashing for passwords
    user_role = models.CharField(max_length=100, choices=USER_ROLES, default='Other')

    def __str__(self):
        return f'{self.user_name} - {self.user_role}'

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
    email_transaction = models.BooleanField(default=False)
    messenger_transaction = models.BooleanField(default=False)
    viber_transaction = models.BooleanField(default=False)

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
        ('Apparel', 'Apparel'),
        ('Awards & Recognition', 'Awards & Recognition'),
        ('Bag', 'Bag'),
        ('Coffee & Wine Item', 'Coffee & Wine Item'),
        ('Drinkware', 'Drinkware'),
        ('Eco Item', 'Eco Item'),
        ('Gadgets & Electronics', 'Gadgets & Electronics'),
        ('Individual Item', 'Individual Item'),
        ('Leather Item', 'Leather Item'),
        ('Office Item', 'Office Item'),
        ('Packaging Item', 'Packaging Item'),
        ('Wellness & Travel', 'Wellness & Travel'),
        ('Others', 'Others')
    ]

    CUSTOM_OPTIONS = {
        "Apparel": ["Cut & Sew", "Silkscreen Print", "Digital Print"],
        "Awards & Recognition": ["Laser Engrave", "Digital Print", "Silkscreen Print"],
        "Bag": ["Cut & Sew", "Silkscreen Print", "Digital Print", "Leather Stamp"],
        "Coffee & Wine Item": ["Laser Engrave", "Silkscreen Print", "Digital Print"],
        "Drinkware": ["Laser Engrave", "Silkscreen Print", "Digital Print"],
        "Eco Item": ["Silkscreen Print", "Laser Engrave", "Digital Print"],
        "Gadgets & Electronics": ["Laser Engrave", "Silkscreen Print", "Digital Print"],
        "Individual Item": ["Silkscreen Print", "Digital Print", "Laser Engrave", "Leather Stamp"],
        "Leather Item": ["Leather Stamp", "Laser Engrave", "Digital Print"],
        "Office Item": ["Silkscreen Print", "Laser Engrave", "Digital Print", "Leather Stamp"],
        "Packaging Item": ["Silkscreen Print", "Digital Print", "Laser Engrave"],
        "Wellness & Travel": ["Silkscreen Print", "Digital Print", "Laser Engrave", "Leather Stamp"],
    }
    
    product_id = models.AutoField(primary_key=True)
    product_code = models.CharField(max_length=20, unique=True)
    product_name = models.CharField(max_length=150)
    category = models.CharField(max_length=100, choices=CATEGORY_CHOICES, default='Others')
    description = models.TextField()
    starting_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    MOQ = models.PositiveIntegerField(default=1)
    objects = models.Manager()

    def get_custom_options(self):
        return self.CUSTOM_OPTIONS.get(self.category, [])

    def __str__(self):
         return f'{self.product_code} - {self.product_name}'

class ProductImage(models.Model):
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
        ('Feasibility Report Sent', 'Feasibility Report Sent'),
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
    courier = models.CharField(max_length=50, default='N/A')

    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    issue_date = models.DateField(default=timezone.now)
    date_quoted = models.DateField(default=timezone.now)

    note = models.TextField(blank=True, null=True)
    stock_availability = models.CharField(max_length=20, choices=STOCK_AVAILABILITY, default='Available', null=True)
    customization_feasibility = models.CharField(max_length=100, blank=True, null=True)
    lead_time_feasibility = models.PositiveIntegerField(default=0, blank=True, null=True)

    actual_total_price = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, null=True)

    def get_items_total(self):
        """Calculates the sum of (quantity * price) for all items."""
        return sum(item.quantity * item.price for item in self.orderitem_set.all())

    def get_discount_percentage(self):
        """Returns the discount rate based on total quantity of items."""
        total_qty = sum(item.quantity for item in self.orderitem_set.all())
        
        if total_qty >= 1000:
            return Decimal('0.10')
        elif total_qty >= 501:
            return Decimal('0.08')
        elif total_qty >= 301:
            return Decimal('0.05')
        elif total_qty >= 101:
            return Decimal('0.03')
        else:
            return Decimal('0.00')

    def get_discount_display(self):
        """Returns the percentage as a whole number (e.g., 10 instead of 0.10)"""
        return int(self.get_discount_percentage() * 100)

    def get_total_less_discount(self):
        """Total price after applying the tiered discount."""
        total = self.get_items_total()
        discount_amount = total * self.get_discount_percentage()
        return total - discount_amount

    def get_total_less_lylty_discount(self):
        total = self.get_total_less_discount()
        discount_amount = total * (self.discount / 100)
        return total - discount_amount

    def get_vat(self):
        total_price = self.get_total_less_lylty_discount()
        return total_price * Decimal('0.12')

    def get_grand_total_with_vat(self):
        """The final price including 12% VAT."""
        # Note: If your item prices are already VAT-inclusive, 
        # you wouldn't add 12% again. 
        # Assuming you want to add 12% on top of the discounted price:
        discounted_price = self.get_total_less_lylty_discount()
        return discounted_price * Decimal('1.12')

    def get_partial_sixty(self):
        grand_total = self.get_grand_total_with_vat()
        return grand_total * Decimal('0.6')
    
    def get_partial_forty(self):
        grand_total = self.get_grand_total_with_vat()
        return grand_total * Decimal('0.4')

    def __str__(self):
        return f'{self.order_id} - {self.customer_id}'

class OrderItem(models.Model):
    order_id = models.ForeignKey(Order, on_delete=models.CASCADE)
    product_id = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    color = models.CharField(max_length=7, blank=True, null=True)
    customization = models.CharField(blank=True, null=True)
    item_note = models.TextField(blank=True, null=True)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    objects = models.Manager()

    def __str__(self):
        return f'{self.order_id}-{self.product_id}'

    def get_total(self):
        # Quantity * Inclusive Price
        return self.quantity * self.price

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
    image_path = models.ImageField(upload_to='images/', max_length=255)
    feedback = models.TextField(blank=True, null=True)
    image_type = models.CharField(max_length=20, choices=IMAGE_TYPES)
    image_status = models.CharField(max_length=15, choices=IMAGE_STATUS, default='Pending')

class Province(models.Model):
    name = models.CharField(max_length=100, unique=True)
    def __str__(self): return self.name

class City(models.Model):
    province = models.ForeignKey(Province, on_delete=models.CASCADE, related_name='cities')
    name = models.CharField(max_length=100)
    def __str__(self): return self.name

class Barangay(models.Model):
    city = models.ForeignKey(City, on_delete=models.CASCADE, related_name='barangays')
    name = models.CharField(max_length=100)
    def __str__(self): return self.name
