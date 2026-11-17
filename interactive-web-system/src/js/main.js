document.addEventListener('DOMContentLoaded', () => {
    // remove any leftover modal overlays
    document.querySelectorAll('.modal-overlay').forEach(el => el.remove());

    // defensive cleanup
    document.querySelectorAll('body > *').forEach(el => {
        try {
            const style = getComputedStyle(el);
            if (style.position === 'fixed') {
                const r = el.getBoundingClientRect();
                if (r.width >= window.innerWidth - 2 && r.height >= window.innerHeight - 2) {
                    if (!el.classList.contains('flowers-container') && !el.classList.contains('hearts-container') && el.tagName.toLowerCase() !== 'main') {
                        el.remove();
                    }
                }
            }
        } catch (e) { /* ignore */ }
    });

    // --- New Panel Logic ---
    const panels = document.querySelectorAll('.panel');
    const btnYes = document.getElementById('btn-yes');
    const btnNo = document.getElementById('btn-no');
    const btnGo = document.getElementById('btn-go');
    const btnRetry = document.getElementById('btn-retry');
    const btnShowLetter = document.getElementById('btn-show-letter');
    const btnShowMusic = document.getElementById('btn-show-music');
    const btnShowFlower = document.getElementById('btn-show-flower');
    const btnMusicBack = document.getElementById('btn-music-back');
    const btnFlowerBack = document.getElementById('btn-flower-back');

    let backgroundInitialized = false;

    /**
     * Hides all panels and shows the one with the specified ID.
     * @param {string} panelId - The ID of the panel to show (e.g., 'panel-gifts')
     */
    function showPanel(panelId) {
        panels.forEach(panel => {
            panel.classList.remove('active');
        });
        const activePanel = document.getElementById(panelId);
        if (activePanel) {
            activePanel.classList.add('active');
        }
    }

    // Wire up panel buttons
    btnYes.addEventListener('click', () => showPanel('panel-yes'));
    btnNo.addEventListener('click', () => showPanel('panel-no'));
    btnRetry.addEventListener('click', () => showPanel('panel-initial'));
    btnShowMusic.addEventListener('click', () => showPanel('panel-music'));
    btnMusicBack.addEventListener('click', () => showPanel('panel-gifts'));
    btnShowFlower.addEventListener('click', () => showPanel('panel-flower'));
    btnFlowerBack.addEventListener('click', () => showPanel('panel-gifts'));

    // "Let's Go" button initializes all background effects
    btnGo.addEventListener('click', () => {
        showPanel('panel-gifts');
        
        // Only initialize background elements once
        if (!backgroundInitialized) {
            // Initialize background effects
            initFlowerField({ count: 18 });
            initFloatingHearts({ count: 12 });
            initializeMusicPlayer(); // Sets up the controls in #panel-music
            
            // Make them visible (styles in CSS will fade them in)
            const flowerContainer = document.querySelector('.flowers-container');
            if (flowerContainer) flowerContainer.classList.add('visible');
            
            const heartContainer = document.querySelector('.hearts-container');
            if (heartContainer) heartContainer.classList.add('visible');

            backgroundInitialized = true;
        }
    });

    // "Letter" button opens the modal
    btnShowLetter.addEventListener('click', () => {
        // love letter content (from original file)
        const love = {
            from: 'R. — your secret admirer',
            to: 'My Dearest',
            date: new Date().toLocaleDateString(),
            subject: 'To the one who holds my heart',
            body: `My dearest,

Since the day our paths crossed, my world has been softer, richer, and quietly illuminated by you. You are the reason for so many of my small, unexpected joys. I find myself thinking of you in every quiet moment and in the space between heartbeats.

For a long time, I've been keeping a precious secret close: the feeling I have for you has grown beyond friendship into a profound and honest admiration. You are the poetry I didn't know I was missing—a constant, sweet rhythm in my life.

I needed you to know the depth of the place you hold in my heart.

Meet me at the place you always want. I'll bring the tea, hot and perfect, and all the courage I can muster. All I ask is that you bring that laugh I adore.

Forever, always,
r.`,
            signature: 'r.', 
            accent: '#b5526a'
        };

        // Open the modal
        try {
            // NOTE: Assumes modal.js is in the same directory (./modal.js)
            import('./modal.js').then(mod => {
                mod.createLetterModal(love);
            }).catch(e => {
                console.error('Failed to load modal', e);
            });
        } catch (e) {
            console.error('Failed to load modal', e);
        }
    });


// Music Player Initialization with Lyric Sync
function initializeMusicPlayer() {
    const audio = document.getElementById('backgroundMusic');
    const btn = document.getElementById('musicControl');
    const iconPlay = document.getElementById('icon-play');
    const iconPause = document.getElementById('icon-pause');
    const btnText = btn ? btn.querySelector('.music-btn-text') : null;
    const lyricsContainer = document.getElementById('lyric-ticker'); 

    let isPlaying = false;
    let lyricIntervalId = null; 

    if (!audio || !btn || !lyricsContainer) return;

    // --- Lyric Data (Mahal - Using Final Provided Timestamps) ---
    const LYRICS = [
        { time: 15.00, text: "Mahal," },
        { time: 17.00, text: "Pangako ko sa 'yo" },         
        { time: 21.00, text: "Ang iyong ngiti'y mananatili" },    
        { time: 27.00, text: "At kung sakaling malumbay" },       
        { time: 35.00, text: "Sa 'kin ay ibigay ang kalungkutan" },
        { time: 42.00, text: "Pasensiyahan mo na" },
        { time: 45.00, text: "Kung araw ma'y 'di maialay" },
        { time: 50.00, text: "Pati ang buwan, 'di masungkit" },
        { time: 54.00, text: "Bituin ay mapaparam" },
        { time: 59.00, text: "Ngunit pag-ibig ko sa 'yo ay tunay" },
        { time: 65.00, text: "Araw-araw, lagi-lagi kitang pagsisilbihan" },
        { time: 75.00, text: "'Wag ka sanang mag-alinlangan" },    
        { time: 81.00, text: "Magtiwala ka" },
        { time: 84.00, text: "Pati buhay ko" },     
        { time: 86.00, text: "Sa 'yo'y ibibigay" },                 
        { time: 92.00, text: "Mahal" },
        { time: 94.00, text: "Hanggang sa dulo ng buhay" },
        { time: 99.00, text: "Ako pa rin ang 'yong kaagapay" },   
        { time: 106.00, text:"Kahit humina man ang 'yong pandinig" }, 
        { time: 113.00, text: "Gabi-gabi pa rin kitang kakantahan" },
        { time: 120.00, text: "Pasensiyahan mo na" }, 
        { time: 121.00, text: "Kung araw ma'y 'di maialay" }, 
        { time: 127.00, text: "Pati ang buwan, 'di masungkit" }, 
        { time: 131.00, text: "Bituin ay mapaparam" }, 
        { time: 137.00, text: "Ngunit pag-ibig ko sa 'yo ay tunay" }, 
        { time: 143.00, text: "Araw-araw, lagi-lagi kitang pagsisilbihan" }, 
        { time: 152.00, text: "'Wag ka sanang mag-alinlangan" }, 
        { time: 159.00, text: "Magtiwala ka" }, 
        { time: 161.00, text: "Pati buhay ko" },
        { time: 163.00, text: "Sa 'yo'y ibibigay" },
        { time: 168.00, text: "Mahal" },
       
    ];
    
    let currentLyricIndex = 0;
    let nextLyricTime = LYRICS[0].time;

    // --- End Lyric Data ---

    function updateIcon(playing) {
        if (playing) {
            iconPlay.style.display = 'none';
            iconPause.style.display = 'block';
            btn.setAttribute('aria-label', 'Pause background music');
            if (btnText) btnText.textContent = 'Pause Music';
        } else {
            iconPlay.style.display = 'block';
            iconPause.style.display = 'none';
            btn.setAttribute('aria-label', 'Play background music');
            if (btnText) btnText.textContent = 'Play Music';
        }
    }

    function createFloatingLyric(container, text, durationSeconds) {
        const lyricElement = document.createElement('div');
        lyricElement.className = 'rolling-lyric'; 
        lyricElement.textContent = text;
        
        const ANIMATION_DURATION = 15; 
        
        lyricElement.style.animation = `lyric-roll ${ANIMATION_DURATION}s linear forwards`; 
        
        container.appendChild(lyricElement);

        setTimeout(() => {
            lyricElement.remove();
        }, ANIMATION_DURATION * 1000 + 100); 
    }
    
    function checkLyricTime() {
        const currentTime = audio.currentTime;

        if (currentTime >= nextLyricTime) {
            if (currentLyricIndex >= LYRICS.length) {
                if (audio.loop && currentTime < 2) {
                    currentLyricIndex = 0;
                    nextLyricTime = LYRICS[0].time;
                    audio.currentTime = 0; 
                } else if (!audio.loop && audio.paused) {
                    clearInterval(lyricIntervalId); 
                    lyricIntervalId = null;
                }
                return; 
            }

            const lyric = LYRICS[currentLyricIndex];
            
            const timeOfNextLyric = currentLyricIndex + 1 < LYRICS.length 
                                   ? LYRICS[currentLyricIndex + 1].time 
                                   : lyric.time + 4; 
            
            let lyricDuration = Math.max(2.0, timeOfNextLyric - lyric.time - 0.1);
            
            createFloatingLyric(lyricsContainer, lyric.text, lyricDuration); 
            
            currentLyricIndex++;
            nextLyricTime = timeOfNextLyric;
        }
    }

    btn.addEventListener('click', () => {
        if (isPlaying) {
            audio.pause();
            isPlaying = false;
        } else {
            isPlaying = true;
            updateIcon(isPlaying);

            audio.play().then(() => {
                if (lyricIntervalId === null) {
                    if (currentLyricIndex >= LYRICS.length) {
                        currentLyricIndex = 0;
                        nextLyricTime = LYRICS[0].time;
                        audio.currentTime = Math.max(0, nextLyricTime - 1.0); 
                    }
                    lyricIntervalId = setInterval(checkLyricTime, 100);
                }
            }).catch(e => {
                console.error("Audio playback failed:", e);
                isPlaying = false; 
                updateIcon(isPlaying);
            });
        }
    });

    audio.addEventListener('pause', () => {
        isPlaying = false;
        clearInterval(lyricIntervalId);
        lyricIntervalId = null;
        updateIcon(isPlaying);
    });
    audio.addEventListener('play', () => {
        isPlaying = true;
         if (lyricIntervalId === null) {
            lyricIntervalId = setInterval(checkLyricTime, 100);
         }
        updateIcon(isPlaying);
    });

    updateIcon(isPlaying);
}


/**
 * Create a field of animated, blooming flowers in the page background.
 */
function initFlowerField({ count = 18 } = {}) {
    if (document.querySelector('.flowers-container')) return;

    const container = document.createElement('div');
    container.className = 'flowers-container';
    document.body.prepend(container);

    const palette = [
        '#f4a6a8', // vibrant rose
        '#f6b88a', // bright peach
        '#f4d6a8', // golden yellow
        '#d4a8d9', // soft lavender
        '#a8d4e8', // soft blue
        '#ffe6f2', // very light pink
        '#e0a8e8', // magenta
        '#b3e0b3'  // light green
    ];

    for (let i = 0; i < count; i++) {
        const flower = document.createElement('div');
        flower.className = 'flower';

        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const size = Math.round(80 + Math.random() * 160);
        const bloomDuration = 700 + Math.round(Math.random() * 900);
        const floatDuration = 5 + Math.random() * 6;
        const floatDelay = Math.random() * 3;
        const initRot = Math.round((Math.random() - 0.5) * 30);

        flower.style.left = `${left}%`;
        flower.style.top = `${top}%`;
        flower.style.width = `${size}px`;
        flower.style.height = `${size}px`;
        flower.style.setProperty('--bloom-duration', `${bloomDuration}ms`);
        flower.style.setProperty('--float-duration', `${floatDuration}s`);
        flower.style.setProperty('--float-delay', `${floatDelay}s`);
        flower.style.setProperty('--init-rot', `${initRot}deg`);
        
        const petal = palette[Math.floor(Math.random() * palette.length)];
        const center = '#ffd700';

        const petalsCount = 6 + Math.floor(Math.random() * 3);
        const petalPath = (iPetal, total) => {
            const angle = (360 / total) * iPetal;
            return `<g transform="rotate(${angle} 50 50)">
                <ellipse cx="50" cy="18" rx="12" ry="22" fill="${petal}" />
            </g>`;
        };
        let svg = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">`;
        for (let p = 0; p < petalsCount; p++) svg += petalPath(p, petalsCount);
        svg += `<circle cx="50" cy="52" r="12" fill="${center}" />`;
        svg += `</svg>`;

        flower.innerHTML = svg;
        container.appendChild(flower);

        setTimeout(() => flower.classList.add('bloom'), 40 + i * 80);

        const rebloom = () => {
            flower.classList.remove('bloom');
            void flower.offsetWidth;
            flower.classList.add('bloom');
        };
        const interval = 4000 + Math.round(Math.random() * 7000);
        const timer = setInterval(rebloom, interval);

        flower._cleanup = () => clearInterval(timer);
    }

    window.addEventListener('beforeunload', () => {
        container.querySelectorAll('.flower').forEach(f => f._cleanup && f._cleanup());
    });
}

/**
 * Function to generate floating hearts
 */
function initFloatingHearts({ count = 12 } = {}) {
    if (document.querySelector('.hearts-container')) return;

    const container = document.createElement('div');
    container.className = 'hearts-container';
    document.body.prepend(container);

    const heartSvg = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21s-7.5-4.35-9.5-7.03C.98 11.42 3.06 7 6.5 7c1.74 0 3.1 1.08 3.5 2.6.4-1.52 1.76-2.6 3.5-2.6 3.44 0 5.52 4.42 4 6.97C19.5 16.65 12 21 12 21z"/></svg>`;

    for (let i = 0; i < count; i++) {
        const heart = document.createElement('div');
        heart.className = 'floating-heart';

        const left = Math.random() * 100;
        const top = 100 + Math.random() * 20; 
        const floatDuration = 10 + Math.random() * 10;
        const floatDelay = Math.random() * 10;

        heart.style.left = `${left}vw`;
        heart.style.top = `${top}vh`;
        heart.style.setProperty('--float-duration', `${floatDuration}s`);
        heart.style.setProperty('--float-delay', `${floatDelay}s`);

        heart.innerHTML = heartSvg;
        container.appendChild(heart);
        
        const reFloat = () => {
            heart.style.transition = 'none';
            heart.style.animation = 'none';
            heart.style.transform = `translateY(0) scale(0.2) rotate(0deg)`;
            heart.style.opacity = '0.2';

            const newDuration = 10 + Math.random() * 10;
            const newDelay = Math.random() * 10; 
            heart.style.setProperty('--float-duration', `${newDuration}s`);
            heart.style.setProperty('--float-delay', `${newDelay}s`);
            
            void heart.offsetWidth; 

            heart.style.animation = `heart-float ${newDuration}s ease-in ${newDelay}s forwards`;
        };
        
        heart.addEventListener('animationend', reFloat);
        
        heart.style.animation = `heart-float ${floatDuration}s ease-in ${floatDelay}s forwards`;
    }
}});