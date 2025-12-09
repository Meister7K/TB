let playersData = {};
let previousPoints = {
    userOne: null,
    userTwo: null
};

const leagueId = '1257435848459173888';
const loserBracket = `https://api.sleeper.app/v1/league/${leagueId}/losers_bracket`
const week_15 = `https://api.sleeper.app/v1/league/${leagueId}/matchups/15`;
const week_16 = `https://api.sleeper.app/v1/league/${leagueId}/matchups/16`; 

const season = 2024;
const leagueURL = `https://api.sleeper.app/v1/league/${leagueId}`;
const rostersURL = `https://api.sleeper.app/v1/league/${leagueId}/rosters`;
const usersURL = `https://api.sleeper.app/v1/league/${leagueId}/users`;
const diff = 0;
const userOne = "863476197265354752";
const userTwo = "861336657507532800";
const userOneRosterId = 3;
const userTwoRosterId = 4;

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
    const deadline = new Date('2025-12-23T06:00:00Z');
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

function checkPointsChangeAndTriggerConfetti(userOnePoints, userTwoPoints) {
    // Only check if we have previous points to compare against
    if (previousPoints.userOne !== null && previousPoints.userTwo !== null) {
        if (userOnePoints !== previousPoints.userOne || userTwoPoints !== previousPoints.userTwo) {
            triggerConfetti();
        }
    }
    
    // Update previous points
    previousPoints.userOne = userOnePoints;
    previousPoints.userTwo = userTwoPoints;
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
        const [week15Response, week16Response] = await Promise.all([
            fetch(week_15),
            fetch(week_16)
        ]);
        
        const week15Data = await week15Response.json();
        const week16Data = await week16Response.json();

        const userOneWeek15 = week15Data.find(item => item.roster_id === userOneRosterId);
        const userTwoWeek15 = week15Data.find(item => item.roster_id === userTwoRosterId);
        const userOneWeek16 = week16Data.find(item => item.roster_id === userOneRosterId);
        const userTwoWeek16 = week16Data.find(item => item.roster_id === userTwoRosterId);

        if (!userOneWeek15 || !userTwoWeek15 || !userOneWeek16 || !userTwoWeek16) {
            throw new Error("Failed to find both teams for both weeks");
        }

        const matchupContainer = document.getElementById('matchupContainer');
        matchupContainer.innerHTML = ''; 

        renderTeam(userOneWeek15, userOneWeek16, 'Evan_Hink');
        renderTeam(userTwoWeek15, userTwoWeek16, 'Matt_Springer');

        let userOnePoints = (userOneWeek15.points + userOneWeek16.points) - diff;
        let userTwoPoints = userTwoWeek15.points + userTwoWeek16.points;

        checkPointsChangeAndTriggerConfetti(userOnePoints, userTwoPoints);

        if (userOnePoints > userTwoPoints) {
            document.querySelector('.userTwo-color').style.cssText = ' background-color: rgba(255, 0, 10, .3);';
            document.querySelector('.userOne-color').style.cssText = ' background-color: rgba(0, 255, 190, .3);';
        } else if (userOnePoints < userTwoPoints) {
            document.querySelector('.userTwo-color').style.cssText = ' background-color: rgba(0, 255, 190, .3);';
            document.querySelector('.userOne-color').style.cssText = ' background-color: rgba(255, 0, 10, .3);';
        } else {
            document.querySelector('.userTwo-color').style.cssText = ' background-color: unset;';
            document.querySelector('.userOne-color').style.cssText = ' background-color: unset;';
        }

        const totalPointsDiv = document.createElement('div');
        totalPointsDiv.classList.add('total-points');
        totalPointsDiv.textContent = `userOne : ${userOnePoints.toFixed(2)} / ${userTwoPoints.toFixed(2)}: userTwo `;
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

function renderWeekPlayers(weekData, weekNumber) {
    const starters = weekData.starters || [];
    const starterPoints = weekData.starters_points || [];
    
    const weekDiv = document.createElement('div');
    weekDiv.innerHTML = `<h3>Week ${weekNumber} (${weekData.points.toFixed(2)})</h3>`;
    
    const playersListDiv = document.createElement('div');
    starters.forEach((playerId, index) => {
        const player = playersData[playerId];
        if (!player) return;
        
        const points = starterPoints[index] || 0;
        const playerDiv = document.createElement('div');
        playerDiv.classList.add('player');
        
        const progressBar = document.createElement('div');
        progressBar.classList.add('progress-bar');
        progressBar.style.transform = `scaleX(${getProgressScale(points)})`;
        progressBar.style.backgroundColor = getProgressColor(points);
        
        playerDiv.innerHTML = `
            <img style="object-fit:cover;height:50px;width:50px;border-radius:50%;" src="https://sleepercdn.com/content/nfl/players/${player.player_id}.jpg">
            <span>${player.full_name} - (${player.team})</span>
            <span>${player.position}</span>
            <span class="points">${points.toFixed(2)}</span>
        `;
        
        playerDiv.insertBefore(progressBar, playerDiv.firstChild);
        playersListDiv.appendChild(playerDiv);
    });
    
    weekDiv.appendChild(playersListDiv);
    return weekDiv;
}

function renderTeam(week15Data, week16Data, teamName) {
    const teamDiv = document.createElement('div');
    teamDiv.classList.add(`team`);
    teamDiv.classList.add(`${teamName}-color`);
    
    const week15Points = week15Data.points || 0;
    const week16Points = week16Data.points || 0;
    const totalTeamPoints = week15Points + week16Points;
    
    teamDiv.innerHTML = `<h2>${teamName} - Total: ${totalTeamPoints.toFixed(2)}</h2>`;
    
    teamDiv.appendChild(renderWeekPlayers(week15Data, 15));
    teamDiv.appendChild(renderWeekPlayers(week16Data, 16));
    
    document.getElementById('matchupContainer').appendChild(teamDiv);
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