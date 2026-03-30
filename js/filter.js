document.addEventListener("DOMContentLoaded", function () {
    const filterBox = document.querySelector('.wd-filter-select');
    if (!filterBox) return;

    const gridLayout = document.getElementById('gridLayout');
    const listLayout = document.getElementById('listLayout');
    const gridItems = Array.from(document.querySelectorAll('#gridLayout .item-fillter, #gridLayout .card-house'));
    const listItems = Array.from(document.querySelectorAll('#listLayout .item-fillter, #listLayout .card-house'));
    const allItems = [...new Set([...gridItems, ...listItems])];

    const statusInputs = Array.from(filterBox.querySelectorAll('input[name="status"]'));
    const typeInputs = Array.from(filterBox.querySelectorAll('input[name="type"]'));
    const searchInput = filterBox.querySelector('input[name="text"], input[type="text"]');
    const searchForm = filterBox.querySelector('.form-search');
    const appliedFilters = document.getElementById('applied-filters');
    const clearAllBtns = document.querySelectorAll('.remove-all');
    const gridCountEl = document.querySelector('#product-count-grid .count');
    const listCountEl = document.querySelector('#product-count-list .count');
    const gridCountWrap = document.getElementById('product-count-grid');
    const listCountWrap = document.getElementById('product-count-list');
    const sortSelect = document.querySelector('.nice-select.list-sort');

    function normalizeText(value) {
        return (value || '').toString().toLowerCase().trim();
    }

    function slugify(value) {
        return normalizeText(value)
            .replace(/&/g, ' and ')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    function extractFirstNumber(value) {
        const match = String(value || '').replace(/,/g, '').match(/(\d+(?:\.\d+)?)/);
        return match ? match[1] : '';
    }

    function parseNumber(value) {
        const cleaned = String(value == null ? '' : value).replace(/[^\d.\-]/g, '');
        if (!cleaned) return null;
        const num = parseFloat(cleaned);
        return Number.isNaN(num) ? null : num;
    }

    function inferStatus(card) {
        const source = normalizeText(card.dataset.status || card.querySelector('.tag')?.textContent || '');
        if (source.includes('buy') || source.includes('sale')) return 'buy';
        if (source.includes('rent')) return 'rent';
        return 'all';
    }

    function inferType(card) {
        const source = normalizeText((card.dataset.type || '') + ' ' + card.className + ' ' + (card.querySelectorAll('.tag')[1]?.textContent || '') + ' ' + (card.querySelector('.title')?.textContent || ''));
        if (source.includes('townhouse')) return 'townhouse';
        if (source.includes('villa')) return 'villa';
        return 'apartment';
    }

    function inferCity(card) {
        const place = (card.dataset.place || card.querySelector('.place')?.textContent || '')
            .split(',')
            .map(s => s.trim())
            .filter(Boolean);
        return place.length >= 2 ? slugify(place[place.length - 2]) : '';
    }

    function hydrateCard(card, index) {
        card.classList.add('item-fillter');
        const title = (card.dataset.title || card.querySelector('.title')?.textContent || '').trim();
        const place = (card.dataset.place || card.querySelector('.place')?.textContent || '').trim();
        const infoTexts = Array.from(card.querySelectorAll('.info li')).map(li => li.textContent.replace(/\s+/g, ' ').trim());

        card.dataset.title = title;
        card.dataset.place = place;
        card.dataset.status = normalizeText(card.dataset.status || inferStatus(card));
        card.dataset.type = normalizeText(card.dataset.type || inferType(card));
        card.dataset.city = normalizeText(card.dataset.city || inferCity(card));
        if (!card.dataset.bedrooms) card.dataset.bedrooms = extractFirstNumber(infoTexts.find(t => /bed/i.test(t)) || '');
        if (!card.dataset.baths) card.dataset.baths = extractFirstNumber(infoTexts.find(t => /bath/i.test(t)) || '');
        if (!card.dataset.garages) card.dataset.garages = extractFirstNumber(infoTexts.find(t => /garage|parking|car/i.test(t)) || '') || '1';
        if (!card.dataset.originalIndex) card.dataset.originalIndex = String(index);
    }

    allItems.forEach(hydrateCard);

    function getNumericDataset(items, key) {
        return items.map(item => parseFloat(item.dataset[key] || '')).filter(num => !Number.isNaN(num));
    }

    const priceValues = getNumericDataset(allItems, 'price');
    const sqftValues = getNumericDataset(allItems, 'sqft');
    const defaultPriceRange = {
        min: priceValues.length ? Math.min(...priceValues) : null,
        max: priceValues.length ? Math.max(...priceValues) : null
    };
    const defaultSqftRange = {
        min: sqftValues.length ? Math.min(...sqftValues) : null,
        max: sqftValues.length ? Math.max(...sqftValues) : null
    };

    function getNiceSelectByKey(key) {
        return filterBox.querySelector(`.nice-select[data-filter-key="${key}"]`);
    }

    function getNiceSelectValue(key) {
        const select = getNiceSelectByKey(key);
        const option = select ? select.querySelector('.option.selected') : null;
        return normalizeText(option ? (option.dataset.value || option.textContent) : '');
    }

    function setNiceSelectValue(key, value) {
        const select = getNiceSelectByKey(key);
        if (!select) return;
        const options = Array.from(select.querySelectorAll('.option'));
        let target = options.find(opt => normalizeText(opt.dataset.value || opt.textContent) === normalizeText(value));
        if (!target) target = options[0] || null;
        options.forEach(opt => opt.classList.remove('selected'));
        if (target) {
            target.classList.add('selected');
            const current = select.querySelector('.current');
            if (current) current.textContent = target.textContent.trim();
        }
    }

    function readSliderRange(sliderId, minId, maxId, defaults) {
        const slider = document.getElementById(sliderId);
        const minEl = document.getElementById(minId);
        const maxEl = document.getElementById(maxId);
        let min = minEl ? parseNumber(minEl.textContent) : null;
        let max = maxEl ? parseNumber(maxEl.textContent) : null;

        if ((min === null || max === null) && slider && slider.noUiSlider) {
            const values = slider.noUiSlider.get();
            if (Array.isArray(values) && values.length >= 2) {
                if (min === null) min = parseNumber(values[0]);
                if (max === null) max = parseNumber(values[1]);
            }
        }

        if (min === null && slider && slider.dataset.currentMin) min = parseNumber(slider.dataset.currentMin);
        if (max === null && slider && slider.dataset.currentMax) max = parseNumber(slider.dataset.currentMax);
        if (min === null) min = defaults.min;
        if (max === null) max = defaults.max;

        if (min !== null && max !== null && min > max) {
            const temp = min;
            min = max;
            max = temp;
        }

        const isActive = (
            defaults.min !== null && defaults.max !== null && (
                Math.abs((min ?? defaults.min) - defaults.min) > 0.001 ||
                Math.abs((max ?? defaults.max) - defaults.max) > 0.001
            )
        );

        return { min, max, isActive };
    }

    function setSliderRange(sliderId, minId, maxId, defaults) {
        const slider = document.getElementById(sliderId);
        const minEl = document.getElementById(minId);
        const maxEl = document.getElementById(maxId);
        if (slider && slider.noUiSlider && defaults.min !== null && defaults.max !== null) {
            slider.noUiSlider.set([defaults.min, defaults.max]);
        }
        if (minEl && defaults.min !== null) minEl.textContent = String(defaults.min);
        if (maxEl && defaults.max !== null) maxEl.textContent = String(defaults.max);
        if (slider) {
            slider.dataset.currentMin = defaults.min != null ? String(defaults.min) : '';
            slider.dataset.currentMax = defaults.max != null ? String(defaults.max) : '';
        }
    }

    function getSortValue() {
        const selected = sortSelect ? sortSelect.querySelector('.option.selected') : null;
        return normalizeText(selected ? (selected.dataset.value || selected.textContent) : 'best selling');
    }

    function getFilters() {
        const status = normalizeText(statusInputs.find(input => input.checked)?.value || 'all');
        const types = typeInputs.filter(input => input.checked).map(input => normalizeText(input.value));
        return {
            keyword: normalizeText(searchInput ? searchInput.value : ''),
            status,
            types: types.includes('all') ? ['all'] : types,
            city: getNiceSelectValue('city'),
            bedrooms: getNiceSelectValue('bedrooms'),
            baths: getNiceSelectValue('baths'),
            garages: getNiceSelectValue('garages'),
            priceRange: readSliderRange('price-value-range', 'price-min-value', 'price-max-value', defaultPriceRange),
            sqftRange: readSliderRange('price-value-range-2', 'price-min-value-2', 'price-max-value-2', defaultSqftRange)
        };
    }

    function matchExactFilter(itemValue, filterValue) {
        return !filterValue || filterValue === 'all' || filterValue === 'any' || normalizeText(itemValue) === filterValue;
    }

    function matchRange(item, key, min, max) {
        const value = parseFloat(item.dataset[key]);
        if (Number.isNaN(value)) return true;
        if (min !== null && value < min) return false;
        if (max !== null && value > max) return false;
        return true;
    }

    function matches(item, filters) {
        if (filters.keyword) {
            const haystack = normalizeText((item.dataset.title || '') + ' ' + (item.dataset.place || ''));
            if (!haystack.includes(filters.keyword)) return false;
        }
        if (filters.status !== 'all' && normalizeText(item.dataset.status) !== filters.status) return false;
        if (!filters.types.includes('all') && filters.types.length && !filters.types.includes(normalizeText(item.dataset.type))) return false;
        if (!matchExactFilter(item.dataset.city, filters.city)) return false;
        if (!matchExactFilter(item.dataset.bedrooms, filters.bedrooms)) return false;
        if (!matchExactFilter(item.dataset.baths, filters.baths)) return false;
        if (!matchExactFilter(item.dataset.garages, filters.garages)) return false;
        if (!matchRange(item, 'price', filters.priceRange.min, filters.priceRange.max)) return false;
        if (!matchRange(item, 'sqft', filters.sqftRange.min, filters.sqftRange.max)) return false;
        return true;
    }

    function compareItems(a, b, sortValue) {
        const titleA = normalizeText(a.dataset.title);
        const titleB = normalizeText(b.dataset.title);
        const priceA = parseFloat(a.dataset.price || '0');
        const priceB = parseFloat(b.dataset.price || '0');

        if (sortValue.includes('name')) return titleA.localeCompare(titleB);
        if (sortValue.includes('price')) return priceA - priceB;
        return parseInt(a.dataset.originalIndex || '0', 10) - parseInt(b.dataset.originalIndex || '0', 10);
    }

    function sortContainer(items) {
        if (!items.length) return;
        const parent = items[0].parentNode;
        if (!parent) return;
        const sorted = items.slice().sort((a, b) => compareItems(a, b, getSortValue()));
        sorted.forEach(item => parent.appendChild(item));
    }

    function updateCounts() {
        const gridVisible = gridItems.filter(item => item.style.display !== 'none').length;
        const listVisible = listItems.filter(item => item.style.display !== 'none').length;
        if (gridCountEl) gridCountEl.textContent = String(gridVisible);
        if (listCountEl) listCountEl.textContent = String(listVisible);

        const activeTab = document.querySelector('.nav-tab-filter .nav-link-item.active, .nav-tab-filter [data-bs-toggle="tab"].active');
        const target = activeTab ? (activeTab.getAttribute('data-bs-target') || activeTab.getAttribute('href') || '') : '';
        const isList = target === '#listLayout';
        if (gridCountWrap) gridCountWrap.style.display = isList ? 'none' : '';
        if (listCountWrap) listCountWrap.style.display = isList ? '' : 'none';
    }

    function titleCase(value) {
        return String(value || '').replace(/-/g, ' ').replace(/\w/g, c => c.toUpperCase());
    }

    function renderAppliedFilters(filters) {
        if (!appliedFilters) return;
        const tags = [];
        if (filters.keyword) tags.push({ key: 'keyword', label: `Keyword: ${filters.keyword}` });
        if (filters.status !== 'all') tags.push({ key: 'status', label: titleCase(filters.status) });
        if (!filters.types.includes('all')) filters.types.forEach(value => tags.push({ key: 'type', value, label: titleCase(value) }));
        if (filters.city && !['all', 'any'].includes(filters.city)) tags.push({ key: 'city', label: titleCase(filters.city) });
        if (filters.bedrooms && !['all', 'any'].includes(filters.bedrooms)) tags.push({ key: 'bedrooms', label: `${filters.bedrooms} Bedrooms` });
        if (filters.baths && !['all', 'any'].includes(filters.baths)) tags.push({ key: 'baths', label: `${filters.baths} Baths` });
        if (filters.garages && !['all', 'any'].includes(filters.garages)) tags.push({ key: 'garages', label: `${filters.garages} Garages` });
        if (filters.priceRange.isActive) tags.push({ key: 'priceRange', label: `Price: ${filters.priceRange.min} - ${filters.priceRange.max}` });
        if (filters.sqftRange.isActive) tags.push({ key: 'sqftRange', label: `Sqft: ${filters.sqftRange.min} - ${filters.sqftRange.max}` });

        appliedFilters.innerHTML = tags.map(tag => `<span class="filter-tag">${tag.label}<span class="remove-tag icon-close" data-filter="${tag.key}" ${tag.value ? `data-value="${tag.value}"` : ''}></span></span>`).join('');
        clearAllBtns.forEach(btn => {
            btn.style.display = tags.length ? '' : 'none';
        });
    }

    function applyFilters() {
        const filters = getFilters();
        gridItems.forEach(item => { item.style.display = matches(item, filters) ? '' : 'none'; });
        listItems.forEach(item => { item.style.display = matches(item, filters) ? '' : 'none'; });
        sortContainer(gridItems);
        sortContainer(listItems);
        updateCounts();
        renderAppliedFilters(filters);
    }

    function resetTypes() {
        typeInputs.forEach(input => { input.checked = normalizeText(input.value) === 'all'; });
    }

    function resetFilters() {
        if (searchInput) searchInput.value = '';
        statusInputs.forEach(input => { input.checked = normalizeText(input.value) === 'all'; });
        resetTypes();
        setNiceSelectValue('city', 'all');
        setNiceSelectValue('bedrooms', 'any');
        setNiceSelectValue('baths', 'all');
        setNiceSelectValue('garages', 'all');
        setSliderRange('price-value-range', 'price-min-value', 'price-max-value', { min: 0, max: 10000 });
        setSliderRange('price-value-range-2', 'price-min-value-2', 'price-max-value-2', { min: 0, max: 10000 });
        applyFilters();
    }

    statusInputs.forEach(input => input.addEventListener('change', applyFilters));

    typeInputs.forEach(input => {
        input.addEventListener('change', function () {
            const value = normalizeText(this.value);
            if (value === 'all' && this.checked) {
                resetTypes();
            } else if (value !== 'all' && this.checked) {
                const all = typeInputs.find(item => normalizeText(item.value) === 'all');
                if (all) all.checked = false;
            }
            const hasSpecific = typeInputs.some(item => normalizeText(item.value) !== 'all' && item.checked);
            if (!hasSpecific) {
                const all = typeInputs.find(item => normalizeText(item.value) === 'all');
                if (all) all.checked = true;
            }
            applyFilters();
        });
    });

    filterBox.querySelectorAll('.nice-select[data-filter-key]').forEach(select => {
        select.querySelectorAll('.option').forEach(option => {
            option.addEventListener('click', function () {
                setNiceSelectValue(select.dataset.filterKey, this.dataset.value || this.textContent);
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
                const all = statusInputs.find(input => normalizeText(input.value) === 'all');
                if (all) all.checked = true;
            }
            if (key === 'type') {
                typeInputs.forEach(input => { if (normalizeText(input.value) === value) input.checked = false; });
                const hasSpecific = typeInputs.some(input => normalizeText(input.value) !== 'all' && input.checked);
                if (!hasSpecific) {
                    const all = typeInputs.find(input => normalizeText(input.value) === 'all');
                    if (all) all.checked = true;
                }
            }
            if (key === 'city') setNiceSelectValue('city', 'all');
            if (key === 'bedrooms') setNiceSelectValue('bedrooms', 'any');
            if (key === 'baths') setNiceSelectValue('baths', 'all');
            if (key === 'garages') setNiceSelectValue('garages', 'all');
            if (key === 'priceRange') setSliderRange('price-value-range', 'price-min-value', 'price-max-value', defaultPriceRange);
            if (key === 'sqftRange') setSliderRange('price-value-range-2', 'price-min-value-2', 'price-max-value-2', defaultSqftRange);
            applyFilters();
        });
    }

    clearAllBtns.forEach(btn => {
        btn.style.display = 'none';
    
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            resetFilters();
    
            clearAllBtns.forEach(b => b.style.display = 'none');
        });
    });

    document.querySelectorAll('.nav-tab-filter [data-bs-toggle="tab"]').forEach(tab => {
        tab.addEventListener('shown.bs.tab', applyFilters);
        tab.addEventListener('click', function () { setTimeout(applyFilters, 0); });
    });

    function bindSliderUpdates() {
        [
            { sliderId: 'price-value-range', minId: 'price-min-value', maxId: 'price-max-value' },
            { sliderId: 'price-value-range-2', minId: 'price-min-value-2', maxId: 'price-max-value-2' }
        ].forEach(function (config) {
            const slider = document.getElementById(config.sliderId);
            const minEl = document.getElementById(config.minId);
            const maxEl = document.getElementById(config.maxId);
            if (!slider) return;

            function syncCurrentValues(values) {
                if (Array.isArray(values) && values.length >= 2) {
                    slider.dataset.currentMin = values[0];
                    slider.dataset.currentMax = values[1];
                } else {
                    if (minEl) slider.dataset.currentMin = minEl.textContent.trim();
                    if (maxEl) slider.dataset.currentMax = maxEl.textContent.trim();
                }
            }

            syncCurrentValues();

            if (slider.noUiSlider && !slider.dataset.filterBound) {
                slider.noUiSlider.on('update', function (values) {
                    syncCurrentValues(values);
                    applyFilters();
                });
                slider.dataset.filterBound = 'true';
            }

            if (!slider.dataset.domObserverBound) {
                const observer = new MutationObserver(function () {
                    syncCurrentValues();
                    applyFilters();
                });
                if (minEl) observer.observe(minEl, { childList: true, subtree: true, characterData: true });
                if (maxEl) observer.observe(maxEl, { childList: true, subtree: true, characterData: true });
                slider.dataset.domObserverBound = 'true';
            }
        });
    }

    bindSliderUpdates();
    setTimeout(bindSliderUpdates, 300);
    setTimeout(bindSliderUpdates, 900);
    setTimeout(bindSliderUpdates, 1500);

    resetFilters();
});