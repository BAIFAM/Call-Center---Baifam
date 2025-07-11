from django.contrib import admin
from .models import CallGroup, Call, Contact, CallGroupUser, CallGroupContact

admin.site.register(CallGroup)
admin.site.register(Call)
admin.site.register(Contact)    
admin.site.register(CallGroupUser)
admin.site.register(CallGroupContact)
