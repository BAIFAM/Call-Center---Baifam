# Generated by Django 5.1.7 on 2025-07-24 06:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('institution', '0007_clientcompanyproduct'),
    ]

    operations = [
        migrations.AlterField(
            model_name='clientcompany',
            name='api_key',
            field=models.CharField(blank=True, max_length=255, null=True, unique=True),
        ),
    ]
