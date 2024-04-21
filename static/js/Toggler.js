function toggleBackgroundImage() {
    var button = document.getElementById('toggleButton');
    var title_background = document.querySelector('.title')
    var title = document.querySelector('.title h1'); // Reference to the title element
    var bodyBackground = window.getComputedStyle(document.body, '::before').getPropertyValue('background-image');
    // Extract the URL from the computed style
    var backgroundImageURL = bodyBackground.match(/url\(['"]?(.*?)['"]?\)/)[1];

    console.log(backgroundImageURL);
    // Determine the boolean flag based on the current background image
    var isToggled = backgroundImageURL.includes('static/images/stadium-4760441.jpg') ? false : true;

    fetch('/update_CurrentTournament', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({  isToggled: isToggled }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Toggler field updated successfully');
    })
    .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
    });

    if (backgroundImageURL.includes('static/images/stadium-4760441.jpg')) { 
        document.body.style.setProperty('--background-image',"url('/static/images/TD.jpg')"); // Change the background image of body::before
        document.body.style.setProperty('--background-opacity', '0.75');
        title_background.style.backgroundColor = "rgba(0,122,75, 0.845)";
        button.style.backgroundColor = "rgba(0,122,75, 0.545)";
        title.style.webkitTextStroke = "2px #ffff";// Change the title text
        title.textContent = "2K Legacy by EVENTTHEM"; // Change the title text
    } else {
        document.body.style.setProperty('--background-image',"url('/static/images/stadium-4760441.jpg')"); // Change the background image of body::before
        document.body.style.setProperty('--background-opacity', '0.5');
        title_background.style.backgroundColor = "rgba(94, 174, 228, 0.545)"
        button.style.backgroundColor = "rgba(94, 174, 228, 0.545)";
        title.style.webkitTextStroke = "2px #000";// Change the title text
        title.textContent = "FIFA Royalty by EVENTTHEM"; // Change the title text
    }
}

document.addEventListener("DOMContentLoaded", function() {
    setTimeout(loadBackground, 2000); // Delay the call by 1000 milliseconds (1 second)
});

function loadBackground() {
    var button = document.getElementById('toggleButton');
    var title_background = document.querySelector('.title')
    var title = document.querySelector('.title h1'); // Reference to the title element
    var bodyBackground = window.getComputedStyle(document.body, '::before').getPropertyValue('background-image');
    // Extract the URL from the computed style
    var backgroundImageURL = bodyBackground.match(/url\(['"]?(.*?)['"]?\)/)[1];
    fetch('/get_CurrentTournament')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
       
            // Set the background image based on the data received
            if (data.isToggled) { 
                document.body.style.setProperty('--background-image',"url('/static/images/stadium-4760441.jpg')"); // Change the background image of body::before
                document.body.style.setProperty('--background-opacity', '0.5');
                title_background.style.backgroundColor = "rgba(94, 174, 228, 0.545)"
                button.style.backgroundColor = "rgba(94, 174, 228, 0.545)";
                title.style.webkitTextStroke = "2px #000";// Change the title text
                title.textContent = "FIFA Royalty by EVENTTHEM"; // Change the title text
            } else {
                document.body.style.setProperty('--background-image',"url('/static/images/TD.jpg')"); // Change the background image of body::before
                document.body.style.setProperty('--background-opacity', '0.75');
                title_background.style.backgroundColor = "rgba(0,122,75, 0.845)";
                button.style.backgroundColor = "rgba(0,122,75, 0.545)";
                title.style.webkitTextStroke = "2px #ffff";// Change the title text
                title.textContent = "2K Legacy by EVENTTHEM"; // Change the title text
            }
        
    })
    .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
    });
}
