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
        contact_products = CallGroupContact.objects.filter(call_group=obj).values_list('contact__contact', flat=True)
        contacts = Contact.objects.filter(pk__in=contact_products).distinct()
        return ContactSerializer(contacts, many=True).data

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep["institution"] = InstitutionSerializer(instance.institution).data
        return rep


class CallGroupAgentSerializer(serializers.ModelSerializer):
    call_group = serializers.PrimaryKeyRelatedField(queryset=CallGroup.objects.all())
    agent = serializers.PrimaryKeyRelatedField(queryset=Agent.objects.all())

    class Meta:
        model = CallGroupAgent
        fields = "__all__"
        read_only_fields = ["uuid"]

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep["call_group"] = CallGroupSerializer(instance.call_group).data
        rep["agent"] = AgentSerializer(instance.agent).data
        return rep
    

class ContactSerializer(serializers.ModelSerializer):
    product = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    institution = serializers.PrimaryKeyRelatedField(queryset=Institution.objects.all(), required=True)
    call_count = serializers.IntegerField(read_only=True)  # Add call_count field

    class Meta:
        model = Contact
        fields = ['uuid', 'name', 'phone_number', 'country', 'country_code', 'status', 'remarks', 'product', 'institution', 'call_count']
        read_only_fields = ['uuid', 'call_count']

    def validate_product(self, value):
        if value:
            try:
                product = Product.objects.get(uuid=value)
                return product
            except ObjectDoesNotExist:
                raise serializers.ValidationError("Invalid product UUID")
        return None

    def validate_phone_number(self, value):
        if not value.strip():
            raise serializers.ValidationError("Phone number is required")
        # Add regex or other validation if needed
        return value

    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Name is required")
        return value

    def validate(self, data):
        # Ensure either product or institution is provided
        if not data.get('product') and not data.get('institution'):
            raise serializers.ValidationError("Either 'product' or 'institution' must be provided.")
        return data

    def create(self, validated_data):
        # Extract product and institution from validated_data
        product = validated_data.pop('product', None)
        institution = validated_data.pop('institution', None)

        # If product is provided, use its institution (e.g., for bulk uploads)
        if product:
            institution = product.institution

        # Ensure institution is set (either from product or validated_data)
        if not institution:
            raise serializers.ValidationError("Institution is required")

        # Create contact with the institution
        contact = Contact.objects.create(institution=institution, **validated_data)

        # Create ContactProduct instance only if product is provided
        if product:
            ContactProduct.objects.create(
                contact=contact,
                product=product,
                created_by=self.context.get('request').user.profile if self.context.get('request').user.is_authenticated else None
            )
        return contact

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep["institution"] = InstitutionSerializer(instance.institution).data
        rep["call_groups"] = list(
            CallGroupContact.objects.filter(contact__contact=instance).values_list(
                "call_group__uuid", flat=True
            )
        )
        return rep
    
class BulkContactSerializer(serializers.ModelSerializer):
    product = serializers.UUIDField(write_only=True, required=True)

    class Meta:
        model = Contact
        fields = ['uuid', 'name', 'phone_number', 'country', 'country_code', 'status', 'remarks', 'product']
        read_only_fields = ['uuid']

    def validate_product(self, value):
        try:
            product = Product.objects.get(uuid=value)
            return product
        except ObjectDoesNotExist:
            raise serializers.ValidationError("Invalid product UUID")

    def validate_phone_number(self, value):
        if not value.strip():
            raise serializers.ValidationError("Phone number is required")
        # Add regex or other validation if needed
        return value

    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Name is required")
        return value

    def create(self, validated_data):
        product = validated_data.pop('product')
        institution = product.institution

        contact = Contact.objects.create(institution=institution, **validated_data)

        # Create ContactProduct instance
        ContactProduct.objects.create(
            contact=contact,
            product=product,
            created_by=self.context.get('request').user.profile if self.context.get('request').user.is_authenticated else None
        )
        return contact

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
    contact = serializers.PrimaryKeyRelatedField(queryset=ContactProduct.objects.all())

    class Meta:
        model = CallGroupContact
        fields = "__all__"
        read_only_fields = ["uuid"]

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep["call_group"] = CallGroupSerializer(instance.call_group).data
        rep["contact"] = ContactProductSerializer(instance.contact).data
        return rep


class CallSerializer(serializers.ModelSerializer):
    contact = serializers.PrimaryKeyRelatedField(queryset=ContactProduct.objects.all())

    class Meta:
        model = Call
        fields = "__all__"
        read_only_fields = ["uuid", "made_on", "made_by"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
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
        try:
            rep["contact"] = ContactProductSerializer(instance.contact).data
        except AttributeError:
            rep["contact"] = None
        if hasattr(self, "context") and "request" in self.context:
            request = self.context["request"]
            if request and hasattr(request, "FILES"):
                for field_name in request.FILES.keys():
                    rep.pop(field_name, None)
        return rep

    def validate(self, data):
        file_fields = self._get_file_fields_from_data(data)
        if file_fields:
            for field_name, file in file_fields.items():
                self._validate_file_field(data, field_name, file)
        return self._validate_feedback(data)

    def _get_file_fields_from_data(self, data):
        file_fields = {}
        contact = data.get("contact")
        if not contact and self.instance:
            contact = self.instance.contact
        if contact:
            product = contact.product
            feedback_fields = product.feedback_fields
            for field_config in feedback_fields:
                field_name = field_config.get("name")
                if field_config.get("type") == "file" and field_name in data:
                    file_fields[field_name] = data[field_name]
        return file_fields

    def _validate_file_field(self, data, field_name, file):
        if not file:
            return
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
        allowed_extensions = field_config.get("allowed_extensions", [])
        if allowed_extensions:
            file_extension = os.path.splitext(file.name)[1].lower().lstrip(".")
            if file_extension not in [ext.lower() for ext in allowed_extensions]:
                raise serializers.ValidationError(
                    f"File extension '{file_extension}' not allowed for '{field_name}'. Allowed: {allowed_extensions}"
                )
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
        for field_config in feedback_fields:
            field_name = field_config.get("name")
            is_required = field_config.get("is_required", False)
            field_type = field_config.get("type")
            if field_type == "file":
                continue
            if is_required and field_name not in feedback_data:
                raise serializers.ValidationError(
                    f"Required field '{field_name}' is missing"
                )
        for field_name, field_value in feedback_data.items():
            field_config = next(
                (f for f in feedback_fields if f.get("name") == field_name), None
            )
            if not field_config:
                raise serializers.ValidationError(f"Unknown field '{field_name}'")
            field_type = field_config.get("type")
            if (
                field_type == "file"
                and isinstance(field_value, dict)
                and "file_url" in field_value
            ):
                continue
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
            "\n\n Feedback data after validation in _validate_feedback method : ",
            feedback_data,
        )
        return data

    def create(self, validated_data):
        file_fields = self._extract_file_fields(validated_data)
        if "feedback" not in validated_data:
            validated_data["feedback"] = {}
        call = super().create(validated_data)
        if file_fields:
            self._handle_file_uploads(call, file_fields)
            call.refresh_from_db()
        return call

    def update(self, instance, validated_data):
        file_fields = self._extract_file_fields(validated_data)
        call = super().update(instance, validated_data)
        if file_fields:
            self._handle_file_uploads(call, file_fields)
            call.refresh_from_db()
        return call

    def _extract_file_fields(self, validated_data):
        file_fields = {}
        contact = validated_data.get("contact")
        if not contact and self.instance:
            contact = self.instance.contact
        if contact:
            product = contact.product
            feedback_fields = product.feedback_fields
            for field_config in feedback_fields:
                field_name = field_config.get("name")
                if field_config.get("type") == "file" and field_name in validated_data:
                    file_fields[field_name] = validated_data.pop(field_name)
        return file_fields

    def _handle_file_uploads(self, call, file_fields):
        print(
            "\n\n Handling file uploads for call : ",
            call.uuid,
            " with file fields : ",
            file_fields,
        )
        if call.feedback is None:
            call.feedback = {}
        for field_name, file in file_fields.items():
            self._handle_single_file_upload(call, field_name, file)
        call.save(update_fields=["feedback"])

    def _handle_single_file_upload(self, call, field_name, file):
        file_extension = os.path.splitext(file.name)[1]
        unique_filename = f"{uuid_lib.uuid4()}{file_extension}"
        file_path = f"uploads/calls/{call.uuid}/{field_name}/{unique_filename}"
        try:
            saved_path = default_storage.save(file_path, ContentFile(file.read()))
            if hasattr(default_storage, "url"):
                file_url = default_storage.url(saved_path)
            else:
                file_url = f"{settings.MEDIA_URL}{saved_path}"
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
