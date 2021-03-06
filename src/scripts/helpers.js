import randomWords from "random-words";
import { compose, map, flatten, find, findIndex, filter } from "lodash/fp";

export const getTotalChars = (words) => {
  return compose(
    (chars) => chars.length,
    flatten,
    map((word) => word.chars)
  )(words);
};

export const getTotalErrors = (words) => {
  return compose(
    (chars) => chars.length,
    filter((char) => char.isError),
    flatten,
    map((word) => word.chars)
  )(words);
};

export const getSpeed = (elapsedTimeInMs, words) => {
  const totalChars = getTotalChars(words);
  const elapsedTimeInMinutes = elapsedTimeInMs / 60000;
  const result = totalChars / 5 / elapsedTimeInMinutes;

  return Number(result.toFixed(1));
};

export const getActiveCharIndex = (words) => {
  return compose(
    findIndex((char) => char.isActive),
    flatten,
    map((word) => word.chars)
  )(words);
};

export const setActiveCharIndex = (index, words) => {
  let charIndex = 0;

  return words.map((word) => {
    const chars = word.chars.map((char) => {
      const isActive = index === charIndex;
      const isTyped = charIndex < index;

      charIndex++;

      return { ...char, isTyped, isActive };
    });

    return { ...word, chars };
  });
};

export const setErrorCharIndex = (index, words) => {
  let charIndex = 0;

  return words.map((word) => {
    const chars = word.chars.map((char) => {
      const isError = index === charIndex || char.isError;

      charIndex++;

      return { ...char, isError };
    });

    return { ...word, chars };
  });
};

export const generateWords = (totalWords, offset = 0) => {
  const totalSpaces = totalWords - 1;
  const totalAll = totalSpaces + totalWords;
  const words = randomWords(totalWords);
  let wordIndex = 0;
  let globalCharIndex = 0;

  const results = Array.from({ length: totalAll }).map((_, index) => {
    const isSpace = index % 2 === 1;
    const isLast = index === totalAll - 1;
    const word = isSpace ? "_" : words[wordIndex];

    if (!isSpace) {
      wordIndex++;
    }

    const chars = word.split("").map((char) => {
      const code = isSpace ? 32 : char.charCodeAt(0) - 32;
      const isActive = offset === globalCharIndex;

      globalCharIndex++;

      return {
        text: char,
        code: code,
        isTyped: false,
        isError: false,
        isActive,
      };
    });

    return {
      text: word,
      speed: 0,
      isLast,
      isSpace,
      chars,
    };
  });

  return results;
};

export const isActiveCharMatch = (keyCode, words) => {
  return compose(
    (char) => keyCode === char.code,
    find((char) => char.isActive),
    flatten,
    map((word) => word.chars)
  )(words);
};

export const isActiveCharLast = (words) => {
  const totalChars = getTotalChars(words);
  const convertedFind = find.convert({ cap: false });

  return compose(
    (char) => !!char,
    convertedFind((char, index) => {
      const isActive = char.isActive;
      const isLast = index === totalChars - 1;

      return isActive && isLast;
    }),
    flatten,
    map((word) => word.chars)
  )(words);
};
