import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import "./RotatingText.css";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const DEFAULT_TRANSITION = {
  duration: 0.32,
  ease: [0.23, 1, 0.32, 1],
};

const RotatingText = forwardRef((props, ref) => {
  const {
    texts = [],
    transition = DEFAULT_TRANSITION,
    effect = "slide",
    direction = "up",
    highlight = false,
    initial,
    animate,
    exit,
    animatePresenceMode = "wait",
    animatePresenceInitial = false,
    rotationInterval = 2800,
    staggerDuration = 0.02,
    staggerFrom = "first",
    loop = true,
    auto = true,
    splitBy = "words",
    onNext,
    mainClassName,
    splitLevelClassName,
    elementLevelClassName,
    ...rest
  } = props;

  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef(null);
  const [isInView, setIsInView] = useState(true);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  // Pausar la rotación automáticamente cuando el Hero no está visible en pantalla
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const resolvedInitial = useMemo(() => {
    if (prefersReducedMotion) return { opacity: 0 };
    if (initial !== undefined) return initial;
    if (effect === "fade") return { opacity: 0 };
    if (effect === "blur") return { opacity: 0, filter: "blur(6px)" };
    return { y: direction === "down" ? "-90%" : "90%", opacity: 0 };
  }, [prefersReducedMotion, initial, effect, direction]);

  const resolvedAnimate = useMemo(() => {
    if (prefersReducedMotion) return { opacity: 1 };
    if (animate !== undefined) return animate;
    if (effect === "fade") return { opacity: 1 };
    if (effect === "blur") return { opacity: 1, filter: "blur(0px)" };
    return { y: "0%", opacity: 1 };
  }, [prefersReducedMotion, animate, effect]);

  const resolvedExit = useMemo(() => {
    if (prefersReducedMotion) return { opacity: 0 };
    if (exit !== undefined) return exit;
    if (effect === "fade") return { opacity: 0 };
    if (effect === "blur") return { opacity: 0, filter: "blur(6px)" };
    return { y: direction === "down" ? "90%" : "-90%", opacity: 0 };
  }, [prefersReducedMotion, exit, effect, direction]);

  const splitIntoCharacters = (text) => {
    if (typeof Intl !== "undefined" && Intl.Segmenter) {
      const segmenter = new Intl.Segmenter("es", { granularity: "grapheme" });
      return Array.from(segmenter.segment(text), (segment) => segment.segment);
    }
    return Array.from(text);
  };

  const elements = useMemo(() => {
    const currentText = texts[currentTextIndex] || "";
    if (splitBy === "characters") {
      const words = currentText.split(" ");
      return words.map((word, i) => ({
        characters: splitIntoCharacters(word),
        needsSpace: i !== words.length - 1,
      }));
    }
    if (splitBy === "words") {
      return currentText.split(" ").map((word, i, arr) => ({
        characters: [word],
        needsSpace: i !== arr.length - 1,
      }));
    }
    if (splitBy === "lines") {
      return currentText.split("\n").map((line, i, arr) => ({
        characters: [line],
        needsSpace: i !== arr.length - 1,
      }));
    }
    return currentText.split(splitBy).map((part, i, arr) => ({
      characters: [part],
      needsSpace: i !== arr.length - 1,
    }));
  }, [texts, currentTextIndex, splitBy]);

  const getStaggerDelay = useCallback(
    (index, totalChars) => {
      if (totalChars <= 1) return 0;
      if (staggerFrom === "first") return index * staggerDuration;
      if (staggerFrom === "last") return (totalChars - 1 - index) * staggerDuration;
      if (staggerFrom === "center") {
        const center = Math.floor(totalChars / 2);
        return Math.abs(center - index) * staggerDuration;
      }
      if (staggerFrom === "random") {
        const randomIndex = Math.floor(Math.random() * totalChars);
        return Math.abs(randomIndex - index) * staggerDuration;
      }
      return Math.abs(staggerFrom - index) * staggerDuration;
    },
    [staggerFrom, staggerDuration]
  );

  const handleIndexChange = useCallback(
    (newIndex) => {
      setCurrentTextIndex(newIndex);
      if (onNext) onNext(newIndex);
    },
    [onNext]
  );

  const next = useCallback(() => {
    const nextIndex =
      currentTextIndex === texts.length - 1
        ? loop
          ? 0
          : currentTextIndex
        : currentTextIndex + 1;
    if (nextIndex !== currentTextIndex) {
      handleIndexChange(nextIndex);
    }
  }, [currentTextIndex, texts.length, loop, handleIndexChange]);

  const previous = useCallback(() => {
    const prevIndex =
      currentTextIndex === 0
        ? loop
          ? texts.length - 1
          : currentTextIndex
        : currentTextIndex - 1;
    if (prevIndex !== currentTextIndex) {
      handleIndexChange(prevIndex);
    }
  }, [currentTextIndex, texts.length, loop, handleIndexChange]);

  const jumpTo = useCallback(
    (index) => {
      const validIndex = Math.max(0, Math.min(index, texts.length - 1));
      if (validIndex !== currentTextIndex) {
        handleIndexChange(validIndex);
      }
    },
    [texts.length, currentTextIndex, handleIndexChange]
  );

  const reset = useCallback(() => {
    if (currentTextIndex !== 0) {
      handleIndexChange(0);
    }
  }, [currentTextIndex, handleIndexChange]);

  useImperativeHandle(
    ref,
    () => ({
      next,
      previous,
      jumpTo,
      reset,
    }),
    [next, previous, jumpTo, reset]
  );

  useEffect(() => {
    if (!auto || !isInView || texts.length <= 1) return;
    const intervalId = setInterval(next, rotationInterval);
    return () => clearInterval(intervalId);
  }, [next, rotationInterval, auto, isInView, texts.length]);

  const totalCharacters = elements.reduce(
    (sum, word) => sum + word.characters.length,
    0
  );

  return (
    <span
      ref={containerRef}
      className={cn(
        "text-rotate",
        highlight && "text-rotate-highlight",
        mainClassName
      )}
      {...rest}
    >
      <span className="text-rotate-sr-only">{texts[currentTextIndex]}</span>
      <AnimatePresence mode={animatePresenceMode} initial={animatePresenceInitial}>
        <motion.span
          key={currentTextIndex}
          className={cn(
            splitBy === "lines" ? "text-rotate-lines" : "text-rotate"
          )}
          aria-hidden="true"
        >
          {elements.map((wordObj, wordIndex, array) => {
            const previousCharsCount = array
              .slice(0, wordIndex)
              .reduce((sum, word) => sum + word.characters.length, 0);
            return (
              <span
                key={wordIndex}
                className={cn("text-rotate-word", splitLevelClassName)}
              >
                {wordObj.characters.map((char, charIndex) => (
                  <motion.span
                    key={charIndex}
                    initial={resolvedInitial}
                    animate={resolvedAnimate}
                    exit={resolvedExit}
                    transition={{
                      ...transition,
                      delay: getStaggerDelay(
                        previousCharsCount + charIndex,
                        totalCharacters
                      ),
                    }}
                    className={cn("text-rotate-element", elementLevelClassName)}
                  >
                    {char}
                  </motion.span>
                ))}
                {wordObj.needsSpace && (
                  <span className="text-rotate-space"> </span>
                )}
              </span>
            );
          })}
        </motion.span>
      </AnimatePresence>
    </span>
  );
});

RotatingText.displayName = "RotatingText";
export default RotatingText;
