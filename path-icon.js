(function () {
  var SCROLL_SPEED = 42;
  var SEGMENT = "Policy Yatra\u00a0\u00a0|\u00a0\u00a0";
  var PATH_ID = "#path-yatra-curve";
  var MAX_RETRIES = 50;
  var scrollRafId = null;
  var scrollStartTime = null;

  function setPathRef(el) {
    el.setAttribute("href", PATH_ID);
    el.setAttributeNS("http://www.w3.org/1999/xlink", "href", PATH_ID);
  }

  function measureSegmentLength(svg) {
    var measureText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    measureText.setAttribute("class", "path-icon__label");
    var measurePath = document.createElementNS("http://www.w3.org/2000/svg", "textPath");
    setPathRef(measurePath);
    measurePath.textContent = SEGMENT;
    measureText.appendChild(measurePath);
    svg.appendChild(measureText);

    var length = measurePath.getComputedTextLength();
    svg.removeChild(measureText);
    return length;
  }

  function buildPattern(repeats) {
    var text = "";
    for (var i = 0; i < repeats; i += 1) {
      text += SEGMENT;
    }
    return text;
  }

  function startScroll(textPath, loopLength) {
    if (scrollRafId) {
      cancelAnimationFrame(scrollRafId);
    }

    scrollStartTime = performance.now();

    function tick(now) {
      var elapsed = (now - scrollStartTime) / 1000;
      var offset = (elapsed * SCROLL_SPEED) % loopLength;

      textPath.setAttribute("startOffset", String(offset));
      scrollRafId = requestAnimationFrame(tick);
    }

    scrollRafId = requestAnimationFrame(tick);
  }

  function initPathYatraText(retryCount) {
    var retry = retryCount || 0;
    var textPath = document.querySelector(".path-icon__text-path");
    var curve = document.getElementById("path-yatra-curve");
    if (!textPath || !curve) {
      return;
    }

    var svg = textPath.closest("svg");
    if (!svg) {
      return;
    }

    setPathRef(textPath);

    var segmentLength = measureSegmentLength(svg);
    if (!segmentLength) {
      if (retry < MAX_RETRIES) {
        setTimeout(function () {
          initPathYatraText(retry + 1);
        }, 50);
      }
      return;
    }

    var pathLength = curve.getTotalLength();
    var segmentCount = Math.ceil(pathLength / segmentLength) + 16;
    var pattern = buildPattern(segmentCount);

    textPath.textContent = pattern + pattern;
    var totalLength = textPath.getComputedTextLength();

    if (!totalLength) {
      if (retry < MAX_RETRIES) {
        setTimeout(function () {
          initPathYatraText(retry + 1);
        }, 50);
      }
      return;
    }

    if (totalLength / 2 < pathLength) {
      segmentCount += Math.ceil(pathLength / segmentLength) + 8;
      pattern = buildPattern(segmentCount);
      textPath.textContent = pattern + pattern;
      totalLength = textPath.getComputedTextLength();
    }

    textPath.setAttribute("startOffset", "0");
    textPath.setAttribute("method", "align");
    textPath.setAttribute("spacing", "auto");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    startScroll(textPath, segmentLength);
  }

  function start() {
    var run = function () {
      initPathYatraText(0);
    };

    var fontReady = Promise.resolve();
    if (document.fonts && document.fonts.load) {
      fontReady = Promise.all([
        document.fonts.load('500 22px "Satoshi"'),
        document.fonts.load('500 22px Satoshi'),
      ]).catch(function () {
        return document.fonts.ready;
      });
    } else if (document.fonts && document.fonts.ready) {
      fontReady = document.fonts.ready;
    }

    fontReady.then(function () {
      setTimeout(run, 100);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
