from uuid import UUID
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample, OpenApiResponse, inline_serializer
from rest_framework.permissions import AllowAny
from utilities.helpers import (
    build_password_link,
    create_and_institution_otp,
    send_password_link_to_user,
    create_and_institution_token,
)
from users.models import Profile

from .models import Institution, Branch, UserBranch, ClientCompany, Product, ClientCompanyProduct
from users.serializers import ProfileSerializer
from .serializers import (
    InstitutionSerializer,
    BranchSerializer,
    UserBranchSerializer,
    ClientCompanySerializer,
    ProductSerializer,
    ClientCompanyProductSerializer,
)
from django.shortcuts import get_object_or_404
from .utils import generate_compliant_password
from utilities.pagination import CustomPageNumberPagination
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django.db.models import Q


class InstitutionListAPIView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    @extend_schema(
        request=InstitutionSerializer,
        responses={201: InstitutionSerializer},
        description="Create a new institution with name, address, and owner.",
        summary="Create a new institution",
        tags=["Institution Management"],
    )
    def post(self, request):
        if Institution.objects.filter(
            institution_owner__id=request.data.get("institution_owner_id"), institution_name=request.data.get("institution_name")
        ).exists():
            return Response(
                {"detail": "User Already has an Institution with the same name."},
                status=status.HTTP_409_CONFLICT
            )

        serializer = InstitutionSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            institution = serializer.save()
            return Response(
                InstitutionSerializer(institution).data,
                status=status.HTTP_201_CREATED,
            )

        return Response(
            {"detail": serializer.errors}, status=status.HTTP_400_BAD_REQUEST
        )

    @extend_schema(
        responses={200: InstitutionSerializer(many=True)},
        description="Retrieve all institutions.",
        summary="Get all institutions",
        tags=["Institution Management"],
    )
    def get(self, request, institution_id=None):

        if request.user.is_staff:
            institutions = Institution.objects.all()
        else:
            institutions = Institution.objects.filter(institution_owner=request.user)
        serializer = InstitutionSerializer(institutions, many=True)
        return Response(serializer.data)


class InstitutionDetailAPIView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    @extend_schema(
        responses={200: InstitutionSerializer},
        description="Retrieve an institution.",
        summary="Get an institution",
        tags=["Institution Management"],
    )
    def get(self, request, institution_id):
        try:
            institution = Institution.objects.get(id=institution_id)
            if institution.institution_owner != request.user:
                return Response({"detail": "Access denied."}, status=403)
            serializer = InstitutionSerializer(institution)
            return Response(serializer.data)
        except Institution.DoesNotExist:
            return Response({"detail": "Institution not found."}, status=404)

    @extend_schema(
        request=InstitutionSerializer,
        responses={200: InstitutionSerializer},
        description="Update an existing institution.",
        summary="Update an institution",
        tags=["Institution Management"],
    )
    def patch(self, request, institution_id):
        try:
            institution = Institution.objects.get(id=institution_id)
            if institution.institution_owner != request.user:
                return Response({"detail": "Access denied."}, status=403)
        except Institution.DoesNotExist:
            return Response({"detail": "Institution not found."}, status=404)

        serializer = InstitutionSerializer(institution, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(
            {"detail": serializer.errors}, status=status.HTTP_400_BAD_REQUEST
        )

    @extend_schema(
        responses={204: None},
        description="Delete an existing institution.",
        summary="Delete as institution",
        tags=["Institution Management"],
    )
    def delete(self, request, institution_id):
        try:
            institution = Institution.objects.get(id=institution_id)
            if institution.institution_owner != request.user:
                return Response({"detail": "Access denied."}, status=403)
            institution.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Institution.DoesNotExist:
            return Response({"detail": "Institution not found."}, status=404)


class BranchListAPIView(APIView):
    @extend_schema(
        request=BranchSerializer,
        responses={201: BranchSerializer},
        description="Create a new branch.",
        summary="Create a new branch",
        tags=["Branch Management"],
    )
    def post(self, request):
        serializer = BranchSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            branch = serializer.save()
            return Response(
                BranchSerializer(branch).data,
                status=status.HTTP_201_CREATED,
            )
        return Response(
            {"detail": serializer.errors}, status=status.HTTP_400_BAD_REQUEST
        )

    @extend_schema(
        responses={200: BranchSerializer(many=True)},
        description="Retrieve all branches.",
        summary="Get all branches",
        tags=["Branch Management"],
    )
    def get(self, request):
        if request.user.is_staff:
            branches = Branch.objects.all()
        else:
            branches = Branch.objects.filter(institution__institution_owner=request.user)

        serializer = BranchSerializer(branches, many=True)
        return Response(serializer.data)


class BranchDetailAPIView(APIView):
    @extend_schema(
        responses={200: BranchSerializer},
        description="Retrieve a branch.",
        summary="Get a branch",
        tags=["Branch Management"],
    )
    def get(self, request, branch_id):
        try:
            branch = Branch.objects.get(id=branch_id)
            if not request.user.is_staff and branch.institution.institution_owner != request.user:
                return Response({"detail": "Access denied."}, status=403)
            serializer = BranchSerializer(branch)
            return Response(serializer.data)
        except Branch.DoesNotExist:
            return Response({"detail": "Branch not found."}, status=404)

    @extend_schema(
        request=BranchSerializer,
        responses={200: BranchSerializer},
        description="Update an existing branch.",
        summary="Update a branch",
        tags=["Branch Management"],
    )
    def patch(self, request, branch_id):

        try:
            branch = Branch.objects.get(id=branch_id)
            if not request.user.is_staff and branch.institution.institution_owner != request.user:
                return Response({"detail": "Access denied."}, status=403)
        except Branch.DoesNotExist:
            return Response({"detail": "Branch not found."}, status=404)

        serializer = BranchSerializer(branch, data=request.data, partial=True)
        if serializer.is_valid():

            serializer.save()
            return Response(serializer.data)
        return Response(
            {"detail": serializer.errors}, status=status.HTTP_400_BAD_REQUEST
        )

    @extend_schema(
        responses={204: None},
        description="Delete an existing branch.",
        summary="Delete a branch",
        tags=["Branch Management"],
    )
    def delete(self, request, branch_id):
        try:
            branch = Branch.objects.get(id=branch_id)
            if not request.user.is_staff and branch.institution.institution_owner != request.user:
                return Response({"detail": "Access denied."}, status=403)
            branch.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Branch.DoesNotExist:
            return Response({"detail": "Branch not found."}, status=404)


class InstitutionBranchAPIView(APIView):
    @extend_schema(
        responses={200: BranchSerializer(many=True)},
        description="Retrieve all branches associated to a institution whose ID is given",
        summary="Get branches by Institution ID",
        tags=["Branch Management"],
    )
    def get(self, request, institution_id):
        try:
            institution = Institution.objects.get(id=institution_id)
        except Institution.DoesNotExist:
            return Response(
                {"detail": "Institution not found."}, status=status.HTTP_404_NOT_FOUND
            )

        if request.user == institution.institution_owner:
            branches = Branch.objects.filter(institution_id=institution_id)
        else:
            branches = Branch.objects.filter(
                institution_id=institution_id,
                id__in=UserBranch.objects.filter(user=request.user).values_list(
                    "branch_id", flat=True
                ),
            )

        serializer = BranchSerializer(branches, many=True)
        return Response(serializer.data)


class UserProfileListAPIView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        request=ProfileSerializer,
        responses={201: ProfileSerializer},
        description="Create a new user with profile.",
        summary="Create a new user profile",
        tags=["User Management"],
    )
    def post(self, request):
        random_password = generate_compliant_password()
        mutable_data = request.data.copy()
        user_data = mutable_data.get("user", {})
        user_data["password"] = random_password
        mutable_data["user"] = user_data

        serializer = ProfileSerializer(data=mutable_data)
        if serializer.is_valid():
            profile = serializer.save()
            profile.user.is_password_verified = False
            profile.user.save()

            token = create_and_institution_token(
                user=profile.user, purpose="registration", expiry_minutes=15
            )
            password_link = build_password_link(request=request, token=token)
            send_password_link_to_user(user=profile.user, link=password_link)

            return Response(
                ProfileSerializer(profile).data, status=status.HTTP_201_CREATED
            )

        return Response(
            {"detail": serializer.errors}, status=status.HTTP_400_BAD_REQUEST
        )


class UserProfileDetailAPIView(APIView):
    @extend_schema(
        responses={200: ProfileSerializer(many=True)},
        description="Retrieve the user profile of all users attached to the institution.",
        summary="Get all user profiles",
        tags=["User Management"],
    )
    def get(self, request, institution_id):
        try:
            institution = Institution.objects.get(id=institution_id)
        except Institution.DoesNotExist:
            return Response({"detail": "Institution not found."}, status=404)

        user = request.user

        if not user.is_staff and institution.institution_owner != user:
            try:
                print("User is not staff or institution owner")
                profile = user.profile
                if profile.institution_id != institution.id:
                    return Response({"detail": "Access denied."}, status=403)
            except Profile.DoesNotExist:
                return Response({"detail": "Access denied."}, status=403)

        profiles = Profile.objects.filter(institution=institution_id)
        paginator = CustomPageNumberPagination()
        paginator_qs = paginator.paginate_queryset(profiles, request)
        serializer = ProfileSerializer(
            paginator_qs, many=True, context={"request": request}
        )
        return paginator.get_paginated_response(serializer.data)


class InstitutionUserProfileAPIView(APIView):
    @extend_schema(
        request=ProfileSerializer(partial=True),
        responses={200: ProfileSerializer},
        description="Update a institution user's profile (partial update).",
        summary="Update institution user details",
        tags=["User Management"],
    )
    def patch(self, request, user_id):
        if user_id:
            try:
                user = Profile.objects.get(user_id=user_id)
                serializer = Profile(user, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save()
                    return Response(
                        {
                            "message": "Institution User updated successfully",
                            "user": serializer.data,
                        },
                        status=status.HTTP_200_OK,
                    )
                return Response(
                    {"detail": serializer.errors}, status=status.HTTP_400_BAD_REQUEST
                )
            except Profile.DoesNotExist:
                return Response(
                    {"detail": "Institution User not found"}, status=status.HTTP_404_NOT_FOUND
                )
        return Response(
            {"detail": "User ID is required for updating."},
            status=status.HTTP_400_BAD_REQUEST,
        )


class UserBranchListCreateView(APIView):
    @extend_schema(
        request=UserBranchSerializer,
        responses={201: UserBranchSerializer},
        description="Create a new user-branch relationship.",
        summary="Create a new user-branch relationship",
        tags=["User Management"],
    )
    def post(self, request):
        serializer = UserBranchSerializer(
            data=request.data, context={"request": request}
        )
        if serializer.is_valid():
            user_branch = serializer.save()
            return Response(
                UserBranchSerializer(user_branch).data,
                status=status.HTTP_201_CREATED,
            )
        return Response(
            {"detail": serializer.errors}, status=status.HTTP_400_BAD_REQUEST
        )

    @extend_schema(
        responses={200: UserBranchSerializer(many=True)},
        description="Retrieve all user-branch relationships.",
        summary="Get all user-branch relationships",
        tags=["User Management"],
    )
    def get(self, request):
        user_branches = UserBranch.objects.all()
        serializer = UserBranchSerializer(user_branches, many=True)
        return Response(serializer.data)


class UserBranchDetailAPIView(APIView):
    @extend_schema(
        responses={200: UserBranchSerializer},
        description="Retrieve a user-branch relationship.",
        summary="Get a user-branch relationship",
        tags=["User Management"],
    )
    def get(self, request, user_branch_id):
        try:
            user_branch = UserBranch.objects.get(id=user_branch_id)
            serializer = UserBranchSerializer(user_branch)
            return Response(serializer.data)
        except UserBranch.DoesNotExist:
            return Response(
                {"detail": "User-branch relationship not found."}, status=404
            )

    @extend_schema(
        request=UserBranchSerializer,
        responses={200: UserBranchSerializer},
        description="Update an existing user-branch relationship.",
        summary="Update a user-branch relationship",
        tags=["User Management"],
    )
    def patch(self, request, user_branch_id):
        user_branch = get_object_or_404(UserBranch, id=user_branch_id)
        serializer = UserBranchSerializer(user_branch, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(
            {"detail": serializer.errors}, status=status.HTTP_400_BAD_REQUEST
        )


# TODO: Make sure a user who does this has permissions to do so
@extend_schema(
    responses={204: None},
    description="Delete an existing user-branch relationship by user and branch IDs.",
    summary="Delete a user-branch relationship by user and branch",
    tags=["User Management"],
)
@api_view(["DELETE"])
def delete_user_branch_by_ids(request, user_id, branch_id):
    try:
        user_branch = UserBranch.objects.get(user_id=user_id, branch_id=branch_id)
        user_branch.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except UserBranch.DoesNotExist:
        return Response(
            {"detail": "User-branch relationship not found."},
            status=status.HTTP_404_NOT_FOUND,
        )
        
@extend_schema(tags=["ClientCompany"])
class ClientCompanyListCreateView(APIView):

    @extend_schema(
        summary="List all product links for a specific client company",
        parameters=[
            OpenApiParameter(name="client_company_id", required=True, type=str, location=OpenApiParameter.PATH),
        ],
        responses={200: ClientCompanyProductSerializer(many=True)}
    )
    def get(self, request, client_company_id):
        client_company = get_object_or_404(ClientCompany, uuid=client_company_id)
        links = ClientCompanyProduct.objects.filter(client_company=client_company)
        serializer = ClientCompanyProductSerializer(links, many=True)
        return Response(serializer.data)

    @extend_schema(
        summary="Create a new product link for a client company",
        request=ClientCompanyProductSerializer,
        responses={201: ClientCompanyProductSerializer}
    )
    def post(self, request, client_company_id):
        client_company = get_object_or_404(ClientCompany, uuid=client_company_id)
        data = request.data.copy()
        data['client_company'] = str(client_company.uuid)
        serializer = ClientCompanyProductSerializer(data=data)
        if serializer.is_valid():
            serializer.save(created_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(tags=["ClientCompany"])
class ClientCompanyDetailView(APIView):

    def get_object(self, uuid):
        return get_object_or_404(ClientCompany, uuid=uuid)

    @extend_schema(
        summary="Retrieve a client company by UUID",
        responses={200: ClientCompanySerializer}
    )
    def get(self, request, uuid):
        company = self.get_object(uuid)
        serializer = ClientCompanySerializer(company)
        return Response(serializer.data)

    @extend_schema(
        summary="Update a client company by UUID (partial)",
        request=ClientCompanySerializer,
        responses={200: ClientCompanySerializer}
    )
    def patch(self, request, uuid):
        company = self.get_object(uuid)
        serializer = ClientCompanySerializer(company, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()  
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        summary="Delete a client company by UUID",
        responses={204: OpenApiResponse(description="Deleted successfully")}
    )
    def delete(self, request, uuid):
        company = self.get_object(uuid)
        company.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
        

@extend_schema(tags=["Product"])
class ProductListCreateView(APIView):

    @extend_schema(
        summary="List all products for a specific institution",
        parameters=[
            OpenApiParameter(name="institution_id", required=True, type=int, location=OpenApiParameter.PATH),
        ],
        responses={200: ProductSerializer(many=True)}
    )
    def get(self, request, institution_id):
        institution = get_object_or_404(Institution, id=institution_id)
        products = Product.objects.filter(institution=institution)
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        summary="Create a new product for a specific institution",
        description=(
                "Field types must be one of: "
                "`text`, `textarea`, `select`, `checkbox`, `number`, `email`, `file`."
            ),
        request=ProductSerializer,
        responses={201: ProductSerializer}
    )
    def post(self, request, institution_id):
        institution = get_object_or_404(Institution, id=institution_id)
        data = request.data.copy()
        data['institution'] = str(institution.id)
        serializer = ProductSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(tags=["Product"])
class ProductDetailView(APIView):

    def get_object(self, uuid):
        return get_object_or_404(Product, uuid=uuid)

    @extend_schema(
        summary="Retrieve a product by UUID",
        responses={200: ProductSerializer}
    )
    def get(self, request, uuid):
        product = self.get_object(uuid)
        serializer = ProductSerializer(product)
        return Response(serializer.data)

    @extend_schema(
        summary="Update a product by UUID (partial)",
        request=ProductSerializer,
        responses={200: ProductSerializer}
    )
    def patch(self, request, uuid):
        product = self.get_object(uuid)
        serializer = ProductSerializer(product, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        summary="Delete a product by UUID",
        responses={204: OpenApiResponse(description="Deleted successfully")}
    )
    def delete(self, request, uuid):
        product = self.get_object(uuid)
        product.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
@extend_schema(tags=["ClientCompanyProduct"])
class ClientCompanyProductListCreateView(APIView):

    @extend_schema(
        summary="List all product links for a specific client company",
        parameters=[
            OpenApiParameter(name="client_company_id", required=True, type=int, location=OpenApiParameter.PATH),
        ],
        responses={200: ClientCompanyProductSerializer(many=True)}
    )
    def get(self, request, client_company_id):
        client_company = get_object_or_404(ClientCompany, uuid=client_company_id)
        links = ClientCompanyProduct.objects.filter(client_company=client_company)
        serializer = ClientCompanyProductSerializer(links, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        summary="Create a new product link for a client company",
        request=ClientCompanyProductSerializer,
        responses={201: ClientCompanyProductSerializer}
    )
    def post(self, request, client_company_id):
        client_company = get_object_or_404(ClientCompany, uuid=client_company_id)
        data = request.data.copy()
        data['client_company'] = str(client_company.uuid)
        serializer = ClientCompanyProductSerializer(data=data)
        if serializer.is_valid():
            serializer.save(created_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(tags=["ClientCompanyProduct"])
class ClientCompanyProductDetailView(APIView):

    def get_object(self, uuid):
        return get_object_or_404(ClientCompanyProduct, uuid=uuid)

    @extend_schema(
        summary="Retrieve a product link by UUID",
        responses={200: ClientCompanyProductSerializer}
    )
    def get(self, request, uuid):
        item = self.get_object(uuid)
        serializer = ClientCompanyProductSerializer(item)
        return Response(serializer.data)

    @extend_schema(
        summary="Partially update a product link by UUID",
        request=ClientCompanyProductSerializer,
        responses={200: ClientCompanyProductSerializer}
    )
    def patch(self, request, uuid):
        item = self.get_object(uuid)
        serializer = ClientCompanyProductSerializer(item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        summary="Delete a product link by UUID",
        responses={204: OpenApiResponse(description="Deleted successfully")}
    )
    def delete(self, request, uuid):
        item = self.get_object(uuid)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)    