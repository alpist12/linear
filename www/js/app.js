(function () {
  "use strict";

  var FAV_KEY = "cocktail_favorites";

  var state = {
    cocktails: [],
    query: "",
    baseFilter: "전체",
    showFavOnly: false,
    favorites: loadFavorites(),
  };

  var els = {};

  var STAR_SVG =
    '<svg viewBox="0 0 24 24" class="icon star-icon"><path d="M12 3.4l2.47 5.32 5.86.57-4.4 3.9 1.24 5.74-5.17-2.98-5.17 2.98 1.24-5.74-4.4-3.9 5.86-.57z"/></svg>';

  var NEON_BASE = {
    "보드카": "#ff3366",
    "데킬라": "#ff7a29",
    "위스키": "#ffc233",
    "카샤사": "#a6e022",
    "진": "#22e07a",
    "럼": "#14e0c2",
    "무알콜": "#22c7ff",
    "스파클링 와인": "#5c9dff",
    "혼합": "#7a5cff",
    "리큐르": "#c239ff",
    "브랜디": "#ff39b4",
  };

  function neonFor(c) {
    return NEON_BASE[c.base] || c.color;
  }

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    els.cardGrid = document.getElementById("cardGrid");
    els.emptyState = document.getElementById("emptyState");
    els.searchInput = document.getElementById("searchInput");
    els.baseFilters = document.getElementById("baseFilters");
    els.listView = document.getElementById("listView");
    els.detailView = document.getElementById("detailView");
    els.detailContent = document.getElementById("detailContent");
    els.backBtn = document.getElementById("backBtn");
    els.favToggleBtn = document.getElementById("favToggleBtn");
    els.searchBar = document.getElementById("searchBar");

    els.searchInput.addEventListener("input", function (e) {
      state.query = e.target.value.trim().toLowerCase();
      render();
    });

    els.backBtn.addEventListener("click", showList);

    els.favToggleBtn.addEventListener("click", function () {
      state.showFavOnly = !state.showFavOnly;
      els.favToggleBtn.classList.toggle("active", state.showFavOnly);
      render();
    });

    fetch("data/cocktails.json")
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        state.cocktails = data;
        buildFilters(data);
        render();
      })
      .catch(function (err) {
        els.cardGrid.innerHTML =
          '<p class="empty-state">데이터를 불러오지 못했습니다.</p>';
        console.error(err);
      });
  }

  function loadFavorites() {
    try {
      var raw = localStorage.getItem(FAV_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveFavorites() {
    try {
      localStorage.setItem(FAV_KEY, JSON.stringify(state.favorites));
    } catch (e) {
      /* ignore storage errors */
    }
  }

  function isFav(id) {
    return state.favorites.indexOf(id) !== -1;
  }

  function toggleFav(id) {
    var idx = state.favorites.indexOf(id);
    if (idx === -1) {
      state.favorites.push(id);
    } else {
      state.favorites.splice(idx, 1);
    }
    saveFavorites();
  }

  function buildFilters(data) {
    var bases = ["전체"];
    data.forEach(function (c) {
      if (bases.indexOf(c.base) === -1) bases.push(c.base);
    });

    els.baseFilters.innerHTML = "";
    bases.forEach(function (base) {
      var color = base === "전체" ? null : NEON_BASE[base];
      var chip = document.createElement("button");
      chip.className = "chip" + (base === state.baseFilter ? " active" : "");
      chip.dataset.base = base;
      if (color) {
        chip.style.setProperty("--chip-color", color);
        if (base === state.baseFilter) chip.style.background = color;
      } else if (base === state.baseFilter) {
        chip.style.background =
          "linear-gradient(90deg,var(--pink),var(--violet))";
      }

      if (color) {
        var dot = document.createElement("span");
        dot.className = "chip-dot";
        dot.style.background = color;
        chip.appendChild(dot);
      }
      chip.appendChild(document.createTextNode(base));

      chip.addEventListener("click", function () {
        state.baseFilter = base;
        Array.prototype.forEach.call(
          els.baseFilters.querySelectorAll(".chip"),
          function (el) {
            var active = el.dataset.base === base;
            el.classList.toggle("active", active);
            var c = el.dataset.base === "전체" ? null : NEON_BASE[el.dataset.base];
            if (active) {
              el.style.background = c
                ? c
                : "linear-gradient(90deg,var(--pink),var(--violet))";
            } else {
              el.style.background = "";
            }
          }
        );
        render();
      });
      els.baseFilters.appendChild(chip);
    });
  }

  function getFiltered() {
    return state.cocktails.filter(function (c) {
      if (state.showFavOnly && !isFav(c.id)) return false;
      if (state.baseFilter !== "전체" && c.base !== state.baseFilter)
        return false;
      if (state.query) {
        var haystack = (
          c.name +
          " " +
          c.nameEn +
          " " +
          c.category +
          " " +
          c.base +
          " " +
          c.ingredients.map(function (i) { return i.name; }).join(" ")
        ).toLowerCase();
        if (haystack.indexOf(state.query) === -1) return false;
      }
      return true;
    });
  }

  function render() {
    var list = getFiltered();
    els.cardGrid.innerHTML = "";
    els.emptyState.classList.toggle("hidden", list.length > 0);

    list.forEach(function (c) {
      els.cardGrid.appendChild(renderRow(c));
    });
  }

  function renderRow(c) {
    var row = document.createElement("div");
    row.className = "cocktail-row";
    row.addEventListener("click", function () {
      showDetail(c);
    });

    var accent = neonFor(c);

    var thumb = document.createElement("div");
    thumb.className = "row-thumb";
    thumb.style.setProperty("--row-color", accent);
    thumb.style.boxShadow =
      "0 0 0 4px " + accent + "1f, 0 4px 14px -6px " + accent + "aa";
    thumb.innerHTML = GlassIcons.build(c.glass, accent);

    var info = document.createElement("div");
    info.className = "row-info";

    var name = document.createElement("div");
    name.className = "row-name";
    name.textContent = c.name;

    var sub = document.createElement("div");
    sub.className = "row-sub";
    sub.textContent = c.base + " · " + c.category;

    info.appendChild(name);
    info.appendChild(sub);

    var favBtn = document.createElement("button");
    favBtn.className = "row-fav" + (isFav(c.id) ? " active" : "");
    favBtn.innerHTML = STAR_SVG;
    favBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      toggleFav(c.id);
      favBtn.classList.toggle("active");
      if (state.showFavOnly) render();
    });

    row.appendChild(thumb);
    row.appendChild(info);
    row.appendChild(favBtn);
    return row;
  }

  function showDetail(c) {
    els.listView.classList.add("hidden");
    els.searchBar.classList.add("hidden");
    els.baseFilters.classList.add("hidden");
    els.detailView.classList.remove("hidden");
    els.detailContent.innerHTML = "";

    var accent = neonFor(c);

    var hero = document.createElement("div");
    hero.className = "detail-hero";
    hero.style.background =
      "radial-gradient(circle at 50% 45%," + accent + "22 0%, var(--surface) 70%)";
    var heroGlass = document.createElement("div");
    heroGlass.className = "hero-glass";
    heroGlass.innerHTML = GlassIcons.build(c.glass, accent);
    hero.appendChild(heroGlass);
    els.detailContent.appendChild(hero);

    var titleRow = document.createElement("div");
    titleRow.className = "detail-title-row";

    var titleWrap = document.createElement("div");
    var h2 = document.createElement("h2");
    h2.textContent = c.name;
    var enP = document.createElement("p");
    enP.className = "detail-en";
    enP.textContent = c.nameEn;
    titleWrap.appendChild(h2);
    titleWrap.appendChild(enP);

    var favBtn = document.createElement("button");
    favBtn.className = "detail-fav-btn" + (isFav(c.id) ? " active" : "");
    favBtn.innerHTML = STAR_SVG;
    favBtn.addEventListener("click", function () {
      toggleFav(c.id);
      favBtn.classList.toggle("active");
    });

    titleRow.appendChild(titleWrap);
    titleRow.appendChild(favBtn);
    els.detailContent.appendChild(titleRow);

    var metaLine = document.createElement("p");
    metaLine.className = "meta-line";
    [c.category, c.glass, "도수 " + c.abv, "난이도 " + c.difficulty].forEach(
      function (t, i) {
        if (i > 0) {
          var dot = document.createElement("span");
          dot.className = "dot";
          dot.textContent = "·";
          metaLine.appendChild(dot);
        }
        metaLine.appendChild(document.createTextNode(t));
      }
    );
    els.detailContent.appendChild(metaLine);

    var ingTitle = document.createElement("div");
    ingTitle.className = "section-title";
    ingTitle.textContent = "재료";
    els.detailContent.appendChild(ingTitle);

    var ingList = document.createElement("ul");
    ingList.className = "ingredient-list";
    c.ingredients.forEach(function (ing) {
      var li = document.createElement("li");
      var n = document.createElement("span");
      n.className = "ing-name";
      n.textContent = ing.name;
      var leader = document.createElement("span");
      leader.className = "leader";
      var a = document.createElement("span");
      a.className = "ing-amount";
      a.textContent = ing.amount;
      li.appendChild(n);
      li.appendChild(leader);
      li.appendChild(a);
      ingList.appendChild(li);
    });
    els.detailContent.appendChild(ingList);

    var stepTitle = document.createElement("div");
    stepTitle.className = "section-title";
    stepTitle.textContent = "만드는 법";
    els.detailContent.appendChild(stepTitle);

    var stepList = document.createElement("ol");
    stepList.className = "step-list";
    c.instructions.forEach(function (step, idx) {
      var li = document.createElement("li");
      var num = document.createElement("span");
      num.className = "step-num";
      num.textContent = String(idx + 1);
      var span = document.createElement("span");
      span.textContent = step;
      li.appendChild(num);
      li.appendChild(span);
      stepList.appendChild(li);
    });
    els.detailContent.appendChild(stepList);

    if (c.garnish) {
      var garnish = document.createElement("div");
      garnish.className = "garnish-box";
      garnish.innerHTML = "<b>가니시</b>" + c.garnish;
      els.detailContent.appendChild(garnish);
    }

    els.detailView.scrollTop = 0;
  }

  function showList() {
    els.detailView.classList.add("hidden");
    els.listView.classList.remove("hidden");
    els.searchBar.classList.remove("hidden");
    els.baseFilters.classList.remove("hidden");
  }
})();
