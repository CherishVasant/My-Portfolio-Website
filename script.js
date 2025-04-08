function createStars() 
{
    for (let i = 0; i < 1000; i++) 
    {
        let star1 = document.createElement('div');
        star1.classList.add('star');
        document.body.appendChild(star1);

        const size = Math.random() * 3;
        star1.style.width = `${size}px`;
        star1.style.height = `${size}px`;

        star1.style.left = `${Math.random() * 100}%`;
        star1.style.top = `${Math.random() * 100}%`;

        star1.style.animationDelay = `${Math.random() * 5}s`;
    }
}


window.addEventListener('scroll', function() {
    var navbar = document.querySelector('.navbar');
    if (window.scrollY > (window.innerHeight - 130)) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });


const navlinks = document.querySelectorAll('ul.menu li a');

navlinks.forEach(function(nav) {
nav.addEventListener('click', function() {
  navlinks.forEach(link => link.classList.remove('selected'));

  nav.classList.add('selected');
})
});


var prevbtn = document.getElementById('prevbtn');
var nextbtn = document.getElementById('nextbtn');

var scrollBar = document.querySelector('.horizontal-snap');
var scrollAmount = 1020;

nextbtn.addEventListener('click', () => { 
    scrollBar.scrollBy({ left: scrollAmount, behavior: 'smooth' });
});
prevbtn.addEventListener('click', () => { 
    scrollBar.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
});


const fadeInContainers = document.querySelectorAll(".fade-in");

const observer = new IntersectionObserver(entries => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("visible");
        } else {
            entry.target.classList.remove("visible"); // Remove class when out of view
        }
    });
}, { threshold: 0.1 }); // Lower threshold for smoother activation

fadeInContainers.forEach(container => observer.observe(container));



const backToTopButton = document.getElementById("backToTop");

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
 

function openCertificate(url) {
  window.open(url, "_blank");
}
  

window.onload = function () {
  createStars();
  initializeStarMap();
};

function initializeStarMap() {
  const canvas = document.getElementById("starmap");
  const ctx = canvas.getContext("2d");
  const skillsContainer = document.querySelector(".skillsstarmap");

  function resizeCanvas() {
    canvas.width = skillsContainer.clientWidth;
    canvas.height = skillsContainer.clientHeight;
    drawConstellation();
  }


  let skills = [
    {
      name: "Java",
      x: 0.2,
      y: 0.2,
      level: "Intermediate",
      description: "Object-oriented programming language.",
      usage: "Backend Development",
    },
    {
      name: "C++",
      x: 0.4,
      y: 0.3,
      level: "Intermediate",
      description: "Powerful for game development.",
      usage: "Game Dev, High-performance apps",
    },
    {
      name: "C",
      x: 0.6,
      y: 0.2,
      level: "Intermediate",
      description: "Efficient low-level programming.",
      usage: "System Programming",
    },
    {
      name: "Python",
      x: 0.7,
      y: 0.6,
      level: "Advanced",
      description: "Popular for AI & ML.",
      usage: "AI, Data Science",
    },
    {
      name: "Django",
      x: 0.8,
      y: 0.7,
      level: "Beginner",
      description: "High-level Python web framework.",
      usage: "Web Backend",
    },
    {
      name: "DSA",
      x: 0.5,
      y: 0.45,
      level: "Intermediate",
      description: "Data Structures & Algorithms.",
      usage: "Competitive Programming",
    },
    {
      name: "JavaScript",
      x: 0.3,
      y: 0.55,
      level: "Intermediate",
      description: "The language of the web.",
      usage: "Frontend, Web Dev",
    },
    {
      name: "HTML",
      x: 0.2,
      y: 0.7,
      level: "Proficient",
      description: "Structure for web pages.",
      usage: "Frontend Development",
    },
    {
      name: "CSS",
      x: 0.4,
      y: 0.8,
      level: "Intermediate",
      description: "Styling for web pages.",
      usage: "Frontend, Web Design",
    },
    {
      name: "GitHub",
      x: 0.6,
      y: 0.8,
      level: "Proficient",
      description: "Version control for projects.",
      usage: "Collaboration, Code Management",
    },
    {
      name: "VS Code",
      x: 0.8,
      y: 0.4,
      level: "Proficient",
      description: "Powerful code editor.",
      usage: "Development, Debugging",
    },
    {
      name: "SQL",
      x: 0.53,
      y: 0.7,
      level: "Beginner",
      description: "Used for managing databases.",
      usage: "Databases",
    },
  ];

  let connections = [
    [0, 1], // Java -> C++
    [1, 2], // C++ -> C
    [2, 5], // C -> DSA 
    [6, 7], // JavaScript -> HTML
    [7, 8], // HTML -> CSS
    [9, 10], // GitHub -> VS Code
    [10, 3], // VS Code -> Python 
    [3, 11], // Python -> SQL 
    [11, 5], // SQL -> DSA 
    [0, 6], // Java -> JavaScript
    [5, 6], // DSA -> JavaScript
    [3, 4], // Python -> Django
  ];


  function drawConstellation() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scaledSkills = skills.map(skill => ({
      ...skill,
      x: skill.x * canvas.width,
      y: skill.y * canvas.height
    }));

    ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
    ctx.lineWidth = 2;
    
    canvas.style.position = 'absolute';
    canvas.style.left = '0';
    canvas.style.top = '0';
    canvas.style.zIndex = '1';

    connections.forEach(([start, end]) => {
      ctx.beginPath();
      ctx.moveTo(scaledSkills[start].x, scaledSkills[start].y);
      ctx.lineTo(scaledSkills[end].x, scaledSkills[end].y);
      ctx.stroke();
    });

    const existingStars = skillsContainer.querySelectorAll('.const-star, .skill-label');
    existingStars.forEach(el => el.remove());

    scaledSkills.forEach(skill => {
      let star = document.createElement("div");
      star.classList.add("const-star");
      star.style.position = 'absolute';
      star.style.left = `${skill.x - 5}px`;
      star.style.top = `${skill.y - 5}px`;

      let label = document.createElement("div");
      label.className = "skill-label";
      label.style.position = 'absolute';
      label.style.left = `${skill.x + 16}px`;
      label.style.top = `${skill.y - 8}px`;
      label.innerText = skill.name;
      
      star.addEventListener("mouseenter", () => showTooltip(skill, skill.x, skill.y));
      star.addEventListener("mouseleave", hideTooltip);
      star.addEventListener("click", () => showPopup(skill));

      skillsContainer.appendChild(star);
      skillsContainer.appendChild(label);
    });
  }

  function showTooltip(skill, x, y) {
    const tooltip = document.getElementById("tooltip");
    tooltip.innerHTML = `<strong><span class="gradient-text">${skill.name}</span></strong><br>Level: ${skill.level}<br>${skill.description}<br>Usage: ${skill.usage}`;
    tooltip.style.left = `${x + 250}px`;
    tooltip.style.top = `${y + 640}px`;
    tooltip.style.display = "block";
  }

  function hideTooltip() {
    document.getElementById("tooltip").style.display = "none";
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
};



let m = document.querySelector('.mail');
const form = document.querySelector(".contact-form");

form.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();

    if (name === "" || email === "" || message === "") {
        alert("Please fill out all fields.");
        return;
    }

    console.log("Form Submitted!");
    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Message:", message);

    const subject = encodeURIComponent(`New Message from ${name}`);
    const body = encodeURIComponent(`Dear Cherish, \n\n${message}\n\n Regards, \n${name}`);

    m.href = `mailto:${email}?subject=${subject}&body=${body}`;
    m.click();

    form.reset();
});

