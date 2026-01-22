import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Export Service
 * Handles exporting survey results in multiple formats
 */
export const exportService = {
  /**
   * Export survey results to CSV format
   * @param {Object} survey - Survey object
   * @param {Array} responses - Array of response objects
   */
  exportToCSV: (survey, responses) => {
    try {
      // Prepare data for CSV
      const csvData = [];

      // Add header row
      const headers = ['Email', 'Fecha de Envío'];
      survey.questions.forEach((q, index) => {
        headers.push(`P${index + 1}: ${q.text}`);
      });
      csvData.push(headers);

      // Add response rows
      responses.forEach(response => {
        const row = [
          response.respondentEmail,
          new Date(response.submittedAt).toLocaleString('es-EC')
        ];

        survey.questions.forEach(question => {
          const answer = response.answers.find(a => a.questionId === question._id);
          row.push(answer ? answer.value : 'Sin respuesta');
        });

        csvData.push(row);
      });

      // Convert to CSV string
      const csv = Papa.unparse(csvData);

      // Download file
      downloadFile(
        csv,
        `${sanitizeFilename(survey.title)}_resultados.csv`,
        'text/csv;charset=utf-8;'
      );

      console.log('CSV export successful');
    } catch (error) {
      console.error('CSV export error:', error);
      throw new Error('Error al exportar a CSV');
    }
  },

  /**
   * Export survey results to Excel format
   * @param {Object} survey - Survey object
   * @param {Array} responses - Array of response objects
   */
  exportToExcel: (survey, responses) => {
    try {
      const workbook = XLSX.utils.book_new();

      // Sheet 1: Responses
      const responsesData = [];
      
      // Header row
      const headers = ['Email', 'Fecha de Envío'];
      survey.questions.forEach((q, index) => {
        headers.push(`P${index + 1}: ${q.text}`);
      });
      responsesData.push(headers);

      // Data rows
      responses.forEach(response => {
        const row = [
          response.respondentEmail,
          new Date(response.submittedAt).toLocaleString('es-EC')
        ];

        survey.questions.forEach(question => {
          const answer = response.answers.find(a => a.questionId === question._id);
          row.push(answer ? answer.value : 'Sin respuesta');
        });

        responsesData.push(row);
      });

      const responsesSheet = XLSX.utils.aoa_to_sheet(responsesData);
      XLSX.utils.book_append_sheet(workbook, responsesSheet, 'Respuestas');

      // Sheet 2: Statistics
      const statsData = [
        ['Estadísticas de la Encuesta'],
        [''],
        ['Título', survey.title],
        ['Descripción', survey.description || 'N/A'],
        ['Total de Respuestas', responses.length],
        ['Fecha de Creación', new Date(survey.createdAt).toLocaleDateString('es-EC')],
        ['Estado', survey.status === 'active' ? 'Activa' : survey.status === 'closed' ? 'Cerrada' : 'Borrador'],
        [''],
        ['Preguntas']
      ];

      survey.questions.forEach((q, index) => {
        statsData.push([`${index + 1}. ${q.text}`, q.type]);
        
        // Add question-specific stats
        if (q.type === 'multiple') {
          const answers = responses
            .map(r => r.answers.find(a => a.questionId === q._id))
            .filter(Boolean);

          q.options.forEach(option => {
            const count = answers.filter(a => a.value === option).length;
            const percentage = responses.length > 0 
              ? ((count / responses.length) * 100).toFixed(1) 
              : 0;
            statsData.push([`  - ${option}`, `${count} (${percentage}%)`]);
          });
        } else if (q.type === 'scale') {
          const answers = responses
            .map(r => r.answers.find(a => a.questionId === q._id))
            .filter(Boolean);
          
          const values = answers.map(a => parseInt(a.value));
          if (values.length > 0) {
            const avg = values.reduce((a, b) => a + b, 0) / values.length;
            statsData.push([`  Promedio`, avg.toFixed(2)]);
          }
        }
        
        statsData.push(['']);
      });

      const statsSheet = XLSX.utils.aoa_to_sheet(statsData);
      XLSX.utils.book_append_sheet(workbook, statsSheet, 'Estadísticas');

      // Download file
      XLSX.writeFile(workbook, `${sanitizeFilename(survey.title)}_resultados.xlsx`);

      console.log('Excel export successful');
    } catch (error) {
      console.error('Excel export error:', error);
      throw new Error('Error al exportar a Excel');
    }
  },

  /**
   * Export survey results to PDF format
   * @param {Object} survey - Survey object
   * @param {Array} responses - Array of response objects
   */
  exportToPDF: async (survey, responses) => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Helper function to check if we need a new page
      const checkNewPage = (height) => {
        if (yPosition + height > pageHeight - 20) {
          pdf.addPage();
          yPosition = 20;
        }
      };

      // Title
      pdf.setFontSize(18);
      pdf.setFont(undefined, 'bold');
      pdf.text(survey.title, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;

      // Description
      if (survey.description) {
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        const descLines = pdf.splitTextToSize(survey.description, pageWidth - 40);
        pdf.text(descLines, 20, yPosition);
        yPosition += descLines.length * 5 + 5;
      }

      // Statistics
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'bold');
      checkNewPage(20);
      pdf.text('Estadísticas', 20, yPosition);
      yPosition += 8;

      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      pdf.text(`Total de respuestas: ${responses.length}`, 20, yPosition);
      yPosition += 6;
      pdf.text(`Fecha de creación: ${new Date(survey.createdAt).toLocaleDateString('es-EC')}`, 20, yPosition);
      yPosition += 6;
      pdf.text(`Estado: ${survey.status === 'active' ? 'Activa' : survey.status === 'closed' ? 'Cerrada' : 'Borrador'}`, 20, yPosition);
      yPosition += 12;

      // Questions and responses
      survey.questions.forEach((question, qIndex) => {
        checkNewPage(30);

        pdf.setFontSize(12);
        pdf.setFont(undefined, 'bold');
        const questionText = `${qIndex + 1}. ${question.text}`;
        const questionLines = pdf.splitTextToSize(questionText, pageWidth - 40);
        pdf.text(questionLines, 20, yPosition);
        yPosition += questionLines.length * 6 + 5;

        const answers = responses
          .map(r => r.answers.find(a => a.questionId === question._id))
          .filter(Boolean);

        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');

        if (question.type === 'multiple') {
          question.options.forEach(option => {
            const count = answers.filter(a => a.value === option).length;
            const percentage = responses.length > 0 
              ? ((count / responses.length) * 100).toFixed(1) 
              : 0;
            
            checkNewPage(6);
            pdf.text(`  ${option}: ${count} (${percentage}%)`, 25, yPosition);
            yPosition += 5;
          });
        } else if (question.type === 'scale') {
          const values = answers.map(a => parseInt(a.value));
          if (values.length > 0) {
            const avg = values.reduce((a, b) => a + b, 0) / values.length;
            const sorted = [...values].sort((a, b) => a - b);
            const median = sorted[Math.floor(sorted.length / 2)];
            
            checkNewPage(15);
            pdf.text(`  Promedio: ${avg.toFixed(2)}`, 25, yPosition);
            yPosition += 5;
            pdf.text(`  Mediana: ${median}`, 25, yPosition);
            yPosition += 5;
          }
        } else if (question.type === 'text') {
          checkNewPage(6);
          pdf.text(`  ${answers.length} respuesta(s) de texto`, 25, yPosition);
          yPosition += 5;
        } else if (question.type === 'date') {
          checkNewPage(6);
          pdf.text(`  ${answers.length} fecha(s) seleccionada(s)`, 25, yPosition);
          yPosition += 5;
        }

        yPosition += 8;
      });

      // Save PDF
      pdf.save(`${sanitizeFilename(survey.title)}_resultados.pdf`);

      console.log(' PDF export successful');
    } catch (error) {
      console.error(' PDF export error:', error);
      throw new Error('Error al exportar a PDF');
    }
  }
};

/**
 * Helper function to download a file
 * @param {string} content - File content
 * @param {string} filename - File name
 * @param {string} mimeType - MIME type
 */
const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

/**
 * Sanitize filename to remove invalid characters
 * @param {string} filename - Original filename
 * @returns {string} Sanitized filename
 */
const sanitizeFilename = (filename) => {
  return filename
    .replace(/[^a-z0-9]/gi, '_')
    .toLowerCase()
    .substring(0, 50);
};

export default exportService;