/*

created by huda0209
MessageTransfar2 for discord bot 

ran by node.js

2022-1-15

*/

"use strict"

const logger = require('../util/logger');
const admin = require('./admin/admin.js');
const msgTransfar = require('./messageTransfar');
const embedContent = require("../util/embed");


async function commandHandler([command, ...args],message,guildData,BOT_DATA,client){
    switch(command.toLowerCase()){
        case BOT_DATA.COMMAND :
            if(!(message.author.id == message.guild.ownerId || guildData.Admin.indexOf(message.author.id)>-1)) break;
            AdminCommandHandler([command, ...args],message,guildData,BOT_DATA,client);
            break;
      };
}


async function AdminCommandHandler([command, ...args],message,guildData,BOT_DATA,client){
    if(args.length==0) return;
    switch(args[0].toLowerCase()){
        case "admin" :
            admin.adminManager([command, ...args],message,guildData,BOT_DATA,client);
            break;

        case "run" :
            msgTransfar.run([command, ...args],message,guildData,BOT_DATA,client);
            break;
    
        case "stop" :
            logger.info(`server was stoped by {cyan}${message.author.tag}`);
            await message.delete();
            client.destroy();
            process.exit(0);
        
        case "help" :
            message.channel.send({embeds:[embedContent.info(`**移行するメッセージのあるチャンネル(若しくはスレッド)で下記のコマンドを入力**\n・チャンネルorスレッド → チャンネル\n\`${BOT_DATA.PREFIX}${BOT_DATA.COMMAND} run <移行する最初のメッセージのid> <移行先のチャンネルid> <移行するメッセージ数>\`\n\n・チャンネルorスレッド → スレッド\n\`${BOT_DATA.PREFIX}${BOT_DATA.COMMAND} run <移行する最初のメッセージのid> <移行先のスレッドがあるチャンネルid>:<移行先のスレッドid> <移行するメッセージ数>\``)]})
            break;

        default:
            message.reply(`Unknown command.`);
            break;
      };
}

exports.commandHandler = commandHandler