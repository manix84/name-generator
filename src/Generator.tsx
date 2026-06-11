import { AnimatePresence, LazyMotion, m } from "framer-motion";
import React from "react";
import st from "./Generator.module.scss";
import resources, { Resource } from "./resources";

const generationSpeedMS = 150;
const fontFitDelayMS = generationSpeedMS + 40;
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
  const { containerRef: nameContainerRef, measureRef: nameMeasureRef } =
    useDynamicSingleLineText(
      [randomName.abjective, randomName.animal],
      fontFitDelayMS
    );

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
      <div className={st.nameContainer} ref={nameContainerRef}>
        <div className={st.nameRow}>
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
        <div aria-hidden="true" className={st.measureRow} ref={nameMeasureRef}>
          <span className={st.abjective}>{randomName.abjective}</span>
          <span className={st.animal}>{randomName.animal}</span>
        </div>
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

const useDynamicSingleLineText = (
  dependencies: React.DependencyList,
  delayedFitMs = 0
) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const measureRef = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    const container = containerRef.current;
    const measure = measureRef.current;

    if (!container || !measure) {
      return undefined;
    }

    let animationFrame = 0;
    let isActive = true;
    const scheduleFit = () => {
      if (!isActive) {
        return;
      }

      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => {
        if (!isActive) {
          return;
        }

        fitSingleLineText(container, measure);
      });
    };

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(scheduleFit);

    resizeObserver?.observe(container);
    window.addEventListener("resize", scheduleFit);
    scheduleFit();

    const delayedFit = window.setTimeout(scheduleFit, delayedFitMs);
    if ("fonts" in document) {
      void document.fonts.ready.then(scheduleFit);
    }

    return () => {
      isActive = false;
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(delayedFit);
      window.removeEventListener("resize", scheduleFit);
      resizeObserver?.disconnect();
    };
  }, dependencies);

  return { containerRef, measureRef };
};

const fitSingleLineText = (container: HTMLElement, measure: HTMLElement) => {
  container.style.removeProperty("--name-font-size");

  const availableWidth = getAvailableInlineWidth(container);
  const measuredWidth = measure.getBoundingClientRect().width;

  if (availableWidth <= 0 || measuredWidth <= availableWidth) {
    return;
  }

  const styles = window.getComputedStyle(container);
  const maxFontSize = Number.parseFloat(styles.fontSize);
  const minFontSize =
    Number.parseFloat(styles.getPropertyValue("--name-min-font-size")) || 20;
  const fittedFontSize = Math.max(
    minFontSize,
    maxFontSize * (availableWidth / measuredWidth)
  );

  container.style.setProperty("--name-font-size", `${fittedFontSize}px`);
};

const getAvailableInlineWidth = (element: HTMLElement) => {
  const styles = window.getComputedStyle(element);
  const paddingLeft = Number.parseFloat(styles.paddingLeft) || 0;
  const paddingRight = Number.parseFloat(styles.paddingRight) || 0;

  return element.getBoundingClientRect().width - paddingLeft - paddingRight;
};
