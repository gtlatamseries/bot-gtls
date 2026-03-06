const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const http = require('http'); // Para que Render no de error de puerto

// --- TRUCO PARA RENDER (Mantiene el bot vivo) ---
http.createServer((req, res) => {
    res.write("Bot GT Latam Series is Alive!");
    res.end();
}).listen(process.env.PORT || 3000);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// --- CONFIGURACIÓN ---
const TOKEN = process.env.TOKEN;
const API_KEY = process.env.API_KEY || '123456';
const BASE_URL_PHP = "http://gtlatamseries.gt.tc/api_bot.php";

// Configuración para saltar bloqueos de seguridad
const axiosConfig = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
    },
    timeout: 10000 // 10 segundos de espera máximo
};

client.once('ready', () => {
    console.log(`✅ Bot conectado como ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // COMANDO !tabla
    if (message.content === '!tabla') {
        try {
            console.log("Solicitando tabla a InfinityFree...");
            const response = await axios.get(`${BASE_URL_PHP}?action=get_tabla&api_key=${API_KEY}`, axiosConfig);
            const data = response.data;

            if (data.status === 'success' && data.data && data.data.length > 0) {
                const embed = new EmbedBuilder()
                    .setTitle('🏆 Clasificación GT Latam Series')
                    .setColor('#FF0000')
                    .setTimestamp()
                    .setFooter({ text: 'Gran Turismo Latam Series' });

                let descripcion = "";
                data.data.forEach((piloto, index) => {
                    descripcion += `**${index + 1}.** ${piloto.nombre} — ${piloto.puntos} pts\n`;
                });

                embed.setDescription(descripcion);
                await message.reply({ embeds: [embed] });
            } else {
                await message.reply('❌ No hay datos en la tabla. Agrega pilotos en phpMyAdmin.');
            }
        } catch (error) {
            console.error('Error en !tabla:', error.message);
            await message.reply('⚠️ Error al conectar con el servidor de datos.');
        }
    }

    // COMANDO !perfil
    if (message.content.startsWith('!perfil ')) {
        const nombrePiloto = message.content.split(' ')[1];
        try {
            const response = await axios.get(`${BASE_URL_PHP}?action=get_piloto&nombre=${nombrePiloto}&api_key=${API_KEY}`, axiosConfig);
            const data = response.data;

            if (data.status === 'success' && data.data) {
                const p = data.data;
                const embed = new EmbedBuilder()
                    .setTitle(`🏎️ Perfil: ${p.nombre}`)
                    .addFields(
                        { name: 'Puntos', value: `${p.puntos || 0}`, inline: true }
                        // Si agregas victorias/podios a la DB, puedes descomentar estas líneas:
                        // { name: 'Victorias', value: `${p.victorias || 0}`, inline: true },
                        // { name: 'Podios', value: `${p.podios || 0}`, inline: true }
                    )
                    .setColor('#0099ff')
                    .setFooter({ text: 'GT Latam Series' });

                await message.reply({ embeds: [embed] });
            } else {
                await message.reply(`❌ Piloto **${nombrePiloto}** no encontrado.`);
            }
        } catch (error) {
            console.error('Error en !perfil:', error.message);
            await message.reply('⚠️ Error al buscar los datos del piloto.');
        }
    }
});

client.login(TOKEN);
