const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const http = require('http');

// --- SERVIDOR PARA RENDER (Mantiene el bot vivo) ---
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
const API_KEY = '123456'; 
const BASE_URL_PHP = "http://gtlatamseries.gt.tc/api_bot.php"; // <--- Tu URL confirmada

const axiosConfig = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'application/json'
    },
    timeout: 15000 
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
            
            // Recibimos los datos (la lista de pilotos directamente)
            const data = response.data;

            // Verificamos que sea una lista con pilotos
            if (Array.isArray(data) && data.length > 0) {
                const embed = new EmbedBuilder()
                    .setTitle('🏆 Clasificación GT Latam Series')
                    .setColor('#FF0000')
                    .setTimestamp()
                    .setFooter({ text: 'Gran Turismo Latam Series' });

                let descripcion = "";
                data.forEach((piloto, index) => {
                    // Usamos .nombre y .puntos que es lo que sale en tu pantalla
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
});

client.login(TOKEN);
