from django.urls import path
from .views import CallDetailAPIView, CallGroupContactDetailView, CallGroupContactListCreateView, CallGroupListCreateView, CallGroupDetailView, CallGroupUserDetailView, CallGroupUserListCreateView, CallListCreateAPIView, ContactBulkUploadView, ContactDetailView, ContactListCreateView, ContactTemplateDownloadView

urlpatterns = [
    path("groups/<int:institution_id>/", CallGroupListCreateView.as_view(), name="callgroup-list-create"),
    path("groups/detail/<uuid:uuid>/", CallGroupDetailView.as_view(), name="callgroup-detail"),
    path("group-users/<int:institution_id>/", CallGroupUserListCreateView.as_view(), name="callgroupuser-list-create"),
    path("group-users/detail/<uuid:uuid>/", CallGroupUserDetailView.as_view(), name="callgroupuser-detail"),
    path("contacts/<int:institution_id>/", ContactListCreateView.as_view(), name="contact-list-create"),
    path('contacts/<uuid:product_uuid>/template/', ContactTemplateDownloadView.as_view(), name='contact-template-download'),
    path("contacts/detail/<uuid:uuid>/", ContactDetailView.as_view(), name="contact-detail"),
    path('contacts/<uuid:product_uuid>/bulk-upload/', ContactBulkUploadView.as_view(), name='contact-bulk-upload'),
    path("group-contacts/<int:institution_id>/", CallGroupContactListCreateView.as_view(), name="callgroupcontact-list-create"),
    path("group-contacts/detail/<uuid:uuid>/", CallGroupContactDetailView.as_view(), name="callgroupcontact-detail"),
    path("<int:institution_id>/", CallListCreateAPIView.as_view(), name="call-list-create"),
    path("detail/<uuid:uuid>/", CallDetailAPIView.as_view(), name="call-detail"),

]
