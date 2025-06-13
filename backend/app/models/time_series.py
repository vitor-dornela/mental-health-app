import pandas as pd
import numpy as np
from typing import Dict, List, Any
from app.services.data_loader import filter_by_region

def forecast_time_series(
    df: pd.DataFrame, 
    disorder: str, 
    region: str = "global", 
    forecast_period: int = 5,
    interval_width: float = 0.8
) -> Dict[str, Any]:
    """
    Realiza previsão de séries temporais para um transtorno específico
    
    Args:
        df: DataFrame com dados de prevalência
        disorder: Transtorno a ser analisado (depression, anxiety, etc.)
        region: Região para filtrar os dados
        forecast_period: Número de anos para previsão
        interval_width: Largura do intervalo de confiança (0-1)
        
    Returns:
        Dicionário com resultados da previsão
    """
    # Filtra por região
    filtered_df = filter_by_region(df, region)
    
    # Mapeamento de nomes de transtornos
    disorder_mapping = {
        "depression": "Depression",
        "anxiety": "Anxiety",
        "bipolar": "Bipolar",
        "schizophrenia": "Schizophrenia",
        "eating": "Eatingdisorders"
    }
    
    disorder_key = disorder_mapping.get(disorder, disorder)
    
    # Agrupa por ano e calcula a média
    time_series_data = []
    
    for year, group in filtered_df.groupby("Year"):
        # Calcula a média do transtorno para o ano
        disorder_values = group[disorder_key].dropna()
        if len(disorder_values) > 0:
            time_series_data.append({
                "date": str(year),
                "actual": float(disorder_values.mean())
            })
    
    # Ordena por ano
    time_series_data = sorted(time_series_data, key=lambda x: int(x["date"]))
    
    # Se não houver dados suficientes, retorna erro
    if len(time_series_data) < 3:
        raise ValueError("Dados insuficientes para previsão")
    
    # Extrai os valores para cálculo da tendência
    years = np.array([int(point["date"]) for point in time_series_data])
    values = np.array([point["actual"] for point in time_series_data])
    
    # Calcula tendência linear simples
    z = np.polyfit(years, values, 1)
    slope, intercept = z[0], z[1]
    
    # Último ano e valor disponíveis
    last_year = int(time_series_data[-1]["date"])
    last_value = time_series_data[-1]["actual"]
    
    # Gera previsões
    forecast_data = time_series_data.copy()
    
    for i in range(1, forecast_period + 1):
        year = last_year + i
        predicted = intercept + slope * year
        
        # Calcula intervalo de confiança
        # Quanto maior o intervalo_width, menor o intervalo de confiança
        half_interval = (predicted * (1 - interval_width)) / 2
        
        forecast_data.append({
            "date": str(year),
            "predicted": float(predicted),
            "lower": float(predicted - half_interval),
            "upper": float(predicted + half_interval)
        })
    
    # Calcula métricas de desempenho
    # Para dados históricos, compara valores reais com previstos
    historical_years = years[1:]  # Exclui o primeiro ano
    historical_values = values[1:]  # Exclui o primeiro valor
    
    # Previsões para anos históricos
    historical_predictions = intercept + slope * historical_years
    
    # Calcula métricas
    rmse = np.sqrt(np.mean((historical_values - historical_predictions) ** 2))
    mae = np.mean(np.abs(historical_values - historical_predictions))
    mape = np.mean(np.abs((historical_values - historical_predictions) / historical_values)) * 100
    
    # Coeficiente de determinação (R²)
    ss_total = np.sum((historical_values - np.mean(historical_values)) ** 2)
    ss_residual = np.sum((historical_values - historical_predictions) ** 2)
    r2 = 1 - (ss_residual / ss_total) if ss_total != 0 else 0
    
    return {
        "data": forecast_data,
        "metrics": {
            "rmse": float(rmse),
            "mae": float(mae),
            "mape": float(mape),
            "r2": float(r2)
        },
        "trend": {
            "slope": float(slope),
            "intercept": float(intercept)
        }
    }
