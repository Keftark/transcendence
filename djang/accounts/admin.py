from django.contrib import admin
from .models import AccountModel, FriendModel, FriendRequestModel, BlockModel, SettingsModel
# Register your models here.

admin.site.register(AccountModel)
admin.site.register(BlockModel)
admin.site.register(FriendModel)
admin.site.register(FriendRequestModel)
admin.site.register(SettingsModel)
