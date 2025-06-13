import os
import requests
import pandas as pd
from pathlib import Path

# Cria diretórios para dados
data_dir = Path(__file__).parent
raw_dir = data_dir / "raw"
processed_dir = data_dir / "processed"

# Cria diretórios se não existirem
raw_dir.mkdir(exist_ok=True)
processed_dir.mkdir(exist_ok=True)

# Lista de arquivos CSV para download
csv_files = [
    {
        "filename": "mental-illnesses-prevalence.csv",
        "url": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1-%20mental-illnesses-prevalence-RwHttQgtefnKrf042BjPu7teOFUjWL.csv",
        "description": "Prevalência de transtornos mentais por país e ano"
    },
    {
        "filename": "burden-disease-mental-illness.csv",
        "url": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2-%20burden-disease-from-each-mental-illness%281%29-JQXWWjwzhZ1DdOoZkD7mKnN7jy6z5V.csv",
        "description": "Carga de doença (DALYs) para cada transtorno mental"
    },
    {
        "filename": "depression-prevalence-coverage.csv",
        "url": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3-%20adult-population-covered-in-primary-data-on-the-prevalence-of-major-depression-z9e0lkAtI6f1EbQvfoo3aCBZ8asj4j.csv",
        "description": "População adulta coberta em dados primários sobre prevalência de depressão maior"
    },
    {
        "filename": "mental-illnesses-coverage.csv",
        "url": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/4-%20adult-population-covered-in-primary-data-on-the-prevalence-of-mental-illnesses-pAEjqrNW9oFRgc2mjGnvrAcSWyXRq1.csv",
        "description": "População adulta coberta em dados primários sobre prevalência de transtornos mentais"
    },
    {
        "filename": "anxiety-treatment-gap.csv",
        "url": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/5-%20anxiety-disorders-treatment-gap-PVqfzr5mpljqUwBPR7UsJiOpK6qjU4.csv",
        "description": "Lacuna de tratamento para transtornos de ansiedade"
    },
    {
        "filename": "us-depressive-symptoms.csv",
        "url": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/6-%20depressive-symptoms-across-us-population-P7XRbd0TN7CZJo5mTTOpUDlPrOWVQH.csv",
        "description": "Sintomas depressivos na população dos EUA"
    },
    {
        "filename": "countries-with-data.csv",
        "url": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/7-%20number-of-countries-with-primary-data-on-prevalence-of-mental-illnesses-in-the-global-burden-of-disease-study-dfCV828GhTcPNqI7Q6aobgBYB5uQUg.csv",
        "description": "Número de países com dados primários sobre prevalência de transtornos mentais"
    }
]

def download_file(file_info):
    """Baixa um arquivo CSV e salva no diretório de dados brutos"""
    try:
        print(f"Baixando {file_info['filename']}...")
        response = requests.get(file_info['url'])
        response.raise_for_status()
        
        file_path = raw_dir / file_info['filename']
        with open(file_path, 'wb') as f:
            f.write(response.content)
        
        print(f"✅ {file_info['filename']} baixado com sucesso!")
        return True
    except Exception as e:
        print(f"❌ Erro ao baixar {file_info['filename']}: {str(e)}")
        return False

def main():
    """Função principal para baixar todos os arquivos"""
    print("Iniciando download dos arquivos CSV...")
    
    success_count = 0
    for file_info in csv_files:
        if download_file(file_info):
            success_count += 1
    
    print(f"\nDownload concluído: {success_count}/{len(csv_files)} arquivos baixados com sucesso.")
    
    # Cria um arquivo de índice com informações sobre os arquivos
    index_content = "\n".join([f"{file['filename']}: {file['description']}" for file in csv_files])
    with open(raw_dir / "index.txt", 'w') as f:
        f.write(index_content)
    
    print("\nArquivo de índice criado com sucesso!")

if __name__ == "__main__":
    main()
