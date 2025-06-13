import pandas as pd
import numpy as np
from typing import Dict, List, Any
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score, davies_bouldin_score
from app.services.data_loader import filter_by_year

def perform_clustering(
    df: pd.DataFrame, 
    features: List[str], 
    year: int = 2019, 
    n_clusters: int = 3
) -> Dict[str, Any]:
    """
    Realiza análise de clustering para identificar grupos de países
    
    Args:
        df: DataFrame com dados de prevalência
        features: Lista de transtornos a considerar (depression, anxiety, etc.)
        year: Ano para análise
        n_clusters: Número de clusters
        
    Returns:
        Dicionário com resultados do clustering
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
    
    # Mapeia os nomes dos transtornos para as colunas do DataFrame
    feature_columns = [disorder_mapping.get(feature, feature) for feature in features]
    
    # Seleciona apenas as colunas necessárias
    data_df = filtered_df[["Entity", "Code"] + feature_columns].dropna()
    
    # Se não houver dados suficientes, retorna erro
    if len(data_df) < n_clusters:
        raise ValueError(f"Dados insuficientes para {n_clusters} clusters")
    
    # Extrai os dados para clustering
    X = data_df[feature_columns].values
    
    # Normaliza os dados
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Aplica K-means
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    clusters = kmeans.fit_predict(X_scaled)
    
    # Adiciona os clusters ao DataFrame
    data_df["cluster"] = clusters
    
    # Calcula métricas de qualidade do clustering
    metrics = {
        "inertia": float(kmeans.inertia_)
    }
    
    # Calcula silhouette score se houver mais de um cluster
    if n_clusters > 1:
        metrics["silhouette"] = float(silhouette_score(X_scaled, clusters))
        metrics["davies_bouldin"] = float(davies_bouldin_score(X_scaled, clusters))
    
    # Prepara os pontos para visualização
    # Se houver mais de 2 features, usa as 2 primeiras para visualização
    x_feature = feature_columns[0]
    y_feature = feature_columns[1] if len(feature_columns) > 1 else feature_columns[0]
    
    points = []
    for _, row in data_df.iterrows():
        points.append({
            "id": row["Code"],
            "name": row["Entity"],
            "x": float(row[x_feature]),
            "y": float(row[y_feature]),
            "cluster": int(row["cluster"])
        })
    
    # Estatísticas por cluster
    cluster_stats = []
    for cluster_id in range(n_clusters):
        cluster_df = data_df[data_df["cluster"] == cluster_id]
        
        # Calcula estatísticas para cada feature
        feature_stats = {}
        for feature in feature_columns:
            feature_stats[feature] = float(cluster_df[feature].mean())
        
        cluster_stats.append({
            "cluster": int(cluster_id),
            "count": int(len(cluster_df)),
            "percentage": float(len(cluster_df) / len(data_df) * 100),
            **feature_stats
        })
    
    return {
        "points": points,
        "metrics": metrics,
        "clusters": cluster_stats
    }
