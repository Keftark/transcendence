from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

class Command(BaseCommand):
    help = 'List all users and allow selection of one to delete, or delete all users with an argument.'

    def add_arguments(self, parser):
        """
        Add optional argument to delete all users.
        """
        parser.add_argument(
            '--all', 
            action='store_true', 
            help='Delete all users in the database without confirmation.'
        )

    def handle(self, *args, **options):
        """
        Handle the command logic.
        """
        # Check if the --all option is provided
        if options['all']:
            self.stdout.write(self.style.WARNING("You have chosen to delete all users."))
            confirmation = input("Are you sure you want to delete ALL users? (yes/no): ").strip().lower()

            if confirmation == 'yes':
                count, _ = User.objects.all().delete()
                self.stdout.write(self.style.SUCCESS(f"All {count} users deleted successfully."))
            else:
                self.stdout.write(self.style.WARNING("Operation canceled."))
            return

        # Default behavior: list users and delete one by selection
        users = User.objects.all()
        
        if not users:
            self.stdout.write(self.style.WARNING("No users found in the database."))
            return

        # Display users
        self.stdout.write(self.style.SUCCESS("List of registered users:"))
        for index, user in enumerate(users, start=1):
            self.stdout.write(f"{index}. {user.username} (Email: {user.email}, ID: {user.id})")

        # Prompt the user to select one to delete
        try:
            selection = input("\nEnter the number of the user you want to delete (or 'q' to quit): ").strip()

            if selection.lower() == 'q':
                self.stdout.write(self.style.WARNING("Operation canceled."))
                return

            # Convert input to integer and validate
            selection = int(selection)
            if selection < 1 or selection > len(users):
                self.stdout.write(self.style.ERROR("Invalid selection."))
                return

            user_to_delete = users[selection - 1]
            confirmation = input(f"Are you sure you want to delete user '{user_to_delete.username}'? (yes/no): ").strip().lower()

            if confirmation == 'yes':
                user_to_delete.delete()
                self.stdout.write(self.style.SUCCESS(f"User '{user_to_delete.username}' deleted successfully."))
            else:
                self.stdout.write(self.style.WARNING("Operation canceled."))

        except ValueError:
            self.stdout.write(self.style.ERROR("Invalid input. Please enter a number corresponding to a user."))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"An error occurred: {e}"))
