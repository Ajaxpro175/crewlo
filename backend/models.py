from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

class Project(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    address: str
    client_id: str
    status: str = "active"  # active, completed, cancelled
    project_type: str  # residential, commercial, renovation
    estimated_cost: float = 0.0
    actual_cost: float = 0.0
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    address: str
    client_id: str
    project_type: str
    estimated_cost: float = 0.0
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

class Lead(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: str
    address: str
    project_type: str
    description: Optional[str] = None
    status: str = "new"  # new, contacted, qualified, converted, lost
    source: str = "website"  # website, referral, social, phone
    estimated_budget: float = 0.0
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class LeadCreate(BaseModel):
    name: str
    email: str
    phone: str
    address: str
    project_type: str
    description: Optional[str] = None
    source: str = "website"
    estimated_budget: float = 0.0
    notes: Optional[str] = None

class Material(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    category: str
    unit: str  # sq ft, linear ft, each, etc.
    cost_per_unit: float
    supplier: Optional[str] = None
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class MaterialCreate(BaseModel):
    name: str
    category: str
    unit: str
    cost_per_unit: float
    supplier: Optional[str] = None
    description: Optional[str] = None

class Estimate(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    project_id: str
    lead_id: Optional[str] = None
    description: str
    total_cost: float
    materials_cost: float
    labor_cost: float
    overhead_cost: float
    profit_margin: float
    line_items: List[Dict[str, Any]] = []
    status: str = "draft"  # draft, sent, approved, rejected
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class EstimateCreate(BaseModel):
    project_id: str
    lead_id: Optional[str] = None
    description: str
    materials_cost: float
    labor_cost: float
    overhead_cost: float
    profit_margin: float
    line_items: List[Dict[str, Any]] = []

class Proposal(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    estimate_id: str
    title: str
    content: str
    terms: str
    status: str = "draft"  # draft, sent, viewed, accepted, rejected
    valid_until: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ProposalCreate(BaseModel):
    estimate_id: str
    title: str
    content: str
    terms: str
    valid_until: Optional[datetime] = None