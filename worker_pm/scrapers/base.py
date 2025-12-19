# worker_pm/scrapers/base.py
from abc import ABC, abstractmethod
from typing import List, Dict

class BaseScraper(ABC):

    def __init__(self, search_term: str):
        self.search_term = search_term

    @abstractmethod
    def scrape(self) -> List[Dict]:
        pass
