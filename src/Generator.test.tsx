import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./Generator";

test("renders the generator controls", () => {
  render(<App />);
  expect(
    screen.getByRole("main", { name: /name generator/i })
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { level: 1, name: /name generator/i })
  ).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /randomise/i })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /developer/i })).toHaveAttribute(
    "href",
    "https://github.com/manix84"
  );
});
