from django.db import models
import uuid
from django.utils import timezone


class CallGroup(models.Model):
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    institution = models.ForeignKey(
        "institution.Institution",
        related_name="call_groups",
        on_delete=models.CASCADE
    )
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        "users.CustomUser",
        related_name="created_call_groups",
        on_delete=models.PROTECT,
        null=True,
        blank=True
    )
    
    def __str__(self):
        return f"{self.name} - {self.institution.institution_name}"
    

class CallGroupUser(models.Model):
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    call_group = models.ForeignKey(
        CallGroup,
        related_name="users",
        on_delete=models.CASCADE
    )
    user = models.ForeignKey(
        "users.CustomUser",
        related_name="call_group_users",
        on_delete=models.CASCADE
    )
    status = models.CharField(
        max_length=20,
        choices=[
            ('active', 'Active'),
            ('disabled', 'Disabled')
        ],
        default='active'
    )
    
    class Meta:
        unique_together = ('call_group', 'user')
    
    def __str__(self):
        return f"{self.user.fullname} in {self.call_group.name}"    

class Contact(models.Model):
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(
        "institution.Product",
        related_name="contacts",
        on_delete=models.PROTECT
    )
    name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20)
    country = models.CharField(max_length=100, blank=True, null=True)
    country_code = models.CharField(max_length=10, blank=True, null=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ('new', 'New'),
            ('verified', 'Verified'),
            ('called', 'Called'),
            ('achieved', 'Achieved'),
            ('flagged', 'Flagged'),
        ],
        default='new'
    )
    
    def __str__(self):
        return f"{self.name} - {self.phone_number} ({self.product.name})"
    
class CallGroupContact(models.Model):
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    call_group = models.ForeignKey(
        CallGroup,
        related_name="contacts",
        on_delete=models.CASCADE
    )
    contact = models.ForeignKey(
        Contact,
        related_name="call_groups",
        on_delete=models.CASCADE
    )
    status = models.CharField(
        max_length=20,
        choices=[
            ('attended_to', 'Attended to'),
            ('not_attended', 'Not attended'),
            ('follow_up', 'Follow up'),
        ],
        default='new'
    )
    
    class Meta:
        unique_together = ('call_group', 'contact')
    
    def __str__(self):
        return f"{self.contact.name} in {self.call_group.name}"
    
    
class Call(models.Model):
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    contact = models.ForeignKey(
        Contact,
        related_name="calls",
        on_delete=models.PROTECT
    )
    feedback = models.JSONField(
        blank=True, 
        null=True,
        help_text="JSON object containing feedback responses based on product's feedback_fields"
    )
    status = models.CharField(
        max_length=20,
        choices=[
            ('failed', 'Failed'),
            ('completed', 'Completed'),
            ('busy', 'Busy')
        ],
        default='completed'
        )
    made_by = models.ForeignKey(
        "users.CustomUser",
        related_name="calls_made",
        on_delete=models.PROTECT,
        null=True,
        blank=True
    )
    made_on = models.DateTimeField(default=timezone.now)
    
    def __str__(self):
        return f"Call to {self.contact.name} - {self.status} (self.made_by.fullname)"
    
    