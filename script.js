// Hero neural network visualization — layered SVG nodes/edges colored
// from the site's rainbow palette tokens (read live so it matches
// whichever theme is active on load).
(function () {
  const nodesG = document.getElementById("heroNodes");
  const edgesG = document.getElementById("heroEdges");
  if (!nodesG || !edgesG) return;

  const rootStyles = getComputedStyle(document.documentElement);
  const colorVars = ["--color-rose", "--color-salmon", "--color-coral", "--color-gold", "--color-sage", "--color-sky", "--color-periwinkle", "--color-lavender", "--color-amethyst"];
  const colors = colorVars
    .map(v => rootStyles.getPropertyValue(v).trim())
    .filter(Boolean);

  const layers = [
    [[40, 90], [40, 190], [40, 290]],
    [[150, 50], [150, 150], [150, 250], [150, 330]],
    [[260, 120], [260, 220], [260, 300]],
    [[350, 190]]
  ];
  const allNodes = [];
  layers.forEach(layer => layer.forEach(point => allNodes.push(point)));

  for (let li = 0; li < layers.length - 1; li++) {
    layers[li].forEach(a => {
      layers[li + 1].forEach(b => {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", a[0]);
        line.setAttribute("y1", a[1]);
        line.setAttribute("x2", b[0]);
        line.setAttribute("y2", b[1]);
        line.setAttribute("stroke", colors[Math.floor(Math.random() * colors.length)]);
        edgesG.appendChild(line);
      });
    });
  }

  allNodes.forEach((p, i) => {
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", p[0]);
    circle.setAttribute("cy", p[1]);
    circle.setAttribute("r", 6);
    const col = colors[i % colors.length];
    circle.setAttribute("fill", col);
    circle.style.filter = `drop-shadow(0 0 6px ${col}99)`;

    const animate = document.createElementNS("http://www.w3.org/2000/svg", "animate");
    animate.setAttribute("attributeName", "r");
    animate.setAttribute("values", "6;8.5;6");
    animate.setAttribute("dur", `${2 + Math.random() * 2}s`);
    animate.setAttribute("repeatCount", "indefinite");
    animate.setAttribute("begin", `${Math.random() * 2}s`);
    circle.appendChild(animate);

    nodesG.appendChild(circle);
  });
})();

// Projects spectrum selector + All Projects toggle.
// Default view filters the project grid to one discipline at a time
// (Machine Learning -> Deep Learning -> NLP -> Gen AI, in that order);
// dragging/clicking the marker switches disciplines. The "All Projects"
// button toggles to the full, unfiltered grid and back.
(function () {
  const track = document.getElementById("specTrack");
  const marker = document.getElementById("specMarker");
  const allBtn = document.getElementById("allProjectsBtn");
  const spectrumWrap = document.getElementById("spectrumWrap");
  const cards = document.querySelectorAll("#projects .project-card");
  if (!track || !marker || !allBtn || !spectrumWrap || !cards.length) return;

  const stops = ["ml", "dl", "nlp", "genai"];
  let activeIndex = 0;
  let allMode = false;

  // Remember scroll position + which spectrum category (or "all") was
  // showing, so clicking a project's report link and then its "Back to
  // Portfolio" link returns to the same spot instead of the hero top.
  const STATE_KEY = "portfolioProjectsState";

  function saveScrollState() {
    try {
      sessionStorage.setItem(STATE_KEY, JSON.stringify({
        activeIndex,
        allMode,
        scrollY: window.scrollY
      }));
    } catch (e) {
      // sessionStorage unavailable (private browsing, etc.) — no-op
    }
  }

  let restoredScrollY = null;
  let restoredActiveIndex = 0;
  let restoredAllMode = false;
  try {
    const saved = JSON.parse(sessionStorage.getItem(STATE_KEY) || "null");
    if (saved) {
      restoredActiveIndex = saved.activeIndex || 0;
      restoredAllMode = !!saved.allMode;
      restoredScrollY = saved.scrollY;
      sessionStorage.removeItem(STATE_KEY);
    }
  } catch (e) {
    // ignore malformed/inaccessible sessionStorage
  }

  window.addEventListener("beforeunload", saveScrollState);

  function applyFilter() {
    cards.forEach(card => {
      const visible = allMode || card.getAttribute("data-cat") === stops[activeIndex];
      card.style.display = visible ? "" : "none";
    });
  }

  function setStage(i) {
    activeIndex = Math.max(0, Math.min(stops.length - 1, i));
    const pct = (activeIndex / (stops.length - 1)) * 100;
    marker.style.left = pct + "%";
    marker.setAttribute("aria-valuenow", String(activeIndex));
    track.querySelectorAll(".spectrum-tick").forEach((tick, idx) => {
      tick.classList.toggle("active", idx === activeIndex);
    });
    applyFilter();
  }

  track.querySelectorAll(".spectrum-tick").forEach((tick, idx) => {
    tick.addEventListener("click", () => setStage(idx));
  });

  function moveToClientX(clientX) {
    const rect = track.getBoundingClientRect();
    let ratio = (clientX - rect.left) / rect.width;
    ratio = Math.max(0, Math.min(1, ratio));
    setStage(Math.round(ratio * (stops.length - 1)));
  }

  let dragging = false;
  marker.addEventListener("mousedown", () => { dragging = true; marker.style.transition = "none"; });
  window.addEventListener("mouseup", () => { if (dragging) { dragging = false; marker.style.transition = ""; } });
  window.addEventListener("mousemove", e => { if (dragging) moveToClientX(e.clientX); });
  marker.addEventListener("touchstart", () => { dragging = true; marker.style.transition = "none"; }, { passive: true });
  window.addEventListener("touchend", () => { if (dragging) { dragging = false; marker.style.transition = ""; } });
  window.addEventListener("touchmove", e => { if (dragging) moveToClientX(e.touches[0].clientX); }, { passive: true });

  marker.addEventListener("keydown", e => {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); setStage(activeIndex + 1); }
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") { e.preventDefault(); setStage(activeIndex - 1); }
  });

  allBtn.addEventListener("click", () => {
    allMode = !allMode;
    allBtn.textContent = allMode ? "Filter by Category" : "All Projects";
    allBtn.classList.toggle("active", allMode);
    spectrumWrap.style.display = allMode ? "none" : "";
    applyFilter();
  });

  if (restoredAllMode) {
    allMode = true;
    allBtn.textContent = "Filter by Category";
    allBtn.classList.add("active");
    spectrumWrap.style.display = "none";
  }
  setStage(restoredActiveIndex);

  if (restoredScrollY !== null) {
    // Jump immediately (avoids a visible flash of the hero before the
    // correct position is applied), then correct once more after full
    // load in case late-loading images/fonts shifted the page height.
    window.scrollTo(0, restoredScrollY);
    window.addEventListener("load", () => window.scrollTo(0, restoredScrollY));
  }
})();

// Navbar scrolled class toggle
// NOTE: guarded with optional chaining — if .navbar isn't found for any
// reason (markup mismatch, timing, etc.) this silently no-ops instead of
// throwing, which would otherwise halt every remaining line in this file.
window.addEventListener('scroll', function () {
  var navbar = document.querySelector('.navbar');
  if (window.scrollY > 50) {
    navbar?.classList.add('scrolled');
  } else {
    navbar?.classList.remove('scrolled');
  }

  // Highlight 'contact' manually when scrolled to the absolute bottom of the page
  // (since the contact section is small, the observer might not mark it as intersecting)
  const navItems = document.querySelectorAll("ul.menu li a");
  if ((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 50) {
    navItems.forEach(link => {
      if (link.getAttribute("href") === "#contact") {
        link.classList.add("selected");
      } else {
        link.classList.remove("selected");
      }
    });
  }
});

// Mobile Hamburger Toggle
const navToggle = document.getElementById("navToggle");
const navMenu = document.querySelector("ul.menu");

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    navToggle.classList.toggle("active");
    navMenu.classList.toggle("active");
  });

  // Close mobile menu when links are clicked
  const navLinks = document.querySelectorAll("ul.menu li a");
  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      navToggle.classList.remove("active");
      navMenu.classList.remove("active");
    });
  });
}

// Scroll Spy: Highlight active menu links
const sections = document.querySelectorAll(".component[id], .hero");
const navItems = document.querySelectorAll("ul.menu li a");

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      let id = entry.target.getAttribute("id");
      if (!id && entry.target.classList.contains("hero")) {
        // Hero section
        navItems.forEach(link => link.classList.remove("selected"));
        return;
      }
      if (id) {
        navItems.forEach(link => {
          if (link.getAttribute("href") === `#${id}`) {
            link.classList.add("selected");
          } else {
            link.classList.remove("selected");
          }
        });
      }
    }
  });
}, {
  rootMargin: "-25% 0px -70% 0px"
});

sections.forEach(section => sectionObserver.observe(section));

// Back to top behavior
const backToTopButton = document.getElementById("backToTop");
if (backToTopButton) {
  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      backToTopButton.classList.add("show");
    } else {
      backToTopButton.classList.remove("show");
    }
  });

  backToTopButton.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function openCertificate(url) {
  window.open(url, "_blank");
}

// Theme Toggle Functionality (Aurora Light & Dark Mode)
function initThemeToggle() {
  const themeToggleBtn = document.getElementById("themeToggle");
  const themeIcon = document.getElementById("themeIcon");
  if (!themeToggleBtn) return;

  const savedTheme = localStorage.getItem("theme") || "dark";
  setTheme(savedTheme);

  themeToggleBtn.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  });

  function setTheme(theme) {
    if (theme === "light") {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
      if (themeIcon) {
        themeIcon.className = "fa-solid fa-sun";
      }
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
      if (themeIcon) {
        themeIcon.className = "fa-solid fa-moon";
      }
    }
    window.dispatchEvent(new Event("themechange"));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initThemeToggle();
});

// Formspree Integration Contact Form Handler
// NOTE: there is currently no <form id="contactForm"> in index.html (the
// Contact section uses connect-card links instead), so this block is
// inert by design — it's guarded and simply does nothing until/unless a
// form with these exact IDs is added back to the markup.
const contactForm = document.getElementById("contactForm");
const statusMsg = document.getElementById("formStatus");
const submitBtn = document.getElementById("submitBtn");

if (contactForm && statusMsg && submitBtn) {
  contactForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = contactForm.name.value.trim();
    const email = contactForm.email.value.trim();
    const message = contactForm.message.value.trim();

    if (name === "" || email === "" || message === "") {
      statusMsg.style.color = "#FF3B5C";
      statusMsg.innerText = "Please fill out all fields.";
      return;
    }

    // Transition loading state
    submitBtn.disabled = true;
    submitBtn.innerText = "Sending Message...";
    statusMsg.style.color = "#FFC857";
    statusMsg.innerText = "Transmitting message...";

    // Check if Formspree action is set (not the placeholder)
    const formAction = contactForm.getAttribute("action");
    if (!formAction || formAction.includes("YOUR_FORM_ID")) {
      // Fallback simulated success for local testing
      setTimeout(() => {
        submitBtn.innerText = "Sent Successfully! 🚀";
        statusMsg.style.color = "#10B981";
        statusMsg.innerText = "[Simulated Success] Replace YOUR_FORM_ID in HTML with your actual Formspree endpoint.";

        contactForm.reset();

        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.innerText = "Send Message";
          statusMsg.innerText = "";
        }, 5000);
      }, 1200);
      return;
    }

    // Send actual data via fetch API to Formspree
    fetch(formAction, {
      method: "POST",
      body: new FormData(contactForm),
      headers: {
        'Accept': 'application/json'
      }
    }).then(response => {
      if (response.ok) {
        submitBtn.innerText = "Sent Successfully! 🚀";
        statusMsg.style.color = "#10B981";
        statusMsg.innerText = "Message sent successfully! Cherish will get back to you shortly.";
        contactForm.reset();
      } else {
        throw new Error("Formspree response not ok");
      }
    }).catch(error => {
      submitBtn.innerText = "Send Message";
      statusMsg.style.color = "#FF3B5C";
      statusMsg.innerText = "Oops! There was a problem sending your message. Please try again.";
    }).finally(() => {
      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerText = "Send Message";
        statusMsg.innerText = "";
      }, 5000);
    });
  });
}