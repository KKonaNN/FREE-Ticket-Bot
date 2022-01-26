const express = require('express');
const app = express();

app.listen(() => console.log('Ottawa'));
require('events').EventEmitter.defaultMaxListeners = 30;
app.use('/ping', (req, res) => {
    res.send(new Date());
});
const Discord = require('discord.js');
const client = new Discord.Client({ partials: ["MESSAGE", "USER", "REACTION"] });

const ms = require('ms');
const fs = require('fs');
const moment = require('moment');
const db = require('quick.db')



///////////////

const prefix = '';
const developers = '';



client.on('message', message => {
    if (message.content.startsWith(prefix + 'set-sup')) {
        var sup = message.mentions.roles.first();
        if (!sup) return message.channel.send(`**Mention A Support Role**`)
        db.set(`sup_${message.guild.id}`, sup.id)

        message.channel.send(`**Done : Support Role : ${sup}**`)



    }
});

client.on('message', message => {
    if (message.content.startsWith(prefix + "set-desc")) {

        var disc = message.content.split(" ").slice(1).join(" ")
        if (!disc) return message.channel.send(`**Type The Description For The Ticket**`)
        db.set(`disc_${message.guild.id}`, disc)
        message.channel.send(`**Done : The Description Is :
     ${disc}
    **`)

    }
});


client.on('message', message => {
    if (message.content.startsWith(prefix + 'new')) {
        var suup = db.get(`sup_${message.guild.id}`)
        var desc = db.get(`disc_${message.guild.id}`)

        if (!suup) return message.channel.send(`**The Support Role was not Specified **`)
        if (!desc) return message.channel.send(`**The Description was not Specified**`)

        var user = message.author

        let everyone = message.guild.roles.cache.find(r => r.name === `@everyone`);
        message.guild.channels.create(`ticket-${message.author.username}`, { type: 'text' }).then(channel => {

            let support = message.guild.roles.cache.find(r => r.id === `${suup}`)


            channel.send(`${support} , <@${message.author.id}>`)
            var embed = new Discord.MessageEmbed()

                .setTitle(`**${message.author.username} Ticket**`)
                .setDescription(`${desc}`)
                .setFooter(`Open By ${message.author.username}`)
            channel.send(embed)


            channel.createOverwrite(everyone, {
                VIEW_CHANNEL: false
            })

            channel.createOverwrite(user, {
                SEND_MESSAGES: true,
                VIEW_CHANNEL: true,
                READ_MESSAGE_HISTORY: true
            })

            channel.createOverwrite(support, {
                SEND_MESSAGES: true,
                VIEW_CHANNEL: true,
                READ_MESSAGE_HISTORY: true
            })



        })
    }
});



client.on('message', message => {
    if (message.content.startsWith(prefix + 'delete')) {
        if (!message.member.hasPermission('MANAGE_GUILD')) return message.channel.send(`** You Dont Have \`MANAGE_GUILD\` Permission**`)
        if (!message.channel.name.includes("ticket-")) return message.channel.send(`**This Is Not A Ticket Room**`);
        message.channel.send(`Ticket Deleted In 5s`)
        setTimeout(() => {
            message.channel.delete();

        }, 5000)
    }
});

client.on('message', message => {
    if (message.content.startsWith(prefix + 'add')) {

        if (!message.member.hasPermission('MANAGE_GUILD')) return message.channel.send(`** You Dont Have \`MANAGE_GUILD\` Permission**`)
        if (!message.channel.name.includes("ticket-")) return message.channel.send(`**This Is Not A Ticket Room**`)

        var user = message.mentions.members.first()
        if (!user) return message.channel.send(`**Mention A User Or User ID**`)

        message.channel.createOverwrite(user, {

            SEND_MESSAGES: true,
            VIEW_CHANNEL: true,
            READ_MESSAGE_HISTORY: true
        })
        message.channel.send(`Done ${user} Added For The Ticket`)
    }
});

client.on('message', message => {
    if (message.content.startsWith(prefix + 'remove')) {

        if (!message.member.hasPermission('MANAGE_GUILD')) return message.channel.send(`** You Dont Have \`MANAGE_GUILD\` Permission**`)
        if (!message.channel.name.includes("ticket-")) return message.channel.send(`**This Is Not A Ticket Room**`);
        var user = message.mentions.members.first()
        if (!user) return message.channel.send(`**Mention A User Or User ID**`)

        message.channel.createOverwrite(user, {

            SEND_MESSAGES: false,
            VIEW_CHANNEL: false,
            READ_MESSAGE_HISTORY: false
        })
        message.channel.send(`Done ${user} Removed For The Ticket`)

    }
});

client.on('message', message => {
    if (message.content.startsWith(prefix + 'rename')) {
        if (!message.member.hasPermission('MANAGE_GUILD')) return message.channel.send(`** You Dont Have \`MANAGE_GUILD\` Permission**`)
        if (!message.channel.name.includes("ticket-")) return message.channel.send(`**This Is Not A Ticket Room**`);
        var args = message.content.split(" ").slice(1).join(" ")
        if (!args) return message.channel.send(`**Type A Name For The Channel**`)

        message.channel.setName(`ticket-${args}`)
        message.channel.send(`**Done , The Ticket Name Is  \`ticket-${args}\`**`)

    }
})



client.on('message', async message => {
    if (message.content.startsWith(prefix + 'setup')) {
        var suup = db.get(`sup_${message.guild.id}`)
        var desc = db.get(`disc_${message.guild.id}`)

       if (!suup) return message.channel.send(`**The Support Role was not Specified **`)
        if (!desc) return message.channel.send(`**The Description was not Specified**`)

        var channel = message.mentions.channels.first();
        if (!channel) return message.channel.send(`Mention A Channel`)

        var send = await channel.send(new Discord.MessageEmbed()
        .setTitle(`**Ticket System**`)
            .setDescription(`**React With \`📩\` To Open A Ticket**`)
            .setFooter(`Code By KonaN`)
        );

        send.react('📩')

        db.set(`ticket-${message.guild.id}`, send.id)

        message.channel.send(`** Done , The Ticket Has Ben Setup  **`)

    }
})

client.on('messageReactionAdd', async (reaction, user) => {
    if (user.partial) await user.fetch();
    if (reaction.partial) await reaction.fetch();
    if (reaction.message.partial) await reaction.message.fetch();

    if (user.bot) return;

    var suup = db.get(`sup_${reaction.message.guild.id}`)
    var desc = db.get(`disc_${reaction.message.guild.id}`)

    var ticket = await db.fetch(`ticket-${reaction.message.guild.id}`)
    if (!ticket) return;

    if (reaction.message.id == ticket && reaction.emoji.name == '📩') {
        reaction.users.remove(user);
        let support = reaction.message.guild.roles.cache.find(r => r.id === `${suup}`)


        reaction.message.guild.channels.create(`ticket-${user.username}`, {
            permissionOverwrites: [
                {
                    id: user.id,
                    allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY']
                },
                {
                    id: reaction.message.guild.roles.everyone,
                    deny: ["VIEW_CHANNEL"]
                }
            ],
            type: 'text'
        }).then(async channel => {
            channel.send(`<@${user.id}> ${support} `, new Discord.MessageEmbed()
                .setTitle(`**${user.username} Ticket**`)
                .setDescription(`**${desc}**`)
                .setFooter(`Open By ${user.username}`)
            );
        })


    }
})



client.on('message' , message => {
    if(message.content.startsWith(prefix + 'help')){
var embed = new Discord.MessageEmbed()

            .setTitle(`**\`${client.user.username}\`Commands**`)
            .setDescription(`**
            \`\`\`Ticket Commands\`\`\`

\`${prefix}new\` 

=======================

\`${prefix}set-sup\` , \`${prefix}set-desc\` , \`${prefix}add\` , \`${prefix}remove\`
\`${prefix}rename\` , \`${prefix}delete\` , \`${prefix}setup\`

**`)
            .setFooter(`Request by ${message.author.username}`)
            message.channel.send(embed)

    }
})







client.login('TOKEN') 

