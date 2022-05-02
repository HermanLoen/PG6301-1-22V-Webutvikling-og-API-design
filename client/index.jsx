import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";

class FrontPage extends React.Component {
  render() {
    return (
      <div>
        <h1>Front page</h1>
        <div>
          <Link to="/login">Login</Link>
        </div>
        <div>
          <Link to="/profile">Profile</Link>
        </div>
      </div>
    );
  }
}

function Application() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={"/"} element={<FrontPage />} />
        <Route path={"/login"} element={<h1>Login</h1>} />
        <Route path={"/login/callback"} element={<h1>Login callback</h1>} />
        <Route path={"/profile"} element={<h1>Profile</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.render(<Application />, document.getElementById("app"));
