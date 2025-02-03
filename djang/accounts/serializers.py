from os import path
from django.conf import settings
from django.utils.translation import gettext as _
from django.contrib.auth.models import User
from accounts.models import *
from rest_framework import serializers
from rest_framework.serializers import ModelSerializer, ValidationError
from django.utils.translation import gettext as _
from rest_framework.fields import CharField
from django.contrib.auth import login
from drf_extra_fields.fields import Base64ImageField




#class AccountSerializer(serializers.HyperlinkedModelSerializer):
#    username = serializers.ReadOnlyField(source='user.username')
#    avatar = serializers.ImageField(required=False)
#    online = serializers.SerializerMethodField()
#    is_friend = serializers.SerializerMethodField()
#    has_incoming_request = serializers.SerializerMethodField()
#    has_outgoing_request = serializers.SerializerMethodField()

class AccountSerializer(serializers.ModelSerializer):

    username = serializers.ReadOnlyField(source='user.username')
    avatar = Base64ImageField(required=False)
    status = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()
    is42 = serializers.ReadOnlyField()
    is_friend = serializers.SerializerMethodField()
    is_blocked = serializers.SerializerMethodField()
    has_incoming_request = serializers.SerializerMethodField()
    has_outgoing_request = serializers.SerializerMethodField()
    preferredPaddle = serializers.SerializerMethodField()

    class Meta:
        model = AccountModel
        fields = ["username", "avatar", "id", 'status', 'description', 'is42', 'is_friend', 'is_blocked',
                  'has_outgoing_request', 'has_incoming_request', 'preferredPaddle']

    def get_status(self, obj: AccountModel):
        from notifications.consumers import notification_manager

        user = self.context.get('user')
        if user is None or not user.is_authenticated:
            return None

        if not user.accountmodel.is_friend(obj) and user.pk != obj.pk:
            return None

        return notification_manager.get_consumer_by_user(obj.user) is not None
    
    def get_is_friend(self, obj: AccountModel):
        user = self.context.get('user')
        if user is None or not user.is_authenticated or user.pk == obj.pk:
            return False

        return obj.is_friend(user.accountmodel)

    def get_is_blocked(self, obj: AccountModel):
        user = self.context.get('user')
        if user is None or not user.is_authenticated or user.pk == obj.pk:
            return False

        return obj.is_blocked(user.accountmodel)

    def get_has_incoming_request(self, obj: AccountModel):
        user = self.context.get('user')
        if user is None or not user.is_authenticated or user.pk == obj.pk:
            return False

        return obj.is_friend_requesting(user.accountmodel)

    def get_has_outgoing_request(self, obj: AccountModel):
        user = self.context.get('user')
        if user is None or not user.is_authenticated or user.pk == obj.pk:
            return False

        return obj.is_friend_requested_by(user.accountmodel)

    def validate_avatar(self, value):
        '''
        Check that the image is not too large
        '''
        if value.size > settings.PROFILE_PICTURE_MAX_SIZE:
            raise serializers.ValidationError(_('Image is too large.'))
        return value

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['avatar'] = data['avatar'][data['avatar'].find('/media/'):]
        return data
    
    def get_description(self, obj: AccountModel):
        user = self.context.get('user')
        if user is None or not user.is_authenticated:
            return None

        return user.accountmodel.description
    
    def get_preferredPaddle(self, obj: AccountModel):

        user = self.context.get('user')
        if user is None or not user.is_authenticated:
            return None

        if not user.accountmodel.preferredPaddle and user.pk != obj.pk:
            return None

        return user.accountmodel.preferredPaddle

class UpdateUserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ['username']

    def update(self, instance, validated_data):
        user = self.context['request'].user

        if user.pk != instance.pk:
            raise ValidationError({'authorize': _('You dont have permission for this user.')})

        instance.username = validated_data.get('username', instance.username)

        instance.save()
        return instance
    
class UpdatePasswordSerializer(ModelSerializer):
    current_password = CharField(write_only=True, required=True)
    new_password = CharField(write_only=True, required=True)
    new_password2 = CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['current_password', 'new_password', 'new_password2']

    def validate_current_password(self, value):
        if not self.instance.check_password(value):
            raise ValidationError(_('Current password is incorrect.'))
        return value

    def validate(self, data):
        if data['new_password'] != data['new_password2']:
            raise ValidationError({'new_password2': _('The password does not match.')})
        return data

    def update(self, instance, validated_data):
        user = self.context['request'].user

        if user.pk != instance.pk:
            raise ValidationError({'authorize': _('You dont have permission for this user.')})

        instance.set_password(validated_data['new_password'])

        instance.save()
        login(self.context['request'], instance)
        return instance
    
class UpdateSettingsSerializer(ModelSerializer):
    class Meta:
        model = AccountModel
        fields =['color', 'language', 'view']

    def update(self, instance, validated_data):
        account = self.context['request'].user

        if account.pk != instance.pk:
            raise ValidationError({'authorize': _('You dont have permission for this user.')})

        instance.username = validated_data.get('username', instance.username)

        instance.save()
        return instance

