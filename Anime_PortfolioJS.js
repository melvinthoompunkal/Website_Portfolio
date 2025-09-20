document.addEventListener('DOMContentLoaded', () => {
    // DOM Element Selections
    const landingSection = document.getElementById('landing');
    const pathSections = document.querySelectorAll('.path-section');
    const personaCards = document.querySelectorAll('.persona-card');
    const homeBtn = document.getElementById('homeBtn');
    const themeToggleBtn = document.getElementById('themeToggle');
    const navbar = document.getElementById('navbar');
    const subtitle = document.querySelector('.subtitle');
    const floatingElements = document.querySelectorAll('.float-element');
    
    // Developer Path Elements
    const projectHeaders = document.querySelectorAll('.project-header');

    // Curious Path Elements
    const blockchainVisual = document.getElementById('blockchainVisual');
    const addTransactionBtn = document.getElementById('addTransaction');
    const transactionInput = document.getElementById('transactionInput');
    const stockDisplay = document.getElementById('stockDisplay');
    const trackStockBtn = document.getElementById('trackStock');
    const stockSymbolInput = document.getElementById('stockSymbol');
    const chatMessages = document.getElementById('chatMessages');
    const sendMessageBtn = document.getElementById('sendMessage');
    const chatInput = document.getElementById('chatInput');

    // State Variables
    let currentPath = 'landing';
    let isTransitioning = false;
    let currentTheme = 'light';
    let konamiCode = [];
    const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];

    // --- Core Functions ---

    // Navbar Scroll Animation
    const handleNavbarScroll = () => {
        const scrolled = window.scrollY > 50;
        navbar.classList.toggle('scrolled', scrolled);
    };

    // Dark Mode Toggle
    const toggleTheme = () => {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', currentTheme);
        
        // Animate theme toggle icon
        const icon = themeToggleBtn.querySelector('i');
        anime({
            targets: icon,
            rotate: 360,
            duration: 500,
            easing: 'easeInOutQuad'
        });
        
        // Update icon
        icon.className = currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        
        // Save theme preference
        localStorage.setItem('theme', currentTheme);
    };

    // Typing Effect
    // Typing Effect
const typeWriter = (element, text, speed = 100, onComplete = null) => {
    let i = 0;
    element.textContent = ''; // Reset the content before typing
    
    const type = () => {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        } else {
            if (onComplete) onComplete();
        }
    };
    
    type();
};

    
// Erase and Type Animation
const eraseAndType = (element, newText, speed = 100) => {
    const keywordSpan = element.querySelector('.keyword');
    const originalKeyword = keywordSpan.textContent;
    let i = originalKeyword.length;

    const erase = () => {
        if (i >= 0) {
            keywordSpan.textContent = originalKeyword.substring(0, i);
            i--;
            setTimeout(erase, speed / 2);
        } else {
            // Start typing the new text
            typeWriter(keywordSpan, newText, speed);
        }
    };

    erase();
};
    // Rotating Keywords for Subtitle
    // Rotating Keywords for Subtitle
    // Rotating Keywords for Subtitle
const rotateKeywords = () => {
    const keywords = ['SWE', 'ML', 'Data Analysis', 'Blockchain', 'Full Stack'];
    let currentIndex = 0;
    
    const rotate = () => {
        const newKeyword = keywords[currentIndex];
        
        // This is where we call the new eraseAndType function
        eraseAndType(subtitle, newKeyword);
        
        currentIndex = (currentIndex + 1) % keywords.length;
    };
    
    // Start rotation after initial typing
    setInterval(rotate, 3000);
};
        
       

    // Parallax Background Effect
    const handleMouseMove = (e) => {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        
        floatingElements.forEach((element, index) => {
            const speed = (index + 1) * 0.5;
            const x = (mouseX - 0.5) * speed * 20;
            const y = (mouseY - 0.5) * speed * 20;
            
            anime({
                targets: element,
                translateX: x,
                translateY: y,
                duration: 1000,
                easing: 'easeOutQuad'
            });
        });
    };

    // Scroll Reveal Animation
    const initScrollReveal = () => {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, observerOptions);

        // Add scroll reveal classes to elements
        document.querySelectorAll('.highlight-item, .project-card, .tech-item, .fact-item').forEach(el => {
            el.classList.add('scroll-reveal');
            observer.observe(el);
        });

        document.querySelectorAll('.demo-item').forEach((el, index) => {
            el.classList.add(index % 2 === 0 ? 'scroll-reveal-left' : 'scroll-reveal-right');
            observer.observe(el);
        });
    };

    // Konami Code Easter Egg
    const handleKonamiCode = (e) => {
        konamiCode.push(e.code);
        if (konamiCode.length > konamiSequence.length) {
            konamiCode.shift();
        }
        
        if (konamiCode.join(',') === konamiSequence.join(',')) {
            activateRetroTheme();
            konamiCode = [];
        }
    };

    const activateRetroTheme = () => {
        document.documentElement.setAttribute('data-theme', 'retro');
        currentTheme = 'retro';
        
        // Add retro sound effect (visual feedback)
        anime({
            targets: 'body',
            backgroundColor: ['#000000', '#00ff00', '#000000'],
            duration: 200,
            easing: 'easeInOutQuad'
        });
        
        // Show retro notification
        const notification = document.createElement('div');
        notification.innerHTML = '🎮 RETRO MODE ACTIVATED! 🎮';
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #00ff00;
            color: #000000;
            padding: 1rem 2rem;
            border-radius: 10px;
            font-family: 'Courier New', monospace;
            font-weight: bold;
            z-index: 10000;
            animation: retroGlow 0.5s infinite alternate;
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    };

    // Enhanced Chat Simulator with Bot Responses
    const botResponses = [
        "That's interesting! Tell me more.",
        "I see what you mean!",
        "Fascinating perspective!",
        "How did you come to that conclusion?",
        "That reminds me of something similar...",
        "Great point!",
        "I hadn't thought of it that way.",
        "That's a valid concern.",
        "Interesting approach!",
        "I agree with that sentiment."
    ];

    const addBotResponse = () => {
        const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
        const botMessage = document.createElement('div');
        botMessage.className = 'message user2';
        botMessage.innerHTML = `<span class="username">Bot:</span><span class="text">${randomResponse}</span>`;
        
        chatMessages.appendChild(botMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        anime({
            targets: botMessage,
            opacity: [0, 1],
            translateX: [-50, 0],
            duration: 500,
            easing: 'easeOutSine',
        });
    };

    // Function to show a specific path
    const showPath = (pathId) => {
        if (isTransitioning) return;
        isTransitioning = true;
        
        // Hide all paths with wipe transition
        const currentActive = document.querySelector('.path-section.active');
        if (currentActive) {
            currentActive.classList.add('wipe-transition', 'wipe-active');
            
            setTimeout(() => {
                pathSections.forEach(section => {
                    section.classList.remove('active', 'wipe-transition', 'wipe-active');
                });
                
                // Show the new path with wipe transition
                const newPath = document.getElementById(pathId);
                if (newPath) {
                    newPath.classList.add('active', 'wipe-transition');
                    newPath.style.opacity = '1';
                    
                    // Trigger wipe effect
                    setTimeout(() => {
                        newPath.classList.add('wipe-active');
                    }, 50);
                    
                    setTimeout(() => {
                        newPath.classList.remove('wipe-transition', 'wipe-active');
                        isTransitioning = false;
                        // Trigger specific path animations
                        if (pathId === 'recruiter-path') animateRecruiterPath();
                        else if (pathId === 'developer-path') animateDeveloperPath();
                        else if (pathId === 'curious-path') animateCuriousPath();
                    }, 800);
                }
            }, 400);
        } else {
            // First time showing a path
            const newPath = document.getElementById(pathId);
            if (newPath) {
                newPath.classList.add('active');
                anime({
                    targets: newPath,
                    opacity: [0, 1],
                    translateY: [20, 0],
                    duration: 500,
                    easing: 'easeOutQuad',
                    complete: () => {
                        isTransitioning = false;
                        // Trigger specific path animations
                        if (pathId === 'recruiter-path') animateRecruiterPath();
                        else if (pathId === 'developer-path') animateDeveloperPath();
                        else if (pathId === 'curious-path') animateCuriousPath();
                    }
                });
            }
        }
    };
    
    // Function to handle path changes from persona cards
    const selectPersona = (persona) => {
        let pathId = '';
        if (persona === 'recruiter') pathId = 'recruiter-path';
        else if (persona === 'developer') pathId = 'developer-path';
        else if (persona === 'curious') pathId = 'curious-path';

        // Animate out the landing page content
        anime({
            targets: '.hero-content > *',
            opacity: 0,
            translateY: -30,
            duration: 600,
            easing: 'easeInQuad',
            delay: anime.stagger(100),
            complete: () => {
                landingSection.style.display = 'none';
                showPath(pathId);
            }
        });

        homeBtn.classList.remove('active');
        currentPath = pathId;
    };

    // --- Landing Page Animations ---

    const animateLandingPage = () => {
        anime.timeline({
            easing: 'easeOutExpo',
            duration: 1000,
            delay: 500,
        })
        .add({
            targets: '.main-title',
            opacity: [0, 1],
            translateY: [30, 0],
        })
        .add({
            targets: '.subtitle',
            opacity: [0, 1],
            translateY: [30, 0],
            complete: () => {
                // Now, we inject the initial keyword with a dedicated span
                subtitle.innerHTML = `Choose Your Adventure • <span class="keyword">SWE</span><span class="typing-cursor"></span>`;
                // Start the rotation directly after the initial text is in place
                rotateKeywords();
            }
        }, '-=800')
        .add({
            targets: '.description',
            opacity: [0, 1],
            translateY: [30, 0],
        }, '-=700')
        .add({
            targets: '.persona-card',
            opacity: [0, 1],
            translateY: [50, 0],
            rotateX: [15, 0],
            delay: anime.stagger(150),
            complete: () => {
                // Add entered class for hover effects
                personaCards.forEach(card => card.classList.add('entered'));
            }
        }, '-=600');
    };

    // --- Path Specific Animations ---

    const animateRecruiterPath = () => {
        anime.timeline({
            easing: 'easeOutQuad',
            duration: 800,
        })
        .add({
            targets: '#recruiter-path .path-hero > *',
            opacity: [0, 1],
            translateY: [20, 0],
            delay: anime.stagger(100),
        })
        .add({
            targets: '#recruiter-path .highlight-item',
            opacity: [0, 1],
            scale: [0.9, 1],
            delay: anime.stagger(100),
        }, '-=500')
        .add({
            targets: '#recruiter-path .project-card',
            opacity: [0, 1],
            translateY: [20, 0],
            delay: anime.stagger(100),
        }, '-=400');
    };

    const animateDeveloperPath = () => {
        anime({
            targets: '#developer-path > .container > *',
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 800,
            easing: 'easeOutQuad',
            delay: anime.stagger(100),
        });
    };

    const animateCuriousPath = () => {
        anime({
            targets: '#curious-path .demo-item',
            opacity: [0, 1],
            scale: [0.95, 1],
            duration: 800,
            easing: 'easeOutQuad',
            delay: anime.stagger(150),
        });
    };

    // --- Event Listeners ---

    // Persona card clicks
    personaCards.forEach(card => {
        card.addEventListener('click', () => {
            const persona = card.dataset.persona;
            selectPersona(persona);
        });
    });

    // Home button click
    homeBtn.addEventListener('click', () => {
        if (isTransitioning) return;
        isTransitioning = true;

        anime({
            targets: '.path-section.active',
            opacity: [1, 0],
            translateY: [0, 20],
            duration: 500,
            easing: 'easeOutQuad',
            complete: () => {
                pathSections.forEach(section => section.classList.remove('active'));
                landingSection.style.display = 'block';
                // Animate landing page back in
                anime({
                    targets: '.hero-content > *',
                    opacity: [0, 1],
                    translateY: [-30, 0],
                    duration: 600,
                    easing: 'easeOutQuad',
                    delay: anime.stagger(100, {direction: 'reverse'}),
                    complete: () => {
                        isTransitioning = false;
                        homeBtn.classList.add('active');
                        currentPath = 'landing';
                    }
                });
            }
        });
    });


    
    // Developer Path - Collapsible Project Sections
    projectHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            const toggleIcon = header.querySelector('.toggle-icon');
            
            // Toggle the 'active' class on the header
            header.classList.toggle('active');
            
            if (content.classList.contains('open')) {
                // Close the section
                anime({
                    targets: content,
                    maxHeight: '0px',
                    paddingBottom: '0rem',
                    easing: 'easeOutSine',
                    duration: 500,
                });
                content.classList.remove('open');
            } else {
                // Open the section
                content.classList.add('open');
                anime({
                    targets: content,
                    maxHeight: '1000px', // A large enough value to accommodate content
                    paddingBottom: '1.5rem',
                    easing: 'easeOutSine',
                    duration: 500,
                });
            }
        });
    });

    // Curious Path - Interactive Demos
    // Blockchain Simulator
    let blockCount = 1;
    const maxBlocks = 8; // Limit to prevent layout issues
    
    addTransactionBtn.addEventListener('click', () => {
        // Check if we've reached the maximum number of blocks
        const existingBlocks = blockchainVisual.querySelectorAll('.block:not(.genesis)').length;
        if (existingBlocks >= maxBlocks) {
            alert(`Maximum ${maxBlocks} blocks reached! Click "Reset Blockchain" to start over.`);
            return;
        }
        
        const transaction = transactionInput.value || `Transaction ${blockCount}`;
        const newBlock = document.createElement('div');
        newBlock.className = 'block';
        newBlock.innerHTML = `<h4>Block #${blockCount}</h4><p>${transaction}</p>`;
        
        blockchainVisual.appendChild(newBlock);
        transactionInput.value = '';
        blockCount++;
        
        anime({
            targets: newBlock,
            translateX: [50, 0],
            opacity: [0, 1],
            duration: 800,
            easing: 'easeOutExpo',
        });
    });

    // Add reset functionality
    const resetBlockchain = () => {
        const blocks = blockchainVisual.querySelectorAll('.block:not(.genesis)');
        blocks.forEach(block => block.remove());
        blockCount = 1;
        transactionInput.value = '';
    };

    // Add reset button if it doesn't exist
    const demoControls = document.querySelector('.blockchain-demo .demo-controls');
    if (demoControls && !demoControls.querySelector('.reset-btn')) {
        const resetBtn = document.createElement('button');
        resetBtn.textContent = 'Reset Blockchain';
        resetBtn.className = 'reset-btn';
        resetBtn.addEventListener('click', resetBlockchain);
        demoControls.appendChild(resetBtn);
    }

    // Stock Tracker Mini
    const stockData = {
        'AAPL': { name: 'Apple Inc.', price: 185.50, change: 1.25, isPositive: true },
        'GOOGL': { name: 'Alphabet Inc.', price: 135.20, change: -0.78, isPositive: false },
        'TSLA': { name: 'Tesla Inc.', price: 235.10, change: 3.45, isPositive: true },
    };

     trackStockBtn.addEventListener('click', async () => {
    const symbol = stockSymbolInput.value.toUpperCase();
    const stockCard = document.querySelector('.stock-card');
    const stockName = document.getElementById('stockName');
    const stockPrice = document.getElementById('stockPrice');
    const stockChange = document.getElementById('stockChange');

    // Show loading state
    const originalText = trackStockBtn.textContent;
    trackStockBtn.textContent = 'Loading...';
    trackStockBtn.disabled = true;

    try {
        // Try Yahoo Finance API first
        const response = await fetch(
            `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`,
            {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            }
        );
        
        if (!response.ok) {
            throw new Error('API request failed');
        }
        
        const result = await response.json();
        const quote = result.quoteResponse?.result?.[0];

        if (quote && quote.regularMarketPrice) {
            const price = quote.regularMarketPrice;
            const change = quote.regularMarketChangePercent;

            stockName.textContent = quote.longName || quote.shortName || symbol;
            stockPrice.textContent = `$${price.toFixed(2)}`;
            stockChange.textContent = `${(change > 0 ? '+' : '')}${change.toFixed(2)}%`;
            stockChange.className = `stock-change ${change >= 0 ? 'positive' : 'negative'}`;

            anime({
                targets: stockCard,
                scale: [0.9, 1],
                opacity: [0, 1],
                duration: 600,
                easing: 'easeOutQuad'
            });
        } else {
            // Fallback to mock data for demo purposes
            showMockStockData(symbol);
        }
    } catch (error) {
        console.error('Yahoo Finance API error:', error);
        // Fallback to mock data for demo purposes
        showMockStockData(symbol);
    } finally {
        // Reset button state
        trackStockBtn.textContent = originalText;
        trackStockBtn.disabled = false;
    }
});

// Mock data function for demo purposes
const showMockStockData = (symbol) => {
    const stockCard = document.querySelector('.stock-card');
    const stockName = document.getElementById('stockName');
    const stockPrice = document.getElementById('stockPrice');
    const stockChange = document.getElementById('stockChange');

    // Mock data for common stocks
    const mockData = {
        'AAPL': { name: 'Apple Inc.', price: 185.50, change: 1.25 },
        'GOOGL': { name: 'Alphabet Inc.', price: 135.20, change: -0.78 },
        'TSLA': { name: 'Tesla Inc.', price: 235.10, change: 3.45 },
        'MSFT': { name: 'Microsoft Corporation', price: 378.85, change: 2.15 },
        'AMZN': { name: 'Amazon.com Inc.', price: 155.30, change: -1.20 },
        'META': { name: 'Meta Platforms Inc.', price: 485.75, change: 4.30 },
        'NVDA': { name: 'NVIDIA Corporation', price: 875.20, change: 8.50 },
        'NFLX': { name: 'Netflix Inc.', price: 485.15, change: -2.10 }
    };

    const data = mockData[symbol] || {
        name: `${symbol} Corporation`,
        price: (Math.random() * 500 + 50).toFixed(2),
        change: (Math.random() * 10 - 5).toFixed(2)
    };

    stockName.textContent = data.name;
    stockPrice.textContent = `$${data.price}`;
    stockChange.textContent = `${(data.change >= 0 ? '+' : '')}${data.change}%`;
    stockChange.className = `stock-change ${data.change >= 0 ? 'positive' : 'negative'}`;

    // Add a note that this is demo data
    if (!mockData[symbol]) {
        stockName.textContent += ' (Demo Data)';
    }

    anime({
        targets: stockCard,
        scale: [0.9, 1],
        opacity: [0, 1],
        duration: 600,
        easing: 'easeOutQuad'
    });
};


    // Chat Simulator
    sendMessageBtn.addEventListener('click', () => {
        const messageText = chatInput.value.trim();
        if (messageText) {
            const newMessage = document.createElement('div');
            newMessage.className = 'message user1';
            newMessage.innerHTML = `<span class="username">User:</span><span class="text">${messageText}</span>`;
            chatMessages.appendChild(newMessage);
            chatInput.value = '';
            
            chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll to bottom
            
            anime({
                targets: newMessage,
                opacity: [0, 1],
                translateX: [50, 0],
                duration: 500,
                easing: 'easeOutSine',
            });
            
            // Add bot response after a delay
            setTimeout(addBotResponse, 1000 + Math.random() * 2000);
        }
    });

    // Allow Enter key to send messages
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessageBtn.click();
        }
    });

    // --- Event Listeners ---
    
    // Navbar scroll animation
    window.addEventListener('scroll', handleNavbarScroll);
    
    // Dark mode toggle
    themeToggleBtn.addEventListener('click', toggleTheme);
    
    // Parallax background effect
    document.addEventListener('mousemove', handleMouseMove);
    
    // Konami Code Easter Egg
    document.addEventListener('keydown', handleKonamiCode);
    
    // Initialize scroll reveal
    initScrollReveal();
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme !== 'light') {
        currentTheme = savedTheme;
        document.documentElement.setAttribute('data-theme', currentTheme);
        const icon = themeToggleBtn.querySelector('i');
        icon.className = currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }
    
    // Copy code function
    window.copyCode = function(button) {
        const codeBlock = button.closest('.code-demo').querySelector('code');
        const text = codeBlock.textContent;
        
        navigator.clipboard.writeText(text).then(() => {
            button.classList.add('copied');
            button.innerHTML = '<i class="fas fa-check"></i>';
            
            setTimeout(() => {
                button.classList.remove('copied');
                button.innerHTML = '<i class="fas fa-copy"></i>';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy code: ', err);
        });
    };

    // Initial page load animation
    animateLandingPage();
});