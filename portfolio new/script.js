const shouldStartAtTop = !window.location.hash || window.location.hash === '#top';

if (shouldStartAtTop && 'scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
    window.addEventListener('pageshow', () => {
        window.scrollTo(0, 0);
    }, { once: true });
}

const projectDetails = {
    portfolio: {
        title: 'Portfolio dashboard',
        category: 'Web experience',
        description: 'A responsive personal portfolio shaped around clear navigation, concise project summaries, and a focused contact path.'
    },
    landing: {
        title: 'Product landing page',
        category: 'Interface concept',
        description: 'A landing-page concept exploring clear product storytelling, readable hierarchy, and a direct conversion flow.'
    },
    automation: {
        title: 'Automation toolkit',
        category: 'Systems concept',
        description: 'A utility concept for simplifying repetitive digital tasks through small, focused workflows.'
    },
    analytics: {
        title: 'Analytics interface',
        category: 'Dashboard concept',
        description: 'A dashboard concept focused on making key information easier to scan through deliberate grouping and visual hierarchy.'
    }
};

const toast = document.getElementById('toast');
const portfolioShareUrl = 'https://abhinav-kushwaha.vercel.app/';
const mobileQrImage = document.getElementById('mobile-qr-code');
let toastTimer;

if (mobileQrImage) {
    const qrData = encodeURIComponent(portfolioShareUrl);
    mobileQrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${qrData}&charset-source=UTF-8&margin=0`;
    mobileQrImage.alt = 'QR code to open this website on mobile';
}

const showToast = (message) => {
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2600);
};

const shareMenu = document.getElementById('share-menu');
const shareButton = document.getElementById('share-button');

const copyPortfolioUrl = async () => {
    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(portfolioShareUrl);
            showToast('Portfolio link copied.');
            return;
        }
    } catch {
        // Use the selection-based fallback when clipboard access is unavailable.
    }

    const field = document.createElement('textarea');
    field.value = portfolioShareUrl;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.append(field);
    field.select();
    const copied = document.execCommand('copy');
    field.remove();
    showToast(copied ? 'Portfolio link copied.' : 'Copy the portfolio URL from your browser.');
};

const shareText = "Check out Abhinav Kushwaha's portfolio";
const shareQuery = new URLSearchParams({ url: portfolioShareUrl, text: shareText });

document.querySelector('[data-share-platform="whatsapp"]').href = `https://wa.me/?${shareQuery}`;
document.querySelector('[data-share-platform="telegram"]').href = `https://t.me/share/url?${shareQuery}`;
document.querySelector('[data-share-platform="linkedin"]').href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(portfolioShareUrl)}`;
document.querySelector('[data-share-platform="facebook"]').href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(portfolioShareUrl)}`;
document.querySelector('[data-share-platform="email"]').href = `mailto:?${new URLSearchParams({ subject: "Abhinav Kushwaha's portfolio", body: `${shareText}: ${portfolioShareUrl}` })}`;

shareButton.addEventListener('click', () => {
    const isExpanded = shareButton.getAttribute('aria-expanded') === 'true';
    shareButton.setAttribute('aria-expanded', String(!isExpanded));
    shareMenu.hidden = isExpanded;
});

document.getElementById('copy-share-link').addEventListener('click', copyPortfolioUrl);

document.getElementById('native-share').addEventListener('click', async () => {
    if (!navigator.share) {
        await copyPortfolioUrl();
        return;
    }

    try {
        await navigator.share({ title: 'Abhinav Kushwaha', text: shareText, url: portfolioShareUrl });
    } catch (error) {
        if (error.name !== 'AbortError') showToast('Could not open sharing apps.');
    }
});

document.addEventListener('click', (event) => {
    if (!shareMenu.hidden && !event.target.closest('.hub-topbar')) {
        shareMenu.hidden = true;
        shareButton.setAttribute('aria-expanded', 'false');
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !shareMenu.hidden) {
        shareMenu.hidden = true;
        shareButton.setAttribute('aria-expanded', 'false');
        shareButton.focus();
    }
});

const founderPortal = document.querySelector('.founder-portal');
const siteDialog = document.getElementById('site-dialog');
const founderIframe = document.getElementById('founder-iframe');

if (founderPortal && siteDialog && founderIframe) {
    founderPortal.addEventListener('click', (event) => {
        event.preventDefault();
        founderIframe.src = founderPortal.dataset.embedUrl;
        siteDialog.showModal();
    });

    siteDialog.addEventListener('click', (event) => {
        if (event.target === siteDialog) siteDialog.close();
    });
}

const projectButtons = [...document.querySelectorAll('.project-link')];
const filterButtons = [...document.querySelectorAll('.filter-button')];
const workCount = document.getElementById('work-count');

if (filterButtons.length && workCount) {
    filterButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const filter = button.dataset.filter;
            let visibleCount = 0;

            filterButtons.forEach((filterButton) => {
                const isActive = filterButton === button;
                filterButton.classList.toggle('is-active', isActive);
                filterButton.setAttribute('aria-pressed', String(isActive));
            });

            projectButtons.forEach((projectButton) => {
                const isVisible = filter === 'all' || projectButton.dataset.category === filter;
                projectButton.hidden = !isVisible;
                if (isVisible) visibleCount += 1;
            });

            workCount.textContent = `${String(visibleCount).padStart(2, '0')} ${visibleCount === 1 ? 'project' : 'projects'}`;
        });
    });
}

const cookieBanner = document.querySelector('.cookie-banner');
const cookieClose = document.querySelector('.cookie-close');
const cookieToggles = [...document.querySelectorAll('.toggle-switch')];
const acceptAllButton = document.querySelector('.cookie-action.primary');
const rejectAllButton = document.querySelector('.cookie-action.tertiary');
const saveChoicesButton = document.querySelector('.cookie-action.secondary');
const manageCookiePreferences = document.getElementById('manage-cookie-preferences');
const cookieStorageKey = 'portfolio-cookie-preferences';

const readCookiePreferences = () => {
    try {
        return JSON.parse(localStorage.getItem(cookieStorageKey));
    } catch {
        return null;
    }
};

const setCookiePreferences = (preferences) => {
    try {
        localStorage.setItem(cookieStorageKey, JSON.stringify(preferences));
    } catch {
        // Keep the current choice for this page view if storage is unavailable.
    }
};

const openCookiePreferences = () => {
    if (!cookieBanner) return;
    const preferences = readCookiePreferences();
    cookieToggles.forEach((toggle) => {
        const isOn = preferences?.[toggle.dataset.category] === true;
        toggle.classList.toggle('is-on', isOn);
        toggle.setAttribute('aria-pressed', String(isOn));
    });
    cookieBanner.hidden = false;
    cookieClose?.focus();
};

const finishConsent = (choice) => {
    if (!cookieBanner) return;

    const preferences = choice === 'accept'
        ? { analytics: true, personalization: true }
        : choice === 'reject'
            ? { analytics: false, personalization: false }
            : Object.fromEntries(cookieToggles.map((toggle) => [toggle.dataset.category, toggle.classList.contains('is-on')]));

    setCookiePreferences(preferences);
    cookieBanner.hidden = true;
    manageCookiePreferences?.focus();
    showToast('Cookie preferences saved.');
};

if (cookieBanner) {
    const savedPreferences = readCookiePreferences();

    cookieToggles.forEach((toggle) => {
        const category = toggle.dataset.category;
        const isOn = savedPreferences?.[category] === true;
        toggle.classList.toggle('is-on', isOn);
        toggle.setAttribute('aria-pressed', String(isOn));
    });

    if (!savedPreferences) openCookiePreferences();

    cookieClose?.addEventListener('click', () => {
        if (readCookiePreferences()) {
            cookieBanner.hidden = true;
            manageCookiePreferences?.focus();
            return;
        }
        finishConsent('reject');
    });

    cookieToggles.forEach((toggle) => {
        toggle.addEventListener('click', () => {
            const isEnabled = toggle.classList.toggle('is-on');
            toggle.setAttribute('aria-pressed', String(isEnabled));
        });
    });

    acceptAllButton?.addEventListener('click', () => {
        cookieToggles.forEach((toggle) => {
            toggle.classList.add('is-on');
            toggle.setAttribute('aria-pressed', 'true');
        });
        finishConsent('accept');
    });

    saveChoicesButton?.addEventListener('click', () => finishConsent('save'));

    rejectAllButton?.addEventListener('click', () => {
        cookieToggles.forEach((toggle) => {
            toggle.classList.remove('is-on');
            toggle.setAttribute('aria-pressed', 'false');
        });
        finishConsent('reject');
    });

    manageCookiePreferences?.addEventListener('click', openCookiePreferences);
}

const projectDialog = document.getElementById('project-dialog');
const dialogTitle = document.getElementById('dialog-title');
const dialogDescription = document.getElementById('dialog-description');
const dialogCategory = document.getElementById('dialog-category');

if (projectDialog && dialogTitle && dialogDescription && dialogCategory) {
    projectButtons.forEach((button) => {
        button.setAttribute('aria-haspopup', 'dialog');
        button.addEventListener('click', () => {
            const details = projectDetails[button.dataset.project];
            if (!details) return;

            dialogTitle.textContent = details.title;
            dialogDescription.textContent = details.description;
            dialogCategory.textContent = details.category;
            projectDialog.showModal();
        });
    });

    projectDialog.addEventListener('click', (event) => {
        if (event.target === projectDialog) projectDialog.close();
    });

    const dialogContact = document.getElementById('dialog-contact');
    if (dialogContact) {
        dialogContact.addEventListener('click', () => projectDialog.close());
    }
}
