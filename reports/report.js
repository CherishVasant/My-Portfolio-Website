/* Shared report page behavior: theme sync, section navigator, scroll spy.
   Sprinkles background is handled by ../sprinkles.js (shared with the main site). */

function initReportTheme() {
  const toggleBtn = document.getElementById("themeToggle");
  const themeIcon = document.getElementById("themeIcon");

  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    if (themeIcon) {
      themeIcon.className = theme === "light" ? "fa-solid fa-sun" : "fa-solid fa-moon";
    }
    window.dispatchEvent(new Event("themechange"));
  }

  setTheme(localStorage.getItem("theme") || "dark");

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") || "dark";
      setTheme(current === "dark" ? "light" : "dark");
    });
  }
}

/* ------------------------------------------------------------------
   Theme-aware Chart.js colors.
   Chart.js paints text/gridlines straight onto a <canvas> — it does
   NOT pick up CSS custom properties or re-render on a theme toggle by
   itself. Every report's inline chart script should read tick/legend/
   grid colors from these two functions (instead of hardcoding an rgba
   string) and call registerReportChart(chart) right after creating
   each Chart instance, so refreshReportChartsForTheme() can push the
   new theme's colors into it and re-render on toggle.
   ------------------------------------------------------------------ */
function getChartTextColor() {
  const isLight = document.documentElement.getAttribute("data-theme") === "light";
  return isLight ? "rgba(58, 46, 34, 0.75)" : "rgba(245, 237, 227, 0.7)";
}

function getChartGridColor() {
  const isLight = document.documentElement.getAttribute("data-theme") === "light";
  return isLight ? "rgba(58, 46, 34, 0.10)" : "rgba(255, 241, 224, 0.08)";
}

const reportChartRegistry = [];

function registerReportChart(chart) {
  if (chart) reportChartRegistry.push(chart);
}

function refreshReportChartsForTheme() {
  if (!reportChartRegistry.length) return;
  const textColor = getChartTextColor();
  const gridColor = getChartGridColor();

  if (window.Chart) {
    Chart.defaults.color = textColor;
  }

  reportChartRegistry.forEach((chart) => {
    const opts = chart.options || {};

    if (opts.plugins?.legend?.labels) opts.plugins.legend.labels.color = textColor;

    if (opts.scales) {
      Object.values(opts.scales).forEach((scale) => {
        if (scale.ticks) scale.ticks.color = textColor;
        if (scale.grid) scale.grid.color = gridColor;
        if (scale.angleLines) scale.angleLines.color = gridColor;
        if (scale.title) scale.title.color = textColor;
        if (scale.pointLabels) scale.pointLabels.color = textColor;
      });
    }

    chart.update();
  });
}

window.addEventListener("themechange", refreshReportChartsForTheme);

function getReportSections() {
  const main = document.querySelector(".report-main");
  if (!main) return [];

  const candidates = main.querySelectorAll(
    "section.report-section, section[id], section.card[id], article.report-section, article.card, section:not(.hero-section):not(.report-hero)"
  );

  const seen = new Set();
  const sections = [];

  candidates.forEach((el) => {
    if (el.classList.contains("hero-section") || el.classList.contains("report-hero")) return;
    if (el.closest(".agent-trace-box, .react-container, .json-wrapper")) return;

    const heading = el.querySelector(
      "h2, h2.section-title, h2.section-header, .section-title, .section-header"
    );
    if (!heading && !el.id) return;

    let id = el.id;
    if (!id && heading) {
      id = heading.textContent
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      if (id) el.id = id;
    }
    if (!id || seen.has(id)) return;

    seen.add(id);
    el.classList.add("report-section");
    sections.push({ el, id, heading });
  });

  return sections;
}

const RAINBOW_ACCENT_COUNT = 8;

function formatSectionNumber(index) {
  return String(index + 1).padStart(2, "0");
}

function accentClassFor(index) {
  return `accent-${(index % RAINBOW_ACCENT_COUNT) + 1}`;
}

function applyNumberedHeadings(sections) {
  sections.forEach((section, index) => {
    const { el, heading } = section;
    if (!heading || heading.querySelector(".section-number")) return;

    const num = formatSectionNumber(index);
    const titleText = heading.textContent.replace(/^\d+\.\s+/, "").trim();

    heading.classList.add("report-section-heading");
    heading.innerHTML = `<span class="section-number ${accentClassFor(index)}">${num}</span><span class="section-title-text">${titleText}</span>`;
  });
}

// While true, the scroll-driven scroll-spy skips its own recalculation —
// set for a short window after a nav click so the smooth-scroll animation
// (and any late layout shift from images loading mid-scroll) can't briefly
// mark a different circle active than the one just clicked.
let suppressScrollSpy = false;
let suppressScrollSpyTimer = null;

function buildSectionNavigator(sections) {
  const desktopNav = document.getElementById("sectionNavDesktop");
  const mobileNav = document.getElementById("sectionNavMobile");
  if (!desktopNav && !mobileNav) return null;

  // Assigned once at the bottom of this function; the click handler below
  // closes over this binding and reads its final value at click-time (well
  // after this function has returned).
  let navigatorItems;

  const createButton = (section, index) => {
    const num = formatSectionNumber(index);
    const accentNum = (index % RAINBOW_ACCENT_COUNT) + 1;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `section-nav-item ${accentClassFor(index)}`;
    // Drive hover/active color from this single inline custom property
    // instead of a per-index CSS class, so there's no cascade/specificity
    // fight that could ever recolor the wrong circle.
    btn.style.setProperty("--nav-item-accent", `var(--rainbow-${accentNum})`);
    btn.textContent = num;
    btn.setAttribute("data-target", section.id);
    btn.setAttribute("aria-label", `Go to section ${num}`);
    btn.addEventListener("click", () => {
      const target = document.getElementById(section.id);
      if (!target) return;

      // Mark the clicked circle active immediately — don't wait for the
      // scroll position to catch up and re-derive it, which is what let a
      // stale/mid-animation scroll position highlight the wrong circle.
      setActiveNavItem(navigatorItems, section.id);

      suppressScrollSpy = true;
      if (suppressScrollSpyTimer) clearTimeout(suppressScrollSpyTimer);
      suppressScrollSpyTimer = setTimeout(() => {
        suppressScrollSpy = false;
      }, 800);

      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return btn;
  };

  const desktopItems = [];
  const mobileItems = [];

  if (desktopNav) {
    desktopNav.innerHTML = "";
    sections.forEach((section, index) => {
      const btn = createButton(section, index);
      desktopNav.appendChild(btn);
      desktopItems.push(btn);
    });
  }

  if (mobileNav) {
    const container =
      mobileNav.querySelector(".section-nav-mobile-inner") ||
      (() => {
        const wrap = document.createElement("div");
        wrap.className = "section-nav-mobile-inner";
        mobileNav.appendChild(wrap);
        return wrap;
      })();
    container.innerHTML = "";
    sections.forEach((section, index) => {
      const btn = createButton(section, index);
      container.appendChild(btn);
      mobileItems.push(btn);
    });
  }

  navigatorItems = { desktop: desktopItems, mobile: mobileItems };
  return navigatorItems;
}

function setActiveNavItem(navItems, activeId) {
  const allNavItems = [
    ...(navItems?.desktop || []),
    ...(navItems?.mobile || [])
  ];

  allNavItems.forEach((btn) => {
    const isActive = btn.getAttribute("data-target") === activeId;
    btn.classList.toggle("active", isActive);

    if (isActive && btn.closest(".section-nav-mobile-inner")) {
      btn.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest"
      });
    }
  });
}

function initSectionScrollSpy(sections, navItems) {
  if (!sections.length) return;

  const getScrollOffset = () => {
    const navHeight = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue("--navbar-height"),
      10
    );
    return (Number.isNaN(navHeight) ? 64 : navHeight) + 32;
  };

  const updateActiveSection = () => {
    if (suppressScrollSpy) return;

    const scrollPos = window.scrollY + getScrollOffset();
    let activeId = sections[0].id;

    sections.forEach((section) => {
      if (section.el.offsetTop <= scrollPos) {
        activeId = section.id;
      }
    });

    const nearBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 48;
    if (nearBottom) {
      activeId = sections[sections.length - 1].id;
    }

    setActiveNavItem(navItems, activeId);
  };

  window.addEventListener("scroll", updateActiveSection, { passive: true });
  window.addEventListener("resize", updateActiveSection, { passive: true });
  updateActiveSection();
}

function initReportNavbar() {
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.querySelector(".report-navbar .menu");

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      navToggle.classList.toggle("active");
      navMenu.classList.toggle("active");
    });
  }

  window.addEventListener("scroll", () => {
    const navbar = document.querySelector(".report-navbar, .navbar");
    if (!navbar) return;
    navbar.classList.toggle("scrolled", window.scrollY > 50);
  });
}

function initBackToTop() {
  const btn = document.getElementById("backToTop");
  if (!btn) return;

  window.addEventListener("scroll", () => {
    btn.classList.toggle("show", window.scrollY > 300);
  });

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initReportTheme();
  initReportNavbar();
  initBackToTop();

  const sections = getReportSections();
  applyNumberedHeadings(sections);
  const navItems = buildSectionNavigator(sections);
  initSectionScrollSpy(sections, navItems);
});
