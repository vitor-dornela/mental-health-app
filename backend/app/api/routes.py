from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
import pandas as pd
from app.services.data_loader import load_dataset
from app.models.time_series import forecast_time_series
from app.models.clustering import perform_clustering
from app.models.anomaly import detect_anomalies
from app.models.correlation import analyze_correlation
from app.models.regression import analyze_regression

router = APIRouter()

@router.get("/datasets")
def get_available_datasets():
    """Retorna a lista de datasets disponíveis"""
    try:
        # Lista de datasets disponíveis
        datasets = [
            {"id": "mental-illnesses-prevalence", "name": "Prevalência de Transtornos Mentais"},
            {"id": "burden-disease-mental-illness", "name": "Carga de Doença por Transtorno Mental"},
            {"id": "depression-prevalence-coverage", "name": "Cobertura de Prevalência de Depressão"},
            {"id": "mental-illnesses-coverage", "name": "Cobertura de Transtornos Mentais"},
            {"id": "anxiety-treatment-gap", "name": "Lacuna de Tratamento para Ansiedade"},
            {"id": "us-depressive-symptoms", "name": "Sintomas Depressivos nos EUA"},
            {"id": "countries-with-data", "name": "Países com Dados Primários"}
        ]
        return {"datasets": datasets}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao listar datasets: {str(e)}")

@router.get("/data/{dataset_id}")
def get_dataset(dataset_id: str):
    """Retorna os dados de um dataset específico"""
    try:
        df = load_dataset(dataset_id)
        return {"data": df.to_dict(orient="records")}
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Dataset {dataset_id} não encontrado")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao carregar dataset: {str(e)}")

@router.post("/analysis/time-series")
def analyze_time_series(
    disorder: str, 
    region: str = "global", 
    forecast_period: int = 5,
    interval_width: float = 0.8
):
    """Realiza análise de séries temporais para um transtorno específico"""
    try:
        # Carrega dados de prevalência
        df = load_dataset("mental-illnesses-prevalence")
        
        # Realiza previsão
        result = forecast_time_series(
            df, 
            disorder=disorder, 
            region=region, 
            forecast_period=forecast_period, 
            interval_width=interval_width
        )
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na análise de séries temporais: {str(e)}")

@router.post("/analysis/clustering")
def analyze_clustering(
    features: List[str],
    year: int = 2019,
    n_clusters: int = 3
):
    """Realiza análise de clustering para identificar grupos de países"""
    try:
        # Carrega dados de prevalência
        df = load_dataset("mental-illnesses-prevalence")
        
        # Realiza clustering
        result = perform_clustering(
            df, 
            features=features, 
            year=year, 
            n_clusters=n_clusters
        )
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na análise de clustering: {str(e)}")

@router.post("/analysis/anomalies")
def analyze_anomalies(
    disorder: str,
    year: int = 2019,
    sensitivity: str = "medium"
):
    """Detecta anomalias nos dados de saúde mental"""
    try:
        # Carrega dados de prevalência
        df = load_dataset("mental-illnesses-prevalence")
        
        # Detecta anomalias
        result = detect_anomalies(
            df, 
            disorder=disorder, 
            year=year, 
            sensitivity=sensitivity
        )
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na detecção de anomalias: {str(e)}")

@router.post("/analysis/correlation")
def correlation_analysis(
    disorders: List[str],
    region: str = "global",
    period: str = "all"
):
    """Analisa correlações entre diferentes transtornos mentais"""
    try:
        # Carrega dados de prevalência
        df = load_dataset("mental-illnesses-prevalence")
        
        # Analisa correlações
        result = analyze_correlation(
            df, 
            disorders=disorders, 
            region=region, 
            period=period
        )
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na análise de correlação: {str(e)}")

@router.post("/analysis/regression")
def regression_analysis(
    target_disorder: str,
    factors: List[str],
    region: str = "global"
):
    """Analisa fatores que influenciam a prevalência de transtornos mentais"""
    try:
        # Carrega dados de prevalência
        df = load_dataset("mental-illnesses-prevalence")
        
        # Carrega dados de carga de doença para análise complementar
        burden_df = load_dataset("burden-disease-mental-illness")
        
        # Realiza análise de regressão
        result = analyze_regression(
            df, 
            burden_df,
            target_disorder=target_disorder, 
            factors=factors, 
            region=region
        )
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na análise de regressão: {str(e)}")
