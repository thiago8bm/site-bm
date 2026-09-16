import json
import os
import urllib.parse
from datetime import datetime
from curl_cffi import requests

NOME_CLUBE = "Baile d Munich"
ID_CLUBE = "1071934"
PLATAFORMA = "common-gen5"
NUMERO_RESULTADOS = 50
MATCH_TYPES = ["leagueMatch", "playoffMatch", "friendlyMatch"]

class API:
    def __init__(self) -> None:
        self.url_base = "https://proclubs.ea.com/api/fc"
        self.timeout = 15
        self._ultimo_nome: str = None # type: ignore
        self._ultimo_id: str = None # type: ignore
        self._ultima_plataforma: str = None # type: ignore
        self._ultima_resposta: list = None # type: ignore

    def _formatar_url(self, endpoint) -> str:
        if endpoint.startswith("http"):
            return endpoint
        return f"{self.url_base}/{endpoint.lstrip('/')}"   

    def _chamar_api(self, url: str, descricao: str) -> list | None:
        try:
            print(f"Buscando {descricao}...")
            resposta = requests.get(url, impersonate="chrome", timeout=self.timeout)
            resposta.raise_for_status()
            
            # Garante que a resposta seja interpretada como JSON com segurança
            payload = resposta.json()
            if not payload:
                return []
            return payload
            
        except requests.exceptions.RequestException as e:
            print(f"Erro de rede ao buscar {descricao}: {e}")
            return None
        except json.JSONDecodeError as e:
            print(f"Erro ao decodificar JSON de {descricao}: {e}")
            return None
   
    def _salvar_json(self, dados: dict | list, filename: str, extra_meta: dict = None) -> None: # type: ignore
        """Salva dados genéricos sobrescrevendo o arquivo e aceitando metadados extras."""
        os.makedirs(os.path.join("data", "raw"), exist_ok=True)
        path = os.path.join("data", "raw", filename)
        payload = {
            "last_updated": datetime.now().isoformat(),
            "status": "success",
        }
        # Se houver metadados extras (como total_matches), injeta no payload
        if extra_meta:
            payload.update(extra_meta)
        payload["data"] = dados # type: ignore
        with open(path, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=4, ensure_ascii=False)
        print(f"Arquivo salvo com sucesso em: {path}")
   
   
    def atualizar_historico_partidas(self, id_clube: str, plataforma: str, match_type: str, max_resultados: int = 50) -> None:
        """
        Salva as partidas garantindo que o histórico antigo não seja perdido.
        Remove duplicatas usando o matchId e ordena da mais recente para a mais antiga.
        """
        url = self._formatar_url(f"/clubs/matches?platform={plataforma}&clubIds={id_clube}&matchType={match_type}&maxResultCount={max_resultados}")
        dados_novos = self._chamar_api(url, f"histórico de partidas ({match_type})")
        
        if not dados_novos:
            print(f"[{match_type}] Nenhum dado novo retornado pela API. Histórico mantido intacto.")
            return

        filename = f"matches_{match_type}.json"
        path = os.path.join("data", "raw", filename)
        
        dados_existentes = []
        
        # Lê o histórico atual se o arquivo já existir
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    conteudo = json.load(f)
                    dados_existentes = conteudo.get("data", [])
            except (json.JSONDecodeError, IOError):
                print(f"Aviso: Não foi possível ler {filename}. Criando um novo.")

        # Evita duplicatas mapeando pelo matchId
        mapa_partidas = {partida.get("matchId"): partida for partida in dados_existentes if "matchId" in partida}
        
        # Insere ou atualiza os dados novos
        for nova_partida in dados_novos:
            if "matchId" in nova_partida:
                mapa_partidas[nova_partida["matchId"]] = nova_partida
                
        # Converte de volta e ordena do mais recente pro mais antigo
        lista_final = list(mapa_partidas.values())
        lista_final.sort(key=lambda x: int(x.get("timestamp", 0)), reverse=True)

        # Chama a persistência interna
        self._salvar_json(lista_final, filename, extra_meta={"total_matches": len(lista_final)})
        print(f"[{match_type}] Arquivo atualizado! Total acumulado de partidas: {len(lista_final)} em {path}")


    def atualizar_estatisticas_membros(self, id_clube: str, plataforma: str) -> None:
        """Busca e sobrescreve o acumulado geral de estatísticas dos membros."""
        url = self._formatar_url(f"/members/stats?platform={plataforma}&clubId={id_clube}")
        dados = self._chamar_api(url, "estatísticas dos membros no clube")
        
        if dados:
            self._salvar_json(dados, "players_club_stats.json")
        else:
            print("Aviso: Falha ao buscar membros. Mantendo o players_club_stats.json anterior.")


    def procurar_clube(self, nome_clube:str, plataforma:str) -> None:
        self._ultimo_nome = nome_clube
        self._ultima_plataforma = plataforma
        
        nome_formatado = urllib.parse.quote(nome_clube)
        url = self._formatar_url(f"/allTimeLeaderboard/search?platform={plataforma}&clubName={nome_formatado}")
        resposta = self._chamar_api(url, "ID do clube")
        
        if not resposta:
            print("Nenhum clube encontrado ou erro na requisição.")
            self._ultimo_id = None # type: ignore
            self._ultima_resposta = None # type: ignore
            return None
        
        for clube in resposta:
            id_clube = clube.get('clubId')
            nome = clube.get('clubName')
            if nome.lower() == nome_clube.lower():
                print(f"Clube encontrado: {nome} - ID: {id_clube}")
                break
        else:
            clube = resposta[0]
            id_clube = clube.get('clubId')
            nome = clube.get('clubName')
            print(f"Nome exato não encontrado. Pegando o 1º resultado: {nome} - ID: {id_clube}")
        
        self._ultimo_id = id_clube
        self._ultima_resposta = [clube]


# ==========================================
# EXECUÇÃO PRINCIPAL
# ==========================================
def main():
    print(f"=== Iniciando raspagem de dados da EA para {NOME_CLUBE} ===")
    api = API()
    
    global ID_CLUBE
    if not ID_CLUBE:
        ID_CLUBE = api.procurar_clube(NOME_CLUBE, PLATAFORMA)   
    
    for match_type in MATCH_TYPES:
        api.atualizar_historico_partidas(ID_CLUBE, PLATAFORMA, match_type, NUMERO_RESULTADOS) # type: ignore
    
    api.atualizar_estatisticas_membros(ID_CLUBE, PLATAFORMA) # type: ignore
    
    print("Processo de fetch finalizado com segurança.")
    
    # URL_MEMBERS_CAREER = f"https://proclubs.ea.com/api/fc/members/career/stats?platform={PLATAFORMA}&clubId={CLUB_ID}"
    # raw_members_career = fetch_from_ea(URL_MEMBERS_CAREER, "estatísticas de carreira dos membros")
        # if raw_members_career:
        #     save_json_data(raw_members_career, "players_career_stats.json")

if __name__ == "__main__":
    main()