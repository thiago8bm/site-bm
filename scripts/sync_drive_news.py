import os
import io
import json
import base64
from datetime import datetime
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload

def main():
    creds_b64 = os.environ.get('GDRIVE_CREDENTIALS')
    root_folder_id = os.environ.get('GDRIVE_NEWS_FOLDER_ID')

    if not creds_b64 or not root_folder_id:
        print("Erro: GDRIVE_CREDENTIALS ou GDRIVE_NEWS_FOLDER_ID nao definidos.")
        return

    try:
        creds_json = base64.b64decode(creds_b64).decode('utf-8')
        creds_info = json.loads(creds_json)
        creds = service_account.Credentials.from_service_account_info(creds_info)
    except Exception as e:
        print(f"Erro ao carregar credenciais: {e}")
        return

    service = build('drive', 'v3', credentials=creds)

    folder_query = f"'{root_folder_id}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false"
    folder_results = service.files().list(q=folder_query, fields="nextPageToken, files(id, name)").execute()
    subfolders = folder_results.get('files', [])

    if not subfolders:
        print('Nenhuma subpasta encontrada na pasta raiz do Google Drive.')
        return

    base_output_dir = os.path.join('src', 'assets', 'news')
    downloaded_files = []

    for subfolder in subfolders:
        subfolder_id = subfolder['id']
        subfolder_name = subfolder['name']
        
        local_folder_name = subfolder_name.replace(" ", "")
        output_dir = os.path.join(base_output_dir, local_folder_name)
        os.makedirs(output_dir, exist_ok=True)
        
        print(f'\nLendo subpasta: {subfolder_name} -> Salvando em: {output_dir}')
        
        file_query = f"'{subfolder_id}' in parents and mimeType != 'application/vnd.google-apps.folder' and trashed = false"
        file_results = service.files().list(q=file_query, fields="nextPageToken, files(id, name)").execute()
        items = file_results.get('files', [])

        if not items:
            print(f'  Nenhum arquivo encontrado em {subfolder_name}.')
            continue

        for item in items:
            file_id = item['id']
            file_name = item['name']
            
            file_path = os.path.join(output_dir, file_name)
            
            if os.path.exists(file_path):
                print(f'  - {file_name} já existe, ignorando.')
                continue

            print(f'  - Baixando {file_name}...')
            request = service.files().get_media(fileId=file_id)
            fh = io.FileIO(file_path, 'wb')
            downloader = MediaIoBaseDownload(fh, request)
            done = False
            while done is False:
                status, done = downloader.next_chunk()
            print(f'    Download concluído.')
            
            # Registra o que foi baixado para os logs
            downloaded_files.append(f"{local_folder_name}/{file_name}")

    # ==========================================
    # GERAÇÃO DE LOGS E STEP SUMMARY
    # ==========================================
    
    # 1. Step Summary do GitHub Actions
    summary_path = os.environ.get('GITHUB_STEP_SUMMARY')
    if summary_path:
        with open(summary_path, 'a', encoding='utf-8') as f:
            if downloaded_files:
                f.write(f"### ✅ Sincronização Concluída\nForam baixados {len(downloaded_files)} novos arquivos:\n")
                for df in downloaded_files:
                    f.write(f"- `{df}`\n")
            else:
                f.write("### 💤 Sincronização Concluída\nNenhum arquivo novo encontrado no Drive hoje.\n")

    # 2. Log Persistente no Repositório (Apenas se houver novidade)
    if downloaded_files:
        os.makedirs('logs', exist_ok=True)
        log_file_path = os.path.join('logs', 'sync_news.log')
        timestamp = datetime.now().strftime('%d/%m/%Y %H:%M:%S')
        with open(log_file_path, 'a', encoding='utf-8') as f:
            arquivos_str = ', '.join(downloaded_files)
            f.write(f"[{timestamp}] Sucesso: {len(downloaded_files)} novos jornais baixados: {arquivos_str}\n")
            print(f"\nLog atualizado em {log_file_path}")
    else:
        print("\nNenhum arquivo novo baixado. O log não será alterado para evitar commits vazios.")

if __name__ == '__main__':
    main()
