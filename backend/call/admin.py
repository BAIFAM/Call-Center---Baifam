from django.contrib import admin
from .models import CallGroup, Call, Contact, CallGroupAgent, CallGroupContact, ContactProduct, Agent

admin.site.register(CallGroup)
admin.site.register(Call)
admin.site.register(Contact)    
admin.site.register(CallGroupAgent)
admin.site.register(CallGroupContact)
admin.site.register(Agent)
admin.site.register(ContactProduct)