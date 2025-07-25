from django.urls import path
from .views import (
    AgentDetailView,
    AgentListCreateView,
    CallDetailAPIView,
    CallGroupContactDetailView,
    CallGroupContactListCreateView,
    CallGroupListCreateView,
    CallGroupDetailView,
    CallGroupAgentDetailView,
    CallGroupAgentListCreateView,
    CallListCreateAPIView,
    ContactBulkUploadView,
    ContactDetailView,
    ContactListCreateView,
    ContactProductDetailView,
    ContactProductListCreateView,
    ContactTemplateDownloadView,
    ContactsByCallGroupContactListCreateView,
    ContactCallsListView,
    AgentCallsListView,
    AgentCallGroupsListView)

urlpatterns = [
    path(
        "groups/<int:institution_id>/",
        CallGroupListCreateView.as_view(),
        name="callgroup-list-create",
    ),
    path(
        "groups/detail/<uuid:uuid>/",
        CallGroupDetailView.as_view(),
        name="callgroup-detail",
    ),
    path("groups/contacts/<uuid:call_group_uuid>/", ContactsByCallGroupContactListCreateView.as_view(), name="call-group-contacts"),
    path(
        "group-users/<int:institution_id>/",
        CallGroupAgentListCreateView.as_view(),
        name="CallGroupAgent-list-create",
    ),
    path(
        "group-users/detail/<uuid:uuid>/",
        CallGroupAgentDetailView.as_view(),
        name="CallGroupAgent-detail",
    ),
    path(
        "contacts/institution/<int:institution_id>/",
        ContactListCreateView.as_view(),
        name="contact-list-create",
    ),
    path(
        "contacts/<uuid:product_uuid>/template/",
        ContactTemplateDownloadView.as_view(),
        name="contact-template-download",
    ),
    path(
        "contacts/detail/<uuid:uuid>/",
        ContactDetailView.as_view(),
        name="contact-detail",
    ),
    path(
        "contacts/<uuid:product_uuid>/bulk-upload/",
        ContactBulkUploadView.as_view(),
        name="contact-bulk-upload",
    ),
    path(
        "group-contacts/<int:institution_id>/",
        CallGroupContactListCreateView.as_view(),
        name="callgroupcontact-list-create",
    ),
    path(
        "group-contacts/detail/<uuid:uuid>/",
        CallGroupContactDetailView.as_view(),
        name="callgroupcontact-detail",
    ),
    path(
        "institution/<int:institution_id>/",
        CallListCreateAPIView.as_view(),
        name="call-list-create",
    ),
    path("detail/<uuid:uuid>/", CallDetailAPIView.as_view(), name="call-detail"),
    path("contact-calls/<uuid:contact_uuid>/", ContactCallsListView.as_view(), name="contact-calls"),
    path("agent-calls/<uuid:agent_uuid>/", AgentCallsListView.as_view(), name="agent-calls"),
    path("agent-groups/<uuid:agent_uuid>/", AgentCallGroupsListView.as_view(), name="agent-groups"),
    path('institutions/<int:institution_id>/contact-products/', ContactProductListCreateView.as_view(), name='contact-product-list-create'),
    path('contact-products/<uuid:uuid>/', ContactProductDetailView.as_view(), name='contact-product-detail'),
    path('institutions/<int:institution_id>/agents/', AgentListCreateView.as_view(), name='agent-list-create'),
    path('agents/<uuid:uuid>/', AgentDetailView.as_view(), name='agent-detail'),
]

