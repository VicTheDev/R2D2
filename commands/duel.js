const {MessageActionRow ,MessageButton} = require('discord.js')
const { getRandomInt } = require('../maths')
const cooldown = new Set();
const {i18n} = require('../i18n/i18n')
module.exports = {
    name:"duel",
    category:"Fun",
    async execute(message,args){
        const guildId = message.guildId
        const member = message.member;
        const target = message.mentions.members.first()
        if(target != undefined && target != member){
            if(!cooldown.has(member.user.id)){
                if(!cooldown.has(target.user.id)){
                    cooldown.add(member.user.id)

                    message.delete()

                    const row = new MessageActionRow()
                        .addComponents(
                            new MessageButton()
                                .setCustomId('ok')
                                .setLabel(i18n.t("commands.fun.accept",guildId))
                                .setStyle('SUCCESS'),
                            new MessageButton()
                                .setCustomId('no')
                                .setLabel(i18n.t("commands.fun.decline",guildId))
                                .setStyle('DANGER')
                        );

                    const acceptmessage = await message.channel.send({content:i18n.t("commands.fun.duel.challenged",guildId,{user:member.user,target:target.user}), components: [row]})
                    const filter = i => i.message.id == acceptmessage.id && ['ok','no'].includes(i.customId) && i.member == target;
                    const collector = acceptmessage.channel.createMessageComponentCollector({filter, time: 20_000});
                    
                    let answered = false
                    collector.on('collect', async i => {
                        switch (i.customId){
                            case 'ok':
                                await acceptmessage.edit({content:i18n.t("commands.fun.accepted",guildId,{user:target.user,game:i18n.t("commands.fun.duel.game",guildId)}), components: []})
                                cooldown.add(target.user.id)
                                setTimeout(() => {
                                    acceptmessage.delete()
                                    duel(message, member, target)
                                }, 3000)
                                answered = true
                                collector.stop()
                                break;
                            case 'no':
                                await acceptmessage.edit({content: i18n.t("commands.fun.declined",guildId,{user:target.displayName,game:i18n.t("commands.fun.duel.game",guildId)}) , components: []})
                                cooldown.delete(member.user.id)
                                answered = true
                                setTimeout(() => {
                                    acceptmessage.delete()
                                }, 3000)
        
                        }
                    })
        
                    collector.on('end', async collected => {
                        if(!answered){
                            await acceptmessage.edit({content: i18n.t("commands.fun.declined",guildId,{user:target.displayName,game:i18n.t("commands.fun.duel.game",guildId)}) , components: []})
                            cooldown.delete(member.user.id)
                                setTimeout(() => {
                                    acceptmessage.delete()
                                }, 3000)
                        }
                    })
                }else{
                    const reply = await message.reply(i18n.t("commands.fun.duel.targetunavailable",guildId,{user:target.displayName}))
                    message.delete()
                    setTimeout(() => {
                        reply.delete()
                    }, 3000)
                }
            }else{
                const reply = await message.reply(i18n.t("commands.fun.duel.unavailable",guildId))
                message.delete()
                setTimeout(() => {
                    reply.delete()
                }, 3000)
            }
        }else{
            const reply = await message.reply(i18n.t("commands.interaction.mentionmissing",guildId))
            message.delete()
            setTimeout(() => {
                reply.delete()
            }, 3000)
        }
    }
        
}

async function duel(message, member, target){
    const players = [member.user.id, target.user.id]
    const lose = [target.user.id, member.user.id]
    const pos = [
        `_ _  :grinning:  :point_right:           **${i18n.t("commands.fun.duel.pos.wait",guildId)}**           :point_left:  :grinning: _ _`,
        `_ _  :grinning:  :point_right:           **${i18n.t("commands.fun.duel.pos.shoot",guildId)}**          :point_left:  :grinning: _ _`,
        `_ _  :cowboy:  :point_right:           ${i18n.t("commands.fun.duel.pos.won",guildId,{user:member.displayName})}           :skull: _ _`,
        `_ _  :skull:           ${i18n.t("commands.fun.duel.pos.won",guildId,{user:target.displayName})}           :point_left:  :cowboy: _ _`,
        `_ _  :neutral_face:  :point_right:           ${i18n.t("commands.fun.duel.pos.draw",guildId)}           :point_left:  :neutral_face: _ _`

    ]
    let row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('0')
                    .setLabel(i18n.t("commands.fun.duel.shoot",guildId))
                    .setStyle('SUCCESS'),
                new MessageButton()
                    .setCustomId('mid')
                    .setLabel('\u200b')
                    .setStyle('SECONDARY')
                    .setDisabled(true),
                new MessageButton()
                    .setCustomId('1')
                    .setLabel(i18n.t("commands.fun.duel.shoot",guildId))
                    .setStyle('DANGER')
            );
    const botmessage = await message.channel.send({content: pos[0], components: [row]});

    const filter = i => ['0','1'].includes(i.customId) && [member, target].includes(i.member) && i.message.id == botmessage.id
    const collector = botmessage.channel.createMessageComponentCollector({ filter, time: 20_000})
    
    let canShoot = false
    let end = false
    const timer = getRandomInt(1000, getRandomInt(4500, 5250))

    setTimeout(() => {
        if(!end){
            canShoot = true
        botmessage.edit({content: pos[1], components: [row]})
        }    
    }, timer)

    collector.on('collect', async i => {
        if(canShoot){
            end = true
            await botmessage.edit({content: pos[2 + players.indexOf(i.member.user.id)] , components:[]})
            collector.stop()
        }else{
            end = true
            i.reply({content: i18n.t("commands.fun.duel.tooearly",guildId), ephemeral: true})
            await botmessage.edit({content: pos[2 + lose.indexOf(i.member.user.id)] , components:[]})
            collector.stop()
        }
    })

    collector.on('end', async collected => {
        if(!end){
            await botmessage.edit({content: pos[4], components:[]})
        }
        cooldown.delete(member.user.id)
        cooldown.delete(target.user.id)

    })
}