/*

created by huda0209
MessageTransfar2 for discord bot 

<@ This source code is based on the code in the document at the following link. >
https://scrapbox.io/discordjs-japan/100%E4%BB%B6%E4%BB%A5%E4%B8%8A%E3%81%AE%E3%83%A1%E3%83%83%E3%82%BB%E3%83%BC%E3%82%B8%E3%82%92%E5%8F%96%E5%BE%97%E3%81%99%E3%82%8B%E6%96%B9%E6%B3%95


ran by node.js

2022-1-15

*/

"use strict"

const {Collection} = require("@discordjs/collection")

function array2Collection(messages) {
	  return new Collection(messages.sort((a, b) => BigInt(a.id) < BigInt(b.id) ? 1 : -1).map(e => [e.id, e]));
}
module.exports = async function (channel, options = { limit: 50 }) {
   if ((options.limit ?? 50) <= 100) {
     return channel.messages.fetch(options);
   }
	
   if (typeof options.around === "string") {
     const messages = await channel.messages.fetch({ ...options, limit: 100 });
     const limit = Math.floor((options.limit - 100) / 2);
     if (messages.size < 100) {
       return messages;
     }
     const backward = fetchMany(channel, { limit, before: messages.last().id });
     const forward = fetchMany(channel, { limit, after: messages.first().id });
     return array2Collection([messages, ...await Promise.all([backward, forward])].flatMap(
       e => [...e.values()]
     ));
   }

   let temp;
   function buildParameter() {
     const req_cnt = Math.min(options.limit - messages.length, 100);
     if (typeof options.after === "string") {
       const after = temp? temp.first().id : options.after
       return { ...options, limit: req_cnt, after };
     }
     const before = temp? temp.last().id : options.before;
     return { ...options, limit: req_cnt, before };
   }


   const messages = [];
   while (messages.length < options.limit) {
     const param = buildParameter();
     temp = await channel.messages.fetch(param);
     messages.push(...temp.values());
     if (param.limit > temp.size) {
       break;
     }
   }
   return array2Collection(messages);
}