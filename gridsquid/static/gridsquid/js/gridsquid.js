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
// Values matching CSS
const GRID_BOX_GAP = 10
const GRID_BOX_MARGIN = 0

// Set default grid mode to edit
let gridMode = DEFAULT_GRID_MODE

// ************** MAIN/HOME VIEW **************

// Add click event listener from main grid link to "main" elements
document.querySelector('#main-grid-1').addEventListener('click', () => showView("main"))

// Add click event listener from main grid link to Create Grid section
document.querySelector('#main-grid-2').addEventListener('click', () => {
    // Fetch new grid object
    fetchNewGrid().then(newGrid => {
        // Set history with pustState method
        history.pushState({section: "create-grid", grid: newGrid, gridMode: gridMode}, null, "create-grid")
        // Create grid with new grid object
        createGrid(newGrid, gridMode)
    });
})

// Add click event listener from main grid link to MyGrids section
document.querySelector('#main-grid-3').addEventListener('click', () => {
    // Set history with pustState method
    history.pushState({section: "mygrids"}, null, "mygrids")
    // Fetch albums
    fetchAlbums().then(albums => {
        // Show MyGrids page with albums object
        mygrids(albums)
    });
})

// Add click event listener from main grid link to About section
document.querySelector('#main-grid-4').addEventListener('click', () => {
    // Set history with pustState method
    history.pushState({section: "about"}, null, "about")
    showView("about")
})

// Add click event listener from top Nav logo to Main/Home section
document.querySelector('#home').addEventListener('click', () => {
    // Set history with pustState method
    history.pushState({section: "main"}, null, "home")
    gridMode = DEFAULT_GRID_MODE
    showView("main")
})

// Add click event listener from top Nav to Create Grid section
document.querySelector('#create-grid').addEventListener('click', () => {
    gridMode = DEFAULT_GRID_MODE
    // Fetch new grid object
    fetchNewGrid().then(newGrid => {
        // Set history with pustState method
        history.pushState({section: "create-grid", grid: newGrid, gridMode: gridMode}, null, "create-grid")
        // Create grid with new grid object
        createGrid(newGrid, gridMode)
    });
})

// Add click event listener from top Nav to MyGrids section
document.querySelector('#mygrids').addEventListener('click', () => {
    // Set history with pustState method
    history.pushState({section: "mygrids"}, null, "mygrids")
    // Fetch albums
    fetchAlbums().then(albums => {
        // Show MyGrids page with albums object
        mygrids(albums)
    });
})

// Add click event listener from top Nav to About section
document.querySelector('#about').addEventListener('click', () => {
    // Set history with pustState method
    history.pushState({section: "about"}, null, "about")
    showView("about")
})

// Set history with pustState method when Main/Home section loads
history.pushState({section: "main"}, null, "home")

// Attempt to fetch a new grid in case this is the first visit and there aren't any
fetchNewGrid()
// Show Main/Home seciton by default
showView("main")

// Create history popstate
window.addEventListener("popstate", e => {
    // Load a different part of the page depending on the pushState section
    let section = e.state.section
    if (section === "main" || section === "mygrids" || section === "about") {
        showView(section)
    } else if (section === "create-grid") {
        createGrid(e.state.grid, e.state.gridMode)
    } else if (section === "create-tile") {
        createTile(e.state.tiles, e.state.gridID, e.state.gridMode, e.state.tileCount, e.state.tileBoxID, e.state.tileSection)
    }
})

function showView(view) {
    //First hide all view divs
    document.querySelectorAll('.view').forEach(div => {
        div.style.display = 'none';
    })

    //Display only desired view
    document.querySelector(`#${view}-view`).style.display = 'flex'
}

// ************** MYGRIDS **************

function mygrids({ albums, grids, message }) {
    // Delete any previous dupes of MyGrids
    document.querySelector('#mygrids-view').innerHTML = ""

    // Show MyGrids view
    showView("mygrids")

    // Create HTML elements
    const headingBox = createHTML('div', 'heading-box')
    const mygridsHeading = createHTML('span', 'mygrids-heading', null, 'MyGrids')
    const deleteSelectedButton = createHTML('button', 'smaller-button btn btn-danger btn-sm', null, 'delete selected grids')
    const myGridsBox = createHTML('div', 'mygrids-box')
    const albumBox = createHTML('div', 'album-box')
    const albumTitleBox = createHTML('div', 'album-title-box')
    const albumTitle = createHTML('h6', 'album-title', null, '* MyGrids')
    const gridTitle = createHTML('span', 'click mygrids-grid-title', null, 'Grid Title')
    const gridTitleSelectionBox = createHTML('div', 'grid-title-selection-box')
    const albumControlBox = createHTML('div', null, 'album-control-box')
    const newAlbumInputBox = createHTML('div', 'new-album-input-box')
    const addAlbumButton = createHTML('span', 'circle-button-album add-button-album', null, '+')
    const deleteAlbumButton = createHTML('img', 'trash-icon-album')

    // Set delete album button image source
    deleteAlbumButton.src = TILE_TRASH_ICON_URL
    display("inline-block", deleteAlbumButton)

    // Create new album input
    const newAlbumInput = document.createElement('input')
    newAlbumInput.setAttribute('type', 'text');
    newAlbumInput.className = "input new-album-input"
    newAlbumInput.placeholder = "New Album"
    newAlbumInput.maxLength = 60

    // Create edit album input
    const editAlbumTitleInput = document.createElement('input')
    editAlbumTitleInput.setAttribute('type', 'text');
    editAlbumTitleInput.className = "input edit-album-title-input"
    editAlbumTitleInput.maxLength = 60

    // Create grid checkbox inputs
    const gridCheckbox = document.createElement('input')
    gridCheckbox.setAttribute('type', 'checkbox');
    gridCheckbox.className = "checkbox inline grid-checkbox"

    // Filter albums object for albums that are the default MyGrids to get ID
    const albumsMyGrids = albums.filter(
        (album) => album.albumTitle === "MyGrids"
    );

    // Create album move to selections menu
    const moveGridsSelection = document.createElement('select')
    const albumOption = document.createElement('option')
    albumOption.text = " -- Move to:"
    albumOption.value = ""
    const albumOption2 = document.createElement('option')
    albumOption2.text = "* MyGrids"
    albumOption2.value = albumsMyGrids[0].albumID
    moveGridsSelection.add(albumOption)
    moveGridsSelection.add(albumOption2)

    // Filter albums object for albums that are not the default MyGrids
    const albumsNotMyGrids = albums.filter(
        (album) => album.albumTitle !== "MyGrids"
    );

    // Create dropdown list of each existing album
    albumsNotMyGrids.forEach((album) => {
        // Limit display of album title to 15 characters
        let albumTitle = album.albumTitle
        if (albumTitle.length > 15) {
            albumTitle = `${albumTitle.substring(0, 14)}...`
        }
        const newAlbumOption = albumOption.cloneNode()
        newAlbumOption.text = albumTitle
        newAlbumOption.value = album.albumID
        moveGridsSelection.add(newAlbumOption)
    })

    // Append upper elements
    headingBox.append(mygridsHeading, deleteSelectedButton)
    newAlbumInputBox.append(newAlbumInput, addAlbumButton)
    albumControlBox.append(newAlbumInputBox, moveGridsSelection)
    if (message) {
        const messageDiv = createHTML('div', 'alert alert-danger', 'error-message', message)
        document.querySelector('#mygrids-view').append(messageDiv)
    }

    // Use Some method to check if there is at least one not-new grid in MyGrids/not MyGrids album(s)
    // Learned from: https://www.youtube.com/watch?v=7m9EiRS_Kc0&ab_channel=JamesQQuick
    const oneGridMyGrids = grids.some(
        (grid) => grid.albumTitle === "MyGrids" && grid.gridNew == false
    );
    const oneGridNotMyGrids = grids.some(
        (grid) => grid.albumTitle !== "MyGrids"
    );

    // Use Some method to check if there is at least one grid in an album other than MyGrids
    const oneAlbumNotMyGrids = albums.some(
        (album) => album.albumTitle !== "MyGrids"
    );

    // If there is at least one edited (not new) grid in the MyGrids album, show the album box for MyGrids
    if (oneGridMyGrids) {
        // Filter grids for not-new grids that are in the default MyGrids album
        const gridsInMyGrids = grids.filter(
            (grid) => grid.albumTitle === "MyGrids" && grid.gridNew == false
        );

        // Append album box to MyGrids box
        albumBox.append(albumTitle)
        myGridsBox.append(albumBox)

        // For each grid in this album, display the grid title
        gridsInMyGrids.forEach((grid) => {
            const newGridTitleSelectionBox = gridTitleSelectionBox.cloneNode()
            const newGridCheckbox = gridCheckbox.cloneNode()
            newGridCheckbox.value = grid.gridID
            const newGridTitle = gridTitle.cloneNode()
            newGridTitle.id = grid.gridID
            newGridTitle.innerText = `${grid.gridTitle}`

            newGridTitleSelectionBox.append(newGridCheckbox, newGridTitle)
            albumBox.append(newGridTitleSelectionBox)

            // Load the grid in view mode when title is clicked
            newGridTitle.addEventListener('click', () => {
                gridMode = "view"
                fetchGetGrid(grid.gridID).then(updatedGrid => {
                    // Set history with pustState method
                    history.pushState({section: "create-grid", grid: updatedGrid, gridMode: gridMode}, null, `${gridMode}-grid`)
                    // Create grid with new grid object
                    createGrid(updatedGrid, gridMode)
                })
            })
        })
    // If there are no edited (not new) grids in any album, show a message
    } else if (!oneGridMyGrids && !oneGridNotMyGrids) {
        albumBox.append(albumTitle)
        myGridsBox.append(albumBox)
        const noFirstGridMessage = createHTML('p', 'inline', null, "You don't have any grids. ")
        const createOneMessage = createHTML('p', 'click inline', null, 'Go create one!')
        albumBox.append(noFirstGridMessage, createOneMessage)

        // Delete delete/move options since there are no grids to delete or move
        deleteSelectedButton.remove()
        moveGridsSelection.remove()

        createOneMessage.addEventListener('click', () => {
            gridMode = "edit"
            fetchNewGrid().then(newGrid => {
                // Set history with pustState method
                history.pushState({section: "create-grid", grid: newGrid, gridMode: gridMode}, null, `${gridMode}-grid`)
                // Create grid with new grid object
                createGrid(newGrid, gridMode)
            });
        })
    }

    // If non-default (not "MyGrids") album(s) exist, create more album boxes and list their grids
    if (oneAlbumNotMyGrids) {
        // For each album that isn't a default MyGrids album, create a new album box
        albumsNotMyGrids.forEach((album) => {
            // Build the album box
            const newAlbumTitleBox = albumTitleBox.cloneNode()
            const newAlbumBox = albumBox.cloneNode()
            const newDeleteAlbumButton = deleteAlbumButton.cloneNode(true)
            const newAlbumTitle = albumTitle.cloneNode()
            newAlbumBox.id = album.albumID
            newAlbumTitle.id = album.albumID
            newAlbumTitle.className = "click new-album-title"
            newAlbumTitle.innerText = album.albumTitle

            // Assign album title the MyGrids album id
            newDeleteAlbumButton.id = album.albumID
            newAlbumTitleBox.append(newAlbumTitle)
            newAlbumBox.append(newAlbumTitleBox, newDeleteAlbumButton)
            myGridsBox.append(newAlbumBox)

            // Check if there is at least one grid in this album
            const oneGridThisAlbum = grids.some(
                (grid) => grid.albumTitle === album.albumTitle
            );

            if (oneGridThisAlbum){
                // Filter grids object for grids that are in this album
                const gridsInThisAlbum = grids.filter(
                    (grid) => grid.albumTitle === album.albumTitle
                );

                // For each grid in this album, display the grid title
                gridsInThisAlbum.forEach((grid) => {
                    const newGridTitleSelectionBox = gridTitleSelectionBox.cloneNode()
                    const newGridCheckbox = gridCheckbox.cloneNode()
                    newGridCheckbox.value = grid.gridID
                    const newGridTitle = gridTitle.cloneNode()
                    newGridTitle.id = grid.gridID
                    newGridTitle.innerText = `${grid.gridTitle}`

                    newGridTitleSelectionBox.append(newGridCheckbox, newGridTitle)
                    newAlbumBox.append(newGridTitleSelectionBox)

                    // Load the grid in view mode when title is clicked
                    newGridTitle.addEventListener('click', () => {
                        gridMode = "view"
                        fetchGetGrid(grid.gridID).then(updatedGrid => {
                            // Set history with pustState method
                            history.pushState({section: "create-grid", grid: updatedGrid, gridMode: gridMode}, null, `${gridMode}-grid`)
                            createGrid(updatedGrid, gridMode)
                        })
                    })
                })
            // If there are no grids in the album, show a message
            } else {
                const noGridsMessage = createHTML('p', null, null, '(Feed me grids.)')
                newAlbumBox.append(noGridsMessage)
            }
        })
    }
    // Append MyGrids elements
    document.querySelector('#mygrids-view').append(headingBox, albumControlBox, myGridsBox)

    // Select each delete tile button
    document.querySelectorAll('.trash-icon-album').forEach(button => {
        button.onclick = (e) => {
            console.log(`deleting album id ${button.id}`)

            document.querySelectorAll('.album-box').forEach(albumBox => {
                if (button.id === albumBox.id) {
                    // Highlight album to be removed
                    albumBox.style.boxShadow = "0px 0px 0px 2px yellow"
                    // Request animation frames so the highlight shows before the confirmation
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            // Ask confirmation to remove
                            const confirmation = confirm("Are you sure you want to delete this album and all the grids within it?");
                            if (!confirmation) {
                                // Remove highlight and do nothing else if not confirmed
                                albumBox.style.boxShadow = "none"
                            } else {
                                // Fade out album box
                                albumBox.classList.add("fade")
                                // Wait until tile box is done fading, then shrink
                                setTimeout(() => {
                                    albumBox.style.opacity = "0"
                                    albumBox.innerHTML = ""
                                    albumBox.classList.remove("fade-out")
                                    albumBox.classList.add("shrink")
                                }, 200)
                                // Wait until animation is done, then fetch/reload mygrids
                                setTimeout(() => {
                                    fetchDeleteAlbum(button.id).then(updatedAlbums => {
                                        mygrids(updatedAlbums)
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
    addAlbumButton.addEventListener('click', () => {
        addAlbum()
    })

    // Do the same as the buttons for Enter/Escape
    newAlbumInput.addEventListener('keydown', (e) => {
        if (e.key === "Enter") {
            addAlbum()
        } else if (e.key === "Escape") {
            newAlbumInput.value = ""
        }
    })

    function addAlbum() {
        // Generate numbered "New Album ##" albums if input is blank
        let newAlbumInputValue = newAlbumInput.value
        if (newAlbumInputValue === "") {
            // Is there at least one album already titled "New Album 01"?
            const oneNewAlbum01 = albums.some(
                (album) => album.albumTitle === "New Album 01");

            if (oneNewAlbum01) {
                // Filter albums for "New Album..." albums
                const newAlbumAlbums = albums.filter(
                    (album) => album.albumTitle.slice(0, 9) === "New Album");
                // Use Map method to create array of just "New Album" numbers and get the highest one
                // Learned from: https://www.youtube.com/watch?v=G6J2kl1aVao&t=166s&ab_channel=JamesQQuick
                const newAlbumNumbers = newAlbumAlbums.map((newAlbumAlbums) => parseInt(newAlbumAlbums.albumTitle.slice(10)))
                const highestNewAlbumNumber = Math.max(...newAlbumNumbers)
                // If next number is below 10, normalize with a 0 for proper sorting under 100
                newAlbumInputValue = highestNewAlbumNumber < 9 ? `New Album 0${highestNewAlbumNumber + 1}` : `New Album ${highestNewAlbumNumber + 1}`
            } else {
                newAlbumInputValue = "New Album 01"
            }
        }

        // Create a stand-in album box to fade-in before reloading mygrids
        const newAlbumBox = albumBox.cloneNode()
        const newAlbumTitleBox = albumTitleBox.cloneNode()
        const newAlbumTitle = albumTitle.cloneNode()
        newAlbumTitle.innerText = newAlbumInputValue
        newAlbumTitle.className = "click new-album-title"
        newAlbumTitleBox.append(newAlbumTitle)
        const newDeleteAlbumButton = deleteAlbumButton.cloneNode()
        const noGridsMessage = createHTML('p', null, null, '(Feed me grids.)')
        newAlbumBox.append(newAlbumTitleBox, newDeleteAlbumButton, noGridsMessage)
        myGridsBox.append(newAlbumBox)
        newAlbumBox.classList.add("fade-in")

        // Update mygrids via fetch after the fade-in/out animation
        setTimeout(() => {
            fetchCreateAlbum(newAlbumInputValue).then(updatedAlbums => {
                mygrids(updatedAlbums)
            })
        }, 200)
    }

    // Update album title via fetch
    document.querySelectorAll('.new-album-title').forEach(albumTitle => {
        albumTitle.addEventListener('click', (e) => {
            const newEditAlbumTitleInput = editAlbumTitleInput.cloneNode()

            if (albumTitle.innerText.slice(0, 9) === "New Album") {
                newEditAlbumTitleInput.value = ""
            } else {
                newEditAlbumTitleInput.value = albumTitle.innerText
            }

            albumTitle.replaceWith(newEditAlbumTitleInput)
            newEditAlbumTitleInput.focus();

            e.stopPropagation()

            // Detect all mousedowns on the document
            // Learned from: https://www.youtube.com/watch?v=wX0pb6CBS-c&ab_channel=TechStacker
            let saveOnMousedown = function(e) {
                // If mousedown is within the album title input element
                if (e.target.closest('.edit-album-title-input')) {
                    console.log('mousedown inside input, do nothing')
                    return
                }

                // If mousedown is outside the input, remove the event listener and update the album title via fetch
                console.log('mousedown outside input')

                // Remove event listener
                // Learned from: https://stackoverflow.com/questions/10444077/javascript-removeeventlistener-not-working
                document.removeEventListener('mousedown', saveOnMousedown, true)

                if (newEditAlbumTitleInput.value === "" || newEditAlbumTitleInput.value === albumTitle.innerText) {
                    newEditAlbumTitleInput.value = albumTitle.innerText
                    newEditAlbumTitleInput.replaceWith(albumTitle)
                    console.log('Album title not changed.')
                } else {
                    console.log('Updating new album title.')
                    fetchEditAlbumTitle(albumTitle.id, newEditAlbumTitleInput.value).then(updatedAlbums => {
                        mygrids(updatedAlbums)
                    })
                }
            }

            // Listen for mousedown in the document
            document.addEventListener('mousedown', saveOnMousedown, true)

            // Listen for keypresses
            newEditAlbumTitleInput.addEventListener('keydown', (e) => {
                if (e.key === "Enter") {
                    // Remove event listener
                    document.removeEventListener('mousedown', saveOnMousedown, true)
                    if (newEditAlbumTitleInput.value !== "") {
                    // fetch edited album title
                    fetchEditAlbumTitle(albumTitle.id, newEditAlbumTitleInput.value).then(updatedAlbums => {
                        mygrids(updatedAlbums)
                    })
                    }
                } else if (e.key === "Escape") {
                    // Remove event listener
                    document.removeEventListener('mousedown', saveOnMousedown, true)
                    newEditAlbumTitleInput.value = ""
                    newEditAlbumTitleInput.replaceWith(albumTitle)
                }
            })
        })
    })
    // Delete selected grids when button is pressed
    deleteSelectedButton.addEventListener('click', () => {
        // Create array of selected grids
        const selectedGridIDs = []
        document.querySelectorAll('.grid-checkbox:checked').forEach(checkedGrid => {
            selectedGridIDs.push(checkedGrid.value)
        })

        // If there are any grids to be deleted...
        if (selectedGridIDs.length > 0) {
            let confirmation;
            if (selectedGridIDs.length === 1) {
                confirmation = confirm("Are you sure you want to delete this grid and all of its content?");
            } else {
                confirmation = confirm("Are you sure you want to delete these grids and all of their content?");
            }
            if (confirmation) {
                fetchDeleteGrids(selectedGridIDs).then(updatedAlbums => {
                    mygrids(updatedAlbums)
                })
            }
        } else {
            console.log("Nothing is checked/selected.")
        }
    })

    // Move selected grids to selected album when button is pressed
    moveGridsSelection.addEventListener('change', () => {
        // Create array of selected grids
        const selectedGridIDs = []
        document.querySelectorAll('.grid-checkbox:checked').forEach(checkedGrid => {
            selectedGridIDs.push(checkedGrid.value)
        })

        // Learned from: https://stackoverflow.com/questions/1085801/get-selected-value-in-dropdown-list-using-javascript
        const selectedAlbumID = moveGridsSelection.options[moveGridsSelection.selectedIndex].value

        // Only move grids via fetch if something is checked and selection is not the default option
        if (selectedGridIDs.length > 0 && selectedAlbumID != "") {
            fetchMoveGridsToAlbum(selectedAlbumID, selectedGridIDs).then(updatedAlbums => {
                mygrids(updatedAlbums)
            })
        } else { console.log('not moved')}
    })
}

// ************** NEW GRID **************

function createGrid({ grid: { gridID, gridNew, gridTitle, albumID, albumTitle, tileOrder, tileCount, defaultTilesPerRow, userTilesPerRow, quizPreference }, albums, tiles, message }, gridMode) {
    console.log(gridID, gridNew, gridTitle, albumID, albumTitle, tileOrder, tileCount, defaultTilesPerRow, userTilesPerRow, quizPreference)
    console.log(albums)
    console.log(tiles)
    console.log ({gridMode})

    // Set tiles per row to user preference, otherwise set to default
    let tilesPerRow = defaultTilesPerRow
    if (userTilesPerRow != null) {
        tilesPerRow = userTilesPerRow
    }

    // Convert tile order string to array
    if (typeof tileOrder === "string") {
        tileOrder = JSON.parse(tileOrder)
    }

    // Clear any previous dupes of grid
    document.querySelector('#create-grid-view').innerHTML = ""

    // Show create grid view
    showView("create-grid")

    // Create title elements
    const headingBox = createHTML('div', 'heading-box')
    const gridTitleHeading = createHTML('span', 'click grid-title-heading', null, `${gridTitle}`)
    const headingButtonBox = createHTML('div', 'heading-button-box')
    const gridModeButton = createHTML('button', 'hidden no-border badge rounded-pill text-bg-info')
    const memoryGameTimer = createHTML('div', 'hidden memory-game-timer', null, "0:00")
    const memoryGameButton = createHTML('button', 'hidden no-border badge rounded-pill text-bg-info', null, "MEMORY")
    const quizButton = createHTML('button', 'hidden no-border badge rounded-pill text-bg-info', null, "QUIZ")
    const restartButton = createHTML('button', 'hidden no-border badge rounded-pill text-bg-info', null, "RESTART")

    // Create title input
    const gridTitleInput = document.createElement('input')
    gridTitleInput.setAttribute('type', 'text');
    gridTitleInput.className = "input grid-title-input"
    gridTitleInput.placeholder = `${gridTitle}`
    gridTitleInput.maxLength = 60

    if (gridMode === "edit") {
        // Edit grid title when title is clicked
        gridTitleHeading.addEventListener('click', (e) => {
            gridTitleHeading.replaceWith(gridTitleInput)
            if (gridTitle !== "New Grid") {
                gridTitleInput.value = gridTitle
            }
            gridTitleInput.focus();

            e.stopPropagation()

            // Detect all mousedowns on the document
            // Learned from: https://www.youtube.com/watch?v=wX0pb6CBS-c&ab_channel=TechStacker
            let saveOnMousedown = function(e) {
                // If mousedown is within the grid title input element
                if (e.target.closest('#grid-title-input')) {
                    console.log('mousedown inside input, do nothing')
                    return
                }

                // If mousedown is outside the input, remove the event listener and update the grid title via fetch
                console.log('mousedown outside input')

                // Remove event listener
                // Learned from: https://stackoverflow.com/questions/10444077/javascript-removeeventlistener-not-working
                document.removeEventListener('mousedown', saveOnMousedown, true)

                // If the new title is blank or unchanged, don't change the title
                if (gridTitleInput.value === "" || gridTitleInput.value === gridTitle) {
                    // If the grid title is not "New Grid", populate the input with the title to be edited
                    if (gridTitle !== "New Grid") {
                        gridTitleInput.value = gridTitle
                    // If the title is "New Grid", clear the input field
                    } else {
                        gridTitleInput.value = ""
                    }

                    gridTitleInput.replaceWith(gridTitleHeading)
                    console.log('Grid title not changed.')
                } else {
                    console.log('Updating new grid title.')
                    fetchEditGridTitle(gridID, gridTitleInput.value).then(updatedGrid => {
                        createGrid(updatedGrid, gridMode)
                    })
                }
            }

            // Listen for mousedown in the document
            document.addEventListener('mousedown', saveOnMousedown, true)

            // Do the same as the buttons for Enter/Escape
            gridTitleInput.addEventListener('keydown', (e) => {
                if (e.key === "Enter") {
                    // Remove event listener
                    document.removeEventListener('mousedown', saveOnMousedown, true)
                    // Update grid's title via fetch
                    fetchEditGridTitle(gridID, gridTitleInput.value).then(updatedGrid => {
                        createGrid(updatedGrid, gridMode)
                    });
                } else if (e.key === "Escape") {
                    // Remove event listener
                    document.removeEventListener('mousedown', saveOnMousedown, true)
                    gridTitleInput.replaceWith(gridTitleHeading)
                    gridTitleInput.value = ""
                }
            })
        })
    // If grid mode is not "edit", title should not be edit/click-able
    } else {
        gridTitleHeading.classList.remove("click")
    }

    // Create elements for album, tile tile controls, grid box, and tile box
    const gridControlBox = createHTML('div', 'grid-control-box')
    const albumSelectionBox = createHTML('div', 'album-selection-box')
    const albumTitleText = createHTML('p', 'album-title-text', null, 'Album:')
    const tileCounterBox = createHTML('div', 'tile-counter-box')
    const tileCounterText = createHTML('p', 'tile-counter-text', null, 'Tile Count:')
    const tileCounterNumber = createHTML('p', 'click tile-counter-number', null, tileCount)
    const tilesPerRowBox = createHTML('div', 'tiles-per-row-box')
    const tilesPerRowText = createHTML('p', 'tiles-per-row-text', null, 'Tiles/Row:')
    const gridButtonBox = createHTML('div', 'hidden grid-button-box')
    const gridButtonBoxLeft = createHTML('div', 'grid-button-box-left')
    const gridButtonBoxRight = createHTML('div', 'grid-button-box-right')
    const reverseSortButton = createHTML('button', 'button-left no-border badge rounded-pill text-bg-secondary', null, 'reverse')
    const mixSortButton = createHTML('button', 'button-left no-border badge rounded-pill text-bg-secondary', null, 'mix up')
    const defaultSortButton = createHTML('button', 'button-middle no-border badge rounded-pill text-bg-secondary', null, 'default sort')
    const saveAndNewButton = createHTML('button', 'no-border badge rounded-pill text-bg-info', null, 'save and new')
    const resetGridButton = createHTML('button', 'button-left no-border badge rounded-pill text-bg-danger', null, 'reset grid')
    const gridQuizBox = createHTML('div', 'hidden grid-quiz-box')
    const gridQuizQuestionNumber = createHTML('div', 'grid-quiz-question-number')
    const gridQuizQuestionBox = createHTML('div', 'hidden grid-quiz-question-box')
    const gridQuizPreference = createHTML('div', 'grid-quiz-preference')
    const gridBox = createHTML('div', 'grid-box')
    const tileBox = createHTML('div', 'pointer tile-box')
    const tileBoxFront = createHTML('div', 'tile-box-front')
    const tileBoxBack = createHTML('div', 'tile-box-back')
    const deleteTileButton = createHTML('img', 'trash-icon')
    const tileIconBox = createHTML('div', 'tile-icon-box')
    const tileAudioIcon = createHTML('img', 'tile-icon')
    const tileTextIcon = createHTML('img', 'tile-icon')
    const memoryGameWinMessage = createHTML('div', 'hidden you-win', null, 'YOU WIN!')
    const quizScoreMessage = createHTML('div', 'hidden quiz-score')

    // Show elements based on mode
    if (gridMode === "edit") {
        display("flex", gridControlBox, gridButtonBox, tileIconBox)
        display("inline", gridModeButton, deleteTileButton)
        gridModeButton.innerText = "VIEW MODE"

        // Switch to view mode when button is clicked
        gridModeButton.addEventListener('click', () => {
            gridMode = "view"
            fetchGetGrid(gridID).then(updatedGrid => {
                // Set history with pustState method
                history.pushState({section: "create-grid", grid: updatedGrid, gridMode: gridMode}, null, `${gridMode}-grid`)
                createGrid(updatedGrid, gridMode)
            })
        })
    } else if (gridMode === "view") {
        display("inline", gridModeButton)
        gridModeButton.innerText = "EDIT MODE"

        // Switch to edit mode when button is clicked
        gridModeButton.addEventListener('click', () => {
            gridMode = "edit"
            fetchGetGrid(gridID).then(updatedGrid => {
                // Set history with pustState method
                history.pushState({section: "create-grid", grid: updatedGrid, gridMode: gridMode}, null, `${gridMode}-grid`)
                createGrid(updatedGrid, gridMode)
            })
        })
    } else if (gridMode === "memory") {
        display("inline", restartButton, memoryGameButton)
        display("block", memoryGameTimer)
        memoryGameButton.innerText = "END GAME"

        // Restart memory game when button is clicked
        restartButton.addEventListener('click', () => {
            gridMode = "memory"
            fetchGetMemoryGrid(gridID).then(updatedGrid => {
                // Set history with pustState method
                history.replaceState({section: "create-grid", grid: updatedGrid, gridMode: gridMode}, null, "memory")
                createGrid(updatedGrid, gridMode)
            })
        })

        // End memory game and switch back to view mode when button is clicked
        memoryGameButton.addEventListener('click', () => {
            gridMode = "view"
            fetchGetGrid(gridID).then(updatedGrid => {
                // Set history with pustState method
                history.pushState({section: "create-grid", grid: updatedGrid, gridMode: gridMode}, null, `${gridMode}-grid`)
                createGrid(updatedGrid, gridMode)
            })
        })
    } else if (gridMode === "quiz") {
        display("inline", restartButton, quizButton)
        display("flex", gridQuizBox, gridQuizQuestionNumber, gridQuizQuestionBox, gridQuizPreference)
        quizButton.innerText = "END QUIZ"

        // Restart quiz when button is clicked
        restartButton.addEventListener('click', () => {
            gridMode = "quiz"
            fetchGetGrid(gridID).then(updatedGrid => {
                // Set history with pustState method
                history.replaceState({section: "create-grid", grid: updatedGrid, gridMode: gridMode}, null, "quiz")
                createGrid(updatedGrid, gridMode)
            })
        })

        // End quiz and switch back to view mode when button is clicked
        quizButton.addEventListener('click', () => {
            gridMode = "view"
            fetchGetGrid(gridID).then(updatedGrid => {
                // Set history with pustState method
                history.pushState({section: "create-grid", grid: updatedGrid, gridMode: gridMode}, null, `${gridMode}-grid`)
                createGrid(updatedGrid, gridMode)
            })
        })
    }

    // Set src for tile icons
    tileAudioIcon.src = TILE_AUDIO_ICON_URL
    tileTextIcon.src = TILE_TEXT_ICON_URL
    deleteTileButton.src = TILE_TRASH_ICON_URL

    // Filter albums object for albums that are the default MyGrids to get ID
    const albumsMyGrids = albums.filter(
        (album) => album.albumTitle === "MyGrids"
    );

    // Create album change selections with all existing albums, starting with "MyGrids"
    const changeAlbumSelection = document.createElement('select')
    changeAlbumSelection.className = "change-album-selection"
    const albumOption = document.createElement('option')
    albumOption.text = "* MyGrids"
    albumOption.value = albumsMyGrids[0].albumID
    changeAlbumSelection.add(albumOption)

    // If the album ID of the current grid matches that of the firt filtered album, "MyGrids" should be selected
    if (albumID == albumsMyGrids[0].albumID) {
        albumOption.selected = true
    }

    // Populate the rest of the selections; also, if the current grid album matches those selections, this album should be selected
    albums.forEach((album) => {
        if (album.albumTitle !== "MyGrids") {
            // Limit display of album title to 15 characters
            let albumTitle = album.albumTitle
            if (albumTitle.length > 15) {
                albumTitle = `${albumTitle.substring(0, 14)}...`
            }

            const newAlbumOption = albumOption.cloneNode()
            newAlbumOption.text = albumTitle
            newAlbumOption.value = album.albumID
            changeAlbumSelection.add(newAlbumOption)

            // Select current album
            if (albumID == album.albumID) {
                newAlbumOption.selected = true
            }
        }
    })

    // Change grid album when option is changed
    changeAlbumSelection.addEventListener('change', () => {
        const selectedAlbumID = changeAlbumSelection.options[changeAlbumSelection.selectedIndex].value
        fetchChangeAlbum(selectedAlbumID, gridID).then(updatedGrid => {
            createGrid(updatedGrid, gridMode)
        })
    })

    // Set tile size on load
    setTileSize()

    function setTileSize() {
        // Set tile box height and width based on current width of grid (which is limited by the view div)
        const maxGridWidth = document.querySelector('#create-grid-view').offsetWidth
        // Calculate tile size using tiles per row value to fit perfectly in the grid
        const tileBoxSize = (maxGridWidth - ((tilesPerRow - 1) * GRID_BOX_GAP) - (GRID_BOX_MARGIN * 2))/tilesPerRow
        tileBox.setAttribute("style", `height: ${tileBoxSize}px; width: ${tileBoxSize}px;`);
        return tileBoxSize
    }

    // Create tile counter number input
    const tileCounterNumberInput = document.createElement('input')
    tileCounterNumberInput.type = "number"
    tileCounterNumberInput.className = "input tile-counter-number-input"
    tileCounterNumberInput.value = tileCount
    tileCounterNumberInput.min = `${MIN_TILE_COUNT}`
    tileCounterNumberInput.max = `${MAX_TILE_COUNT}`

    // Create tiles per row selection
    const tilesPerRowSelection = document.createElement('select')
    tilesPerRowSelection.className = "tiles-per-row-selection"
    // Create tiles per row options for 2-6
    for (let i = 2; i < 7; i++) {
        const tilesPerRowOption = document.createElement('option')
        tilesPerRowOption.text = i
        tilesPerRowOption.value = i
        tilesPerRowSelection.add(tilesPerRowOption)

        // Select current tiles per row for this grid
        if (i === parseInt(tilesPerRow)) {
            tilesPerRowOption.selected = true
        }
    }

    // Reload grid with changed tiles per row after showing transition animation
    tilesPerRowSelection.addEventListener('change', () => {
        const selectedTilesPerRow = tilesPerRowSelection.options[tilesPerRowSelection.selectedIndex].value
        // Set the selected value to the new tiles per row
        tilesPerRow = selectedTilesPerRow
        // Calculate tile box size based on current width
        const tileBoxSize = setTileSize()
        // Select all tile-boxes and re-set their height/width to show the transition before the grid is reloaded
        document.querySelectorAll('div.tile-box').forEach(tileBox => {
            tileBox.classList.add("tile-box-resized")
            tileBox.style.height = `${tileBoxSize}px`;
            tileBox.style.width = `${tileBoxSize}px`;
        })
        // Update grid's tiles via fetch after the size transition is complete
        setTimeout(() => {
            fetchChangeTilesPerRow(selectedTilesPerRow, gridID).then(updatedGrid => {
                createGrid(updatedGrid, gridMode)
            });
        }, 200)
    })

    // Create variables to track if grid contains any view (non-empty) tiles and tiles with images
    let hasViewTile = false
    let hasImageTile = false

    if (gridMode != "memory") {
        // For each tile in tile order array, create a tile with audio/text icons and append to grid box
        tileOrder.forEach((tileNumber) => {
            const newTileBox = tileBox.cloneNode()
            const newDeleteTileButton = deleteTileButton.cloneNode()
            const newTileIconBox = tileIconBox.cloneNode()
            const newTileAudioIcon = tileAudioIcon.cloneNode()
            const newTileTextIcon = tileTextIcon.cloneNode()
            newTileBox.id = tileNumber
            newDeleteTileButton.id = tileNumber

            // Filter tiles array to get tile of this tile number
            const thisTile = getTileFromTileNumber(tiles, tileNumber)

            // Add background to new tile box element based on filtered tile object
            newTileBox.style.backgroundImage=`url(${thisTile.imageURL})`

            // Add a background color in case image doesn't load
            newTileBox.style.backgroundColor = "rgb(49, 49, 49)"

            // Don't append delete button if there is only 1 tile
            if (tileCount > 1) {
                newTileBox.append(newDeleteTileButton)
            }

            // Display audio and text icons if tiles has audio or text respectively
            if (thisTile.audioURL) {
                display("inline-block", newTileAudioIcon)
                newTileIconBox.style.border = "1px solid white"
            }
            if (thisTile.tileText) {
                display("inline-block", newTileTextIcon)
                newTileIconBox.style.border = "1px solid white"
            }
            newTileIconBox.append(newTileAudioIcon, newTileTextIcon)
            newTileBox.append(newTileIconBox)

            // Append all tiles if mode is edit, otherwise only append non-empty tiles
            if (gridMode === "edit") {
                gridBox.append(newTileBox)
            } else {
                if (!thisTile.imageURL.includes(DEFAULT_TILE_IMG_NAME) || thisTile.audioURL || thisTile.tileText) {
                    // Don't append tile if quiz mode and there is no image...
                    if (gridMode !== "quiz" || (gridMode === "quiz" && !thisTile.imageURL.includes(DEFAULT_TILE_IMG_NAME))) {
                        gridBox.append(newTileBox)
                        hasViewTile = true
                    }
                    if (!thisTile.imageURL.includes(DEFAULT_TILE_IMG_NAME)) {
                        hasImageTile = true
                    }
                }
            }
        })
    } else {
        // Create tiles for memory game and append to grid box
        tiles.forEach((thisTile) => {
            // Only create tile if tile has an image
            if (!thisTile.imageURL.includes(DEFAULT_TILE_IMG_NAME)) {
                const newTileBox = tileBox.cloneNode()
                const newTileBoxFront = tileBoxFront.cloneNode()
                const newTileBoxBack = tileBoxBack.cloneNode()
                newTileBox.id = thisTile.tileNumber
                newTileBoxFront.id = `front${thisTile.tileNumber}`
                newTileBoxBack.id = `back${thisTile.tileNumber}`
                newTileBoxFront.style.backgroundImage = `url(${thisTile.imageURL})`
                newTileBoxBack.style.backgroundImage = `url(${DEFAULT_TILE_IMG_URL})`
                newTileBox.append(newTileBoxFront, newTileBoxBack)
                gridBox.append(newTileBox)
            }
        })
        // Append memory game win message
        gridBox.append(memoryGameWinMessage)
    }

    // Display a message if there are only non-empty tiles in view mode
    if (gridMode === "view" && !hasViewTile) {
        const messageBox = createHTML('div', 'message-box')
        const noViewTilesMessage = createHTML("span", null, null, "This grid doesn't yet have any tiles with viewable content. ")
        const createOneMessage = createHTML("span", "click", null, "Go create one!")
        messageBox.append(noViewTilesMessage, createOneMessage)
        gridBox.append(messageBox)
        createOneMessage.addEventListener('click', () => {
            gridMode = "edit"
            fetchGetGrid(gridID).then(updatedGrid => {
                // Set history with pustState method
                history.pushState({section: "create-grid", grid: updatedGrid, gridMode: gridMode}, null, `${gridMode}-grid`)
                createGrid(updatedGrid, "edit")
            })
        })
    }

    // Show memory game and quiz buttons if there are any tiles with images
    if (gridMode === "view" && hasImageTile) {

        // Use Some method to check if at least one tile has audio or text
        let hasOneAudio = hasAudio(tiles)
        let hasOneText = hasText(tiles)

        // Display quiz button only if one of the tiles has audio or text
        if (hasOneAudio || hasOneText) {
            display("inline", quizButton)
        }

        // Display memory game button
        display("inline", memoryGameButton)

        // Start memory game when button is clicked
        memoryGameButton.addEventListener('click', () => {
            gridMode = "memory"
            fetchGetMemoryGrid(gridID).then(updatedGrid => {
                // Set history with pustState method
                history.pushState({section: "create-grid", grid: updatedGrid, gridMode: gridMode}, null, "memory")
                createGrid(updatedGrid, gridMode)
            })
        })
        // Start quiz when button is clicked
        quizButton.addEventListener('click', () => {
            gridMode = "quiz"
            fetchGetGrid(gridID).then(updatedGrid => {
                // Set history with pustState method
                history.pushState({section: "create-grid", grid: updatedGrid, gridMode: gridMode}, null, "quiz")
                createGrid(updatedGrid, gridMode)
            })
        })
    }

    // Append elements to DOM
    headingButtonBox.append(restartButton, memoryGameButton, quizButton, gridModeButton)
    headingBox.append(gridTitleHeading, headingButtonBox)
    albumSelectionBox.append(albumTitleText, changeAlbumSelection)
    tileCounterBox.append(tileCounterText, tileCounterNumber)
    tilesPerRowBox.append(tilesPerRowText, tilesPerRowSelection)
    gridControlBox.append(albumSelectionBox, tilesPerRowBox, tileCounterBox)
    gridButtonBoxLeft.append(reverseSortButton, mixSortButton, defaultSortButton)
    gridButtonBoxRight.append(resetGridButton, saveAndNewButton)
    gridButtonBox.append(gridButtonBoxLeft, gridButtonBoxRight)
    gridQuizBox.append(gridQuizQuestionNumber, gridQuizPreference)

    if (message) {
        const messageDiv = createHTML('div', 'alert alert-danger', 'error-message', message)
        gridButtonBox.append(messageDiv)
    }

    // On window resize, modify size of tiles on the DOM
    // Learned from: https://developer.mozilla.org/en-US/docs/Web/API/Window/resize_event
    window.addEventListener('resize', () => {
        // Calculate tile box size based on resized width
        const tileBoxSize = setTileSize()
        // Select all tile-boxes and re-set their size
        document.querySelectorAll('div.tile-box, div.tile-box-matched').forEach(tileBox => {
            tileBox.style.height = `${tileBoxSize}px`;
            tileBox.style.width = `${tileBoxSize}px`;
        })
    })

    document.querySelector('#create-grid-view').append(headingBox, memoryGameTimer, gridControlBox, gridButtonBox, gridQuizBox, gridQuizQuestionBox, gridBox)

    // Edit tile counter when number is clicked
    tileCounterNumber.addEventListener('click', (e) => {
        tileCounterNumber.replaceWith(tileCounterNumberInput)
        tileCounterNumberInput.focus();

        e.stopPropagation()

            // Detect all mousedowns on the document
            // Learned from: https://www.youtube.com/watch?v=wX0pb6CBS-c&ab_channel=TechStacker
            let saveOnMousedown = function(e) {
                // If mousedown is within the album title input element
                if (e.target.closest('.tile-counter-number-input')) {
                    console.log('mousedown inside input, do nothing')
                    return
                }
                // If mousedown is outside the input, remove the event listener and update the grid via fetch
                console.log('mousedown outside input')
                addRemoveAnimateTiles()
            }

            // Listen for mousedown in the document
            document.addEventListener('mousedown', saveOnMousedown, true)

        // Do the same as the buttons for Enter/Escape
        tileCounterNumberInput.addEventListener('keydown', (e) => {
            if (e.key === "Enter") {
                addRemoveAnimateTiles()
            } else if (e.key === "Escape") {
                // Remove event listener
                document.removeEventListener('mousedown', saveOnMousedown, true)
                tileCounterNumberInput.value = tileCounterNumber.innerText
                tileCounterNumberInput.replaceWith(tileCounterNumber)
            }
        })

        function addRemoveAnimateTiles() {
            // Remove event listener
            // Learned from: https://stackoverflow.com/questions/10444077/javascript-removeeventlistener-not-working
            document.removeEventListener('mousedown', saveOnMousedown, true)

            // Don't save if value doesn't change
            if (tileCounterNumberInput.value !== tileCounterNumber.innerText) {
                // If tiles are being removed...
                if (tileCounterNumberInput.value < tileCount) {
                    // Determine how many tiles are being removed
                    const tileCountToRemove = tileCount - tileCounterNumberInput.value
                    // Add tiles to be removed to an array
                    const tileBoxes = Array.from(document.querySelectorAll('.tile-box'))
                    const tileBoxesToRemove = tileBoxes.slice(-tileCountToRemove)
                    // Highlight tiles to be removed and ask for confirmation
                    tileBoxesToRemove.forEach(tileBox => {
                        tileBox.style.boxShadow = "0px 0px 0px 2px yellow"
                    })
                    // Request animation frames so the highlight shows before the confirmation
                    // Learned here: https://stackoverflow.com/questions/73654377/why-is-confirm-happening-first-when-the-javascript-before-it-changes-the-eleme
                    // https://macarthur.me/posts/when-dom-updates-appear-to-be-asynchronous
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            let confirmation;
                            if (tileBoxesToRemove.length === 1){
                                confirmation = confirm("Are you sure you want to delete this tile and its content?");
                            } else {
                                confirmation = confirm("Are you sure you want to delete these tiles and their content?");
                            }
                            if (!confirmation) {
                                // Reset tile counter input so the grid will just be reloaded without changes
                                tileCounterNumberInput.value = tileCount
                                console.log('tileCounterNumberInput.value (first)', tileCounterNumberInput.value)
                            } else {
                                // For each of the tiles confirmed for removal, show the fade-out animation
                                tileBoxesToRemove.forEach(tileBox => {
                                tileBox.classList.add("fade-out")
                                })
                            }
                        })
                    })
                }
                else {
                    // Determine how many tiles are being added
                    const tileCountToAdd = tileCounterNumberInput.value - tileCount
                    let tileBoxesToAdd = []
                    // Create this many stand-in tile boxes to fade-in before creating a new grid
                    for (let i = 0; i < tileCountToAdd; i++) {
                        const newTileBox = tileBox.cloneNode()
                        const newDeleteTileButton = deleteTileButton.cloneNode()
                        newTileBox.style.backgroundImage = `url(${DEFAULT_TILE_IMG_URL})`
                        newTileBox.append(newDeleteTileButton)
                        gridBox.append(newTileBox)
                        // Add this tile box to the array
                        tileBoxesToAdd.push(newTileBox)
                    }
                    // For each of those tiles, show the fade-in animation
                    tileBoxesToAdd.forEach(tileBox => {
                        tileBox.classList.add("fade-in")
                    })
                }
                // Update grid's tiles via fetch after the fade-in/out animation
                setTimeout(() => {
                    fetchAddOrRemoveTiles(gridID, tileCount, tileCounterNumberInput.value).then(updatedGrid => {
                        createGrid(updatedGrid, gridMode)
                    });
                }, 200)
            }

            // Replace tile count with input value
            tileCounterNumber.innerText = tileCounterNumberInput.value
            tileCounterNumberInput.replaceWith(tileCounterNumber)
        }
    })

    // Reverse tile order when button is clicked
    reverseSortButton.addEventListener('click', () => {
        fetchSortTiles(gridID, "reverse").then(updatedGrid => {
            createGrid(updatedGrid, gridMode)
        });
    })

    // Mix tile order when button is clicked
    mixSortButton.addEventListener('click', () => {
        fetchSortTiles(gridID, "mix").then(updatedGrid => {
            createGrid(updatedGrid, gridMode)
        });
    })

    // Default tile order when button is clicked
    defaultSortButton.addEventListener('click', () => {
        fetchSortTiles(gridID, "default").then(updatedGrid => {
            createGrid(updatedGrid, gridMode)
        });
    })

    // Create a new grid when clicked
    saveAndNewButton.addEventListener('click', () => {
        fetchNewGrid().then(newGrid => {
            createGrid(newGrid, gridMode)
        })
    })

    // Reset grid to a new blank grid when clicked
    resetGridButton.addEventListener('click', () => {
        const confirmation = confirm("Are you sure you want to reset this grid? All its content will be deleted.");
            if (confirmation) {
                fetchResetGrid(gridID).then(updatedGrid => {
                    createGrid(updatedGrid, gridMode)
                })
            }
    })

    // ************** MEMORY GAME **************

    if (gridMode === "memory") {
        // Start timer
        let [minutes, seconds] = [0, 0]
        let int = null
        int = setInterval(startTimer, 1000)

        function startTimer() {
            seconds += 1
            if (seconds === 60) {
                seconds = 0
                minutes++
            }
            if (minutes === 60) {
                minutes = 0
            }
            let s = seconds < 10 ? "0" + seconds : seconds
            memoryGameTimer.innerText = `${minutes}:${s}`
        }

        // Create sound objects
        const clickSound = [new Audio(MATCH_CLICK1_URL), new Audio(MATCH_CLICK2_URL)]
        const matchSound = new Audio(MATCH_MATCH_URL)
        const noMatchSound = new Audio(MATCH_NO_MATCH_URL)
        const winSound = new Audio(MATCH_WIN_URL)

        // Create flag variables to keep track of selections and win state
        let selectionCounter = 0
        let selection1 = 0
        let selection2 = 0
        let win = false

        // Create an faded card to take the place of matched cards
        const tileBoxMatched = createHTML('div', 'tile-box-matched')
        const tileBoxSize = setTileSize()
        tileBoxMatched.setAttribute("style", `height: ${tileBoxSize}px; width: ${tileBoxSize}px;`);

        // Select each div and open up tile view
        document.querySelectorAll('div.tile-box').forEach(tileBox => {
            // Filter tiles for tile of a specific tile number
            const tile = getTileFromTileNumber(tiles, tileBox.id)

            // Do the following when a tile is clicked
            tileBox.onclick = () => {
                console.log(tileBox.id)
                // Flip over card on click
                tileBox.classList.add("flipped")

                // First of two cards selected...
                if (selectionCounter === 0) {
                    //Disable any more clicking of this tile until another is chosen
                    tileBox.style.pointerEvents = "none"
                    clickSound[0].play()
                    selectionCounter++
                    selection1 = tileBox.id
                // Second of two cards selected
                } else if (selectionCounter === 1) {
                    //Disable any more clicking of this tile until both are flipped back over
                    tileBox.style.pointerEvents = "none"
                    clickSound[1].play()
                    selectionCounter++
                    selection2 = tileBox.id
                }
                // Once two cards have been flipped, check for a match
                if (selectionCounter === 2) {
                    selectionCounter = 0
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
                        document.querySelectorAll('.tile-box').forEach(tileBox => {
                            tileBox.style.pointerEvents = "none"
                        })
                        // Wait, then disappear tiles
                        setTimeout(() => {
                            // Select matching tiles and make them disappear
                            document.querySelectorAll('.tile-box').forEach(tileBox => {
                                if (tileBox.id === tile.tileNumber.toString()) {
                                    const newTileBoxMatched = tileBoxMatched.cloneNode()
                                    // Set matched tile box background images
                                    newTileBoxMatched.style.backgroundImage =  `url(${tile.imageURL})`
                                    tileBox.replaceWith(newTileBoxMatched)
                                }
                            })
                            if(!win) {
                                // Only play the match sound if the game hasn't been won yet
                                matchSound.play()
                            }
                            // Turn clicks of tile boxes back on
                            document.querySelectorAll('.tile-box').forEach(tileBox => {
                                tileBox.style.pointerEvents = "auto"
                            })
                            if (win) {
                                console.log("winner!")
                                // Remove all the hidden tiles to make room for win message
                                document.querySelectorAll('.tile-box-matched').forEach(tileBox => {
                                    tileBox.remove()
                                })
                                winSound.play()
                                // Show win message and play again button
                                const playAgainButton = createHTML('button', 'no-border play-again-button badge rounded-pill text-bg-info', null, "PLAY AGAIN?")
                                display("flex", memoryGameWinMessage)
                                // Restart memory game when button is clicked
                                playAgainButton.addEventListener('click', () => {
                                    gridMode = "memory"
                                    fetchGetMemoryGrid(gridID).then(updatedGrid => {
                                        // Set history with pustState method
                                        history.replaceState({section: "create-grid", grid: updatedGrid, gridMode: gridMode}, null, "memory")
                                        createGrid(updatedGrid, gridMode)
                                    })
                                })
                                memoryGameWinMessage.append(playAgainButton)
                            }
                        }, 1000)
                    } else {
                        console.log("No match!")
                        // Disable all clicks of the tile boxes until tiles are turned back "over" to default
                        document.querySelectorAll('.tile-box').forEach(tileBox => {
                            tileBox.style.pointerEvents = "none"
                        })
                        // Wait, then flip cards back over
                        setTimeout(() => {
                            // Turn back over all flipped cards
                            document.querySelectorAll('.tile-box').forEach(tileBox => {
                                if (tileBox.classList.contains("flipped")) {
                                    tileBox.classList.remove("flipped")
                                }
                            })
                            noMatchSound.play()
                            // Turn clicks back on for each tile box
                            document.querySelectorAll('.tile-box').forEach(tileBox => {
                                tileBox.style.pointerEvents = "auto"
                            })
                        }, 1500)
                    }
                }
            }
        })

    // ************** QUIZ MODE **************

    } else if (gridMode === "quiz") {
        // Use Some method to check if at least one tile has audio or text
        let hasOneAudio = hasAudio(tiles)
        let hasOneText = hasText(tiles)

        // Create quiz preference selections drop-down menu
        const quizPreferenceSelection = document.createElement('select')
        quizPreferenceSelection.className = "quiz-preference-selection"
        const quizPreferenceOptionAudioOrText = document.createElement('option')
        quizPreferenceOptionAudioOrText.text = "audio or text"
        quizPreferenceOptionAudioOrText.value = "audio or text"
        const quizPreferenceOptionAudioOnly = document.createElement('option')
        quizPreferenceOptionAudioOnly.text = "audio only"
        quizPreferenceOptionAudioOnly.value = "audio only"
        const quizPreferenceOptionTextOnly = document.createElement('option')
        quizPreferenceOptionTextOnly.text = "text only"
        quizPreferenceOptionTextOnly.value = "text only"

        // Only add audio or text selections if the grid has tiles with audio or text
        if (hasOneAudio && hasOneText){
            quizPreferenceSelection.add(quizPreferenceOptionAudioOrText)
            quizPreferenceSelection.add(quizPreferenceOptionAudioOnly)
            quizPreferenceSelection.add(quizPreferenceOptionTextOnly)
        } else if (hasOneAudio && !hasOneText) {
            quizPreferenceSelection.add(quizPreferenceOptionAudioOrText)
            quizPreferenceSelection.add(quizPreferenceOptionAudioOnly)
        } else if (!hasOneAudio && hasOneText) {
            quizPreferenceSelection.add(quizPreferenceOptionAudioOrText)
            quizPreferenceSelection.add(quizPreferenceOptionTextOnly)
        }

        // Select current preference
        if (quizPreference == quizPreferenceOptionAudioOnly.value) {
            quizPreferenceOptionAudioOnly.selected = true
        } else if (quizPreference == quizPreferenceOptionTextOnly.value) {
            quizPreferenceOptionTextOnly.selected = true
        }

        // Change grid quiz preference when option is changed
        quizPreferenceSelection.addEventListener('change', () => {
            const quizPreference = quizPreferenceSelection.options[quizPreferenceSelection.selectedIndex].value
            fetchChangeQuizPreference(quizPreference, gridID).then(updatedGrid => {
                // Set history with pustState method
                history.replaceState({section: "create-grid", grid: updatedGrid, gridMode: gridMode}, null, "quiz")
                createGrid(updatedGrid, gridMode)
            })
        })

        // Filter tiles object according to quiz preference in order to create array of questions
        const gridQuizPrompt = createHTML('span', 'grid-quiz-prompt', null, 'Select the correct tile for:')
        const gridQuizReplayButton = createHTML('img', 'pointer grid-quiz-replay-button')
        gridQuizReplayButton.src = PLAY_BUTTON_URL
        const gridQuizText = createHTML('span', 'grid-quiz-text')
        gridQuizQuestionBox.append(gridQuizPrompt, gridQuizReplayButton, gridQuizText)

        const quizTiles = tiles.filter((tile) => {
            if (!tile.imageURL.includes(DEFAULT_TILE_IMG_NAME)) {
                if (quizPreference === "audio or text") {
                    return  tile.audioURL || tile.tileText
                } else if (quizPreference === "audio only") {
                    return  tile.audioURL
                } else if (quizPreference === "text only") {
                    return  tile.tileText
                }
            }
        })
        console.log('quizTiles: ', quizTiles)
        gridQuizPreference.append(quizPreferenceSelection)

        // Shuffle quiz tile array
        // Learned from: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
        let shuffledQuizTiles = quizTiles
            .map(value => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value)

        console.log('shuffledQuizTiles: ', shuffledQuizTiles)

        const correct = new Audio(CORRECT_URL)
        const incorrect = new Audio(INCORRECT_URL)
        const quizScore = new Audio(QUIZ_SCORE_URL)
        const questionSound = new Audio()
        let questionNumber = 1
        let score = 0

        // Begin grid quiz first question
        gridQuiz(questionNumber, score)

        // Select each tileBox and listen for click
        document.querySelectorAll('div.tile-box').forEach(tileBox => {
            tileBox.addEventListener('click', () => {
                // Disable clicking while sound is playing and before next question loads
                document.querySelectorAll('div.tile-box').forEach(tileBox => {
                        tileBox.style.pointerEvents = "none"
                })

                if (parseInt(tileBox.id) === shuffledQuizTiles[questionNumber - 1].tileNumber) {
                    console.log('Correct!')
                    correct.play()
                    // Turn tile border green
                    tileBox.style.boxShadow = "0 0 0 3px greenyellow"
                    score++
                } else {
                    console.log('Incorrect!')
                    // Show incorrect border animation
                    tileBox.classList.add("wrong-border-fade-out")
                    incorrect.play()
                }
                questionNumber++
                // Begin the next question after a timeout
                setTimeout(() => {
                    // Re-enable clicking
                    document.querySelectorAll('div.tile-box').forEach(tileBox => {
                        tileBox.style.pointerEvents = "auto"
                    })
                    // Remove animation so it can be added again
                    tileBox.classList.remove("wrong-border-fade-out")
                    // Load next question or score screen
                    gridQuiz(questionNumber, score)
                }, 1000);
            })
        })

        function gridQuiz(questionNumber, score) {
            if (questionNumber <= shuffledQuizTiles.length) {
                questionSound.setAttribute('src', shuffledQuizTiles[questionNumber - 1].audioURL)
                let audio = ""
                let text = ""
                // Show audio and text in question according to quiz preference
                if (quizPreference === "audio or text") {
                    if (shuffledQuizTiles[questionNumber - 1].audioURL) {
                        gridQuizReplayButton.style.display = "block"
                        questionSound.play()
                    } else {
                        gridQuizReplayButton.style.display = "none"
                    }
                    if (shuffledQuizTiles[questionNumber - 1].tileText) {
                        gridQuizText.style.display = "block"
                        text = shuffledQuizTiles[questionNumber - 1].tileText
                    } else {
                        gridQuizText.style.display = "none"
                    }
                } else if (quizPreference === "audio only") {
                    if (shuffledQuizTiles[questionNumber - 1].audioURL) {
                        gridQuizReplayButton.style.display = "block"
                        gridQuizText.style.display = "none"
                        audio = shuffledQuizTiles[questionNumber - 1].audioURL
                        questionSound.play()
                    }
                } else if (quizPreference === "text only") {
                    if (shuffledQuizTiles[questionNumber - 1].tileText) {
                        gridQuizReplayButton.style.display = "none"
                        gridQuizText.style.display = "block"
                        text = shuffledQuizTiles[questionNumber - 1].tileText
                    }
                }
                gridQuizQuestionNumber.innerText = `Question ${questionNumber} of ${shuffledQuizTiles.length}`

                // Replay question sound when button is clicked
                gridQuizReplayButton.addEventListener('click', () => {
                    questionSound.play()
                })
                gridQuizText.innerText = `"${text}"`
            } else {
                console.log('Quiz end')
                // Remove all tiles to make room for score message
                document.querySelectorAll('.tile-box').forEach(tileBox => {
                    tileBox.remove()
                })
                // Hide quiz elements
                display("none", gridQuizBox, gridQuizQuestionBox)
                // Show score message and try again button
                const tryAgainButton = createHTML('button', 'no-border play-again-button badge rounded-pill text-bg-info', null, "TRY AGAIN?")
                display("flex", quizScoreMessage)
                quizScoreMessage.innerText = `You got ${score} out of ${shuffledQuizTiles.length} correct (${(Math.round(((score/shuffledQuizTiles.length) * 100) * 10) / 10)}%)`
                // Restart quiz when button is clicked
                tryAgainButton.addEventListener('click', () => {
                    fetchGetGrid(gridID).then(updatedGrid => {
                        // Set history with pustState method
                        history.replaceState({section: "create-grid", grid: updatedGrid, gridMode: gridMode}, null, "quiz")
                        createGrid(updatedGrid, gridMode)
                    })
                })
                const addMoreMessage = createHTML('span', 'add-more-message alert alert-warning', null, "Add more tiles with text or audio to your grid to get more questions.")
                if (shuffledQuizTiles.length < tileCount) {
                    console.log('this')
                    quizScoreMessage.append(addMoreMessage)
                }
                quizScore.play()
                quizScoreMessage.append(tryAgainButton)
                gridBox.append(quizScoreMessage)
            }
        }
    } else {
        // Section determines which section shows on the tile: image, sound, or text (default is image)
        let section = "default"

        // Select each div and open up tile view
        document.querySelectorAll('div.tile-box').forEach(tileBox => {
            tileBox.onclick = () => {
                fetchGetGrid(gridID).then(updatedGrid => {
                    // Set history with pustState method
                    history.pushState({section: "create-tile", grid: updatedGrid, tiles: tiles, gridID: gridID, gridMode: gridMode, tileCount: tileCount, tileBoxID: tileBox.id, tileSection: section}, null, `${gridMode}-tile`)
                })
                console.log(tileBox.id)
                createTile(tiles, gridID, gridMode, tileCount, tileBox.id, section)
            }
        })
    }

    // Select each delete tile button
    document.querySelectorAll('.trash-icon').forEach(button => {
        button.onclick = (e) => {
            console.log(`deleting ${button.id}`)
            document.querySelectorAll('.tile-box').forEach(tileBox => {
                if (button.id === tileBox.id) {
                    // Highlight tile to be removed
                    tileBox.style.boxShadow = "0px 0px 0px 2px yellow"
                    // Request animation frames so the highlight shows before the confirmation
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            // Ask confirmation to remove
                            const confirmation = confirm("Are you sure you want to delete this tile and its content?");
                            if (!confirmation) {
                                // Remove highlight and do nothing else if not confirmed
                                tileBox.style.boxShadow = "none"
                            } else {
                                // Fade out tile box
                                tileBox.classList.add("fade")
                                // Wait until tile box is done fading, then shrink
                                setTimeout(() => {
                                    tileBox.style.opacity = "0"
                                    tileBox.classList.remove("fade-out")
                                    tileBox.classList.add("shrink")
                                }, 200)
                                // Wait until animation is done, then fetch/reload grid
                                setTimeout(() => {
                                    fetchDeleteTile(gridID, button.id).then(updatedGrid => {
                                        createGrid(updatedGrid, gridMode)
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

// ************** CREATE TILE **************

function createTile(tiles, gridID, gridMode, tileCount, tileNumber, section) {
    const imageCropBox = createHTML('div', '', 'image-crop-box')

    // Create audio player variable so it can be cleared out each time
    let player;

    // Filter tiles array to get tile of this tile number
    const thisTile = getTileFromTileNumber(tiles, tileNumber)

    // Fetch tile so prev/next buttons will always show latest tile
    fetchGetTile(thisTile.tileID).then(updatedThisTile => {
        // Create tile control elements
        const overlay = createHTML('div', 'overlay')
        const bigEditTile = createHTML('div', 'big-edit-tile')
        const tileNavBox = createHTML('div', 'tile-nav-box')
        const tileNavImage = createHTML('div', 'click tile-nav-item', null, 'image')
        const tileNavSound = createHTML('div', 'click tile-nav-item', null, 'sound')
        const tileNavText = createHTML('div', 'click tile-nav-item', null, 'text')
        const backToGridButton = createHTML('button', 'hidden no-border back-to-grid-button badge rounded-pill text-bg-info', null, null, '&#8592; back to grid')
        const tileControlBox = createHTML('div', 'tile-control-box')
        const tileControlTop = createHTML('div', 'tile-control-top')
        const tileControlMiddle = createHTML('div', 'tile-control-middle')
        const tileControlBottom = createHTML('div', 'tile-control-bottom')
        const addImageButton = createHTML('span', 'circle-button add-button button-center', null, '+')
        const removeImageButton = createHTML('span', 'circle-button remove-button', null, 'x')
        const adjustImageButton = createHTML('button', 'hidden no-border edit-button badge rounded-pill text-bg-warning', null, 'adjust image')
        const tileImageError = createHTML('div', 'hidden alert alert-danger tile-error', null, '')
        const prevTileButton = createHTML('span', 'circle-button prev-button', null, '<')
        const nextTileButton = createHTML('span', 'circle-button next-button', null, '>')
        const cropAndSaveButton = createHTML('span', 'circle-button save-image-crop-button', null, null, '&#10003;')
        const cancelCropButton = createHTML('span', 'circle-button cancel-image-crop-button', null, 'x')
        const addTileTextButton = createHTML('span', 'circle-button add-button button-center', null, '+')
        const removeTileTextButton = createHTML('span', 'circle-button remove-button button-center', null, 'x')
        const saveTileTextButton = createHTML('span', 'circle-button save-tile-button', null, null, '&#10003;')
        const cancelTileTextButton = createHTML('span', 'circle-button cancel-tile-button', null, 'x')
        const tileTextError = createHTML('div', 'hidden alert alert-danger tile-error', null, '')
        const tileTextCharsRemaining = createHTML('div', 'hidden tile-text-chars-remaining', null, `${MAX_TILE_TEXT_CHARS} characters remainining.`)
        const tileTextBox = createHTML('div', 'hidden tile-text-box')
        const tileText = createHTML('span', 'hidden click tile-text')
        const playerContainer = createHTML('div', 'hidden player-container')
        const recordButton = createHTML('div', 'circle-button record-button')
        const stopButtonContainer = createHTML('div', 'stop-button-container')
        const stopButtonTimer = createHTML('span', 'stop-button-timer', null, '0:00')
        const stopButtonSquare = createHTML('span', 'stop-button-square', null, null, '&#9632;')
        const addTileAudioButton = createHTML('span', 'circle-button add-button button-center', null, '+')
        const removeTileAudioButton = createHTML('span', 'circle-button remove-button', null, 'x')
        const saveTileAudioButton = createHTML('span', 'circle-button save-tile-button', null, null, '&#10003;')
        const cancelTileAudioButton = createHTML('span', 'circle-button cancel-tile-button', null, 'x')
        const audioFilename = createHTML('span', 'hidden audio-filename')
        const tileAudioError = createHTML('div', 'hidden alert alert-danger tile-error')

        // Create object out of nav items
        const tileNavItems = {
            image: tileNavImage,
            sound: tileNavSound,
            text: tileNavText
        }

        // Create input for image upload
        const addImageInput = document.createElement('input')
        addImageInput.setAttribute('type', 'file');
        addImageInput.setAttribute('accept', '.jpg, .jpeg, .png, .gif, .svg');

        // Create input for tile text
        const tileTextInput = document.createElement('input')
        tileTextInput.setAttribute('type', 'text');
        tileTextInput.className = "hidden tile-text-input"

        // Create input for audio upload
        const addAudioInput = document.createElement('input')
        addAudioInput.setAttribute('type', 'file');
        addAudioInput.setAttribute('accept', '.wav, .mp3');

        const showTileElements = (section) => {
            fetchGetTile(updatedThisTile.tileID).then(updatedTile => {
                setBackground(updatedTile)
                // Hide all visible image-only elements:
                display("none", addImageButton, removeImageButton, adjustImageButton, cropAndSaveButton, cancelCropButton, imageCropBox, tileImageError)
                // Hide all visible sound-only elements:
                display("none", playerContainer, recordButton, addTileAudioButton, removeTileAudioButton, saveTileAudioButton, cancelTileAudioButton, audioFilename, tileAudioError)
                // Hide all visible text-only elements:
                display("none", tileTextInput, addTileTextButton, removeTileTextButton, saveTileTextButton, cancelTileTextButton, tileTextError, tileTextCharsRemaining, tileTextBox, tileText)

                if (gridMode === "edit") {
                    // Show common elements
                    display("flex", prevTileButton, nextTileButton, tileNavBox)
                    display("inline", backToGridButton)

                    // Make section-specific elements visible
                    if (section === "image" || section === "default") {
                        // Show adjust and remove image buttons if there is an image
                        if (!updatedTile.imageURL.includes(DEFAULT_TILE_IMG_NAME)) {
                            display("inline", adjustImageButton)
                            addImageButton.className = 'circle-button add-button'
                            display("flex", addImageButton, removeImageButton)
                        } else {
                            addImageButton.className = 'circle-button add-button button-center'
                            display("flex", addImageButton)
                        }
                        // Resume image cropping if section was switched when cropping was in progress
                        if (imageCropBox.innerHTML != "") {
                            // Change background temprorarily to default SVG for aesthetics
                            bigEditTile.style.backgroundImage = `url(${DEFAULT_TILE_IMG_URL})`
                            display("inline", imageCropBox)
                            display("none", addImageButton, removeImageButton, adjustImageButton)
                            display("flex", cropAndSaveButton, cancelCropButton)
                        }
                    } else if (section === "sound") {
                        display("flex", recordButton)
                        if (updatedTile.audioURL != "") {
                            addTileAudioButton.className = 'circle-button add-button'
                            display("flex", playerContainer, addTileAudioButton, removeTileAudioButton)
                        } else {
                            addTileAudioButton.className = "circle-button add-button button-center"
                            display("flex", addTileAudioButton)
                        }
                    } else if (section === "text") {
                        if(updatedTile.tileText) {
                            tileText.innerText = updatedTile.tileText
                            display("none", addTileTextButton)
                            display("inline", tileText)
                            display("flex", removeTileTextButton, tileTextBox)
                        } else {
                            display("flex", addTileTextButton)
                        }
                    }
                } else if (gridMode === "view" || gridMode === "memory") {
                    // Show tile text if there is any
                    if (updatedTile.tileText && updatedTile.tileText != "") {
                        // Create clones of text and text box to avoid unwanted click event
                        const newTileTextBox = tileTextBox.cloneNode()
                        const newTileText = tileText.cloneNode()
                        // Remove click class so text isn't blue
                        newTileText.classList.remove("click")
                        newTileText.innerText = updatedTile.tileText
                        newTileTextBox.className = "view-tile-text-box"
                        display("inline", newTileText)
                        display("flex", newTileTextBox)
                        newTileTextBox.append(newTileText)
                        bigEditTile.append(newTileTextBox)
                    }

                    // Play tile audio file if there is one
                    if (updatedTile.audioURL) {
                        audio = new Audio(updatedTile.audioURL)
                        audio.controls = false
                        audio.autoplay = true
                    }

                    // Reload create grid view when button is clicked
                    bigEditTile.classList.add("pointer")
                    bigEditTile.addEventListener('click', () => {
                        fetchGetGrid(gridID).then(updatedGrid => {
                            // Set history with pustState method
                            history.pushState({section: "create-grid", grid: updatedGrid, gridMode: gridMode}, null, `${gridMode}-grid`)
                            createGrid(updatedGrid, gridMode)
                        })
                    })
                }
            })
        }

        const makeActive = (section) => {
            // Default section is image
            section === "default" ? section = "image" : section = section
            // Set each nav link to inactive
            // Learned from: https://masteringjs.io/tutorials/fundamentals/foreach-object
            Object.keys(tileNavItems).forEach(key => {
                tileNavItems[key].className = "click tile-nav-item"
            })
            // Make nav link for current section active
            tileNavItems[section].className = "click tile-nav-item tile-nav-item-active"
        }

        // Set tile background
        const setBackground = (updatedTile) => {
            bigEditTile.style.backgroundImage = `url(${updatedTile.imageURL})`
        }

        // Hide/show section elements, make nav section active, and set the background
        showTileElements(section)
        makeActive(section)
        setBackground(updatedThisTile)

        // ************** TILE NAV SECTIONS **************

        // Hide/show section-specific elements, make nav links active, and set section for prev/next navigation
        tileNavImage.addEventListener('click', () => {
            showTileElements('image')
            makeActive('image')
            section = 'image'
            fetchGetGrid(gridID).then(updatedGrid => {
                // Replace history state with new section with pustState method
                history.replaceState({section: "create-tile", grid: updatedGrid, tiles: tiles, gridID: gridID, gridMode: gridMode, tileCount: tileCount, tileBoxID: tileNumber, tileSection: section}, null, `${gridMode}-tile`)
            })
        })
        tileNavSound.addEventListener('click', () => {
            showTileElements('sound')
            makeActive('sound')
            section = 'sound'
            fetchGetGrid(gridID).then(updatedGrid => {
                // Replace history state with new section with pustState method
                history.replaceState({section: "create-tile", grid: updatedGrid, tiles: tiles, gridID: gridID, gridMode: gridMode, tileCount: tileCount, tileBoxID: tileNumber, tileSection: section}, null, `${gridMode}-tile`)
            })
        })
        tileNavText.addEventListener('click', () => {
            showTileElements('text')
            makeActive('text')
            section = 'text'
            fetchGetGrid(gridID).then(updatedGrid => {
                // Replace history state with new section with pustState method
                history.replaceState({section: "create-tile", grid: updatedGrid, tiles: tiles, gridID: gridID, gridMode: gridMode, tileCount: tileCount, tileBoxID: tileNumber, tileSection: section}, null, `${gridMode}-tile`)
            })
        })

        // Loop around next/prev tiles on click, staying on current section and keeping track of history state
        prevTileButton.addEventListener('click', () => {
            fetchGetGrid(gridID).then(updatedGrid => {
                if (updatedThisTile.prevTileNumber === 0) {
                    // Set history with pustState method
                    history.replaceState({section: "create-tile", grid: updatedGrid, tiles: tiles, gridID: gridID, gridMode: gridMode, tileCount: tileCount, tileBoxID: updatedThisTile.lastTileNumber, tileSection: section}, null, `${gridMode}-tile`)
                    createTile(tiles, gridID, gridMode, tileCount, updatedThisTile.lastTileNumber, section)
                } else {
                    // Set history with pustState method
                    history.replaceState({section: "create-tile", grid: updatedGrid, tiles: tiles, gridID: gridID, gridMode: gridMode, tileCount: tileCount, tileBoxID: updatedThisTile.prevTileNumber, tileSection: section}, null, `${gridMode}-tile`)
                    createTile(tiles, gridID, gridMode, tileCount, updatedThisTile.prevTileNumber, section)
                }
            })
        })
        nextTileButton.addEventListener('click', () => {
            fetchGetGrid(gridID).then(updatedGrid => {
                if (updatedThisTile.nextTileNumber > updatedThisTile.maxTileNumber) {
                    // Set history with pustState method
                    history.replaceState({section: "create-tile", grid: updatedGrid, tiles: tiles, gridID: gridID, gridMode: gridMode, tileCount: tileCount, tileBoxID: updatedThisTile.firstTileNumber, tileSection: section}, null, `${gridMode}-tile`)
                    createTile(tiles, gridID, gridMode, tileCount, updatedThisTile.firstTileNumber, section)
                } else {
                    // Set history with pustState method
                    history.replaceState({section: "create-tile", grid: updatedGrid, tiles: tiles, gridID: gridID, gridMode: gridMode, tileCount: tileCount, tileBoxID: updatedThisTile.nextTileNumber, tileSection: section}, null, `${gridMode}-tile`)
                    createTile(tiles, gridID, gridMode, tileCount, updatedThisTile.nextTileNumber, section)
                }
            })
        })

        // Reload create grid view when button is clicked
        backToGridButton.addEventListener('click', () => {
            fetchGetGrid(gridID).then(updatedGrid => {
                // Set history with pustState method
                history.pushState({section: "create-grid", grid: updatedGrid, gridMode: gridMode}, null, `${gridMode}-grid`)
                createGrid(updatedGrid, gridMode)
            })
        })

        // ************** TILE IMAGE SECTION (INCLUDES CROPPER) **************

        // Make custom button virtually click file input element
        // Learned from: https://www.youtube.com/watch?v=T3PDgtliezo&ab_channel=dcode
        addImageButton.addEventListener('click', () => {
            addImageInput.click()
        })

        // Declare variables so they are accessible in the save/crop click event
        let imgData;
        let filename;
        let cropper;

        // Display image cropper UI for new selected image when file is selected
        addImageInput.addEventListener('change', () => {
            console.log('change detected')
            // Clear image error message if present
            display("none", tileImageError)

            // Get image file object from input
            imgData = addImageInput.files[0]

            // Check if image file exceeds max size or is unaccepted file type
            if (imgData.size > MAX_IMAGE_SIZE) {
                tileImageError.innerText = "Image file cannot exceed 10 MB."
                display("flex", tileImageError)
                addImageInput.value = ""
            } else if (imgData.type != "image/jpeg" && imgData.type != "image/png" && imgData.type != "image/gif" && imgData.type != "image/svg+xml") {
                tileImageError.innerText = "Image file must be .gif, .jpg, .jpeg, .png, or .svg."
                display("flex", tileImageError)
                addImageInput.value = ""
            } else {
                // Save filename in variable
                filename = imgData.name
                // Create a DOMString containing a URL representing the image file object
                const imgURL = URL.createObjectURL(imgData)
                // Create cropper object using image url of input file
                cropper = createCropperObj(imgURL)
            }
        })

        // Display image cropper UI for new selected image when file is selected
        adjustImageButton.addEventListener('click', () => {
            // Reset grid and get updated grid via fetch
            fetchGetTile(updatedThisTile.tileID).then(updatedTile => {
                console.log(updatedTile)
                // Remove UID from filename so it can be replaced during save/crop
                filename = removeUIDFromFilename(updatedTile.imageName)
                // Create cropper object using image URL of current background
                cropper = createCropperObj(updatedTile.imageURL)
            })
        })

        function createCropperObj (imgURL) {
            // Show/hide elements
            display("inline", imageCropBox)
            display("flex", cropAndSaveButton, cancelCropButton)
            display("none", adjustImageButton, addImageButton, removeImageButton)
            // Change background temprorarily to default SVG for aesthetics
            bigEditTile.style.backgroundImage = `url(${DEFAULT_TILE_IMG_URL})`
            // Create image tag in imagebox showing the uploaded image file using the url
            imageCropBox.innerHTML = `<img src="${imgURL}" id="image" style="width:100%;">`
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
        cropAndSaveButton.addEventListener('click', () => {
            // Fetch updated tile to check if an image already exists
            fetchGetTile(updatedThisTile.tileID).then(updatedTile => {
                // Ask confirmation to replace if image is not default
                if (!updatedTile.imageURL.includes(DEFAULT_TILE_IMG_NAME)) {
                    const confirmation = confirm("Are you sure you want to replace the current image?");
                    if (!confirmation) {
                        // Clear input value so that change will still be detected if same image is chosen
                        addImageInput.value = null
                        // Update the background
                        setBackground(updatedTile)
                        // Show/hide elements
                        addImageButton.className = 'circle-button add-button'
                        display("flex", addImageButton, removeImageButton)
                        display("inline", adjustImageButton)
                        display("none", cropAndSaveButton, cancelCropButton, imageCropBox)
                        return
                    }
                }
                cropImage()
                imageCropBox.innerHTML = ""
            })
        })

        function cropImage() {
            // Convert the cropped image on cropper canvas to blob object
            try {
                cropper.getCroppedCanvas().toBlob((blob)=>{
                    // Get the original image data
                    let originalImageInput = addImageInput
                    // Append uid to filename to prevent image caching issues
                    filename = appendUIDToFilename(filename, section)
                    // Make a new cropped image file using that blob object with the same filename as the original
                    let newCroppedImageFile = new File([blob], filename,{type:"image/*", lastModified:new Date().getTime()});
                    // Create a new container
                    let container = new DataTransfer();
                    // Add the cropped image file to the container
                    container.items.add(newCroppedImageFile);
                    // Replace the original image file with the new cropped image file
                    originalImageInput.files = container.files;

                    let formData = new FormData()
                    formData.append('image', newCroppedImageFile)

                    fetchAddImage(updatedThisTile.tileID, formData).then(updatedTile => {
                        if (updatedTile.message) {
                            tileImageError.innerText = updatedTile.message
                            display("flex", tileImageError)
                            addImageInput.value = ""

                            // Show adjust and remove image buttons if there is an image
                            if (!updatedThisTile.imageURL.includes(DEFAULT_TILE_IMG_NAME)) {
                                display("inline", adjustImageButton)
                                addImageButton.className = "circle-button add-button"
                                display("flex", addImageButton, removeImageButton)
                                setBackground(updatedTile.tile)
                            } else {
                                addImageButton.className = "circle-button add-button button-center"
                                display("flex", addImageButton)
                                display("none", adjustImageButton, removeImageButton)
                            }
                        } else {
                            // Update the big tile's background with the new image
                            display("inline", adjustImageButton)
                            addImageButton.className = 'circle-button add-button'
                            display("flex", addImageButton, removeImageButton)
                            setBackground(updatedTile.tile)
                        }
                    })
                    display("none", cropAndSaveButton, cancelCropButton)

                // Pass cropper toBlob method 'image/jpeg' to prevent jpg > png conversions resulting in bigger file sizes
                // Learned from: https://github.com/fengyuanchen/cropper/issues/542
                // https://stackoverflow.com/questions/73188858/why-is-the-cropped-image-file-size-larger-and-with-png-compression-than-the-orig
                }, 'image/jpeg');
            } catch (error) {
                console.log(error)
                tileImageError.innerText = "Invalid image."
                display("flex", tileImageError)
                addImageInput.value = ""
                display("none", cropAndSaveButton, cancelCropButton)

                // Show adjust and remove image buttons if there is an image
                fetchGetTile(updatedThisTile.tileID).then(updatedTile => {
                    if (!updatedTile.imageURL.includes(DEFAULT_TILE_IMG_NAME)) {
                        display("inline", adjustImageButton)
                        addImageButton.className = "circle-button add-button"
                        display("flex", addImageButton, removeImageButton)
                        setBackground(updatedTile)
                    } else {
                        addImageButton.className = "circle-button add-button button-center"
                        display("flex", addImageButton)
                        display("none", adjustImageButton, removeImageButton)
                    }
                })
            }
        }

        // Cancel the crop UI and restore background when button is clicked
        cancelCropButton.addEventListener('click', () => {
            // Clear input value so that change will still be detected if same image is chosen
            addImageInput.value = null
            // Show/hide elements
            display("flex", addImageButton)
            display("none", imageCropBox, cropAndSaveButton, cancelCropButton)
            // Clear image crop box
            imageCropBox.innerHTML = ""

            fetchGetTile(updatedThisTile.tileID).then(updatedTile => {
                // Show adjust and remove image buttons if there is an image
                if (!updatedTile.imageURL.includes(DEFAULT_TILE_IMG_NAME)) {
                    display("inline", adjustImageButton)
                    addImageButton.className = 'circle-button add-button'
                    display("flex", removeImageButton)
                }

                // Reset the big tile's background to the current image
                setBackground(updatedTile)
            })
        })

        // Remove image when button is clicked
        removeImageButton.addEventListener('click', () => {
            display("none", tileImageError)
            const confirmation = confirm("Are you sure you want to remove this image?");
            if (confirmation) {
                // Remove image from tile
                fetchRemoveImage(updatedThisTile.tileID).then(updatedTile => {
                    // Update the big tile's background with the default image
                    setBackground(updatedTile)
                })

                // Hide remove image button
                addImageButton.className = 'circle-button add-button button-center'
                display("none", removeImageButton, adjustImageButton)
            }
        })

        // ************** SOUND SECTION **************

        // Clear any previously created audio players
        if (document.querySelector('.player')) {
            document.querySelector('.player').remove()
        }

        // If tile has an audio file, show the audio player
        if (updatedThisTile.audioURL != "") {
            player = new Audio(updatedThisTile.audioURL)
            player.controls = true
            player.classList.add('player')
            playerContainer.append(player)
            bigEditTile.appendChild(playerContainer)
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
        recordButton.addEventListener('click', startRecording)

        function startRecording() {
            let hasAudio = false
            let confirmation

            // Get confirmation if tile audio exists
            if (updatedThisTile.audioURL != "") {
                hasAudio = true
                confirmation = confirm("Are you sure you want to override the existing audio file?");
            }

            // Record if there isn't already audio or user wants to override existing audio
            if (!hasAudio || (hasAudio && confirmation)) {
                // Start the timer
                if (int != null) {
                    clearInterval(int)
                }
                int = setInterval(startTimer, 1000)

                recorder.start().then(() => {
                    // Change record button to stop button
                    recordButton.className = 'circle-button stop-button'
                    stopButtonContainer.append(stopButtonTimer, stopButtonSquare)
                    recordButton.append(stopButtonContainer)
                    recordButton.removeEventListener('click', startRecording)
                    recordButton.addEventListener('click', stopRecording)
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
                fetchAddAudio(updatedThisTile.tileID, formData).then(updatedTile => {
                    if (updatedTile.message) {
                        tileAudioError.innerText = updatedTile.message
                        addAudioInput.value = ""
                        display("flex", tileAudioError, addTileAudioButton, removeTileAudioButton)
                        display("none", saveTileAudioButton, cancelTileAudioButton, audioFilename)
                    } else {
                        // Reload tile
                        createTile(tiles, gridID, gridMode, tileCount, updatedTile.tile.tileNumber, section)
                    }
                })

                // Change stop button back to record button
                recordButton.innerText = ''
                recordButton.className = 'circle-button record-button'
                recordButton.removeEventListener('click', stopRecording)
                recordButton.addEventListener('click', startRecording)
                // Reset timer back to zero
                minutes = 0
                seconds = 0
            }).catch((e) => {
                console.error(e)
            });
        }

        function startTimer() {
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
            stopButtonTimer.innerText = `${minutes}:${s}`
        }

        // Virtually click input to allow input customization
        addTileAudioButton.addEventListener('click', () => {
            addAudioInput.click()
        })

        // Display filename and save/cancel buttons when an audio file is added for upload
        addAudioInput.addEventListener('change', () => {
            console.log('change detected')
            // Get audio file object from input
            let audioData = addAudioInput.files[0]
            // Save filename in variable
            let filename = audioData.name

            console.log('audioData.type', audioData.type)
            if (audioData.type === "audio/wav") {
                console.log('file is wav')
            } else if (audioData.type === "audio/mpeg") {
                console.log('file is mp3')
            }

            // Check if audio file exceeds max size or is unaccepted file type
            if (audioData.size > MAX_AUDIO_SIZE) {
                tileAudioError.innerText = "Audio file cannot exceed 2.5 MB."
                display("flex", tileAudioError)
                addAudioInput.value = ""
            } else if (audioData.type != "audio/wav" && audioData.type != "audio/mpeg") {
                tileAudioError.innerText = "Audio file must be either .mp3 or .wav."
                display("flex", tileAudioError)
                addAudioInput.value = ""
            } else {
                display("none", addTileAudioButton, removeTileAudioButton)
                display("flex", saveTileAudioButton, cancelTileAudioButton)
                audioFilename.innerText = `Upload ${filename}?`
                display("inline", audioFilename)

                // Upload selected audio file
                let hasAudio = false
                let confirmation

                saveTileAudioButton.addEventListener('click', () => {
                    // Get confirmation if tile audio exists
                    if (updatedThisTile.audioURL != "") {
                        hasAudio = true
                        confirmation = confirm("Are you sure you want to override the existing audio file?");
                    }

                    // Upload if there isn't already audio or user wants to override existing audio
                    if (!hasAudio || (hasAudio && confirmation)) {
                        // Append uid to filename to prevent file caching issues
                        filename = appendUIDToFilename(filename, section)
                        // Rename the file object
                        // Learned from: https://pqina.nl/blog/rename-a-file-with-javascript/
                        const renamedAudioData = new File([audioData], filename);

                        let formData = new FormData()
                        formData.append('audio_file', renamedAudioData)

                        // Save recorded audio file via fetch if there is no validation message
                        fetchAddAudio(updatedThisTile.tileID, formData).then(updatedTile => {
                            if (updatedTile.message) {
                                tileAudioError.innerText = updatedTile.message
                                addAudioInput.value = ""
                                display("flex", tileAudioError, addTileAudioButton, removeTileAudioButton)
                                display("none", saveTileAudioButton, cancelTileAudioButton, audioFilename)
                            } else {
                                // Reload tile
                                createTile(tiles, gridID, gridMode, tileCount, updatedTile.tile.tileNumber, section)
                            }
                        })
                    }
                })

                // Cancel audio file upload when button is clicked
                cancelTileAudioButton.addEventListener('click', () => {
                    // Clear input value so that change will still be detected if same audio file is chosen
                    addAudioInput.value = ""
                    addTileAudioButton.className = "circle-button add-button"
                    display("flex", addTileAudioButton, removeTileAudioButton)
                    display("none", saveTileAudioButton, cancelTileAudioButton, audioFilename)
                })
            }
        })

        // Delete existing audio file when button is clicked
        removeTileAudioButton.addEventListener('click', () => {
            const confirmation = confirm("Are you sure you want to delete the existing audio file?");
            if (confirmation) {
                fetchRemoveAudio(updatedThisTile.tileID).then(updatedTile => {
                    // Reload tile
                    createTile(tiles, gridID, gridMode, tileCount, updatedTile.tileNumber, section)
                })
            }
        })


        // ************** TEXT SECTION **************

        // Show text area when button is clicked
        addTileTextButton.addEventListener('click', () => {
            tileTextInput.placeholder = DEFAULT_TILE_TEXT
            display("flex", tileTextInput, saveTileTextButton, cancelTileTextButton)
            tileTextInput.focus();
            display("none", addTileTextButton, removeTileTextButton)
        })

        // Show text area when button is is clicked
        tileText.addEventListener('click', () => {
            display("flex", saveTileTextButton, cancelTileTextButton)
            display("none", addTileTextButton, removeTileTextButton)

            fetchGetTile(updatedThisTile.tileID).then(updatedTile => {
                if (updatedTile.tileText) {
                    tileTextInput.value = updatedTile.tileText
                }
                tileTextInput.placeholder = DEFAULT_TILE_TEXT
                display("flex", tileTextInput)
                tileTextInput.focus();
            })
        })

        // Clear input and remove/replace elements when button is clicked
        cancelTileTextButton.addEventListener('click', () => {
            cancelTileText()
        })

        // Do the same when "Escape" is pressed
        tileTextInput.addEventListener('keydown', (e) => {
            if (e.key === "Escape") {
                cancelTileText()
            }
        })

        function cancelTileText() {
            tileTextInput.value = ""
            fetchGetTile(updatedThisTile.tileID).then(updatedTile => {
                if (updatedTile.tileText) {
                    display("flex", removeTileTextButton)
                    tileText.innerText = updatedTile.tileText
                    console.log('this is happening')
                } else {
                    display("flex", addTileTextButton)
                    tileText.innerText = ""
                    display("none", tileTextBox, tileText)
                    console.log('no, this is.')
                }
                display("none", tileTextCharsRemaining, tileTextInput, tileTextError, saveTileTextButton, cancelTileTextButton)
            })
        }

        // Save tile text via fetch when button is clicked
        saveTileTextButton.addEventListener('click', () => {
            updateTileText()
        })

        // Do the same when "Enter" is pressed
        tileTextInput.addEventListener('keydown', (e) => {
            if (e.key === "Enter") {
                updateTileText()
            }
        })

        function updateTileText() {
            fetchUpdateTileText(updatedThisTile.tileID, tileTextInput.value).then(updatedTextTile => {
                if (updatedTextTile.message) {
                    tileTextError.innerText = updatedTextTile.message
                    display("flex", tileTextError, tileTextCharsRemaining)
                } else {
                    display("none", tileTextCharsRemaining, tileTextInput, tileTextError, saveTileTextButton, cancelTileTextButton)

                    if (updatedTextTile.tile.tileText && updatedTextTile.tile.tileText != "") {
                        tileText.innerText = updatedTextTile.tile.tileText
                        display("flex", removeTileTextButton)
                    } else {
                        display("none", tileTextBox, tileText)
                        tileText.innerText = ""
                        display("flex", addTileTextButton)
                    }
                }
            })
        }

        // Remove tile text via fetch when button is clicked
        removeTileTextButton.addEventListener('click', () => {
            // Ask confirmation to remove tile text
            const confirmation = confirm("Are you sure you want to delete this tile text?");
            if (confirmation) {
                fetchRemoveTileText(updatedThisTile.tileID).then(updatedTextTile => {
                    console.log(updatedTextTile)
                    tileTextInput.value = ""
                    display("none", tileTextBox, tileText, removeTileTextButton)
                    tileText.innerText = ""
                    display("flex", addTileTextButton)
                })
            }
        })

        // Show how many characters remain on input and update tile text div
        tileTextInput.addEventListener('input', () => {
            display("flex", tileTextCharsRemaining)
            let charsRemaining = MAX_TILE_TEXT_CHARS - tileTextInput.value.length
            tileTextCharsRemaining.innerText = `${charsRemaining} characters remainining.`
            tileTextCharsRemaining.style.color = "white"
            if (charsRemaining === 1) {
                tileTextCharsRemaining.innerText = `${charsRemaining} character remaining.`
            } else if (charsRemaining < 0) {
                tileTextCharsRemaining.style.color = "#e94a4a"
            }
            tileText.innerText = tileTextInput.value
            if (tileTextInput.value === "") {
                display("none", tileTextBox, tileText)
            } else {
                display("flex", tileTextBox)
                display("inline", tileText)
            }
        })

        // Append tile editing elements
        tileTextBox.append(tileText)
        tileControlTop.append(adjustImageButton, audioFilename, tileTextBox)
        tileControlMiddle.append(cancelCropButton, cropAndSaveButton, removeImageButton, addImageButton, removeTileAudioButton, addTileAudioButton, cancelTileAudioButton, saveTileAudioButton, removeTileTextButton, addTileTextButton, cancelTileTextButton, saveTileTextButton)
        tileNavBox.append(tileNavImage, tileNavSound, tileNavText)
        tileControlBottom.append(tileNavBox)
        tileControlBox.append(tileControlTop, tileControlMiddle, tileControlBottom)
        bigEditTile.append(backToGridButton, imageCropBox, tileImageError, tileTextError, tileTextInput, tileTextCharsRemaining, recordButton, tileAudioError, prevTileButton, nextTileButton, tileControlBox)

        // Remove exisiting big tile element and overlay to prevent duplicates
        if (document.querySelector('.big-edit-tile')) {
            document.querySelector('.big-edit-tile').remove()
        }
        if (document.querySelector('.overlay')) {
            document.querySelector('.overlay').remove()
        }
        document.querySelector('#create-grid-view').append(overlay, bigEditTile)
    })
}

// ************** HELPER FUNCTIONS **************

// Create HTML element, set class name, ID, innerText, and innerHTML
function createHTML(element, className, id, innerText, innerHTML) {
    const newElement = document.createElement(element)
    if (className !== null && className !== undefined) {
        newElement.className = className
    }
    if (id !== null && id !== undefined) {
        newElement.id = id
    }
    // Using innerText in most cases instead of innerHTML for security
    // Learned from: https://www.youtube.com/watch?v=ns1LX6mEvyM&ab_channel=WebDevSimplified
    if (innerText !== null && innerText !== undefined) {
        newElement.innerText = innerText
    }
    if (innerHTML !== null && innerHTML !== undefined) {
        newElement.innerHTML = innerHTML
    }
    return newElement
}

// Use filter method to get tile object of a specific tile number
function getTileFromTileNumber(tiles, tileNumber) {
    const tile = tiles.filter(
        (tile) => tile.tileNumber === parseInt(tileNumber)
    );
    return tile[0]
}

// Use Some method to check if there is at least one tile that has an image and audio
function hasAudio(tiles) {
    const oneTileWithAudio = tiles.some(
        (tile) => tile.audioURL !== "" && !tile.imageURL.includes(DEFAULT_TILE_IMG_NAME)
    );
    return oneTileWithAudio
}

// Use Some method to check if there is at least one tile that has an image and text
function hasText(tiles) {
    const oneTileWithText = tiles.some(
        (tile) => tile.tileText !== null && !tile.imageURL.includes(DEFAULT_TILE_IMG_NAME)
    );
    return oneTileWithText
}

// Return the current grid width from the DOM
function getViewportWidth() {
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
function removeUIDFromFilename(filename) {
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

// ************** FETCHES **************

// Fetch latest new grid or create one if there are none
async function fetchNewGrid() {
    // Read the CSRF token from the DOM
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // Create and return a new grid
    const response = await fetch("new_grid", {
        method: 'PUT',
        headers: {
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({
            viewport_width: getViewportWidth()
        })
    })
    const newGrid = await response.json();
    return newGrid
}

// Fetch all albums
async function fetchAlbums() {
    const response = await fetch("get_albums")
    const albums = await response.json();
    return albums
}

// Create a new album
async function fetchCreateAlbum(newAlbumTitle) {
    // Read the CSRF token from the DOM
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // Create albums and return albums array
    const response = await fetch(`create_album/${newAlbumTitle}`, {
        method: 'PUT',
        headers: {
            'X-CSRFToken': csrfToken
        }
    })
    const updatedAlbums = await response.json();
    return updatedAlbums
}

// Delete a single album (via trash icon) along with all its grid and the grid's media
async function fetchDeleteAlbum(albumID) {
    // Read the CSRF token from the DOM
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // Delete specified album
    const response = await fetch(`delete_album/${albumID}`, {
        method: 'PUT',
        headers: {
            'X-CSRFToken': csrfToken
        }
    })
    const updatedAlbums = await response.json();
    return updatedAlbums
}

// Delete one or multiple grids and their media
async function fetchDeleteGrids(selectedGridIDs) {
    // Read the CSRF token from the DOM
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // Delete all specified grids
    const response = await fetch('delete_grids', {
        method: 'PUT',
        headers: {
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({
            selected_grid_ids: selectedGridIDs
        })
    })
    const updatedAlbums = await response.json();
    return updatedAlbums
}

// Change the album of one or multiple grids
async function fetchMoveGridsToAlbum(selectedAlbumID, selectedGridIDs) {
    // Read the CSRF token from the DOM
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // Return albums with updated grids
    const response = await fetch(`move_grids_to_album/${selectedAlbumID}`, {
        method: 'PUT',
        headers: {
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({
            selected_grid_ids: selectedGridIDs
        })
    })
    const updatedAlbums = await response.json();
    return updatedAlbums
}

// Change an album's title
async function fetchEditAlbumTitle(albumID, updatedAlbumTitle) {
    // Read the CSRF token from the DOM
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // Return album with updated title
    const response = await fetch(`edit_album_title/${albumID}`, {
        method: 'PUT',
        headers: {
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({
            updated_album_title: updatedAlbumTitle
        })
    })
    const updatedAlbum = await response.json();
    return updatedAlbum
}

// Change a grid's title
async function fetchEditGridTitle(gridID, updatedGridTitle) {
    // Read the CSRF token from the DOM
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // Return grid with updated title
    const response = await fetch(`edit_grid_title/${gridID}`, {
        method: 'PUT',
        headers: {
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({
            updated_grid_title: updatedGridTitle,
            viewport_width: getViewportWidth()
        })
    })
    const updatedGrid = await response.json();
    return updatedGrid
}

// Change a single grid's album
async function fetchChangeAlbum(selectedAlbumID, gridID) {
    // Read the CSRF token from the DOM
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // Return grid with updated album
    const response = await fetch(`change_album/${gridID}`, {
        method: 'PUT',
        headers: {
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({
            selected_album_id: selectedAlbumID,
            viewport_width: getViewportWidth()
        })
    })
    const updatedGrid = await response.json();
    return updatedGrid
}

// Change quiz preference (audio or text, audio only, text only)
async function fetchChangeQuizPreference(quizPreference, gridID) {
    // Read the CSRF token from the DOM
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // Return grid with updated album
    const response = await fetch(`change_quiz_preference/${gridID}`, {
        method: 'PUT',
        headers: {
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({
            quiz_preference: quizPreference,
            viewport_width: getViewportWidth()
        })
    })
    const updatedGrid = await response.json();
    return updatedGrid
}

// Add or remove one or multiple tiles from a specific grid
async function fetchAddOrRemoveTiles(gridID, oldCount, newCount) {
    // Read the CSRF token from the DOM
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // Change tile count and return updated grid
    const response = await fetch(`add_or_remove_tiles/${gridID}`, {
        method: 'PUT',
        headers: {
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({
            old_count: oldCount,
            new_count: newCount,
            viewport_width: getViewportWidth()
        })
    })
    const updatedGrid = await response.json();
    return updatedGrid
}

// Set a tiles per row preference for a specific grid
async function fetchChangeTilesPerRow(selectedTilesPerRow, gridID) {
    // Read the CSRF token from the DOM
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // Return grid with updated album
    const response = await fetch(`change_tiles_per_row/${gridID}`, {
        method: 'PUT',
        headers: {
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({
            selected_tiles_per_row: selectedTilesPerRow
        })
    })
    const updatedGrid = await response.json();
    return updatedGrid
}

// Delete a single tile (via trash icon)
async function fetchDeleteTile(gridID, tileNumber) {
    // Read the CSRF token from the DOM
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // Return an updated grid after deleting a tile
    const response = await fetch(`delete_tile/${gridID}`, {
        method: 'PUT',
        headers: {
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({
            tile_number: tileNumber,
            viewport_width: getViewportWidth()
        })
    })
    const updatedGrid = await response.json();
    return updatedGrid
}

// Reset a grid, deleting all its media and setting everything to a new/default value
async function fetchResetGrid(gridID) {
    // Read the CSRF token from the DOM
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // Return a reset/new grid
    const response = await fetch(`reset_grid/${gridID}`, {
        method: 'PUT',
        headers: {
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({
            viewport_width: getViewportWidth()
        })
    })
    const updatedGrid = await response.json();
    return updatedGrid
}

// Sort a specific grid's tiles (reverse, random, or default sort)
async function fetchSortTiles(gridID, sort) {
    // Read the CSRF token from the DOM
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // Return grid with re-sorted tiles
    const response = await fetch(`sort_tiles/${gridID}`, {
        method: 'PUT',
        headers: {
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({
            sort: sort,
            viewport_width: getViewportWidth()
        })
    })
    const updatedGrid = await response.json();
    return updatedGrid
}

// Add an image to a specific tile, replacing the default image
async function fetchAddImage(tileID, image) {
    // Read the CSRF token from the DOM
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // Return tile after adding image
    const response = await fetch(`add_image/${tileID}`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrfToken
        },
        body: image
    })
    const updatedTile = await response.json();
    return updatedTile
}

// Remove an image from a specific tile, resetting to the default image
async function fetchRemoveImage(tileID) {
    // Read the CSRF token from the DOM
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // Return tile after removing image
    const response = await fetch(`remove_image/${tileID}`, {
        method: 'PUT',
        headers: {
            'X-CSRFToken': csrfToken
        }
    })
    const updatedTile = await response.json();
    return updatedTile
}

// Add new or update existing text of a specific tile
async function fetchUpdateTileText(tileID, tileText) {
    // Read the CSRF token from the DOM
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // Return tile with updated tile text
    const response = await fetch(`update_tile_text/${tileID}`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({
            tile_text: tileText
        })
    })
    const updatedTile = await response.json();
    return updatedTile
}

// Remove the text from a specific tile
async function fetchRemoveTileText(tileID) {
    // Read the CSRF token from the DOM
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // Return tile with removed tile text
    const response = await fetch(`remove_tile_text/${tileID}`, {
        method: 'PUT',
        headers: {
            'X-CSRFToken': csrfToken
        }
    })
    const updatedTile = await response.json();
    return updatedTile
}

// Add an audio file to a specific tile
async function fetchAddAudio(tileID, audioFile) {
    // Read the CSRF token from the DOM
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // Return tile after adding audio file
    const response = await fetch(`add_audio/${tileID}`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrfToken
        },
        body: audioFile
    })
    const updatedTile = await response.json();
    return updatedTile
}

// Remove an audio file from a specific tile
async function fetchRemoveAudio(tileID) {
    // Read the CSRF token from the DOM
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // Return tile after removing audio file
    const response = await fetch(`remove_audio/${tileID}`, {
        method: 'PUT',
        headers: {
            'X-CSRFToken': csrfToken
        }
    })
    const updatedTile = await response.json();
    return updatedTile
}

// Fetch a single grid
async function fetchGetGrid(gridID) {
    // Read the CSRF token from the DOM
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    const response = await fetch(`get_grid/${gridID}`, {
        method: 'PUT',
        headers: {
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({
            viewport_width: getViewportWidth()
        })
    })
    const updatedGrid = await response.json();
    return updatedGrid
}

// Fetch a single grid with duplicated tiles for the memory game
async function fetchGetMemoryGrid(gridID) {
    // Read the CSRF token from the DOM
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    const response = await fetch(`get_memory_grid/${gridID}`, {
        method: 'PUT',
        headers: {
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({
            viewport_width: getViewportWidth()
        })
    })
    const updatedGrid = await response.json();
    return updatedGrid
}

// Fetch a single tile
async function fetchGetTile(tileID) {
    const response = await fetch(`get_tile/${tileID}`)
    const updatedTile = await response.json();
    return updatedTile
}