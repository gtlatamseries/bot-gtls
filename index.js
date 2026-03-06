console.log("Intentando encender el bot...");
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const axios = require('axios');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent
    ] 
});

// --- CONFIGURACIÓN ---
const TOKEN = process.env.TOKEN;
const API_KEY = '123456'; 
const BASE_URL_PHP = 'https://granturismols.byethost9.com/api_bot.php';

const axiosConfig = {
    headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
    }
};

client.on('ready', () => {
    console.log(`✅ Bot conectado como ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // COMANDO: !tabla
    if (message.content === '!tabla') {
        try {
            const urlConProxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(`${BASE_URL_PHP}?key=${API_KEY}&action=get_top`)}`;
            const response = await axios.get(urlConProxy, axiosConfig);
            const data = response.data;

            const embed = new EmbedBuilder()
                .setTitle('🏆 Clasificación General - Temporada 5')
                .setColor('#00eaff')
                .setTimestamp()
                .setFooter({ text: 'Gran Turismo Latam Series' });

            if (!Array.isArray(data) || data.length === 0) {
                embed.setDescription("No hay datos disponibles o el servidor está saturado.");
            } else {
                data.forEach((p, i) => {
                    embed.addFields({ 
                        name: `${i+1}. ${p.piloto}`, 
                        value: `🏎️ ${p.equipo} | **${p.total} Pts**`, 
                        inline: false 
                    });
                });
            }
            message.channel.send({ embeds: [embed] });
        } catch (e) {
            message.reply('❌ Error al conectar con la base de datos.');
        }
    }

    // COMANDO: !perfil [Nombre]
    if (message.content.startsWith('!perfil ')) {
        const nombrePiloto = message.content.replace('!perfil ', '').trim();
        try {
            const urlFinalPHP = `${BASE_URL_PHP}?key=${API_KEY}&action=get_perfil&nombre=${encodeURIComponent(nombrePiloto)}`;
            const urlConProxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(urlFinalPHP)}`;
            
            const response = await axios.get(urlConProxy, axiosConfig);
            const p = response.data;

            if (p.error) return message.reply(`❌ ${p.error}`);

            const embed = new EmbedBuilder()
                .setTitle(`👤 Ficha de Piloto: ${p.nickname}`)
                .setColor('#ffd700')
                .addFields(
                    { name: 'Nombre Real', value: `${p.nombre} ${p.apellido}`, inline: true },
                    { name: 'Dorsal', value: `#${p.numero}`, inline: true },
                    { name: 'Equipo', value: p.equipo, inline: false },
                    { name: 'Nacionalidad', value: p.nacionalidad, inline: true }
                );

            message.channel.send({ embeds: [embed] });
        } catch (e) {
            message.reply('❌ Piloto no encontrado o error de conexión.');
        }
    }
});


client.login(TOKEN);

