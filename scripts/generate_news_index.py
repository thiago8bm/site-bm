import os
import json

def main():
    print("==========================================")
    print("GERAÇÃO DO ÍNDICE JSON")
    print("==========================================")
    
    base_output_dir = os.path.join('src', 'assets', 'news')
    config_dir = 'config'
    os.makedirs(config_dir, exist_ok=True)
    index_path = os.path.join(config_dir, 'news_index.json')
    
    news_index = {}
    if os.path.exists(base_output_dir):
        for editora in os.listdir(base_output_dir):
            editora_path = os.path.join(base_output_dir, editora)
            if os.path.isdir(editora_path):
                # Lê os arquivos ignorando o formato bizarro do drive como "Cópia de..."
                files = [f for f in os.listdir(editora_path) if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp', '.pdf')) and not f.startswith('Cópia de')]
                news_index[editora] = files
                
    with open(index_path, 'w', encoding='utf-8') as f:
        json.dump(news_index, f, indent=4, ensure_ascii=False)
        
    print(f"Índice JSON gerado com sucesso em {index_path}")

if __name__ == '__main__':
    main()
