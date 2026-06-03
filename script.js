/* ==========================================================================
   Interactive Controller: AI w zdrowiu psychicznym
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================================================
    // 1. MOBILE NAVIGATION HAMBURGER MENU
    // ==========================================================================
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            const isOpen = navMenu.classList.toggle('open');
            mobileToggle.classList.toggle('open');
            mobileToggle.setAttribute('aria-expanded', isOpen);
        });

        // Close mobile nav when clicking a link
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('open');
                mobileToggle.classList.remove('open');
                mobileToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // ==========================================================================
    // 2. SCROLL PROGRESS BAR & STICKY HEADER SCROLL STATE
    // ==========================================================================
    const progressBar = document.querySelector('.scroll-progress-bar');
    const header = document.querySelector('header');

    window.addEventListener('scroll', () => {
        // Calculate scroll progress
        const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
        
        if (progressBar) {
            progressBar.style.width = scrolled + '%';
        }

        // Toggle sticky header scrolled background
        if (header) {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    });

    // ==========================================================================
    // 3. SMOOTH SCROLLING & ACTIVE SECTION LINK HIGHLIGHTING
    // ==========================================================================
    const sections = document.querySelectorAll('section');

    const scrollObserverOptions = {
        root: null,
        rootMargin: '-50% 0px -50% 0px', // Trigger when section occupies the middle of the viewport
        threshold: 0
    };

    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const activeId = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    const href = link.getAttribute('href');
                    if (href === `#${activeId}`) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        });
    }, scrollObserverOptions);

    sections.forEach(section => {
        scrollObserver.observe(section);
    });

    // ==========================================================================
    // 4. SUB-NAVIGATION TABS INTERACTION
    // ==========================================================================
    const tabContainers = document.querySelectorAll('.tab-container');

    tabContainers.forEach(container => {
        const tabButtons = container.querySelectorAll('.tab-btn');
        const tabPanes = container.querySelectorAll('.tab-pane');

        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTabId = btn.getAttribute('data-tab');

                // Update button active state
                tabButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Update content pane active state
                tabPanes.forEach(pane => {
                    if (pane.getAttribute('id') === targetTabId) {
                        pane.classList.add('active');
                        // Trigger inner chart animations if active tab contains charts
                        animateCSSBarsInPane(pane);
                        animateDonutsInPane(pane);
                    } else {
                        pane.classList.remove('active');
                    }
                });
            });
        });
    });

    // Helper to animate CSS bars in a newly shown tab pane
    function animateCSSBarsInPane(pane) {
        const bars = pane.querySelectorAll('.bar-inner');
        bars.forEach(bar => {
            const targetWidth = bar.getAttribute('data-width');
            bar.style.width = targetWidth;
        });
    }

    // Helper to animate SVG Donuts in a newly shown tab pane
    function animateDonutsInPane(pane) {
        const donuts = pane.querySelectorAll('.donut-segment');
        donuts.forEach(donut => {
            const targetDashOffset = donut.getAttribute('data-dashoffset');
            donut.style.strokeDashoffset = targetDashOffset;
        });
    }

    // ==========================================================================
    // 5. COLLAPSIBLE ACCORDIONS (RESEARCH CARDS & ETHICS RULES)
    // ==========================================================================
    const accordions = document.querySelectorAll('.accordion-card');

    accordions.forEach(card => {
        const header = card.querySelector('.accordion-header');
        const content = card.querySelector('.accordion-content');

        header.addEventListener('click', () => {
            const isExpanded = card.classList.toggle('expanded');
            header.setAttribute('aria-expanded', isExpanded);

            if (isExpanded) {
                content.style.maxHeight = content.scrollHeight + 'px';
            } else {
                content.style.maxHeight = '0px';
            }
        });

        // Recalculate max-height on window resize if expanded
        window.addEventListener('resize', () => {
            if (card.classList.contains('expanded')) {
                content.style.maxHeight = content.scrollHeight + 'px';
            }
        });
    });

    // ==========================================================================
    // 6. SCROLL REVEAL (SUBTLE FADE-IN ANIMATION)
    // ==========================================================================
    const reveals = document.querySelectorAll('.reveal');

    const revealObserverOptions = {
        root: null,
        rootMargin: '0px 0px -100px 0px', // Animate slightly before reaching viewport bottom
        threshold: 0.1
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Animate once
            }
        });
    }, revealObserverOptions);

    reveals.forEach(el => {
        revealObserver.observe(el);
    });

    // ==========================================================================
    // 7. SCROLL-TRIGGERED STATS COUNTER ANIMATION
    // ==========================================================================
    const countUpElements = document.querySelectorAll('.counter-number');

    function animateCounter(el) {
        const targetValueStr = el.getAttribute('data-target');
        const isPercentage = targetValueStr.includes('%');
        const isPlus = targetValueStr.includes('+');
        const isFraction = targetValueStr.includes('/');
        const isGreater = targetValueStr.includes('>');
        
        let target = 0;
        let suffix = '';
        let prefix = '';

        if (isFraction) {
            // Special handling for fractional string (e.g. "~1 z 8 (12.5%)")
            // We animate the inner percentage value in brackets if possible,
            // or simply perform a staggered text replacement.
            // Let's do a smooth text typewriter or stagger for non-standard counters.
            let current = 0;
            const fullText = targetValueStr;
            el.innerText = '0';
            const duration = 1200;
            const stepTime = 50;
            const steps = duration / stepTime;
            const increment = fullText.length / steps;
            
            let step = 0;
            const timer = setInterval(() => {
                step++;
                if (step >= steps) {
                    el.innerText = fullText;
                    clearInterval(timer);
                } else {
                    const charCount = Math.floor(step * increment);
                    el.innerText = fullText.slice(0, charCount) + '_';
                }
            }, stepTime);
            return;
        }

        // Parse numerical value
        let parsedVal = targetValueStr.replace(/[>%+]/g, '').trim();
        target = parseFloat(parsedVal);

        if (isPercentage) suffix += '%';
        if (isPlus) suffix += '+';
        if (isGreater) prefix += '>';

        let start = 0;
        const duration = 1500; // 1.5 seconds duration
        const startTime = performance.now();

        function updateNumber(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            // Ease out quad
            const easeProgress = progress * (2 - progress);
            const currentValue = start + easeProgress * (target - start);

            if (Number.isInteger(target)) {
                el.innerText = prefix + Math.floor(currentValue) + suffix;
            } else {
                el.innerText = prefix + currentValue.toFixed(1) + suffix;
            }

            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            } else {
                el.innerText = targetValueStr; // fallback to absolute text on complete
            }
        }

        requestAnimationFrame(updateNumber);
    }

    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    countUpElements.forEach(el => {
        counterObserver.observe(el);
    });

    // ==========================================================================
    // 8. SCROLL-TRIGGERED CHART ANIMATIONS
    // ==========================================================================
    const chartSections = document.querySelectorAll('.chart-card');

    const chartObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Animate inner CSS bars if present
                const cssBars = entry.target.querySelectorAll('.bar-inner');
                cssBars.forEach(bar => {
                    const targetWidth = bar.getAttribute('data-width');
                    bar.style.width = targetWidth;
                });

                // Animate SVG Donuts if present
                const donuts = entry.target.querySelectorAll('.donut-segment');
                donuts.forEach(donut => {
                    const targetDashOffset = donut.getAttribute('data-dashoffset');
                    donut.style.strokeDashoffset = targetDashOffset;
                });

                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    chartSections.forEach(chart => {
        chartObserver.observe(chart);
    });

    // ==========================================================================
    // 9. "SHOW SOURCE" CITATION DRAWERS
    // ==========================================================================
    const citationButtons = document.querySelectorAll('.citation-toggle-btn');

    citationButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-citation');
            const citationBox = document.getElementById(targetId);

            if (citationBox) {
                const isExpanded = citationBox.classList.toggle('expanded');
                btn.setAttribute('aria-expanded', isExpanded);

                if (isExpanded) {
                    citationBox.style.maxHeight = citationBox.scrollHeight + 'px';
                    btn.querySelector('.citation-toggle-text').innerText = 'Ukryj źródło';
                    btn.querySelector('.citation-chevron').style.transform = 'rotate(180deg)';
                } else {
                    citationBox.style.maxHeight = '0px';
                    btn.querySelector('.citation-toggle-text').innerText = 'Pokaż źródło';
                    btn.querySelector('.citation-chevron').style.transform = 'rotate(0deg)';
                }
            }
        });
    });

    // ==========================================================================
    // 10. BIBLIOGRAPHY COLLAPSIBLE DRAWER
    // ==========================================================================
    const biblioHeader = document.querySelector('.biblio-header');
    const biblioWrapper = document.querySelector('.biblio-list-wrapper');
    const biblioChevron = document.querySelector('.biblio-toggle-indicator svg');

    if (biblioHeader && biblioWrapper) {
        biblioHeader.addEventListener('click', () => {
            const isExpanded = biblioWrapper.classList.toggle('expanded');
            biblioHeader.setAttribute('aria-expanded', isExpanded);

            if (isExpanded) {
                biblioWrapper.style.maxHeight = biblioWrapper.scrollHeight + 'px';
                if (biblioChevron) biblioChevron.style.transform = 'rotate(180deg)';
            } else {
                biblioWrapper.style.maxHeight = '0px';
                if (biblioChevron) biblioChevron.style.transform = 'rotate(0deg)';
            }
        });

        // Recalculate max-height on window resize if expanded
        window.addEventListener('resize', () => {
            if (biblioWrapper.classList.contains('expanded')) {
                biblioWrapper.style.maxHeight = biblioWrapper.scrollHeight + 'px';
            }
        });
    }

    // ==========================================================================
    // 11. SUBMISSION SUBMIT BUTTON ACTION (MOCK FOR ACADEMIC PROTOTYPE)
    // ==========================================================================
    const mockSubmitBtn = document.querySelector('.contrib-card .btn');
    if (mockSubmitBtn) {
        mockSubmitBtn.addEventListener('click', () => {
            alert('Dziękujemy za chęć współtworzenia bazy! W pełnej wersji witryny ten przycisk otworzy formularz zgłoszeniowy umożliwiający przesłanie numeru DOI artykułu do recenzji naukowej.');
        });
    }

    const mockInviteBtn = document.querySelector('.spec-invite .btn-outline');
    if (mockInviteBtn) {
        mockInviteBtn.addEventListener('click', () => {
            alert('W pełnej wersji ten przycisk otworzy formularz zgłoszeniowy dla placówek organizujących szkolenia w zakresie cyfrowego zdrowia psychicznego.');
        });
    }
});
