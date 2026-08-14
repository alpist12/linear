(function () {
  "use strict";

  var FAV_KEY = "cocktail_favorites";

  var state = {
    cocktails: [],
    query: "",
    baseFilter: "전체",
    scope: "curated", // 'curated' | 'all'
    showFavOnly: false,
    favorites: loadFavorites(),
    selectedIngredients: [],
  };

  var els = {};
  var COMMON_INGREDIENTS = [];

  var STAR_SVG =
    '<svg viewBox="0 0 24 24" class="icon star-icon"><path d="M12 3.4l2.47 5.32 5.86.57-4.4 3.9 1.24 5.74-5.17-2.98-5.17 2.98 1.24-5.74-4.4-3.9 5.86-.57z"/></svg>';

  var CHEVRON_SVG =
    '<svg viewBox="0 0 24 24" class="icon chevron"><path d="M9 4.5l7 7.5-7 7.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  var INGREDIENT_ICON_SVG =
    '<svg viewBox="0 0 24 24" class="icon"><path d="M6 3h12M9 3v6l-5 9a1 1 0 0 0 1 1.5h14a1 1 0 0 0 1-1.5l-5-9V3" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  // 실제 술병 색감에서 따온 스피릿별 컬러 (다크 바 무드)
  var BASE_COLOR = {
    "보드카": "#8fa3ad",
    "데킬라": "#d4a83f",
    "위스키": "#c17d3a",
    "카샤사": "#a3b56a",
    "진": "#6ea37e",
    "럼": "#a8672f",
    "무알콜": "#6fa3ab",
    "스파클링 와인": "#c9b56a",
    "혼합": "#8a7098",
    "리큐르": "#9c5a72",
    "브랜디": "#a85a3f",
    "소주": "#8fae8a",
    "막걸리": "#cbb98a",
    "기타": "#9c9184",
  };

  var ACCENT = "#d9922e";

  function colorFor(c) {
    return BASE_COLOR[c.base] || ACCENT;
  }

  function appendNoteBlock(container, label, text) {
    var header = document.createElement("div");
    header.className = "section-header";
    header.textContent = label;
    container.appendChild(header);

    var list = document.createElement("div");
    list.className = "grouped-list";
    var row = document.createElement("div");
    row.className = "list-row garnish-row";
    var info = document.createElement("div");
    info.className = "row-info";
    var value = document.createElement("div");
    value.className = "garnish-value";
    value.textContent = text;
    info.appendChild(value);
    row.appendChild(info);
    list.appendChild(row);
    container.appendChild(list);
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
    els.scopeTabs = document.getElementById("scopeTabs");
    els.ingToggleBtn = document.getElementById("ingToggleBtn");
    els.ingredientPanel = document.getElementById("ingredientPanel");
    els.ingredientChips = document.getElementById("ingredientChips");
    els.ingredientClear = document.getElementById("ingredientClear");
    els.sectionHeaderLabel = document.getElementById("sectionHeaderLabel");

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

    Array.prototype.forEach.call(
      els.scopeTabs.querySelectorAll(".scope-tab"),
      function (tab) {
        tab.addEventListener("click", function () {
          state.scope = tab.dataset.scope;
          Array.prototype.forEach.call(
            els.scopeTabs.querySelectorAll(".scope-tab"),
            function (t) {
              t.classList.toggle("active", t === tab);
            }
          );
          render();
        });
      }
    );

    els.ingToggleBtn.addEventListener("click", function () {
      var willShow = els.ingredientPanel.classList.contains("hidden");
      els.ingredientPanel.classList.toggle("hidden", !willShow);
      els.ingToggleBtn.classList.toggle("active", willShow);
    });

    els.ingredientClear.addEventListener("click", function () {
      state.selectedIngredients = [];
      syncIngredientChips();
      render();
    });

    fetch("data/cocktails.json")
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        state.cocktails = data;
        buildFilters(data);
        buildIngredientChips(data);
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
      var color = base === "전체" ? ACCENT : BASE_COLOR[base];
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
            var c = el.dataset.base === "전체" ? ACCENT : BASE_COLOR[el.dataset.base];
            el.style.background = active ? c : "";
          }
        );
        render();
      });
      els.baseFilters.appendChild(chip);
    });
  }

  function buildIngredientChips(data) {
    var freq = {};
    data.forEach(function (c) {
      c.ingredients.forEach(function (ing) {
        var name = ing.name.trim();
        if (!name || name.length > 8) return;
        freq[name] = (freq[name] || 0) + 1;
      });
    });
    COMMON_INGREDIENTS = Object.keys(freq)
      .sort(function (a, b) {
        return freq[b] - freq[a];
      })
      .slice(0, 28);

    els.ingredientChips.innerHTML = "";
    COMMON_INGREDIENTS.forEach(function (name) {
      var chip = document.createElement("button");
      chip.className = "chip ing-chip";
      chip.textContent = name;
      chip.dataset.ing = name;
      chip.addEventListener("click", function () {
        var idx = state.selectedIngredients.indexOf(name);
        if (idx === -1) {
          state.selectedIngredients.push(name);
        } else {
          state.selectedIngredients.splice(idx, 1);
        }
        syncIngredientChips();
        render();
      });
      els.ingredientChips.appendChild(chip);
    });
  }

  function syncIngredientChips() {
    var count = state.selectedIngredients.length;
    els.ingToggleBtn.classList.toggle("has-selection", count > 0);
    els.ingredientClear.classList.toggle("hidden", count === 0);
    els.ingredientClear.textContent = count > 0 ? "초기화 (" + count + ")" : "초기화";
    Array.prototype.forEach.call(
      els.ingredientChips.querySelectorAll(".ing-chip"),
      function (chip) {
        chip.classList.toggle(
          "active",
          state.selectedIngredients.indexOf(chip.dataset.ing) !== -1
        );
        if (chip.classList.contains("active")) {
          chip.style.background = ACCENT;
        } else {
          chip.style.background = "";
        }
      }
    );
  }

  function ingredientMatch(c) {
    var have = 0;
    c.ingredients.forEach(function (ing) {
      if (state.selectedIngredients.indexOf(ing.name.trim()) !== -1) have++;
    });
    return { have: have, total: c.ingredients.length };
  }

  function getFiltered() {
    var byIngredients = state.selectedIngredients.length > 0;

    var list = state.cocktails.filter(function (c) {
      if (state.showFavOnly && !isFav(c.id)) return false;
      if (byIngredients) {
        return ingredientMatch(c).have > 0;
      }
      if (state.scope === "curated" && !c.curated) return false;
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

    if (byIngredients) {
      list.sort(function (a, b) {
        var ma = ingredientMatch(a);
        var mb = ingredientMatch(b);
        var ra = ma.have / ma.total;
        var rb = mb.have / mb.total;
        if (rb !== ra) return rb - ra;
        return mb.have - ma.have;
      });
    }

    return list;
  }

  function render() {
    var byIngredients = state.selectedIngredients.length > 0;
    els.scopeTabs.classList.toggle("hidden", byIngredients);
    els.baseFilters.classList.toggle("hidden", byIngredients);
    els.sectionHeaderLabel.textContent = byIngredients
      ? "재료로 찾은 레시피"
      : state.scope === "curated"
      ? "추천 레시피"
      : "모든 레시피";

    var list = getFiltered();
    els.cardGrid.innerHTML = "";
    els.emptyState.classList.toggle("hidden", list.length > 0);

    list.forEach(function (c) {
      els.cardGrid.appendChild(renderRow(c));
    });
  }

  function renderRow(c) {
    var color = colorFor(c);
    var byIngredients = state.selectedIngredients.length > 0;

    var row = document.createElement("div");
    row.className = "list-row";
    row.addEventListener("click", function () {
      showDetail(c);
    });

    var badge = document.createElement("div");
    badge.className = "icon-badge";
    badge.style.background = color;
    badge.style.boxShadow = "0 2px 8px -2px " + color + "88";
    badge.innerHTML = GlassIcons.build(c.glass, "#ffffff");

    var info = document.createElement("div");
    info.className = "row-info";

    var name = document.createElement("div");
    name.className = "row-name";
    name.textContent = c.name;

    var sub = document.createElement("div");
    sub.className = "row-sub";
    if (byIngredients) {
      var m = ingredientMatch(c);
      sub.textContent =
        "보유 재료 " + m.have + "/" + m.total + " · " + c.base;
    } else {
      sub.textContent = c.base + " · " + c.category;
    }

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

  var DIFFICULTY_LEVEL = { "쉬움": 1, "보통": 2, "어려움": 3 };
  var ING_CATEGORY_COLOR = {
    citrus: "#c9a83f",
    sweet: "#c98a4c",
    mixer: "#4f8fab",
    dairy: "#a5644d",
    default: "#9a978f",
  };
  var CITRUS_WORDS = ["레몬", "라임", "오렌지", "자몽"];
  var SWEET_WORDS = ["시럽", "설탕", "꿀", "그레나딘"];
  var MIXER_WORDS = ["탄산", "토닉", "소다", "주스", "콜라", "에일", "워터", "비어"];
  var DAIRY_WORDS = ["우유", "크림", "요구르트", "달걀", "계란"];

  function ingredientCategoryColor(name) {
    if (CITRUS_WORDS.some(function (w) { return name.indexOf(w) !== -1; }))
      return ING_CATEGORY_COLOR.citrus;
    if (SWEET_WORDS.some(function (w) { return name.indexOf(w) !== -1; }))
      return ING_CATEGORY_COLOR.sweet;
    if (MIXER_WORDS.some(function (w) { return name.indexOf(w) !== -1; }))
      return ING_CATEGORY_COLOR.mixer;
    if (DAIRY_WORDS.some(function (w) { return name.indexOf(w) !== -1; }))
      return ING_CATEGORY_COLOR.dairy;
    return null;
  }

  function buildDifficultyDots(level) {
    var wrap = document.createElement("span");
    wrap.className = "diff-dots";
    for (var i = 1; i <= 3; i++) {
      var dot = document.createElement("span");
      dot.className = "diff-dot" + (i <= level ? " filled" : "");
      wrap.appendChild(dot);
    }
    return wrap;
  }

  function buildAbvGauge(abvStr, color) {
    var m = abvStr && abvStr.match(/(\d+)/);
    if (!m) return null;
    var pct = Math.max(2, Math.min(100, (parseInt(m[1], 10) / 45) * 100));
    var wrap = document.createElement("div");
    wrap.className = "abv-gauge";
    var fill = document.createElement("div");
    fill.className = "abv-gauge-fill";
    fill.style.width = pct + "%";
    fill.style.background = color;
    wrap.appendChild(fill);
    return wrap;
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
    hero.style.boxShadow = "0 10px 28px -10px " + color + "aa";
    var watermark = document.createElement("span");
    watermark.className = "hero-watermark";
    watermark.textContent = c.base;
    hero.appendChild(watermark);
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
      ["카테고리", c.category, null],
      ["잔", c.glass, null],
      ["도수", c.abv, "abv"],
      ["난이도", c.difficulty, "difficulty"],
    ].forEach(function (pair) {
      var tile = document.createElement("div");
      tile.className = "stat-tile";
      var label = document.createElement("div");
      label.className = "stat-label";
      label.textContent = pair[0];
      tile.appendChild(label);

      if (pair[2] === "difficulty") {
        var valueRow = document.createElement("div");
        valueRow.className = "stat-value stat-value-row";
        var text = document.createElement("span");
        text.textContent = pair[1];
        valueRow.appendChild(text);
        valueRow.appendChild(buildDifficultyDots(DIFFICULTY_LEVEL[pair[1]] || 1));
        tile.appendChild(valueRow);
      } else {
        var value = document.createElement("div");
        value.className = "stat-value";
        value.textContent = pair[1];
        tile.appendChild(value);
        if (pair[2] === "abv") {
          var gauge = buildAbvGauge(pair[1], color);
          if (gauge) tile.appendChild(gauge);
        }
      }
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
      var catColor = ingredientCategoryColor(ing.name);
      var dot = document.createElement("span");
      dot.className = "ing-dot";
      dot.style.background = catColor || color;
      var n = document.createElement("span");
      n.className = "ing-name";
      n.textContent = ing.name;
      var leader = document.createElement("span");
      leader.className = "leader";
      var a = document.createElement("span");
      a.className = "ing-amount";
      a.textContent = ing.amount;
      row.appendChild(dot);
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
      appendNoteBlock(els.detailContent, "가니시", c.garnish);
    }

    if (c.note) {
      appendNoteBlock(els.detailContent, "TIP", c.note);
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
