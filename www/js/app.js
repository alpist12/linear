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
      els.favToggleBtn.textContent = state.showFavOnly ? "★" : "☆";
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
      var chip = document.createElement("button");
      chip.className = "chip" + (base === state.baseFilter ? " active" : "");
      chip.textContent = base;
      chip.addEventListener("click", function () {
        state.baseFilter = base;
        Array.prototype.forEach.call(
          els.baseFilters.querySelectorAll(".chip"),
          function (el) {
            el.classList.toggle("active", el.textContent === base);
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
      els.cardGrid.appendChild(renderCard(c));
    });
  }

  function renderCard(c) {
    var card = document.createElement("div");
    card.className = "cocktail-card";
    card.addEventListener("click", function () {
      showDetail(c);
    });

    var favBtn = document.createElement("button");
    favBtn.className = "card-fav" + (isFav(c.id) ? " active" : "");
    favBtn.textContent = isFav(c.id) ? "★" : "☆";
    favBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      toggleFav(c.id);
      favBtn.classList.toggle("active");
      favBtn.textContent = isFav(c.id) ? "★" : "☆";
      if (state.showFavOnly) render();
    });

    var emojiWrap = document.createElement("div");
    emojiWrap.className = "card-emoji-wrap";
    emojiWrap.style.background = softenColor(c.color);
    emojiWrap.textContent = c.emoji;

    var name = document.createElement("div");
    name.className = "card-name";
    name.textContent = c.name;

    var sub = document.createElement("div");
    sub.className = "card-sub";
    sub.textContent = c.base + " · " + c.category;

    card.appendChild(favBtn);
    card.appendChild(emojiWrap);
    card.appendChild(name);
    card.appendChild(sub);
    return card;
  }

  function softenColor(hex) {
    return "linear-gradient(135deg," + hex + "33," + hex + "18)";
  }

  function showDetail(c) {
    els.listView.classList.add("hidden");
    els.searchBar.classList.add("hidden");
    els.baseFilters.classList.add("hidden");
    els.detailView.classList.remove("hidden");
    els.detailContent.innerHTML = "";

    var hero = document.createElement("div");
    hero.className = "detail-hero";
    hero.style.background = softenColor(c.color);
    hero.textContent = c.emoji;
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
    favBtn.textContent = isFav(c.id) ? "★" : "☆";
    favBtn.addEventListener("click", function () {
      toggleFav(c.id);
      favBtn.classList.toggle("active");
      favBtn.textContent = isFav(c.id) ? "★" : "☆";
    });

    titleRow.appendChild(titleWrap);
    titleRow.appendChild(favBtn);
    els.detailContent.appendChild(titleRow);

    var badgeRow = document.createElement("div");
    badgeRow.className = "badge-row";
    [c.category, c.glass, "도수 " + c.abv, "난이도 " + c.difficulty].forEach(
      function (t) {
        var b = document.createElement("span");
        b.className = "badge";
        b.textContent = t;
        badgeRow.appendChild(b);
      }
    );
    els.detailContent.appendChild(badgeRow);

    var ingTitle = document.createElement("div");
    ingTitle.className = "section-title";
    ingTitle.textContent = "재료";
    els.detailContent.appendChild(ingTitle);

    var ingList = document.createElement("ul");
    ingList.className = "ingredient-list";
    c.ingredients.forEach(function (ing) {
      var li = document.createElement("li");
      var n = document.createElement("span");
      n.textContent = ing.name;
      var a = document.createElement("span");
      a.textContent = ing.amount;
      li.appendChild(n);
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
    c.instructions.forEach(function (step) {
      var li = document.createElement("li");
      var span = document.createElement("span");
      span.textContent = step;
      li.appendChild(span);
      stepList.appendChild(li);
    });
    els.detailContent.appendChild(stepList);

    if (c.garnish) {
      var garnish = document.createElement("div");
      garnish.className = "garnish-box";
      garnish.innerHTML = "<b>가니시</b> · " + c.garnish;
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
