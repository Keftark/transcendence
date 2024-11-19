from django.contrib.auth.models import Group, User
from polls.models import *
from rest_framework import serializers


class AccountSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Account
        fields = ['username', 'password', 'email', 'emailVerified', 'emailVerificationToken', 'emailVerificationTokenExpiration', 'forgotPasswordCode', 'forgotPasswordCodeExpiration', 'has_2fa', 'totp_secret', 'totp_config_url', 'account_deleted', 'last_login', 'last_activity', 'date_joined', 'elo', 'rank']
        depth = 2

class GroupSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Group
        fields = ['url', 'name']