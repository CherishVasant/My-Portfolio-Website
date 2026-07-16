/* Performant Canvas Starfield Background */
function initStarfield() {
  const canvas = document.getElementById("starfield");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let stars = [];
  const numStars = 150; // Plenty of stars, very cheap on Canvas

  function resizeStarfield() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initStars();
  }

  function initStars() {
    stars = [];
    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5,
        twinkleSpeed: 0.005 + Math.random() * 0.015,
        alpha: Math.random(),
        increasing: Math.random() > 0.5
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    stars.forEach(star => {
      // Twinkle calculation
      if (star.increasing) {
        star.alpha += star.twinkleSpeed;
        if (star.alpha >= 1) {
          star.alpha = 1;
          star.increasing = false;
        }
      } else {
        star.alpha -= star.twinkleSpeed;
        if (star.alpha <= 0.1) {
          star.alpha = 0.1;
          star.increasing = true;
        }
      }

      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resizeStarfield);
  resizeStarfield();
  draw();
}

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

document.addEventListener("DOMContentLoaded", () => {
  initStarfield();
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