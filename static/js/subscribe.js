// Function to handle subscription
async function subscribe() {
    const participantNameInput = document.getElementById('participantName');
    const participantImageInput = document.getElementById('participantImage');

    // Get input values
    const name = participantNameInput.value.trim();
    const imageFile = participantImageInput.files[0]; // Get the first file from the input

    // Validate inputs
    if (name && imageFile) {
        try {
            // Create FormData object to handle file upload
            const formData = new FormData();
            formData.append('name', name);
            formData.append('image', imageFile);

            // Make a POST request to your Flask endpoint
            const response = await fetch('/subscribe_user', {
                method: 'POST',
                body: formData,
            });

            const responseData = await response.json();

            if (response.ok) {
                // Get subscribed participants from localStorage
                const subscribedParticipants = JSON.parse(localStorage.getItem('subscribedParticipants')) || [];

                // Check if the participant is already subscribed
                if (!subscribedParticipants.some(participant => participant.name === name)) {
                    // Add participant to the array
                    subscribedParticipants.push({ name, image: URL.createObjectURL(imageFile) });

                    // Update localStorage with the new data
                    localStorage.setItem('subscribedParticipants', JSON.stringify(subscribedParticipants));

                    // Update the dropdown menu
                    updateDropdown();

                    // Clear input fields
                    participantNameInput.value = '';
                    participantImageInput.value = '';

                    alert('Subscription successful!');
                } else {
                    alert('Participant is already subscribed.');
                }
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
