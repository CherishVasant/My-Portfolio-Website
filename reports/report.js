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
  }

  setTheme(localStorage.getItem("theme") || "dark");

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") || "dark";
      setTheme(current === "dark" ? "light" : "dark");
    });
  }
}

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

function buildSectionNavigator(sections) {
  const desktopNav = document.getElementById("sectionNavDesktop");
  const mobileNav = document.getElementById("sectionNavMobile");
  if (!desktopNav && !mobileNav) return null;

  const createButton = (section, index) => {
    const num = formatSectionNumber(index);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `section-nav-item ${accentClassFor(index)}`;
    btn.textContent = num;
    btn.setAttribute("data-target", section.id);
    btn.setAttribute("aria-label", `Go to section ${num}`);
    btn.addEventListener("click", () => {
      const target = document.getElementById(section.id);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
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

  return { desktop: desktopItems, mobile: mobileItems };
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
