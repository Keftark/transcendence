from django import forms
from .models import AccountModel


class AvatarForm(forms.ModelForm):

    class Meta:
        model = AccountModel
        fields = ['avatar']
