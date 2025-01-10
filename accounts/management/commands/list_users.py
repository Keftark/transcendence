from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

class Command(BaseCommand):
    help = 'List all users'

    def handle(self, *args, **kwargs):
        users = User.objects.all()

        if not users.exists():
            self.stdout.write(self.style.WARNING("No users found in the database."))
            return  # Exit the command if no users are found

        self.stdout.write('\nUsername \t First Name \t Last Name \t Email \t\t\t Date Joined\n')
        self.stdout.write('-' * 80)  # Add a separator for better readability

        for user in users:
            self.stdout.write(
                f'{user.username} \t\t {user.first_name} \t\t {user.last_name} \t\t {user.email} \t\t {user.date_joined}'
            )
