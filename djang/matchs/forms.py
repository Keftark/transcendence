from django import forms
from django.contrib.auth.models import User
from django.db.models import Q, Model, CASCADE
from accounts.models import AccountModel

class MatchForm(forms.Form):
    finished = forms.BooleanField(default = False)
    started = forms.BooleanField(default = False)
    winner = forms.ForeignKey(User, on_delete=CASCADE, null=True, blank=True)
    match_id = forms.IntegerField()
    online = forms.BooleanField(default = False)
    player_1 = forms.ForeignKey(AccountModel, on_delete=forms.SET_NULL, null=True, related_name='player_1')
    player_1_score = forms.IntegerField(null=True)
    
    player_2 = forms.ForeignKey(AccountModel, on_delete=forms.SET_NULL, null=True, related_name='player_2')
    player_2_score = forms.IntegerField(null=True)

    start_timestamp = forms.BigIntegerField(null = True, blank = True)
    stop_timestamp = forms.BigIntegerField(null = True, blank = True)
    
    winner = forms.ForeignKey(AccountModel, on_delete=forms.SET_NULL, null=True, related_name='winner')
    status = forms.IntegerField(default=started)