document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================================
  // 1. Custom Cursor Logic
  // ==========================================================================
  const cursor = document.querySelector('.custom-cursor');
  const follower = document.querySelector('.custom-cursor-follower');
  
  if (cursor && follower) {
    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;
    let isVisible = false;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      if (!isVisible) {
        cursor.style.opacity = '1';
        follower.style.opacity = '1';
        isVisible = true;
      }
      
      cursor.style.left = `${mouseX}px`;
      cursor.style.top = `${mouseY}px`;
    });

    // Smooth follower tracking
    const updateFollower = () => {
      // Linear interpolation for smooth lag effect
      followerX += (mouseX - followerX) * 0.12;
      followerY += (mouseY - followerY) * 0.12;
      
      follower.style.left = `${followerX}px`;
      follower.style.top = `${followerY}px`;
      
      requestAnimationFrame(updateFollower);
    };
    updateFollower();

    // Hover effect on links and buttons
    const interactiveElements = document.querySelectorAll('a, button, input, textarea, .filter-btn, .project-card');
    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        follower.style.transform = 'translate(-50%, -50%) scale(1.5)';
        follower.style.borderColor = 'var(--color-secondary)';
        cursor.style.transform = 'translate(-50%, -50%) scale(0.5)';
      });
      el.addEventListener('mouseleave', () => {
        follower.style.transform = 'translate(-50%, -50%) scale(1)';
        follower.style.borderColor = 'var(--color-primary)';
        cursor.style.transform = 'translate(-50%, -50%) scale(1)';
      });
    });

    // Hide cursor when leaving screen
    document.addEventListener('mouseleave', () => {
      cursor.style.opacity = '0';
      follower.style.opacity = '0';
      isVisible = false;
    });
  }

  // ==========================================================================
  // 2. Navigation Scroll, Scroll Reveals, & Parallax Floating
  // ==========================================================================
  const header = document.getElementById('main-header');
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });

  // Highlight active menu on scroll
  const scrollObserverOptions = {
    root: null,
    rootMargin: '-80px 0px -60% 0px', // Header offset
    threshold: 0
  };

  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, scrollObserverOptions);

  sections.forEach(section => scrollObserver.observe(section));

  // IntersectionObserver for revealing elements on scroll
  const revealObserverOptions = {
    root: null,
    rootMargin: '0px 0px -12% 0px', // Trigger shortly before element enters viewport
    threshold: 0.05
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        // Once an element is revealed, we stop observing it
        observer.unobserve(entry.target);
      }
    });
  }, revealObserverOptions);

  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  revealElements.forEach(el => revealObserver.observe(el));

  // Optimized Scroll-linked Parallax Floating Effects
  const parallaxElements = document.querySelectorAll('[data-parallax-speed]');
  
  if (parallaxElements.length > 0 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let tick = false;

    const updateParallax = () => {
      const scrollY = window.scrollY;
      
      parallaxElements.forEach(el => {
        const speed = parseFloat(el.getAttribute('data-parallax-speed')) || 0.1;
        // Compute translation value
        const translateY = scrollY * speed;
        // Apply transform using hardware-accelerated translate3d
        el.style.transform = `translate3d(0, ${translateY}px, 0)`;
      });

      tick = false;
    };

    window.addEventListener('scroll', () => {
      if (!tick) {
        window.requestAnimationFrame(updateParallax);
        tick = true;
      }
    }, { passive: true });
  }


  // ==========================================================================
  // 3. Theme Toggle Manager (Dark / Light)
  // ==========================================================================
  const themeToggle = document.getElementById('theme-toggle');
  const htmlElement = document.documentElement;

  // Retrieve existing config or default to OS preference
  const savedTheme = localStorage.getItem('theme');
  const userPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme) {
    htmlElement.setAttribute('data-theme', savedTheme);
  } else if (!userPrefersDark) {
    htmlElement.setAttribute('data-theme', 'light');
  }

  themeToggle.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    createToast('Theme Swapped', `Theme updated to ${newTheme} mode!`, 'info');
  });

  // ==========================================================================
  // 4. Mobile Navigation menu overlay
  // ==========================================================================
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileNavOverlay = document.getElementById('mobile-nav-overlay');
  const menuIcon = mobileMenuBtn.querySelector('.menu-icon');
  const closeIcon = mobileMenuBtn.querySelector('.close-icon');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  const toggleMobileMenu = () => {
    const isOpen = mobileNavOverlay.classList.toggle('open');
    menuIcon.classList.toggle('hidden', isOpen);
    closeIcon.classList.toggle('hidden', !isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };

  mobileMenuBtn.addEventListener('click', toggleMobileMenu);

  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (mobileNavOverlay.classList.contains('open')) {
        toggleMobileMenu();
      }
    });
  });

  // ==========================================================================
  // 5. Projects Filter categories logic
  // ==========================================================================
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Toggle button active classes
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterVal = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const cardCat = card.getAttribute('data-category');
        
        if (filterVal === 'all' || cardCat === filterVal) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    });
  });

  // ==========================================================================
  // 6. Interactive Audio Wave Visualizer on Canvas
  // ==========================================================================
  const waveCanvas = document.getElementById('music-wave-canvas');
  if (waveCanvas) {
    const ctx = waveCanvas.getContext('2d');
    
    // Set matching canvas sizing dynamically
    const resizeCanvas = () => {
      const parent = waveCanvas.parentElement;
      waveCanvas.width = parent.clientWidth;
      waveCanvas.height = parent.clientHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let offset = 0;
    const drawWave = () => {
      ctx.clearRect(0, 0, waveCanvas.width, waveCanvas.height);
      
      const width = waveCanvas.width;
      const height = waveCanvas.height;
      const midY = height / 2;
      
      ctx.lineWidth = 2;
      
      // Draw Grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
      for (let i = 0; i < width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      for (let j = 0; j < height; j += 20) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(width, j);
        ctx.stroke();
      }

      // Draw three layers of waves
      const waves = [
        { amplitude: 35, frequency: 0.012, speed: 0.04, color: 'rgba(6, 182, 212, 0.6)' },  // Secondary
        { amplitude: 20, frequency: 0.02, speed: 0.06, color: 'rgba(236, 72, 153, 0.4)' },   // Accent
        { amplitude: 15, frequency: 0.008, speed: 0.02, color: 'rgba(139, 92, 246, 0.5)' }  // Primary
      ];

      waves.forEach(w => {
        ctx.beginPath();
        ctx.strokeStyle = w.color;
        
        for (let x = 0; x < width; x++) {
          // Compute sine wave position
          const y = midY + Math.sin(x * w.frequency + offset * w.speed) * w.amplitude;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      });

      offset += 1;
      requestAnimationFrame(drawWave);
    };

    drawWave();
  }

  // ==========================================================================
  // 7. Contact Form Handling & Validations
  // ==========================================================================
  const contactForm = document.getElementById('portfolio-contact-form');
  
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      let isValid = true;
      
      const nameInput = document.getElementById('form-name');
      const emailInput = document.getElementById('form-email');
      const subjectInput = document.getElementById('form-subject');
      const messageInput = document.getElementById('form-message');
      
      // Helper validator function
      const validateInput = (input, errorId, condition) => {
        const formGroup = input.closest('.form-group');
        if (condition) {
          formGroup.classList.remove('invalid');
          return true;
        } else {
          formGroup.classList.add('invalid');
          return false;
        }
      };

      // Name Validation
      isValid = validateInput(nameInput, 'name-error', nameInput.value.trim().length > 0) && isValid;
      
      // Email Validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      isValid = validateInput(emailInput, 'email-error', emailRegex.test(emailInput.value.trim())) && isValid;
      
      // Subject Validation
      isValid = validateInput(subjectInput, 'subject-error', subjectInput.value.trim().length > 0) && isValid;
      
      // Message Validation
      isValid = validateInput(messageInput, 'message-error', messageInput.value.trim().length > 0) && isValid;
      
      if (isValid) {
        const submitBtn = contactForm.querySelector('.submit-btn');
        const submitBtnText = submitBtn.querySelector('span');

        submitBtn.disabled = true;
        submitBtnText.textContent = 'Sending...';

        // Collect form data
        const formData = {
          access_key: '72037a9d-0fcf-44f4-9cab-41f3645eb708',
          name: nameInput.value.trim(),
          email: emailInput.value.trim(),
          subject: subjectInput.value.trim(),
          message: messageInput.value.trim(),
          from_name: 'Portfolio Contact Form'
        };

        // Save message locally in localStorage (for admin panel)
        const newMsg = {
          id: Date.now(),
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          date: new Date().toLocaleString()
        };
        const currentMessages = JSON.parse(localStorage.getItem('portfolio_messages') || '[]');
        currentMessages.push(newMsg);
        localStorage.setItem('portfolio_messages', JSON.stringify(currentMessages));

        // Send email via Web3Forms API
        fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(formData)
        })
        .then(async res => {
          const data = await res.json();
          if (res.ok && data.success) {
            createToast('Message Sent!', 'Thank you! Abhinav will get back to you shortly.', 'success');
            contactForm.reset();
          } else {
            createToast('Delivery Issue', 'Message saved locally. Please try again shortly.', 'error');
          }
        })
        .catch(() => {
          // Still saved locally — inform user
          createToast('Offline — Saved Locally', 'Check your internet connection. Message stored for admin review.', 'error');
        })
        .finally(() => {
          submitBtn.disabled = false;
          submitBtnText.textContent = 'Send Message';
        });

      } else {
        createToast('Submission Error', 'Please check highlighted fields and try again.', 'error');
      }
    });

    // Add keyup event to clear invalid states on type
    const formFields = contactForm.querySelectorAll('input, textarea');
    formFields.forEach(field => {
      field.addEventListener('input', () => {
        const formGroup = field.closest('.form-group');
        formGroup.classList.remove('invalid');
      });
    });
  }

  // ==========================================================================
  // 8. Custom Toast Notification Service
  // ==========================================================================
  window.createToast = (title, message, type = 'info') => {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconName = 'info';
    if (type === 'success') iconName = 'check-circle';
    if (type === 'error') iconName = 'alert-circle';
    
    toast.innerHTML = `
      <i data-lucide="${iconName}" class="toast-icon-${type}"></i>
      <div class="toast-content">
        <h4>${title}</h4>
        <p>${message}</p>
      </div>
    `;

    container.appendChild(toast);
    
    // Rerender icons through lucide CDN
    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Auto-remove animation trigger
    setTimeout(() => {
      toast.classList.add('fade-out');
      toast.addEventListener('animationend', () => {
        toast.remove();
      });
    }, 4000);
  };



  // ==========================================================================
  // 3D Pop-up Card Tilt Effect (Smooth cursor hover interaction)
  // ==========================================================================
  const tiltCards = document.querySelectorAll('.project-card, .hero-profile-card, .stat-item, .skill-group, .contact-card');

  tiltCards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; // x position within the element
      const y = e.clientY - rect.top;  // y position within the element
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Maximum angles of rotation (degrees)
      const maxRotateX = 10;
      const maxRotateY = 10;
      
      // Calculate rotation angles based on cursor offset from center
      const rotateX = ((centerY - y) / centerY) * maxRotateX;
      const rotateY = ((x - centerX) / centerX) * maxRotateY;
      
      // Apply the 3D rotation, scaling, and Translation smoothly
      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.03, 1.03, 1.03) translateY(-4px)`;
      card.style.transition = 'transform 0.08s ease-out'; // High precision tracking
    });

    card.addEventListener('mouseleave', () => {
      // Return smoothly to flat default state
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1) translateY(0)';
      card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
    });
  });
});
