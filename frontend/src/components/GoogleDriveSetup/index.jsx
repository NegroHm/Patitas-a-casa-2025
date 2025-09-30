import React from 'react';
import styles from './styles.module.css';

const GoogleDriveSetup = ({ type = 'gallery' }) => {
  const setupSteps = [
    "Ve a Google Cloud Console (https://console.cloud.google.com/)",
    "Crea un nuevo proyecto o selecciona uno existente",
    "Habilita la API de Google Drive",
    "Crea credenciales (API Key y OAuth 2.0 client)",
    "Configura la pantalla de consentimiento OAuth",
    "Agrega dominios autorizados para tu aplicación",
    "Crea dos carpetas públicas en Google Drive",
    "Obtén los IDs de las carpetas desde las URLs",
    "Actualiza las variables de entorno en el archivo .env"
  ];

  return (
    <div className={styles.setupContainer}>
      <div className={styles.setupHeader}>
        <h3 className={styles.setupTitle}>
          🔧 Configuración de Google Drive Requerida
        </h3>
        <p className={styles.setupDescription}>
          {type === 'gallery' 
            ? 'Para mostrar la galería de imágenes, necesitas configurar las credenciales de Google Drive.'
            : 'Para subir imágenes a Google Drive, necesitas configurar las credenciales primero.'
          }
        </p>
      </div>

      <div className={styles.credentialsInfo}>
        <h4>Variables de entorno faltantes:</h4>
        <ul className={styles.credentialsList}>
          <li><code>VITE_GOOGLE_DRIVE_API_KEY</code></li>
          <li><code>VITE_GOOGLE_CLIENT_ID</code></li>
          <li><code>VITE_GOOGLE_DRIVE_PERDIDOS_FOLDER_ID</code></li>
          <li><code>VITE_GOOGLE_DRIVE_ENCONTRADOS_FOLDER_ID</code></li>
        </ul>
      </div>

      <div className={styles.setupSteps}>
        <h4>Pasos para configurar Google Drive:</h4>
        <ol className={styles.stepsList}>
          {setupSteps.map((step, index) => (
            <li key={index} className={styles.step}>
              {step}
            </li>
          ))}
        </ol>
      </div>

      <div className={styles.helpLinks}>
        <h4>Enlaces útiles:</h4>
        <ul className={styles.linksList}>
          <li>
            <a 
              href="https://console.cloud.google.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.helpLink}
            >
              Google Cloud Console
            </a>
          </li>
          <li>
            <a 
              href="https://developers.google.com/drive/api/v3/quickstart/js" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.helpLink}
            >
              Guía de Google Drive API
            </a>
          </li>
        </ul>
      </div>

      <div className={styles.fileExample}>
        <h4>Ejemplo de archivo .env:</h4>
        <pre className={styles.envExample}>
{`# Google Drive API Configuration
VITE_GOOGLE_DRIVE_API_KEY=tu_api_key_aqui
VITE_GOOGLE_CLIENT_ID=tu_client_id_aqui.apps.googleusercontent.com
VITE_GOOGLE_DRIVE_PERDIDOS_FOLDER_ID=id_carpeta_perdidos
VITE_GOOGLE_DRIVE_ENCONTRADOS_FOLDER_ID=id_carpeta_encontrados`}
        </pre>
      </div>
    </div>
  );
};

export default GoogleDriveSetup;