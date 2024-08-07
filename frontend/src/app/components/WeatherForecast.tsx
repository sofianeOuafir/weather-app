"use client";

import React, { useState } from 'react';

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

interface WeatherForecastProps {
  forecast: Forecast | null;
}

const WeatherForecast: React.FC<WeatherForecastProps> = ({ forecast }) => {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  if (!forecast) return null;

  const days = forecast.list.reduce((acc: any, item) => {
    const date = new Date(item.dt * 1000).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(item);
    return acc;
  }, {});

  const handleDayClick = (day: string) => {
    setSelectedDay(day);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('en-US', {
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
  };

  const selectedDayForecast = selectedDay ? days[selectedDay] : Object.values(days)[0];

  return (
    <div className="p-4 border rounded-md shadow-md mt-4">
      <h2 className="text-2xl font-bold mb-2">Forecast</h2>
      <div className="flex flex-wrap mb-4 space-x-2">
        {Object.keys(days).map((day) => (
          <button
            key={day}
            className={`px-4 py-2 rounded-md mb-2 ${selectedDay === day ? 'bg-gray-300' : 'bg-gray-100 hover:bg-gray-200'}`}
            onClick={() => handleDayClick(day)}
          >
            {day}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Date</th>
              <th className="py-2 px-4 border-b">Temp</th>
              <th className="py-2 px-4 border-b">Min Temp</th>
              <th className="py-2 px-4 border-b">Max Temp</th>
              <th className="py-2 px-4 border-b">Wind</th>
              <th className="py-2 px-4 border-b">Description</th>
            </tr>
          </thead>
          <tbody>
            {selectedDayForecast.map((item: any) => (
              <tr key={item.dt}>
                <td className="py-2 px-4 border-b">{formatDate(item.dt)}</td>
                <td className="py-2 px-4 border-b">{item.main.temp}°C</td>
                <td className="py-2 px-4 border-b">{item.main.temp_min}°C</td>
                <td className="py-2 px-4 border-b">{item.main.temp_max}°C</td>
                <td className="py-2 px-4 border-b">{item.wind.speed} m/sec</td>
                <td className="py-2 px-4 border-b">{item.weather[0].description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WeatherForecast;
