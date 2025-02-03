from __future__ import annotations
from datetime import datetime
from os.path import splitext

from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
from django.db.models import Q, Model, CASCADE, ForeignKey, ImageField, OneToOneField
from django.dispatch import receiver
from django.contrib.postgres.fields import ArrayField
from django.db.models.signals import post_save, pre_delete

def upload_to(instance, filename: str):
    return f"/{instance.pk}{splitext(filename)[1]}"

class AccountModel(models.Model):
    user = OneToOneField(User, on_delete=CASCADE, default=True)
    avatar = ImageField(upload_to=upload_to, default='guestUser.webp')
    status = models.CharField(max_length=150, default="offline")
    description = models.CharField(max_length=150, default='')
    is42 = models.BooleanField(default=False)
    preferredPaddle = models.IntegerField(default=1)

    def __str__(self):
        return self.user.username

    def get_game(self) -> int:
        from ping_pong.consumers import game_manager
        for game in game_manager._game_list:
            for player in game.get_players_connected():
                if (player.user_id == self.user.pk):
                    return game.game_id
        return None

    def get_friends(self) -> list[AccountModel]:
        friends: list[AccountModel] = []

        for friendship in FriendModel.objects.filter(Q(friend1=self) | Q(friend2=self)):
            friends.append(friendship.friend1 if friendship.friend1 != self else friendship.friend2)

        return friends

    def is_friend(self, friend):
        return FriendModel.objects.filter(
            (Q(friend1=self) & Q(friend2=friend)) |
            (Q(friend2=self) & Q(friend1=friend))
        ).exists()

    def is_blocked(self, block):
        return BlockModel.objects.filter(
            (Q(blocked=self) & Q(blocker=block))
        ).exists()

    def delete_friend(self, friend):
        FriendModel.objects.get(
            (Q(friend1=self) & Q(friend2=friend)) |
            (Q(friend2=self) & Q(friend1=friend))
        ).delete()

    def is_friend_requested_by(self, account):
        return FriendRequestModel.objects.filter(author=account, target=self).exists()

    def get_received_friend_request_from(self, account):
        return FriendRequestModel.objects.filter(author=account, target=self).first()

    def is_friend_requesting(self, account):
        return FriendRequestModel.objects.filter(author=self, target=account).exists()

    def get_outgoing_friend_request_to(self, account):
        return FriendRequestModel.objects.filter(author=self, target=account).first()

    def get_outgoing_friend_requests(self) -> list[AccountModel]:
        return FriendRequestModel.objects.filter(author=self)

    def get_incoming_friend_requests(self) -> list[AccountModel]:
        return FriendRequestModel.objects.filter(target=self)


@receiver(pre_delete, sender=AccountModel)
def delete_profile_picture(sender, instance, **kwargs):
    if instance.avatar.name != './media/guestUser.webp':
        instance.avatar.storage.delete(instance.avatar.name)


@receiver(post_save, sender=User)
def on_user_created(sender, instance, created, **kwargs):
    if created:
        accountmodel: AccountModel = AccountModel.objects.create(pk=instance.pk, user=instance)
        settingsmodel: SettingsModel = SettingsModel.objects.create(pk=instance.pk, account=accountmodel)
        accountmodel.save()
        settingsmodel.save()
        

class FriendModel(Model):
    friend1 = ForeignKey(AccountModel, on_delete=CASCADE, related_name='friend1')
    friend2 = ForeignKey(AccountModel, on_delete=CASCADE, related_name='friend2')


class FriendRequestModel(Model):
    author = ForeignKey(AccountModel, on_delete=CASCADE, related_name='author')
    target = ForeignKey(AccountModel, on_delete=CASCADE, related_name='target')

    def accept(self):
        FriendModel(friend1=self.author, friend2=self.target).save()
        self.delete()


class BlockModel(Model):
    blocker = ForeignKey(AccountModel, on_delete=CASCADE, related_name='blocker')
    blocked = ForeignKey(AccountModel, on_delete=CASCADE, related_name='blocked')

class SettingsModel(Model):
    account = ForeignKey(AccountModel, on_delete=CASCADE, null=True, related_name='account')
    color = models.CharField(max_length=150, default="white")
    language = models.CharField(max_length=150, default="french")
    view = models.IntegerField(default=1)