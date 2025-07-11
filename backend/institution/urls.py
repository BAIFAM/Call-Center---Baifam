from django.urls import path
from .views import (
    BranchDetailAPIView,
    BranchListAPIView,
    ClientCompanyDetailView,
    ClientCompanyListCreateView,
    ClientCompanyProductDetailView,
    ClientCompanyProductListCreateView,
    InstitutionBranchAPIView,
    InstitutionDetailAPIView,
    InstitutionListAPIView,
    InstitutionUserProfileAPIView,
    ProductDetailView,
    ProductListCreateView,
    UserProfileListAPIView,
    UserProfileDetailAPIView,
    UserBranchListCreateView,
    UserBranchDetailAPIView,
    delete_user_branch_by_ids,
)

urlpatterns = [
    path("", InstitutionListAPIView.as_view(), name="institution-management"),
    path("<int:institution_id>/", InstitutionDetailAPIView.as_view(), name="institution-detail"),
    path("branch/", BranchListAPIView.as_view(), name="branch-management"),

    path("branch/<int:branch_id>/", BranchDetailAPIView.as_view(), name="branch-detail"),

    path("profile/", UserProfileListAPIView.as_view(), name="user-profile"),
    path(
        "profile/<int:institution_id>/",
        UserProfileDetailAPIView.as_view(),
        name="user-profile-detail",
    ),
    path(
        "profile/user/<int:user_id>/",
        InstitutionUserProfileAPIView.as_view(),
        name="user-profile-detail",
    ),
    path("branch/user/", UserBranchListCreateView.as_view(), name="user-branch-list"),
    path(
        "branch/user/<int:user_branch_id>/",
        UserBranchDetailAPIView.as_view(),
        name="user-branch-detail",
    ),
    path(
        "branch/user/<int:user_id>/<int:branch_id>/",
        delete_user_branch_by_ids,
        name="delete-user-branch-by-ids",
    ),
    path("<int:institution_id>/branch", InstitutionBranchAPIView.as_view(), name="institution-branch-list"),
    path("client-companies/<int:institution_id>/", ClientCompanyListCreateView.as_view(), name="clientcompany-list-create"),
    path("client-companies/detail/<uuid:uuid>/", ClientCompanyDetailView.as_view(), name="clientcompany-detail"),
    path("products/<int:institution_id>/", ProductListCreateView.as_view(), name="product-list-create"),
    path("products/detail/<uuid:uuid>/", ProductDetailView.as_view(), name="product-detail"),
    path(
        "client-company-products/<int:institution_id>/",
        ClientCompanyProductListCreateView.as_view(),
        name="clientcompanyproduct-list-create"
    ),
    path(
        "client-company-products/detail/<uuid:uuid>/",
        ClientCompanyProductDetailView.as_view(),
        name="clientcompanyproduct-detail"
    ),
]
