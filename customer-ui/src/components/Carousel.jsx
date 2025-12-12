import { useState, useEffect } from "react";
import { mainPromos, smallPromos } from "./test/SampleCarousel";
import "../styling/CarouselPromo.css";

const CarouselPromo = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying || mainPromos.length === 0) return;
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % mainPromos.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [mainPromos.length, isAutoPlaying]);

  const handleNext = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % mainPromos.length);
  };

  const handlePrev = () => {
    setActiveIndex(
      (prevIndex) => (prevIndex - 1 + mainPromos.length) % mainPromos.length
    );
  };

  if (!mainPromos || mainPromos.length === 0) {
    return <div className="carousel-loading">Loading promos...</div>;
  }

  return (
    <div className="carousel-promo-container">
      <div className="carousel-grid">
        {/* Main Carousel - Left */}
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
                  <div className="slide-image-container">
                    <img
                      src={promo.image}
                      alt={promo.alt}
                      className="carousel-image"
                      loading="lazy"
                    />
                    <div className="slide-overlay"></div>
                  </div>
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
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Slide Counter */}
            <div className="slide-counter">
              <span className="current-slide">{activeIndex + 1}</span>
              <span className="total-slides"> / {mainPromos.length}</span>
            </div>
          </div>
        </div>

        {/* Small Promos - Right */}
        <div className="side-promos-wrapper">
          {smallPromos &&
            smallPromos.slice(0, 2).map((promo) => (
              <div
                key={promo.id}
                className="small-promo-card"
                style={{ borderTopColor: promo.badgeColor }}
              >
                <div className="small-promo-image-container">
                  <img
                    src={promo.image}
                    alt={promo.alt}
                    className="small-promo-image"
                    loading="lazy"
                  />
                  <div className="small-promo-content">
                    <div className="small-promo-badge-container">
                      <span
                        className="small-promo-badge"
                        style={{ backgroundColor: promo.badgeColor }}
                      >
                        {promo.title || promo.buttonText}
                      </span>
                    </div>
                    {promo.description && (
                      <p className="small-promo-desc">{promo.description}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default CarouselPromo;
