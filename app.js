const express = require("express");

const app = express();

const sqlite3 = require("sqlite3");

const { open } = require("sqlite");

let db = null;

app.use(express.json());

const path = require("path");

const dbPath = path.join(__dirname, "cricketMatchDetails.db");

const initializeDBandServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000");
    });
  } catch (error) {
    console.log(`DB error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBandServer();

const convertingDBObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
  };
};

app.get("/players/", async (request, response) => {
  const getAllPlayers = `
    SELECT * 
    FROM player_details
   ;`;

  const playerList = await db.all(getAllPlayers);
  response.send(
    playerList.map((player) => {
      return convertingDBObjectToResponseObject(player);
    })
  );
});

const convertingDBObjectToResponseObject2 = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
  };
};

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getAllPlayers = `
    SELECT * 
    FROM player_details
    WHERE player_id = ${playerId};`;

  const playerList = await db.get(getAllPlayers);
  response.send(convertingDBObjectToResponseObject2(playerList));
});

const convertingDBObjectToResponseObject3 = (dbObject) => {
  return {
    playerName: dbObject.player_name,
  };
};

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName } = playerDetails;
  const getUpdatedPlayer = `
    UPDATE player_details 
    SET player_name = '${playerName}'
    WHERE player_id = ${playerId};`;

  const updatedPlayer = await db.get(getUpdatedPlayer);
  response.send("Player Details Updated");
});

const convertingDBObjectToResponseObject4 = (dbObject) => {
  return {
    matchId: dbObject.match_id,
    match: dbObject.match,
    year: dbObject.year,
  };
};

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchDetails = `
    SELECT * 
    FROM match_details
    WHERE match_id	 = ${matchId};`;

  const matchDetails = await db.get(getMatchDetails);
  response.send(convertingDBObjectToResponseObject4(matchDetails));
});

const convertingDBObjectToResponseObject5 = (dbObject) => {
  return {
    matchId: dbObject.match_id,
    match: dbObject.match,
    year: dbObject.year,
  };
};

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerMatchDetails = `
    SELECT * 
    FROM player_match_score NATURAL JOIN match_details
    WHERE player_id	 = ${playerId};`;

  const matchDetails = await db.all(getPlayerMatchDetails);
  response.send(
    matchDetails.map((player) => {
      return convertingDBObjectToResponseObject5(player);
    })
  );
});

const convertingDBObjectToResponseObject6 = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
  };
};

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getPlayerMatchDetails = `
    SELECT *
    FROM player_match_score NATURAL JOIN player_details
    WHERE match_id = ${matchId};`;

  const matchDetails = await db.all(getPlayerMatchDetails);
  response.send(
    matchDetails.map((player) => {
      return convertingDBObjectToResponseObject6(player);
    })
  );
});

app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerMatchDetails = `
    SELECT player_id AS playerId,
    player_name AS playerName,
    SUM(score) AS totalScore,
    SUM(fours) AS totalFours,
    SUM(sixes) AS totalSixes
    FROM player_match_score NATURAL JOIN player_details
    WHERE player_id = ${playerId};`;

  const matchDetails = await db.get(getPlayerMatchDetails);
  response.send(matchDetails);
});

module.exports = app;
