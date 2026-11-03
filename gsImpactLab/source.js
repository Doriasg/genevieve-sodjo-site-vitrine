function initializeStatsCounters() {
	const counters = [...document.querySelectorAll(".about-content .stats strong")];
	if (
		!counters.length
		|| window.matchMedia("(prefers-reduced-motion: reduce)").matches
		|| !("IntersectionObserver" in window)
	) return;

	const observer = new IntersectionObserver((entries, currentObserver) => {
		entries.forEach((entry) => {
			if (!entry.isIntersecting) return;

			const counter = entry.target;
			const match = counter.textContent.trim().match(/^([^\d]*)(\d+)(.*)$/);
			if (!match) {
				currentObserver.unobserve(counter);
				return;
			}

			const [, prefix, targetText, suffix] = match;
			const target = Number(targetText);
			const duration = 3400;
			const startTime = performance.now();

			const updateCounter = (currentTime) => {
				const progress = Math.min((currentTime - startTime) / duration, 1);
				const easedProgress = 1 - (1 - progress) ** 4;
				const currentValue = Math.round(target * easedProgress);
				counter.textContent = `${prefix}${currentValue}${suffix}`;

				if (progress < 1) {
					requestAnimationFrame(updateCounter);
				} else {
					counter.textContent = `${prefix}${targetText}${suffix}`;
				}
			};

			currentObserver.unobserve(counter);
			requestAnimationFrame(updateCounter);
		});
	}, {
		threshold: 0.5
	});

	counters.forEach((counter) => observer.observe(counter));
}

function initializeScrollReveals() {
	if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

	const revealElements = [...document.querySelectorAll(
		"main h2, main h3, main p, main .expertise-item, main .course-card, main .reason-list article, main .quote-card, main .stats > div, .site-footer h2, .site-footer p, .site-footer .footer-column a, .site-footer .footer-contact-link"
	)].filter((element) => (
		!element.closest(".hero, .carousel-item")
		&& !element.closest("[hidden]")
	));

	if (!("IntersectionObserver" in window)) return;

	const observer = new IntersectionObserver((entries, currentObserver) => {
		entries.forEach((entry) => {
			if (!entry.isIntersecting) return;
			entry.target.classList.add("is-visible");
			currentObserver.unobserve(entry.target);
		});
	}, {
		threshold: 0.12,
		rootMargin: "0px 0px -36px 0px"
	});

	revealElements.forEach((element, index) => {
		element.classList.add("scroll-reveal");
		element.style.setProperty("--reveal-delay", `${(index % 5) * 70}ms`);
		observer.observe(element);
	});
}

function initializeHeaderScroll() {
	const header = document.querySelector(".site-header");
	if (!header) return;

	const updateHeader = () => header.classList.toggle("is-scrolled", window.scrollY > 24);
	updateHeader();
	window.addEventListener("scroll", updateHeader, { passive: true });
}

function setActiveNavigation() {
	const currentPath = window.location.pathname;
	const currentHash = window.location.hash;
	const links = [...document.querySelectorAll(".primary-nav a")];
	const matchingLink = (currentHash
		? links.find((link) => {
			const url = new URL(link.href, window.location.href);
			return url.pathname === currentPath && url.hash === currentHash;
		})
		: undefined) || links.find((link) => {
			const url = new URL(link.href, window.location.href);
			return url.pathname === currentPath && !url.hash;
		});

	links.forEach((link) => {
		const isActive = link === matchingLink;
		link.classList.toggle("active", isActive);
		if (isActive) link.setAttribute("aria-current", "page");
		else link.removeAttribute("aria-current");
	});
}

function initializeMenu() {
	const menuToggle = document.querySelector(".menu-toggle");
	const primaryNav = document.querySelector(".primary-nav");
	if (!menuToggle || !primaryNav) return;

	menuToggle.addEventListener("click", () => {
		const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
		menuToggle.setAttribute("aria-expanded", String(!isOpen));
		menuToggle.setAttribute("aria-label", isOpen ? "Ouvrir le menu" : "Fermer le menu");
		primaryNav.classList.toggle("is-open", !isOpen);
	});

	primaryNav.querySelectorAll("a").forEach((link) => {
		link.addEventListener("click", () => {
			primaryNav.classList.remove("is-open");
			menuToggle.setAttribute("aria-expanded", "false");
			menuToggle.setAttribute("aria-label", "Ouvrir le menu");
		});
	});
}

function initializeContactFormRedirect() {
	const messageForm = document.querySelector(".footer-message-form");
	if (!messageForm) return;

	messageForm.elements["_next"].value = new URL("merci.html", window.location.href).href;
}

function initializeTestimonials() {
	const cards = [...document.querySelectorAll(".quote-card")];
	const dots = [...document.querySelectorAll(".carousel-dots button")];
	if (!cards.length) return;
	let currentPage = 0;

	const showPage = (page) => {
		currentPage = (page + cards.length) % cards.length;
		const isMobile = window.matchMedia("(max-width: 720px)").matches;
		cards.forEach((card, index) => {
			const isCurrent = index === currentPage;
			card.hidden = isMobile && !isCurrent;
			card.classList.toggle("is-active", isCurrent);
		});
		dots.forEach((dot, index) => {
			dot.classList.toggle("selected", index === currentPage);
			dot.setAttribute("aria-current", index === currentPage ? "true" : "false");
		});
	};

	showPage(0);
	window.matchMedia("(max-width: 720px)").addEventListener("change", () => showPage(currentPage));
	document.querySelector(".carousel-arrow.previous")?.addEventListener("click", () => showPage(currentPage - 1));
	document.querySelector(".carousel-arrow.next")?.addEventListener("click", () => showPage(currentPage + 1));
	dots.forEach((dot, index) => dot.addEventListener("click", () => showPage(index)));
}

setActiveNavigation();
initializeMenu();
initializeContactFormRedirect();
initializeHeaderScroll();
initializeTestimonials();
initializeScrollReveals();
initializeStatsCounters();
