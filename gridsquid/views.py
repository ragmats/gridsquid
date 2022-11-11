import json
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
import random
from pydub import AudioSegment
from pathlib import Path
import magic
from datetime import timedelta
import os

from io import BytesIO
from PIL import Image
from django.core.files.uploadedfile import InMemoryUploadedFile

from .models import *


DEFAULT_GRID_TITLE = "New Grid"
MIN_TILE_COUNT = 1
MAX_TILE_COUNT = 36
DEFAULT_TILE_IMG_NAME = "defaultsquid.svg"
DEFAULT_TILE_IMG_URL = "../static/gridsquid/img/defaultsquid.svg"
MAX_TILE_TEXT_CHARS = 50
MAX_IMAGE_SIZE = 5242880
MAX_AUDIO_SIZE = 2621440
MAX_GRIDS_PER_USER = 10
MAX_GRIDS_PER_GUEST = 3
MAX_GUEST_ACCOUNT_DAYS = 30
SMALL_WIDTH_TILES_PER_ROW = 2
MEDIUM_WIDTH_TILES_PER_ROW = 3
LARGE_WIDTH_TILES_PER_ROW = 4


def index(request):
    """
    Directs users and guests to main page, redirects unlogged users to login.
    """
    # Check if user is a guest
    guest = is_guest(request)

    # Try to get guest name from cookie and register/login as a guest
    try:
        if not request.user.is_authenticated:
            create_and_login_guest(request)

        return render(request, "gridsquid/index.html", {
            "guest": guest
        })

    except:
        return HttpResponseRedirect(reverse("welcome"))


def new_grid(request):
    """
    Creates a new grid if user has no new grids; loads new grid if one exists;
    or loads most recent grid if user has reached their grid limit.
    """
    if request.method == "PUT":
        data = json.loads(request.body)
        viewport_width = data.get("viewport_width")
        print(f'grid_width: {viewport_width}')
        message = None

        # Before making a new grid, check the user's current grid count
        grid_count = Grid.objects.filter(user=request.user).count()
        print(grid_count)

        # Create a message if the guest or user has reached the grid limit
        if is_guest(request) and grid_count >= MAX_GRIDS_PER_GUEST:
            message = f"You have reached the Grid limit for guest accounts ({MAX_GRIDS_PER_GUEST}). To create more grids, either delete existing grids or register as a user to increase the limit to {MAX_GRIDS_PER_USER} during the beta phase. Below is your most recent grid."
        elif not is_guest(request) and not is_unlimited(request) and grid_count >= MAX_GRIDS_PER_USER:
            message = f"You have reached the Grid limit for user accounts ({MAX_GRIDS_PER_USER}) during the beta phase. To create more grids, please delete existing grids. Below is your most recent grid."

        if viewport_width is not None:
            # Get the user's latest mygrids album and grid
            latest_mygrids_album = Album.objects.filter(user=request.user, album_title="MyGrids").last()
            latest_grid = Grid.objects.filter(user=request.user).last()

            # Create a new default album, grid, and tile if user doesn't have any
            if latest_grid is None:
                if latest_mygrids_album is None:
                    latest_mygrids_album = Album.objects.create(user=request.user)
                print("Creating & Loading user's first grid...")
                new_grid = Grid.objects.create(user=request.user, album=latest_mygrids_album)
                for i in range(12):
                    Tile.objects.create(user=request.user, grid=new_grid, tile_number=i+1)
            # Create a new grid and tile and add to existing MyGrids album if user's latest grid isn't new and they haven't reached the grid limit
            elif latest_grid.new == False and message is None:
                print("Creating & loading user's new grid...")
                new_grid = Grid.objects.create(user=request.user, album=latest_mygrids_album)
                for i in range(12):
                    Tile.objects.create(user=request.user, grid=new_grid, tile_number=i+1)
            # Load latest grid if user's latest grid is new or they have reached the grid limit
            else:
                print("Loading user's existing new grid...")
                new_grid = latest_grid
            # Update grid's default tiles per row based on the current viewport width
            new_grid.default_tiles_per_row = get_tiles_per_row(viewport_width)
            print(f"new grid's default tiles per row set to: {get_tiles_per_row(viewport_width)}")
            new_grid.save()
            # Load user's albums and new grid's tiles
            albums = Album.objects.order_by("album_title").filter(user=request.user)
            tiles = Tile.objects.select_related("grid").filter(grid=new_grid).all()
            return JsonResponse({
                "grid": new_grid.serialize(),
                "tiles": [tile.serialize() for tile in tiles],
                "albums": [album.serialize() for album in albums],
                "message": message
            }, safe=False)
        else:
            return JsonResponse({"error": "Viewport width not found. New grid not created or returned."}, status=404)
    else:
        return JsonResponse({
            "error": "PUT request required."
        }, status=400)


def get_grid(request, grid_id):
    """
    Returns a specified grid, the grid's tiles, and all the user's albums as JSON.
    """
    # Query for requested grid
    try:
        grid = Grid.objects.get(pk=grid_id)
    except Grid.DoesNotExist:
        return JsonResponse({"error": "Grid not found."}, status=404)

    if request.method == "PUT":
        data = json.loads(request.body)
        viewport_width = data.get("viewport_width")
        if viewport_width is not None:
            # Update grid's default tiles per row based on the current viewport width
            grid.default_tiles_per_row = get_tiles_per_row(viewport_width)
            grid.save()
            # Load user's albums and grid's tiles
            albums = Album.objects.order_by("album_title").filter(user=request.user)
            tiles = Tile.objects.select_related("grid").filter(grid=grid).all()
            return JsonResponse({
                "grid": grid.serialize(),
                "tiles": [tile.serialize() for tile in tiles],
                "albums": [album.serialize() for album in albums]
            }, safe=False)
        else:
            return JsonResponse({"error": "Viewport width not found. Grid not returned."}, status=404)
    else:
        return JsonResponse({
            "error": "PUT request required."
        }, status=400)


def get_memory_grid(request, grid_id):
    """
    Returns a specified grid with the grid's tiles duplicated (2 each)
    and all the user's albums as JSON.
    """
    # Query for requested grid
    try:
        grid = Grid.objects.get(pk=grid_id)
    except Grid.DoesNotExist:
        return JsonResponse({"error": "Grid not found."}, status=404)

    if request.method == "PUT":
        data = json.loads(request.body)
        viewport_width = data.get("viewport_width")
        if viewport_width is not None:
            # Update grid's default tiles per row based on the current viewport width
            grid.default_tiles_per_row = get_tiles_per_row(viewport_width)
            grid.save()
            # Load user's albums and grid's tiles
            albums = Album.objects.order_by("album_title").filter(user=request.user)

            # Create a union of two tiles querysets
            # Learned from: https://stackoverflow.com/questions/431628/how-can-i-combine-two-or-more-querysets-in-a-django-view    #
            tiles1 = Tile.objects.select_related("grid").filter(grid=grid).all()
            tiles2 = Tile.objects.select_related("grid").filter(grid=grid).all()
            tiles = list(tiles1.union(tiles2, all=True))

            # Shuffle tiles, learned from: https://stackoverflow.com/questions/12073425/how-to-mix-queryset-results
            random.shuffle(tiles)

            return JsonResponse({
                "grid": grid.serialize(),
                "tiles": [tile.serialize() for tile in tiles],
                "albums": [album.serialize() for album in albums]
            }, safe=False)
        else:
            return JsonResponse({"error": "Viewport width not found. Match grid not returned."}, status=404)
    else:
        return JsonResponse({
            "error": "PUT request required."
        }, status=400)


def get_albums(request):
    """
    Returns all of a user's albums and grids as JSON.
    """
    # Get user's albums and grids in alphabetical order
    albums = Album.objects.order_by("album_title").filter(user=request.user)
    grids = Grid.objects.order_by("grid_title").filter(user=request.user)

    return JsonResponse({
        "albums": [album.serialize() for album in albums],
        "grids": [grid.serialize() for grid in grids]
    }, safe=False)


def add_or_remove_tiles(request, grid_id):
    """
    Adds or removes one or more tiles of a specified grid,
    then returns the grid, the grid's tiles, and all the user's albums as JSON.
    """
    # Query for requested grid
    try:
        grid = Grid.objects.get(pk=grid_id)
    except Grid.DoesNotExist:
        return JsonResponse({"error": "Grid not found."}, status=404)

    if request.method == "PUT":
        data = json.loads(request.body)
        old_count = int(data.get("old_count"))
        new_count = int(data.get("new_count"))
        viewport_width = data.get("viewport_width")
        # Limit count MIN-MAX
        new_count = MIN_TILE_COUNT if new_count < MIN_TILE_COUNT else MAX_TILE_COUNT if new_count > MAX_TILE_COUNT else int(data.get("new_count"))

        jsonDec = json.decoder.JSONDecoder()
        tile_order = jsonDec.decode(grid.tile_order)

        print(grid_id, old_count, new_count)

        if old_count is not None and new_count is not None and viewport_width is not None:
            # Add tile(s) to the grid
            if (new_count > old_count):
                for i in range(new_count - old_count):
                    tile = Tile.objects.create(user=request.user, grid=grid, tile_number=max(tile_order) + 1)
                    # Update grid tile order list
                    tile_order.append(max(tile_order) + 1)
                    grid.tile_order = json.dumps(tile_order)
                    grid.save()
            # Remove tile(s) from the grid
            else:
                for i in range(old_count - new_count):
                    tile = Tile.objects.get(user=request.user, grid=grid, tile_number=tile_order[-1])
                    # Delete image if not default image
                    if DEFAULT_TILE_IMG_NAME not in tile.image.url:
                        tile.image.delete()
                    # Delete audio file if there is one
                    if tile.audio is not None:
                        tile.audio.delete()
                    tile.delete()
                    # Update grid tile order list
                    del tile_order[-1]
                    grid.tile_order = json.dumps(tile_order)
                    grid.save()

            # Update grid's default tiles per row based on the current viewport width
            grid.default_tiles_per_row = get_tiles_per_row(viewport_width)
            # Check if grid should be marked as new
            grid.new = is_new(grid)
            grid.save()

            # Load user's albums and new grid's tiles
            albums = Album.objects.order_by("album_title").filter(user=request.user)
            tiles = Tile.objects.select_related("grid").filter(grid=grid).all()
            return JsonResponse({
                "grid": grid.serialize(),
                "tiles": [tile.serialize() for tile in tiles],
                "albums": [album.serialize() for album in albums]
            }, safe=False)
        else:
            return JsonResponse({"error": "Data not found. Tile(s) not added or removed."}, status=404)
    else:
        return JsonResponse({
            "error": "PUT request required."
        }, status=400)


def change_tiles_per_row(request, grid_id):
    """
    Changes the tiles per row of one specified grid, then returns the grid,
    the grid's tiles, and all the user's albums as JSON.
    """
    # Query for requested grid
    try:
        grid = Grid.objects.get(pk=grid_id)
    except Grid.DoesNotExist:
        return JsonResponse({"error": "Grid not found."}, status=404)

    if request.method == "PUT":
        data = json.loads(request.body)
        selected_tiles_per_row = data.get("selected_tiles_per_row")
        if selected_tiles_per_row is not None:
            grid.user_tiles_per_row = selected_tiles_per_row
            # Check if grid should be marked as new
            grid.new = is_new(grid)
            grid.save()
            print(f"Tiles per row changed to {selected_tiles_per_row}.")
            # Load user's albums and new grid's tiles
            albums = Album.objects.order_by("album_title").filter(user=request.user)
            tiles = Tile.objects.select_related("grid").filter(grid=grid).all()
            return JsonResponse({
                "grid": grid.serialize(),
                "tiles": [tile.serialize() for tile in tiles],
                "albums": [album.serialize() for album in albums]
            }, safe=False)
        else:
            return JsonResponse({"message": "Tiles per row not changed."}, status=404)
    else:
        return JsonResponse({
            "error": "PUT request required."
        }, status=400)


def delete_tile(request, grid_id):
    """
    Removes one tile of a specified grid, then returns the grid,
    the grid's tiles, and all the user's albums as JSON.
    """
    # Query for requested grid
    try:
        grid = Grid.objects.get(pk=grid_id)
    except Grid.DoesNotExist:
        return JsonResponse({"error": "Grid not found."}, status=404)

    if request.method == "PUT":
        data = json.loads(request.body)
        tile_number = int(data.get("tile_number"))
        viewport_width = data.get("viewport_width")

        jsonDec = json.decoder.JSONDecoder()
        tile_order = jsonDec.decode(grid.tile_order)

        if tile_number is not None and viewport_width is not None:
            # Remove specific tile from the grid
            tile = Tile.objects.get(user=request.user, grid=grid, tile_number=tile_number)
            # Delete image if not default image
            if DEFAULT_TILE_IMG_NAME not in tile.image.url:
                tile.image.delete()
            # Delete audio file if there is one
            if tile.audio is not None:
                tile.audio.delete()
            tile.delete()
            # Update grid tile order list
            tile_order.remove(tile_number)
            grid.tile_order = json.dumps(tile_order)
            grid.save()

            # Update grid's default tiles per row based on the current viewport width
            grid.default_tiles_per_row = get_tiles_per_row(viewport_width)
            # Check if grid should be marked as new
            grid.new = is_new(grid)
            grid.save()

            # Load user's albums and new grid's tiles
            albums = Album.objects.order_by("album_title").filter(user=request.user)
            tiles = Tile.objects.select_related("grid").filter(grid=grid).all()
            return JsonResponse({
                "grid": grid.serialize(),
                "tiles": [tile.serialize() for tile in tiles],
                "albums": [album.serialize() for album in albums]
            }, safe=False)
        else:
            return JsonResponse({"error": "Data not found. Tile not removed."}, status=404)
    else:
        return JsonResponse({
            "error": "PUT request required."
        }, status=400)


def create_album(request, new_album_title):
    """
    Attempts to create a new album given a title, then returns all the user's
    albums and grids, and a message if the album already exists, as JSON.
    """
    if request.method == "PUT":
        message = None

        # Check for existing albums with the same name and any capitalization
        albums = Album.objects.order_by("album_title").filter(user=request.user)
        album_titles = [album.album_title.upper() for album in albums]
        if new_album_title.upper() in album_titles:
            message = "An album with that title already exists."

        if message is None:
            # Create album if new title does not already exist and update albums
            Album.objects.create(user=request.user, album_title=new_album_title)
            albums = Album.objects.order_by("album_title").filter(user=request.user)
            print("New album created.")

        # Get user's albums and grids in alphabetical order
        grids = Grid.objects.order_by("grid_title").filter(user=request.user)

        return JsonResponse({
            "albums": [album.serialize() for album in albums],
            "grids": [grid.serialize() for grid in grids],
            "message": message
        }, safe=False)

    else:
        return JsonResponse({
            "error": "PUT request required."
        }, status=400)


def delete_album(request, album_id):
    """
    Deletes a specified album, all of its grids, and all their tiles,
    then returns all the user's remaining albums and grids as JSON.
    """
    # Query for requested album
    try:
        album = Album.objects.get(pk=album_id)
    except Album.DoesNotExist:
        return JsonResponse({"error": "Album not found."}, status=404)

    if request.method == "PUT":
        # Get all grids in this album
        grids = Grid.objects.select_related("album").filter(album=album).all()
        # Get each grids's tiles and delete their images if not default
        for grid in grids:
            tiles = Tile.objects.select_related("grid").filter(grid=grid).all()
            for tile in tiles:
                # Delete image if not default image
                if DEFAULT_TILE_IMG_NAME not in tile.image.url:
                    tile.image.delete()
                # Delete audio file if there is one
                    if tile.audio is not None:
                        tile.audio.delete()
        album.delete()
        print(f"Deleted album ID{album_id} and all of its grids and images.")

        # Get user's albums and grids in alphabetical order
        albums = Album.objects.order_by("album_title").filter(user=request.user)
        grids = Grid.objects.order_by("grid_title").filter(user=request.user)

        return JsonResponse({
            "albums": [album.serialize() for album in albums],
            "grids": [grid.serialize() for grid in grids]
        }, safe=False)

    else:
        return JsonResponse({
            "error": "PUT request required."
        }, status=400)


def delete_grids(request):
    """
    Deletes one or more specified grids and all their tiles,
    then returns all the user's albums and remaining grids as JSON.
    """
    # Query for requested grid
    if request.method == "PUT":
        data = json.loads(request.body)
        selected_grid_ids = data.get("selected_grid_ids")
        if selected_grid_ids is not None:
            # Delete all grids for selected grid IDs
            for grid_id in selected_grid_ids:
                grid = Grid.objects.get(pk=grid_id)
                # Get grids's tiles and delete their images if not default
                tiles = Tile.objects.select_related("grid").filter(grid=grid).all()
                for tile in tiles:
                    # Delete image if not default image
                    if DEFAULT_TILE_IMG_NAME not in tile.image.url:
                        tile.image.delete()
                    # Delete audio file if there is one
                    if tile.audio is not None:
                        tile.audio.delete()
                grid.delete()
                print(f"Deleted grid ID{grid_id} and all its images.")

            # Get user's albums and grids in alphabetical order
            albums = Album.objects.order_by("album_title").filter(user=request.user)
            grids = Grid.objects.order_by("grid_title").filter(user=request.user)
            return JsonResponse({
                "albums": [album.serialize() for album in albums],
                "grids": [grid.serialize() for grid in grids]
            }, safe=False)
        else:
            return JsonResponse({"message": "Data not found. No grids deleted."}, status=404)
    else:
        return JsonResponse({
            "error": "PUT request required."
        }, status=400)


def move_grids_to_album(request, album_id):
    """
    Moves one or more specified grids to a different album,
    then returns all the user's albums and grids as JSON.
    """
    # Query for requested album
    try:
        album = Album.objects.get(pk=album_id)
    except Album.DoesNotExist:
        return JsonResponse({"error": "Album not found."}, status=404)

    # Query for requested grid
    if request.method == "PUT":
        data = json.loads(request.body)
        selected_grid_ids = data.get("selected_grid_ids")
        if selected_grid_ids is not None:
            # Delete all grids for selected grid IDs
            for grid_id in selected_grid_ids:
                grid = Grid.objects.get(pk=grid_id)
                grid.album = album
                grid.save()
                print(f'Grid ID{grid_id} moved to "{album.album_title}" album ID{album.id}.')
            # Get user's albums and grids in alphabetical order
            albums = Album.objects.order_by("album_title").filter(user=request.user)
            grids = Grid.objects.order_by("grid_title").filter(user=request.user)
            return JsonResponse({
                "albums": [album.serialize() for album in albums],
                "grids": [grid.serialize() for grid in grids]
            }, safe=False)
        else:
            return JsonResponse({"message": "Data not found. No grids deleted."}, status=404)
    else:
        return JsonResponse({
            "error": "PUT request required."
        }, status=400)


def edit_grid_title(request, grid_id):
    """
    Attempts to changes the title of a specified grid, then returns the grid, the grid's tiles,
    all the user's albums, and a message if the grid already exists, as JSON.
    """
    # Query for requested grid
    try:
        grid = Grid.objects.get(pk=grid_id)
    except Grid.DoesNotExist:
        return JsonResponse({"error": "Grid not found."}, status=404)

    if request.method == "PUT":
        data = json.loads(request.body)
        updated_grid_title = data.get("updated_grid_title")
        viewport_width = data.get("viewport_width")
        message = None

        # Check for existing albums with the same name and any capitalization
        grids = Grid.objects.order_by("grid_title").filter(user=request.user)
        grid_titles = [grid.grid_title.upper() for grid in grids]
        if updated_grid_title.upper() in grid_titles and grid.grid_title.upper() != updated_grid_title.upper() and updated_grid_title.upper() != DEFAULT_GRID_TITLE.upper():
            message = "A grid with that title already exists."

        if updated_grid_title is not None and viewport_width is not None:
            if message is None:
                grid.grid_title = updated_grid_title
                # Update grid's default tiles per row based on the current viewport width
                grid.default_tiles_per_row = get_tiles_per_row(viewport_width)
                # Check if grid should be marked as new
                grid.new = is_new(grid)
                grid.save()
                print(f'New grid title saved as "{updated_grid_title}."')
            # Load user's albums and new grid's tiles
            albums = Album.objects.order_by("album_title").filter(user=request.user)
            tiles = Tile.objects.select_related("grid").filter(grid=grid).all()
            return JsonResponse({
                "grid": grid.serialize(),
                "tiles": [tile.serialize() for tile in tiles],
                "albums": [album.serialize() for album in albums],
                "message": message
            }, safe=False)
        else:
            return JsonResponse({"message": "Title not changed."}, status=404)
    else:
        return JsonResponse({
            "error": "PUT request required."
        }, status=400)


def edit_album_title(request, album_id):
    """
    Attempts to change the title of a specified album, then returns all the user's
    albums and grids, and a message if the album already exists, as JSON.
    """
    # Query for requested grid
    try:
        album = Album.objects.get(pk=album_id)
    except Album.DoesNotExist:
        return JsonResponse({"error": "Album not found."}, status=404)

    if request.method == "PUT":
        data = json.loads(request.body)
        updated_album_title = data.get("updated_album_title")
        message = None

        # Check for existing albums with the same name and any capitalization
        albums = Album.objects.order_by("album_title").filter(user=request.user)
        album_titles = [album.album_title.upper() for album in albums]
        if updated_album_title.upper() in album_titles and album.album_title.upper() != updated_album_title.upper():
            message = "An album with that title already exists."

        if updated_album_title is not None:
            # Create album if new title does not already exist and update albums
            if message is None:
                album.album_title = updated_album_title
                album.save()
                print(f'New album title saved as "{updated_album_title}."')
                albums = Album.objects.order_by("album_title").filter(user=request.user)
            # Get user's grids in alphabetical order
            grids = Grid.objects.order_by("grid_title").filter(user=request.user)
            return JsonResponse({
                "albums": [album.serialize() for album in albums],
                "grids": [grid.serialize() for grid in grids],
                "message": message
            }, safe=False)
        else:
            return JsonResponse({"message": "Title not changed."}, status=404)
    else:
        return JsonResponse({
            "error": "PUT request required."
        }, status=400)


def change_album(request, grid_id):
    """
    Moves one specified grid to a different album, then returns the grid,
    the grid's tiles, and all the user's albums as JSON.
    """
    # Query for requested grid
    try:
        grid = Grid.objects.get(pk=grid_id)
    except Grid.DoesNotExist:
        return JsonResponse({"error": "Grid not found."}, status=404)

    if request.method == "PUT":
        data = json.loads(request.body)
        viewport_width = data.get("viewport_width")
        selected_album_id = data.get("selected_album_id")
        if selected_album_id is not None and viewport_width is not None:
            album = Album.objects.get(pk=selected_album_id)
            grid.album = album
            # Update grid's default tiles per row based on the current viewport width
            grid.default_tiles_per_row = get_tiles_per_row(viewport_width)
            # Check if grid should be marked as new
            grid.new = is_new(grid)
            grid.save()
            print(f'Album changed to "{album.album_title}."')
            # Load user's albums and new grid's tiles
            albums = Album.objects.order_by("album_title").filter(user=request.user)
            tiles = Tile.objects.select_related("grid").filter(grid=grid).all()
            return JsonResponse({
                "grid": grid.serialize(),
                "tiles": [tile.serialize() for tile in tiles],
                "albums": [album.serialize() for album in albums]
            }, safe=False)
        else:
            return JsonResponse({"message": "Album not changed."}, status=404)
    else:
        return JsonResponse({
            "error": "PUT request required."
        }, status=400)


def change_quiz_preference(request, grid_id):
    """
    Changes the quiz preference of one specified grid, then returns the grid,
    the grid's tiles, and all the user's albums as JSON.
    """
    # Query for requested grid
    try:
        grid = Grid.objects.get(pk=grid_id)
    except Grid.DoesNotExist:
        return JsonResponse({"error": "Grid not found."}, status=404)

    if request.method == "PUT":
        data = json.loads(request.body)
        viewport_width = data.get("viewport_width")
        quiz_preference = data.get("quiz_preference")
        if quiz_preference is not None and viewport_width is not None:
            grid.quiz_preference = quiz_preference
            # Update grid's default tiles per row based on the current viewport width
            grid.default_tiles_per_row = get_tiles_per_row(viewport_width)
            # Check if grid should be marked as new
            grid.new = is_new(grid)
            grid.save()
            print(f'Grid quiz preference changed to "{quiz_preference}".')
            # Load user's albums and new grid's tiles
            albums = Album.objects.order_by("album_title").filter(user=request.user)
            tiles = Tile.objects.select_related("grid").filter(grid=grid).all()
            return JsonResponse({
                "grid": grid.serialize(),
                "tiles": [tile.serialize() for tile in tiles],
                "albums": [album.serialize() for album in albums]
            }, safe=False)
        else:
            return JsonResponse({"message": "Album not changed."}, status=404)
    else:
        return JsonResponse({
            "error": "PUT request required."
        }, status=400)


def reset_grid(request, grid_id):
    """
    Resets a grid and all of its tiles to new/default, then returns the grid,
    the grid's tiles, and all the user's albums as JSON.
    """
    # Query for requested grid
    try:
        grid = Grid.objects.get(pk=grid_id)
        tiles = Tile.objects.select_related("grid").filter(grid=grid).all()
    except Grid.DoesNotExist:
        return JsonResponse({"error": "Grid or tiles not found."}, status=404)

    if request.method == "PUT":
        data = json.loads(request.body)
        viewport_width = data.get("viewport_width")

        if viewport_width is not None:
            # Reset grid fields
            grid.grid_title = "New Grid"
            grid.album.album_title = "MyGrids"
            grid.tile_order = [i + 1 for i in range(12)]
            grid.default_tiles_per_row = 4
            grid.user_tiles_per_row = None
            grid.save()

            # Delete all tile images
            for tile in tiles:
                # Delete image if not default image
                if DEFAULT_TILE_IMG_NAME not in tile.image.url:
                    tile.image.delete()
                # Delete audio file if there is one
                if tile.audio is not None:
                    tile.audio.delete()
            print("All tile images and sound files deleted.")

            # Delete all grid tiles
            Tile.objects.filter(grid=grid).all().delete()
            print("All tiles deleted.")

            # Create 12 new default tile
            for i in range(12):
                Tile.objects.create(user=request.user, grid=grid, tile_number=i+1)
            print("New default tiles created.")
            print(f'Grid ID{grid_id} reset to new.')

            grid = Grid.objects.get(pk=grid_id)
            # Update grid's default tiles per row based on the current viewport width
            grid.default_tiles_per_row = get_tiles_per_row(viewport_width)
            # Check if grid should be marked as new
            grid.new = is_new(grid)
            grid.save()

            # Load user's albums and new grid's tiles
            albums = Album.objects.order_by("album_title").filter(user=request.user)
            tiles = Tile.objects.select_related("grid").filter(grid=grid).all()
            return JsonResponse({
                    "grid": grid.serialize(),
                    "tiles": [tile.serialize() for tile in tiles],
                    "albums": [album.serialize() for album in albums]
                }, safe=False)
        else:
            return JsonResponse({"message": "Grid not reset."}, status=404)
    else:
        return JsonResponse({
            "error": "PUT request required."
        }, status=400)


def sort_tiles(request, grid_id):
    """
    Sorts, reverses, or randomizes the tile order of a specified grid,
    then returns the grid, the grid's tiles, and all the user's albums as JSON.
    """
    # Query for requested grid
    try:
        grid = Grid.objects.get(pk=grid_id)
        tiles = Tile.objects.select_related("grid").filter(grid=grid).all()
    except Grid.DoesNotExist:
        return JsonResponse({"error": "Grid or tiles not found."}, status=404)

    if request.method == "PUT":
        data = json.loads(request.body)
        sort = data.get("sort")
        viewport_width = data.get("viewport_width")
        print(f"current tile order: {grid.tile_order}")
        if sort is not None and viewport_width is not None:
            # Get list of tile numbers based on sort
            if sort == "reverse":
                # Get current tile order from database to reverse
                jsonDec = json.decoder.JSONDecoder()
                new_tile_order = jsonDec.decode(grid.tile_order)
                new_tile_order.reverse()
            elif sort == "mix":
                sorted_tiles = tiles.order_by("pk").all()
                new_tile_order = [tile.tile_number for tile in sorted_tiles]
                random.shuffle(new_tile_order)
            else:
                sorted_tiles = Tile.objects.filter(grid=grid).order_by("pk").all()
                new_tile_order = [tile.tile_number for tile in sorted_tiles]
            # Save tile order list to grid object
            # Learned from: https://stackoverflow.com/questions/1110153/what-is-the-most-efficient-way-to-store-a-list-in-the-django-models
            grid.tile_order = json.dumps(new_tile_order)
            # Update grid's default tiles per row based on the current viewport width
            grid.default_tiles_per_row = get_tiles_per_row(viewport_width)
            # Check if grid should be marked as new
            grid.new = is_new(grid)
            grid.save()
            # Load user's albums
            albums = Album.objects.order_by("album_title").filter(user=request.user)
            return JsonResponse({
                "grid": grid.serialize(),
                "tiles": [tile.serialize() for tile in tiles],
                "albums": [album.serialize() for album in albums]
            }, safe=False)
        else:
            return JsonResponse({"error": "Tile order not changed."}, status=404)
    else:
        return JsonResponse({
            "error": "PUT request required."
        }, status=400)


def add_image(request, tile_id):
    """
    Adds an image to a specified tile, then returns the tile,
    and a message if the image isn't validated, as JSON.
    """
    # Query for requested tile
    try:
        tile = Tile.objects.get(pk=tile_id)
    except Tile.DoesNotExist:
        return JsonResponse({"error": "Tile not found."}, status=404)

    if request.method == "POST":
        image = request.FILES.get("image")
        if image is not None:
            print(f"Image received: {image}")
            # Save image file if it passes file size and type validation
            message = None
            mime_type = get_mime_type(image)

            # Check image file size and mime type
            if image.size > MAX_IMAGE_SIZE:
                message = "Image file is too big."
            elif mime_type != "image/jpeg":
                message = "Not a valid image file."
            else:
                # Compress image in memory
                # Learned from: https://pythoncircle.com/post/707/how-to-compress-the-uploaded-image-before-storing-it-in-django/
                i = Image.open(image)
                thumb_io = BytesIO()

                # Set image quality and max width/height (square dimensions)
                quality = 70
                max_width_or_height = 1600

                # Resize the image if height is over 2160
                # Learned from: https://stackoverflow.com/questions/10607468/how-to-reduce-the-image-file-size-using-pil
                width, height = i.size
                if width > max_width_or_height or height > max_width_or_height:
                    i = i.resize((max_width_or_height, max_width_or_height), Image.ANTIALIAS)
                    print("image resized")

                # Save and compress the image in memory
                i.save(thumb_io, format='JPEG', optimize=True, quality=quality)
                compressed_image = InMemoryUploadedFile(thumb_io, None, str(image), 'image/jpeg', thumb_io.tell(), None)

                # Remove tile image if not default
                old_tile_image = tile.image
                if DEFAULT_TILE_IMG_NAME not in old_tile_image.url:
                    print(f"Deleting {old_tile_image} and replacing with {image}.")
                    old_tile_image.delete()
                # Add resized, compressed, and validated image in memory to tile
                tile.image = compressed_image
                tile.save()

            # Check if grid should be marked as new
            grid = Grid.objects.get(pk=tile.grid.id)
            grid.new = is_new(grid)
            grid.save()
            return JsonResponse({
                "tile": tile.serialize(),
                "message": message
            })
        else:
            return JsonResponse({"error": "Image not added."}, status=404)
    else:
        return JsonResponse({
            "error": "POST request required."
        }, status=400)


def remove_image(request, tile_id):
    """
    Removes an image from a specified tile, then returns the tile as JSON.
    """
    # Query for requested tile
    try:
        tile = Tile.objects.get(pk=tile_id)
    except Tile.DoesNotExist:
        return JsonResponse({"error": "Tile not found."}, status=404)

    if request.method == "PUT":
        # Remove tile image if not default
        if DEFAULT_TILE_IMG_NAME not in tile.image.url:
            print(f"Deleting {tile.image}.")
            tile.image.delete()
        # Add default image to tile
        tile.image = DEFAULT_TILE_IMG_URL
        tile.save()
        # Check if grid should be marked as new
        grid = Grid.objects.get(pk=tile.grid.id)
        grid.new = is_new(grid)
        grid.save()
        return JsonResponse(tile.serialize())
    else:
        return JsonResponse({
            "error": "PUT request required."
        }, status=400)


def add_audio(request, tile_id):
    """
    Adds an audio file to a specified tile, then returns the tile,
    and a message if the audio file isn't validated, as JSON.
    """
    # Query for requested tile
    try:
        tile = Tile.objects.get(pk=tile_id)
    except Tile.DoesNotExist:
        return JsonResponse({"error": "Tile not found."}, status=404)

    if request.method == "POST":
        audio_file = request.FILES.get("audio_file")
        if audio_file is not None:
            print(f"Sound file received: {audio_file}")
            # Save audio file if it passes file size and type validation
            message = None
            mime_type = get_mime_type(audio_file)
            print (f"audio_file mime_type: {mime_type}")
            if audio_file.size > MAX_AUDIO_SIZE:
                message = "Audio file cannot exceed 2.5 MB."
            elif mime_type != "audio/x-wav" and mime_type != "audio/mpeg":
                message = "Audio file must be either .mp3 or .wav. (server)"
            else:
                # Delete old tile audio file if there is one
                old_tile_audio = tile.audio
                if old_tile_audio:
                    print(f"Deleting {old_tile_audio} and replacing with {audio_file}.")
                    old_tile_audio.delete()
                # Add audio file to tile
                tile.audio = audio_file
                tile.save()

                # Convert audio file to mp3 only if user upload (not a user recording)
                filename = os.path.basename(tile.audio.name)
                if "gs_user_recording" not in filename:
                    # Create export path based on current audio file path and filename
                    filename_no_ext = Path(str(tile.audio)).stem
                    new_filename = f"{filename_no_ext}_x.mp3"
                    export_path = f"media/gridsquid/aud/{request.user.id}/{tile.grid.id}/{new_filename}"
                    tile_path = f"gridsquid/aud/{request.user.id}/{tile.grid.id}/{new_filename}"

                    # Convert audio file to mp3 using pydub
                    # Learned from: https://stackoverflow.com/questions/1246131/python-library-for-converting-files-to-mp3-and-setting-their-quality
                    sound = AudioSegment.from_file(tile.audio.path)
                    sound.export(export_path, format="mp3", bitrate="128k")

                    # Replace original audio file with converted mp3
                    tile.audio.delete()
                    tile.audio = tile_path
                    tile.save()
                    new_filename = os.path.basename(tile.audio.name)
                    print(f"{filename} converted to mp3 and replaced with {new_filename}")
                else:
                    print(f"{filename} not converted because it is a user recording.")

                # Check if grid should be marked as new
                grid = Grid.objects.get(pk=tile.grid.id)
                grid.new = is_new(grid)
                grid.save()
            return JsonResponse({
                "tile": tile.serialize(),
                "message": message
            })
        else:
            return JsonResponse({"error": "Audio file not added."}, status=404)
    else:
        return JsonResponse({
            "error": "POST request required."
        }, status=400)


def remove_audio(request, tile_id):
    """
    Removes an audio file from a specified tile, then returns the tile as JSON.
    """
    # Query for requested tile
    try:
        tile = Tile.objects.get(pk=tile_id)
    except Tile.DoesNotExist:
        return JsonResponse({"error": "Tile not found."}, status=404)

    if request.method == "PUT":
        # Delete audio file if there is one
        if tile.audio:
            tile.audio.delete()
        tile.save()
        # Check if grid should be marked as new
        grid = Grid.objects.get(pk=tile.grid.id)
        grid.new = is_new(grid)
        grid.save()
        return JsonResponse(tile.serialize())
    else:
        return JsonResponse({
            "error": "PUT request required."
        }, status=400)


def get_tile(request, tile_id):
    """
    Returns a specified tile as JSON.
    """
    # Query for requested tile
    try:
        tile = Tile.objects.get(user=request.user, pk=tile_id)
    except Tile.DoesNotExist:
        return JsonResponse({"error": "Tile not found."}, status=404)

    return JsonResponse(tile.serialize())


def update_tile_text(request, tile_id):
    """
    Adds text to a specified tile, then returns the tile,
    and a message if the text isn't validated, as JSON.
    """
    # Query for requested tile
    try:
        tile = Tile.objects.get(user=request.user, pk=tile_id)
    except Tile.DoesNotExist:
        return JsonResponse({"error": "Tile not found."}, status=404)

    if request.method == "POST":
        message = None
        data = json.loads(request.body)
        tile_text = data.get("tile_text")
        if tile_text is not None:
            if len(tile_text) > MAX_TILE_TEXT_CHARS:
                message = "Tile text cannot be more than 100 characters."
            if message is None:
                # Update tile text
                tile.text = tile_text
                tile.save()
                print("Tile text updated.")
            # Check if grid should be marked as new
            grid = Grid.objects.get(pk=tile.grid.id)
            grid.new = is_new(grid)
            grid.save()
            return JsonResponse({
                "tile": tile.serialize(),
                "message": message
            })
    else:
        return JsonResponse({
            "error": "POST request required."
        }, status=400)


def remove_tile_text(request, tile_id):
    """
    Removes text from a specified tile, then returns the tile as JSON.
    """
    # Query for requested tile
    try:
        tile = Tile.objects.get(user=request.user, pk=tile_id)
    except Tile.DoesNotExist:
        return JsonResponse({"error": "Tile not found."}, status=404)

    if request.method == "PUT":
        # Remove tile text
        tile.text = None
        tile.save()
        print("Tile text removed.")
        # Check if grid should be marked as new
        grid = Grid.objects.get(pk=tile.grid.id)
        grid.new = is_new(grid)
        grid.save()
        return JsonResponse(tile.serialize())
    else:
        return JsonResponse({
            "error": "PUT request required."
        }, status=400)


def get_tiles_per_row(viewport_width):
    """
    Sets tiles per row based on the current viewport width.
    """
    if viewport_width < 340:
        return SMALL_WIDTH_TILES_PER_ROW
    elif viewport_width < 620:
        return MEDIUM_WIDTH_TILES_PER_ROW
    return LARGE_WIDTH_TILES_PER_ROW


# Learned from: https://stackoverflow.com/questions/4853581/django-get-uploaded-file-type-mimetype
# https://github.com/ahupp/python-magic
def get_mime_type(file):
    """
    Get MIME by reading the header of the file.
    """
    initial_pos = file.tell()
    file.seek(0)
    mime_type = magic.from_buffer(file.read(2048), mime=True)
    file.seek(initial_pos)
    return mime_type


def is_new(grid):
    """
    Checks if a grid has all default fields and is therefore new.
    """
    print("checking new...")
    # Get the grid's tiles and check for default fields
    tiles = Tile.objects.select_related("grid").filter(grid=grid).all()
    for tile in tiles:
        if DEFAULT_TILE_IMG_NAME not in tile.image.url or tile.audio != "" or tile.text is not None:
            return False
    if grid.grid_title == "New Grid" and grid.album.album_title == "MyGrids" and grid.tile_order == "[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]":
        return True
    else:
        return False


def welcome(request):
    """
    Shows user the landing/welcome page.
    """
    return render(request, "gridsquid/welcome.html")


def cleanup(request):
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
    return HttpResponse(f"Deleted {expired_guests_count} guest account(s) older than {MAX_GUEST_ACCOUNT_DAYS} days, any associated media, and all media empty folders.")


def login_view(request):
    """
    Logs in users and guests, or redirects unlogged users to login.
    """
    # Check if user is a guest
    guest = is_guest(request)

    if request.method == "POST":

        # Attempt to log user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check authentication
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "gridsquid/login.html", {
                "message": "Invalid username and/or password. Please try again."
            })
    else:
        # Prevent logged-in non-guests from viewing login page
        if guest == False:
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "gridsquid/login.html")


def logout_view(request):
    """
    Logs users out!
    """
    logout(request)
    return HttpResponseRedirect(reverse("login"))


def register(request):
    """
    Registers new users or converts guest accounts to user accounts,
    then logs in and redirects users to index.
    """
    # Check if user is a guest
    guest = is_guest(request)

    # Try to get guest name from cookie and register/login as a guest
    try:
        if not request.user.is_authenticated:
            create_and_login_guest(request)
    except:
        return HttpResponseRedirect(reverse("login"))

    # Proceed with registration/conversion of logged-in guest
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]

        # Check for blank input
        if username == "" or email == "" or password == "" or confirmation == "":
            return render(request, "gridsquid/register.html", {
                "message": "Please fill in all fields."
            })

        # Check password and confirmation match
        if password != confirmation:
            return render(request, "gridsquid/register.html", {
                "message": "Passwords must match."
            })

        # Check if email is already is use by another user
        if User.objects.filter(email=email).count() > 0:
            return render(request, "gridsquid/register.html", {
                "message": "That email is already in use."
            })

        # Attempt to convert guest user to new user
        try:
            User.objects.filter(pk=request.user.id).update(username=username, email=email, guest=False)
            user = User.objects.get(pk=request.user.id)
            user.set_password(password)
            user.save()
        except IntegrityError:
            return render(request, "gridsquid/register.html", {
                "message": "That username is already taken."
            })

        # Login new user if successful and redirect to index
        login(request, user)
        response = HttpResponseRedirect(reverse("index"))
        response.delete_cookie("guest_name")
        return response
    else:
        # Prevent logged-in non-guests from viewing registration page
        if guest == True:
            return render(request, "gridsquid/register.html")
        else:
            return HttpResponseRedirect(reverse("index"))


def is_guest(request):
    """
    Checks if user is a guest, i.e. not a registered user.
    """
    # Check if user is a guest
    try:
        if request.user.guest == False:
            guest = False
        else:
            guest = True
    except:
        guest = True
    return guest


def is_unlimited(request):
    """
    Checks if user can make unlimited grids as set manually by an administrator.
    """
    try:
        if request.user.unlimited == True:
            unlimited = True
        else:
            unlimited = False
    except:
        unlimited = False
    return unlimited


def create_and_login_guest(request):
    """
    Creates and logs in a guest account.
    """
    # Get guest name (UUID) from cookie
    guest_name = request.COOKIES["guest_name"]
    print(f"Guest name: {guest_name}")

    # Get or create user based on guest name and login that guest
    user, created = User.objects.get_or_create(username=guest_name, guest=True)
    print(f"New guest created: {created}")
    user.set_password("password")
    user.save()
    login(request, user)