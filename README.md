# GridSquid
## Video Demo
https://youtu.be/qhYY0cqv-ig

## Description
GridSquid is a web application that lets users create custom grids of tiles that can contain user-uploaded images, sound files, and captions. GridSquid was written as a single-page application using Django and JavaScript as a capstone project for CS50 Web in 2022.

## Distinctiveness and Complexity:
- GridSquid is an original idea unlike any other project assignment in the CS50-Web course and the code is significantly more complex (over 1,300 lines of Python and 2,900 lines of JavaScript).
- Django is utilized with 4 models on the back-end and JavaScript on the front-end.
- It is not a social network nor an e-commerce site.
- All of GridSquid is mobile responsive via CSS flexbox, media queries, and JavaScript (on window resize event).

## Background
I wanted to create an app that would help my toddler-age kids learn the names and faces of our numerous family members. I imagined a simple grid of tiles with photos that, when tapped, would enlarge, play a sound, and display the person's name in the photo. Tapping the enlarged photo again would simply return to the grid, allowing for another tile to be chosen. This seemeed like something my kids would enjoy using and I would enjoy creating.

Eventually, it seemed this could be useful in a homeschool setting: parents could create grids on any subject by adding photos, associated audio, and text. Imagine a grid on Egypt, sea life, or the US presidents. In this way, GridSquid could serve as custom, interactive, multimedia flashcards.

While the intended use case is for young kids and parents of those kids, for educational purposes, there is nothing stopping users of other age groups from making use of GridSquid in other imaginative ways.

## Features
**Guest Accounts:**
- Any user may use GridSquid as a guest, without registering.
- Guest accounts are limited to 3 grids and will be deleted after 30 days via a scheduled task.
- Guest content is saved just like registered user content, using a UUID as the username.
- Guests that register have their accounts converted to a user account, so they won't lose any saved content.

**Edit Mode:**
- Create a custom grid with 1-36 tiles, easily adding or removing single or multiple tiles at a time.
- Rename grids and organize them into albums.
- Re-sort or re-size tiles of a grid
- Icons on each tile indicating which tiles have audio and/or captions.
- Click each tile to expand and edit that tile.
- Upload an image to each tile, then crop the image or adjust the current crop.
- Upload an audio file or add a direct recording with your microphone to each tile.
- Image (jpeg) and audio (mp3) compression to keep file sizes small.
- Add a caption up to 50 characters to each tile.
- Loop through each tile via previous and next buttons, no matter the tile order.

**View Mode:**
- Only shows tiles in grids that have content.
- Retains the grid's tile order and tile size.
- Click each tile to expand the tile, viewing its enlarged image, text, and playing its audio.
- Click again on expanded tiles to return to the grid.
- Click "Memory" on any grid to play a memory game with tiles that have images.
- Click "Quiz" on any grid to be quizzed on which tiles (with images) match which audio or text.

**MyGrids:**
- View all of your saved grids, organized into albums.
- Create new albums and rename them easily.
- Select multiple grids and either move them to another album or delete them.
- Delete an album and all of its contents (grids, tiles of those grids, and media of those tiles).

**Future Features:**
- Email confirmations via tokenized URL.
- Ability to share grids via permanent URL.
- Cloud storage on AWS
- Custom confirmations
- Migrate from SQLite to PostgreSQL

## Challenges:
The following were the main challenges when I began this project. How to:
- Create a login system that would allow guest users but limit potentially malicious users
- Create the grid itself using JavaScript (this was my first JavaScript project)
- Allow users to customize the grid: number of tiles, size of tiles, and order of tiles
- Make an intuitive UI (e.g. clicking grid title to edit it and clicking elsewhere to auto save)
- Allow users to upload images
- Organize and handle the filenames of user uploads
- Handle image cropping, adjustments, and compression
- Allow users to record their own audio and/or upload audio files
- Convert uploaded audio files to mp3
- Store the user uploads (local vs cloud service)
- Limit/validate user uploads by file size and type
- "Open" a tile over the grid
- Loop through the tiles no matter the order
- Organize the grids into albums
- Switch between modes (edit and view, and later a memory game and quiz)
- Limit/prevent malicious use (using innerText instead of innerHTML in most cases)

## Libraries:
To overcome some of the above problems, I used the following libraries:
- Bootstrap 5 for CSS and some UI features: https://getbootstrap.com/docs/5.2/getting-started/introduction/
- Pillow to handle the image fields and compression: https://python-pillow.org/
- Cropper.js to handle image cropping: https://fengyuanchen.github.io/cropperjs/
- Microphone Recorder to mp3 - https://github.com/closeio/mic-recorder-to-mp3
- Pydub for converting wav to mp3: http://pydub.com/ (requires ffmpeg: https://ffmpeg.org/download.html)
- Python Magic for validating file/mime types of image and audio files: https://github.com/ahupp/python-magic
- Python-dotenv for environment variables: https://github.com/theskumar/python-dotenv

## Main Files:
### models.py
- User - Uses Django's User class; unregistered users are marked as guests with a UID from a cookie on the frontend; registering converts the current guest account into a non-guest account.
- Album - Albums "contain" grids; the default grid is named "MyGrids" and cannot be deleted; additional albums can be created, renamed, and deleted.
- Grid - Grid's "contain" tiles; keeps track of if the grid is new (unchanged from default); new grids are named "New Grid" by default and can be renamed or deleted; also keeps track of tile order, quiz preference, and tiles per row, allowing the user to re-order and "re-size" the tiles of their grid by setting a non-default tiles per row. If left to default, the default tiles per row is calculated responsively based on the current width of the main view div any time the window is resized.
- Tile - Tiles "belong" to a specific grid (which "belongs" to a specific album); each tile has a tile number and can have its own image, audio file, or caption (text field); the image field points to a default image indicating the tile is "empty".

### views.py
This file contains all of my views and APIs written in Python.

**Views:**
- welcome - Shows welcome landing page upon first visit. It is on this page that guest UID cookies are first generated.
- index - Checks if user is a guest or non-guest user. If neither, redirects to Login.
- cleanup - Deletes all guest user accounts and their media if older than MAX_GUEST_ACCOUNT_DAYS (currently 30 days) as well as any empty folders in the media directory. (This view allows for cleanup to happen manually; however the same function is also set as a scheduled daily task using a custom command.)
- login_view - Logs in users or allows users to proceed as guests.
- Logout_view - Logs out user and redirects to Login.
- register - Registers users, converting guest accounts to user accounts, and redirects to Index.

**APIs:**
- new_grid - Creates a new grid if user has no new grids, loads new grid if one exists, or loads most recent grid if user has reached their grid limit.
- get_albums - Returns all of a user's albums and grids as JSON.
- add_or_remove_tiles - Adds or removes one or more tiles of a specified grid, then returns the grid, the grid's tiles, and all the user's albums as JSON.
- change_tiles_per_row(request, grid_id) - Changes the tiles per row of one specified grid, then returns the grid,the grid's tiles, and all the user's albums as JSON.
- delete_tile - Removes one tile of a specified grid, then returns the grid, the grid's tiles, and all the user's albums as JSON.
- create_album - Attempts to create a new album given a title, then returns all the user's albums and grids, and a message if the album already exists, as JSON.
- delete_album - Deletes a specified album, all of its grids, and all their tiles, then returns all the user's remaining albums and grids as JSON.
- delete_grids - Deletes one or more specified grids and all their tiles, then returns all the user's albums and remaining grids as JSON.
- move_grids_to_album - Moves one or more specified grids to a different album, then returns all the user's albums and grids as JSON.
- edit_album_title - Attempts to change the title of a specified album, then returns all the user's albums and grids, and a message if the album already exists, as JSON.
- edit_grid_title - Attempts to changes the title of a specified grid, then returns the grid, the grid's tiles, all the user's albums, and a message if the grid already exists, as JSON.
- change_album - Moves one specified grid to a different album, then returns the grid, the grid's tiles, and all the user's albums as JSON.
- reset_grid - Resets a grid and all of its tiles to new/default, then returns the grid, the grid's tiles, and all the user's albums as JSON.
- sort_tiles - Sorts, reverses, or randomizes the tile order of a specified grid, then returns the grid, the grid's tiles, and all the user's albums as JSON.
- add_image - Adds an image to a specified tile, then returns the tile, and a message if the image isn't validated, as JSON.
- remove_image - Removes an image from a specified tile, then returns the tile as JSON.
- update_tile_text - Adds text to a specified tile, then returns the tile, and a message if the text isn't validated, as JSON.
- remove_tile_text - Removes text from a specified tile, then returns the tile as JSON.
- add_audio - Adds an audio file to a specified tile, then returns the tile, and a message if the audio file isn't validated, as JSON.
- remove_audio - Removes an audio file from a specified tile, then returns the tile as JSON.
- get_grid - Returns a specified grid, the grid's tiles, and all the user's albums as JSON.
- get_memory_grid - Returns a specified grid with the grid's tiles duplicated (2 each) and all the user's albums as JSON.
- get_tile - Returns a specified tile as JSON.

**Helper Functions:**
- get_tiles_per_row - Sets tiles per row based on the current viewport width.
- get_mime_type - Get MIME by reading the header of the file (using Python Magic).
- is_new - Checks if a grid has all default fields and is therefore new.
- is_guest - Checks if user is a guest, i.e. not a registered user.
- is_unlimited - Checks if user can make unlimited grids as set manually by an administrator.
- create_and_login_guest - Creates and logs in a guest account.

### cleanup.py (management/commands/)
This is a custom command (python manage.py cleanup) that deletes all guest accounts older than 30 days, their media, and empty folders in the media directory. This command will be executed as a daily scheduled task once deployed. (Note: the same cleanup function can also be executed via the /cleanup view)

### HTML Files
- index.html - Extends layout.html, loads guestcookie.js and gridsquid.js, and creates the site's various "view" divs.
- layout-login.html - Loads fewer files only needed by login templates: fonts, favicon files, CSS files, and bootstrap JS library.
- layout.html - Load's the site's fonts, favicon files, CSS files, JS library files (bootstrap, cropper, and mp3 recorder), and main site nav.
- login.html - Extends layout-login.html and is the template for the main login.
- register.html - Extends layout-login.html and is the template for registration.
- reset-password.html - Extends layout-login.html and is the template for password reset (instructions, submit email, etc.)
- reset-password-sent.html - Extends layout-login.html and is the template for password resent once sent.
- reset.html - Extends layout-login.html and is the template for resetting password after clicking link from email.
- reset-password-complete.html - Extends layout-login.html and is the template confirming password has been reset.
- welcome.html - Extends layout-login.html and is the template for landing page, containing bootstrap carousel, site description, and login links.

## Static Folders/Files
 - aud (folder) - Contains any sound files used by the application (mostly for the memory game and quiz).
- CSS (folder) - Contains the main CSS file for the project.
- img (folder) - Contains any image files used by the application (logos, icons, etc.).
- js (folder) - Contains all the javascript files.

### guestcookie.js
This file generates a cookie, based on a UUID, for guest users.

### gridsquid.js
This file contains the bulk of the JavaScript code of the project.

**Main functions:**
- showView - Hides all views and then shows desired view.
- mygrids - Handles everything in the myGrid section, which organizes grids into albums.
- createGrid - Handles the display of grids in various modes: edit, view, memory, and quiz.
- createTile - Handles the display of individual tiles, enlarged over the grid, in various sections: image, audio, and text.

**Helper functions:**
- createHTML - Helps streamline the creation of elements, setting classes, IDs, innerText, and innerHTML.
- getTileFromTileNumber - Uses filter method to get tile object of a specific tile number.
- hasAudio - Uses Some method to check if there is at least one tile that has an image and audio.
- hasText - Uses Some method to check if there is at least one tile that has an image and text.
- getViewportWidth - Returns the current grid width from the DOM (used by the backend to calculate tiles per row).
- appendUIDToFilename - Appends 7-digit uid to filename to prevent cache duplication in browser.
- removeUIDFromFilename - Removes 7-digit uid from filename so uid can be replaced when image is re-saved.
- display - Set the display of an array of elements.

**Fetches:**
- fetchNewGrid - Fetches latest new grid or create one if there are none.
- fetchAlbums - Fetches all albums.
- fetchCreateAlbum - Creates a new album.
- fetchDeleteAlbum - Deletes a single album (via trash icon) along with all its grid and the grid's media.
- fetchDeleteGrids - Deletes one or multiple grids and their media.
- fetchMoveGridsToAlbum - Changes the album of one or multiple grids.
- fetchEditAlbumTitle - Changes an album's title.
- fetchEditGridTitle - Changes a grid's title.
- fetchChangeAlbum - Changes a single grid's album.
- fetchChangeQuizPreference - Changes quiz preference (audio or text, audio only, text only).
- fetchAddOrRemoveTiles - Adds or remove one or multiple tiles from a specific grid.
- fetchChangeTilesPerRow - Sets a tiles per row preference for a specific grid.
- fetchDeleteTile - Deletes a single tile (via trash icon).
- fetchResetGrid - Resets a grid, deleting all its media and setting everything to a new/default value.
- fetchSortTiles - Sorts a specific grid's tiles (reverse, random, or default sort).
- fetchAddImage - Adds an image to a specific tile, replacing the default image.
- fetchRemoveImage - Removes an image from a specific tile, resetting to the default image.
- fetchUpdateTileText - Adds new or update existing text of a specific tile.
- fetchRemoveTileText - Removes the text from a specific tile.
- fetchAddAudio - Adds an audio file to a specific tile.
- fetchRemoveAudio - Removes an audio file from a specific tile.
- fetchGetGrid - Fetches a single grid.
- fetchGetMemoryGrid - Fetches a single grid with duplicated tiles for the memory game.
- fetchGetTile - Fetches a single tile.