// Core functionality for meal plans, tracking, and data management

document.addEventListener('DOMContentLoaded', function() {
    // --- RECIPE CYCLE MANAGEMENT SYSTEM ---
    const CYCLE_LENGTH = 30; // Days per cycle
    
    // Get all meal cycles from localStorage or initialize with empty
    function getMealCycles() {
        const cycles = localStorage.getItem('mealCycles');
        return cycles ? JSON.parse(cycles) : {};
    }
    
    // Save meal cycles to localStorage
    function saveMealCycles(cycles) {
        localStorage.setItem('mealCycles', JSON.stringify(cycles));
    }
    
    // Create a new cycle or update existing one
    function saveRecipeCycle(cycleId, cycleData) {
        const cycles = getMealCycles();
        cycles[cycleId] = cycleData;
        saveMealCycles(cycles);
    }
    
    // Get meal plan for a specific date
    function getMealForDate(date) {
        const dateStr = formatDateYMD(date);
        const cycleId = getCycleIdForDate(date);
        const dayIndex = getDayIndexInCycle(date);
        
        const cycles = getMealCycles();
        
        // If no cycle exists for this date, use default sample data
        if (!cycles[cycleId] || !cycles[cycleId][dayIndex]) {
            return getSampleMealPlan()[0]; // Return a default meal plan
        }
        
        return cycles[cycleId][dayIndex];
    }
    
    // Get the cycle ID for a given date (e.g., "2023-05")
    function getCycleIdForDate(date) {
        const year = date.getFullYear();
        // Calculate which 30-day cycle this is in the year (1-based)
        const dayOfYear = getDayOfYear(date);
        const cycleNumber = Math.ceil(dayOfYear / CYCLE_LENGTH);
        return `${year}-${cycleNumber.toString().padStart(2, '0')}`;
    }
    
    // Get the day index within the current cycle (0-29)
    function getDayIndexInCycle(date) {
        const dayOfYear = getDayOfYear(date);
        return (dayOfYear - 1) % CYCLE_LENGTH;
    }
    
    // Get day of year (1-366)
    function getDayOfYear(date) {
        const start = new Date(date.getFullYear(), 0, 0);
        const diff = date - start;
        const oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay);
    }
    
    // Format date as YYYY-MM-DD
    function formatDateYMD(date) {
        return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    }
    
    // Format date for display
    function formatDateForDisplay(date) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }
    
    // Generate cycle label (e.g., "Cycle 2 (May 31 - Jun 29, 2023)")
    function generateCycleLabel(cycleId) {
        const [year, cycleNum] = cycleId.split('-').map(x => parseInt(x));
        const startDay = (cycleNum - 1) * CYCLE_LENGTH + 1;
        
        const startDate = getDayOfYearAsDate(startDay, year);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + CYCLE_LENGTH - 1);
        
        const startFormatted = startDate.toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
        const endFormatted = endDate.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'});
        
        return `Cycle ${cycleNum} (${startFormatted} - ${endFormatted})`;
    }
    
    // Convert day of year to Date object
    function getDayOfYearAsDate(dayOfYear, year) {
        const date = new Date(year, 0, 0);
        date.setDate(dayOfYear);
        return date;
    }
    
    // Get active meal cycles and sort them
    function getActiveMealCycles() {
        const cycles = getMealCycles();
        return Object.keys(cycles).sort().reverse(); // Most recent first
    }
    
    // Initialize with sample data if no cycles exist
    function initializeWithSampleData() {
        const cycles = getMealCycles();
        const today = new Date();
        const currentCycleId = getCycleIdForDate(today);
        
        // Only initialize if no cycles exist
        if (Object.keys(cycles).length === 0) {
            const sampleMeals = getSampleMealPlan();
            
            // Create a cycle with sample data
            const cycleData = {};
            for (let i = 0; i < Math.min(CYCLE_LENGTH, sampleMeals.length); i++) {
                cycleData[i] = sampleMeals[i];
            }
            
            cycles[currentCycleId] = cycleData;
            saveMealCycles(cycles);
            console.log(`Initialized sample data for cycle ${currentCycleId}`);
        }
    }
    
    // Returns a sample 30-day meal plan for initialization
    function getSampleMealPlan() {
        // This contains the original meal plan data
        return [
            // Day 1
            {
                breakfast: 'Veggie omelet (eggs, spinach, mushrooms) + whole-grain toast',
                breakfastRecipe: {
                    title: 'Veggie Omelet & Toast',
                    ingredients: [
                        '2 eggs',
                        '1/2 cup spinach, chopped',
                        '1/4 cup mushrooms, sliced',
                        '1 tsp olive oil',
                        'Salt & pepper to taste',
                        '1 slice whole-grain bread'
                    ],
                    instructions: [
                        'Beat eggs with salt and pepper.',
                        'Heat olive oil in a pan, sauté mushrooms and spinach until soft.',
                        'Pour eggs over veggies, cook until set.',
                        'Toast bread and serve omelet on the side.'
                    ]
                },
                lunch: 'Grilled chicken salad (mixed greens, tomato, cucumber, olive oil)',
                lunchRecipe: {
                    title: 'Grilled Chicken Salad',
                    ingredients: [
                        '1 chicken breast',
                        '2 cups mixed greens',
                        '1 tomato, sliced',
                        '1/2 cucumber, sliced',
                        '1 tbsp olive oil',
                        'Salt & pepper'
                    ],
                    instructions: [
                        'Season chicken breast with salt and pepper, grill until cooked through.',
                        'Slice chicken and arrange over greens, tomato, and cucumber.',
                        'Drizzle with olive oil before serving.'
                    ]
                },
                dinner: 'Baked salmon, quinoa, steamed broccoli',
                dinnerRecipe: {
                    title: 'Baked Salmon with Quinoa & Broccoli',
                    ingredients: [
                        '1 salmon fillet',
                        '1/2 cup quinoa',
                        '1 cup broccoli florets',
                        '1 tsp olive oil',
                        'Lemon wedge',
                        'Salt & pepper'
                    ],
                    instructions: [
                        'Preheat oven to 400°F (200°C).',
                        'Season salmon with salt, pepper, and olive oil. Bake for 12-15 min.',
                        'Cook quinoa according to package instructions.',
                        'Steam broccoli until tender.',
                        'Serve salmon with quinoa and broccoli, garnish with lemon.'
                    ]
                }
            },
            // Day 2
            {
                breakfast: 'Overnight oats with almond butter, banana, chia seeds',
                breakfastRecipe: {
                    title: 'Overnight Oats',
                    ingredients: [
                        '1/2 cup rolled oats',
                        '1 cup almond milk',
                        '1 tbsp almond butter',
                        '1 banana, sliced',
                        '1 tbsp chia seeds'
                    ],
                    instructions: [
                        'Combine oats, almond milk, almond butter, and chia seeds in a jar.',
                        'Mix well and refrigerate overnight.',
                        'Top with banana slices before serving.'
                    ]
                },
                lunch: 'Turkey-hummus wrap, bell peppers',
                lunchRecipe: {
                    title: 'Turkey-Hummus Wrap',
                    ingredients: [
                        '1 whole-grain tortilla',
                        '3 slices turkey breast',
                        '2 tbsp hummus',
                        '1/2 bell pepper, sliced',
                        'Lettuce leaves'
                    ],
                    instructions: [
                        'Spread hummus on tortilla.',
                        'Layer turkey, bell pepper, and lettuce.',
                        'Roll up and slice in half.'
                    ]
                },
                dinner: 'Beef-and-mixed-veg stir-fry over brown rice',
                dinnerRecipe: {
                    title: 'Beef & Veggie Stir-Fry',
                    ingredients: [
                        '4 oz lean beef, sliced',
                        '1 cup mixed vegetables (e.g., broccoli, carrots, snap peas)',
                        '1 tbsp soy sauce',
                        '1 tsp sesame oil',
                        '1/2 cup brown rice'
                    ],
                    instructions: [
                        'Cook brown rice as directed.',
                        'Stir-fry beef in sesame oil until browned.',
                        'Add vegetables and soy sauce, cook until veggies are tender.',
                        'Serve over brown rice.'
                    ]
                }
            }
            // Additional days would be added here
        ];
    }
    
    // Call initialization
    initializeWithSampleData();
    
    // --- CALENDAR & TRACKING INTEGRATION ---
    
    // Initialize weekly calendar
    function initWeeklyCalendar(date) {
        // Update global date reference if it exists
        if (window.currentCalendarDate) {
            window.currentCalendarDate = new Date(date);
        }
        
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay()); // Start from Sunday
        
        // Update calendar title
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        const titleFormat = { month: 'short', day: 'numeric' };
        const yearFormat = { year: 'numeric' };
        
        let titleText = `${startOfWeek.toLocaleDateString('en-US', titleFormat)} - ${endOfWeek.toLocaleDateString('en-US', titleFormat)}`;
        if (startOfWeek.getFullYear() !== endOfWeek.getFullYear()) {
            titleText = `${startOfWeek.toLocaleDateString('en-US', titleFormat)}, ${startOfWeek.toLocaleDateString('en-US', yearFormat)} - ${endOfWeek.toLocaleDateString('en-US', titleFormat)}, ${endOfWeek.toLocaleDateString('en-US', yearFormat)}`;
        } else {
            titleText += `, ${endOfWeek.toLocaleDateString('en-US', yearFormat)}`;
        }
        
        const calendarTitle = document.getElementById('calendar-title');
        if (calendarTitle) calendarTitle.textContent = titleText;
        
        // Clear and populate calendar grid if it exists
        const gridElement = document.getElementById('week-calendar-grid');
        if (!gridElement) return;
        
        gridElement.innerHTML = '';
        
        // Create 7 days (Sunday to Saturday)
        for (let i = 0; i < 7; i++) {
            const dayDate = new Date(startOfWeek);
            dayDate.setDate(startOfWeek.getDate() + i);
            
            // Create day cell
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.dataset.date = formatDateISO(dayDate); // Add date as data attribute
            
            // Add today marker
            if (dayDate.toDateString() === new Date().toDateString()) {
                dayElement.classList.add('today');
            }
            
            // Add date number
            const dayNumber = document.createElement('div');
            dayNumber.className = 'calendar-day-number';
            dayNumber.textContent = dayDate.getDate();
            dayElement.appendChild(dayNumber);
            
            // Fetch meal plan & tracking data
            const dayInfo = getMealPlanAndTrackingForDate(dayDate);
            
            // Add meal info
            const mealsList = document.createElement('div');
            mealsList.className = 'calendar-day-meals';
            
            // Add breakfast
            if (dayInfo.breakfast) {
                const breakfast = document.createElement('div');
                breakfast.className = 'calendar-meal breakfast';
                if (dayInfo.breakfastCompleted) breakfast.classList.add('calendar-meal-completed');
                breakfast.textContent = `B: ${dayInfo.breakfast}`;
                breakfast.dataset.date = formatDateISO(dayDate);
                breakfast.dataset.meal = 'breakfast';
                breakfast.addEventListener('click', () => openMealDetails(dayDate, 'breakfast'));
                mealsList.appendChild(breakfast);
            }
            
            // Add lunch (with data attributes for drag-and-drop)
            if (dayInfo.lunch) {
                const lunch = document.createElement('div');
                lunch.className = 'calendar-meal lunch';
                if (dayInfo.lunchCompleted) lunch.classList.add('calendar-meal-completed');
                lunch.textContent = `L: ${dayInfo.lunch}`;
                lunch.dataset.date = formatDateISO(dayDate);
                lunch.dataset.meal = 'lunch';
                lunch.addEventListener('click', () => openMealDetails(dayDate, 'lunch'));
                mealsList.appendChild(lunch);
            }
            
            // Add dinner (with data attributes for drag-and-drop)
            if (dayInfo.dinner) {
                const dinner = document.createElement('div');
                dinner.className = 'calendar-meal dinner';
                if (dayInfo.dinnerCompleted) dinner.classList.add('calendar-meal-completed');
                dinner.textContent = `D: ${dayInfo.dinner}`;
                dinner.dataset.date = formatDateISO(dayDate);
                dinner.dataset.meal = 'dinner';
                dinner.addEventListener('click', () => openMealDetails(dayDate, 'dinner'));
                mealsList.appendChild(dinner);
            }
            
            // Add smoothie indicator if any
            if (dayInfo.smoothies && dayInfo.smoothies.length > 0) {
                const smoothies = document.createElement('div');
                smoothies.className = 'calendar-meal';
                smoothies.style.background = '#e8f5e9';
                smoothies.textContent = `🥤 ${dayInfo.smoothies.length} Smoothie${dayInfo.smoothies.length > 1 ? 's' : ''}`;
                mealsList.appendChild(smoothies);
            }
            
            dayElement.appendChild(mealsList);
            
            // Add completion indicator
            const completionIndicator = document.createElement('div');
            completionIndicator.className = 'calendar-completion-indicator';
            
            const completionProgress = document.createElement('div');
            completionProgress.className = 'calendar-completion-indicator-progress';
            completionProgress.style.width = `${dayInfo.completionPercentage}%`;
            
            completionIndicator.appendChild(completionProgress);
            dayElement.appendChild(completionIndicator);
            
            // Make the day clickable to navigate to tracking page
            dayElement.addEventListener('click', function(e) {
                // Only trigger if not clicking on a meal item
                if (!e.target.classList.contains('calendar-meal')) {
                    if (window.location.pathname.includes('tracking.html')) {
                        // We're already on tracking page, use local navigation
                        window.navigateToDate && window.navigateToDate(dayDate);
                    } else {
                        // Navigate to tracking page with date parameter
                        const dateStr = formatDateISO(dayDate);
                        sessionStorage.setItem('selectedDate', dateStr);
                        window.location.href = 'tracking.html';
                    }
                }
            });
            
            gridElement.appendChild(dayElement);
        }
        
        // Update weekly stats if available
        if (window.updateWeeklySummaryStats) {
            window.updateWeeklySummaryStats(startOfWeek);
        }
    }
    
    // Initialize monthly calendar
    function initMonthlyCalendar(date) {
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        // Update calendar title
        const calendarTitle = document.getElementById('calendar-title');
        if (calendarTitle) {
            calendarTitle.textContent = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        }
        
        // Clear and populate calendar grid if it exists
        const gridElement = document.getElementById('month-calendar-grid');
        if (!gridElement) return;
        
        gridElement.innerHTML = '';
        
        // Add padding days for start of month
        let startPadding = firstDay.getDay(); // 0 = Sunday
        for (let i = 0; i < startPadding; i++) {
            const paddingDay = document.createElement('div');
            paddingDay.className = 'calendar-day inactive';
            gridElement.appendChild(paddingDay);
        }
        
        // Add actual month days
        for (let i = 1; i <= lastDay.getDate(); i++) {
            const dayDate = new Date(date.getFullYear(), date.getMonth(), i);
            
            // Create day cell
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            
            // Add today marker
            if (dayDate.toDateString() === new Date().toDateString()) {
                dayElement.classList.add('today');
            }
            
            // Add date number
            const dayNumber = document.createElement('div');
            dayNumber.className = 'calendar-day-number';
            dayNumber.textContent = i;
            dayElement.appendChild(dayNumber);
            
            // Fetch tracking data
            const dayInfo = getMealPlanAndTrackingForDate(dayDate);
            
            // Add simplified meal indicators
            if (dayInfo.breakfast || dayInfo.lunch || dayInfo.dinner) {
                const mealIndicator = document.createElement('div');
                mealIndicator.className = 'calendar-meal';
                mealIndicator.style.fontSize = '0.75rem';
                
                // Show counts using emoji icons
                let mealText = '';
                if (dayInfo.breakfast) mealText += '🍳 ';
                if (dayInfo.lunch) mealText += '🥗 ';
                if (dayInfo.dinner) mealText += '🍲 ';
                mealIndicator.textContent = mealText;
                
                dayElement.appendChild(mealIndicator);
            }
            
            // Add completion indicator
            const completionIndicator = document.createElement('div');
            completionIndicator.className = 'calendar-completion-indicator';
            
            const completionProgress = document.createElement('div');
            completionProgress.className = 'calendar-completion-indicator-progress';
            completionProgress.style.width = `${dayInfo.completionPercentage}%`;
            
            completionIndicator.appendChild(completionProgress);
            dayElement.appendChild(completionIndicator);
            
            // Make the day clickable to navigate to tracking page
            dayElement.addEventListener('click', function() {
                if (window.location.pathname.includes('tracking.html')) {
                    // We're already on tracking page, use local navigation
                    window.navigateToDate && window.navigateToDate(dayDate);
                } else {
                    // Navigate to tracking page with date parameter
                    const dateStr = formatDateISO(dayDate);
                    sessionStorage.setItem('selectedDate', dateStr);
                    window.location.href = 'tracking.html';
                }
            });
            
            gridElement.appendChild(dayElement);
        }
        
        // Add padding days for end of month
        const endPadding = 6 - lastDay.getDay(); // 6 = Saturday
        for (let i = 0; i < endPadding; i++) {
            const paddingDay = document.createElement('div');
            paddingDay.className = 'calendar-day inactive';
            gridElement.appendChild(paddingDay);
        }
    }
    
    // Initialize annual calendar
    function initAnnualCalendar(date) {
        const year = date.getFullYear();
        
        // Update calendar title
        const calendarTitle = document.getElementById('calendar-title');
        if (calendarTitle) {
            calendarTitle.textContent = year;
        }
        
        // Clear and populate annual grid if it exists
        const gridElement = document.getElementById('annual-grid');
        if (!gridElement) return;
        
        gridElement.innerHTML = '';
        
        // Create 52 weeks
        for (let week = 0; week < 52; week++) {
            const weekElement = document.createElement('div');
            weekElement.className = 'annual-week';
            
            // Create 7 days per week
            for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
                // Calculate actual date
                const dayOfYear = week * 7 + dayOfWeek;
                const dayDate = new Date(year, 0, dayOfYear + 1);
                
                // Skip days not in the year
                if (dayDate.getFullYear() !== year) continue;
                
                const dayElement = document.createElement('div');
                dayElement.className = 'annual-day';
                
                // Add today marker
                if (dayDate.toDateString() === new Date().toDateString()) {
                    dayElement.style.border = '2px solid var(--primary-color)';
                }
                
                // Fetch tracking data
                const dayInfo = getMealPlanAndTrackingForDate(dayDate);
                
                // Set color based on completion
                if (dayInfo.completionPercentage >= 100) {
                    dayElement.classList.add('completion-100');
                } else if (dayInfo.completionPercentage >= 75) {
                    dayElement.classList.add('completion-75');
                } else if (dayInfo.completionPercentage >= 50) {
                    dayElement.classList.add('completion-50');
                } else if (dayInfo.completionPercentage > 0) {
                    dayElement.classList.add('completion-25');
                } else {
                    dayElement.classList.add('completion-0');
                }
                
                // Add tooltip
                const tooltip = document.createElement('div');
                tooltip.className = 'annual-day-tooltip';
                tooltip.textContent = `${dayDate.toLocaleDateString()} - ${dayInfo.completionPercentage}% completed`;
                
                // Make the day clickable to navigate to tracking page
                dayElement.addEventListener('click', function() {
                    if (window.location.pathname.includes('tracking.html')) {
                        // We're already on tracking page, use local navigation
                        window.navigateToDate && window.navigateToDate(dayDate);
                    } else {
                        // Navigate to tracking page with date parameter
                        const dateStr = formatDateISO(dayDate);
                        sessionStorage.setItem('selectedDate', dateStr);
                        window.location.href = 'tracking.html';
                    }
                });
                
                dayElement.appendChild(tooltip);
                weekElement.appendChild(dayElement);
            }
            
            gridElement.appendChild(weekElement);
        }
    }
    
    // Fetch meal plan and tracking data for a specific date
    function getMealPlanAndTrackingForDate(date) {
        // Get meal plan data
        const mealPlan = getMealForDate(date);
        
        // Get tracking data
        const trackingData = getTrackingForDate(date);
        
        // Calculate completion percentage based on how many meals/items were completed
        const totalItems = Object.keys(trackingData).length > 0 ? 3 + (trackingData.smoothies?.length || 0) : 0; // 3 meals + smoothies
        const completedItems = 
            (trackingData.breakfastCompleted ? 1 : 0) + 
            (trackingData.lunchCompleted ? 1 : 0) + 
            (trackingData.dinnerCompleted ? 1 : 0) +
            (trackingData.smoothies?.length || 0);
        
        const completionPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
        
        return {
            breakfast: mealPlan.breakfast || '',
            lunch: mealPlan.lunch || '',
            dinner: mealPlan.dinner || '',
            breakfastCompleted: trackingData.breakfastCompleted || false,
            lunchCompleted: trackingData.lunchCompleted || false,
            dinnerCompleted: trackingData.dinnerCompleted || false,
            smoothies: trackingData.smoothies || [],
            completionPercentage: completionPercentage
        };
    }
    
    // Get tracking data for a date
    function getTrackingForDate(date) {
        const trackingData = localStorage.getItem('trackingData');
        if (!trackingData) return {};
        
        const parsedData = JSON.parse(trackingData);
        const dateStr = formatDateISO(date);
        return parsedData[dateStr] || {};
    }
    
    // Format date to YYYY-MM-DD
    function formatDateISO(date) {
        return date.toISOString().split('T')[0];
    }
    
    // Open meal details (recipe)
    function openMealDetails(date, mealType) {
        const mealPlan = getMealForDate(date);
        const mealContent = mealPlan[mealType];
        const recipeData = mealPlan[`${mealType}Recipe`];
        
        if (window.openRecipeModal) {
            window.openRecipeModal(mealType, 0); // Use the global function if available
        } else if (recipeData) {
            alert(`Recipe for ${mealType}: ${recipeData.title}\nIngredients: ${recipeData.ingredients.join(', ')}\nInstructions: ${recipeData.instructions.join(' ')}`);
        } else {
            alert(`${mealType.charAt(0).toUpperCase() + mealType.slice(1)}: ${mealContent}\nNo detailed recipe available.`);
        }
    }

    // --- THEMEALDB API INTEGRATION ---
    const MEALDB_API_BASE = 'https://www.themealdb.com/api/json/v1/1';
    
    // API service for TheMealDB
    const mealDbService = {
        // Search for meals by name
        searchByName: async (name) => {
            const response = await fetch(`${MEALDB_API_BASE}/search.php?s=${encodeURIComponent(name)}`);
            return await response.json();
        },
        
        // Search meals by main ingredient
        searchByIngredient: async (ingredient) => {
            const response = await fetch(`${MEALDB_API_BASE}/filter.php?i=${encodeURIComponent(ingredient)}`);
            return await response.json();
        },
        
        // Get meal details by ID
        getById: async (id) => {
            const response = await fetch(`${MEALDB_API_BASE}/lookup.php?i=${id}`);
            return await response.json();
        },
        
        // Get random meal
        getRandom: async () => {
            const response = await fetch(`${MEALDB_API_BASE}/random.php`);
            return await response.json();
        },
        
        // List all categories
        getCategories: async () => {
            const response = await fetch(`${MEALDB_API_BASE}/categories.php`);
            return await response.json();
        },
        
        // Get meals by category
        getByCategory: async (category) => {
            const response = await fetch(`${MEALDB_API_BASE}/filter.php?c=${encodeURIComponent(category)}`);
            return await response.json();
        },
        
        // Get all ingredients
        getIngredients: async () => {
            const response = await fetch(`${MEALDB_API_BASE}/list.php?i=list`);
            return await response.json();
        }
    };
    
    // Convert TheMealDB meal to our recipe format
    function convertMealDbToRecipe(meal, mealType) {
        // Extract ingredients and measurements from scattered TheMealDB format
        const ingredients = [];
        for (let i = 1; i <= 20; i++) {
            const ingredient = meal[`strIngredient${i}`];
            const measure = meal[`strMeasure${i}`];
            
            if (ingredient && ingredient.trim() !== '') {
                let formattedIngredient = ingredient;
                if (measure && measure.trim() !== '') {
                    formattedIngredient = `${measure.trim()} ${ingredient.trim()}`;
                }
                ingredients.push(formattedIngredient);
            }
        }
        
        // Format instructions by splitting on newlines or periods
        let instructions = [];
        if (meal.strInstructions) {
            // First try to split by newlines
            instructions = meal.strInstructions.split(/\r?\n/)
                .filter(line => line.trim() !== '')
                .map(line => line.trim());
            
            // If we didn't get multiple steps, split by periods
            if (instructions.length <= 1) {
                instructions = meal.strInstructions.split('.')
                    .filter(line => line.trim() !== '')
                    .map(line => `${line.trim()}.`);
            }
        }
        
        // Create standardized recipe object
        const recipe = {
            title: meal.strMeal,
            ingredients: ingredients,
            instructions: instructions,
            category: meal.strCategory,
            area: meal.strArea,
            thumbnail: meal.strMealThumb,
            tags: meal.strTags ? meal.strTags.split(',') : [],
            youtubeLink: meal.strYoutube,
            source: meal.strSource,
            mealDbId: meal.idMeal
        };
        
        // Create meal entry
        const mealEntry = {};
        mealEntry[mealType] = meal.strMeal;
        mealEntry[`${mealType}Recipe`] = recipe;
        
        return mealEntry;
    }
    
    // Function to import multiple meals from TheMealDB
    async function importMealsForCycle(cycleId, filters = {}) {
        try {
            let meals;
            
            // Apply filters if provided
            if (filters.category) {
                const response = await mealDbService.getByCategory(filters.category);
                meals = response.meals || [];
            }
            else if (filters.ingredient) {
                const response = await mealDbService.searchByIngredient(filters.ingredient);
                meals = response.meals || [];
            }
            else {
                // Get random meals if no filters
                meals = [];
                for (let i = 0; i < 30; i++) {
                    const randomResponse = await mealDbService.getRandom();
                    if (randomResponse.meals && randomResponse.meals.length > 0) {
                        meals.push(randomResponse.meals[0]);
                    }
                }
            }
            
            // If we don't have enough meals, get random ones to fill in
            while (meals.length < 30) {
                const randomResponse = await mealDbService.getRandom();
                if (randomResponse.meals && randomResponse.meals.length > 0) {
                    meals.push(randomResponse.meals[0]);
                }
            }
            
            // Get detailed information for each meal
            const detailedMeals = [];
            for (const meal of meals.slice(0, 30)) { // Limit to 30 meals
                const detailResponse = await mealDbService.getById(meal.idMeal);
                if (detailResponse.meals && detailResponse.meals.length > 0) {
                    detailedMeals.push(detailResponse.meals[0]);
                }
                if (detailedMeals.length >= 30) break;
            }
            
            // Create a new cycle with the meals
            const cycles = getMealCycles();
            const cycleData = {};
            
            // Use a repeating pattern for meal types: breakfast, lunch, dinner
            const mealTypes = ['breakfast', 'lunch', 'dinner'];
            
            // Distribute meals across days and meal types
            for (let i = 0; i < CYCLE_LENGTH; i++) {
                const dayData = {};
                
                // For each meal type (breakfast, lunch, dinner)
                for (let j = 0; j < mealTypes.length; j++) {
                    const mealType = mealTypes[j];
                    const mealIndex = (i * mealTypes.length + j) % detailedMeals.length;
                    const meal = detailedMeals[mealIndex];
                    
                    const mealEntry = convertMealDbToRecipe(meal, mealType);
                    Object.assign(dayData, mealEntry);
                }
                
                cycleData[i] = dayData;
            }
            
            // Save the new cycle
            cycles[cycleId] = cycleData;
            saveMealCycles(cycles);
            
            return true;
        } catch (error) {
            console.error('Error importing meals:', error);
            return false;
        }
    }
    
    // --- SPOONACULAR API + CACHE ---
    const SPOON_API_KEY = '10db2333d8ff4fc18cda19739a6e3e43';
    const SPOON_CACHE = 'spoonacularCache';

    function getCached(query) {
        const cache = JSON.parse(localStorage.getItem(SPOON_CACHE) || '{}');
        return cache[query];
    }
    function setCached(query, data) {
        const cache = JSON.parse(localStorage.getItem(SPOON_CACHE) || '{}');
        cache[query] = data;
        localStorage.setItem(SPOON_CACHE, JSON.stringify(cache));
    }
    async function fetchSpoon(query) {
        if (!query) return [];
        const hit = getCached(query);
        if (hit) return hit;
        const res = await fetch(`https://api.spoonacular.com/recipes/complexSearch?apiKey=${SPOON_API_KEY}&query=${encodeURIComponent(query)}&number=5`);
        const json = await res.json();
        const results = (json.results || []).map(r => r.title);
        setCached(query, results);
        return results;
    }

    // Tab functionality for meal plans
    const showWeek = (weekNum) => {
        document.querySelectorAll('.meal-week').forEach(week => {
            week.classList.remove('active');
        });
        document.querySelectorAll('.tab-btn').forEach(tab => {
            tab.classList.remove('active');
        });
        
        document.getElementById(`week${weekNum}`).classList.add('active');
        document.querySelectorAll('.tab-btn')[weekNum-1].classList.add('active');
    };
    
    // Make functions available globally
    window.showWeek = showWeek;
    window.getMealCycles = getMealCycles;
    window.saveMealCycles = saveMealCycles;
    window.saveRecipeCycle = saveRecipeCycle;
    window.getMealForDate = getMealForDate;
    window.getCycleIdForDate = getCycleIdForDate;
    window.getDayIndexInCycle = getDayIndexInCycle;
    window.formatDateYMD = formatDateYMD;
    window.formatDateForDisplay = formatDateForDisplay;
    window.generateCycleLabel = generateCycleLabel;
    window.getActiveMealCycles = getActiveMealCycles;
    window.initWeeklyCalendar = initWeeklyCalendar;
    window.initMonthlyCalendar = initMonthlyCalendar;
    window.initAnnualCalendar = initAnnualCalendar;
    window.getMealPlanAndTrackingForDate = getMealPlanAndTrackingForDate;
    window.formatDateISO = formatDateISO;
    window.openMealDetails = openMealDetails;
    window.mealDbService = mealDbService;
    window.importMealsForCycle = importMealsForCycle;
    window.convertMealDbToRecipe = convertMealDbToRecipe;
    window.fetchSpoon = fetchSpoon;
    
    // Initialize calendar if elements exist
    if (document.getElementById('week-calendar-grid')) {
        initWeeklyCalendar(new Date());
    }
    
    // Check for tracking page loading with a date parameter - prevent auto-scrolling
    if (window.location.pathname.includes('tracking.html')) {
        const selectedDateStr = sessionStorage.getItem('selectedDate');
        if (selectedDateStr) {
            const selectedDate = new Date(selectedDateStr);
            if (!isNaN(selectedDate.getTime())) {
                setTimeout(() => {
                    window.navigateToDate && window.navigateToDate(selectedDate);
                    sessionStorage.removeItem('selectedDate'); // Clear after use
                }, 500);
            }
        }
    }
});
