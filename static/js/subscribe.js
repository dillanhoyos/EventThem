// Function to handle subscription
async function subscribe() {
    const participantNameInput = document.getElementById('participantName');
    const participantImageInput = document.getElementById('participantImage');
    const participantPSHandle =  document.getElementById('participantPSHandle')

    // Get input values
    const name = participantNameInput.value.trim();
    const psHandle = participantPSHandle.value.trim();
    const imageFile = participantImageInput.files[0]; // Get the first file from the input

    // Validate inputs
    if (name && imageFile ) {
        try {
            // Create FormData object to handle file upload
            const formData = new FormData();
            formData.append('name', name);
            formData.append('PSHandle', psHandle);
            formData.append('image', imageFile);

            // Make a POST request to your Flask endpoint
            const response = await fetch('/subscribe_user', {
                method: 'POST',
                body: formData,
            });

            const responseData = await response.json();

            if (response.ok) {
                // Fetch all users after successful subscription
                getAllUsers();

                // Clear input fields
                participantNameInput.value = '';
                participantPSHandle.value = '';
                participantImageInput.value = '';

                alert('Subscription successful!');
            } else {
                // Handle error from the server
                alert(`Error: ${responseData.error}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        }
    } else {
        alert('Please provide both name and image.');
    }
}
// Function to fetch all users from the server and display their names and images
async function getAllUsers() {
    try {
        // Make a GET request to your Flask endpoint to retrieve all users
        const response = await fetch('/get_all_users');
        const data = await response.json();

        if (data.success === true) {
            const users = data.users;

            // Assuming you have an HTML element with id "participantList" to display the participants
            const participantList = document.getElementById('participantList');

            // Clear existing content
            participantList.innerHTML = '';

            // Loop through the users and display their names and images
            users.forEach(user => {
                const listItem = document.createElement('li');

                const userName = document.createElement('p');
                userName.textContent = user.name;

                const PSHandle = document.createElement('p');
                PSHandle.textContent = user.PSHandle;

                const userImage = document.createElement('img');
                userImage.src = user.image_url;
                userImage.alt = user.name;  // Set alt text as per your requirements

                listItem.appendChild(userName);
                listItem.appendChild(userImage);
                participantList.appendChild(listItem);
            });
        } else {
            console.error('Error:', data.error);
            console.error('Error:', "There are no Users yet");
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while fetching participants.');
    }
}
function deleteParticipants() {
    // Make a POST request to the endpoint
    fetch('/delete_all_users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to delete participants');
        }
        getAllUsers()
        return response.json();
    })
    .then(data => {
        // Handle success
        console.log(data.message);
        alert('All participants deleted successfully');
    })
    .catch(error => {
        // Handle error
        console.error('Error deleting participants:', error.message);
        alert('Failed to delete participants. Please try again later.');
    });
}

// Call the function to fetch and display participants when the page loads
window.onload = getAllUsers;