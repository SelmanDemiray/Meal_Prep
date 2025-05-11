// UI-specific functionality and page interactions

document.addEventListener('DOMContentLoaded', function() {
    // --- WATER GLASS TRACKING ---
    const selmanGlasses = document.querySelectorAll('.selman-glass');
    const aybikeGlasses = document.querySelectorAll('.aybike-glass');
    if (selmanGlasses.length > 0) {
        selmanGlasses.forEach(glass => {
            glass.addEventListener('click', () => {
                const idx = parseInt(glass.dataset.glass, 10) - 1;
                selmanGlasses.forEach((g, i) => {
                    if (i <= idx) g.classList.add('filled');
                    else g.classList.remove('filled');
                });
                updateCompletionRate();
            });
        });
    }
    if (aybikeGlasses.length > 0) {
        aybikeGlasses.forEach(glass => {
            glass.addEventListener('click', () => {
                const idx = parseInt(glass.dataset.glass, 10) - 1;
                aybikeGlasses.forEach((g, i) => {
                    if (i <= idx) g.classList.add('filled');
                    else g.classList.remove('filled');
                });
                updateCompletionRate();
            });
        });
    }

    // --- RECIPE MANAGEMENT PAGE FUNCTIONALITY ---
    if (document.getElementById('recipe-management')) {
        initializeRecipeManager();
    }
    
    function initializeRecipeManager() {
        const cycleSelector = document.getElementById('manage-cycle-selector');
        const newCycleBtn = document.getElementById('new-cycle-btn');
        const daySelector = document.getElementById('manage-day-selector');
        const mealSelector = document.getElementById('manage-meal-selector');
        const recipeForm = document.getElementById('recipe-form');
        const cycleNameDisplay = document.getElementById('cycle-name-display');
        const searchRecipeBtn = document.getElementById('search-recipe-btn');
        const importCycleBtn = document.getElementById('import-cycle-btn');
        
        // Populate cycle selector
        function populateCycleSelector() {
            if (!cycleSelector) return;
            
            cycleSelector.innerHTML = '';
            const cycles = window.getActiveMealCycles();
            
            cycles.forEach(cycleId => {
                const option = document.createElement('option');
                option.value = cycleId;
                option.textContent = window.generateCycleLabel(cycleId);
                cycleSelector.appendChild(option);
            });
            
            if (cycles.length > 0) {
                cycleSelector.value = cycles[0];
                updateCycleDisplay();
                populateDaySelector();
            }
        }
        
        // Update cycle display
        function updateCycleDisplay() {
            if (cycleNameDisplay && cycleSelector) {
                cycleNameDisplay.textContent = window.generateCycleLabel(cycleSelector.value);
            }
        }
        
        // Populate day selector
        function populateDaySelector() {
            if (!daySelector) return;
            
            // Populate days 1-30
            daySelector.innerHTML = '';
            for (let i = 0; i < 30; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = `Day ${i+1}`;
                daySelector.appendChild(option);
            }
            
            daySelector.value = 0;
            populateMealSelector();
        }
        
        // Populate meal selector
        function populateMealSelector() {
            if (!mealSelector) return;
            
            mealSelector.innerHTML = '';
            const meals = ['breakfast', 'lunch', 'dinner'];
            meals.forEach(meal => {
                const option = document.createElement('option');
                option.value = meal;
                option.textContent = meal.charAt(0).toUpperCase() + meal.slice(1);
                mealSelector.appendChild(option);
            });
            
            mealSelector.value = 'breakfast';
            loadRecipeToForm();
        }
        
        // Load recipe data to form
        function loadRecipeToForm() {
            if (!recipeForm || !cycleSelector || !daySelector || !mealSelector) return;
            
            const cycleId = cycleSelector.value;
            const dayIndex = parseInt(daySelector.value);
            const mealType = mealSelector.value;
            
            const cycles = window.getMealCycles();
            const cycle = cycles[cycleId];
            if (!cycle) return;
            
            const dayData = cycle[dayIndex];
            if (!dayData) return;
            
            const recipeData = dayData[`${mealType}Recipe`];
            if (!recipeData) return;
            
            // Fill form fields
            document.getElementById('recipe-title').value = recipeData.title || '';
            document.getElementById('meal-description').value = dayData[mealType] || '';
            
            // Load ingredients
            const ingredientsList = document.getElementById('ingredients-list');
            if (ingredientsList) {
                ingredientsList.innerHTML = '';
                if (recipeData.ingredients && recipeData.ingredients.length > 0) {
                    recipeData.ingredients.forEach((ingredient, idx) => {
                        addIngredientToForm(ingredient);
                    });
                } else {
                    addIngredientToForm('');
                }
            }
            
            // Load instructions
            const instructionsList = document.getElementById('instructions-list');
            if (instructionsList) {
                instructionsList.innerHTML = '';
                if (recipeData.instructions && recipeData.instructions.length > 0) {
                    recipeData.instructions.forEach((instruction, idx) => {
                        addInstructionToForm(instruction);
                    });
                } else {
                    addInstructionToForm('');
                }
            }
            
            // Set tracking status
            if (document.getElementById('tracking-status')) {
                document.getElementById('tracking-status').value = 'not-started';
                
                // Check if this recipe is tracked for today
                const today = new Date();
                const formattedDate = window.formatDateISO(today);
                const trackingData = localStorage.getItem('trackingData');
                
                if (trackingData) {
                    const parsedData = JSON.parse(trackingData);
                    const todayData = parsedData[formattedDate];
                    
                    if (todayData) {
                        if (mealType === 'breakfast' && todayData.breakfastCompleted) {
                            document.getElementById('tracking-status').value = 'completed';
                        } else if (mealType === 'lunch' && todayData.lunchCompleted) {
                            document.getElementById('tracking-status').value = 'completed';
                        } else if (mealType === 'dinner' && todayData.dinnerCompleted) {
                            document.getElementById('tracking-status').value = 'completed';
                        }
                    }
                }
            }
        }
        
        // Add ingredient input to form
        function addIngredientToForm(value = '') {
            const ingredientsList = document.getElementById('ingredients-list');
            if (!ingredientsList) return;
            
            const ingredientDiv = document.createElement('div');
            ingredientDiv.className = 'list-item';
            
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'form-control ingredient-input';
            input.value = value;
            input.placeholder = 'Enter ingredient';
            
            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'remove-item-btn';
            removeBtn.innerHTML = '<i class="fas fa-times"></i>';
            removeBtn.addEventListener('click', function() {
                ingredientDiv.remove();
            });
            
            ingredientDiv.appendChild(input);
            ingredientDiv.appendChild(removeBtn);
            ingredientsList.appendChild(ingredientDiv);
        }
        
        // Add instruction input to form
        function addInstructionToForm(value = '') {
            const instructionsList = document.getElementById('instructions-list');
            if (!instructionsList) return;
            
            const instructionDiv = document.createElement('div');
            instructionDiv.className = 'list-item';
            
            const input = document.createElement('textarea');
            input.className = 'form-control instruction-input';
            input.value = value;
            input.placeholder = 'Enter instruction step';
            
            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'remove-item-btn';
            removeBtn.innerHTML = '<i class="fas fa-times"></i>';
            removeBtn.addEventListener('click', function() {
                instructionDiv.remove();
            });
            
            instructionDiv.appendChild(input);
            instructionDiv.appendChild(removeBtn);
            instructionsList.appendChild(instructionDiv);
        }
        
        // Handle add ingredient button
        document.getElementById('add-ingredient-btn')?.addEventListener('click', function() {
            addIngredientToForm();
        });
        
        // Handle add instruction button
        document.getElementById('add-instruction-btn')?.addEventListener('click', function() {
            addInstructionToForm();
        });
        
        // Handle form submission
        recipeForm?.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const cycleId = cycleSelector.value;
            const dayIndex = parseInt(daySelector.value);
            const mealType = mealSelector.value;
            
            // Get form values
            const title = document.getElementById('recipe-title').value;
            const mealDescription = document.getElementById('meal-description').value;
            
            // Get ingredients
            const ingredients = [];
            document.querySelectorAll('.ingredient-input').forEach(input => {
                if (input.value.trim()) {
                    ingredients.push(input.value.trim());
                }
            });
            
            // Get instructions
            const instructions = [];
            document.querySelectorAll('.instruction-input').forEach(input => {
                if (input.value.trim()) {
                    instructions.push(input.value.trim());
                }
            });
            
            // Create recipe object
            const recipe = {
                title: title,
                ingredients: ingredients,
                instructions: instructions
            };
            
            // Update meal cycle
            const cycles = window.getMealCycles();
            if (!cycles[cycleId]) {
                cycles[cycleId] = {};
            }
            if (!cycles[cycleId][dayIndex]) {
                cycles[cycleId][dayIndex] = {};
            }
            
            cycles[cycleId][dayIndex][mealType] = mealDescription;
            cycles[cycleId][dayIndex][`${mealType}Recipe`] = recipe;
            
            // Save updated cycles
            window.saveMealCycles(cycles);
            
            // Update tracking if needed
            if (document.getElementById('add-to-tracking').checked) {
                const today = new Date();
                const formattedDate = window.formatDateISO(today);
                const trackingStatus = document.getElementById('tracking-status').value;
                
                // Update tracking data
                const trackingData = localStorage.getItem('trackingData');
                const parsedData = trackingData ? JSON.parse(trackingData) : {};
                
                if (!parsedData[formattedDate]) {
                    parsedData[formattedDate] = {};
                }
                
                parsedData[formattedDate][`${mealType}Completed`] = (trackingStatus === 'completed');
                
                localStorage.setItem('trackingData', JSON.stringify(parsedData));
            }
            
            alert('Recipe saved successfully!');
        });
        
        // Handle cycle selection change
        cycleSelector?.addEventListener('change', function() {
            updateCycleDisplay();
            populateDaySelector();
        });
        
        // Handle day selection change
        daySelector?.addEventListener('change', function() {
            populateMealSelector();
        });
        
        // Handle meal type selection change
        mealSelector?.addEventListener('change', function() {
            loadRecipeToForm();
        });
        
        // Handle new cycle creation
        newCycleBtn?.addEventListener('click', function() {
            const today = new Date();
            const year = parseInt(prompt("Enter year for new cycle:", today.getFullYear()));
            if (!year || isNaN(year)) return;
            
            const cycles = window.getMealCycles();
            const existingCycles = Object.keys(cycles)
                .filter(id => id.startsWith(`${year}-`))
                .map(id => parseInt(id.split('-')[1]));
            
            let nextCycleNum = 1;
            if (existingCycles.length > 0) {
                nextCycleNum = Math.max(...existingCycles) + 1;
            }
            
            const newCycleId = `${year}-${nextCycleNum.toString().padStart(2, '0')}`;
            
            // Ask if user wants to import from MealDB
            if (confirm("Would you like to import recipes from TheMealDB for this cycle?")) {
                showImportOptionsModal(newCycleId);
            } else {
                // Create empty cycle
                const newCycle = {};
                for (let i = 0; i < 30; i++) {
                    newCycle[i] = {
                        breakfast: `Breakfast for Day ${i+1}`,
                        lunch: `Lunch for Day ${i+1}`,
                        dinner: `Dinner for Day ${i+1}`,
                        breakfastRecipe: {
                            title: `Breakfast Recipe for Day ${i+1}`,
                            ingredients: ["Add ingredients here"],
                            instructions: ["Add instructions here"]
                        },
                        lunchRecipe: {
                            title: `Lunch Recipe for Day ${i+1}`,
                            ingredients: ["Add ingredients here"],
                            instructions: ["Add instructions here"]
                        },
                        dinnerRecipe: {
                            title: `Dinner Recipe for Day ${i+1}`,
                            ingredients: ["Add ingredients here"],
                            instructions: ["Add instructions here"]
                        }
                    };
                }
                
                window.saveRecipeCycle(newCycleId, newCycle);
                alert(`Created new cycle: ${window.generateCycleLabel(newCycleId)}`);
                populateCycleSelector();
                cycleSelector.value = newCycleId;
                updateCycleDisplay();
                populateDaySelector();
            }
        });
        
        // Handle import cycle button
        importCycleBtn?.addEventListener('click', function() {
            const cycleId = cycleSelector.value;
            if (confirm(`This will replace all recipes in cycle "${window.generateCycleLabel(cycleId)}" with recipes from TheMealDB. Continue?`)) {
                showImportOptionsModal(cycleId);
            }
        });
        
        // Handle search recipe button
        document.getElementById('search-recipe-btn')?.addEventListener('click', function() {
            showRecipeSearchModal();
        });
        
        // Show import options modal for TheMealDB
        function showImportOptionsModal(cycleId) {
            // Create modal if it doesn't exist
            if (!document.getElementById('import-modal')) {
                const modal = document.createElement('div');
                modal.id = 'import-modal';
                modal.style.display = 'none';
                modal.innerHTML = `
                    <div class="modal-overlay"></div>
                    <div class="modal-content">
                        <span class="modal-close">&times;</span>
                        <h2>Import Recipes from TheMealDB</h2>
                        <div class="import-options">
                            <div class="form-group">
                                <label for="import-type">Import by:</label>
                                <select id="import-type" class="form-control">
                                    <option value="random">Random Selection</option>
                                    <option value="category">Category</option>
                                    <option value="ingredient">Main Ingredient</option>
                                </select>
                            </div>
                            
                            <div class="form-group" id="category-group" style="display:none;">
                                <label for="category-select">Select Category:</label>
                                <select id="category-select" class="form-control">
                                    <option value="">Loading categories...</option>
                                </select>
                            </div>
                            
                            <div class="form-group" id="ingredient-group" style="display:none;">
                                <label for="ingredient-select">Select Main Ingredient:</label>
                                <select id="ingredient-select" class="form-control">
                                    <option value="">Loading ingredients...</option>
                                </select>
                            </div>
                            
                            <p class="info-text">
                                This will import up to 30 recipes from TheMealDB to fill your cycle.
                                Recipes will be distributed across breakfast, lunch and dinner.
                            </p>
                            
                            <div class="modal-actions">
                                <button id="start-import-btn" class="btn">Start Import</button>
                                <button id="cancel-import-btn" class="btn btn-secondary">Cancel</button>
                            </div>
                        </div>
                        
                        <div class="import-progress" style="display:none;">
                            <p>Importing recipes... <span id="import-progress">0%</span></p>
                            <div class="progress-bar">
                                <div id="import-progress-fill" class="progress-fill" style="width:0%"></div>
                            </div>
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);
                
                // Close modal on overlay or close button
                modal.querySelector('.modal-overlay').onclick = () => modal.style.display = 'none';
                modal.querySelector('.modal-close').onclick = () => modal.style.display = 'none';
                modal.querySelector('#cancel-import-btn').onclick = () => modal.style.display = 'none';
                
                // Handle import type change
                const importType = modal.querySelector('#import-type');
                importType.addEventListener('change', function() {
                    modal.querySelector('#category-group').style.display = this.value === 'category' ? 'block' : 'none';
                    modal.querySelector('#ingredient-group').style.display = this.value === 'ingredient' ? 'block' : 'none';
                    
                    if (this.value === 'category' && !modal.querySelector('#category-select').dataset.loaded) {
                        loadCategories();
                    }
                    
                    if (this.value === 'ingredient' && !modal.querySelector('#ingredient-select').dataset.loaded) {
                        loadIngredients();
                    }
                });
                
                // Load categories from TheMealDB
                async function loadCategories() {
                    try {
                        const categorySelect = modal.querySelector('#category-select');
                        categorySelect.innerHTML = '<option value="">Loading categories...</option>';
                        
                        const response = await window.mealDbService.getCategories();
                        if (response.categories) {
                            categorySelect.innerHTML = '<option value="">Select a category...</option>';
                            response.categories.forEach(category => {
                                const option = document.createElement('option');
                                option.value = category.strCategory;
                                option.textContent = category.strCategory;
                                categorySelect.appendChild(option);
                            });
                            categorySelect.dataset.loaded = 'true';
                        }
                    } catch (error) {
                        console.error('Error loading categories:', error);
                        modal.querySelector('#category-select').innerHTML = '<option value="">Error loading categories</option>';
                    }
                }
                
                // Load ingredients from TheMealDB
                async function loadIngredients() {
                    try {
                        const ingredientSelect = modal.querySelector('#ingredient-select');
                        ingredientSelect.innerHTML = '<option value="">Loading ingredients...</option>';
                        
                        const response = await window.mealDbService.getIngredients();
                        if (response.meals) {
                            ingredientSelect.innerHTML = '<option value="">Select an ingredient...</option>';
                            response.meals.forEach(ingredient => {
                                const option = document.createElement('option');
                                option.value = ingredient.strIngredient;
                                option.textContent = ingredient.strIngredient;
                                ingredientSelect.appendChild(option);
                            });
                            ingredientSelect.dataset.loaded = 'true';
                        }
                    } catch (error) {
                        console.error('Error loading ingredients:', error);
                        modal.querySelector('#ingredient-select').innerHTML = '<option value="">Error loading ingredients</option>';
                    }
                }
                
                // Start import process
                modal.querySelector('#start-import-btn').addEventListener('click', async function() {
                    const importType = modal.querySelector('#import-type').value;
                    const filters = {};
                    
                    if (importType === 'category') {
                        const category = modal.querySelector('#category-select').value;
                        if (!category) {
                            alert('Please select a category');
                            return;
                        }
                        filters.category = category;
                    } else if (importType === 'ingredient') {
                        const ingredient = modal.querySelector('#ingredient-select').value;
                        if (!ingredient) {
                            alert('Please select an ingredient');
                            return;
                        }
                        filters.ingredient = ingredient;
                    }
                    
                    // Show progress UI
                    modal.querySelector('.import-options').style.display = 'none';
                    modal.querySelector('.import-progress').style.display = 'block';
                    
                    // Start import
                    try {
                        for (let i = 0; i <= 100; i += 10) {
                            modal.querySelector('#import-progress').textContent = i + '%';
                            modal.querySelector('#import-progress-fill').style.width = i + '%';
                            await new Promise(resolve => setTimeout(resolve, 200));
                        }
                        
                        const success = await window.importMealsForCycle(cycleId, filters);
                        modal.style.display = 'none';
                        
                        if (success) {
                            alert(`Created new cycle: ${window.generateCycleLabel(cycleId)} with recipes from TheMealDB`);
                            populateCycleSelector();
                            cycleSelector.value = cycleId;
                            updateCycleDisplay();
                            populateDaySelector();
                        } else {
                            alert('Error importing recipes. Please try again.');
                        }
                    } catch (error) {
                        console.error('Import error:', error);
                        alert('Error importing recipes. Please try again.');
                        modal.style.display = 'none';
                    }
                });
            }
            
            // Show the modal
            document.getElementById('import-modal').style.display = 'block';
        }
        
        // Show recipe search modal
        function showRecipeSearchModal() {
            // Create modal if it doesn't exist
            if (!document.getElementById('recipe-search-modal')) {
                const modal = document.createElement('div');
                modal.id = 'recipe-search-modal';
                modal.style.display = 'none';
                modal.innerHTML = `
                    <div class="modal-overlay"></div>
                    <div class="modal-content">
                        <span class="modal-close">&times;</span>
                        <h2>Search Recipes</h2>
                        <div class="search-form">
                            <div class="form-group">
                                <label for="recipe-search-input">Search by name:</label>
                                <div class="search-input-group">
                                    <input type="text" id="recipe-search-input" class="form-control" placeholder="Enter recipe name...">
                                    <button id="recipe-search-btn" class="btn">Search</button>
                                </div>
                            </div>
                            
                            <div class="search-options">
                                <button id="random-recipe-btn" class="btn btn-secondary">Get Random Recipe</button>
                            </div>
                        </div>
                        
                        <div id="search-results" class="search-results">
                            <p>Search for recipes to import.</p>
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);
                
                // Close modal on overlay or close button
                modal.querySelector('.modal-overlay').onclick = () => modal.style.display = 'none';
                modal.querySelector('.modal-close').onclick = () => modal.style.display = 'none';
                
                // Handle search
                modal.querySelector('#recipe-search-btn').addEventListener('click', async function() {
                    const searchTerm = modal.querySelector('#recipe-search-input').value.trim();
                    if (!searchTerm) return;
                    
                    try {
                        modal.querySelector('#search-results').innerHTML = '<p>Searching...</p>';
                        const response = await window.mealDbService.searchByName(searchTerm);
                        
                        if (response.meals && response.meals.length > 0) {
                            displaySearchResults(response.meals);
                        } else {
                            modal.querySelector('#search-results').innerHTML = '<p>No recipes found. Try a different search.</p>';
                        }
                    } catch (error) {
                        console.error('Search error:', error);
                        modal.querySelector('#search-results').innerHTML = '<p>Error searching recipes. Please try again.</p>';
                    }
                });
                
                // Search on Enter key
                modal.querySelector('#recipe-search-input').addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        modal.querySelector('#recipe-search-btn').click();
                    }
                });
                
                // Get random recipe
                modal.querySelector('#random-recipe-btn').addEventListener('click', async function() {
                    try {
                        modal.querySelector('#search-results').innerHTML = '<p>Getting a random recipe...</p>';
                        const response = await window.mealDbService.getRandom();
                        
                        if (response.meals && response.meals.length > 0) {
                            displaySearchResults(response.meals);
                        } else {
                            modal.querySelector('#search-results').innerHTML = '<p>Error getting random recipe. Please try again.</p>';
                        }
                    } catch (error) {
                        console.error('Random recipe error:', error);
                        modal.querySelector('#search-results').innerHTML = '<p>Error getting random recipe. Please try again.</p>';
                    }
                });
                
                // Display search results
                function displaySearchResults(meals) {
                    const resultsContainer = modal.querySelector('#search-results');
                    resultsContainer.innerHTML = '';
                    
                    if (!meals || meals.length === 0) {
                        resultsContainer.innerHTML = '<p>No recipes found.</p>';
                        return;
                    }
                    
                    // Create result cards
                    meals.forEach(meal => {
                        const card = document.createElement('div');
                        card.className = 'recipe-search-card';
                        card.innerHTML = `
                            <div class="recipe-search-img">
                                <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                            </div>
                            <div class="recipe-search-info">
                                <h3>${meal.strMeal}</h3>
                                <div class="recipe-search-meta">
                                    ${meal.strCategory ? `<span class="tag">${meal.strCategory}</span>` : ''}
                                    ${meal.strArea ? `<span class="tag">${meal.strArea}</span>` : ''}
                                </div>
                                <div class="recipe-search-actions">
                                    <button class="btn import-recipe-btn" data-meal-id="${meal.idMeal}">Import Recipe</button>
                                </div>
                            </div>
                        `;
                        resultsContainer.appendChild(card);
                        
                        // Handle import button click
                        card.querySelector('.import-recipe-btn').addEventListener('click', async function() {
                            const mealId = this.dataset.mealId;
                            try {
                                const response = await window.mealDbService.getById(mealId);
                                if (response.meals && response.meals.length > 0) {
                                    const cycleId = cycleSelector.value;
                                    const dayIndex = parseInt(daySelector.value);
                                    const mealType = mealSelector.value;
                                    
                                    // Convert MealDB meal to our format
                                    const mealEntry = window.convertMealDbToRecipe(response.meals[0], mealType);
                                    
                                    // Update the recipe in the cycle
                                    const cycles = window.getMealCycles();
                                    if (!cycles[cycleId]) {
                                        cycles[cycleId] = {};
                                    }
                                    if (!cycles[cycleId][dayIndex]) {
                                        cycles[cycleId][dayIndex] = {};
                                    }
                                    
                                    // Merge with existing day data
                                    Object.assign(cycles[cycleId][dayIndex], mealEntry);
                                    
                                    // Save updates
                                    window.saveMealCycles(cycles);
                                    
                                    // Close modal and refresh form
                                    modal.style.display = 'none';
                                    loadRecipeToForm();
                                    
                                    alert(`Imported "${response.meals[0].strMeal}" successfully!`);
                                }
                            } catch (error) {
                                console.error('Import error:', error);
                                alert('Error importing recipe. Please try again.');
                            }
                        });
                    });
                }
            }
            
            // Show the modal
            document.getElementById('recipe-search-modal').style.display = 'block';
        }
        
        // Setup autocomplete for recipe title
        setupRecipeAutocomplete();
        
        // Initialize the recipe calendar if it exists
        if (document.getElementById('recipe-calendar-grid')) {
            initRecipeCalendar(new Date());
            wireRecipeCalendarNav();
        }
        
        // Initialize the form
        populateCycleSelector();
    }
    
    // Setup autocomplete for recipe title
    function setupRecipeAutocomplete() {
        const inp = document.getElementById('recipe-title');
        const list = document.getElementById('recipe-suggestions');
        if (!inp || !list) return;
        let timer;
        inp.addEventListener('input', _ => {
            clearTimeout(timer);
            timer = setTimeout(async () => {
                const q = inp.value.trim();
                list.innerHTML = '';
                if (q.length < 2) return;
                const arr = await window.fetchSpoon(q);
                arr.forEach(title => {
                    const li = document.createElement('li');
                    li.textContent = title;
                    li.onclick = _ => {
                        inp.value = title;
                        list.innerHTML = '';
                    };
                    list.appendChild(li);
                });
            }, 300);
        });
        document.addEventListener('click', e => {
            if (!inp.contains(e.target)) list.innerHTML = '';
        });
    }
    
    // Initialize monthly calendar for recipe-management
    function initRecipeCalendar(date) {
        const grid = document.getElementById('recipe-calendar-grid');
        const title = document.getElementById('calendar-title');
        if (!grid || !title) return;
        const year = date.getFullYear(), month = date.getMonth();
        const first = new Date(year, month, 1), last = new Date(year, month + 1, 0);
        title.textContent = first.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        grid.innerHTML = '';
        // weekday headers
        ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(d => {
            const hd = document.createElement('div');
            hd.className = 'calendar-weekday';
            hd.textContent = d;
            grid.appendChild(hd);
        });
        // padding
        for (let i = 0; i < first.getDay(); i++) {
            const e = document.createElement('div'); 
            e.className = 'calendar-day inactive'; 
            grid.appendChild(e);
        }
        // days
        for (let d = 1; d <= last.getDate(); d++) {
            const cell = document.createElement('div');
            cell.className = 'calendar-day';
            cell.textContent = d;
            if (new Date(year, month, d).toDateString() === new Date().toDateString()) cell.classList.add('today');
            cell.onclick = _ => {
                const daySel = document.getElementById('manage-day-selector');
                if (daySel) {
                    daySel.value = d;
                    daySel.dispatchEvent(new Event('change'));
                }
            };
            grid.appendChild(cell);
        }
    }
    
    // Wire up recipe calendar navigation
    function wireRecipeCalendarNav() {
        let cur = new Date();
        document.getElementById('prev-month')?.addEventListener('click', () => {
            cur.setMonth(cur.getMonth() - 1);
            initRecipeCalendar(cur);
        });
        
        document.getElementById('next-month')?.addEventListener('click', () => {
            cur.setMonth(cur.getMonth() + 1);
            initRecipeCalendar(cur);
        });
    }
    
    // --- MOBILE MENU FUNCTIONALITY ---
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    // Create menu overlay if needed
    if (!document.querySelector('.menu-overlay')) {
        const menuOverlay = document.createElement('div');
        menuOverlay.className = 'menu-overlay';
        document.body.appendChild(menuOverlay);
    }
    
    const menuOverlay = document.querySelector('.menu-overlay');
    
    if (menuToggle && mainNav && menuOverlay) {
        menuToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
            menuOverlay.classList.toggle('active');
            document.body.style.overflow = mainNav.classList.contains('active') ? 'hidden' : '';
        });
        
        // Close menu when clicking outside
        menuOverlay.addEventListener('click', function() {
            mainNav.classList.remove('active');
            menuOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });
        
        // Close menu when clicking a link (for mobile)
        mainNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                mainNav.classList.remove('active');
                menuOverlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }
    
    // --- MOBILE-FRIENDLY ENHANCEMENTS ---
    // Add responsive table indicators if tables exist
    const mealTables = document.querySelectorAll('.meal-table');
    if (mealTables.length > 0) {
        mealTables.forEach(table => {
            const tableWrapper = table.closest('.table-responsive');
            if (tableWrapper) {
                // Check if indicator already exists
                if (!tableWrapper.previousElementSibling?.classList.contains('swipe-indicator')) {
                    const indicator = document.createElement('div');
                    indicator.className = 'swipe-indicator';
                    indicator.innerHTML = '<i class="fas fa-arrows-left-right"></i> Swipe to view more';
                    indicator.style.textAlign = 'center';
                    indicator.style.fontSize = '0.85rem';
                    indicator.style.color = '#666';
                    indicator.style.padding = '0.5rem 0';
                    indicator.style.display = 'none';
                    
                    // Only show on small screens
                    const showIndicator = () => {
                        if (window.innerWidth < 768 && tableWrapper.scrollWidth > tableWrapper.clientWidth) {
                            indicator.style.display = 'block';
                        } else {
                            indicator.style.display = 'none';
                        }
                    };
                    
                    showIndicator();
                    window.addEventListener('resize', showIndicator);
                    
                    tableWrapper.parentNode.insertBefore(indicator, tableWrapper);
                }
            }
        });
    }
    
    // --- RECIPE MODAL FUNCTIONALITY ---
    // Open recipe modal
    window.openRecipeModal = function(mealType, dayIndex) {
        const mealPlan = window.getMealForDate(new Date()); // Use function from meal-core.js
        const recipe = mealPlan[`${mealType}Recipe`];
        
        if (recipe) {
            // Select or create modal elements
            let recipeModal = document.getElementById('recipe-modal');
            if (!recipeModal) {
                recipeModal = document.createElement('div');
                recipeModal.id = 'recipe-modal';
                recipeModal.className = 'recipe-modal';
                recipeModal.innerHTML = `
                    <div class="recipe-modal-content">
                        <span class="recipe-modal-close">&times;</span>
                        <div id="recipe-modal-content">
                            <h3 id="recipe-title"></h3>
                            <div class="recipe-details">
                                <div class="ingredients-section">
                                    <h4>Ingredients</h4>
                                    <ul id="recipe-ingredients"></ul>
                                </div>
                                <div class="instructions-section">
                                    <h4>Instructions</h4>
                                    <ol id="recipe-instructions"></ol>
                                </div>
                            </div>
                            <div class="recipe-actions">
                                <button id="add-to-tracking" class="btn"><i class="fas fa-check-circle"></i> Mark as Complete</button>
                                <button id="edit-recipe" class="btn btn-secondary"><i class="fas fa-edit"></i> Edit Recipe</button>
                            </div>
                        </div>
                    </div>
                `;
                document.body.appendChild(recipeModal);
                
                // Add event listeners to new modal
                recipeModal.querySelector('.recipe-modal-close').addEventListener('click', function() {
                    recipeModal.style.display = 'none';
                });
                
                recipeModal.querySelector('#add-to-tracking').addEventListener('click', function() {
                    // Update tracking data
                    const today = new Date();
                    const formattedDate = window.formatDateISO(today);
                    
                    const trackingData = localStorage.getItem('trackingData');
                    const parsedData = trackingData ? JSON.parse(trackingData) : {};
                    
                    if (!parsedData[formattedDate]) {
                        parsedData[formattedDate] = {};
                    }
                    
                    parsedData[formattedDate][`${mealType}Completed`] = true;
                    
                    localStorage.setItem('trackingData', JSON.stringify(parsedData));
                    
                    alert('Meal marked as complete in your tracking data!');
                    recipeModal.style.display = 'none';
                    
                    // Update calendar if it exists
                    if (window.initWeeklyCalendar) {
                        window.initWeeklyCalendar(new Date());
                    }
                });
                
                recipeModal.querySelector('#edit-recipe').addEventListener('click', function() {
                    window.location.href = 'recipe-management.html';
                });
            }
            
            // Populate modal
            document.getElementById('recipe-title').textContent = recipe.title;
            
            // Ingredients
            const ingredientsElement = document.getElementById('recipe-ingredients');
            ingredientsElement.innerHTML = '';
            recipe.ingredients.forEach(ingredient => {
                const li = document.createElement('li');
                li.textContent = ingredient;
                ingredientsElement.appendChild(li);
            });
            
            // Instructions
            const instructionsElement = document.getElementById('recipe-instructions');
            instructionsElement.innerHTML = '';
            recipe.instructions.forEach(instruction => {
                const li = document.createElement('li');
                li.textContent = instruction;
                instructionsElement.appendChild(li);
            });
            
            // Show modal
            recipeModal.style.display = 'block';
        } else {
            alert('No detailed recipe available for this meal.');
        }
    };
    
    // Add click handlers for meal links
    document.querySelectorAll('.meal-link').forEach(link => {
        link.style.cursor = 'pointer';
        link.onclick = function() {
            window.openRecipeModal(
                this.dataset.meal,
                parseInt(this.dataset.day)
            );
        };
    });

    // Initialize meal cycle manager with drag and drop
    function initMealCycleManager() {
        const newCycleBtn = document.getElementById('new-plan-cycle-btn');
        const cyclesList = document.getElementById('available-cycles-list');
        const recycleBin = document.getElementById('recycle-bin');
        const calendarGrid = document.getElementById('week-calendar-grid');
        const periodButtons = document.querySelectorAll('.cycle-period-btn');
        const cycleSearch = document.getElementById('cycle-search');
        const sortSelect = document.getElementById('cycle-sort');
        
        let currentPeriod = 'daily'; // Default to daily cycles
        let selectedCycles = []; // For multi-select functionality
        
        // Load available meal cycles based on period
        function loadAvailableCycles() {
            if (!cyclesList) return;
            
            cyclesList.innerHTML = '';
            const cycles = window.getMealCycles();
            
            // Check if we have any cycles
            if (Object.keys(cycles).length === 0) {
                const noItemsMessage = document.getElementById('no-cycles-message');
                if (noItemsMessage) noItemsMessage.style.display = 'block';
                return;
            } else {
                const noItemsMessage = document.getElementById('no-cycles-message');
                if (noItemsMessage) noItemsMessage.style.display = 'none';
            }
            
            // Filter and format cycles based on selected period
            let filteredCycles = [];
            
            // Apply search filter if present
            const searchTerm = cycleSearch ? cycleSearch.value.toLowerCase() : '';
            
            switch(currentPeriod) {
                case 'daily':
                    // Single day meal plans
                    Object.keys(cycles).forEach(cycleId => {
                        Object.keys(cycles[cycleId]).forEach(dayIndex => {
                            const dayData = cycles[cycleId][dayIndex];
                            // Use only the base cycleId for the label
                            const baseCycleId = cycleId;
                            const cycleName = `Day ${parseInt(dayIndex) + 1} - ${window.generateCycleLabel(baseCycleId)}`;
                            
                            // Skip if doesn't match search
                            if (searchTerm && !cycleName.toLowerCase().includes(searchTerm)) return;
                            
                            filteredCycles.push({
                                id: `${cycleId}-${dayIndex}`,
                                name: cycleName,
                                data: dayData,
                                type: 'daily',
                                cycleId: cycleId,
                                dayIndex: parseInt(dayIndex)
                            });
                        });
                    });
                    break;
                    
                case 'weekly':
                    // Group by weeks (7 days)
                    Object.keys(cycles).forEach(cycleId => {
                        const weekCount = Math.ceil(Object.keys(cycles[cycleId]).length / 7);
                        
                        for (let i = 0; i < weekCount; i++) {
                            const weekData = {};
                            for (let j = 0; j < 7; j++) {
                                const dayIndex = i * 7 + j;
                                if (cycles[cycleId][dayIndex]) {
                                    weekData[j] = cycles[cycleId][dayIndex];
                                }
                            }
                            
                            if (Object.keys(weekData).length > 0) {
                                const baseCycleId = cycleId;
                                const cycleName = `Week ${i+1} - ${window.generateCycleLabel(baseCycleId)}`;
                                
                                // Skip if doesn't match search
                                if (searchTerm && !cycleName.toLowerCase().includes(searchTerm)) continue;
                                
                                filteredCycles.push({
                                    id: `${cycleId}-week${i+1}`,
                                    name: cycleName,
                                    data: weekData,
                                    type: 'weekly',
                                    cycleId: cycleId,
                                    weekNum: i+1
                                });
                            }
                        }
                    });
                    break;
                    
                case 'monthly':
                    // Full cycles (up to 30 days)
                    Object.keys(cycles).forEach(cycleId => {
                        if (Object.keys(cycles[cycleId]).length > 0) {
                            const baseCycleId = cycleId;
                            const cycleName = window.generateCycleLabel(baseCycleId);
                            
                            // Skip if doesn't match search
                            if (searchTerm && !cycleName.toLowerCase().includes(searchTerm)) return;
                            
                            filteredCycles.push({
                                id: cycleId,
                                name: cycleName,
                                data: cycles[cycleId],
                                type: 'monthly',
                                cycleId: cycleId
                            });
                        }
                    });
                    break;
            }
            
            // Apply sorting
            if (sortSelect) {
                const sortBy = sortSelect.value;
                
                if (sortBy === 'name') {
                    filteredCycles.sort((a, b) => a.name.localeCompare(b.name));
                } else if (sortBy === 'date-new') {
                    filteredCycles.sort((a, b) => {
                        const aId = a.cycleId || a.id;
                        const bId = b.cycleId || b.id;
                        return bId.localeCompare(aId);
                    });
                } else if (sortBy === 'date-old') {
                    filteredCycles.sort((a, b) => {
                        const aId = a.cycleId || a.id;
                        const bId = b.cycleId || b.id;
                        return aId.localeCompare(bId);
                    });
                } else if (sortBy === 'favorite') {
                    const favorites = JSON.parse(localStorage.getItem('favoriteCycles') || '[]');
                    filteredCycles.sort((a, b) => {
                        const aFav = favorites.includes(a.id) ? 1 : 0;
                        const bFav = favorites.includes(b.id) ? 1 : 0;
                        return bFav - aFav;
                    });
                }
            }
            
            // Create draggable elements for each cycle
            filteredCycles.forEach(cycle => {
                const cycleElement = document.createElement('div');
                cycleElement.className = 'cycle-item';
                cycleElement.draggable = true;
                cycleElement.dataset.cycleId = cycle.id;
                cycleElement.dataset.cycleType = cycle.type;
                
                // Add favorite status
                const favorites = JSON.parse(localStorage.getItem('favoriteCycles') || '[]');
                if (favorites.includes(cycle.id)) {
                    cycleElement.classList.add('favorite');
                }
                
                // Calculate meal stats
                let breakfastCount = 0, lunchCount = 0, dinnerCount = 0;
                if (cycle.type === 'daily') {
                    if (cycle.data.breakfast) breakfastCount++;
                    if (cycle.data.lunch) lunchCount++;
                    if (cycle.data.dinner) dinnerCount++;
                } else {
                    Object.values(cycle.data).forEach(day => {
                        if (day.breakfast) breakfastCount++;
                        if (day.lunch) lunchCount++;
                        if (day.dinner) dinnerCount++;
                    });
                }
                
                cycleElement.innerHTML = `
                    <div class="cycle-item-header">
                        <span class="cycle-item-title">${truncateText(cycle.name, 25)}</span>
                        <i class="fas fa-star favorite-star"></i>
                    </div>
                    
                    <div class="cycle-item-badges">
                        ${breakfastCount ? `<span class="cycle-badge breakfast"><i class="fas fa-coffee"></i> ${breakfastCount}</span>` : ''}
                        ${lunchCount ? `<span class="cycle-badge lunch"><i class="fas fa-utensils"></i> ${lunchCount}</span>` : ''}
                        ${dinnerCount ? `<span class="cycle-badge dinner"><i class="fas fa-moon"></i> ${dinnerCount}</span>` : ''}
                    </div>
                    
                    <div class="cycle-item-stats">
                        <div class="cycle-item-stat">
                            <i class="fas fa-calendar-day"></i> ${Object.keys(cycle.data).length} days
                        </div>
                    </div>
                `;
                
                // Add favorite star click handler
                const starIcon = cycleElement.querySelector('.favorite-star');
                starIcon.addEventListener('click', function(e) {
                    e.stopPropagation(); // Prevent drag start
                    
                    const favorites = JSON.parse(localStorage.getItem('favoriteCycles') || '[]');
                    const index = favorites.indexOf(cycle.id);
                    
                    if (index === -1) {
                        // Add to favorites
                        favorites.push(cycle.id);
                        cycleElement.classList.add('favorite');
                        showToast('Added to favorites');
                    } else {
                        // Remove from favorites
                        favorites.splice(index, 1);
                        cycleElement.classList.remove('favorite');
                        showToast('Removed from favorites');
                    }
                    
                    localStorage.setItem('favoriteCycles', JSON.stringify(favorites));
                });
                
                // Add hover preview handler
                cycleElement.addEventListener('mouseenter', function() {
                    const previewContent = document.querySelector('.cycle-preview-content');
                    if (!previewContent) return;
                    
                    previewContent.innerHTML = '';
                    
                    if (cycle.type === 'daily') {
                        // Preview a single day's meals
                        const meals = [
                            { type: 'breakfast', name: cycle.data.breakfast },
                            { type: 'lunch', name: cycle.data.lunch },
                            { type: 'dinner', name: cycle.data.dinner }
                        ];
                        
                        meals.forEach(meal => {
                            if (!meal.name) return;
                            
                            const mealItem = document.createElement('div');
                            mealItem.className = `preview-meal-item ${meal.type}`;
                            mealItem.innerHTML = `
                                <span class="preview-meal-type">${meal.type.charAt(0).toUpperCase() + meal.type.slice(1)}</span>
                                <span class="preview-meal-name">${meal.name}</span>
                            `;
                            previewContent.appendChild(mealItem);
                        });
                    } else {
                        // Preview a selection of meals from this cycle
                        const dayKeys = Object.keys(cycle.data).slice(0, 3);
                        
                        if (dayKeys.length === 0) {
                            previewContent.innerHTML = '<p class="empty-preview">No meals to preview</p>';
                            return;
                        }
                        
                        dayKeys.forEach((day, index) => {
                            const dayData = cycle.data[day];
                            const dayNumber = cycle.type === 'weekly' ? 
                                parseInt(day) + 1 : // If weekly, days are 0-6
                                parseInt(day) + 1;  // If monthly, days are 0-29
                            
                            const dayPreview = document.createElement('div');
                            dayPreview.className = 'day-preview';
                            dayPreview.innerHTML = `<h6>Day ${dayNumber}</h6>`;
                            
                            // Add breakfast
                            if (dayData.breakfast) {
                                const breakfast = document.createElement('div');
                                breakfast.className = 'preview-meal-item breakfast';
                                breakfast.innerHTML = `
                                    <span class="preview-meal-type">Breakfast</span>
                                    <span class="preview-meal-name">${dayData.breakfast}</span>
                                `;
                                dayPreview.appendChild(breakfast);
                            }
                            
                            // Add one more meal (lunch or dinner) to save space
                            if (dayData.lunch) {
                                const lunch = document.createElement('div');
                                lunch.className = 'preview-meal-item lunch';
                                lunch.innerHTML = `
                                    <span class="preview-meal-type">Lunch</span>
                                    <span class="preview-meal-name">${dayData.lunch}</span>
                                `;
                                dayPreview.appendChild(lunch);
                            } else if (dayData.dinner) {
                                const dinner = document.createElement('div');
                                dinner.className = 'preview-meal-item dinner';
                                dinner.innerHTML = `
                                    <span class="preview-meal-type">Dinner</span>
                                    <span class="preview-meal-name">${dayData.dinner}</span>
                                `;
                                dayPreview.appendChild(dinner);
                            }
                            
                            previewContent.appendChild(dayPreview);
                        });
                        
                        // Add a "more" indicator if there are more days
                        if (Object.keys(cycle.data).length > 3) {
                            const moreIndicator = document.createElement('div');
                            moreIndicator.className = 'more-indicator';
                            moreIndicator.textContent = `+ ${Object.keys(cycle.data).length - 3} more days`;
                            moreIndicator.style.textAlign = 'center';
                            moreIndicator.style.padding = '0.5rem';
                            moreIndicator.style.color = '#666';
                            moreIndicator.style.fontStyle = 'italic';
                            previewContent.appendChild(moreIndicator);
                        }
                    }
                });
                
                // Add drag event listeners
                cycleElement.addEventListener('dragstart', handleDragStart);
                cycleElement.addEventListener('dragend', handleDragEnd);
                
                // Add click handler for multi-select
                cycleElement.addEventListener('click', function(e) {
                    if (e.ctrlKey || e.metaKey) {
                        // Multi-select functionality
                        if (cycleElement.classList.contains('selected')) {
                            cycleElement.classList.remove('selected');
                            selectedCycles = selectedCycles.filter(id => id !== cycle.id);
                        } else {
                            cycleElement.classList.add('selected');
                            selectedCycles.push(cycle.id);
                        }
                    }
                });
                
                cyclesList.appendChild(cycleElement);
            });
            
            // Apply fade-in animation to all items
            cyclesList.querySelectorAll('.cycle-item').forEach((item, index) => {
                item.style.animationDelay = `${index * 0.05}s`;
                item.classList.add('new-item');
                
                // Remove the class after animation completes
                setTimeout(() => {
                    item.classList.remove('new-item');
                }, 500 + index * 50);
            });
        }
        
        // Drag event handlers
        function handleDragStart(e) {
            // If multiple items are selected and this is one of them, drag all
            if (selectedCycles.length > 0 && selectedCycles.includes(e.target.dataset.cycleId)) {
                e.dataTransfer.setData('text/plain', JSON.stringify({
                    type: 'multi',
                    ids: selectedCycles,
                    dragSource: 'cyclesList' // Add source information
                }));
            } else {
                e.dataTransfer.setData('text/plain', JSON.stringify({
                    type: 'single',
                    id: e.target.dataset.cycleId,
                    cycleType: e.target.dataset.cycleType,
                    dragSource: 'cyclesList' // Add source information
                }));
            }
            
            e.dataTransfer.effectAllowed = 'move';
            this.classList.add('dragging');
            
            // Create a custom drag image showing how many items are being dragged
            if (selectedCycles.length > 1) {
                const dragImage = document.createElement('div');
                dragImage.textContent = `${selectedCycles.length} cycles`;
                dragImage.style.background = 'var(--primary-color)';
                dragImage.style.color = 'white';
                dragImage.style.padding = '0.5rem 1rem';
                dragImage.style.borderRadius = '4px';
                dragImage.style.position = 'absolute';
                dragImage.style.top = '-1000px';
                dragImage.style.fontWeight = 'bold';
                dragImage.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
                
                document.body.appendChild(dragImage);
                e.dataTransfer.setDragImage(dragImage, 50, 25);
                
                // Clean up the element after drag ends
                setTimeout(() => {
                    document.body.removeChild(dragImage);
                }, 0);
            }
        }
        
        function handleDragEnd(e) {
            this.classList.remove('dragging');
        }
        
        // Set up calendar days as drop targets
        function setupCalendarDropTargets() {
            if (!calendarGrid) return;
            
            const calendarDays = calendarGrid.querySelectorAll('.calendar-day');
            
            calendarDays.forEach(day => {
                day.addEventListener('dragover', function(e) {
                    e.preventDefault();
                    
                    // Don't allow drop on inactive days
                    if (this.classList.contains('inactive')) {
                        this.classList.add('drag-not-allowed');
                        return;
                    }
                    
                    this.classList.add('drag-over');
                });
                
                day.addEventListener('dragleave', function() {
                    this.classList.remove('drag-over');
                    this.classList.remove('drag-not-allowed');
                });
                
                day.addEventListener('drop', function(e) {
                    e.preventDefault();
                    this.classList.remove('drag-over');
                    this.classList.remove('drag-not-allowed');
                    
                    // Don't allow drop on inactive days
                    if (this.classList.contains('inactive')) {
                        return;
                    }
                    
                    // Get the date for this calendar day
                    const date = new Date(this.dataset.date);
                    if (!date) return;
                    
                    try {
                        const dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
                        
                        if (dragData.type === 'multi') {
                            // Handle multiple cycles being dropped
                            handleMultiCycleDrop(dragData.ids, date);
                        } else if (dragData.type === 'single') {
                            // Handle single cycle being dropped
                            handleSingleCycleDrop(dragData.id, dragData.cycleType, date);
                        } else if (dragData.type === 'remove') {
                            // This is a meal being moved from one day to another
                            const [sourceDate, mealType] = [dragData.date, dragData.meal];
                            moveMealBetweenDays(sourceDate, mealType, this.dataset.date);
                        }
                    } catch (err) {
                        console.error('Error processing drag data:', err);
                    }
                });
                
                // Make existing meals draggable 
                const meals = day.querySelectorAll('.calendar-meal');
                meals.forEach(meal => {
                    makeMealDraggable(meal);
                });
            });
        }

        // Handle drop of multiple cycles
        function handleMultiCycleDrop(cycleIds, startDate) {
            showConfirmationModal(
                'Place Multiple Cycles',
                `Are you sure you want to place ${cycleIds.length} cycles starting from ${startDate.toLocaleDateString()}?`,
                () => {
                    // Process each cycle with a slight delay to show animation
                    cycleIds.forEach((cycleId, index) => {
                        setTimeout(() => {
                            const [id, cycleType] = cycleId.split('|');
                            handleSingleCycleDrop(id, cycleType || 'daily', startDate, false);
                        }, index * 300);
                    });
                }
            );
        }

        // Handle drop of a single cycle
        function handleSingleCycleDrop(cycleId, cycleType, date, showAnimation = true) {
            if (cycleType === 'daily') {
                // Single day - simpler check
                placeDailyCycle(cycleId, date, showAnimation);
            } else if (cycleType === 'weekly') {
                // Check 7 consecutive days
                placeWeeklyCycle(cycleId, date, showAnimation);
            } else {
                // Check for monthly cycle overlap
                placeMonthlyCycle(cycleId, date, showAnimation);
            }
        }
        
        // Make calendar meals draggable
        function makeMealDraggable(mealElement) {
            mealElement.classList.add('draggable');
            mealElement.draggable = true;
            
            mealElement.addEventListener('dragstart', function(e) {
                e.dataTransfer.setData('text/plain', JSON.stringify({
                    type: 'remove',
                    date: this.dataset.date,
                    meal: this.dataset.meal
                }));
                this.classList.add('dragging');
            });
            
            mealElement.addEventListener('dragend', function() {
                this.classList.remove('dragging');
            });
        }
        
        // Move a meal from one day to another
        function moveMealBetweenDays(sourceDate, mealType, targetDate) {
            // Get tracking data
            const trackingData = localStorage.getItem('trackingData');
            if (!trackingData) return;
            
            const parsedData = JSON.parse(trackingData);
            if (!parsedData[sourceDate]) return;
            
            // Check if there's a conflicting meal at the target
            if (parsedData[targetDate] && parsedData[targetDate][mealType]) {
                showConfirmationModal(
                    'Replace Meal',
                    `There's already a ${mealType} meal scheduled for ${new Date(targetDate).toLocaleDateString()}. Replace it?`,
                    () => {
                        // Move the meal
                        performMealMove(parsedData, sourceDate, targetDate, mealType);
                    }
                );
            } else {
                // No conflict, just move
                performMealMove(parsedData, sourceDate, targetDate, mealType);
            }
        }
        
        // Perform the actual meal move
        function performMealMove(parsedData, sourceDate, targetDate, mealType) {
            // Ensure target date structure exists
            if (!parsedData[targetDate]) {
                parsedData[targetDate] = {};
            }
            
            // Copy all meal properties from source to target
            const mealProps = ['meal', 'Recipe', 'Planned', 'Completed'];
            mealProps.forEach(prop => {
                const key = mealType + prop;
                if (parsedData[sourceDate][key] !== undefined) {
                    parsedData[targetDate][key] = parsedData[sourceDate][key];
                }
            });
            
            // Remove from source
            mealProps.forEach(prop => {
                const key = mealType + prop;
                delete parsedData[sourceDate][key];
            });
            
            // If source date is now empty, remove it
            if (Object.keys(parsedData[sourceDate]).length === 0) {
                delete parsedData[sourceDate];
            }
            
            // Save updates
            localStorage.setItem('trackingData', JSON.stringify(parsedData));
            
            // Refresh calendars
            window.initWeeklyCalendar && window.initWeeklyCalendar(new Date(targetDate));
            
            // Show success animation
            const targetDay = document.querySelector(`.calendar-day[data-date="${targetDate}"]`);
            if (targetDay) {
                targetDay.classList.add('placement-success');
                setTimeout(() => targetDay.classList.remove('placement-success'), 1000);
            }
            
            showToast(`${mealType.charAt(0).toUpperCase() + mealType.slice(1)} moved successfully`);
        }
        
        // Set up recycle bin as drop target
        function setupRecycleBin() {
            if (!recycleBin) return;
            
            recycleBin.addEventListener('dragover', function(e) {
                e.preventDefault();
                this.classList.add('highlight');
            });
            
            recycleBin.addEventListener('dragleave', function() {
                this.classList.remove('highlight');
            });
            
            recycleBin.addEventListener('drop', function(e) {
                e.preventDefault();
                this.classList.remove('highlight');
                
                try {
                    const dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
                    
                    if (dragData.type === 'remove') {
                        // Remove meal from calendar
                        removeMealFromCalendar(dragData.date, dragData.meal);
                        
                        // Show animation
                        this.classList.add('item-deleted');
                        setTimeout(() => this.classList.remove('item-deleted'), 600);
                    } 
                    // Handle dropping cycle items into recycle bin
                    else if (dragData.dragSource === 'cyclesList') {
                        if (dragData.type === 'single') {
                            // Delete single cycle
                            showConfirmationModal(
                                'Delete Cycle',
                                `Are you sure you want to delete this cycle?`,
                                () => {
                                    deleteCycle(dragData.id);
                                    this.classList.add('item-deleted');
                                    setTimeout(() => this.classList.remove('item-deleted'), 600);
                                }
                            );
                        } else if (dragData.type === 'multi') {
                            // Delete multiple cycles
                            showConfirmationModal(
                                'Delete Multiple Cycles',
                                `Are you sure you want to delete ${dragData.ids.length} cycles?`,
                                () => {
                                    dragData.ids.forEach(id => deleteCycle(id));
                                    this.classList.add('item-deleted');
                                    setTimeout(() => this.classList.remove('item-deleted'), 600);
                                }
                            );
                        }
                    }
                } catch (err) {
                    console.error('Error processing drag data:', err);
                }
            });
        }
        
        // Add new function to delete a cycle
        function deleteCycle(cycleId) {
            // For daily/weekly formats, extract the base cycle id
            let baseCycleId = cycleId;
            if (cycleId.includes('-week')) {
                // Extract base cycle ID for weekly format
                baseCycleId = cycleId.split('-week')[0];
            } else if (cycleId.includes('-') && cycleId.split('-').length > 2) {
                // Extract base cycle ID for daily format (YYYY-NN-D)
                const parts = cycleId.split('-');
                baseCycleId = `${parts[0]}-${parts[1]}`;
            }
            
            // Check if we're deleting a full cycle or just a day/week
            const cycles = window.getMealCycles();
            
            if (currentPeriod === 'monthly' || cycleId === baseCycleId) {
                // Delete an entire cycle
                if (cycles[cycleId]) {
                    delete cycles[cycleId];
                    window.saveMealCycles(cycles);
                    showToast('Cycle deleted successfully');
                }
            } 
            else if (currentPeriod === 'daily' && cycleId.includes('-')) {
                // Delete a specific day from a cycle
                const [origCycleId, dayIndex] = cycleId.split('-');
                if (cycles[origCycleId] && cycles[origCycleId][dayIndex]) {
                    delete cycles[origCycleId][dayIndex];
                    
                    // If cycle is now empty, delete the whole cycle
                    if (Object.keys(cycles[origCycleId]).length === 0) {
                        delete cycles[origCycleId];
                    }
                    
                    window.saveMealCycles(cycles);
                    showToast('Day deleted from cycle');
                }
            }
            else if (currentPeriod === 'weekly' && cycleId.includes('-week')) {
                // Delete a specific week from a cycle
                const [origCycleId, weekPart] = cycleId.split('-week');
                const weekIndex = parseInt(weekPart) - 1;
                
                if (cycles[origCycleId]) {
                    // Calculate day indices for this week (0-6, 7-13, etc.)
                    const firstDayIndex = weekIndex * 7;
                    const lastDayIndex = firstDayIndex + 6;
                    
                    // Delete all days in this week range
                    for (let i = firstDayIndex; i <= lastDayIndex; i++) {
                        if (cycles[origCycleId][i]) {
                            delete cycles[origCycleId][i];
                        }
                    }
                    
                    // If cycle is now empty, delete the whole cycle
                    if (Object.keys(cycles[origCycleId]).length === 0) {
                        delete cycles[origCycleId];
                    }
                    
                    window.saveMealCycles(cycles);
                    showToast('Week deleted from cycle');
                }
            }
            
            // Refresh the cycles list display
            loadAvailableCycles();
            
            // Clear selection if needed
            selectedCycles = selectedCycles.filter(id => id !== cycleId);
        }
        
        // Set up period selector buttons
        function setupPeriodButtons() {
            if (!periodButtons) return;
            
            // Make sure "daily" is active by default
            periodButtons.forEach(btn => {
                if (btn.dataset.period === currentPeriod) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
            
            periodButtons.forEach(btn => {
                btn.addEventListener('click', function() {
                    periodButtons.forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    
                    currentPeriod = this.dataset.period;
                    loadAvailableCycles();
                });
            });
        }
        
        // Set up new cycle button
        function setupNewCycleButton() {
            const newCycleBtn = document.getElementById('new-plan-cycle-btn');
            if (!newCycleBtn) return;
            
            newCycleBtn.addEventListener('click', function(e) {
                e.preventDefault();
                showNewCycleModal();
            });
        }
        
        // Show new cycle creation modal
        function showNewCycleModal() {
            // Only create modal if it doesn't exist
            let modal = document.getElementById('new-cycle-modal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'new-cycle-modal';
                modal.className = 'modal-dialog';
                modal.innerHTML = `
                    <div class="modal-dialog-content">
                        <h4>Create New Meal Cycle</h4>
                        <div class="form-group" style="margin-bottom: 1rem; text-align: left;">
                            <label for="new-cycle-year" style="display: block; margin-bottom: 0.5rem;">Year:</label>
                            <input type="number" id="new-cycle-year" class="form-control" min="2023" max="2050" value="${new Date().getFullYear()}" style="width: 100%; padding: 0.5rem; border-radius: 4px; border: 1px solid #ddd;">
                        </div>
                        <div class="form-group" style="margin-bottom: 1rem; text-align: left;">
                            <label for="new-cycle-import" style="display: block; margin-bottom: 0.5rem;">Import recipes:</label>
                            <select id="new-cycle-import" class="form-control" style="width: 100%; padding: 0.5rem; border-radius: 4px; border: 1px solid #ddd;">
                                <option value="empty">Create empty cycle</option>
                                <option value="import">Import from MealDB</option>
                                <option value="sample">Use sample recipes</option>
                            </select>
                        </div>
                        <div class="conflict-options">
                            <button id="create-cycle-btn" class="btn">Create Cycle</button>
                            <button id="cancel-cycle-btn" class="btn btn-secondary">Cancel</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);
            }

            // Always (re)attach event listeners to avoid duplicates
            const cancelBtn = modal.querySelector('#cancel-cycle-btn');
            const createBtn = modal.querySelector('#create-cycle-btn');

            // Remove previous listeners by cloning
            const newCancelBtn = cancelBtn.cloneNode(true);
            cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
            const newCreateBtn = createBtn.cloneNode(true);
            createBtn.parentNode.replaceChild(newCreateBtn, createBtn);

            // Cancel closes modal
            newCancelBtn.addEventListener('click', function() {
                modal.classList.remove('active');
            });

            // Create cycle logic
            newCreateBtn.addEventListener('click', async function() {
                const year = parseInt(modal.querySelector('#new-cycle-year').value);
                const importOption = modal.querySelector('#new-cycle-import').value;

                if (!year || isNaN(year)) {
                    alert('Please enter a valid year');
                    return;
                }

                // Find the next available cycle number
                const cycles = window.getMealCycles();
                const existingCycles = Object.keys(cycles)
                    .filter(id => id.startsWith(`${year}-`))
                    .map(id => parseInt(id.split('-')[1]));
                let nextCycleNum = 1;
                if (existingCycles.length > 0) {
                    nextCycleNum = Math.max(...existingCycles) + 1;
                }
                const newCycleId = `${year}-${nextCycleNum.toString().padStart(2, '0')}`;

                // Show loading toast (optional)
                const loadingToast = showToast('Creating new cycle...', 0);

                try {
                    if (importOption === 'import') {
                        localStorage.setItem('pendingCycleId', newCycleId);
                        modal.classList.remove('active');
                        document.body.removeChild(loadingToast);
                        window.location.href = 'recipe-management.html?action=import';
                        return;
                    } else if (importOption === 'sample') {
                        const sampleMeals = window.getSampleMealPlan();
                        const newCycle = {};
                        for (let i = 0; i < Math.min(30, sampleMeals.length); i++) {
                            newCycle[i] = sampleMeals[i];
                        }
                        window.saveRecipeCycle(newCycleId, newCycle);
                    } else {
                        // Create empty cycle
                        const newCycle = {};
                        for (let i = 0; i < 30; i++) {
                            newCycle[i] = {
                                breakfast: `Breakfast for Day ${i+1}`,
                                lunch: `Lunch for Day ${i+1}`,
                                dinner: `Dinner for Day ${i+1}`,
                                breakfastRecipe: {
                                    title: `Breakfast Recipe for Day ${i+1}`,
                                    ingredients: ["Add ingredients here"],
                                    instructions: ["Add instructions here"]
                                },
                                lunchRecipe: {
                                    title: `Lunch Recipe for Day ${i+1}`,
                                    ingredients: ["Add ingredients here"],
                                    instructions: ["Add instructions here"]
                                },
                                dinnerRecipe: {
                                    title: `Dinner Recipe for Day ${i+1}`,
                                    ingredients: ["Add ingredients here"],
                                    instructions: ["Add instructions here"]
                                }
                            };
                        }
                        window.saveRecipeCycle(newCycleId, newCycle);
                    }
                    document.body.removeChild(loadingToast);
                    modal.classList.remove('active');
                    showToast(`Created new cycle: ${window.generateCycleLabel(newCycleId)}`);
                    loadAvailableCycles();
                } catch (err) {
                    document.body.removeChild(loadingToast);
                    modal.classList.remove('active');
                    showToast('Error creating cycle. Please try again.', 3000, 'error');
                }
            });

            // Show modal
            modal.classList.add('active');
        }

        // Add window method to get cycle date from ID
        if (!window.getCycleDateFromId) {
            window.getCycleDateFromId = function(cycleId, dayIndex) {
                try {
                    const [year, cycleNum] = cycleId.split('-').map(x => parseInt(x));
                    const startDay = (cycleNum - 1) * 30 + 1; // 30 days per cycle
                    
                    const dateObj = new Date(year, 0, 0);
                    dateObj.setDate(startDay + parseInt(dayIndex));
                    return dateObj;
                } catch (e) {
                    return new Date(); // Return today on error
                }
            };
        }
        
        // Show confirmation modal
        function showConfirmationModal(title, message, onConfirm) {
            // Create modal if it doesn't exist
            let modal = document.getElementById('confirm-modal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'confirm-modal';
                modal.className = 'modal-dialog';
                
                modal.innerHTML = `
                    <div class="modal-dialog-content">
                        <h4 id="confirm-title">Confirm Action</h4>
                        <p id="confirm-message">Are you sure?</p>
                        
                        <div class="conflict-options">
                            <button id="confirm-yes" class="btn">Yes</button>
                            <button id="confirm-no" class="btn btn-secondary">No</button>
                        </div>
                    </div>
                `;
                
                document.body.appendChild(modal);
            }
            
            // Update content
            document.getElementById('confirm-title').textContent = title;
            document.getElementById('confirm-message').textContent = message;
            
            // Set up event handlers
            const yesButton = document.getElementById('confirm-yes');
            const noButton = document.getElementById('confirm-no');
            
            // Clear previous event listeners
            const newYesButton = yesButton.cloneNode(true);
            const newNoButton = noButton.cloneNode(true);
            yesButton.parentNode.replaceChild(newYesButton, yesButton);
            noButton.parentNode.replaceChild(newNoButton, noButton);
            
            // Add new event listeners
            newYesButton.addEventListener('click', function() {
                modal.classList.remove('active');
                onConfirm();
            });
            
            newNoButton.addEventListener('click', function() {
                modal.classList.remove('active');
            });
            
            // Show modal
            modal.classList.add('active');
        }
        
        // Show toast message
        function showToast(message, duration = 3000, type = 'success') {
            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            toast.innerHTML = `
                <div class="toast-content">
                    <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
                    <span>${message}</span>
                </div>
            `;
            
            document.body.appendChild(toast);
            
            // Animate in
            setTimeout(() => {
                toast.classList.add('show');
            }, 10);
            
            // Animate out and remove after duration (if not a persistent toast)
            if (duration > 0) {
                setTimeout(() => {
                    toast.classList.remove('show');
                    setTimeout(() => {
                        if (document.body.contains(toast)) {
                            document.body.removeChild(toast);
                        }
                    }, 300);
                }, duration);
            }
            
            return toast;
        }
        
        // Format date in short format for display
        function formatDateShort(date) {
            if (!date) return '';
            return `${date.getMonth() + 1}/${date.getDate()}`;
        }
        
        // Truncate text with ellipsis
        function truncateText(text, maxLength) {
            if (!text) return '';
            return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
        }
        
        // Add event listeners for search
        if (cycleSearch) {
            let debounceTimer;
            cycleSearch.addEventListener('input', function() {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    loadAvailableCycles();
                }, 300);
            });
        }
        
        // Add event listener for sort
        if (sortSelect) {
            sortSelect.addEventListener('change', loadAvailableCycles);
            
            // Populate sort options if empty
            if (!sortSelect.options.length) {
                const sortOptions = [
                    { value: 'name', text: 'Sort by Name' },
                    { value: 'date-new', text: 'Newest First' },
                    { value: 'date-old', text: 'Oldest First' },
                    { value: 'favorite', text: 'Favorites First' }
                ];
                
                sortOptions.forEach(option => {
                    const optionEl = document.createElement('option');
                    optionEl.value = option.value;
                    optionEl.textContent = option.text;
                    sortSelect.appendChild(optionEl);
                });
            }
        }
        
        // Initialize the cycle manager
        loadAvailableCycles();
        setupCalendarDropTargets();
        setupRecycleBin();
        setupPeriodButtons();
        setupNewCycleButton();
        
        // Add a default cycle if none exist
        const cycles = window.getMealCycles();
        if (Object.keys(cycles).length === 0) {
            const noItemsMessage = document.getElementById('no-cycles-message');
            if (noItemsMessage) {
                const sampleCycleBtn = document.createElement('button');
                sampleCycleBtn.className = 'btn';
                sampleCycleBtn.innerHTML = '<i class="fas fa-magic"></i> Create Sample Cycle';
                sampleCycleBtn.style.marginTop = '1rem';
                
                noItemsMessage.appendChild(document.createElement('br'));
                noItemsMessage.appendChild(sampleCycleBtn);
                noItemsMessage.style.display = 'block';
                
                sampleCycleBtn.addEventListener('click', function() {
                    const today = new Date();
                    const year = today.getFullYear();
                    const newCycleId = `${year}-01`;
                    
                    // Create empty cycle with basic data
                    window.initializeWithSampleData();
                    showToast('Sample meal cycle created! You can now drag items to the calendar.');
                    loadAvailableCycles();
                });
            }
        }
        
        // Refresh drag-and-drop when calendar changes
        const prevWeekBtn = document.getElementById('prev-week');
        const nextWeekBtn = document.getElementById('next-week');
        
        if (prevWeekBtn) {
            prevWeekBtn.addEventListener('click', function() {
                setTimeout(() => {
                    setupCalendarDropTargets();
                }, 100);
            });
        }
        
        if (nextWeekBtn) {
            nextWeekBtn.addEventListener('click', function() {
                setTimeout(() => {
                    setupCalendarDropTargets();
                }, 100);
            });
        }
        
        // Add custom animations for meals
        const style = document.createElement('style');
        style.textContent = `
            .placement-success {
                animation: pulse-success 1s ease;
            }
            @keyframes pulse-success {
                0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7); }
                50% { box-shadow: 0 0 0 15px rgba(76, 175, 80, 0); }
                100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
            }
            
            .toast {
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%) translateY(100px);
                background: white;
                border-left: 5px solid var(--primary-color);
                border-radius: 5px;
                padding: 1rem 2rem;
                box-shadow: 0 3px 15px rgba(0, 0, 0, 0.2);
                z-index: 2000;
                opacity: 0;
                transition: transform 0.3s ease, opacity 0.3s ease;
            }
            
            .toast.show {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
            
            .toast-error {
                border-color: #dc3545;
            }
            
            .toast-content {
                display: flex;
                align-items: center;
            }
            
            .toast-content i {
                margin-right: 10px;
                font-size: 1.2rem;
                color: var(--primary-color);
            }
            
            .toast-error .toast-content i {
                color: #dc3545;
            }
        `;
        document.head.appendChild(style);
    }

    // Update the document ready handler to load the calendar view
    const viewWeeklyBtn = document.getElementById('view-weekly');
    const viewMonthlyBtn = document.getElementById('view-monthly');
    const viewAnnualBtn = document.getElementById('view-annual');
    
    const weeklyCalendar = document.getElementById('weekly-calendar');
    const monthlyCalendar = document.getElementById('monthly-calendar');
    const annualCalendar = document.getElementById('annual-calendar');
    
    if (viewWeeklyBtn && viewMonthlyBtn && viewAnnualBtn) {
        // Set active button and show corresponding view
        function setActiveView(viewName) {
            // Remove active class from all buttons
            [viewWeeklyBtn, viewMonthlyBtn, viewAnnualBtn].forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Hide all calendar views
            [weeklyCalendar, monthlyCalendar, annualCalendar].forEach(view => {
                if (view) view.style.display = 'none';
            });
            
            // Activate selected view
            if (viewName === 'weekly') {
                viewWeeklyBtn.classList.add('active');
                if (weeklyCalendar) weeklyCalendar.style.display = 'block';
                window.initWeeklyCalendar && window.initWeeklyCalendar(new Date());
            } 
            else if (viewName === 'monthly') {
                viewMonthlyBtn.classList.add('active');
                if (monthlyCalendar) monthlyCalendar.style.display = 'block';
                window.initMonthlyCalendar && window.initMonthlyCalendar(new Date());
            }
            else if (viewName === 'annual') {
                viewAnnualBtn.classList.add('active');
                if (annualCalendar) annualCalendar.style.display = 'block';
                window.initAnnualCalendar && window.initAnnualCalendar(new Date());
            }
            
            // After changing views, reinitialize the cycle manager to update
            // drag-and-drop functionality for the new calendar items
            setTimeout(() => {
                if (window.location.pathname.includes('meal-plan.html')) {
                    initMealCycleManager();
                }
            }, 100);
        }
        
        // Add click handlers
        viewWeeklyBtn.addEventListener('click', () => setActiveView('weekly'));
        viewMonthlyBtn.addEventListener('click', () => setActiveView('monthly'));
        viewAnnualBtn.addEventListener('click', () => setActiveView('annual'));
    }
    
    // Handle "Go to Today" button
    const todayBtn = document.getElementById('today-btn');
    if (todayBtn) {
        todayBtn.addEventListener('click', function() {
            // Reset to current date and reload calendar
            window.initWeeklyCalendar && window.initWeeklyCalendar(new Date());
            
            // If on the meal plan page, update calendar
            if (window.location.pathname.includes('meal-plan.html')) {
                const weeklyBtn = document.getElementById('view-weekly');
                if (weeklyBtn) {
                    weeklyBtn.click();
                }
            }
            // If on tracking page, navigate to today
            else if (window.location.pathname.includes('tracking.html')) {
                window.navigateToDate && window.navigateToDate(new Date());
            }
        });
    }
    
    // Initialize the meal cycle manager when the page loads
    if (window.location.pathname.includes('meal-plan.html')) {
        // Initialize global calendar date
        window.currentCalendarDate = new Date();
        
        // Initialize the meal cycle manager
        initMealCycleManager();
        
        // Set up calendar navigation
        setupCalendarNavigation();
        
        // Initial calendar setup
        window.initWeeklyCalendar && window.initWeeklyCalendar(window.currentCalendarDate);
    }
    
    // Set up calendar navigation buttons
    function setupCalendarNavigation() {
        const prevWeekBtn = document.getElementById('prev-week');
        const nextWeekBtn = document.getElementById('next-week');
        const todayBtn = document.getElementById('today-btn');
        
        // Make sure we have a global current date
        if (!window.currentCalendarDate) {
            window.currentCalendarDate = new Date();
        }
        
        // Handle previous week button
        if (prevWeekBtn) {
            prevWeekBtn.addEventListener('click', function() {
                // Calculate date for previous week
                const newDate = new Date(window.currentCalendarDate);
                newDate.setDate(newDate.getDate() - 7);
                
                // Update the global current date
                window.currentCalendarDate = newDate;
                
                // Refresh the calendar with the new date
                window.initWeeklyCalendar && window.initWeeklyCalendar(newDate);
                
                // Refresh drop targets for drag and drop after calendar update
                setTimeout(() => {
                    setupCalendarDropTargets();
                }, 100);
            });
        }
        
        // Handle next week button
        if (nextWeekBtn) {
            nextWeekBtn.addEventListener('click', function() {
                // Calculate date for next week
                const newDate = new Date(window.currentCalendarDate);
                newDate.setDate(newDate.getDate() + 7);
                
                // Update the global current date
                window.currentCalendarDate = newDate;
                
                // Refresh the calendar with the new date
                window.initWeeklyCalendar && window.initWeeklyCalendar(newDate);
                
                // Refresh drop targets for drag and drop after calendar update
                setTimeout(() => {
                    setupCalendarDropTargets();
                }, 100);
            });
        }
        
        // Handle today button
        if (todayBtn) {
            todayBtn.addEventListener('click', function() {
                // Reset to today's date
                const today = new Date();
                
                // Update the global current date
                window.currentCalendarDate = today;
                
                // Refresh the calendar with the new date
                window.initWeeklyCalendar && window.initWeeklyCalendar(today);
                
                // Refresh drop targets for drag and drop after calendar update
                setTimeout(() => {
                    setupCalendarDropTargets();
                }, 100);
            });
        }
    }
    
    // Check for import action from URL parameters
    if (window.location.pathname.includes('recipe-management.html')) {
        const params = new URLSearchParams(window.location.search);
        if (params.get('action') === 'import') {
            // Get pending cycle ID stored in localStorage
            const pendingCycleId = localStorage.getItem('pendingCycleId');
            if (pendingCycleId) {
                // Clear it to prevent reuse
                localStorage.removeItem('pendingCycleId');
                
                // Wait for recipe manager to initialize
                setTimeout(() => {
                    // Show import dialog for this cycle
                    if (typeof showImportOptionsModal === 'function') {
                        showImportOptionsModal(pendingCycleId);
                    }
                }, 500);
            }
        }
    }
});
