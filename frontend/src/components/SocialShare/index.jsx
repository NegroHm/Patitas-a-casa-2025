import React, { useState } from 'react';
import styles from './styles.module.css';

const SocialShare = ({ shareData, onClose }) => {
  const [copySuccess, setCopySuccess] = useState(false);

  const { title, text, url, image } = shareData;

  const shareOnFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };

  const shareOnTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  };

  const shareOnWhatsApp = () => {
    const whatsappText = `${text} ${url}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
    window.open(whatsappUrl, '_blank');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const shareViaWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: text,
          url: url
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    }
  };

  return (
    <div className={styles.modal} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>Compartir Imagen</h3>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.previewContainer}>
          <img src={image} alt="Preview" className={styles.previewImage} />
          <div className={styles.previewText}>
            <h4>{title}</h4>
            <p>{text}</p>
          </div>
        </div>

        <div className={styles.shareOptions}>
          <button className={styles.shareButton} onClick={shareOnFacebook}>
            <span className={styles.facebookIcon}>📘</span>
            Facebook
          </button>

          <button className={styles.shareButton} onClick={shareOnTwitter}>
            <span className={styles.twitterIcon}>🐦</span>
            Twitter / X
          </button>

          <button className={styles.shareButton} onClick={shareOnWhatsApp}>
            <span className={styles.whatsappIcon}>💬</span>
            WhatsApp
          </button>

          {navigator.share && (
            <button className={styles.shareButton} onClick={shareViaWebShare}>
              <span className={styles.shareIcon}>📤</span>
              Compartir...
            </button>
          )}
        </div>

        <div className={styles.linkSection}>
          <label className={styles.linkLabel}>Enlace directo:</label>
          <div className={styles.linkContainer}>
            <input
              type="text"
              value={url}
              readOnly
              className={styles.linkInput}
            />
            <button 
              className={`${styles.copyButton} ${copySuccess ? styles.copySuccess : ''}`}
              onClick={copyToClipboard}
            >
              {copySuccess ? '✓ Copiado' : '📋 Copiar'}
            </button>
          </div>
        </div>

        <div className={styles.helpText}>
          <p>💡 <strong>Tip:</strong> Comparte esta imagen para ayudar a reunir mascotas con sus familias</p>
        </div>
      </div>
    </div>
  );
};

export default SocialShare;