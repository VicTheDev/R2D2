const {MessageEmbed} = require('discord.js')
const objects = require('../database/objects.json')
module.exports = {
	name: 'item',
	description: 'Get informations about an item.',
    category: "Inventory",
	execute(message, args) {
        const item = objects.find(o => o.name.toLowerCase()===args.join(' ').toLowerCase())
        console.log(item)
        if(item!==undefined){
            const Embed = new MessageEmbed()
                .setTitle(item.name)
                .setDescription(item.description)
                .setColor('ffd700')
                .addFields(
                    { name: 'Effet', value: item.effect.toString(), inline: true},
                    { name: 'Prix', value: item.cost.toString(), inline: true},
                    { name: 'Id', value: item.id.toString(), inline: true}
                );
            message.channel.send({embeds : [Embed]})
            message.delete()         
        }else{
            message.reply({content: "L'item spécifié n'existe pas ou n'a pas été trouvé. Merci de vérifier que vous l'avez correctement écrit."})
        }
	}, 
};