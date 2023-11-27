const express = require('express');
const axios = require('axios');

const app = express();
const port = 3000 || process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const openMeteoEndpoint = 'https://api.open-meteo.com/v1';
const geolocationEndpoint = 'https://geocoding-api.open-meteo.com/v1/search';

// Endpoint to get weather by city name in the URL
app.get('/weather/:city', async (req, res) => {
  const cityName = req.params.city;

  if (!cityName) {
    return res.status(400).json({ error: 'City parameter is required' });
  }

  try {
    // Step 1: Geolocate the city
    const geolocationResponse = await axios.get(`${geolocationEndpoint}?name=${cityName}`);
    const result = geolocationResponse.data.results;

    if (!result || result.length === 0) {
      return res.status(404).json({ error: 'City not found' });
    }

    // Get the first city from the results
    const firstCity = result[0];

    // Step 2: Get weather data for the geolocated city
    const weatherResponse = await axios.get(`${openMeteoEndpoint}/forecast?latitude=${firstCity.latitude}&longitude=${firstCity.longitude}&hourly=temperature_2m&forecast_days=1`);

    const hourlyTemperature = weatherResponse.data.hourly.temperature_2m;

    // Extract the latest temperature
    const latestTemperature = hourlyTemperature[hourlyTemperature.length - 1];

    res.json({ city: firstCity.name, country: firstCity.country, latestTemperature });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching weather data' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
