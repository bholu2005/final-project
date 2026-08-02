import json

class ModelRegistryClient:
    """
    (NEW) Dynamic model registry tracker.
    Stores deployment status, model hashes, and parent versions.
    """
    def __init__(self, registry_file="models/registry_metadata.json"):
        self.registry_file = registry_file

    def register_version(self, model_version: str, metrics: dict):
        metadata = {
            "model_version": model_version,
            "status": "Staging",
            "metrics": metrics,
            "registered_at": "now"
        }
        return metadata
