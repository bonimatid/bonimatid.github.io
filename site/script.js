/* בונים עתיד — interactions */
(function () {
  "use strict";
  document.documentElement.classList.remove("no-js");

  /* ---------- WhatsApp (number is never shown on the page) ---------- */
  var WA_NUMBER = ["972", "52", "201", "0678"].join("");
  function waLink(text) {
    return "https://wa.me/" + WA_NUMBER + (text ? "?text=" + encodeURIComponent(text) : "");
  }
  var DEFAULT_MSG = "היי! הגעתי מהאתר של בונים עתיד ואשמח לשמוע פרטים על הקורסים והליווי 🙌";
  document.querySelectorAll("[data-wa]").forEach(function (a) {
    a.href = waLink(DEFAULT_MSG);
  });

  /* ---------- year ---------- */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* ---------- nav ---------- */
  var nav = document.getElementById("nav");
  var burger = document.getElementById("burger");
  var links = document.getElementById("navLinks");
  function onScroll() {
    nav.classList.toggle("scrolled", window.scrollY > 30);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  function closeMenu() {
    links.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }
  burger.addEventListener("click", function () {
    var open = !links.classList.contains("open");
    links.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  });
  links.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeMenu); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });

  /* ---------- reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        var sibs = Array.prototype.filter.call(el.parentElement.children, function (c) { return c.classList.contains("reveal"); });
        var idx = Math.max(0, sibs.indexOf(el));
        el.style.transitionDelay = Math.min(idx * 90, 450) + "ms";
        el.classList.add("in");
        setTimeout(function () { el.style.transitionDelay = ""; }, 1500);
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- counters ---------- */
  var counters = document.querySelectorAll(".count");
  if ("IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target, to = +el.dataset.to, start = performance.now(), dur = 1600;
        (function tick(now) {
          var p = Math.min(1, (now - start) / dur);
          el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(tick);
        })(start);
        co.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { co.observe(c); });
  } else {
    counters.forEach(function (c) { c.textContent = c.dataset.to; });
  }

  /* ---------- levels progress line ---------- */
  var levels = document.querySelector(".levels");
  if (levels && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries, obs) {
      if (entries[0].isIntersecting) { levels.style.setProperty("--p", "100%"); obs.disconnect(); }
    }, { threshold: 0.3 }).observe(levels);
  }

  /* ---------- spotlight on cards + cursor glow ---------- */
  document.querySelectorAll(".what-card").forEach(function (card) {
    card.addEventListener("pointermove", function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty("--mx", (e.clientX - r.left) + "px");
      card.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });
  var glow = document.querySelector(".cursor-glow");
  if (glow && window.matchMedia("(hover:hover)").matches) {
    window.addEventListener("pointermove", function (e) {
      glow.style.left = e.clientX + "px";
      glow.style.top = e.clientY + "px";
    }, { passive: true });
  }

  /* ---------- level buttons preselect the form ---------- */
  var levelSelect = document.getElementById("fLevel");
  document.querySelectorAll("[data-level]").forEach(function (b) {
    b.addEventListener("click", function () { selectLevel(b.dataset.level); });
  });
  function selectLevel(label) {
    if (!levelSelect) return;
    Array.prototype.forEach.call(levelSelect.options, function (o) {
      if (o.text === label) levelSelect.value = o.value;
    });
  }

  /* ---------- contact form → WhatsApp ---------- */
  var form = document.getElementById("ctaForm");
  var fName = document.getElementById("fName");
  var fMsg = document.getElementById("fMsg");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = fName.value.trim();
      if (!name) {
        fName.classList.add("invalid");
        fName.focus();
        return;
      }
      fName.classList.remove("invalid");
      var msg = "היי! אני " + name + " והגעתי מהאתר של בונים עתיד.\n" +
        "מסלול: " + levelSelect.value + "\n" +
        (fMsg.value.trim() ? "מה אני הכי אוהב/ת לעשות: " + fMsg.value.trim() : "");
      window.open(waLink(msg.trim()), "_blank", "noopener");
    });
    fName.addEventListener("input", function () { fName.classList.remove("invalid"); });
  }

  /* ---------- level quiz ---------- */
  var QUESTIONS = [
    {
      q: "יש לך כבר רעיון לעסק?",
      a: [["עוד לא – אני לא בטוח/ה מה אני רוצה", 1], ["יש לי כמה כיוונים אבל לא החלטתי", 2], ["כן, יש לי רעיון ברור", 3]]
    },
    {
      q: "יש לך כבר מוצר או שירות שאפשר למכור?",
      a: [["לא", 1], ["אני עובד/ת על זה", 2], ["כן, הוא מוכן או כמעט מוכן", 3]]
    },
    {
      q: "איך הקשר שלך עם כסף?",
      a: [["לא ממש יודע/ת לאן הוא הולך", 1], ["יש לי תקציב בסיסי", 2], ["אני מנהל/ת אותו, רוצה ללמוד לנהל כסף של עסק", 3]]
    },
    {
      q: "מה הכי נכון לגביך עכשיו?",
      a: [["אני רוצה למצוא את מה שאני אוהב/ת", 1], ["אני רוצה תוכנית ברורה ולצאת לדרך", 2], ["אני רוצה להשיג את הלקוח הראשון", 3]]
    }
  ];
  var RESULTS = {
    1: { label: "רמה 1 – התחלה", title: "רמה 1 · התחלה", text: "המקום המושלם להתחיל בו. נגלה יחד מה אתם אוהבים, במה אתם טובים, ונבחר רעיון ראשון שמתאים בדיוק לכם." },
    2: { label: "רמה 2 – בדרך למטרה", title: "רמה 2 · בדרך למטרה", text: "יש לכם כיוון – עכשיו הופכים אותו לתוכנית. נבנה הצעת ערך, מותג וקהל, ונצא לדרך עם יעדים ברורים." },
    3: { label: "רמה 3 – הקמת העסק", title: "רמה 3 · הקמת העסק", text: "אתם מוכנים! מקימים את העסק בפועל, משיגים את הלקוח הראשון ולומדים לנהל את הכסף כמו מקצוענים." }
  };
  var stage = document.getElementById("quizStage");
  var bar = document.getElementById("quizBar");
  var answers = [];
  var LETTERS = ["א", "ב", "ג"];

  function esc(s) {
    return s.replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; });
  }

  function renderQ(i) {
    bar.style.width = (i / QUESTIONS.length) * 100 + "%";
    var Q = QUESTIONS[i];
    stage.innerHTML =
      '<div class="q-step"><div class="q-count">שאלה ' + (i + 1) + " מתוך " + QUESTIONS.length + "</div>" +
      '<div class="q-title">' + esc(Q.q) + '</div><div class="q-options">' +
      Q.a.map(function (opt, k) {
        return '<button type="button" class="q-opt" data-v="' + opt[1] + '"><span class="q-letter">' + LETTERS[k] + "</span>" + esc(opt[0]) + "</button>";
      }).join("") + "</div></div>";
    stage.querySelectorAll(".q-opt").forEach(function (b) {
      b.addEventListener("click", function () {
        answers[i] = +b.dataset.v;
        if (i + 1 < QUESTIONS.length) renderQ(i + 1); else renderResult();
      });
    });
  }

  function renderResult() {
    bar.style.width = "100%";
    var avg = answers.reduce(function (s, v) { return s + v; }, 0) / answers.length;
    var lvl = avg < 1.75 ? 1 : avg < 2.5 ? 2 : 3;
    var R = RESULTS[lvl];
    stage.innerHTML =
      '<div class="q-step q-result"><div class="q-count">התוצאה שלך</div>' +
      '<div class="r-level gold-text">' + R.title + "</div><p>" + R.text + "</p>" +
      '<div class="r-actions"><a class="btn btn-whatsapp" id="qWa" target="_blank" rel="noopener">' +
      '<svg class="wa-svg" viewBox="0 0 32 32" aria-hidden="true"><path d="M16.04 3C8.86 3 3.03 8.82 3.03 16c0 2.3.6 4.53 1.74 6.5L3 29l6.68-1.75A12.95 12.95 0 0016.04 29C23.2 29 29 23.18 29 16S23.2 3 16.04 3z"/></svg>' +
      'אני רוצה להתחיל ב' + R.title.split(" · ")[0] + '</a><button type="button" class="btn btn-ghost" id="qAgain">לעשות שוב</button></div></div>';
    document.getElementById("qWa").href = waLink("היי! עשיתי את הבדיקה באתר בונים עתיד ויצא לי " + R.label + ". אשמח לשמוע פרטים 🙌");
    document.getElementById("qAgain").addEventListener("click", function () { answers = []; renderQ(0); });
    selectLevel(R.label);
  }

  if (stage) renderQ(0);
})();
