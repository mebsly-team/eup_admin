# categories/models.py

from django.db import models
from images.models import Image


class Category(models.Model):
    name = models.CharField(max_length=255, unique=True)
    parent_category = models.ForeignKey(
        "self", null=True, blank=True, on_delete=models.CASCADE
    )
    image = models.ForeignKey(
        Image,
        blank=True,
        null=True,
        on_delete=models.SET_NULL,
        related_name="categories",
    )

    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0)

    class Meta:
        verbose_name_plural = "categories"

    def __str__(self):
        return self.name