const outputs = []; // Array to store generated outputs
let currentPage = 0; // Track current page
const outputsPerPage = 1; // Number of outputs per page
const wordLimit = 500; // Set the word limit to 500
let isEditMode = false; // To toggle between edit mode and read-only mode

// Show the loader and overlay
function showLoader() {
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('loader').style.display = 'block';
}

// Hide the loader and overlay
function hideLoader() {
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('loader').style.display = 'none';
}

document.getElementById('submitBtn').addEventListener('click', async function () {
    const inputText = document.getElementById('inputText').value;
    const keywords = document.getElementById('keywordBox').value.split(',').map(keyword => keyword.trim());

    // Calculate word count
    const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;

    // Check if word count exceeds 500
    if (wordCount > wordLimit) {
        document.getElementById('wordLimitMessage').style.display = 'block'; // Show the message
        return; // Stop further execution if the word count is over 500
    } else {
        document.getElementById('wordLimitMessage').style.display = 'none'; // Hide the message when within limit
    }

    if (!inputText.trim()) {
        showAlert('Please enter some text.', 'danger'); // Show alert instead of alert()
        return;
    }

    showLoader();  // Show loader before processing

    document.getElementById('humanizedText').value = ''; // Clear previous output
    document.getElementById('outputWordCount').innerText = 'Output Word Count: 0';
    document.getElementById('aiGeneratedPercentage').innerText = 'AI-generated content: 0%';
    document.getElementById('humanizedPercentage').innerText = 'Humanized content: 0%';

    try {
        const response = await fetch('/humanize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ inputText })
        });

        if (!response.ok) {
            throw new Error('Failed to humanize text');
        }

        const data = await response.json();

        // Hide loader and display output
        hideLoader();

        // Ensure keywords are retained in the output
        let transformedText = data.transformedText;

        // Add keywords to the output
        keywords.forEach(keyword => {
            const keywordPattern = new RegExp(`\\b${keyword}\\b`, 'i');
        
            if (!transformedText.match(keywordPattern)) {
                const sentences = transformedText.split('. ');
                const randomIndex = Math.floor(Math.random() * sentences.length);
                sentences[randomIndex] += ` ${keyword}`; // Insert in a random sentence
                transformedText = sentences.join('. ');
            }
        });
        

        // Store the output with percentages
        outputs.push({
            transformedText,
            aiGeneratedPercentage: data.aiGeneratedPercentage,
            humanizedPercentage: data.humanizedPercentage
        });
        currentPage = outputs.length - 1; // Set to the last generated output

        // Display the latest output
        displayOutput();

        // Update output word count and percentages
        const outputWordCount = transformedText.trim().split(/\s+/).length;
        document.getElementById('outputWordCount').innerText = `Output Word Count: ${outputWordCount}`;
        document.getElementById('aiGeneratedPercentage').innerText = `AI-generated content: ${data.aiGeneratedPercentage}%`;
        document.getElementById('humanizedPercentage').innerText = `Humanized content: ${data.humanizedPercentage}%`;

        // Show pagination controls
        updatePaginationControls();

    } catch (error) {
        console.error('Error:', error);
        showAlert('Error occurred while humanizing the text. Please try again.', 'danger');
        hideLoader(); // Hide the loader on error
    }
});



// Display the current output based on the current page
function displayOutput() {
    const outputContainer = document.getElementById('humanizedText');
    const currentOutput = outputs[currentPage];

    if (currentOutput) {
        outputContainer.value = currentOutput.transformedText;

        // Update word count for the currently displayed output
        const outputWordCount = currentOutput.transformedText.trim().split(/\s+/).length;
        document.getElementById('outputWordCount').innerText = `Output Word Count: ${outputWordCount}`;
        document.getElementById('aiGeneratedPercentage').innerText = `AI-generated content: ${currentOutput.aiGeneratedPercentage}%`;
        document.getElementById('humanizedPercentage').innerText = `Humanized content: ${currentOutput.humanizedPercentage}%`;

        // Toggle edit mode
        outputContainer.readOnly = !isEditMode;
        document.getElementById('editBtn').style.display = isEditMode ? 'none' : 'inline';
        document.getElementById('updateBtn').style.display = isEditMode ? 'inline' : 'none';
    } else {
        outputContainer.value = 'No outputs generated yet.';
    }
}

// Update pagination controls
function updatePaginationControls() {
    const paginationControls = document.getElementById('paginationControls');
    paginationControls.style.display = 'flex';

    // Disable Previous button if on first page
    document.getElementById('prevPage').disabled = currentPage === 0;

    // Disable Next button if on the last output
    document.getElementById('nextPage').disabled = currentPage >= outputs.length - 1;
}

// Toggle edit mode
document.getElementById('editBtn').addEventListener('click', () => {
    isEditMode = true;
    displayOutput();
});

// Save the edited content
document.getElementById('updateBtn').addEventListener('click', () => {
    const outputContainer = document.getElementById('humanizedText');
    outputs[currentPage].transformedText = outputContainer.value; // Update the stored output

    isEditMode = false;
    displayOutput();
});

// Previous page button
document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 0) {
        currentPage--;
        displayOutput();
        updatePaginationControls();
    }
});

// Next page button
document.getElementById('nextPage').addEventListener('click', () => {
    if (currentPage < outputs.length - 1) {
        currentPage++;
        displayOutput();
        updatePaginationControls();
    }
});

// Add event listener for input changes to update word count dynamically
document.getElementById('inputText').addEventListener('input', function () {
    const inputText = this.value;
    const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
    document.getElementById('wordCount').innerText = `Input Word Count: ${wordCount}`;

    // Check word limit on input change
    if (wordCount > wordLimit) {
        document.getElementById('wordLimitMessage').style.display = 'block';
    } else {
        document.getElementById('wordLimitMessage').style.display = 'none';
    }
});

// Clear button functionality
document.getElementById('clearBtn').addEventListener('click', function () {
    // Clear the input text
    document.getElementById('inputText').value = '';
    document.getElementById('keywordBox').value = '';
    // Clear the output text area
    document.getElementById('humanizedText').value = ''; 

    // Reset word count and percentage displays
    document.getElementById('outputWordCount').innerText = 'Output Word Count: 0';
    document.getElementById('aiGeneratedPercentage').innerText = 'AI-generated content: 0%';
    document.getElementById('humanizedPercentage').innerText = 'Humanized content: 0%';
    document.getElementById('wordCount').innerText = 'Input Word Count: 0'; // Reset input word count

    // Clear stored outputs
    outputs.length = 0; // Clear the outputs array
    currentPage = 0;    // Reset the current page to 0

    // Hide pagination controls
    document.getElementById('paginationControls').style.display = 'none'; 
});

// Copy functionality
document.getElementById('copyBtn').addEventListener('click', function () {
    const humanizedText = document.getElementById('humanizedText');
    humanizedText.select();
    document.execCommand('copy');

    // Show copy message
    const copyMessage = document.getElementById('copyMessage');
    copyMessage.style.display = 'inline'; // Show the message
    copyMessage.classList.remove('hide');
    copyMessage.classList.add('show');

    // Hide the message after 1.5 seconds
    setTimeout(() => {
        copyMessage.style.display = 'none'; // Hide after 1.5 seconds
    }, 1500);
});
