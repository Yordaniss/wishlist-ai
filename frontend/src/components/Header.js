import React from "react";
import { Link } from "react-router-dom";
import { SvgIcon } from "@progress/kendo-react-common";
import { homeIcon } from "@progress/kendo-svg-icons";

const Header = () => {
  return (
    <header className="app-header">
      <Link to="/" className="home-button">
        <SvgIcon icon={homeIcon} size="medium" />
      </Link>
      <h1>🎁 My Wishlist App</h1>
    </header>
  );
};

export default Header;
