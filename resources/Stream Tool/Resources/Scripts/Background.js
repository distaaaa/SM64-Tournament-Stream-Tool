document.addEventListener("DOMContentLoaded", function() {
    // default (root) icons — used when no theme is selected or theme folder is missing/empty
    const DEFAULT_ICONS = [
        'Resources/Overlay/Stage-Icons/1.png',
        'Resources/Overlay/Stage-Icons/2.png',
        'Resources/Overlay/Stage-Icons/3.png',
        'Resources/Overlay/Stage-Icons/4.png',
        'Resources/Overlay/Stage-Icons/5.png',
        'Resources/Overlay/Stage-Icons/6.png',
        'Resources/Overlay/Stage-Icons/7.png',
        'Resources/Overlay/Stage-Icons/8.png',
        'Resources/Overlay/Stage-Icons/9.png',
        'Resources/Overlay/Stage-Icons/10.png',
        'Resources/Overlay/Stage-Icons/11.png',
        'Resources/Overlay/Stage-Icons/12.png',
        'Resources/Overlay/Stage-Icons/13.png',
        'Resources/Overlay/Stage-Icons/14.png',
        'Resources/Overlay/Stage-Icons/15.png'
    ];

    const circles = document.querySelectorAll('.circles li');

    // cache theme -> icons array
    const themeCache = new Map();
    // cache the currently active icons (used by animation iteration)
    let lastLoadedIcons = null;

    // list of known stage theme folder names — keep in sync with Game Scoreboard's STAGE_THEMES
    const STAGE_THEMES = ['ttt','bob','wf','jrb','ccm','bbh','hmc','lll','ssl','ddd','sl','wdw','thi','ttm','ttc','rr'];

    // debounce timer id
    let themeDebounce = null;
    function loadIconsForTheme(theme, maxIcons = 7) {
        if (!theme) return Promise.resolve([]);
        if (themeCache.has(theme)) return Promise.resolve(themeCache.get(theme));

        const checkPaths = (paths) => {
            const checks = paths.map(src => new Promise(resolve => {
                const img = new Image();
                img.onload = () => resolve({ src, ok: true });
                img.onerror = () => resolve({ src, ok: false });
                img.src = src;
            }));
            return Promise.all(checks).then(results => results.filter(r => r.ok).map(r => r.src));
        };

        // First try theme subfolder
        const themePaths = [];
        for (let i = 1; i <= maxIcons; i++) {
            themePaths.push(`Resources/Overlay/Stage-Icons/${theme}/${i}.png`);
        }

        return checkPaths(themePaths).then(valid => {
            if (valid && valid.length > 0) {
                themeCache.set(theme, valid);
                return valid;
            }

            // No icons found in theme subfolder — fall back to top-level Stage-Icons
            const topLevelPaths = [];
            for (let i = 1; i <= maxIcons; i++) {
                topLevelPaths.push(`Resources/Overlay/Stage-Icons/${i}.png`);
            }
            return checkPaths(topLevelPaths).then(topValid => {
                // cache the fallback result (may be empty)
                themeCache.set(theme, topValid);
                return topValid;
            });
        });
    }

    // decide icon for a single circle element
    function pickIconFor(setIcons) {
        const set = setIcons && setIcons.length ? setIcons : DEFAULT_ICONS;
        return set[Math.floor(Math.random() * set.length)];
    }

    function applyIcons(icons, { forceAll = false } = {}) {
        if (!circles || circles.length === 0) return;
        const setIcons = icons && icons.length ? icons : DEFAULT_ICONS;

        const container = document.getElementById('theBackground') || document.body;
        const containerRect = container.getBoundingClientRect();

        circles.forEach(circle => {
            try {
                if (forceAll) {
                    circle.style.backgroundImage = `url(${pickIconFor(setIcons)})`;
                    return;
                }

                const circleRect = circle.getBoundingClientRect();
                const isOffscreenStart = (circleRect.top >= containerRect.bottom - 50) || (circleRect.bottom <= containerRect.top + 50);
                const isInvisible = window.getComputedStyle(circle).opacity === '0' || window.getComputedStyle(circle).display === 'none';

                if (isOffscreenStart || isInvisible) {
                    circle.style.backgroundImage = `url(${pickIconFor(setIcons)})`;
                }
            } catch (e) {
                circle.style.backgroundImage = `url(${pickIconFor(setIcons)})`;
            }
        });
    }

    async function updateIconsForCurrentTheme() {
        const bg = document.getElementById('theBackground');
        if (!bg) {
            applyIcons(DEFAULT_ICONS);
            return;
        }

        const classList = Array.from(bg.classList);

        const candidates = classList.filter(c => STAGE_THEMES.includes(c));

        for (const cls of candidates) {
            try {
                const icons = await loadIconsForTheme(cls);
                if (icons && icons.length > 0) {
                    lastLoadedIcons = icons.slice();

                    applyIcons(icons, { forceAll: false });
                    return;
                }
            } catch (e) {

            }
        }

        lastLoadedIcons = DEFAULT_ICONS.slice();
        applyIcons(DEFAULT_ICONS, { forceAll: false });
    }

    // observe class attribute changes on #theBackground so icons update when theme changes
    const theBackground = document.getElementById('theBackground');
    if (theBackground) {
        const mo = new MutationObserver(() => {
            // debounce rapid toggles
            if (themeDebounce) clearTimeout(themeDebounce);
            themeDebounce = setTimeout(() => {
                updateIconsForCurrentTheme();
            }, 120);
        });
        mo.observe(theBackground, { attributes: true, attributeFilter: ['class'] });
    }

    if (circles && circles.length) {
        circles.forEach(circle => {
            circle.addEventListener('animationiteration', () => {
                try {
                    const iconsToUse = lastLoadedIcons && lastLoadedIcons.length ? lastLoadedIcons : DEFAULT_ICONS;
                    circle.style.backgroundImage = `url(${pickIconFor(iconsToUse)})`;
                } catch (e) {
                    // ignore
                }
            });
        });
    }

    // initial run
    updateIconsForCurrentTheme();
});