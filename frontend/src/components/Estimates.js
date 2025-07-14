import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { estimatesApi, projectsApi } from '../services/api';

const Estimates = () => {
  const [searchParams] = useSearchParams();
  const [estimates, setEstimates] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEstimate, setEditingEstimate] = useState(null);
  const [formData, setFormData] = useState({
    project_id: '',
    description: '',
    materials_cost: 0,
    labor_cost: 0,
    overhead_cost: 0,
    profit_margin: 0,
    line_items: []
  });

  useEffect(() => {
    fetchData();
    // Check if we should open the form automatically
    if (searchParams.get('action') === 'new') {
      setShowForm(true);
    }
  }, [searchParams]);

  const fetchData = async () => {
    try {
      const [estimatesRes, projectsRes] = await Promise.all([
        estimatesApi.getAll(),
        projectsApi.getAll()
      ]);
      setEstimates(estimatesRes.data);
      setProjects(projectsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEstimate) {
        await estimatesApi.update(editingEstimate.id, formData);
      } else {
        await estimatesApi.create(formData);
      }
      setShowForm(false);
      setEditingEstimate(null);
      setFormData({
        project_id: '',
        description: '',
        materials_cost: 0,
        labor_cost: 0,
        overhead_cost: 0,
        profit_margin: 0,
        line_items: []
      });
      fetchData();
    } catch (error) {
      console.error('Error saving estimate:', error);
    }
  };

  const handleEdit = (estimate) => {
    setEditingEstimate(estimate);
    setFormData({
      project_id: estimate.project_id,
      description: estimate.description,
      materials_cost: estimate.materials_cost,
      labor_cost: estimate.labor_cost,
      overhead_cost: estimate.overhead_cost,
      profit_margin: estimate.profit_margin,
      line_items: estimate.line_items
    });
    setShowForm(true);
  };

  const handleDelete = async (estimateId) => {
    if (window.confirm('Are you sure you want to delete this estimate?')) {
      try {
        await estimatesApi.delete(estimateId);
        fetchData();
      } catch (error) {
        console.error('Error deleting estimate:', error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : 'Unknown Project';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading estimates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Estimates</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            + New Estimate
          </button>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 1000 }}>
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">
                {editingEstimate ? 'Edit Estimate' : 'New Estimate'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project
                  </label>
                  <select
                    value={formData.project_id}
                    onChange={(e) => setFormData({...formData, project_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    <option value="">Select a project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows="3"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Materials Cost
                  </label>
                  <input
                    type="number"
                    value={formData.materials_cost}
                    onChange={(e) => setFormData({...formData, materials_cost: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Labor Cost
                  </label>
                  <input
                    type="number"
                    value={formData.labor_cost}
                    onChange={(e) => setFormData({...formData, labor_cost: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Overhead Cost
                  </label>
                  <input
                    type="number"
                    value={formData.overhead_cost}
                    onChange={(e) => setFormData({...formData, overhead_cost: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Profit Margin
                  </label>
                  <input
                    type="number"
                    value={formData.profit_margin}
                    onChange={(e) => setFormData({...formData, profit_margin: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm font-medium text-gray-700">
                    Total Cost: ${(formData.materials_cost + formData.labor_cost + formData.overhead_cost + formData.profit_margin).toLocaleString()}
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-md transition-colors"
                  >
                    {editingEstimate ? 'Update' : 'Create'} Estimate
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingEstimate(null);
                    }}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {estimates.map((estimate) => (
            <div key={estimate.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{getProjectName(estimate.project_id)}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(estimate.status)}`}>
                  {estimate.status}
                </span>
              </div>
              <p className="text-gray-600 mb-4">{estimate.description}</p>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Materials:</span>
                  <span>${estimate.materials_cost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Labor:</span>
                  <span>${estimate.labor_cost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Overhead:</span>
                  <span>${estimate.overhead_cost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Profit:</span>
                  <span>${estimate.profit_margin.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>${estimate.total_cost.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(estimate)}
                  className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 px-3 rounded text-sm transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(estimate.id)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded text-sm transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {estimates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No estimates found</p>
            <p className="text-gray-400 mt-2">Create your first estimate to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Estimates;