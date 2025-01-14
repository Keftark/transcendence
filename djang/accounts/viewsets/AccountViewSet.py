from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404

from rest_framework import permissions
from rest_framework import viewsets
from rest_framework.response import Response

from ..serializers import AccountSerializer
from ..models import AccountModel


class AccountViewSet(viewsets.ModelViewSet):
    queryset = AccountModel.objects.all()
    serializer_class = AccountSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def retrieve(self, request, username=None):
        user = get_object_or_404(User, username=username)
        return Response(self.serializer_class(user.account, context={'user': request.user}).data)

    def retrieve_id(self, request, pk=None):
        user = get_object_or_404(User, pk=pk)
        return Response(self.serializer_class(user.account, context={'user': request.user}).data)

    def list(self, request):
        serializer = AccountSerializer(self.get_queryset(), many=True, context={'user': request.user})
        return Response(serializer.data)
