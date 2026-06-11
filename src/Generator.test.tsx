import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./Generator";

afterEach(() => {
  cleanup();
  document.documentElement.removeAttribute("data-theme");
  try {
    window.localStorage.removeItem("theme");
  } catch {
    // This test environment may provide a partial localStorage implementation.
  }
});

test("renders the generator controls", () => {
  render(<App />);
  expect(
    screen.getByRole("main", { name: /name generator/i })
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { level: 1, name: /name generator/i })
  ).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /randomise/i })).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: /copyright 2022 manix84/i })
  ).toHaveAttribute("href", "https://github.com/manix84");
});

test("defaults the theme control to auto and allows light mode", async () => {
  const user = userEvent.setup();

  render(<App />);

  const themeButton = screen.getByRole("button", { name: /auto theme/i });
  expect(document.documentElement).not.toHaveAttribute("data-theme");

  await user.click(themeButton);

  expect(
    screen.getByRole("button", { name: /light theme/i })
  ).toBeInTheDocument();
  expect(document.documentElement).toHaveAttribute("data-theme", "light");
});
