// ═══════════════════════════════════════════════════════
//  AUDIO GUIDE COMPONENT - INTERACTIVE & RESPONSIVE
// ═══════════════════════════════════════════════════════

import { 
  getAudioGuide, 
  getHotspotAudio, 
  getMonumentHotspotAudio 
} from '../database/firebase-config.js';

// Language Configuration
const LANGUAGES = {
  en: { name: 'English', flag: '🇬🇧', region: 'Global' },
  hi: { name: 'हिन्दी', flag: '🇮🇳', region: 'North India' },
  ta: { name: 'தமிழ்', flag: '🇮🇳', region: 'South India' },
  te: { name: 'తెలుగు', flag: '🇮🇳', region: 'Andhra Pradesh' },
  kn: { name: 'ಕನ್ನಡ', flag: '🇮🇳', region: 'Karnataka' },
  ml: { name: 'മലയാളം', flag: '🇮🇳', region: 'Kerala' },
  gu: { name: 'ગુજરાતી', flag: '🇮🇳', region: 'Gujarat' },
  mr: { name: 'मराठी', flag: '🇮🇳', region: 'Maharashtra' },
  bn: { name: 'বাংলা', flag: '🇧🇩', region: 'Bengal' },
  pa: { name: 'ਪੰਜਾਬੀ', flag: '🇮🇳', region: 'Punjab' },
  or: { name: 'ଓଡିଶା', flag: '🇮🇳', region: 'Odisha' },
  as: { name: 'অসমীয়া', flag: '🇮🇳', region: 'Assam' },
  es: { name: 'Español', flag: '🇪🇸', region: 'Spain/Latin America' },
  fr: { name: 'Français', flag: '🇫🇷', region: 'France' },
  de: { name: 'Deutsch', flag: '🇩🇪', region: 'Germany' },
  zh: { name: '中文', flag: '🇨🇳', region: 'China' },
  ja: { name: '日本語', flag: '🇯🇵', region: 'Japan' },
  ar: { name: 'العربية', flag: '🇸🇦', region: 'Middle East' },
  pt: { name: 'Português', flag: '🇵🇹', region: 'Portugal/Brazil' },
  ru: { name: 'Русский', flag: '🇷🇺', region: 'Russia' },
  ko: { name: '한국어', flag: '🇰🇷', region: 'South Korea' },
  it: { name: 'Italiano', flag: '🇮🇹', region: 'Italy' }
};

// Global State
let audioState = {
  currentMonument: null,
  currentLanguage: 'en',
  currentAudio: null,
  isPlaying: false,
  analyser: null,
  animationFrameId: null
};

// ═══ INITIALIZATION ═══

/**
 * Initialize Audio Guide for a monument
 * @param {string} monumentId - The monument ID
 */
export async function initAudioGuide(monumentId) {
  audioState.currentMonument = monumentId;
  
  const container = document.getElementById('audioGuideContainer');
  if (!container) {
    console.error('Audio guide container not found');
    return;
  }
  
  // Build UI
  container.innerHTML = buildAudioGuideUI();
  
  // Attach event listeners
  attachAudioListeners();
  
  // Load default language (English)
  await switchLanguage('en');
  
  console.log(`🎙️ Audio guide initialized for ${monumentId}`);
}

// ═══ UI BUILDER ═══

function buildAudioGuideUI() {
  const languageButtons = Object.entries(LANGUAGES)
    .map(([code, lang]) => `
      <button 
        class="ag-lang-btn ${code === 'en' ? 'active' : ''}" 
        onclick="switchLanguage('${code}')"
        title="${lang.name} - ${lang.region}"
      >
        ${lang.flag}
      </button>
    `)
    .join('');
  
  return `
    <div class="audio-guide-wrapper">
      <!-- Header -->
      <div class="ag-header">
        <div class="ag-title">
          <span class="ag-icon">🎙️</span>
          <span>AI Audio Guide</span>
        </div>
        <button class="ag-close" onclick="closeAudioGuide()">✕</button>
      </div>
      
      <!-- Language Selector -->
      <div class="ag-languages-container">
        <label class="ag-lang-label">Select Language:</label>
        <div class="ag-languages-grid">
          ${languageButtons}
        </div>
        <div class="ag-lang-info">
          <span id="langName">English</span>
          <span id="langRegion">Global</span>
        </div>
      </div>
      
      <!-- Audio Player -->
      <div class="ag-player">
        <!-- Waveform Visualization -->
        <canvas id="audioWaveform" class="ag-waveform"></canvas>
        
        <!-- Controls -->
        <div class="ag-controls">
          <button id="playBtn" class="ag-play-btn" onclick="togglePlayPause()">
            ▶
          </button>
          <input 
            type="range" 
            id="progressBar" 
            class="ag-progress" 
            min="0" 
            max="100" 
            value="0"
            oninput="seekAudio(this.value)"
          >
          <span class="ag-time">
            <span id="currentTime">0:00</span> / <span id="duration">0:00</span>
          </span>
        </div>
        
        <!-- Advanced Controls -->
        <div class="ag-advanced-controls">
          <div class="ag-speed-control">
            <label>Speed:</label>
            <select id="speedSelect" onchange="setPlaybackSpeed(this.value)">
              <option value="0.75">0.75x</option>
              <option value="1" selected>1x</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
            </select>
          </div>
          
          <div class="ag-volume-control">
            <label>Volume:</label>
            <input 
              type="range" 
              id="volumeSlider" 
              class="ag-volume" 
              min="0" 
              max="100" 
              value="100"
              oninput="setVolume(this.value)"
            >
          </div>
          
          <button class="ag-download-btn" onclick="downloadAudio()">
            ⬇️ Download
          </button>
        </div>
      </div>
      
      <!-- Transcript -->
      <div class="ag-transcript">
        <div class="ag-transcript-header">
          <h4>📝 Transcript</h4>
          <button class="ag-expand-transcript" onclick="toggleTranscript()">↕</button>
        </div>
        <div id="transcriptContent" class="ag-transcript-text"></div>
      </div>
      
      <!-- Hotspots -->
      <div class="ag-hotspots">
        <h4>🎯 Points of Interest</h4>
        <div id="hotspotsList" class="ag-hotspots-list"></div>
      </div>
    </div>
  `;
}

// ═══ EVENT LISTENERS ═══

function attachAudioListeners() {
  if (!audioState.currentAudio) return;
  
  const audio = audioState.currentAudio;
  
  // Update progress
  audio.ontimeupdate = () => {
    updateProgress();
    drawWaveform();
  };
  
  // Update duration
  audio.onloadedmetadata = () => {
    document.getElementById('duration').textContent = formatTime(audio.duration);
  };
  
  // Handle end
  audio.onended = () => {
    audioState.isPlaying = false;
    document.getElementById('playBtn').textContent = '▶';
  };
}

// ═══ LANGUAGE SWITCHING ═══

export async function switchLanguage(langCode) {
  audioState.currentLanguage = langCode;
  
  // Update button states
  document.querySelectorAll('.ag-lang-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target?.classList.add('active');
  
  // Update language info
  const lang = LANGUAGES[langCode];
  document.getElementById('langName').textContent = lang.name;
  document.getElementById('langRegion').textContent = lang.region;
  
  // Show loading state
  document.getElementById('transcriptContent').textContent = 'Loading audio guide...';
  
  // Fetch audio data
  const audioData = await getAudioGuide(audioState.currentMonument, langCode);
  
  if (audioData) {
    loadAudio(audioData);
    await loadHotspots(audioData.monumentId, langCode);
  } else {
    document.getElementById('transcriptContent').textContent = 
      `Audio guide not available in ${lang.name}`;
  }
}

// ═══ AUDIO LOADING & PLAYBACK ═══

function loadAudio(audioData) {
  // Stop current audio
  if (audioState.currentAudio) {
    audioState.currentAudio.pause();
  }
  
  // Create new audio element
  audioState.currentAudio = new Audio(audioData.audioUrl);
  const audio = audioState.currentAudio;
  
  // Setup audio context for visualization
  if (!audioState.analyser) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audioState.analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaElementAudioSource(audio);
    source.connect(audioState.analyser);
    audioState.analyser.connect(audioContext.destination);
  }
  
  // Update transcript
  document.getElementById('transcriptContent').textContent = audioData.transcript;
  
  // Attach listeners
  attachAudioListeners();
  
  // Reset UI
  document.getElementById('playBtn').textContent = '▶';
  document.getElementById('currentTime').textContent = '0:00';
  audioState.isPlaying = false;
}

export function togglePlayPause() {
  if (!audioState.currentAudio) return;
  
  const audio = audioState.currentAudio;
  const btn = document.getElementById('playBtn');
  
  if (audio.paused) {
    audio.play();
    btn.textContent = '⏸';
    audioState.isPlaying = true;
  } else {
    audio.pause();
    btn.textContent = '▶';
    audioState.isPlaying = false;
  }
}

export function seekAudio(value) {
  if (!audioState.currentAudio) return;
  const audio = audioState.currentAudio;
  const seekTime = (value / 100) * audio.duration;
  audio.currentTime = seekTime;
}

export function setPlaybackSpeed(speed) {
  if (audioState.currentAudio) {
    audioState.currentAudio.playbackRate = parseFloat(speed);
  }
}

export function setVolume(volume) {
  if (audioState.currentAudio) {
    audioState.currentAudio.volume = volume / 100;
  }
}

// ═══ VISUALIZATION ═══

function drawWaveform() {
  if (!audioState.analyser) return;
  
  const canvas = document.getElementById('audioWaveform');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const dataArray = new Uint8Array(audioState.analyser.frequencyBinCount);
  audioState.analyser.getByteFrequencyData(dataArray);
  
  // Draw background (tricolor)
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#FF9933');
  gradient.addColorStop(0.5, '#F8F5F0');
  gradient.addColorStop(1, '#138808');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw waveform
  ctx.fillStyle = '#D4A017';
  const barWidth = canvas.width / dataArray.length;
  let x = 0;
  
  for (let i = 0; i < dataArray.length; i++) {
    const barHeight = (dataArray[i] / 255) * canvas.height;
    ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
    x += barWidth;
  }
  
  if (audioState.isPlaying) {
    audioState.animationFrameId = requestAnimationFrame(drawWaveform);
  }
}

function updateProgress() {
  if (!audioState.currentAudio) return;
  
  const audio = audioState.currentAudio;
  const progress = (audio.currentTime / audio.duration) * 100;
  
  document.getElementById('progressBar').value = progress;
  document.getElementById('currentTime').textContent = formatTime(audio.currentTime);
}

// ═══ HOTSPOTS ═══

async function loadHotspots(monumentId, language) {
  const hotspotsList = document.getElementById('hotspotsList');
  hotspotsList.innerHTML = '<p class="loading">Loading hotspots...</p>';
  
  const hotspots = await getMonumentHotspotAudio(monumentId, language);
  
  if (hotspots.length === 0) {
    hotspotsList.innerHTML = '<p>No hotspots available</p>';
    return;
  }
  
  hotspotsList.innerHTML = hotspots
    .map(hotspot => `
      <div class="ag-hotspot-item" onclick="playHotspotAudio('${hotspot.id}')">
        <div class="ag-hotspot-icon">📍</div>
        <div class="ag-hotspot-info">
          <div class="ag-hotspot-title">${hotspot.title}</div>
          <div class="ag-hotspot-duration">${formatTime(hotspot.duration)}</div>
        </div>
      </div>
    `)
    .join('');
}

export async function playHotspotAudio(hotspotId) {
  // Implementation for playing hotspot audio
  console.log('Playing hotspot:', hotspotId);
}

// ═══ DOWNLOAD ═══

export function downloadAudio() {
  if (!audioState.currentAudio) return;
  
  const audio = audioState.currentAudio;
  const a = document.createElement('a');
  a.href = audio.src;
  a.download = `${audioState.currentMonument}-${audioState.currentLanguage}.mp3`;
  a.click();
}

// ═══ UTILITIES ═══

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function toggleTranscript() {
  const transcript = document.querySelector('.ag-transcript');
  transcript.classList.toggle('expanded');
}

export function closeAudioGuide() {
  if (audioState.currentAudio) {
    audioState.currentAudio.pause();
  }
  if (audioState.animationFrameId) {
    cancelAnimationFrame(audioState.animationFrameId);
  }
  const container = document.getElementById('audioGuideContainer');
  if (container) {
    container.innerHTML = '';
  }
}

export default {
  initAudioGuide,
  switchLanguage,
  togglePlayPause,
  seekAudio,
  setPlaybackSpeed,
  setVolume,
  downloadAudio,
  closeAudioGuide
};
