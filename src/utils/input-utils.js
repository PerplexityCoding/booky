export function placeCaretAtEnd(el, selectAll = false) {
  el.focus();
  if (
    typeof window.getSelection != "undefined" &&
    typeof document.createRange != "undefined"
  ) {
    const range = document.createRange();
    range.selectNodeContents(el);
    if (!selectAll) {
      range.collapse(false);
    }

    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }
}

export function clearSelection() {
  if (
    typeof window.getSelection != "undefined" &&
    typeof document.createRange != "undefined"
  ) {
    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
    }
  }
}

export function stripHtmlToText(html) {
  var tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  var res = tmp.textContent || tmp.innerText || "";
  res.replace("\u200B", ""); // zero width space
  res = res.trim();
  return res;
}
