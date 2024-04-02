import App from "./App";
import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import reportWebVitals from "./reportWebVitals";
import "./styles/globals.scss";

const rootElement = document.getElementById("root")!;
const root = ReactDOM.createRoot(rootElement);

const Main = () => {
  useEffect(() => {
    reportWebVitals(console.log);
  }, []);

  return (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

root.render(<Main />);
