import os
import io
import json
import base64
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload

def main():
    creds_b64 = os.environ.get('GDRIVE_CREDENTIALS')
    folder_id = os.environ.get('GDRIVE_NEWS_FOLDER_ID')

    if not creds_b64 or not folder_id:
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

    # Busca arquivos na pasta
    query = f"'{folder_id}' in parents and trashed = false"
    results = service.files().list(q=query, fields="nextPageToken, files(id, name)").execute()
    items = results.get('files', [])

    if not items:
        print('Nenhum arquivo encontrado no Google Drive.')
        return

    output_dir = os.path.join('src', 'assets', 'news')
    os.makedirs(output_dir, exist_ok=True)

    print('Arquivos no Drive:')
    for item in items:
        file_id = item['id']
        file_name = item['name']
        print(f'- {file_name} ({file_id})')
        
        file_path = os.path.join(output_dir, file_name)
        
        # Simples bypass para não baixar o que já existe (pode ser aprimorado dps se precisar)
        if os.path.exists(file_path):
            print(f'  Arquivo {file_name} já existe localmente, ignorando.')
            continue

        print(f'  Baixando {file_name}...')
        request = service.files().get_media(fileId=file_id)
        fh = io.FileIO(file_path, 'wb')
        downloader = MediaIoBaseDownload(fh, request)
        done = False
        while done is False:
            status, done = downloader.next_chunk()
        print(f'  Download de {file_name} concluído.')

if __name__ == '__main__':
    main()
