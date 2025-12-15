# Audio Files Needed for Day 7: Deja Vu

Your game is now set up for audio! Download these FREE CC0/royalty-free sound files:

## 📁 Files You Need

Place these files in the `assets/audio/` folder:

### Background Music

**`ambient_loop.mp3`** - Calm, mysterious ambient music (60-120s loop)

**EASIEST OPTION - Choose ONE:**

**Option 1: Soundimage.org (RECOMMENDED - Completely Free, No Sign-up)**
1. Go to: http://soundimage.org/looping-music/
2. Scroll down to section: **"Looping Music – Mysterious"**
3. Find a track like: "Mysterious-Ambience_Looping" or "Dark-Descent_Looping"
4. Click the **"Download"** link
5. Rename the downloaded file to **`ambient_loop.mp3`**
6. Move it to `assets/audio/` folder

**Option 2: Pixabay (Free, Fast)**
1. Go to: https://pixabay.com/music/search/ambient%20loop/
2. Find a short ambient track (look for 1-2 minute songs)
3. Click the track → Click **"Download"** (green button)
4. Rename to **`ambient_loop.mp3`**
5. Move to `assets/audio/`

**Option 3: Skip it for now**
- The game works without music! Just skip this file if you're in a hurry.

### Sound Effects (8 files)

**GOOD NEWS:** The game already has **BEEP SOUNDS** built in! These files are OPTIONAL.

If you want BETTER sounds, follow these EXACT steps:

---

**1. `ui_click.mp3`** - Button click sound

**DIRECT LINK:** https://mixkit.co/free-sound-effects/click/
- Click on **"Interface Button 2"** or **"Click 1"**
- Click **"Download"** (green button)
- Rename to **`ui_click.mp3`**
- Move to `assets/audio/`

---

**2. `correct.wav`** - Success ding

**DIRECT LINK:** https://mixkit.co/free-sound-effects/game/
- Scroll to find **"Achievement Bell"** or **"Game Bonus"**
- Download → Rename to **`correct.wav`**
- Move to `assets/audio/`

---

**3. `wrong.wav`** - Error buzz

**DIRECT LINK:** https://mixkit.co/free-sound-effects/game/
- Find **"Alert Error"** or **"Negative Tone"**
- Download → Rename to **`wrong.wav`**
- Move to `assets/audio/`

---

**4. `tick.wav`** - Clock tick

**DIRECT LINK:** https://mixkit.co/free-sound-effects/clock/
- Find **"Clock Tick Tock"** or **"Clock Single Tick"**
- Download → Rename to **`tick.wav`**
- Move to `assets/audio/`

---

**5. `fanfare.wav`** - Level complete fanfare

**DIRECT LINK:** https://mixkit.co/free-sound-effects/win/
- Find **"Completion Sound"** or **"Victory Fanfare"**
- Download → Rename to **`fanfare.wav`**
- Move to `assets/audio/`

---

**6. `whoosh.wav`** - Transition whoosh

**DIRECT LINK:** https://mixkit.co/free-sound-effects/whoosh/
- Find **"Swoosh 1"** or **"Fast Whoosh"**
- Download → Rename to **`whoosh.wav`**
- Move to `assets/audio/`

---

**7. `timesup.wav`** - Time's up sound

**DIRECT LINK:** https://mixkit.co/free-sound-effects/game/
- Find **"Game Over"** or **"Lose Sound"**
- Download → Rename to **`timesup.wav`**
- Move to `assets/audio/`

---

**8. `hint.wav`** - Hint notification

**DIRECT LINK:** https://mixkit.co/free-sound-effects/notification/
- Find **"Notification Bell"** or **"Soft Ding"**
- Download → Rename to **`hint.wav`**
- Move to `assets/audio/`

---

## 🔗 Recommended Free Sound Libraries (CC0 / Royalty-Free)

### 🎵 Music
- **[Soundimage.org](http://soundimage.org/looping-music/)** - Tons of free looping music
- **[Chosic](https://www.chosic.com/free-music/all/)** - Free game music, filter by license
- **[Uppbeat](https://uppbeat.io/)** - Free music with attribution

### 🔊 Sound Effects
- **[Mixkit](https://mixkit.co/free-sound-effects/)** - High-quality free SFX
- **[OpenGameArt](https://opengameart.org/)** - CC0 game assets
- **[Freesound](https://freesound.org/)** - Huge library (check licenses)
- **[Zapsplat](https://www.zapsplat.com/)** - Free with attribution

---

## ⚙️ Quick Setup (5 Minutes Total)

### **SUPER FAST METHOD:**

**DO THIS FIRST:**
1. Go to: https://mixkit.co/free-sound-effects/
2. Download ALL 8 sounds from the sections above
3. Rename each file EXACTLY as shown (e.g., `correct.wav`, `tick.wav`)
4. Put ALL files in `assets/audio/` folder
5. Refresh game (Ctrl+F5)

**That's it!** 

### **LAZY METHOD (Skip Everything):**
- The game ALREADY HAS BEEPS built in
- You don't need ANY audio files
- Just play the game and enjoy! 🎮

### **PERFECTIONIST METHOD:**
- Download music from Soundimage.org (1 file)
- Download all 8 SFX from Mixkit (8 files)
- Total: 9 files = Best audio experience

---

## 🎨 Audio Tips for Your Theme

For "Day 7: Deja Vu" (time loop mystery):

### Music Style:
- ✅ Slow, atmospheric ambient
- ✅ Mysterious, slightly unsettling
- ✅ Lo-fi or piano-based
- ❌ Avoid: Fast, upbeat, energetic

### SFX Style:
- ✅ Subtle, not jarring
- ✅ Retro/vintage tones
- ✅ Soft clicks and ticks
- ❌ Avoid: Loud explosions, harsh sounds

---

## 🎯 Alternative: Use Web Audio API (No Files Needed)

If you can't find audio files, you can generate simple beeps using Web Audio API:

```javascript
// Add this to your playSound function as fallback:
if (!this.sfx[type]) {
    // Generate beep
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Different frequencies for different sounds
    const frequencies = {
        correct: 800,
        wrong: 200,
        tick: 600,
        click: 400
    };
    
    oscillator.frequency.value = frequencies[type] || 440;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
}
```

---

## ✅ Testing Your Audio

1. Open the game in browser
2. Click the 🔊 button to toggle sound
3. Play the game and listen for:
   - Background music playing
   - Click sounds on objects
   - "Ding" on correct finds
   - "Buzz" on wrong clicks
   - Success fanfare when day completes

---

**Note:** The game will work WITHOUT audio files - it just won't play sounds. The audio system gracefully handles missing files.
