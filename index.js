const { Telegraf } = require('telegraf');
const mongoose = require('mongoose');

// CONEXIÓN A MONGODB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Conectado a MongoDB"))
  .catch(err => console.error("Error Mongo:", err));

// Esquema para tus Manhwas
const ManhwaSchema = new mongoose.Schema({
  titulo: String,
  capitulo: Number,
  imagenes: [String], // Aquí se guardan los links
  fecha: { type: Date, default: Date.now }
});

const Manhwa = mongoose.model('Manhwa', ManhwaSchema);

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => ctx.reply('¡Listo para subir Manhwas! Envíame una foto.'));

bot.on('photo', async (ctx) => {
  try {
    // Obtenemos el ID de la foto que enviaste
    const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
    
    // Generamos el link de la imagen a través de la API de Telegram
    const fileLink = await ctx.telegram.getFileLink(fileId);
    
    // IMPORTANTE: Aquí guardamos el link en MongoDB
    // Puedes ajustar el título y capítulo manualmente por ahora
    await Manhwa.findOneAndUpdate(
      { titulo: "Lider de secta mantén un perfil bajo", capitulo: 1 }, 
      { $push: { imagenes: fileLink.href } }, 
      { upsert: true }
    );

    ctx.reply('Imagen guardada en MongoDB con éxito.');
  } catch (error) {
    console.error(error);
    ctx.reply('Hubo un error al guardar.');
  }
});

// Para que funcione en Vercel como Webhook
module.exports = async (req, res) => {
  if (req.method === 'POST') {
    await bot.handleUpdate(req.body, res);
  } else {
    res.status(200).send('Bot funcionando');
  }
};

