document.addEventListener("DOMContentLoaded", function () {
    const filterBox = document.querySelector(".wd-filter-select");
    if (!filterBox) return;

    const gridTab = document.getElementById("gridLayout");
    const listTab = document.getElementById("listLayout");
    const gridItems = Array.from(gridTab ? gridTab.querySelectorAll(".item-fillter, .card-house") : []);
    const listItems = Array.from(listTab ? listTab.querySelectorAll(".item-fillter, .card-house") : []);
    const allItems = [...gridItems, ...listItems];

    const statusInputs = Array.from(filterBox.querySelectorAll('input[name="status"]'));
    const typeInputs = Array.from(filterBox.querySelectorAll('input[name="type"]'));
    const searchInput = filterBox.querySelector('input[name="text"], input[type="text"]');
    const appliedFilters = document.getElementById("applied-filters");
    const clearAllBtn = document.getElementById("remove-all");
    const gridCountEl = document.querySelector("#product-count-grid .count");
    const listCountEl = document.querySelector("#product-count-list .count");
    const gridCountWrap = document.getElementById("product-count-grid");
    const listCountWrap = document.getElementById("product-count-list");
    const searchForm = filterBox.querySelector(".form-search");

    function normalizeText(text) {
        return (text || "").toString().toLowerCase().trim();
    }

    function slugify(text) {
        return normalizeText(text).replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    }

    function parseNum(text) {
        const m = (text || '').replace(/,/g, '').match(/(\d+(?:\.\d+)?)/);
        return m ? m[1] : '';
    }

    function inferType(card) {
        const src = normalizeText((card.dataset.type || '') + ' ' + card.className + ' ' + (card.querySelectorAll('.tag')[1]?.textContent || '') + ' ' + (card.querySelector('.title')?.textContent || ''));
        if (src.includes('townhouse')) return 'townhouse';
        if (src.includes('villa')) return 'villa';
        if (src.includes('apartment') || src.includes('condo') || src.includes('loft') || src.includes('studio')) return 'apartment';
        return 'apartment';
    }

    function inferStatus(card) {
        const src = normalizeText(card.dataset.status || card.querySelector('.tag')?.textContent || '');
        if (src.includes('buy') || src.includes('sale')) return 'buy';
        if (src.includes('rent')) return 'rent';
        return 'all';
    }

    function inferCity(card) {
        const place = (card.dataset.place || card.querySelector('.place')?.textContent || '').split(',').map(s => s.trim()).filter(Boolean);
        return place.length >= 2 ? slugify(place[place.length - 2]) : '';
    }

    function hydrate(card) {
        card.classList.add('item-fillter');
        const title = (card.dataset.title || card.querySelector('.title')?.textContent || '').trim();
        const place = (card.dataset.place || card.querySelector('.place')?.textContent || '').trim();
        const infoItems = Array.from(card.querySelectorAll('.info li')).map(li => li.textContent.replace(/\s+/g, ' ').trim());
        card.dataset.title = title;
        card.dataset.place = place;
        card.dataset.status = normalizeText(card.dataset.status || inferStatus(card));
        card.dataset.type = normalizeText(card.dataset.type || inferType(card));
        card.dataset.city = normalizeText(card.dataset.city || inferCity(card));
        if (!card.dataset.bedrooms) card.dataset.bedrooms = parseNum(infoItems.find(t => /bed/i.test(t)) || '');
        if (!card.dataset.baths) card.dataset.baths = parseNum(infoItems.find(t => /bath/i.test(t)) || '');
        if (!card.dataset.garages) card.dataset.garages = '1';
    }

    allItems.forEach((card, index) => {
        hydrate(card);
        if (!card.dataset.originalIndex) card.dataset.originalIndex = String(index);
    });

    const sortSelect = document.querySelector('.nice-select.list-sort');

    function getNiceSelectValue(key) {
        const select = filterBox.querySelector(`.nice-select[data-filter-key="${key}"]`);
        const selected = select ? select.querySelector('.option.selected') : null;
        return normalizeText(selected ? (selected.dataset.value || '') : '');
    }

    function setNiceSelectValue(key, value) {
        const select = filterBox.querySelector(`.nice-select[data-filter-key="${key}"]`);
        if (!select) return;
        const options = Array.from(select.querySelectorAll('.option'));
        let target = options.find(opt => normalizeText(opt.dataset.value) === normalizeText(value));
        if (!target) target = options[0] || null;
        options.forEach(opt => opt.classList.remove('selected'));
        if (target) {
            target.classList.add('selected');
            const current = select.querySelector('.current');
            if (current) current.textContent = target.textContent.trim();
        }
    }

    function getFilters() {
        const status = normalizeText(statusInputs.find(i => i.checked)?.value || 'all');
        const types = typeInputs.filter(i => i.checked).map(i => normalizeText(i.value));
        return {
            keyword: normalizeText(searchInput ? searchInput.value : ''),
            status,
            types: types.includes('all') ? ['all'] : types,
            city: getNiceSelectValue('city'),
            bedrooms: getNiceSelectValue('bedrooms'),
            baths: getNiceSelectValue('baths'),
            garages: getNiceSelectValue('garages')
        };
    }

    function matches(item, filters) {
        if (filters.keyword) {
            const hay = normalizeText((item.dataset.title || '') + ' ' + (item.dataset.place || ''));
            if (!hay.includes(filters.keyword)) return false;
        }
        if (filters.status !== 'all' && normalizeText(item.dataset.status) !== filters.status) return false;
        if (!filters.types.includes('all') && filters.types.length && !filters.types.includes(normalizeText(item.dataset.type))) return false;
        if (filters.city && !['all', 'any'].includes(filters.city) && normalizeText(item.dataset.city) !== filters.city) return false;
        if (filters.bedrooms && !['all', 'any'].includes(filters.bedrooms) && normalizeText(item.dataset.bedrooms) !== filters.bedrooms) return false;
        if (filters.baths && !['all', 'any'].includes(filters.baths) && normalizeText(item.dataset.baths) !== filters.baths) return false;
        if (filters.garages && !['all', 'any'].includes(filters.garages) && normalizeText(item.dataset.garages) !== filters.garages) return false;
        return true;
    }

    function updateCounts() {
        const gridVisible = gridItems.filter(i => i.style.display !== 'none').length;
        const listVisible = listItems.filter(i => i.style.display !== 'none').length;
        if (gridCountEl) gridCountEl.textContent = String(gridVisible);
        if (listCountEl) listCountEl.textContent = String(listVisible);
        const listActive = !!(listTab && listTab.classList.contains('active') && listTab.classList.contains('show'));
        if (gridCountWrap) gridCountWrap.style.display = listActive ? 'none' : '';
        if (listCountWrap) listCountWrap.style.display = listActive ? '' : 'none';
    }

    function getSortValue() {
        if (!sortSelect) return 'default';
        const selected = sortSelect.querySelector('.option.selected');
        return normalizeText(selected ? (selected.dataset.value || 'default') : 'default');
    }

    function compareItems(a, b, sortValue) {
        if (sortValue === 'name') {
            return normalizeText(a.dataset.title).localeCompare(normalizeText(b.dataset.title));
        }
        if (sortValue === 'price') {
            return parseFloat(a.dataset.price || '0') - parseFloat(b.dataset.price || '0');
        }
        return parseInt(a.dataset.originalIndex || '0', 10) - parseInt(b.dataset.originalIndex || '0', 10);
    }

    function sortContainerItems(items) {
        if (!items.length) return;
        const sortValue = getSortValue();
        const parent = items[0].parentNode;
        if (!parent) return;
        const sorted = items.slice().sort((a, b) => compareItems(a, b, sortValue));
        sorted.forEach(item => parent.appendChild(item));
    }

    function sortVisibleItems() {
        sortContainerItems(gridItems);
        sortContainerItems(listItems);
    }

    function titleCase(s) { return (s || '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()); }

    function renderAppliedFilters(filters) {
        if (!appliedFilters) return;
        const tags = [];
        if (filters.keyword) tags.push({ key: 'keyword', label: `Keyword: ${filters.keyword}` });
        if (filters.status !== 'all') tags.push({ key: 'status', label: titleCase(filters.status) });
        if (!filters.types.includes('all')) filters.types.forEach(v => tags.push({ key: 'type', value: v, label: titleCase(v) }));
        if (filters.city && !['all', 'any'].includes(filters.city)) tags.push({ key: 'city', label: titleCase(filters.city) });
        if (filters.bedrooms && !['all', 'any'].includes(filters.bedrooms)) tags.push({ key: 'bedrooms', label: `${filters.bedrooms} Bedrooms` });
        if (filters.baths && !['all', 'any'].includes(filters.baths)) tags.push({ key: 'baths', label: `${filters.baths} Baths` });
        if (filters.garages && !['all', 'any'].includes(filters.garages)) tags.push({ key: 'garages', label: `${filters.garages} Garages` });
        appliedFilters.innerHTML = tags.map(tag => `<span class="filter-tag">${tag.label}<span class="remove-tag icon-close" data-filter="${tag.key}" ${tag.value ? `data-value="${tag.value}"` : ''}></span></span>`).join('');
        if (clearAllBtn) clearAllBtn.style.display = tags.length ? '' : 'none';
    }

    function applyFilters() {
        const filters = getFilters();
        gridItems.forEach(item => item.style.display = matches(item, filters) ? '' : 'none');
        listItems.forEach(item => item.style.display = matches(item, filters) ? '' : 'none');
        sortVisibleItems();
        updateCounts();
        renderAppliedFilters(filters);
    }

    function resetTypes() {
        typeInputs.forEach(i => i.checked = normalizeText(i.value) === 'all');
    }

    function resetFilters() {
        if (searchInput) searchInput.value = '';
        statusInputs.forEach(i => i.checked = normalizeText(i.value) === 'all');
        resetTypes();
        setNiceSelectValue('city', 'all');
        setNiceSelectValue('bedrooms', 'any');
        setNiceSelectValue('baths', 'all');
        setNiceSelectValue('garages', 'all');
        applyFilters();
    }

    statusInputs.forEach(i => i.addEventListener('change', applyFilters));
    typeInputs.forEach(input => input.addEventListener('change', function () {
        const val = normalizeText(this.value);
        if (val === 'all' && this.checked) {
            resetTypes();
        } else if (val !== 'all' && this.checked) {
            const all = typeInputs.find(i => normalizeText(i.value) === 'all');
            if (all) all.checked = false;
        }
        const hasSpecific = typeInputs.some(i => normalizeText(i.value) !== 'all' && i.checked);
        if (!hasSpecific) {
            const all = typeInputs.find(i => normalizeText(i.value) === 'all');
            if (all) all.checked = true;
        }
        applyFilters();
    }));

    filterBox.querySelectorAll('.nice-select[data-filter-key]').forEach(select => {
        select.querySelectorAll('.option').forEach(option => {
            option.addEventListener('click', function () {
                setNiceSelectValue(select.dataset.filterKey, this.dataset.value || '');
                applyFilters();
            });
        });
    });

    if (sortSelect) {
        sortSelect.querySelectorAll('.option').forEach(option => {
            option.addEventListener('click', function () {
                sortSelect.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
                const current = sortSelect.querySelector('.current');
                if (current) current.textContent = this.textContent.trim();
                applyFilters();
            });
        });
    }

    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (searchForm) searchForm.addEventListener('submit', function (e) { e.preventDefault(); applyFilters(); });

    if (appliedFilters) {
        appliedFilters.addEventListener('click', function (e) {
            const btn = e.target.closest('.remove-tag');
            if (!btn) return;
            const key = btn.dataset.filter;
            const value = normalizeText(btn.dataset.value || '');
            if (key === 'keyword' && searchInput) searchInput.value = '';
            if (key === 'status') {
                const all = statusInputs.find(i => normalizeText(i.value) === 'all');
                if (all) all.checked = true;
            }
            if (key === 'type') {
                typeInputs.forEach(i => { if (normalizeText(i.value) === value) i.checked = false; });
                const hasSpecific = typeInputs.some(i => normalizeText(i.value) !== 'all' && i.checked);
                if (!hasSpecific) {
                    const all = typeInputs.find(i => normalizeText(i.value) === 'all');
                    if (all) all.checked = true;
                }
            }
            if (key === 'city') setNiceSelectValue('city', 'all');
            if (key === 'bedrooms') setNiceSelectValue('bedrooms', 'any');
            if (key === 'baths') setNiceSelectValue('baths', 'all');
            if (key === 'garages') setNiceSelectValue('garages', 'all');
            applyFilters();
        });
    }

    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', function (e) {
            e.preventDefault();
            resetFilters();
            clearAllBtn.style.display = 'none';
        });
    }

    document.querySelectorAll(".nav-tab-filter [data-bs-toggle='tab']").forEach(tab => {
        tab.addEventListener('shown.bs.tab', applyFilters);
        tab.addEventListener('click', function () { setTimeout(applyFilters, 0); });
    });

    resetFilters();
});