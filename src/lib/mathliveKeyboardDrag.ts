// MathLive virtual klaviaturasi doim `body > .ML__keyboard` nomli BITTA
// haqiqiy (shadow DOM emas) elementda chiziladi va shu element butun ekran
// balandligida, lekin `pointer-events: none` bilan "ko'rinmas qobiq"
// sifatida turadi — haqiqiy ko'rinadigan sirt uning ichidagi
// `.MLK__backdrop` bolasi (o'zining pastki chetiga nisbatan joylashadi).
//
// Klaviaturani SURISH uchun uning ICHKI DOM'iga (bolalariga) UMUMAN
// TEGMAYMIZ — buni oldin `mathVirtualKeyboard.container`ni almashtirib
// ko'rgan edik va klaviatura butunlay ko'rinmay qolgan edi. Bu safar faqat
// shu TASHQI qobiqning O'ZINI (u pointer-events:none bo'lgani uchun
// sahifaning qolgan qismiga xalaqit bermaydi) sudrab, uning `left`/`bottom`
// inline uslubini (CSS'dagi markazlashtirish qoidasini `!important`
// inline uslub bilan yengib) o'zgartiramiz. Tutqich (grip) va yopish
// tugmasi ham MathLive DOM'idan butunlay mustaqil, alohida elementlar —
// shuning uchun kutubxonaning ichki render tsiklini buzmaydi.
//
// Tutqichning ko'rinishi endi MathLive'ning O'Z klaviatura ko'rinish
// holatiga ("virtual-keyboard-toggle" hodisasi, `window.mathVirtualKeyboard
// .visible`) bog'langan — bu klaviatura HAQIQATDA qachon ko'rinadi/
// yashirinadi bo'lsa, tutqich ham xuddi shunda ko'rinadi/yashirinadi.
// Shu tufayli yopilish faqat "X" tugmasi yoki maydon ichidagi klaviatura
// belgisi bosilganda sodir bo'ladi (ular ham xuddi shu hodisani chiqaradi)
// — sahifaning istalgan joyiga bosish klaviaturani yopmaydi.

let inited = false;
let handle: HTMLDivElement | null = null;
let dragging = false;
let dragStartX = 0;
let dragStartY = 0;
let startLeft = 0;
let startBottom = 0;

function keyboardEl(): HTMLElement | null {
  return document.querySelector("body > .ML__keyboard");
}

function backdropEl(): HTMLElement | null {
  return document.querySelector("body > .ML__keyboard > .MLK__backdrop");
}

function desktop(): boolean {
  return window.matchMedia("(min-width: 640px)").matches;
}

function positionHandle() {
  if (!handle || handle.style.display === "none") return;
  const kb = keyboardEl();
  const bd = backdropEl();
  if (!kb || !bd) return;
  const bdRect = bd.getBoundingClientRect();
  const kbRect = kb.getBoundingClientRect();
  const top = bdRect.top - handle.offsetHeight - 4;
  const left = kbRect.left + kbRect.width / 2 - handle.offsetWidth / 2;
  handle.style.top = `${Math.max(4, top)}px`;
  handle.style.left = `${Math.max(4, Math.min(left, window.innerWidth - handle.offsetWidth - 4))}px`;
}

function clampAndApply(left: number, bottom: number) {
  const kb = keyboardEl();
  const bd = backdropEl();
  if (!kb) return;
  const width = kb.getBoundingClientRect().width || 420;
  const height = bd?.getBoundingClientRect().height || 300;
  const maxLeft = Math.max(0, window.innerWidth - width);
  const maxBottom = Math.max(0, window.innerHeight - height);
  const clampedLeft = Math.min(Math.max(0, left), maxLeft);
  const clampedBottom = Math.min(Math.max(0, bottom), maxBottom);
  kb.style.setProperty("left", `${clampedLeft}px`, "important");
  kb.style.setProperty("bottom", `${clampedBottom}px`, "important");
  kb.style.setProperty("top", "auto", "important");
  kb.style.setProperty("transform", "none", "important");
  positionHandle();
}

function onPointerMove(e: PointerEvent) {
  if (!dragging) return;
  const dx = e.clientX - dragStartX;
  const dy = e.clientY - dragStartY;
  clampAndApply(startLeft + dx, startBottom - dy);
}

function onPointerUp() {
  dragging = false;
  if (handle) handle.style.cursor = "grab";
  window.removeEventListener("pointermove", onPointerMove);
  window.removeEventListener("pointerup", onPointerUp);
}

function onPointerDown(e: PointerEvent) {
  const kb = keyboardEl();
  if (!kb) return;
  // Tutqich MathLive'ning `.ML__keyboard` elementi ICHIDA emas — shuning
  // uchun uni bosganda brauzerning o'zi standart holda fokusni undan olib
  // qo'yadi. preventDefault shu standart fokus-o'zgarishining oldini oladi
  // (endi klaviatura ekranga bosilganda umuman yopilmaydi, lekin baribir
  // fokusning behuda ketishining oldini olish yaxshi amaliyot).
  e.preventDefault();
  dragging = true;
  if (handle) handle.style.cursor = "grabbing";
  const rect = kb.getBoundingClientRect();
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  startLeft = rect.left;
  startBottom = window.innerHeight - rect.bottom;
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
}

function ensureHandle() {
  if (handle) return;

  handle = document.createElement("div");
  Object.assign(handle.style, {
    position: "fixed",
    zIndex: "1100",
    display: "none",
    alignItems: "center",
    gap: "8px",
    padding: "4px 10px",
    borderRadius: "999px",
    background: "#374151",
    color: "#fff",
    fontSize: "13px",
    boxShadow: "0 4px 12px rgba(0,0,0,.25)",
    cursor: "grab",
    userSelect: "none",
    touchAction: "none",
  } as Partial<CSSStyleDeclaration>);

  const grip = document.createElement("span");
  grip.textContent = "⠿⠿";
  grip.style.letterSpacing = "-2px";
  grip.style.pointerEvents = "none";

  const close = document.createElement("button");
  close.type = "button";
  close.textContent = "✕";
  close.setAttribute("aria-label", "Klaviaturani yopish");
  Object.assign(close.style, {
    border: "none",
    background: "transparent",
    color: "#fff",
    cursor: "pointer",
    fontSize: "13px",
    lineHeight: "1",
    padding: "2px 4px",
  } as Partial<CSSStyleDeclaration>);
  close.addEventListener("pointerdown", (e) => e.stopPropagation());
  close.addEventListener("click", () => {
    window.mathVirtualKeyboard?.hide();
  });

  handle.append(grip, close);
  handle.addEventListener("pointerdown", onPointerDown);
  // Ba'zi brauzerlarda pointerdown bekor qilingandan keyin ham
  // muvofiqlashtiruvchi "mousedown" o'zining standart fokus-o'zgarishini
  // qilib yuborishi mumkin — qo'shimcha ehtiyot chorasi sifatida shuni ham
  // bekor qilamiz.
  handle.addEventListener("mousedown", (e) => e.preventDefault());
  document.body.appendChild(handle);
}

// Klaviaturaning HAQIQIY ko'rinish holatiga qarab tutqichni ko'rsatadi/
// yashiradi — qanday sabab bilan o'zgarganidan qat'i nazar (fokus, "X",
// maydon ichidagi klaviatura belgisi, dastur orqali chaqirilgan
// show()/hide()), shu bitta joydan boshqariladi.
function syncVisibility() {
  if (!handle) return;
  if (window.mathVirtualKeyboard?.visible && desktop()) {
    handle.style.display = "flex";
    // Klaviatura ochilish animatsiyasi tugagach joylashtiramiz (MathLive'ning
    // o'z CSS o'tish (transition) davomiyligi ~0.28s).
    setTimeout(positionHandle, 320);
  } else {
    handle.style.display = "none";
  }
}

/** Bir marta chaqiriladi — tutqichni yaratadi va klaviatura ko'rinish hodisalariga ulanadi. Idempotent. */
export function initKeyboardDrag() {
  if (inited) return;
  inited = true;
  ensureHandle();
  window.addEventListener("resize", positionHandle);
  window.mathVirtualKeyboard?.addEventListener("virtual-keyboard-toggle", syncVisibility);
  window.mathVirtualKeyboard?.addEventListener("geometrychange", positionHandle);
  // Chaqirilgan paytda klaviatura allaqachon ochiq bo'lishi mumkin.
  syncVisibility();
}
