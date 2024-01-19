from django.db import models
from django.core.validators import MaxValueValidator
from django.core.exceptions import ValidationError

# Choices for the payment_method field
PAYMENT_METHOD_CHOICES = [
    ("bank", "Bank"),
    ("kas", "Kas"),
    ("pin", "Pin"),
]

# Choices for the order_method field
ORRDER_METHOD_CHOICES = [
    ("mail", "Mail"),
    ("whatsapp", "Whatsapp"),
    ("phone", "Phone"),
]


class Supplier(models.Model):
    # Basic Information
    name = models.CharField(max_length=255, unique=True, verbose_name="Name")
    contact_person = models.CharField(
        max_length=255, blank=True, null=True, verbose_name="Contact Person"
    )
    is_active = models.BooleanField(default=True)
    hasGivenPaymentAuth = models.BooleanField(default=True)  # Betalopdracht
    percentage_to_add = models.IntegerField(
        blank=True,
        null=True,
        validators=[MaxValueValidator(100)],
        verbose_name="Percentage to Add",
    )  # Leverancier procent
    supplier_extra_info = models.TextField(
        blank=True, null=True, verbose_name="Supplier Extra Info"
    )
    has_connection_with_supplier_system = models.BooleanField(default=False)

    # Banking Information
    iban = models.CharField(max_length=255, blank=True, null=True, verbose_name="IBAN")
    bic = models.CharField(max_length=20, blank=True, null=True, verbose_name="BIC")
    account_holder_name = models.CharField(
        max_length=255, blank=True, null=True, verbose_name="Account Holder Name"
    )
    account_holder_city = models.CharField(
        max_length=255, blank=True, null=True, verbose_name="Account Holder City"
    )
    vat_number = models.CharField(
        max_length=20, blank=True, null=True, verbose_name="VAT Number"
    )  # BTW
    kvk_number = models.CharField(
        max_length=20, blank=True, null=True, verbose_name="Chamber of Commerce Number"
    )
    debtor_number = models.CharField(
        max_length=20, blank=True, null=True, verbose_name="Debtor Number"
    )
    payment_terms = models.CharField(
        max_length=255, blank=True, null=True, verbose_name="Payment Terms"
    )
    payment_instruction = models.TextField(
        blank=True, null=True, verbose_name="Payment Instruction"
    )
    payment_method = models.CharField(
        max_length=255,
        choices=PAYMENT_METHOD_CHOICES,
        blank=True,
        null=True,
        verbose_name="Payment Method",
    )
    order_method = models.CharField(
        max_length=255,
        choices=ORRDER_METHOD_CHOICES,
        blank=True,
        null=True,
        verbose_name="Payment Method",
    )
    delivery_time_of_order = models.IntegerField(blank=True, null=True)  # Levertermijn

    minimum_order_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        verbose_name="Minimum Order Amount",
    )

    # Contact Information
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name="Phone")
    mobile_phone = models.CharField(
        max_length=20, blank=True, null=True, verbose_name="Mobile Phone"
    )
    email = models.EmailField(blank=True, null=True, verbose_name="Email (General)")
    email_extra = models.EmailField(
        blank=True, null=True, verbose_name="Email (General)"
    )
    website = models.URLField(blank=True, null=True, verbose_name="Website")
    facebook = models.URLField(blank=True, null=True, verbose_name="Facebook")
    twitter = models.URLField(blank=True, null=True, verbose_name="Twitter")
    linkedin = models.URLField(blank=True, null=True, verbose_name="LinkedIn")
    instagram = models.URLField(blank=True, null=True, verbose_name="Instagram")
    pinterest = models.URLField(blank=True, null=True, verbose_name="Pinterest")
    tiktok = models.URLField(blank=True, null=True, verbose_name="TikTok")

    # Additional Information
    memo = models.TextField(blank=True, null=True, verbose_name="Memo")

    def __str__(self):
        return self.name

    def clean(self):
        # Call the base class clean method
        super().clean()
        from .serializers import validate_vat_number

        # Validate VAT number
        validate_vat_number(self.vat_number)