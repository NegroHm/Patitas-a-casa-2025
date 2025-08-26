import emailjs from '@emailjs/browser';

// Inicializar EmailJS con la clave pública
emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);

export const sendReportEmail = async (reportData) => {
  const typeText = reportData.type_search === 'LOST' ? 'PERDIDO' : 'ENCONTRADO';
  const petTypeText = reportData.type === 'DOG' ? 'Perro' : 'Gato';
  const sizeText = 
    reportData.size === 'SMALL' ? 'Pequeño' : 
    reportData.size === 'MEDIUM' ? 'Mediano' : 'Grande';

  const emailContent = `
NUEVO REPORTE DE MASCOTA ${typeText}

Tipo de reporte: ${typeText}
${reportData.name ? `Nombre: ${reportData.name}` : ''}
Color: ${reportData.color}
Especie: ${petTypeText}
Tamaño: ${sizeText}
Departamento: ${reportData.city}
Dirección: ${reportData.address}
Contacto: ${reportData.contact}
Fecha: ${reportData.loss_date ? new Date(reportData.loss_date).toLocaleDateString() : ''}
Descripción: ${reportData.description}
${reportData.image_url ? `Ver imagen: ${reportData.image_url}` : 'Sin imagen'}

---
Enviado desde Patitas a Casa - Sistema de Reportes MVP
  `;

  const templateParams = {
    to_email: 'patitasacasaorg@gmail.com',
    subject: `Reporte de mascota ${reportData.type_search === 'LOST' ? 'perdida' : 'encontrada'}`,
    message: emailContent,
    from_name: reportData.contact,
    reply_to: reportData.contact,
    pet_image: reportData.image_url || '',
    image_attachment: reportData.image_url || '',
  };

  try {
    const response = await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      templateParams,
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    );
    
    console.log('Email sent successfully:', response);
    return { success: true, response };
  } catch (error) {
    console.error('EmailJS error:', error);
    throw error;
  }
};

export default emailjs;