import { AnimatePresence, LazyMotion, m } from "framer-motion";
import React from "react";
import st from "./Generator.module.scss";
import resources, { Resource } from "./resources";

const generationSpeedMS = 150;

const { animals, abjectives } = resources;
let interval: ReturnType<typeof setInterval>;
let intervalCount: number = 0;

function Generator() {
  const [randomName, setRandomName] = React.useState<Resource>({
    abjective: abjectives[Math.floor(Math.random() * abjectives.length)],
    animal: animals[Math.floor(Math.random() * animals.length)],
  });

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

  return (
    <div className={st.container}>
      <header className={st.header}>Name Generator</header>
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
              className={st.abjective}>
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
              className={st.animal}>
              {randomName.animal}
            </m.span>
          </AnimatePresence>
        </LazyMotion>
      </div>
      <button className={st.randomiseButton} onClick={randomiseName}>
        Randomise
      </button>
    </div>
  );
}

export default Generator;

const loadFeatures = () =>
  import("./framer-motion.js").then((res) => res.default);
