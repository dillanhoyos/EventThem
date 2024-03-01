

// Function to fetch all users from the server and create dropdown options
async function fetchAllUserNames() {
    try {
        const response = await fetch('/get_all_users_name');
        const data = await response.json();

        if (response.ok) {
            return data.users.map(user => user.name);
        } else {
            console.error('Error fetching user names:', data.error);
            return [];
        }
    } catch (error) {
        console.error('Error fetching user names:', error);
        return [];
    }
}
// Function to fetch tournament data from the server
async function fetchTournamentData() {
    try {
        const response = await fetch('/get_tournament_model');
        const data = await response.json();

        if (response.ok) {
            return data.tournamentData;
        } else {
            console.error('Error fetching tournament data:', data.error);
            return {};
        }
    } catch (error) {
        console.error('Error fetching tournament data:', error);
        return {};
    }
}

// Function to initialize brackets with dropdown menus
async function initializeBrackets() {
    const tournamentElement = document.querySelector('.tournament');
   

    // Fetch tournament data from the server
    const fetchedTournamentData = await fetchTournamentData();
    const userNames = await fetchAllUserNames();

    // Define the order in which you want to display the rounds
    const roundOrder = ['round-1', 'round-2', 'round-3', 'round-4', 'round-5', 'round-4-right', 'round-3-right', 'round-2-right', 'round-1-right'];

    // Iterate through the roundOrder array
    for (const roundKey of roundOrder) {
        // Check if the round exists in the fetched data
        if (fetchedTournamentData.hasOwnProperty(roundKey)) {
            const roundData = fetchedTournamentData[roundKey];

            const roundElement = document.createElement('div');
            roundElement.classList.add(roundKey);
            let roundNumber;
            if (roundKey.includes('-right')) {
                roundNumber = parseInt(roundKey.replace('round-', '').replace('-right', '')) + '-right';
            } else {
                roundNumber = parseInt(roundKey.replace('round-', ''));
            }
            
           
            for (const [matchKey, matchData] of Object.entries(roundData)) {
                const matchElement = document.createElement('div');
                matchElement.classList.add('match-'+roundNumber);
                matchElement.dataset.matchId = matchKey; // Unique identifier for the match

                console.log(roundKey);

                const updateMatchData = () => {
                    // Make a POST request to update the match data in the database
                    fetch('/update_match', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            round: roundKey,
                            match: matchKey,
                            scores: matchData.scores || [0, 0], // Assuming scores are optional
                            teams: matchData.teams || ['AddTeam', 'AddTeam'], // Assuming teams are optional
                        }),
                    })
                        .then(response => response.json())
                        .then(data => {
                            if (data.success) {
                                console.log('Match data updated successfully:', data.message);
                            } else {
                                console.error('Error updating match data:', data.error);
                            }
                        })
                        .catch(error => {
                            console.error('Error updating match data:', error);
                        });
                };

                const initializeTeam = (teamElement, teamName) => {
                    teamElement.classList.add('team');

                    const teamSelect = document.createElement('select');
                    teamSelect.classList.add('team-select');

                    userNames.forEach(userName => {
                        const option = document.createElement('option');
                        option.value = userName;
                        option.text = userName;
                        teamSelect.add(option);
                    });

                    teamSelect.value = matchData.teams ? matchData.teams[teamName === 'Team1' ? 0 : 1] : 'AddTeam';

                    teamSelect.addEventListener('change', function () {
                        matchData.teams[teamName === 'Team1' ? 0 : 1] = teamSelect.value;
                        updateMatchData();
                    });

                    teamElement.appendChild(teamSelect);

                    const teamScoreInput = document.createElement('input');
                    teamScoreInput.classList.add('score-input');
                    teamScoreInput.setAttribute('type', 'number');
                    teamScoreInput.setAttribute('placeholder', 'Score');
                    teamScoreInput.value = matchData.scores ? matchData.scores[teamName === 'Team1' ? 0 : 1] : 0;

                    teamScoreInput.addEventListener('input', function () {
                        // Update the score when the input changes
                        matchData.scores[teamName === 'Team1' ? 0 : 1] = parseInt(teamScoreInput.value) || 0;
                        updateMatchData();
                    });

                    teamElement.appendChild(teamScoreInput);
                    return teamElement;
                };
                
                const team1Element = initializeTeam(document.createElement('div'), 'Team1');
                const team2Element = initializeTeam(document.createElement('div'), 'Team2');
                
                const showParticipantsButton = document.createElement('button');
                
                // Check if the match has the -right postfix
                if (roundKey.includes('-right')) {
                    showParticipantsButton.classList.add('participants-button-right');
                } else {
                    showParticipantsButton.classList.add('participants-button');
                } 
                
                showParticipantsButton.addEventListener('click', function () {
                    // Implement the logic to show match participants
                    // You can access matchData.teams array to get the participants
                    const participants = matchData.teams || "";
                  
                    // Assuming your overlay object has a method to display information
                    showParticipantsOverlay(participants);
                });
                
                
                matchElement.appendChild(showParticipantsButton);
                matchElement.appendChild(team1Element);
                matchElement.appendChild(team2Element);
                
                if (roundKey === 'round-5') {
                    const imageElement = document.createElement('img');
                    imageElement.src = 'static/images/EventThem Logo - White Box.jpg';
                    imageElement.alt = 'Round 5 Image';
                    imageElement.classList.add('round-5-image'); // Add a specific class for styling
                    roundElement.appendChild(imageElement);
                }
                roundElement.appendChild(matchElement);
                // Append match element to the current round
                if (roundKey === 'round-5') {
                    const imageElement = document.createElement('img');
                    imageElement.src = 'static/images/EventThemStudios-FINAL (1).png';
                    imageElement.alt = 'Round 5 Image';
                    imageElement.classList.add('round-5-image'); // Add a specific class for styling
                    roundElement.appendChild(imageElement);
                }
            }

            // Append the current round or right-side round to the tournament element
            tournamentElement.appendChild(roundElement);
        }
    }
}
async function showParticipantsOverlay(participants) {
        // Example overlay object initialization
    const overlay = document.getElementById("Match_Overlay");
        
    overlay.style.display = "block";
    // Fetch information for participants from the "Match_information" route
    const participantInfo = await fetchParticipantInfo(participants);
    console.log(participantInfo)
    // Display participants information in the overlay
    updateParticipantUI(overlay.querySelector('.participant'), participantInfo[0]); // First participant
    updateParticipantUI(overlay.querySelector('.participant-right'), participantInfo[1]); // Second participant
}

function updateParticipantUI(participantElement, participantData) {
    if (participantElement) {
        console.log(participantElement)
        // Update the elements by reference
        const imgElement = participantElement.querySelector('img');
        const nameElement = participantElement.querySelector('span');
        const PSHandleElement = participantElement.querySelector('span:last-child');

        imgElement.src = participantData.image;
        nameElement.textContent = participantData.name;
        PSHandleElement.textContent = participantData.pshandle;
    }
}


async function fetchParticipantInfo(participants) {
    try {
        // Assuming your backend API provides a "Match_information" route
        const response = await fetch('/Match_Participants', {
            method: 'POST', // Adjust the method as needed
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ participants }),
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch participant information: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error(error);
        // Handle the error as needed
    }
}

// Call the function to initialize brackets when the page loads
window.onload = initializeBrackets;

