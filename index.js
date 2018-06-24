// CHANGE THESE
const playerID = ""; //PID from https://wiimmfi.de/game/acrossingwii/
const discordID = ""; //Discord application ID

// MAYBE CHANGE THIS
const updateTime = 20; // in seconds

// DON'T CHANGE BELOW HERE
const request = require("request");
const url = `https://wiimmfi.de/game/acrossingwii/text`;
const DiscordRPC = require("discord-rpc");
const rpc = new DiscordRPC.Client({
	transport: "ipc"
});
const fs = require("fs");

rpc.login(discordID).catch(console.error);

var startTimestamp = 0;
		
var currentMode = -1;

var friendCode = "";

let getData = () => {
	request(url, (err, data) => {
		
		var lines = data.body.split("\n");
		
		var host = "";
		
		var connected = false;
		
		var numberOfPlayers  = lines.length - 1;
		for (var i = 1; i <= numberOfPlayers; i++) {
			var currentLine = lines[i].split("|");
			//console.log(currentLine[2])
			if(currentLine[2] == playerID){
				friendCode = currentLine[3];
				host = currentLine[4];
				connected = true;
			}
		}
		
		if(connected){
			if(host == "2"){
				if(currentMode != 0){
					startTimestamp = new Date();
				}
				currentMode = 0;
				townType = "my town";
			}else if(host == "1"){
				if(currentMode != 1){
					startTimestamp = new Date();
				}
				currentMode = 1;
				townType = "someone else's town"
			}else{
				if(currentMode != 2){
					startTimestamp = new Date();
				}
				currentMode = 2;
				townType = "a mysterious place"
			}
			rpc.setActivity({
				details: `${friendCode}`,
				state: `Online in ${townType}`,
				startTimestamp,
				largeImageKey: "accf_large",
				largeImageText: "Animal Crossing City Folk",
				smallImageKey: "wiimmfi_small",
				smallImageText: `Wiimmfi`,
				instance: false
			});
		}else{
			if(currentMode != 3){
				startTimestamp = new Date();
			}
			currentMode = 3;
			rpc.setActivity({
			details: `${friendCode == "" ? "Friend code currently unavailable" : friendCode}`,
				state: `Offline`,
				startTimestamp,
				largeImageKey: "accf_large",
				largeImageText: "Animal Crossing City Folk",
				smallImageKey: "wiimmfi_small",
				smallImageText: `Wiimmfi`,
				instance: false
			});
		}

		console.log("Updated activity!");
	});
};

rpc.on("ready", () => {
	console.log(`Connected to discord with id ${discordID}`);
	getData();

	setInterval(getData, 1000 * updateTime);
});
