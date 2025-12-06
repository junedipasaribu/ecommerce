import { useState, useEffect } from "react";
import promo1 from "../assets/images/promo1.png";
import promo2 from "../assets/images/promo2.png";
import promo3 from "../assets/images/promo3.png";
import small1 from "../assets/images/promoSmall1.png";
import small2 from "../assets/images/promoSmall2.png";
import "../styling/Carousel.css";

const CarouselPromo = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Data promosi utama
  const mainPromos = [
    {
      id: 1,
      image: promo1,
      alt: "Promo 1",
      title: "Big Sale",
      description: "Diskon hingga 70%",
      buttonText: "Belanja Sekarang",
      color: "#FF6B35",
    },
    {
      id: 2,
      image: promo2,
      alt: "Promo 2",
      title: "Flash Sale",
      description: "Harga spesial terbatas",
      buttonText: "Buruan Beli",
      color: "#00B894",
    },
    {
      id: 3,
      image: promo3,
      alt: "Promo 3",
      title: "New Arrival",
      description: "Produk terbaru",
      buttonText: "Jelajahi",
      color: "#6C5CE7",
    },
  ];

  // Data promosi kecil
  const smallPromos = [
    {
      id: 1,
      image: small1,
      alt: "Small promo 1",
      title: "New Arrival",
      description: "Produk terbaru",
      badge: "HOT",
      badgeColor: "#FF4757",
      buttonText: "Jelajahi",
    },
    {
      id: 2,
      image: small2,
      alt: "Small promo 2",
      title: "New new",
      description: "Produk terbaru",
      badge: "NEW",
      badgeColor: "#3742FA",
      buttonText: "Jelajahi",
    },
  ];

  // Auto slide setiap 5 detik
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % mainPromos.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [mainPromos.length, isAutoPlaying]);

  // Fungsi untuk handle next slide
  const handleNext = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % mainPromos.length);
  };

  // Fungsi untuk handle prev slide
  const handlePrev = () => {
    setActiveIndex(
      (prevIndex) => (prevIndex - 1 + mainPromos.length) % mainPromos.length
    );
  };

  // Fungsi untuk handle indicator click
  const handleIndicatorClick = (index) => {
    setActiveIndex(index);
  };

  // Fungsi untuk go to slide tertentu
  const goToSlide = (index) => {
    setActiveIndex(index);
  };

  return (
    <div className="carousel-promo-container">
      <div className="carousel-grid">
        {/* Main Carousel - Left (2/3) */}
        <div className="main-carousel-wrapper">
          <div
            className="main-carousel"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            {/* Carousel Slides */}
            <div
              className="carousel-track"
              style={{
                transform: `translateX(-${activeIndex * 100}%)`,
              }}
            >
              {mainPromos.map((promo, index) => (
                <div
                  key={promo.id}
                  className={`carousel-slide ${
                    index === activeIndex ? "active" : ""
                  }`}
                >
                  <img
                    src={promo.image}
                    alt={promo.alt}
                    className="carousel-image"
                  />
                  <div className="slide-content">
                    <div className="content-wrapper">
                      <span
                        className="promo-badge"
                        style={{ backgroundColor: promo.color }}
                      >
                        {promo.title}
                      </span>
                      <h2 className="slide-title">{promo.description}</h2>
                      <button
                        className="slide-button"
                        style={{ backgroundColor: promo.color }}
                      >
                        {promo.buttonText}
                        <span className="button-icon">→</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Buttons */}
            <button
              className="nav-button prev-button"
              onClick={handlePrev}
              aria-label="Previous slide"
            >
              <span className="nav-icon">‹</span>
            </button>
            <button
              className="nav-button next-button"
              onClick={handleNext}
              aria-label="Next slide"
            >
              <span className="nav-icon">›</span>
            </button>

            {/* Indicators */}
            <div className="carousel-indicators">
              {mainPromos.map((_, index) => (
                <button
                  key={index}
                  className={`indicator ${
                    index === activeIndex ? "active" : ""
                  }`}
                  onClick={() => handleIndicatorClick(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Slide Counter */}
            <div className="slide-counter">
              {activeIndex + 1} / {mainPromos.length}
            </div>
          </div>
        </div>

        {/* Small Promos - Right (1/3) */}
        <div className="side-promos-wrapper">
          {smallPromos.map((promo) => (
            <div
              key={promo.id}
              className="small-promo-card"
              style={{ borderTopColor: promo.badgeColor }}
            >
              <div className="promo-image-container">
                <img src={promo.image} alt={promo.alt} />
                <div className="promo-badge-container">
                  <button className="mini-promo-button">
                    <span
                      className="promo-small-badge"
                      style={{ backgroundColor: promo.badgeColor }}
                    >
                      {promo.buttonText}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Navigation Dots */}
      <div className="quick-navigation">
        {mainPromos.map((promo, index) => (
          <button
            key={promo.id}
            className={`quick-nav-dot ${index === activeIndex ? "active" : ""}`}
            onClick={() => goToSlide(index)}
            style={{
              backgroundColor: index === activeIndex ? promo.color : "#e0e0e0",
            }}
            aria-label={`Quick navigate to ${promo.title}`}
          />
        ))}
      </div>
    </div>
  );
};

export default CarouselPromo;
