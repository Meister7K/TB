let playersData = {};  // Store player data

// Load players data from the JSON file
async function loadPlayersData() {
    try {
        const response = await fetch('players.json');  // Adjust the path if needed
        if (!response.ok) {
            throw new Error('Failed to load players data');
        }
        playersData = await response.json();
    } catch (error) {
        console.error("Error loading players data:", error);
        showErrorModal();  // Show the error modal
    }
}

function updateCountdown() {
    const deadline = new Date('2024-12-23T23:00:00-07:00');
    const now = new Date();
    const difference = deadline - now;

    if (difference <= 0) {
        document.getElementById('countdown').innerHTML = '<div class="timer-value">Ball Game!</div>';
        return;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((difference / 1000 / 60) % 60);
    const seconds = Math.floor((difference / 1000) % 60);

    document.getElementById('countdown').innerHTML = `
        <div>Time Remaining</div>
        <div class="timer-value">
            ${days}d ${hours}h ${minutes}m ${seconds}s
        </div>
    `;
}

function triggerConfetti() {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    });
}

// Sleeper API URL for matchups
const leagueId = '1124846398970298368';
const matchupsURL = `https://api.sleeper.app/v1/league/${leagueId}/matchups/16`;  // Adjust matchup ID if needed

// const leagueId= 1124846398970298368

const season = 2024

const leagueURL = `https://api.sleeper.app/v1/league/${leagueId}`

const rostersURL = `https://api.sleeper.app/v1/league/${leagueId}/rosters`

const usersURL = `https://api.sleeper.app/v1/league/${leagueId}/users`

// let matchupsURL = `https://api.sleeper.app/v1/league/1124846398970298368/matchups/16`

const diff = 9.44

const karl = "873581177716563968" //1
const matt = "992120789191192576" //3
// Team identifiers (for Karl and Matt)
const karlRosterId = 2;
const mattRosterId = 4;

// Load matchups data when the page is loaded
document.addEventListener('DOMContentLoaded', () => {
    loadPlayersData().then(() => {
        // Load matchups after players data is loaded
        loadMatchupData();
        triggerConfetti();

        updateCountdown();
        setInterval(updateCountdown, 1000);
        // Reload every 30 seconds
        setInterval(loadMatchupData, 30000);
    });
});

// Load and process matchup data
async function loadMatchupData() {
    try {
        // Fetching matchup data from the Sleeper API
        const response = await fetch(matchupsURL);
        const data = await response.json();

        // Find the team data for Karl and Matt using their roster IDs
        const karlTeamData = data.find(item => item.roster_id === karlRosterId);
        const mattTeamData = data.find(item => item.roster_id === mattRosterId);
console.log(karlTeamData)
        // Ensure both teams are found
        if (!karlTeamData || !mattTeamData) {
            throw new Error("Failed to find both teams");
        }

        // Populate the matchup container with team data
        const matchupContainer = document.getElementById('matchupContainer');
        matchupContainer.innerHTML = '';  // Clear previous matchup data

        // Render Karl and Matt's teams
        const karlTotalPoints = renderTeam(karlTeamData, 'Karl');
        const mattTotalPoints = renderTeam(mattTeamData, 'Matt');

       

        let karlPoints = karlTeamData.points - diff

        let matchDiff = karlPoints -mattTeamData.points;

        if(karlPoints > mattTeamData.points){
            document.querySelector('.Matt-color').style.cssText = ' background-color: rgba(255, 0, 10, .3);';
            document.querySelector('.Karl-color').style.cssText = ' background-color: rgba(0, 255, 190, .3);';
        }else if(karlPoints < mattTeamData.points){
                document.querySelector('.Matt-color').style.cssText = ' background-color: rgba(0, 255, 190, .3);';
                document.querySelector('.Karl-color').style.cssText = ' background-color: rgba(255, 0, 10, .3);';
            }else{
                document.querySelector('.Matt-color').style.cssText = ' background-color: unset;';
                document.querySelector('.Karl-color').style.cssText = ' background-color: unset;';
            }
        // Add total points at the bottom of the matchup
        const totalPointsDiv = document.createElement('div');
        totalPointsDiv.classList.add('total-points');
        totalPointsDiv.textContent = `Karl : ${karlPoints} / ${mattTeamData.points}: Matt `;
        matchupContainer.appendChild(totalPointsDiv);

        // const diffDiv = document.createElement('div');
        // diffDiv.classList.add('diff-points');
        // diffDiv.textContent = `Diff:${matchDiff}`;
        // matchupContainer.appendChild(diffDiv);

    } catch (error) {
        console.error("Error fetching team data:", error);
        showErrorModal();  // Show the error modal
    }
}

// Render a team's data into the matchup
function renderTeam(teamData, teamName) {
    const teamDiv = document.createElement('div');
    teamDiv.classList.add(`team`);
    teamDiv.classList.add(`${teamName}-color`);
    teamDiv.innerHTML = `<h2>${teamName}</h2>`;

    const starters = teamData.starters || [];
    const starterPoints = teamData.starters_points || [];
    console.log(starterPoints)

    // Map starter IDs to player names using the `playersData` object
    const playerInfo = starters.map(starterId => {
        const player = playersData[starterId];
        if (player) {
            return {
                name: player.full_name,
                team: player.team,
                position: player.position,
                id:player.player_id
            };
        }
        return null;
    }).filter(info => info !== null);  // Filter out null entries

    let totalPoints = 0;


  
    // Create a container for players
    const playersListDiv = document.createElement('div');
    playerInfo.forEach((player, index) => {
        const playerDiv = document.createElement('div');
        playerDiv.classList.add('player');
        playerDiv.innerHTML = `<img style="object-fit:cover;height:50px;width:50px;border-radius:50%;" src="https://sleepercdn.com/content/nfl/players/${player.id}.jpg">
            <span>${player.name} - (${player.team})</span>
            <span>${player.position}</span>
            <span class="points">${starterPoints[index]}</span>
        `;
        playersListDiv.appendChild(playerDiv);
        totalPoints += starterPoints[index];  // Sum up points for total points
    });

    teamDiv.appendChild(playersListDiv);
    document.getElementById('matchupContainer').appendChild(teamDiv);
    return totalPoints;

   
    
    
}


// Show the error modal
function showErrorModal() {
    const modal = document.getElementById('errorModal');
    modal.style.display = 'block';  // Show the modal
}

// Close the error modal
document.getElementById('closeModal').addEventListener('click', () => {
    const modal = document.getElementById('errorModal');
    modal.style.display = 'none';  // Hide the modal
});

// Refresh the page when the refresh button is clicked
document.getElementById('refreshBtn').addEventListener('click', () => {
    location.reload();  // Reload the page
});
