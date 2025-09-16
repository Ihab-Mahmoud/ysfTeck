import React, { useState, useEffect, useRef, useMemo } from "react";

function segmentGraphemes(str) {
  const s = String(str ?? "");
  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    try {
      const seg = new Intl.Segmenter(undefined, { granularity: "grapheme" });
      return Array.from(seg.segment(s), (x) => x.segment);
    } catch (_) {
      // ignore and fall back
    }
  }
  return Array.from(s);
}

const AnimatedText = ({ text = "", speed = 35 }) => {
  const [displayed, setDisplayed] = useState("");
  const timeoutRef = useRef(null);
  const cancelledRef = useRef(false);

  const units = useMemo(() => segmentGraphemes(text), [text]);

  useEffect(() => {
    // Reset animation state on text change
    setDisplayed("");
    cancelledRef.current = false;

    let i = 0;
    const tick = () => {
      if (cancelledRef.current) return;
      if (i >= units.length) return;
      const next = units[i];
      if (typeof next !== "string") {
        // Guard against undefined/null
        cancelledRef.current = true;
        return;
      }
      setDisplayed((prev) => prev + next);
      i += 1;
      if (i < units.length) {
        timeoutRef.current = setTimeout(tick, speed);
      }
    };

    if (units.length > 0) {
      timeoutRef.current = setTimeout(tick, speed);
    }

    return () => {
      cancelledRef.current = true;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [units, speed]);

  const displayedLength = useMemo(() => segmentGraphemes(displayed).length, [displayed]);
  const fullLength = units.length;

  return (
    <div style={{ whiteSpace: "pre-wrap",marginBottom:"20px" }}>
      {displayed}
      {displayedLength < fullLength && <span className="typing-cursor">|</span>}
    </div>
  );
};

export default AnimatedText;
