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

  var CHEVRON_SVG =
    '<svg viewBox="0 0 24 24" class="icon chevron"><path d="M9 4.5l7 7.5-7 7.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  // 애플 시스템 컬러 팔레트 (Health 앱 카테고리 배지 스타일)
  var APPLE_BASE = {
    "보드카": "#ff2d55",
    "데킬라": "#ff9500",
    "위스키": "#a2845e",
    "카샤사": "#00c7be",
    "진": "#34c759",
    "럼": "#30b0c7",
    "무알콜": "#32ade6",
    "스파클링 와인": "#5e5ce6",
    "혼합": "#af52de",
    "리큐르": "#ff3b30",
    "브랜디": "#ffd60a",
  };

  var ACCENT = "#ff5a45";

  function colorFor(c) {
    return APPLE_BASE[c.base] || ACCENT;
  }

  function bounce(el) {
    el.classList.remove("pop");
    void el.offsetWidth;
    el.classList.add("pop");
  }

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    var startTime = Date.now();
    els.splash = document.getElementById("splash");
    els.listScreen = document.getElementById("listScreen");
    els.cardGrid = document.getElementById("cardGrid");
    els.emptyState = document.getElementById("emptyState");
    els.searchInput = document.getElementById("searchInput");
    els.searchBar = document.getElementById("searchBar");
    els.cancelSearchBtn = document.getElementById("cancelSearchBtn");
    els.baseFilters = document.getElementById("baseFilters");
    els.listView = document.getElementById("listView");
    els.navBar = document.getElementById("navBar");
    els.navCompactTitle = document.getElementById("navCompactTitle");
    els.detailView = document.getElementById("detailView");
    els.detailScroll = document.getElementById("detailScroll");
    els.detailNavBar = document.getElementById("detailNavBar");
    els.detailCompactTitle = document.getElementById("detailCompactTitle");
    els.detailContent = document.getElementById("detailContent");
    els.backBtn = document.getElementById("backBtn");
    els.favToggleBtn = document.getElementById("favToggleBtn");
    els.detailFavBtn = document.getElementById("detailFavBtn");

    els.searchInput.addEventListener("input", function (e) {
      state.query = e.target.value.trim().toLowerCase();
      render();
    });

    els.searchInput.addEventListener("focus", function () {
      els.searchBar.classList.add("focused");
    });

    els.cancelSearchBtn.addEventListener("click", function () {
      els.searchInput.value = "";
      state.query = "";
      els.searchInput.blur();
      els.searchBar.classList.remove("focused");
      render();
    });

    els.listView.addEventListener("scroll", function () {
      els.navBar.classList.toggle("scrolled", els.listView.scrollTop > 6);
    });

    els.detailScroll.addEventListener("scroll", function () {
      els.detailNavBar.classList.toggle(
        "scrolled",
        els.detailScroll.scrollTop > 6
      );
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
      })
      .then(function () {
        var elapsed = Date.now() - startTime;
        var wait = Math.max(0, 550 - elapsed);
        setTimeout(function () {
          els.splash.classList.add("hide");
        }, wait);
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
      var color = base === "전체" ? ACCENT : APPLE_BASE[base];
      var chip = document.createElement("button");
      chip.className = "chip" + (base === state.baseFilter ? " active" : "");
      chip.dataset.base = base;
      chip.textContent = base;
      if (base === state.baseFilter) chip.style.background = color;

      chip.addEventListener("click", function () {
        state.baseFilter = base;
        Array.prototype.forEach.call(
          els.baseFilters.querySelectorAll(".chip"),
          function (el) {
            var active = el.dataset.base === base;
            el.classList.toggle("active", active);
            var c = el.dataset.base === "전체" ? ACCENT : APPLE_BASE[el.dataset.base];
            el.style.background = active ? c : "";
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
    var color = colorFor(c);

    var row = document.createElement("div");
    row.className = "list-row";
    row.addEventListener("click", function () {
      showDetail(c);
    });

    var badge = document.createElement("div");
    badge.className = "icon-badge";
    badge.style.background = color;
    badge.innerHTML = GlassIcons.build(c.glass, "#ffffff");

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
      bounce(favBtn);
      if (state.showFavOnly) render();
    });

    var chevron = document.createElement("span");
    chevron.className = "chevron";
    chevron.innerHTML = CHEVRON_SVG;

    row.appendChild(badge);
    row.appendChild(info);
    row.appendChild(favBtn);
    row.appendChild(chevron);
    return row;
  }

  function showDetail(c) {
    els.detailContent.innerHTML = "";
    els.detailScroll.scrollTop = 0;
    els.detailNavBar.classList.remove("scrolled");
    els.detailCompactTitle.textContent = c.name;

    var color = colorFor(c);

    var syncFav = function () {
      els.detailFavBtn.classList.toggle("active", isFav(c.id));
    };
    syncFav();
    els.detailFavBtn.onclick = function () {
      toggleFav(c.id);
      syncFav();
      bounce(els.detailFavBtn);
    };

    var hero = document.createElement("div");
    hero.className = "detail-hero";
    hero.style.background = color;
    var heroGlass = document.createElement("div");
    heroGlass.className = "hero-glass";
    heroGlass.innerHTML = GlassIcons.build(c.glass, "#ffffff");
    hero.appendChild(heroGlass);
    els.detailContent.appendChild(hero);

    var titleBlock = document.createElement("div");
    titleBlock.className = "detail-title-block";
    var h2 = document.createElement("h2");
    h2.textContent = c.name;
    var enP = document.createElement("p");
    enP.className = "detail-en";
    enP.textContent = c.nameEn;
    titleBlock.appendChild(h2);
    titleBlock.appendChild(enP);
    els.detailContent.appendChild(titleBlock);

    var statGrid = document.createElement("div");
    statGrid.className = "stat-grid";
    [
      ["카테고리", c.category],
      ["잔", c.glass],
      ["도수", c.abv],
      ["난이도", c.difficulty],
    ].forEach(function (pair) {
      var tile = document.createElement("div");
      tile.className = "stat-tile";
      var label = document.createElement("div");
      label.className = "stat-label";
      label.textContent = pair[0];
      var value = document.createElement("div");
      value.className = "stat-value";
      value.textContent = pair[1];
      tile.appendChild(label);
      tile.appendChild(value);
      statGrid.appendChild(tile);
    });
    els.detailContent.appendChild(statGrid);

    var ingHeader = document.createElement("div");
    ingHeader.className = "section-header";
    ingHeader.textContent = "재료";
    els.detailContent.appendChild(ingHeader);

    var ingList = document.createElement("div");
    ingList.className = "grouped-list";
    c.ingredients.forEach(function (ing) {
      var row = document.createElement("div");
      row.className = "list-row ingredient-row";
      var n = document.createElement("span");
      n.className = "ing-name";
      n.textContent = ing.name;
      var leader = document.createElement("span");
      leader.className = "leader";
      var a = document.createElement("span");
      a.className = "ing-amount";
      a.textContent = ing.amount;
      row.appendChild(n);
      row.appendChild(leader);
      row.appendChild(a);
      ingList.appendChild(row);
    });
    els.detailContent.appendChild(ingList);

    var stepHeader = document.createElement("div");
    stepHeader.className = "section-header";
    stepHeader.textContent = "만드는 법";
    els.detailContent.appendChild(stepHeader);

    var stepList = document.createElement("div");
    stepList.className = "grouped-list";
    c.instructions.forEach(function (step, idx) {
      var row = document.createElement("div");
      row.className = "list-row step-row";
      var num = document.createElement("span");
      num.className = "step-num";
      num.style.background = color;
      num.textContent = String(idx + 1);
      var text = document.createElement("span");
      text.className = "step-text";
      text.textContent = step;
      row.appendChild(num);
      row.appendChild(text);
      stepList.appendChild(row);
    });
    els.detailContent.appendChild(stepList);

    if (c.garnish) {
      var garnishHeader = document.createElement("div");
      garnishHeader.className = "section-header";
      garnishHeader.textContent = "가니시";
      els.detailContent.appendChild(garnishHeader);

      var garnishList = document.createElement("div");
      garnishList.className = "grouped-list";
      var gRow = document.createElement("div");
      gRow.className = "list-row garnish-row";
      var gInfo = document.createElement("div");
      gInfo.className = "row-info";
      var gValue = document.createElement("div");
      gValue.className = "garnish-value";
      gValue.textContent = c.garnish;
      gInfo.appendChild(gValue);
      gRow.appendChild(gInfo);
      garnishList.appendChild(gRow);
      els.detailContent.appendChild(garnishList);
    }

    els.detailView.classList.remove("hidden");
    void els.detailView.offsetWidth;
    requestAnimationFrame(function () {
      els.detailView.classList.add("show");
      els.listScreen.classList.add("behind");
    });
  }

  function showList() {
    els.detailView.classList.remove("show");
    els.listScreen.classList.remove("behind");
    var onEnd = function (e) {
      if (e.target === els.detailView && e.propertyName === "transform") {
        els.detailView.classList.add("hidden");
        els.detailView.removeEventListener("transitionend", onEnd);
      }
    };
    els.detailView.addEventListener("transitionend", onEnd);
    render();
  }
})();
