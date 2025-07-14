import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { proposalsApi, estimatesApi } from '../services/api';

const Proposals = () => {
  const [searchParams] = useSearchParams();
  const [proposals, setProposals] = useState([]);
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProposal, setEditingProposal] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [formData, setFormData] = useState({
    estimate_id: '',
    title: '',
    content: '',
    terms: '',
    valid_until: ''
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
      const [proposalsRes, estimatesRes] = await Promise.all([
        proposalsApi.getAll(),
        estimatesApi.getAll()
      ]);
      setProposals(proposalsRes.data);
      setEstimates(estimatesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProposal) {
        await proposalsApi.update(editingProposal.id, formData);
      } else {
        await proposalsApi.create(formData);
      }
      setShowForm(false);
      setEditingProposal(null);
      setFormData({
        estimate_id: '',
        title: '',
        content: '',
        terms: '',
        valid_until: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error saving proposal:', error);
    }
  };

  const handleEdit = (proposal) => {
    setEditingProposal(proposal);
    setFormData({
      estimate_id: proposal.estimate_id,
      title: proposal.title,
      content: proposal.content,
      terms: proposal.terms,
      valid_until: proposal.valid_until ? proposal.valid_until.split('T')[0] : ''
    });
    setShowForm(true);
  };

  const handleDelete = async (proposalId) => {
    if (window.confirm('Are you sure you want to delete this proposal?')) {
      try {
        await proposalsApi.delete(proposalId);
        fetchData();
      } catch (error) {
        console.error('Error deleting proposal:', error);
      }
    }
  };

  const handleShare = (proposal) => {
    setSelectedProposal(proposal);
    setShowShareModal(true);
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Proposal: ${selectedProposal.title}`);
    const body = encodeURIComponent(`
Hi,

Please find attached the proposal: ${selectedProposal.title}

${selectedProposal.content}

Terms: ${selectedProposal.terms}

Valid until: ${selectedProposal.valid_until ? new Date(selectedProposal.valid_until).toLocaleDateString() : 'N/A'}

Best regards,
Crewlo Team
    `);
    
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setShowShareModal(false);
  };

  const shareViaSMS = () => {
    const message = encodeURIComponent(`Proposal: ${selectedProposal.title} - ${selectedProposal.content.substring(0, 100)}... View full proposal for details.`);
    window.location.href = `sms:?body=${message}`;
    setShowShareModal(false);
  };

  const copyToClipboard = () => {
    const proposalText = `
Proposal: ${selectedProposal.title}

${selectedProposal.content}

Terms: ${selectedProposal.terms}

Valid until: ${selectedProposal.valid_until ? new Date(selectedProposal.valid_until).toLocaleDateString() : 'N/A'}
    `;
    
    navigator.clipboard.writeText(proposalText).then(() => {
      alert('Proposal copied to clipboard!');
      setShowShareModal(false);
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'viewed': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstimateInfo = (estimateId) => {
    const estimate = estimates.find(e => e.id === estimateId);
    return estimate ? `$${estimate.total_cost.toLocaleString()}` : 'Unknown Estimate';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading proposals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Proposals</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            + New Proposal
          </button>
        </div>

        {/* Share Modal */}
        {showShareModal && selectedProposal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 1000 }}>
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Share Proposal</h2>
              <p className="text-gray-600 mb-6">How would you like to share "{selectedProposal.title}"?</p>
              
              <div className="space-y-3">
                <button
                  onClick={shareViaEmail}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  📧 Share via Email
                </button>
                <button
                  onClick={shareViaSMS}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  💬 Share via SMS
                </button>
                <button
                  onClick={copyToClipboard}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  📋 Copy to Clipboard
                </button>
              </div>
              
              <button
                onClick={() => setShowShareModal(false)}
                className="w-full mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 1000 }}>
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">
                {editingProposal ? 'Edit Proposal' : 'New Proposal'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimate
                  </label>
                  <select
                    value={formData.estimate_id}
                    onChange={(e) => setFormData({...formData, estimate_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Select an estimate</option>
                    {estimates.map((estimate) => (
                      <option key={estimate.id} value={estimate.id}>
                        {estimate.description} - ${estimate.total_cost.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Construction Proposal"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows="6"
                    placeholder="Detailed proposal content..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Terms & Conditions
                  </label>
                  <textarea
                    value={formData.terms}
                    onChange={(e) => setFormData({...formData, terms: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows="4"
                    placeholder="Payment terms, timeline, etc."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valid Until
                  </label>
                  <input
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({...formData, valid_until: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-md transition-colors"
                  >
                    {editingProposal ? 'Update' : 'Create'} Proposal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingProposal(null);
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
          {proposals.map((proposal) => (
            <div key={proposal.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{proposal.title}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(proposal.status)}`}>
                  {proposal.status}
                </span>
              </div>
              <p className="text-gray-600 mb-4 text-sm line-clamp-3">{proposal.content}</p>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Estimate Value:</span>
                  <span className="font-semibold">{getEstimateInfo(proposal.estimate_id)}</span>
                </div>
                {proposal.valid_until && (
                  <div className="flex justify-between text-sm">
                    <span>Valid Until:</span>
                    <span>{new Date(proposal.valid_until).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(proposal)}
                    className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-3 rounded text-sm transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleShare(proposal)}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded text-sm transition-colors"
                  >
                    Share
                  </button>
                </div>
                <button
                  onClick={() => handleDelete(proposal.id)}
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded text-sm transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {proposals.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No proposals found</p>
            <p className="text-gray-400 mt-2">Create your first proposal to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Proposals;