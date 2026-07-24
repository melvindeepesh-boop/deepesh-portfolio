import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initThreeScene } from './three-scene.js';

gsap.registerPlugin(ScrollTrigger);

function initApp() {

  // Initialize Three.js 3D Background Scene
  const threeScene = initThreeScene();


  /* ==========================================================================
     1. Preloader Integration (GSAP Enhanced)
     ========================================================================== */
  const preloader = document.getElementById('preloader');
  const loaderStatus = document.querySelector('.loader-status');
  
  const statusMessages = [
    "Initializing AI Portfolio...",
    "Instantiating 3D Neural Space...",
    "Compiling Dynamic Shader Arrays...",
    "Establishing Magnetic Interfaces...",
    "Synapses Synchronized!"
  ];
  
  let msgIdx = 0;
  const msgTimer = setInterval(() => {
    if (msgIdx < statusMessages.length - 1) {
      msgIdx++;
      loaderStatus.textContent = statusMessages[msgIdx];
    }
  }, 400);

  function hidePreloader() {
    setTimeout(() => {
      clearInterval(msgTimer);
      loaderStatus.textContent = "AI Framework Active.";
      
      // GSAP Preloader fade-out animation
      gsap.to(preloader, {
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
        onComplete: () => {
          preloader.style.visibility = 'hidden';
          // Trigger GSAP entrance animations for Hero once preloader leaves
          triggerHeroEntrances();
        }
      });
    }, 2000);
  }

  if (document.readyState === 'complete') {
    hidePreloader();
  } else {
    window.addEventListener('load', hidePreloader);
  }


  /* ==========================================================================
     2. Custom Cursor with Lerp Physics & Magnetic Snapping
     ========================================================================== */
  const cursorRing = document.querySelector('.custom-cursor');
  const cursorDot = document.querySelector('.custom-cursor-dot');
  
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = window.innerWidth / 2;
  let ringY = window.innerHeight / 2;
  
  const lerpFactor = 0.14; // Easing for the cursor ring trail

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Set dot immediately
    cursorDot.style.left = `${mouseX}px`;
    cursorDot.style.top = `${mouseY}px`;
  });

  // Physics animation loop for smooth trailing ring
  function animateCursor() {
    ringX += (mouseX - ringX) * lerpFactor;
    ringY += (mouseY - ringY) * lerpFactor;
    
    cursorRing.style.left = `${ringX}px`;
    cursorRing.style.top = `${ringY}px`;
    
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Active cursor scaling
  window.addEventListener('mousedown', () => cursorRing.classList.add('click-active'));
  window.addEventListener('mouseup', () => cursorRing.classList.remove('click-active'));

  // Magnetic Snapping and cursor hover triggers
  const interactiveElements = document.querySelectorAll('a, button, .magnetic, .ss-tab-btn, .tech-icon-item, .contact-card-box');
  
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursorRing.classList.add('hover-active');
      gsap.to(cursorDot, { scale: 1.5, backgroundColor: '#06b6d4', duration: 0.15 });
    });
    
    el.addEventListener('mouseleave', () => {
      cursorRing.classList.remove('hover-active');
      gsap.to(cursorDot, { scale: 1, backgroundColor: 'var(--accent-color)', duration: 0.15 });
      
      // Reset magnetic offset if magnetic class exists
      if (el.classList.contains('magnetic')) {
        gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: "power3.out" });
      }
    });

    // Magnetic pull behavior
    if (el.classList.contains('magnetic')) {
      el.addEventListener('mousemove', (e) => {
        const bounds = el.getBoundingClientRect();
        // Calculate center of element
        const centerX = bounds.left + bounds.width / 2;
        const centerY = bounds.top + bounds.height / 2;
        
        // Calculate distance from center to mouse
        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;
        
        // Pull element 20% towards mouse coordinates
        gsap.to(el, {
          x: deltaX * 0.22,
          y: deltaY * 0.22,
          duration: 0.2,
          ease: "power2.out"
        });
      });
    }
  });


  /* ==========================================================================
     3. Spotlight Coordinate Sync
     ========================================================================== */
  const heroSection = document.getElementById('home');
  window.addEventListener('mousemove', (e) => {
    // Sync mouse positions for CSS spotlight mask variables
    if (heroSection) {
      const rect = heroSection.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      heroSection.style.setProperty('--mouse-x', `${x}px`);
      heroSection.style.setProperty('--mouse-y', `${y}px`);
    }
  });


  /* ==========================================================================
     4. Dark/Light Theme Switching
     ========================================================================== */
  const themeToggle = document.getElementById('theme-toggle');
  const metaColorScheme = document.querySelector('meta[name="color-scheme"]');

  function setTheme(theme) {
    const isLight = (theme === 'light');
    document.documentElement.classList.toggle('light', isLight);
    document.documentElement.classList.toggle('dark', !isLight);
    metaColorScheme.content = isLight ? 'light' : 'dark';
    localStorage.setItem('color-scheme', isLight ? 'light' : 'dark');

    // Notify Three.js scene of the theme switch
    if (window.updateThreeTheme) {
      window.updateThreeTheme();
    }
  }

  themeToggle.addEventListener('click', () => {
    const isLight = document.documentElement.classList.contains('light');
    setTheme(isLight ? 'dark' : 'light');
  });


  /* ==========================================================================
     5. Scroll Progress Indicator & Sticky Navbar
     ========================================================================== */
  const progressBar = document.querySelector('.scroll-progress-bar-top');
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section');
  const mobileMenuTrigger = document.getElementById('mobile-menu-trigger');
  const navMenu = document.querySelector('.nav-menu');

  window.addEventListener('scroll', () => {
    // Scroll progress calculation
    const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolledPercentage = (window.scrollY / windowHeight) * 100;
    progressBar.style.width = `${scrolledPercentage}%`;

    // Sticky Nav transition
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    trackActiveNav();
  });

  function trackActiveNav() {
    let activeSec = 'home';
    const offset = window.scrollY + 160;

    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (offset >= top && offset < top + height) {
        activeSec = sec.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${activeSec}`);
    });
  }

  // Mobile menu links toggle
  mobileMenuTrigger.addEventListener('click', () => {
    mobileMenuTrigger.classList.toggle('active');
    navMenu.classList.toggle('active');
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenuTrigger.classList.remove('active');
      navMenu.classList.remove('active');
    });
  });


  /* ==========================================================================
     6. Interactive Project Screenshot Tabs (KaiKani)
     ========================================================================== */
  const tabButtons = document.querySelectorAll('.ss-tab-btn');
  const screenshots = document.querySelectorAll('.project-screenshot');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Toggle active states on buttons
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const targetSSNum = btn.getAttribute('data-target');
      
      // Animate active image transition smoothly
      screenshots.forEach(ss => {
        if (ss.getAttribute('data-ss') === targetSSNum) {
          ss.classList.add('active');
        } else {
          ss.classList.remove('active');
        }
      });
    });
  });


  /* ==========================================================================
     7. Custom 3D Card Tilt & Reflect Easing (Physics-based)
     ========================================================================== */
  const tiltCards = document.querySelectorAll('.tilt-card');
  
  tiltCards.forEach(card => {
    const reflection = card.querySelector('.glass-reflection-overlay');

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      // Cursor coordinates relative to card center
      const cardX = e.clientX - rect.left;
      const cardY = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Map to rotation degrees (-10 to 10 deg)
      const rotateY = ((cardX - centerX) / centerX) * 10;
      const rotateX = -((cardY - centerY) / centerY) * 10;
      
      gsap.to(card, {
        rotateX: rotateX,
        rotateY: rotateY,
        scale: 1.02,
        duration: 0.35,
        ease: "power2.out"
      });

      // Reflection glow follow cursor
      if (reflection) {
        const reflectX = (cardX / rect.width) * 200 - 50;
        gsap.to(reflection, {
          left: `${reflectX}%`,
          duration: 0.15,
          ease: "power1.out"
        });
      }
    });

    card.addEventListener('mouseleave', () => {
      // Revert card transformations
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        duration: 0.6,
        ease: "power3.out"
      });

      if (reflection) {
        gsap.to(reflection, {
          left: '-100%',
          duration: 0.5,
          ease: "power2.out"
        });
      }
    });
  });


  /* ==========================================================================
     8. GSAP Scroll Trigger Entrance Animations
     ========================================================================== */
  // Initial entrance animations for Hero items (called after preloader hides)
  function triggerHeroEntrances() {
    const tl = gsap.timeline();
    tl.from('.hero-tag', { opacity: 0, y: -20, duration: 0.5, ease: "power2.out" })
      .from('.hero-title', { opacity: 0, y: 30, duration: 0.8, ease: "power3.out" }, "-=0.3")
      .from('.hero-subtitles-wrapper', { opacity: 0, y: 20, duration: 0.6, ease: "power2.out" }, "-=0.4")
      .from('.hero-description', { opacity: 0, y: 20, duration: 0.6, ease: "power2.out" }, "-=0.4")
      .from('.hero-cta .btn', { opacity: 0, y: 15, stagger: 0.15, duration: 0.5, ease: "power2.out" }, "-=0.3");
  }

  // Setup ScrollTrigger reveal loops for all sections
  const scrollRevealSections = document.querySelectorAll('.scroll-reveal-section');
  scrollRevealSections.forEach(section => {
    gsap.fromTo(section, 
      { opacity: 0, y: 60 },
      {
        opacity: 1,
        y: 0,
        duration: 1.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: section,
          start: "top 82%",
          toggleActions: "play none none none"
        }
      }
    );

    // Staggered entry animation for child cards within the section
    const subCards = section.querySelectorAll('.skills-grid > *, .timeline-item, .contact-card-box');
    if (subCards.length > 0) {
      gsap.from(subCards, {
        opacity: 0,
        y: 30,
        stagger: 0.18,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: section,
          start: "top 78%",
          toggleActions: "play none none none"
        }
      });
    }
  });


  /* ==========================================================================
     9. Footer Animated Stars & Particles Canvas
     ========================================================================== */
  const footerStars = document.getElementById('footer-stars-canvas');
  const footerCtx = footerStars.getContext('2d');
  let fStars = [];
  let fParticles = [];

  function resizeFooterCanvas() {
    const footer = document.getElementById('footer-section');
    if (!footer) return;
    footerStars.width = footer.clientWidth;
    footerStars.height = footer.clientHeight;
  }

  class FooterStar {
    constructor() {
      this.x = Math.random() * footerStars.width;
      this.y = Math.random() * footerStars.height;
      this.size = Math.random() * 1.5 + 0.5;
      this.alpha = Math.random();
      this.fadeSpeed = Math.random() * 0.01 + 0.003;
    }
    update() {
      this.alpha += this.fadeSpeed;
      if (this.alpha > 1 || this.alpha < 0) {
        this.fadeSpeed *= -1;
      }
    }
    draw() {
      footerCtx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, this.alpha * 0.4)})`;
      footerCtx.beginPath();
      footerCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      footerCtx.fill();
    }
  }

  class FooterParticle {
    constructor() {
      this.x = Math.random() * footerStars.width;
      this.y = footerStars.height + Math.random() * 30;
      this.size = Math.random() * 2 + 0.5;
      this.speedY = -(Math.random() * 0.4 + 0.15);
      this.speedX = Math.random() * 0.2 - 0.1;
      this.alpha = Math.random() * 0.5 + 0.2;
    }
    update() {
      this.y += this.speedY;
      this.x += this.speedX;
      this.alpha -= 0.002;
      
      // Reset particle to bottom if dead
      if (this.y < 0 || this.alpha <= 0) {
        this.x = Math.random() * footerStars.width;
        this.y = footerStars.height + 10;
        this.alpha = Math.random() * 0.5 + 0.2;
      }
    }
    draw() {
      const isLight = document.documentElement.classList.contains('light');
      footerCtx.fillStyle = isLight 
        ? `rgba(59, 130, 246, ${Math.max(0, this.alpha * 0.2)})`
        : `rgba(168, 85, 247, ${Math.max(0, this.alpha * 0.25)})`;
      footerCtx.beginPath();
      footerCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      footerCtx.fill();
    }
  }

  function initFooterAssets() {
    fStars = [];
    fParticles = [];
    resizeFooterCanvas();
    
    const starCount = Math.floor(footerStars.width / 15);
    for (let i = 0; i < starCount; i++) {
      fStars.push(new FooterStar());
    }

    const particleCount = Math.floor(footerStars.width / 40);
    for (let i = 0; i < particleCount; i++) {
      fParticles.push(new FooterParticle());
    }
  }

  let footerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        requestAnimationFrame(animateFooterCanvas);
      }
    });
  }, { threshold: 0.01 });
  
  const footer = document.getElementById('footer-section');
  if (footer) footerObserver.observe(footer);

  function animateFooterCanvas() {
    // Only continue loops if footer section is visible
    const bounds = footer.getBoundingClientRect();
    if (bounds.bottom < 0 || bounds.top > window.innerHeight) {
      return;
    }

    footerCtx.clearRect(0, 0, footerStars.width, footerStars.height);
    
    fStars.forEach(star => {
      star.update();
      star.draw();
    });

    fParticles.forEach(p => {
      p.update();
      p.draw();
    });

    requestAnimationFrame(animateFooterCanvas);
  }

  window.addEventListener('resize', initFooterAssets);
  initFooterAssets();


  /* ==========================================================================
     10. Back to Top Button
     ========================================================================== */
  const backToTopBtn = document.getElementById('back-to-top');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
