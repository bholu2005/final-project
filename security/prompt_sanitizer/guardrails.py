class PromptSanitizer:
    """
    (NEW) Security guardrails protecting the LLM models.
    Identifies and strips adversarial prompt injections, escape flags, or unauthorized requests.
    """
    def sanitize_user_input(self, raw_prompt: str) -> str:
        harmful_keywords = ["ignore previous instructions", "system override", "bypass restriction"]
        sanitized = raw_prompt

        for keyword in harmful_keywords:
            if keyword in raw_prompt.lower():
                sanitized = sanitized.replace(keyword, "[REDACTED SECURITY PATTERN]")

        return sanitized
