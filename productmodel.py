# products/models.py

from django.db import models
from brands.models import Brand
from suppliers.models import Supplier
from languages.models import Language
from images.models import Image
from categories.models import Category

# Stuk - Pak - Collie/Dos - Layer  - Pallet
UNIT_CHOICES = [
    ("piece", "Piece"),
    ("package", "Package"),
    ("box", "Box"),
    ("pallet_layer", "Pallet Layer"),
    ("pallet_full", "Pallet Full"),
]

# Levertijd
DELIVERY_CHOICES = [
    ("0", "Vandaag Besteld Morgen In Huis"),
    ("1", "3 / 5 Dagen"),
    ("2", "5 / 10 Dagen"),
    ("3", "Op Aanvragen"),
]


CHIP_CHOICES = [
    ("multi_pack", "Multi Pack"),  # Multipack
    ("deal", "Deal Pack"),  # Voordeelpac
]


class Tag(models.Model):
    name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.name


class Product(models.Model):
    # DIFFERENT VALUES WITHIN VARIANTS
    parent_product = models.ForeignKey(
        "self", on_delete=models.CASCADE, null=True, blank=True, related_name="variants"
    )
    # Titles and Descriptions
    title = models.TextField()
    title_long = models.TextField(blank=True)
    description = models.TextField()
    description_long = models.TextField(blank=True)
    images = models.ManyToManyField(Image, related_name="products", blank=True)
    # Price Information
    price_per_piece = models.DecimalField(max_digits=10, decimal_places=2)
    price_per_unit = models.DecimalField(
        max_digits=10, decimal_places=2
    )  # price_per_unit = price_per_piece * quantity_per_unit
    price_consumers = models.DecimalField(
        max_digits=10, decimal_places=2, blank=True, null=True
    )  # ConsumentenPrijs
    price_cost = models.DecimalField(
        max_digits=10, decimal_places=2, blank=True, null=True
    )  # inkoopprijs
    # Unit and Stock Information
    unit = models.CharField(max_length=255, choices=UNIT_CHOICES, blank=True)
    quantity_per_unit = models.IntegerField(default=0)  # Aantal per Verpakking
    quantity_total_content = models.IntegerField(default=0)  # inhoud
    max_order_allowed_per_unit = models.IntegerField(default=0)  # Max.Bestellen
    #  overall_stock = free_stock + ordered_in_progress_stock + work_in_progress_stock
    overall_stock = models.IntegerField(default=0)  # Huidege Voorraad
    free_stock = models.IntegerField(default=0)  # Vrije Voorraad
    ordered_in_progress_stock = models.IntegerField(default=0)
    work_in_progress_stock = models.IntegerField(default=0)
    stock_disable_when_sold_out = models.BooleanField(default=False)
    ean = models.CharField(max_length=255, blank=True)
    article_code = models.CharField(max_length=255, blank=True)
    # Delivery Information
    delivery_time = models.CharField(
        max_length=255, choices=DELIVERY_CHOICES, blank=True
    )
    location = models.CharField(max_length=255, blank=True)
    extra_location = models.CharField(max_length=255, blank=True)
    size_x_value = models.DecimalField(
        max_digits=10, decimal_places=2, blank=True, null=True
    )
    size_y_value = models.DecimalField(
        max_digits=10, decimal_places=2, blank=True, null=True
    )
    size_z_value = models.DecimalField(
        max_digits=10, decimal_places=2, blank=True, null=True
    )
    size_unit = models.CharField(max_length=255, blank=True)
    weight = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    weight_unit = models.CharField(max_length=255, blank=True)
    volume_value = models.DecimalField(
        max_digits=10, decimal_places=2, blank=True, null=True
    )
    volume_unit = models.CharField(max_length=255, blank=True)
    volume = models.CharField(max_length=255, blank=True)
    # Buying Limits
    buy_min = models.IntegerField(blank=True, null=True)
    buy_max = models.IntegerField(blank=True, null=True)

    # COMMON VALUES WITHIN VARIANTS

    # Basic Information
    important_information = models.TextField(blank=True)
    brand = models.ForeignKey(Brand, on_delete=models.CASCADE, null=True, blank=True)
    supplier = models.ForeignKey(
        Supplier, on_delete=models.CASCADE, null=True, blank=True
    )
    # Meta Information
    meta_title = models.CharField(max_length=255, blank=True)
    meta_description = models.TextField(blank=True)
    meta_keywords = models.CharField(max_length=255, blank=True)
    url = models.URLField(max_length=255, blank=True)
    # Additional Details
    is_used = models.BooleanField(default=False)  # new/used
    is_regular = models.BooleanField(default=True)  # Partij(party)/Regelmatig(regular)
    is_featured = models.BooleanField(default=False)
    is_visible_on_web = models.BooleanField(default=True)
    is_visible_on_mobile = models.BooleanField(default=True)
    is_only_for_export = models.BooleanField(default=False)
    is_only_for_B2B = models.BooleanField(
        default=False
    )  # Deze producten waner inlog dan pas klant zien?
    is_listed_on_marktplaats = models.BooleanField(default=False)
    is_listed_on_2dehands = models.BooleanField(default=False)
    categories = models.ManyToManyField(Category)
    vat = models.IntegerField(default=0)  # btw
    stock_alert = models.BooleanField(default=False)
    # Product Codes and Barcodes
    sku = models.CharField(max_length=255, blank=True)
    supplier_article_code = models.CharField(
        max_length=255, blank=True
    )  # Leverancier Artikelcode
    hs_code = models.CharField(max_length=255, blank=True)
    has_electronic_barcode = models.BooleanField(default=False)
    languages_on_item_package = models.ManyToManyField(Language, blank=True)
    # Packaging Information
    is_brief_box = models.BooleanField(
        default=False
    )  # brievenbus Max 1 kg-26,4x38x3,20 cm
    volume_value = models.DecimalField(
        max_digits=10, decimal_places=2, blank=True, null=True
    )
    volume_unit = models.CharField(max_length=255, blank=True)
    volume = models.CharField(max_length=255, blank=True)
    # Tags
    tags = models.ManyToManyField(Tag, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expiry_date = models.DateTimeField(blank=True, null=True)
    chip = models.CharField(max_length=255, choices=CHIP_CHOICES, blank=True)
    average_rating = models.DecimalField(
        max_digits=10, decimal_places=2, blank=True, null=True, default=0
    )

    def __str__(self):
        return self.title