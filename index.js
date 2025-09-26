// Crea un servidor express basico que escuche el puerto 3000 y cargue variables de entorno desde .env
const express = require("express");
require("dotenv").config();
const { Configuration, OpenAIApi } = require("openai");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Crea un enpoint de healthcheck en /healthz que responda con 200 OK
app.get("/healthz", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date() });
});

// Crea un endpoint raiz que responda con 'Hello World!'
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Crea un tiempo con un post /chat que recibe un json con una propiedad pregunta que no debe estar vacia
// Usa el el cliente openai para responder a la pregunta
// Responde con un json que contenga la propiedad respuesta con el valor "Esta es una respuesta automatica a tu pregunta: {pregunta}"
app.post("/chat", async (req, res) => {
  const { pregunta } = req.body;
  if (!pregunta || typeof pregunta !== "string" || pregunta.trim() === "") {
    return res.status(400).json({
      error: "La propiedad pregunta es obligatoria y no debe estar vacía",
    });
  }

  // Si MOCK_API es true, responde con mock
  if (process.env.MOCK_API === "true") {
    const respuesta = `Esta es una respuesta automatica a tu pregunta: ${pregunta}`;
    return res.json({ respuesta });
  }

  // Si no hay API key, responde con error
  if (!process.env.OPENAI_API_KEY) {
    return res
      .status(500)
      .json({ error: "No se ha configurado la API key de OpenAI" });
  }

  try {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: pregunta }],
    });
    const respuesta = response.data.choices[0].message.content;
    res.json({ respuesta });
  } catch (error) {
    console.error("Error al comunicarse con OpenAI:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

module.exports = app;
