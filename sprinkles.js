/* Sprinkles: a static, palette-tinted speckle layer behind page content.
   Shared by the main site and every report page — draws once (no blink/animation)
   and only redraws on resize. */
(function () {
  function initSprinkles() {
    const canvas = document.getElementById("sprinkles");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const numSprinkles = 100;

    const rootStyles = getComputedStyle(document.documentElement);
    const paletteVars = [
      "--color-rose",
      "--color-coral",
      "--color-gold",
      "--color-sage",
      "--color-sky",
      "--color-periwinkle",
      "--color-lavender",
      "--color-amethyst"
    ];

    const hexToRgb = (hex) => {
      const clean = hex.trim().replace("#", "");
      const num = parseInt(clean, 16);
      return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
    };

    const palette = paletteVars
      .map((name) => rootStyles.getPropertyValue(name))
      .filter(Boolean)
      .map(hexToRgb);

    if (!palette.length) palette.push({ r: 245, g: 237, b: 227 });

    function drawSprinkle(s) {
      const r = s.width / 2;
      const half = s.length / 2;

      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.angle);
      ctx.fillStyle = `rgba(${s.color.r}, ${s.color.g}, ${s.color.b}, ${s.alpha})`;

      ctx.beginPath();
      ctx.moveTo(-half + r, -r);
      ctx.lineTo(half - r, -r);
      ctx.arc(half - r, 0, r, -Math.PI / 2, Math.PI / 2);
      ctx.lineTo(-half + r, r);
      ctx.arc(-half + r, 0, r, Math.PI / 2, -Math.PI / 2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    function render() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const sprinkles = [];
      for (let i = 0; i < numSprinkles; i++) {
        sprinkles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          length: 7 + Math.random() * 6,
          width: 3 + Math.random() * 2,
          angle: Math.random() * Math.PI * 2,
          color: palette[Math.floor(Math.random() * palette.length)],
          alpha: 0.25 + Math.random() * 0.35
        });
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      sprinkles.forEach(drawSprinkle);
    }

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(render, 150);
    });

    render();
  }

  document.addEventListener("DOMContentLoaded", initSprinkles);
})();
