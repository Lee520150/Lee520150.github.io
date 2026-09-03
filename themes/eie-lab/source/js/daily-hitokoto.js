(function () {
  var root = document.querySelector("[data-hitokoto]");
  if (!root) return;

  var textEl = root.querySelector("[data-hitokoto-text]");
  var fromEl = root.querySelector("[data-hitokoto-from]");
  var today = new Date().toISOString().slice(0, 10);
  var cacheKey = "color-lab-hitokoto";
  var endpoint = "https://v1.hitokoto.cn/?c=d&c=i&c=k&encode=json";

  function applyQuote(data) {
    if (!data || !data.hitokoto) return;

    textEl.textContent = data.hitokoto;
    var source = [data.from_who, data.from].filter(Boolean).join(" · ");
    fromEl.textContent = source || "Hitokoto";
  }

  try {
    var cached = JSON.parse(localStorage.getItem(cacheKey) || "null");
    if (cached && cached.date === today && cached.quote) {
      applyQuote(cached.quote);
      return;
    }
  } catch (error) {
    localStorage.removeItem(cacheKey);
  }

  fetch(endpoint, { mode: "cors" })
    .then(function (response) {
      if (!response.ok) throw new Error("Hitokoto request failed");
      return response.json();
    })
    .then(function (quote) {
      applyQuote(quote);
      try {
        localStorage.setItem(cacheKey, JSON.stringify({ date: today, quote: quote }));
      } catch (error) {
        return;
      }
    })
    .catch(function () {
      root.classList.add("is-fallback");
    });
})();
