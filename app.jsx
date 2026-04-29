// H PRO CYBER — main app
const { useEffect, useRef, useState, useMemo } = React;

// ---------- Icons ----------
const icons = {
  shield: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M12 2 L20 5 V12 C20 17 16 21 12 22 C8 21 4 17 4 12 V5 Z"/></svg>,
  pulse: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M2 12 H6 L9 5 L14 19 L17 12 H22"/></svg>,
  target: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>,
  cloud: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M7 18 H17 A4 4 0 0 0 17 10 A6 6 0 0 0 5 11 A4 4 0 0 0 7 18 Z"/></svg>,
  alert: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M12 3 L22 20 H2 Z"/><path d="M12 10 V14 M12 17 V17.5"/></svg>,
  check: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="4" y="4" width="16" height="16" rx="1"/><path d="M8 12 L11 15 L16 9"/></svg>,
  people: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="9" cy="9" r="3"/><circle cx="17" cy="10" r="2.5"/><path d="M3 19 C3 15 6 13 9 13 C12 13 15 15 15 19"/><path d="M14 19 C14 17 16 15 17 15 C19 15 21 16 21 19"/></svg>
};
const iconList = [icons.shield, icons.check, icons.alert, icons.pulse, icons.people, icons.target, icons.cloud];

// ---------- Reveal hook ----------
function useReveal(deps) {
  useEffect(() => {
    const check = () => {
      const vh = window.innerHeight;
      document.querySelectorAll(".reveal").forEach(el => {
        if (el.classList.contains("in")) return;
        const rect = el.getBoundingClientRect();
        if (rect.top < vh - 40 && rect.bottom > 0) {
          el.classList.add("in");
          el.dataset.revealed = "1";
        }
      });
    };
    // Restore .in for elements React may have re-rendered
    const restore = () => {
      document.querySelectorAll('[data-revealed="1"]').forEach(el => {
        if (!el.classList.contains("in")) el.classList.add("in");
      });
    };
    const tick = () => { restore(); check(); };
    const t1 = setTimeout(tick, 50);
    const t2 = setTimeout(tick, 300);
    const t3 = setTimeout(tick, 800);
    // Use a MutationObserver to restore .in whenever React replaces className
    const mo = new MutationObserver(restore);
    mo.observe(document.body, { attributes: true, attributeFilter: ["class"], subtree: true });
    window.addEventListener("scroll", tick, { passive: true });
    window.addEventListener("resize", tick);
    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
      mo.disconnect();
      window.removeEventListener("scroll", tick);
      window.removeEventListener("resize", tick);
    };
  }, deps);
}

// ---------- Nav ----------
function Nav({ lang, setLang, t, theme, setTheme }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navCtaRef = useMagnetic(8, 60);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 30);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => {
    if (menuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);
  const closeMenu = () => setMenuOpen(false);
  return (
    <React.Fragment>
      <nav className={"nav " + (scrolled ? "scrolled" : "") + (menuOpen ? " menu-open" : "")}>
        <div className="nav-inner">
          <a href="#top" className="brand" onClick={closeMenu}>
            <img src="logo.png" alt="hprocyber" className="brand-logo" />
          </a>
          <div className="nav-links">
            <a href="#about">{t.nav.quienes}</a>
            <a href="#services">{t.nav.servicios}</a>
            <a href="#plans">{t.nav.planes}</a>
            <a href="#methodology">{t.nav.metodologia}</a>
            <a href="#contact">{t.nav.contacto}</a>
          </div>
          <div className="nav-right">
            <button
              className={`theme-toggle theme-${theme}`}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              <span className="theme-icon">
                {theme === "dark" ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <circle cx="12" cy="12" r="4"/>
                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>
                  </svg>
                )}
              </span>
            </button>
            <div className="lang-toggle" role="tablist">
              <button className={lang === "es" ? "active" : ""} onClick={() => setLang("es")}>ES</button>
              <button className={lang === "en" ? "active" : ""} onClick={() => setLang("en")}>EN</button>
            </div>
            <a ref={navCtaRef} href="#contact" className="cta-btn primary magnetic">
              <span className="magnetic-inner">{t.nav.cta} <span className="arrow" /></span>
            </a>
            <button className="hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>
      {menuOpen && ReactDOM.createPortal(
        <div className="mobile-menu" onClick={e => e.target === e.currentTarget && closeMenu()}>
          <div className="mobile-menu-bg" />
          <div className="mobile-menu-inner">
            <button className="mobile-menu-close" onClick={closeMenu} aria-label="Cerrar menú">
            <span /><span />
          </button>
          <div className="mobile-menu-links">
              {[
                { href: "#about",       label: t.nav.quienes,     n: "01" },
                { href: "#services",    label: t.nav.servicios,   n: "02" },
                { href: "#plans",       label: t.nav.planes,      n: "03" },
                { href: "#methodology", label: t.nav.metodologia, n: "04" },
                { href: "#contact",     label: t.nav.contacto,    n: "05" },
              ].map((item, i) => (
                <a key={i} href={item.href} className="mobile-menu-link" style={{ animationDelay: `${i * 60}ms` }} onClick={closeMenu}>
                  <span className="mobile-menu-link-num">{item.n}</span>
                  <span className="mobile-menu-link-label">{item.label}</span>
                </a>
              ))}
            </div>
            <div className="mobile-menu-footer">
              <div className="lang-toggle">
                <button className={lang === "es" ? "active" : ""} onClick={() => { setLang("es"); closeMenu(); }}>ES</button>
                <button className={lang === "en" ? "active" : ""} onClick={() => { setLang("en"); closeMenu(); }}>EN</button>
              </div>
              <a href="#contact" className="cta-btn primary" onClick={closeMenu}>
                {t.nav.cta} <span className="arrow" />
              </a>
            </div>
          </div>
        </div>,
        document.body
      )}
    </React.Fragment>
  );
}

// ---------- Hero ----------
function Hero({ t, scrollProgress }) {
  const ctaPrimaryRef = useMagnetic(10, 70);
  const ctaSecondaryRef = useMagnetic(8, 70);
  return (
    <section className="hero" id="top">
      <div className="hero-bg">
        <div className="hero-grid" />
        <Radar scrollProgress={scrollProgress} />
      </div>
      <div className="container">
        <div className="hero-inner">
          <div className="hero-copy">
            <div className="eyebrow reveal">{t.hero.eyebrow}</div>
            <h1 className="hero-title reveal delay-1">
              {t.hero.title_pre}<em>{t.hero.title_em}</em>{t.hero.title_post}
            </h1>
            <p className="hero-desc reveal delay-2">{t.hero.desc}</p>
            <div className="hero-actions reveal delay-3">
              <a ref={ctaPrimaryRef} href="#contact" className="cta-btn primary magnetic"><span className="magnetic-inner">{t.hero.cta1} <span className="arrow" /></span></a>
              <a ref={ctaSecondaryRef} href="#contact" className="cta-btn magnetic"><span className="magnetic-inner">{t.hero.cta2} <span className="arrow" /></span></a>
            </div>
          </div>
          <div className="hero-meta">
            {t.hero.stats.map((s, i) => (
              <div key={i} className={`hero-stat reveal delay-${4 + i}`}>
                <div className="hero-stat-value serif">{s.v}</div>
                <div className="hero-stat-label">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="scroll-cue">{t.hero.scrollCue}</div>
    </section>
  );
}

// ---------- Ticker ----------
function Ticker({ items }) {
  const content = [...items, ...items, ...items];
  return (
    <div className="ticker">
      <div className="ticker-track">
        {content.map((w, i) => <span key={i}>{w}</span>)}
      </div>
    </div>
  );
}

// ---------- Problem ----------
function Problem({ t }) {
  return (
    <section id="problem" className="problem">
      <div className="container">
        <div className="section-head">
          <div className="eyebrow reveal">{t.problem.eyebrow}</div>
          <div>
            <h2 className="section-title reveal">
              {t.problem.title_pre}<em>{t.problem.title_em}</em>{t.problem.title_post}
            </h2>
            <p className="reveal delay-1">{t.problem.desc}</p>
          </div>
        </div>
        <div className="problem-grid">
          {t.problem.items.map((item, i) => (
            <div key={i} className={`problem-item reveal delay-${i}`}>
              <div className="k">{item.k}</div>
              <div className="t">{item.t}</div>
              <div className="d">{item.d}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- Value Proposition ----------
function Value({ t }) {
  return (
    <section id="value">
      <div className="container">
        <div className="section-head">
          <div className="eyebrow reveal">{t.value.eyebrow}</div>
          <div>
            <h2 className="section-title reveal">
              {t.value.title_pre}<em>{t.value.title_em}</em>{t.value.title_post}
            </h2>
            <p className="reveal delay-1">{t.value.desc}</p>
          </div>
        </div>
        <div className="pillars">
          {t.value.pillars.map((p, i) => (
            <div key={i} className={`pillar reveal delay-${i}`}>
              <div className="p-num">{p.n}</div>
              <div className="p-title">{p.t}</div>
              <div className="p-desc">{p.d}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- Services ----------
function Services({ t }) {
  return (
    <section id="services">
      <div className="container">
        <div className="section-head">
          <div className="eyebrow reveal">{t.services.eyebrow}</div>
          <div>
            <h2 className="section-title reveal">
              {t.services.title_pre}<em>{t.services.title_em}</em>{t.services.title_post}
            </h2>
            <p className="reveal delay-1">{t.services.desc}</p>
          </div>
        </div>
        <div className="cap-grid">
          {t.services.items.map((c, i) => (
            <a key={i} href={`#/servicio/${c.slug}`} className={`cap cap-link reveal delay-${Math.min(i, 5)}`}>
              <div className="cap-num mono">{c.num} / 07</div>
              <div className="cap-icon">{iconList[i % iconList.length]}</div>
              <h3 className="cap-title">{c.t}</h3>
              <p className="cap-desc">{c.d}</p>
              <div className="cap-tags">
                {c.tags.map((tag, j) => <span key={j}>{tag}</span>)}
              </div>
              <div className="cap-more mono">{t.nav.detailLabel} <span className="arrow" /></div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- Advisor ----------
function Advisor({ t }) {
  return (
    <section id="advisor">
      <div className="container">
        <div className="section-head">
          <div className="eyebrow reveal">{t.advisor.eyebrow}</div>
          <div>
            <h2 className="section-title reveal">
              {t.advisor.title_pre}<em>{t.advisor.title_em}</em>{t.advisor.title_post}
            </h2>
            <p className="reveal delay-1">{t.advisor.desc}</p>
          </div>
        </div>
        <div className="advisor-grid">
          {t.advisor.items.map((a, i) => (
            <a key={i} href={`#/servicio/${a.slug}`} className={`advisor-item advisor-link reveal delay-${i}`}>
              <div className="advisor-num serif">{a.num}</div>
              <div className="advisor-body">
                <div className="t">{a.t}</div>
                <div className="d">{a.d}</div>
                <div className="cap-more mono">{t.nav.detailLabel} <span className="arrow" /></div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- Methodology ----------
function Methodology({ t }) {
  const trackRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const on = () => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height + vh * 0.4;
      const scrolled = vh - rect.top;
      const p = Math.max(0, Math.min(1, scrolled / total));
      setProgress(p);
      setActiveIdx(Math.floor(p * t.method.steps.length));
      if (rect.top < vh - 40 && rect.bottom > 0) setRevealed(true);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [t.method.steps.length]);

  return (
    <section className="method" id="methodology">
      <div className="container">
        <div className="section-head">
          <div className="eyebrow reveal">{t.method.eyebrow}</div>
          <div>
            <h2 className="section-title reveal">
              {t.method.title_pre}<em>{t.method.title_em}</em>{t.method.title_post}
            </h2>
            <p className="reveal delay-1">{t.method.desc}</p>
          </div>
        </div>
        <div className="method-track" ref={trackRef}>
          <div className="method-line">
            <div className="method-line-fill" style={{ width: `${progress * 100}%` }} />
          </div>
          {t.method.steps.map((s, i) => (
            <div key={i} className={`method-step delay-${i} ${i <= activeIdx ? "active" : ""} ${revealed ? "in-view" : ""}`}>
              <div className="method-dot" />
              <div className="step-num serif">{s.n}</div>
              <h3 className="step-title">{s.t}</h3>
              <p className="step-desc">{s.d}</p>
              <div className="step-meta">{s.m}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- Differentiators ----------
function Diff({ t }) {
  return (
    <section id="diff">
      <div className="container">
        <div className="section-head">
          <div className="eyebrow reveal">{t.diff.eyebrow}</div>
          <div>
            <h2 className="section-title reveal">
              {t.diff.title_pre}<em>{t.diff.title_em}</em>{t.diff.title_post}
            </h2>
          </div>
        </div>
        <div className="diff-list">
          {t.diff.items.map((item, i) => (
            <div key={i} className={`diff-row reveal delay-${Math.min(i, 4)}`}>
              <div className="d-num">{String(i + 1).padStart(2, '0')}</div>
              <div className="d-title">{item.t}</div>
              <div className="d-desc">{item.d}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- About ----------
function About({ t }) {
  return (
    <section id="about" className="about">
      <div className="container">
        <div className="section-head">
          <div className="eyebrow reveal">{t.about.eyebrow}</div>
          <div>
            <h2 className="section-title reveal">
              {t.about.title_pre}<em>{t.about.title_em}</em>{t.about.title_post}
            </h2>
          </div>
        </div>
        <p className="about-intro reveal">{t.about.intro}</p>
        <div className="eyebrow reveal" style={{ marginBottom: "24px" }}>{t.about.approachTitle}</div>
        <div className="about-approach">
          {t.about.approach.map((a, i) => (
            <div key={i} className={`about-card reveal delay-${i}`}>
              <div className="k">{a.k}</div>
              <div className="d">{a.d}</div>
            </div>
          ))}
        </div>
        <div className="about-mv">
          {t.about.mv.map((m, i) => (
            <div key={i} className={`mv-item reveal delay-${i}`}>
              <div className="mv-k">{m.k}</div>
              <div className="mv-v serif">{m.v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- Plans ----------
function Plans({ t }) {
  return (
    <section id="plans">
      <div className="container">
        <div className="section-head">
          <div className="eyebrow reveal">{t.plans.eyebrow}</div>
          <div>
            <h2 className="section-title reveal">
              {t.plans.title_pre}<em>{t.plans.title_em}</em>{t.plans.title_post}
            </h2>
            <p className="reveal delay-1">{t.plans.desc}</p>
          </div>
        </div>
        <div className="plans-grid">
          {t.plans.items.map((p, i) => (
            <div key={i} className={`plan-card ${p.featured ? "featured" : ""} reveal delay-${i}`}>
              <div className="plan-tag">{p.tag}</div>
              <div className="plan-name serif">{p.k}</div>
              <div className="plan-desc">{p.d}</div>
              <ul className="plan-features">
                {p.features.map((f, j) => <li key={j}>{f}</li>)}
              </ul>
              <div className="plan-cta">
                <a href="#contact" className={p.featured ? "cta-btn primary" : "cta-btn"}>
                  {t.nav.cta} <span className="arrow" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- Big CTA band ----------
function BigCta({ t }) {
  return (
    <section className="bigcta">
      <div className="bigcta-bg" />
      <div className="container bigcta-inner">
        <div className="eyebrow reveal" style={{ marginBottom: "40px" }}>{t.bigCta.eyebrow}</div>
        <div className="bigcta-line1 reveal delay-1">{t.bigCta.line1}</div>
        <div className="bigcta-line2 reveal delay-2">
          {t.bigCta.line2_pre}<em>{t.bigCta.line2_em}</em>{t.bigCta.line2_post}
        </div>
      </div>
    </section>
  );
}

// ---------- Contact CTA ----------
function CTA({ t }) {
  const [status, setStatus] = useState("idle"); // idle | sending | ok | error
  const [fields, setFields] = useState({ name: "", company: "", email: "", service: "", message: "" });

  const set = (k) => (e) => setFields(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("https://formspree.io/f/XXXXXXXX", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(fields)
      });
      setStatus(res.ok ? "ok" : "error");
    } catch {
      setStatus("error");
    }
  };

  const services = [
    "Estrategia de Gobierno",
    "Assessment de Ciberseguridad",
    "Compliance Normativo",
    "Plan Director (Master Plan)",
    "Gestión de Terceros",
    "Continuidad Operacional",
    "Awareness en Ciberseguridad",
    "CISO Virtual / Advisor",
    "Otro"
  ];

  return (
    <section className="cta-section" id="contact">
      <div className="container">
        <div className="eyebrow reveal" style={{ marginBottom: "40px" }}>{t.cta.eyebrow}</div>
        <div className="cta-inner">
          <div className="cta-left">
            <h2 className="cta-title reveal">
              {t.cta.title_pre}<em>{t.cta.title_em}</em>{t.cta.title_post}
            </h2>
            <p className="hero-desc reveal delay-1">{t.cta.desc}</p>
            <div className="cta-meta reveal delay-2">
              {t.cta.meta.map((m, i) => (
                <div key={i} className="cta-meta-row">
                  <span className="k">{m.k}</span>
                  <span className="v">{m.v}</span>
                </div>
              ))}
            </div>
          </div>

          <form className="contact-form reveal delay-1" onSubmit={handleSubmit}>
            {status === "ok" ? (
              <div className="form-success">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-5"/>
                </svg>
                <p>{t.cta.formSuccess || "Mensaje enviado. Te contactamos pronto."}</p>
              </div>
            ) : (
              <>
                <div className="form-row">
                  <div className="form-field">
                    <label>{t.cta.formName || "Nombre"}</label>
                    <input type="text" required value={fields.name} onChange={set("name")} placeholder="Juan Pérez" />
                  </div>
                  <div className="form-field">
                    <label>{t.cta.formCompany || "Empresa"}</label>
                    <input type="text" value={fields.company} onChange={set("company")} placeholder="Acme Corp" />
                  </div>
                </div>
                <div className="form-field">
                  <label>{t.cta.formEmail || "Email"}</label>
                  <input type="email" required value={fields.email} onChange={set("email")} placeholder="juan@empresa.com" />
                </div>
                <div className="form-field">
                  <label>{t.cta.formService || "Servicio de interés"}</label>
                  <select value={fields.service} onChange={set("service")}>
                    <option value="">{t.cta.formServicePlaceholder || "Selecciona un servicio..."}</option>
                    {services.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label>{t.cta.formMessage || "Mensaje"}</label>
                  <textarea rows="4" value={fields.message} onChange={set("message")} placeholder={t.cta.formMessagePlaceholder || "Cuéntanos sobre tu organización y qué necesitas..."} />
                </div>
                {status === "error" && (
                  <p className="form-error">{t.cta.formError || "Hubo un error. Intenta de nuevo o escríbenos directamente."}</p>
                )}
                <button type="submit" className="cta-btn primary form-submit" disabled={status === "sending"}>
                  {status === "sending"
                    ? (t.cta.formSending || "Enviando...")
                    : (t.cta.btn + " →")}
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}

// ---------- Footer ----------
function Footer({ t }) {
  return (
    <footer>
      <div className="container">
        <div className="foot-inner">
          <div>{t.foot.left}</div>
          <div>{t.foot.right}</div>
        </div>
      </div>
    </footer>
  );
}

// ---------- Service Detail ----------
function ServiceDetail({ slug, lang, t, theme, setTheme, setLang }) {
  const detail = (window.SERVICE_DETAILS[lang] && window.SERVICE_DETAILS[lang][slug])
             || (window.SERVICE_DETAILS.es && window.SERVICE_DETAILS.es[slug]);
  useEffect(() => { window.scrollTo(0, 0); }, [slug]);
  if (!detail) {
    return (
      <div style={{padding: "200px 0", textAlign: "center"}}>
        <p>Servicio no encontrado.</p>
        <a href="#/" className="cta-btn">{t.nav.back}</a>
      </div>
    );
  }
  return (
    <React.Fragment>
      <Nav lang={lang} setLang={setLang} t={t} theme={theme} setTheme={setTheme} />
      <section className="detail-hero">
        <div className="hero-bg"><div className="hero-grid" /></div>
        <div className="container">
          <a href="#/" className="back-link mono reveal in">← {t.nav.back}</a>
          <div className="eyebrow reveal in">{detail.kind === "advisor" ? "ADVISOR" : "SERVICIO"} · {detail.num}</div>
          <h1 className="hero-title detail-title reveal in">
            {detail.title_pre}<em>{detail.title_em}</em>{detail.title_post}
          </h1>
          <p className="hero-desc reveal in">{detail.lead}</p>
          <div className="detail-meta">
            <div><div className="k">{t.nav.durationLabel}</div><div className="v">{detail.duration}</div></div>
            <div><div className="k">{t.nav.outputLabel}</div><div className="v">{detail.output}</div></div>
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="section-head">
            <div className="eyebrow reveal">{t.nav.problemLabel}</div>
            <div><p className="detail-problem reveal">{detail.problem}</p></div>
          </div>
        </div>
      </section>

      <section className="method">
        <div className="container">
          <div className="section-head">
            <div className="eyebrow reveal">{t.nav.whatYouGet}</div>
            <div><h2 className="section-title reveal">{t.nav.deliverablesTitle}</h2></div>
          </div>
          <div className="deliverables-grid">
            {detail.whatYouGet.map((d, i) => (
              <div key={i} className={`deliv reveal delay-${Math.min(i, 5)}`}>
                <div className="deliv-num mono">{String(i+1).padStart(2,'0')}</div>
                <div className="deliv-t">{d.t}</div>
                <div className="deliv-d">{d.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="section-head">
            <div className="eyebrow reveal">{t.nav.processLabel}</div>
            <div><h2 className="section-title reveal">{t.nav.processTitle}</h2></div>
          </div>
          <div className="proc-list">
            {detail.process.map((p, i) => (
              <div key={i} className={`proc-row reveal delay-${Math.min(i, 4)}`}>
                <div className="proc-n serif">{p.n}</div>
                <div className="proc-t">{p.t}</div>
                <div className="proc-d">{p.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="method">
        <div className="container">
          <div className="section-head">
            <div className="eyebrow reveal">{t.nav.casesLabel}</div>
            <div><h2 className="section-title reveal">{t.nav.casesTitle}</h2></div>
          </div>
          <div className="cases-grid">
            {detail.cases.map((c, i) => (
              <div key={i} className={`case-card reveal delay-${i}`}>
                <div className="case-t">{c.t}</div>
                <div className="case-d">{c.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTA t={t} />
      <Footer t={t} />
    </React.Fragment>
  );
}

// ---------- Image Strip ----------
function ImgStrip({ src, label, side = "center" }) {
  return (
    <div className={`img-strip reveal img-strip--${side}`}>
      <img src={src} alt={label} className="img-strip-img" loading="lazy" />
      <div className="img-strip-overlay" />
      {label && <span className="img-strip-label">{label}</span>}
    </div>
  );
}

// ---------- Back to top ----------
function WhatsAppButton() {
  return (
    <a
      className="whatsapp-btn"
      href="https://wa.me/56968764197"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
    >
      <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.558 4.119 1.531 5.845L.057 23.428a.5.5 0 0 0 .606.61l5.703-1.49A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.808 9.808 0 0 1-5.031-1.384l-.36-.214-3.733.976.997-3.63-.235-.374A9.795 9.795 0 0 1 2.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
      </svg>
    </a>
  );
}

function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const on = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <button
      className={"back-to-top" + (visible ? " visible" : "")}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Ir arriba"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19V5M5 12l7-7 7 7"/>
      </svg>
    </button>
  );
}

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "dark"
}/*EDITMODE-END*/;

function App() {
  const [lang, setLang] = useState("es");
  const [tweaks, setTweaks] = useTweaks(TWEAK_DEFAULTS);
  const [route, setRoute] = useState(window.location.hash);
  const scrollProgress = useScrollProgress();
  const transStage = usePageTransition(route);

  // Resolve effective theme (auto -> light/dark by hour)
  const effectiveTheme = useAutoTheme(tweaks.theme);

  useEffect(() => {
    const on = () => setRoute(window.location.hash);
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", effectiveTheme);
  }, [effectiveTheme]);

  const t = window.CONTENT[lang];
  useReveal([lang, route]);

  const setTheme = (v) => setTweaks("theme", v);
  const transClass = transStage === 2 ? "page-out" : transStage === 0 ? "page-in" : "";

  // Hash routing: #/servicio/<slug>
  const m = route.match(/^#\/servicio\/(.+)$/);
  if (m) {
    return (
      <React.Fragment>
        <div className={`page ${transClass}`}>
          <ServiceDetail slug={m[1]} lang={lang} t={t} theme={tweaks.theme} setTheme={setTheme} setLang={setLang} />
        </div>
        <TweaksPanel title="Tweaks">
          <TweakSection title="Apariencia">
            <TweakRadio label="Tema" value={tweaks.theme} onChange={setTheme}
              options={[{ value: "auto", label: "Auto" }, { value: "dark", label: "Oscuro" }, { value: "light", label: "Claro" }]} />
          </TweakSection>
        </TweaksPanel>
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <Nav lang={lang} setLang={setLang} t={t} theme={tweaks.theme} setTheme={setTheme} />
      <div className={`page ${transClass}`}>
        <Hero t={t} scrollProgress={scrollProgress} />
      <Ticker items={t.ticker} />
      <Problem t={t} />
      <ImgStrip
        src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1600&q=80&auto=format&fit=crop"
        label="THREAT LANDSCAPE"
        side="left"
      />
      <Value t={t} />
      <Services t={t} />
      <ImgStrip
        src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1600&q=80&auto=format&fit=crop"
        label="CYBER OPERATIONS"
        side="right"
      />
      <Advisor t={t} />
      <Methodology t={t} />
      <Diff t={t} />
      <ImgStrip
        src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1600&q=80&auto=format&fit=crop"
        label="INFRASTRUCTURE"
        side="center"
      />
      <About t={t} />
      <Plans t={t} />
      <BigCta t={t} />
      <CTA t={t} />
      <Footer t={t} />
      </div>

      <WhatsAppButton />
      <BackToTop />
      <TweaksPanel title="Tweaks">
        <TweakSection title="Apariencia">
          <TweakRadio
            label="Tema"
            value={tweaks.theme}
            onChange={(v) => setTweaks("theme", v)}
            options={[
              { value: "auto", label: "Auto" },
              { value: "dark", label: "Oscuro" },
              { value: "light", label: "Claro" }
            ]}
          />
        </TweakSection>
      </TweaksPanel>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
