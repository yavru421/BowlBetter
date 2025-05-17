// BowlBetter! 1.1 | May 2025
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
    for (let i = 0; i < numSteps; i++) {
        const input = document.getElementById(`stepImageInput${i}`);
        if (input && input.files && input.files.length > 0) {
            const file = input.files[0];
            await analyzeSingleImage(file, i);
        }
    }
}

// Analyze a single image and update the corresponding UI elements
async function analyzeSingleImage(file, stepIndex) {
    const apiKey = localStorage.getItem('groqApiKey');
    if (!apiKey) {
        alert('API Key is missing. Please set your API Key in the settings.');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    const progressBar = document.getElementById(`progressBarSmall${stepIndex}`);
    const loadingText = document.getElementById(`loadingTextSmall${stepIndex}`);
    const statusDiv = document.getElementById(`stepIndividualStatus${stepIndex}`);
    const analysisDiv = document.getElementById(`stepAnalysis${stepIndex}`);

    // Reset previous status
    statusDiv.innerHTML = '';
    analysisDiv.innerHTML = '';

    try {
        // Show progress bar
        progressBar.style.width = '0%';
        progressBar.parentElement.style.display = 'block';
        loadingText.style.display = 'inline';

        const response = await fetch('https://api.example.com/analyze', { // Replace with actual API endpoint
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Analysis response:', data);

        // Update UI with analysis results
        statusDiv.innerHTML = 'Analysis complete!';
        analysisDiv.innerHTML = `
            <p><strong>Results for Step ${stepIndex + 1}:</strong></p>
            <pre>${JSON.stringify(data, null, 2)}</pre>
        `;
    } catch (error) {
        console.error('Error during analysis:', error);
        statusDiv.innerHTML = 'Error during analysis. Please try again.';
    } finally {
        // Hide progress bar
        loadingText.style.display = 'none';
        progressBar.parentElement.style.display = 'none';
    }
}
