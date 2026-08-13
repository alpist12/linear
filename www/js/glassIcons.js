// 손그림 라인아트 스타일의 잔 아이콘 세트.
// 유리잔 윤곽은 currentColor(선), 액체는 칵테일 고유 색상(면)으로 그린다.
var GlassIcons = (function () {
  "use strict";

  var OUTLINES = {
    "하이볼 잔": {
      glass:
        "M11 7 L9.5 39 C9.5 40.5 10.7 41.5 12.2 41.5 L19.8 41.5 C21.3 41.5 22.5 40.5 22.5 39 L21 7",
      rim: "M11 7 L21 7",
      liquid: "M10.1 21 L21.9 21 L21.1 39 C21.1 40 20.2 40.7 19 40.7 L13 40.7 C11.8 40.7 10.9 40 10.9 39 Z",
    },
    "락 글라스": {
      glass: "M8 19 L7 39 C7 40.4 8.3 41.5 10 41.5 L22 41.5 C23.7 41.5 25 40.4 25 39 L24 19",
      rim: "M8 19 L24 19",
      liquid: "M7.4 27 L24.6 27 L24 39 C24 40 23 40.8 22 40.8 L10 40.8 C9 40.8 8 40 8 39 Z",
    },
    "칵테일 잔": {
      glass:
        "M6 9 C6 18 10.5 25 16 25 C21.5 25 26 18 26 9 M16 25 L16 38 M9.5 40.5 L22.5 40.5",
      rim: "M6 9 L26 9",
      liquid:
        "M8.6 13 C9.7 19 12.6 23.4 16 23.4 C19.4 23.4 22.3 19 23.4 13 C21 15 18.6 16 16 16 C13.4 16 11 15 8.6 13 Z",
    },
    "마티니 잔": {
      glass: "M6 9 L16 25 L26 9 M16 25 L16 38 M9.5 40.5 L22.5 40.5",
      rim: "M6 9 L26 9",
      liquid: "M10.4 13.2 L21.6 13.2 L16 21.5 Z",
    },
    "허리케인 잔": {
      glass:
        "M9 7 C9 13 13.5 15.5 13.5 21 C13.5 26.5 7.5 29 7.5 36 C7.5 39 9.8 41 13 41 L19 41 C22.2 41 24.5 39 24.5 36 C24.5 29 18.5 26.5 18.5 21 C18.5 15.5 23 13 23 7",
      rim: "M9 7 L23 7",
      liquid:
        "M8 29 C10 31.5 8.2 33.5 8 36 C8 38 9.8 39.8 12.5 39.8 L19.5 39.8 C22.2 39.8 24 38 24 36 C23.8 33.5 22 31.5 24 29 C22 30.5 19.2 31.4 16 31.4 C12.8 31.4 10 30.5 8 29 Z",
    },
    "구리 머그컵": {
      glass:
        "M9 12 C9 10.6 12.1 9.5 16 9.5 C19.9 9.5 23 10.6 23 12 L23 37 C23 39 19.9 40.5 16 40.5 C12.1 40.5 9 39 9 37 Z",
      rim: "M9 12 C9 13.4 12.1 14.5 16 14.5 C19.9 14.5 23 13.4 23 12",
      handle: "M23 18 C29.5 18 29.5 30 23 30",
      liquid:
        "M9.3 22 L22.7 22 L22.7 37 C22.7 38.6 19.7 39.8 16 39.8 C12.3 39.8 9.3 38.6 9.3 37 Z",
    },
    "와인 잔": {
      glass:
        "M7 10 C7 19.5 10.8 27 16 27 C21.2 27 25 19.5 25 10 M16 27 L16 38 M10 40.5 L22 40.5",
      rim: "M7 10 L25 10",
      liquid:
        "M9 14 C9.8 20 12.6 25.4 16 25.4 C19.4 25.4 22.2 20 23 14 C20.6 17 18.4 18.6 16 18.6 C13.6 18.6 11.4 17 9 14 Z",
    },
    "샴페인 잔": {
      glass:
        "M13.5 7 C12 16 12 29 14 38 L14 38 C14.6 40 17.4 40 18 38 C20 29 20 16 18.5 7",
      rim: "M13.5 7 L18.5 7",
      liquid:
        "M12.7 18 L19.3 18 C19 25.6 18.4 32.5 17.5 38 C17 39.4 15 39.4 14.5 38 C13.6 32.5 13 25.6 12.7 18 Z",
    },
  };

  var DEFAULT_GLASS = "하이볼 잔";

  function build(glassName, colorHex, opts) {
    var def = OUTLINES[glassName] || OUTLINES[DEFAULT_GLASS];
    opts = opts || {};
    var cls = opts.className || "glass-icon";
    var parts = [];
    parts.push(
      '<svg viewBox="0 0 32 46" class="' + cls + '" fill="none">'
    );
    parts.push(
      '<path d="' + def.liquid + '" fill="' + colorHex + '" opacity="0.55"/>'
    );
    parts.push(
      '<path d="' +
        def.glass +
        '" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>'
    );
    parts.push(
      '<path d="' +
        def.rim +
        '" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>'
    );
    if (def.handle) {
      parts.push(
        '<path d="' +
          def.handle +
          '" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" fill="none"/>'
      );
    }
    parts.push("</svg>");
    return parts.join("");
  }

  return { build: build };
})();
