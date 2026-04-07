document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const productsGrid = document.getElementById('products-grid');
    const categoryList = document.getElementById('category-list');
    const searchInput = document.getElementById('search-input');
    const themeToggle = document.getElementById('theme-toggle');
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');

    // List Elements
    const listDrawer = document.getElementById('list-drawer');
    const drawerOverlay = document.getElementById('drawer-overlay');
    const closeDrawerBtn = document.getElementById('close-drawer');
    const viewListBtn = document.getElementById('view-list-btn');
    const listItemsContainer = document.getElementById('list-items');
    const clearListBtn = document.getElementById('clear-list');
    const copyListBtn = document.getElementById('copy-list');
    const listCountBadge = document.getElementById('list-count-badge');

    // State
    let currentProducts = [];
    let allSections = [];
    let shoppingList = JSON.parse(localStorage.getItem('shoppingList')) || [];
    let metricConfig = null;

    // Theme logic
    function toggleTheme() {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        updateThemeIcons(isDark);
    }

    function updateThemeIcons(isDark) {
        if(isDark) {
            if(sunIcon) sunIcon.style.display = 'block';
            if(moonIcon) moonIcon.style.display = 'none';
        } else {
            if(sunIcon) sunIcon.style.display = 'none';
            if(moonIcon) moonIcon.style.display = 'block';
        }
    }

    // Init theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        updateThemeIcons(true);
    }
    
    if(themeToggle) themeToggle.addEventListener('click', toggleTheme);

    // --- Settings & Preferences ---
    let unitSystem = localStorage.getItem('unitSystem') || 'metric';
    
    unitRadios.forEach(radio => {
        if(radio.value === unitSystem) radio.checked = true;
        radio.addEventListener('change', (e) => {
            unitSystem = e.target.value;
            localStorage.setItem('unitSystem', unitSystem);
            
            // Re-evaluate un-added product card metrics!
            document.querySelectorAll('[data-footer-id]').forEach(footer => {
                const id = footer.dataset.footerId;
                if (!shoppingList.find(i => i.id === id)) {
                    updateCardFooter(id);
                }
            });
        });
    });

    if(settingsToggle) {
        settingsToggle.addEventListener('click', () => {
            settingsModal.style.display = 'flex';
        });
    }

    if(closeSettings) {
        closeSettings.addEventListener('click', () => {
            settingsModal.style.display = 'none';
        });
    }
    
    window.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            settingsModal.style.display = 'none';
        }
    });

    // Initial load
    async function init() {
        try {
            const mRes = await fetch('catalog/metrics.json');
            if(mRes.ok) metricConfig = await mRes.json();
            
            const res = await fetch('catalog/catalog.json');
            if (!res.ok) throw new Error('Failed to load catalog index');
            allSections = await res.json();
            renderCategoryChips(allSections);
            updateListUI();
            
            // Dynamic landing page
            loadLandingPage();
        } catch(err) {
            console.error('Initialization failed:', err);
            productsGrid.innerHTML = '<div class="loader">Unable to load catalog. Please check your connection.</div>';
        }
    }

    // Render Category Chips (Horizontal scroller)
    function renderCategoryChips(sections) {
        categoryList.innerHTML = '';
        
        // Add "Variety" option
        const varietyLi = document.createElement('li');
        varietyLi.textContent = "Variety ✨";
        varietyLi.classList.add('active');
        varietyLi.addEventListener('click', () => {
            document.querySelectorAll('.category-chips li').forEach(el => el.classList.remove('active'));
            varietyLi.classList.add('active');
            loadVarietyPack();
        });
        categoryList.appendChild(varietyLi);

        sections.forEach(section => {
            const li = document.createElement('li');
            li.textContent = section.name;
            li.dataset.id = section.id;
            
            li.addEventListener('click', () => {
                document.querySelectorAll('.category-chips li').forEach(el => el.classList.remove('active'));
                li.classList.add('active');
                loadCategory(section);
            });
            
            categoryList.appendChild(li);
        });
    }

    // Load single category
    async function loadCategory(section) {
        productsGrid.innerHTML = `<div class="loader">Opening ${section.name}...</div>`;
        
        try {
            const res = await fetch('catalog/' + section.file);
            const data = await res.json();
            currentProducts = data.items.map(item => ({...item, dir: section.id, categoryName: section.name}));
            renderProducts(currentProducts);
            window.scrollTo({ top: productsGrid.offsetTop - 120, behavior: 'smooth' });
        } catch(err) {
            console.error(`Failed to load category ${section.name}:`, err);
            productsGrid.innerHTML = '<div class="loader">Error loading items in this section.</div>';
        }
    }

    // Landing Page Logic
    async function loadLandingPage() {
        if (shoppingList.length === 0) {
            loadVarietyPack();
        } else {
            loadFrequentCategories();
        }
    }

    // Load 1 random item with image from each category
    async function loadVarietyPack() {
        productsGrid.innerHTML = '<div class="loader">Preparing a fresh mix...</div>';
        let varietyPack = [];
        
        try {
            const categoryPromises = allSections.map(section => 
                fetch('catalog/' + section.file).then(res => res.json().then(data => ({
                    ...data, sectionId: section.id, sectionName: section.name
                })))
            );
            const categoryResults = await Promise.all(categoryPromises);
            
            categoryResults.forEach(data => {
                // Filter items with images and exclude placeholders
                const validItems = data.items.filter(item => item.image && !item.image.includes('placeholder'));
                if(validItems.length > 0) {
                    const randomItem = validItems[Math.floor(Math.random() * validItems.length)];
                    varietyPack.push({
                        ...randomItem, dir: data.sectionId, categoryName: data.sectionName
                    });
                }
            });
            currentProducts = varietyPack.sort(() => 0.5 - Math.random());
            renderProducts(currentProducts);
        } catch(err) {
            console.error('Variety load failed:', err);
            productsGrid.innerHTML = '<div class="loader">Error loading variety pack.</div>';
        }
    }

    // Load items from the user's current categories
    async function loadFrequentCategories() {
        productsGrid.innerHTML = '<div class="loader">Picking up where you left off...</div>';
        const activeDirs = [...new Set(shoppingList.map(i => i.dir))];
        let relevantItems = [];

        try {
            const activePromises = activeDirs.map(dir => {
                const section = allSections.find(s => s.id === dir);
                if (section) {
                    return fetch('catalog/' + section.file).then(res => res.json().then(data => 
                        data.items.map(item => ({...item, dir: section.id, categoryName: section.name}))
                    ));
                }
                return Promise.resolve([]);
            });

            const results = await Promise.all(activePromises);
            results.forEach(items => { relevantItems = relevantItems.concat(items); });
            
            if(relevantItems.length > 0) {
                currentProducts = relevantItems.sort(() => 0.5 - Math.random()).slice(0, 50);
                renderProducts(currentProducts);
            } else {
                loadVarietyPack();
            }
        } catch(err) {
            loadVarietyPack();
        }
    }

    // Search logic - Global Search across all categories
    async function handleSearch(term) {
        if (!term) {
            loadLandingPage();
            return;
        }

        productsGrid.innerHTML = `<div class="loader">Searching for "${term}"...</div>`;
        
        try {
            let allItems = [];
            const categoryPromises = allSections.map(section => 
                fetch('catalog/' + section.file).then(res => res.json().then(data => ({
                    ...data, sectionId: section.id, sectionName: section.name
                })))
            );
            const results = await Promise.all(categoryPromises);
            
            results.forEach(data => {
                const itemsWithPaths = data.items.map(item => ({
                    ...item, dir: data.sectionId, categoryName: data.sectionName
                }));
                allItems = allItems.concat(itemsWithPaths);
            });

            const filtered = allItems.filter(p => {
                return p.name.toLowerCase().includes(term) || 
                       (p.keywords && p.keywords.some(k => k.toLowerCase().includes(term))) ||
                       (p.categoryName && p.categoryName.toLowerCase().includes(term));
            });

            currentProducts = filtered;
            renderProducts(filtered);
        } catch(err) {
            console.error('Search failed:', err);
        }
    }

    // Display all categories as a visual grid (Store Map)
    function renderCatalogView() {
        productsGrid.innerHTML = '';
        // No new 'grid' div needed, use productsGrid directly
        
        allSections.forEach(section => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.style.padding = '1.25rem';
            card.style.cursor = 'pointer';
            card.style.textAlign = 'center';
            card.style.minHeight = '140px';
            card.style.display = 'flex';
            card.style.flexDirection = 'column';
            card.style.justifyContent = 'center';
            
            const lastSpace = section.name.lastIndexOf(' ');
            const title = lastSpace !== -1 ? section.name.substring(0, lastSpace) : section.name;
            const icon = lastSpace !== -1 ? section.name.substring(lastSpace + 1) : '📦';
            
            card.innerHTML = `
                <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">${icon}</div>
                <h3 style="font-size: 0.95rem; line-height: 1.2;">${title}</h3>
                <p style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.5rem;">Explore items</p>
            `;
            
            card.addEventListener('click', () => {
                loadCategory(section);
                // Highlight the chip in the scroller
                document.querySelectorAll('.category-chips li').forEach(el => {
                    el.classList.toggle('active', el.dataset.id === section.id);
                });
            });
            
            productsGrid.appendChild(card);
        });
        
        window.scrollTo({ top: productsGrid.offsetTop - 120, behavior: 'smooth' });
    }

    // Render Products
    function renderProducts(products) {
        productsGrid.innerHTML = '';
        if(products.length === 0) {
            productsGrid.innerHTML = '<div class="loader">No items found matching your search.</div>';
            return;
        }

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            const imgPath = product.dir ? `catalog/${product.dir}/${product.image}` : `catalog/${product.image}`;
            
            card.innerHTML = `
                <div class="image-wrapper">
                    <img src="${imgPath}" alt="${product.name}" class="product-image" loading="lazy" onerror="this.src='https://placehold.co/400x400?text=${encodeURIComponent(product.name)}'">
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-category">${product.categoryName || 'Grocery'}</p>
                    <div class="product-footer" data-footer-id="${product.id}">
                        <!-- Footer updated by JS -->
                    </div>
                </div>
            `;
            productsGrid.appendChild(card);
            updateCardFooter(product.id, product);
        });
    }

    // Smart Unit Logic & Override Rules
    function getItemMetrics(product) {
        let baseUnit = product.metric || 'unit';
        let step = 1;
        let finalUnit = baseUnit;

        if (metricConfig) {
            const cat = getMetricCategory(baseUnit);
            if (cat) {
                // Apply User Preferences for System 
                if (unitSystem === 'imperial') {
                    if (cat.id === 'weight') finalUnit = 'lb';
                    if (cat.id === 'volume') finalUnit = 'gal';
                } else {
                    if (cat.id === 'weight' && baseUnit === 'lb') finalUnit = 'kg';
                    if (cat.id === 'volume' && baseUnit === 'gal') finalUnit = 'L';
                }
                
                const opt = cat.options.find(o => o.id === finalUnit) || cat.options[0];
                if (opt) {
                    finalUnit = opt.id;
                    step = opt.step;
                }
            }
        } else {
            step = (baseUnit === 'kg' || baseUnit === 'L') ? 0.1 : 1;
        }
        
        return {
            unit: finalUnit,
            step: step
        };
    }

    function getMetricCategory(unitId) {
        if (!metricConfig) return null;
        for (const key in metricConfig) {
            const cat = metricConfig[key];
            if (cat.options.some(opt => opt.id === unitId)) return cat;
        }
        return null;
    }

    // Update individual card footers
    function updateCardFooter(productId, product = null) {
        const footers = document.querySelectorAll(`[data-footer-id="${productId}"]`);
        if (footers.length === 0) return;

        const listItem = shoppingList.find(item => item.id === productId);
        
        footers.forEach(footer => {
            if (listItem && listItem.qty > 0) {
                const cat = getMetricCategory(listItem.unit);
                let unitSelector = `<span class="product-price" style="font-size: 0.8rem; color: var(--text-secondary);">${listItem.unit || 'unit'}</span>`;
                
                if (cat && cat.options.length > 1) {
                    unitSelector = `
                        <select class="unit-selector" data-id="${productId}" style="background: var(--surface-color); color: var(--text-primary); border: 1px solid var(--border-color); border-radius: var(--radius-sm); font-size: 0.75rem; padding: 0.15rem 0.2rem; cursor: pointer; outline: none;">
                            ${cat.options.map(opt => `<option value="${opt.id}" ${opt.id === listItem.unit ? 'selected' : ''}>${opt.short}</option>`).join('')}
                        </select>
                    `;
                }

                footer.innerHTML = `
                    <div style="display: flex; flex-direction: column; width: 100%; gap: 0.5rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div class="qty-selector">
                                <button class="qty-control-btn minus-card">-</button>
                                <span class="qty-display">${listItem.qty}</span>
                                <button class="qty-control-btn plus-card">+</button>
                            </div>
                            <div style="display: flex; align-items: center; gap: 0.3rem;">
                                ${unitSelector}
                            </div>
                        </div>
                        <button class="remove-from-cart-btn" style="width: 100%; border: 1px solid #ef4444; color: #ef4444; background: none; border-radius: var(--radius-sm); padding: 0.35rem; font-size: 0.75rem; font-weight: 600; cursor: pointer; transition: background-color 0.2s;">Remove from Cart</button>
                    </div>
                `;
                
                footer.querySelector('.minus-card').onclick = () => updateQty(productId, -1);
                footer.querySelector('.plus-card').onclick = () => updateQty(productId, 1);
                footer.querySelector('.remove-from-cart-btn').onclick = () => removeFromList(productId);
                
                const unitSel = footer.querySelector('.unit-selector');
                if (unitSel) {
                    unitSel.addEventListener('change', (e) => {
                        const newUnit = e.target.value;
                        const newCat = getMetricCategory(newUnit);
                        if(newCat) {
                            const newOpt = newCat.options.find(o => o.id === newUnit);
                            listItem.unit = newOpt.id;
                            listItem.step = newOpt.step;
                            listItem.qty = newOpt.step;
                            updateCardFooter(productId, product);
                            updateListUI();
                            saveList();
                        }
                    });
                }
            } else {
                const currentProduct = product || currentProducts.find(p => p.id === productId);
                
                footer.innerHTML = `
                    <button class="add-btn" style="width: 100%;">Add to Cart</button>
                `;
                
                if (currentProduct) {
                    footer.querySelector('.add-btn').onclick = () => addToList(currentProduct);
                }
            }
        });
    }

    // List Logic
    function addToList(product) {
        const metrics = getItemMetrics(product);
        const existing = shoppingList.find(item => item.id === product.id);
        
        if (existing) {
            existing.qty += metrics.step;
        } else {
            shoppingList.push({
                id: product.id,
                name: product.name,
                image: product.image,
                dir: product.dir,
                categoryName: product.categoryName,
                unit: metrics.unit,
                step: metrics.step,
                qty: metrics.step
            });
        }
        updateListUI();
        saveList();
        updateCardFooter(product.id);
    }

    function removeFromList(id) {
        shoppingList = shoppingList.filter(item => item.id !== id);
        updateListUI();
        saveList();
        updateCardFooter(id);
    }

    function updateQty(id, delta) {
        const item = shoppingList.find(item => item.id === id);
        if (item) {
            const step = item.step || 1;
            item.qty += (delta > 0 ? step : -step);
            item.qty = Math.round(item.qty * 100) / 100;

            if (item.qty <= 0) {
                removeFromList(id);
            } else {
                updateListUI();
                saveList();
                updateCardFooter(id);
            }
        }
    }

    function updateListUI() {
        const totalCount = shoppingList.reduce((sum, item) => {
            const step = item.step || 1;
            return sum + Math.round(item.qty / step);
        }, 0);
        if(listCountBadge) listCountBadge.textContent = totalCount;

        listItemsContainer.innerHTML = '';
        if (shoppingList.length === 0) {
            listItemsContainer.innerHTML = '<p class="empty-msg">Select items to prepare your shopping list.</p>';
            return;
        }

        shoppingList.forEach(item => {
            const div = document.createElement('div');
            div.className = 'drawer-item';
            const imgPath = item.dir ? `catalog/${item.dir}/${item.image}` : `catalog/${item.image}`;
            
            const cat = getMetricCategory(item.unit);
            let unitSelector = `<span style="font-size: 0.75rem; color: var(--text-secondary); min-width: 30px;">${item.unit || 'unit'}</span>`;
            
            if (cat && cat.options.length > 1) {
                unitSelector = `
                    <select class="drawer-unit-selector" style="background: var(--surface-color); color: var(--text-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-sm); font-size: 0.75rem; padding: 0.15rem; outline: none; cursor: pointer; max-width: 55px;">
                        ${cat.options.map(opt => `<option value="${opt.id}" ${opt.id === item.unit ? 'selected' : ''}>${opt.short}</option>`).join('')}
                    </select>
                `;
            }
            
            div.innerHTML = `
                <img src="${imgPath}" class="drawer-item-img" onerror="this.src='https://placehold.co/120x120?text=Item'">
                <div class="drawer-item-info" style="flex: 1;">
                    <div class="drawer-item-title">${item.name}</div>
                    <button class="remove-btn">Remove</button>
                </div>
                <div class="drawer-item-actions" style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.3rem;">
                    <div style="display: flex; align-items: center; gap: 0.3rem;">
                        <button class="qty-btn minus">-</button>
                        <span style="min-width: 30px; text-align: center; font-weight: 600;">${item.qty}</span>
                        <button class="qty-btn plus">+</button>
                    </div>
                    ${unitSelector}
                </div>
            `;
            
            div.querySelector('.remove-btn').onclick = () => removeFromList(item.id);
            div.querySelector('.minus').onclick = () => updateQty(item.id, -1);
            div.querySelector('.plus').onclick = () => updateQty(item.id, 1);
            
            const unitSel = div.querySelector('.drawer-unit-selector');
            if (unitSel) {
                unitSel.addEventListener('change', (e) => {
                    const newUnit = e.target.value;
                    const newCat = getMetricCategory(newUnit);
                    if(newCat) {
                        const newOpt = newCat.options.find(o => o.id === newUnit);
                        item.unit = newOpt.id;
                        item.step = newOpt.step;
                        item.qty = newOpt.step;
                        updateCardFooter(item.id);
                        updateListUI();
                        saveList();
                    }
                });
            }
            
            listItemsContainer.appendChild(div);
        });
    }

    function saveList() {
        localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
    }

    // App Navigation Events
    if(viewListBtn) viewListBtn.addEventListener('click', () => {
        listDrawer.classList.add('active');
        drawerOverlay.classList.add('active');
    });

    closeDrawerBtn.addEventListener('click', () => {
        listDrawer.classList.remove('active');
        drawerOverlay.classList.remove('active');
    });

    drawerOverlay.addEventListener('click', () => {
        listDrawer.classList.remove('active');
        drawerOverlay.classList.remove('active');
    });

    clearListBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear your entire list?')) {
            shoppingList = [];
            updateListUI();
            saveList();
            // Refresh all visible cards
            document.querySelectorAll('[data-footer-id]').forEach(footer => {
                const id = footer.dataset.footerId;
                updateCardFooter(id);
            });
        }
    });

    copyListBtn.addEventListener('click', () => {
        if (shoppingList.length === 0) return;
        let text = "🛒 My Shopping List:\n\n";
        shoppingList.forEach(item => { text += `- ${item.name}: ${item.qty} ${item.unit || 'unit'}\n`; });
        navigator.clipboard.writeText(text).then(() => {
            const originalText = copyListBtn.textContent;
            copyListBtn.textContent = 'Copied! ✓';
            setTimeout(() => { copyListBtn.textContent = originalText; }, 2000);
        });
    });

    if(searchInput) {
        searchInput.addEventListener('input', (e) => {
            handleSearch(e.target.value.toLowerCase());
        });
    }

    // Listen for bottom nav 'Items' click
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // Find the span or role
            const text = item.textContent.trim();
            if(text.includes('Items')) {
                e.preventDefault();
                renderCatalogView();
                navItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            }
        });
    });

    // Start App
    init();
});
