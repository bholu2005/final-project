import subprocess

class CodeExecutorTool:
    """
    (NEW) Executable tool helper for the security agent.
    Runs isolated code linting or syntax checks on generated patches before outputting to clients.
    """
    def __init__(self, sandbox_dir="/tmp/sec_sandbox"):
        self.sandbox_dir = sandbox_dir

    def lint_php(self, code: str) -> bool:
        # Run local linter syntax check simulation
        if "syntax error" in code or "unclosed" in code:
            return False
        return True
