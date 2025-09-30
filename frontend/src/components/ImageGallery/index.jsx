import React, { useState, useEffect } from 'react';
import { fetchImagesFromFolder } from '../../services/googleDrive';
import ImageCard from '../ImageCard';
import Loading from '../Loading';
import GoogleDriveSetup from '../GoogleDriveSetup';
import styles from './styles.module.css';

const ImageGallery = ({ folderType, title }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [imagesPerPage] = useState(12);
  const [credentialsConfigured, setCredentialsConfigured] = useState(false);

  // Check if Google Drive credentials are configured
  const checkCredentials = () => {
    const apiKey = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY;
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const perdidosFolder = import.meta.env.VITE_GOOGLE_DRIVE_PERDIDOS_FOLDER_ID;
    const encontradosFolder = import.meta.env.VITE_GOOGLE_DRIVE_ENCONTRADOS_FOLDER_ID;
    
    return apiKey && clientId && perdidosFolder && encontradosFolder;
  };

  useEffect(() => {
    const configured = checkCredentials();
    setCredentialsConfigured(configured);
    
    if (configured) {
      loadImages();
    } else {
      setLoading(false);
    }
  }, [folderType]);

  const loadImages = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedImages = await fetchImagesFromFolder(folderType);
      setImages(fetchedImages);
    } catch (err) {
      setError('Error loading images. Please try again later.');
      console.error('Error loading images:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshGallery = () => {
    loadImages();
  };

  // Calculate pagination
  const indexOfLastImage = currentPage * imagesPerPage;
  const indexOfFirstImage = indexOfLastImage - imagesPerPage;
  const currentImages = images.slice(indexOfFirstImage, indexOfLastImage);
  const totalPages = Math.ceil(images.length / imagesPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Show setup component if credentials are not configured
  if (!credentialsConfigured) {
    return (
      <div className={styles.galleryContainer}>
        <h2 className={styles.galleryTitle}>{title}</h2>
        <GoogleDriveSetup type="gallery" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.galleryContainer}>
        <h2 className={styles.galleryTitle}>{title}</h2>
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.galleryContainer}>
        <h2 className={styles.galleryTitle}>{title}</h2>
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>{error}</p>
          <button onClick={refreshGallery} className={styles.retryButton}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.galleryContainer}>
      <div className={styles.galleryHeader}>
        <h2 className={styles.galleryTitle}>{title}</h2>
        <div className={styles.galleryInfo}>
          <span className={styles.imageCount}>
            {images.length} {images.length === 1 ? 'imagen' : 'imágenes'}
          </span>
          <button onClick={refreshGallery} className={styles.refreshButton}>
            ↻ Actualizar
          </button>
        </div>
      </div>

      {images.length === 0 ? (
        <div className={styles.emptyGallery}>
          <p>No hay imágenes disponibles en esta galería.</p>
        </div>
      ) : (
        <>
          <div className={styles.imageGrid}>
            {currentImages.map((image) => (
              <ImageCard 
                key={image.id} 
                image={image} 
                folderType={folderType}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button 
                onClick={prevPage} 
                disabled={currentPage === 1}
                className={styles.paginationButton}
              >
                ← Anterior
              </button>
              
              <div className={styles.pageNumbers}>
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => paginate(index + 1)}
                    className={`${styles.pageNumber} ${
                      currentPage === index + 1 ? styles.activePage : ''
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              
              <button 
                onClick={nextPage} 
                disabled={currentPage === totalPages}
                className={styles.paginationButton}
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ImageGallery;