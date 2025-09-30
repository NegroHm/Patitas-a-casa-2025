import React, { useState } from 'react';
import { downloadImageFromDrive, getShareableLink } from '../../services/googleDrive';
import SocialShare from '../SocialShare';
import styles from './styles.module.css';

const ImageCard = ({ image, folderType }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState(image.directUrl);
  const [imageLoadError, setImageLoadError] = useState(false);

  const handleDownload = async () => {
    try {
      setIsLoading(true);
      await downloadImageFromDrive(image.id, image.name);
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('Error al descargar la imagen. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Tamaño desconocido';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha desconocida';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Function to handle image load errors with fallback URLs
  const handleImageError = () => {
    const fallbackUrls = [
      image.directUrl,
      image.publicUrl,
      image.thumbnailUrl2,
      image.apiUrl,
      image.thumbnailUrl
    ];
    
    const currentIndex = fallbackUrls.indexOf(currentImageUrl);
    const nextIndex = currentIndex + 1;
    
    if (nextIndex < fallbackUrls.length) {
      setCurrentImageUrl(fallbackUrls[nextIndex]);
    } else {
      setImageLoadError(true);
    }
  };

  const shareData = {
    title: `Mascota ${folderType === 'perdidos' ? 'Perdida' : 'Encontrada'}`,
    text: `Ayuda a difundir esta imagen de una mascota ${folderType === 'perdidos' ? 'perdida' : 'encontrada'}. ¡Comparte para ayudar!`,
    url: getShareableLink(image.id),
    image: currentImageUrl
  };

  return (
    <>
      <div className={styles.imageCard}>
        <div className={styles.imageContainer}>
          {!imageLoadError ? (
            <img
              src={currentImageUrl}
              alt={image.name}
              className={styles.image}
              loading="lazy"
              onClick={() => setShowFullImage(true)}
              onError={handleImageError}
            />
          ) : (
            <div className={styles.imagePlaceholder}>
              <div className={styles.placeholderIcon}>🖼️</div>
              <p className={styles.placeholderText}>Imagen no disponible</p>
              <p className={styles.placeholderSubtext}>{image.name}</p>
            </div>
          )}
          {!imageLoadError && (
            <div className={styles.imageOverlay}>
              <button
                className={styles.viewButton}
                onClick={() => setShowFullImage(true)}
                title="Ver imagen completa"
              >
                🔍
              </button>
            </div>
          )}
        </div>

        <div className={styles.imageInfo}>
          <h3 className={styles.imageName}>{image.name}</h3>
          <div className={styles.imageDetails}>
            <span className={styles.imageSize}>{formatFileSize(image.size)}</span>
            <span className={styles.imageDate}>{formatDate(image.createdTime)}</span>
          </div>
        </div>

        <div className={styles.actionButtons}>
          <button
            className={styles.downloadButton}
            onClick={handleDownload}
            disabled={isLoading}
            title="Descargar imagen"
          >
            {isLoading ? '...' : '⬇️'} Descargar
          </button>
          <button
            className={styles.shareButton}
            onClick={handleShare}
            title="Compartir imagen"
          >
            🔗 Compartir
          </button>
        </div>
      </div>

      {/* Full Image Modal */}
      {showFullImage && (
        <div className={styles.modal} onClick={() => setShowFullImage(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.closeButton}
              onClick={() => setShowFullImage(false)}
            >
              ✕
            </button>
            <img
              src={currentImageUrl}
              alt={image.name}
              className={styles.fullImage}
              onError={handleImageError}
            />
            <div className={styles.modalInfo}>
              <h3>{image.name}</h3>
              <p>Subida: {formatDate(image.createdTime)}</p>
              <p>Tamaño: {formatFileSize(image.size)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <SocialShare
          shareData={shareData}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </>
  );
};

export default ImageCard;