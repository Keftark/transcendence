from django.contrib import admin
from .models import Match, Historique, TournamentMatchModel, TournamentModel

admin.site.register(Match)
admin.site.register(Historique)
admin.site.register(TournamentModel)
admin.site.register(TournamentMatchModel)