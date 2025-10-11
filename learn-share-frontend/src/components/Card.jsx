import React from "react";

function Card({ image, title, onClick }) {
  return (
    <div
      className="relative rounded-lg overflow-hidden shadow-lg cursor-pointer hover:scale-105 transform transition"
      onClick={onClick}
    >
      <img
        src={image}
        alt={title}
        className="w-full h-40 object-cover"
      />
      <div className="absolute bottom-0 bg-black bg-opacity-50 w-full text-white text-center py-2 font-semibold">
        {title}
      </div>
    </div>
  );
}

export default Card;
