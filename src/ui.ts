import styles from "./styles.css";
interface Stats {
    totalCharsByMillis: [number, number][];
    totalWordsByMillis: [number, number][];
}
interface Game {
    setWords(words: string[]): void;
    getTime(): number;
    getStats(): Stats;
    getBuffer(): string;
    getCorrectBuffer(): string;
}
interface Handlers {
    onEnd?(): void;
    onProgress?(word: number): void;
}
export function createGame(rootEl: HTMLElement, handlers: Handlers = {}): Game {
    const wrapperEl = document.createElement("div");
    wrapperEl.classList.add(styles.wrapper);
    const inputEl = document.createElement("input");
    inputEl.classList.add(styles.input);
    const textEl = document.createElement("div");
    textEl.classList.add(styles.text);
    const writtenEl = document.createElement("span");
    writtenEl.classList.add(styles.written);
    const oldEl = document.createElement("span");
    oldEl.classList.add(styles.old);
    const currentWordEl = document.createElement("span");
    currentWordEl.classList.add(styles.currentWord);
    const correctEl = document.createElement("span");
    correctEl.classList.add(styles.correct);
    const incorrectEl = document.createElement("span");
    incorrectEl.classList.add(styles.incorrect);
    const rightEl = document.createElement("span");
    const currentWordRestEl = document.createElement("span");
    const otherWordsEl = document.createElement("span");
    otherWordsEl.classList.add(styles.otherWords);

    rootEl.appendChild(wrapperEl);
    wrapperEl.appendChild(textEl);
    textEl.appendChild(writtenEl);
    writtenEl.appendChild(oldEl);
    writtenEl.appendChild(currentWordEl);
    currentWordEl.appendChild(inputEl);
    currentWordEl.appendChild(correctEl);
    currentWordEl.appendChild(incorrectEl);
    textEl.appendChild(rightEl);
    rightEl.appendChild(currentWordRestEl);
    rightEl.appendChild(otherWordsEl);

    let words: string[] = [];

    let currentWordIndex = 0;
    let wordIndex = 0;
    let incorrectString = "";
    let buffer = "";
    let correctBuffer = "";
    let started = false;
    let startTime = new Date();

    let totalCharsByMillis: [number, number][] = [];
    let totalWordsByMillis: [number, number][] = [];

    const update = () => {
        if (wordIndex >= words.length) {
            correctEl.innerText = "";
            incorrectEl.innerText = "";
            currentWordRestEl.innerText = "";
            return;
        }
        const current = words[wordIndex];
        correctEl.innerText = current.substring(0, currentWordIndex);
        incorrectEl.innerText = incorrectString;
        currentWordRestEl.innerText = current.substring(currentWordIndex) + " ";
        const off = writtenEl.offsetWidth;
        textEl.style.transform = `translateX(-${off}px)`;
    }
    const updateRest = () => {
        otherWordsEl.innerText = words.slice(wordIndex + 1).join(" ");
    }
    const handler = () => {
        if (!started) {
            started = true;
            startTime = new Date();
        }
        let now = new Date();
        let startDiff = now.getTime() - startTime.getTime();

        if (wordIndex >= words.length) {
            return;
        }
        const current = words[wordIndex];
        const value = inputEl.value;


        let i = 0;
        while (i < current.length && i < value.length && value[i] === current[i]) {
            i++;
        }

        totalCharsByMillis.push([startDiff, buffer.length + value.length]);
        if (value.indexOf(" ") !== -1) {
            if (value === current + " ") {
                const el = document.createElement("span");
                el.innerText = value;
                el.classList.add(styles.correct);
                oldEl.appendChild(el);
            } else {
                const el = document.createElement("span");
                el.innerText = value.substring(0, value.length - 1) + current.substring(i) + " ";
                el.classList.add(styles.incorrect);
                oldEl.appendChild(el);
            }
            correctBuffer += current + " ";
            const el = document.createElement("span");
            el.innerText = " ";
            oldEl.appendChild(el);
            totalWordsByMillis.push([startDiff, wordIndex + 1]);

            buffer += value;
            inputEl.value = "";
            currentWordIndex = 0;
            incorrectString = "";
            wordIndex++;
            updateRest();
            update();
            if (wordIndex >= words.length) {
                if (handlers.onEnd) handlers.onEnd();
            }
            return;
        }

        if (handlers.onProgress) {
            handlers.onProgress(wordIndex + (i / current.length));
        }
        currentWordIndex = i;
        incorrectString = value.substring(i);
        update();
    }
    const setWords = (newWords: string[]) => {
        words = newWords;
        while (oldEl.firstChild) {
            oldEl.removeChild(oldEl.firstChild);
        }

        currentWordIndex = 0;
        wordIndex = 0;
        incorrectString = "";
        buffer = "";
        started = false;

        updateRest();
        update();

        if (handlers.onProgress) {
            handlers.onProgress(0);
        }
    }
    const getTime = () => (new Date().getTime()) - startTime.getTime();
    const getStats = () => ({ totalCharsByMillis, totalWordsByMillis });
    const getBuffer = () => buffer;
    const getCorrectBuffer = () => correctBuffer;

    inputEl.addEventListener("keydown", handler);
    inputEl.addEventListener("paste", handler);
    inputEl.addEventListener("input", handler);
    inputEl.addEventListener("change", handler);
    rootEl.addEventListener("click", () => inputEl.focus());
    updateRest();
    update();
    return {
        setWords,
        getTime,
        getStats,
        getBuffer,
        getCorrectBuffer
    }
}