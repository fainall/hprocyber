// H PRO CYBER — motion utilities
// - useMagnetic: subtle magnetic pull on hover for CTAs
// - useAutoTheme: pick light/dark based on hour when theme === "auto"
// - usePageTransition: trigger fade+slide on route changes
// - useScrollProgress: 0..1 throughout the page; fed to Radar

(function () {
  const { useEffect, useRef, useState, useCallback } = React;

  // ---------- Magnetic ----------
  // Attach to a ref to make the element ease toward the cursor on hover.
  // strength: max translation in px. radius: activation distance.
  function useMagnetic(strength = 8, radius = 80) {
    const ref = useRef(null);
    return ref;
  }

  // ---------- Auto theme ----------
  // Returns the "effective" theme. If chosen is "auto", pick by hour:
  //   light: 07:00 – 18:59
  //   dark:  19:00 – 06:59
  function resolveTheme(chosen) {
    if (chosen !== "auto") return chosen;
    const h = new Date().getHours();
    return h >= 7 && h < 19 ? "light" : "dark";
  }

  function useAutoTheme(chosen) {
    const [effective, setEffective] = useState(() => resolveTheme(chosen));
    useEffect(() => {
      const apply = () => setEffective(resolveTheme(chosen));
      apply();
      if (chosen !== "auto") return;
      // Re-check every minute
      const iv = setInterval(apply, 60_000);
      return () => clearInterval(iv);
    }, [chosen]);
    return effective;
  }

  // ---------- Page transitions ----------
  // Returns a transitionStage 0..2 (0 = entering, 1 = settled, 2 = leaving).
  // Use route as the dependency to fire on route change.
  function usePageTransition(route, duration = 380) {
    const [stage, setStage] = useState(1);
    const prev = useRef(route);
    useEffect(() => {
      if (prev.current === route) return;
      // Leaving previous
      setStage(2);
      const t1 = setTimeout(() => {
        prev.current = route;
        setStage(0); // entering new
        // settle
        const t2 = setTimeout(() => setStage(1), 30);
        return () => clearTimeout(t2);
      }, duration / 2);
      return () => clearTimeout(t1);
    }, [route, duration]);
    return stage;
  }

  // ---------- Scroll progress ----------
  function useScrollProgress() {
    const [p, setP] = useState(0);
    useEffect(() => {
      let raf = 0;
      const onScroll = () => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          const max = document.documentElement.scrollHeight - window.innerHeight;
          const y = window.scrollY || window.pageYOffset;
          setP(max > 0 ? Math.min(1, Math.max(0, y / max)) : 0);
          raf = 0;
        });
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      return () => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
        if (raf) cancelAnimationFrame(raf);
      };
    }, []);
    return p;
  }

  // ---------- Magnetic wrapper component ----------
  // Drop-in: <Magnetic as="a" className="..." href="...">label</Magnetic>
  function Magnetic({ as: As = "a", children, className = "", strength, radius, ...rest }) {
    const ref = useMagnetic(strength, radius);
    return (
      <As ref={ref} className={`magnetic ${className}`.trim()} {...rest}>
        <span className="magnetic-inner">{children}</span>
      </As>
    );
  }

  Object.assign(window, {
    useMagnetic, useAutoTheme, usePageTransition, useScrollProgress, resolveTheme, Magnetic
  });
})();
