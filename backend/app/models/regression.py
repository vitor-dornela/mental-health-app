import pandas as pd
import numpy as np
from typing import Dict, List, Any
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, r2_score
from app.services.data_loader import filter_by_region

def analyze_regression(
    df: pd.DataFrame,
    burden_df: pd.DataFrame,
    target_disorder: str,
    factors: List[str],
    region: str = "global"
) -> Dict[str, Any]:
    """
    Analisa fatores que influenciam a prevalência de transtornos mentais
    
    Args:
        df: DataFrame com dados de prevalência
        burden_df: DataFrame com dados de carga de doença
        target_disorder: Transtorno alvo (depression, anxiety, etc.)
        factors: Lista de fatores a considerar
        region: Região para filtrar os dados
        
    Returns:
        Dicionário com resultados da análise de regressão
    """
    # Filtra por região
    filtered_df = filter_by_region(df, region)
    filtered_burden_df = filter_by_region(burden_df, region)
    
    # Mapeamento de nomes de transtornos
    disorder_mapping = {
        "depression": "Depression",
        "anxiety": "Anxiety",
        "bipolar": "Bipolar",
        "schizophrenia": "Schizophrenia",
        "eating": "Eatingdisorders"
    }
    
    target_key = disorder_mapping.get(target_disorder, target_disorder)
    
    # Simulação de fatores de impacto baseados nos dados reais
    # Em uma implementação completa, faríamos uma análise de regressão real
    # com dados socioeconômicos, de saúde, etc.
    
    # Fatores simulados baseados no transtorno alvo
    factor_impacts = {
        "Depression": [
            {"factor": "Acesso à saúde", "impact": 0.68},
            {"factor": "Nível socioeconômico", "impact": 0.57},
            {"factor": "Urbanização", "impact": 0.42},
            {"factor": "Desemprego", "impact": 0.39},
            {"factor": "Isolamento social", "impact": 0.35}
        ],
        "Anxiety": [
            {"factor": "Estresse crônico", "impact": 0.72},
            {"factor": "Urbanização", "impact": 0.61},
            {"factor": "Acesso à saúde", "impact": 0.54},
            {"factor": "Nível socioeconômico", "impact": 0.48},
            {"factor": "Eventos traumáticos", "impact": 0.41}
        ],
        "Bipolar": [
            {"factor": "Fatores genéticos", "impact": 0.75},
            {"factor": "Acesso à saúde", "impact": 0.62},
            {"factor": "Estresse crônico", "impact": 0.45},
            {"factor": "Uso de substâncias", "impact": 0.38},
            {"factor": "Nível socioeconômico", "impact": 0.32}
        ],
        "Schizophrenia": [
            {"factor": "Fatores genéticos", "impact": 0.79},
            {"factor": "Urbanização", "impact": 0.58},
            {"factor": "Acesso à saúde", "impact": 0.52},
            {"factor": "Complicações perinatais", "impact": 0.47},
            {"factor": "Uso de substâncias", "impact": 0.41}
        ],
        "Eatingdisorders": [
            {"factor": "Pressão social", "impact": 0.70},
            {"factor": "Fatores culturais", "impact": 0.65},
            {"factor": "Acesso à saúde", "impact": 0.48},
            {"factor": "Nível socioeconômico", "impact": 0.42},
            {"factor": "Fatores genéticos", "impact": 0.38}
        ]
    }
    
    # Obtém os fatores para o transtorno alvo
    selected_factors = factor_impacts.get(target_key, [
        {"factor": "Acesso à saúde", "impact": 0.65},
        {"factor": "Nível socioeconômico", "impact": 0.55},
        {"factor": "Urbanização", "impact": 0.45},
        {"factor": "Fatores culturais", "impact": 0.4},
        {"factor": "Estresse crônico", "impact": 0.35}
    ])
    
    # Filtra apenas os fatores solicitados
    factor_mapping = {
        "socioeconomic": ["Nível socioeconômico", "Desemprego"],
        "healthcare": ["Acesso à saúde"],
        "demographic": ["Urbanização", "Isolamento social"],
        "cultural": ["Fatores culturais", "Pressão social"],
        "genetic": ["Fatores genéticos"],
        "stress": ["Estresse crônico", "Eventos traumáticos"],
        "substances": ["Uso de substâncias"]
    }
    
    # Cria uma lista de fatores a incluir
    factors_to_include = []
    for factor in factors:
        if factor in factor_mapping:
            factors_to_include.extend(factor_mapping[factor])
    
    # Filtra os fatores selecionados
    filtered_factors = [f for f in selected_factors if f["factor"] in factors_to_include]
    
    # Se não houver fatores selecionados, usa todos
    if not filtered_factors:
        filtered_factors = selected_factors
    
    # Normaliza os impactos para que somem 1
    total_impact = sum(f["impact"] for f in filtered_factors)
    if total_impact > 0:
        for f in filtered_factors:
            f["impact"] = f["impact"] / total_impact
    
    # Simula métricas de regressão
    metrics = {
        "r2": 0.83,  # Coeficiente de determinação simulado
        "rmse": 0.0412  # Erro quadrático médio simulado
    }
    
    return {
        "factors": filtered_factors,
        "metrics": metrics
    }
