# Actualizar Template de EmailJS para incluir Imágenes

Para que las imágenes aparezcan correctamente en los emails, necesitas actualizar tu template de EmailJS:

## 1. Ve a tu Dashboard de EmailJS
- Accede a https://dashboard.emailjs.com/
- Ve a "Email Templates"
- Edita tu template actual (template_ps4fjwo)

## 2. Actualizar el HTML del Template

Reemplaza el contenido HTML del template con esto:

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px;">
    {{subject}}
  </h2>
  
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <pre style="white-space: pre-wrap; font-family: Arial, sans-serif; margin: 0;">{{message}}</pre>
  </div>
  
  {{#pet_image}}
  <div style="margin: 20px 0; text-align: center;">
    <h3 style="color: #333; margin-bottom: 10px;">Imagen de la mascota:</h3>
    <img src="{{pet_image}}" alt="Imagen de la mascota" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <p style="color: #666; font-size: 12px; margin-top: 8px;">
      <a href="{{pet_image}}" target="_blank" style="color: #667eea;">Ver imagen en tamaño completo</a>
    </p>
  </div>
  {{/pet_image}}
  
  <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
  
  <div style="background-color: #667eea; color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
    <p style="margin: 0;"><strong>Información de contacto:</strong> {{from_name}}</p>
    <p style="margin: 5px 0 0 0;"><strong>Email de respuesta:</strong> {{reply_to}}</p>
  </div>
  
  <p style="color: #666; font-size: 12px; text-align: center; margin-top: 20px;">
    Este reporte fue enviado desde el sistema MVP de Patitas a Casa<br>
    <em>Sistema de Reportes de Mascotas</em>
  </p>
</div>
```

## 3. Variables del Template

Asegúrate de que estas variables estén disponibles en tu template:

- `{{subject}}` - Asunto del email
- `{{message}}` - Contenido principal del reporte  
- `{{pet_image}}` - URL de la imagen de la mascota
- `{{from_name}}` - Nombre del contacto
- `{{reply_to}}` - Email de respuesta

## 4. Configuración de Variables

En la sección "Settings" de tu template, asegúrate de tener estas variables:

```
subject: {{subject}}
message: {{message}}
pet_image: {{pet_image}}
from_name: {{from_name}}
reply_to: {{reply_to}}
```

## 5. Resultado Final

Con esta configuración:
- ✅ El email tendrá un diseño profesional
- ✅ La imagen aparecerá directamente en el email (si existe)
- ✅ Habrá un enlace para ver la imagen en tamaño completo
- ✅ Toda la información estará bien formateada
- ✅ Si no hay imagen, esa sección no aparecerá

## 6. Probar la Funcionalidad

Después de actualizar el template:
1. Guarda los cambios en EmailJS
2. Ve a http://localhost:5173/reporte
3. Llena el formulario CON una imagen
4. Envía el reporte
5. Verifica que el email llegue con la imagen incluida

¡La funcionalidad de imágenes ya está implementada en el código, solo necesita que actualices el template en EmailJS!