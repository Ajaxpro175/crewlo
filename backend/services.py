from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Optional
from models import (
    Project, ProjectCreate, 
    Lead, LeadCreate,
    Material, MaterialCreate,
    Estimate, EstimateCreate,
    Proposal, ProposalCreate
)
from datetime import datetime

class ProjectService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.collection = db.projects

    async def create_project(self, project: ProjectCreate) -> Project:
        project_dict = project.dict()
        project_obj = Project(**project_dict)
        await self.collection.insert_one(project_obj.dict())
        return project_obj

    async def get_projects(self) -> List[Project]:
        projects = await self.collection.find().to_list(1000)
        return [Project(**project) for project in projects]

    async def get_project(self, project_id: str) -> Optional[Project]:
        project = await self.collection.find_one({"id": project_id})
        return Project(**project) if project else None

    async def update_project(self, project_id: str, project: ProjectCreate) -> Optional[Project]:
        project_dict = project.dict()
        project_dict["updated_at"] = datetime.utcnow()
        result = await self.collection.update_one(
            {"id": project_id}, 
            {"$set": project_dict}
        )
        if result.modified_count:
            return await self.get_project(project_id)
        return None

    async def delete_project(self, project_id: str) -> bool:
        result = await self.collection.delete_one({"id": project_id})
        return result.deleted_count > 0

class LeadService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.collection = db.leads

    async def create_lead(self, lead: LeadCreate) -> Lead:
        lead_dict = lead.dict()
        lead_obj = Lead(**lead_dict)
        await self.collection.insert_one(lead_obj.dict())
        return lead_obj

    async def get_leads(self) -> List[Lead]:
        leads = await self.collection.find().to_list(1000)
        return [Lead(**lead) for lead in leads]

    async def get_lead(self, lead_id: str) -> Optional[Lead]:
        lead = await self.collection.find_one({"id": lead_id})
        return Lead(**lead) if lead else None

    async def update_lead(self, lead_id: str, lead: LeadCreate) -> Optional[Lead]:
        lead_dict = lead.dict()
        lead_dict["updated_at"] = datetime.utcnow()
        result = await self.collection.update_one(
            {"id": lead_id}, 
            {"$set": lead_dict}
        )
        if result.modified_count:
            return await self.get_lead(lead_id)
        return None

    async def delete_lead(self, lead_id: str) -> bool:
        result = await self.collection.delete_one({"id": lead_id})
        return result.deleted_count > 0

class MaterialService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.collection = db.materials

    async def create_material(self, material: MaterialCreate) -> Material:
        material_dict = material.dict()
        material_obj = Material(**material_dict)
        await self.collection.insert_one(material_obj.dict())
        return material_obj

    async def get_materials(self) -> List[Material]:
        materials = await self.collection.find().to_list(1000)
        return [Material(**material) for material in materials]

    async def get_material(self, material_id: str) -> Optional[Material]:
        material = await self.collection.find_one({"id": material_id})
        return Material(**material) if material else None

    async def update_material(self, material_id: str, material: MaterialCreate) -> Optional[Material]:
        material_dict = material.dict()
        material_dict["updated_at"] = datetime.utcnow()
        result = await self.collection.update_one(
            {"id": material_id}, 
            {"$set": material_dict}
        )
        if result.modified_count:
            return await self.get_material(material_id)
        return None

    async def delete_material(self, material_id: str) -> bool:
        result = await self.collection.delete_one({"id": material_id})
        return result.deleted_count > 0

class EstimateService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.collection = db.estimates

    async def create_estimate(self, estimate: EstimateCreate) -> Estimate:
        estimate_dict = estimate.dict()
        # Calculate total cost
        total_cost = estimate_dict["materials_cost"] + estimate_dict["labor_cost"] + estimate_dict["overhead_cost"] + estimate_dict["profit_margin"]
        estimate_dict["total_cost"] = total_cost
        estimate_obj = Estimate(**estimate_dict)
        await self.collection.insert_one(estimate_obj.dict())
        return estimate_obj

    async def get_estimates(self) -> List[Estimate]:
        estimates = await self.collection.find().to_list(1000)
        return [Estimate(**estimate) for estimate in estimates]

    async def get_estimate(self, estimate_id: str) -> Optional[Estimate]:
        estimate = await self.collection.find_one({"id": estimate_id})
        return Estimate(**estimate) if estimate else None

    async def update_estimate(self, estimate_id: str, estimate: EstimateCreate) -> Optional[Estimate]:
        estimate_dict = estimate.dict()
        estimate_dict["updated_at"] = datetime.utcnow()
        # Recalculate total cost
        total_cost = estimate_dict["materials_cost"] + estimate_dict["labor_cost"] + estimate_dict["overhead_cost"] + estimate_dict["profit_margin"]
        estimate_dict["total_cost"] = total_cost
        result = await self.collection.update_one(
            {"id": estimate_id}, 
            {"$set": estimate_dict}
        )
        if result.modified_count:
            return await self.get_estimate(estimate_id)
        return None

    async def delete_estimate(self, estimate_id: str) -> bool:
        result = await self.collection.delete_one({"id": estimate_id})
        return result.deleted_count > 0

class ProposalService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.collection = db.proposals

    async def create_proposal(self, proposal: ProposalCreate) -> Proposal:
        proposal_dict = proposal.dict()
        proposal_obj = Proposal(**proposal_dict)
        await self.collection.insert_one(proposal_obj.dict())
        return proposal_obj

    async def get_proposals(self) -> List[Proposal]:
        proposals = await self.collection.find().to_list(1000)
        return [Proposal(**proposal) for proposal in proposals]

    async def get_proposal(self, proposal_id: str) -> Optional[Proposal]:
        proposal = await self.collection.find_one({"id": proposal_id})
        return Proposal(**proposal) if proposal else None

    async def update_proposal(self, proposal_id: str, proposal: ProposalCreate) -> Optional[Proposal]:
        proposal_dict = proposal.dict()
        proposal_dict["updated_at"] = datetime.utcnow()
        result = await self.collection.update_one(
            {"id": proposal_id}, 
            {"$set": proposal_dict}
        )
        if result.modified_count:
            return await self.get_proposal(proposal_id)
        return None

    async def delete_proposal(self, proposal_id: str) -> bool:
        result = await self.collection.delete_one({"id": proposal_id})
        return result.deleted_count > 0