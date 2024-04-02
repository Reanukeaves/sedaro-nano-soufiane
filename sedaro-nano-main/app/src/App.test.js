import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

jest.mock("react-plotly.js", () => () => <div>Mocked Plot</div>);
jest.mock("./globe", () => () => <div>Globe Mock</div>);
jest.mock("three/examples/jsm/controls/OrbitControls", () => ({
  OrbitControls: jest.fn().mockImplementation(() => ({})),
}));

import App from "./App";

beforeAll(() => {
  global.URL.createObjectURL = jest.fn();
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () =>
        Promise.resolve([
          [1, 2, { Planet: { x: 0, y: 0 }, Satellite: { x: 1, y: 1 } }],
        ]),
    })
  );
});

//Clear between tests
beforeEach(() => {
  fetch.mockClear();
});

test("renders Globe initially and can switch to Plot", async () => {
  render(<App />);

  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
  expect(screen.getByText(/Show Globe/i)).toBeInTheDocument();

  const plotButton = screen.getByText(/Show Plot/i);
  fireEvent.click(plotButton);

  await waitFor(() =>
    expect(screen.getByText("Mocked Plot")).toBeInTheDocument()
  );
});
