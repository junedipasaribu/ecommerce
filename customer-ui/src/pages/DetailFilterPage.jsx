import "../styling/DetailFilter.css";
import DetailFilter from "../components/DetailFilterProducts";
import { useSearchParams } from "react-router-dom";
import CardFilter from "../components/CardFilter";

function DetailFilterPage() {
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get("search") || "";
  return (
    <>
      <div className="landing-page-wrapper">
        <div className="cart-full-grid">
          <DetailFilter searchTerm={searchTerm} />
          <CardFilter />
        </div>
      </div>
    </>
  );
}

export default DetailFilterPage;
