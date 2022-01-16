/*

created by huda0209
MessageTransfar2 for discord bot 

main.js
 
ran by node.js

2022-1-15

*/
'use strict'

//node.js modules
const fs = require('fs');
const discord = require("discord.js");
require('date-utils');

//module
const commandHandler = require('./src/command/command-handler.js');

//other 
const client = new discord.Client({intents: ["GUILDS", "GUILD_MESSAGES","DIRECT_MESSAGES"], partials: ["USER", "MESSAGE", "CHANNEL"]});
const logger = require('./src/util/logFile');
const config = require('./src/util/config');

logger.info(`This service is standing now...`);
process.on("exit", ()=>{
	client.destroy();
    logger.info(`service end.`);
    logger.hasLastLog();
    console.log("Exitting...");
});
process.on("SIGINT", ()=>{
    process.exit(0);
});

//config
config.exist(true);
const BOT_DATA = config.loadConfig("setting.json");
let guildData = config.loadConfig("guildData.json");


//start the bot
client.on("ready", message => {
	logger.info(`bot is ready! ver. ${BOT_DATA.VERSION} \n        login: {cyan}${client.user.tag}{reset}\n`);
  	client.user.setActivity(`${BOT_DATA.PREFIX}${BOT_DATA.COMMAND} helpでヘルプを表示 ver. ${require("./package.json").version}`, { type: 'PLAYING' });
});

//message event
client.on("messageCreate", async message => {
  	if (message.content.startsWith(BOT_DATA.PREFIX)){
    	const [command, ...args] = message.content.slice(BOT_DATA.PREFIX.length).split(' ');   
      	commandHandler.commandHandler([command, ...args],message,guildData,BOT_DATA,client)
  	};
})

let token;
if(process.argv.length == 3){
  	switch(process.argv[2]){
  	  	case "main" :
  	    	token = BOT_DATA.MAIN_TOKEN;
  	    	break;
  	  	case "div" :
  	    	if(!BOT_DATA.DIV_TOKEN){
				logger.error(`Don't have a property "{red}DIV_TOKEN{reset}" in {green}setting.json{reset}.`);
				process.exit(0);
			}
  	    	token = BOT_DATA.DIV_TOKEN;
  	    	BOT_DATA.VERSION = `dev(${BOT_DATA.VERSION})`;
  	    	break;
  	  	default :
  	    	logger.error(`Unknown command. \nUsage \n {green}node main.js main{reset} : use main token \n {green}node main.js div{reset} : use divelopment token`);
  	    	process.exit(0);
  	};
}else if(process.argv.length == 2){
	token = BOT_DATA.MAIN_TOKEN;
}else{
	logger.error(`Unknown command. \nUsage \n {green}node main.js main{reset} : use main token \n {green}node main.js div{reset} : use divelopment token`);
	process.exit(0);
}
client.login(token)
	.then(res=>{
		logger.info(`Succeed to login the discord service.`);
	})
	.catch(error=>{
		logger.error(`Could not login the discord service.\n${error}`);
	});