// BowlBetter! 1.2 | May 2025
// BowlBetter! - Bowling approach analyzer with swipeable tab interface and bulk upload

let currentStepTab = 1;
let totalSteps = 4;
let uploadedFiles = []; // Global array to store bulk uploaded files

// Load API key from localStorage and set it in the input field
function loadApiKey() {
    const apiKey = localStorage.getItem('groqApiKey');
    const apiKeyInput = document.getElementById('apiKey');
    if (apiKey && apiKeyInput) {
        apiKeyInput.value = apiKey;
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    console.log('Initializing BowlBetter app');
    loadApiKey();
    generateStepTabs(); // Initial call with default step count
    setupEventListeners();

    const showApiKeyInstructionsBtn = document.getElementById('showApiKeyInstructionsBtn');
    if (showApiKeyInstructionsBtn) {
        showApiKeyInstructionsBtn.addEventListener('click', function () {
            const instructions = document.getElementById('apiKeyInstructions');
            if (instructions) {
                instructions.hidden = !instructions.hidden;
            }
        });
    }
    initializeCollapsibleSections(); 
});

// Define the initializeCollapsibleSections function to prevent errors and enable collapsible sections
function initializeCollapsibleSections() {
    console.log('Initializing collapsible sections');

    const collapsibleHeaders = document.querySelectorAll('.collapsible-header');
    collapsibleHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            if (content) {
                const isExpanded = content.style.display === 'block';
                content.style.display = isExpanded ? 'none' : 'block';
                header.setAttribute('aria-expanded', !isExpanded);
            }
        });
    });
}

// Set up all event listeners
function setupEventListeners() {
    const prevStepBtn = document.getElementById('prevStepBtn');
    if (prevStepBtn) {
        prevStepBtn.addEventListener('click', () => showStepTab(currentStepTab - 1));
    }

    const nextStepBtn = document.getElementById('nextStepBtn');
    if (nextStepBtn) {
        nextStepBtn.addEventListener('click', () => showStepTab(currentStepTab + 1));
    }

    const bulkUploadInput = document.getElementById('bulkImageUpload');
    if (bulkUploadInput) {
        bulkUploadInput.addEventListener('change', handleBulkUpload);
    }

    const analyzeBtn = document.getElementById('analyzeApproachBtn');
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', analyzeApproach);
    }

    const setStepsBtn = document.getElementById('setStepsBtn');
    if (setStepsBtn) {
        setStepsBtn.addEventListener('click', generateStepTabs);
    }

    const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
    if (saveApiKeyBtn) {
        saveApiKeyBtn.addEventListener('click', async () => {
            const apiKeyInput = document.getElementById('apiKey');
            if (apiKeyInput && apiKeyInput.value) {
                localStorage.setItem('groqApiKey', apiKeyInput.value);
                // Show testing message
                let statusDiv = document.getElementById('apiKeyStatus');
                if (!statusDiv) {
                    statusDiv = document.createElement('div');
                    statusDiv.id = 'apiKeyStatus';
                    apiKeyInput.parentElement.appendChild(statusDiv);
                }
                statusDiv.textContent = 'Testing API Key...';
                statusDiv.style.color = '#ffb300';
                // Run a test call to Groq vision API
                try {
                    const testPayload = {
                        messages: [
                            {
                                role: "user",
                                content: [
                                    { type: "text", text: "Say: API key test successful." }
                                ]
                            }
                        ],
                        model: "meta-llama/llama-4-scout-17b-16e-instruct",
                        max_tokens: 10
                    };
                    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${apiKeyInput.value}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(testPayload)
                    });
                    if (!response.ok) {
                        throw new Error('API Key test failed.');
                    }
                    const data = await response.json();
                    if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
                        statusDiv.textContent = 'API Key is valid! System is good to go.';
                        statusDiv.style.color = '#28a745';
                    } else {
                        statusDiv.textContent = 'API Key test failed. Please check your key.';
                        statusDiv.style.color = '#dc3545';
                    }
                } catch (e) {
                    statusDiv.textContent = 'API Key test failed. Please check your key.';
                    statusDiv.style.color = '#dc3545';
                }
            } else {
                alert('Please enter an API Key.');
            }
        });
    }

    const stepCountInput = document.getElementById('stepCount');
    if (stepCountInput) {
        stepCountInput.addEventListener('change', generateStepTabs);
    }
}

// Generate tabs based on step count
function generateStepTabs(numSteps) {
    // Always get the value from the input if not a valid number
    if (typeof numSteps !== 'number' || isNaN(numSteps) || numSteps < 1) {
        const stepCountInput = document.getElementById('stepCount');
        numSteps = stepCountInput ? parseInt(stepCountInput.value, 10) : 4;
        if (isNaN(numSteps) || numSteps < 1) numSteps = 4; // fallback
    }

    console.log('generateStepTabs called with numSteps:', numSteps); // Debugging log

    const tabsNavEl = document.getElementById('stepTabsNav');
    const tabContentEl = document.getElementById('stepTabContent');
    const stepTabsContainerEl = document.getElementById('stepTabsContainer');

    if (!tabsNavEl || !tabContentEl || !stepTabsContainerEl) {
        console.error('Essential tab container elements not found in the DOM.');
        return;
    }

    // Clear previous tabs and content
    tabsNavEl.innerHTML = '';
    tabContentEl.innerHTML = '';

    if (numSteps <= 0) {
        stepTabsContainerEl.style.display = 'none';
        console.log('No steps to display, hiding tabs container.');
        return;
    }

    stepTabsContainerEl.style.display = 'block'; // Ensure container is visible

    for (let i = 0; i < numSteps; i++) {
        // Create navigation item
        const navItem = document.createElement('li');
        navItem.id = `tabNavItem${i}`;
        navItem.classList.add('tab-nav-item');
        navItem.textContent = `Step ${i + 1}`;
        navItem.setAttribute('role', 'tab');
        navItem.setAttribute('aria-controls', `stepTab${i}`);
        navItem.setAttribute('aria-selected', 'false');
        navItem.setAttribute('data-tab-index', i);
        navItem.addEventListener('click', () => showStepTab(i, numSteps));
        tabsNavEl.appendChild(navItem);

        // Create tab panel
        const panel = document.createElement('div');
        panel.id = `stepTab${i}`;
        panel.classList.add('tab-panel');
        panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('aria-labelledby', `tabNavItem${i}`);
        // Populate panel with necessary HTML structure for each step
        panel.innerHTML = `
            <h4>Step ${i + 1} Analysis</h4>
            <div class="step-image-upload-area">
                <label for="stepImageInput${i}">Upload Image for Step ${i + 1}:</label>
                <input type="file" class="step-image-input" id="stepImageInput${i}" accept="image/*" data-step-index="${i}">
            </div>
            <div class="preview-container" id="previewContainer${i}">
                <img src="#" alt="Preview for Step ${i + 1}" style="display:none; max-width: 100%; height: auto; margin-top: 10px;">
            </div>
            <div class="progress-bar-container-small" id="progressContainerSmall${i}" style="display: none;">
                <div class="progress-bar-small" id="progressBarSmall${i}" style="width: 0%;"></div>
            </div>
            <span class="loading-text-small" id="loadingTextSmall${i}" style="display: none;">Analyzing...</span>
            <div class="step-individual-status" id="stepIndividualStatus${i}"></div>
            <div class="step-analysis" id="stepAnalysis${i}">
                <!-- Analysis results will be populated here -->
            </div>
        `;
        tabContentEl.appendChild(panel);
    }

    if (numSteps > 0) {
        showStepTab(0, numSteps); // Show the first tab by default
    }

    // Attach checkEnableAnalyzeButton to all step image inputs after tabs are generated
    for (let i = 0; i < numSteps; i++) {
        const input = document.getElementById(`stepImageInput${i}`);
        if (input) {
            input.addEventListener('change', checkEnableAnalyzeButton);
        }
    }
    checkEnableAnalyzeButton();
}

function showStepTab(selectedIndex, numSteps) {
    if (typeof numSteps !== 'number' || numSteps <= 0) {
        // console.warn('showStepTab: Invalid numSteps:', numSteps);
        // Potentially hide all tabs or handle error state
        const tabContentEl = document.getElementById('stepTabContent');
        if (tabContentEl) tabContentEl.innerHTML = '<p>No steps available to display.</p>';
        return;
    }

    for (let i = 0; i < numSteps; i++) {
        const navItem = document.getElementById(`tabNavItem${i}`);
        const panel = document.getElementById(`stepTab${i}`);

        if (navItem && panel) {
            if (i === selectedIndex) {
                navItem.classList.add('active');
                navItem.setAttribute('aria-selected', 'true');
                panel.style.display = 'block'; // Crucial for showing the panel
            } else {
                navItem.classList.remove('active');
                navItem.setAttribute('aria-selected', 'false');
                panel.style.display = 'none'; // Crucial for hiding other panels
            }
        } else {
            // console.warn(`showStepTab: Tab nav item or panel not found for index ${i}`);
        }
    }
    // Update Next/Prev button states
    updateStepTabNavControls(selectedIndex, numSteps);
}

function updateStepTabNavControls(currentIndex, numSteps) {
    const prevButton = document.getElementById('prevStepBtn'); // Fixed ID
    const nextButton = document.getElementById('nextStepBtn'); // Fixed ID
    if (prevButton) {
        prevButton.disabled = (currentIndex === 0);
    }
    if (nextButton) {
        nextButton.disabled = (currentIndex >= numSteps - 1);
    }
}

// Enable Analyze button if all step images are uploaded
function checkEnableAnalyzeButton() {
    const numSteps = document.getElementById('stepCount')?.value || 4;
    let allUploaded = true;
    for (let i = 0; i < numSteps; i++) {
        const input = document.getElementById(`stepImageInput${i}`);
        if (!input || !input.files || input.files.length === 0) {
            allUploaded = false;
            break;
        }
    }
    const analyzeBtn = document.getElementById('analyzeApproachBtn');
    if (analyzeBtn) {
        analyzeBtn.disabled = !allUploaded;
    }
}

// Handle bulk upload: assign files to step inputs and show previews
function handleBulkUpload(event) {
    const files = Array.from(event.target.files);
    const numSteps = document.getElementById('stepCount')?.value || 4;
    for (let i = 0; i < numSteps; i++) {
        const file = files[i];
        const input = document.getElementById(`stepImageInput${i}`);
        const previewContainer = document.getElementById(`previewContainer${i}`);
        if (input && file) {
            // Create a new DataTransfer to set the file input value
            const dt = new DataTransfer();
            dt.items.add(file);
            input.files = dt.files;
            // Show preview
            if (previewContainer) {
                previewContainer.querySelector('img').src = URL.createObjectURL(file);
                previewContainer.querySelector('img').style.display = 'block';
            }
        }
    }
    checkEnableAnalyzeButton();
}

// Analyze approach function
async function analyzeApproach() {
    const numSteps = document.getElementById('stepCount')?.value || 4;
    const finalResults = [];

    for (let i = 0; i < numSteps; i++) {
        const input = document.getElementById(`stepImageInput${i}`);
        if (input && input.files && input.files.length > 0) {
            const file = input.files[0];
            const result = await analyzeSingleImage(file, i);
            if (result) {
                finalResults.push(result);
            }
        }
    }

    // Populate final analysis results
    const finalAnalysisList = document.getElementById('finalAnalysisList');
    if (finalAnalysisList) {
        finalAnalysisList.innerHTML = '';
        finalResults.forEach((result, index) => {
            const listItem = document.createElement('li');
            listItem.textContent = `Step ${index + 1}: ${result}`;
            finalAnalysisList.appendChild(listItem);
        });
    }
}

// Analyze a single image and update the corresponding UI elements
async function analyzeSingleImage(file, stepIndex) {
    console.log(`Starting analysis for step ${stepIndex}`); // Debugging log

    const apiKey = localStorage.getItem('groqApiKey');
    if (!apiKey) {
        alert('API Key is missing. Please set your API Key in the settings.');
        return Promise.reject('API Key missing'); // Return a rejected promise
    }

    const progressBar = document.getElementById(`progressBarSmall${stepIndex}`);
    const loadingText = document.getElementById(`loadingTextSmall${stepIndex}`);
    const statusDiv = document.getElementById(`stepIndividualStatus${stepIndex}`);
    const analysisDiv = document.getElementById(`stepAnalysis${stepIndex}`);

    // Reset previous status
    if (statusDiv) statusDiv.innerHTML = '';
    if (analysisDiv) analysisDiv.innerHTML = '';

    // Return a new Promise that resolves with the analysis content
    return new Promise((resolve, reject) => {
        try {
            // Show progress bar
            if (progressBar) {
                progressBar.style.width = '0%';
                if (progressBar.parentElement) progressBar.parentElement.style.display = 'block';
            }
            if (loadingText) loadingText.style.display = 'inline';

            console.log('Sending API request for analysis...'); // Debugging log

            const reader = new FileReader();
            reader.onload = async function(event) {
                try {
                    const base64Image = event.target.result.split(',')[1]; // Extract base64 data
                    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${apiKey}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            messages: [
                                {
                                    role: "user",
                                    content: [
                                        { type: "text", text: `You are a bowling coach. Analyze the provided image, which shows step ${stepIndex + 1} of a bowling approach. Based *only* on the visual details in this image, provide concise, actionable feedback.` },
                                        {
                                            type: "image_url",
                                            image_url: {
                                                url: `data:image/jpeg;base64,${base64Image}`
                                            }
                                        }
                                    ]
                                }
                            ],
                            model: document.getElementById('modelSelect') ? document.getElementById('modelSelect').value : "meta-llama/llama-4-scout-17b-16e-instruct", // Use selected model
                            max_tokens: 150 // Reduced for brevity
                        })
                    });

                    if (!response.ok) {
                        const errorData = await response.text();
                        throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorData}`);
                    }

                    const data = await response.json();
                    console.log('Analysis response:', data); // Debugging log

                    if (statusDiv) statusDiv.innerHTML = 'Analysis complete!';
                    
                    const analysisContent = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content
                        ? data.choices[0].message.content
                        : 'No analysis content found.';

                    if (analysisDiv) {
                        analysisDiv.innerHTML = `
                            <p><strong>Results for Step ${stepIndex + 1}:</strong></p>
                            <p>${analysisContent}</p> 
                        `;
                    }
                    resolve(analysisContent); // Resolve the promise with the content

                } catch (error) {
                    console.error('Error during API call or processing:', error);
                    if (statusDiv) statusDiv.innerHTML = 'Error during analysis. Check console.';
                    if (analysisDiv) analysisDiv.innerHTML = `<p>Error: ${error.message}</p>`;
                    reject(error); // Reject the promise
                } finally {
                    if (loadingText) loadingText.style.display = 'none';
                    if (progressBar && progressBar.parentElement) progressBar.parentElement.style.display = 'none';
                }
            };
            reader.onerror = (error) => {
                console.error('FileReader error:', error);
                if (statusDiv) statusDiv.innerHTML = 'Error reading file.';
                reject(error); // Reject the promise on FileReader error
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Error setting up analysis:', error);
            if (statusDiv) statusDiv.innerHTML = 'Error setting up analysis. Please try again.';
            reject(error); // Reject the promise
        }
    });
}

// Function to test the analysis endpoint
async function testAnalysisEndpoint() {
    const apiKey = document.getElementById('testApiKey')?.value;
    const responseDiv = document.getElementById('testApiResponse');

    if (!apiKey) {
        responseDiv.textContent = 'Please enter an API Key.';
        responseDiv.style.color = 'red';
        return;
    }

    responseDiv.textContent = 'Testing analysis endpoint...';
    responseDiv.style.color = 'black';

    try {
        const testPayload = {
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Test analysis endpoint." }
                    ]
                }
            ],
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            max_tokens: 10
        };

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testPayload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        responseDiv.textContent = `Test successful! Response: ${JSON.stringify(data, null, 2)}`;
        responseDiv.style.color = 'green';
    } catch (error) {
        responseDiv.textContent = `Error: ${error.message}`;
        responseDiv.style.color = 'red';
    }
}

// Add event listener for the test button
document.addEventListener('DOMContentLoaded', () => {
    const testButton = document.getElementById('testAnalysisEndpointBtn');
    if (testButton) {
        testButton.addEventListener('click', testAnalysisEndpoint);
    }
});

// Function to fetch and display tournament tips
function fetchTournamentTips() {
    console.log('Fetching tournament tips');
    const tipsList = document.getElementById('tips-list');

    // Simulate API call to fetch tips
    const tips = [
        'Stay hydrated and focused.',
        'Visualize your shots before bowling.',
        'Warm up properly to avoid injuries.',
        'Analyze lane conditions before starting.',
    ];

    if (tipsList) {
        tipsList.innerHTML = '';
        tips.forEach(tip => {
            const listItem = document.createElement('li');
            listItem.textContent = tip;
            tipsList.appendChild(listItem);
        });
    }
}

// Event listener for performance analysis button
document.addEventListener('DOMContentLoaded', function () {
    const analyzeBtn = document.getElementById('analyze-performance-btn');
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', function () {
            console.log('Analyzing performance...');
            alert('Performance analysis is under development. Stay tuned!');
        });
    }

    // Score Keeping and Statistics for tournement_day.html
    const addScoreBtn = document.getElementById('add-score-btn');
    if (addScoreBtn) {
        addScoreBtn.addEventListener('click', addGameScore);
    }
    // Load existing scores on page load for tournement_day.html
    if (document.getElementById('score-keeping-section')) {
        loadScoresAndStatistics();
    }
});

let gameScores = [];

function addGameScore() {
    const scoreInput = document.getElementById('game-score');
    const score = parseInt(scoreInput.value, 10);

    if (isNaN(score) || score < 0 || score > 300) {
        alert('Please enter a valid score between 0 and 300.');
        return;
    }

    gameScores.push(score);
    localStorage.setItem('gameScores', JSON.stringify(gameScores)); // Save scores
    scoreInput.value = ''; // Clear input

    displayScores();
    updateStatistics();
}

function displayScores() {
    const scoresUl = document.getElementById('scores-ul');
    if (!scoresUl) return;

    scoresUl.innerHTML = ''; // Clear existing scores
    gameScores.forEach((score, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `Game ${index + 1}: ${score}`;
        scoresUl.appendChild(listItem);
    });
}

function updateStatistics() {
    const totalGamesSpan = document.getElementById('total-games');
    const totalPinfallSpan = document.getElementById('total-pinfall');
    const averageScoreSpan = document.getElementById('average-score');
    const highScoreSpan = document.getElementById('high-score');
    const lowScoreSpan = document.getElementById('low-score');

    if (!totalGamesSpan) return; // Elements not present on this page

    const numGames = gameScores.length;
    totalGamesSpan.textContent = numGames;

    if (numGames === 0) {
        totalPinfallSpan.textContent = '0';
        averageScoreSpan.textContent = '0';
        highScoreSpan.textContent = '0';
        lowScoreSpan.textContent = 'N/A';
        return;
    }

    const totalPinfall = gameScores.reduce((sum, score) => sum + score, 0);
    totalPinfallSpan.textContent = totalPinfall;

    const averageScore = totalPinfall / numGames;
    averageScoreSpan.textContent = averageScore.toFixed(2);

    const highScore = Math.max(...gameScores);
    highScoreSpan.textContent = highScore;

    const lowScore = Math.min(...gameScores);
    lowScoreSpan.textContent = lowScore;

    // Placeholder for chart update
    // updateScoreChart(); 
}

function loadScoresAndStatistics() {
    const storedScores = localStorage.getItem('gameScores');
    if (storedScores) {
        gameScores = JSON.parse(storedScores);
        displayScores();
        updateStatistics();
    }
}

// Placeholder for chart rendering
// function updateScoreChart() {
//     const chartsPlaceholder = document.getElementById('charts-placeholder');
//     if(chartsPlaceholder) {
//         chartsPlaceholder.innerHTML = '<p>(Chart rendering will be implemented here)</p>';
//         // Example: You could use a library like Chart.js or draw simple CSS bars
//     }
// }
