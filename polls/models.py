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
    return f"./profiles/static/avatars/{instance.pk}{splitext(filename)[1]}"


class Account(models.Model):
    user = OneToOneField(User, on_delete=CASCADE, default=True)
    avatar = ImageField(upload_to=upload_to, default=".static/website/icons/guestUser.webp")
    status = models.CharField(max_length=150, default="offline")
    description = models.CharField(max_length=150, default='')
    is42 = models.BooleanField(default=False)

    def get_friends(self) -> list[Account]:
        friends: list[Account] = []

        for friendship in FriendModel.objects.filter(Q(friend1=self) | Q(friend2=self)):
            friends.append(friendship.friend1 if friendship.friend1 != self else friendship.friend2)

        return friends

    def is_friend(self, friend):
        return FriendModel.objects.filter(
            (Q(friend1=self) & Q(friend2=friend)) |
            (Q(friend2=self) & Q(friend1=friend))
        ).exists()

    def delete_friend(self, friend):
        FriendModel.objects.get(
            (Q(friend1=self) & Q(friend2=friend)) |
            (Q(friend2=self) & Q(friend1=friend))
        ).delete()

    def is_friend_requested_by(self, profile):
        return FriendRequestModel.objects.filter(author=profile, target=self).exists()

    def get_received_friend_request_from(self, profile):
        return FriendRequestModel.objects.filter(author=profile, target=self).first()

    def is_friend_requesting(self, profile):
        return FriendRequestModel.objects.filter(author=self, target=profile).exists()

    def get_outgoing_friend_request_to(self, profile):
        return FriendRequestModel.objects.filter(author=self, target=profile).first()

    def get_outgoing_friend_requests(self) -> list[Account]:
        return FriendRequestModel.objects.filter(author=self)

    def get_incoming_friend_requests(self) -> list[Account]:
        return FriendRequestModel.objects.filter(target=self)


@receiver(pre_delete, sender=Account)
def delete_profile_picture(sender, instance, **kwargs):
    if instance.avatar.name != './profiles/static/avatars/default.avif':
        instance.avatar.storage.delete(instance.avatar.name)


@receiver(post_save, sender=User)
def on_user_created(sender, instance, created, **kwargs):
    if created:
        profile: Account = Account.objects.create(pk=instance.pk, user=instance)
        profile.save()


class FriendModel(Model):
    friend1 = ForeignKey(Account, on_delete=CASCADE, related_name='friend1')
    friend2 = ForeignKey(Account, on_delete=CASCADE, related_name='friend2')


class FriendRequestModel(Model):
    author = ForeignKey(Account, on_delete=CASCADE, related_name='author')
    target = ForeignKey(Account, on_delete=CASCADE, related_name='target')

    def accept(self):
        FriendModel(friend1=self.author, friend2=self.target).save()
        self.delete()


class BlockModel(Model):
    blocker = ForeignKey(Account, on_delete=CASCADE, related_name='blocker')
    blocked = ForeignKey(Account, on_delete=CASCADE, related_name='blocked')

    
class Match(models.Model):
    NOT_PLAYED = 0
    IN_PROGRESS = 1
    FINISHED = 2
    match_id = models.IntegerField()
    player_1 = models.ForeignKey(Account, on_delete=models.SET_NULL, null=True, related_name='player_1')
    player_1_score = models.IntegerField(null=True)
    
    player_2 = models.ForeignKey(Account, on_delete=models.SET_NULL, null=True, related_name='player_2')
    player_2_score = models.IntegerField(null=True)

    start_timestamp = models.BigIntegerField(null = True, blank = True)
    stop_timestamp = models.BigIntegerField(null = True, blank = True)
    
    winner = models.ForeignKey(Account, on_delete=models.SET_NULL, null=True, related_name='winner')
    status = models.IntegerField(default=NOT_PLAYED)

class Historique(models.Model):
    histo_id = models.IntegerField()
    match = models.ForeignKey(Match, on_delete=models.SET_NULL , null=True, related_name='match')
    goal_timestamp = models.BigIntegerField(null = True, blank = True)
    player = models.ForeignKey(Account, on_delete=models.SET_NULL, null=True, related_name='player')
