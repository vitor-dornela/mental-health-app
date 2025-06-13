import pandas as pd
import numpy as np
from typing import Dict, List, Any
from sklearn.ensemble import IsolationForest
from app.services.data_loader import filter_by_year

def detect_anomalies(
    df: pd.DataFrame, 
    disorder: str, 
    year: int = 2019, 
    sensitivity: str = "medium"
) -> Dict[str, Any]:
    """
    Detecta anomalias nos dados de saúde mental
    
    Args:
        df: DataFrame com dados de prevalência
        disorder: Transtorno a ser analisado (depression, anxiety, etc.)
        year: Ano para análise
        sensitivity: Sensibilidade da detecção (low, medium, high)
        
    Returns:
        Dicionário com resultados da detecção de anomalias
    """
    # Filtra por ano
    filtered_df = filter_by_year(df, year)
    
    # Mapeamento de nomes de transtornos
    disorder_mapping = {
        "depression": "Depression",
        "anxiety": "Anxiety",
        "bipolar": "Bipolar",
        "schizophrenia": "Schizophrenia",
        "eating": "Eatingdisorders"
    }
    
    disorder_key = disorder_mapping.get(disorder, disorder)
    
    # Seleciona apenas as colunas necessárias
    data_df = filtered_df[["Entity", "Code", disorder_key]].dropna()
    
    # Se não houver dados suficientes, retorna erro
    if len(data_df) < 10:
        raise ValueError("Dados insuficientes para detecção de anomalias")
    
    # Extrai os valores para análise
    X = data_df[disorder_key].values.reshape(-1, 1)
    
    # Define o threshold com base na sensibilidade
    contamination = {
        "low": 0.05,    # 5% dos pontos são anomalias
        "medium": 0.1,  # 10% dos pontos são anomalias
        "high": 0.15    # 15% dos pontos são anomalias
    }.get(sensitivity, 0.1)
    
    # Aplica Isolation Forest para detecção de anomalias
    iso_forest = IsolationForest(contamination=contamination, random_state=42)
    anomalies = iso_forest.fit_predict(X)
    
    # -1 indica anomalia, 1 indica normal
    is_anomaly = anomalies == -1
    
    # Calcula estatísticas básicas
    values = data_df[disorder_key].values
    mean = float(np.mean(values))
    std_dev = float(np.std(values))
    
    # Define threshold para anomalias baseado na sensibilidade
    threshold_factor = {
        "low": 3.0,     # 3 desvios padrão
        "medium": 2.0,  # 2 desvios padrão
        "high": 1.5     # 1.5 desvios padrão
    }.get(sensitivity, 2.0)
    
    threshold = threshold_factor * std_dev
    
    # Prepara os pontos para visualização
    points = []
    for i, (_, row) in enumerate(data_df.iterrows()):
        points.append({
            "id": row["Code"],
            "name": row["Entity"],
            "x": float(row[disorder_key]),
            "y": 0,  # Placeholder para visualização
            "isAnomaly": bool(is_anomaly[i])
        })
    
    # Lista de países com anomalias
    anomaly_countries = data_df.loc[is_anomaly, "Entity"].tolist()
    
    return {
        "points": points,
        "statistics": {
            "mean": mean,
            "std_dev": std_dev,
            "threshold": float(threshold)
        },
        "anomalies": {
            "count": int(np.sum(is_anomaly)),
            "percentage": float(np.mean(is_anomaly) * 100),
            "countries": anomaly_countries
        }
    }
