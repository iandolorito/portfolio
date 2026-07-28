
const GITHUB_USERNAME = "iandolorito";

/* ---------- Scroll reveal ---------- */
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.2 });

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

/* ---------- Theme toggle (dark / light, monochrome) ---------- */
const root = document.documentElement;
const themeToggle = document.getElementById('themeToggle');

themeToggle.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
});

/* ---------- Scroll progress bar ---------- */
const scrollProgress = document.getElementById('scrollProgress');

function updateScrollProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgress.style.width = progress + '%';
}

window.addEventListener('scroll', updateScrollProgress, { passive: true });
updateScrollProgress();

/* ---------- Cursor spotlight on hero ---------- */
const hero = document.querySelector('.hero');
const spotlight = document.getElementById('heroSpotlight');

if (hero && spotlight) {
    hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        hero.style.setProperty('--spot-x', x + '%');
        hero.style.setProperty('--spot-y', y + '%');
    });
}

/* ---------- Magnetic tilt on project cards ---------- */
document.querySelectorAll('.tilt-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const px = e.clientX - rect.left;
        const py = e.clientY - rect.top;
        const rotateX = ((py - rect.height / 2) / (rect.height / 2)) * -6;
        const rotateY = ((px - rect.width / 2) / (rect.width / 2)) * 6;
        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
    });
});

/* ---------- Contact form status (mailto convenience) ---------- */
const contactForm = document.querySelector('.contact-form');
const formStatus = document.getElementById('formStatus');

if (contactForm) {
    contactForm.addEventListener('submit', () => {
        formStatus.textContent = 'Opening your email client…';
    });
}

/* ---------- GitHub contributions heatmap (mirrors github.com's real graph) ---------- */
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

async function loadGithubContributions() {
    const heatmapEl = document.getElementById('ghHeatmap');
    const monthsEl = document.getElementById('ghMonths');
    const heatmapCard = document.querySelector('.heatmap-card');
    const yearTabsEl = document.getElementById('ghYearTabs');
    const fallbackEl = document.getElementById('ghFallback');
    const totalEl = document.getElementById('ghTotal');
    const yearLabelEl = document.getElementById('ghYearLabel');
    const profileLink = document.getElementById('ghProfileLink');
    const tooltip = document.getElementById('ghTooltip');

    function showFallback(message) {
        fallbackEl.textContent = message;
        fallbackEl.style.display = 'block';
        heatmapCard.style.display = 'none';
        yearTabsEl.style.display = 'none';
    }

    if (!GITHUB_USERNAME || GITHUB_USERNAME === 'your-github-username') {
        profileLink.style.display = 'none';
        showFallback('Add your GitHub username in script.js to show your live contributions here.');
        return;
    }

    profileLink.href = `https://github.com/${GITHUB_USERNAME}`;

    let data;
    try {
        const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=all`);
        if (!res.ok) throw new Error('GitHub contributions request failed');
        data = await res.json();
        if (!data.contributions || !data.contributions.length) throw new Error('No contribution data returned');
    } catch (err) {
        showFallback("Couldn't load live data right now — check the profile link above instead.");
        return;
    }

    // Build a fast lookup by date, and figure out which years have data
    const byDate = new Map();
    data.contributions.forEach((d) => byDate.set(d.date, d));

    const years = Object.keys(data.total || {}).sort((a, b) => b - a);
    if (!years.length) {
        showFallback("Couldn't load live data right now — check the profile link above instead.");
        return;
    }

    let activeYear = years[0];

    function renderYearTabs() {
        yearTabsEl.innerHTML = '';
        years.forEach((year) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'year-tab' + (year === activeYear ? ' active' : '');
            btn.textContent = year;
            btn.addEventListener('click', () => {
                activeYear = year;
                renderYearTabs();
                renderYear(year);
            });
            yearTabsEl.appendChild(btn);
        });
    }

    function renderYear(year) {
        totalEl.textContent = (data.total[year] || 0).toLocaleString();
        yearLabelEl.textContent = year;

        const jan1 = new Date(Date.UTC(year, 0, 1));
        const dec31 = new Date(Date.UTC(year, 11, 31));
        const start = new Date(jan1);
        start.setUTCDate(start.getUTCDate() - start.getUTCDay());
        const end = new Date(dec31);
        end.setUTCDate(end.getUTCDate() + (6 - end.getUTCDay()));

        heatmapEl.innerHTML = '';
        monthsEl.innerHTML = '';

        let col = -1;
        let lastMonth = -1;
        const cursor = new Date(start);

        while (cursor <= end) {
            const row = cursor.getUTCDay();
            if (row === 0) col++;

            const iso = cursor.toISOString().slice(0, 10);
            const inYear = cursor.getUTCFullYear() === Number(year);
            const entry = byDate.get(iso);

            const cell = document.createElement('div');
            if (inYear) {
                cell.className = 'heatmap-cell';
                cell.dataset.level = entry ? entry.level : 0;
                cell.dataset.date = iso;
                cell.dataset.count = entry ? entry.count : 0;
                cell.addEventListener('mouseenter', onCellEnter);
                cell.addEventListener('mousemove', onCellMove);
                cell.addEventListener('mouseleave', onCellLeave);
            } else {
                cell.className = 'heatmap-cell is-empty';
            }
            heatmapEl.appendChild(cell);

            if (row === 0 && inYear && cursor.getUTCDate() <= 7 && cursor.getUTCMonth() !== lastMonth) {
                lastMonth = cursor.getUTCMonth();
                const label = document.createElement('span');
                label.style.gridColumn = String(col + 1);
                label.textContent = MONTH_NAMES[lastMonth];
                monthsEl.appendChild(label);
            }

            cursor.setUTCDate(cursor.getUTCDate() + 1);
        }
    }

    function onCellEnter(e) {
        const { date, count } = e.currentTarget.dataset;
        const nice = new Date(date + 'T00:00:00').toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        tooltip.textContent = `${count} contribution${count === '1' ? '' : 's'} on ${nice}`;
        tooltip.classList.add('visible');
        onCellMove(e);
    }

    function onCellMove(e) {
        tooltip.style.left = e.clientX + 'px';
        tooltip.style.top = e.clientY + 'px';
    }

    function onCellLeave() {
        tooltip.classList.remove('visible');
    }

    renderYearTabs();
    renderYear(activeYear);
}

loadGithubContributions();