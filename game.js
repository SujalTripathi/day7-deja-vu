// ============================================================
// DAY 7: DEJA VU - A Time Loop Mystery Game
// Theme: "The Changing of Time"
// Built for Codédex Game Jam December 2025
// VERSION: 2.0 - Premium Features Update
// ============================================================

console.log('🎮 Day 7: Deja Vu - VERSION 2.0 LOADED');
console.log('✅ Features: Memory Fragments, Day 7 Glitch, Combo Display, UI Decay, Lifetime Stats');

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
            
            // Ensure lifetime stats exist (backward compatibility)
            if (this.data.totalGamesCompleted === undefined) {
                this.data.totalGamesCompleted = this.data.gamesCompleted || 0;
            }
            if (this.data.bestTimeAnyMode === undefined) {
                this.data.bestTimeAnyMode = Infinity;
            }
            if (this.data.bestScorePerDifficulty === undefined) {
                this.data.bestScorePerDifficulty = { easy: 0, normal: 0, hard: 0 };
            }
            if (this.data.totalDifferencesFound === undefined) {
                this.data.totalDifferencesFound = 0;
            }
            if (this.data.perfectDaysUnlocked === undefined) {
                this.data.perfectDaysUnlocked = 0;
            }
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
                gamesCompleted: 0,
                // Lifetime stats tracking
                totalGamesCompleted: 0,
                bestTimeAnyMode: Infinity,
                bestScorePerDifficulty: { easy: 0, normal: 0, hard: 0 },
                totalDifferencesFound: 0,
                perfectDaysUnlocked: 0
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
    },
    
    updateLifetimeStats: function(stats) {
        // Increment total games completed
        this.data.totalGamesCompleted++;
        
        // Update best time (in seconds)
        if (stats.totalTime < this.data.bestTimeAnyMode) {
            this.data.bestTimeAnyMode = stats.totalTime;
        }
        
        // Update best score per difficulty
        if (stats.score > this.data.bestScorePerDifficulty[stats.difficulty]) {
            this.data.bestScorePerDifficulty[stats.difficulty] = stats.score;
        }
        
        // Add to total differences found
        this.data.totalDifferencesFound += stats.differencesFound;
        
        // Update perfect days unlocked
        this.data.perfectDaysUnlocked += stats.perfectDays;
        
        this.save();
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
    SPEED_DEMON: { id: 'speed_demon', name: 'Speed Demon', desc: 'Complete in under 8 minutes', icon: '⚡' },
    ESCAPED: { id: 'escaped', name: 'ESCAPED THE VOID', desc: 'Break free from the time loop', icon: '🔓' }
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
    this.load.audio('music_main', 'assets/audio/Kids.mp3');
    this.load.audio('sfx_click', 'assets/audio/ui_click.wav');
};

TitleScene.prototype.create = function() {
    // Unlock audio on first user interaction (browser requirement)
    this.audioUnlocked = false;
    this.musicStarted = false;
    
    this.input.once('pointerdown', () => {
        if (!this.audioUnlocked) {
            this.audioUnlocked = true;
            // Resume audio context FIRST
            if (this.sound.context) {
                this.sound.context.resume();
            }
            // THEN start music
            if (!this.musicStarted) {
                this.startMusic();
                this.musicStarted = true;
            }
        }
    });
    
    // Background with gradient effect
    const bg = this.add.rectangle(700, 450, 1400, 900, 0x1a202c);
    
    // === LEFT PANEL: Day Timeline ===
    const leftPanel = this.add.rectangle(150, 450, 250, 900, 0x1a202c, 0.6)
        .setStrokeStyle(2, 0xed8936, 0.3)
        .setDepth(1);
    
    // Day markers on left panel
    for (let day = 1; day <= 7; day++) {
        const y = 150 + (day - 1) * 100;
        const dayCircle = this.add.circle(150, y, 20, day === 7 ? 0xed8936 : 0x4a5568, 1)
            .setStrokeStyle(2, 0xffd700)
            .setDepth(2);
        
        const dayLabel = this.add.text(150, y, `${day}`, {
            font: 'bold 20px monospace',
            fill: '#f7fafc'
        }).setOrigin(0.5).setDepth(3);
        
        // Pulse animation for Day 7
        if (day === 7) {
            this.tweens.add({
                targets: dayCircle,
                scale: { from: 1, to: 1.2 },
                alpha: { from: 1, to: 0.6 },
                duration: 1500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }
    
    // === RIGHT PANEL: Spinning Clock Visual ===
    const rightPanel = this.add.rectangle(1250, 450, 250, 900, 0x1a202c, 0.6)
        .setStrokeStyle(2, 0x68d391, 0.3)
        .setDepth(1);
    
    // Clock centerpiece (golden circle)
    const clockCircle = this.add.circle(1250, 280, 90, 0x1a202c, 1)
        .setStrokeStyle(8, 0xffd700, 0.8)
        .setDepth(3);
    
    // Clock ticks (12 hour markers)
    for (let i = 0; i < 12; i++) {
        const angle = (i * 30 - 90) * Math.PI / 180;
        const x = 1250 + Math.cos(angle) * 70;
        const y = 280 + Math.sin(angle) * 70;
        this.add.circle(x, y, 4, 0xffd700, 0.6).setDepth(3);
    }
    
    // Clock hands
    const hourHand = this.add.rectangle(1250, 280, 8, 80, 0xffd700, 0.6)
        .setOrigin(0.5, 1).setDepth(4);
    const minuteHand = this.add.rectangle(1250, 280, 6, 120, 0xffd700, 0.8)
        .setOrigin(0.5, 1).setDepth(4);
    
    // Rotate clock hands continuously
    this.tweens.add({
        targets: hourHand,
        angle: 360,
        duration: 20000,
        repeat: -1,
        ease: 'Linear'
    });
    
    this.tweens.add({
        targets: minuteHand,
        angle: 360,
        duration: 3000,
        repeat: -1,
        ease: 'Linear'
    });
    
    // Spinning time particles around clock
    const clockParticles = this.add.particles(1250, 280, 'default', {
        speed: { min: 30, max: 60 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.6, end: 0 },
        alpha: { start: 0.8, end: 0 },
        tint: [0xffd700, 0xed8936],
        lifespan: 2000,
        frequency: 200,
        quantity: 1,
        blendMode: 'ADD'
    }).setDepth(2);
    
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
    
    const taglineText = '"You\'ve lived this day before. You\'ll live it again. Unless you remember."';
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
    
    // Show sound prompt after a delay
    this.time.delayedCall(1000, () => {
        this.showSoundPrompt();
    });
};

TitleScene.prototype.showSoundPrompt = function() {
    // Create pulsing overlay to prompt for click
    this.soundPromptOverlay = this.add.rectangle(700, 450, 1400, 900, 0x000000, 0.3)
        .setDepth(1000)
        .setInteractive();
    
    this.tweens.add({
        targets: this.soundPromptOverlay,
        alpha: 0.5,
        duration: 1000,
        yoyo: true,
        repeat: -1
    });
    
    // Sound icon
    this.soundPromptIcon = this.add.text(700, 380, '🔊', {
        font: 'bold 80px monospace'
    }).setOrigin(0.5).setDepth(1001);
    
    // Bouncing animation
    this.tweens.add({
        targets: this.soundPromptIcon,
        scale: 1.2,
        duration: 600,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
    });
    
    // Prompt text
    this.soundPromptText = this.add.text(700, 500, 'CLICK ANYWHERE TO START WITH SOUND', {
        font: 'bold 32px monospace',
        fill: '#ffd700',
        stroke: '#000000',
        strokeThickness: 4
    }).setOrigin(0.5).setDepth(1001);
    
    // Pulse text
    this.tweens.add({
        targets: this.soundPromptText,
        alpha: 0.6,
        duration: 800,
        yoyo: true,
        repeat: -1
    });
    
    // Remove prompt on first click
    this.soundPromptOverlay.once('pointerdown', () => {
        this.tweens.killTweensOf([this.soundPromptOverlay, this.soundPromptIcon, this.soundPromptText]);
        
        this.tweens.add({
            targets: [this.soundPromptOverlay, this.soundPromptIcon, this.soundPromptText],
            alpha: 0,
            duration: 400,
            onComplete: () => {
                this.soundPromptOverlay.destroy();
                this.soundPromptIcon.destroy();
                this.soundPromptText.destroy();
            }
        });
    });
};

TitleScene.prototype.startMusic = function() {
    try {
        if (!this.music) {
            this.music = this.sound.add('music_main', {
                volume: 0.25,
                loop: true
            });
            this.music.play();
            console.log('✅ Title music started');
        }
    } catch (e) {
        console.log('Music start failed:', e);
    }
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
        { icon: '🎯', title: 'YOUR MISSION', text: 'Find all differences to survive each day and escape the loop' },
        { icon: '⏰', title: 'TIME PRESSURE', text: '90 seconds per day. Green is safe. Red means danger.' },
        { icon: '🔍', title: 'WHAT CHANGES', text: 'Colors fade. Objects move. Sizes shift. Nothing is safe.' },
        { icon: '💡', title: 'HINTS', text: 'Only 3 hints for your entire journey. Use them when desperate.' },
        { icon: '⚡', title: 'COMBO BONUS', text: 'Find fast = more points: 2x = +15 | 3x = +20 | 5x = +30' },
        { icon: '📖', title: 'THE MYSTERY', text: 'Each day reveals why you\'re trapped. Pay attention.' }
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
    // Add cache busting to prevent browser from using old cached sounds
    const cacheBuster = '?v=' + Date.now();
    this.load.audio('sfx_correct', 'assets/audio/correct.wav' + cacheBuster);
    this.load.audio('sfx_wrong', 'assets/audio/wrong.wav' + cacheBuster);
    this.load.audio('sfx_tick', 'assets/audio/tick.wav' + cacheBuster);
    this.load.audio('sfx_dayComplete', 'assets/audio/fanfare.wav' + cacheBuster);
    this.load.audio('sfx_whoosh', 'assets/audio/whoosh.wav' + cacheBuster);
    this.load.audio('sfx_timesUp', 'assets/audio/timesup.wav' + cacheBuster);
    this.load.audio('sfx_hint', 'assets/audio/hint.wav' + cacheBuster);
};

// ============================================================
// CREATE - Initialize Game
// ============================================================

MainScene.prototype.create = function() {
    // === DIFFICULTY SETTINGS ===
    const difficulty = GameData.getDifficulty();
    const difficultySettings = {
        easy: { time: 120000, hints: 5, requiredPerDay: [2, 2, 3, 3, 4, 4, 5] },      // Smooth progression
        normal: { time: 90000, hints: 3, requiredPerDay: [2, 2, 3, 3, 4, 5, 5] },     // Gradual increase
        hard: { time: 60000, hints: 1, requiredPerDay: [2, 3, 4, 4, 5, 5, 6] }        // Challenging but fair
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
    this.comboFadeTimer = null; // Track combo fade timeout
    this.totalDifferencesFound = 0; // Track all differences found this run
    this.perfectDaysCount = 0; // Track perfect days this run
    
    // Required differences per day (from difficulty)
    this.requiredPerDay = settings.requiredPerDay;
    
    // Memory fragments system - track previous object states
    this.previousObjectStates = [];
    this.memoryFragments = []; // Active memory ghost visuals
    
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
    
    // === DAY COMPLETE MESSAGES - Reveal story progressively ===
    this.dayCompleteMessages = {
        1: "Something's wrong. You feel it in your bones.\n\nThe room... it will change again tomorrow.",
        2: "You're starting to remember. Fragments. Whispers.\n\nThis has happened before. Many times before.",
        3: "The loop tightens. Objects shift when you're not looking.\n\nYou need to pay closer attention.",
        4: "Every difference you find brings a memory back.\n\nBut memories can be lies. Can you trust them?",
        5: "You're getting closer to the truth.\n\nThe room is trying to tell you something.",
        6: "Almost there. One more day.\n\nThe loop is weakening. You can feel it.",
        7: "You found them all. Every single change.\n\nNow... can you escape?"
    };
    
    // === STORY TEXT - Progressive mystery building ===
    this.storyText = {
        1: "DAY 1\n\nYour alarm didn't ring.\nThe coffee tastes... wrong.\n\nWhy does everything feel like déjà vu?",
        2: "DAY 2\n\nYou've seen this clock before.\nThis exact angle. This exact moment.\n\nHow many times have you woken up here?",
        3: "DAY 3\n\nThe walls are changing.\nOr are you forgetting what they looked like?\n\nMemories blur. Reality shifts.",
        4: "DAY 4\n\nThat photo on the wall...\nWas it always there?\n\nWho is she? Why can't you remember her face?",
        5: "DAY 5\n\nTime stopped moving forward.\nYou're caught in the loop.\n\nEvery object tells a story you've forgotten.",
        6: "DAY 6\n\nFragments return. A choice. A mistake.\n\nThis room is your prison.\nThe differences are the key.",
        7: "DAY 7\n\nThe final day. The final chance.\n\nFind the truth in what has changed.\nBreak free, or loop forever."
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
        this.sfx.correct = this.sound.add('sfx_correct', { volume: 0.5 });  // Softer for long sessions
        this.sfx.wrong = this.sound.add('sfx_wrong', { volume: 0.7 });
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
    // Background - Day 7 gets ominous red tint
    let bgColor = 0x2d3748;
    if (this.currentDay === 7) {
        bgColor = 0x3d2738; // Dark reddish for final day
    }
    
    const bg = this.add.rectangle(700, 450, 1400, 900, bgColor);
    
    // Day 7: Pulsing ominous effect
    if (this.currentDay === 7) {
        this.tweens.add({
            targets: bg,
            alpha: { from: 1, to: 0.85 },
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
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
            if (obj.glow) {
                this.tweens.killTweensOf(obj.glow);
                obj.glow.setAlpha(0);
            }
            const currentState = obj.data.states[obj.stateIndex];
            if (currentState) {
                obj.setScale(currentState.scale || 1);
            }
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
    
    // Combo display at center-bottom (hidden by default)
    this.comboText = this.add.text(700, 800, '', {
        font: 'bold 38px monospace',
        fill: '#ffd700',
        stroke: '#000000',
        strokeThickness: 5
    }).setOrigin(0.5).setAlpha(0).setDepth(55);
    
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
        y: { min: 0, max: 900 },
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
        '🔍 YOUR MISSION\n\n' +
        'The room changes every day.\nSomething is different. Something is WRONG.\n\n' +
        '👆 TAP objects that have changed\n\n' +
        '⏱️ Beat the clock to survive the day\n\n' +
        '✅ Correct find: +10 pts | ❌ Wrong guess: -5 pts\n\n' +
        '💡 Stuck? Use HINT (3 per game) but choose wisely!', {
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
// APPLY UI DECAY - Progressive alpha reduction per day
// ============================================================

MainScene.prototype.applyUIDecay = function() {
    // Alpha values per day
    const alphaValues = {
        1: 1.0,
        2: 0.95,
        3: 0.9,
        4: 0.85,
        5: 0.8,
        6: 0.75,
        7: 0.7
    };
    
    const alpha = alphaValues[this.currentDay] || 1.0;
    console.log(`🎨 UI Decay applied - Day ${this.currentDay}: Alpha ${alpha}${this.currentDay === 7 ? ' + RED TINT' : ''}`);
    
    // Apply alpha to UI elements
    if (this.dayText) this.dayText.setAlpha(alpha);
    if (this.scoreText) this.scoreText.setAlpha(alpha);
    if (this.foundText) this.foundText.setAlpha(alpha);
    if (this.timerBar) this.timerBar.setAlpha(alpha);
    if (this.timerBarBg) this.timerBarBg.setAlpha(alpha);
    if (this.timerText) this.timerText.setAlpha(alpha);
    
    // Day 7: Add red tint to UI elements
    if (this.currentDay === 7) {
        if (this.dayText) this.dayText.setTint(0xff6b6b);
        if (this.scoreText) this.scoreText.setTint(0xff6b6b);
        if (this.foundText) this.foundText.setTint(0xff6b6b);
        if (this.timerText) this.timerText.setTint(0xff6b6b);
    }
};

// ============================================================
// START DAY - Initialize day state
// ============================================================

MainScene.prototype.startDay = function() {
    this.foundThisDay = 0;
    this.applyDayChanges();
    this.updateUI();
    
    // Apply UI decay effect
    this.applyUIDecay();
    
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
// STORE PREVIOUS STATES - Save positions before changing day
// ============================================================

MainScene.prototype.storePreviousStates = function() {
    this.previousObjectStates = this.objects.map(obj => {
        const state = obj.data.states[obj.stateIndex];
        if (!state) {
            console.error(`Invalid stateIndex ${obj.stateIndex} for object ${obj.data.name}`);
            return null;
        }
        return {
            name: obj.data.name,
            x: obj.x,
            y: obj.y,
            stateIndex: obj.stateIndex,
            color: state.color,
            scale: state.scale || 1,
            angle: state.angle || 0
        };
    }).filter(state => state !== null);
};

// ============================================================
// APPLY DAY CHANGES - Set object states
// ============================================================

MainScene.prototype.applyDayChanges = function() {
    // Store previous state before applying changes
    if (this.currentDay > 1) {
        this.storePreviousStates();
    }
    
    const changedObjects = this.dayChanges[this.currentDay];
    
    this.objects.forEach(obj => {
        obj.found = false;
        obj.isDifference = false;
        
        // Kill any existing tweens
        this.tweens.killTweensOf(obj);
        
        if (changedObjects.includes(obj.data.name)) {
            // This object is a difference today
            obj.isDifference = true;
            obj.stateIndex = this.currentDay - 1; // Use 0-based index (Day 1 = index 0, Day 7 = index 6)
            
            // Add SUBTLE pulse to differences (helps players find them)
            this.time.delayedCall(2000, () => {
                if (!obj.found && obj.isDifference) {
                    const currentState = obj.data.states[obj.stateIndex];
                    if (currentState) {
                        this.tweens.add({
                            targets: obj,
                            scaleX: (currentState.scale || 1) * 1.03,
                            scaleY: (currentState.scale || 1) * 1.03,
                            duration: 2000,
                            yoyo: true,
                            repeat: -1,
                            ease: 'Sine.easeInOut'
                        });
                    }
                }
            });
        } else {
            obj.stateIndex = 0;
        }
        
        // Apply visual state with safety check
        const state = obj.data.states[obj.stateIndex];
        if (state) {
            obj.setFillStyle(state.color);
            obj.setAlpha(state.alpha);
            obj.setScale(state.scale || 1);
            obj.setAngle(state.angle || 0);
        }
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
        this.totalDifferencesFound++; // Track lifetime stat
        
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
        
        // Scale bounce (with safety check)
        const currentObjState = obj.data.states[obj.stateIndex];
        if (currentObjState) {
            this.tweens.add({
                targets: obj,
                scale: (currentObjState.scale || 1) * 1.4,
                duration: 200,
                yoyo: true,
                ease: 'Elastic.easeOut'
            });
        }
        
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
        
        // Particle burst effect
        this.createParticleBurst(obj.x, obj.y, 0x68d391);
        
        // Show memory fragment (ghost of previous state)
        this.showMemoryFragment(obj);
        
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
        
        // Update combo display with scale animation and color
        if (this.combo >= 2) {
            console.log(`🔥 COMBO x${this.combo} - Displaying at center-bottom`);
            
            // Clear existing fade timer
            if (this.comboFadeTimer) {
                this.comboFadeTimer.remove();
                this.comboFadeTimer = null;
            }
            
            // Update text
            this.comboText.setText(`🔥 COMBO x${this.combo}`);
            
            // Determine color based on combo level
            let comboColor = '#ffd700'; // Gold (2-3x)
            if (this.combo >= 6) {
                comboColor = '#ff1493'; // Pink/intense (6+)
            } else if (this.combo >= 4) {
                comboColor = '#ff6347'; // Red/excited (4-5x)
            }
            this.comboText.setColor(comboColor);
            
            // Scale animation: 1 → 1.3 → 1
            this.comboText.setAlpha(1);
            this.tweens.add({
                targets: this.comboText,
                scale: 1.3,
                duration: 100,
                yoyo: true,
                ease: 'Back.easeOut'
            });
            
            // Set fade out timer (1 second)
            this.comboFadeTimer = this.time.delayedCall(1000, () => {
                this.tweens.add({
                    targets: this.comboText,
                    alpha: 0,
                    duration: 300
                });
                this.comboFadeTimer = null;
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
        
        // Clear combo fade timer and hide combo text
        if (this.comboFadeTimer) {
            this.comboFadeTimer.remove();
            this.comboFadeTimer = null;
        }
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
        
        // Screen shake on wrong click
        this.cameras.main.shake(200, 0.01);
        
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
    
    // Track perfect day
    if (this.perfectDay && this.wrongClicks === 0) {
        this.perfectDaysCount++;
    }
    
    // Day completion title
    const titleText = this.add.text(700, 250, `DAY ${this.currentDay} SURVIVED`, {
        font: 'bold 56px monospace',
        fill: '#68d391',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 6
    }).setOrigin(0.5).setAlpha(0).setDepth(50);
    
    // Story message for completed day
    const storyMsg = this.add.text(700, 400, this.dayCompleteMessages[this.currentDay], {
        font: 'bold 24px monospace',
        fill: '#f7fafc',
        align: 'center',
        lineSpacing: 8,
        wordWrap: { width: 900 },
        stroke: '#000000',
        strokeThickness: 3
    }).setOrigin(0.5).setAlpha(0).setDepth(50);
    
    // Show day stats
    const statsText = this.add.text(700, 600, 
        `Score Earned: +${this.foundThisDay * 10}\nTotal: ${this.score} | Best Combo: ${this.maxCombo}x`, {
        font: 'bold 24px monospace',
        fill: '#ffd700',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 3,
        lineSpacing: 5,
        wordWrap: { width: 800 }
    }).setOrigin(0.5).setAlpha(0).setDepth(50);
    
    this.tweens.add({
        targets: titleText,
        alpha: 1,
        scale: { from: 0.5, to: 1 },
        duration: 600,
        ease: 'Back.easeOut'
    });
    
    this.tweens.add({
        targets: storyMsg,
        alpha: 1,
        duration: 800,
        delay: 400
    });
    
    this.tweens.add({
        targets: statsText,
        alpha: 1,
        duration: 600,
        delay: 800,
        ease: 'Back.easeOut'
    });
    
    // Show story after 3s
    this.time.delayedCall(3000, () => {
        this.tweens.add({
            targets: [titleText, storyMsg, statsText],
            alpha: 0,
            duration: 400,
            onComplete: () => {
                titleText.destroy();
                storyMsg.destroy();
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
    this.dayRetries = 0;
    this.perfectDay = true;
    
    // Update progress dots for completed day
    this.progressDots.forEach((dot, i) => {
        if (i < this.currentDay) {
            dot.setFillStyle(0xed8936);
        }
    });
    
    // Check if we just completed Day 7
    if (this.currentDay === this.maxDays) {
        this.showEnding();
    } else {
        // Move to next day
        this.currentDay++;
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
    
    // Apply Day 7 glitch effect BEFORE showing text
    if (this.currentDay === 7) {
        this.applyDay7StartGlitchEffect(overlay, dayNum, story);
        return; // Early return, glitch effect will handle the rest
    }
    
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
        console.log(`Story Interlude: Clicked continue for Day ${this.currentDay}`);
        
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
                
                // Use delayedCall instead of unreliable camera callback
                this.time.delayedCall(450, () => {
                    console.log(`Story Interlude: Fade complete, starting Day ${this.currentDay}`);
                    
                    // Reset objects to base state with safety check
                    this.objects.forEach(obj => {
                        obj.found = false;
                        obj.isDifference = false;
                        obj.stateIndex = 0;
                        const state = obj.data.states[0];
                        if (state) {
                            obj.setFillStyle(state.color);
                            obj.setAlpha(state.alpha);
                            obj.setScale(state.scale || 1);
                            obj.setAngle(state.angle || 0);
                        }
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
    console.log('=== SHOW ENDING CALLED ===');
    
    // Stop all sounds
    if (this.music) this.music.stop();
    
    // Show dramatic victory screen
    console.log('Calling showVictoryScreen...');
    this.showVictoryScreen();
};

MainScene.prototype.showCongratulations = function() {
    // Congratulations overlay
    const bg = this.add.rectangle(700, 450, 1400, 900, 0x000000, 0)
        .setDepth(800);
    
    this.tweens.add({
        targets: bg,
        alpha: 0.9,
        duration: 800
    });
    
    // Victory text
    const congrats = this.add.text(700, 350, '🎉 CONGRATULATIONS! 🎉', {
        font: 'bold 72px monospace',
        fill: '#ffd700',
        stroke: '#000000',
        strokeThickness: 10,
        align: 'center'
    }).setOrigin(0.5).setDepth(801).setAlpha(0).setScale(0.5);
    
    this.tweens.add({
        targets: congrats,
        alpha: 1,
        scale: 1,
        duration: 1000,
        delay: 500,
        ease: 'Elastic.easeOut'
    });
    
    // Success message
    const message = this.add.text(700, 500, 'You broke the time loop!\n\nYou are finally FREE!', {
        font: 'bold 36px monospace',
        fill: '#68d391',
        stroke: '#000000',
        strokeThickness: 5,
        align: 'center',
        lineSpacing: 10
    }).setOrigin(0.5).setDepth(801).setAlpha(0);
    
    this.tweens.add({
        targets: message,
        alpha: 1,
        duration: 800,
        delay: 1200
    });
    
    // Play celebration sound
    this.time.delayedCall(500, () => {
        this.playSound('dayComplete');
    });
    
    // Continue prompt
    const continueText = this.add.text(700, 650, 'Click to see your ending...', {
        font: '28px monospace',
        fill: '#cbd5e0'
    }).setOrigin(0.5).setDepth(801).setAlpha(0);
    
    this.tweens.add({
        targets: continueText,
        alpha: 1,
        duration: 600,
        delay: 2000,
        yoyo: true,
        repeat: -1
    });
    
    // Click to continue to full ending
    bg.setInteractive();
    bg.once('pointerup', () => {
        this.tweens.add({
            targets: [bg, congrats, message, continueText],
            alpha: 0,
            duration: 600,
            onComplete: () => {
                bg.destroy();
                congrats.destroy();
                message.destroy();
                continueText.destroy();
                this.showFullEnding();
            }
        });
    });
};

MainScene.prototype.showFullEnding = function() {
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
        font: 'bold 24px monospace',
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
// MEMORY FRAGMENT - Show ghost of previous state
// ============================================================

MainScene.prototype.showMemoryFragment = function(obj) {
    // Find previous state for this object
    const prevState = this.previousObjectStates.find(state => state.name === obj.data.name);
    
    if (!prevState) {
        console.log('💭 No memory fragment (Day 1 or no previous state)');
        return; // No previous state (Day 1)
    }
    
    // Verify current state exists
    const currentState = obj.data.states[obj.stateIndex];
    if (!currentState) {
        console.error(`Invalid stateIndex ${obj.stateIndex} for object ${obj.data.name}`);
        return;
    }
    
    console.log(`👻 Showing memory fragment for ${obj.data.name} at (${prevState.x}, ${prevState.y})`);
    
    // Create ghost rectangle at PREVIOUS position
    const ghost = this.add.rectangle(
        prevState.x,
        prevState.y,
        obj.width * prevState.scale,
        obj.height * prevState.scale,
        0x68d391, // Green
        0.3 // Alpha 0.3
    ).setDepth(49)
     .setAngle(prevState.angle)
     .setStrokeStyle(3, 0x68d391, 1); // Dashed effect simulation
    
    // Make stroke dashed-looking by adding multiple thin rectangles
    const dashCount = 8;
    const dashGraphics = this.add.graphics().setDepth(49);
    dashGraphics.lineStyle(3, 0x68d391, 1);
    
    const width = obj.width * prevState.scale;
    const height = obj.height * prevState.scale;
    
    // Draw dashed outline
    for (let i = 0; i < dashCount; i++) {
        const dashLength = width / dashCount;
        // Top edge
        if (i % 2 === 0) {
            dashGraphics.lineBetween(
                prevState.x - width/2 + i * dashLength,
                prevState.y - height/2,
                prevState.x - width/2 + (i + 1) * dashLength,
                prevState.y - height/2
            );
        }
        // Bottom edge
        if (i % 2 === 0) {
            dashGraphics.lineBetween(
                prevState.x - width/2 + i * dashLength,
                prevState.y + height/2,
                prevState.x - width/2 + (i + 1) * dashLength,
                prevState.y + height/2
            );
        }
    }
    
    for (let i = 0; i < dashCount; i++) {
        const dashLength = height / dashCount;
        // Left edge
        if (i % 2 === 0) {
            dashGraphics.lineBetween(
                prevState.x - width/2,
                prevState.y - height/2 + i * dashLength,
                prevState.x - width/2,
                prevState.y - height/2 + (i + 1) * dashLength
            );
        }
        // Right edge
        if (i % 2 === 0) {
            dashGraphics.lineBetween(
                prevState.x + width/2,
                prevState.y - height/2 + i * dashLength,
                prevState.x + width/2,
                prevState.y - height/2 + (i + 1) * dashLength
            );
        }
    }
    
    dashGraphics.strokePath();
    
    // Memory label text
    const memoryText = this.add.text(
        prevState.x,
        prevState.y - (obj.height * prevState.scale / 2) - 25,
        `Memory: ${obj.data.name}`,
        {
            font: 'bold 18px monospace',
            fill: '#68d391',
            stroke: '#000000',
            strokeThickness: 3,
            backgroundColor: '#1a202c',
            padding: { x: 8, y: 4 }
        }
    ).setOrigin(0.5).setDepth(50).setAlpha(0);
    
    // Fade in text
    this.tweens.add({
        targets: memoryText,
        alpha: 1,
        duration: 300
    });
    
    // Hold for 2 seconds, then fade out
    this.time.delayedCall(2000, () => {
        this.tweens.add({
            targets: [ghost, dashGraphics, memoryText],
            alpha: 0,
            duration: 800,
            onComplete: () => {
                ghost.destroy();
                dashGraphics.destroy();
                memoryText.destroy();
            }
        });
    });
    
    // Track for cleanup
    this.memoryFragments.push({ ghost, dashGraphics, memoryText });
};

// ============================================================
// PARTICLE BURST - Celebratory effect on correct finds
// ============================================================

MainScene.prototype.createParticleBurst = function(x, y, color) {
    const particleCount = 15;
    
    for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        const speed = 100 + Math.random() * 100;
        
        const particle = this.add.circle(x, y, 3 + Math.random() * 4, color)
            .setAlpha(0.8);
        
        this.tweens.add({
            targets: particle,
            x: x + Math.cos(angle) * speed,
            y: y + Math.sin(angle) * speed,
            alpha: 0,
            scale: 0,
            duration: 600 + Math.random() * 400,
            ease: 'Power2',
            onComplete: () => particle.destroy()
        });
    }
};

// ============================================================
// DAY 7 START GLITCH EFFECT - Dramatic visual intro
// ============================================================

MainScene.prototype.applyDay7StartGlitchEffect = function(overlay, dayNum, story) {
    console.log('⚡ APPLYING DAY 7 START GLITCH EFFECT ⚡');
    console.log('Creating white glitch bars and red flash...');
    
    // Create glitch bars (vertical white lines)
    const glitchPositions = [200, 500, 1000, 1200];
    const glitchBars = [];
    
    glitchPositions.forEach((x, index) => {
        const bar = this.add.rectangle(x, 450, 8, 0, 0xffffff, 0.9)
            .setDepth(605)
            .setOrigin(0.5, 0.5);
        glitchBars.push(bar);
        
        // Animate: scaleY 0 → 1 → 0, repeat 3 times
        this.time.delayedCall(index * 100, () => {
            this.tweens.add({
                targets: bar,
                height: { from: 0, to: 900 },
                duration: 150,
                yoyo: true,
                repeat: 2, // Total 3 times (initial + 2 repeats)
                ease: 'Cubic.easeInOut',
                onComplete: () => {
                    bar.destroy();
                }
            });
        });
    });
    
    // Red flash overlay
    const redFlash = this.add.rectangle(700, 450, 1400, 900, 0xff0000, 0)
        .setDepth(604);
    
    this.time.delayedCall(300, () => {
        this.tweens.add({
            targets: redFlash,
            alpha: 0.2,
            duration: 100,
            yoyo: true,
            repeat: 0,
            onComplete: () => {
                redFlash.destroy();
            }
        });
    });
    
    // Special Day 7 title with effect
    const specialTitle = this.add.text(700, 300, 'DAY 7: THE FINAL LOOP', {
        font: 'bold 72px monospace',
        fill: '#ff0000',
        stroke: '#000000',
        strokeThickness: 8
    }).setOrigin(0.5).setDepth(606).setAlpha(0);
    
    // Fade in the dramatic title
    this.time.delayedCall(600, () => {
        this.tweens.add({
            targets: specialTitle,
            alpha: 1,
            scale: 1,
            duration: 800,
            ease: 'Back.easeOut'
        });
        
        // Play whoosh sound
        this.playSound('whoosh');
    });
    
    // Fade in story after title
    this.time.delayedCall(1800, () => {
        this.tweens.add({
            targets: story,
            alpha: 1,
            duration: 1000
        });
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
        delay: 3000,
        yoyo: true,
        repeat: -1
    });
    
    // Click to continue
    overlay.setInteractive();
    overlay.once('pointerdown', () => {
        console.log('Day 7 glitch: Clicked continue');
        
        this.tweens.add({
            targets: [overlay, specialTitle, story, continueText],
            alpha: 0,
            duration: 600,
            onComplete: () => {
                overlay.destroy();
                specialTitle.destroy();
                story.destroy();
                continueText.destroy();
                
                // Camera fade transition
                this.cameras.main.fadeOut(400, 0, 0, 0);
                
                this.time.delayedCall(450, () => {
                    console.log('Day 7: Starting gameplay');
                    
                    // Reset objects to base state
                    this.objects.forEach(obj => {
                        obj.found = false;
                        obj.isDifference = false;
                        obj.stateIndex = 0;
                        const state = obj.data.states[0];
                        if (state) {
                            obj.setFillStyle(state.color);
                            obj.setAlpha(state.alpha);
                            obj.setScale(state.scale || 1);
                            obj.setAngle(state.angle || 0);
                        }
                    });
                    
                    this.cameras.main.fadeIn(400, 0, 0, 0);
                    this.startDay();
                });
            }
        });
    });
};

// ============================================================
// DAY 7 GLITCH EFFECT - Dramatic visual distortion (old version, kept for compatibility)
// ============================================================

MainScene.prototype.applyDay7GlitchEffect = function() {
    // Chromatic aberration simulation
    const glitchDuration = 2000;
    
    // Red glitch layer
    const redGlitch = this.add.rectangle(700, 450, 1400, 900, 0xff0000, 0.1)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setDepth(500);
    
    this.tweens.add({
        targets: redGlitch,
        x: 705,
        alpha: { from: 0.1, to: 0 },
        duration: glitchDuration,
        yoyo: true,
        repeat: 2,
        onComplete: () => redGlitch.destroy()
    });
    
    // Blue glitch layer
    const blueGlitch = this.add.rectangle(700, 450, 1400, 900, 0x0000ff, 0.1)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setDepth(500);
    
    this.tweens.add({
        targets: blueGlitch,
        x: 695,
        alpha: { from: 0.1, to: 0 },
        duration: glitchDuration,
        yoyo: true,
        repeat: 2,
        onComplete: () => blueGlitch.destroy()
    });
    
    // Screen distortion
    this.cameras.main.shake(300, 0.005);
    
    // Static noise effect
    const noiseInterval = this.time.addEvent({
        delay: 50,
        repeat: 40,
        callback: () => {
            const noise = this.add.rectangle(
                Math.random() * 1400,
                Math.random() * 900,
                Math.random() * 200 + 50,
                Math.random() * 100 + 20,
                0xffffff,
                Math.random() * 0.3
            ).setDepth(500);
            
            this.time.delayedCall(100, () => noise.destroy());
        }
    });
};

// ============================================================
// DRAMATIC VICTORY SCREEN - After Day 7 completion
// ============================================================

MainScene.prototype.showVictoryScreen = function() {
    console.log('Victory Screen: Starting');
    
    // Pause game and unlock special achievement
    this.isPaused = true;
    
    // Disable UI buttons so they don't block clicks
    if (this.musicBtn) this.musicBtn.disableInteractive();
    if (this.hintBtn) this.hintBtn.disableInteractive();
    if (this.pauseBtn) this.pauseBtn.disableInteractive();
    
    this.unlockAchievement(ACHIEVEMENTS.ESCAPED);
    
    // 1. Fade room to black
    this.cameras.main.fadeOut(1000, 0, 0, 0);
    
    // Use delayedCall instead of camera callback for reliability
    this.time.delayedCall(1100, () => {
        console.log('Victory Screen: Fade complete, showing content');
        console.log('Creating overlay and particles...');
        
        // Create particle explosion effect (exploding clock)
        this.createTimeParticleExplosion();
        
        // 2. BRIGHT TEST overlay background - DEPTH 1200+ (using magenta to test)
        const overlay = this.add.rectangle(700, 450, 1400, 900, 0xff00ff, 1.0)
            .setDepth(1200);
        
        console.log('Overlay created:', overlay);
        
        // TEST TEXT to verify rendering
        const testText = this.add.text(700, 100, 'VICTORY SCREEN ACTIVE', {
            font: 'bold 40px Arial',
            fill: '#00ff00',
            backgroundColor: '#000000'
        }).setOrigin(0.5).setDepth(1210);
        console.log('Test text created:', testText);
        
        // 3. Big glowing title "THE LOOP IS BROKEN" - DEPTH 1201+
        const title = this.add.text(700, 200, 'THE LOOP IS BROKEN', {
            font: 'bold 72px monospace',
            fill: '#ffd700',
            stroke: '#ff6b35',
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(1201).setAlpha(0);
        
        // Glow effect on title
        this.tweens.add({
            targets: title,
            alpha: 1,
            scale: 1.05,
            duration: 1500,
            ease: 'Power2',
            yoyo: true,
            repeat: -1
        });
        
        // Play victory sound
        this.time.delayedCall(300, () => {
            this.playSound('dayComplete');
        });
        
        // 4. Story text (typing effect) - DEPTH 1201
        const storyText = "Day after day, memory faded.\nBut you remembered the truth.\nThe room was your prison of regret.\nNow, time moves forward.";
        
        const story = this.add.text(700, 350, '', {
            font: '28px monospace',
            fill: '#cbd5e0',
            align: 'center',
            lineSpacing: 12,
            wordWrap: { width: 1000 }
        }).setOrigin(0.5).setDepth(1201);
        
        // Type out story text
        let charIndex = 0;
        const typeInterval = this.time.addEvent({
            delay: 50,
            repeat: storyText.length - 1,
            callback: () => {
                story.text += storyText[charIndex];
                charIndex++;
            }
        });
        
        // 5. Show stats after story completes
        this.time.delayedCall(storyText.length * 50 + 1000, () => {
            console.log('Victory Screen: Showing stats');
            this.showVictoryStats(overlay);
        });
    });
};

MainScene.prototype.showVictoryStats = function(overlay) {
    console.log('Victory Stats: Displaying stats');
    
    // Calculate stats for this run
    const totalAchievements = Object.keys(ACHIEVEMENTS).length;
    const unlockedCount = GameData.data.achievements.length;
    const perfectDays = this.perfectDaysCount;
    const playTime = Math.floor((Date.now() - this.gameStartTime) / 1000);
    const minutes = Math.floor(playTime / 60);
    const seconds = playTime % 60;
    
    // Update lifetime stats in GameData
    console.log('📊 Updating lifetime stats:', {
        totalTime: playTime,
        score: this.score,
        difficulty: this.difficulty,
        differencesFound: this.totalDifferencesFound,
        perfectDays: perfectDays
    });
    GameData.updateLifetimeStats({
        totalTime: playTime,
        score: this.score,
        difficulty: this.difficulty,
        differencesFound: this.totalDifferencesFound,
        perfectDays: perfectDays
    });
    
    // Get lifetime stats
    const lifetimeWins = GameData.data.totalGamesCompleted;
    const bestTime = GameData.data.bestTimeAnyMode;
    const bestMinutes = Math.floor(bestTime / 60);
    const bestSeconds = bestTime % 60;
    const totalDiffs = GameData.data.totalDifferencesFound;
    
    // Stats container - DEPTH 1202+
    const statsBox = this.add.rectangle(700, 550, 800, 280, 0x1a202c, 0.9)
        .setStrokeStyle(3, 0xed8936)
        .setDepth(1202)
        .setAlpha(0);
    
    const statsTitle = this.add.text(700, 435, '═══ YOUR JOURNEY ═══', {
        font: 'bold 28px monospace',
        fill: '#ed8936'
    }).setOrigin(0.5).setDepth(1203).setAlpha(0);
    
    // This run stats
    const runStatsText = this.add.text(700, 500, 
        `Stats This Run:\nScore ${this.score} | Time ${minutes}:${seconds.toString().padStart(2, '0')} | Perfect Days ${perfectDays}`, {
        font: 'bold 20px monospace',
        fill: '#68d391',
        align: 'center',
        lineSpacing: 6
    }).setOrigin(0.5).setDepth(1203).setAlpha(0);
    
    // Lifetime stats
    const lifetimeStatsText = this.add.text(700, 590, 
        `Lifetime:\n${lifetimeWins} Wins | Best Time ${bestMinutes}:${bestSeconds.toString().padStart(2, '0')} | ${totalDiffs.toLocaleString()} Total Differences`, {
        font: 'bold 20px monospace',
        fill: '#ffd700',
        align: 'center',
        lineSpacing: 6
    }).setOrigin(0.5).setDepth(1203).setAlpha(0);
    
    // Achievement icons display
    const achievementText = this.add.text(700, 660, 
        `Achievements: ${unlockedCount}/${totalAchievements} Unlocked`, {
        font: 'bold 18px monospace',
        fill: '#cbd5e0'
    }).setOrigin(0.5).setDepth(1203).setAlpha(0);
    
    // Fade in stats
    this.tweens.add({
        targets: [statsBox, statsTitle, runStatsText, lifetimeStatsText, achievementText],
        alpha: 1,
        duration: 800,
        ease: 'Power2'
    });
    
    // 7. Show buttons
    this.time.delayedCall(1200, () => {
        console.log('Victory Stats: Showing buttons');
        this.createVictoryButtons(overlay);
    });
};

MainScene.prototype.createVictoryButtons = function(overlay) {
    console.log('Victory Buttons: Creating interactive buttons');
    
    const buttonY = 720;
    const buttonData = [
        { text: '↻ REPLAY', x: 400, color: 0x68d391, action: 'replay' },
        { text: '🏆 ACHIEVEMENTS', x: 700, color: 0xffd700, action: 'achievements' },
        { text: '← MAIN MENU', x: 1000, color: 0x4299e1, action: 'menu' }
    ];
    
    buttonData.forEach(data => {
        const btn = this.add.rectangle(data.x, buttonY, 260, 60, data.color)
            .setDepth(1204)
            .setAlpha(0)
            .setInteractive({ useHandCursor: true });
        
        const btnText = this.add.text(data.x, buttonY, data.text, {
            font: 'bold 22px monospace',
            fill: '#000000'
        }).setOrigin(0.5).setDepth(1205).setAlpha(0);
        
        // Fade in buttons
        this.tweens.add({
            targets: [btn, btnText],
            alpha: 1,
            duration: 600,
            delay: 200 * buttonData.indexOf(data),
            ease: 'Back.easeOut'
        });
        
        // Hover effects
        btn.on('pointerover', () => {
            this.tweens.add({
                targets: [btn, btnText],
                scale: 1.1,
                duration: 200
            });
            this.playSound('click');
        });
        
        btn.on('pointerout', () => {
            this.tweens.add({
                targets: [btn, btnText],
                scale: 1,
                duration: 200
            });
        });
        
        // Button actions with proper scene restart
        btn.on('pointerup', () => {
            console.log('Victory Button clicked:', data.action);
            this.playSound('click');
            
            if (data.action === 'replay') {
                // Reset game and start from Day 1
                this.cameras.main.fadeOut(500, 0, 0, 0);
                this.time.delayedCall(600, () => {
                    this.scene.restart();
                });
            } else if (data.action === 'achievements') {
                // Go to achievements/credits scene
                this.cameras.main.fadeOut(500, 0, 0, 0);
                this.time.delayedCall(600, () => {
                    this.scene.start('CreditsScene');
                });
            } else if (data.action === 'menu') {
                // Return to title screen
                this.cameras.main.fadeOut(500, 0, 0, 0);
                this.time.delayedCall(600, () => {
                    this.scene.start('TitleScene');
                });
            }
        });
    });
};

MainScene.prototype.createTimeParticleExplosion = function() {
    console.log('Particle Explosion: Creating time particles');
    
    // Create exploding clock particle effect
    const centerX = 700;
    const centerY = 450;
    
    // Clock face particles
    for (let i = 0; i < 60; i++) {
        const angle = (i / 60) * Math.PI * 2;
        const distance = 50 + Math.random() * 100;
        const particle = this.add.circle(centerX, centerY, 3 + Math.random() * 5, 0xffd700, 0.8)
            .setDepth(1150);
        
        this.tweens.add({
            targets: particle,
            x: centerX + Math.cos(angle) * (distance + Math.random() * 300),
            y: centerY + Math.sin(angle) * (distance + Math.random() * 300),
            alpha: 0,
            duration: 1000 + Math.random() * 1000,
            ease: 'Cubic.easeOut',
            onComplete: () => particle.destroy()
        });
    }
    
    // Clock hands explosion
    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const hand = this.add.rectangle(centerX, centerY, 4, 50, 0xff6b35)
            .setOrigin(0.5, 1)
            .setRotation(angle)
            .setDepth(1151);
        
        this.tweens.add({
            targets: hand,
            x: centerX + Math.cos(angle) * 400,
            y: centerY + Math.sin(angle) * 400,
            rotation: angle + Math.PI * 4,
            alpha: 0,
            duration: 1500,
            ease: 'Power2.easeOut',
            onComplete: () => hand.destroy()
        });
    }
    
    // Shockwave rings
    for (let i = 0; i < 3; i++) {
        const ring = this.add.circle(centerX, centerY, 10, 0xed8936, 0)
            .setStrokeStyle(4, 0xffd700)
            .setDepth(1152);
        
        this.tweens.add({
            targets: ring,
            radius: 500,
            alpha: 0.6,
            duration: 1000 + i * 200,
            ease: 'Cubic.easeOut',
            onComplete: () => ring.destroy()
        });
        
        this.time.delayedCall(i * 200, () => {
            this.tweens.add({
                targets: ring,
                alpha: 0,
                duration: 800
            });
        });
    }
};


// ============================================================
// Game initialized and ready!
// ============================================================
