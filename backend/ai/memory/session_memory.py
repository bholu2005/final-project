class SessionMemory:
    """
    (NEW) Chat/Agent session conversation buffer memory.
    Keeps track of historical security audit context within the interactive chat terminal.
    """
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.buffer = []

    def add_message(self, role: str, content: str):
        self.buffer.append({"role": role, "content": content})

    def get_history(self):
        return self.buffer

    def clear(self):
        self.buffer = []
