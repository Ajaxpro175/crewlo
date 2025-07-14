#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime, timedelta
from typing import Dict, Any

class HandoffAPITester:
    def __init__(self, base_url="https://333e19a5-4508-4789-8834-c9b29a5f9b4a.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.created_items = {
            'projects': [],
            'leads': [],
            'materials': [],
            'estimates': [],
            'proposals': []
        }

    def run_test(self, name: str, method: str, endpoint: str, expected_status: int, data: Dict[Any, Any] = None) -> tuple:
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, dict) and 'id' in response_data:
                        print(f"   Response ID: {response_data['id']}")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test API health check"""
        success, response = self.run_test("Health Check", "GET", "", 200)
        return success

    def test_projects_crud(self):
        """Test Projects CRUD operations"""
        print("\n" + "="*50)
        print("TESTING PROJECTS CRUD")
        print("="*50)
        
        # Test GET all projects (should work even if empty)
        success, projects = self.run_test("Get All Projects", "GET", "projects", 200)
        if not success:
            return False
        
        # Test CREATE project
        project_data = {
            "name": "Test Construction Project",
            "description": "A test project for API testing",
            "address": "123 Test Street, Test City, TC 12345",
            "client_id": "test-client-123",
            "project_type": "residential",
            "estimated_cost": 50000.0,
            "start_date": datetime.now().isoformat(),
            "end_date": (datetime.now() + timedelta(days=90)).isoformat()
        }
        
        success, project = self.run_test("Create Project", "POST", "projects", 200, project_data)
        if not success:
            return False
        
        project_id = project.get('id')
        if project_id:
            self.created_items['projects'].append(project_id)
        
        # Test GET single project
        if project_id:
            success, _ = self.run_test("Get Single Project", "GET", f"projects/{project_id}", 200)
            if not success:
                return False
        
        # Test UPDATE project
        if project_id:
            update_data = project_data.copy()
            update_data["name"] = "Updated Test Project"
            update_data["estimated_cost"] = 60000.0
            success, _ = self.run_test("Update Project", "PUT", f"projects/{project_id}", 200, update_data)
            if not success:
                return False
        
        return True

    def test_leads_crud(self):
        """Test Leads CRUD operations"""
        print("\n" + "="*50)
        print("TESTING LEADS CRUD")
        print("="*50)
        
        # Test GET all leads
        success, leads = self.run_test("Get All Leads", "GET", "leads", 200)
        if not success:
            return False
        
        # Test CREATE lead
        lead_data = {
            "name": "John Test Customer",
            "email": "john.test@example.com",
            "phone": "+1-555-123-4567",
            "address": "456 Lead Avenue, Lead City, LC 67890",
            "project_type": "commercial",
            "description": "Interested in office renovation",
            "source": "website",
            "estimated_budget": 75000.0,
            "notes": "Called on Monday, very interested"
        }
        
        success, lead = self.run_test("Create Lead", "POST", "leads", 200, lead_data)
        if not success:
            return False
        
        lead_id = lead.get('id')
        if lead_id:
            self.created_items['leads'].append(lead_id)
        
        # Test GET single lead
        if lead_id:
            success, _ = self.run_test("Get Single Lead", "GET", f"leads/{lead_id}", 200)
            if not success:
                return False
        
        # Test UPDATE lead
        if lead_id:
            update_data = lead_data.copy()
            update_data["status"] = "contacted"
            update_data["notes"] = "Follow-up scheduled for next week"
            success, _ = self.run_test("Update Lead", "PUT", f"leads/{lead_id}", 200, update_data)
            if not success:
                return False
        
        return True

    def test_materials_crud(self):
        """Test Materials CRUD operations"""
        print("\n" + "="*50)
        print("TESTING MATERIALS CRUD")
        print("="*50)
        
        # Test GET all materials
        success, materials = self.run_test("Get All Materials", "GET", "materials", 200)
        if not success:
            return False
        
        # Test CREATE material
        material_data = {
            "name": "Premium Hardwood Flooring",
            "category": "Flooring",
            "unit": "sq ft",
            "cost_per_unit": 12.50,
            "supplier": "Test Lumber Co.",
            "description": "High-quality oak hardwood flooring"
        }
        
        success, material = self.run_test("Create Material", "POST", "materials", 200, material_data)
        if not success:
            return False
        
        material_id = material.get('id')
        if material_id:
            self.created_items['materials'].append(material_id)
        
        # Test GET single material
        if material_id:
            success, _ = self.run_test("Get Single Material", "GET", f"materials/{material_id}", 200)
            if not success:
                return False
        
        # Test UPDATE material
        if material_id:
            update_data = material_data.copy()
            update_data["cost_per_unit"] = 13.75
            update_data["supplier"] = "Updated Lumber Co."
            success, _ = self.run_test("Update Material", "PUT", f"materials/{material_id}", 200, update_data)
            if not success:
                return False
        
        return True

    def test_estimates_crud(self):
        """Test Estimates CRUD operations"""
        print("\n" + "="*50)
        print("TESTING ESTIMATES CRUD")
        print("="*50)
        
        # Test GET all estimates
        success, estimates = self.run_test("Get All Estimates", "GET", "estimates", 200)
        if not success:
            return False
        
        # Need a project_id for estimate
        project_id = self.created_items['projects'][0] if self.created_items['projects'] else "test-project-id"
        
        # Test CREATE estimate
        estimate_data = {
            "project_id": project_id,
            "description": "Kitchen renovation estimate",
            "materials_cost": 15000.0,
            "labor_cost": 8000.0,
            "overhead_cost": 2000.0,
            "profit_margin": 3000.0,
            "line_items": [
                {"item": "Cabinets", "quantity": 10, "unit_cost": 500.0, "total": 5000.0},
                {"item": "Countertops", "quantity": 25, "unit_cost": 80.0, "total": 2000.0}
            ]
        }
        
        success, estimate = self.run_test("Create Estimate", "POST", "estimates", 200, estimate_data)
        if not success:
            return False
        
        estimate_id = estimate.get('id')
        if estimate_id:
            self.created_items['estimates'].append(estimate_id)
        
        # Test GET single estimate
        if estimate_id:
            success, _ = self.run_test("Get Single Estimate", "GET", f"estimates/{estimate_id}", 200)
            if not success:
                return False
        
        # Test UPDATE estimate
        if estimate_id:
            update_data = estimate_data.copy()
            update_data["materials_cost"] = 16000.0
            update_data["profit_margin"] = 3500.0
            success, _ = self.run_test("Update Estimate", "PUT", f"estimates/{estimate_id}", 200, update_data)
            if not success:
                return False
        
        return True

    def test_proposals_crud(self):
        """Test Proposals CRUD operations"""
        print("\n" + "="*50)
        print("TESTING PROPOSALS CRUD")
        print("="*50)
        
        # Test GET all proposals
        success, proposals = self.run_test("Get All Proposals", "GET", "proposals", 200)
        if not success:
            return False
        
        # Need an estimate_id for proposal
        estimate_id = self.created_items['estimates'][0] if self.created_items['estimates'] else "test-estimate-id"
        
        # Test CREATE proposal
        proposal_data = {
            "estimate_id": estimate_id,
            "title": "Kitchen Renovation Proposal",
            "content": "We propose to renovate your kitchen with high-quality materials and professional craftsmanship.",
            "terms": "50% deposit required, balance due upon completion. 1-year warranty included.",
            "valid_until": (datetime.now() + timedelta(days=30)).isoformat()
        }
        
        success, proposal = self.run_test("Create Proposal", "POST", "proposals", 200, proposal_data)
        if not success:
            return False
        
        proposal_id = proposal.get('id')
        if proposal_id:
            self.created_items['proposals'].append(proposal_id)
        
        # Test GET single proposal
        if proposal_id:
            success, _ = self.run_test("Get Single Proposal", "GET", f"proposals/{proposal_id}", 200)
            if not success:
                return False
        
        # Test UPDATE proposal
        if proposal_id:
            update_data = proposal_data.copy()
            update_data["title"] = "Updated Kitchen Renovation Proposal"
            update_data["content"] = "Updated proposal content with additional details."
            success, _ = self.run_test("Update Proposal", "PUT", f"proposals/{proposal_id}", 200, update_data)
            if not success:
                return False
        
        return True

    def test_error_handling(self):
        """Test error handling for invalid requests"""
        print("\n" + "="*50)
        print("TESTING ERROR HANDLING")
        print("="*50)
        
        # Test 404 for non-existent resources
        success, _ = self.run_test("Get Non-existent Project", "GET", "projects/non-existent-id", 404)
        if not success:
            return False
        
        success, _ = self.run_test("Get Non-existent Lead", "GET", "leads/non-existent-id", 404)
        if not success:
            return False
        
        # Test invalid data (missing required fields)
        invalid_project = {"name": "Test"}  # Missing required fields
        success, _ = self.run_test("Create Invalid Project", "POST", "projects", 422, invalid_project)
        if not success:
            return False
        
        return True

    def cleanup_test_data(self):
        """Clean up created test data"""
        print("\n" + "="*50)
        print("CLEANING UP TEST DATA")
        print("="*50)
        
        # Delete in reverse order due to dependencies
        for proposal_id in self.created_items['proposals']:
            self.run_test(f"Delete Proposal {proposal_id}", "DELETE", f"proposals/{proposal_id}", 200)
        
        for estimate_id in self.created_items['estimates']:
            self.run_test(f"Delete Estimate {estimate_id}", "DELETE", f"estimates/{estimate_id}", 200)
        
        for material_id in self.created_items['materials']:
            self.run_test(f"Delete Material {material_id}", "DELETE", f"materials/{material_id}", 200)
        
        for lead_id in self.created_items['leads']:
            self.run_test(f"Delete Lead {lead_id}", "DELETE", f"leads/{lead_id}", 200)
        
        for project_id in self.created_items['projects']:
            self.run_test(f"Delete Project {project_id}", "DELETE", f"projects/{project_id}", 200)

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Handoff Construction Estimator API Tests")
        print("="*60)
        
        # Test API health
        if not self.test_health_check():
            print("❌ Health check failed, stopping tests")
            return False
        
        # Test all CRUD operations
        test_methods = [
            self.test_projects_crud,
            self.test_leads_crud,
            self.test_materials_crud,
            self.test_estimates_crud,
            self.test_proposals_crud,
            self.test_error_handling
        ]
        
        for test_method in test_methods:
            if not test_method():
                print(f"❌ {test_method.__name__} failed")
                break
        
        # Clean up test data
        self.cleanup_test_data()
        
        # Print final results
        print("\n" + "="*60)
        print("📊 FINAL TEST RESULTS")
        print("="*60)
        print(f"Tests run: {self.tests_run}")
        print(f"Tests passed: {self.tests_passed}")
        print(f"Tests failed: {self.tests_run - self.tests_passed}")
        print(f"Success rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    tester = HandoffAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())