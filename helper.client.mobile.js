/**
 * Helper function for client.
 */

/**
 * Objective-c bridge.
 */
var ObjectiveCCall = function (functionName, args) {
    var iframe = document.createElement("IFRAME");
    iframe.setAttribute("src", "js-frame:" + functionName + ":" + encodeURIComponent(JSON.stringify(args)));
    iframe.setAttribute("height", "1px");
    iframe.setAttribute("width", "1px");
	iframe.style.visibility = "hidden";
    document.documentElement.appendChild(iframe);
    iframe.parentNode.removeChild(iframe);
    iframe = null;
}
