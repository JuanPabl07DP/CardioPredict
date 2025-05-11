# cardio_ensemble.py
import tensorflow as tf
import numpy as np
from PIL import Image
import json
import pickle
from sklearn.preprocessing import StandardScaler
import os


class CardioEnsembleModel:
    """
    Modelo de ensamblaje para predicción de enfermedades cardiovasculares
    combinando datos tabulares (FNN) e imágenes MRI (CNN)
    """

    def __init__(self, model_fnn_path, model_cnn_path, scaler_path=None,
                 weight_fnn=0.3, weight_cnn=0.7, threshold=0.5):
        """Inicializa el modelo de ensamblaje."""
        print("Inicializando modelo de ensamblaje...")
        self.weight_fnn = weight_fnn
        self.weight_cnn = weight_cnn
        self.threshold = threshold

        # Cargar modelos
        print(f"Cargando modelo FNN desde: {model_fnn_path}")
        self.model_fnn = tf.keras.models.load_model(model_fnn_path)

        print(f"Cargando modelo CNN desde: {model_cnn_path}")
        self.model_cnn = tf.keras.models.load_model(model_cnn_path)

        # Inicializar scaler
        self.scaler = StandardScaler()
        if scaler_path and os.path.exists(scaler_path):
            print(f"Cargando scaler desde: {scaler_path}")
            self._load_scaler(scaler_path)
            self.scaler_fitted = True
        else:
            self.scaler_fitted = False
            print("ADVERTENCIA: No se proporcionó un scaler entrenado. Usará valores sin escalar para FNN.")

    def _load_scaler(self, scaler_path):
        """Carga un scaler previamente guardado"""
        with open(scaler_path, 'rb') as f:
            self.scaler = pickle.load(f)

    def preprocess_tabular_data(self, data):
        """Preprocesa datos tabulares para el modelo FNN."""
        # Convertir diccionario a DataFrame si es necesario
        if isinstance(data, dict):
            import pandas as pd
            data = pd.DataFrame([data])

        # Asegurar que todos los valores sean numéricos
        for col in data.columns:
            data[col] = pd.to_numeric(data[col], errors='coerce')

        # Convertir a array NumPy
        features = data.values

        # Aplicar escalado si el scaler está entrenado
        if self.scaler_fitted:
            features = self.scaler.transform(features)

        return features

    def preprocess_image(self, image_input, img_size=(128, 128)):
        """Preprocesa una imagen para el modelo CNN."""
        # Manejar diferentes tipos de entrada
        if isinstance(image_input, str):
            # Es una ruta de archivo
            img = Image.open(image_input).convert('RGB')
        elif isinstance(image_input, Image.Image):
            # Es un objeto PIL Image
            img = image_input.convert('RGB')
        elif isinstance(image_input, np.ndarray):
            # Es un array NumPy
            img = Image.fromarray(image_input).convert('RGB')
        else:
            # Intentar como objeto de archivo (por ejemplo, desde una carga web)
            try:
                img = Image.open(image_input).convert('RGB')
            except:
                raise ValueError("Formato de imagen no soportado")

        # Redimensionar y normalizar
        img = img.resize(img_size)
        img_array = np.array(img) / 255.0

        # Añadir dimensión de lote
        return np.expand_dims(img_array, axis=0)

    def predict(self, tabular_data, image_input):
        """Realiza una predicción usando el ensamblaje de modelos."""
        # Preprocesar datos
        X_fnn = self.preprocess_tabular_data(tabular_data)
        X_cnn = self.preprocess_image(image_input)

        # Obtener predicciones individuales
        pred_fnn = self.model_fnn.predict(X_fnn, verbose=0)[0][0]
        pred_cnn = self.model_cnn.predict(X_cnn, verbose=0)[0][0]

        # Calcular predicción del ensamblaje
        pred_ensemble = (self.weight_fnn * pred_fnn + self.weight_cnn * pred_cnn) / \
                        (self.weight_fnn + self.weight_cnn)

        # Obtener predicción binaria
        is_cardio = bool(pred_ensemble > self.threshold)

        # Devolver resultados
        return {
            'prediction': is_cardio,
            'probability': float(pred_ensemble),
            'prediction_text': 'Positivo para enfermedad cardiovascular' if is_cardio else 'Negativo para enfermedad cardiovascular',
            'confidence': f'{pred_ensemble * 100:.1f}%',
            'details': {
                'fnn_probability': float(pred_fnn),
                'cnn_probability': float(pred_cnn),
                'fnn_weight': self.weight_fnn,
                'cnn_weight': self.weight_cnn
            }
        }