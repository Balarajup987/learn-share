import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

function Slider() {
  const images = [
    "/images/slider/slider1.jpeg",
    "/images/slider/slider2.jpeg",
    "/images/slider/slider3.jpeg",
    "/images/slider/slider4.jpeg",
  ];

  return (
    <div className="mt-7">
      <Swiper
        spaceBetween={0}
        centeredSlides={true}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation={true}
        modules={[Autoplay, Pagination, Navigation]}
        className="w-full h-[350px]"
      >
        {images.map((img, index) => (
          <SwiperSlide key={index}>
            <img
              src={img}
              alt={`slide-${index}`}
              className="w-full h-full object-cover"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default Slider;
