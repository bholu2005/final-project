import time

class ApiRateLimiter:
    """
    (NEW) Implements token-bucket algorithm rate limiter.
    Throttles aggressive bot scripts or scrapers trying to brute-force security API routes.
    """
    def __init__(self, capacity=100, refill_rate=2.0):
        self.capacity = capacity
        self.refill_rate = refill_rate
        self.tokens = capacity
        self.last_refill = time.time()

    def allow_request(self) -> bool:
        now = time.time()
        elapsed = now - self.last_refill
        self.last_refill = now

        # Add new tokens based on refill rate
        self.tokens = min(self.capacity, self.tokens + (elapsed * self.refill_rate))

        if self.tokens >= 1.0:
            self.tokens -= 1.0
            return True
        return False
