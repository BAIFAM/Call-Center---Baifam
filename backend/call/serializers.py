from django.utils import timezone
from rest_framework import serializers
from .models import (
    Agent,
    CallGroup,
    Call,
    Contact,
    CallGroupAgent,
    CallGroupContact,
    ContactProduct,
)
from institution.models import Institution, Product
from institution.serializers import InstitutionSerializer, ProductSerializer
from users.models import CustomUser, Profile
from users.serializers import CustomUserSerializer, ProfileSerializer
from django.core.validators import validate_email
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings
import uuid as uuid_lib
import os


class CallGroupSerializer(serializers.ModelSerializer):
    institution = serializers.PrimaryKeyRelatedField(queryset=Institution.objects.all())
    contacts = serializers.SerializerMethodField()

    class Meta:
        model = CallGroup
        fields = "__all__"
        read_only_fields = ["uuid", "created_at", "created_by"]

    def get_contacts(self, obj):
        contacts = Contact.objects.filter(call_groups__call_group=obj).distinct()
        return ContactSerializer(contacts, many=True).data

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep["institution"] = InstitutionSerializer(instance.institution).data
        return rep


class CallGroupAgentSerializer(serializers.ModelSerializer):
    call_group = serializers.PrimaryKeyRelatedField(queryset=CallGroup.objects.all())
    user = serializers.PrimaryKeyRelatedField(queryset=Agent.objects.all())

    class Meta:
        model = CallGroupAgent
        fields = "__all__"
        read_only_fields = ["uuid"]

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep["call_group"] = CallGroupSerializer(instance.call_group).data
        rep["user"] = AgentSerializer(instance.user).data
        return rep


class ContactSerializer(serializers.ModelSerializer):
    institution = serializers.PrimaryKeyRelatedField(queryset=Institution.objects.all())

    class Meta:
        model = Contact
        fields = "__all__"
        read_only_fields = ["uuid"]

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep["institution"] = InstitutionSerializer(instance.institution).data
        rep["call_groups"] = list(
            CallGroupContact.objects.filter(contact__contact=instance).values_list(
                "call_group__uuid", flat=True
            )
        )
        return rep


class CallGroupContactSerializer(serializers.ModelSerializer):
    call_group = serializers.PrimaryKeyRelatedField(queryset=CallGroup.objects.all())
    contact = serializers.PrimaryKeyRelatedField(queryset=Contact.objects.all())

    class Meta:
        model = CallGroupContact
        fields = "__all__"
        read_only_fields = ["uuid"]

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep["call_group"] = CallGroupSerializer(instance.call_group).data
        rep["contact"] = ContactSerializer(instance.contact).data
        return rep


class CallSerializer(serializers.ModelSerializer):
    contact = serializers.PrimaryKeyRelatedField(queryset=Contact.objects.all())

    class Meta:
        model = Call
        fields = "__all__"
        read_only_fields = ["uuid", "made_on", "made_by"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Dynamically add file fields based on the request context
        if hasattr(self, "context") and "request" in self.context:
            request = self.context["request"]
            if request and hasattr(request, "FILES"):
                for field_name in request.FILES.keys():
                    if field_name not in self.fields:
                        self.fields[field_name] = serializers.FileField(
                            write_only=True, required=False
                        )

    def to_representation(self, instance):
        rep = super().to_representation(instance)

        rep["contact"] = ContactSerializer(instance.contact).data

        # Remove any dynamically added file fields from representation
        if hasattr(self, "context") and "request" in self.context:
            request = self.context["request"]
            if request and hasattr(request, "FILES"):
                for field_name in request.FILES.keys():
                    rep.pop(field_name, None)

        return rep

    def validate(self, data):

        # Check if this includes file uploads
        file_fields = self._get_file_fields_from_data(data)

        if file_fields:
            # Validate each file field
            for field_name, file in file_fields.items():
                self._validate_file_field(data, field_name, file)

        # Always validate feedback data
        return self._validate_feedback(data)

    def _get_file_fields_from_data(self, data):
        """Extract file fields from validated data"""
        file_fields = {}

        # Get contact to access product configuration
        contact = data.get("contact")
        if not contact and self.instance:
            contact = self.instance.contact

        if contact:
            product = contact.product
            feedback_fields = product.feedback_fields

            # Check for file fields in the data
            for field_config in feedback_fields:
                field_name = field_config.get("name")
                if field_config.get("type") == "file" and field_name in data:
                    file_fields[field_name] = data[field_name]

        return file_fields

    def _validate_file_field(self, data, field_name, file):
        """Validate a single file field"""

        if not file:
            return

        # Get the product context
        contact = data.get("contact")
        if not contact and self.instance:
            contact = self.instance.contact

        if not contact:
            raise serializers.ValidationError("Contact is required for file upload")

        product = contact.product
        feedback_fields = product.feedback_fields
        field_config = next(
            (f for f in feedback_fields if f.get("name") == field_name), None
        )

        if not field_config:
            raise serializers.ValidationError(f"Unknown field '{field_name}'")

        if field_config.get("type") != "file":
            raise serializers.ValidationError(
                f"Field '{field_name}' is not a file field"
            )

        # Validate file extensions
        allowed_extensions = field_config.get("allowed_extensions", [])
        if allowed_extensions:
            file_extension = os.path.splitext(file.name)[1].lower().lstrip(".")
            if file_extension not in [ext.lower() for ext in allowed_extensions]:
                raise serializers.ValidationError(
                    f"File extension '{file_extension}' not allowed for '{field_name}'. Allowed: {allowed_extensions}"
                )

        # Validate file size
        max_file_size = field_config.get("max_file_size")
        if max_file_size:
            size_map = {"KB": 1024, "MB": 1024 * 1024, "GB": 1024 * 1024 * 1024}
            if max_file_size.endswith(tuple(size_map.keys())):
                unit = max_file_size[-2:]
                size = int(max_file_size[:-2])
                max_bytes = size * size_map[unit]

                if file.size > max_bytes:
                    raise serializers.ValidationError(
                        f"File size exceeds maximum allowed size of {max_file_size} for '{field_name}'"
                    )

    def _validate_feedback(self, data):
        contact = data.get("contact")
        feedback_data = data.get("feedback", {})

        if not contact:
            if self.instance:
                contact = self.instance.contact
            else:
                raise serializers.ValidationError("Contact is required")

        product = contact.product
        feedback_fields = product.feedback_fields

        # Validate required fields
        for field_config in feedback_fields:
            field_name = field_config.get("name")
            is_required = field_config.get("is_required", False)
            field_type = field_config.get("type")

            # Skip file fields for required validation - they're handled separately
            if field_type == "file":
                continue

            if is_required and field_name not in feedback_data:
                raise serializers.ValidationError(
                    f"Required field '{field_name}' is missing"
                )

        # Validate field types and values
        for field_name, field_value in feedback_data.items():
            # Find the field configuration
            field_config = next(
                (f for f in feedback_fields if f.get("name") == field_name), None
            )

            if not field_config:
                raise serializers.ValidationError(f"Unknown field '{field_name}'")

            field_type = field_config.get("type")

            # Skip validation for file fields when they contain URLs (already processed)
            if (
                field_type == "file"
                and isinstance(field_value, dict)
                and "file_url" in field_value
            ):
                continue

            # Validate based on field type
            if field_type == "number":
                try:
                    num_value = float(field_value)
                    min_val = field_config.get("min_value")
                    max_val = field_config.get("max_value")

                    if min_val is not None and num_value < min_val:
                        raise serializers.ValidationError(
                            f"Field '{field_name}' must be at least {min_val}"
                        )
                    if max_val is not None and num_value > max_val:
                        raise serializers.ValidationError(
                            f"Field '{field_name}' must be at most {max_val}"
                        )
                except (ValueError, TypeError):
                    raise serializers.ValidationError(
                        f"Field '{field_name}' must be a valid number"
                    )

            elif field_type == "email":
                try:
                    validate_email(field_value)
                except:
                    raise serializers.ValidationError(
                        f"Field '{field_name}' must be a valid email"
                    )

            elif field_type in ["select", "radio"]:
                options = field_config.get("options", [])
                if field_value not in options:
                    raise serializers.ValidationError(
                        f"Field '{field_name}' must be one of: {options}"
                    )

            elif field_type == "checkbox":
                if not isinstance(field_value, list):
                    raise serializers.ValidationError(
                        f"Field '{field_name}' must be a list"
                    )
                options = field_config.get("options", [])
                for value in field_value:
                    if value not in options:
                        raise serializers.ValidationError(
                            f"Field '{field_name}' contains invalid option: {value}"
                        )

        print(
            "\n\n Feedback data after validation in _validate_feedback method :  ",
            feedback_data,
        )
        return data

    def create(self, validated_data):

        # Extract file fields from validated_data
        file_fields = self._extract_file_fields(validated_data)

        # Initialize feedback if not provided
        if "feedback" not in validated_data:
            validated_data["feedback"] = {}

        call = super().create(validated_data)

        # Handle file uploads if present
        if file_fields:
            self._handle_file_uploads(call, file_fields)
            # Refresh the instance to get updated feedback
            call.refresh_from_db()

        return call

    def update(self, instance, validated_data):

        # Extract file fields from validated_data
        file_fields = self._extract_file_fields(validated_data)

        # Update the call instance
        call = super().update(instance, validated_data)

        # Handle file uploads if present
        if file_fields:
            self._handle_file_uploads(call, file_fields)
            # Refresh the instance to get updated feedback
            call.refresh_from_db()

        return call

    def _extract_file_fields(self, validated_data):
        """Extract and remove file fields from validated_data"""
        file_fields = {}

        # Get contact to access product configuration
        contact = validated_data.get("contact")
        if not contact and self.instance:
            contact = self.instance.contact

        if contact:
            product = contact.product
            feedback_fields = product.feedback_fields

            # Find file fields in validated_data
            for field_config in feedback_fields:
                field_name = field_config.get("name")
                if field_config.get("type") == "file" and field_name in validated_data:
                    file_fields[field_name] = validated_data.pop(field_name)

        return file_fields

    def _handle_file_uploads(self, call, file_fields):
        """Handle multiple file uploads"""

        print(
            "\n\n Handling file uploads for call : ",
            call.uuid,
            " with file fields : ",
            file_fields,
        )

        # Initialize feedback if it's None or empty
        if call.feedback is None:
            call.feedback = {}

        for field_name, file in file_fields.items():
            self._handle_single_file_upload(call, field_name, file)

        # Save the call with all updated feedback
        call.save(update_fields=["feedback"])

    def _handle_single_file_upload(self, call, field_name, file):
        """Handle a single file upload"""

        # Generate unique filename to avoid conflicts
        file_extension = os.path.splitext(file.name)[1]
        unique_filename = f"{uuid_lib.uuid4()}{file_extension}"

        # Create file path: uploads/calls/{call_uuid}/{field_name}/{unique_filename}
        file_path = f"uploads/calls/{call.uuid}/{field_name}/{unique_filename}"

        try:
            # Save file to storage
            saved_path = default_storage.save(file_path, ContentFile(file.read()))

            # Get file URL
            if hasattr(default_storage, "url"):
                file_url = default_storage.url(saved_path)
            else:
                # Fallback for local storage
                file_url = f"{settings.MEDIA_URL}{saved_path}"

            # Update feedback with file information
            call.feedback[field_name] = {
                "file_name": file.name,
                "file_url": file_url,
                "uploaded_at": timezone.now().isoformat(),
            }

        except Exception as e:
            raise serializers.ValidationError(
                f"Error uploading file for '{field_name}': {str(e)}"
            )


class ContactProductSerializer(serializers.ModelSerializer):
    contact = serializers.PrimaryKeyRelatedField(queryset=Contact.objects.all())
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())
    created_by = serializers.PrimaryKeyRelatedField(
        queryset=Profile.objects.all(), allow_null=True, required=False
    )

    class Meta:
        model = ContactProduct
        fields = "__all__"
        read_only_fields = ["id", "uuid", "created_at"]

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep["contact"] = ContactSerializer(instance.contact).data
        rep["product"] = ProductSerializer(instance.product).data
        rep["created_by"] = (
            ProfileSerializer(instance.created_by).data if instance.created_by else None
        )
        return rep

    def validate(self, attrs):
        contact = attrs.get("contact")
        product = attrs.get("product")
        if contact and product:
            # Assuming Contact has a ForeignKey to Profile or Institution
            contact_institution = getattr(contact.user, "institution", None)
            if contact_institution and contact_institution != product.institution:
                raise serializers.ValidationError(
                    "Contact and Product must belong to the same institution."
                )
        return attrs


class AgentSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset=Profile.objects.all())

    class Meta:
        model = Agent
        fields = "__all__"
        read_only_fields = ["id", "uuid"]

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep["user"] = ProfileSerializer(instance.user).data
        return rep

    def validate(self, attrs):
        user = attrs.get("user")
        if user:
            institution_id = (
                self.context.get("view", {}).get("kwargs", {}).get("institution_id")
            )
            if institution_id and str(user.institution_id) != str(institution_id):
                raise serializers.ValidationError(
                    "Agent's Profile must belong to the specified institution."
                )
        return attrs
