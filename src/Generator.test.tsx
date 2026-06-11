import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./Generator";

test("renders the generator controls", () => {
  render(<App />);
  expect(screen.getByText(/name generator/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /randomise/i })).toBeInTheDocument();
});
