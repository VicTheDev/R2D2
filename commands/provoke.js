const Discord = require('discord.js')
const maths = require('../maths')
const { duel } = require('../LocalStorage')

module.exports = {
    name: 'provoke',
    description: 'Challenge your opponent',
    category: "Interaction",
    use:"`!provoke <user>`\n`!provoke <user> <message>`",
    example:"`!provoke @R2-D2`\n`!provoke @R2D2 Viens te battre manant !`",
    async execute(message,args){
        const member = message.member
        const target = message.mentions.members.first()

        if(target !== undefined ){
            args.shift()
            const DuelEmbed = new Discord.MessageEmbed()
                .setDescription('**'+member.displayName+'** provoque **'+target.displayName+'** en duel !\n'+args.join(' '))
                .setImage(duel[maths.getRandomInt(0,duel.length)])
                .setFooter({text: "Requested by " + member.displayName + ` (${member.user.tag})`,iconURL: message.author.avatarURL()});
            message.channel.send({embeds: [DuelEmbed]})

        }else{
            const ErrorApplaudEmbed = new Discord.MessageEmbed()
                .setColor("#ef5350")
                .setTitle("Commande Duel")
                .setDescription("Vous devez mentionnez un utilisateur pour utiliser cette interaction.\n\n**Usage**\n`!provoke <target>`\n`!provoke <target> <message>`\n\n**Example Usage**\n`!provoke @R2-D2`\n`!provoke @R2D2 Viens te battre manant !`")
                .setFooter({text: "Catégorie de commande: Interaction"});
            message.channel.send({embeds: [ErrorApplaudEmbed]})
        }
        message.delete()
    },
}