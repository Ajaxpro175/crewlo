import React, { useState, useEffect } from 'react';
import { materialsApi } from '../services/api';

const Materials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    unit: '',
    cost_per_unit: 0,
    supplier: '',
    description: ''
  });

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const response = await materialsApi.getAll();
      setMaterials(response.data);
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMaterial) {
        await materialsApi.update(editingMaterial.id, formData);
      } else {
        await materialsApi.create(formData);
      }
      setShowForm(false);
      setEditingMaterial(null);
      setFormData({
        name: '',
        category: '',
        unit: '',
        cost_per_unit: 0,
        supplier: '',
        description: ''
      });
      fetchMaterials();
    } catch (error) {
      console.error('Error saving material:', error);
    }
  };

  const handleEdit = (material) => {
    setEditingMaterial(material);
    setFormData({
      name: material.name,
      category: material.category,
      unit: material.unit,
      cost_per_unit: material.cost_per_unit,
      supplier: material.supplier || '',
      description: material.description || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (materialId) => {
    if (window.confirm('Are you sure you want to delete this material?')) {
      try {
        await materialsApi.delete(materialId);
        fetchMaterials();
      } catch (error) {
        console.error('Error deleting material:', error);
      }
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'lumber': 'bg-brown-100 text-brown-800',
      'concrete': 'bg-gray-100 text-gray-800',
      'steel': 'bg-blue-100 text-blue-800',
      'plumbing': 'bg-green-100 text-green-800',
      'electrical': 'bg-yellow-100 text-yellow-800',
      'insulation': 'bg-purple-100 text-purple-800',
      'roofing': 'bg-red-100 text-red-800',
      'flooring': 'bg-orange-100 text-orange-800'
    };
    return colors[category.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading materials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Materials</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            + New Material
          </button>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-full overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">
                {editingMaterial ? 'Edit Material' : 'New Material'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  >
                    <option value="">Select a category</option>
                    <option value="lumber">Lumber</option>
                    <option value="concrete">Concrete</option>
                    <option value="steel">Steel</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="electrical">Electrical</option>
                    <option value="insulation">Insulation</option>
                    <option value="roofing">Roofing</option>
                    <option value="flooring">Flooring</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  >
                    <option value="">Select a unit</option>
                    <option value="sq ft">Square Feet</option>
                    <option value="linear ft">Linear Feet</option>
                    <option value="each">Each</option>
                    <option value="lb">Pounds</option>
                    <option value="yard">Yard</option>
                    <option value="ton">Ton</option>
                    <option value="gallon">Gallon</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cost per Unit
                  </label>
                  <input
                    type="number"
                    value={formData.cost_per_unit}
                    onChange={(e) => setFormData({...formData, cost_per_unit: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supplier
                  </label>
                  <input
                    type="text"
                    value={formData.supplier}
                    onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    rows="3"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-md transition-colors"
                  >
                    {editingMaterial ? 'Update' : 'Create'} Material
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingMaterial(null);
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
          {materials.map((material) => (
            <div key={material.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{material.name}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(material.category)}`}>
                  {material.category}
                </span>
              </div>
              <p className="text-gray-600 mb-2">{material.description}</p>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Unit:</span>
                  <span>{material.unit}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Cost per unit:</span>
                  <span>${material.cost_per_unit.toFixed(2)}</span>
                </div>
                {material.supplier && (
                  <div className="flex justify-between text-sm">
                    <span>Supplier:</span>
                    <span>{material.supplier}</span>
                  </div>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(material)}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 px-3 rounded text-sm transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(material.id)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded text-sm transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {materials.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No materials found</p>
            <p className="text-gray-400 mt-2">Add your first material to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Materials;