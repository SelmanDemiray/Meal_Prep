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
});
