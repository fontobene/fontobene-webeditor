import { Alphabet } from "./fontobene_webeditor";
import { memory } from "./fontobene_webeditor_bg";

const LINE_COLOR = "#444444";
const SCALE_FACTOR = 10.0;

function getWidth(bbox) {
    const xOffset = bbox.x_min;
    return bbox.x_max - xOffset;
}

function getHeight(bbox) {
    const yOffset = bbox.y_min;
    return bbox.y_max - yOffset;
}

const glyph = Alphabet.a();
const bbox = glyph.bounding_box();
const width = getWidth(bbox);
const height = getHeight(bbox);
console.log('w=', width, 'h=', height);

const canvas = document.getElementById("canvas");
canvas.width = width * SCALE_FACTOR;
canvas.height = height * SCALE_FACTOR;

const ctx = canvas.getContext("2d");

const drawCanvas = (glyph) => {
    ctx.beginPath();
    ctx.lineWidth = 1 / window.devicePixelRatio;
    ctx.strokeStyle = LINE_COLOR;

    const dataPtr = glyph.data();
    const count = glyph.count();
    const data = new Float32Array(memory.buffer, dataPtr, count * 3);
    for (let i = 0; i < count; i++) {
        const offset = i * 3;
        const x = data[offset];
        const y = data[offset + 1];
        const bulge = data[offset + 2];
        console.debug("x=", x, ", y=", y, ", bulge=", bulge);

        ctx.lineTo(x * SCALE_FACTOR, y * SCALE_FACTOR);
    }

    ctx.stroke();
};

drawCanvas(glyph);
