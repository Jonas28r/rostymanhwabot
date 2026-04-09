const { Telegraf } = require('telegraf');
const mongoose = require('mongoose');

// CONEXIÓN A MONGODB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Conectado a MongoDB"))
  .catch(err => console.error("Error Mongo:", err));

// Esquema sincronizado con script.js
const ManhwaSchema = new mongoose.Schema({
  titulo: String,
  ultimoCapitulo: String,
  portada: String,
  rutaCarpeta: String,
  totalPaginas: Number,
  tipo: { type: String, default: "MANHWA" },
  estado: { type: String, default: "NUEVO" },
  fecha: { type: String, default: () => new Date().toLocaleDateString() }
});

const Manhwa = mongoose.model('Manhwa', ManhwaSchema);
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.on('photo', async (ctx) => {
  try {
    const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
    const fileLink = await ctx.telegram.getFileLink(fileId);
    
    // Guardamos con la estructura que el script.js espera
    await Manhwa.findOneAndUpdate(
      { titulo: "Lider de secta" }, 
      { 
        ultimoCapitulo: "1",
        portada: fileLink.href, // La foto que mandas es la portada
        rutaCarpeta: "https://ejemplo.com/manga/", // Ajusta esto luego
        totalPaginas: 1,
        fecha: new Date().toLocaleDateString()
      }, 
      { upsert: true, new: true }
    );

    ctx.reply('¡Sincronizado! Refresca la web ahora.');
  } catch (error) {
    ctx.reply('Error al guardar.');
  }
});

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    await bot.handleUpdate(req.body, res);
  } else {
    res.status(200).send('Bot funcionando');
  }
};
