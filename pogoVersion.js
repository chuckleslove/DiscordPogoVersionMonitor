const Discord=require('discord.js');
const bot=new Discord.Client();
const request = require('request');
const config = require('./config.json');

bot.login(config.token);

var version = "";
var message = "";
var lastUpdate = "";


bot.on('ready', () => {
    
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

    if(version != currentVersion && currentVersion != "Version Query Failed" && version != "Version Query Failed")
    {
        messageToSend = "PoGo version FORCED to: "+currentVersion+" from: "+version+" Last updated at: "+lastUpdate+"\n";
        SendVersionForceToWebhooks(version, currentVersion);
        for(var i = 0; i < config.users.length; i++)
        {
            messageToSend += "<@"+config.users[i]+">";
        }        
        await bot.channels.get(config.channel).messages.get(message).delete().catch(console.error);
        await bot.channels.get(config.channel).send(messageToSend).catch(console.error);
        message = "";
        version = currentVersion;
        queryDelay = config.delayAfterForce;
    }
    else if(!message)
    {
        message = await bot.channels.get(config.channel).send(messageToSend).
        catch(console.error);
        message = message.id; 
        version = '0.147.1'   ;
          
    }
    else
    {
        await bot.channels.get(config.channel).messages.get(message).edit(messageToSend).catch(console.error);
    }

    
    
    setTimeout(UpdateLoop,queryDelay);
    return;    
}


async function SendVersionForceToWebhooks(oldVersion, newVersion)
{

    let webhookMessage = {};
    
    webhookMessage.embeds = [{title:"VERSION FORCED",fields:[{name:"Old Version",value:oldVersion,inline:true},{name:"New Version",value:newVersion,inline:true}]}];

    for(let i = 0; i < config.webhooks.length; i++)
    {
        
        let hook = new Discord.WebhookClient(config.webhooks[i].id,config.webhooks[i].token);

        await hook.send(webhookMessage).catch(console.error);

        if(config.webhooks[i].role)
        {
            let role = config.webhooks[i].role;
            if(role != "everyone" && role != "here")
            {
                role = "<@&"+role+">";
            }
            else
            {
                role = "@"+role;
            }
            let content = "Version forced! "+role;            
            await hook.send(content).catch(console.error);
        }
    }    

}