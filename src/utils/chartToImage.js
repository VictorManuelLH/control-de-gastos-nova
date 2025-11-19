import html2canvas from 'html2canvas';

/**
 * Convierte un elemento HTML (gráfica) a imagen base64
 * @param {string} elementId - ID del elemento HTML a capturar
 * @param {Object} options - Opciones adicionales para html2canvas
 * @returns {Promise<string>} - Imagen en formato base64
 */
export const captureChartAsImage = async (elementId, options = {}) => {
    try {
        const element = document.getElementById(elementId);

        if (!element) {
            console.warn(`⚠️ No se encontró el elemento con ID: ${elementId}`);
            return null;
        }

        // Esperar un momento para que las animaciones terminen
        await new Promise(resolve => setTimeout(resolve, 500));

        const canvas = await html2canvas(element, {
            backgroundColor: '#ffffff',
            scale: 2, // Mayor resolución
            logging: false,
            useCORS: true,
            allowTaint: true,
            ...options
        });

        const imageData = canvas.toDataURL('image/png');
        console.log(`✅ Gráfica capturada: ${elementId}`);

        return imageData;
    } catch (error) {
        console.error(`❌ Error al capturar gráfica ${elementId}:`, error);
        return null;
    }
};

/**
 * Captura múltiples gráficas y las devuelve como un objeto
 * @param {Array<string>} elementIds - Array de IDs de elementos a capturar
 * @returns {Promise<Object>} - Objeto con las imágenes capturadas {id: imageData}
 */
export const captureMultipleCharts = async (elementIds) => {
    const images = {};

    for (const elementId of elementIds) {
        const imageData = await captureChartAsImage(elementId);
        if (imageData) {
            images[elementId] = imageData;
        }
    }

    return images;
};

/**
 * Espera a que las gráficas se rendericen completamente
 * @param {number} delay - Tiempo de espera en milisegundos
 * @returns {Promise<void>}
 */
export const waitForChartsToRender = (delay = 1000) => {
    return new Promise(resolve => setTimeout(resolve, delay));
};
