from django.contrib import admin
from .models import Match, Match2v2, Historique, Historique2v2, TournamentMatchModel, TournamentModel

admin.site.register(Match)
admin.site.register(Match2v2)
admin.site.register(Historique)
admin.site.register(Historique2v2)
admin.site.register(TournamentModel)
admin.site.register(TournamentMatchModel)