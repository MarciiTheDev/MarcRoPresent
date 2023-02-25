if (!require('./config.json').roblosecurityToken) {
    console.log('Please enter your .ROBLOSECURITY Cookie in config.json');
    process.exit(1);
}

var request = require('request');
const client = require('./discord-rich-presence')('1079100772920332449');

var lastResponse = {};

var userId = null;

request.get("https://users.roblox.com/v1/users/authenticated", { headers: { Cookie: ".ROBLOSECURITY=" + require('./config.json').roblosecurityToken }},
function(err, res, body) {
    if(err) throw err;
    if(res.statusCode != 200) throw new Error("Invalid .ROBLOSECURITY Cookie");
    userId = JSON.parse(body).id;
    getPresence();
});

function getImage(uId) {
    return new Promise((resolve, reject) => {
        request.get("https://thumbnails.roblox.com/v1/games/icons?universeIds="+uId+"&size=512x512&format=Png", {}, function(err, res, body) {
            var image = JSON.parse(body).data;
            if(!image || !image[0] || !image[0].imageUrl) {resolve('rbx_defaulticon'+(Math.random()*4+1).toString().split(".")[0]); return};
            resolve(image[0].imageUrl);
        })
    });
}

function getPresence() {
    request.post("https://presence.roblox.com/v1/presence/users", { json: true, body: {"userIds": [userId]}, headers: { Cookie: ".ROBLOSECURITY=" + require('./config.json').roblosecurityToken }},
    async function (error, response, body) {
        console.log(body);
        if (error) return;
        if (response.statusCode != 200) return;
        var presence = body.userPresences[0];
        if(JSON.stringify(lastResponse) == JSON.stringify(presence)) return;
        var type = presence.userPresenceType;
        var universeId = presence.universeId;
        switch (type) {
            case 1:
                if(!require('./config.json').website) { client.updatePresence(); break }
                else client.updatePresence({
                    details: 'Browsing',
                    state: presence.lastLocation,
                    largeImageKey: 'rbx',
                    startTimestamp: Date.now(),
                    instance: true
                })
                break;
            case 2:
                if(!require('./config.json').player) { client.updatePresence(); break }
                else client.updatePresence({
                    details: 'Playing',
                    state: presence.lastLocation,
                    largeImageKey: await getImage(universeId),
                    smallImageKey: 'rbx',
                    startTimestamp: Date.now(),
                    instance: true
                })
                break;
            case 3:
                if(!require('./config.json').studio) { client.updatePresence(); break }
                else client.updatePresence({
                    details: 'In Studio (Developing)',
                    state: presence.lastLocation,
                    largeImageKey: await getImage(universeId),
                    smallImageKey: 'rbx_studio',
                    startTimestamp: Date.now(),
                    instance: true
                });
                break;
            case 0:
                client.updatePresence();
                break;
        }
        lastResponse = presence;
    });
    setTimeout(getPresence, 10000);
}