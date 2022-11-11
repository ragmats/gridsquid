    // TODO/Notes:
    // Add a "test" option. Similar to "memory" but with no flipping. If sounds and/or text, tap the tile that matches a random sound/text.
    // Should show: Question 1 of X
    // Should have the option to toggle: Audio only, text only, audio and text

    // Create/style landing page (logo link page)
    // Improve/style about page
    // Start documentation
    // Limit guest accounts to 1 grid only, real accounts to 5
    // Deploy
    // Record video

    // Future TODO:
    // Custom alert/confirmations

    // ? Questions:
    // Do all my promises need error catches?
    // History state so it's not annoying if pressing back? (Probably not)
    // Do I need to sanitize my user inputs?
    // Limit file sizes of uploads, and number of grids/uploads?
        // ! https://docs.djangoproject.com/en/4.0/topics/security/#user-uploaded-content-security
    // Create a task to delete guest accounts after a certain time
    // Does deleting a user with grids that have images/sounds cascade to delete the files? Check on this.
    // ! Make sure inputs do not allow innerHTML and are limited to innerText

const MIN_TILE_COUNT = 1
const MAX_TILE_COUNT = 36
const DEFAULT_TILE_IMG_NAME = "defaultsquid.svg"
const DEFAULT_TILE_IMG_URL = "../static/gridsquid/img/defaultsquid.svg"
const TILE_AUDIO_ICON_URL = "../static/gridsquid/img/audio.svg"
const TILE_TEXT_ICON_URL = "../static/gridsquid/img/text.svg"
const TILE_TRASH_ICON_URL = "../static/gridsquid/img/trash.svg"
const PLAY_BUTTON_URL = "../static/gridsquid/img/play.svg"
const MAX_TILE_TEXT_CHARS = 50
const DEFAULT_TILE_TEXT = "Enter tile text"
const MAX_IMAGE_SIZE = 10485760
const MAX_AUDIO_SIZE = 2621440
const DEFAULT_AUDIO_RCORDING_NAME = "gs_user_recording.mp3"
const DEFAULT_GRID_MODE = "edit"
const MATCH_CLICK1_URL = "../static/gridsquid/aud/click1.mp3"
const MATCH_CLICK2_URL = "../static/gridsquid/aud/click2.mp3"
const MATCH_MATCH_URL = "../static/gridsquid/aud/match.mp3"
const MATCH_NO_MATCH_URL = "../static/gridsquid/aud/no_match.mp3"
const MATCH_WIN_URL = "../static/gridsquid/aud/win.mp3"
const CORRECT_URL = "../static/gridsquid/aud/correct.mp3"
const INCORRECT_URL = "../static/gridsquid/aud/incorrect.mp3"
const QUIZ_SCORE_URL = "../static/gridsquid/aud/quiz_score.mp3"
// From CSS
const GRID_BOX_GAP = 10
const GRID_BOX_MARGIN = 0

// Set default grid mode to edit
let grid_mode = DEFAULT_GRID_MODE

document.querySelector('#home').addEventListener('click', () => {
    grid_mode = DEFAULT_GRID_MODE
    // Fetch new grid object
    fetch_new_grid().then(new_grid => {
        // Create grid with new grid object
        create_grid(new_grid, grid_mode)
    });
})

document.querySelector('#create-grid').addEventListener('click', () => {
    grid_mode = DEFAULT_GRID_MODE
    // Fetch new grid object
    fetch_new_grid().then(new_grid => {
        // Create grid with new grid object
        create_grid(new_grid, grid_mode)
    });
})

document.querySelector('#mygrids').addEventListener('click', () => {
    // Fetch albums
    fetch_albums().then(albums => {
        // Show MyGrids page with albums object
        mygrids(albums)
    });
})

document.querySelector('#about').addEventListener('click', () => show_view("about"))

show_view("main")

function show_view(view) {
    //First hide all view divs
    document.querySelectorAll('.view').forEach(div => {
        div.style.display = 'none';
    })

    //Display only desired view
    document.querySelector(`#${view}-view`).style.display = 'flex'
}

function mygrids({ albums, grids, message }) {
    console.log(albums)
    console.log(grids)

    // Delete any previous dupes of MyGrids
    document.querySelector('#mygrids-view').innerHTML = ""

    // Show MyGrids view
    show_view("mygrids")

    // Create HTML elements
    const heading_box = createHTML('div', 'heading-box')
    const mygrids_heading = createHTML('span', 'mygrids-heading', null, 'MyGrids')
    const delete_selected_button = createHTML('button', 'smaller-button btn btn-danger btn-sm', null, 'delete selected grids')
    const mygrids_box = createHTML('div', 'mygrids-box', null, '')
    const album_box = createHTML('div', 'album-box', null, '')
    const album_title_box = createHTML('div', 'album-title-box')
    const album_title = createHTML('h6', 'album-title', null, '* MyGrids')
    const grid_title = createHTML('span', 'click mygrids-grid-title', null, 'Grid Title')
    const grid_title_selection_box = createHTML('div', 'grid-title-selection-box')
    const album_control_box = createHTML('div', null, 'album-control-box', null)
    const new_album_input_box = createHTML('div', 'new-album-input-box')
    const add_album_button = createHTML('span', 'circle-button-album add-button-album', null, '+')
    const delete_album_button = createHTML('img', 'trash-icon-album')

    // Set delete album button source
    delete_album_button.src = TILE_TRASH_ICON_URL
    display("inline-block", delete_album_button)

    // Create new album input
    const new_album_input = document.createElement('input')
    new_album_input.setAttribute('type', 'text');
    new_album_input.className = "input new-album-input"
    new_album_input.placeholder = "New Album"
    new_album_input.maxLength = 60

    // Create edit album input
    const edit_album_title_input = document.createElement('input')
    edit_album_title_input.setAttribute('type', 'text');
    edit_album_title_input.className = "input edit-album-title-input"
    edit_album_title_input.maxLength = 60

    // Create grid checkbox inputs
    const grid_checkbox = document.createElement('input')
    grid_checkbox.setAttribute('type', 'checkbox');
    grid_checkbox.className = "checkbox inline grid-checkbox"

    // Filter album for albums that are the default MyGrids to get ID
    const albums_mygrids = albums.filter(
        (album) => album.album_title === "MyGrids"
    );

    // Create album move to selections menu
    const move_grids_selection = document.createElement('select')
    // move_grids_selection.className = "move-grids-selection"
    const album_option = document.createElement('option')
    album_option.text = " -- Move to:"
    album_option.value = ""
    const album_option2 = document.createElement('option')
    album_option2.text = "* MyGrids"
    album_option2.value = albums_mygrids[0].album_id
    move_grids_selection.add(album_option)
    move_grids_selection.add(album_option2)

    // Filter album for albums and grids that are not the default MyGrids
    const albums_not_mygrids = albums.filter(
        (album) => album.album_title !== "MyGrids"
    );

    // Create dropdown list of each existing album
    albums_not_mygrids.forEach((album) => {
        // Limit display of album title to 25 characters
        let album_title = album.album_title
        if (album_title.length > 15) {
            album_title = `${album_title.substring(0, 14)}...`
        }

        const new_album_option = album_option.cloneNode()
        new_album_option.text = album_title
        new_album_option.value = album.album_id
        move_grids_selection.add(new_album_option)
    })

    // Append upper elements
    heading_box.append(mygrids_heading, delete_selected_button)
    new_album_input_box.append(new_album_input, add_album_button)
    album_control_box.append(new_album_input_box, move_grids_selection)
    if (message) {
        const message_div = createHTML('div', 'alert alert-danger', 'error-message', message)
        document.querySelector('#mygrids-view').append(message_div)
    }

    // Use Some method to check if there is at least one not-new grid in MyGrids/not MyGrids album
    // Learned from: https://www.youtube.com/watch?v=7m9EiRS_Kc0&ab_channel=JamesQQuick
    const one_grid_mygrids = grids.some(
        (grid) => grid.album_title === "MyGrids" && grid.grid_new == false
    );
    const one_grid_not_mygrids = grids.some(
        (grid) => grid.album_title !== "MyGrids"
    );

    // Use Some method to check if there is at least one grid in an album other than MyGrids
    const one_album_not_mygrids = albums.some(
        (album) => album.album_title !== "MyGrids"
    );

    if (one_grid_mygrids) {
        // Filter grids for not-new grids that are in the default MyGrids album
        const grids_in_mygrids = grids.filter(
            (grid) => grid.album_title === "MyGrids" && grid.grid_new == false
        );

        // Append album box to MyGrids box
        album_box.append(album_title)
        mygrids_box.append(album_box)

        // For each grid in this album, display the grid title
        grids_in_mygrids.forEach((grid) => {
            const new_grid_title_selection_box = grid_title_selection_box.cloneNode()
            const new_grid_checkbox = grid_checkbox.cloneNode()
            new_grid_checkbox.value = grid.grid_id
            const new_grid_title = grid_title.cloneNode()
            new_grid_title.id = grid.grid_id
            new_grid_title.innerHTML = `${grid.grid_title} (ID${grid.grid_id})`

            new_grid_title_selection_box.append(new_grid_checkbox, new_grid_title)
            album_box.append(new_grid_title_selection_box)

            // Load the grid in view mode when title is clicked
            new_grid_title.addEventListener('click', () => {
                grid_mode = "view"
                fetch_get_grid(grid.grid_id).then(updated_grid => {
                    create_grid(updated_grid, grid_mode)
                })
            })
        })
    } else if (!one_grid_mygrids && !one_grid_not_mygrids) {
        album_box.append(album_title)
        mygrids_box.append(album_box)
        const no_first_grid_message = createHTML('p', 'inline', null, "You don't have any grids. ")
        const create_one_message = createHTML('p', 'click inline', null, 'Go create one!')
        album_box.append(no_first_grid_message, create_one_message)

        // Delete delete/move options since there are no grids to delete or move
        delete_selected_button.remove()
        move_grids_selection.remove()

        create_one_message.addEventListener('click', () => show_view("create-grid"))
    }

    // If non-default albums exist, create more album boxes and list their grids
    if (one_album_not_mygrids) {
        // For each album that isn't a default MyGrids album, create a new album box
        albums_not_mygrids.forEach((album) => {

            // Build the album box
            const new_album_title_box = album_title_box.cloneNode()
            const new_album_box = album_box.cloneNode()
            const new_delete_album_button = delete_album_button.cloneNode(true)
            const new_album_title = album_title.cloneNode()
            new_album_box.id = album.album_id
            new_album_title.id = album.album_id
            new_album_title.className = "click new-album-title"
            new_album_title.innerHTML = album.album_title

            // Assign album title the MyGrids album id
            new_delete_album_button.id = album.album_id
            new_album_title_box.append(new_album_title)
            new_album_box.append(new_album_title_box, new_delete_album_button)
            mygrids_box.append(new_album_box)

            // Check if there is at least one grid in this album
            const one_grid_this_album = grids.some(
                (grid) => grid.album_title === album.album_title
            );

            if (one_grid_this_album){
                // Filter grids for grids that are in this album
                const grids_in_this_album = grids.filter(
                    (grid) => grid.album_title === album.album_title
                );

                // For each grid in this album, display the grid title
                grids_in_this_album.forEach((grid) => {
                    const new_grid_title_selection_box = grid_title_selection_box.cloneNode()
                    const new_grid_checkbox = grid_checkbox.cloneNode()
                    new_grid_checkbox.value = grid.grid_id
                    const new_grid_title = grid_title.cloneNode()
                    new_grid_title.id = grid.grid_id
                    new_grid_title.innerHTML = `${grid.grid_title} (ID${grid.grid_id})`

                    new_grid_title_selection_box.append(new_grid_checkbox, new_grid_title)
                    new_album_box.append(new_grid_title_selection_box)

                    // Load the grid in view mode when title is clicked
                    new_grid_title.addEventListener('click', () => {
                        grid_mode = "view"
                        fetch_get_grid(grid.grid_id).then(updated_grid => {
                            create_grid(updated_grid, grid_mode)
                        })
                    })
                })
            } else {
                const no_grids_message = createHTML('p', null, null, '(Feed me grids.)')
                new_album_box.append(no_grids_message)
            }
        })
    }

    // Append
    document.querySelector('#mygrids-view').append(heading_box, album_control_box, mygrids_box)

    // Select each delete tile button
    document.querySelectorAll('.trash-icon-album').forEach(button => {
        button.onclick = (e) => {
            console.log(`deleting album id ${button.id}`)

            document.querySelectorAll('.album-box').forEach(album_box => {
                if (button.id === album_box.id) {
                    // Highlight album to be removed
                    album_box.style.boxShadow = "0px 0px 0px 2px yellow"
                    // Request animation frames so the highlight shows before the confirmation
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            // Ask confirmation to remove
                            const confirmation = confirm("Are you sure you want to delete this album and all the grids within it?");
                            if (!confirmation) {
                                // Remove highlight and do nothing else if not confirmed
                                album_box.style.boxShadow = "none"
                            } else {
                                // Fade out album box
                                album_box.classList.add("fade")
                                // Wait until tile box is done fading, then shrink
                                setTimeout(() => {
                                    album_box.style.opacity = "0"
                                    album_box.innerHTML = ""
                                    album_box.classList.remove("fade-out")
                                    album_box.classList.add("shrink")
                                }, 200)
                                // Wait until animation is done, then fetch/reload mygrids
                                setTimeout(() => {
                                    fetch_delete_album(button.id).then(updated_albums => {
                                        mygrids(updated_albums)
                                    })
                                }, 400)
                            }
                        })
                    })
                }
            })

            // Learned from: https://stackoverflow.com/questions/17862228/button-onclick-inside-whole-clickable-div
            // https://javascript.info/bubbling-and-capturing
            // https://www.youtube.com/watch?v=UWCvbwo9IRk&ab_channel=dcode
            e.stopPropagation()
        }
    })

    // Create new album when button is clicked
    add_album_button.addEventListener('click', () => {
        add_album()
    })

    // Do the same as the buttons for Enter/Escape
    new_album_input.addEventListener('keydown', (e) => {
        if (e.key === "Enter") {
            add_album()
        } else if (e.key === "Escape") {
            new_album_input.value = ""
        }
    })

    function add_album() {
        // Generate numbered "New Album ##" albums if input is blank
        let new_album_input_value = new_album_input.value
        if (new_album_input_value === "") {
            // Is there at least one album already titled "New Album 01"?
            const one_new_album_01 = albums.some(
                (album) => album.album_title === "New Album 01");

            if (one_new_album_01) {
                // Filter albums for "New Album..." albums
                const new_album_albums = albums.filter(
                    (album) => album.album_title.slice(0, 9) === "New Album");
                // Use Map method to create array of just "New Album" numbers and get the highest one
                // Learned from: https://www.youtube.com/watch?v=G6J2kl1aVao&t=166s&ab_channel=JamesQQuick
                const new_album_numbers = new_album_albums.map((new_album_albums) => parseInt(new_album_albums.album_title.slice(10)))
                const highest_new_album_number = Math.max(...new_album_numbers)
                // If next number is below 10, normalize with a 0 for proper sorting under 100
                new_album_input_value = highest_new_album_number < 9 ? `New Album 0${highest_new_album_number + 1}` : `New Album ${highest_new_album_number + 1}`
            } else {
                new_album_input_value = "New Album 01"
            }
        }

        // Create a stand-in album box to fade-in before reloading mygrids
        const new_album_box = album_box.cloneNode()
        const new_album_title_box = album_title_box.cloneNode()
        const new_album_title = album_title.cloneNode()
        new_album_title.innerHTML = new_album_input_value
        new_album_title.className = "click new-album-title"
        new_album_title_box.append(new_album_title)
        const new_delete_album_button = delete_album_button.cloneNode()
        const no_grids_message = createHTML('p', null, null, '(Feed me grids.)')
        new_album_box.append(new_album_title_box, new_delete_album_button, no_grids_message)
        mygrids_box.append(new_album_box)
        new_album_box.classList.add("fade-in")

        // Update mygrids via fetch after the fade-in/out animation
        setTimeout(() => {
            fetch_create_album(new_album_input_value).then(updated_albums => {
                mygrids(updated_albums)
            })
        }, 200)
    }

    // Update album title via fetch when input box when clicked
    document.querySelectorAll('.new-album-title').forEach(album_title => {
        album_title.addEventListener('click', (e) => {
            const new_edit_album_title_input = edit_album_title_input.cloneNode()

            if (album_title.innerHTML.slice(0, 9) === "New Album") {
                new_edit_album_title_input.value = ""
            } else {
                new_edit_album_title_input.value = album_title.innerHTML
            }

            album_title.replaceWith(new_edit_album_title_input)
            new_edit_album_title_input.focus();

            e.stopPropagation()

            // Detect all mousedowns on the document
            // Learned from: https://www.youtube.com/watch?v=wX0pb6CBS-c&ab_channel=TechStacker
            let save_on_mousedown = function(e) {
                // If mousedown is within the album title input element
                if (e.target.closest('.edit-album-title-input')) {
                    console.log('mousedown inside input, do nothing')
                    return
                }

                // If mousedown is outside the input, remove the event listener and update the album title via fetch
                console.log('mousedown outside input')

                // Remove event listener
                // Learned from: https://stackoverflow.com/questions/10444077/javascript-removeeventlistener-not-working
                document.removeEventListener('mousedown', save_on_mousedown, true)

                if (new_edit_album_title_input.value === "" || new_edit_album_title_input.value === album_title.innerHTML) {
                    new_edit_album_title_input.value = album_title.innerHTML
                    new_edit_album_title_input.replaceWith(album_title)
                    console.log('Album title not changed.')
                } else {
                    console.log('Updating new album title.')
                    fetch_edit_album_title(album_title.id, new_edit_album_title_input.value).then(updated_albums => {
                        mygrids(updated_albums)
                    })
                }
            }

            // Listen for mousedown in the document
            document.addEventListener('mousedown', save_on_mousedown, true)

            // Listen for keypresses
            new_edit_album_title_input.addEventListener('keydown', (e) => {
                if (e.key === "Enter") {
                    // Remove event listener
                    document.removeEventListener('mousedown', save_on_mousedown, true)
                    if (new_edit_album_title_input.value !== "") {
                    // fetch edited album title
                    fetch_edit_album_title(album_title.id, new_edit_album_title_input.value).then(updated_albums => {
                        mygrids(updated_albums)
                    })
                    }
                } else if (e.key === "Escape") {
                    // Remove event listener
                    document.removeEventListener('mousedown', save_on_mousedown, true)
                    new_edit_album_title_input.value = ""
                    new_edit_album_title_input.replaceWith(album_title)
                }
            })
        })
    })

    // Delete selected grids when button is pressed
    delete_selected_button.addEventListener('click', () => {
        // Create array of selected grids
        const selected_grid_ids = []
        document.querySelectorAll('.grid-checkbox:checked').forEach(checked_grid => {
            selected_grid_ids.push(checked_grid.value)
        })


        if (selected_grid_ids.length > 0) {
            let confirmation;
            if (selected_grid_ids.length === 1) {
                confirmation = confirm("Are you sure you want to delete this grid and all of its content?");
            } else {
                confirmation = confirm("Are you sure you want to delete these grids and all of their content?");
            }
            if (confirmation) {
                fetch_delete_grids(selected_grid_ids).then(updated_albums => {
                    mygrids(updated_albums)
                })
            }
        } else {
            console.log("Nothing is checked.")
        }
    })

    // Move selected grids to selected album when button is pressed
    move_grids_selection.addEventListener('change', () => {
        // Create array of selected grids
        const selected_grid_ids = []
        document.querySelectorAll('.grid-checkbox:checked').forEach(checked_grid => {
            selected_grid_ids.push(checked_grid.value)
        })

        // Learned from: https://stackoverflow.com/questions/1085801/get-selected-value-in-dropdown-list-using-javascript
        const selected_album_id = move_grids_selection.options[move_grids_selection.selectedIndex].value

        // Only move grids via fetch if something is checked and selection is not the default option
        if (selected_grid_ids.length > 0 && selected_album_id != "") {
            fetch_move_grids_to_album(selected_album_id, selected_grid_ids).then(updated_albums => {
                mygrids(updated_albums)
            })
        } else { console.log('not moved')}
    })

    // Select each grid title and open up grid view
    document.querySelectorAll('p.mygrids-grid-title').forEach(grid_title => {
        grid_title.onclick = () => {
            console.log(grid_title.id)
            // Open grid view when clicked
        }
    })
}

function create_grid({ grid: { grid_id, timestamp, grid_new, grid_title, album_id, album_title, tile_order, tile_count, default_tiles_per_row, user_tiles_per_row, quiz_preference }, albums, tiles, message }, grid_mode) {
    console.log(grid_id, timestamp, grid_new, grid_title, album_title, tile_order, tile_count, default_tiles_per_row, user_tiles_per_row, quiz_preference)
    console.log(albums)
    console.log(tiles)
    console.log ({grid_mode})

    // Set tiles per row to user preference, otherwise set to default
    let tiles_per_row = default_tiles_per_row
    if (user_tiles_per_row != null) {
        tiles_per_row = user_tiles_per_row
    }

    // Convert tile order string to array
    if (typeof tile_order === "string") {
        tile_order = JSON.parse(tile_order)
    }

    // Delete any previous dupes of grid
    document.querySelector('#create-grid-view').innerHTML = ""

    // Show create grid view
    show_view("create-grid")

    // Create title elements
    const heading_box = createHTML('div', 'heading-box', null, null)
    const grid_title_heading = createHTML('span', 'click grid-title-heading', null, `${grid_title} (ID ${grid_id}) - (<i>${grid_mode} mode</i>)`)
    const heading_button_box = createHTML('div', 'heading-button-box')
    const grid_mode_button = createHTML('button', 'hidden no-border badge rounded-pill text-bg-info')
    const memory_game_timer = createHTML('div', 'hidden memory-game-timer', null, "0:00")
    const memory_game_button = createHTML('button', 'hidden no-border badge rounded-pill text-bg-info', null, "MEMORY")
    const quiz_button = createHTML('button', 'hidden no-border badge rounded-pill text-bg-info', null, "QUIZ")
    const restart_button = createHTML('button', 'hidden no-border badge rounded-pill text-bg-info', null, "RESTART")

    // Create title input
    const grid_title_input = document.createElement('input')
    grid_title_input.setAttribute('type', 'text');
    grid_title_input.className = "input grid-title-input"
    grid_title_input.placeholder = `${grid_title} (ID ${grid_id})`
    grid_title_input.maxLength = 60

    if (grid_mode === "edit") {
        // Edit grid title when title is clicked
        grid_title_heading.addEventListener('click', (e) => {
            grid_title_heading.replaceWith(grid_title_input)
            if (grid_title !== "New Grid") {
                grid_title_input.value = grid_title
            }
            grid_title_input.focus();

            e.stopPropagation()

            // Detect all mousedowns on the document
            // Learned from: https://www.youtube.com/watch?v=wX0pb6CBS-c&ab_channel=TechStacker
            let save_on_mousedown = function(e) {
                // If mousedown is within the grid title input element
                if (e.target.closest('#grid-title-input')) {
                    console.log('mousedown inside input, do nothing')
                    return
                }

                // If mousedown is outside the input, remove the event listener and update the grid title via fetch
                console.log('mousedown outside input')

                // Remove event listener
                // Learned from: https://stackoverflow.com/questions/10444077/javascript-removeeventlistener-not-working
                document.removeEventListener('mousedown', save_on_mousedown, true)

                if (grid_title_input.value === "" || grid_title_input.value === grid_title) {

                    if (grid_title !== "New Grid") {
                        grid_title_input.value = grid_title
                    } else {
                        grid_title_input.value = ""
                    }

                    grid_title_input.replaceWith(grid_title_heading)
                    console.log('Grid title not changed.')
                } else {
                    console.log('Updating new grid title.')
                    fetch_edit_grid_title(grid_id, grid_title_input.value).then(updated_grid => {
                        create_grid(updated_grid, grid_mode)
                    })
                }
            }

            // Listen for mousedown in the document
            document.addEventListener('mousedown', save_on_mousedown, true)

            // Do the same as the buttons for Enter/Escape
            grid_title_input.addEventListener('keydown', (e) => {
                if (e.key === "Enter") {
                    // Remove event listener
                    document.removeEventListener('mousedown', save_on_mousedown, true)
                    // Update grid's title via fetch
                    updated_grid_title = grid_title_input.value
                    fetch_edit_grid_title(grid_id, updated_grid_title).then(updated_grid => {
                        create_grid(updated_grid, grid_mode)
                    });
                } else if (e.key === "Escape") {
                    // Remove event listener
                    document.removeEventListener('mousedown', save_on_mousedown, true)
                    grid_title_input.replaceWith(grid_title_heading)
                    grid_title_input.value = ""
                }
            })
        })
    } else {
        grid_title_heading.classList.remove("click")
    }

    // Create elements for album, tile tile controls, grid box, and tile box
    const grid_control_box = createHTML('div', 'grid-control-box')
    const album_selection_box = createHTML('div', 'album-selection-box')
    const album_title_text = createHTML('p', 'album-title-text', null, 'Album:')
    const tile_counter_box = createHTML('div', 'tile-counter-box')
    const tile_counter_text = createHTML('p', 'tile-counter-text', null, 'Tile Count:')
    const tile_counter_number = createHTML('p', 'click tile-counter-number', null, tile_count)
    const tiles_per_row_box = createHTML('div', 'tiles-per-row-box')
    const tiles_per_row_text = createHTML('p', 'tiles-per-row-text', null, 'Tiles/Row:')
    const grid_button_box = createHTML('div', 'hidden grid-button-box')
    const grid_button_box_left = createHTML('div', 'grid-button-box-left')
    const grid_button_box_right = createHTML('div', 'grid-button-box-right')
    const reverse_sort_button = createHTML('button', 'button-left no-border badge rounded-pill text-bg-secondary', null, 'reverse')
    const mix_sort_button = createHTML('button', 'button-left no-border badge rounded-pill text-bg-secondary', null, 'mix up')
    const default_sort_button = createHTML('button', 'button-middle no-border badge rounded-pill text-bg-secondary', null, 'default sort')
    const save_and_new_button = createHTML('button', 'no-border badge rounded-pill text-bg-info', null, 'save and new')
    const reset_grid_button = createHTML('button', 'button-left no-border badge rounded-pill text-bg-danger', null, 'reset grid')
    const grid_quiz_box = createHTML('div', 'hidden grid-quiz-box')
    const grid_quiz_question_number = createHTML('div', 'grid-quiz-question-number')
    const grid_quiz_question_box = createHTML('div', 'hidden grid-quiz-question-box')
    const grid_quiz_preference = createHTML('div', 'grid-quiz-preference')
    const grid_box = createHTML('div', 'grid-box', null, '')
    const tile_box = createHTML('div', 'pointer tile-box')
    const tile_box_front = createHTML('div', 'tile-box-front')
    const tile_box_back = createHTML('div', 'tile-box-back')
    const delete_tile_button = createHTML('img', 'trash-icon')
    const tile_icon_box = createHTML('div', 'tile-icon-box')
    const tile_audio_icon = createHTML('img', 'tile-icon')
    const tile_text_icon = createHTML('img', 'tile-icon')
    const memory_game_win_message = createHTML('div', 'hidden you-win', null, 'YOU WIN!')
    const quiz_score_message = createHTML('div', 'hidden quiz-score')

    // Show elements based on mode
    if (grid_mode === "edit") {
        display("flex", grid_control_box, grid_button_box, tile_icon_box)
        display("inline", grid_mode_button, delete_tile_button)
        grid_mode_button.innerHTML = "VIEW MODE"

        // Switch to view mode when button is clicked
        grid_mode_button.addEventListener('click', () => {
            grid_mode = "view"
            fetch_get_grid(grid_id).then(updated_grid => {
                create_grid(updated_grid, grid_mode)
            })
        })
    } else if (grid_mode === "view") {
        display("inline", grid_mode_button)
        grid_mode_button.innerHTML = "EDIT MODE"

        // Switch to edit mode when button is clicked
        grid_mode_button.addEventListener('click', () => {
            grid_mode = "edit"
            fetch_get_grid(grid_id).then(updated_grid => {
                create_grid(updated_grid, grid_mode)
            })
        })
    } else if (grid_mode === "memory") {
        display("inline", restart_button, memory_game_button)
        display("block", memory_game_timer)
        memory_game_button.innerHTML = "END GAME"

        // Restart memory game when button is clicked
        restart_button.addEventListener('click', () => {
            grid_mode = "memory"
            fetch_get_memory_grid(grid_id).then(updated_grid => {
                create_grid(updated_grid, grid_mode)
            })
        })

        // End memory game and switch to view mode when button is clicked
        memory_game_button.addEventListener('click', () => {
            grid_mode = "view"
            fetch_get_grid(grid_id).then(updated_grid => {
                create_grid(updated_grid, grid_mode)
            })
        })
    } else if (grid_mode === "quiz") {
        display("inline", restart_button, quiz_button)
        display("flex", grid_quiz_box, grid_quiz_question_number, grid_quiz_question_box, grid_quiz_preference)
        quiz_button.innerHTML = "END QUIZ"

        // Restart quiz when button is clicked
        restart_button.addEventListener('click', () => {
            grid_mode = "quiz"
            fetch_get_grid(grid_id).then(updated_grid => {
                create_grid(updated_grid, grid_mode)
            })
        })

        // End quiz and switch to view mode when button is clicked
        quiz_button.addEventListener('click', () => {
            grid_mode = "view"
            fetch_get_grid(grid_id).then(updated_grid => {
                create_grid(updated_grid, grid_mode)
            })
        })
    }

    // Set src for tile icons
    tile_audio_icon.src = TILE_AUDIO_ICON_URL
    tile_text_icon.src = TILE_TEXT_ICON_URL
    delete_tile_button.src = TILE_TRASH_ICON_URL

    // Filter album for albums that are the default MyGrids to get ID
    const albums_mygrids = albums.filter(
        (album) => album.album_title === "MyGrids"
    );

    // Create album change selections with all existing albums
    const change_album_selection = document.createElement('select')
    change_album_selection.className = "change-album-selection"
    const album_option = document.createElement('option')
    album_option.text = "* MyGrids"
    album_option.value = albums_mygrids[0].album_id
    change_album_selection.add(album_option)

    // Select current album
    if (album_id == albums_mygrids[0].album_id) {
        album_option.selected = true
    }

    albums.forEach((album) => {
        if (album.album_title !== "MyGrids") {
            // Limit display of album title to 25 characters
            let album_title = album.album_title
            if (album_title.length > 15) {
                album_title = `${album_title.substring(0, 14)}...`
            }

            const new_album_option = album_option.cloneNode()
            new_album_option.text = album_title
            new_album_option.value = album.album_id
            change_album_selection.add(new_album_option)

            // Select current album
            if (album_id == album.album_id) {
                new_album_option.selected = true
            }
        }
    })

    // Change grid album when option is changed
    change_album_selection.addEventListener('change', () => {
        const selected_album_id = change_album_selection.options[change_album_selection.selectedIndex].value
        fetch_change_album(selected_album_id, grid_id).then(updated_grid => {
            create_grid(updated_grid, grid_mode)
        })
    })

    // Set tile size on load
    set_tile_size()

    function set_tile_size() {
        // Set tile box height and width based on current width of grid (which is limited by the view div)
        const max_grid_width = document.querySelector('#create-grid-view').offsetWidth
        // Calculate tile size using tiles per row value to fit perfectly in the grid
        const tile_box_size = (max_grid_width - ((tiles_per_row - 1) * GRID_BOX_GAP) - (GRID_BOX_MARGIN * 2))/tiles_per_row
        tile_box.setAttribute("style", `height: ${tile_box_size}px; width: ${tile_box_size}px;`);
        return tile_box_size
    }

    // Create tile counter number input
    const tile_counter_number_input = document.createElement('input')
    tile_counter_number_input.type = "number"
    tile_counter_number_input.className = "input tile-counter-number-input"
    tile_counter_number_input.value = tile_count
    tile_counter_number_input.min = `${MIN_TILE_COUNT}`
    tile_counter_number_input.max = `${MAX_TILE_COUNT}`

    // Create tiles per row selection
    const tiles_per_row_selection = document.createElement('select')
    tiles_per_row_selection.className = "tiles-per-row-selection"
    // Create tiles per row options of 2-6
    for (let i = 2; i < 7; i++) {
        const tiles_per_row_option = document.createElement('option')
        tiles_per_row_option.text = i
        tiles_per_row_option.value = i
        tiles_per_row_selection.add(tiles_per_row_option)

        // Select current tiles per row for this grid
        if (i === parseInt(tiles_per_row)) {
            tiles_per_row_option.selected = true
        }
    }

    // Reload grid with changed tiles per row after showing transition animation
    tiles_per_row_selection.addEventListener('change', () => {
        const selected_tiles_per_row = tiles_per_row_selection.options[tiles_per_row_selection.selectedIndex].value
        // Set the selected value to the new tiles per row
        tiles_per_row = selected_tiles_per_row
        // Calculate tile box size based on current width
        const tile_box_size = set_tile_size()
        // Select all tile-boxes and re-set their height/width to show the transition before the grid is reloaded
        document.querySelectorAll('div.tile-box').forEach(tile_box => {
            tile_box.classList.add("tile-box-resized")
            tile_box.style.height = `${tile_box_size}px`;
            tile_box.style.width = `${tile_box_size}px`;
        })
        // Update grid's tiles via fetch after the size transition is complete
        setTimeout(() => {
            fetch_change_tiles_per_row(selected_tiles_per_row, grid_id).then(updated_grid => {
                create_grid(updated_grid, grid_mode)
            });
        }, 200)
    })

    // Create variable to track if grid contains any view (non-empty) tiles and tiles with images
    let has_view_tile = false
    let has_image_tile = false

    if (grid_mode != "memory") {
        // For each tile in tile order array, create a tile with audio/text icons and append to grid box
        tile_order.forEach((tile_number) => {
            const new_tile_box = tile_box.cloneNode()
            const new_delete_tile_button = delete_tile_button.cloneNode()
            const new_tile_icon_box = tile_icon_box.cloneNode()
            const new_tile_audio_icon = tile_audio_icon.cloneNode()
            const new_tile_text_icon = tile_text_icon.cloneNode()
            new_tile_box.id = tile_number
            // Show ID for testing
            // new_tile_box.innerHTML = new_tile_box.id
            new_delete_tile_button.id = tile_number

            // Filter tiles array to get tile of this tile number
            const this_tile = getTileFromTileNumber(tiles, tile_number)

            // Add background to new tile box element based on filtered tile object
            new_tile_box.style.backgroundImage=`url(${this_tile.image_url})`

            // Add a background color in case image doesn't load
            new_tile_box.style.backgroundColor = "rgb(49, 49, 49)"
            // new_tile_box.style.border = "1px solid rgb(49, 49, 49)"

            // Don't append delete button if there is only 1 tile
            if (tile_count > 1) {
                new_tile_box.append(new_delete_tile_button)
            }

            // Display audio and text icons if tiles has audio or text respectively
            if (this_tile.audio_url) {
                display("inline-block", new_tile_audio_icon)
                new_tile_icon_box.style.border = "1px solid white"
            }
            if (this_tile.tile_text) {
                display("inline-block", new_tile_text_icon)
                new_tile_icon_box.style.border = "1px solid white"
            }

            new_tile_icon_box.append(new_tile_audio_icon, new_tile_text_icon)
            new_tile_box.append(new_tile_icon_box)

            // Append all tiles if mode is edit, otherwise only append non-empty tiles
            if (grid_mode === "edit") {
                grid_box.append(new_tile_box)
            } else {
                if (!this_tile.image_url.includes(DEFAULT_TILE_IMG_NAME) || this_tile.audio_url || this_tile.tile_text) {
                    // Don't append tile if quiz mode and there is no image...
                    if (grid_mode !== "quiz" || (grid_mode === "quiz" && !this_tile.image_url.includes(DEFAULT_TILE_IMG_NAME))) {
                        grid_box.append(new_tile_box)
                        has_view_tile = true
                    }
                    if (!this_tile.image_url.includes(DEFAULT_TILE_IMG_NAME)) {
                        has_image_tile = true
                    }
                }
            }
        })
    } else {
        // Create tiles for memory game and append to grid box
        tiles.forEach((this_tile) => {
            // Only create tile if tile has an image
            if (!this_tile.image_url.includes(DEFAULT_TILE_IMG_NAME)) {
                const new_tile_box = tile_box.cloneNode()
                const new_tile_box_front = tile_box_front.cloneNode()
                const new_tile_box_back = tile_box_back.cloneNode()
                new_tile_box.id = this_tile.tile_number
                new_tile_box_front.id = `front${this_tile.tile_number}`
                new_tile_box_back.id = `back${this_tile.tile_number}`
                new_tile_box_front.style.backgroundImage = `url(${this_tile.image_url})`
                new_tile_box_back.style.backgroundImage = `url(${DEFAULT_TILE_IMG_URL})`
                // Show ID for testing
                // new_tile_box_back.innerHTML = new_tile_box.id
                new_tile_box.append(new_tile_box_front, new_tile_box_back)
                grid_box.append(new_tile_box)
            }
        })
        // Append memory game win message
        grid_box.append(memory_game_win_message)
    }

    // Display a message if there are only non-empty tiles in view mode
    if (grid_mode === "view" && !has_view_tile) {
        const message_box = createHTML('div', 'message-box')
        const no_view_tiles_message = createHTML("span", null, null, "This grid doesn't yet have any tiles with viewable content. ")
        const create_one_message = createHTML("span", "click", null, "Go create one!")
        message_box.append(no_view_tiles_message, create_one_message)
        grid_box.append(message_box)
        create_one_message.addEventListener('click', () => {
            fetch_get_grid(grid_id).then(updated_grid => {
                create_grid(updated_grid, "edit")
            })
        })
    }

    // Show memory game and quiz buttons if there are any tiles with images
    if (grid_mode === "view" && has_image_tile) {
        display("inline", memory_game_button, quiz_button)
        // Start memory game when button is clicked
        memory_game_button.addEventListener('click', () => {
            grid_mode = "memory"
            fetch_get_memory_grid(grid_id).then(updated_grid => {
                create_grid(updated_grid, grid_mode)
            })
        })
        // Start quiz when button is clicked
        quiz_button.addEventListener('click', () => {
            grid_mode = "quiz"
            fetch_get_grid(grid_id).then(updated_grid => {
                create_grid(updated_grid, grid_mode)
            })
        })
    }

    // Append elements to DOM
    heading_button_box.append(restart_button, memory_game_button, quiz_button, grid_mode_button)
    heading_box.append(grid_title_heading, heading_button_box)
    album_selection_box.append(album_title_text, change_album_selection)
    tile_counter_box.append(tile_counter_text, tile_counter_number)
    tiles_per_row_box.append(tiles_per_row_text, tiles_per_row_selection)
    grid_control_box.append(album_selection_box, tiles_per_row_box, tile_counter_box)
    grid_button_box_left.append(reverse_sort_button, mix_sort_button, default_sort_button)
    grid_button_box_right.append(reset_grid_button, save_and_new_button)
    grid_button_box.append(grid_button_box_left, grid_button_box_right)
    grid_quiz_box.append(grid_quiz_question_number, grid_quiz_preference)

    if (message) {
        const message_div = createHTML('div', 'alert alert-danger', 'error-message', message)
        grid_box.prepend(message_div)
    }

    // On window resize, modify size of tiles on the DOM
    // Learned from: https://developer.mozilla.org/en-US/docs/Web/API/Window/resize_event
    window.addEventListener('resize', () => {
        // Calculate tile box size based on resized width
        const tile_box_size = set_tile_size()
        // Select all tile-boxes and re-set their size
        document.querySelectorAll('div.tile-box, div.tile-box-matched').forEach(tile_box => {
            tile_box.style.height = `${tile_box_size}px`;
            tile_box.style.width = `${tile_box_size}px`;
        })
    })

    // Re-assign the grid box width based on the current view width
    // This will allow the grid to always be centered with the final row left-aligned
    // Each tile box has a margin of 5px and requires and extra 10px of width
    function resize_grid_box() {
        // Get the width of the current create grid view div
        // Learned from https://www.javascripttutorial.net/javascript-dom/javascript-width-height/
        const max_grid_width = document.querySelector('#create-grid-view').offsetWidth
        // Calculate possible tiles per row based on current view width and tile size
        const possible_tiles_per_row = Math.floor(max_grid_width/(tile_size + 10))
        // Calculate a new width for the grid box that fits this many tiles
        const grid_box_width = possible_tiles_per_row * (tile_size + 10)
        // Assign new width to the grid box
        grid_box.style.width = `${grid_box_width}px`
    }

    document.querySelector('#create-grid-view').append(heading_box, memory_game_timer, grid_control_box, grid_button_box, grid_quiz_box, grid_quiz_question_box, grid_box)

    // Edit tile counter when number is clicked
    tile_counter_number.addEventListener('click', (e) => {
        tile_counter_number.replaceWith(tile_counter_number_input)
        tile_counter_number_input.focus();

        e.stopPropagation()

            // Detect all mousedowns on the document
            // Learned from: https://www.youtube.com/watch?v=wX0pb6CBS-c&ab_channel=TechStacker
            let save_on_mousedown = function(e) {
                // If mousedown is within the album title input element
                if (e.target.closest('.tile-counter-number-input')) {
                    console.log('mousedown inside input, do nothing')
                    return
                }
                // If mousedown is outside the input, remove the event listener and update the grid via fetch
                console.log('mousedown outside input')
                add_remove_animate_tiles()
            }

            // Listen for mousedown in the document
            document.addEventListener('mousedown', save_on_mousedown, true)

        // Do the same as the buttons for Enter/Escape
        tile_counter_number_input.addEventListener('keydown', (e) => {
            if (e.key === "Enter") {
                add_remove_animate_tiles()
            } else if (e.key === "Escape") {
                // Remove event listener
                document.removeEventListener('mousedown', save_on_mousedown, true)
                tile_counter_number_input.value = tile_counter_number.innerHTML
                tile_counter_number_input.replaceWith(tile_counter_number)
            }
        })

        function add_remove_animate_tiles() {
            // Remove event listener
            // Learned from: https://stackoverflow.com/questions/10444077/javascript-removeeventlistener-not-working
            document.removeEventListener('mousedown', save_on_mousedown, true)

            // Don't save if value doesn't change
            if (tile_counter_number_input.value !== tile_counter_number.innerHTML) {
                // If tiles are being removed...
                if (tile_counter_number_input.value < tile_count) {
                    // Determine how many tiles are being removed
                    const tile_count_to_remove = tile_count - tile_counter_number_input.value
                    // Add tiles to be removed to an array
                    const tile_boxes = Array.from(document.querySelectorAll('.tile-box'))
                    const tile_boxes_to_remove = tile_boxes.slice(-tile_count_to_remove)
                    // Highlight tiles to be removed and ask for confirmation
                    tile_boxes_to_remove.forEach(tile_box => {
                        tile_box.style.boxShadow = "0px 0px 0px 2px yellow"
                    })
                    // Request animation frames so the highlight shows before the confirmation
                    // Learned here: https://stackoverflow.com/questions/73654377/why-is-confirm-happening-first-when-the-javascript-before-it-changes-the-eleme
                    // https://macarthur.me/posts/when-dom-updates-appear-to-be-asynchronous
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            let confirmation;
                            if (tile_boxes_to_remove.length === 1){
                                confirmation = confirm("Are you sure you want to delete this tile and its content?");
                            } else {
                                confirmation = confirm("Are you sure you want to delete these tiles and their content?");
                            }
                            if (!confirmation) {
                                // Reset tile counter input so the grid will just be reloaded without changes
                                tile_counter_number_input.value = tile_count
                                console.log('tile_counter_number_input.value (first)', tile_counter_number_input.value)
                            } else {
                                // For each of the tiles confirmed for removal, show the fade-out animation
                                tile_boxes_to_remove.forEach(tile_box => {
                                tile_box.classList.add("fade-out")
                                })
                            }
                        })
                    })
                }
                else {
                    // Determine how many tiles are being added
                    const tile_count_to_add = tile_counter_number_input.value - tile_count
                    let tile_boxes_to_add = []
                    // Create this many stand-in tile boxes to fade-in before creating a new grid
                    for (let i = 0; i < tile_count_to_add; i++) {
                        const new_tile_box = tile_box.cloneNode()
                        const new_delete_tile_button = delete_tile_button.cloneNode()
                        new_tile_box.style.backgroundImage = `url(${DEFAULT_TILE_IMG_URL})`
                        new_tile_box.append(new_delete_tile_button)
                        grid_box.append(new_tile_box)
                        // Add this tile box to the array
                        tile_boxes_to_add.push(new_tile_box)
                    }
                    // For each of those tiles, show the fade-in animation
                    tile_boxes_to_add.forEach(tile_box => {
                        tile_box.classList.add("fade-in")
                    })
                }
                // Update grid's tiles via fetch after the fade-in/out animation
                setTimeout(() => {
                    fetch_add_or_remove_tiles(grid_id, tile_count, tile_counter_number_input.value).then(updated_grid => {
                        create_grid(updated_grid, grid_mode)
                    });
                }, 200)
            }

            // Replace tile count with input value
            tile_counter_number.innerHTML = tile_counter_number_input.value
            tile_counter_number_input.replaceWith(tile_counter_number)
        }
    })

    // Reverse tile order when button is clicked
    reverse_sort_button.addEventListener('click', () => {
        fetch_sort_tiles(grid_id, "reverse").then(updated_grid => {
            create_grid(updated_grid, grid_mode)
        });
    })

    // Mix tile order when button is clicked
    mix_sort_button.addEventListener('click', () => {
        fetch_sort_tiles(grid_id, "mix").then(updated_grid => {
            create_grid(updated_grid, grid_mode)
        });
    })

    // Default tile order when button is clicked
    default_sort_button.addEventListener('click', () => {
        fetch_sort_tiles(grid_id, "default").then(updated_grid => {
            create_grid(updated_grid, grid_mode)
        });
    })

    // Create a new grid when clicked
    save_and_new_button.addEventListener('click', () => {
        // Fetch new grid object
        fetch_new_grid().then(new_grid => {
            // Create grid with new grid object
            create_grid(new_grid, grid_mode)
        })
    })

    // Reset grid to a new blank grid when clicked
    reset_grid_button.addEventListener('click', () => {
        const confirmation = confirm("Are you sure you want to reset this grid without saving?");
            if (confirmation) {
                // Reset grid and get updated grid via fetch
                fetch_reset_grid(grid_id).then(updated_grid => {
                    create_grid(updated_grid, grid_mode)
                })
            }
    })

    // ************** MEMORY GAME **************

    if (grid_mode === "memory") {

        // Start timer
        let [minutes, seconds] = [0, 0]
        let int = null
        int = setInterval(start_timer, 1000)

        function start_timer() {
            seconds += 1
            if (seconds === 60) {
                seconds = 0
                minutes++
            }
            if (minutes === 60) {
                minutes = 0
            }
            let s = seconds < 10 ? "0" + seconds : seconds
            memory_game_timer.innerHTML = `${minutes}:${s}`
        }

        // Create sound objects
        const click_sound = [new Audio(MATCH_CLICK1_URL), new Audio(MATCH_CLICK2_URL)]
        const match_sound = new Audio(MATCH_MATCH_URL)
        const no_match_sound = new Audio(MATCH_NO_MATCH_URL)
        const win_sound = new Audio(MATCH_WIN_URL)

        // Create flag variables to keep track of selections and win state
        let selection_counter = 0
        let selection1 = 0
        let selection2 = 0
        let win = false

        // Create an faded card to take the place of matched cards
        const tile_box_matched = createHTML('div', 'tile-box-matched')
        const tile_box_size = set_tile_size()
        tile_box_matched.setAttribute("style", `height: ${tile_box_size}px; width: ${tile_box_size}px;`);

        // Select each div and open up tile view
        document.querySelectorAll('div.tile-box').forEach(tile_box => {
            // Filter tiles for tile of a specific tile number
            const tile = getTileFromTileNumber(tiles, tile_box.id)

            // Do the following when a tile is clicked
            tile_box.onclick = () => {
                console.log(tile_box.id)
                // Flip over card on click
                tile_box.classList.add("flipped")

                // First of two cards selected...
                if (selection_counter === 0) {
                    //Disable any more clicking of this tile until another is chosen
                    tile_box.style.pointerEvents = "none"
                    click_sound[0].play()
                    selection_counter++
                    selection1 = tile_box.id
                // Second of two cards selected
                } else if (selection_counter === 1) {
                    //Disable any more clicking of this tile until both are flipped back over
                    tile_box.style.pointerEvents = "none"
                    click_sound[1].play()
                    selection_counter++
                    selection2 = tile_box.id
                }
                // Once two cards have been flipped, check for a match
                if (selection_counter === 2) {
                    selection_counter = 0
                    if (selection1 === selection2) {
                        console.log("Match!")
                        // If there is a match when only two tiles were left, we have a winner
                        if (document.querySelectorAll('.tile-box').length === 2) {
                            win = true
                            // Stop timer
                            clearInterval(int)
                        }

                        // Disable all clicks in of tile boxes until tiles have disappeared
                        // Learned from: https://stackoverflow.com/questions/40147856/disable-click-event-on-all-controls-using-javascript
                        document.querySelectorAll('.tile-box').forEach(tile_box => {
                            tile_box.style.pointerEvents = "none"
                        })
                        // Wait, then disappear tiles
                        setTimeout(() => {
                            // Select matching tiles and make them disappear
                            document.querySelectorAll('.tile-box').forEach(tile_box => {
                                if (tile_box.id === tile.tile_number.toString()) {
                                    new_tile_box_matched = tile_box_matched.cloneNode()
                                    // Set matched tile box background images
                                    new_tile_box_matched.style.backgroundImage =  `url(${tile.image_url})`
                                    tile_box.replaceWith(new_tile_box_matched)
                                }
                            })
                            if(!win) {
                                // Only play the match sound if the game hasn't been won yet
                                match_sound.play()
                            }
                            // Turn clicks of tile boxes back on
                            document.querySelectorAll('.tile-box').forEach(tile_box => {
                                tile_box.style.pointerEvents = "auto"
                            })
                            if (win) {
                                console.log("winner!")
                                // Remove all the hidden tiles to make room for win message
                                document.querySelectorAll('.tile-box-matched').forEach(tile_box => {
                                    tile_box.remove()
                                })
                                win_sound.play()
                                // Show win message and play again button
                                const play_again_button = createHTML('button', 'no-border play-again-button badge rounded-pill text-bg-info', null, "PLAY AGAIN?")
                                display("flex", memory_game_win_message)
                                // Restart memory game when button is clicked
                                play_again_button.addEventListener('click', () => {
                                    grid_mode = "memory"
                                    fetch_get_memory_grid(grid_id).then(updated_grid => {
                                        create_grid(updated_grid, grid_mode)
                                    })
                                })
                                memory_game_win_message.append(play_again_button)
                            }
                        }, 1000)
                    } else {
                        console.log("No match!")
                        // Disable all clicks of the tile boxes until tiles are turned back "over" to default
                        document.querySelectorAll('.tile-box').forEach(tile_box => {
                            tile_box.style.pointerEvents = "none"
                        })
                        // Wait, then flip cards back over
                        setTimeout(() => {
                            // Turn back over all flipped cards
                            document.querySelectorAll('.tile-box').forEach(tile_box => {
                                if (tile_box.classList.contains("flipped")) {
                                    tile_box.classList.remove("flipped")
                                }
                            })
                            no_match_sound.play()
                            // Turn clicks back on for each tile box
                            document.querySelectorAll('.tile-box').forEach(tile_box => {
                                tile_box.style.pointerEvents = "auto"
                            })
                        }, 1500)
                    }
                }
            }
        })

    // ************** QUIZ MODE **************

    } else if (grid_mode === "quiz") {
        // Create quiz preference selections drop-down menu
        const quiz_preference_selection = document.createElement('select')
        quiz_preference_selection.className = "quiz-preference-selection"
        const quiz_preference_option_audio_or_text = document.createElement('option')
        quiz_preference_option_audio_or_text.text = "audio or text"
        quiz_preference_option_audio_or_text.value = "audio or text"
        quiz_preference_selection.add(quiz_preference_option_audio_or_text)
        const quiz_preference_option_audio_only = document.createElement('option')
        quiz_preference_option_audio_only.text = "audio only"
        quiz_preference_option_audio_only.value = "audio only"
        quiz_preference_selection.add(quiz_preference_option_audio_only)
        const quiz_preference_option_text_only = document.createElement('option')
        quiz_preference_option_text_only.text = "text only"
        quiz_preference_option_text_only.value = "text only"
        quiz_preference_selection.add(quiz_preference_option_text_only)

        // Select current preference
        if (quiz_preference == quiz_preference_option_audio_only.value) {
            quiz_preference_option_audio_only.selected = true
        } else if (quiz_preference == quiz_preference_option_text_only.value) {
            quiz_preference_option_text_only.selected = true
        }

        // Change grid quiz preference when option is changed
        quiz_preference_selection.addEventListener('change', () => {
            const quiz_preference = quiz_preference_selection.options[quiz_preference_selection.selectedIndex].value
            fetch_change_quiz_preference(quiz_preference, grid_id).then(updated_grid => {
                create_grid(updated_grid, grid_mode)
            })
        })

        // Filter tiles according to quiz preference in order to create array of questions
        console.log(tiles)
        const grid_quiz_prompt = createHTML('span', 'grid-quiz-prompt', null, 'Select the correct tile for:')
        const grid_quiz_replay_button = createHTML('img', 'pointer grid-quiz-replay-button')
        grid_quiz_replay_button.src = PLAY_BUTTON_URL
        const grid_quiz_text = createHTML('span', 'grid-quiz-text')
        grid_quiz_question_box.append(grid_quiz_prompt, grid_quiz_replay_button, grid_quiz_text)

        const quiz_tiles = tiles.filter((tile) => {
            if (!tile.image_url.includes(DEFAULT_TILE_IMG_NAME)) {
                if (quiz_preference === "audio or text") {
                    return  tile.audio_url || tile.tile_text
                } else if (quiz_preference === "audio only") {
                    return  tile.audio_url
                } else if (quiz_preference === "text only") {
                    return  tile.tile_text
                }
            }
        })
        console.log('quiz_tiles: ', quiz_tiles)
        grid_quiz_preference.append(quiz_preference_selection)

        // Shuffle quiz tile array
        // Learned from: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
        let shuffled_quiz_tiles = quiz_tiles
            .map(value => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value)

        console.log('shuffled_quiz_tiles: ', shuffled_quiz_tiles)

        const correct = new Audio(CORRECT_URL)
        const incorrect = new Audio(INCORRECT_URL)
        const quiz_score = new Audio(QUIZ_SCORE_URL)
        const question_sound = new Audio()
        let question_number = 1
        let score = 0

        // Begin grid quiz first question
        grid_quiz(question_number, score)

        // Select each tile_box and listen for click
        document.querySelectorAll('div.tile-box').forEach(tile_box => {
            tile_box.addEventListener('click', () => {
                // Disable clicking while sound is playing and before next question loads
                document.querySelectorAll('div.tile-box').forEach(tile_box => {
                        tile_box.style.pointerEvents = "none"
                })

                if (parseInt(tile_box.id) === shuffled_quiz_tiles[question_number - 1].tile_number) {
                    console.log('Correct!')
                    correct.play()
                    // Turn tile border green
                    tile_box.style.boxShadow = "0 0 0 3px greenyellow"
                    score++
                } else {
                    console.log('Incorrect!')
                    // Show incorrect border animation
                    tile_box.classList.add("wrong-border-fade-out")
                    incorrect.play()
                }
                question_number++
                // Begin the next question after a timeout
                setTimeout(() => {
                    // Re-enable clicking
                    document.querySelectorAll('div.tile-box').forEach(tile_box => {
                        tile_box.style.pointerEvents = "auto"
                    })
                    // Remove animation so it can be added again
                    // Show incorrect border animation
                    tile_box.classList.remove("wrong-border-fade-out")
                    // Load next question or score screen
                    grid_quiz(question_number, score)
                }, 1000);
            })
        })

        function grid_quiz(question_number, score) {
            if (question_number <= shuffled_quiz_tiles.length) {
                question_sound.setAttribute('src', shuffled_quiz_tiles[question_number - 1].audio_url)
                let audio = ""
                let text = ""
                // Show audio and text in question according to quiz preference
                if (quiz_preference === "audio or text") {
                    if (shuffled_quiz_tiles[question_number - 1].audio_url) {
                        grid_quiz_replay_button.style.display = "block"
                        question_sound.play()
                    } else {
                        grid_quiz_replay_button.style.display = "none"
                    }
                    if (shuffled_quiz_tiles[question_number - 1].tile_text) {
                        grid_quiz_text.style.display = "block"
                        text = shuffled_quiz_tiles[question_number - 1].tile_text
                    } else {
                        grid_quiz_text.style.display = "none"
                    }
                } else if (quiz_preference === "audio only") {
                    if (shuffled_quiz_tiles[question_number - 1].audio_url) {
                        grid_quiz_replay_button.style.display = "block"
                        grid_quiz_text.style.display = "none"
                        audio = shuffled_quiz_tiles[question_number - 1].audio_url
                        question_sound.play()
                    }
                } else if (quiz_preference === "text only") {
                    if (shuffled_quiz_tiles[question_number - 1].tile_text) {
                        grid_quiz_replay_button.style.display = "none"
                        grid_quiz_text.style.display = "block"
                        text = shuffled_quiz_tiles[question_number - 1].tile_text
                    }
                }
                grid_quiz_question_number.innerHTML = `Question ${question_number} of ${shuffled_quiz_tiles.length}`

                // Replay question sound when button is clicked
                grid_quiz_replay_button.addEventListener('click', () => {
                    question_sound.play()
                })
                grid_quiz_text.innerHTML = `"${text}"`
            } else {
                console.log('Quiz end')
                // Remove all tiles to make room for score message
                document.querySelectorAll('.tile-box').forEach(tile_box => {
                    tile_box.remove()
                })
                // Hide quiz elements
                display("none", grid_quiz_box, grid_quiz_question_box)
                // Show score message and try again button
                const try_again_button = createHTML('button', 'no-border play-again-button badge rounded-pill text-bg-info', null, "TRY AGAIN?")
                display("flex", quiz_score_message)
                quiz_score_message.innerHTML = `You got ${score} out of ${shuffled_quiz_tiles.length} correct (${(Math.round(((score/shuffled_quiz_tiles.length) * 100) * 10) / 10)}%)`
                // Restart quiz when button is clicked
                try_again_button.addEventListener('click', () => {
                    fetch_get_grid(grid_id).then(updated_grid => {
                        create_grid(updated_grid, grid_mode)
                    })
                })
                const add_more_message = createHTML('span', 'add-more-message alert alert-warning', null, "Add more tiles with text or audio to your grid to get more questions.")
                if (shuffled_quiz_tiles.length < tile_count) {
                    console.log('this')
                    quiz_score_message.append(add_more_message)
                }
                quiz_score.play()
                quiz_score_message.append(try_again_button)
                grid_box.append(quiz_score_message)
            }
        }
    } else {
        // Initialize image crop box so it can be cleared at the start of create_tile function, allowing for repeated crop attempts
        const image_crop_box = createHTML('div', '', 'image-crop-box')

        // Section determines which section shows on the tile: image, sound, or text (default is image)
        let section = "default"

        // Select each div and open up tile view
        document.querySelectorAll('div.tile-box').forEach(tile_box => {
            tile_box.onclick = () => {
                console.log(tile_box.id)
                create_tile(tile_box.id, section)
            }
        })

        function create_tile(tile_number, section) {
            // Clear image crop box (required to allow multiple crops in a row)
            image_crop_box.innerHTML = ""

            // Create audio player variable so it can be cleared out each time
            let player;

            // Filter tiles array to get tile of this tile number
            const this_tile = getTileFromTileNumber(tiles, tile_number)

            // Fetch tile so prev/next buttons will always show latest tile
            fetch_get_tile(this_tile.tile_id).then(updated_this_tile => {
                // Create tile control elements
                const overlay = createHTML('div', 'overlay')
                const big_edit_tile = createHTML('div', 'big-edit-tile')
                const tile_nav_box = createHTML('div', 'tile-nav-box')
                const tile_nav_image = createHTML('div', 'click tile-nav-item', null, 'image')
                const tile_nav_sound = createHTML('div', 'click tile-nav-item', null, 'sound')
                const tile_nav_text = createHTML('div', 'click tile-nav-item', null, 'text')
                // const tile_number_text = createHTML ('span', 'tile-number-text', null, `tile ${updated_this_tile.tile_number} of ${tile_count}`)
                const back_to_grid_button = createHTML('button', 'hidden no-border back-to-grid-button badge rounded-pill text-bg-info', null, '&#8592; back to grid')
                const tile_control_box = createHTML('div', 'tile-control-box')
                const tile_control_top = createHTML('div', 'tile-control-top')
                const tile_control_middle = createHTML('div', 'tile-control-middle')
                const tile_control_bottom = createHTML('div', 'tile-control-bottom')
                const add_image_button = createHTML('span', 'circle-button add-button button-center', null, '+')
                const remove_image_button = createHTML('span', 'circle-button remove-button', null, 'x')
                const adjust_image_button = createHTML('button', 'hidden no-border edit-button badge rounded-pill text-bg-warning', null, 'adjust image')
                const tile_image_error = createHTML('div', 'hidden alert alert-danger tile-error', null, '')
                const prev_tile_button = createHTML('span', 'circle-button prev-button', null, '&#9204;')
                const next_tile_button = createHTML('span', 'circle-button next-button', null, '&#9205;')
                const crop_and_save_button = createHTML('span', 'circle-button save-image-crop-button', null, '&#10003;')
                const cancel_crop_button = createHTML('span', 'circle-button cancel-image-crop-button', null, 'x')
                const add_tile_text_button = createHTML('span', 'circle-button add-button button-center', null, '+')
                const remove_tile_text_button = createHTML('span', 'circle-button remove-button button-center', null, 'x')
                const save_tile_text_button = createHTML('span', 'circle-button save-tile-button', null, '&#10003;')
                const cancel_tile_text_button = createHTML('span', 'circle-button cancel-tile-button', null, 'x')
                const tile_text_error = createHTML('div', 'hidden alert alert-danger tile-error', null, '')
                const tile_text_chars_remaining = createHTML('div', 'hidden tile-text-chars-remaining', null, `${MAX_TILE_TEXT_CHARS} characters remainining.`)
                const tile_text_box = createHTML('div', 'hidden tile-text-box')
                const tile_text = createHTML('span', 'hidden click tile-text')
                const player_container = createHTML('div', 'hidden player-container')
                const record_button = createHTML('div', 'circle-button record-button')
                const stop_button_container = createHTML('div', 'stop-button-container')
                const stop_button_timer = createHTML('span', 'stop-button-timer', null, '0:00')
                const stop_button_square = createHTML('span', 'stop-button-square', null, '&#9632;')
                const add_tile_audio_button = createHTML('span', 'circle-button add-button button-center', null, '+')
                const remove_tile_audio_button = createHTML('span', 'circle-button remove-button', null, 'x')
                const save_tile_audio_button = createHTML('span', 'circle-button save-tile-button', null, '&#10003;')
                const cancel_tile_audio_button = createHTML('span', 'circle-button cancel-tile-button', null, 'x')
                const audio_filename = createHTML('span', 'hidden audio-filename')
                const tile_audio_error = createHTML('div', 'hidden alert alert-danger tile-error', null, '')

                // Create object out of nav items
                const tile_nav_items = {
                    image: tile_nav_image,
                    sound: tile_nav_sound,
                    text: tile_nav_text
                }

                // Create input for image upload
                const add_image_input = document.createElement('input')
                add_image_input.setAttribute('type', 'file');
                add_image_input.setAttribute('accept', '.jpg, .jpeg, .png, .gif, .svg');

                // Create input for tile text
                const tile_text_input = document.createElement('input')
                tile_text_input.setAttribute('type', 'text');
                tile_text_input.className = "hidden tile-text-input"

                // Create input for audio upload
                const add_audio_input = document.createElement('input')
                add_audio_input.setAttribute('type', 'file');
                add_audio_input.setAttribute('accept', '.wav, .mp3');

                const show_tile_elements = (section) => {
                    fetch_get_tile(updated_this_tile.tile_id).then(updated_tile => {
                        set_background(updated_tile)

                        // Hide all visible image-only elements:
                        display("none", add_image_button, remove_image_button, adjust_image_button, crop_and_save_button, cancel_crop_button, image_crop_box, tile_image_error)
                        // Hide all visible sound-only elements:
                        display("none", player_container, record_button, add_tile_audio_button, remove_tile_audio_button, save_tile_audio_button, cancel_tile_audio_button, audio_filename, tile_audio_error)
                        // Hide all visible text-only elements:
                        display("none", tile_text_input, add_tile_text_button, remove_tile_text_button, save_tile_text_button, cancel_tile_text_button, tile_text_error, tile_text_chars_remaining, tile_text_box, tile_text)

                        if (grid_mode === "edit") {
                            // Show common elements
                            display("flex", prev_tile_button, next_tile_button, tile_nav_box)
                            // display("flex", tile_number_text)
                            display("inline", back_to_grid_button)

                            // Make section-specific elements visible
                            if (section === "image" || section === "default") {
                                // Show adjust and remove image buttons if there is an image
                                if (!updated_tile.image_url.includes(DEFAULT_TILE_IMG_NAME)) {
                                    display("inline", adjust_image_button)
                                    add_image_button.className = 'circle-button add-button'
                                    display("flex", add_image_button, remove_image_button)
                                } else {
                                    add_image_button.className = 'circle-button add-button button-center'
                                    display("flex", add_image_button)
                                }
                                // Resume image cropping if section was switched when cropping was in progress
                                if (image_crop_box.innerHTML != "") {
                                    // Change background temprorarily to default SVG for aesthetics
                                    big_edit_tile.style.backgroundImage = `url(${DEFAULT_TILE_IMG_URL})`
                                    display("inline", image_crop_box)
                                    display("none", add_image_button, remove_image_button, adjust_image_button)
                                    display("flex", crop_and_save_button, cancel_crop_button)
                                }
                            } else if (section === "sound") {
                                display("flex", record_button)
                                if (updated_tile.audio_url != "") {
                                    add_tile_audio_button.className = 'circle-button add-button'
                                    display("flex", player_container, add_tile_audio_button, remove_tile_audio_button)
                                } else {
                                    add_tile_audio_button.className = "circle-button add-button button-center"
                                    display("flex", add_tile_audio_button)
                                }

                            } else if (section === "text") {
                                if(updated_tile.tile_text) {
                                    tile_text.innerHTML = updated_tile.tile_text
                                    display("none", add_tile_text_button)
                                    display("inline", tile_text)
                                    display("flex", remove_tile_text_button, tile_text_box)
                                } else {
                                    display("flex", add_tile_text_button)
                                }
                            }
                        } else if (grid_mode === "view" || grid_mode === "memory") {
                            // Show tile text if it has any
                            if (updated_tile.tile_text && updated_tile.tile_text != "") {
                                // Create clones of text and text box to avoid unwanted click event
                                const new_tile_text_box= tile_text_box.cloneNode()
                                const new_tile_text = tile_text.cloneNode()
                                // Remove click class so text isn't blue
                                new_tile_text.classList.remove("click")
                                new_tile_text.innerHTML = updated_tile.tile_text
                                new_tile_text_box.className = "view-tile-text-box"
                                display("inline", new_tile_text)
                                display("flex", new_tile_text_box)
                                new_tile_text_box.append(new_tile_text)
                                big_edit_tile.append(new_tile_text_box)
                            }

                            // Play tile audio file if there is one
                            if (updated_tile.audio_url) {
                                audio = new Audio(updated_tile.audio_url)
                                audio.controls = false
                                audio.autoplay = true
                            }

                            // Reload create grid view when button is clicked
                            big_edit_tile.classList.add("pointer")
                            big_edit_tile.addEventListener('click', () => {
                                fetch_get_grid(grid_id).then(updated_grid => {
                                    create_grid(updated_grid, grid_mode)
                                })
                            })
                        }
                    })
                }

                const make_active = (section) => {
                    // Default section is image
                    section === "default" ? section = "image" : section = section

                    // Set each nav link to inactive
                    // Learned from: https://masteringjs.io/tutorials/fundamentals/foreach-object
                    Object.keys(tile_nav_items).forEach(key => {
                        tile_nav_items[key].className = "click tile-nav-item"
                    })

                    // Make nav link for current section active
                    tile_nav_items[section].className = "click tile-nav-item tile-nav-item-active"
                }

                const set_background = (updated_tile) => {
                    big_edit_tile.style.backgroundImage = `url(${updated_tile.image_url})`
                }

                // Hide/show section elements, make nav section active, and set the background
                show_tile_elements(section)
                make_active(section)
                set_background(updated_this_tile)

                // ************** NAV EVENT LISTENERS **************

                // Hide/show section-specific elements, make nav links active, and set section for prev/next navigation
                tile_nav_image.addEventListener('click', () => {
                    show_tile_elements('image')
                    make_active('image')
                    section = 'image'
                })
                tile_nav_sound.addEventListener('click', () => {
                    show_tile_elements('sound')
                    make_active('sound')
                    section = 'sound'
                })
                tile_nav_text.addEventListener('click', () => {
                    show_tile_elements('text')
                    make_active('text')
                    section = 'text'
                })

                // Loop around next/prev tiles on click, staying on current section
                prev_tile_button.addEventListener('click', () => {
                    if (updated_this_tile.prev_tile_number === 0) {
                        create_tile(updated_this_tile.last_tile_number, section)
                    } else {
                        create_tile(updated_this_tile.prev_tile_number, section)
                    }
                })
                next_tile_button.addEventListener('click', () => {
                    console.log("updated_this_tile.next_tile_number", updated_this_tile.next_tile_number)
                    console.log({tile_count})
                    if (updated_this_tile.next_tile_number > updated_this_tile.max_tile_number) {
                        console.log("if")
                        create_tile(updated_this_tile.first_tile_number, section)
                    } else {
                        console.log("else")
                        create_tile(updated_this_tile.next_tile_number, section)
                    }
                })

                // Reload create grid view when button is clicked
                back_to_grid_button.addEventListener('click', () => {
                    fetch_get_grid(grid_id).then(updated_grid => {
                        create_grid(updated_grid, grid_mode)
                    })
                })

                // ************** IMAGE SECTION **************

                // Make custom button virtually click file input element
                // Learned from: https://www.youtube.com/watch?v=T3PDgtliezo&ab_channel=dcode
                add_image_button.addEventListener('click', () => {
                    add_image_input.click()
                })

                // Declare variables so they are accessible in the save/crop click event
                let img_data;
                let filename;
                let cropper;

                // Display image cropper ui for new selected image when file is selected
                add_image_input.addEventListener('change', () => {
                    console.log('change detected')
                    // Hide image error message if present
                    display("none", tile_image_error)

                    // Get image file object from input
                    img_data = add_image_input.files[0]

                    // Check if image file exceeds max size or is unaccepted file type
                    if (img_data.size > MAX_IMAGE_SIZE) {
                        tile_image_error.innerHTML = "Image file cannot exceed 10 MB."
                        display("flex", tile_image_error)
                        add_image_input.value = ""
                    } else if (img_data.type != "image/jpeg" && img_data.type != "image/png" && img_data.type != "image/gif" && img_data.type != "image/svg+xml") {
                        tile_image_error.innerHTML = "Image file must be .gif, .jpg, .jpeg, .png, or .svg."
                        display("flex", tile_image_error)
                        add_image_input.value = ""
                    } else {
                        // Save filename in variable
                        filename = img_data.name
                        // Create a DOMString containing a URL representing the image file object
                        const img_url = URL.createObjectURL(img_data)
                        // Create cropper object using image url of input file
                        cropper = create_cropper_obj(img_url)
                    }
                })

                // Display image cropper ui for new selected image when file is selected
                adjust_image_button.addEventListener('click', () => {
                    // Reset grid and get updated grid via fetch
                    fetch_get_tile(updated_this_tile.tile_id).then(updated_tile => {
                        console.log(updated_tile)

                        // Remove uid from filename so it can be replaced during save/crop
                        filename = remove_uid_from_filename(updated_tile.image_name)

                        // Create cropper object using image url of current background
                        cropper = create_cropper_obj(updated_tile.image_url)
                    })
                })

                function create_cropper_obj (img_url) {
                    // Show/hide elements
                    display("inline", image_crop_box)
                    display("flex", crop_and_save_button, cancel_crop_button)
                    display("none", adjust_image_button, add_image_button, remove_image_button)

                    // Change background temprorarily to default SVG for aesthetics
                    big_edit_tile.style.backgroundImage = `url(${DEFAULT_TILE_IMG_URL})`

                    // Create image tag in imagebox showing the uploaded image file using the url
                    image_crop_box.innerHTML = `<img src="${img_url}" id="image" style="width:100%;">`

                    // Assign the cropping view image in a variable
                    const image = document.getElementById('image')

                    // Create a cropper object with the cropping view image
                    // Learned from: https://fengyuanchen.github.io/cropperjs/
                    // https://github.com/fengyuanchen/cropperjs/blob/main/README.md
                    // https://medium.com/geekculture/implement-cropping-feature-on-your-website-in-under-10-min-cropper-js-46b90d860748
                    return cropper = new Cropper(image, {
                        aspectRatio: 1,
                        autoCropArea: 1,
                        dragMode: 'move',
                        viewMode: 1,
                        scalable: false,
                        zoomable: true,
                        movable: true,
                        minCropBoxWidth: 175,
                        minCropBoxHeight: 175,
                        wheelZoomRatio: 0.2
                    })
                }

                // Save the cropped image and set as new tile background when button is clicked
                crop_and_save_button.addEventListener('click', () => {
                    // Fetch updated tile to check if an image already exists
                    fetch_get_tile(updated_this_tile.tile_id).then(updated_tile => {
                        // Ask confirmation to replace if image is not default
                        if (!updated_tile.image_url.includes(DEFAULT_TILE_IMG_NAME)) {
                            const confirmation = confirm("Are you sure you want to replace the current image?");
                            if (!confirmation) {
                                // Clear input value so that change will still be detected if same image is chosen
                                add_image_input.value = null

                                // Update the background
                                set_background(updated_tile)

                                // Show/hide elements
                                add_image_button.className = 'circle-button add-button'
                                display("flex", add_image_button, remove_image_button)
                                display("inline", adjust_image_button)
                                display("none", crop_and_save_button, cancel_crop_button, image_crop_box)
                                return
                            }
                        }
                        crop_image()
                        image_crop_box.innerHTML = ""
                    })
                })

                function crop_image() {
                    // Convert the cropped image on cropper canvas to blob object
                    try {
                        cropper.getCroppedCanvas().toBlob((blob)=>{
                            // Get the original image data
                            let original_image_input = add_image_input

                            // Append uid to filename to prevent image caching issues
                            filename = appendUIDToFilename(filename, section)

                            // Make a new cropped image file using that blob object with the same filename as the original
                            let new_cropped_image_file = new File([blob], filename,{type:"image/*", lastModified:new Date().getTime()});

                            // Create a new container
                            let container = new DataTransfer();

                            // Add the cropped image file to the container
                            container.items.add(new_cropped_image_file);

                            // Replace the original image file with the new cropped image file
                            original_image_input.files = container.files;

                            let formData = new FormData()
                            formData.append('image', new_cropped_image_file)

                            fetch_add_image(updated_this_tile.tile_id, formData).then(updated_tile => {
                                if (updated_tile.message) {
                                    tile_image_error.innerHTML = updated_tile.message
                                    display("flex", tile_image_error)
                                    add_image_input.value = ""

                                    // Show adjust and remove image buttons if there is an image
                                    if (!updated_this_tile.image_url.includes(DEFAULT_TILE_IMG_NAME)) {
                                        display("inline", adjust_image_button)
                                        add_image_button.className = "circle-button add-button"
                                        display("flex", add_image_button, remove_image_button)
                                        set_background(updated_tile.tile)
                                    } else {
                                        add_image_button.className = "circle-button add-button button-center"
                                        display("flex", add_image_button)
                                        display("none", adjust_image_button, remove_image_button)
                                    }
                                } else {
                                    // Update the big tile's background with the new image
                                    display("inline", adjust_image_button)
                                    add_image_button.className = 'circle-button add-button'
                                    display("flex", add_image_button, remove_image_button)
                                    set_background(updated_tile.tile)
                                }
                            })
                            display("none", crop_and_save_button, cancel_crop_button)

                        // Pass cropper toBlob method 'image/jpeg' to prevent jpg > png conversions resulting in bigger file sizes
                        // Learned from: https://github.com/fengyuanchen/cropper/issues/542
                        // https://stackoverflow.com/questions/73188858/why-is-the-cropped-image-file-size-larger-and-with-png-compression-than-the-orig
                        }, 'image/jpeg');
                    } catch (error) {
                        console.log(error)
                        tile_image_error.innerHTML = "Invalid image."
                        display("flex", tile_image_error)
                        add_image_input.value = ""
                        display("none", crop_and_save_button, cancel_crop_button)

                        // Show adjust and remove image buttons if there is an image
                        fetch_get_tile(updated_this_tile.tile_id).then(updated_tile => {
                            if (!updated_tile.image_url.includes(DEFAULT_TILE_IMG_NAME)) {
                                display("inline", adjust_image_button)
                                add_image_button.className = "circle-button add-button"
                                display("flex", add_image_button, remove_image_button)
                                set_background(updated_tile)
                            } else {
                                add_image_button.className = "circle-button add-button button-center"
                                display("flex", add_image_button)
                                display("none", adjust_image_button, remove_image_button)
                            }
                        })
                    }
                }

                // Cancel the crop UI and restore background when button is clicked
                cancel_crop_button.addEventListener('click', () => {

                    // Clear input value so that change will still be detected if same image is chosen
                    add_image_input.value = null

                    // Show/hide elements
                    display("flex", add_image_button)
                    display("none", image_crop_box, crop_and_save_button, cancel_crop_button)

                    // Clear image crop box
                    image_crop_box.innerHTML = ""

                    fetch_get_tile(updated_this_tile.tile_id).then(updated_tile => {
                        // Show adjust and remove image buttons if there is an image
                        if (!updated_tile.image_url.includes(DEFAULT_TILE_IMG_NAME)) {
                            display("inline", adjust_image_button)
                            add_image_button.className = 'circle-button add-button'
                            display("flex", remove_image_button)
                        }

                        // Reset the big tile's background to the current image
                        set_background(updated_tile)
                    })
                })

                // Remove image when button is clicked
                remove_image_button.addEventListener('click', () => {
                    display("none", tile_image_error)
                    const confirmation = confirm("Are you sure you want to remove this image?");
                    if (confirmation) {
                        // Remove image from tile
                        fetch_remove_image(updated_this_tile.tile_id).then(updated_tile => {
                            // Update the big tile's background with the default image
                            set_background(updated_tile)
                        })

                        // Hide remove image button
                        add_image_button.className = 'circle-button add-button button-center'
                        display("none", remove_image_button, adjust_image_button)
                    }
                })

                // ************** SOUND SECTION **************

                // Clear any previously created audio players
                if (document.querySelector('.player')) {
                    document.querySelector('.player').remove()
                }

                // If tile has an audio file, show the audio player
                if (updated_this_tile.audio_url != "") {
                    player = new Audio(updated_this_tile.audio_url)
                    player.controls = true
                    player.classList.add('player')
                    player_container.append(player)
                    big_edit_tile.appendChild(player_container)
                }

                // Create timer
                // Learned from: https://blog.devgenius.io/creating-a-stopwatch-timer-with-html-css-and-javascript-d97da2f23554
                let [minutes, seconds] = [0, 0]
                let int = null

                // Learned from: https://hvitis.dev/how-to-convert-audio-files-with-python-and-django
                // https://github.com/closeio/mic-recorder-to-mp3
                const recorder = new MicRecorder({
                    bitRate: 128
                });

                // Toggle recording when button is clicked
                record_button.addEventListener('click', startRecording)

                function startRecording() {
                    let has_audio = false
                    let confirmation

                    // Get confirmation if tile audio exists
                    if (updated_this_tile.audio_url != "") {
                        has_audio = true
                        confirmation = confirm("Are you sure you want to override the existing audio file?");
                    }

                    // Record if there isn't already audio or user wants to override existing audio
                    if (!has_audio || (has_audio && confirmation)) {
                        // Start the timer
                        if (int != null) {
                            clearInterval(int)
                        }
                        int = setInterval(start_timer, 1000)

                        recorder.start().then(() => {
                            // Change record button to stop button
                            // record_button.innerHTML = '0:00<br/>&#9632;'
                            record_button.className = 'circle-button stop-button'
                            stop_button_container.append(stop_button_timer, stop_button_square)
                            record_button.append(stop_button_container)
                            record_button.removeEventListener('click', startRecording)
                            record_button.addEventListener('click', stopRecording)
                        }).catch((e) => {
                            console.error(e)
                        });
                    }
                }

                function stopRecording() {
                    // Stop the timer
                    clearInterval(int)

                    recorder.stop().getMp3().then(([buffer, blob]) => {
                        let filename = appendUIDToFilename(DEFAULT_AUDIO_RCORDING_NAME, section)

                        const file = new File(buffer, filename, {
                        type: blob.type,
                        lastModified: Date.now()
                        });

                        let formData = new FormData()
                        formData.append('audio_file', file)

                        // Save recorded audio file via fetch
                        fetch_add_audio(updated_this_tile.tile_id, formData).then(updated_tile => {
                            if (updated_tile.message) {
                                tile_audio_error.innerHTML = updated_tile.message
                                add_audio_input.value = ""
                                display("flex", tile_audio_error, add_tile_audio_button, remove_tile_audio_button)
                                display("none", save_tile_audio_button, cancel_tile_audio_button, audio_filename)
                            } else {
                                // Reload tile
                                create_tile(updated_tile.tile.tile_number, section)
                            }
                        })

                        // Change stop button back to record button
                        record_button.innerHTML = ''
                        record_button.className = 'circle-button record-button'
                        record_button.removeEventListener('click', stopRecording)
                        record_button.addEventListener('click', startRecording)

                        // Reset timer back to zero
                        minutes = 0
                        seconds = 0

                    }).catch((e) => {
                        console.error(e)
                    });
                }

                function start_timer() {
                    seconds += 1
                    if (seconds === 60) {
                        seconds = 0
                        minutes++
                    }

                    // Limit recording to 10 visible seconds
                    if (seconds === 11) {
                        stopRecording()
                    }
                    let s = seconds < 10 ? "0" + seconds : seconds
                    stop_button_timer.innerHTML = `${minutes}:${s}`
                }

                add_tile_audio_button.addEventListener('click', () => {
                    add_audio_input.click()
                })

                // Display filename and save/cancel buttons when an audio file is added for upload
                add_audio_input.addEventListener('change', () => {
                    console.log('change detected')
                    // Get audio file object from input
                    let audio_data = add_audio_input.files[0]
                    // Save filename in variable
                    let filename = audio_data.name

                    console.log('audio_data.type', audio_data.type)
                    if (audio_data.type === "audio/wav") {
                        console.log('file is wav')
                    } else if (audio_data.type === "audio/mpeg") {
                        console.log('file is mp3')
                    }

                    // Check if audio file exceeds max size or is unaccepted file type
                    if (audio_data.size > MAX_AUDIO_SIZE) {
                        tile_audio_error.innerHTML = "Audio file cannot exceed 2.5 MB."
                        display("flex", tile_audio_error)
                        add_audio_input.value = ""
                    } else if (audio_data.type != "audio/wav" && audio_data.type != "audio/mpeg") {
                        tile_audio_error.innerHTML = "Audio file must be either .mp3 or .wav."
                        display("flex", tile_audio_error)
                        add_audio_input.value = ""
                    } else {
                        display("none", add_tile_audio_button, remove_tile_audio_button)
                        display("flex", save_tile_audio_button, cancel_tile_audio_button)
                        audio_filename.innerHTML = `Upload ${filename}?`
                        display("inline", audio_filename)

                        // Upload selected audio file
                        let has_audio = false
                        let confirmation

                        save_tile_audio_button.addEventListener('click', () => {
                            // Get confirmation if tile audio exists
                            if (updated_this_tile.audio_url != "") {
                                has_audio = true
                                confirmation = confirm("Are you sure you want to override the existing audio file?");
                            }

                            // Upload if there isn't already audio or user wants to override existing audio
                            if (!has_audio || (has_audio && confirmation)) {
                                // Append uid to filename to prevent file caching issues
                                filename = appendUIDToFilename(filename, section)

                                // Rename the file object
                                // Learned from: https://pqina.nl/blog/rename-a-file-with-javascript/
                                const renamed_audio_data = new File([audio_data], filename);

                                let formData = new FormData()
                                formData.append('audio_file', renamed_audio_data)

                                // Save recorded audio file via fetch if there is no validation message
                                fetch_add_audio(updated_this_tile.tile_id, formData).then(updated_tile => {
                                    if (updated_tile.message) {
                                        tile_audio_error.innerHTML = updated_tile.message
                                        add_audio_input.value = ""
                                        display("flex", tile_audio_error, add_tile_audio_button, remove_tile_audio_button)
                                        display("none", save_tile_audio_button, cancel_tile_audio_button, audio_filename)
                                    } else {
                                        // Reload tile
                                        create_tile(updated_tile.tile.tile_number, section)
                                    }
                                })
                            }
                        })

                        // Cancel audio file upload when button is clicked
                        cancel_tile_audio_button.addEventListener('click', () => {
                            // Clear input value so that change will still be detected if same image is chosen
                            add_audio_input.value = ""
                            add_tile_audio_button.className = "circle-button add-button"
                            display("flex", add_tile_audio_button, remove_tile_audio_button)
                            display("none", save_tile_audio_button, cancel_tile_audio_button, audio_filename)
                        })
                    }
                })

                // Delete existing audio file when button is clicked
                remove_tile_audio_button.addEventListener('click', () => {
                    const confirmation = confirm("Are you sure you want to delete the existing audio file?");
                    if (confirmation) {
                        fetch_remove_audio(updated_this_tile.tile_id).then(updated_tile => {
                            // Reload tile
                            create_tile(updated_tile.tile_number, section)
                        })
                    }
                })


                // ************** TEXT SECTION **************

                // Show text area when button is clicked
                add_tile_text_button.addEventListener('click', () => {
                    tile_text_input.placeholder = DEFAULT_TILE_TEXT
                    display("flex", tile_text_input, save_tile_text_button, cancel_tile_text_button)
                    tile_text_input.focus();
                    display("none", add_tile_text_button, remove_tile_text_button)
                })

                // Show text area when button is is clicked
                tile_text.addEventListener('click', () => {
                    display("flex", save_tile_text_button, cancel_tile_text_button)
                    display("none", add_tile_text_button, remove_tile_text_button)

                    fetch_get_tile(updated_this_tile.tile_id).then(updated_tile => {
                        if (updated_tile.tile_text) {
                            tile_text_input.value = updated_tile.tile_text
                        }
                        tile_text_input.placeholder = DEFAULT_TILE_TEXT
                        display("flex", tile_text_input)
                        tile_text_input.focus();
                    })
                })

                // Clear input and remove/replace elements when button is clicked
                cancel_tile_text_button.addEventListener('click', () => {
                    cancel_tile_text()
                })

                // Do the same when "Escape" is pressed
                tile_text_input.addEventListener('keydown', (e) => {
                    if (e.key === "Escape") {
                        cancel_tile_text()
                    }
                })

                function cancel_tile_text() {
                    tile_text_input.value = ""
                    fetch_get_tile(updated_this_tile.tile_id).then(updated_tile => {
                        if (updated_tile.tile_text) {
                            display("flex", remove_tile_text_button)
                            tile_text.innerHTML = updated_tile.tile_text
                            console.log('this is happening')
                        } else {
                            display("flex", add_tile_text_button)
                            tile_text.innerHTML = ""
                            display("none", tile_text_box, tile_text)
                            console.log('no, this is.')
                        }
                        display("none", tile_text_chars_remaining, tile_text_input, tile_text_error, save_tile_text_button, cancel_tile_text_button)
                    })
                }

                // Save tile text via fetch when button is clicked
                save_tile_text_button.addEventListener('click', () => {
                    update_tile_text()
                })

                // Do the same when "Enter" is pressed
                tile_text_input.addEventListener('keydown', (e) => {
                    if (e.key === "Enter") {
                        update_tile_text()
                    }
                })

                function update_tile_text() {
                    fetch_update_tile_text(updated_this_tile.tile_id, tile_text_input.value).then(updated_text_tile => {
                        if (updated_text_tile.message) {
                            tile_text_error.innerHTML = updated_text_tile.message
                            display("flex", tile_text_error, tile_text_chars_remaining)
                        } else {
                            display("none", tile_text_chars_remaining, tile_text_input, tile_text_error, save_tile_text_button, cancel_tile_text_button)

                            if (updated_text_tile.tile.tile_text && updated_text_tile.tile.tile_text != "") {
                                tile_text.innerHTML = updated_text_tile.tile.tile_text
                                display("flex", remove_tile_text_button)
                            } else {
                                display("none", tile_text_box, tile_text)
                                tile_text.innerHTML = ""
                                display("flex", add_tile_text_button)
                            }
                        }
                    })
                }

                // Remove tile text via fetch when button is clicked
                remove_tile_text_button.addEventListener('click', () => {
                    // Ask confirmation to remove tile text
                    const confirmation = confirm("Are you sure you want to delete this tile text?");
                    if (confirmation) {
                        fetch_remove_tile_text(updated_this_tile.tile_id).then(updated_text_tile => {
                            console.log(updated_text_tile)
                            tile_text_input.value = ""
                            display("none", tile_text_box, tile_text, remove_tile_text_button)
                            tile_text.innerHTML = ""
                            display("flex", add_tile_text_button)
                        })
                    }
                })

                // Show how many characters remain on input and update tile text div
                tile_text_input.addEventListener('input', () => {
                    display("flex", tile_text_chars_remaining)
                    let chars_remaining = MAX_TILE_TEXT_CHARS - tile_text_input.value.length
                    tile_text_chars_remaining.innerHTML = `${chars_remaining} characters remainining.`
                    tile_text_chars_remaining.style.color = "white"
                    if (chars_remaining === 1) {
                        tile_text_chars_remaining.innerHTML = `${chars_remaining} character remaining.`
                    } else if (chars_remaining < 0) {
                        tile_text_chars_remaining.style.color = "#e94a4a"
                    }
                    tile_text.innerHTML = tile_text_input.value
                    if (tile_text_input.value === "") {
                        display("none", tile_text_box, tile_text)
                    } else {
                        display("flex", tile_text_box)
                        display("inline", tile_text)
                    }
                })

                // Append tile editing elements
                tile_text_box.append(tile_text)

                tile_control_top.append(adjust_image_button, audio_filename, tile_text_box)

                tile_control_middle.append(cancel_crop_button, crop_and_save_button, remove_image_button, add_image_button, remove_tile_audio_button, add_tile_audio_button, cancel_tile_audio_button, save_tile_audio_button, remove_tile_text_button, add_tile_text_button, cancel_tile_text_button, save_tile_text_button)

                tile_nav_box.append(tile_nav_image, tile_nav_sound, tile_nav_text)

                tile_control_bottom.append(tile_nav_box)

                tile_control_box.append(tile_control_top, tile_control_middle, tile_control_bottom)
                big_edit_tile.append(back_to_grid_button, image_crop_box, tile_image_error, tile_text_error, tile_text_input, tile_text_chars_remaining, record_button, tile_audio_error, prev_tile_button, next_tile_button, tile_control_box)

                // Remove exisiting big tile element and overlay to prevent duplicates
                if (document.querySelector('.big-edit-tile')) {
                    document.querySelector('.big-edit-tile').remove()
                }
                if (document.querySelector('.overlay')) {
                    document.querySelector('.overlay').remove()
                }
                document.querySelector('#create-grid-view').append(overlay, big_edit_tile)
            })
        }
    }

    // Select each delete tile button
    document.querySelectorAll('.trash-icon').forEach(button => {
        button.onclick = (e) => {
            console.log(`deleting ${button.id}`)
            document.querySelectorAll('.tile-box').forEach(tile_box => {
                if (button.id === tile_box.id) {
                    // Highlight tile to be removed
                    tile_box.style.boxShadow = "0px 0px 0px 2px yellow"
                    // Request animation frames so the highlight shows before the confirmation
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            // Ask confirmation to remove
                            const confirmation = confirm("Are you sure you want to delete this tile and its content?");
                            if (!confirmation) {
                                // Remove highlight and do nothing else if not confirmed
                                tile_box.style.boxShadow = "none"
                            } else {
                                // Fade out tile box
                                tile_box.classList.add("fade")
                                // Wait until tile box is done fading, then shrink
                                setTimeout(() => {
                                    tile_box.style.opacity = "0"
                                    tile_box.classList.remove("fade-out")
                                    tile_box.classList.add("shrink")
                                }, 200)
                                // Wait until animation is done, then fetch/reload grid
                                setTimeout(() => {
                                    fetch_delete_tile(grid_id, button.id).then(updated_grid => {
                                        create_grid(updated_grid, grid_mode)
                                    })
                                }, 400)
                            }
                        })
                    })
                }
            })
            // Learned from: https://stackoverflow.com/questions/17862228/button-onclick-inside-whole-clickable-div
            // https://javascript.info/bubbling-and-capturing
            // https://www.youtube.com/watch?v=UWCvbwo9IRk&ab_channel=dcode
            e.stopPropagation()
        }
    })
}

function createHTML(element, className, id, innerHTML) {
    const newElement = document.createElement(element)
    if (className !== null && className !== undefined) {
        newElement.className = className
    }
    if (id !== null && id !== undefined) {
        newElement.id = id
    }
    if (innerHTML !== null && innerHTML !== undefined) {
        newElement.innerHTML = innerHTML
    }
    return newElement
}

function getTileFromTileNumber(tiles, tileNumber) {
    // Filter tiles array to get tile of this tile number
    const tile = tiles.filter(
        (tile) => tile.tile_number === parseInt(tileNumber)
    );
    return tile[0]
}

function getViewportWidth() {
    // Return the current grid width from the DOM
    return document.documentElement.clientWidth
}

// Append 7-digit uid to filename to prevent cache duplication in browser
// Learned from: https://stackoverflow.com/questions/6248666/how-to-generate-short-uid-like-ax4j9z-in-js
function appendUIDToFilename(filename, section) {
    let filenameArray = filename.split('.')
    let filenameName = ""
    for (i = 0; i < filenameArray.length - 1; i++) {
        filenameName += filenameArray[i]
    }
    let ext = filenameArray[filenameArray.length - 1]
    let uid = Math.random().toString(36).slice(-7);
    let newFilename;
    // If filename is for an image, default to jpg because the cropper converts all valid images to jpg
    if (section === "default" || section === "image") {
        newFilename = `${filenameName}_${uid}.jpg`
    } else {
        newFilename = `${filenameName}_${uid}.${ext}`
    }
    return newFilename
}

// Remove 7-digit uid from filename so uid can be replaced when image is re-saved
function remove_uid_from_filename(filename) {
    let filenameArray = filename.split('.')
    let filenameName = ""
    for (i = 0; i < filenameArray.length - 1; i++) {
        filenameName += filenameArray[i]
    }
    let ext = filenameArray[filenameArray.length - 1]
    filenameName = filenameName.slice(0, -8)
    let newFilename = `${filenameName}.${ext}`
    return newFilename
}

// Set the display of an array of elements
function display(display,...elements) {
    elements.forEach(element => {
        element.style.display = display;
    })
}

async function fetch_new_grid() {
    // Read the CSRF token from the DOM
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // Create and return a new grid
    const response = await fetch("new_grid", {
        method: 'PUT',
        headers: {
            'X-CSRFToken': csrftoken
        },
        body: JSON.stringify({
            viewport_width: getViewportWidth()
        })
    })
    const new_grid = await response.json();
    return new_grid
}

async function fetch_albums() {
    const response = await fetch("get_albums")
    const albums = await response.json();
    return albums
}

async function fetch_create_album(new_album_title) {
    // Read the CSRF token from the DOM
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // Create albums and return albums array
    const response = await fetch(`create_album/${new_album_title}`, {
        method: 'PUT',
        headers: {
            'X-CSRFToken': csrftoken
        }
    })
    const updated_albums = await response.json();
    return updated_albums
}

async function fetch_delete_album(album_id) {
    // Read the CSRF token from the DOM
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // Delete specified album
    const response = await fetch(`delete_album/${album_id}`, {
        method: 'PUT',
        headers: {
            'X-CSRFToken': csrftoken
        }
    })
    const updated_albums = await response.json();
    return updated_albums
}

async function fetch_delete_grids(selected_grid_ids) {
    // Read the CSRF token from the DOM
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // Delete all specified grids
    const response = await fetch('delete_grids', {
        method: 'PUT',
        headers: {
            'X-CSRFToken': csrftoken
        },
        body: JSON.stringify({
            selected_grid_ids: selected_grid_ids
        })
    })
    const updated_albums = await response.json();
    return updated_albums
}

async function fetch_move_grids_to_album(selected_album_id, selected_grid_ids) {
    // Read the CSRF token from the DOM
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // Return albums with updated grids
    const response = await fetch(`move_grids_to_album/${selected_album_id}`, {
        method: 'PUT',
        headers: {
            'X-CSRFToken': csrftoken
        },
        body: JSON.stringify({
            selected_grid_ids: selected_grid_ids
        })
    })
    const updated_albums = await response.json();
    return updated_albums
}

async function fetch_edit_album_title(album_id, updated_album_title) {
    // Read the CSRF token from the DOM
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // Return album with updated title
    const response = await fetch(`edit_album_title/${album_id}`, {
        method: 'PUT',
        headers: {
            'X-CSRFToken': csrftoken
        },
        body: JSON.stringify({
            updated_album_title: updated_album_title
        })
    })
    const updated_album = await response.json();
    return updated_album
}

async function fetch_edit_grid_title(grid_id, updated_grid_title) {
    // Read the CSRF token from the DOM
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // Return grid with updated title
    const response = await fetch(`edit_grid_title/${grid_id}`, {
        method: 'PUT',
        headers: {
            'X-CSRFToken': csrftoken
        },
        body: JSON.stringify({
            updated_grid_title: updated_grid_title,
            viewport_width: getViewportWidth()
        })
    })
    const updated_grid = await response.json();
    return updated_grid
}

async function fetch_change_album(selected_album_id, grid_id) {
    // Read the CSRF token from the DOM
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // Return grid with updated album
    const response = await fetch(`change_album/${grid_id}`, {
        method: 'PUT',
        headers: {
            'X-CSRFToken': csrftoken
        },
        body: JSON.stringify({
            selected_album_id: selected_album_id,
            viewport_width: getViewportWidth()
        })
    })
    const updated_grid = await response.json();
    return updated_grid
}

async function fetch_change_quiz_preference(quiz_preference, grid_id) {
    // Read the CSRF token from the DOM
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // Return grid with updated album
    const response = await fetch(`change_quiz_preference/${grid_id}`, {
        method: 'PUT',
        headers: {
            'X-CSRFToken': csrftoken
        },
        body: JSON.stringify({
            quiz_preference: quiz_preference,
            viewport_width: getViewportWidth()
        })
    })
    const updated_grid = await response.json();
    return updated_grid
}

async function fetch_add_or_remove_tiles(grid_id, old_count, new_count) {
    // Read the CSRF token from the DOM
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // Change tile count and return updated grid
    const response = await fetch(`add_or_remove_tiles/${grid_id}`, {
        method: 'PUT',
        headers: {
            'X-CSRFToken': csrftoken
        },
        body: JSON.stringify({
            old_count: old_count,
            new_count: new_count,
            viewport_width: getViewportWidth()
        })
    })
    const updated_grid = await response.json();
    return updated_grid
}

async function fetch_change_tiles_per_row(selected_tiles_per_row, grid_id) {
    // Read the CSRF token from the DOM
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // Return grid with updated album
    const response = await fetch(`change_tiles_per_row/${grid_id}`, {
        method: 'PUT',
        headers: {
            'X-CSRFToken': csrftoken
        },
        body: JSON.stringify({
            selected_tiles_per_row: selected_tiles_per_row
        })
    })
    const updated_grid = await response.json();
    return updated_grid
}

async function fetch_delete_tile(grid_id, tile_number) {
    // Read the CSRF token from the DOM
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // Return an updated grid after deleting a tile
    const response = await fetch(`delete_tile/${grid_id}`, {
        method: 'PUT',
        headers: {
            'X-CSRFToken': csrftoken
        },
        body: JSON.stringify({
            tile_number: tile_number,
            viewport_width: getViewportWidth()
        })
    })
    const updated_grid = await response.json();
    return updated_grid
}

async function fetch_reset_grid(grid_id) {
    // Read the CSRF token from the DOM
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // Return a reset grid
    const response = await fetch(`reset_grid/${grid_id}`, {
        method: 'PUT',
        headers: {
            'X-CSRFToken': csrftoken
        },
        body: JSON.stringify({
            viewport_width: getViewportWidth()
        })
    })
    const updated_grid = await response.json();
    return updated_grid
}

async function fetch_sort_tiles(grid_id, sort) {
    // Read the CSRF token from the DOM
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // Return grid with re-sorted tiles
    const response = await fetch(`sort_tiles/${grid_id}`, {
        method: 'PUT',
        headers: {
            'X-CSRFToken': csrftoken
        },
        body: JSON.stringify({
            sort: sort,
            viewport_width: getViewportWidth()
        })
    })
    const updated_grid = await response.json();
    return updated_grid
}

async function fetch_add_image(tile_id, image) {
    // Read the CSRF token from the DOM
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // Return tile after adding image
    const response = await fetch(`add_image/${tile_id}`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrftoken
        },
        body: image
    })
    const updated_tile = await response.json();
    return updated_tile
}

async function fetch_remove_image(tile_id) {
    // Read the CSRF token from the DOM
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // Return tile after removing image
    const response = await fetch(`remove_image/${tile_id}`, {
        method: 'PUT',
        headers: {
            'X-CSRFToken': csrftoken
        }
    })
    const updated_tile = await response.json();
    return updated_tile
}

async function fetch_update_tile_text(tile_id, tile_text) {
    // Read the CSRF token from the DOM
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // Return tile with updated tile text
    const response = await fetch(`update_tile_text/${tile_id}`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrftoken
        },
        body: JSON.stringify({
            tile_text: tile_text
        })
    })
    const updated_tile = await response.json();
    return updated_tile
}

async function fetch_remove_tile_text(tile_id) {
    // Read the CSRF token from the DOM
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // Return tile with removed tile text
    const response = await fetch(`remove_tile_text/${tile_id}`, {
        method: 'PUT',
        headers: {
            'X-CSRFToken': csrftoken
        }
    })
    const updated_tile = await response.json();
    return updated_tile
}

async function fetch_add_audio(tile_id, audio_file) {
    // Read the CSRF token from the DOM
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // Return tile after adding audio file
    const response = await fetch(`add_audio/${tile_id}`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrftoken
        },
        body: audio_file
    })
    const updated_tile = await response.json();
    return updated_tile
}

async function fetch_remove_audio(tile_id) {
    // Read the CSRF token from the DOM
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // Return tile after removing audio file
    const response = await fetch(`remove_audio/${tile_id}`, {
        method: 'PUT',
        headers: {
            'X-CSRFToken': csrftoken
        }
    })
    const updated_tile = await response.json();
    return updated_tile
}

async function fetch_get_grid(grid_id) {
    // Read the CSRF token from the DOM
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // Get latest grid
    const response = await fetch(`get_grid/${grid_id}`, {
        method: 'PUT',
        headers: {
            'X-CSRFToken': csrftoken
        },
        body: JSON.stringify({
            viewport_width: getViewportWidth()
        })
    })
    const updated_grid = await response.json();
    return updated_grid
}

async function fetch_get_memory_grid(grid_id) {
    // Read the CSRF token from the DOM
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // Get grid with duplicated tiles for a memory game
    const response = await fetch(`get_memory_grid/${grid_id}`, {
        method: 'PUT',
        headers: {
            'X-CSRFToken': csrftoken
        },
        body: JSON.stringify({
            viewport_width: getViewportWidth()
        })
    })
    const updated_grid = await response.json();
    return updated_grid
}

async function fetch_get_tile(tile_id) {
    // Get latest tile
    const response = await fetch(`get_tile/${tile_id}`)
    const updated_tile = await response.json();
    return updated_tile
}