import cloneNode from './cloneNode';
import embedWebFonts from './embedWebFonts';
import embedImages from './embedImages';
import createSvgDataURL from './createSvgDataURL';
import applyStyleWithOptions from './applyStyleWithOptions';
import { createImage, delay, canvasToBlob, getNodeWidth, getNodeHeight, getPixelRatio, } from './utils';
function getImageSize(domNode, options) {
    if (options === void 0) { options = {}; }
    var width = options.width || getNodeWidth(domNode);
    var height = options.height || getNodeHeight(domNode);
    return { width: width, height: height };
}
export function toSvgDataURL(domNode, options) {
    if (options === void 0) { options = {}; }
    var _a = getImageSize(domNode, options), width = _a.width, height = _a.height;
    return cloneNode(domNode, options.filter, true)
        .then(function (clonedNode) { return embedWebFonts(clonedNode, options); })
        .then(function (clonedNode) { return embedImages(clonedNode, options); })
        .then(function (clonedNode) { return applyStyleWithOptions(clonedNode, options); })
        .then(function (clonedNode) { return createSvgDataURL(clonedNode, width, height); });
}
export function toCanvas(domNode, options) {
    if (options === void 0) { options = {}; }
    return toSvgDataURL(domNode, options)
        .then(createImage)
        .then(delay(100))
        .then(function (image) {
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        var ratio = getPixelRatio();
        var _a = getImageSize(domNode, options), width = _a.width, height = _a.height;
        canvas.width = width * ratio;
        canvas.height = height * ratio;
        canvas.style.width = "" + width;
        canvas.style.height = "" + height;
        context.scale(ratio, ratio);
        if (options.backgroundColor) {
            context.fillStyle = options.backgroundColor;
            context.fillRect(0, 0, canvas.width, canvas.height);
        }
        context.drawImage(image, 0, 0);
        return canvas;
    });
}
export function toPixelData(domNode, options) {
    if (options === void 0) { options = {}; }
    var _a = getImageSize(domNode, options), width = _a.width, height = _a.height;
    return toCanvas(domNode, options)
        .then(function (canvas) { return (canvas.getContext('2d').getImageData(0, 0, width, height).data); });
}
export function toPng(domNode, options) {
    if (options === void 0) { options = {}; }
    return toCanvas(domNode, options).then(function (canvas) { return (canvas.toDataURL()); });
}
export function toJpeg(domNode, options) {
    if (options === void 0) { options = {}; }
    return toCanvas(domNode, options).then(function (canvas) { return (canvas.toDataURL('image/jpeg', options.quality || 1)); });
}
export function toBlob(domNode, options) {
    if (options === void 0) { options = {}; }
    return toCanvas(domNode, options).then(canvasToBlob);
}
export default {
    toSvgDataURL: toSvgDataURL,
    toCanvas: toCanvas,
    toPixelData: toPixelData,
    toPng: toPng,
    toJpeg: toJpeg,
    toBlob: toBlob,
};
