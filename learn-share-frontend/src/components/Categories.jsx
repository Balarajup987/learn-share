import React from "react";
import Card from "./Card";
import { useNavigate } from "react-router-dom";

function Categories() {
  const navigate = useNavigate();

  const categories = [
    {
      name: "Programming",
      img: "https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg",
    },
    {
      name: "Web Development",
      img: "https://images.pexels.com/photos/11035371/pexels-photo-11035371.jpeg",
    },
    {
      name: "Data Science",
      img: "https://images.pexels.com/photos/669619/pexels-photo-669619.jpeg",
    },
    {
      name: "Machine Learning",
      img: "https://images.pexels.com/photos/5860702/pexels-photo-5860702.jpeg",
    },
    {
      name: "Cloud Computing",
      img: "https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg",
    },
    {
      name: "Cyber Security",
      img: "https://images.pexels.com/photos/5380640/pexels-photo-5380640.jpeg",
    },
    {
      name: "UI/UX Design",
      img: "https://images.pexels.com/photos/3184298/pexels-photo-3184298.jpeg",
    },
    {
      name: "DevOps",
      img: "https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg",
    },
  ];

  const handleChatClick = (teacher) => {
    navigate("/chat", { state: { teacher } });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 mt-10">
      <h2 className="text-2xl font-bold mb-6">Explore Categories</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {categories.map((category, index) => (
          <Card
            key={index}
            image={category.img}
            title={category.name}
            onClick={() => handleChatClick(category)}
          />
        ))}
      </div>
    </div>
  );
}

export default Categories;
