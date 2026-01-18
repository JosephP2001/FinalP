import nodemailer from 'nodemailer';

// Configurar transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD // App Password de Gmail
  }
});

// Verificar configuración
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Error configurando email:', error);
  } else {
    console.log('✅ Email service ready');
  }
});

// Enviar notificación de cierre de encuesta
export const sendSurveyClosed = async (creatorEmail, surveyTitle, reason, stats) => {
  const reasonText = reason === 'date' 
    ? '📅 La fecha de cierre programada ha sido alcanzada'
    : `📊 Se alcanzó el límite de ${stats.maxResponses} respuestas`;

  const mailOptions = {
    from: `"UCE Survey System" <${process.env.EMAIL_USER}>`,
    to: creatorEmail,
    subject: `🔒 Tu encuesta "${surveyTitle}" se ha cerrado`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .stats { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
          .stat-item { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px; background: #f3f4f6; border-radius: 6px; }
          .reason { background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
          .btn { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">📊 Encuesta Cerrada</h1>
          </div>
          <div class="content">
            <h2>Hola 👋</h2>
            <p>Tu encuesta <strong>"${surveyTitle}"</strong> ha sido cerrada automáticamente.</p>
            
            <div class="reason">
              <strong>Motivo de cierre:</strong><br>
              ${reasonText}
            </div>

            <div class="stats">
              <h3 style="margin-top: 0; color: #667eea;">📈 Estadísticas Finales</h3>
              <div class="stat-item">
                <span><strong>Total de Respuestas:</strong></span>
                <span>${stats.totalResponses}</span>
              </div>
              <div class="stat-item">
                <span><strong>Fecha de Cierre:</strong></span>
                <span>${new Date().toLocaleDateString('es-EC', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </div>
              ${stats.maxResponses ? `
              <div class="stat-item">
                <span><strong>Límite Configurado:</strong></span>
                <span>${stats.maxResponses} respuestas</span>
              </div>
              ` : ''}
            </div>

            <p>Puedes revisar los resultados completos y el análisis con IA en tu dashboard.</p>

            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/surveys" class="btn">
                Ver Resultados
              </a>
            </div>

            <div class="footer">
              <p>Universidad Central del Ecuador<br>Sistema de Encuestas Inteligentes</p>
              <p style="font-size: 12px; color: #9ca3af;">
                Este es un mensaje automático. Por favor no respondas a este correo.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email enviado a ${creatorEmail}`);
    return true;
  } catch (error) {
    console.error('❌ Error enviando email:', error);
    return false;
  }
};

// Enviar notificación cuando alguien ya respondió
export const sendAlreadyResponded = async (email, surveyTitle) => {
  const mailOptions = {
    from: `"UCE Survey System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `⚠️ Ya respondiste la encuesta "${surveyTitle}"`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ef4444; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #fef2f2; padding: 30px; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">⚠️ Respuesta Duplicada</h1>
          </div>
          <div class="content">
            <h2>Hola 👋</h2>
            <p>Detectamos que ya has respondido la encuesta <strong>"${surveyTitle}"</strong> con este correo electrónico.</p>
            <p>Por políticas de nuestra plataforma, <strong>solo se permite una respuesta por persona</strong>.</p>
            <p>Si crees que esto es un error, por favor contacta al creador de la encuesta.</p>
            <div class="footer">
              <p>Universidad Central del Ecuador<br>Sistema de Encuestas Inteligentes</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de alerta enviado a ${email}`);
  } catch (error) {
    console.error('❌ Error enviando email:', error);
  }
};