let isInverted = false;

// Function to get domain from URL
function getDomain(url) {
    return new URL(url).hostname;
}

// Function to save state
function saveState() {
    const domain = getDomain(window.location.href);
    try {
        chrome.storage.local.set({
            [domain]: isInverted
        });
    } catch (error) {
        console.warn('Could not save state:', error);
    }
}

// Function to load state
function loadState() {
    const domain = getDomain(window.location.href);
    try {
        chrome.storage.local.get(domain, (result) => {
            if (result[domain]) {
                isInverted = result[domain];
                applyInversion();
            }
        });
    } catch (error) {
        console.warn('Could not load state:', error);
    }
}

function applyInversion() {
    try {
        let styleElement = document.getElementById('invert-styles');
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = 'invert-styles';
            document.head.appendChild(styleElement);
        }

        styleElement.textContent = isInverted ? `
            :root {
                background-color: #000 !important;
                filter: invert(90%) hue-rotate(180deg) brightness(1.1) !important;
                -webkit-filter: invert(90%) hue-rotate(180deg) brightness(1.1) !important;
            }
            
            body {
                background-color: #000000 !important;
            }
            
            /* Invert images and media */
            img,
            picture,
            video,
            canvas,
            svg,
            [role="img"],
            [class*="image"],
            [class*="photo"],
            [class*="picture"],
            [style*="background-image"],
            i[class*="icon"],
            span[class*="icon"],
            [class*="logo"] {
                filter: invert(100%) hue-rotate(180deg) !important;
                -webkit-filter: invert(100%) hue-rotate(180deg) !important;
            }
            
            /* Enhanced white text handling */
            [style*="color: white"],
            [style*="color: #fff"],
            [style*="color:#fff"],
            [style*="color:rgb(255, 255, 255)"],
            [style*="color:#ffffff"],
            [style*="color:rgb(254, 254, 254)"],
            [style*="color: rgb(255, 255, 255)"],
            [style*="color:rgb(255, 255, 255)"],
            [style*="color: rgba(255, 255, 255"],
            [style*="color:rgba(255, 255, 255"] {
                color:rgb(255, 255, 255) !important;
            }
            
            /* General text enhancement for better visibility */
            p, h1, h2, h3, h4, h5, h6, span, div {
                text-shadow: 0 0 1px rgb(255, 255, 255);
            }
            
            /* Soften dark backgrounds */
            [style*="background-color: black"],
            [style*="background-color: #000"],
            [style*="background-color:#000"],
            [style*="background: black"],
            [style*="background: #000"],
            [style*="background:#000"] {
                background-color:#000000 !important;
            }
        ` : '';
        
        saveState();
        return true;
    } catch (error) {
        console.error('Inversion error:', error);
        return false;
    }
}

// Initialize message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggle') {
        isInverted = !isInverted;
        const success = applyInversion();
        sendResponse({ success, isInverted });
    } else if (request.action === 'getState') {
        sendResponse({ isInverted });
    }
    return true;
});

// Load state and apply on page load
document.addEventListener('DOMContentLoaded', loadState);

// Handle dynamic content
const observer = new MutationObserver(() => {
    if (isInverted) {
        applyInversion();
    }
});

observer.observe(document.documentElement, {
    childList: true,
    subtree: true
});