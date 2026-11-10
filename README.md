# בונים עתיד – אתר הקורסים

האתר נמצא בתיקייה `docs/` (HTML/CSS/JS, בלי תלויות) ומתפרסם דרך GitHub Pages.

- כתובת: https://itayhulibyzness67-ui.github.io/Mm/
- מספר הוואטסאפ לא מוצג באתר – הוא מוגדר רק בקישור, בקובץ `docs/script.js` (`WA_NUMBER`).
- עמודים משפטיים: `privacy.html` (פרטיות ועוגיות), `terms.html` (תנאי שימוש וביטול), `accessibility.html` (הצהרת נגישות).
- קוד של Google Analytics / Meta Pixel יש להכניס בפונקציה `loadOptionalScripts` ב-`script.js` – הוא ירוץ רק אחרי שהגולש אישר עוגיות.
- לוגו ותמונות פרופיל: תיקייה `brand/` (`profile-logo.png`, `profile-logo-name.png`, `logo.svg`).
- אבטחה: בכל עמוד יש Content-Security-Policy שמאפשר רק קבצים מהאתר עצמו ו-Google Fonts. כשמוסיפים כלי חיצוני (פיקסל, אנליטיקס) צריך להוסיף את הדומיין שלו למדיניות.
