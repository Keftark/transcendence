from django.contrib import admin
from .models import AccountModel, Match, FriendModel, FriendRequestModel, BlockModel, Historique
# Register your models here.

admin.site.register(AccountModel)
admin.site.register(Match)
admin.site.register(BlockModel)
admin.site.register(FriendModel)
admin.site.register(FriendRequestModel)
admin.site.register(Historique)
