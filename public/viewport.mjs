// Safari's layout viewport can stay full-height while the keyboard covers it.
export function searchViewport({height, offsetTop = 0, scale = 1, referenceHeight, focused = false}) {
 if (!Number.isFinite(height) || height <= 0) return null;
 return {height:Math.round(height),top:Math.max(0,Math.round(offsetTop)),keyboard:focused && scale <= 1.05 && referenceHeight-height > 120};
}
