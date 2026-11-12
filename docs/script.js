/* בונים עתיד — interactions */
(function () {
  "use strict";
  document.documentElement.classList.remove("no-js");

  /* ---------- anti-clickjacking: never run inside someone else's frame ---------- */
  if (window.top !== window.self) {
    try { window.top.location = window.self.location.href; } catch (e) { document.documentElement.innerHTML = ""; return; }
  }

  /* ---------- WhatsApp (number is never shown on the page) ---------- */
  var WA_NUMBER = ["972", "52", "201", "0678"].join("");
  function waLink(text) {
    return "https://wa.me/" + WA_NUMBER + (text ? "?text=" + encodeURIComponent(text) : "");
  }
  var DEFAULT_MSG = "היי! הגעתי מהאתר של בונים עתיד ואשמח לשמוע פרטים על הקורסים והליווי 🙌";
  function wireWa() {
    document.querySelectorAll("[data-wa]").forEach(function (a) { a.href = waLink(DEFAULT_MSG); });
  }

  /* ---------- year ---------- */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* ---------- nav ---------- */
  var nav = document.getElementById("nav");
  var burger = document.getElementById("burger");
  var links = document.getElementById("navLinks");
  function onScroll() {
    if (nav && !document.body.classList.contains("legal-page")) nav.classList.toggle("scrolled", window.scrollY > 30);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  function closeMenu() {
    if (!links) return;
    links.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }
  if (burger && links) {
    burger.addEventListener("click", function () {
      var open = !links.classList.contains("open");
      links.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    });
    links.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeMenu); });
  }
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { closeMenu(); closeA11y(); } });

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
      var consent = document.getElementById("fConsent");
      var err = document.getElementById("formError");
      if (!name) {
        fName.classList.add("invalid");
        err.textContent = "נא למלא שם.";
        err.hidden = false;
        fName.focus();
        return;
      }
      fName.classList.remove("invalid");
      if (consent && !consent.checked) {
        err.textContent = "כדי להמשיך יש לאשר את מדיניות הפרטיות ותנאי השימוש.";
        err.hidden = false;
        consent.focus();
        return;
      }
      err.hidden = true;
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

  /* =========================================================
     Shared UI injected on every page: WhatsApp, accessibility, cookies
     ========================================================= */
  function store(key, val) {
    try {
      if (val === undefined) return JSON.parse(localStorage.getItem(key));
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) { return null; }
  }
  var WA_PATH = "M16.04 3C8.86 3 3.03 8.82 3.03 16c0 2.3.6 4.53 1.74 6.5L3 29l6.68-1.75A12.95 12.95 0 0016.04 29C23.2 29 29 23.18 29 16S23.2 3 16.04 3zm0 23.6c-2.03 0-4.02-.55-5.75-1.58l-.41-.25-3.96 1.04 1.06-3.86-.27-.4A10.6 10.6 0 1116.04 26.6zm5.82-7.93c-.32-.16-1.88-.93-2.17-1.03-.29-.11-.5-.16-.72.16-.21.32-.82 1.03-1 1.25-.19.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.59-.95-.85-1.59-1.9-1.78-2.22-.19-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.72-1.73-.98-2.37-.26-.62-.52-.54-.72-.55h-.61c-.21 0-.56.08-.85.4-.29.32-1.11 1.09-1.11 2.65s1.14 3.08 1.3 3.29c.16.21 2.24 3.42 5.43 4.8.76.33 1.35.52 1.81.67.76.24 1.45.21 2 .13.61-.09 1.88-.77 2.14-1.51.27-.74.27-1.38.19-1.51-.08-.13-.29-.21-.61-.37z";

  var ui = document.createElement("div");
  ui.innerHTML =
    '<a href="#" data-wa class="wa-float" target="_blank" rel="noopener" aria-label="שליחת הודעה בוואטסאפ">' +
      '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="' + WA_PATH + '"/></svg><span class="wa-tip">דברו איתי בוואטסאפ</span></a>' +
    '<a href="https://www.instagram.com/itayhuli.official/" class="ig-float" target="_blank" rel="noopener" aria-label="האינסטגרם של בונים עתיד">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="1.1" class="ig-dot"/></svg><span class="wa-tip">עקבו באינסטגרם</span></a>' +

    '<button type="button" class="a11y-btn" id="a11yBtn" aria-label="תפריט נגישות" aria-expanded="false" aria-controls="a11yPanel">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="4" r="2"/><path d="M4 8l8 1.5L20 8M12 9.5V15m0 0l-3.5 6M12 15l3.5 6"/></svg></button>' +
    '<div class="a11y-panel" id="a11yPanel" role="dialog" aria-label="תפריט נגישות" hidden>' +
      '<div class="a11y-head"><strong>תפריט נגישות</strong><button type="button" class="a11y-close" id="a11yClose" aria-label="סגירת תפריט הנגישות">✕</button></div>' +
      '<div class="a11y-size"><span>גודל טקסט</span><div><button type="button" data-fs="-1" aria-label="הקטנת טקסט">א-</button><button type="button" data-fs="1" aria-label="הגדלת טקסט">א+</button></div></div>' +
      '<div class="a11y-grid">' +
        '<button type="button" data-a11y="contrast" aria-pressed="false">◐ ניגודיות גבוהה</button>' +
        '<button type="button" data-a11y="links" aria-pressed="false">🔗 הדגשת קישורים</button>' +
        '<button type="button" data-a11y="font" aria-pressed="false">Aa גופן קריא</button>' +
        '<button type="button" data-a11y="motion" aria-pressed="false">⏸ עצירת אנימציות</button>' +
      '</div>' +
      '<div class="a11y-foot"><button type="button" id="a11yReset">איפוס הגדרות</button><a href="accessibility.html">הצהרת נגישות</a></div>' +
    '</div>' +

    '<div class="cookie-bar" id="cookieBar" role="region" aria-label="הודעה על שימוש בעוגיות" hidden>' +
      '<div class="cookie-text"><strong>🍪 עוגיות ופרטיות</strong>' +
      '<p>האתר משתמש באחסון הכרחי בדפדפן כדי לפעול כראוי ולזכור את ההעדפות שלך. כלי מדידה ושיווק יופעלו רק באישורך. פרטים ב<a href="privacy.html#cookies">מדיניות העוגיות והפרטיות</a>.</p></div>' +
      '<div class="cookie-actions"><button type="button" class="btn btn-gold" id="cookieAll">אישור הכל</button>' +
      '<button type="button" class="btn btn-ghost" id="cookieEssential">הכרחיות בלבד</button></div>' +
    '</div>';
  while (ui.firstChild) document.body.appendChild(ui.firstChild);
  wireWa();

  /* ---------- accessibility menu ---------- */
  var root = document.documentElement;
  var a11yBtn = document.getElementById("a11yBtn");
  var a11yPanel = document.getElementById("a11yPanel");
  var a11y = store("ba_a11y") || { fs: 0, contrast: false, links: false, font: false, motion: false };
  function applyA11y() {
    document.body.style.zoom = a11y.fs ? String(1 + a11y.fs * 0.1) : "";
    ["contrast", "links", "font", "motion"].forEach(function (k) {
      root.classList.toggle("a11y-" + k, !!a11y[k]);
      var b = a11yPanel.querySelector('[data-a11y="' + k + '"]');
      if (b) b.setAttribute("aria-pressed", String(!!a11y[k]));
    });
    store("ba_a11y", a11y);
  }
  function closeA11y() {
    if (!a11yPanel || a11yPanel.hidden) return;
    a11yPanel.hidden = true;
    a11yBtn.setAttribute("aria-expanded", "false");
    a11yBtn.focus();
  }
  a11yBtn.addEventListener("click", function () {
    var open = a11yPanel.hidden;
    a11yPanel.hidden = !open;
    a11yBtn.setAttribute("aria-expanded", String(open));
    if (open) a11yPanel.querySelector("button").focus();
  });
  document.getElementById("a11yClose").addEventListener("click", closeA11y);
  document.addEventListener("click", function (e) {
    if (!a11yPanel.hidden && !a11yPanel.contains(e.target) && !a11yBtn.contains(e.target)) {
      a11yPanel.hidden = true;
      a11yBtn.setAttribute("aria-expanded", "false");
    }
  });
  a11yPanel.querySelectorAll("[data-fs]").forEach(function (b) {
    b.addEventListener("click", function () {
      a11y.fs = Math.max(0, Math.min(4, a11y.fs + +b.dataset.fs));
      applyA11y();
    });
  });
  a11yPanel.querySelectorAll("[data-a11y]").forEach(function (b) {
    b.addEventListener("click", function () { a11y[b.dataset.a11y] = !a11y[b.dataset.a11y]; applyA11y(); });
  });
  document.getElementById("a11yReset").addEventListener("click", function () {
    a11y = { fs: 0, contrast: false, links: false, font: false, motion: false };
    applyA11y();
  });
  applyA11y();

  /* ---------- cookie consent ---------- */
  var cookieBar = document.getElementById("cookieBar");
  function showBar(show) {
    cookieBar.hidden = !show;
    document.body.classList.toggle("has-cookie-bar", show);
  }
  function setConsent(all) {
    var c = { essential: true, analytics: all, marketing: all, date: new Date().toISOString() };
    store("ba_consent", c);
    showBar(false);
    if (all) loadOptionalScripts();
  }
  // Place analytics / Meta Pixel code here. It only runs after the visitor clicks "אישור הכל".
  function loadOptionalScripts() {
    /* e.g. Google Analytics / Meta Pixel snippet goes here.
       NOTE: also allow their domains in the Content-Security-Policy meta tag of every page. */
  }
  document.getElementById("cookieAll").addEventListener("click", function () { setConsent(true); });
  document.getElementById("cookieEssential").addEventListener("click", function () { setConsent(false); });
  document.querySelectorAll("[data-cookie-settings]").forEach(function (b) {
    b.addEventListener("click", function () { showBar(true); document.getElementById("cookieAll").focus(); });
  });
  var consent = store("ba_consent");
  if (!consent) showBar(true); else if (consent.analytics) loadOptionalScripts();
})();
