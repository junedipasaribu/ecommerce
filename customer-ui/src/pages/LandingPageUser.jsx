import CarouselPromo from "../components/Carousel";
import CardFilter from "../components/CardFilter";
import "../Index.css";
import Car from "../components/test.jsx";

const LandingPage = () => {
  return (
    <div className="landing-page-wrapper">
      <div className="carousel-full-grid">
        <CarouselPromo />
      </div>

      <div className="cardfilter-full-grid">
        <CardFilter />
      </div>
    </div>
  );
};

export default LandingPage;
