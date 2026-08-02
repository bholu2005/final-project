class SecurityAgent:
    """
    (NEW) AI Security Agent logic class.
    Parses vulnerabilities and generates optimal structural solutions.
    """
    def __init__(self, name="SecGuard-v2"):
        self.name = name

    def get_system_prompt(self):
        return (
            "You are Merlin SecGuard, a world-class principal security engineer.\n"
            "Analyze raw source code scripts and provide safe structural remediation patches.\n"
            "Always follow OWASP secure coding methodologies and provide PDO, HTML-escaped solutions."
        )
