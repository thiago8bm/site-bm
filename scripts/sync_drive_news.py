import os
import io
import json
import base64
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload

def main():
    creds_b64 = os.environ.get('GDRIVE_CREDENTIALS')
    # O folder_id agora será o ID da pasta RAIZ (JORNAIS - BM)
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

    # 1. Busca as subpastas dentro da pasta raiz
    folder_query = f"'{root_folder_id}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false"
    folder_results = service.files().list(q=folder_query, fields="nextPageToken, files(id, name)").execute()
    subfolders = folder_results.get('files', [])

    if not subfolders:
        print('Nenhuma subpasta encontrada na pasta raiz do Google Drive.')
        return

    base_output_dir = os.path.join('src', 'assets', 'news')

    for subfolder in subfolders:
        subfolder_id = subfolder['id']
        subfolder_name = subfolder['name']
        
        # Remove espaços do nome para bater com "BMNews" e "TheFicientsNews"
        local_folder_name = subfolder_name.replace(" ", "")
        output_dir = os.path.join(base_output_dir, local_folder_name)
        os.makedirs(output_dir, exist_ok=True)
        
        print(f'\nLendo subpasta: {subfolder_name} -> Salvando em: {output_dir}')
        
        # 2. Busca arquivos dentro dessa subpasta
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

if __name__ == '__main__':
    main()
