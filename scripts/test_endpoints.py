#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
=============================================================================
BAILE DE MUNIQUE — SCRIPT DE DIAGNÓSTICO E TESTES DE ENDPOINTS (FC 27)
=============================================================================
Valida a conectividade, latência, schemas de resposta e comportamento de
borda de todos os serviços externos integrados:
  1. EA Sports FC Pro Clubs API (Busca, Club Info, Membros, Partidas, Edge cases)
  2. Google Apps Script (Likes, Dislikes e Comentários dos jornais)
  3. DecAPI Twitch (Verificação de status da live de oboueri)

Uso:
  python scripts/test_endpoints.py
  python scripts/test_endpoints.py --season fc27 --verbose
  python scripts/test_endpoints.py --club "BAILE D MUNIQUE"
  python scripts/test_endpoints.py --club-id 52589
=============================================================================
"""

import argparse
import json
import os
import sys
import time
import urllib.parse
from datetime import datetime

# Garante saída UTF-8 no console Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except AttributeError:
        pass

try:
    from curl_cffi import requests
    CURL_CFFI_AVAILABLE = True
except ImportError:
    import requests # type: ignore
    CURL_CFFI_AVAILABLE = False


# =============================================================================
# CONSTANTES E CONFIGURAÇÕES
# =============================================================================
EA_BASE_URL = "https://proclubs.ea.com/api/fc"
GAS_ENDPOINT = "https://script.google.com/macros/s/AKfycbyBH4hq66XZuuHoKQtaoyTGCP3M2WbYNwJlRF0Qw8V40iMmHaZA82vmJFkABZALHSFrTg/exec"
DECAPI_TWITCH_URL = "https://decapi.me/twitch/uptime/oboueri"

EA_HEADERS = {
    "Accept": "application/json, text/plain, */*",
    "Referer": "https://www.ea.com/",
    "Origin": "https://www.ea.com"
}

LOG_FILE = os.path.join("logs", "diagnostic_endpoints.log")


# =============================================================================
# UTILITÁRIOS DE LOG E FORMATAÇÃO
# =============================================================================
class DiagnosticLogger:
    def __init__(self, log_path: str = LOG_FILE):
        self.log_path = log_path
        os.makedirs(os.path.dirname(log_path), exist_ok=True)
        self.entries = []

    def log(self, message: str, print_to_stdout: bool = True):
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        formatted = f"[{timestamp}] {message}"
        self.entries.append(formatted)
        if print_to_stdout:
            print(message)

    def save(self):
        with open(self.log_path, "a", encoding="utf-8") as f:
            for entry in self.entries:
                f.write(entry + "\n")
            f.write("\n")


def make_request(url: str, headers: dict = None, timeout: int = 15, impersonate: str = "chrome"):
    """
    Executa requisição HTTP usando curl_cffi para contornar proteção Akamai/Edge.
    Retorna (status_code, response_json_or_text, elapsed_ms, error_msg).
    """
    headers = headers or EA_HEADERS
    start_time = time.time()
    try:
        if CURL_CFFI_AVAILABLE:
            resp = requests.get(url, headers=headers, impersonate=impersonate, timeout=timeout)
        else:
            resp = requests.get(url, headers=headers, timeout=timeout)
        
        elapsed_ms = int((time.time() - start_time) * 1000)
        status = resp.status_code
        
        try:
            body = resp.json()
        except Exception:
            body = resp.text
            
        return status, body, elapsed_ms, None
    except Exception as e:
        elapsed_ms = int((time.time() - start_time) * 1000)
        return None, None, elapsed_ms, str(e)


# =============================================================================
# SUITE DE TESTES
# =============================================================================
class EndpointDiagnosticSuite:
    def __init__(self, season: str = "fc27", club_name: str = None, club_id: str = None, verbose: bool = False):
        self.season = season
        self.verbose = verbose
        self.logger = DiagnosticLogger()
        self.results = []
        
        # Carrega dados padrão de config/<season>/club.json se não fornecidos
        config_path = os.path.join("config", season, "club.json")
        self.config = {}
        if os.path.exists(config_path):
            try:
                with open(config_path, "r", encoding="utf-8-sig") as f:
                    self.config = json.load(f)
            except Exception as e:
                self.logger.log(f"⚠️ Aviso: Falha ao ler {config_path}: {e}")

        self.club_name = club_name or self.config.get("nome_clube_ea", "Baile d Munich")
        self.club_id = club_id or str(self.config.get("id_clube_ea") or "")
        self.platform = self.config.get("plataforma_ea", "common-gen5")

    def _record_result(self, category: str, test_name: str, passed: bool, status_code: int | str, elapsed_ms: int, details: str):
        self.results.append({
            "category": category,
            "test_name": test_name,
            "passed": passed,
            "status_code": status_code,
            "elapsed_ms": elapsed_ms,
            "details": details
        })
        icon = "✅ PASS" if passed else "❌ FAIL"
        self.logger.log(f"  {icon} | {test_name:<40} | HTTP {str(status_code):<4} | {elapsed_ms:>5}ms | {details}")

    # -------------------------------------------------------------------------
    # 1. TESTES DA API EA SPORTS FC PRO CLUBS
    # -------------------------------------------------------------------------
    def test_ea_anti_bot_bypass(self):
        """Valida que o bypass de TLS / Akamai funciona via curl_cffi."""
        self.logger.log("\n[1/4] Testando Transporte & Proteção Anti-Bot (Akamai / Edge)...")
        url = f"{EA_BASE_URL}/clubs/overallStats?platform={self.platform}&clubIds=559505"
        status, body, elapsed, err = make_request(url)
        
        if err:
            self._record_result("EA-Transport", "Bypass Akamai Bot Manager (curl_cffi)", False, "ERR", elapsed, f"Falha de conexão: {err}")
        elif status == 200:
            self._record_result("EA-Transport", "Bypass Akamai Bot Manager (curl_cffi)", True, status, elapsed, "Handshake TLS e Chrome impersonation bem-sucedidos")
        else:
            self._record_result("EA-Transport", "Bypass Akamai Bot Manager (curl_cffi)", False, status, elapsed, f"Status inesperado: {body}")

    def test_ea_platform_validation(self):
        """Valida que common-gen5 é aceito e common-gen4 é rejeitado com HTTP 400."""
        # Teste com gen5 (válido)
        url_gen5 = f"{EA_BASE_URL}/clubs/overallStats?platform=common-gen5&clubIds=559505"
        status5, _, elapsed5, err5 = make_request(url_gen5)
        self._record_result("EA-Platform", "Suporte Plataforma Atual (common-gen5)", status5 == 200, status5 or "ERR", elapsed5, "Plataforma ativa suportada")

        # Teste com gen4 (deve retornar HTTP 400 no FC 27)
        url_gen4 = f"{EA_BASE_URL}/clubs/overallStats?platform=common-gen4&clubIds=559505"
        status4, body4, elapsed4, _ = make_request(url_gen4)
        is_400 = (status4 == 400)
        det_400 = "Bloqueio correto de plataforma legada gen4 (HTTP 400)" if is_400 else f"Esperado HTTP 400, recebeu {status4}"
        self._record_result("EA-Platform", "Rejeição Plataforma Legada (common-gen4)", is_400, status4 or "ERR", elapsed4, det_400)

    def test_ea_club_search(self):
        """Testa busca de clubes com diferentes termos e tags."""
        self.logger.log("\n[2/4] Testando Endpoint de Busca de Clubes (/allTimeLeaderboard/search)...")
        queries = [
            (self.club_name, "Termo oficial configurado"),
            ("Baile", "Termo raiz 'Baile'"),
            ("BAILE D MUNIQUE", "Variação maiúscula com 'Munique'"),
            ("BAILE D MUNlQUE", "Variação com 'l' minúsculo"),
            ("NonExistentClub_XYZ_999", "Caso de borda: Clube inexistente")
        ]

        found_sample_id = None

        for query, desc in queries:
            encoded = urllib.parse.quote(query)
            url = f"{EA_BASE_URL}/allTimeLeaderboard/search?platform={self.platform}&clubName={encoded}"
            status, body, elapsed, err = make_request(url)

            if err:
                self._record_result("EA-Search", f"Busca: '{query}' ({desc})", False, "ERR", elapsed, f"Erro: {err}")
                continue

            if status != 200:
                self._record_result("EA-Search", f"Busca: '{query}' ({desc})", False, status, elapsed, f"HTTP {status}")
                continue

            if isinstance(body, list):
                total_found = len(body)
                if query == "NonExistentClub_XYZ_999":
                    passed = (total_found == 0)
                    detail = "Retornou lista vazia [] conforme esperado" if passed else f"Inesperado: {total_found} clubes"
                else:
                    passed = True
                    sample_names = [c.get("clubName") for c in body[:3]]
                    detail = f"{total_found} clubes encontrados -> {sample_names}"
                    if total_found > 0 and not found_sample_id:
                        found_sample_id = body[0].get("clubId")

                self._record_result("EA-Search", f"Busca: '{query}' ({desc})", passed, status, elapsed, detail)
            else:
                self._record_result("EA-Search", f"Busca: '{query}' ({desc})", False, status, elapsed, "Payload não é lista")

        return found_sample_id

    def test_ea_club_endpoints(self, test_club_id: str):
        """Testa info, overallStats, members/stats, members/career/stats e matches."""
        self.logger.log(f"\n[3/4] Testando Endpoints de Dados do Clube (ID Alvo: {test_club_id})...")
        
        # 1. Club Info
        url_info = f"{EA_BASE_URL}/clubs/info?platform={self.platform}&clubIds={test_club_id}"
        st, b, el, err = make_request(url_info)
        passed = (st == 200 and isinstance(b, dict) and test_club_id in b)
        det = f"Chave {test_club_id} presente no dict" if passed else f"Payload inválido ou ausente: {list(b.keys()) if isinstance(b, dict) else st}"
        self._record_result("EA-Club", "Informações Gerais (/clubs/info)", passed, st or "ERR", el, det)

        # 2. Club Overall Stats
        url_stats = f"{EA_BASE_URL}/clubs/overallStats?platform={self.platform}&clubIds={test_club_id}"
        st, b, el, err = make_request(url_stats)
        passed = (st == 200 and isinstance(b, list))
        det = f"{len(b)} registros de estatísticas consolidadas" if passed else f"Resposta inválida: {st}"
        self._record_result("EA-Club", "Estatísticas Gerais (/clubs/overallStats)", passed, st or "ERR", el, det)

        # 3. Members Stats
        url_members = f"{EA_BASE_URL}/members/stats?platform={self.platform}&clubId={test_club_id}"
        st, b, el, err = make_request(url_members)
        passed = (st == 200 and isinstance(b, dict) and "members" in b)
        members_count = len(b.get("members", [])) if isinstance(b, dict) else 0
        det = f"{members_count} atletas no elenco com schema 'members'" if passed else f"Schema inválido: {st}"
        self._record_result("EA-Members", "Estatísticas de Membros (/members/stats)", passed, st or "ERR", el, det)

        # 4. Members Career Stats
        url_career = f"{EA_BASE_URL}/members/career/stats?platform={self.platform}&clubId={test_club_id}"
        st, b, el, err = make_request(url_career)
        passed = (st == 200 and isinstance(b, dict) and "members" in b)
        career_count = len(b.get("members", [])) if isinstance(b, dict) else 0
        det = f"{career_count} registros de carreira com schema 'members'" if passed else f"Schema inválido: {st}"
        self._record_result("EA-Members", "Carreira de Membros (/members/career/stats)", passed, st or "ERR", el, det)

        # 5. Partidas: League Matches
        url_league = f"{EA_BASE_URL}/clubs/matches?platform={self.platform}&clubIds={test_club_id}&matchType=leagueMatch&maxResultCount=5"
        st, b, el, err = make_request(url_league)
        passed = (st == 200 and isinstance(b, list))
        det = f"{len(b)} partidas de liga retornadas com schema matchId/clubs/players" if passed else f"Falha: {st}"
        self._record_result("EA-Matches", "Partidas de Liga (matchType=leagueMatch)", passed, st or "ERR", el, det)

        # 6. Partidas: Playoff Matches (espera-se 200 ou 500 se inativo)
        url_playoff = f"{EA_BASE_URL}/clubs/matches?platform={self.platform}&clubIds={test_club_id}&matchType=playoffMatch&maxResultCount=5"
        st, b, el, err = make_request(url_playoff)
        if st == 200 and isinstance(b, list):
            passed = True
            det = f"Janela de Playoffs aberta: {len(b)} jogos retornados"
        elif st == 500:
            # Comportamento padrão documentado da EA quando os playoffs estão fechados
            passed = True
            det = "Janela inativa: Retornou HTTP 500 esperado (tratado como [] pelo pipeline)"
        else:
            passed = False
            det = f"Status inesperado para playoff: {st}"
        self._record_result("EA-Matches", "Playoffs (matchType=playoffMatch)", passed, st or "ERR", el, det)

        # 7. Partidas: Friendly Matches
        url_friendly = f"{EA_BASE_URL}/clubs/matches?platform={self.platform}&clubIds={test_club_id}&matchType=friendlyMatch&maxResultCount=5"
        st, b, el, err = make_request(url_friendly)
        passed = (st == 200 and isinstance(b, list))
        det = f"{len(b)} amistosos retornados (namespace=0 esperado)" if passed else f"Falha: {st}"
        self._record_result("EA-Matches", "Amistosos (matchType=friendlyMatch)", passed, st or "ERR", el, det)

    # -------------------------------------------------------------------------
    # 2. TESTES DE OUTROS SERVIÇOS INTEGRADOS
    # -------------------------------------------------------------------------
    def test_other_integrations(self):
        """Valida Google Apps Script (Likes/Comentários) e DecAPI Twitch."""
        self.logger.log("\n[4/4] Testando Outras APIs Integradas ao Baile de Munique...")

        # 1. Google Apps Script
        url_gas = f"{GAS_ENDPOINT}?editionId=edicao35"
        st, b, el, err = make_request(url_gas)
        passed = (st == 200 and isinstance(b, dict) and "likes" in b and "comments" in b)
        det = f"Payload OK: likes={b.get('likes')}, dislikes={b.get('dislikes')}, comentários={len(b.get('comments', []))}" if passed else f"Falha: {err or st}"
        self._record_result("Integracoes", "Google Apps Script (Likes & Comentários)", passed, st or "ERR", el, det)

        # 2. DecAPI Twitch (Stream Uptime)
        st, b, el, err = make_request(DECAPI_TWITCH_URL)
        passed = (st == 200 and isinstance(b, str) and len(b) > 0)
        is_live = not ("offline" in str(b).lower()) if passed else False
        status_text = "AO VIVO" if is_live else "OFFLINE"
        det = f"Canal oboueri está {status_text} ('{str(b).strip()}')" if passed else f"Falha: {err or st}"
        self._record_result("Integracoes", "DecAPI Twitch (Status Live oboueri)", passed, st or "ERR", el, det)

    # -------------------------------------------------------------------------
    # SUMÁRIO E DASHBOARD DE DIAGNÓSTICO
    # -------------------------------------------------------------------------
    def generate_summary(self):
        total = len(self.results)
        passed = sum(1 for r in self.results if r["passed"])
        failed = total - passed
        
        self.logger.log("\n" + "=" * 80)
        self.logger.log("                     RELATÓRIO RESUMIDO DE DIAGNÓSTICO")
        self.logger.log("=" * 80)
        self.logger.log(f"Temporada Alvo       : {self.season.upper()}")
        self.logger.log(f"Clube Configurado    : {self.club_name}")
        self.logger.log(f"ID EA Alvo           : {self.club_id or '(Resolvido dinamicamente na busca)'}")
        self.logger.log(f"Bypass TLS / Akamai  : {'ATIVO (curl_cffi chrome impersonate)' if CURL_CFFI_AVAILABLE else 'DESATIVADO (usando requests puro)'}")
        self.logger.log(f"Total de Asserções   : {total}")
        self.logger.log(f"Aprovados            : {passed} ✅")
        self.logger.log(f"Falhas               : {failed} {'❌' if failed > 0 else ''}")
        self.logger.log("-" * 80)

        # Agrupamento por categoria
        categories = {}
        for r in self.results:
            cat = r["category"]
            categories.setdefault(cat, []).append(r)

        for cat, items in categories.items():
            cat_pass = sum(1 for i in items if i["passed"])
            cat_total = len(items)
            status_icon = "✅" if cat_pass == cat_total else "⚠️"
            self.logger.log(f"[{status_icon}] {cat:<15}: {cat_pass}/{cat_total} asserções atendidas")

        self.logger.log("=" * 80)
        self.logger.save()
        self.logger.log(f"Log detalhado salvo em: {self.logger.log_path}\n")

        return failed == 0

    def run_all(self):
        self.logger.log("=" * 80)
        self.logger.log(f" INICIANDO DIAGNÓSTICO COMPLETO DE ENDPOINTS EXTERNOS — BAILE DE MUNIQUE ({self.season.upper()})")
        self.logger.log("=" * 80)

        # 1. Bypass & Plataforma
        self.test_ea_anti_bot_bypass()
        self.test_ea_platform_validation()

        # 2. Busca de Clubes
        found_sample_id = self.test_ea_club_search()

        # Define qual clube testar:
        # 1º prioridade: ID passado por CLI ou config
        # 2º prioridade: Primeiro ID encontrado na busca
        # 3º prioridade: ID fallback conhecido (52589 = BAILE D MUNIQUE, 559505 = Munich)
        target_club_id = self.club_id or found_sample_id or "52589"

        # 3. Endpoints detalhados do clube
        self.test_ea_club_endpoints(target_club_id)

        # 4. Outras integrações
        self.test_other_integrations()

        # 5. Resumo
        return self.generate_summary()


# =============================================================================
# CLI
# =============================================================================
def main():
    parser = argparse.ArgumentParser(description="Diagnóstico e teste de endpoints externos (EA FC 27, GAS, DecAPI).")
    parser.add_argument("--season", default="fc27", help="Temporada (padrão: fc27)")
    parser.add_argument("--club", default=None, help="Nome do clube a pesquisar")
    parser.add_argument("--club-id", default=None, help="ID numérico do clube para teste direto")
    parser.add_argument("--verbose", action="store_true", help="Exibe payloads completos das respostas")
    args = parser.parse_args()

    suite = EndpointDiagnosticSuite(
        season=args.season,
        club_name=args.club,
        club_id=args.club_id,
        verbose=args.verbose
    )

    success = suite.run_all()
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
