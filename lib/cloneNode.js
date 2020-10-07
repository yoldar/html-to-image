import { createImage, toArray, svgToDataURL } from './utils';
import clonePseudoElements from './clonePseudoElements';
function cloneSingleNode(nativeNode) {
    if (nativeNode instanceof HTMLCanvasElement) {
        var dataURL = nativeNode.toDataURL();
        if (dataURL === 'data:,') {
            return Promise.resolve(nativeNode.cloneNode(false));
        }
        return createImage(dataURL);
    }
    if (nativeNode.tagName && nativeNode.tagName.toLowerCase() === 'svg') {
        return Promise.resolve(nativeNode)
            .then(function (svg) { return svgToDataURL(svg); })
            .then(createImage);
    }
    return Promise.resolve(nativeNode.cloneNode(false));
}
function cloneChildren(nativeNode, clonedNode, filter) {
    var children = toArray(nativeNode.childNodes);
    if (children.length === 0) {
        return Promise.resolve(clonedNode);
    }
    // clone children in order
    return children.reduce(function (done, child) { return done
        .then(function () { return cloneNode(child, filter); })
        .then(function (clonedChild) {
        if (clonedChild) {
            clonedNode.appendChild(clonedChild);
        }
    }); }, Promise.resolve())
        .then(function () { return clonedNode; });
}
function cloneCssStyle(nativeNode, clonedNode) {
    var source = window.getComputedStyle(nativeNode);
    var target = clonedNode.style;
    if (source.cssText) {
        target.cssText = source.cssText
            .replace(/color: rgb\(255, 255, 255\);/g, 'color: #000;')
            .replace(/color: rgba\(255, 255, 255, 0.7\);/g, 'color: #000;')
            .replace(/color: rgba\(255, 255, 255, 0.5\);/g, 'color: #000;');
    }
    else {
        toArray(source).forEach(function (name) {
            if (source.getPropertyValue(name) === 'rgb(255, 255, 255)') {
                target.setProperty(name, '#000', source.getPropertyPriority(name));
            }
            else if (source.getPropertyValue(name) === 'rgba(255, 255, 255, 0.5)') {
                target.setProperty(name, '#000', source.getPropertyPriority(name));
            }
            else if (source.getPropertyValue(name) === 'rgba(255, 255, 255, 0.7)') {
                target.setProperty(name, '#000', source.getPropertyPriority(name));
            }
            else {
                target.setProperty(name, source.getPropertyValue(name), source.getPropertyPriority(name));
            }
        });
    }
}
function cloneInputValue(nativeNode, clonedNode) {
    if (nativeNode instanceof HTMLTextAreaElement) {
        clonedNode.innerHTML = nativeNode.value;
    }
    if (nativeNode instanceof HTMLInputElement) {
        clonedNode.setAttribute('value', nativeNode.value);
    }
}
function decorate(nativeNode, clonedNode) {
    if (!(clonedNode instanceof Element)) {
        return clonedNode;
    }
    return Promise.resolve()
        .then(function () { return cloneCssStyle(nativeNode, clonedNode); })
        .then(function () { return clonePseudoElements(nativeNode, clonedNode); })
        .then(function () { return cloneInputValue(nativeNode, clonedNode); })
        .then(function () { return clonedNode; });
}
export default function cloneNode(domNode, filter, isRoot) {
    if (!isRoot && filter && !filter(domNode)) {
        return Promise.resolve(null);
    }
    return Promise.resolve(domNode)
        .then(cloneSingleNode)
        .then(function (clonedNode) { return cloneChildren(domNode, clonedNode, filter); })
        .then(function (clonedNode) { return decorate(domNode, clonedNode); });
}
