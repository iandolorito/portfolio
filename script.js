(() => {
    'use strict';

    const EMAIL = 'iandolorito16@gmail.com';
    const root = document.documentElement;
    root.classList.add('js');
    const themeToggle = document.getElementById('themeToggle');

    // Storage is optional: restricted browsing must not break the page.
    function applyTheme(theme) {
        root.dataset.theme = theme;
        const themeColor = document.querySelector('meta[name="theme-color"]');
        if (themeColor) themeColor.content = theme === 'dark' ? '#10141d' : '#f7f9fc';
        if (themeToggle) {
            themeToggle.setAttribute('aria-pressed', String(theme === 'dark'));
            themeToggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} colors`);
        }
    }
    let savedTheme;
    try { savedTheme = localStorage.getItem('ian-portfolio-theme'); } catch (_) { /* Optional preference. */ }
    applyTheme(savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : root.dataset.theme || 'light');
    themeToggle?.addEventListener('click', () => {
        const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        try { localStorage.setItem('ian-portfolio-theme', next); } catch (_) { /* Keep the session preference. */ }
    });

    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    function setMenu(open, returnFocus = false) {
        if (!menuToggle || !mainNav) return;
        mainNav.classList.toggle('is-open', open);
        menuToggle.classList.toggle('is-open', open);
        menuToggle.setAttribute('aria-expanded', String(open));
        menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
        if (open) mainNav.querySelector('a')?.focus();
        if (returnFocus) menuToggle.focus();
    }
    menuToggle?.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
    mainNav?.addEventListener('click', (event) => {
        if (event.target.closest('a')) setMenu(false);
    });
    document.addEventListener('click', (event) => {
        if (mainNav && menuToggle && !mainNav.contains(event.target) && !menuToggle.contains(event.target)) setMenu(false);
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && menuToggle?.getAttribute('aria-expanded') === 'true') setMenu(false, true);
    });
    window.addEventListener('resize', () => {
        if (window.innerWidth > 620) setMenu(false);
    });
    if (mainNav && 'IntersectionObserver' in window) {
        const navLinks = [...mainNav.querySelectorAll('a[href^="#"]')];
        const sections = [...document.querySelectorAll('main > section[id]')];
        const navigationObserver = new IntersectionObserver((entries) => {
            const visible = entries.filter((entry) => entry.isIntersecting);
            if (!visible.length) return;
            const active = visible.sort((a, b) => b.boundingClientRect.top - a.boundingClientRect.top)[0].target.id;
            navLinks.forEach((link) => {
                if (link.getAttribute('href') === `#${active}`) link.setAttribute('aria-current', 'location');
                else link.removeAttribute('aria-current');
            });
        }, { rootMargin: '-15% 0px -55% 0px', threshold: 0 });
        sections.forEach((section) => navigationObserver.observe(section));
    }

    const filters = [...document.querySelectorAll('[data-filter]')];
    const projects = [...document.querySelectorAll('.project[data-category]')];
    const workCount = document.getElementById('workCount');
    filters.forEach((filter) => filter.addEventListener('click', () => {
        const category = filter.dataset.filter;
        let visibleCount = 0;
        projects.forEach((project) => {
            const visible = category === 'all' || project.dataset.category.split(/\s+/).includes(category);
            project.hidden = !visible;
            if (visible) visibleCount++;
        });
        filters.forEach((button) => {
            button.setAttribute('aria-pressed', String(button === filter));
            button.classList.toggle('is-active', button === filter);
        });
        if (workCount) workCount.textContent = `${visibleCount} project${visibleCount === 1 ? '' : 's'}`;
    }));
    document.querySelectorAll('a[href="#batang-handa"]').forEach((link) => {
        link.addEventListener('click', () => {
            if (document.getElementById('batang-handa')?.hidden) {
                filters.find((filter) => filter.dataset.filter === 'all')?.click();
            }
        });
    });

    // Keep the desktop layout while filling the space between the preview bars.
    const previewCanvas = document.querySelector('.inline-preview-canvas');
    const inlinePreview = previewCanvas?.querySelector('.inline-preview-frame');
    if (previewCanvas && inlinePreview) {
        const desktopWidth = Number(inlinePreview.getAttribute('width')) || 1440;
        let lastPreviewWidth = 0;
        let lastPreviewHeight = 0;
        function fitDesktopPreview(bounds = previewCanvas.getBoundingClientRect()) {
            const { width: availableWidth, height: availableHeight } = bounds;
            // Filters temporarily hide the card. Keep its scale until it is visible again.
            if (availableWidth <= 0 || availableHeight <= 0) return;
            if (availableWidth === lastPreviewWidth && availableHeight === lastPreviewHeight) return;
            lastPreviewWidth = availableWidth;
            lastPreviewHeight = availableHeight;
            const scale = availableWidth / desktopWidth;
            inlinePreview.style.width = `${desktopWidth}px`;
            inlinePreview.style.height = `${Math.ceil(availableHeight / scale)}px`;
            inlinePreview.style.transform = `scale(${scale})`;
        }
        fitDesktopPreview();
        if ('ResizeObserver' in window) {
            const previewObserver = new window.ResizeObserver((entries) => {
                entries.forEach((entry) => fitDesktopPreview(entry.contentRect));
            });
            previewObserver.observe(previewCanvas);
        } else {
            window.addEventListener('resize', () => fitDesktopPreview());
            filters.forEach((filter) => filter.addEventListener('click', () => fitDesktopPreview()));
        }
    }

    // The toolkit stays readable without JavaScript; buttons add a closer look.
    const toolDescriptions = {
        HTML: 'HTML gives a web page its structure, from headings and links to forms and images.',
        CSS: 'CSS controls the layout, colors, typography, and spacing of a page. It also helps interfaces adapt to different screen sizes.',
        JavaScript: 'JavaScript adds behavior to a website, such as filtering projects, opening menus, and responding to a form.',
        React: 'React helps organize an interface into reusable components and update what people see as data changes.',
        PHP: 'PHP runs on the server to handle application logic, process requests, and connect a website with its data.',
        Laravel: 'Laravel is a PHP framework that organizes common backend tasks, including routes, validation, and database access.',
        'Node.js': 'Node.js runs JavaScript outside the browser, including the code behind web servers and backend applications.',
        Supabase: 'Supabase provides a PostgreSQL database and backend services that help connect an application with its data.',
        MySQL: 'MySQL stores structured information in related tables and uses SQL to find and update that data.',
        PostgreSQL: 'PostgreSQL is a relational database for storing, querying, and keeping application data consistent.',
        Flutter: 'Flutter is a toolkit for building interfaces for mobile and other platforms from a shared Dart codebase.',
        'React Native': 'React Native uses React to build mobile interfaces with native platform components.',
        Python: 'Python is a general-purpose programming language used for scripts, automation, and working through programming fundamentals.',
        Postman: 'Postman helps explore and test APIs by sending requests and inspecting the responses.',
        Figma: 'Figma helps plan interface layouts, build reusable design components, and create interactive prototypes.',
        'Adobe Photoshop': 'Adobe Photoshop is used for image editing, compositing, and preparing visual assets for a design.',
        Canva: 'Canva helps create visual content such as presentations, social graphics, and other design materials.'
    };
    document.querySelectorAll('.skill-group').forEach((group, index) => {
        const tags = group.querySelector('.skill-tags');
        const description = group.querySelector('.skill-body > p');
        if (!tags || !description) return;
        description.id ||= `skill-description-${index + 1}`;
        description.setAttribute('role', 'status');
        description.setAttribute('aria-live', 'polite');
        description.setAttribute('aria-atomic', 'true');
        const groupName = group.querySelector('summary span:not(.skill-number):not(.skill-toggle)')?.textContent.trim() || 'Development';
        tags.setAttribute('role', 'group');
        tags.setAttribute('aria-label', `${groupName} tools`);
        [...tags.children].forEach((chip) => {
            if (chip.tagName !== 'SPAN') return;
            const name = [...chip.childNodes].filter((node) => node.nodeType === Node.TEXT_NODE).map((node) => node.textContent).join('').trim();
            if (!toolDescriptions[name]) return;
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'skill-chip';
            button.setAttribute('aria-label', name);
            button.setAttribute('aria-pressed', 'false');
            button.setAttribute('aria-describedby', description.id);
            button.append(...chip.childNodes);
            button.querySelector('b')?.setAttribute('aria-hidden', 'true');
            chip.replaceWith(button);
            button.addEventListener('click', () => {
                tags.querySelectorAll('.skill-chip').forEach((tool) => tool.setAttribute('aria-pressed', String(tool === button)));
                description.textContent = toolDescriptions[name];
            });
        });
    });

    const projectInfo = {
        batang: {
            eyebrow: 'Mobile capstone / Live website',
            title: 'Batang Handa',
            description: 'A mobile capstone built with Flutter, using Supabase for the backend and SQLite for its local database. Batang Handa focuses on disaster preparedness, resilience, and climate awareness for children in Ligao City.',
            website: 'https://batanghanda.online/',
            details: [
                ['Who it is for', 'Children in Ligao City'],
                ['Built with', 'Flutter'],
                ['Backend', 'Supabase'],
                ['Local database', 'SQLite'],
                ['What it explores', 'Disaster preparedness, resilience, and climate change awareness'],
                ['Project website', 'The Batang Handa website is online at batanghanda.online.'],
                ['Live preview', 'Explore the actual Batang Handa website in the panel beside this project. Choose Expand preview or Open website for a larger view.']
            ]
        },
        portfolio: {
            eyebrow: 'Web / Personal project',
            title: 'A corner of the internet',
            description: 'The website you are exploring: a place for my work, development interests, and the technologies I am learning. Built with HTML, CSS, and JavaScript, with responsive layouts for smaller screens.',
            details: [
                ['Built with', 'HTML, CSS, and JavaScript'],
                ['What to explore', 'Project filters, project details, color themes, and GitHub activity'],
                ['Hosting', 'A static website compatible with GitHub Pages']
            ],
            repository: 'https://github.com/iandolorito/Portfolio'
        },
        practice: {
            eyebrow: 'Web / Ongoing practice',
            title: 'The learning lab',
            description: 'Practice projects using PHP, Laravel, React, and database-driven interfaces. This is where I build my understanding of frontend interfaces, backend systems, and practical web workflows.',
            details: [
                ['Technologies', 'PHP, Laravel, React, and databases'],
                ['Focus', 'Connecting interfaces with backend systems'],
                ['Current stage', 'Ongoing development practice']
            ]
        }
    };
    const dialog = document.getElementById('projectDialog');
    let dialogTrigger;
    let restoreDialogFocus = true;
    function clearLivePreview() {
        dialog?.querySelector('.live-preview')?.remove();
        dialog?.classList.remove('has-live-preview');
    }
    function addLivePreview(website, details) {
        const preview = document.createElement('div');
        preview.className = 'live-preview';
        const toolbar = document.createElement('div');
        toolbar.className = 'preview-toolbar';
        const options = document.createElement('div');
        options.className = 'preview-viewport-options';
        options.setAttribute('role', 'group');
        options.setAttribute('aria-label', 'Preview width');
        const viewport = document.createElement('div');
        viewport.className = 'preview-viewport';
        viewport.dataset.size = 'desktop';
        ['desktop', 'mobile'].forEach((size) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'preview-size-button';
            button.dataset.size = size;
            button.textContent = size === 'desktop' ? 'Desktop' : 'Mobile';
            button.setAttribute('aria-pressed', String(size === 'desktop'));
            button.addEventListener('click', () => {
                viewport.dataset.size = size;
                options.querySelectorAll('.preview-size-button').forEach((option) => option.setAttribute('aria-pressed', String(option === button)));
            });
            options.append(button);
        });
        const link = document.createElement('a');
        link.className = 'preview-open-link';
        link.href = website;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = 'Open full website';
        toolbar.append(options, link);
        const frame = document.createElement('iframe');
        frame.className = 'live-preview-frame';
        frame.title = 'Batang Handa live website preview';
        frame.src = website;
        frame.loading = 'lazy';
        frame.referrerPolicy = 'no-referrer';
        frame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups');
        viewport.append(frame);
        const note = document.createElement('p');
        note.className = 'preview-note';
        note.textContent = 'Live website preview. Open the full site if it does not load here.';
        preview.append(toolbar, viewport, note);
        details.before(preview);
        dialog.classList.add('has-live-preview');
    }
    document.querySelectorAll('[data-project]').forEach((trigger) => {
        trigger.addEventListener('click', () => {
            const info = projectInfo[trigger.dataset.project];
            if (!dialog || !info) return;
            clearLivePreview();
            dialogTrigger = trigger;
            restoreDialogFocus = true;
            const fields = { dialogEyebrow: info.eyebrow, dialogTitle: info.title, dialogDescription: info.description };
            Object.entries(fields).forEach(([id, text]) => {
                const field = document.getElementById(id);
                if (field) field.textContent = text;
            });
            const details = document.getElementById('dialogDetails');
            if (details) {
                if (info.website) addLivePreview(info.website, details);
                details.replaceChildren();
                info.details.forEach(([label, value]) => {
                    const row = document.createElement('div');
                    row.className = 'dialog-detail';
                    const term = document.createElement('h3');
                    const description = document.createElement('p');
                    term.textContent = label;
                    description.textContent = value;
                    row.append(term, description);
                    details.append(row);
                });
                if (info.repository) {
                    const row = document.createElement('div');
                    row.className = 'dialog-detail';
                    const term = document.createElement('h3');
                    const link = document.createElement('a');
                    term.textContent = 'Source';
                    link.className = 'text-link';
                    link.textContent = 'View source on GitHub';
                    link.href = info.repository;
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';
                    row.append(term, link);
                    details.append(row);
                }
            }
            if (typeof dialog.showModal === 'function') dialog.showModal();
            else dialog.setAttribute('open', '');
            dialog.scrollTop = 0;
            document.body.classList.add('dialog-open');
        });
    });
    function closeDialog() {
        if (!dialog?.open) return;
        if (typeof dialog.close === 'function') dialog.close();
        else {
            dialog.removeAttribute('open');
            clearLivePreview();
            document.body.classList.remove('dialog-open');
            dialogTrigger?.focus();
        }
    }
    document.getElementById('dialogClose')?.addEventListener('click', closeDialog);
    document.getElementById('dialogContact')?.addEventListener('click', () => {
        restoreDialogFocus = false;
        closeDialog();
    });
    dialog?.addEventListener('close', () => {
        clearLivePreview();
        document.body.classList.remove('dialog-open');
        if (restoreDialogFocus) dialogTrigger?.focus();
    });
    dialog?.addEventListener('click', (event) => {
        const rect = dialog.getBoundingClientRect();
        if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) closeDialog();
    });

    const copyButton = document.getElementById('copyEmail');
    const copyStatus = document.getElementById('copyStatus');
    function copyFallback(text) {
        const input = document.createElement('textarea');
        input.value = text;
        input.setAttribute('readonly', '');
        input.style.cssText = 'position:fixed;left:-9999px;top:0';
        document.body.append(input);
        input.select();
        let copied = false;
        try { copied = document.execCommand('copy'); } catch (_) { /* Show the address for manual copying. */ }
        input.remove();
        copyButton?.focus();
        return copied;
    }
    copyButton?.addEventListener('click', async () => {
        let copied = false;
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(EMAIL);
                copied = true;
            }
        } catch (_) { /* Try the local fallback. */ }
        if (!copied) copied = copyFallback(EMAIL);
        if (copyStatus) copyStatus.textContent = copied ? 'Email address copied.' : `Copy this address: ${EMAIL}`;
    });

    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');
    let selectedTopic = '';
    if (contactForm) {
        const formRow = contactForm.querySelector('.form-row');
        const messageField = document.getElementById('message');
        if (formRow && messageField) {
            const topics = document.createElement('fieldset');
            topics.className = 'message-topics';
            const legend = document.createElement('legend');
            legend.className = 'topic-legend';
            legend.textContent = 'What would you like to talk about?';
            const options = document.createElement('div');
            options.className = 'topic-options';
            options.setAttribute('role', 'group');
            options.setAttribute('aria-label', 'Message topic');
            const choices = [
                ['Project idea', 'What would you like to build, and who is it for?'],
                ['Collaboration', 'Tell me about your work and how we could collaborate.'],
                ['Say hello', 'Introduce yourself or share what brought you here.']
            ];
            choices.forEach(([topic, prompt]) => {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'topic-button';
                button.textContent = topic;
                button.setAttribute('aria-pressed', 'false');
                button.addEventListener('click', () => {
                    selectedTopic = topic;
                    options.querySelectorAll('.topic-button').forEach((option) => option.setAttribute('aria-pressed', String(option === button)));
                    messageField.placeholder = prompt;
                });
                options.append(button);
            });
            topics.append(legend, options);
            contactForm.insertBefore(topics, formRow);
        }
    }
    contactForm?.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!contactForm.reportValidity()) return;
        const name = contactForm.elements.namedItem('name')?.value.trim() || '';
        const email = contactForm.elements.namedItem('email')?.value.trim() || '';
        const body = (contactForm.elements.namedItem('body') || contactForm.elements.namedItem('message'))?.value.trim() || '';
        if (!name || !body) {
            if (formStatus) formStatus.textContent = 'Please enter your name and a message before opening a draft.';
            const missingField = contactForm.elements.namedItem(!name ? 'name' : 'body') || contactForm.elements.namedItem('message');
            missingField?.focus();
            return;
        }
        const subject = `${selectedTopic || 'Portfolio message'} from ${name}`;
        const message = `Name: ${name}\nReply to: ${email}\n\n${body}`;
        if (formStatus) formStatus.textContent = 'Opening an email draft. Send it from your email app to deliver your message. If no app opens, use the email address above.';
        window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    });
    const currentYear = document.getElementById('currentYear');
    if (currentYear) currentYear.textContent = String(new Date().getFullYear());

    // The contribution graph is an optional, lazily loaded enhancement.
    const ghSummary = document.getElementById('ghSummary');
    const ghGraph = document.getElementById('ghGraph');
    const ghFallback = document.getElementById('ghFallback');
    const ghYearTabs = document.getElementById('ghYearTabs');
    const ghRetry = document.getElementById('ghRetry');
    const ghHeatmap = document.getElementById('ghHeatmap');
    const ghMonths = document.getElementById('ghMonths');
    const ghDayDetail = document.getElementById('ghDayDetail');
    const dateFormatter = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
    let loadingGithub = false;
    let loadedGithub = false;
    function validContribution(entry) {
        if (!entry || typeof entry.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(entry.date)) return false;
        const timestamp = Date.parse(`${entry.date}T00:00:00Z`);
        if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== entry.date) return false;
        const year = Number(entry.date.slice(0, 4));
        return year >= 2008 && year <= new Date().getFullYear() && Number.isSafeInteger(entry.count) && entry.count >= 0 && Number.isInteger(entry.level) && entry.level >= 0 && entry.level <= 4;
    }
    function renderContributions(entries) {
        const byDate = new Map(entries.map((entry) => [entry.date, entry]));
        const years = [...new Set(entries.map((entry) => entry.date.slice(0, 4)))].sort((a, b) => Number(b) - Number(a));
        ghYearTabs.replaceChildren();
        function renderYear(year) {
            const yearEntries = [...byDate.values()].filter((entry) => entry.date.startsWith(year));
            const total = yearEntries.reduce((sum, entry) => sum + entry.count, 0);
            ghSummary.textContent = `${total.toLocaleString()} contribution${total === 1 ? '' : 's'} in ${year}`;
            ghYearTabs.querySelectorAll('button').forEach((button) => {
                const active = button.dataset.year === year;
                button.classList.toggle('active', active);
                button.setAttribute('aria-pressed', String(active));
            });
            ghHeatmap.replaceChildren();
            ghMonths.replaceChildren();
            if (ghDayDetail) ghDayDetail.textContent = 'Select a day to see its contributions. Use arrow keys to explore.';
            const first = new Date(Date.UTC(Number(year), 0, 1));
            const last = new Date(Date.UTC(Number(year), 11, 31));
            const cursor = new Date(first);
            cursor.setUTCDate(cursor.getUTCDate() - cursor.getUTCDay());
            const end = new Date(last);
            end.setUTCDate(end.getUTCDate() + 6 - end.getUTCDay());
            const calendarWeeks = Math.round(((end.getTime() - cursor.getTime()) / 86400000 + 1) / 7);
            ghMonths.style.gridTemplateColumns = `repeat(${calendarWeeks}, minmax(9px, 1fr))`;
            const cells = [];
            let activeCell = 0;
            let column = -1;
            function describeCell(cell) {
                if (ghDayDetail) ghDayDetail.textContent = cell.getAttribute('aria-label');
            }
            function selectCell(cell) {
                if (cells[activeCell]) cells[activeCell].tabIndex = -1;
                activeCell = cells.indexOf(cell);
                cell.tabIndex = 0;
                describeCell(cell);
            }
            while (cursor <= end) {
                if (cursor.getUTCDay() === 0) column++;
                const date = cursor.toISOString().slice(0, 10);
                const inYear = cursor.getUTCFullYear() === Number(year);
                const entry = inYear ? byDate.get(date) : undefined;
                if (inYear && cursor.getUTCDate() === 1) {
                    const label = document.createElement('span');
                    label.textContent = cursor.toLocaleDateString('en', { month: 'short', timeZone: 'UTC' });
                    label.style.gridColumn = String(column + 1);
                    ghMonths.append(label);
                }
                const cell = document.createElement(entry ? 'button' : 'span');
                cell.className = entry ? 'heatmap-cell' : 'heatmap-cell is-empty';
                if (entry) {
                    cell.type = 'button';
                    cell.dataset.level = String(entry.level);
                    cell.dataset.date = date;
                    const text = `${entry.count.toLocaleString()} contribution${entry.count === 1 ? '' : 's'} on ${dateFormatter.format(cursor)}`;
                    cell.setAttribute('aria-label', text);
                    cell.title = text;
                    cell.tabIndex = cells.length === 0 ? 0 : -1;
                    cells.push(cell);
                    cell.addEventListener('focus', () => selectCell(cell));
                    cell.addEventListener('click', () => selectCell(cell));
                    cell.addEventListener('pointerenter', () => describeCell(cell));
                    cell.addEventListener('keydown', (event) => {
                        const offsets = { ArrowUp: -1, ArrowDown: 1, ArrowLeft: -7, ArrowRight: 7 };
                        let next = activeCell;
                        if (event.key in offsets) next += offsets[event.key];
                        else if (event.key === 'Home') next = 0;
                        else if (event.key === 'End') next = cells.length - 1;
                        else return;
                        event.preventDefault();
                        next = Math.max(0, Math.min(cells.length - 1, next));
                        cells[next].focus({ preventScroll: true });
                        cells[next].scrollIntoView({ block: 'nearest', inline: 'nearest' });
                    });
                } else {
                    cell.setAttribute('aria-hidden', 'true');
                    if (inYear) cell.title = `No data available for ${dateFormatter.format(cursor)}`;
                }
                ghHeatmap.append(cell);
                cursor.setUTCDate(cursor.getUTCDate() + 1);
            }
        }
        years.forEach((year) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'year-tab';
            button.dataset.year = year;
            button.textContent = year;
            button.setAttribute('aria-controls', 'ghHeatmap');
            button.addEventListener('click', () => renderYear(year));
            ghYearTabs.append(button);
        });
        renderYear(years[0]);
    }
    async function loadGithub() {
        if (loadingGithub || loadedGithub || !ghSummary || !ghGraph || !ghYearTabs || !ghHeatmap || !ghMonths) return;
        loadingGithub = true;
        ghSummary.textContent = 'Loading public GitHub activity...';
        ghSummary.setAttribute('aria-busy', 'true');
        ghGraph.hidden = true;
        if (ghFallback) ghFallback.hidden = true;
        if (ghRetry) ghRetry.disabled = true;
        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 10000);
        try {
            const response = await fetch('https://github-contributions-api.jogruber.de/v4/iandolorito?y=all', { signal: controller.signal });
            if (!response.ok) throw new Error('Could not load contributions');
            const data = await response.json();
            if (!data || !Array.isArray(data.contributions) || data.contributions.length > 30000) throw new Error('Invalid contribution data');
            const entries = data.contributions.filter(validContribution);
            if (!entries.length) throw new Error('No contribution data available');
            renderContributions(entries);
            ghGraph.hidden = false;
            loadedGithub = true;
        } catch (_) {
            ghSummary.textContent = 'Live activity is unavailable right now.';
            if (ghFallback) ghFallback.hidden = false;
        } finally {
            clearTimeout(timeout);
            loadingGithub = false;
            ghSummary.removeAttribute('aria-busy');
            if (ghRetry) ghRetry.disabled = false;
        }
    }
    ghRetry?.addEventListener('click', loadGithub);
    if (ghSummary) {
        const section = ghSummary.closest('section') || ghSummary;
        if ('IntersectionObserver' in window) {
            const githubObserver = new IntersectionObserver((entries, observer) => {
                if (entries.some((entry) => entry.isIntersecting)) {
                    observer.disconnect();
                    loadGithub();
                }
            }, { rootMargin: '240px' });
            githubObserver.observe(section);
        } else loadGithub();
    }
})();
