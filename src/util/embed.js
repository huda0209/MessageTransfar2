/*

created by huda0209
MessageTransfar2 for discord bot 

ran by node.js

2022-1-15

*/
"use strict"

const Discord = require("discord.js");

exports.info = (content)=>{
    return new Discord.MessageEmbed()
        .setDescription(content)
        .setColor('#06f919')
}

exports.error = (content)=>{
    return new Discord.MessageEmbed()
        .setDescription(content)
        .setColor('#f90906')
}