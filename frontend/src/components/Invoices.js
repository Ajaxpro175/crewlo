import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { projectsApi, leadsApi } from '../services/api';

const Invoices = () => {
  const [searchParams] = useSearchParams();
  const [invoices, setInvoices] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [formData, setFormData] = useState({
    project_id: '',
    client_name: '',
    client_email: '',
    invoice_number: '',
    description: '',
    amount: 0,
    tax_rate: 0,
    due_date: '',
    items: [{ description: '', quantity: 1, rate: 0, amount: 0 }]
  });

  useEffect(() => {
    fetchData();
    // Check if we should open the form automatically
    if (searchParams.get('action') === 'new') {
      setShowForm(true);
    }
  }, [searchParams]);

  // Mock invoices data (since we don't have backend for invoices yet)
  useEffect(() => {
    setInvoices([
      {
        id: '1',
        invoice_number: 'INV-001',
        project_id: 'proj-1',
        client_name: 'John Smith',
        client_email: 'john@example.com',
        description: 'Kitchen Renovation - Final Payment',
        amount: 15000,
        tax_rate: 8.5,
        total_amount: 16275,
        status: 'sent',
        due_date: '2025-08-15',
        created_at: '2025-07-14',
        items: [
          { description: 'Labor - Kitchen Installation', quantity: 1, rate: 8000, amount: 8000 },
          { description: 'Materials - Premium Cabinets', quantity: 1, rate: 5000, amount: 5000 },
          { description: 'Finishing Work', quantity: 1, rate: 2000, amount: 2000 }
        ]
      }
    ]);
    setLoading(false);
  }, []);

  const fetchData = async () => {
    try {
      const projectsRes = await projectsApi.getAll();
      setProjects(projectsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, rate: 0, amount: 0 }]
    });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Calculate amount for this item
    if (field === 'quantity' || field === 'rate') {
      newItems[index].amount = newItems[index].quantity * newItems[index].rate;
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateTax = () => {
    return (calculateSubtotal() * formData.tax_rate) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const invoiceData = {
      ...formData,
      invoice_number: formData.invoice_number || `INV-${Date.now()}`,
      amount: calculateSubtotal(),
      total_amount: calculateTotal(),
      status: 'draft',
      created_at: new Date().toISOString()
    };

    // For now, just add to local state (would normally save to backend)
    if (editingInvoice) {
      setInvoices(invoices.map(inv => inv.id === editingInvoice.id ? { ...invoiceData, id: editingInvoice.id } : inv));
    } else {
      setInvoices([...invoices, { ...invoiceData, id: Date.now().toString() }]);
    }

    setShowForm(false);
    setEditingInvoice(null);
    setFormData({
      project_id: '',
      client_name: '',
      client_email: '',
      invoice_number: '',
      description: '',
      amount: 0,
      tax_rate: 0,
      due_date: '',
      items: [{ description: '', quantity: 1, rate: 0, amount: 0 }]
    });
  };

  const handleEdit = (invoice) => {
    setEditingInvoice(invoice);
    setFormData(invoice);
    setShowForm(true);
  };

  const handleDelete = (invoiceId) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      setInvoices(invoices.filter(inv => inv.id !== invoiceId));
    }
  };

  const handleShare = (invoice) => {
    setSelectedInvoice(invoice);
    setShowShareModal(true);
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Invoice ${selectedInvoice.invoice_number}`);
    const body = encodeURIComponent(`
Dear ${selectedInvoice.client_name},

Please find your invoice details below:

Invoice Number: ${selectedInvoice.invoice_number}
Description: ${selectedInvoice.description}
Amount: $${selectedInvoice.amount.toLocaleString()}
Tax (${selectedInvoice.tax_rate}%): $${((selectedInvoice.amount * selectedInvoice.tax_rate) / 100).toFixed(2)}
Total: $${selectedInvoice.total_amount.toLocaleString()}
Due Date: ${new Date(selectedInvoice.due_date).toLocaleDateString()}

Items:
${selectedInvoice.items.map(item => `- ${item.description}: ${item.quantity} x $${item.rate} = $${item.amount}`).join('\n')}

Thank you for your business!

Best regards,
Crewlo Team
    `);
    
    window.location.href = `mailto:${selectedInvoice.client_email}?subject=${subject}&body=${body}`;
    setShowShareModal(false);
  };

  const shareViaSMS = () => {
    const message = encodeURIComponent(`Invoice ${selectedInvoice.invoice_number} for $${selectedInvoice.total_amount.toLocaleString()} is ready. Due: ${new Date(selectedInvoice.due_date).toLocaleDateString()}. Check your email for details.`);
    window.location.href = `sms:?body=${message}`;
    setShowShareModal(false);
  };

  const copyToClipboard = () => {
    const invoiceText = `
Invoice: ${selectedInvoice.invoice_number}
Client: ${selectedInvoice.client_name}
Description: ${selectedInvoice.description}
Amount: $${selectedInvoice.amount.toLocaleString()}
Tax (${selectedInvoice.tax_rate}%): $${((selectedInvoice.amount * selectedInvoice.tax_rate) / 100).toFixed(2)}
Total: $${selectedInvoice.total_amount.toLocaleString()}
Due Date: ${new Date(selectedInvoice.due_date).toLocaleDateString()}

Items:
${selectedInvoice.items.map(item => `- ${item.description}: ${item.quantity} x $${item.rate} = $${item.amount}`).join('\n')}
    `;
    
    navigator.clipboard.writeText(invoiceText).then(() => {
      alert('Invoice copied to clipboard!');
      setShowShareModal(false);
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invoices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            + New Invoice
          </button>
        </div>

        {/* Share Modal */}
        {showShareModal && selectedInvoice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 1000 }}>
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Share Invoice</h2>
              <p className="text-gray-600 mb-6">How would you like to share invoice "{selectedInvoice.invoice_number}"?</p>
              
              <div className="space-y-3">
                <button
                  onClick={shareViaEmail}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  📧 Send via Email
                </button>
                <button
                  onClick={shareViaSMS}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  💬 Send via SMS
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
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">
                {editingInvoice ? 'Edit Invoice' : 'New Invoice'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Invoice Number
                    </label>
                    <input
                      type="text"
                      value={formData.invoice_number}
                      onChange={(e) => setFormData({...formData, invoice_number: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="INV-001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client Name
                    </label>
                    <input
                      type="text"
                      value={formData.client_name}
                      onChange={(e) => setFormData({...formData, client_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client Email
                    </label>
                    <input
                      type="email"
                      value={formData.client_email}
                      onChange={(e) => setFormData({...formData, client_email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Project description"
                    required
                  />
                </div>

                {/* Invoice Items */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Invoice Items
                    </label>
                    <button
                      type="button"
                      onClick={addItem}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      + Add Item
                    </button>
                  </div>
                  
                  {formData.items.map((item, index) => (
                    <div key={index} className="border rounded-lg p-3 mb-3">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                        <div className="md:col-span-2">
                          <input
                            type="text"
                            placeholder="Item description"
                            value={item.description}
                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            placeholder="Qty"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                        <div className="flex space-x-1">
                          <input
                            type="number"
                            placeholder="Rate"
                            value={item.rate}
                            onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                      <div className="text-right mt-1 text-sm text-gray-600">
                        Amount: ${item.amount.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    value={formData.tax_rate}
                    onChange={(e) => setFormData({...formData, tax_rate: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    min="0"
                    step="0.1"
                  />
                </div>

                {/* Invoice Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${calculateSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax ({formData.tax_rate}%):</span>
                      <span>${calculateTax().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded-md transition-colors"
                  >
                    {editingInvoice ? 'Update' : 'Create'} Invoice
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingInvoice(null);
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
          {invoices.map((invoice) => (
            <div key={invoice.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{invoice.invoice_number}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(invoice.status)}`}>
                  {invoice.status}
                </span>
              </div>
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600">Client: {invoice.client_name}</p>
                <p className="text-sm text-gray-600">{invoice.description}</p>
                <div className="text-lg font-bold text-gray-900">
                  ${invoice.total_amount.toLocaleString()}
                </div>
                <p className="text-sm text-gray-500">
                  Due: {new Date(invoice.due_date).toLocaleDateString()}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(invoice)}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-3 rounded text-sm transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleShare(invoice)}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded text-sm transition-colors"
                  >
                    Send
                  </button>
                </div>
                <button
                  onClick={() => handleDelete(invoice.id)}
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded text-sm transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {invoices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No invoices found</p>
            <p className="text-gray-400 mt-2">Create your first invoice to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Invoices;