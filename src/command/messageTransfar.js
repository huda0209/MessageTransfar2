/*

created by huda0209
MessageTransfar2 for discord bot 

ran by node.js

2022-1-15

*/
"use strict"
const Discord = require('discord.js');
const fetchMany = require("../util/fetchMany");
const log = require("../util/logFile");
const embedContent = require("../util/embed");
let processCount = 0;


async function run([command, ...args],message,guildData,BOT_DATA,client){
    processCount++;
    log.info(`ProcessCount: ${processCount}, Guild: ${message.guild.name}(${message.guild.id}, fromCh:${message.channel.name}(${message.channel.id}) toChId:${args[2]}`);
    if(!args[1]){
        message.channel.send({embeds: [embedContent.error(`引数が足りません。\n${BOT_DATA.PREFIX}mt run <移行する最初のメッセージのid> <移行先のチャンネルid> <移行するメッセージ数>`)]});
        log.error(`The process was aborted because there were no required arguments. Require argument "messageID" in messageTransfar. ProcessCount:${processCount}`);
        return;
    }
    
    if(!args[2]){
        message.channel.send({embeds:[ embedContent.error(`引数が足りません。\n${BOT_DATA.PREFIX}mt run <移行する最初のメッセージのid> <移行先のチャンネルid> <移行するメッセージ数>`)]});
        log.error(`The process was aborted because there were no required arguments. Require argument "toChannelID" in messageTransfar. ProcessCount:${processCount}`);
        return;
    }
    
    let toChannelId = null;
    let toChannelThreadId = null;

    if(args[2].indexOf(':')){
        const IDs = args[2].split(':');
        toChannelId = IDs[0];
        toChannelThreadId = IDs[1];
    }else toChannelId = args[2];

    let toChannel;
    try{
        toChannel = client.channels.cache.get(toChannelId);
        if(toChannel.isThread()) throw Error(`This is the THREAD! ch:${toChannel.name}(${toChannel.id}`);
    }catch(e){
        message.channel.send({embeds: [embedContent.error(`チャンネルの取得に失敗しました。指定したidが正しいか確認してください。`)]});
        log.error(`Failed to get a channel. ProcessCount:${processCount}\n${e}`);
        return;
    }
    
    if(toChannel.isVoice()){
        message.channel.send({embeds: [embedContent.error(`テキストチャンネル、若しくはスレッドを指定してください。`)]});
        log.error(`Processing was aborted because the specified channel was a voice channel. ch:${toChannel.name}(${toChannel.id} ProcessCount:${processCount}`);
        return;
    }
    
    if(toChannelThreadId && !toChannel.threads.cache.has(toChannelThreadId)){
        message.channel.send({embeds: [embedContent.error(`チャンネル内に指定されたスレッドが存在しません。スレッドがあるか、idは正しいか、確認してください。`)]});
        log.error(`The process was aborted because the specified thread ID did not exist in the channel.\n toCh:${toChannel.name}(${toChannel.id} thread:${toChannelThreadId} ProcessCount:${processCount}`);
        return;
    }
    
    if(!Number(args[3])){
        message.channel.send({embeds: [embedContent.error(`文字数は数字で指定してください。`)]});
        log.error(`The process was aborted because the argument was not a number. argment:${args[3]} ProcessCount:${processCount}`);
        return;
    }
  

    const msgid = args[1];
    let firstFeachMessage = null;
    try{
        firstFeachMessage = await message.channel.messages.fetch(msgid);
    }catch(e){
        message.channel.send({embeds: [embedContent.error(`先頭のメッセージの取得に失敗しました。\nコマンドを送信したチャンネルと先頭メッセージがあるチャンネルが一致しているか確認してください。`)]});
        log.error(`Failed to get a message. ProcessCount:${processCount}\nid: ${msgid}\n${e}`);
        return;
    }
    const limit = args[3]-1;
    const feachMessages = await fetchMany(message.channel, {
        limit: (limit??=5000),
        after: msgid
    });
    

    feachMessages.set(msgid, firstFeachMessage);
    
    const feachMessagesID = feachMessages.map(key=>{return key.id}).reverse();


    const webhook = await client.channels.cache.get(toChannelId).createWebhook("msgTransfar")
        .then(webhook=>{
            log.info(`ProcessCount:${processCount} Succeed to create webhook.`);
            return webhook;
        })
        .catch(e=>{
                message.channel.send({embeds: [embedContent.error(`webhookリンクの作成に失敗しました。権限、webhookの数を確認してください。`)]});
                log.error(`Failed to create webhook. ProcessCount:${processCount}\n${e}`);
        })
    if(!webhook) return;


    await Promise.all(feachMessagesID.map(async key => {
        const obj = feachMessages.get(key);

        let content;
        if(obj.attachments&&obj.attachments.first()){
            content = obj.content+obj.attachments.first().url;
        }else content = obj.content;

        const option = {
            username: `${obj.author.username} (${(new Date(obj.createdTimestamp)).toFormat("YYYY/MM/DD HH24:MI")})`,
            avatarURL: `https://cdn.discordapp.com/avatars/${obj.author.id}/${obj.author.avatar}.webp`,
            content : content
        };
        if(toChannelThreadId) option.threadId = toChannelThreadId;

        await webhook.send(option)
            .catch(e=>{
                log.error(`${e}\nguild:${message.guild.name}(${message.guild.id}) chID:${message.channel.name}(${message.channel.id}) msgID${obj.id} ProcessCount:${processCount}`);
            });
    }));

    
    webhook.delete()
        .then(res=>{
            log.info(`ProcessCount:${processCount} Succeed to delete webhook.`);
        })
        .catch(e=>{
            message.channel.send({embeds: [embedContent.error(`webhookの削除に失敗したため、手動で削除してください。`)]});
            log.error(`Failed to delete webhook. ProcessCount:${processCount}\n${e}`);
        });
        
    message.channel.send({embeds: [embedContent.info(`全てのメッセージの転送が完了しました。`)]});
    log.info(`ProcessCount:${processCount} Message counts : ${feachMessages.map(key=>{return key}).length}`);
}

exports.run = run;