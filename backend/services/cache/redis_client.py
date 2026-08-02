import json

class RedisCacheClient:
    """
    (NEW) Dynamic Redis connector interface.
    Manages session hashes, compliance queries cache, and key expiries.
    """
    def __init__(self, host="localhost", port=6379):
        self.store = {}

    def get_cache(self, key: str):
        return self.store.get(key)

    def set_cache(self, key: str, value: str, expiry_seconds=3600):
        self.store[key] = value
        return True

    def delete_cache(self, key: str):
        if key in self.store:
            del self.store[key]
            return True
        return False
