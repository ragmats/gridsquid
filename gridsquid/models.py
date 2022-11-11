import os
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    guest = models.BooleanField(default=True)
    unlimited = models.BooleanField(default=False)


class Album(models.Model):
    timestamp = models.DateTimeField(default=timezone.now)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_albums")
    album_title = models.CharField(default="MyGrids", max_length=60)

    def __str__(self):
        return f'"{self.album_title}" album by user {self.user}'

    def serialize(self):
        return {
            "albumID": self.id,
            "albumTitle": self.album_title
        }

class Grid(models.Model):
    timestamp = models.DateTimeField(default=timezone.now)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_grids")
    new = models.BooleanField(default=True)
    grid_title = models.CharField(default="New Grid", max_length=60)
    album = models.ForeignKey(Album, on_delete=models.CASCADE, related_name="album_grids")
    tile_order = models.TextField(default=[i + 1 for i in range(12)]) # Default tile count is 12
    default_tiles_per_row = models.IntegerField(default=4)
    user_tiles_per_row = models.IntegerField(null=True, blank=True)
    quiz_preference = models.CharField(default="audio or text", max_length=13)

    def serialize(self):
        # Convert string to list object
        tile_order_list = [int(i) for i in str(self.tile_order).strip("][").split(", ")]
        return {
            "gridID": self.id,
            "gridNew": self.new,
            "gridTitle": self.grid_title,
            "albumID": self.album.id,
            "albumTitle": self.album.album_title,
            "tileOrder": self.tile_order,
            "tileCount": len(tile_order_list),
            "defaultTilesPerRow": self.default_tiles_per_row,
            "userTilesPerRow": self.user_tiles_per_row,
            "quizPreference": self.quiz_preference
        }

    def __str__(self):
        return f'"{self.grid_title}" grid (ID {self.id}) in {self.album}'


# Return an upload path formatted as user_id/grid_id/tile_number_filename
# Learned from: https://stackoverflow.com/questions/6350153/getting-username-in-imagefield-upload-to-path
def upload_image_to(instance, filename):
    filename = filenamer_helper(instance, filename)
    return f"gridsquid/img/{instance.user.id}/{instance.grid.id}/{filename}"


def upload_audio_to(instance, filename):
    filename = filenamer_helper(instance, filename)
    return f"gridsquid/aud/{instance.user.id}/{instance.grid.id}/{filename}"


def filenamer_helper(instance, filename):
    needs_tile_number = False
    # Check if tile number is already in the filename
    if f"{instance.tile_number}_" not in filename[0:4]:
        needs_tile_number = True
    # Prepend normalized ### tile number to filename if needed
    if needs_tile_number:
        if needs_tile_number and instance.tile_number < 10:
            filename = f"00{instance.tile_number}_{filename}"
        elif needs_tile_number and instance.tile_number < 100:
            filename = f"0{instance.tile_number}_{filename}"
        else:
            filename = f"{instance.tile_number}_{filename}"
    return filename


class Tile(models.Model):
    timestamp = models.DateTimeField(default=timezone.now)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_tiles")
    grid = models.ForeignKey(Grid, on_delete=models.CASCADE, related_name="grid_tiles")
    tile_number = models.IntegerField(default=0)
    image = models.ImageField(upload_to=upload_image_to, default="../static/gridsquid/img/defaultsquid.svg")
    audio = models.FileField(upload_to=upload_audio_to, null=True, blank=True)
    text = models.CharField(max_length=50, null=True, blank=True)

    def serialize(self):
        # Convert string to list object
        tile_order_list = [int(i) for i in str(self.grid.tile_order).strip("][").split(", ")]
        return {
            "tileID": self.id,
            "tileNumber": self.tile_number,
            "maxTileNumber": max(tile_order_list), # Highest number in tile number
            "firstTileNumber": tile_order_list[0],
            "lastTileNumber": tile_order_list[len(tile_order_list) - 1],
            "nextTileNumber": tile_order_list[tile_order_list.index(self.tile_number) + 1] if tile_order_list.index(self.tile_number) + 1 < len(tile_order_list) else max(tile_order_list) + 1,
            "prevTileNumber": tile_order_list[tile_order_list.index(self.tile_number) - 1] if tile_order_list.index(self.tile_number) - 1 >= 0 else 0,
            "imageName": os.path.basename(self.image.name),
            "imageURL": self.image.url,
            "tileText": self.text,
            "audioURL": self.audio.url if self.audio else ""
        }

    def __str__(self):
        return f'Tile {self.tile_number} of {self.grid}'
