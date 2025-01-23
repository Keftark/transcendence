from django import forms
from accounts.models import AccountModel

class AvatarForm(forms.Form):
    class meta:
        model = AccountModel
        fields = ['fileInput']