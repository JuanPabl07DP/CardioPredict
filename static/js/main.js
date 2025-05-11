/**
 * Aplicación de Predicción de Enfermedades Cardiovasculares
 * CardioPredict - Sistema de predicción basado en ML
 */

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const form = document.getElementById('prediction-form');
    const loading = document.getElementById('loading');
    const result = document.getElementById('result');
    const smokeCheckbox = document.getElementById('smoke');
    const alcoCheckbox = document.getElementById('alco');
    const activeCheckbox = document.getElementById('active');
    const formProgress = document.getElementById('form-progress');
    const bmiDisplay = document.getElementById('bmi-display');
    const bmiValue = document.getElementById('bmi-value');
    const bmiCategory = document.getElementById('bmi-category');
    const bpDisplay = document.getElementById('bp-display');
    const bpCategory = document.getElementById('bp-category');
    const heightInput = document.getElementById('height');
    const weightInput = document.getElementById('weight');
    const systolicInput = document.getElementById('ap_hi');
    const diastolicInput = document.getElementById('ap_lo');
    const backButton = document.getElementById('back-button');
    const downloadButton = document.getElementById('download-report');
    const imageInput = document.getElementById('mri_image');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const imagePreview = document.getElementById('image-preview');
    const resetButton = document.getElementById('reset-button');

    // Inicializar checkboxes
    smokeCheckbox.checked = false;
    alcoCheckbox.checked = false;
    activeCheckbox.checked = true;

    // Función para calcular el IMC
    function calculateBMI() {
        const height = parseFloat(heightInput.value);
        const weight = parseFloat(weightInput.value);

        if (height && weight && height >= 100 && height <= 250 && weight >= 30 && weight <= 200) {
            const heightInMeters = height / 100;
            const bmi = weight / (heightInMeters * heightInMeters);
            bmiValue.textContent = bmi.toFixed(1);

            // Determinar categoría de IMC
            let category = '';
            if (bmi < 18.5) category = 'Bajo peso';
            else if (bmi < 25) category = 'Peso normal';
            else if (bmi < 30) category = 'Sobrepeso';
            else if (bmi < 35) category = 'Obesidad grado I';
            else if (bmi < 40) category = 'Obesidad grado II';
            else category = 'Obesidad grado III';

            bmiCategory.textContent = category;
            bmiDisplay.style.display = 'block';
        } else {
            bmiDisplay.style.display = 'none';
        }
    }

    // Función para determinar la categoría de presión arterial
    function calculateBloodPressureCategory() {
        const systolic = parseInt(systolicInput.value);
        const diastolic = parseInt(diastolicInput.value);

        if (systolic && diastolic) {
            let category = '';

            if (systolic < 120 && diastolic < 80) {
                category = 'Normal';
            } else if (systolic < 130 && diastolic < 80) {
                category = 'Elevada';
            } else if ((systolic >= 130 && systolic < 140) || (diastolic >= 80 && diastolic < 90)) {
                category = 'Hipertensión grado 1';
            } else if (systolic >= 140 || diastolic >= 90) {
                category = 'Hipertensión grado 2';
            } else if (systolic > 180 || diastolic > 120) {
                category = 'Crisis hipertensiva';
            }

            bpCategory.textContent = category;
            bpDisplay.style.display = 'block';
        } else {
            bpDisplay.style.display = 'none';
        }
    }

    // Función para mostrar vista previa de la imagen
    function handleImagePreview(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                imagePreview.src = event.target.result;
                imagePreviewContainer.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            imagePreviewContainer.style.display = 'none';
        }
    }

    // Función para actualizar el progreso del formulario
    function updateFormProgress() {
        const requiredInputs = form.querySelectorAll('input[required], select[required]');
        let filledInputs = 0;

        requiredInputs.forEach(input => {
            if (input.value) filledInputs++;
        });

        const progressPercentage = Math.round((filledInputs / requiredInputs.length) * 100);
        formProgress.textContent = `${progressPercentage}%`;

        // Actualizar el estilo del badge según el progreso
        if (progressPercentage < 50) {
            formProgress.className = 'badge bg-danger';
        } else if (progressPercentage < 100) {
            formProgress.className = 'badge bg-warning text-dark';
        } else {
            formProgress.className = 'badge bg-success';
        }
    }

    // Función para simular el progreso de carga
    function simulateLoadingProgress() {
        const loadingBar = document.getElementById('loading-progress');
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress > 100) progress = 100;
            loadingBar.style.width = `${progress}%`;
            if (progress >= 100) clearInterval(interval);
        }, 300);
        return interval;
    }

    // Manejador del envío del formulario
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Validar formulario
        if (!form.checkValidity()) {
            e.stopPropagation();
            form.classList.add('was-validated');
            return;
        }

        submitForm();
    });

    // Eventos para calcular y mostrar el IMC
    heightInput.addEventListener('input', calculateBMI);
    weightInput.addEventListener('input', calculateBMI);

    // Eventos para calcular y mostrar la categoría de presión arterial
    systolicInput.addEventListener('input', calculateBloodPressureCategory);
    diastolicInput.addEventListener('input', calculateBloodPressureCategory);

    // Evento para mostrar vista previa de la imagen
    imageInput.addEventListener('change', handleImagePreview);

    // Evento para actualizar el progreso del formulario
    form.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('change', updateFormProgress);
        input.addEventListener('input', updateFormProgress);
    });

    // Evento para el botón de volver
    backButton.addEventListener('click', function() {
        result.style.display = 'none';
        form.style.display = 'block';
    });

    // Evento para el botón de descargar informe
    downloadButton.addEventListener('click', function() {
        generatePDF();
    });

    // Evento para el botón de borrar
    resetButton.addEventListener('click', function() {
        // Mostrar confirmación
        if (confirm('¿Estás seguro que deseas borrar todos los datos ingresados?')) {
            resetForm();
        }
    });

    /**
     * Función para reiniciar el formulario y limpiar todos los datos
     */
    function resetForm() {
        // Resetear todos los campos del formulario
        form.reset();

        // Ocultar elementos relacionados con el IMC y presión arterial
        bmiDisplay.style.display = 'none';
        bpDisplay.style.display = 'none';

        // Resetear la imagen
        imageInput.value = '';
        imagePreviewContainer.style.display = 'none';

        // Resetear checkboxes a su estado predeterminado
        smokeCheckbox.checked = false;
        alcoCheckbox.checked = false;
        activeCheckbox.checked = true;

        // Actualizar el progreso del formulario
        updateFormProgress();

        // Añadir una animación suave para indicar que se ha reiniciado el formulario
        form.classList.add('form-reset-animation');
        setTimeout(() => {
            form.classList.remove('form-reset-animation');
        }, 500);

        // Mostrar un mensaje temporal de confirmación
        const resetMessage = document.createElement('div');
        resetMessage.className = 'alert alert-info alert-dismissible fade show mt-3';
        resetMessage.innerHTML = `
            <i class="fas fa-check-circle me-2"></i>Formulario reiniciado correctamente.
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
        `;

        // Insertar el mensaje al principio del formulario
        form.prepend(resetMessage);

        // Desaparecer el mensaje después de 3 segundos
        setTimeout(() => {
            resetMessage.remove();
        }, 3000);

        // Enfocar el campo de nombre del paciente (ahora es el primer campo)
        document.getElementById('patient_name').focus();
    }

    /**
     * Función para enviar el formulario y procesar los resultados
     */
    function submitForm() {
        // Mostrar indicador de carga
        loading.style.display = 'block';
        form.style.display = 'none';
        result.style.display = 'none';

        // Iniciar simulación de progreso
        const loadingInterval = simulateLoadingProgress();

        // Preparar datos para envío
        const formData = new FormData(form);

        // Asegurar que los checkboxes estén incluidos con los valores correctos
        formData.set('smoke', smokeCheckbox.checked ? '1' : '0');
        formData.set('alco', alcoCheckbox.checked ? '1' : '0');
        formData.set('active', activeCheckbox.checked ? '1' : '0');

        // Enviar solicitud al servidor
        fetch('/predict', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            clearInterval(loadingInterval);
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            // Procesar respuesta exitosa
            setTimeout(() => {
                displayResults(data);
            }, 500); // Pequeño retraso para efecto visual
        })
        .catch(error => {
            // Manejar errores
            clearInterval(loadingInterval);
            handleError(error);
        });
    }

    /**
     * Función para mostrar los resultados de la predicción
     * @param {Object} data - Datos de la respuesta del servidor
     */
    function displayResults(data) {
        // Ocultar indicador de carga
        loading.style.display = 'none';

        // Actualizar elementos del DOM con los datos recibidos
        document.getElementById('prediction-text').textContent = data.prediction_text;

        const confidenceBar = document.getElementById('confidence-bar');
        // Animar la barra de progreso
        confidenceBar.style.width = '0%';
        confidenceBar.textContent = '0%';

        setTimeout(() => {
            confidenceBar.style.width = data.confidence;
            confidenceBar.textContent = data.confidence;
            confidenceBar.setAttribute('aria-valuenow', parseFloat(data.confidence));
        }, 100);

        // Actualizar clase según predicción
        const container = document.getElementById('prediction-container');
        if (data.prediction) {
            container.className = 'prediction-result prediction-positive';
            confidenceBar.className = 'progress-bar bg-danger';
        } else {
            container.className = 'prediction-result prediction-negative';
            confidenceBar.className = 'progress-bar bg-success';
        }

        // Actualizar detalles del modelo
        document.getElementById('fnn-prob').textContent = (data.details.fnn_probability * 100).toFixed(1) + '%';
        document.getElementById('cnn-prob').textContent = (data.details.cnn_probability * 100).toFixed(1) + '%';

        // Añadir indicador de riesgo visual
        let riskLevel = '';
        const confidence = parseFloat(data.confidence);

        if (data.prediction) {
            if (confidence > 80) riskLevel = 'Riesgo muy alto';
            else if (confidence > 60) riskLevel = 'Riesgo alto';
            else riskLevel = 'Riesgo moderado';
        } else {
            if (confidence > 80) riskLevel = 'Riesgo muy bajo';
            else if (confidence > 60) riskLevel = 'Riesgo bajo';
            else riskLevel = 'Riesgo bajo-moderado';
        }

        // Mostrar resultados
        result.style.display = 'block';
    }

    /**
     * Función para manejar errores en la solicitud
     * @param {Error} error - Objeto de error
     */
    function handleError(error) {
        console.error('Error:', error);
        loading.style.display = 'none';
        form.style.display = 'block';

        // Crear una alerta de error
        const errorAlert = document.createElement('div');
        errorAlert.className = 'alert alert-danger alert-dismissible fade show mt-3';
        errorAlert.innerHTML = `
            <strong><i class="fas fa-exclamation-triangle me-2"></i>Error:</strong> ${error.message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
        `;

        // Insertar la alerta antes del formulario
        form.parentNode.insertBefore(errorAlert, form);

        // Eliminar la alerta después de 5 segundos
        setTimeout(() => {
            errorAlert.remove();
        }, 5000);
    }

    /**
     * Función para generar y descargar un informe en PDF
     */
    function generatePDF() {
        // Mostrar un indicador de carga durante la generación del PDF
        const loadingToast = document.createElement('div');
        loadingToast.className = 'position-fixed bottom-0 start-50 translate-middle-x mb-4 p-3 bg-dark text-white rounded';
        loadingToast.style.zIndex = '9999';
        loadingToast.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Generando informe PDF...';
        document.body.appendChild(loadingToast);

        // Obtener la fecha actual para el informe
        const currentDate = new Date();
        const formattedDate = currentDate.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        const formattedTime = currentDate.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });

        // Obtener datos del paciente
        const patientData = {
            name: document.getElementById('patient_name').value,
            age: document.getElementById('age').value,
            gender: document.getElementById('gender').value === '1' ? 'Masculino' : 'Femenino',
            height: document.getElementById('height').value + ' cm',
            weight: document.getElementById('weight').value + ' kg',
            bmi: document.getElementById('bmi-value').textContent + ' kg/m²',
            bmiCategory: document.getElementById('bmi-category').textContent,
            systolic: document.getElementById('ap_hi').value + ' mmHg',
            diastolic: document.getElementById('ap_lo').value + ' mmHg',
            bpCategory: document.getElementById('bp-category').textContent,
            cholesterol: document.getElementById('cholesterol').options[document.getElementById('cholesterol').selectedIndex].text,
            glucose: document.getElementById('gluc').options[document.getElementById('gluc').selectedIndex].text,
            smoker: document.getElementById('smoke').checked ? 'Sí' : 'No',
            alcohol: document.getElementById('alco').checked ? 'Sí' : 'No',
            active: document.getElementById('active').checked ? 'Sí' : 'No'
        };

        // Obtener datos de la predicción
        const predictionResult = document.getElementById('prediction-text').textContent;
        const confidenceValue = document.getElementById('confidence-bar').textContent;
        const fnnProbability = document.getElementById('fnn-prob').textContent;
        const cnnProbability = document.getElementById('cnn-prob').textContent;
        const isHighRisk = document.getElementById('prediction-container').classList.contains('prediction-positive');

        // Crear el PDF con jsPDF
        setTimeout(() => {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF('p', 'mm', 'a4');

            // Configurar fuentes
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(16);

            // Encabezado
            doc.setTextColor(219, 50, 77); // Color primario
            doc.text('CardioPredict - Informe de Predicción Cardiovascular', 105, 20, { align: 'center' });

            // Línea separadora
            doc.setDrawColor(219, 50, 77);
            doc.setLineWidth(0.5);
            doc.line(20, 25, 190, 25);

            // Información general
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(`Fecha de generación: ${formattedDate} - ${formattedTime}`, 20, 35);
            doc.text('ID de informe: ' + Math.random().toString(36).substring(2, 15), 20, 40);

            // Título de datos del paciente
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.text('Datos del Paciente', 20, 50);

            // Datos demográficos
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.setTextColor(80, 80, 80);
            doc.text('Datos Demográficos:', 20, 60);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.text(`• Nombre: ${patientData.name}`, 25, 65);
            doc.text(`• Edad: ${patientData.age} años`, 25, 70);
            doc.text(`• Género: ${patientData.gender}`, 25, 75);

            // Medidas antropométricas
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.text('Medidas Antropométricas:', 20, 85);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.text(`• Altura: ${patientData.height}`, 25, 90);
            doc.text(`• Peso: ${patientData.weight}`, 25, 95);
            doc.text(`• IMC: ${patientData.bmi} (${patientData.bmiCategory})`, 25, 100);

            // Signos vitales
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.text('Signos Vitales:', 20, 110);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.text(`• Presión arterial: ${patientData.systolic}/${patientData.diastolic}`, 25, 115);
            doc.text(`• Clasificación: ${patientData.bpCategory}`, 25, 120);

            // Laboratorio y hábitos
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.text('Laboratorio y Hábitos:', 20, 130);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.text(`• Colesterol: ${patientData.cholesterol}`, 25, 135);
            doc.text(`• Glucosa: ${patientData.glucose}`, 25, 140);
            doc.text(`• Fumador: ${patientData.smoker}`, 25, 145);
            doc.text(`• Consume alcohol: ${patientData.alcohol}`, 25, 150);
            doc.text(`• Físicamente activo: ${patientData.active}`, 25, 155);

            // Línea separadora
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.2);
            doc.line(20, 165, 190, 165);

            // Resultados de la predicción
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.text('Resultados de la Predicción', 20, 175);

            // Predicción
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            if (isHighRisk) {
                doc.setTextColor(220, 53, 69); // Rojo para alto riesgo
            } else {
                doc.setTextColor(40, 167, 69); // Verde para bajo riesgo
            }
            doc.text(predictionResult, 20, 185);

            // Confianza
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(80, 80, 80);
            doc.text(`Confianza de la predicción: ${confidenceValue}`, 20, 195);

            // Detalles del modelo
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.text('Detalles del Modelo:', 20, 205);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.text(`• Probabilidad FNN (datos clínicos): ${fnnProbability}`, 25, 210);
            doc.text(`• Probabilidad CNN (imagen MRI): ${cnnProbability}`, 25, 215);

            // Notas
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.2);
            doc.line(20, 225, 190, 225);

            doc.setFont('helvetica', 'italic');
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text('IMPORTANTE: Este informe es generado por un modelo de inteligencia artificial y debe ser', 20, 235);
            doc.text('interpretado exclusivamente por un profesional de la salud. No constituye un diagnóstico médico.', 20, 240);

            // Pie de página
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.text('CardioPredict v1.0.0 - Sistema de predicción cardiovascular basado en IA', 105, 280, { align: 'center' });

            // Personalizar nombre del archivo con el nombre del paciente (si está disponible)
            let fileName = 'CardioPredict_Informe_';
            if (patientData.name) {
                // Limpiar el nombre para que sea seguro como nombre de archivo (eliminar caracteres especiales)
                const safeName = patientData.name.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_');
                fileName += safeName + '_';
            }
            fileName += formattedDate.replace(/\//g, '-') + '.pdf';

            // Descargar PDF
            doc.save(fileName);

            // Eliminar el indicador de carga
            document.body.removeChild(loadingToast);

            // Mostrar mensaje de éxito
            const successToast = document.createElement('div');
            successToast.className = 'position-fixed bottom-0 start-50 translate-middle-x mb-4 p-3 bg-success text-white rounded';
            successToast.style.zIndex = '9999';
            successToast.innerHTML = '<i class="fas fa-check-circle me-2"></i>Informe PDF generado con éxito';
            document.body.appendChild(successToast);

            // Eliminar mensaje de éxito después de 3 segundos
            setTimeout(() => {
                document.body.removeChild(successToast);
            }, 3000);
        }, 500);
    }

    // Inicializar la aplicación
    updateFormProgress();
});