const Discord=require('discord.js');
const bot=new Discord.Client();
const request = require('request');
const config = require('./config.json');

bot.login(config.token);

var version = "";
var message = "";
var lastUpdate = "";

//convert hours to milliseconds, default is check every 24 hours
const newMessageTimeout = config.newMessageTimer ? config.newMessageTimer * 60 * 60 * 1000 : 86400000;

setInterval(function()  {
    if(!config.newMessageTimer) { return; }

    message = "";
    console.log("message cleared");
    return;

},newMessageTimeout);

bot.on('ready', () => {
    console.log("New Message Timeout: "+newMessageTimeout);
    return UpdateLoop();    
});

function VersionQuery()
{
    return new Promise(function(resolve) {
        request('https://pgorelease.nianticlabs.com/plfe/version', function(error, response, body) {

            if(response.statusCode != 200)
            {
                return resolve("Version Query Failed");
            }        
            lastUpdate = new Date().toLocaleTimeString();
            return resolve(body.slice(2));
        });
    });
}

async function UpdateLoop()
{
    currentVersion = await VersionQuery();
    let queryDelay = config.queryDelay;

    if(!version) { version = currentVersion; }

    let messageToSend = "Current PoGo forced version is: "+version+" Last updated at: "+lastUpdate;

    if(version != currentVersion)
    {
        messageToSend = "PoGo version FORCED to: "+currentVersion+" from: "+version+" Last updated at: "+lastUpdate+"\n";
        for(var i = 0; i < config.users.length; i++)
        {
            messageToSend += "<@"+config.users[i]+">";
        }
        message = "";
        version = currentVersion;
        queryDelay = config.delayAfterForce;
    }

    if(!message)
    {
        message = await bot.channels.get(config.channel).send(messageToSend).
        catch(console.error);
        message = message.id;        
    }
    else
    {
        await bot.channels.get(config.channel).messages.get(message).edit(messageToSend).catch(console.error);
    }
    
    setTimeout(UpdateLoop,queryDelay);
    return;    
}
