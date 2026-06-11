import { AnimatePresence, LazyMotion, m } from "framer-motion";
import React from "react";
import st from "./Generator.module.scss";
import resources, { Resource } from "./resources";

const generationSpeedMS = 150;
const themeModes = ["auto", "light", "dark"] as const;
type ThemeMode = (typeof themeModes)[number];

const { animals, abjectives } = resources;
let interval: ReturnType<typeof setInterval>;
let intervalCount: number = 0;

function Generator() {
  const [themeMode, setThemeMode] =
    React.useState<ThemeMode>(getStoredThemeMode);
  const [randomName, setRandomName] = React.useState<Resource>({
    abjective: abjectives[Math.floor(Math.random() * abjectives.length)],
    animal: animals[Math.floor(Math.random() * animals.length)],
  });

  React.useEffect(() => {
    if (themeMode === "auto") {
      document.documentElement.removeAttribute("data-theme");
      storeThemePreference(null);
      return;
    }

    document.documentElement.dataset.theme = themeMode;
    storeThemePreference(themeMode);
  }, [themeMode]);

  const randomiseName = () => {
    interval = setInterval(() => {
      setRandomName({
        abjective: abjectives[Math.floor(Math.random() * abjectives.length)],
        animal: animals[Math.floor(Math.random() * animals.length)],
      });
      if (++intervalCount >= 20) {
        clearInterval(interval);
        intervalCount = 0;
      }
    }, generationSpeedMS);
    setRandomName({
      abjective: abjectives[Math.floor(Math.random() * abjectives.length)],
      animal: animals[Math.floor(Math.random() * animals.length)],
    });
  };

  const cycleThemeMode = () => {
    const nextIndex =
      (themeModes.indexOf(themeMode) + 1) % themeModes.length;
    setThemeMode(themeModes[nextIndex]);
  };

  const themeLabel = `${themeMode[0].toUpperCase()}${themeMode.slice(1)} theme`;

  return (
    <main aria-labelledby="page-title" className={st.container}>
      <button
        aria-label={`${themeLabel}. Activate to switch theme.`}
        className={st.themeButton}
        onClick={cycleThemeMode}
        title={themeLabel}
        type="button"
      >
        <span aria-hidden="true">{themeSymbolByMode[themeMode]}</span>
      </button>
      <h1 className={st.header} id="page-title">
        Name Generator
      </h1>
      <div className={st.nameContainer}>
        <LazyMotion features={loadFeatures}>
          <AnimatePresence>
            <m.span
              key={`word_${randomName.abjective}`}
              exit={{
                y: 50,
                opacity: 0,
                position: "absolute",
                pointerEvents: "none",
              }}
              initial={{
                y: -50,
                opacity: 0,
                position: "absolute",
                pointerEvents: "none",
              }}
              animate={{ y: 0, opacity: 1, position: "static" }}
              transition={{
                ease: "easeOut",
                duration: generationSpeedMS / 1000,
              }}
              className={st.abjective}
            >
              {randomName.abjective}
            </m.span>
          </AnimatePresence>
        </LazyMotion>
        <LazyMotion features={loadFeatures}>
          <AnimatePresence>
            <m.span
              key={`word_${randomName.animal}`}
              exit={{
                y: -50,
                opacity: 0,
                position: "absolute",
                pointerEvents: "none",
              }}
              initial={{
                y: 50,
                opacity: 0,
                position: "absolute",
                pointerEvents: "none",
              }}
              animate={{ y: 0, opacity: 1, position: "static" }}
              transition={{
                ease: "easeOut",
                duration: generationSpeedMS / 1000,
              }}
              className={st.animal}
            >
              {randomName.animal}
            </m.span>
          </AnimatePresence>
        </LazyMotion>
      </div>
      <button
        className={st.randomiseButton}
        onClick={randomiseName}
        type="button"
      >
        Randomise
      </button>
      <footer aria-label="Copyright" className={st.footer}>
        <a
          aria-label="Copyright 2022 manix84 GitHub profile"
          className={st.profileLink}
          href="https://github.com/manix84"
          rel="noreferrer"
          target="_blank"
        >
          © 2022 manix84
        </a>
      </footer>
    </main>
  );
}

export default Generator;

const loadFeatures = () =>
  import("./framer-motion.js").then((res) => res.default);

const isThemeMode = (value: string | null): value is ThemeMode =>
  themeModes.includes(value as ThemeMode);

const getStoredThemeMode = (): ThemeMode => {
  try {
    const storedTheme = window.localStorage.getItem("theme");
    return isThemeMode(storedTheme) ? storedTheme : "auto";
  } catch {
    return "auto";
  }
};

const storeThemePreference = (themeMode: Exclude<ThemeMode, "auto"> | null) => {
  try {
    if (themeMode === null) {
      window.localStorage.removeItem("theme");
      return;
    }

    window.localStorage.setItem("theme", themeMode);
  } catch {
    // Theme preference is an enhancement; the app should keep working without storage.
  }
};

const themeSymbolByMode: Record<ThemeMode, string> = {
  auto: "◐",
  light: "☼",
  dark: "☾",
};
