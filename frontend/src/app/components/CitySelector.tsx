"use client";

import React, { ChangeEvent } from 'react';

const cities = [
  { id: 6167865, name: "Toronto", country: "CA" },
  { id: 6094817, name: "Ottawa", country: "CA" },
  { id: 1850147, name: "Tokyo", country: "JP" },
];

interface CitySelectorProps {
  onSelectCity: (cityId: string) => void;
}

const CitySelector: React.FC<CitySelectorProps> = ({ onSelectCity }) => {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onSelectCity(event.target.value);
  };

  return (
    <div className="mb-4">

      <select
        onChange={handleChange}
        className="block w-full p-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      >
        <option value="">Please select city to see the forecast</option>
        {cities.map((city) => (
          <option key={city.id} value={city.id}>
            {city.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CitySelector;
