import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import { Image } from 'cloudinary-react';
import { sendReportEmail } from '../../config/emailjs';

import styles from './styles.module.css';

import dog from '/icons/imagenes recursos/dog-seating.png';
import pet from '/icons/imagenes recursos/pet.png';

export const ReporteForm = () => {
  const [petType, setPetType] = useState(true);
  const [formData, setFormData] = useState({});
  const [file, setFile] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormData(
      petType
        ? {
            name: '',
            color: '',
            size: '',
            city: '',
            address: '',
            contact: '',
            loss_date: '',
            description: '',
            type: '',
            type_search: 'LOST',
            image_url: null,
          }
        : {
            color: '',
            size: '',
            city: '',
            address: '',
            contact: '',
            loss_date: '',
            description: '',
            type: '',
            type_search: 'FOUND',
            image_url: null,
          }
    );
  }, [petType]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name !== 'image_url') {
      const formattedValue =
        name === 'loss_date' ? `${value}T23:39:49.000000Z` : value;

      setFormData((prevData) => ({
        ...prevData,
        [name]: formattedValue,
      }));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) {
      console.log('No se ha seleccionado ninguna imagen');
      return;
    }

    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      toast.error('Solo se permiten archivos JPG, JPEG o PNG');
      return;
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no puede ser mayor a 5MB');
      return;
    }

    try {
      setLoading(true);
      toast.info('Subiendo imagen...');

      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('upload_preset', 'aqeczzrt');

      const response = await axios.post(
        'https://api.cloudinary.com/v1_1/dlfwgaprv/image/upload',
        uploadFormData
      );
      
      if (response.data && response.data.secure_url) {
        const imageUrl = response.data.secure_url;

        setFormData((prevData) => ({
          ...prevData,
          image_url: imageUrl,
        }));
        setFile(true);
        toast.success('Imagen subida correctamente');
      } else {
        throw new Error('No se recibió URL de imagen');
      }
    } catch (error) {
      console.error('Error al subir la imagen a Cloudinary:', error);
      toast.error('Error al subir la imagen. Intenta de nuevo.');
      setFile(false);
    } finally {
      setLoading(false);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.color || !formData.city || !formData.contact || !formData.type) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      setLoading(true);
      
      await sendReportEmail(formData);

      toast.success('Reporte enviado con éxito', {
        duration: 3000,
      });

      // Limpiar formulario
      setFormData(petType ? {
        name: '', color: '', size: '', city: '', address: '',
        contact: '', loss_date: '', description: '', type: '',
        type_search: 'LOST', image_url: null,
      } : {
        color: '', size: '', city: '', address: '',
        contact: '', loss_date: '', description: '', type: '',
        type_search: 'FOUND', image_url: null,
      });
      setFile(false);

    } catch (error) {
      console.error('Error al enviar el reporte:', error);
      toast.error('Error al enviar el reporte. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles['report-container']}>
      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.headerForm}>
            <h2>Reportar Mascota</h2>
            <div className={styles.tabsContainer}>
              <div
                className={petType ? styles.petSelected : styles.pet}
                onClick={() => setPetType(true)}
              >
                <img src={dog} alt="dog draw" /> Perdido
              </div>
              <div
                className={!petType ? styles.petSelected : styles.pet}
                onClick={() => setPetType(false)}
              >
                <img src={pet} alt="pet draw" /> Encontrado
              </div>
            </div>
          </div>

          <div className={styles.mainForm}>
            <div className={styles.imageSection}>
              {file && formData.image_url ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img
                    src={formData.image_url}
                    alt="Vista previa"
                    style={{ 
                      width: '100px', 
                      height: '100px', 
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '2px solid #ddd'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFile(false);
                      setFormData(prev => ({ ...prev, image_url: null }));
                    }}
                    style={{
                      background: '#DE341D',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      transition: 'background-color 0.3s'
                    }}
                    onMouseOver={(e) => e.target.style.background = '#c92d18'}
                    onMouseOut={(e) => e.target.style.background = '#DE341D'}
                  >
                    ✕ Quitar
                  </button>
                </div>
              ) : null}
              
              <div className={styles.buttonFile}>
                <label 
                  htmlFor="petFile"
                  className={file ? styles.uploaded : ''}
                >
                  {loading ? 'Subiendo...' : file ? 'Cambiar foto' : 'Subir foto'}
                </label>
                <input
                  type="file"
                  id="petFile"
                  accept="image/*"
                  name="image_url"
                  onChange={handleImageUpload}
                  disabled={loading}
                />
              </div>
            </div>

            <section className={styles.form_inputs}>
              {petType && (
                <input
                  type="text"
                  name="name"
                  placeholder="Nombre de la mascota"
                  value={formData.name || ''}
                  onChange={handleChange}
                />
              )}
              
              <input
                type="text"
                name="color"
                placeholder="Color *"
                value={formData.color || ''}
                onChange={handleChange}
                required
              />

              <div className={styles.row}>
                <select
                  name="size"
                  value={formData.size || ''}
                  onChange={handleChange}
                  required
                >
                  <option value="">Tamaño *</option>
                  <option value="SMALL">Pequeño</option>
                  <option value="MEDIUM">Mediano</option>
                  <option value="LARGE">Grande</option>
                </select>
                
                <select
                  name="type"
                  value={formData.type || ''}
                  onChange={handleChange}
                  required
                >
                  <option value="">Especie *</option>
                  <option value="DOG">Perro</option>
                  <option value="CAT">Gato</option>
                </select>
              </div>

              <input
                type="text"
                name="city"
                placeholder="Departamento *"
                value={formData.city || ''}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="address"
                placeholder="Dirección"
                value={formData.address || ''}
                onChange={handleChange}
              />

              <div className={styles.row}>
                <input
                  type="text"
                  name="contact"
                  placeholder="Contacto (teléfono/email) *"
                  value={formData.contact || ''}
                  onChange={handleChange}
                  required
                />
                
                <input
                  type="date"
                  name="loss_date"
                  value={formData.loss_date ? formData.loss_date.split('T')[0] : ''}
                  onChange={handleChange}
                />
              </div>
            </section>

            <div className={styles.descriptionSection}>
              <h3>Descripción</h3>
              <textarea
                name="description"
                cols="30"
                rows="5"
                placeholder="Describe características adicionales, comportamiento, etc."
                value={formData.description || ''}
                onChange={handleChange}
                maxLength={300}
              />
              <p className={styles.charLimit}>Máximo 300 caracteres</p>
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Enviar Reporte'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};