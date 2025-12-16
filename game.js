// ============================================================
// DAY 7: DEJA VU - A Time Loop Mystery Game
// Theme: "The Changing of Time"
// Built for Codédex Game Jam December 2025
// ============================================================

const config = {
    type: Phaser.AUTO,
    width: 1400,
    height: 900,
    backgroundColor: '#2d3748',
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    input: {
        activePointers: 3,
        touch: {
            capture: true,
            target: null
        }
    },
    scene: [TitleScene, InstructionsScene, TutorialScene, MainScene, CreditsScene]
};

const game = new Phaser.Game(config);

// ============================================================
// GLOBAL DATA MANAGER - localStorage and Achievements
// ============================================================

const GameData = {
    init: function() {
        // Load or initialize save data
        const saved = localStorage.getItem('day7DejaVuData');
        if (saved) {
            this.data = JSON.parse(saved);
        } else {
            this.data = {
                hasPlayedBefore: false,
                difficulty: 'normal',
                achievements: [],
                highScores: { easy: 0, normal: 0, hard: 0 },
                settings: {
                    musicVolume: 0.7,
                    sfxVolume: 0.8,
                    particlesEnabled: true,
                    screenShakeEnabled: true
                },
                totalPlaytime: 0,
                gamesCompleted: 0
            };
       
    
    // Check if returning player
    this.hasPlayedBefore = GameData.data.hasPlayedBefore; }
    },
    
    save: function() {
        localStorage.setItem('day7DejaVuData', JSON.stringify(this.data));
    },
    
    unlockAchievement: function(id) {
        if (!this.data.achievements.includes(id)) {
            this.data.achievements.push(id);
            this.save();
            return true; // Newly unlocked
        }
        return false; // Already had it
    },
    
    getDifficulty: function() {
        return this.data.difficulty;
    },
    
    setDifficulty: function(diff) {
        this.data.difficulty = diff;
        this.save();
    },
    
    updateHighScore: function(difficulty, score) {
        if (score > this.data.highScores[difficulty]) {
            this.data.highScores[difficulty] = score;
            this.save();
        }
    }
};

GameData.init();

// ============================================================
// ACHIEVEMENTS DEFINITIONS
// ============================================================

const ACHIEVEMENTS = {
    FIRST_LOOP: { id: 'first_loop', name: 'First Loop', desc: 'Complete Day 1', icon: '🎯' },
    EAGLE_EYE: { id: 'eagle_eye', name: 'Eagle Eye', desc: 'Find 5 differences in under 30s', icon: '🦅' },
    PERFECTIONIST: { id: 'perfectionist', name: 'Perfectionist', desc: 'Complete a day without errors', icon: '💎' },
    COMBO_MASTER: { id: 'combo_master', name: 'Combo Master', desc: 'Reach 5x combo', icon: '🔥' },
    NO_HINTS: { id: 'no_hints', name: 'No Hints Needed', desc: 'Complete game without hints', icon: '🧠' },
    HARD_MODE: { id: 'hard_mode', name: 'Time Traveler', desc: 'Complete HARD mode', icon: '⏰' },
    PERSISTENT: { id: 'persistent', name: 'Persistent', desc: 'Retry 3 times and succeed', icon: '💪' },
    SPEED_DEMON: { id: 'speed_demon', name: 'Speed Demon', desc: 'Complete in under 8 minutes', icon: '⚡' }
};

// ============================================================
// TITLE SCENE - Professional Opening Screen
// ============================================================

function TitleScene() {
    Phaser.Scene.call(this, { key: 'TitleScene' });
}

TitleScene.prototype = Object.create(Phaser.Scene.prototype);
TitleScene.prototype.constructor = TitleScene;

TitleScene.prototype.preload = function() {
    // Load title screen music (same as main game)
    this.load.audio('music_main', 'assets/audio/ambient_loop.ogg');
    this.load.audio('sfx_click', 'assets/audio/ui_click.wav');
};

TitleScene.prototype.create = function() {
    // Unlock audio on first user interaction (browser requirement)
    this.audioUnlocked = false;
    this.input.once('pointerdown', () => {
        if (!this.audioUnlocked) {
            this.audioUnlocked = true;
            // Resume audio context
            if (this.sound.context) {
                this.sound.context.resume();
            }
        }
    });
    
    // Background with gradient effect
    const bg = this.add.rectangle(700, 450, 1400, 900, 0x1a202c);
    
    // Animated particles background
    this.add.particles(0, 0, 'default', {
        x: { min: 0, max: 1400 },
        y: { min: 0, max: 900 },
        speed: 0,
        scale: { min: 0.3, max: 1.2 },
        alpha: { min: 0.1, max: 0.3 },
        tint: [0xed8936, 0x68d391, 0xffd700],
        lifespan: 0,
        quantity: 30
    });
    
    // Title with dramatic entrance
    const title = this.add.text(700, 250, 'DAY 7', {
        font: 'bold 120px monospace',
        fill: '#ed8936',
        stroke: '#000000',
        strokeThickness: 10
    }).setOrigin(0.5).setAlpha(0).setScale(0.5);
    
    this.tweens.add({
        targets: title,
        alpha: 1,
        scale: 1,
        duration: 1500,
        ease: 'Elastic.easeOut'
    });
    
    // Subtitle
    const subtitle = this.add.text(700, 360, 'DEJA VU', {
        font: 'bold 72px monospace',
        fill: '#f7fafc',
        stroke: '#000000',
        strokeThickness: 6
    }).setOrigin(0.5).setAlpha(0);
    
    this.tweens.add({
        targets: subtitle,
        alpha: 1,
        duration: 1000,
        delay: 800
    });
    
    // Tagline with typewriter
    const tagline = this.add.text(700, 450, '', {
        font: '24px monospace',
        fill: '#a0aec0',
        align: 'center',
        wordWrap: { width: 1000 }
    }).setOrigin(0.5);
    
    const taglineText = '"Time loops. Memory fades. Truth awaits."';
    let charIndex = 0;
    this.time.delayedCall(1800, () => {
        this.time.addEvent({
            delay: 50,
            callback: () => {
                if (charIndex < taglineText.length) {
                    tagline.setText(taglineText.substring(0, charIndex + 1));
                    charIndex++;
                }
            },
            repeat: taglineText.length
        });
    });
    
    // Instructions
    const instructions = this.add.text(700, 540, 
        '• Find differences in each room\n• 90 seconds per day\n• 7 days to escape the loop', {
        font: '22px monospace',
        fill: '#cbd5e0',
        align: 'center',
        lineSpacing: 8,
        wordWrap: { width: 1000 }
    }).setOrigin(0.5).setAlpha(0);
    
    this.tweens.add({
        targets: instructions,
        alpha: 1,
        duration: 1000,
        delay: 3000
    });
    
    // Difficulty buttons - horizontal layout with better spacing
    const difficulties = [
        { name: 'EASY', color: '#68d391', desc: '120s | 5 hints', x: 350 },
        { name: 'NORMAL', color: '#ffd700', desc: '90s | 3 hints', x: 700 },
        { name: 'HARD', color: '#e53e3e', desc: '60s | 1 hint', x: 1050 }
    ];
    
    this.difficultyBtns = [];
    
    difficulties.forEach((diff, i) => {
        const btn = this.add.text(diff.x, 640, diff.name, {
            font: 'bold 36px monospace',
            fill: diff.color,
            backgroundColor: '#1a202c',
            padding: { x: 30, y: 12 }
        }).setOrigin(0.5).setAlpha(0)
          .setInteractive({ useHandCursor: true });
        
        const desc = this.add.text(diff.x, 700, diff.desc, {
            font: '20px monospace',
            fill: '#cbd5e0'
        }).setOrigin(0.5).setAlpha(0);
        
        this.tweens.add({
            targets: [btn, desc],
            alpha: 1,
            duration: 600,
            delay: 3200 + (i * 150)
        });
        
        // Hover effect with sound
        btn.on('pointerover', () => {
            // Play subtle tick sound on hover
            try {
                const tickSound = this.sound.get('sfx_click');
                if (tickSound) {
                    tickSound.play({ volume: 0.3 });
                }
            } catch (e) {}
            
            this.tweens.add({
                targets: btn,
                scale: 1.15,
                duration: 200,
                ease: 'Back.easeOut'
            });
        });
        
        btn.on('pointerout', () => {
            this.tweens.add({
                targets: btn,
                scale: 1,
                duration: 200
            });
        });
        
        // Click handler
        btn.on('pointerdown', () => {
            GameData.setDifficulty(diff.name.toLowerCase());
            this.startGame();
        });
        
        this.difficultyBtns.push({ btn, desc });
    });
    
    // How to Play button
    const howToPlayBtn = this.add.text(700, 780, '❓ How to Play', {
        font: 'bold 28px monospace',
        fill: '#4299e1',
        backgroundColor: '#1a202c',
        padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setAlpha(0)
      .setInteractive({ useHandCursor: true });
    
    this.tweens.add({
        targets: howToPlayBtn,
        alpha: 1,
        duration: 800,
        delay: 4000
    });
    
    howToPlayBtn.on('pointerover', () => {
        howToPlayBtn.setScale(1.05);
    });
    
    howToPlayBtn.on('pointerout', () => {
        howToPlayBtn.setScale(1);
    });
    
    howToPlayBtn.on('pointerdown', () => {
        this.scene.start('InstructionsScene');
    });
    
    // Credits
    const credits = this.add.text(700, 50, 'Codédex Game Jam 2025 | Theme: "The Changing of Time"', {
        font: '18px monospace',
        fill: '#718096'
    }).setOrigin(0.5).setAlpha(0);
    
    this.tweens.add({
        targets: credits,
        alpha: 0.7,
        duration: 1000,
        delay: 4000
    });
};

TitleScene.prototype.startGame = function() {
    // Play click sound on user interaction
    try {
        if (this.sound.get('sfx_click')) {
            this.sound.get('sfx_click').play();
        }
    } catch (e) {
        console.log('Click sound failed');
    }
    
    // Flash effect
    const flash = this.add.rectangle(700, 450, 1400, 900, 0xffffff, 0);
    this.tweens.add({
        targets: flash,
        alpha: 0.8,
        duration: 200,
        yoyo: true,
        onComplete: () => {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.time.delayedCall(500, () => {
                // Go to tutorial if first time, else MainScene
                if (!this.hasPlayedBefore) {
                    this.scene.start('TutorialScene');
                } else {
                    this.scene.start('MainScene');
                }
            });
        }
    });
};

// ============================================================
// INSTRUCTIONS SCENE - How to Play
// ============================================================

function InstructionsScene() {
    Phaser.Scene.call(this, { key: 'InstructionsScene' });
}

InstructionsScene.prototype = Object.create(Phaser.Scene.prototype);
InstructionsScene.prototype.constructor = InstructionsScene;

InstructionsScene.prototype.create = function() {
    // Dark background
    this.add.rectangle(700, 450, 1400, 900, 0x1a202c);
    
    // Panel background
    const panel = this.add.rectangle(700, 450, 1000, 750, 0x2d3748)
        .setStrokeStyle(5, 0xed8936);
    
    // Title
    const title = this.add.text(700, 120, 'HOW TO PLAY', {
        font: 'bold 56px monospace',
        fill: '#ed8936',
        stroke: '#000000',
        strokeThickness: 5
    }).setOrigin(0.5);
    
    // Instructions content
    const instructions = [
        { icon: '🎯', title: 'GOAL', text: 'Find all differences before time runs out' },
        { icon: '🕐', title: 'TIME', text: '90 seconds per day (Green → Yellow → Red)' },
        { icon: '🔍', title: 'DIFFERENCES', text: 'Objects change: color, size, position, rotation, alpha' },
        { icon: '💡', title: 'HINTS', text: '3 per game - use wisely to reveal differences' },
        { icon: '⚡', title: 'COMBOS', text: 'Find quickly: 2x = +15pts | 3x = +20pts | 5x = +30pts' },
        { icon: '📖', title: 'STORY', text: 'Uncover why you are trapped in the time loop' }
    ];
    
    let yPos = 220;
    instructions.forEach((item, i) => {
        const icon = this.add.text(280, yPos, item.icon, {
            font: '32px monospace'
        }).setOrigin(0.5);
        
        const titleText = this.add.text(340, yPos - 18, item.title, {
            font: 'bold 24px monospace',
            fill: '#ffd700'
        });
        
        const desc = this.add.text(340, yPos + 8, item.text, {
            font: '18px monospace',
            fill: '#cbd5e0',
            wordWrap: { width: 650 }
        });
        
        yPos += 85;
        
        // Stagger animations
        this.tweens.add({
            targets: [icon, titleText, desc],
            alpha: { from: 0, to: 1 },
            x: `+=${20}`,
            duration: 400,
            delay: i * 100,
            ease: 'Back.easeOut'
        });
    });
    
    // Back button
    const backBtn = this.add.text(400, 750, '← BACK', {
        font: 'bold 36px monospace',
        fill: '#cbd5e0',
        backgroundColor: '#1a202c',
        padding: { x: 30, y: 15 }
    }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    
    backBtn.on('pointerover', () => {
        backBtn.setScale(1.1);
        backBtn.setColor('#ffffff');
    });
    
    backBtn.on('pointerout', () => {
        backBtn.setScale(1);
        backBtn.setColor('#cbd5e0');
    });
    
    backBtn.on('pointerdown', () => {
        this.scene.start('TitleScene');
    });
    
    // Start button
    const startBtn = this.add.text(1000, 750, 'START →', {
        font: 'bold 36px monospace',
        fill: '#68d391',
        backgroundColor: '#1a202c',
        padding: { x: 30, y: 15 }
    }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    
    startBtn.on('pointerover', () => {
        startBtn.setScale(1.1);
    });
    
    startBtn.on('pointerout', () => {
        startBtn.setScale(1);
    });
    
    startBtn.on('pointerdown', () => {
        if (!GameData.data.hasPlayedBefore) {
            this.scene.start('TutorialScene');
        } else {
            this.scene.start('MainScene');
        }
    });
};

// ============================================================
// TUTORIAL SCENE - First-time player guidance
// ============================================================

function TutorialScene() {
    Phaser.Scene.call(this, { key: 'TutorialScene' });
}

TutorialScene.prototype = Object.create(Phaser.Scene.prototype);
TutorialScene.prototype.constructor = TutorialScene;

TutorialScene.prototype.create = function() {
    this.tutorialStep = 0;
    this.canProgress = false;
    
    // Background
    this.add.rectangle(700, 450, 1400, 900, 0x2d3748);
    
    // Create simple room
    this.createTutorialRoom();
    
    // Tutorial UI overlay
    this.tutorialOverlay = this.add.rectangle(700, 450, 1400, 900, 0x000000, 0.7).setDepth(100);
    
    this.tutorialText = this.add.text(700, 200, '', {
        font: 'bold 36px monospace',
        fill: '#f7fafc',
        align: 'center',
        wordWrap: { width: 1000 },
        stroke: '#000000',
        strokeThickness: 4
    }).setOrigin(0.5).setDepth(101);
    
    this.continuePrompt = this.add.text(700, 800, 'Click to continue...', {
        font: '24px monospace',
        fill: '#a0aec0'
    }).setOrigin(0.5).setDepth(101).setAlpha(0);
    
    // Pulse animation
    this.tweens.add({
        targets: this.continuePrompt,
        alpha: 1,
        duration: 800,
        yoyo: true,
        repeat: -1
    });
    
    // Skip button
    const skipBtn = this.add.text(1350, 50, 'SKIP →', {
        font: 'bold 24px monospace',
        fill: '#a0aec0',
        backgroundColor: '#1a202c',
        padding: { x: 15, y: 8 }
    }).setOrigin(1, 0).setDepth(102)
      .setInteractive({ useHandCursor: true });
    
    skipBtn.on('pointerdown', () => {
        GameData.data.hasPlayedBefore = true;
        GameData.save();
        this.scene.start('MainScene');
    });
    
    // Start tutorial
    this.showTutorialStep();
    
    // Click to progress
    this.input.on('pointerdown', () => {
        if (this.canProgress) {
            this.nextTutorialStep();
        }
    });
};

TutorialScene.prototype.createTutorialRoom = function() {
    // Create 3 simple objects
    this.bed = this.add.rectangle(300, 650, 120, 120, 0x8b4513).setDepth(1);
    this.clock = this.add.rectangle(1000, 250, 80, 80, 0xffd700).setDepth(1);
    this.plant = this.add.rectangle(450, 700, 100, 100, 0x228b22).setDepth(1);
    
    // Clock is the difference (rotated)
    this.clock.setAngle(45);
    
    // Arrow pointer (hidden initially)
    this.arrow = this.add.text(0, 0, '▼', {
        font: 'bold 64px monospace',
        fill: '#ffd700',
        stroke: '#000000',
        strokeThickness: 4
    }).setOrigin(0.5).setDepth(102).setAlpha(0);
    
    // Glow effect
    this.glowCircle = this.add.circle(0, 0, 100, 0xffd700, 0).setDepth(0);
};

TutorialScene.prototype.showTutorialStep = function() {
    this.canProgress = false;
    
    const steps = [
        {
            text: "Welcome to DAY 7: DEJA VU\n\nYou wake up in the same room... again.",
            action: () => {
                this.canProgress = true;
                this.continuePrompt.setAlpha(1);
            }
        },
        {
            text: "Something feels wrong.\n\nObjects change each day.",
            action: () => {
                this.canProgress = true;
            }
        },
        {
            text: "This clock is different!\n\nClick it to mark the difference.",
            action: () => {
                this.tutorialOverlay.setAlpha(0.5);
                this.continuePrompt.setAlpha(0);
                
                // Point to clock
                this.arrow.setPosition(this.clock.x, this.clock.y - 100);
                this.tweens.add({
                    targets: this.arrow,
                    alpha: 1,
                    y: this.clock.y - 80,
                    duration: 500,
                    yoyo: true,
                    repeat: -1
                });
                
                // Glow on clock
                this.glowCircle.setPosition(this.clock.x, this.clock.y);
                this.tweens.add({
                    targets: this.glowCircle,
                    alpha: 0.4,
                    scale: 1.3,
                    duration: 1000,
                    yoyo: true,
                    repeat: -1
                });
                
                // Make clock clickable
                this.clock.setInteractive({ useHandCursor: true });
                this.clock.once('pointerdown', () => {
                    this.arrow.setAlpha(0);
                    this.glowCircle.setAlpha(0);
                    this.clock.setFillStyle(0x68d391);
                    
                    // Success message
                    const success = this.add.text(this.clock.x, this.clock.y, '✓', {
                        font: 'bold 72px monospace',
                        fill: '#68d391'
                    }).setOrigin(0.5).setDepth(103);
                    
                    this.tweens.add({
                        targets: success,
                        scale: 2,
                        alpha: 0,
                        duration: 800,
                        onComplete: () => {
                            success.destroy();
                            this.nextTutorialStep();
                        }
                    });
                });
            }
        },
        {
            text: "Perfect!\n\nFind ALL differences before time runs out.",
            action: () => {
                this.tutorialOverlay.setAlpha(0.7);
                this.canProgress = true;
                this.continuePrompt.setAlpha(1);
            }
        },
        {
            text: "You have 90 seconds each day.\n\nGreen = safe | Yellow = hurry | Red = danger!",
            action: () => {
                // Show fake timer
                this.fakeTimer = this.add.rectangle(700, 60, 400, 24, 0x68d391)
                    .setDepth(101);
                this.fakeTimerText = this.add.text(700, 100, '1:30', {
                    font: 'bold 32px monospace',
                    fill: '#f7fafc',
                    stroke: '#000000',
                    strokeThickness: 4
                }).setOrigin(0.5).setDepth(101);
                
                this.canProgress = true;
            }
        },
        {
            text: "Stuck? Use HINTS to reveal differences.\n\nBut you only get 3 per game!",
            action: () => {
                // Show hint button
                this.fakeHint = this.add.text(50, 850, '💡 Hint (3)', {
                    font: 'bold 28px monospace',
                    fill: '#ffd700',
                    backgroundColor: '#1a202c',
                    padding: { x: 15, y: 10 }
                }).setDepth(101);
                
                this.arrow.setPosition(150, 800);
                this.arrow.setAngle(45);
                this.tweens.add({
                    targets: this.arrow,
                    alpha: 1,
                    duration: 500
                });
                
                this.canProgress = true;
            }
        },
        {
            text: "Now you're ready.\n\nLet's begin your journey through time...",
            action: () => {
                this.arrow.setAlpha(0);
                this.canProgress = true;
            }
        }
    ];
    
    const step = steps[this.tutorialStep];
    if (step) {
        this.tutorialText.setText(step.text);
        
        // Fade in
        this.tutorialText.setAlpha(0);
        this.tweens.add({
            targets: this.tutorialText,
            alpha: 1,
            duration: 500,
            onComplete: () => {
                if (step.action) step.action();
            }
        });
    }
};

TutorialScene.prototype.nextTutorialStep = function() {
    this.tutorialStep++;
    
    if (this.tutorialStep >= 7) {
        // Tutorial complete!
        GameData.data.hasPlayedBefore = true;
        GameData.save();
        
        this.cameras.main.fadeOut(800, 0, 0, 0);
        this.time.delayedCall(800, () => {
            this.scene.start('MainScene');
        });
    } else {
        // Fade out current text
        this.tweens.add({
            targets: this.tutorialText,
            alpha: 0,
            duration: 300,
            onComplete: () => {
                this.showTutorialStep();
            }
        });
    }
};

// ============================================================
// MAIN GAME SCENE
// ============================================================

function MainScene() {
    Phaser.Scene.call(this, { key: 'MainScene' });
}

MainScene.prototype = Object.create(Phaser.Scene.prototype);
MainScene.prototype.constructor = MainScene;

// ============================================================
// PRELOAD - Load all game assets
// ============================================================

MainScene.prototype.preload = function() {
    // Load all sound effects (music is already loaded in TitleScene)
    this.load.audio('sfx_correct', 'assets/audio/correct.wav');
    this.load.audio('sfx_wrong', 'assets/audio/wrong.wav');
    this.load.audio('sfx_tick', 'assets/audio/tick.wav');
    this.load.audio('sfx_dayComplete', 'assets/audio/fanfare.wav');
    this.load.audio('sfx_whoosh', 'assets/audio/whoosh.wav');
    this.load.audio('sfx_timesUp', 'assets/audio/timesup.wav');
    this.load.audio('sfx_hint', 'assets/audio/hint.wav');
};

// ============================================================
// CREATE - Initialize Game
// ============================================================

MainScene.prototype.create = function() {
    // === DIFFICULTY SETTINGS ===
    const difficulty = GameData.getDifficulty();
    const difficultySettings = {
        easy: { time: 120000, hints: 5, requiredPerDay: [2, 2, 3, 3, 4, 4, 5] },
        normal: { time: 90000, hints: 3, requiredPerDay: [2, 3, 3, 4, 4, 5, 5] },
        hard: { time: 60000, hints: 1, requiredPerDay: [3, 4, 4, 5, 5, 6, 6] }
    };
    const settings = difficultySettings[difficulty];
    
    // === CONSTANTS ===
    this.TIMER_DURATION = settings.time;
    this.PARTICLE_COUNT = 20;
    this.CONFETTI_COUNT = 50;
    this.difficulty = difficulty;
    
    // === GAME STATE ===
    this.currentDay = 1;
    this.maxDays = 7;
    this.score = 0;
    this.hintsLeft = settings.hints;
    this.initialHints = settings.hints;
    this.foundThisDay = 0;
    this.musicEnabled = true;
    this.combo = 0;
    this.maxCombo = 0;
    this.streak = 0;
    this.wrongClicks = 0;
    this.isPaused = false;
    this.dayRetries = 0;
    this.totalRetries = 0;
    this.gameStartTime = Date.now();
    this.perfectDay = true;
    
    // Required differences per day (from difficulty)
    this.requiredPerDay = settings.requiredPerDay;
    
    // === OBJECT DATA (8 objects with detailed states) ===
    this.objectData = [
        {
            name: 'bed',
            x: 250,
            y: 650,
            size: 140,
            states: [
                { color: 0x8b4513, alpha: 1, scale: 1, angle: 0 }, // Normal
                { color: 0x654321, alpha: 1, scale: 1, angle: 0 }, // Darker (messy)
                { color: 0x8b4513, alpha: 0.75, scale: 0.95, angle: -3 }, // Faded + tilted
                { color: 0xa0522d, alpha: 1, scale: 1.05, angle: 0 }, // Lighter
                { color: 0x8b4513, alpha: 0.85, scale: 0.9, angle: 2 }, // Smaller
                { color: 0x6b3410, alpha: 0.7, scale: 1, angle: 0 }, // Very dark
                { color: 0x8b4513, alpha: 0.5, scale: 0.85, angle: -5 } // Almost gone
            ]
        },
        {
            name: 'clock',
            x: 1100,
            y: 250,
            size: 90,
            states: [
                { color: 0xffd700, alpha: 1, scale: 1, angle: 0 },
                { color: 0xffd700, alpha: 1, scale: 1, angle: 90 }, // Rotated
                { color: 0xff6347, alpha: 1, scale: 1.1, angle: 0 }, // Red + bigger
                { color: 0xffd700, alpha: 0.8, scale: 1, angle: 180 }, // Upside down
                { color: 0x32cd32, alpha: 1, scale: 0.9, angle: 45 }, // Green
                { color: 0xffd700, alpha: 0.6, scale: 0.85, angle: -30 }, // Fading
                { color: 0x8b0000, alpha: 0.9, scale: 1.15, angle: 270 } // Dark red
            ]
        },
        {
            name: 'plant',
            x: 450,
            y: 700,
            size: 100,
            states: [
                { color: 0x228b22, alpha: 1, scale: 1, angle: 0 }, // Healthy green
                { color: 0x32cd32, alpha: 1, scale: 1.15, angle: 0 }, // Growing
                { color: 0x9acd32, alpha: 1, scale: 1.25, angle: 5 }, // Bigger
                { color: 0x6b8e23, alpha: 0.9, scale: 1.1, angle: -3 }, // Darker
                { color: 0x8b7355, alpha: 0.8, scale: 0.9, angle: 0 }, // Dying (brown)
                { color: 0x654321, alpha: 0.7, scale: 0.75, angle: 10 }, // Dead
                { color: 0x2f4f2f, alpha: 0.5, scale: 0.6, angle: -15 } // Withered
            ]
        },
        {
            name: 'photo',
            x: 700,
            y: 300,
            size: 110,
            states: [
                { color: 0xdaa520, alpha: 1, scale: 1, angle: 0 }, // Gold frame
                { color: 0xdaa520, alpha: 0.9, scale: 1, angle: -5 }, // Tilted
                { color: 0xb8860b, alpha: 0.85, scale: 0.95, angle: 0 }, // Darker gold
                { color: 0xdaa520, alpha: 0.75, scale: 0.9, angle: 8 }, // Fading
                { color: 0x8b7355, alpha: 0.7, scale: 0.85, angle: -10 }, // Sepia
                { color: 0x696969, alpha: 0.6, scale: 0.8, angle: 5 }, // Gray
                { color: 0x2f4f4f, alpha: 0.4, scale: 0.75, angle: -20 } // Almost invisible
            ]
        },
        {
            name: 'window',
            x: 1100,
            y: 550,
            size: 160,
            states: [
                { color: 0x87ceeb, alpha: 0.9, scale: 1, angle: 0 }, // Sky blue
                { color: 0x4682b4, alpha: 0.85, scale: 1, angle: 0 }, // Darker (evening)
                { color: 0x191970, alpha: 0.8, scale: 1, angle: 0 }, // Night
                { color: 0x708090, alpha: 0.75, scale: 1, angle: 0 }, // Foggy
                { color: 0x2f4f4f, alpha: 0.7, scale: 1, angle: 0 }, // Very dark
                { color: 0x000000, alpha: 0.6, scale: 1, angle: 0 }, // Black
                { color: 0x8b0000, alpha: 0.5, scale: 0.95, angle: 0 } // Red tint
            ]
        },
        {
            name: 'lamp',
            x: 950,
            y: 700,
            size: 85,
            states: [
                { color: 0xffff00, alpha: 1, scale: 1, angle: 0 }, // Bright yellow
                { color: 0xffd700, alpha: 0.9, scale: 1, angle: 0 }, // Dimmer
                { color: 0xff8c00, alpha: 0.85, scale: 1.05, angle: 0 }, // Orange
                { color: 0xffa500, alpha: 0.75, scale: 1, angle: -8 }, // Orange + tilt
                { color: 0xcd853f, alpha: 0.7, scale: 0.95, angle: 0 }, // Brown-orange
                { color: 0x8b4513, alpha: 0.6, scale: 0.9, angle: 12 }, // Dark brown
                { color: 0x000000, alpha: 0.4, scale: 0.85, angle: -15 } // Off (black)
            ]
        },
        {
            name: 'book',
            x: 600,
            y: 650,
            size: 95,
            states: [
                { color: 0x8b0000, alpha: 1, scale: 1, angle: 0 }, // Red book
                { color: 0x8b0000, alpha: 1, scale: 1, angle: 25 }, // Rotated
                { color: 0xdc143c, alpha: 0.95, scale: 1.05, angle: 0 }, // Brighter red
                { color: 0x8b0000, alpha: 0.85, scale: 0.95, angle: -15 }, // Darker
                { color: 0x654321, alpha: 0.8, scale: 0.9, angle: 35 }, // Brown
                { color: 0x4b0082, alpha: 0.75, scale: 0.85, angle: 0 }, // Purple
                { color: 0x2f4f4f, alpha: 0.6, scale: 0.8, angle: -45 } // Dark gray
            ]
        },
        {
            name: 'mug',
            x: 750,
            y: 750,
            size: 75,
            states: [
                { color: 0xffffff, alpha: 1, scale: 1, angle: 0 }, // White
                { color: 0xf5f5dc, alpha: 0.95, scale: 1, angle: 0 }, // Beige (coffee stain)
                { color: 0xd2b48c, alpha: 0.9, scale: 1.05, angle: 0 }, // Tan (more stain)
                { color: 0xffffff, alpha: 0.85, scale: 0.95, angle: 10 }, // Tilted
                { color: 0xa0522d, alpha: 0.8, scale: 0.9, angle: 0 }, // Brown (dirty)
                { color: 0x8b4513, alpha: 0.7, scale: 0.85, angle: -20 }, // Dark brown
                { color: 0x696969, alpha: 0.5, scale: 0.75, angle: 30 } // Gray (broken?)
            ]
        }
    ];
    
    // === DAY CHANGES (which objects change each day) ===
    this.dayChanges = {
        1: ['clock', 'plant', 'mug'],                                    // 3 changes
        2: ['clock', 'plant', 'mug', 'lamp'],                            // 4 changes
        3: ['bed', 'photo', 'lamp', 'book'],                             // 4 changes
        4: ['window', 'book', 'lamp', 'mug', 'plant'],                   // 5 changes
        5: ['clock', 'bed', 'plant', 'photo', 'mug'],                    // 5 changes
        6: ['window', 'lamp', 'book', 'mug', 'photo', 'bed'],            // 6 changes
        7: ['bed', 'clock', 'plant', 'window', 'book', 'photo']          // 6 changes
    };
    
    // === STORY TEXT ===
    this.storyText = {
        1: "Another morning. Coffee's cold again.\n\nWhy does this feel... familiar?",
        2: "The clock feels wrong.\n\nHave I lived this before?",
        3: "Cracks in the walls.\n\nOr are they cracks in my mind?",
        4: "The photo... was she always smiling?\n\nI can't remember anymore.",
        5: "Time isn't moving.\n\nI'm not moving.\n\nWe're stuck.",
        6: "I remember now.\n\nThe choice I made.\n\nThe day everything changed.",
        7: "This is the last loop.\n\nBreak free or stay forever?\n\nI choose..."
    };
    
    // === BUILD GAME ===
    // === INITIALIZE AUDIO ===
    this.initializeAudio();
    
    this.buildRoom();
    this.createUI();
    this.createParticleEmitters();
    this.createAmbientParticles();
    
    // Show clear instructions on first day
    if (this.currentDay === 1) {
        this.showDayStartInstructions();
    } else {
        this.startDay();
    }
};

// ============================================================
// INITIALIZE AUDIO - Setup music and sound effects
// ============================================================

MainScene.prototype.initializeAudio = function() {
    // Background music (looping ambient)
    if (this.sound.get('music_main')) {
        this.music = this.sound.get('music_main');
    } else {
        try {
            this.music = this.sound.add('music_main', { 
                loop: true, 
                volume: 0.4 
            });
        } catch (e) {
            console.log('Music not loaded yet');
        }
    }
    
    // Start music after user interaction
    if (this.music && this.musicEnabled && !this.music.isPlaying) {
        try {
            this.music.play();
        } catch (e) {
            console.log('Music autoplay blocked - will play on interaction');
        }
    }
    
    // Sound effects object
    this.sfx = {};
    
    try {
        this.sfx.click = this.sound.add('sfx_click', { volume: 0.6 });
        this.sfx.correct = this.sound.add('sfx_correct', { volume: 0.8 });
        this.sfx.wrong = this.sound.add('sfx_wrong', { volume: 0.8 });
        this.sfx.tick = this.sound.add('sfx_tick', { volume: 0.6 });
        this.sfx.dayComplete = this.sound.add('sfx_dayComplete', { volume: 0.9 });
        this.sfx.whoosh = this.sound.add('sfx_whoosh', { volume: 0.7 });
        this.sfx.timesUp = this.sound.add('sfx_timesUp', { volume: 0.9 });
        this.sfx.hint = this.sound.add('sfx_hint', { volume: 0.7 });
    } catch (e) {
        console.log('Some sound effects not loaded');
    }
};

// ============================================================
// BUILD ROOM - Create objects and background
// ============================================================

MainScene.prototype.buildRoom = function() {
    // Background
    this.add.rectangle(700, 450, 1400, 900, 0x2d3748);
    
    // Vignette overlay (dark edges)
    const vignette = this.add.graphics();
    vignette.fillStyle(0x000000, 0);
    vignette.fillRect(0, 0, 1400, 900);
    vignette.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0.5, 0.5, 0, 0);
    vignette.fillRect(0, 0, 1400, 100);
    vignette.fillRect(0, 800, 1400, 100);
    vignette.fillRect(0, 0, 100, 900);
    vignette.fillRect(1300, 0, 100, 900);
    
    // Room decoration (floor line)
    const floor = this.add.line(700, 800, 0, 0, 1400, 0, 0x1a202c, 0.6);
    floor.setLineWidth(4);
    
    // Create objects with enhanced graphics
    this.objects = [];
    this.objectData.forEach((data, i) => {
        // Shadow layer
        const shadow = this.add.rectangle(data.x + 5, data.y + 5, data.size, data.size, 0x000000, 0.4)
            .setAlpha(0);
        
        // Main object with gradient-like effect
        const obj = this.add.rectangle(data.x, data.y, data.size, data.size, data.states[0].color)
            .setInteractive({ useHandCursor: true })
            .setAlpha(0)
            .setStrokeStyle(4, 0x000000, 0.6);
        
        // Glow layer (invisible until hover)
        const glow = this.add.rectangle(data.x, data.y, data.size + 20, data.size + 20, 0xffd700, 0)
            .setDepth(-1);
        
        obj.shadow = shadow;
        obj.glow = glow;
        
        obj.data = data;
        obj.stateIndex = 0;
        obj.found = false;
        obj.isDifference = false;
        
        // Enhanced hover glow effect
        obj.on('pointerover', () => {
            if (!obj.found && this.dayTimer) {
                this.tweens.killTweensOf(obj);
                this.tweens.killTweensOf(obj.glow);
                
                // Scale pulse
                this.tweens.add({
                    targets: obj,
                    scaleX: 1.08,
                    scaleY: 1.08,
                    duration: 300,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
                
                // Glow effect
                this.tweens.add({
                    targets: obj.glow,
                    alpha: 0.3,
                    duration: 300,
                    ease: 'Sine.easeInOut'
                });
            }
        });
        
        obj.on('pointerout', () => {
            this.tweens.killTweensOf(obj);
            this.tweens.killTweensOf(obj.glow);
            obj.setScale(obj.data.states[obj.stateIndex].scale || 1);
            obj.glow.setAlpha(0);
        });
        
        obj.on('pointerdown', () => this.handleClick(obj));
        
        this.objects.push(obj);
        
        // Staggered appear animation for object and shadow
        this.tweens.add({
            targets: [obj, shadow],
            alpha: 1,
            scale: { from: 0, to: 1 },
            delay: i * 70,
            duration: 500,
            ease: 'Back.easeOut'
        });
    });
};

// ============================================================
// CREATE UI - All interface elements
// ============================================================

MainScene.prototype.createUI = function() {
    // Day text (top-left)
    this.dayText = this.add.text(50, 50, 'DAY 1/7', {
        font: 'bold 48px monospace',
        fill: '#ed8936',
        stroke: '#000000',
        strokeThickness: 6
    });
    
    // Timer bar background
    this.timerBarBg = this.add.rectangle(700, 60, 420, 30, 0x1a202c)
        .setStrokeStyle(3, 0x000000);
    
    // Timer bar (progress)
    this.timerBar = this.add.rectangle(500, 60, 400, 24, 0x68d391)
        .setOrigin(0, 0.5);
    
    // Timer text
    this.timerText = this.add.text(700, 100, '1:30', {
        font: 'bold 36px monospace',
        fill: '#f7fafc',
        stroke: '#000000',
        strokeThickness: 4
    }).setOrigin(0.5);
    
    // Score (top-right)
    this.scoreText = this.add.text(1300, 50, '★ 0', {
        font: 'bold 40px monospace',
        fill: '#ffd700',
        stroke: '#000000',
        strokeThickness: 5
    }).setOrigin(1, 0);
    
    // Combo counter (appears when combo > 1)
    this.comboText = this.add.text(1300, 100, '', {
        font: 'bold 32px monospace',
        fill: '#ff6347',
        stroke: '#000000',
        strokeThickness: 4
    }).setOrigin(1, 0).setAlpha(0);
    
    // Found counter (bottom-center) - Clear and visible
    this.foundText = this.add.text(700, 850, '🔍 FIND: 0/2', {
        font: 'bold 36px monospace',
        fill: '#ffd700',
        stroke: '#000000',
        strokeThickness: 4,
        backgroundColor: '#1a202c',
        padding: { x: 18, y: 8 }
    }).setOrigin(0.5);
    
    // Hint button (bottom-left)
    this.hintBtn = this.add.text(50, 850, '💡 Hint (3)', {
        font: 'bold 32px monospace',
        fill: '#a0aec0',
        backgroundColor: '#1a202c',
        padding: { x: 15, y: 10 }
    }).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.useHint())
      .on('pointerover', () => {
          if (this.hintsLeft > 0) {
              this.hintBtn.setScale(1.05);
          }
      })
      .on('pointerout', () => this.hintBtn.setScale(1));
    
    // Music toggle (bottom-right)
    this.musicBtn = this.add.text(1350, 850, '🔊', {
        font: 'bold 40px monospace',
        backgroundColor: '#1a202c',
        padding: { x: 10, y: 5 }
    }).setOrigin(1, 1)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.toggleMusic());
    
    // Pause button (top-right)
    this.pauseBtn = this.add.text(1350, 50, '⏸', {
        font: 'bold 40px monospace',
        fill: '#cbd5e0',
        backgroundColor: '#1a202c',
        padding: { x: 10, y: 5 }
    }).setOrigin(1, 0)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.togglePause());
    
    // Difficulty badge
    const diffColors = { easy: '#68d391', normal: '#ffd700', hard: '#e53e3e' };
    this.difficultyBadge = this.add.text(50, 100, `Mode: ${this.difficulty.toUpperCase()}`, {
        font: 'bold 20px monospace',
        fill: diffColors[this.difficulty],
        backgroundColor: '#1a202c',
        padding: { x: 10, y: 5 }
    });
    
    // Progress dots
    this.progressDots = [];
    for (let i = 0; i < this.maxDays; i++) {
        const dot = this.add.circle(50 + (i * 30), 145, 8, i === 0 ? 0xed8936 : 0x4a5568);
        this.progressDots.push(dot);
    }
    
    // Pause menu (hidden initially)
    this.pauseMenu = null;
    
    // ESC key for pause
    this.input.keyboard.on('keydown-ESC', () => this.togglePause());
};

// ============================================================
// PARTICLE SYSTEM - Success and Confetti effects
// ============================================================

MainScene.prototype.createParticleEmitters = function() {
    // Success particle (stars on correct click)
    this.successParticles = this.add.particles(0, 0, 'default', {
        speed: { min: 100, max: 300 },
        scale: { start: 1, end: 0 },
        alpha: { start: 1, end: 0 },
        tint: [0xffd700, 0xffa500, 0xff6347, 0x68d391],
        lifespan: 800,
        gravityY: 200,
        quantity: this.PARTICLE_COUNT,
        emitting: false
    });
    
    // Confetti (day completion)
    this.confettiParticles = this.add.particles(0, 0, 'default', {
        speed: { min: 200, max: 500 },
        scale: { start: 1.5, end: 0.5 },
        alpha: { start: 1, end: 0.3 },
        tint: [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff],
        lifespan: 2000,
        gravityY: 300,
        angle: { min: 0, max: 360 },
        quantity: this.CONFETTI_COUNT,
        emitting: false
    });
};

// ============================================================
// AMBIENT PARTICLES - Floating dust motes
// ============================================================

MainScene.prototype.createAmbientParticles = function() {
    this.ambientParticles = this.add.particles(0, 0, 'default', {
        x: { min: 0, max: 1400 },
        y: { min: -50, max: 0 },
        speedX: { min: -20, max: 20 },
        speedY: { min: 30, max: 60 },
        scale: { min: 0.2, max: 0.5 },
        alpha: { min: 0.1, max: 0.3 },
        tint: 0xffffff,
        lifespan: 15000,
        frequency: 300,
        quantity: 1
    });
};

// ============================================================
// SHOW DAY START INSTRUCTIONS - Make it clear what to do
// ============================================================

MainScene.prototype.showDayStartInstructions = function() {
    // Dark overlay - also interactive for mobile tap-anywhere
    const overlay = this.add.rectangle(700, 450, 1400, 900, 0x000000, 0.92)
        .setDepth(300)
        .setInteractive();
    
    // Big clear title
    const title = this.add.text(700, 200, 'HOW TO PLAY', {
        font: 'bold 52px monospace',
        fill: '#ed8936',
        stroke: '#000000',
        strokeThickness: 5
    }).setOrigin(0.5).setDepth(301);
    
    // Clear instructions with icons
    const instructions = this.add.text(700, 420, 
        '🔍 FIND THE DIFFERENCES\n\n' +
        'Objects in this room have CHANGED\n\n' +
        '👆 CLICK on objects that look different\n\n' +
        '⏱️ Find ALL differences before timer runs out\n\n' +
        '✅ Correct = +10 pts | ❌ Wrong = -5 pts\n\n' +
        '💡 Use HINT button if stuck (3 hints total)', {
        font: '22px monospace',
        fill: '#f7fafc',
        align: 'center',
        lineSpacing: 6,
        wordWrap: { width: 850 }
    }).setOrigin(0.5).setDepth(301);
    
    // Start button with larger hit area for mobile
    const startBtn = this.add.text(700, 720, '▶ START DAY 1', {
        font: 'bold 38px monospace',
        fill: '#68d391',
        backgroundColor: '#1a202c',
        padding: { x: 35, y: 18 }
    }).setOrigin(0.5).setDepth(302)
      .setInteractive({ 
          useHandCursor: true,
          hitArea: new Phaser.Geom.Rectangle(-100, -20, 400, 80),
          hitAreaCallback: Phaser.Geom.Rectangle.Contains
      });
    
    // Pulse animation
    this.tweens.add({
        targets: startBtn,
        scale: 1.08,
        duration: 600,
        yoyo: true,
        repeat: -1
    });
    
    // Hover effect
    startBtn.on('pointerover', () => {
        startBtn.setScale(1.15);
    });
    
    startBtn.on('pointerout', () => {
        this.tweens.killTweensOf(startBtn);
        this.tweens.add({
            targets: startBtn,
            scale: 1.08,
            duration: 600,
            yoyo: true,
            repeat: -1
        });
    });
    
    // Use pointerup for better mobile responsiveness
    const startGame = () => {
        // Play whoosh sound for start
        this.playSound('whoosh');
        
        // Remove all event listeners
        startBtn.removeAllListeners();
        overlay.removeAllListeners();
        
        this.tweens.add({
            targets: [overlay, title, instructions, startBtn],
            alpha: 0,
            duration: 400,
            onComplete: () => {
                overlay.destroy();
                title.destroy();
                instructions.destroy();
                startBtn.destroy();
                this.startDay();
            }
        });
    };
    
    startBtn.on('pointerup', startGame);
    
    // Fallback: tap anywhere to start (helps on mobile)
    overlay.on('pointerup', startGame);
};

// ============================================================
// START DAY - Initialize day state
// ============================================================

MainScene.prototype.startDay = function() {
    this.foundThisDay = 0;
    this.applyDayChanges();
    this.updateUI();
    
    // Camera zoom in
    this.cameras.main.setZoom(1.05);
    this.tweens.add({
        targets: this.cameras.main,
        zoom: 1,
        duration: 1200,
        ease: 'Power2'
    });
    
    // Add helper text for first day
    if (this.currentDay === 1) {
        const helperText = this.add.text(700, 200, '👆 CLICK objects that look different!', {
            font: 'bold 26px monospace',
            fill: '#ffd700',
            stroke: '#000000',
            strokeThickness: 3,
            backgroundColor: '#1a202c',
            padding: { x: 15, y: 8 },
            wordWrap: { width: 800 }
        }).setOrigin(0.5).setDepth(50);
        
        // Pulse animation
        this.tweens.add({
            targets: helperText,
            alpha: 0.7,
            duration: 800,
            yoyo: true,
            repeat: -1
        });
        
        // Remove after 10 seconds
        this.time.delayedCall(10000, () => {
            this.tweens.add({
                targets: helperText,
                alpha: 0,
                duration: 500,
                onComplete: () => helperText.destroy()
            });
        });
    }
    
    // Start timer
    this.dayStartTime = this.time.now;
    this.dayTimer = this.time.addEvent({
        delay: this.TIMER_DURATION,
        callback: this.onTimeUp,
        callbackScope: this
    });
    
    // Update timer display
    this.timerUpdateEvent = this.time.addEvent({
        delay: 100,
        callback: this.updateTimer,
        callbackScope: this,
        loop: true
    });
};

// ============================================================
// APPLY DAY CHANGES - Set object states
// ============================================================

MainScene.prototype.applyDayChanges = function() {
    const changedObjects = this.dayChanges[this.currentDay];
    
    this.objects.forEach(obj => {
        obj.found = false;
        obj.isDifference = false;
        
        // Kill any existing tweens
        this.tweens.killTweensOf(obj);
        
        if (changedObjects.includes(obj.data.name)) {
            // This object is a difference today
            obj.isDifference = true;
            obj.stateIndex = this.currentDay;
            
            // Add SUBTLE pulse to differences (helps players find them)
            this.time.delayedCall(2000, () => {
                if (!obj.found && obj.isDifference) {
                    this.tweens.add({
                        targets: obj,
                        scaleX: (obj.data.states[obj.stateIndex].scale || 1) * 1.03,
                        scaleY: (obj.data.states[obj.stateIndex].scale || 1) * 1.03,
                        duration: 2000,
                        yoyo: true,
                        repeat: -1,
                        ease: 'Sine.easeInOut'
                    });
                }
            });
        } else {
            obj.stateIndex = 0;
        }
        
        // Apply visual state
        const state = obj.data.states[obj.stateIndex];
        obj.setFillStyle(state.color);
        obj.setAlpha(state.alpha);
        obj.setScale(state.scale || 1);
        obj.setAngle(state.angle || 0);
    });
};

// ============================================================
// HANDLE CLICK - Object interaction
// ============================================================

MainScene.prototype.handleClick = function(obj) {
    if (obj.found || !this.dayTimer) return;
    
    if (obj.isDifference) {
        // ✓ CORRECT!
        obj.found = true;
        this.foundThisDay++;
        
        // Combo system
        this.combo++;
        this.streak++;
        if (this.combo > this.maxCombo) this.maxCombo = this.combo;
        
        // Bonus points for combos
        let points = 10;
        if (this.combo >= 5) points = 30;
        else if (this.combo >= 3) points = 20;
        else if (this.combo >= 2) points = 15;
        
        this.score += points;
        
        // Particle explosion
        this.successParticles.emitParticleAt(obj.x, obj.y);
        
        // Scale bounce
        this.tweens.add({
            targets: obj,
            scale: (obj.data.states[obj.stateIndex].scale || 1) * 1.4,
            duration: 200,
            yoyo: true,
            ease: 'Elastic.easeOut'
        });
        
        // Green checkmark
        const check = this.add.text(obj.x, obj.y, '✓', {
            font: 'bold 60px monospace',
            fill: '#68d391',
            stroke: '#000000',
            strokeThickness: 5
        }).setOrigin(0.5).setAlpha(0);
        
        this.tweens.add({
            targets: check,
            alpha: 1,
            scale: { from: 0.5, to: 1.5 },
            duration: 400,
            onComplete: () => {
                this.tweens.add({
                    targets: check,
                    alpha: 0,
                    duration: 400,
                    onComplete: () => check.destroy()
                });
            }
        });
        
        // Floating points text with combo info
        let scoreText = `+${points}`;
        let scoreColor = '#68d391';
        
        if (this.combo >= 5) {
            scoreText = `🔥 +${points} FIRE!`;
            scoreColor = '#ff4500';
        } else if (this.combo >= 3) {
            scoreText = `⚡ +${points} COMBO!`;
            scoreColor = '#ffa500';
        } else if (this.combo >= 2) {
            scoreText = `+${points} STREAK!`;
            scoreColor = '#ffd700';
        }
        
        const plus = this.add.text(obj.x, obj.y - 20, scoreText, {
            font: 'bold 40px monospace',
            fill: scoreColor,
            stroke: '#000000',
            strokeThickness: 5
        }).setOrigin(0.5).setScale(0.5);
        
        this.tweens.add({
            targets: plus,
            y: obj.y - 100,
            alpha: 0,
            scale: 1.2,
            duration: 1200,
            ease: 'Power2',
            onComplete: () => plus.destroy()
        });
        
        // Update combo display
        if (this.combo > 1) {
            this.comboText.setText(`${this.combo}x COMBO`);
            this.tweens.add({
                targets: this.comboText,
                alpha: 1,
                scale: 1.3,
                duration: 200,
                yoyo: true,
                ease: 'Back.easeOut'
            });
        }
        
        // Success sound placeholder
        this.playSound('correct');
        
        this.updateUI();
        
        // Check if day complete
        if (this.foundThisDay >= this.requiredPerDay[this.currentDay - 1]) {
            this.completeDay();
        }
        
    } else {
        // ✗ WRONG!
        this.cameras.main.shake(120, 0.008);
        this.score = Math.max(0, this.score - 5);
        this.wrongClicks++;
        this.perfectDay = false;
        
        // Break combo
        if (this.combo > 0) {
            const comboLost = this.add.text(700, 400, `COMBO BROKEN! (${this.combo}x)`, {
                font: 'bold 36px monospace',
                fill: '#e53e3e',
                stroke: '#000000',
                strokeThickness: 4
            }).setOrigin(0.5).setAlpha(0);
            
            this.tweens.add({
                targets: comboLost,
                alpha: 1,
                duration: 200,
                yoyo: true,
                onComplete: () => comboLost.destroy()
            });
        }
        this.combo = 0;
        this.comboText.setAlpha(0);
        
        // Red X flash
        const cross = this.add.text(obj.x, obj.y, '✗', {
            font: 'bold 64px monospace',
            fill: '#e53e3e',
            stroke: '#000000',
            strokeThickness: 5
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: cross,
            alpha: 0,
            scale: 1.5,
            duration: 600,
            ease: 'Power2',
            onComplete: () => cross.destroy()
        });
        
        // -5 penalty text
        const minus = this.add.text(obj.x, obj.y + 20, '-5', {
            font: 'bold 32px monospace',
            fill: '#e53e3e',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: minus,
            y: obj.y + 70,
            alpha: 0,
            duration: 800,
            onComplete: () => minus.destroy()
        });
        
        // Wrong sound placeholder
        this.playSound('wrong');
        
        this.updateUI();
    }
};

// ============================================================
// UPDATE TIMER - Display and color changes
// ============================================================

MainScene.prototype.updateTimer = function() {
    if (!this.dayTimer) return;
    
    const elapsed = this.time.now - this.dayStartTime;
    const remaining = Math.max(0, this.TIMER_DURATION - elapsed);
    const seconds = Math.floor(remaining / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    
    this.timerText.setText(`${minutes}:${secs.toString().padStart(2, '0')}`);
    
    // Update bar
    const progress = remaining / this.TIMER_DURATION;
    this.timerBar.setScale(progress, 1);
    
    // Color changes based on time
    if (progress < 0.11) {
        // < 10s: RED + pulse + SCREEN SHAKE
        this.timerBar.setFillStyle(0xe53e3e);
        this.timerText.setColor('#e53e3e');
        
        if (!this.timerPulseTween) {
            this.timerPulseTween = this.tweens.add({
                targets: this.timerText,
                scale: 1.15,
                duration: 500,
                yoyo: true,
                repeat: -1
            });
            
            // Start screen shake for tension
            this.cameras.main.shake(10000, 0.002);
            
            // Flash red warning
            const warning = this.add.rectangle(700, 450, 1400, 900, 0xe53e3e, 0).setDepth(50);
            this.tweens.add({
                targets: warning,
                alpha: 0.15,
                duration: 300,
                yoyo: true,
                repeat: -1
            });
            this.warningFlash = warning;
        }
        
        // Tick sound every second
        if (seconds !== this.lastTickSecond && seconds > 0) {
            this.lastTickSecond = seconds;
            this.playSound('tick');
        }
        
    } else if (progress < 0.33) {
        // < 30s: YELLOW
        this.timerBar.setFillStyle(0xecc94b);
        this.timerText.setColor('#ecc94b');
    } else {
        // > 30s: GREEN
        this.timerBar.setFillStyle(0x68d391);
        this.timerText.setColor('#f7fafc');
        
        if (this.timerPulseTween) {
            this.timerPulseTween.stop();
            this.timerPulseTween = null;
            this.timerText.setScale(1);
            this.cameras.main.stopFollow();
            
            // Remove warning flash
            if (this.warningFlash) {
                this.warningFlash.destroy();
                this.warningFlash = null;
            }
        }
    }
};

// ============================================================
// COMPLETE DAY - Celebration and story
// ============================================================

MainScene.prototype.completeDay = function() {
    // Stop timer
    if (this.dayTimer) {
        this.dayTimer.remove();
        this.dayTimer = null;
    }
    if (this.timerUpdateEvent) {
        this.timerUpdateEvent.remove();
    }
    if (this.timerPulseTween) {
        this.timerPulseTween.stop();
        this.timerPulseTween = null;
    }
    
    // Confetti explosion
    this.confettiParticles.emitParticleAt(700, 200, this.CONFETTI_COUNT);
    
    // Rainbow color cycle on all objects
    this.objects.forEach((obj, i) => {
        const colors = [0xff0000, 0xff7f00, 0xffff00, 0x00ff00, 0x0000ff, 0x4b0082, 0x9400d3];
        let colorIndex = 0;
        
        this.time.addEvent({
            delay: 200,
            callback: () => {
                obj.setFillStyle(colors[colorIndex % colors.length]);
                colorIndex++;
            },
            repeat: 10,
            startAt: i * 30
        });
    });
    
    // Success sound
    this.playSound('dayComplete');
    
    // Check achievements
    this.checkDayAchievements();
    
    // Show day stats
    const statsText = this.add.text(700, 750, 
        `Day ${this.currentDay} Complete!\nScore: +${this.score}\nMax Combo: ${this.maxCombo}x`, {
        font: 'bold 28px monospace',
        fill: '#68d391',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 3,
        lineSpacing: 5,
        wordWrap: { width: 800 }
    }).setOrigin(0.5).setAlpha(0).setDepth(50);
    
    this.tweens.add({
        targets: statsText,
        alpha: 1,
        y: 700,
        duration: 600,
        ease: 'Back.easeOut'
    });
    
    // Show story after 1.8s
    this.time.delayedCall(1800, () => {
        this.tweens.add({
            targets: statsText,
            alpha: 0,
            duration: 400,
            onComplete: () => {
                statsText.destroy();
                this.showStory();
            }
        });
    });
};

// ============================================================
// SHOW STORY - Story overlay with typewriter
// ============================================================

MainScene.prototype.showStory = function() {
    // Dark overlay
    const overlay = this.add.rectangle(700, 450, 1400, 900, 0x000000, 0)
        .setDepth(100);
    
    this.tweens.add({
        targets: overlay,
        alpha: 0.9,
        duration: 600,
        ease: 'Power2'
    });
    
    // Story text with typewriter effect
    const story = this.storyText[this.currentDay];
    const storyText = this.add.text(700, 400, '', {
        font: '36px monospace',
        fill: '#f7fafc',
        align: 'center',
        wordWrap: { width: 1000 },
        lineSpacing: 12
    }).setOrigin(0.5).setDepth(101).setAlpha(0);
    
    this.tweens.add({
        targets: storyText,
        alpha: 1,
        duration: 600
    });
    
    // Typewriter effect
    let charIndex = 0;
    const typewriter = this.time.addEvent({
        delay: 40,
        callback: () => {
            if (charIndex <= story.length) {
                storyText.setText(story.substring(0, charIndex));
                charIndex++;
                
                // Whoosh sound on reveal
                if (charIndex === 1) {
                    this.playSound('whoosh');
                }
            } else {
                typewriter.remove();
                this.showContinueButton(overlay, storyText);
            }
        },
        loop: true
    });
};

// ============================================================
// SHOW CONTINUE BUTTON - After story
// ============================================================

MainScene.prototype.showContinueButton = function(overlay, text) {
    const btn = this.add.text(700, 600, '→ Continue', {
        font: 'bold 38px monospace',
        fill: '#ed8936',
        backgroundColor: '#1a202c',
        padding: { x: 25, y: 15 }
    }).setOrigin(0.5).setDepth(102).setAlpha(0)
      .setInteractive({ useHandCursor: true });
    
    this.tweens.add({
        targets: btn,
        alpha: 1,
        duration: 500
    });
    
    // Pulse animation
    this.tweens.add({
        targets: btn,
        scale: 1.08,
        duration: 700,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });
    
    btn.on('pointerdown', () => {
        this.tweens.add({
            targets: [overlay, text, btn],
            alpha: 0,
            duration: 600,
            onComplete: () => {
                overlay.destroy();
                text.destroy();
                btn.destroy();
                this.nextDay();
            }
        });
    });
};

// ============================================================
// NEXT DAY - Progress to next day or ending
// ============================================================

MainScene.prototype.nextDay = function() {
    this.currentDay++;
    this.dayRetries = 0;
    this.perfectDay = true;
    
    if (this.currentDay > this.maxDays) {
        this.showEnding();
    } else {
        // Update progress dots
        this.progressDots.forEach((dot, i) => {
            if (i < this.currentDay) {
                dot.setFillStyle(0xed8936);
            }
        });
        // Show dramatic story interlude between days
        this.showStoryInterlude();
    }
};

MainScene.prototype.showStoryInterlude = function() {
    // Black screen with story text
    const overlay = this.add.rectangle(700, 450, 1400, 900, 0x000000, 0)
        .setDepth(600);
    
    this.tweens.add({
        targets: overlay,
        alpha: 1,
        duration: 1000
    });
    
    // Day number with glow
    const dayNum = this.add.text(700, 300, `DAY ${this.currentDay}`, {
        font: 'bold 96px monospace',
        fill: '#ed8936',
        stroke: '#000000',
        strokeThickness: 10
    }).setOrigin(0.5).setDepth(601).setAlpha(0).setScale(0.5);
    
    // Dramatic story text
    const story = this.add.text(700, 500, this.storyText[this.currentDay], {
        font: 'bold 32px monospace',
        fill: '#f7fafc',
        align: 'center',
        lineSpacing: 12,
        wordWrap: { width: 1000 },
        stroke: '#000000',
        strokeThickness: 4
    }).setOrigin(0.5).setDepth(601).setAlpha(0);
    
    // Animate day number
    this.tweens.add({
        targets: dayNum,
        alpha: 1,
        scale: 1,
        duration: 800,
        delay: 1000,
        ease: 'Back.easeOut'
    });
    
    // Fade in story
    this.tweens.add({
        targets: story,
        alpha: 1,
        duration: 1000,
        delay: 1800
    });
    
    // Continue prompt
    const continueText = this.add.text(700, 750, 'Click to continue...', {
        font: '24px monospace',
        fill: '#a0aec0'
    }).setOrigin(0.5).setDepth(601).setAlpha(0);
    
    this.tweens.add({
        targets: continueText,
        alpha: 1,
        duration: 800,
        delay: 2800,
        yoyo: true,
        repeat: -1
    });
    
    // Play atmospheric whoosh
    this.time.delayedCall(1000, () => {
        this.playSound('whoosh');
    });
    
    // Click to continue
    overlay.setInteractive();
    overlay.once('pointerdown', () => {
        this.tweens.add({
            targets: [overlay, dayNum, story, continueText],
            alpha: 0,
            duration: 600,
            onComplete: () => {
                overlay.destroy();
                dayNum.destroy();
                story.destroy();
                continueText.destroy();
                
                // Camera fade transition
                this.cameras.main.fadeOut(400, 0, 0, 0);
                
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    // Reset objects to base state
                    this.objects.forEach(obj => {
                        obj.found = false;
                        obj.isDifference = false;
                        obj.stateIndex = 0;
                        const state = obj.data.states[0];
                        obj.setFillStyle(state.color);
                        obj.setAlpha(state.alpha);
                        obj.setScale(state.scale || 1);
                        obj.setAngle(state.angle || 0);
                    });
                    
                    this.cameras.main.fadeIn(400, 0, 0, 0);
                    this.startDay();
                });
            }
        });
    });
};

// ============================================================
// TIME UP - Retry day
// ============================================================

MainScene.prototype.onTimeUp = function() {
    if (this.timerUpdateEvent) {
        this.timerUpdateEvent.remove();
    }
    
    this.dayRetries++;
    this.totalRetries++;
    this.perfectDay = true;
    
    // Play time's up sound FIRST
    this.playSound('timesUp');
    
    // Dark overlay with higher depth
    const fail = this.add.rectangle(700, 450, 1400, 900, 0x000000, 0)
        .setDepth(500).setInteractive();
    
    this.tweens.add({
        targets: fail,
        alpha: 0.85,
        duration: 500
    });
    
    const text = this.add.text(700, 350, '⏰ TIME\'S UP!', {
        font: 'bold 72px monospace',
        fill: '#e53e3e',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 8
    }).setOrigin(0.5).setDepth(501).setAlpha(0);
    
    const text2 = this.add.text(700, 470, 'Time fractured...\nTrying again', {
        font: 'bold 36px monospace',
        fill: '#f7fafc',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 5,
        lineSpacing: 10
    }).setOrigin(0.5).setDepth(501).setAlpha(0);
    
    // Animate text appearing
    this.tweens.add({
        targets: text,
        alpha: 1,
        scale: { from: 0.5, to: 1 },
        duration: 600,
        delay: 200,
        ease: 'Back.easeOut'
    });
    
    this.tweens.add({
        targets: text2,
        alpha: 1,
        duration: 600,
        delay: 600
    });
    
    this.time.delayedCall(2500, () => {
        this.tweens.add({
            targets: [fail, text, text2],
            alpha: 0,
            duration: 600,
            onComplete: () => {
                fail.destroy();
                text.destroy();
                text2.destroy();
                
                // Reset day
                this.cameras.main.fadeOut(300, 0, 0, 0);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    this.objects.forEach(obj => {
                        obj.found = false;
                    });
                    this.cameras.main.fadeIn(300, 0, 0, 0);
                    this.startDay();
                });
            }
        });
    });
};

// ============================================================
// SHOW ENDING - Final screen
// ============================================================

MainScene.prototype.showEnding = function() {
    // Stop all sounds
    if (this.music) this.music.stop();
    
    // Epic ending sequence
    const bg = this.add.rectangle(700, 450, 1400, 900, 0x000000, 0)
        .setDepth(700);
    
    this.tweens.add({
        targets: bg,
        alpha: 0.98,
        duration: 2000,
        ease: 'Power2'
    });
    
    // Multiple endings based on score
    let endingText = '';
    let endingColor = '#ed8936';
    let endingTitle = '';
    
    if (this.score >= 400) {
        endingTitle = '✨ MASTER OF TIME ✨';
        endingText = 'You didn\'t just escape—\nyou CONQUERED time itself.\n\nThe loop serves YOU now.\n\nMemories flood back.\nEvery choice. Every moment.\nYou are free.';
        endingColor = '#ffd700';
        GameData.unlockAchievement('master');
        // Victory confetti
        this.time.delayedCall(2000, () => {
            this.createConfetti();
        });
    } else if (this.score >= 300) {
        endingTitle = '🕊️ FREEDOM EARNED';
        endingText = 'Time moves forward again.\nYou remember everything.\n\nThe loop is broken.\nThe choice was always yours.\n\nYou are finally free.';
        endingColor = '#68d391';
    } else if (this.score >= 200) {
        endingTitle = '🌫️ FADING MEMORY';
        endingText = 'You broke free...\nbut fragments are missing.\n\nWhy were you trapped?\nWhat did you forget?\n\nWas any of it real?';
        endingColor = '#4299e1';
    } else {
        endingTitle = '⛓️ TRAPPED FOREVER';
        endingText = 'You couldn\'t escape.\n\nTime loops eternal.\nThe room is your prison.\n\nForever stuck.\nForever alone.\n\nDay 7 begins again...';
        endingColor = '#e53e3e';
    }
    
    // Title appears first
    const title = this.add.text(700, 250, endingTitle, {
        font: 'bold 64px monospace',
        fill: endingColor,
        stroke: '#000000',
        strokeThickness: 8,
        align: 'center'
    }).setOrigin(0.5).setDepth(701).setAlpha(0).setScale(0.5);
    
    this.tweens.add({
        targets: title,
        alpha: 1,
        scale: 1,
        duration: 1500,
        delay: 2000,
        ease: 'Elastic.easeOut'
    });
    
    const ending = this.add.text(700, 480, endingText, {
        font: '28px monospace',
        fill: endingColor,
        align: 'center',
        wordWrap: { width: 1100 },
        lineSpacing: 20,
        stroke: '#000000',
        strokeThickness: 4
    }).setOrigin(0.5).setDepth(201).setAlpha(0);
    
    this.tweens.add({
        targets: ending,
        alpha: 1,
        duration: 3000,
        ease: 'Power2'
    });
    
    // Final score
    const finalScore = this.add.text(700, 550, `Final Score: ${this.score} ★`, {
        font: 'bold 44px monospace',
        fill: '#ffd700',
        stroke: '#000000',
        strokeThickness: 5
    }).setOrigin(0.5).setDepth(201).setAlpha(0);
    
    this.tweens.add({
        targets: finalScore,
        alpha: 1,
        duration: 2000,
        delay: 3000
    });
    
    // Performance grade
    let grade = 'Memories Fading';
    let gradeColor = '#a0aec0';
    if (this.score >= 350) {
        grade = '👑 LEGEND OF TIME 👑';
        gradeColor = '#ffd700';
    } else if (this.score >= 300) {
        grade = '✨ Master of Time ✨';
        gradeColor = '#ed8936';
    } else if (this.score >= 200) {
        grade = '⭐ Time Keeper';
        gradeColor = '#68d391';
    } else if (this.score >= 100) {
        grade = '🔓 Loop Breaker';
        gradeColor = '#4299e1';
    }
    
    const gradeText = this.add.text(700, 620, grade, {
        font: 'bold 40px monospace',
        fill: gradeColor,
        stroke: '#000000',
        strokeThickness: 5
    }).setOrigin(0.5).setDepth(201).setAlpha(0);
    
    this.tweens.add({
        targets: gradeText,
        alpha: 1,
        duration: 2000,
        delay: 3500
    });
    
    // Detailed stats
    const stats = this.add.text(700, 680, 
        `Max Combo: ${this.maxCombo}x | Total Streak: ${this.streak} | Errors: ${this.wrongClicks}`, {
        font: '24px monospace',
        fill: '#cbd5e0',
        stroke: '#000000',
        strokeThickness: 3
    }).setOrigin(0.5).setDepth(201).setAlpha(0);
    
    this.tweens.add({
        targets: stats,
        alpha: 1,
        duration: 2000,
        delay: 4000
    });
    
    // Restart button
    const restart = this.add.text(700, 750, '↻ Play Again', {
        font: 'bold 40px monospace',
        fill: '#68d391',
        backgroundColor: '#1a202c',
        padding: { x: 30, y: 15 }
    }).setOrigin(0.5).setDepth(202).setAlpha(0)
      .setInteractive({ useHandCursor: true });
    
    this.tweens.add({
        targets: restart,
        alpha: 1,
        duration: 1000,
        delay: 5000
    });
    
    this.tweens.add({
        targets: restart,
        scale: 1.08,
        duration: 800,
        delay: 6000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });
    
    restart.on('pointerdown', () => {
        this.scene.restart();
    });
    
    // Menu button
    const menuBtn = this.add.text(700, 820, 'Main Menu', {
        font: 'bold 32px monospace',
        fill: '#cbd5e0',
        backgroundColor: '#1a202c',
        padding: { x: 25, y: 12 }
    }).setOrigin(0.5).setDepth(202).setAlpha(0)
      .setInteractive({ useHandCursor: true });
    
    this.tweens.add({
        targets: menuBtn,
        alpha: 1,
        duration: 800,
        delay: 6000
    });
    
    menuBtn.on('pointerdown', () => {
        this.scene.start('TitleScene');
    });
    
    // Check final achievements
    this.checkFinalAchievements();
    
    // Update high score
    GameData.updateHighScore(this.difficulty, this.score);
    GameData.data.gamesCompleted++;
    GameData.save();
    
    // Confetti celebration
    this.time.delayedCall(4000, () => {
        for (let i = 0; i < 5; i++) {
            this.time.delayedCall(i * 300, () => {
                this.confettiParticles.emitParticleAt(
                    Phaser.Math.Between(200, 1200),
                    0,
                    30
                );
            });
        }
    });
};

// ============================================================
// USE HINT - Reveal one difference
// ============================================================

MainScene.prototype.useHint = function() {
    if (this.hintsLeft <= 0 || !this.dayTimer) return;
    
    this.hintsLeft--;
    this.hintBtn.setText(`💡 Hint (${this.hintsLeft})`);
    
    if (this.hintsLeft === 0) {
        this.hintBtn.setAlpha(0.5);
        this.hintBtn.disableInteractive();
    }
    
    // Find first unfound difference
    const unfound = this.objects.find(obj => obj.isDifference && !obj.found);
    
    if (unfound) {
        // Bright glow effect (loop 3 times)
        this.tweens.add({
            targets: unfound,
            alpha: 0.2,
            duration: 400,
            yoyo: true,
            repeat: 5,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                unfound.setAlpha(unfound.data.states[unfound.stateIndex].alpha);
            }
        });
        
        // Hint arrow
        const arrow = this.add.text(unfound.x, unfound.y - 80, '▼', {
            font: 'bold 48px monospace',
            fill: '#ffd700',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(50);
        
        this.tweens.add({
            targets: arrow,
            y: unfound.y - 60,
            duration: 500,
            yoyo: true,
            repeat: 5,
            onComplete: () => arrow.destroy()
        });
        
        this.playSound('hint');
    }
};

// ============================================================
// TOGGLE MUSIC - Mute/unmute
// ============================================================

MainScene.prototype.toggleMusic = function() {
    this.musicEnabled = !this.musicEnabled;
    this.musicBtn.setText(this.musicEnabled ? '🔊' : '🔇');
    
    // Control background music
    if (this.music) {
        if (this.musicEnabled) {
            if (!this.music.isPlaying) {
                this.music.play();
            }
        } else {
            this.music.pause();
        }
    }
    
    // Play click sound
    if (this.musicEnabled) {
        this.playSound('click');
    }
};

// ============================================================
// UPDATE UI - Refresh all displays
// ============================================================

MainScene.prototype.updateUI = function() {
    this.dayText.setText(`DAY ${this.currentDay}/${this.maxDays}`);
    this.scoreText.setText(`★ ${this.score}`);
    const required = this.requiredPerDay[this.currentDay - 1];
    this.foundText.setText(
        `🔍 FIND: ${this.foundThisDay}/${required}`
    );
    
    if (this.foundThisDay >= required) {
        this.foundText.setColor('#68d391');
        this.foundText.setText(`✅ ALL FOUND! (${this.foundThisDay}/${required})`);
    } else {
        this.foundText.setColor('#ffd700');
    }
    
    // Animate score changes
    this.tweens.add({
        targets: this.scoreText,
        scale: 1.2,
        duration: 150,
        yoyo: true,
        ease: 'Back.easeOut'
    });
};

// ============================================================
// PLAY SOUND - Play sound effects
// ============================================================

MainScene.prototype.playSound = function(type) {
    if (!this.musicEnabled) return;
    
    // Try to play loaded sound file
    if (this.sfx && this.sfx[type]) {
        try {
            if (this.sfx[type].isPlaying) {
                this.sfx[type].stop();
            }
            this.sfx[type].play();
            return;
        } catch (e) {
            // Fall through to Web Audio API fallback
        }
    }
    
    // Fallback: Generate simple beep using Web Audio API
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        // Different frequencies and durations for different sounds
        const soundConfig = {
            correct: { freq: 800, duration: 0.15, type: 'sine' },
            wrong: { freq: 200, duration: 0.2, type: 'sawtooth' },
            tick: { freq: 600, duration: 0.05, type: 'square' },
            click: { freq: 400, duration: 0.08, type: 'sine' },
            dayComplete: { freq: 1000, duration: 0.3, type: 'sine' },
            whoosh: { freq: 300, duration: 0.15, type: 'sine' },
            timesUp: { freq: 150, duration: 0.4, type: 'sawtooth' },
            hint: { freq: 700, duration: 0.12, type: 'sine' }
        };
        
        const config = soundConfig[type] || { freq: 440, duration: 0.1, type: 'sine' };
        
        oscillator.frequency.value = config.freq;
        oscillator.type = config.type;
        
        gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + config.duration);
        
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + config.duration);
    } catch (e) {
        // Can't generate audio - silently fail
    }
};

// ============================================================
// PAUSE MENU
// ============================================================

MainScene.prototype.togglePause = function() {
    if (this.isPaused) {
        this.resumeGame();
    } else {
        this.pauseGame();
    }
};

MainScene.prototype.pauseGame = function() {
    if (!this.dayTimer) return;
    
    this.isPaused = true;
    this.pauseBtn.setText('▶');
    
    // Pause timer
    if (this.dayTimer) this.dayTimer.paused = true;
    if (this.timerUpdateEvent) this.timerUpdateEvent.paused = true;
    
    // Dim background
    this.pauseOverlay = this.add.rectangle(700, 450, 1400, 900, 0x000000, 0)
        .setDepth(200).setInteractive();
    
    this.tweens.add({
        targets: this.pauseOverlay,
        alpha: 0.85,
        duration: 300
    });
    
    // Pause menu
    const menuBg = this.add.rectangle(700, 450, 600, 500, 0x2d3748)
        .setDepth(201).setStrokeStyle(5, 0xed8936);
    
    const title = this.add.text(700, 250, 'PAUSED', {
        font: 'bold 64px monospace',
        fill: '#ed8936',
        stroke: '#000000',
        strokeThickness: 5
    }).setOrigin(0.5).setDepth(202);
    
    const buttons = [
        { text: '▶ Resume', y: 380, action: () => this.resumeGame() },
        { text: '↻ Restart Day', y: 460, action: () => this.restartDay() },
        { text: '⚙ Settings', y: 540, action: () => this.showSettings() },
        { text: '✕ Quit to Menu', y: 620, action: () => this.quitToMenu() }
    ];
    
    this.pauseMenuItems = [this.pauseOverlay, menuBg, title];
    
    buttons.forEach(btn => {
        const button = this.add.text(700, btn.y, btn.text, {
            font: 'bold 32px monospace',
            fill: '#f7fafc',
            backgroundColor: '#1a202c',
            padding: { x: 25, y: 12 }
        }).setOrigin(0.5).setDepth(202)
          .setInteractive({ useHandCursor: true });
        
        button.on('pointerover', () => {
            button.setScale(1.1);
            button.setColor('#68d391');
        });
        
        button.on('pointerout', () => {
            button.setScale(1);
            button.setColor('#f7fafc');
        });
        
        button.on('pointerdown', btn.action);
        
        this.pauseMenuItems.push(button);
    });
};

MainScene.prototype.resumeGame = function() {
    this.isPaused = false;
    this.pauseBtn.setText('⏸');
    
    // Resume timer
    if (this.dayTimer) this.dayTimer.paused = false;
    if (this.timerUpdateEvent) this.timerUpdateEvent.paused = false;
    
    // Remove menu
    if (this.pauseMenuItems) {
        this.pauseMenuItems.forEach(item => item.destroy());
        this.pauseMenuItems = null;
    }
};

MainScene.prototype.restartDay = function() {
    this.resumeGame();
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
        this.objects.forEach(obj => {
            obj.found = false;
        });
        this.cameras.main.fadeIn(300, 0, 0, 0);
        this.dayRetries++;
        this.totalRetries++;
        this.perfectDay = true;
        this.startDay();
    });
};

MainScene.prototype.showSettings = function() {
    // Simple settings - just show info for now
    const settingsText = this.add.text(700, 450, 
        'Settings\n\nParticles: ON\nScreen Shake: ON\nDifficulty: ' + this.difficulty.toUpperCase(), {
        font: '24px monospace',
        fill: '#cbd5e0',
        align: 'center',
        backgroundColor: '#1a202c',
        padding: { x: 25, y: 18 },
        lineSpacing: 5
    }).setOrigin(0.5).setDepth(203);
    
    this.pauseMenuItems.push(settingsText);
    
    this.time.delayedCall(2000, () => {
        settingsText.destroy();
    });
};

MainScene.prototype.quitToMenu = function() {
    this.resumeGame();
    this.scene.start('TitleScene');
};

// ============================================================
// ACHIEVEMENT SYSTEM
// ============================================================

MainScene.prototype.checkDayAchievements = function() {
    // First Loop
    if (this.currentDay === 1) {
        this.unlockAchievement(ACHIEVEMENTS.FIRST_LOOP);
    }
    
    // Perfectionist - no wrong clicks this day
    if (this.perfectDay && this.wrongClicks === 0) {
        this.unlockAchievement(ACHIEVEMENTS.PERFECTIONIST);
    }
    
    // Combo Master
    if (this.maxCombo >= 5) {
        this.unlockAchievement(ACHIEVEMENTS.COMBO_MASTER);
    }
    
    // Eagle Eye - 5 differences in under 30s
    const timeElapsed = (this.TIMER_DURATION - (this.time.now - this.dayStartTime)) / 1000;
    if (this.foundThisDay >= 5 && timeElapsed < 30) {
        this.unlockAchievement(ACHIEVEMENTS.EAGLE_EYE);
    }
    
    // Persistent - retried 3 times
    if (this.dayRetries >= 3) {
        this.unlockAchievement(ACHIEVEMENTS.PERSISTENT);
    }
};

MainScene.prototype.checkFinalAchievements = function() {
    // No hints used
    if (this.hintsLeft === this.initialHints) {
        this.unlockAchievement(ACHIEVEMENTS.NO_HINTS);
    }
    
    // Hard mode complete
    if (this.difficulty === 'hard') {
        this.unlockAchievement(ACHIEVEMENTS.HARD_MODE);
    }
    
    // Speed demon - under 8 minutes
    const totalTime = (Date.now() - this.gameStartTime) / 1000 / 60;
    if (totalTime < 8) {
        this.unlockAchievement(ACHIEVEMENTS.SPEED_DEMON);
    }
};

MainScene.prototype.unlockAchievement = function(achievement) {
    const unlocked = GameData.unlockAchievement(achievement.id);
    
    if (unlocked) {
        // Show achievement popup
        const popup = this.add.container(1400, 150).setDepth(300);
        
        const bg = this.add.rectangle(0, 0, 350, 100, 0x2d3748)
            .setStrokeStyle(4, 0xffd700);
        
        const icon = this.add.text(-150, 0, achievement.icon, {
            font: 'bold 48px monospace'
        }).setOrigin(0.5);
        
        const title = this.add.text(-50, -15, achievement.name, {
            font: 'bold 24px monospace',
            fill: '#ffd700'
        });
        
        const desc = this.add.text(-50, 10, achievement.desc, {
            font: '16px monospace',
            fill: '#cbd5e0',
            wordWrap: { width: 200 }
        });
        
        const unlockText = this.add.text(0, -45, 'ACHIEVEMENT UNLOCKED!', {
            font: 'bold 14px monospace',
            fill: '#68d391'
        }).setOrigin(0.5);
        
        popup.add([bg, icon, title, desc, unlockText]);
        
        // Slide in
        this.tweens.add({
            targets: popup,
            x: 1050,
            duration: 500,
            ease: 'Back.easeOut'
        });
        
        // Slide out after 3s
        this.time.delayedCall(3000, () => {
            this.tweens.add({
                targets: popup,
                x: 1400,
                duration: 400,
                ease: 'Back.easeIn',
                onComplete: () => popup.destroy()
            });
        });
    }
};

// ============================================================
// CREDITS SCENE - After ending
// ============================================================

function CreditsScene() {
    Phaser.Scene.call(this, { key: 'CreditsScene' });
}

CreditsScene.prototype = Object.create(Phaser.Scene.prototype);
CreditsScene.prototype.constructor = CreditsScene;

CreditsScene.prototype.create = function() {
    this.add.rectangle(700, 450, 1400, 900, 0x1a202c);
    
    const credits = [
        { text: 'DAY 7: DEJA VU', size: '56px', color: '#ed8936', y: 200 },
        { text: '', size: '24px', color: '#cbd5e0', y: 280 },
        { text: 'A game about time, memory,', size: '28px', color: '#f7fafc', y: 320 },
        { text: 'and second chances', size: '28px', color: '#f7fafc', y: 360 },
        { text: '', size: '24px', color: '#cbd5e0', y: 420 },
        { text: 'Built for Codédex Game Jam 2025', size: '24px', color: '#68d391', y: 460 },
        { text: 'Theme: "The Changing of Time"', size: '24px', color: '#68d391', y: 500 },
        { text: '', size: '24px', color: '#cbd5e0', y: 560 },
        { text: 'Thank you for playing', size: '32px', color: '#ffd700', y: 600 }
    ];
    
    credits.forEach((credit, i) => {
        if (credit.text) {
            const text = this.add.text(700, credit.y, credit.text, {
                font: `bold ${credit.size} monospace`,
                fill: credit.color,
                stroke: '#000000',
                strokeThickness: 3
            }).setOrigin(0.5).setAlpha(0);
            
            this.tweens.add({
                targets: text,
                alpha: 1,
                duration: 1000,
                delay: i * 300
            });
        }
    });
    
    // Return button
    const returnBtn = this.add.text(700, 750, 'Return to Menu', {
        font: 'bold 32px monospace',
        fill: '#68d391',
        backgroundColor: '#1a202c',
        padding: { x: 25, y: 12 }
    }).setOrigin(0.5).setAlpha(0)
      .setInteractive({ useHandCursor: true });
    
    this.tweens.add({
        targets: returnBtn,
        alpha: 1,
        duration: 800,
        delay: 3000
    });
    
    returnBtn.on('pointerdown', () => {
        this.scene.start('TitleScene');
    });
};

// ============================================================
// Game initialized and ready!
// ============================================================
