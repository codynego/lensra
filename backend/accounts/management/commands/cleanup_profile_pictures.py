import os
from django.core.management.base import BaseCommand
from django.conf import settings
from accounts.models import User

class Command(BaseCommand):
    help = "Remove unused profile pictures from the media folder."

    def handle(self, *args, **options):
        profile_pictures_dir = os.path.join(settings.MEDIA_ROOT, 'profile_pictures')

        if not os.path.exists(profile_pictures_dir):
            self.stdout.write(self.style.WARNING(f"No profile_pictures directory found."))
            return

        # Get all files currently in use by Users
        used_files = set(
            user.profile_picture.name.split('/')[-1]
            for user in User.objects.exclude(profile_picture='')
            if user.profile_picture
        )

        deleted_count = 0
        for file_name in os.listdir(profile_pictures_dir):
            if file_name not in used_files:
                file_path = os.path.join(profile_pictures_dir, file_name)
                os.remove(file_path)
                deleted_count += 1
                self.stdout.write(self.style.SUCCESS(f"Deleted unused file: {file_name}"))

        self.stdout.write(
            self.style.SUCCESS(f"Cleanup complete. Deleted {deleted_count} unused files.")
        )
