const request = require('request');
const fs = require('fs');
const { default: SysTray } = require('systray');
var client = require('./discord-rich-presence')('1079100772920332449');

const bgProcess = new SysTray({
    menu: {
        icon: fs.readFileSync(__dirname+'/assets/MarcRoPresent.ico', "base64"),
        tooltip: "Tips",
        items: [{
            title: 'Reload',
            tooltip: 'Reload MarcRoPresent',
            checked: false,
            enabled: true
        },{
            title: 'Exit',
            tooltip: 'Exit MarcRoPresent',
            checked: false,
            enabled: true
        }]
    },
    debug: false,
    copyDir: true
});

var config = {}
var lastResponse = {};
var userId = null;
var active = [];

function loadConfig() {
    try {
        fs.readFile(process.cwd()+"/config.json", (err, data) => {
            if(err) throw err;
            config = JSON.parse(data);
            console.log("HI2")
            if(!config.roblosecurityToken) throw new Error("lease enter your .ROBLOSECURITY Cookie in config.json");
        })
    } catch(e) {
        throw new Error('Please create a config.json file in the same directory as this file');
    }
}

async function setup() {
    try {
        await fs.readFile(process.cwd()+"/config.json", (err, data) => {
            if(err) throw err;
            config = JSON.parse(data);
            if(!config.roblosecurityToken) throw new Error("Please enter your .ROBLOSECURITY Cookie in config.json");
            request.get("https://users.roblox.com/v1/users/authenticated", { headers: { Cookie: ".ROBLOSECURITY=" + config.roblosecurityToken }},
            function(err, res, body) {
                if(err) throw err;
                if(res.statusCode != 200) throw new Error("Invalid .ROBLOSECURITY Cookie");
                userId = JSON.parse(body).id;
                getPresence();
            });
        })
    } catch(e) {
        throw new Error(e);
    }
}

setup();

bgProcess.onClick(action => {
    if(action.item.title == 'Exit') {bgProcess.kill(); process.exit(0)};
    if(action.item.title == 'Reload') {lastResponse = {}; setup(); active = [];};
})

function authenticate() {
    console.log("HI")
}

function getImage(uId) {
    return new Promise((resolve, reject) => {
        request.get("https://thumbnails.roblox.com/v1/games/icons?universeIds="+uId+"&size=512x512&format=Png", {}, function(err, res, body) {
            var image = JSON.parse(body).data;
            if(!image || !image[0] || !image[0].imageUrl) {resolve('rbx_defaulticon'+(Math.random()*4+1).toString().split(".")[0]); return};
            resolve(image[0].imageUrl);
        })
    });
}

async function getPresence(id) {
    if(!id) {
        id = Date.now()
        active.push(id);
    }
    if(active.find(x => x == id) != id) return;
    console.log("Connected to Discord: "+(await client).__connected)
    if((await client).__connected) {
        request.post("https://presence.roblox.com/v1/presence/users", { json: true, body: {"userIds": [userId]}, headers: { Cookie: ".ROBLOSECURITY=" + config.roblosecurityToken }},
        async function (error, response, body) {
            console.log(body);
            if (error) return;
            if (response.statusCode != 200) return;
            var presence = body.userPresences[0];
            if(lastResponse.userPresenceType == presence.userPresenceType && lastResponse.lastLocation == presence.lastLocation && lastResponse.universeId == presence.universeId) return;
            var type = presence.userPresenceType;
            var universeId = presence.universeId;
            switch (type) {
                case 1:
                    if(!config.website) { (await client).updatePresence(); break }
                    else (await client).updatePresence({
                        details: 'Browsing',
                        state: presence.lastLocation,
                        largeImageKey: 'rbx',
                        startTimestamp: Date.now(),
                        instance: true
                    })
                    break;
                case 2:
                    if(!config.player) { (await client).updatePresence(); break }
                    else (await client).updatePresence({
                        details: 'Playing',
                        state: presence.lastLocation,
                        largeImageKey: await getImage(universeId),
                        smallImageKey: 'rbx',
                        startTimestamp: Date.now(),
                        instance: true
                    })
                    break;
                case 3:
                    if(!config.studio) { (await client).updatePresence(); break }
                    else (await client).updatePresence({
                        details: 'In Studio (Developing)',
                        state: presence.lastLocation,
                        largeImageKey: await getImage(universeId),
                        smallImageKey: 'rbx_studio',
                        startTimestamp: Date.now(),
                        instance: true
                    });
                    break;
                case 0:
                    (await client).updatePresence();
                    break;
            }
            lastResponse = presence;
        });
    }
    setTimeout(() => {
        getPresence(id);
    }, 10000);
}