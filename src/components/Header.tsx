import React from 'react';

export const Header: React.FC = () => {
  const currentDate = new Date();
  const timeOfDay = currentDate.getHours() < 12 ? 'morning' : currentDate.getHours() < 18 ? 'afternoon' : 'evening';
  const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  const dateString = currentDate.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  }).toUpperCase();

  return (
    <div 
      className="h-48 bg-cover bg-center relative flex flex-col justify-center px-8"
      style={{
        backgroundImage: 'url("https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=1200")',
        backgroundPosition: 'center 30%'
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      <div className="relative z-10">
        <h1 className="text-4xl font-light text-white mb-2">
          Good {timeOfDay}, Jamie!
        </h1>
        <p className="text-white text-sm font-medium tracking-wider">
          {dayName}, {dateString}
        </p>
      </div>
      <button className="absolute top-4 right-4 z-10 text-white text-sm bg-black bg-opacity-20 px-3 py-1 rounded hover:bg-opacity-30 transition-colors">
        Customize
      </button>
    </div>
  );
};