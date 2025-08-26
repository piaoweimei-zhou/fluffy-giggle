// /js/load-component.js

// Function to load HTML components into a specified container
function loadComponent(containerId, filePath) {
    fetch(filePath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`加载失败: ${response.status}`);
            }
            return response.text();
        })
        .then(data => {
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = data;
                // After loading navbar, highlight the current page link
                if (containerId === 'navbar-container') {
                    highlightCurrentPage();
                }
            }
        })
        .catch(error => {
            console.error(`Error loading component for ${containerId}:`, error);
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = '<p>组件加载失败</p>';
            }
        });
}

// Function to highlight the current page's navigation link
function highlightCurrentPage() {
    // Remove trailing slash for consistent comparison, handle root path special
    const currentPagePath = window.location.pathname.replace(/\/$/, '') || '/index.html'; 
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href').replace(/\/$/, '') || '/index.html'; 
        
        // Exact match for most pages
        if (currentPagePath === linkHref) {
            link.classList.add('active');
        } 
        // For sub-paths, e.g., /categories/video-tools/product-a.html should highlight /categories.html and /categories/video-tools/index.html
        // And /categories/video-tools/index.html should highlight /categories.html
        else if (linkHref !== '/' && currentPagePath.startsWith(linkHref + '/')) {
            link.classList.add('active');
        }
    });
}

function loadHeadContent() {
    fetch('https://piaoweimei-zhou.github.io/fluffy-giggle/components/head.html')
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(data, 'text/html');
            const newHeadElements = Array.from(doc.head.children);

            // Append children from the fetched head content to the actual document's head
            newHeadElements.forEach(element => {
                // Special handling for <title> tag
                if (element.tagName.toLowerCase() === 'title') {
                    // Only update the document.title if it's currently generic or not set
                    // This allows individual HTML pages to set their specific titles,
                    // otherwise, fallback to the generic one from components/head.html
                    if (!document.title || document.title.includes("工具百宝箱")) { 
                         document.title = element.textContent;
                    }
                } else {
                    // For other elements (meta, link, etc.), append if a similar one doesn't exist
                    // This check is simplified, relying on browser's handling of duplicate meta/link for most cases,
                    // but can be made more robust if true uniqueness is critical for specific tags.
                    let isDuplicate = false;
                    if (element.tagName.toLowerCase() === 'link' && element.hasAttribute('href')) {
                        isDuplicate = document.head.querySelector(`link[href="${element.getAttribute('href')}"]`);
                    } else if (element.tagName.toLowerCase() === 'meta' && element.hasAttribute('name')) {
                         isDuplicate = document.head.querySelector(`meta[name="${element.getAttribute('name')}"]`);
                    } else if (element.tagName.toLowerCase() === 'meta' && element.hasAttribute('charset')) {
                         isDuplicate = document.head.querySelector('meta[charset]');
                    }
                    
                    if (!isDuplicate) {
                        document.head.appendChild(element.cloneNode(true)); // Append a clone to avoid moving elements from doc.head
                    }
                }
            });
        })
        .catch(error => console.error('Error loading head component:', error));
}

// Call loadHeadContent immediately at script execution time for every page
loadHeadContent(); 