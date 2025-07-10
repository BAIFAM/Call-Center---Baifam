from django.utils import timezone
from rest_framework import serializers
from .models import CallGroup, Call, Contact, CallGroupUser, CallGroupContact
from institution.models import Institution, Product
from institution.serializers import InstitutionSerializer, ProductSerializer
from users.models import CustomUser
from users.serializers import CustomUserSerializer
from django.core.validators import validate_email
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings
import uuid as uuid_lib
import os


class CallGroupSerializer(serializers.ModelSerializer):
    institution = serializers.PrimaryKeyRelatedField(queryset=Institution.objects.all())

    class Meta:
        model = CallGroup
        fields = '__all__'
        read_only_fields = ['uuid', 'created_at', 'created_by']

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['institution'] = InstitutionSerializer(instance.institution).data
        return rep
    
class CallGroupUserSerializer(serializers.ModelSerializer):
    call_group = serializers.PrimaryKeyRelatedField(queryset=CallGroup.objects.all())
    user = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.all())

    class Meta:
        model = CallGroupUser
        fields = '__all__'
        read_only_fields = ['uuid']

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['call_group'] = CallGroupSerializer(instance.call_group).data
        rep['user'] = CustomUserSerializer(instance.user).data
        return rep 
    
class ContactSerializer(serializers.ModelSerializer):
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())

    class Meta:
        model = Contact
        fields = '__all__'
        read_only_fields = ['uuid']

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['product'] = ProductSerializer(instance.product).data
        return rep       
    
class CallGroupContactSerializer(serializers.ModelSerializer):
    call_group = serializers.PrimaryKeyRelatedField(queryset=CallGroup.objects.all())
    contact = serializers.PrimaryKeyRelatedField(queryset=Contact.objects.all())

    class Meta:
        model = CallGroupContact
        fields = '__all__'
        read_only_fields = ['uuid']

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['call_group'] = CallGroupSerializer(instance.call_group).data
        rep['contact'] = ContactSerializer(instance.contact).data
        return rep  
    
class CallSerializer(serializers.ModelSerializer):
    contact = serializers.PrimaryKeyRelatedField(queryset=Contact.objects.all())
    # Add these fields for file upload handling
    field_name = serializers.CharField(write_only=True, required=False)
    file = serializers.FileField(write_only=True, required=False)
    
    class Meta:
        model = Call
        fields = '__all__'
        read_only_fields = ['uuid', 'made_on', 'made_by']
        
    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['contact'] = ContactSerializer(instance.contact).data
        # Remove file upload fields from representation
        rep.pop('field_name', None)
        rep.pop('file', None)
        return rep
    
    def validate(self, data):
        
        # Check if this is a file upload request
        if 'field_name' in data and 'file' in data:
            return self._validate_file_upload(data)
        
        return self._validate_feedback(data)
    
    def _validate_file_upload(self, data):
        field_name = data.get('field_name')
        file = data.get('file')
        
        if not field_name or not file:
            raise serializers.ValidationError("Both field_name and file are required for file upload")
        
        # Get the product context
        call = self.instance
        if not call:
            contact = data.get('contact')
            if not contact:
                raise serializers.ValidationError("Contact is required for file upload")
            product = contact.product
        else:
            product = call.contact.product
            
        feedback_fields = product.feedback_fields
        field_config = next((f for f in feedback_fields if f.get('name') == field_name), None)
        
        if not field_config:
            raise serializers.ValidationError(f"Unknown field '{field_name}'")
        
        if field_config.get('type') != 'file':
            raise serializers.ValidationError(f"Field '{field_name}' is not a file field") 
        
        # Validate file extensions
        allowed_extensions = field_config.get('allowed_extensions', [])
        if allowed_extensions:
            file_extension = os.path.splitext(file.name)[1].lower().lstrip('.')
            if file_extension not in [ext.lower() for ext in allowed_extensions]:
                raise serializers.ValidationError(
                    f"File extension '{file_extension}' not allowed. Allowed: {allowed_extensions}"
                )
        
        # Validate file size
        max_file_size = field_config.get('max_file_size')
        if max_file_size:
            size_map = {'KB': 1024, 'MB': 1024*1024, 'GB': 1024*1024*1024}
            if max_file_size.endswith(tuple(size_map.keys())):
                unit = max_file_size[-2:]
                size = int(max_file_size[:-2])
                max_bytes = size * size_map[unit]
                
                if file.size > max_bytes:
                    raise serializers.ValidationError(
                        f"File size exceeds maximum allowed size of {max_file_size}"
                    )
        
        return data   
    
    def _validate_feedback(self, data):
        contact = data.get('contact')
        feedback_data = data.get('feedback', {})
        
        if not contact:
            # If updating existing call, get contact from instance
            if self.instance:
                contact = self.instance.contact
            else:
                raise serializers.ValidationError("Contact is required")
        
        product = contact.product
        feedback_fields = product.feedback_fields
        
        # Validate required fields
        for field_config in feedback_fields:
            field_name = field_config.get('name')
            is_required = field_config.get('is_required', False)
            
            if is_required and field_name not in feedback_data:
                raise serializers.ValidationError(f"Required field '{field_name}' is missing")
        
        # Validate field types and values
        for field_name, field_value in feedback_data.items():
            # Find the field configuration
            field_config = next((f for f in feedback_fields if f.get('name') == field_name), None)
            
            if not field_config:
                raise serializers.ValidationError(f"Unknown field '{field_name}'")
            
            field_type = field_config.get('type')
            
            # Skip validation for file fields when they contain URLs (already processed)
            if field_type == 'file' and isinstance(field_value, dict) and 'file_url' in field_value:
                continue
            
            # Validate based on field type
            if field_type == 'number':
                try:
                    num_value = float(field_value)
                    min_val = field_config.get('min_value')
                    max_val = field_config.get('max_value')
                    
                    if min_val is not None and num_value < min_val:
                        raise serializers.ValidationError(f"Field '{field_name}' must be at least {min_val}")
                    if max_val is not None and num_value > max_val:
                        raise serializers.ValidationError(f"Field '{field_name}' must be at most {max_val}")
                except (ValueError, TypeError):
                    raise serializers.ValidationError(f"Field '{field_name}' must be a valid number")
            
            elif field_type == 'email':
                try:
                    validate_email(field_value)
                except:
                    raise serializers.ValidationError(f"Field '{field_name}' must be a valid email")
            
            elif field_type in ['select', 'radio']:
                options = field_config.get('options', [])
                if field_value not in options:
                    raise serializers.ValidationError(f"Field '{field_name}' must be one of: {options}")
            
            elif field_type == 'checkbox':
                if not isinstance(field_value, list):
                    raise serializers.ValidationError(f"Field '{field_name}' must be a list")
                options = field_config.get('options', [])
                for value in field_value:
                    if value not in options:
                        raise serializers.ValidationError(f"Field '{field_name}' contains invalid option: {value}")
        
        return data
    
    def create(self, validated_data):
        
        # Remove file upload fields from validated_data if present
        field_name = validated_data.pop('field_name', None)
        file = validated_data.pop('file', None)
        
        
        # Initialize feedback if not provided
        if 'feedback' not in validated_data:
            validated_data['feedback'] = {}
        
        # Create the call instance
        call = super().create(validated_data)
        
        # Handle file upload if present
        if field_name and file:
            self._handle_file_upload(call, field_name, file)
            # Refresh the instance to get updated feedback
            call.refresh_from_db()
        
        return call
    
    def update(self, instance, validated_data):
        
        # Remove file upload fields from validated_data if present
        field_name = validated_data.pop('field_name', None)
        file = validated_data.pop('file', None)
        
        
        # Update the call instance
        call = super().update(instance, validated_data)
        
        # Handle file upload if present
        if field_name and file:
            self._handle_file_upload(call, field_name, file)
            # Refresh the instance to get updated feedback
            call.refresh_from_db()
        
        return call
    
    def _handle_file_upload(self, call, field_name, file):
        
        # Initialize feedback if it's None or empty
        if call.feedback is None:
            call.feedback = {}
        
        # Generate unique filename to avoid conflicts
        file_extension = os.path.splitext(file.name)[1]
        unique_filename = f"{uuid_lib.uuid4()}{file_extension}"
        
        # Create file path: uploads/calls/{call_uuid}/{field_name}/{unique_filename}
        file_path = f"uploads/calls/{call.uuid}/{field_name}/{unique_filename}"
        
        try:
            # Save file to storage
            saved_path = default_storage.save(file_path, ContentFile(file.read()))
            
            # Get file URL
            if hasattr(default_storage, 'url'):
                file_url = default_storage.url(saved_path)
            else:
                # Fallback for local storage
                file_url = f"{settings.MEDIA_URL}{saved_path}"
            
            # Update feedback with file information - storing URL as the main value
            call.feedback[field_name] = {
                'file_name': file.name,
                'file_url': file_url,
                'uploaded_at': timezone.now().isoformat()
            }
            
            
            # Make sure to save the call with updated feedback
            call.save(update_fields=['feedback'])
            
        except Exception as e:
            raise serializers.ValidationError(f"Error uploading file: {str(e)}")