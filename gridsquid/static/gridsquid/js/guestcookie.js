// getCookie from: https://docs.djangoproject.com/en/4.0/ref/csrf/
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// UUID from: https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid
function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

let guest_name = getCookie("guest_name")

// Guest cookie learned from: https://www.youtube.com/watch?v=-7a8sth8gKo&ab_channel=DennisIvy
// Generate guest name if one does not exist
if (guest_name == null || guest_name == undefined) {
    guest_name = uuidv4()
}

// Set value of guest name cookie
document.cookie = `guest_name=${guest_name}; domain=; path=/;`