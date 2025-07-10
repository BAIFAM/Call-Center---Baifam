
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse
from django.shortcuts import get_object_or_404
from .models import CallGroup, CallGroupContact, CallGroupUser, Contact, Call
from institution.models import Institution, Product
from .serializers import CallGroupContactSerializer, CallGroupSerializer, CallGroupUserSerializer, CallSerializer, ContactSerializer
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
import pandas as pd
from django.http import HttpResponse
import io
import uuid as uuid_module


@extend_schema(tags=["CallGroup"])
class CallGroupListCreateView(APIView):

    @extend_schema(
        summary="List all call groups for a specific institution",
        parameters=[
            OpenApiParameter(name="institution_id", required=True, type=int, location=OpenApiParameter.PATH),
        ],
        responses={200: CallGroupSerializer(many=True)}
    )
    def get(self, request, institution_id):
        institution = get_object_or_404(Institution, id=institution_id)
        groups = CallGroup.objects.filter(institution=institution)
        serializer = CallGroupSerializer(groups, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        summary="Create a new call group for an institution",
        request=CallGroupSerializer,
        responses={201: CallGroupSerializer}
    )
    def post(self, request, institution_id):
        institution = get_object_or_404(Institution, id=institution_id)
        data = request.data.copy()
        data['institution'] = str(institution.id)
        serializer = CallGroupSerializer(data=data)
        if serializer.is_valid():
            serializer.save(created_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(tags=["CallGroup"])
class CallGroupDetailView(APIView):

    def get_object(self, uuid):
        return get_object_or_404(CallGroup, uuid=uuid)

    @extend_schema(
        summary="Retrieve a call group by UUID",
        responses={200: CallGroupSerializer}
    )
    def get(self, request, uuid):
        group = self.get_object(uuid)
        serializer = CallGroupSerializer(group)
        return Response(serializer.data)

    @extend_schema(
        summary="Partially update a call group by UUID",
        request=CallGroupSerializer,
        responses={200: CallGroupSerializer}
    )
    def patch(self, request, uuid):
        group = self.get_object(uuid)
        serializer = CallGroupSerializer(group, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        summary="Delete a call group by UUID",
        responses={204: OpenApiResponse(description="Deleted successfully")}
    )
    def delete(self, request, uuid):
        group = self.get_object(uuid)
        group.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
@extend_schema(tags=["CallGroupUser"])
class CallGroupUserListCreateView(APIView):

    @extend_schema(
        summary="List users assigned to call groups of a specific institution",
        parameters=[
            OpenApiParameter(name="institution_id", required=True, type=int, location=OpenApiParameter.PATH),
        ],
        responses={200: CallGroupUserSerializer(many=True)}
    )
    def get(self, request, institution_id):
        institution = get_object_or_404(Institution, id=institution_id)
        users = CallGroupUser.objects.filter(call_group__institution=institution)
        serializer = CallGroupUserSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        summary="Assign a user to a call group (within specified institution)",
        request=CallGroupUserSerializer,
        responses={201: CallGroupUserSerializer}
    )
    def post(self, request, institution_id):
        institution = get_object_or_404(Institution, id=institution_id)
        data = request.data.copy()

        call_group_uuid = data.get('call_group')
        call_group = get_object_or_404(CallGroup, uuid=call_group_uuid, institution=institution)

        serializer = CallGroupUserSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(tags=["CallGroupUser"])
class CallGroupUserDetailView(APIView):

    def get_object(self, uuid):
        return get_object_or_404(CallGroupUser, uuid=uuid)

    @extend_schema(
        summary="Retrieve a CallGroupUser by UUID",
        responses={200: CallGroupUserSerializer}
    )
    def get(self, request, uuid):
        item = self.get_object(uuid)
        serializer = CallGroupUserSerializer(item)
        return Response(serializer.data)

    @extend_schema(
        summary="Partially update a CallGroupUser by UUID",
        request=CallGroupUserSerializer,
        responses={200: CallGroupUserSerializer}
    )
    def patch(self, request, uuid):
        item = self.get_object(uuid)
        serializer = CallGroupUserSerializer(item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        summary="Delete a CallGroupUser by UUID",
        responses={204: OpenApiResponse(description="Deleted successfully")}
    )
    def delete(self, request, uuid):
        item = self.get_object(uuid)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)    


@extend_schema(tags=["Contact"])
class ContactListCreateView(APIView):

    @extend_schema(
        summary="Download Excel template for bulk contact creation",
        parameters=[
            OpenApiParameter(name="institution_id", required=True, type=int, location=OpenApiParameter.PATH),
        ],
        responses={200: OpenApiResponse(description="Excel template file")}
    )
    def get(self, request, institution_id):
        # Check if template download is requested
        if request.GET.get('template') == 'true':
            return self.download_template(request, institution_id)
        
        # Existing list functionality
        institution = get_object_or_404(Institution, id=institution_id)
        contacts = Contact.objects.filter(product__institution=institution)
        serializer = ContactSerializer(contacts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def download_template(self, request, institution_id):
        """Generate and return Excel template for bulk contact upload"""
        institution = get_object_or_404(Institution, id=institution_id)
        
        # Get products for this institution
        products = Product.objects.filter(institution=institution)
        
        # Create template data
        template_data = {
            'name': ['John Doe', 'Jane Smith'],  # Example data
            'phone_number': ['+1234567890', '+0987654321'],
            'country': ['USA', 'UK'],
            'country_code': ['+1', '+44'],
            'product_name': [products.first().name if products.exists() else '', ''],
            'status': ['new', 'new']
        }
        
        # Create DataFrame
        df = pd.DataFrame(template_data)
        
        # Create Excel file in memory
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
            # Main template sheet
            df.to_excel(writer, sheet_name='Contacts', index=False)
            
            # Products reference sheet
            products_df = pd.DataFrame({
                'product_name': [p.name for p in products],
                'product_description': [getattr(p, 'description', '') for p in products]
            })
            products_df.to_excel(writer, sheet_name='Available_Products', index=False)
            
            # Instructions sheet
            instructions_df = pd.DataFrame({
                'Field': ['name', 'phone_number', 'country', 'country_code', 'product_name', 'status'],
                'Description': [
                    'Full name of the contact (required)',
                    'Phone number with country code (required)',
                    'Country name (optional)',
                    'Country calling code (optional)',
                    'Product name from Available_Products sheet (required)',
                    'Status: new, verified, called, achieved, or flagged (defaults to new)'
                ],
                'Required': ['Yes', 'Yes', 'No', 'No', 'Yes', 'No']
            })
            instructions_df.to_excel(writer, sheet_name='Instructions', index=False)
        
        output.seek(0)
        
        # Create response
        response = HttpResponse(
            output.read(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = f'attachment; filename="contacts_template_{institution_id}.xlsx"'
        return response

    @extend_schema(
        summary="Create a new contact for a product under an institution",
        request=ContactSerializer,
        responses={201: ContactSerializer}
    )
    def post(self, request, institution_id):
        institution = get_object_or_404(Institution, id=institution_id)
        data = request.data.copy()

        product_uuid = data.get("product")
        product = get_object_or_404(Product, uuid=product_uuid, institution=institution)

        serializer = ContactSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@extend_schema(tags=["Contact"])
class ContactBulkUploadView(APIView):
    parser_classes = [MultiPartParser]

    @extend_schema(
        summary="Bulk upload contacts from Excel file",
        parameters=[
            OpenApiParameter(name="institution_id", required=True, type=int, location=OpenApiParameter.PATH),
        ],
        request={
            'multipart/form-data': {
                'type': 'object',
                'properties': {
                    'file': {
                        'type': 'string',
                        'format': 'binary',
                        'description': 'Excel file with contact data'
                    }
                }
            }
        },
        responses={
            201: OpenApiResponse(description="Contacts created successfully"),
            400: OpenApiResponse(description="Validation errors")
        }
    )
    def post(self, request, institution_id):
        institution = get_object_or_404(Institution, id=institution_id)
        
        if 'file' not in request.FILES:
            return Response(
                {'error': 'No file provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        file = request.FILES['file']
        
        # Validate file type
        if not file.name.endswith(('.xlsx', '.xls')):
            return Response(
                {'error': 'Invalid file type. Please upload an Excel file (.xlsx or .xls)'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Read Excel file
            df = pd.read_excel(file, sheet_name='Contacts')
            
            # Validate required columns
            required_columns = ['name', 'phone_number', 'product_name']
            missing_columns = [col for col in required_columns if col not in df.columns]
            if missing_columns:
                return Response(
                    {'error': f'Missing required columns: {", ".join(missing_columns)}'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create a mapping of product names to products for this institution
            products = Product.objects.filter(institution=institution)
            product_name_to_product = {p.name: p for p in products}
            
            # Process each row
            created_contacts = []
            errors = []
            
            for index, row in df.iterrows():
                try:
                    # Validate product exists by name and belongs to institution
                    product_name = str(row['product_name']).strip()
                    if not product_name or product_name.lower() == 'nan':
                        errors.append(f'Row {index + 2}: Product name is required')
                        continue
                        
                    product = product_name_to_product.get(product_name)
                    if not product:
                        available_products = ', '.join(product_name_to_product.keys())
                        errors.append(f'Row {index + 2}: Product "{product_name}" not found. Available products: {available_products}')
                        continue
                    
                    # Prepare contact data
                    contact_data = {
                        'name': row['name'],
                        'phone_number': row['phone_number'],
                        'product': product.pk,
                        'country': row.get('country', ''),
                        'country_code': row.get('country_code', ''),
                        'status': row.get('status', 'new')
                    }
                    
                    # Validate status
                    valid_statuses = ['new', 'verified', 'called', 'achieved', 'flagged']
                    if contact_data['status'] not in valid_statuses:
                        contact_data['status'] = 'new'
                    
                    # Create contact using serializer
                    serializer = ContactSerializer(data=contact_data)
                    if serializer.is_valid():
                        contact = serializer.save()
                        created_contacts.append({
                            'uuid': str(contact.uuid),
                            'name': contact.name,
                            'phone_number': contact.phone_number
                        })
                    else:
                        errors.append(f'Row {index + 2}: {serializer.errors}')
                        
                except Exception as e:
                    errors.append(f'Row {index + 2}: {str(e)}')
            
            # Prepare response
            response_data = {
                'created_count': len(created_contacts),
                'error_count': len(errors),
                'created_contacts': created_contacts
            }
            
            if errors:
                response_data['errors'] = errors
            
            response_status = status.HTTP_201_CREATED if created_contacts else status.HTTP_400_BAD_REQUEST
            return Response(response_data, status=response_status)
            
        except Exception as e:
            return Response(
                {'error': f'Error processing file: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

@extend_schema(tags=["Contact"])
class ContactDetailView(APIView):

    def get_object(self, uuid):
        return get_object_or_404(Contact, uuid=uuid)

    @extend_schema(
        summary="Retrieve a contact by UUID",
        responses={200: ContactSerializer}
    )
    def get(self, request, uuid):
        contact = self.get_object(uuid)
        serializer = ContactSerializer(contact)
        return Response(serializer.data)

    @extend_schema(
        summary="Partially update a contact by UUID",
        request=ContactSerializer,
        responses={200: ContactSerializer}
    )
    def patch(self, request, uuid):
        contact = self.get_object(uuid)
        serializer = ContactSerializer(contact, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        summary="Delete a contact by UUID",
        responses={204: OpenApiResponse(description="Deleted successfully")}
    )
    def delete(self, request, uuid):
        contact = self.get_object(uuid)
        contact.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    
@extend_schema(tags=["CallGroupContact"])
class CallGroupContactListCreateView(APIView):

    @extend_schema(
        summary="List contacts assigned to call groups of a specific institution",
        parameters=[
            OpenApiParameter(name="institution_id", required=True, type=int, location=OpenApiParameter.PATH),
        ],
        responses={200: CallGroupContactSerializer(many=True)}
    )
    def get(self, request, institution_id):
        institution = get_object_or_404(Institution, id=institution_id)
        contacts = CallGroupContact.objects.filter(call_group__institution=institution)
        serializer = CallGroupContactSerializer(contacts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        summary="Assign a contact to a call group (within specified institution)",
        request=CallGroupContactSerializer,
        responses={201: CallGroupContactSerializer}
    )
    def post(self, request, institution_id):
        institution = get_object_or_404(Institution, id=institution_id)
        data = request.data.copy()

        # Validate that the selected call_group belongs to the institution
        call_group_uuid = data.get('call_group')
        call_group = get_object_or_404(CallGroup, uuid=call_group_uuid, institution=institution)

        serializer = CallGroupContactSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(tags=["CallGroupContact"])
class CallGroupContactDetailView(APIView):

    def get_object(self, uuid):
        return get_object_or_404(CallGroupContact, uuid=uuid)

    @extend_schema(
        summary="Retrieve a CallGroupContact by UUID",
        responses={200: CallGroupContactSerializer}
    )
    def get(self, request, uuid):
        item = self.get_object(uuid)
        serializer = CallGroupContactSerializer(item)
        return Response(serializer.data)

    @extend_schema(
        summary="Partially update a CallGroupContact by UUID",
        request=CallGroupContactSerializer,
        responses={200: CallGroupContactSerializer}
    )
    def patch(self, request, uuid):
        item = self.get_object(uuid)
        serializer = CallGroupContactSerializer(item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        summary="Delete a CallGroupContact by UUID",
        responses={204: OpenApiResponse(description="Deleted successfully")}
    )
    def delete(self, request, uuid):
        item = self.get_object(uuid)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT) 
    
@extend_schema(tags=['Calls'])
class CallListCreateAPIView(APIView):
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    @extend_schema(
        summary='List all calls for a specific institution',
        parameters=[
            OpenApiParameter(name='institution_id', type=int, location=OpenApiParameter.PATH)
        ],
        responses={200: CallSerializer(many=True)}
    )
    def get(self, request, institution_id):
        calls = Call.objects.filter(contact__product__institution__id=institution_id)
        serializer = CallSerializer(calls, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        summary='Create a new call under an institution',
        request=CallSerializer,
        responses={201: CallSerializer}
    )
    def post(self, request, institution_id):
        
        contact_uuid = request.data.get('contact')
        if not contact_uuid:
            return Response({"detail": "Contact UUID is required."}, status=status.HTTP_400_BAD_REQUEST)

        contact = get_object_or_404(Contact, uuid=contact_uuid)

        # Ensure contact's product belongs to the specified institution
        if contact.product.institution.id != institution_id:
            return Response(
                {'detail': 'Contact does not belong to this institution.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create a mutable copy of the data
        data = request.data.copy()
        
        # Debug: Check if file is in request.FILES
        if 'file' in request.FILES:
            data['file'] = request.FILES['file']
        
        
        serializer = CallSerializer(data=data)
        if serializer.is_valid():
            call = serializer.save(made_by=request.user)
            return Response(CallSerializer(call).data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
@extend_schema(tags=['Calls'])
class CallDetailAPIView(APIView):

    def get_object(self, uuid):
        return get_object_or_404(Call, uuid=uuid)

    @extend_schema(
        summary='Retrieve a call by UUID',
        responses={200: CallSerializer}
    )
    def get(self, request, uuid):
        call = self.get_object(uuid)
        serializer = CallSerializer(call)
        return Response(serializer.data)

    @extend_schema(
        summary='Partially update a call',
        request=CallSerializer,
        responses={200: CallSerializer}
    )
    def patch(self, request, uuid):
        call = self.get_object(uuid)
        serializer = CallSerializer(call, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        summary='Delete a call',
        responses={204: OpenApiResponse(description='Deleted successfully')}
    )
    def delete(self, request, uuid):
        call = self.get_object(uuid)
        call.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    