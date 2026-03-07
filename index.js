// COMANDO !tabla CORREGIDO
    if (message.content === '!tabla') {
        try {
            console.log("Solicitando tabla a InfinityFree...");
            const response = await axios.get(`${BASE_URL_PHP}?action=get_tabla&api_key=${API_KEY}`, axiosConfig);
            const data = response.data; // Aquí recibimos la lista directamente

            // CAMBIO AQUÍ: Quitamos el data.data porque tu API devuelve la lista de una
            if (Array.isArray(data) && data.length > 0) {
                const embed = new EmbedBuilder()
                    .setTitle('🏆 Clasificación GT Latam Series')
                    .setColor('#FF0000')
                    .setTimestamp()
                    .setFooter({ text: 'Gran Turismo Latam Series' });

                let descripcion = "";
                data.forEach((piloto, index) => {
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
