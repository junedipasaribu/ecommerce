import React from "react";
import drugs from "../../assets/images/drugs.jpeg";

const ImgSpl = ({ width = "100%", height = "auto", alt = "image" }) => {
  return <img src={drugs} width={width} height={height} alt={alt} />;
};

export default ImgSpl;
