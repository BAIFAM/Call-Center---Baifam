from django.contrib import admin
from .models import Institution, Branch, ClientCompany, Product, ClientCompanyProduct, UserBranch


class InstitutionAdmin(admin.ModelAdmin):
    list_display = ("institution_name", "institution_owner")
    search_fields = ("institution_name",)
    ordering = ("institution_name",)
    list_per_page = 20


class BranchAdmin(admin.ModelAdmin):
    list_display = ("branch_name", "institution", "branch_location")
    search_fields = ("branch_name", "institution_name")
    ordering = ("branch_name",)
    list_per_page = 20

class UserBranchAdmin(admin.ModelAdmin):
    list_display = ("branch__branch_name", 'user', "branch__institution", "branch__branch_location")
    search_fields = ("branch__branch_name","user",  "branch__institution_name")
    ordering = ("branch__branch_name",)
    list_per_page = 20


admin.site.register(Branch, BranchAdmin)
admin.site.register(UserBranch, UserBranchAdmin)
admin.site.register(Institution, InstitutionAdmin)
admin.site.register(ClientCompany)
admin.site.register(Product)
admin.site.register(ClientCompanyProduct)
