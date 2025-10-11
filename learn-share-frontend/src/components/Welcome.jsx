import React from "react";
import { ReactTyped } from "react-typed";

const Welcome = ({ userName, profileImage }) => {
  return (
    <div className="flex items-start justify-center gap-4 bg-gray-100 p-4 rounded-xl shadow-md w-[95%] mx-auto mt-5">
      <img
        src={profileImage}
        alt="Profile"
        className="w-14 h-14 rounded-full border-2 border-gray-300"
      />
      <h1 className="text-xl font-semibold text-gray-800 pt-2">
        Welcome back,{" "}
        <ReactTyped
          strings={[userName, "Let's start learning!", "Explore new courses!"]}
          typeSpeed={60}
          backSpeed={40}
          loop
        />
      </h1>
    </div>
  );
};

export default Welcome;
