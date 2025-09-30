// Google Drive API configuration
const GOOGLE_DRIVE_API_KEY = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY;
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const PERDIDOS_FOLDER_ID = import.meta.env.VITE_GOOGLE_DRIVE_PERDIDOS_FOLDER_ID;
const ENCONTRADOS_FOLDER_ID = import.meta.env.VITE_GOOGLE_DRIVE_ENCONTRADOS_FOLDER_ID;
const OAUTH_SCOPE = 'https://www.googleapis.com/auth/drive.file';

// Google Drive API base URL
const DRIVE_API_BASE_URL = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3';

// Global variable to store Google Auth instance
let gapiLoaded = false;
let authInstance = null;

/**
 * Initialize Google API and OAuth for file uploads
 */
export const initializeGoogleAuth = () => {
  return new Promise((resolve, reject) => {
    if (gapiLoaded && authInstance) {
      resolve(authInstance);
      return;
    }

    // Load Google API script if not already loaded
    if (!window.gapi) {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        window.gapi.load('auth2', initAuth);
      };
      script.onerror = () => reject(new Error('Failed to load Google API'));
      document.head.appendChild(script);
    } else {
      window.gapi.load('auth2', initAuth);
    }

    function initAuth() {
      window.gapi.auth2.init({
        client_id: GOOGLE_CLIENT_ID,
        scope: OAUTH_SCOPE
      }).then(() => {
        authInstance = window.gapi.auth2.getAuthInstance();
        gapiLoaded = true;
        resolve(authInstance);
      }).catch(reject);
    }
  });
};

/**
 * Get Google Drive folder ID based on report type
 * @param {string} type - 'perdidos' or 'encontrados'
 * @returns {string} - Folder ID
 */
export const getFolderId = (type) => {
  return type === 'perdidos' ? PERDIDOS_FOLDER_ID : ENCONTRADOS_FOLDER_ID;
};

/**
 * Fetch images from a specific Google Drive folder
 * @param {string} folderType - 'perdidos' or 'encontrados'
 * @returns {Promise<Array>} - Array of image objects
 */
export const fetchImagesFromFolder = async (folderType) => {
  try {
    const folderId = getFolderId(folderType);
    const url = `${DRIVE_API_BASE_URL}/files?q='${folderId}'+in+parents+and+mimeType+contains+'image'&fields=files(id,name,thumbnailLink,webViewLink,createdTime,size)&key=${GOOGLE_DRIVE_API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch images: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Transform the data to include direct download links and public URLs
    return data.files.map(file => ({
      id: file.id,
      name: file.name,
      thumbnailUrl: file.thumbnailLink,
      viewUrl: file.webViewLink,
      downloadUrl: `${DRIVE_API_BASE_URL}/files/${file.id}?alt=media&key=${GOOGLE_DRIVE_API_KEY}`,
      // Use multiple URL formats for better compatibility
      publicUrl: `https://drive.google.com/uc?export=view&id=${file.id}`,
      directUrl: `https://drive.google.com/uc?id=${file.id}`,
      thumbnailUrl2: `https://drive.google.com/thumbnail?id=${file.id}&sz=w800`,
      // Add API-based URL that should work reliably
      apiUrl: `${DRIVE_API_BASE_URL}/files/${file.id}?alt=media&key=${GOOGLE_DRIVE_API_KEY}`,
      createdTime: file.createdTime,
      size: file.size
    }));
  } catch (error) {
    console.error('Error fetching images from Google Drive:', error);
    throw error;
  }
};

/**
 * Upload an image file to Google Drive
 * @param {File} file - The image file to upload
 * @param {string} folderType - 'perdidos' or 'encontrados'
 * @param {string} description - Optional description for the file
 * @returns {Promise<Object>} - Upload result
 */
export const uploadImageToDrive = async (file, folderType, description = '') => {
  try {
    // Initialize Google Auth if not already done
    const authInstance = await initializeGoogleAuth();
    
    // Check if user is signed in
    if (!authInstance.isSignedIn.get()) {
      await authInstance.signIn();
    }
    
    const accessToken = authInstance.currentUser.get().getAuthResponse().access_token;
    const folderId = getFolderId(folderType);
    
    // Create file metadata
    const metadata = {
      name: file.name,
      parents: [folderId],
      description: description || `Image uploaded to ${folderType} folder`
    };
    
    // Create form data for multipart upload
    const formData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify(metadata)], {type: 'application/json'}));
    formData.append('file', file);
    
    // Upload file
    const response = await fetch(`${DRIVE_UPLOAD_URL}/files?uploadType=multipart`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    // Make the file publicly viewable
    await makeFilePublic(result.id, accessToken);
    
    return {
      success: true,
      fileId: result.id,
      fileName: result.name,
      publicUrl: `https://drive.google.com/uc?id=${result.id}`,
      directUrl: `https://drive.google.com/uc?id=${result.id}`
    };
    
  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    throw error;
  }
};

/**
 * Make a Google Drive file publicly viewable
 * @param {string} fileId - The file ID
 * @param {string} accessToken - OAuth access token
 */
const makeFilePublic = async (fileId, accessToken) => {
  try {
    const response = await fetch(`${DRIVE_API_BASE_URL}/files/${fileId}/permissions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        role: 'reader',
        type: 'anyone'
      })
    });
    
    if (!response.ok) {
      console.warn('Failed to make file public, but upload succeeded');
    }
  } catch (error) {
    console.warn('Error making file public:', error);
  }
};

/**
 * Download an image from Google Drive
 * @param {string} fileId - The Google Drive file ID
 * @param {string} fileName - The file name for download
 */
export const downloadImageFromDrive = async (fileId, fileName) => {
  try {
    const downloadUrl = `${DRIVE_API_BASE_URL}/files/${fileId}?alt=media&key=${GOOGLE_DRIVE_API_KEY}`;
    
    const response = await fetch(downloadUrl);
    if (!response.ok) {
      throw new Error('Failed to download image');
    }
    
    const blob = await response.blob();
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (error) {
    console.error('Error downloading image:', error);
    throw error;
  }
};

/**
 * Get shareable link for an image
 * @param {string} fileId - The Google Drive file ID
 * @returns {string} - Public shareable link
 */
export const getShareableLink = (fileId) => {
  return `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
};

/**
 * Load Google API script
 * @returns {Promise} - Promise that resolves when API is loaded
 */
export const loadGoogleAPI = () => {
  return new Promise((resolve, reject) => {
    if (gapiLoaded) {
      resolve();
      return;
    }
    
    initializeGoogleAuth()
      .then(() => resolve())
      .catch(reject);
  });
};