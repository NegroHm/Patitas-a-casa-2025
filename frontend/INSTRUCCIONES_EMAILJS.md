# Configuración de EmailJS para el Sistema de Reportes MVP

## Pasos para configurar EmailJS:

### 1. Crear cuenta en EmailJS
- Ve a https://www.emailjs.com/
- Crea una cuenta gratuita

### 2. Configurar el servicio de email
- En el dashboard de EmailJS, ve a "Email Services"
- Haz clic en "Add New Service"
- Selecciona Gmail (o tu proveedor preferido)
- Conecta tu cuenta de Gmail (patitasacasaorg@gmail.com)
- Copia el SERVICE ID generado

### 3. Crear plantilla de email
- Ve a "Email Templates"
- Haz clic en "Create New Template"
- Configura la plantilla con estos campos:
  - **From Name**: {{from_name}}
  - **To Email**: patitasacasaorg@gmail.com
  - **Subject**: {{subject}}
  - **Content**: {{message}}
- Guarda la plantilla y copia el TEMPLATE ID

### 4. Obtener la clave pública
- Ve a "Account" > "General"
- Copia la PUBLIC KEY

### 5. Configurar variables de entorno
Edita el archivo `.env` en la carpeta frontend y reemplaza los valores:

```bash
VITE_EMAILJS_SERVICE_ID=tu_service_id_aqui
VITE_EMAILJS_TEMPLATE_ID=tu_template_id_aqui  
VITE_EMAILJS_PUBLIC_KEY=tu_public_key_aqui
```

### 6. Plantilla de Email Recomendada

**Subject**: Reporte de mascota - {{subject}}

**HTML Content**:
```html
<h2>{{subject}}</h2>
<div style="font-family: Arial, sans-serif; max-width: 600px;">
    <pre style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; white-space: pre-wrap;">{{message}}</pre>
    
    <hr style="margin: 20px 0;">
    
    <p><strong>Información de contacto:</strong> {{from_name}}</p>
    <p><strong>Email de respuesta:</strong> {{reply_to}}</p>
    
    <p style="color: #666; font-size: 12px;">
        Este reporte fue enviado desde el sistema MVP de Patitas a Casa
    </p>
</div>
```

### 7. Límites del plan gratuito
- 200 emails por mes
- Suficiente para el MVP

### 8. Probar la funcionalidad
Una vez configurado:
1. Reinicia el servidor de desarrollo (`npm run dev`)
2. Ve a http://localhost:5173/reporte
3. Llena y envía un formulario de prueba
4. Verifica que llegue el email a patitasacasaorg@gmail.com

## Estructura del email enviado

Los reportes llegaran con este formato:

```
NUEVO REPORTE DE MASCOTA PERDIDO/ENCONTRADO

Tipo de reporte: PERDIDO/ENCONTRADO
Nombre: [nombre si es perdido]
Color: [color]
Especie: Perro/Gato
Tamaño: Pequeño/Mediano/Grande
Departamento: [departamento]
Dirección: [dirección]
Contacto: [contacto]
Fecha: [fecha]
Descripción: [descripción]
Imagen: [URL de la imagen si existe]

---
Enviado desde Patitas a Casa - Sistema de Reportes MVP
```