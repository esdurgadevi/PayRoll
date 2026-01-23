import React, { useState, useEffect, useRef } from 'react';
import issueService from '../../services/issueService';
import mixingGroupService from '../../services/mixingGroupService';
import mixingService from '../../services/mixingService';
import inwardEntryService from '../../services/inwardEntryService';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  X,
  Hash,
  Calendar,
  Package,
  Layers,
  Filter,
  Box,
  Scale,
  FileText,
  Check,
  XCircle,
  ChevronDown,
  ArrowRight,
  List,
  CheckSquare,
  Square,
  ShoppingBag,
  Loader2,
  ClipboardCheck,
  ClipboardList,
  Package2,
  Tag
} from 'lucide-react';

const IssueEntryManagement = () => {
  // States
  const [issues, setIssues] = useState([]);
  const [mixingGroups, setMixingGroups] = useState([]);
  const [mixings, setMixings] = useState([]);
  const [availableBales, setAvailableBales] = useState([]);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [mixingGroupLoading, setMixingGroupLoading] = useState(false);
  const [mixingLoading, setMixingLoading] = useState(false);
  const [balesLoading, setBalesLoading] = useState(false);
  const [issueNoLoading, setIssueNoLoading] = useState(false);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingIssue, setEditingIssue] = useState(null);
  const [viewingIssue, setViewingIssue] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    issueNo: '',
    issueDate: new Date().toISOString().split('T')[0],
    mixingNo: '',
    mixingGroupId: '',
    mixingGroupName: '',
    mixingId: '',
    mixingName: '',
    lotNo: '',
    issueQty: '',
    
    // Bale selection
    selectedBales: [], // Array of selected bales for issue
    availableBales: [], // Available bales for the lot
    
    // Total calculations
    totalBales: 0,
    totalWeight: 0,
    totalValue: 0
  });

  // Filter states
  const [showMixingGroupDropdown, setShowMixingGroupDropdown] = useState(false);
  const [showMixingDropdown, setShowMixingDropdown] = useState(false);
  const [mixingGroupSearch, setMixingGroupSearch] = useState('');
  const [mixingSearch, setMixingSearch] = useState('');
  
  // Refs
  const mixingGroupRef = useRef(null);
  const mixingRef = useRef(null);

  // Load all data on component mount
  useEffect(() => {
    fetchIssues();
    fetchMixingGroups();
    fetchMixings();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mixingGroupRef.current && !mixingGroupRef.current.contains(event.target)) {
        setShowMixingGroupDropdown(false);
      }
      if (mixingRef.current && !mixingRef.current.contains(event.target)) {
        setShowMixingDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch functions
  const fetchIssues = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await issueService.getAll();
      const issuesData = Array.isArray(response) ? response : [];
      setIssues(issuesData);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to load issues');
      setIssues([]);
      setLoading(false);
    }
  };

  const fetchMixingGroups = async () => {
    setMixingGroupLoading(true);
    try {
      const response = await mixingGroupService.getAll();
      const groupsData = Array.isArray(response) ? response : [];
      setMixingGroups(groupsData);
    } catch (err) {
      console.error('Failed to load mixing groups:', err);
    } finally {
      setMixingGroupLoading(false);
    }
  };

  const fetchMixings = async () => {
    setMixingLoading(true);
    try {
      const response = await mixingService.getAll();
      const mixingsData = Array.isArray(response) ? response : [];
      setMixings(mixingsData);
    } catch (err) {
      console.error('Failed to load mixings:', err);
    } finally {
      setMixingLoading(false);
    }
  };

  const fetchAvailableBales = async (lotNo) => {
    if (!lotNo) return;
    
    setBalesLoading(true);
    try {
      const response = await issueService.getLotWeightments(lotNo);
      const balesData = Array.isArray(response) ? response : [];
      setAvailableBales(balesData);
      
      // Update form data with available bales
      setFormData(prev => ({
        ...prev,
        availableBales: balesData
      }));
    } catch (err) {
      console.error('Failed to load available bales:', err);
      setAvailableBales([]);
    } finally {
      setBalesLoading(false);
    }
  };

  // Fetch next issue number
  const fetchNextIssueNumber = async () => {
    try {
      setIssueNoLoading(true);
      const response = await issueService.getNextIssueNo();
      
      setFormData(prev => ({
        ...prev,
        issueNo: response || ''
      }));
      
    } catch (err) {
      console.error('Error fetching next issue number:', err);
      const currentYear = new Date().getFullYear().toString().slice(-2);
      const nextYear = (parseInt(currentYear) + 1).toString().padStart(2, '0');
      const defaultIssueNo = `ISSUE/${currentYear}-${nextYear}/0001`;
      
      setFormData(prev => ({
        ...prev,
        issueNo: defaultIssueNo
      }));
      
      setError('Could not fetch next issue number. Using default pattern.');
    } finally {
      setIssueNoLoading(false);
    }
  };

  // Filter mixing groups
  const filteredMixingGroups = mixingGroups.filter(group => {
    if (!mixingGroupSearch.trim()) return mixingGroups;
    const searchLower = mixingGroupSearch.toLowerCase();
    return (
      (group.mixingName && group.mixingName.toLowerCase().includes(searchLower)) ||
      (group.mixingCode && group.mixingCode.toString().includes(searchLower)) ||
      (group.code && group.code.toString().includes(searchLower))
    );
  });

  // Filter mixings
  const filteredMixings = mixings.filter(mixing => {
    if (!mixingSearch.trim()) return mixings;
    const searchLower = mixingSearch.toLowerCase();
    return (
      (mixing.mixingNo && mixing.mixingNo.toLowerCase().includes(searchLower)) ||
      (mixing.code && mixing.code.toString().includes(searchLower))
    );
  });

  // Filter issues based on search
  const filteredIssues = (() => {
    const issuesArray = Array.isArray(issues) ? issues : [];
    
    return issuesArray.filter(issue => {
      if (!issue || typeof issue !== 'object') return false;
      
      const issueNo = issue.issueNo || '';
      const mixingGroupName = issue.mixingGroupName || '';
      const mixingNo = issue.mixingNo || '';
      const lotNo = issue.lotNo || '';
      
      return searchTerm === '' || 
        issueNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mixingGroupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mixingNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lotNo.toLowerCase().includes(searchTerm.toLowerCase());
    });
  })();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Prevent issueNo changes when creating new issue (editingIssue is null)
    if (name === 'issueNo' && !editingIssue) {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'issueQty' || name === 'mixingNo'
        ? (value === '' ? '' : parseFloat(value) || '')
        : value
    }));
  };

  // Handle lot number change - fetch available bales
  const handleLotNoChange = async (e) => {
    const lotNo = e.target.value;
    setFormData(prev => ({
      ...prev,
      lotNo,
      selectedBales: [] // Clear selected bales when lot changes
    }));
    
    if (lotNo) {
      await fetchAvailableBales(lotNo);
    }
  };

  // Handle bale selection
  const handleBaleSelect = (bale) => {
    setFormData(prev => {
      const isSelected = prev.selectedBales.some(selected => selected.baleNo === bale.baleNo);
      
      if (isSelected) {
        // Remove bale from selection
        const updatedSelectedBales = prev.selectedBales.filter(
          selected => selected.baleNo !== bale.baleNo
        );
        
        return {
          ...prev,
          selectedBales: updatedSelectedBales,
          issueQty: updatedSelectedBales.length.toString(),
          totalBales: updatedSelectedBales.length,
          totalWeight: updatedSelectedBales.reduce((sum, b) => sum + (b.baleWeight || 0), 0),
          totalValue: updatedSelectedBales.reduce((sum, b) => sum + (b.baleValue || 0), 0)
        };
      } else {
        // Add bale to selection
        const updatedSelectedBales = [...prev.selectedBales, {
          baleNo: bale.baleNo,
          baleWeight: bale.baleWeight || 0,
          baleValue: bale.baleValue || 0,
          grossWeight: bale.grossWeight || 0
        }];
        
        return {
          ...prev,
          selectedBales: updatedSelectedBales,
          issueQty: updatedSelectedBales.length.toString(),
          totalBales: updatedSelectedBales.length,
          totalWeight: updatedSelectedBales.reduce((sum, b) => sum + (b.baleWeight || 0), 0),
          totalValue: updatedSelectedBales.reduce((sum, b) => sum + (b.baleValue || 0), 0)
        };
      }
    });
  };

  // Handle mixing group selection
  const handleMixingGroupSelect = (group) => {
    setFormData(prev => ({
      ...prev,
      mixingGroupId: group.id,
      mixingGroupName: group.mixingName
    }));
    setMixingGroupSearch(group.mixingName);
    setShowMixingGroupDropdown(false);
  };

  // Handle mixing selection
  const handleMixingSelect = (mixing) => {
    setFormData(prev => ({
      ...prev,
      mixingId: mixing.id,
      mixingName: mixing.mixingNo || mixing.mixingName,
      mixingNo: mixing.mixingNo || ''
    }));
    setMixingSearch(mixing.mixingNo || mixing.mixingName);
    setShowMixingDropdown(false);
  };

  // Clear selections
  const clearMixingGroupSelection = () => {
    setFormData(prev => ({
      ...prev,
      mixingGroupId: '',
      mixingGroupName: ''
    }));
    setMixingGroupSearch('');
    setShowMixingGroupDropdown(false);
  };

  const clearMixingSelection = () => {
    setFormData(prev => ({
      ...prev,
      mixingId: '',
      mixingName: '',
      mixingNo: ''
    }));
    setMixingSearch('');
    setShowMixingDropdown(false);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.issueDate) {
      setError('Issue date is required');
      return;
    }

    if (!formData.mixingGroupId) {
      setError('Please select a mixing group');
      return;
    }

    if (!formData.mixingId) {
      setError('Please select a mixing');
      return;
    }

    if (!formData.lotNo) {
      setError('Please enter a lot number');
      return;
    }

    if (!formData.selectedBales || formData.selectedBales.length === 0) {
      setError('Please select at least one bale to issue');
      return;
    }

    try {
      // Prepare payload according to service structure
      const payload = {
        issueNo: formData.issueNo.trim(),
        issueDate: formData.issueDate,
        mixingGroupId: parseInt(formData.mixingGroupId, 10),
        mixingId: parseInt(formData.mixingId, 10),
        lotNo: formData.lotNo,
        issuedBales: formData.selectedBales.map(bale => ({
          baleNo: bale.baleNo,
          baleWeight: parseFloat(bale.baleWeight),
          baleValue: bale.baleValue ? parseFloat(bale.baleValue) : null
        }))
      };
      
      if (editingIssue) {
        // Update existing issue
        await issueService.update(editingIssue.id, payload);
        setSuccess('Issue updated successfully!');
      } else {
        // Create new issue
        await issueService.create(payload);
        setSuccess('Issue created successfully!');
      }
      
      // Refresh issues list
      fetchIssues();
      
      // Reset form and close modal
      resetForm();
      setShowModal(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      let errorMsg = 'Operation failed';
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setError(`Failed to save issue: ${errorMsg}`);
    }
  };

  const handleEdit = async (issue) => {
    if (!issue || !issue.id) {
      setError('Invalid issue data');
      return;
    }
    
    setEditingIssue(issue);
    
    // Set basic form data
    const basicFormData = {
      issueNo: issue.issueNo || '',
      issueDate: issue.issueDate || new Date().toISOString().split('T')[0],
      mixingNo: issue.mixingNo || '',
      mixingGroupId: issue.mixingGroupId || '',
      mixingGroupName: issue.mixingGroupName || '',
      mixingId: issue.mixingId || '',
      mixingName: issue.mixingName || issue.mixingNo || '',
      lotNo: issue.lotNo || '',
      issueQty: issue.issuedBales ? issue.issuedBales.length.toString() : '0',
      selectedBales: issue.issuedBales || [],
      availableBales: [],
      totalBales: issue.issuedBales ? issue.issuedBales.length : 0,
      totalWeight: issue.issuedBales ? 
        issue.issuedBales.reduce((sum, b) => sum + (b.baleWeight || 0), 0) : 0,
      totalValue: issue.issuedBales ? 
        issue.issuedBales.reduce((sum, b) => sum + (b.baleValue || 0), 0) : 0
    };
    
    setFormData(basicFormData);
    setMixingGroupSearch(issue.mixingGroupName || '');
    setMixingSearch(issue.mixingName || issue.mixingNo || '');
    
    // Fetch available bales for this lot
    if (issue.lotNo) {
      await fetchAvailableBales(issue.lotNo);
    }
    
    setShowModal(true);
  };

  const handleView = (issue) => {
    if (!issue || !issue.id) {
      setError('Invalid issue data');
      return;
    }
    
    setViewingIssue(issue);
    setShowViewModal(true);
  };

  const handleDelete = async (id, issueNo) => {
    if (!id || !issueNo) {
      setError('Invalid issue data for deletion');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete issue "${issueNo}"?`)) {
      return;
    }

    try {
      await issueService.delete(id);
      setSuccess('Issue deleted successfully!');
      fetchIssues();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete issue');
    }
  };

  const resetForm = () => {
    setFormData({
      issueNo: '',
      issueDate: new Date().toISOString().split('T')[0],
      mixingNo: '',
      mixingGroupId: '',
      mixingGroupName: '',
      mixingId: '',
      mixingName: '',
      lotNo: '',
      issueQty: '',
      selectedBales: [],
      availableBales: [],
      totalBales: 0,
      totalWeight: 0,
      totalValue: 0
    });
    
    setMixingGroupSearch('');
    setMixingSearch('');
    setAvailableBales([]);
    setShowMixingGroupDropdown(false);
    setShowMixingDropdown(false);
    setEditingIssue(null);
    setViewingIssue(null);
  };

  const openCreateModal = () => {
    resetForm();
    fetchNextIssueNumber();
    setShowModal(true);
  };

  const exportIssues = async () => {
    try {
      const csvContent = "data:text/csv;charset=utf-8," +
        "Issue No,Issue Date,Mixing Group,Mixing No,Lot No,Bales Issued,Total Weight,Total Value,Created Date\n" +
        filteredIssues.map(issue => {
          const balesCount = issue.issuedBales ? issue.issuedBales.length : 0;
          const totalWeight = issue.issuedBales ? 
            issue.issuedBales.reduce((sum, b) => sum + (b.baleWeight || 0), 0) : 0;
          const totalValue = issue.issuedBales ? 
            issue.issuedBales.reduce((sum, b) => sum + (b.baleValue || 0), 0) : 0;
          
          return `"${issue.issueNo}","${issue.issueDate}","${issue.mixingGroupName || ''}","${issue.mixingNo || ''}","${issue.lotNo || ''}","${balesCount}","${totalWeight}","${totalValue}","${issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : 'N/A'}"`;
        }).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `issue-entries-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccess('Issues exported successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to export issues');
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatNumber = (num) => {
    if (!num && num !== 0) return 'N/A';
    return parseFloat(num).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Issue Entry Management</h1>
            <p className="text-gray-600">Add, modify and manage lot-wise issue entries</p>
          </div>
          <button
            onClick={openCreateModal}
            className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Issue
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start">
          <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
          <div className="flex-1">{error}</div>
          <button onClick={() => setError('')} className="ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-start">
          <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
          <div className="flex-1">{success}</div>
          <button onClick={() => setSuccess('')} className="ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search and Actions Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by issue number, mixing group, mixing no, or lot no..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={exportIssues}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            <button
              onClick={() => {
                fetchIssues();
                fetchMixingGroups();
                fetchMixings();
              }}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Issues Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              Issue Entries ({filteredIssues.length})
            </h2>
            <span className="text-sm text-gray-500">
              Showing {filteredIssues.length} of {issues.length} issues
            </span>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading issue entries...</p>
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="p-8 text-center">
            <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No issue entries found</p>
            {searchTerm ? (
              <p className="text-sm text-gray-500">
                Try adjusting your search
              </p>
            ) : (
              <button
                onClick={openCreateModal}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Create your first issue entry
              </button>
            )}
          </div>
        ) : (
          /* Issues Table */
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ISSUE DETAILS
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    MIXING INFO
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    BALE INFO
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CREATED DATE
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredIssues.map((issue) => {
                  const balesCount = issue.issuedBales ? issue.issuedBales.length : 0;
                  const totalWeight = issue.issuedBales ? 
                    issue.issuedBales.reduce((sum, b) => sum + (b.baleWeight || 0), 0) : 0;
                  
                  return (
                    <tr key={issue.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center mr-3">
                            <Hash className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-mono font-semibold text-gray-900">
                              {issue.issueNo}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatDate(issue.issueDate)}
                            </div>
                            <div className="text-xs mt-1">
                              <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                                Lot: {issue.lotNo || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <Layers className="w-4 h-4 text-gray-400 mr-2" />
                            <div className="text-sm font-medium text-gray-900">
                              {issue.mixingGroupName || 'N/A'}
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Tag className="w-4 h-4 text-gray-400 mr-2" />
                            <div className="text-sm text-gray-600">
                              Mixing No: {issue.mixingNo || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <Box className="w-4 h-4 text-gray-400 mr-2" />
                            <div className="text-sm font-medium text-gray-900">
                              {balesCount} bales
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Scale className="w-4 h-4 text-gray-400 mr-2" />
                            <div className="text-sm text-gray-600">
                              Total Weight: {formatNumber(totalWeight)} kg
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {formatDate(issue.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleView(issue)}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </button>
                          <button
                            onClick={() => handleEdit(issue)}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center"
                          >
                            <Edit2 className="w-3 h-3 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(issue.id, issue.issueNo)}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Issue Entry Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  {editingIssue ? 'Edit Issue Entry' : 'Create New Issue Entry'}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column - Basic Information */}
                  <div className="space-y-6">
                    {/* Issue Basic Info */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Issue Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Issue Number */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Issue Number {!editingIssue && '(Auto-generated)'}
                          </label>
                          <div className="relative">
                            <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            {issueNoLoading ? (
                              <div className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                                <Loader2 className="w-4 h-4 animate-spin mr-2 text-gray-400" />
                                <span className="text-gray-500">Generating issue number...</span>
                              </div>
                            ) : (
                              <input
                                type="text"
                                name="issueNo"
                                value={formData.issueNo}
                                onChange={handleInputChange}
                                required
                                readOnly={!editingIssue}
                                className={`w-full pl-10 pr-4 py-2 border ${!editingIssue ? 'bg-gray-100 text-gray-700 cursor-not-allowed' : 'bg-white'} border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                placeholder={editingIssue ? "Edit issue number" : "Auto-generated"}
                              />
                            )}
                          </div>
                          {!editingIssue && formData.issueNo && (
                            <p className="mt-1 text-xs text-green-600">
                              ✓ Issue number will be auto-generated: {formData.issueNo}
                            </p>
                          )}
                        </div>

                        {/* Issue Date */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Issue Date *
                          </label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="date"
                              name="issueDate"
                              value={formData.issueDate}
                              onChange={handleInputChange}
                              required
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>

                        {/* Mixing Number */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mixing No
                          </label>
                          <input
                            type="number"
                            name="mixingNo"
                            value={formData.mixingNo}
                            onChange={handleInputChange}
                            min="0"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter mixing number"
                          />
                        </div>

                        {/* Lot Number */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Lot Number *
                          </label>
                          <input
                            type="text"
                            name="lotNo"
                            value={formData.lotNo}
                            onChange={handleLotNoChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter lot number (e.g., UC/24-25/0429)"
                          />
                        </div>

                        {/* Issue Quantity (Read-only) */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Issue Quantity
                          </label>
                          <input
                            type="number"
                            name="issueQty"
                            value={formData.issueQty}
                            readOnly
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Auto-calculated"
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            Calculated from selected bales
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Mixing Information */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Mixing Information</h4>
                      <div className="space-y-4">
                        {/* Mixing Group Selection */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mixing Group *
                          </label>
                          <div className="relative" ref={mixingGroupRef}>
                            <Layers className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                            <input
                              type="text"
                              value={mixingGroupSearch}
                              onChange={(e) => {
                                setMixingGroupSearch(e.target.value);
                                setShowMixingGroupDropdown(true);
                              }}
                              onFocus={() => setShowMixingGroupDropdown(true)}
                              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Search mixing groups..."
                              required
                            />
                            {formData.mixingGroupId && (
                              <button
                                type="button"
                                onClick={clearMixingGroupSelection}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                            
                            {/* Mixing Group Dropdown */}
                            {showMixingGroupDropdown && (
                              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {mixingGroupLoading ? (
                                  <div className="p-3 text-center text-gray-500">
                                    <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2" />
                                    Loading mixing groups...
                                  </div>
                                ) : filteredMixingGroups.length === 0 ? (
                                  <div className="p-3 text-center text-gray-500">
                                    {mixingGroupSearch ? 'No mixing groups found' : 'No mixing groups available'}
                                  </div>
                                ) : (
                                  filteredMixingGroups.map((group) => (
                                    <div
                                      key={group.id}
                                      onClick={() => handleMixingGroupSelect(group)}
                                      className={`p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                                        formData.mixingGroupId === group.id ? 'bg-blue-50' : ''
                                      }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <div className="font-medium text-gray-900">{group.mixingName}</div>
                                          <div className="text-xs text-gray-500">
                                            Code: #{group.code} | Mixing Code: #{group.mixingCode}
                                          </div>
                                        </div>
                                        {formData.mixingGroupId === group.id && (
                                          <Check className="w-4 h-4 text-blue-600" />
                                        )}
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                          {!formData.mixingGroupId && mixingGroupSearch && (
                            <p className="mt-1 text-xs text-red-500">Please select a mixing group from the list</p>
                          )}
                        </div>

                        {/* Mixing Selection */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            To Mixing *
                          </label>
                          <div className="relative" ref={mixingRef}>
                            <ArrowRight className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                            <input
                              type="text"
                              value={mixingSearch}
                              onChange={(e) => {
                                setMixingSearch(e.target.value);
                                setShowMixingDropdown(true);
                              }}
                              onFocus={() => setShowMixingDropdown(true)}
                              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Search mixings..."
                              required
                            />
                            {formData.mixingId && (
                              <button
                                type="button"
                                onClick={clearMixingSelection}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                            
                            {/* Mixing Dropdown */}
                            {showMixingDropdown && (
                              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {mixingLoading ? (
                                  <div className="p-3 text-center text-gray-500">
                                    <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2" />
                                    Loading mixings...
                                  </div>
                                ) : filteredMixings.length === 0 ? (
                                  <div className="p-3 text-center text-gray-500">
                                    {mixingSearch ? 'No mixings found' : 'No mixings available'}
                                  </div>
                                ) : (
                                  filteredMixings.map((mixing) => (
                                    <div
                                      key={mixing.id}
                                      onClick={() => handleMixingSelect(mixing)}
                                      className={`p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                                        formData.mixingId === mixing.id ? 'bg-blue-50' : ''
                                      }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <div className="font-medium text-gray-900">{mixing.mixingNo || mixing.mixingName}</div>
                                          <div className="text-xs text-gray-500">
                                            Code: #{mixing.code}
                                          </div>
                                        </div>
                                        {formData.mixingId === mixing.id && (
                                          <Check className="w-4 h-4 text-blue-600" />
                                        )}
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                          {!formData.mixingId && mixingSearch && (
                            <p className="mt-1 text-xs text-red-500">Please select a mixing from the list</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Total Summary */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Total Summary</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-sm text-gray-600">Total Bales</div>
                          <div className="text-2xl font-bold text-blue-700">{formData.totalBales}</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-sm text-gray-600">Total Weight</div>
                          <div className="text-2xl font-bold text-green-700">
                            {formatNumber(formData.totalWeight)} kg
                          </div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <div className="text-sm text-gray-600">Total Value</div>
                          <div className="text-2xl font-bold text-purple-700">
                            ₹{formatNumber(formData.totalValue)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Bale Selection */}
                  <div className="space-y-6">
                    {/* Stock Bales */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-800">Available Stock</h4>
                        <div className="text-sm text-gray-500">
                          {balesLoading ? (
                            <span className="flex items-center">
                              <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                              Loading...
                            </span>
                          ) : (
                            `${availableBales.length} bales available`
                          )}
                        </div>
                      </div>
                      
                      {formData.lotNo ? (
                        balesLoading ? (
                          <div className="text-center py-8">
                            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                            <p className="text-gray-600">Loading available bales...</p>
                          </div>
                        ) : availableBales.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Select
                                  </th>
                                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Bale No.
                                  </th>
                                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Bale Wt. (kg)
                                  </th>
                                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Gross Wt. (kg)
                                  </th>
                                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Value (₹)
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {availableBales.map((bale, index) => {
                                  const isSelected = formData.selectedBales.some(
                                    selected => selected.baleNo === bale.baleNo
                                  );
                                  
                                  return (
                                    <tr 
                                      key={index} 
                                      className={`cursor-pointer hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}
                                      onClick={() => handleBaleSelect(bale)}
                                    >
                                      <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="flex items-center">
                                          {isSelected ? (
                                            <CheckSquare className="w-5 h-5 text-blue-600" />
                                          ) : (
                                            <Square className="w-5 h-5 text-gray-300" />
                                          )}
                                        </div>
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {bale.baleNo}
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                        {formatNumber(bale.baleWeight)}
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                        {formatNumber(bale.grossWeight)}
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                        {bale.baleValue ? `₹${formatNumber(bale.baleValue)}` : 'N/A'}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">No bales available for this lot</p>
                            <p className="text-sm text-gray-500 mt-1">
                              Make sure the lot number is correct
                            </p>
                          </div>
                        )
                      ) : (
                        <div className="text-center py-8">
                          <ClipboardCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">Enter a lot number to view available bales</p>
                        </div>
                      )}
                    </div>

                    {/* Selected Bales for Issue */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-800">Selected Bales for Issue</h4>
                        <div className="text-sm text-gray-500">
                          {formData.selectedBales.length} bales selected
                        </div>
                      </div>
                      
                      {formData.selectedBales.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                              <tr>
                                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Bale No.
                                </th>
                                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Issue Wt. (kg)
                                </th>
                                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Bale Wt. (kg)
                                </th>
                                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Value (₹)
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {formData.selectedBales.map((bale, index) => (
                                <tr key={index}>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {bale.baleNo}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                    {formatNumber(bale.baleWeight)}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                    {formatNumber(bale.grossWeight || bale.baleWeight)}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                    {bale.baleValue ? `₹${formatNumber(bale.baleValue)}` : 'N/A'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <List className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">No bales selected for issue</p>
                          <p className="text-sm text-gray-500 mt-1">
                            Select bales from the available stock above
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50"
                    disabled={!formData.issueNo || !formData.issueDate || !formData.mixingGroupId || 
                             !formData.mixingId || !formData.lotNo || formData.selectedBales.length === 0}
                  >
                    {editingIssue ? 'Update Issue' : 'Create Issue'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Issue Details Modal */}
      {showViewModal && viewingIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Issue Entry Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Issue Details */}
              <div className="space-y-6">
                {/* Issue Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center">
                      <Hash className="w-5 h-5 text-gray-400 mr-2" />
                      <h4 className="text-2xl font-bold text-gray-900">{viewingIssue.issueNo}</h4>
                    </div>
                    <div className="flex items-center mt-2 space-x-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-600">Issue Date: {formatDate(viewingIssue.issueDate)}</span>
                      </div>
                      <div className="flex items-center">
                        <Tag className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-600">Lot: {viewingIssue.lotNo}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {viewingIssue.issuedBales ? viewingIssue.issuedBales.length : 0} Bales
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    {/* Mixing Information */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="text-lg font-semibold text-gray-800 mb-3">Mixing Information</h5>
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm text-gray-500">Mixing Group</div>
                          <div className="font-medium text-gray-900">
                            {viewingIssue.mixingGroupName || 'N/A'}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">To Mixing</div>
                          <div className="font-medium text-gray-900">
                            {viewingIssue.mixingName || viewingIssue.mixingNo || 'N/A'}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Mixing No</div>
                          <div className="font-medium text-gray-900">
                            {viewingIssue.mixingNo || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="text-lg font-semibold text-gray-800 mb-3">Summary</h5>
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm text-gray-500">Total Bales Issued</div>
                          <div className="font-bold text-gray-900 text-xl">
                            {viewingIssue.issuedBales ? viewingIssue.issuedBales.length : 0}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Total Weight</div>
                          <div className="font-bold text-green-700 text-xl">
                            {viewingIssue.issuedBales ? 
                              viewingIssue.issuedBales.reduce((sum, b) => sum + (b.baleWeight || 0), 0).toFixed(2) : '0.00'} kg
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Total Value</div>
                          <div className="font-bold text-purple-700 text-xl">
                            ₹{viewingIssue.issuedBales ? 
                              viewingIssue.issuedBales.reduce((sum, b) => sum + (b.baleValue || 0), 0).toFixed(2) : '0.00'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    {/* Issued Bales */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="text-lg font-semibold text-gray-800 mb-3">Issued Bales</h5>
                      {viewingIssue.issuedBales && viewingIssue.issuedBales.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                              <tr>
                                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Bale No.
                                </th>
                                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Bale Wt. (kg)
                                </th>
                                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Value (₹)
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {viewingIssue.issuedBales.map((bale, index) => (
                                <tr key={index}>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {bale.baleNo}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                    {formatNumber(bale.baleWeight)}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                    {bale.baleValue ? `₹${formatNumber(bale.baleValue)}` : 'N/A'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-gray-600">No bales issued</p>
                        </div>
                      )}
                    </div>

                    {/* Timestamps */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="text-lg font-semibold text-gray-800 mb-3">Timestamps</h5>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500">Created Date</div>
                          <div className="font-medium text-gray-900">
                            {viewingIssue.createdAt ? new Date(viewingIssue.createdAt).toLocaleDateString() : 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {viewingIssue.createdAt ? new Date(viewingIssue.createdAt).toLocaleTimeString() : ''}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500">Last Updated</div>
                          <div className="font-medium text-gray-900">
                            {viewingIssue.updatedAt ? new Date(viewingIssue.updatedAt).toLocaleDateString() : 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {viewingIssue.updatedAt ? new Date(viewingIssue.updatedAt).toLocaleTimeString() : ''}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowViewModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowViewModal(false);
                      handleEdit(viewingIssue);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                  >
                    Edit Issue
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueEntryManagement;