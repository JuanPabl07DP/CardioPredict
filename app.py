# app.py
from flask import Flask, request, jsonify, render_template
import json
import os
import pandas as pd
from werkzeug.utils import secure_filename

# Importar la clase de ensamblaje
from cardio_ensemble import CardioEnsembleModel

app = Flask(__name__)

# Configurar carpeta para subida de archivos
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Cargar configuración
with open('models/ensemble_config.json', 'r') as f:
    config = json.load(f)

# Ajustar rutas para usar carpeta models/
config['fnn_model_path'] = os.path.join('models', config['fnn_model_path'])
config['cnn_model_path'] = os.path.join('models', config['cnn_model_path'])
config['scaler_path'] = os.path.join('models', config['scaler_path'])

# Inicializar modelo
print("Inicializando modelo de ensamblaje...")
ensemble_model = CardioEnsembleModel(
    model_fnn_path=config['fnn_model_path'],
    model_cnn_path=config['cnn_model_path'],
    scaler_path=config['scaler_path'],
    weight_fnn=config['weight_fnn'],
    weight_cnn=config['weight_cnn'],
    threshold=config['threshold']
)
print("Modelo inicializado correctamente.")


@app.route('/')
def index():
    """Renderiza la página principal"""
    return render_template('index.html')


@app.route('/predict', methods=['POST'])
def predict():
    """API para predicciones"""
    try:
        # Obtener datos del formulario
        tabular_data = {
            'age': request.form.get('age'),
            'gender': request.form.get('gender'),
            'height': request.form.get('height'),
            'weight': request.form.get('weight'),
            'ap_hi': request.form.get('ap_hi'),
            'ap_lo': request.form.get('ap_lo'),
            'cholesterol': request.form.get('cholesterol'),
            'gluc': request.form.get('gluc'),
            'smoke': request.form.get('smoke', '0'),
            'alco': request.form.get('alco', '0'),
            'active': request.form.get('active', '0')
        }

        # Obtener imagen
        image_file = request.files.get('mri_image')
        if not image_file:
            return jsonify({'error': 'No se proporcionó imagen MRI'}), 400

        # Guardar la imagen temporalmente
        filename = secure_filename(image_file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        image_file.save(filepath)

        try:
            # Realizar predicción
            result = ensemble_model.predict(tabular_data, filepath)

            # Limpiar archivo temporal
            if os.path.exists(filepath):
                os.unlink(filepath)

            # Devolver resultado
            return jsonify(result)

        except Exception as e:
            # Limpiar archivo temporal en caso de error
            if os.path.exists(filepath):
                os.unlink(filepath)

            raise e

    except Exception as e:
        app.logger.error(f"Error en predicción: {str(e)}")
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)