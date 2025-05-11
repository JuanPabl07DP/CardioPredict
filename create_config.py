# create_config.py
import json
import os

# Asegurarse de que la carpeta models exista
os.makedirs('models', exist_ok=True)

# Configuración del ensamblaje
ensemble_config = {
    'fnn_model_path': 'modelo_cardio_hibrido_fnn.h5',
    'cnn_model_path': 'cardiac_cad_cnn_model_final.h5',
    'scaler_path': 'cardio_scaler.pkl',
    'weight_fnn': 0.3,
    'weight_cnn': 0.7,
    'threshold': 0.5
}

# Guardar la configuración en formato JSON
with open('models/ensemble_config.json', 'w') as f:
    json.dump(ensemble_config, f, indent=4)

print("Archivo de configuración creado correctamente en 'models/ensemble_config.json'")