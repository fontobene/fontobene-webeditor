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

const glyph = Alphabet.b();
const bbox = glyph.bounding_box();
const width = getWidth(bbox);
const height = getHeight(bbox);
console.log('w=', width, 'h=', height);

const canvas = document.getElementById("canvas");
canvas.width = width * SCALE_FACTOR;
canvas.height = height * SCALE_FACTOR;

const ctx = canvas.getContext("2d");

/**
 * Canvas coordinates start at the top left, while FontoBene coordiantes start
 * at the bottom left. Therefore we need to invert the Y axis.
 */
function fixY(y) {
    return height - y;
}

function distance(x1, y1, x2, y2) {
    const dx = (x2 - x1);
    const dy = (y2 - y1);
    return Math.sqrt(dx*dx + dy*dy);
}

function angleBetween(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
}

function drawArcSegment(ctx, startX, startY, endX, endY, angle) {
    console.log("---");
    console.log("start=(", startX, ",", startY, "), end=(", endX, ",", endY, "), angle=", angle);

    // We need to convert from the format used in FontoBene (angle at
    // centerpoint) to the format Canvas uses (centerpoint coordinates +
    // radius). For that, let's first break down the problem.
    //
    // First, convert from the FontoBene angle format to radians.
    const gamma = Math.abs(angle) * 20 / 180 * Math.PI;
    console.log('Gamma is', gamma);

    // Then we need to find the coordinates of the centerpoint.
    //
    //  + A
    //  |\
    //  | + C
    //  |/
    //  + B
    //
    // In this configuration, the y coordinate of C is always in the middle
    // between A and B.
    //
    // If we would flip the triangle 90° to the left, we can see that the Y
    // coordinate can be seen as the height of an isosceles triangle. If we
    // split that triangle in half, we get a right triangle, allowing us to use
    // standard trigonometry.
    //
    // M
    // +--+ C
    // | /
    // |/
    // + B
    const bm = distance(startX, startY, endX, endY) / 2;
    const bc = bm / Math.sin(gamma / 2);
    console.log("bm=" + bm);
    console.log("bc=" + bc);

    // Given the distance BC we can find the the coordinate of the centerpoint C.
    const beta = (Math.PI / 2) - (gamma / 2);
    console.log("beta=" + beta);
    const angle_bc = Math.abs(Math.atan2(startY - endY, startX - endX) - beta);
    console.log("angle_bc=" + angle_bc);
    const cx = startX + bc * Math.cos(angle_bc);
    const cy = startY + bc * Math.sin(angle_bc);

    console.log("cx=" + cx);
    console.log("cy=" + cy);

    // The arc is counterclockwise if the FontoBene angle is negative.
    const ccw = angle < 0;

    console.log("ccw=" + ccw);

    ctx.arc(
        cx,
        cy,
        bc,
        angleBetween(cx, cy, endX, endY),
        angleBetween(cx, cy, startX, startY),
        ccw,
    );

    console.log("---");
}

const drawCanvas = (glyph) => {
    ctx.beginPath();
    ctx.lineWidth = 1 / window.devicePixelRatio;
    ctx.strokeStyle = LINE_COLOR;

    const dataPtr = glyph.data();
    const count = glyph.count();
    const data = new Float32Array(memory.buffer, dataPtr, count * 3);
    let prevBulge = null;
    let prevX = null;
    let prevY = null;
    for (let i = 0; i < count; i++) {
        const offset = i * 3;
        const x = data[offset];
        const y = fixY(data[offset + 1]);
        const bulge = data[offset + 2];
        console.debug("x=", x, ", y=", y, ", bulge=", bulge);

        if (prevBulge !== null && prevX !== null && prevY !== null) {
            drawArcSegment(
                ctx,
                prevX * SCALE_FACTOR, prevY * SCALE_FACTOR,
                x * SCALE_FACTOR, y * SCALE_FACTOR,
                prevBulge
            );
        } else {
            ctx.lineTo(x * SCALE_FACTOR, y * SCALE_FACTOR);
        }
        if (isNaN(bulge)) {
            prevBulge = null;
        } else {
            prevBulge = bulge
        }
        prevX = x;
        prevY = y;
    }

    ctx.stroke();
};

drawCanvas(glyph);
