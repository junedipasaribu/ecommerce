import { useState, useEffect } from "react";
import promo1 from "../assets/images/promo1.png";
import promo2 from "../assets/images/promo2.png";
import promo3 from "../assets/images/promo3.png";
import "../styling/Carousel.css";
import small1 from "../assets/images/promoSmall1.png";
import small2 from "../assets/images/promoSmall2.png";

const CarouselPromo = () => {
  return (
    <div className="carousel-container" style={{ alignItems: "center" }}>
      <div className="container">
        <div className="row align-items-start g-4">
          <div className="col-lg-8 col-md-12">
            <div
              id="carouselExampleIndicators"
              className="carousel slide h-100"
            >
              <div className="carousel-indicators">
                <button
                  type="button"
                  data-bs-target="#carouselExampleIndicators"
                  data-bs-slide-to="0"
                  className="active"
                  aria-current="true"
                  aria-label="Slide 1"
                ></button>
                <button
                  type="button"
                  data-bs-target="#carouselExampleIndicators"
                  data-bs-slide-to="1"
                  aria-label="Slide 2"
                ></button>
                <button
                  type="button"
                  data-bs-target="#carouselExampleIndicators"
                  data-bs-slide-to="2"
                  aria-label="Slide 3"
                ></button>
              </div>
              <div className="carousel-inner h-100">
                <div className="carousel-item active h-100">
                  <img
                    src={promo1}
                    className="d-block w-100 h-100 object-fit-cover"
                    alt="Promo 1"
                  />
                </div>
                <div className="carousel-item h-100">
                  <img
                    src={promo2}
                    className="d-block w-100 h-100 object-fit-cover"
                    alt="Promo 2"
                  />
                </div>
                <div className="carousel-item h-100">
                  <img
                    src={promo3}
                    className="d-block w-100 h-100 object-fit-cover"
                    alt="Promo 3"
                  />
                </div>
              </div>
              <button
                className="carousel-control-prev"
                type="button"
                data-bs-target="#carouselExampleIndicators"
                data-bs-slide="prev"
              >
                <span
                  className="carousel-control-prev-icon"
                  aria-hidden="true"
                ></span>
                <span className="visually-hidden">Previous</span>
              </button>
              <button
                className="carousel-control-next"
                type="button"
                data-bs-target="#carouselExampleIndicators"
                data-bs-slide="next"
              >
                <span
                  className="carousel-control-next-icon"
                  aria-hidden="true"
                ></span>
                <span className="visually-hidden">Next</span>
              </button>
            </div>
          </div>

          <div className="col-lg-4 col-md-12">
            <div className="d-flex flex-column h-100 g-3">
              <div className="card mb-3 flex-fill">
                <img
                  src={small1}
                  className="card-img-top h-100 object-fit-cover"
                  alt="Small promo 1"
                  style={{ height: "200px" }}
                />
              </div>

              <div className="card flex-fill">
                <img
                  src={small2}
                  className="card-img-top h-100 object-fit-cover"
                  alt="Small promo 2"
                  style={{ height: "200px" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarouselPromo;
