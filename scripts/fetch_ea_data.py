import argparse
import json
import os
import sys
import time
import urllib.parse
from datetime import datetime
from curl_cffi import requests

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except AttributeError:
        pass

NUMERO_RESULTADOS = 50
MATCH_TYPES = ["leagueMatch", "playoffMatch", "friendlyMatch"]

class API:
    def __init__(self, season: str = "fc27") -> None:
        self.season = season
        self.url_base = "https://proclubs.ea.com/api/fc"
        self.timeout = 25
        self._ultimo_nome: str = None # type: ignore
        self._ultimo_id: str = None # type: ignore
        self._ultima_plataforma: str = None # type: ignore
        self._ultima_resposta: list = None # type: ignore

    def _formatar_url(self, endpoint) -> str:
        if endpoint.startswith("http"):
            return endpoint
        return f"{self.url_base}/{endpoint.lstrip('/')}"   

    def _chamar_api(self, url: str, descricao: str, retries: int = 3, backoff: float = 2.0) -> list | dict | None:
        headers = {
            "Accept": "application/json, text/plain, */*",
            "Referer": "https://www.ea.com/",
            "Origin": "https://www.ea.com"
        }
        for tentativa in range(1, retries + 1):
            try:
                print(f"Buscando {descricao} (tentativa {tentativa}/{retries})...")
                resposta = requests.get(url, impersonate="chrome", timeout=self.timeout, headers=headers)

                # A EA retorna HTTP 500 para playoffMatch quando a janela de playoffs não está aberta
                if resposta.status_code == 500 and "playoffMatch" in url:
                    print(f"[{descricao}] Playoffs inativos no momento (EA retornou HTTP 500 esperado).")
                    return []

                resposta.raise_for_status()
                
                # Garante que a resposta seja interpretada como JSON com segurança
                payload = resposta.json()
                if not payload:
                    return []
                return payload
                
            except requests.exceptions.RequestException as e:
                print(f"Erro ao buscar {descricao} (tentativa {tentativa}/{retries}): {e}")
                if tentativa < retries:
                    espera = backoff * tentativa
                    print(f"Aguardando {espera:.1f}s antes de tentar novamente...")
                    time.sleep(espera)
                else:
                    return None
            except json.JSONDecodeError as e:
                print(f"Erro ao decodificar JSON de {descricao}: {e}")
                return None
   
    def _salvar_json(self, dados: dict | list, filename: str, extra_meta: dict = None) -> None: # type: ignore
        """Salva dados genéricos sobrescrevendo o arquivo e aceitando metadados extras."""
        os.makedirs(os.path.join("data", self.season, "raw"), exist_ok=True)
        path = os.path.join("data", self.season, "raw", filename)
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
        path = os.path.join("data", self.season, "raw", filename)
        
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


    def atualizar_info_clube(self, id_clube: str, plataforma: str):
        """Salva /clubs/info em club_info.json. Retorna o payload ou None."""
        url = self._formatar_url(f"/clubs/info?platform={plataforma}&clubIds={id_clube}")
        dados = self._chamar_api(url, "informa??es do clube")
        if dados:
            self._salvar_json(dados, "club_info.json")
        else:
            print("Aviso: Falha ao buscar club info. Mantendo o club_info.json anterior.")
        return dados or None

    def atualizar_estatisticas_gerais_clube(self, id_clube: str, plataforma: str):
        """Salva /clubs/overallStats em club_overall_stats.json. Retorna o payload ou None."""
        url = self._formatar_url(f"/clubs/overallStats?platform={plataforma}&clubIds={id_clube}")
        dados = self._chamar_api(url, "estat?sticas gerais do clube")
        if dados:
            self._salvar_json(dados, "club_overall_stats.json")
        else:
            print("Aviso: Falha ao buscar overallStats. Mantendo o club_overall_stats.json anterior.")
        return dados or None

    def atualizar_carreira_membros(self, id_clube: str, plataforma: str) -> None:
        """Salva /members/career/stats em players_career_stats.json."""
        url = self._formatar_url(f"/members/career/stats?platform={plataforma}&clubId={id_clube}")
        dados = self._chamar_api(url, "estat?sticas de carreira dos membros")
        if dados:
            self._salvar_json(dados, "players_career_stats.json")
        else:
            print("Aviso: Falha ao buscar carreira. Mantendo o players_career_stats.json anterior.")

    def buscar_divisao_atual(self, nome_clube: str, id_clube: str, plataforma: str):
        """currentDivision s? existe no endpoint de busca; filtra pelo clubId."""
        nome_formatado = urllib.parse.quote(nome_clube)
        url = self._formatar_url(f"/allTimeLeaderboard/search?platform={plataforma}&clubName={nome_formatado}")
        resposta = self._chamar_api(url, "divis?o atual do clube")
        for clube in resposta or []:
            if str(clube.get("clubId")) == str(id_clube):
                return clube.get("currentDivision")
        return None

    def procurar_clube(self, nome_clube: str, plataforma: str) -> str | None:
        self._ultimo_nome = nome_clube
        self._ultima_plataforma = plataforma
        
        nome_formatado = urllib.parse.quote(nome_clube)
        # 1. Tenta allTimeLeaderboard
        url = self._formatar_url(f"/allTimeLeaderboard/search?platform={plataforma}&clubName={nome_formatado}")
        resposta = self._chamar_api(url, "busca do clube (allTimeLeaderboard)")
        
        # 2. Fallback para currentSeasonLeaderboard
        if not resposta:
            url_season = self._formatar_url(f"/currentSeasonLeaderboard/search?platform={plataforma}&clubName={nome_formatado}")
            resposta = self._chamar_api(url_season, "busca do clube (currentSeasonLeaderboard)")
        
        if not resposta:
            print(f"Nenhum clube encontrado para '{nome_clube}'.")
            self._ultimo_id = None # type: ignore
            self._ultima_resposta = None # type: ignore
            return None
        
        nome_alvo = nome_clube.strip().lower()
        for clube in resposta:
            id_clube = str(clube.get('clubId') or '')
            nome = (clube.get('clubName') or '').strip()
            if nome.lower() == nome_alvo:
                print(f"Clube encontrado (match exato): {nome} - ID: {id_clube}")
                self._ultimo_id = id_clube
                self._ultima_resposta = [clube]
                return id_clube
        
        if len(resposta) == 1:
            clube = resposta[0]
            id_clube = str(clube.get('clubId') or '')
            nome = clube.get('clubName')
            print(f"Clube unico retornado na busca: {nome} - ID: {id_clube}")
            self._ultimo_id = id_clube
            self._ultima_resposta = [clube]
            return id_clube

        print(f"Multiplos clubes retornados ({len(resposta)}), nenhum com match exato para '{nome_clube}'.")
        self._ultimo_id = None # type: ignore
        self._ultima_resposta = None # type: ignore
        return None


# ==========================================
# EXECUÇÃO PRINCIPAL
# ==========================================
def carregar_config_clube(season: str) -> tuple[str, dict]:
    path = os.path.join("config", season, "club.json")
    if not os.path.exists(path):
        print(f"[ERRO] Config nao encontrada: {path}")
        sys.exit(1)
    with open(path, "r", encoding="utf-8-sig") as f:
        return path, json.load(f)


def sincronizar_config_clube(config_path: str, config: dict, overall, divisao_atual) -> None:
    """
    Atualiza config/<season>/club.json com dados da EA.
    - divisaoAtual  <- currentDivision (busca)
    - reputacaoTier <- reputationtier (overallStats, 0-3)
    'torcedores' e 'reputacaoNivel' NAO sao expostos pela EA e permanecem manuais.
    """
    alterado = False
    if divisao_atual not in (None, ""):
        try:
            nova = int(divisao_atual)
            if config.get("divisaoAtual") != nova:
                config["divisaoAtual"] = nova
                alterado = True
        except (TypeError, ValueError):
            pass
    registro = overall[0] if isinstance(overall, list) and overall else None
    if registro and registro.get("reputationtier") not in (None, ""):
        try:
            tier = int(registro["reputationtier"])
            if config.get("reputacaoTier") != tier:
                config["reputacaoTier"] = tier
                alterado = True
        except (TypeError, ValueError):
            pass
    if alterado:
        with open(config_path, "w", encoding="utf-8") as f:
            json.dump(config, f, indent=4, ensure_ascii=False)
            f.write("\n")
        print(f"club.json sincronizado com a EA: {config_path}")


def main():
    parser = argparse.ArgumentParser(description="Coleta dados da API de Pro Clubs da EA.")
    parser.add_argument("--season", default="fc27", help="Temporada (padrao: fc27)")
    parser.add_argument("--force", action="store_true", help="Permite executar para temporadas encerradas (fc26)")
    args = parser.parse_args()
    season = args.season

    if season == "fc26" and not args.force:
        print("[AVISO] A API da EA para o FC26 foi encerrada e os dados do FC26 sao mantidos manualmente.")
        print("        Use --force para executar mesmo assim.")
        sys.exit(1)

    config_path, config = carregar_config_clube(season)
    nome_clube = config.get("nome_clube_ea", "")
    id_clube = str(config.get("id_clube_ea") or "")
    plataforma = config.get("plataforma_ea", "common-gen5")

    print(f"=== Iniciando raspagem de dados da EA para {nome_clube} ({season}) ===")
    api = API(season)

    if not id_clube:
        id_clube = str(api.procurar_clube(nome_clube, plataforma) or "")
        if not id_clube:
            print(f"[AVISO] Clube '{nome_clube}' ainda nao indexado na API da EA ({season}).")
            print("        A API da EA indexa novos clubes na busca assim que a partida de estreia e disputada.")
            print("        Pipeline finalizado em modo de espera.")
            sys.exit(0)
        config["id_clube_ea"] = id_clube
        with open(config_path, "w", encoding="utf-8") as f:
            json.dump(config, f, indent=4, ensure_ascii=False)
            f.write("\n")
        print(f"id_clube_ea salvo em {config_path}: {id_clube}")

    for match_type in MATCH_TYPES:
        api.atualizar_historico_partidas(id_clube, plataforma, match_type, NUMERO_RESULTADOS)
    
    api.atualizar_estatisticas_membros(id_clube, plataforma)
    api.atualizar_carreira_membros(id_clube, plataforma)
    api.atualizar_info_clube(id_clube, plataforma)
    overall = api.atualizar_estatisticas_gerais_clube(id_clube, plataforma)
    divisao = api.buscar_divisao_atual(nome_clube, id_clube, plataforma)
    sincronizar_config_clube(config_path, config, overall, divisao)

    print("Processo de fetch finalizado com seguran?a.")

    # LOGS E STEP SUMMARY
    import os
    from datetime import datetime
    summary_path = os.environ.get('GITHUB_STEP_SUMMARY')
    if summary_path:
        with open(summary_path, 'a', encoding='utf-8') as f:
            f.write(f"### 📥 Fetch EA Data\n")
            f.write(f"- Consulta na API da EA concluída com sucesso.\n")

    os.makedirs('logs', exist_ok=True)
    log_file_path = os.path.join('logs', 'update_stats.log')
    with open(log_file_path, 'a', encoding='utf-8') as f:
        timestamp = datetime.now().strftime('%d/%m/%Y %H:%M:%S')
        f.write(f"[{timestamp}] FetchEA: Sucesso ao buscar dados da EA.\n")

if __name__ == "__main__":
    main()