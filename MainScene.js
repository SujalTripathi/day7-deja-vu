MainScene.prototype.preload = function() {
  // ...existing code...
  
  // Sound effects
  this.load.audio('click', 'assets/audio/ui_click.mp3');
  this.load.audio('correct', 'assets/audio/correct_1.wav');
  this.load.audio('wrong', 'assets/audio/wrong.wav');
  this.load.audio('tick', 'assets/audio/tick.wav');
  this.load.audio('dayComplete', 'assets/audio/fanfare.wav');
  this.load.audio('whoosh', 'assets/audio/whoosh.wav');
  this.load.audio('timesup', 'assets/audio/timesup.wav');
  this.load.audio('hint', 'assets/audio/hint.wav');
  
  // ...existing code...
};

MainScene.prototype.create = function() {
  // ...existing code...
  
  this.currentDay = 1; // Start from Day 1
  this.maxDays = 7;
  
  // FIX 1: Day changes indexed 1-7
  this.dayChanges = {
    1: ['clock', 'plant'],         // Day 1: 2 changes
    2: ['clock', 'plant', 'mug'],  // Day 2: 3 changes  
    3: ['bed', 'photo', 'lamp'],   // Day 3: 3 changes
    4: ['window', 'book', 'lamp', 'mug'],  // Day 4: 4 changes
    5: ['clock', 'bed', 'plant', 'photo'], // Day 5: 4 changes
    6: ['window', 'lamp', 'book', 'mug', 'photo'], // Day 6: 5 changes
    7: ['bed', 'clock', 'plant', 'window', 'book', 'photo'] // Day 7: 6 changes
  };
  
  // FIX 1: Story text indexed 1-7
  this.storyText = {
    1: "DAY 1 — The alarm didn't ring. The coffee tastes... wrong. Why does everything feel like déjà vu?",
    2: "DAY 2 — I've seen this clock before. This exact angle. This exact moment. How many times have you woken up here?",
    3: "DAY 3 — The walls are changing. Or are you forgetting what they looked like? Memories blur. Reality shifts.",
    4: "DAY 4 — The photo on the wall... was it always there? Who is she? Why can't you remember her face?",
    5: "DAY 5 — Time stopped moving forward. You're caught in the loop. Each object tells a story you've forgotten.",
    6: "DAY 6 — No return. A choice. A mistake. This room is your prison. The differences are the key.",
    7: "DAY 7 — The final day. The final chance. Find the truth in what has changed. Break free, or loop forever."
  };
  
  // FIX 1: Day complete messages indexed 1-7
  this.dayCompleteMessages = {
    1: "Something's different... but what?",
    2: "The room is changing. You can feel it.",
    3: "Reality is slipping. Keep searching.",
    4: "Memories fade. Objects shift. Find them all.",
    5: "The loop tightens. Don't give up.",
    6: "Almost there. One more day...",
    7: "This is it. The final loop."
  };
  
  // ...existing code...
};

// FIX 2: Progress dots initialization
MainScene.prototype.createUI = function() {
  // ...existing code...
  
  this.progressDots = [];
  for (let i = 1; i <= this.maxDays; i++) {
    const dot = this.add.circle(50 + (i - 1) * 30, 145, 8, i === 1 ? 0xed8936 : 0x4a5568);
    this.progressDots.push(dot);
  }
  
  // ...existing code...
};

// FIX 4: Day text display
MainScene.prototype.updateUI = function() {
  this.dayText.setText(`DAY ${this.currentDay} / 7`);
  // ...existing code...
};

// FIX 2: Progress dots update in nextDay
MainScene.prototype.nextDay = function() {
  // ...existing code...
  
  // Update progress dots correctly
  this.progressDots.forEach((dot, i) => {
    if ((i + 1) <= this.currentDay) {
      dot.setFillStyle(0xed8936);
    }
  });
  
  // ...existing code...
};

// FIX 5: Apply day changes with correct indexing
MainScene.prototype.applyDayChanges = function() {
  const changedObjects = this.dayChanges[this.currentDay]; // Use currentDay directly (1-7)
  
  this.objects.forEach(obj => {
    obj.found = false;
    obj.isDifference = false;
    this.tweens.killTweensOf(obj);
    
    if (changedObjects && changedObjects.includes(obj.data.name)) {
      obj.isDifference = true;
      obj.stateIndex = this.currentDay; // Use currentDay (1-7) as index
      
      // Pulse effect for differences
      this.time.delayedCall(2000, () => {
        if (!obj.found && obj.isDifference) {
          const state = obj.data.states[obj.stateIndex];
          if (state) {
            this.tweens.add({
              targets: obj,
              scaleX: (state.scale || 1) * 1.03,
              scaleY: (state.scale || 1) * 1.03,
              duration: 2000,
              yoyo: true,
              repeat: -1
            });
          }
        }
      });
    } else {
      obj.stateIndex = 0; // Normal state
    }
    
    // Apply state
    const state = obj.data.states[obj.stateIndex];
    if (state) {
      obj.setFillStyle(state.color);
      obj.setAlpha(state.alpha);
      obj.setScale(state.scale || 1);
      obj.setAngle(state.angle || 0);
    }
  });
};

// FIX 3: Show ending with congratulations screen first
MainScene.prototype.showEnding = function() {
  // Stop music
  if (this.music) this.music.stop();
  
  // STEP 1: Show congratulations screen FIRST
  this.showCongratulations();
};

// FIX 3: New congratulations screen function
MainScene.prototype.showCongratulations = function() {
  // Dark overlay
  const bg = this.add.rectangle(700, 450, 1400, 900, 0x000000, 0).setDepth(800);
  this.tweens.add({
    targets: bg,
    alpha: 0.95,
    duration: 1000
  });
  
  // Big congratulations title
  const congrats = this.add.text(700, 300, '🎉 CONGRATULATIONS! 🎉', {
    font: 'bold 72px monospace',
    fill: '#ffd700',
    stroke: '#000000',
    strokeThickness: 8
  }).setOrigin(0.5).setDepth(801).setAlpha(0).setScale(0.5);
  
  this.tweens.add({
    targets: congrats,
    alpha: 1,
    scale: 1,
    duration: 1200,
    delay: 400,
    ease: 'Elastic.easeOut'
  });
  
  // Victory message
  const victory = this.add.text(700, 450, 'You broke the time loop!\nYou are finally FREE!', {
    font: 'bold 36px monospace',
    fill: '#68d391',
    stroke: '#000000',
    strokeThickness: 5,
    align: 'center',
    lineSpacing: 10
  }).setOrigin(0.5).setDepth(801).setAlpha(0);
  
  this.tweens.add({
    targets: victory,
    alpha: 1,
    duration: 1000,
    delay: 1200
  });
  
  // Play celebration sound
  this.time.delayedCall(600, () => {
    this.playSound('dayComplete');
  });
  
  // Confetti explosion
  this.time.delayedCall(1000, () => {
    for (let i = 0; i < 5; i++) {
      this.time.delayedCall(i * 300, () => {
        if (this.confettiParticles) {
          this.confettiParticles.emitParticleAt(
            Phaser.Math.Between(200, 1200), 
            0, 
            30
          );
        }
      });
    }
  });
  
  // Continue prompt
  const continueText = this.add.text(700, 650, 'Click to see your ending...', {
    font: '28px monospace',
    fill: '#cbd5e0'
  }).setOrigin(0.5).setDepth(801).setAlpha(0);
  
  this.tweens.add({
    targets: continueText,
    alpha: 1,
    duration: 800,
    delay: 2000,
    yoyo: true,
    repeat: -1
  });
  
  // Click to continue
  bg.setInteractive();
  bg.once('pointerup', () => {
    this.tweens.add({
      targets: [bg, congrats, victory, continueText],
      alpha: 0,
      duration: 600,
      onComplete: () => {
        bg.destroy();
        congrats.destroy();
        victory.destroy();
        continueText.destroy();
        // NOW show full ending
        this.showFullEnding();
      }
    });
  });
};

// ...existing code...