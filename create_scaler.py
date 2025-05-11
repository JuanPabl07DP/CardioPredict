import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
import pickle

# Crea un DataFrame de ejemplo con las mismas columnas que usaste para entrenar tu modelo FNN
# Ajusta esto según las columnas que usa tu modelo
ejemplo_datos = pd.DataFrame({
    'age': [40, 50, 60],
    'gender': [1, 0, 1],
    'height': [170, 165, 180],
    'weight': [70, 65, 80],
    'ap_hi': [120, 130, 140],
    'ap_lo': [80, 85, 90],
    'cholesterol': [1, 2, 3],
    'gluc': [1, 1, 2],
    'smoke': [0, 0, 1],
    'alco': [0, 1, 1],
    'active': [1, 1, 0]
})

# Crear y entrenar el scaler
scaler = StandardScaler()
scaler.fit(ejemplo_datos)

# Guardar el scaler
with open('models/cardio_scaler.pkl', 'wb') as f:
    pickle.dump(scaler, f)

print("Scaler creado y guardado en models/cardio_scaler.pkl")