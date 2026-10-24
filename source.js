async function loadSharedTemplate() {
	try {
		const response = await fetch("template.html");
		if (!response.ok) throw new Error(`Chargement du template impossible (${response.status})`);
		const template = document.createElement("template");
		template.innerHTML = await response.text();

		const headerMount = document.querySelector('[data-template="header"]');
		const footerMount = document.querySelector('[data-template="footer"]');
		const header = template.content.querySelector(".site-header");
		const footer = template.content.querySelector(".site-footer");
		if (headerMount && header) headerMount.replaceWith(header.cloneNode(true));
		if (footerMount && footer) footerMount.replaceWith(footer.cloneNode(true));
		setActiveNavigation();
	} catch (error) {
		console.error("Le header et le footer communs n’ont pas pu être chargés.", error);
		return;
	}

	initializeMenu();
	initializeHeaderScroll();
	initializeTestimonials();
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

loadSharedTemplate();
