from django.contrib import admin

from .models import *

class UserAdmin(admin.ModelAdmin):
    readonly_fields = ("id",)

class AlbumAdmin(admin.ModelAdmin):
    readonly_fields = ("id",)

class GridAdmin(admin.ModelAdmin):
    readonly_fields = ("id",)

class TileAdmin(admin.ModelAdmin):
    readonly_fields = ("id",)

# Register your models here.
admin.site.register(User, UserAdmin)
admin.site.register(Album, AlbumAdmin)
admin.site.register(Grid, GridAdmin)
admin.site.register(Tile, TileAdmin)