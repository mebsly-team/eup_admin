from django.db import models
from images.models import Image


class Brand(models.Model):
    name = models.CharField(max_length=255, unique=True, verbose_name="name")
    description = models.TextField(blank=True, null=True, verbose_name="description")
    logo = models.ForeignKey(
        Image,
        blank=True,
        null=True,
        on_delete=models.SET_NULL,
        related_name="logos",
    )

    def __str__(self):
        return self.name