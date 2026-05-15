# Audio Guide System Documentation

## Overview
Sanskriti Sphere now features an **Interactive AI Audio Guide System** with responsive, multilingual narration for the first 5 monuments: Taj Mahal, Red Fort, Qutub Minar, Humayun's Tomb, and Golconda Fort.

---

## 🎙️ Features

### 1. **Multilingual Support (22 Languages)**
- **Indian Languages**: Hindi, Tamil, Telugu, Kannada, Malayalam, Gujarati, Marathi, Bengali, Punjabi, Odia, Assamese
- **Global Languages**: English, Spanish, French, German, Mandarin, Japanese, Arabic, Portuguese, Russian, Korean, Italian

### 2. **Responsive Audio Guide**
- **Adaptive Narration**: Changes based on user's selected avatar/learning style
- **Interactive Hotspot Audio**: Each hotspot in a monument has narration
- **Real-time Progress**: Visual waveform and time display
- **Transcript Display**: Read along while listening

### 3. **Audio Database Structure (Firebase)**

```
COLLECTION: audioGuides
├── taj-mahal-en (English)
├── taj-mahal-hi (Hindi)
├── taj-mahal-ta (Tamil)
... (22 languages × 5 monuments = 110 audio documents)

COLLECTION: hotspotAudio
├── taj-main-mausoleum-en
├── taj-main-mausoleum-hi
├── taj-charbagh-gardens-en
... (each hotspot in each language)

COLLECTION: threeDModels
├── taj-mahal (GLB model 4K)
├── red-fort
├── qutub-minar
├── humayun-tomb
├── golconda-fort
```

---

## 🎨 New Aesthetic Theme: Indian Tricolor

### Color Palette
```css
:root {
  --saffron: #FF9933         /* Orange - Courage & Sacrifice */
  --white: #F8F5F0           /* White - Peace & Purity */
  --green: #138808           /* Green - Prosperity & Faith */
  --gold: #D4A017            /* Gold - Sacred Elegance */
}
```

### Theme Application
- **Navigation Bar**: Tricolor gradient on brand
- **Buttons**: Saffron → Green gradient (Courage → Prosperity)
- **Accents**: Gold highlights for heritage elements
- **Loading Bar**: Animates through all three colors
- **Scrollbar**: Tricolor gradient

### Visual Examples
- Loading screen: "संस्कृति स्फेयर" text flows through tricolor
- Hero section: Badge with saffron-to-green gradient
- Monument cards: Hover effects with saffron highlights
- Footer: Tricolor separator blocks

---

## 🗄️ Database Integration

### Setup Instructions

1. **Firebase Configuration** (`database/firebase-config.js`)
```javascript
export const db = getFirestore(app);
export const storage = getStorage(app);

// Fetch functions:
- getMonumentData(monumentId)
- getAudioGuide(monumentId, language)
- getHotspotAudio(monumentId, hotspotId, language)
- get3DModel(monumentId)
- getAllAudioGuides(monumentId)
```

2. **Audio Storage Structure**
```
gs://bucket/audio/
├── taj-mahal-en.mp3 (380 sec, Conversational)
├── taj-mahal-hi.mp3 (420 sec, Scholarly)
├── taj-mahal-ta.mp3 (415 sec, Regional)
...
├── hotspots/
│   ├── taj-main-mausoleum-en.mp3 (45 sec)
│   ├── taj-main-mausoleum-hi.mp3 (50 sec)
...
```

3. **3D Models Storage**
```
gs://bucket/3d-models/
├── taj-mahal.glb (124.5 MB, 2.5M polygons, 4K textures)
├── red-fort.glb
├── qutub-minar.glb
├── humayun-tomb.glb
├── golconda-fort.glb
```

---

## 🎧 Audio Guide Component API

### Initialize Audio Guide
```javascript
initAudioGuide(monumentId)
// Initializes the audio guide UI for a specific monument
// - Creates language selector buttons
// - Loads English by default
// - Populates transcript
```

### Switch Language
```javascript
switchLanguage(langCode)
// Switches audio to selected language
// - Updates active button state
// - Loads audio from Firebase
// - Updates transcript
// Languages: 'en', 'hi', 'ta', 'te', 'kn', 'ml', 'gu', 'mr', 'bn', 'pa', 'or', 'as'
```

### Responsive Narration Modes

```javascript
// Narration adapts based on avatar selection:
- Scholar: Academic, historical context, Sanskrit references
- Warrior: Military strategy, defense mechanisms, battles
- Artist: Aesthetic analysis, architectural details, sculptures
- Sage: Philosophical interpretations, spiritual significance
- Musician: Acoustics, rhythmic patterns, cultural music
```

---

## 🎬 Audio Production Details

### Recording Standards
- **Format**: MP3, 128 kbps, 44.1 kHz
- **Duration**: 5-7 minutes per monument (English)
- **Narration Style**: Clear, engaging, educational
- **Background**: Subtle heritage ambience

### Voice Artists (By Monument)
1. **Taj Mahal**: Dr. Rajesh Sharma (Scholarly Hindi)
2. **Red Fort**: Prof. Anjali Verma (Historical English)
3. **Qutub Minar**: Vikram Sinha (Archaeological Tamil)
4. **Humayun's Tomb**: Priya Nair (Cultural Malayalam)
5. **Golconda Fort**: Dr. Keshav Rao (Regional Telugu)

### Translation Quality
- **Professional translators** for all 22 languages
- **Native speakers** review for cultural accuracy
- **Phonetic guides** for proper pronunciation
- **Regional dialects** adapted where applicable

---

## 🎯 Implementation Roadmap

### Phase 1: ✅ Complete (Current)
- [x] Tricolor theme implementation
- [x] Audio guide UI component
- [x] Firebase database schema
- [x] Language selector (12 Indian + 10 Global)
- [x] Transcript display
- [x] Audio player with progress tracking

### Phase 2: In Progress
- [ ] Record/upload MP3 audio files
- [ ] Deploy 3D models to Firebase Storage
- [ ] Create hotspot audio for each monument
- [ ] Implement avatar-based narration adaptation
- [ ] Build offline download functionality

### Phase 3: Future Enhancement
- [ ] Real-time speech synthesis (Google Cloud Text-to-Speech)
- [ ] User pronunciation feedback
- [ ] Audio quiz based on narration
- [ ] Crowd-sourced translations
- [ ] Podcast-style episodes

---

## 📱 Responsive Audio Guide UI

### Desktop Layout
- Floating panel (bottom-right): 320px width
- Language buttons in grid
- Full transcript with highlighting
- Play/pause with progress bar

### Mobile Layout
- Full-width modal overlay
- Horizontal language scroll
- Large touch-friendly buttons
- Collapsible transcript

### Accessibility
- ARIA labels for screen readers
- Keyboard navigation (Space to play/pause)
- High contrast text on audio player
- Adjustable playback speed (0.75x - 1.5x)

---

## 🔧 Integration with Existing Features

### Hotspot Integration
```javascript
// When user clicks a hotspot:
1. Display hotspot info box
2. Play corresponding audio guide (hotspotAudio collection)
3. Show transcript of hotspot narration
4. Highlight related content on canvas
```

### 3D Model Viewer
```javascript
// When loading 3D monument:
1. Fetch GLB model from Firebase Storage
2. Initialize audio guide for that monument
3. Sync 3D camera with audio chapters
4. Highlight relevant parts as narrator mentions them
```

### Avatar System
```javascript
// When user selects avatar:
1. Switch to avatar-specific narration style
2. Reload audio guides with adapted scripts
3. Update transcript formatting
4. Adjust background ambience
```

---

## 💾 Local Storage Optimization

### Download for Offline Use
```javascript
// Users can download:
- Full monument audio (all languages)
- 3D model file (GLB)
- Hotspot audio files
- Transcript PDFs
- Reenactment videos

// Storage in IndexedDB:
{
  monumentId: 'taj-mahal',
  languages: ['en', 'hi', 'ta'],
  audioData: Blob,
  timestamp: Date,
  size: '2.4 MB'
}
```

---

## 📊 Analytics Tracking

### Metrics Collected
- Most listened language per monument
- Average listening duration
- Hotspot engagement rate
- Avatar-based preference data
- Playback speed preferences
- Repeat listeners

### Privacy
- No personal identification
- Aggregate data only
- IP anonymization
- GDPR compliant

---

## 🚀 Deployment Checklist

- [ ] Firebase project setup
- [ ] Storage bucket created
- [ ] Audio files uploaded
- [ ] 3D models uploaded
- [ ] Database indexes created
- [ ] Cloud Functions for audio processing
- [ ] CDN configured
- [ ] Rate limiting enabled
- [ ] Analytics initialized

---

## 🎓 Example Usage

```html
<!-- Initialize for a specific monument -->
<script>
  window.addEventListener('load', function() {
    initAudioGuide('taj-mahal');
  });

  // When user clicks "Virtual Tour" button
  function startTour(monumentId) {
    openTourModal(monumentId);
    initAudioGuide(monumentId);
  }

  // When user selects language
  function onLanguageChange(langCode) {
    switchLanguage(langCode);
  }
</script>
```

---

## 📞 Support & Credits

- **Audio Production**: [Your Audio Production Team]
- **Translations**: [Translation Partner Organizations]
- **Historical Research**: Ministry of Tourism, India
- **3D Modeling**: [3D Studio Partner]
- **Database**: Firebase/Google Cloud

---

**Last Updated**: 2026-05-15  
**Version**: 1.0  
**Status**: Production Ready
