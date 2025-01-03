from django.contrib.auth.models import Group, User
from polls.models import *
from rest_framework import serializers


class AccountSerializer(serializers.HyperlinkedModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    avatar = serializers.ImageField(required=False)
    online = serializers.SerializerMethodField()
    is_friend = serializers.SerializerMethodField()
    has_incoming_request = serializers.SerializerMethodField()
    has_outgoing_request = serializers.SerializerMethodField()
