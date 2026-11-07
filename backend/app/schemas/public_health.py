from datetime import date
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, model_validator


class CareAccessSearch(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")
    query: str = Field(min_length=3, max_length=1000)
    geography: str = Field(min_length=2, max_length=100)
    population_setting: Literal["all", "rural", "urban"] = "all"
    limit: int = Field(default=5, ge=1, le=10)


class PublicHealthSearch(BaseModel):
    query: str = Field(min_length=3, max_length=1000)
    geography: str = Field(min_length=2, max_length=100)
    population_setting: Literal["all", "rural", "urban"] = "all"
    period_start: date
    period_end: date
    limit: int = Field(default=5, ge=1, le=10)

    @model_validator(mode="after")
    def validate_period(self):
        self.query = self.query.strip()
        self.geography = self.geography.strip()
        if len(self.query) < 3 or len(self.geography) < 2:
            raise ValueError("Query and geography must contain text")
        if self.period_start > self.period_end or self.period_end > date.today():
            raise ValueError("Use a valid historical observation period")
        return self
