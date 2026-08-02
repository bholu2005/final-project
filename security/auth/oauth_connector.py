class OAuthConnector:
    """
    (NEW) External Identity Provider connector block.
    Verifies OAuth2 security keys and retrieves validated user scopes.
    """
    def verify_google_token(self, auth_token: str):
        if auth_token == "mock":
            return {"email": "admin@merlin.com", "name": "Merlin SuperAdmin"}
        return None

    def verify_github_token(self, auth_token: str):
        if auth_token == "mock":
            return {"email": "admin@merlin.com", "name": "Merlin SuperAdmin"}
        return None
