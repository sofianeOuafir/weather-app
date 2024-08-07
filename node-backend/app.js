const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const apiKey = process.env.OPENWEATHERMAP_API_KEY;

// Enable CORS for all routes
app.use(cors());

app.get('/health', (req, res) => {
  res.send('OK');
})

app.get('/api/weather/current', async (req, res) => {
  const cityId = req.query.cityId;

  if (!cityId) {
    return res.status(400).send({ error: 'City ID is required' });
  }

  try {
    const response = await axios.get(`http://api.openweathermap.org/data/2.5/weather`, {
      params: {
        id: cityId,
        appid: apiKey,
        units: 'metric',
      },
    });
    res.send(response.data);
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch current weather data' });
  }
});

app.get('/api/weather/forecast', async (req, res) => {
  const cityId = req.query.cityId;

  if (!cityId) {
    return res.status(400).send({ error: 'City ID is required' });
  }

  try {
    const response = await axios.get(`http://api.openweathermap.org/data/2.5/forecast`, {
      params: {
        id: cityId,
        appid: apiKey,
        units: 'metric',
      },
    });
    res.send(response.data);
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch weather forecast data' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
