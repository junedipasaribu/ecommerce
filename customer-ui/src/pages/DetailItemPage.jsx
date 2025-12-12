import "../Index.css";
import CardFilter from "../components/CardFilter";
import DetailItem from "../components/DetailItemProduct";
import { useOutletContext } from "react-router-dom";

function DetailItemPage() {
  const { searchTerm } = useOutletContext();

  return (
    <div className="landing-page-wrapper">
      <div className="cart-full-grid">
        <DetailItem searchTerm={searchTerm} />
        <CardFilter />
      </div>
    </div>
  );
}

export default DetailItemPage;
