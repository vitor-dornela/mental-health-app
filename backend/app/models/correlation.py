import pandas as pd
import numpy as np
from typing import Dict, List, Any
from app.services.data_loader import filter_by_region, filter_by_period

def analyze_correlation(
    df: pd.DataFrame, 
    disorders: List[str], 
    region: str = "global", 
    period: str = "all"
) -> Dict[str, Any]:
    """
    Analisa correlações entre diferentes transtornos mentais
    
    Args:
        df: DataFrame com dados de prevalência
        disorders: Lista de transtornos a analisar
        region: Região para filtrar os dados
        period: Período para análise (all, recent, decade)
        
    Returns:
        Dicionário com resultados da análise de correlação
    """
    # Filtra por região e período
    filtered_df = filter_by_region(df, region)
    filtered_df = filter_by_period(filtered_df, period)
    
    # Mapeamento de nomes de transtornos
    disorder_mapping = {
        "depression": "Depression",
        "anxiety": "Anxiety",
        "bipolar": "Bipolar",
        "schizophrenia": "Schizophrenia",
        "eating": "Eatingdisorders"
    }
    
    # Mapeia os nomes dos transtornos para as colunas do DataFrame
    disorder_columns = [disorder_mapping.get(disorder, disorder) for disorder in disorders]
    
    # Seleciona apenas as colunas necessárias
    data_df = filtered_df[disorder_columns].dropna()
    
    # Se não houver dados suficientes, retorna erro
    if len(data_df) < 10:
        raise ValueError("Dados insuficientes para análise de correlação")
    
    # Calcula a matriz de correlação
    corr_matrix = data_df.corr()
    
    # Prepara os dados de correlação para visualização
    correlations = []
    
    # Mapeamento para nomes de exibição
    display_names = {
        "Depression": "Depressão",
        "Anxiety": "Ansiedade",
        "Bipolar": "Transtorno Bipolar",
        "Schizophrenia": "Esquizofrenia",
        "Eatingdisorders": "Transtornos Alimentares"
    }
    
    # Extrai correlações entre pares de transtornos
    for i, disorder1 in enumerate(disorder_columns):
        for j, disorder2 in enumerate(disorder_columns):
            if i < j:  # Evita duplicação e auto-correlação
                correlations.append({
                    "source": display_names.get(disorder1, disorder1),
                    "target": display_names.get(disorder2, disorder2),
                    "value": float(corr_matrix.loc[disorder1, disorder2])
                })
    
    # Calcula métricas
    correlation_values = [item["value"] for item in correlations]
    
    metrics = {
        "max_correlation": float(max(correlation_values)) if correlation_values else 0,
        "min_correlation": float(min(correlation_values)) if correlation_values else 0,
        "avg_correlation": float(np.mean(correlation_values)) if correlation_values else 0
    }
    
    return {
        "correlations": correlations,
        "metrics": metrics
    }
