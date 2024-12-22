let playersData = {};
let previousPoints = {
    karl: null,
    matt: null
};

const leagueId = '1124846398970298368';
const matchupsURL = `https://api.sleeper.app/v1/league/${leagueId}/matchups/16`; 
const season = 2024;
const leagueURL = `https://api.sleeper.app/v1/league/${leagueId}`;
const rostersURL = `https://api.sleeper.app/v1/league/${leagueId}/rosters`;
const usersURL = `https://api.sleeper.app/v1/league/${leagueId}/users`;
const diff = 9.44;
const karl = "873581177716563968";
const matt = "992120789191192576";
const karlRosterId = 2;
const mattRosterId = 4;

async function loadPlayersData() {
    try {
        const response = await fetch('players.json'); 
        if (!response.ok) {
            throw new Error('Failed to load players data');
        }
        playersData = await response.json();
    } catch (error) {
        console.error("Error loading players data:", error);
        showErrorModal();  
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

function checkPointsChangeAndTriggerConfetti(karlPoints, mattPoints) {
    // Only check if we have previous points to compare against
    if (previousPoints.karl !== null && previousPoints.matt !== null) {
        if (karlPoints !== previousPoints.karl || mattPoints !== previousPoints.matt) {
            triggerConfetti();
        }
    }
    
    // Update previous points
    previousPoints.karl = karlPoints;
    previousPoints.matt = mattPoints;
}

function triggerConfetti() {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    });
}

async function loadMatchupData() {
    try {
        const response = await fetch(matchupsURL);
        const data = await response.json();

        const karlTeamData = data.find(item => item.roster_id === karlRosterId);
        const mattTeamData = data.find(item => item.roster_id === mattRosterId);
        console.log(karlTeamData);

        if (!karlTeamData || !mattTeamData) {
            throw new Error("Failed to find both teams");
        }

        const matchupContainer = document.getElementById('matchupContainer');
        matchupContainer.innerHTML = ''; 

        const karlTotalPoints = renderTeam(karlTeamData, 'Karl');
        const mattTotalPoints = renderTeam(mattTeamData, 'Matt');

        let karlPoints = karlTeamData.points - diff;

        // Check for points change and trigger confetti if needed
        checkPointsChangeAndTriggerConfetti(karlPoints, mattTeamData.points);

        let matchDiff = karlPoints - mattTeamData.points;

        if (karlPoints > mattTeamData.points) {
            document.querySelector('.Matt-color').style.cssText = ' background-color: rgba(255, 0, 10, .3);';
            document.querySelector('.Karl-color').style.cssText = ' background-color: rgba(0, 255, 190, .3);';
        } else if (karlPoints < mattTeamData.points) {
            document.querySelector('.Matt-color').style.cssText = ' background-color: rgba(0, 255, 190, .3);';
            document.querySelector('.Karl-color').style.cssText = ' background-color: rgba(255, 0, 10, .3);';
        } else {
            document.querySelector('.Matt-color').style.cssText = ' background-color: unset;';
            document.querySelector('.Karl-color').style.cssText = ' background-color: unset;';
        }

        const totalPointsDiv = document.createElement('div');
        totalPointsDiv.classList.add('total-points');
        totalPointsDiv.textContent = `Karl : ${karlPoints.toFixed(2)} / ${mattTeamData.points.toFixed(2)}: Matt `;
        matchupContainer.appendChild(totalPointsDiv);

    } catch (error) {
        console.error("Error fetching team data:", error);
        showErrorModal();  
    }
}

function getProgressColor(points) {
    const percentage = points * 5; 
    
    if (percentage <= 25) {
        return '#ff0000'; 
    } else if (percentage <= 50) {
        return '#ffff00'; 
    } else if (percentage <= 75) {
        return '#adff2f'; 
    } else {
        return '#00ff00'; 
    }
}

function getProgressScale(points) {
    return Math.min(points * 0.05, 1); 
}

function renderTeam(teamData, teamName) {
    const teamDiv = document.createElement('div');
    teamDiv.classList.add(`team`);
    teamDiv.classList.add(`${teamName}-color`);
    teamDiv.innerHTML = `<h2>${teamName}</h2>`;

    const starters = teamData.starters || [];
    const starterPoints = teamData.starters_points || [];

    const playerInfo = starters.map(starterId => {
        const player = playersData[starterId];
        if (player) {
            return {
                name: player.full_name,
                team: player.team,
                position: player.position,
                id: player.player_id
            };
        }
        return null;
    }).filter(info => info !== null);

    let totalPoints = 0;

    const playersListDiv = document.createElement('div');
    playerInfo.forEach((player, index) => {
        const playerDiv = document.createElement('div');
        playerDiv.classList.add('player');
        
        const progressBar = document.createElement('div');
        progressBar.classList.add('progress-bar');
        const points = starterPoints[index];
        
        progressBar.style.transform = `scaleX(${getProgressScale(points)})`;
        progressBar.style.backgroundColor = getProgressColor(points);
        
        playerDiv.innerHTML = `
            <img style="object-fit:cover;height:50px;width:50px;border-radius:50%;" src="https://sleepercdn.com/content/nfl/players/${player.id}.jpg">
            <span>${player.name} - (${player.team})</span>
            <span>${player.position}</span>
            <span class="points">${points}</span>
        `;
        
        playerDiv.insertBefore(progressBar, playerDiv.firstChild);
        playersListDiv.appendChild(playerDiv);
        totalPoints += points;
    });

    teamDiv.appendChild(playersListDiv);
    document.getElementById('matchupContainer').appendChild(teamDiv);
    return totalPoints;
}

function showErrorModal() {
    const modal = document.getElementById('errorModal');
    modal.style.display = 'block';  
}

document.addEventListener('DOMContentLoaded', () => {
    loadPlayersData().then(() => {
        loadMatchupData();
        
        updateCountdown();
        setInterval(updateCountdown, 1000);
       
        setInterval(loadMatchupData, 10000);
    });
});

document.getElementById('closeModal').addEventListener('click', () => {
    const modal = document.getElementById('errorModal');
    modal.style.display = 'none'; 
});

document.getElementById('refreshBtn').addEventListener('click', () => {
    location.reload(); 
});