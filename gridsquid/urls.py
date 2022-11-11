from django.urls import path
from django.contrib.auth import views as auth_views

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("welcome", views.welcome, name="welcome"),
    path("cleanup", views.cleanup, name="cleanup"),
    # Password reset learned from: https://docs.djangoproject.com/en/4.1/topics/auth/default/
    # and https://www.youtube.com/watch?v=sFPcd6myZrY&ab_channel=DennisIvy
    path("reset_password",
        auth_views.PasswordResetView.as_view(template_name="gridsquid/reset-password.html"),
        name="password_reset"),
    path("reset_password_sent",
        auth_views.PasswordResetDoneView.as_view(template_name="gridsquid/reset-password-sent.html"),
        name="password_reset_done"),
    path("reset/<uidb64>/<token>",
        auth_views.PasswordResetConfirmView.as_view(template_name="gridsquid/reset.html"),
        name="password_reset_confirm"),
    path("reset_password_complete",
        auth_views.PasswordResetCompleteView.as_view(template_name="gridsquid/reset-password-complete.html"),
        name="password_reset_complete"),

    # URL patters from history state that should reload index view
    path("home", views.index, name="index"),
    path("about", views.index, name="index"),
    path("mygrids", views.index, name="index"),
    path("create-grid", views.index, name="index"),
    path("view-grid", views.index, name="index"),
    path("edit-grid", views.index, name="index"),
    path("view-tile", views.index, name="index"),
    path("edit-tile", views.index, name="index"),
    path("memory", views.index, name="index"),
    path("quiz", views.index, name="index"),

    # API Routes
    path("new_grid", views.new_grid, name="new_grid"),
    path("get_albums", views.get_albums, name="get_albums"),
    path("add_or_remove_tiles/<int:grid_id>", views.add_or_remove_tiles, name="add_or_remove_tiles"),
    path("change_tiles_per_row/<int:grid_id>", views.change_tiles_per_row, name="change_tiles_per_row"),
    path("delete_tile/<int:grid_id>", views.delete_tile, name="delete_tile"),
    path("create_album/<str:new_album_title>", views.create_album, name="create_album"),
    path("delete_album/<int:album_id>", views.delete_album, name="delete_album"),
    path("delete_grids", views.delete_grids, name="delete_grids"),
    path("move_grids_to_album/<int:album_id>", views.move_grids_to_album, name="move_grids_to_album"),
    path("edit_album_title/<int:album_id>", views.edit_album_title, name="edit_album_title"),
    path("edit_grid_title/<int:grid_id>", views.edit_grid_title, name="edit_grid_title"),
    path("change_album/<int:grid_id>", views.change_album, name="change_album"),
    path("change_quiz_preference/<int:grid_id>", views.change_quiz_preference, name="change_quiz_preference"),
    path("reset_grid/<int:grid_id>", views.reset_grid, name="reset_grid"),
    path("sort_tiles/<int:grid_id>", views.sort_tiles, name="sort_tiles"),
    path("add_image/<int:tile_id>", views.add_image, name="add_image"),
    path("remove_image/<int:tile_id>", views.remove_image, name="remove_image"),
    path("update_tile_text/<int:tile_id>", views.update_tile_text, name="update_tile_text"),
    path("remove_tile_text/<int:tile_id>", views.remove_tile_text, name="remove_tile_text"),
    path("add_audio/<int:tile_id>", views.add_audio, name="add_audio"),
    path("remove_audio/<int:tile_id>", views.remove_audio, name="remove_audio"),
    path("get_grid/<int:grid_id>", views.get_grid, name="get_grid"),
    path("get_memory_grid/<int:grid_id>", views.get_memory_grid, name="get_memory_grid"),
    path("get_tile/<int:tile_id>", views.get_tile, name="get_tile"),
]
