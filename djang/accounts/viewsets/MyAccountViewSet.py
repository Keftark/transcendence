from rest_framework import permissions
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.authentication import SessionAuthentication

from ..serializers import AccountSerializer
from ..models import AccountModel


class MyAccountViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (SessionAuthentication,)
    serializer_class = AccountSerializer
    queryset = AccountModel.objects.all()

    def get_object(self):
        return self.request.user.accountmodel

    def perform_update(self, serializer: AccountSerializer, pk=None):
        serializer.is_valid(raise_exception=True)
        avatar = serializer.validated_data.get('avatar')
        account: AccountModel = self.get_object()

        if (avatar is not None):
            if (account.avatar.name != "./media/profileImage.webp"):
                account.avatar.storage.delete(account.avatar.name)
            serializer.save()

    def delete_avatar(self, pk=None):
        account = self.get_object()
        if (account.avatar.name != './media/profileImage.webp'):
            account.avatar.storage.delete(account.avatar.name)
        account.avatar.name = './media/profileImage.webp'
        account.save()
        return Response(AccountSerializer(account).data)

    def retrieve(self, pk=None):
        return Response(self.serializer_class(self.get_object(), context={'user': self.request.user}).data)
