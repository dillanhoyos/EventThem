

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
async function initializeBrackets(roundOrder) {
    const tournamentElement = document.querySelector('.tournament');
    tournamentElement.innerHTML = '';
   
    // Fetch tournament data from the server
    const fetchedTournamentData = await fetchTournamentData();
    const userNames = await fetchAllUserNames();

    // Define the order in which you want to display the rounds
    
   
    tournamentElement.style.display = 'grid';
    tournamentElement.style.gridTemplateColumns =  `repeat(${roundOrder.length}, 1fr)`;
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
                if(roundKey === 'round-5'){
                    const showParticipantsButton = document.createElement('button');
                    showParticipantsButton.classList.add('button_class');

                    showParticipantsButton.addEventListener('click', function () {
                        // Implement the logic to show match participants
                        // You can access matchData.teams array to get the participants
                        const participants = matchData.teams || "";
                        const inputnode = [team1Element.querySelector('.score-input'), team2Element.querySelector('.score-input')]
                      
                        // Assuming your overlay object has a method to display information
                        showParticipantsOverlay(participants, inputnode);
                    });
                    matchElement.appendChild(showParticipantsButton);
                }
            }

            // Append the current round or right-side round to the tournament element
            tournamentElement.appendChild(roundElement);
        }
    }
    roundOrder.forEach((roundKey, index) => {
        const gridColumnStart = index + 1; // Adjust the starting column index as needed
        const gridColumnEnd = gridColumnStart + 1; // Adjust the ending column index as needed
        const roundElement = document.querySelector(`.${roundKey}`);
        roundElement.style.gridColumn = `${gridColumnStart} / ${gridColumnEnd}`;
    });

}
async function showParticipantsOverlay(participants, inputnode) {
        // Example overlay object initialization
    const overlay = document.getElementById("Match_Overlay");
    
    overlay.style.display = "block";
    
    // Fetch information for participants from the "Match_information" route
    const participantInfo = await fetchParticipantInfo(participants);
    console.log(participantInfo)



    if(inputnode[0].value > inputnode[1].value){

        updateParticipantUI(overlay.querySelector('.participant'), participantInfo[0]); // First participant

    }else{

        updateParticipantUI(overlay.querySelector('.participant'), participantInfo[1]); // First participant

    }
    // Display participants information in the overlay
}

function updateParticipantUI(participantElement, participantData) {
    if (participantElement) {
        console.log(participantElement)
        // Update the elements by reference
        const imgElement = participantElement.querySelector('img');
        const nameElement = participantElement.querySelector('span');
        
        
        imgElement.src = participantData.image;
        nameElement.textContent = participantData.name;
     
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
async function getCurrentSetup(){
    try{
       
        const response = await fetch('/current_setup');
        const data = await response.json();
        if (response.ok) {
            return data.current_setup;
        } else {
            console.error('Error fetching tournament data:', data.error);
            return {};
        }
    } catch (error) {
        console.error('Error fetching tournament data:', error);
        return {};
    }

    
}
async function Set_current_setup(current_setup){
   

    try{
        const response = await fetch('/set_current_setup', {
            method: 'POST', // Adjust the method as needed
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ current_setup }),
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch participant information: ${response.statusText}`);
        }

        initializeBrackets(current_setup)
        return await response.json();
    } catch (error) {
        console.error(error);
        // Handle the error as needed
    }
    
}
document.addEventListener('DOMContentLoaded', function() {
    const dropdownItems = document.querySelectorAll('.dropdown-item');

    dropdownItems.forEach(function(item) {
        item.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent the default action (e.g., navigating to "#")
            const value = this.getAttribute('data-value');
            console.log(value)
  
            const valueArray = JSON.parse(value);
            Set_current_setup(valueArray); // Call the endpoint with the selected value
        });
    });
});

// Call the function to initialize brackets when the page loads
window.onload = async function(){
  
    let order = await getCurrentSetup()
    console.log(order)
    initializeBrackets(order)
}

