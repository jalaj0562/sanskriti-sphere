// ═══════════════════════════════════════════════════════
//  FIREBASE CONFIGURATION & DATABASE FUNCTIONS
// ═══════════════════════════════════════════════════════

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc,
  getDoc,
  query, 
  where,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  getBytes,
  uploadBytes,
  deleteObject,
  listAll
} from 'firebase/storage';

// ═══ FIREBASE CONFIG ═══
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "sanskriti-sphere.firebaseapp.com",
  projectId: "sanskriti-sphere",
  storageBucket: "sanskriti-sphere.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);

console.log('🔥 Firebase initialized for Sanskriti Sphere');

// ═══ MONUMENT DATA FUNCTIONS ═══

/**
 * Fetch all monuments from Firestore
 * @returns {Promise<Array>} Array of monument objects
 */
export async function getAllMonuments() {
  try {
    const monumentsRef = collection(db, 'monuments');
    const snapshot = await getDocs(monumentsRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching monuments:', error);
    return [];
  }
}

/**
 * Fetch specific monument by ID
 * @param {string} monumentId - The monument ID
 * @returns {Promise<Object>} Monument data object
 */
export async function getMonumentData(monumentId) {
  try {
    const docRef = doc(db, 'monuments', monumentId);
    const snapshot = await getDoc(docRef);
    return snapshot.exists() ? { id: monumentId, ...snapshot.data() } : null;
  } catch (error) {
    console.error(`Error fetching monument ${monumentId}:`, error);
    return null;
  }
}

/**
 * Create or update monument
 * @param {string} monumentId - The monument ID
 * @param {Object} data - Monument data
 */
export async function setMonumentData(monumentId, data) {
  try {
    const docRef = doc(db, 'monuments', monumentId);
    await setDoc(docRef, {
      ...data,
      updatedAt: new Date(),
      id: monumentId
    });
    console.log(`✅ Monument ${monumentId} saved`);
  } catch (error) {
    console.error(`Error saving monument ${monumentId}:`, error);
  }
}

// ═══ AUDIO GUIDE FUNCTIONS ═══

/**
 * Fetch audio guide by monument and language
 * @param {string} monumentId - Monument ID
 * @param {string} language - Language code (e.g., 'en', 'hi')
 * @returns {Promise<Object>} Audio guide data with URL and transcript
 */
export async function getAudioGuide(monumentId, language = 'en') {
  try {
    const docId = `${monumentId}-${language}`;
    const docRef = doc(db, 'audioGuides', docId);
    const snapshot = await getDoc(docRef);
    
    if (snapshot.exists()) {
      const data = snapshot.data();
      // Get download URL
      const audioUrl = await getAudioDownloadUrl(data.audioStoragePath);
      return {
        ...data,
        audioUrl,
        id: docId
      };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching audio guide ${monumentId}-${language}:`, error);
    return null;
  }
}

/**
 * Fetch all audio guides for a monument (all languages)
 * @param {string} monumentId - Monument ID
 * @returns {Promise<Array>} Array of audio guides
 */
export async function getAllAudioGuides(monumentId) {
  try {
    const guidesRef = collection(db, 'audioGuides');
    const q = query(guidesRef, where('monumentId', '==', monumentId));
    const snapshot = await getDocs(q);
    
    const guides = [];
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const audioUrl = await getAudioDownloadUrl(data.audioStoragePath);
      guides.push({
        ...data,
        audioUrl,
        id: doc.id
      });
    }
    return guides;
  } catch (error) {
    console.error(`Error fetching all audio guides for ${monumentId}:`, error);
    return [];
  }
}

/**
 * Upload audio guide
 * @param {string} monumentId - Monument ID
 * @param {string} language - Language code
 * @param {File} audioFile - MP3 file
 * @param {Object} metadata - {transcript, narratorStyle, duration}
 */
export async function uploadAudioGuide(monumentId, language, audioFile, metadata) {
  try {
    // Upload file to Storage
    const storagePath = `audio/guides/${monumentId}-${language}.mp3`;
    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, audioFile);
    console.log(`✅ Audio file uploaded: ${storagePath}`);
    
    // Create Firestore document
    const docId = `${monumentId}-${language}`;
    const docRef = doc(db, 'audioGuides', docId);
    await setDoc(docRef, {
      monumentId,
      language,
      audioStoragePath: storagePath,
      transcript: metadata.transcript,
      narratorStyle: metadata.narratorStyle,
      duration: metadata.duration,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log(`✅ Audio guide metadata saved: ${docId}`);
  } catch (error) {
    console.error(`Error uploading audio guide ${monumentId}-${language}:`, error);
  }
}

// ═══ HOTSPOT AUDIO FUNCTIONS ═══

/**
 * Fetch hotspot audio
 * @param {string} monumentId - Monument ID
 * @param {string} hotspotId - Hotspot ID
 * @param {string} language - Language code
 * @returns {Promise<Object>} Hotspot audio data
 */
export async function getHotspotAudio(monumentId, hotspotId, language = 'en') {
  try {
    const docId = `${monumentId}-${hotspotId}-${language}`;
    const docRef = doc(db, 'hotspotAudio', docId);
    const snapshot = await getDoc(docRef);
    
    if (snapshot.exists()) {
      const data = snapshot.data();
      const audioUrl = await getAudioDownloadUrl(data.audioStoragePath);
      return {
        ...data,
        audioUrl,
        id: docId
      };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching hotspot audio ${docId}:`, error);
    return null;
  }
}

/**
 * Fetch all hotspot audio for a monument and language
 * @param {string} monumentId - Monument ID
 * @param {string} language - Language code
 * @returns {Promise<Array>} Array of hotspot audio
 */
export async function getMonumentHotspotAudio(monumentId, language = 'en') {
  try {
    const audioRef = collection(db, 'hotspotAudio');
    const q = query(
      audioRef,
      where('monumentId', '==', monumentId),
      where('language', '==', language)
    );
    const snapshot = await getDocs(q);
    
    const hotspotAudio = [];
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const audioUrl = await getAudioDownloadUrl(data.audioStoragePath);
      hotspotAudio.push({
        ...data,
        audioUrl,
        id: doc.id
      });
    }
    return hotspotAudio;
  } catch (error) {
    console.error(`Error fetching hotspot audio for ${monumentId}:`, error);
    return [];
  }
}

/**
 * Upload hotspot audio
 */
export async function uploadHotspotAudio(
  monumentId,
  hotspotId,
  language,
  audioFile,
  metadata
) {
  try {
    const storagePath = `audio/hotspots/${monumentId}/${hotspotId}-${language}.mp3`;
    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, audioFile);
    
    const docId = `${monumentId}-${hotspotId}-${language}`;
    const docRef = doc(db, 'hotspotAudio', docId);
    await setDoc(docRef, {
      monumentId,
      hotspotId,
      language,
      audioStoragePath: storagePath,
      transcript: metadata.transcript,
      duration: metadata.duration,
      createdAt: new Date()
    });
    console.log(`✅ Hotspot audio uploaded: ${docId}`);
  } catch (error) {
    console.error(`Error uploading hotspot audio:`, error);
  }
}

// ═══ 3D MODEL FUNCTIONS ═══

/**
 * Fetch 3D model metadata
 * @param {string} monumentId - Monument ID
 * @returns {Promise<Object>} Model metadata with download URL
 */
export async function get3DModel(monumentId) {
  try {
    const docRef = doc(db, 'threeDModels', monumentId);
    const snapshot = await getDoc(docRef);
    
    if (snapshot.exists()) {
      const data = snapshot.data();
      const modelUrl = await getModelDownloadUrl(data.modelStoragePath);
      return {
        ...data,
        modelUrl,
        id: monumentId
      };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching 3D model ${monumentId}:`, error);
    return null;
  }
}

/**
 * Upload 3D model
 */
export async function upload3DModel(monumentId, glbFile, metadata) {
  try {
    const storagePath = `models/3d/${monumentId}/${glbFile.name}`;
    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, glbFile);
    
    const docRef = doc(db, 'threeDModels', monumentId);
    await setDoc(docRef, {
      monumentId,
      modelStoragePath: storagePath,
      fileName: glbFile.name,
      fileSize: glbFile.size,
      polygonCount: metadata.polygonCount,
      textureResolution: metadata.textureResolution,
      format: 'glb',
      uploadedAt: new Date()
    });
    console.log(`✅ 3D model uploaded: ${monumentId}`);
  } catch (error) {
    console.error(`Error uploading 3D model:`, error);
  }
}

// ═══ STORAGE FUNCTIONS ═══

/**
 * Get download URL for audio file
 */
async function getAudioDownloadUrl(storagePath) {
  try {
    const fileRef = ref(storage, storagePath);
    const url = await getBytes(fileRef);
    return URL.createObjectURL(new Blob([url]));
  } catch (error) {
    console.error('Error getting audio URL:', error);
    return null;
  }
}

/**
 * Get download URL for 3D model
 */
async function getModelDownloadUrl(storagePath) {
  try {
    const fileRef = ref(storage, storagePath);
    const bytes = await getBytes(fileRef);
    return URL.createObjectURL(new Blob([bytes]));
  } catch (error) {
    console.error('Error getting model URL:', error);
    return null;
  }
}

/**
 * Download file to local storage (IndexedDB)
 */
export async function downloadForOffline(monumentId, language) {
  try {
    const audioData = await getAudioGuide(monumentId, language);
    if (audioData && audioData.audioUrl) {
      // Store in IndexedDB
      const request = indexedDB.open('SanskritSphere', 1);
      request.onsuccess = (event) => {
        const db = event.target.result;
        const tx = db.transaction('downloads', 'readwrite');
        const store = tx.objectStore('downloads');
        store.add({
          monumentId,
          language,
          audio: audioData.audioUrl,
          timestamp: new Date(),
          size: audioData.audioUrl.size
        });
      };
    }
  } catch (error) {
    console.error('Error downloading for offline:', error);
  }
}

// ═══ EXPORT ALL FUNCTIONS ═══
export default {
  // Database
  db,
  storage,
  
  // Monuments
  getAllMonuments,
  getMonumentData,
  setMonumentData,
  
  // Audio Guides
  getAudioGuide,
  getAllAudioGuides,
  uploadAudioGuide,
  
  // Hotspot Audio
  getHotspotAudio,
  getMonumentHotspotAudio,
  uploadHotspotAudio,
  
  // 3D Models
  get3DModel,
  upload3DModel,
  
  // Storage
  downloadForOffline
};
