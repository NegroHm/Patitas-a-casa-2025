import { Data } from '../../../data/HO-PET';
import {
  LetraParrafo,
  LetraSubtitulo,
  LetraTitulo,
  Paginacion,
  PerdidosTarjeta,
} from '../../../components';
import styles from './styles.module.css';
import { useEffect, useState } from 'react';
import useGet from '../../../hooks/services/useGet';
import ImageGallery from '../../../components/ImageGallery';
import ImageUpload from '../../../components/ImageUpload';

const Encontrados = () => {
  const { data, status } = useGet('form');
  const [foundPets, setFoundPets] = useState([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [galleryKey, setGalleryKey] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage, setPostsPerPage] = useState(10);

  const lastPostIndex = currentPage * postsPerPage;
  const firstPostIndex = lastPostIndex - postsPerPage;
  const currentPosts = foundPets.slice(firstPostIndex, lastPostIndex);
  const totalPosts = foundPets.length;
  const totalPages = Math.ceil(totalPosts / postsPerPage);

  const TranslateSize = (size) => {
    switch (size) {
      case 'SMALL':
        return 'Pequeño';
      case 'MEDIUM':
        return 'Mediano';
      case 'LARGE':
        return 'Grande';
      // Puedes agregar más casos según tus necesidades
      default:
        return size; // Mantén el valor original si no coincide con los casos anteriores
    }
  };

  useEffect(() => {
    if (data) {
      // Filtrar los elementos con type_search igual a "FOUND"
      const filteredFoundPets = data.data.filter(
        (item) => item.type_search === 'FOUND'
      );
      // Actualizar el estado solo si los datos filtrados son diferentes a lostPets
      if (!areArraysEqual(filteredFoundPets, foundPets)) {
        setFoundPets(filteredFoundPets);
      }
    }
  }, [data, foundPets]);

  // Función para comparar dos arrays
  function areArraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) {
      return false;
    }

    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) {
        return false;
      }
    }

    return true;
  }

  const handleUploadSuccess = () => {
    setGalleryKey(prev => prev + 1); // Force gallery refresh
    setShowUploadForm(false);
  };

  return (
    <>
      <div className={styles.perdidos}>
        <section className={styles['texto-container']}>
          <article className={styles['texto-container__titulo']}>
            <LetraTitulo
              texto="Mascotas Encontradas"
              clase="letra-titulo--red"
            />
            <LetraSubtitulo
              texto="Devuelve a tu amigo peludo a casa"
              clase="letra-titulo--red"
            />
          </article>
          <article className={styles['texto-container__subtitulo']}>
            <LetraParrafo
              texto="“Mascotas encontradas en busca de su dueño. Contacta al número en el afiche para reunirlas.”"
              clase="letra-parrafo--black"
            />
          </article>
        </section>
        
        

      {/* Google Drive Image Gallery */}
      
        <div className={styles.galleryHeader}>
          
        </div>
        
        {showUploadForm && (
          <ImageUpload 
            folderType="encontrados" 
            onUploadSuccess={handleUploadSuccess}
          />
        )}
        
        <ImageGallery 
          key={galleryKey}
          folderType="encontrados" 
          title="Imágenes de Mascotas Encontradas"
        />
      
      </div>
    </>
  );
};

export default Encontrados;
