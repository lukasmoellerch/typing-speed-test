import distance from "./distance";
import { createGame } from "./ui";
import data from "./words";
declare let module: any;
if (module.hot) {
    module.hot.accept()
}
const start = [47, 53, 66];
const end = [83, 82, 237];
function shuffle(array) {
    for (let m = array.length; m; m--) {
        let i = Math.random() * m | 0;
        let t = array[m];
        array[m] = array[i];
        array[i] = t;
    }
}
function interpolate(startValue: number, endValue: number, stepNumber: number, lastStepNumber: number): number {
    return (endValue - startValue) * stepNumber / lastStepNumber + startValue;
}
function colorInterpolate(stepNumber: number, lastStepNumber: number): [number, number, number] {
    const r = interpolate(start[0], end[0], stepNumber, lastStepNumber);
    const g = interpolate(start[1], end[1], stepNumber, lastStepNumber);
    const b = interpolate(start[2], end[2], stepNumber, lastStepNumber);
    return [r, g, b];
}
function colorToString(color: [number, number, number]): string {
    return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
}

(function () {
    const el = document.getElementById("game")!;
    const wpmEl = document.getElementById("wpm")!;
    const cpmEl = document.getElementById("cpm")!;
    const errorEl = document.getElementById("e")!;
    let words: string[] = [];
    const game = createGame(el, {
        onEnd() {
            const q = words.join(" ");
            const w = words.length;
            const time = game.getTime();
            const minutes = time / 1000 / 60;
            const buffer = game.getBuffer();
            const c = buffer.length - 1;
            const error = (distance(q, buffer.substring(0, buffer.length - 1)) / q.length) * 100;

            cpmEl.innerText = `${(c / minutes).toPrecision(3)}`;
            wpmEl.innerText = `${(w / minutes).toPrecision(3)}`;
            errorEl.innerText = `${error.toPrecision(3)}%`
            start()
        },
        onProgress(word) {
            const color = colorToString(colorInterpolate(word, words.length));
            document.body.style.backgroundColor = color;
        }
    });
    function start() {
        shuffle(data.commonWords);
        words = data.commonWords.slice(0, 50);
        game.setWords(words);
    }
    start();
})()

