"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CitySelector from './components/CitySelector';
import CurrentWeather from './components/CurrentWeather';
import WeatherForecast from './components/WeatherForecast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL + '/api/weather';

interface Weather {
  name: string;
  main: {
    temp: number;
  };
  wind: {
    speed: number;
  };
  weather: Array<{
    description: string;
  }>;
}

interface Forecast {
  list: Array<{
    dt: number;
    main: {
      temp: number;
      temp_min: number;
      temp_max: number;
    };
    wind: {
      speed: number;
    };
    weather: Array<{
      description: string;
    }>;
  }>;
}

const Home: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [showForecast, setShowForecast] = useState<boolean>(false);

  useEffect(() => {
    if (selectedCity) {
      axios.get(`${API_BASE_URL}/current`, {
        params: { cityId: selectedCity },
      })
        .then(response => setWeather(response.data))
        .catch(() => setWeather(null));

      axios.get(`${API_BASE_URL}/forecast`, {
        params: { cityId: selectedCity },
      })
        .then(response => setForecast(response.data))
        .catch(() => setForecast(null));
    }
  }, [selectedCity]);

  const handleToggleForecast = () => {
    setShowForecast(!showForecast);
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Weather forecast</h1>
      <CitySelector onSelectCity={setSelectedCity} />
      {selectedCity && weather && (
        <div>
          <CurrentWeather weather={weather} />
          {!showForecast ? (
            <button
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              onClick={handleToggleForecast}
            >
              See Forecast
            </button>
          ) : (
            <button
              className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              onClick={handleToggleForecast}
            >
              Close
            </button>
          )}
        </div>
      )}
      {selectedCity && showForecast && forecast && <WeatherForecast forecast={forecast} />}
    </div>
  );
};

export default Home;
