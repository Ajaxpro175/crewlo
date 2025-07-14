from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from typing import List

from models import (
    Project, ProjectCreate,
    Lead, LeadCreate,
    Material, MaterialCreate,
    Estimate, EstimateCreate,
    Proposal, ProposalCreate
)
from services import (
    ProjectService, LeadService, MaterialService, 
    EstimateService, ProposalService
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Initialize services
project_service = ProjectService(db)
lead_service = LeadService(db)
material_service = MaterialService(db)
estimate_service = EstimateService(db)
proposal_service = ProposalService(db)

# Create the main app without a prefix
app = FastAPI(title="Crewlo API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Health check endpoint
@api_router.get("/")
async def root():
    return {"message": "Crewlo API", "version": "1.0.0"}

# Project endpoints
@api_router.post("/projects", response_model=Project)
async def create_project(project: ProjectCreate):
    return await project_service.create_project(project)

@api_router.get("/projects", response_model=List[Project])
async def get_projects():
    return await project_service.get_projects()

@api_router.get("/projects/{project_id}", response_model=Project)
async def get_project(project_id: str):
    project = await project_service.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@api_router.put("/projects/{project_id}", response_model=Project)
async def update_project(project_id: str, project: ProjectCreate):
    updated_project = await project_service.update_project(project_id, project)
    if not updated_project:
        raise HTTPException(status_code=404, detail="Project not found")
    return updated_project

@api_router.delete("/projects/{project_id}")
async def delete_project(project_id: str):
    success = await project_service.delete_project(project_id)
    if not success:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": "Project deleted successfully"}

# Lead endpoints
@api_router.post("/leads", response_model=Lead)
async def create_lead(lead: LeadCreate):
    return await lead_service.create_lead(lead)

@api_router.get("/leads", response_model=List[Lead])
async def get_leads():
    return await lead_service.get_leads()

@api_router.get("/leads/{lead_id}", response_model=Lead)
async def get_lead(lead_id: str):
    lead = await lead_service.get_lead(lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead

@api_router.put("/leads/{lead_id}", response_model=Lead)
async def update_lead(lead_id: str, lead: LeadCreate):
    updated_lead = await lead_service.update_lead(lead_id, lead)
    if not updated_lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return updated_lead

@api_router.delete("/leads/{lead_id}")
async def delete_lead(lead_id: str):
    success = await lead_service.delete_lead(lead_id)
    if not success:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"message": "Lead deleted successfully"}

# Material endpoints
@api_router.post("/materials", response_model=Material)
async def create_material(material: MaterialCreate):
    return await material_service.create_material(material)

@api_router.get("/materials", response_model=List[Material])
async def get_materials():
    return await material_service.get_materials()

@api_router.get("/materials/{material_id}", response_model=Material)
async def get_material(material_id: str):
    material = await material_service.get_material(material_id)
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    return material

@api_router.put("/materials/{material_id}", response_model=Material)
async def update_material(material_id: str, material: MaterialCreate):
    updated_material = await material_service.update_material(material_id, material)
    if not updated_material:
        raise HTTPException(status_code=404, detail="Material not found")
    return updated_material

@api_router.delete("/materials/{material_id}")
async def delete_material(material_id: str):
    success = await material_service.delete_material(material_id)
    if not success:
        raise HTTPException(status_code=404, detail="Material not found")
    return {"message": "Material deleted successfully"}

# Estimate endpoints
@api_router.post("/estimates", response_model=Estimate)
async def create_estimate(estimate: EstimateCreate):
    return await estimate_service.create_estimate(estimate)

@api_router.get("/estimates", response_model=List[Estimate])
async def get_estimates():
    return await estimate_service.get_estimates()

@api_router.get("/estimates/{estimate_id}", response_model=Estimate)
async def get_estimate(estimate_id: str):
    estimate = await estimate_service.get_estimate(estimate_id)
    if not estimate:
        raise HTTPException(status_code=404, detail="Estimate not found")
    return estimate

@api_router.put("/estimates/{estimate_id}", response_model=Estimate)
async def update_estimate(estimate_id: str, estimate: EstimateCreate):
    updated_estimate = await estimate_service.update_estimate(estimate_id, estimate)
    if not updated_estimate:
        raise HTTPException(status_code=404, detail="Estimate not found")
    return updated_estimate

@api_router.delete("/estimates/{estimate_id}")
async def delete_estimate(estimate_id: str):
    success = await estimate_service.delete_estimate(estimate_id)
    if not success:
        raise HTTPException(status_code=404, detail="Estimate not found")
    return {"message": "Estimate deleted successfully"}

# Proposal endpoints
@api_router.post("/proposals", response_model=Proposal)
async def create_proposal(proposal: ProposalCreate):
    return await proposal_service.create_proposal(proposal)

@api_router.get("/proposals", response_model=List[Proposal])
async def get_proposals():
    return await proposal_service.get_proposals()

@api_router.get("/proposals/{proposal_id}", response_model=Proposal)
async def get_proposal(proposal_id: str):
    proposal = await proposal_service.get_proposal(proposal_id)
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    return proposal

@api_router.put("/proposals/{proposal_id}", response_model=Proposal)
async def update_proposal(proposal_id: str, proposal: ProposalCreate):
    updated_proposal = await proposal_service.update_proposal(proposal_id, proposal)
    if not updated_proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    return updated_proposal

@api_router.delete("/proposals/{proposal_id}")
async def delete_proposal(proposal_id: str):
    success = await proposal_service.delete_proposal(proposal_id)
    if not success:
        raise HTTPException(status_code=404, detail="Proposal not found")
    return {"message": "Proposal deleted successfully"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()