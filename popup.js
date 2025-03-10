document.addEventListener('DOMContentLoaded', () => {
    const switchElement = document.getElementById('invertSwitch');
    
    // Check current state when popup opens
    chrome.tabs.query({active: true, currentWindow: true}, async (tabs) => {
        if (tabs[0]?.id) {
            try {
                // Try to get current state from the page
                chrome.tabs.sendMessage(
                    tabs[0].id,
                    { action: 'getState' },
                    (response) => {
                        if (!chrome.runtime.lastError && response?.isInverted !== undefined) {
                            // Set switch position based on current state
                            switchElement.checked = response.isInverted;
                        }
                    }
                );
            } catch (error) {
                console.error('Error getting state:', error);
            }
        }
    });
    
    switchElement.addEventListener('change', async () => {
        try {
            // Get current tab
            const [tab] = await chrome.tabs.query({
                active: true,
                currentWindow: true
            });

            if (!tab?.id) {
                throw new Error('No active tab found');
            }

            // Execute content script directly
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['content.js']
            });

            // Send toggle message
            chrome.tabs.sendMessage(
                tab.id,
                { action: 'toggle' },
                (response) => {
                    if (chrome.runtime.lastError) {
                        console.error('Runtime error:', chrome.runtime.lastError);
                        // Reset switch if there was an error
                        switchElement.checked = !switchElement.checked;
                        return;
                    }
                    
                    if (response?.success) {
                        // Set switch to match the actual state
                        switchElement.checked = response.isInverted;
                    }
                }
            );
        } catch (error) {
            console.error('Error:', error);
            // Reset switch if there was an error
            switchElement.checked = !switchElement.checked;
        }
    });
});