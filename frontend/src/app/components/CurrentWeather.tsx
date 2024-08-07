"use client";

import React from 'react';

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

interface CurrentWeatherProps {
  weather: Weather | null;
}

const CurrentWeather: React.FC<CurrentWeatherProps> = ({ weather }) => {
  if (!weather) return <div>Loading...</div>;

  return (
    <div className="p-4 border rounded-md shadow-md">
      <h2 className="text-2xl font-bold mb-2">{weather.name}</h2>
      <p className="text-lg">Clouds: {weather.weather[0].description}</p>
      <p className="text-lg">{weather.main.temp}°C</p>
      <p className="text-lg">Wind: {weather.wind.speed} m/sec</p>
    </div>
  );
};

export default CurrentWeather;
