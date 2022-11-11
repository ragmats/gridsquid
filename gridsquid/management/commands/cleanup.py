# Custom commands learned from: https://docs.djangoproject.com/en/4.1/howto/custom-management-commands/
# https://www.youtube.com/watch?v=V0RfgNIwCqI&t=143s&ab_channel=PrettyPrinted

from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
import os

from gridsquid.models import User, Tile


DEFAULT_TILE_IMG_NAME = "defaultsquid.svg"
MAX_GUEST_ACCOUNT_DAYS = 30

class Command(BaseCommand):
    def handle(self, *args, **options):
        """
        Deletes all guest user accounts and their media if older than MAX_GUEST_ACCOUNT_DAYS as well as any empty folders in the media directory
        """
        # Get all guest accounts created before the limit
        # Learned from: https://stackoverflow.com/questions/1984047/django-filter-older-than-days
        expired_guests_count = User.objects.filter(guest=True).filter(date_joined__lt=timezone.now()-timedelta(days=MAX_GUEST_ACCOUNT_DAYS)).count()
        expired_guests = User.objects.filter(guest=True).filter(date_joined__lt=timezone.now()-timedelta(days=MAX_GUEST_ACCOUNT_DAYS))
        print(expired_guests_count)
        for guest in expired_guests:
            tiles = Tile.objects.select_related("user").filter(user=guest).all()
            for tile in tiles:
                # Delete image if not default image
                if DEFAULT_TILE_IMG_NAME not in tile.image.url:
                    tile.image.delete()
                # Delete audio file if there is one
                if tile.audio is not None:
                    tile.audio.delete()
            # Delete guest account
            guest.delete()

        # Delete all empty folders in media directory
        # Learned from: https://stackoverflow.com/questions/20213879/delete-empty-directories-in-django
        for root, dirs, files in os.walk("media/gridsquid/"):
            for d in dirs:
                dir = os.path.join(root, d)
                # check if dir is empty
                if not os.listdir(dir):
                    os.rmdir(dir)
        print(f"Deleted {expired_guests_count} guest account(s) older than {MAX_GUEST_ACCOUNT_DAYS} days, any associated media, and all media empty folders.")