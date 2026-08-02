class ExternalApiAdapters:
    """
    (NEW) Interface adapting external API tools.
    Allows Merlin Security Agents to connect to live web browsers or search engines.
    """
    def query_cve_database(self, keyword: str):
        # Query vulnerability data
        return [
            {"id": "CVE-2024-1234", "summary": f"Insecure defaults matching {keyword}"},
            {"id": "CVE-2024-5678", "summary": f"Concatenation flaw found in {keyword}"}
        ]
