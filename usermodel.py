# authentication/models.py
from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.db import models
from django.contrib.auth import get_user_model


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        groups = extra_fields.pop("groups", None)
        user_permissions = extra_fields.pop("user_permissions", None)

        # Create the user
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)

        # Set many-to-many fields
        if groups is not None:
            user.groups.set(groups)
        if user_permissions is not None:
            user.user_permissions.set(user_permissions)

        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("type", "admin")

        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    USER_TYPE_CHOICES = [
        ("special", "Special"),
        ("wholesaler", "Wholesaler"),
        ("supermarket", "Supermarket"),
        ("particular", "Particular"),
        ("admin", "Admin"),
    ]

    # Separate integer field as the primary key
    id = models.AutoField(primary_key=True)

    email = models.EmailField(max_length=254, unique=True)
    first_name = models.CharField(max_length=30, blank=True, null=True)
    last_name = models.CharField(max_length=30, blank=True, null=True)
    gender = models.CharField(max_length=30, blank=True, null=True)
    birthdate = models.DateField(blank=True, null=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    mobile_number = models.CharField(max_length=15, blank=True, null=True)
    type = models.CharField(
        max_length=20, choices=USER_TYPE_CHOICES, default="particular"
    )

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    business_name = models.CharField(max_length=100, blank=True, null=True)
    contact_person_name = models.CharField(max_length=100, blank=True, null=True)
    contact_person_phone_number = models.CharField(
        max_length=255, blank=True, null=True
    )
    is_eligible_to_work_with = models.BooleanField(default=True)
    department = models.CharField(max_length=100, blank=True, null=True)
    classification = models.CharField(max_length=100, blank=True, null=True)
    branch = models.CharField(max_length=100, blank=True, null=True)
    inform_when_new_products = models.BooleanField(default=False)
    inform_via = models.CharField(max_length=100, blank=True, null=True)
    invoice_language = models.CharField(max_length=30, blank=True, null=True)
    iban = models.CharField(
        max_length=34, blank=True, null=True
    )  # Assuming max IBAN length
    bic = models.CharField(
        max_length=11, blank=True, null=True
    )  # Assuming max BIC length
    account_holder_name = models.CharField(max_length=100, blank=True, null=True)
    account_holder_city = models.CharField(max_length=100, blank=True, null=True)
    vat = models.CharField(
        max_length=20, blank=True, null=True
    )  # VAT identification number
    kvk = models.CharField(
        max_length=20, blank=True, null=True
    )  # Dutch Chamber of Commerce number
    payment_method = models.CharField(max_length=50, blank=True, null=True)
    customer_percentage = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True
    )
    invoice_discount = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True
    )
    payment_termin = models.CharField(max_length=50, blank=True, null=True)
    is_payment_termin_active = models.BooleanField(default=False)
    credit_limit = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    incasseren = models.BooleanField(default=False)
    invoice_address = models.CharField(max_length=255, blank=True, null=True)
    discount_group = models.CharField(max_length=100, blank=True, null=True)
    customer_color = models.CharField(
        max_length=7, blank=True, null=True
    )  # Assuming HEX color
    relation_type = models.CharField(max_length=100, blank=True, null=True)
    relation_via = models.CharField(max_length=100, blank=True, null=True)
    notify = models.BooleanField(default=False)
    days_closed = models.CharField(
        max_length=255, blank=True, null=True
    )  # List of days or a description
    days_no_delivery = models.CharField(
        max_length=255, blank=True, null=True
    )  # List of days or a description
    phone = models.CharField(max_length=20, blank=True, null=True)
    mobile_phone = models.CharField(max_length=20, blank=True, null=True)
    fax = models.CharField(max_length=20, blank=True, null=True)
    contact_person_email = models.EmailField(max_length=254, blank=True, null=True)
    website = models.URLField(max_length=200, blank=True, null=True)
    is_subscribed_newsletters = models.BooleanField(default=False)
    is_access_granted_social_media = models.BooleanField(default=False)
    facebook = models.URLField(max_length=200, blank=True, null=True)
    linkedin = models.URLField(max_length=200, blank=True, null=True)
    twitter = models.URLField(max_length=200, blank=True, null=True)
    instagram = models.URLField(max_length=200, blank=True, null=True)
    pinterest = models.URLField(max_length=200, blank=True, null=True)
    tiktok = models.URLField(max_length=200, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    last_transaction_date = models.DateTimeField(blank=True, null=True)

    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["phone_number"]

    def save(self, *args, **kwargs):
        if self.type == "admin":
            self.is_superuser = True
            self.is_staff = True

        mandatory_fields = [
            "email",
            "password",
        ]
        if self.type not in ["particular", "admin"]:
            mandatory_fields = [
                "email",
                "password",
                "business_name",
                "contact_person_name",
                "contact_person_phone_number",
                "vat",
                "kvk",
            ]
        for field in mandatory_fields:
            if not getattr(self, field):
                raise ValueError(f"The {field} field is mandatory for this user type")

        super().save(*args, **kwargs)

    def get_full_name(self):
        """
        Returns the first_name plus the last_name, with a space in between.
        """
        full_name = f"{self.first_name} {self.last_name}".strip()
        return full_name if full_name else self.email

    def __str__(self):
        return self.email


class UserActionLog(models.Model):
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    action = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.action} - {self.timestamp}"