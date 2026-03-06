const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const axios = require('axios'); // Asegúrate de tener axios en tu package.json

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// --- CONFIGURACIÓN SEGURA PARA RENDER ---
const TOKEN = process.env.TOKEN;
const API_KEY = process.env.API_KEY || '123456';
const BASE_URL_PHP = 'https://granturismols.byethost9.com/api_bot.php';

// Configuración para engañar al firewall de ByetHost
const axiosConfig = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
    }
};

client.once('ready', () => {
    console.log(`✅ Bot conectado como ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // COMANDO !tabla
    if (message.content === '!tabla') {
        try {
            const response = await axios.get(`${BASE_URL_PHP}?action=get_tabla&api_key=${API_KEY}`, axiosConfig);
            const data = response.data;

            if (data.status === 'success' && data.data.length > 0) {
                const embed = new EmbedBuilder()
                    .setTitle('🏆 Clasificación GT Latam Series - Temporada 5')
                    .setColor('#FF0000')
                    .setTimestamp();

                let descripcion = "";
                data.data.forEach((piloto, index) => {
                    descripcion += `**${index + 1}.** ${piloto.nombre} - ${piloto.puntos} pts\n`;
                });

                embed.setDescription(descripcion);
                message.reply({ embeds: [embed] });
            } else {
                message.reply('❌ No hay datos disponibles en la tabla de la liga.');
            }
        } catch (error) {
            console.error('Error en !tabla:', error);
            message.reply('⚠️ Error al conectar con el servidor de la liga.');
        }
    }

    // COMANDO !perfil
    if (message.content.startsWith('!perfil ')) {
        const nombrePiloto = message.content.split(' ')[1];
        try {
            const response = await axios.get(`${BASE_URL_PHP}?action=get_piloto&nombre=${nombrePiloto}&api_key=${API_KEY}`, axiosConfig);
            const data = response.data;

            if (data.status === 'success') {
                const p = data.data;
                const embed = new EmbedBuilder()
                    .setTitle(`🏎️ Perfil de Piloto: ${p.nombre}`)
                    .addFields(
                        { name: 'Puntos', value: `${p.puntos}`, inline: true },
                        { name: 'Victorias', value: `${p.victorias}`, inline: true },
                        { name: 'Podios', value: `${p.podios}`, inline: true }
                    )
                    .setColor('#0099ff');

                message.reply({ embeds: [embed] });
            } else {
                message.reply(`❌ No se encontró al piloto: ${nombrePiloto}`);
            }
        } catch (error) {
            console.error('Error en !perfil:', error);
            message.reply('⚠️ Error al buscar los datos del piloto.');
        }
    }
});

client.login(TOKEN);
