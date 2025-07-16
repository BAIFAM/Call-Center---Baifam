
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
import logging

logger = logging.getLogger(__name__)
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
    # Keep existing GET and POST methods unchanged
    @extend_schema(
        summary="List contacts for products under a specific institution",
        parameters=[
            OpenApiParameter(name="institution_id", required=True, type=int, location=OpenApiParameter.PATH),
        ],
        responses={200: ContactSerializer(many=True)}
    )
    def get(self, request, institution_id):
        institution = get_object_or_404(Institution, id=institution_id)
        contacts = Contact.objects.filter(product__institution=institution)
        serializer = ContactSerializer(contacts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

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
class ContactTemplateDownloadView(APIView):
    @extend_schema(
        summary="Download Excel template for bulk contact creation",
        parameters=[
            OpenApiParameter(name="product_uuid", required=True, type=str, location=OpenApiParameter.PATH),
        ],
        responses={200: OpenApiResponse(description="Excel template file")}
    )
    def get(self, request, product_uuid):
        product = get_object_or_404(Product, uuid=product_uuid)
        
        try:
            print("\n\nTemplate generation started ...")
            # Create template with empty rows and wider columns
            template_data = {
                'name': [''] * 10,  # 10 empty rows
                'phone_number': [''] * 10,
                'country': [''] * 10,
                'country_code': [''] * 10,
            }
            
            # Create Excel file in memory
            output = io.BytesIO()
            print("\n\nCreating excel file in memory ...")
            
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                # Main template sheet
                df = pd.DataFrame(template_data)
                df.to_excel(writer, sheet_name='Contacts', index=False)
                
                # Get the workbook and worksheet objects
                workbook = writer.book
                worksheet = writer.sheets['Contacts']
                
                # Set column widths (make them bigger)
                column_widths = {
                    'A': 25,  # name
                    'B': 20,  # phone_number
                    'C': 15,  # country
                    'D': 15,  # country_code
                    'E': 12,  # status
                }

                
                for col, width in column_widths.items():
                    worksheet.column_dimensions[col].width = width
                
                # Add some formatting to headers
                from openpyxl.styles import Font, PatternFill, Alignment
                
                # Header styling
                header_font = Font(bold=True, color="FFFFFF")
                header_fill = PatternFill(start_color="366092", end_color="366092", fill_type="solid")
                center_alignment = Alignment(horizontal="center", vertical="center")
                
                # Apply styling to header row
                for col in range(1, len(df.columns) + 1):
                    cell = worksheet.cell(row=1, column=col)
                    cell.font = header_font
                    cell.fill = header_fill
                    cell.alignment = center_alignment
                
                # Instructions sheet
                instructions_df = pd.DataFrame({
                    'Field': ['name', 'phone_number', 'country', 'country_code', 'status'],
                    'Description': [
                        'Full name of the contact (required)',
                        'Phone number with country code (required)',
                        'Country name (optional)',
                        'Country calling code (optional)',
                        'Contact status (optional)'
                    ],
                    'Required': ['Yes', 'Yes', 'No', 'No', 'No'],
                    'Examples': [
                        'John Doe, Jane Smith',
                        '+1234567890, +256701234567',
                        'Uganda, USA, UK',
                        '+256, +1, +44',
                        'Active, Inactive'
                    ]
                })
                instructions_df.to_excel(writer, sheet_name='Instructions', index=False)
                
                # Style instructions sheet
                instructions_sheet = writer.sheets['Instructions']
                for col in ['A', 'B', 'C', 'D']:
                    instructions_sheet.column_dimensions[col].width = 25
                
                # Apply header styling to instructions
                for col in range(1, len(instructions_df.columns) + 1):
                    cell = instructions_sheet.cell(row=1, column=col)
                    cell.font = header_font
                    cell.fill = header_fill
                    cell.alignment = center_alignment
                
                # Product Info sheet
                product_info_df = pd.DataFrame({
                    'Product Information': [
                        'Selected Product:',
                        'Product Name:',
                        'Institution:',
                        'Upload Instructions:',
                        '',
                        '1. Fill in the contact details in the "Contacts" sheet',
                        '2. Save the file',
                        '3. Upload using the bulk upload feature',
                        '4. All contacts will be automatically assigned to the selected product'
                    ],
                    'Details': [
                        '',
                        product.name,
                        product.institution.institution_name,
                        '',
                        '',
                        '',
                        '',
                        '',
                        ''
                    ]
                })
                product_info_df.to_excel(writer, sheet_name='Product_Info', index=False)
                
                # Style product info sheet
                product_info_sheet = writer.sheets['Product_Info']
                product_info_sheet.column_dimensions['A'].width = 30
                product_info_sheet.column_dimensions['B'].width = 30
                
                # Apply header styling to product info
                for col in range(1, len(product_info_df.columns) + 1):
                    cell = product_info_sheet.cell(row=1, column=col)
                    cell.font = header_font
                    cell.fill = header_fill
                    cell.alignment = center_alignment
            
            output.seek(0)
            
            # Create response
            response = HttpResponse(
                output.read(),
                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
            response['Content-Disposition'] = f'attachment; filename="contacts_template_{product.name.replace(" ", "_")}.xlsx"'
            return response
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@extend_schema(tags=["Contact"])
class ContactBulkUploadView(APIView):
    parser_classes = [MultiPartParser]

    @extend_schema(
        summary="Bulk upload contacts for a specific product",
        parameters=[
            OpenApiParameter(name="product_uuid", required=True, type=str, location=OpenApiParameter.PATH),
        ],
        request={
            'multipart/form-data': {
                'type': 'object',
                'properties': {
                    'file': {
                        'type': 'string',
                        'format': 'binary',
                        'description': 'CSV or Excel file with contact data'
                    }
                }
            }
        },
        responses={
            201: OpenApiResponse(description="Contacts created successfully"),
            400: OpenApiResponse(description="Validation errors")
        }
    )
    def post(self, request, product_uuid):
        product = get_object_or_404(Product, uuid=product_uuid)
        
        if 'file' not in request.FILES:
            return Response(
                {'error': 'No file provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        file = request.FILES['file']
        
        # Validate file type
        if not file.name.endswith(('.xlsx', '.xls', '.csv')):
            return Response(
                {'error': 'Invalid file type. Please upload a CSV or Excel file (.csv, .xlsx, .xls)'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Read file based on extension
            if file.name.endswith('.csv'):
                df = pd.read_csv(file)
                # Remove comment lines
                df = df[~df.iloc[:, 0].astype(str).str.startswith('#')]
            else:
                df = pd.read_excel(file, sheet_name='Contacts')
            
            # Remove empty rows
            df = df.dropna(how='all')
            
            # Validate required columns
            required_columns = ['name', 'phone_number']
            missing_columns = [col for col in required_columns if col not in df.columns]
            if missing_columns:
                return Response(
                    {'error': f'Missing required columns: {", ".join(missing_columns)}'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Process each row
            created_contacts = []
            errors = []
            
            for index, row in df.iterrows():
                try:
                    # Skip if name is empty
                    if pd.isna(row['name']) or str(row['name']).strip() == '':
                        continue
                    
                    # Skip if phone_number is empty
                    if pd.isna(row['phone_number']) or str(row['phone_number']).strip() == '':
                        errors.append(f'Row {index + 2}: Phone number is required')
                        continue
                    
                    # Prepare contact data (product is pre-selected)
                    contact_data = {
                        'name': str(row['name']).strip(),
                        'phone_number': str(row['phone_number']).strip(),
                        'product': product.pk,  # Use the pre-selected product
                        'country': str(row.get('country', '')).strip() if pd.notna(row.get('country')) else '',
                        'country_code': str(row.get('country_code', '')).strip() if pd.notna(row.get('country_code')) else '',
                    }
                    
                    
                    # Create contact using serializer
                    serializer = ContactSerializer(data=contact_data)
                    if serializer.is_valid():
                        contact = serializer.save()
                        created_contacts.append({
                            'uuid': str(contact.uuid),
                            'name': contact.name,
                            'phone_number': contact.phone_number,
                            'product_name': contact.product.name
                        })
                    else:
                        errors.append(f'Row {index + 2}: {serializer.errors}')
                        
                except Exception as e:
                    errors.append(f'Row {index + 2}: {str(e)}')
            
            # Prepare response
            response_data = {
                'created_count': len(created_contacts),
                'error_count': len(errors),
                'product_name': product.name,
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
class ContactsByCallGroupContactListCreateView(APIView):
    @extend_schema(
        summary="List contacts assigned to a specific call group",
        parameters=[
            OpenApiParameter(name="call_group_uuid", required=True, type=int, location=OpenApiParameter.PATH),
        ],
        responses={200: CallGroupContactSerializer(many=True)}
    )
    def get(self, request, call_group_uuid):
        group = get_object_or_404(CallGroup, uuid=call_group_uuid)
        contacts = CallGroupContact.objects.filter(call_group=group)
        serializer = CallGroupContactSerializer(contacts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    


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
        
        # Add all files from request.FILES to data
        for field_name, file in request.FILES.items():
            data[field_name] = file
        
        print("\n\n\n Creating call with data : ", data)
        # Pass request context to serializer for dynamic file field creation
        serializer = CallSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            call = serializer.save(made_by=request.user)
            
            call.refresh_from_db()
            
            # Create a new serializer instance with the refreshed call for the response
            response_serializer = CallSerializer(call, context={'request': request})
            response_data = response_serializer.data
            
            return Response(response_data, status=status.HTTP_201_CREATED)
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
    