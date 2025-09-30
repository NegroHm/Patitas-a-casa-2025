import React, { useState, useRef } from 'react';
import { uploadImageToDrive, loadGoogleAPI } from '../../services/googleDrive';
import GoogleDriveSetup from '../GoogleDriveSetup';
import styles from './styles.module.css';

const ImageUpload = ({ folderType, onUploadSuccess }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [apiLoaded, setApiLoaded] = useState(false);
  const [credentialsConfigured, setCredentialsConfigured] = useState(false);
  const fileInputRef = useRef(null);

  // Check if Google Drive credentials are configured
  const checkCredentials = () => {
    const apiKey = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY;
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const perdidosFolder = import.meta.env.VITE_GOOGLE_DRIVE_PERDIDOS_FOLDER_ID;
    const encontradosFolder = import.meta.env.VITE_GOOGLE_DRIVE_ENCONTRADOS_FOLDER_ID;
    
    return apiKey && clientId && perdidosFolder && encontradosFolder;
  };

  React.useEffect(() => {
    const configured = checkCredentials();
    setCredentialsConfigured(configured);
    
    if (configured) {
      initializeAPI();
    }
  }, []);

  const initializeAPI = async () => {
    try {
      await loadGoogleAPI();
      setApiLoaded(true);
    } catch (error) {
      console.error('Error loading Google API:', error);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length !== files.length) {
      alert('Solo se permiten archivos de imagen');
    }
    setSelectedFiles(imageFiles);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (!apiLoaded) {
      alert('La API de Google Drive aún no está cargada. Por favor, espera un momento.');
      return;
    }

    if (selectedFiles.length === 0) {
      alert('Por favor, selecciona al menos una imagen');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const results = [];
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const description = `Imagen de mascota ${folderType === 'perdidos' ? 'perdida' : 'encontrada'} - ${new Date().toLocaleDateString()}`;
        
        try {
          const result = await uploadImageToDrive(file, folderType, description);
          results.push(result);
          setUploadProgress((i + 1) / selectedFiles.length * 100);
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          results.push({ success: false, fileName: file.name, error: error.message });
        }
      }

      const successfulUploads = results.filter(r => r.success);
      const failedUploads = results.filter(r => !r.success);

      if (successfulUploads.length > 0) {
        alert(`✓ ${successfulUploads.length} imagen(es) subida(s) exitosamente`);
        setSelectedFiles([]);
        if (onUploadSuccess) {
          onUploadSuccess();
        }
      }

      if (failedUploads.length > 0) {
        alert(`⚠️ ${failedUploads.length} imagen(es) fallaron al subir`);
      }

    } catch (error) {
      console.error('Upload error:', error);
      alert('Error durante la subida. Por favor, intenta de nuevo.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const folderTypeText = folderType === 'perdidos' ? 'Mascotas Perdidas' : 'Mascotas Encontradas';

  // Show setup component if credentials are not configured
  if (!credentialsConfigured) {
    return <GoogleDriveSetup type="upload" />;
  }

  return (
    <div className={styles.uploadContainer}>
      <div className={styles.uploadHeader}>
        <h3 className={styles.uploadTitle}>
          Subir Imágenes - {folderTypeText}
        </h3>
        <p className={styles.uploadDescription}>
          Sube imágenes de {folderType === 'perdidos' ? 'mascotas perdidas' : 'mascotas encontradas'} para ayudar a la comunidad
        </p>
      </div>

      <div
        className={`${styles.dropZone} ${isDragging ? styles.dragging : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className={styles.dropZoneContent}>
          <div className={styles.uploadIcon}>📸</div>
          <p className={styles.dropZoneText}>
            {isDragging ? 'Suelta las imágenes aquí' : 'Arrastra imágenes aquí o haz clic para seleccionar'}
          </p>
          <p className={styles.dropZoneSubtext}>
            Formatos: JPG, PNG, GIF • Máximo 10MB por imagen
          </p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        className={styles.hiddenInput}
      />

      {selectedFiles.length > 0 && (
        <div className={styles.selectedFiles}>
          <h4 className={styles.filesTitle}>Archivos seleccionados ({selectedFiles.length})</h4>
          <div className={styles.fileList}>
            {selectedFiles.map((file, index) => (
              <div key={index} className={styles.fileItem}>
                <div className={styles.fileInfo}>
                  <span className={styles.fileName}>{file.name}</span>
                  <span className={styles.fileSize}>{formatFileSize(file.size)}</span>
                </div>
                <button
                  className={styles.removeButton}
                  onClick={() => removeFile(index)}
                  title="Eliminar archivo"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {uploading && (
        <div className={styles.progressContainer}>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill}
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className={styles.progressText}>
            Subiendo... {Math.round(uploadProgress)}%
          </p>
        </div>
      )}

      <div className={styles.uploadActions}>
        <button
          className={styles.uploadButton}
          onClick={uploadFiles}
          disabled={selectedFiles.length === 0 || uploading || !apiLoaded}
        >
          {uploading ? 'Subiendo...' : `Subir ${selectedFiles.length} imagen(es)`}
        </button>
        
        {selectedFiles.length > 0 && !uploading && (
          <button
            className={styles.clearButton}
            onClick={() => setSelectedFiles([])}
          >
            Limpiar selección
          </button>
        )}
      </div>

      {!apiLoaded && (
        <div className={styles.apiStatus}>
          <p>⏳ Cargando API de Google Drive...</p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;