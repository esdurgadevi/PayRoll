import React, { useState, useEffect } from "react";
import inwardEntryService from "../../services/inwardEntryService";

import lotEntryService from "../../services/inwardLotService";
import godownService from "../../services/godownService";
import purchaseOrderService from "../../services/purchaseOrderService";
import stationService from "../../services/stationService";
import supplierService from "../../services/supplierService";
import varietyService from "../../services/varietyService";
import mixingGroupService from "../../services/mixingGroupService";

const InwardLot = () => {
  const [activeTab, setActiveTab] = useState("Inward");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // State for inward entry
  const [inwardEntry, setInwardEntry] = useState({
    inwardNo: "",
    orderNo: "",
    type: "",
    godownId: "",
    inwardDate: "",
    lcNo: "",
    paymentDays: "",
    paymentDate: "",
    govtForm: "",
    billNo: "",
    billDate: "",
    lotNo: "",
    lorryNo: "",
    date: "",
    candyRate: "",
    pMark: "",
    pressRunningNo: "",
    commisType: "",
    commisValue: "",
    balesQty: "",
    freight: "",
    coolyBale: "",
    gst: "",
    sgst: "",
    cgst: "",
    igst: "",
    tax: "",
    taxAmount: "",
    grossWeight: "",
    tareWeight: "",
    nettWeight: "",
    permitNo: "",
    comm: "",
    remarks: "",
  });

  // State for lot entry
  const [lotEntry, setLotEntry] = useState({
    lotNo: "",
    inwardId: "",
    setNo: "",
    cessPaidAmt: "",
    lotDate: "",
    type: "",
    godownId: "",
    balesQty: "",
    currency: "RUPEES",
    candyRate: "",
    quintolRate: "",
    rateKg: "",
    invoiceValue: "",
  });

  // State for dropdown options
  const [godowns, setGodowns] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [stations, setStations] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [varieties, setVarieties] = useState([]);
  const [mixingGroups, setMixingGroups] = useState([]);
  
  // Selected purchase order details
  const [selectedPO, setSelectedPO] = useState(null);

  // Initialize component
  useEffect(() => {
    fetchDropdownData();
    fetchNextNumbers();
  }, []);

  const fetchDropdownData = async () => {
    try {
      const [godownsRes, poRes, stationsRes, suppliersRes, varietiesRes, mixingRes] = 
        await Promise.all([
          godownService.getAll(),
          purchaseOrderService.getAll(),
          stationService.getAll(),
          supplierService.getAll(),
          varietyService.getAll(),
          mixingGroupService.getAll()
        ]);
      
      setGodowns(godownsRes);
      setPurchaseOrders(poRes);
      setStations(stationsRes);
      setSuppliers(suppliersRes);
      setVarieties(varietiesRes);
      setMixingGroups(mixingRes);
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    }
  };

  const fetchNextNumbers = async () => {
    try {
      const inwardNo = await inwardEntryService.getNextInwardNo();
      const lotNo = await lotEntryService.getNextLotNo();
      
      setInwardEntry(prev => ({ ...prev, inwardNo }));
      setLotEntry(prev => ({ ...prev, lotNo }));
    } catch (error) {
      console.error("Error fetching next numbers:", error);
    }
  };

  const handleInwardChange = (e) => {
    const { name, value } = e.target;
    setInwardEntry(prev => ({ ...prev, [name]: value }));
  };

  const handleLotChange = (e) => {
    const { name, value } = e.target;
    setLotEntry(prev => ({ ...prev, [name]: value }));
  };

  const handlePOSelect = (poId) => {
    const po = purchaseOrders.find(p => p.id === poId);
    if (po) {
      setSelectedPO(po);
      // Auto-populate fields from PO
      setInwardEntry(prev => ({
        ...prev,
        orderNo: po.orderNo,
        candyRate: po.candyRate || "",
        // Add more mappings as needed
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isEditing) {
        // Update existing entries
        // Implementation depends on your API structure
      } else {
        // Create new entries
        const newInward = await inwardEntryService.create(inwardEntry);
        const newLot = await lotEntryService.create({
          ...lotEntry,
          inwardId: newInward.id
        });
        
        console.log("Created:", { newInward, newLot });
        alert("Inward & Lot entries created successfully!");
        
        // Reset form
        fetchNextNumbers();
        setInwardEntry(prev => ({ ...prev, remarks: "" }));
        setLotEntry(prev => ({ ...prev, invoiceValue: "" }));
        setSelectedPO(null);
      }
    } catch (error) {
      console.error("Error saving entries:", error);
      alert("Failed to save entries. Please check the console for details.");
    } finally {
      setLoading(false);
    }
  };

  const handleWeightment = () => {
    alert("Weightment functionality would be implemented here");
  };

  const tabs = [
    { id: "Inward", label: "Inward" },
    { id: "Weightment", label: "Weightment" },
    { id: "Remarks", label: "Remarks" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Inward & Lot
          </h1>
          <p className="text-gray-600 mt-2">
            Add, Modify Inward & Lot details. This entry can't be modified after the issue entry.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-4 py-3 text-sm font-medium rounded-t-lg transition-colors
                  ${activeTab === tab.id
                    ? 'bg-white border-t border-x border-gray-300 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <form onSubmit={handleSubmit}>
            {/* Inward Details Section */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Inward No */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Inward No *
                  </label>
                  <input
                    type="text"
                    name="inwardNo"
                    value={inwardEntry.inwardNo}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
                  />
                </div>

                {/* Type */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Type *
                  </label>
                  <select
                    name="type"
                    value={inwardEntry.type}
                    onChange={handleInwardChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="Upcountry">Upcountry</option>
                    <option value="Local">Local</option>
                  </select>
                </div>

                {/* Godown */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Godown *
                  </label>
                  <select
                    name="godownId"
                    value={inwardEntry.godownId}
                    onChange={handleInwardChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Godown</option>
                    {godowns.map(godown => (
                      <option key={godown.id} value={godown.id}>
                        {godown.godownName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Purchase Order Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Purchase Order
                  </label>
                  <select
                    onChange={(e) => handlePOSelect(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Purchase Order</option>
                    {purchaseOrders.map(po => (
                      <option key={po.id} value={po.id}>
                        {po.orderNo} - {po.supplier?.accountName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Supplier (auto-filled from PO) */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Supplier
                  </label>
                  <input
                    type="text"
                    value={selectedPO?.supplier?.accountName || ""}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
                  />
                </div>

                {/* Broker */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Broker
                  </label>
                  <input
                    type="text"
                    value={selectedPO?.broker?.name || ""}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
                  />
                </div>

                {/* Lot No */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Lot No *
                  </label>
                  <input
                    type="text"
                    name="lotNo"
                    value={lotEntry.lotNo}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
                  />
                </div>

                {/* Lot Date */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Lot Date
                  </label>
                  <input
                    type="date"
                    name="lotDate"
                    value={lotEntry.lotDate}
                    onChange={handleLotChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Bales Qty */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Bales Qty
                  </label>
                  <input
                    type="number"
                    name="balesQty"
                    value={inwardEntry.balesQty}
                    onChange={handleInwardChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Variety */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Variety
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
                    readOnly
                  >
                    <option>{selectedPO?.variety?.variety || "N/A"}</option>
                  </select>
                </div>

                {/* Mixing */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Mixing
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
                    readOnly
                  >
                    <option>{selectedPO?.mixingGroup?.mixingName || "N/A"}</option>
                  </select>
                </div>

                {/* Station */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Station
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
                    readOnly
                  >
                    <option>{selectedPO?.station?.station || "N/A"}</option>
                  </select>
                </div>

                {/* Bill Details */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Bill No
                  </label>
                  <input
                    type="text"
                    name="billNo"
                    value={inwardEntry.billNo}
                    onChange={handleInwardChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Bill Date
                  </label>
                  <input
                    type="date"
                    name="billDate"
                    value={inwardEntry.billDate}
                    onChange={handleInwardChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Lorry Details */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Lorry No
                  </label>
                  <input
                    type="text"
                    name="lorryNo"
                    value={inwardEntry.lorryNo}
                    onChange={handleInwardChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Rate Details Section */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Rate Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Currency */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Currency
                    </label>
                    <select
                      name="currency"
                      value={lotEntry.currency}
                      onChange={handleLotChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="RUPEES">RUPEES</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>

                  {/* Candy Rate */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Candy Rate
                    </label>
                    <input
                      type="number"
                      name="candyRate"
                      value={lotEntry.candyRate}
                      onChange={handleLotChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Quintol Rate */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Quintol Rate
                    </label>
                    <input
                      type="number"
                      name="quintolRate"
                      value={lotEntry.quintolRate}
                      onChange={handleLotChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Rate/Kg */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Rate/Kg
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="rateKg"
                      value={lotEntry.rateKg}
                      onChange={handleLotChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Invoice Value */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Invoice Value
                    </label>
                    <input
                      type="number"
                      name="invoiceValue"
                      value={lotEntry.invoiceValue}
                      onChange={handleLotChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Weight Details */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Weight Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Gross Weight
                    </label>
                    <input
                      type="number"
                      name="grossWeight"
                      value={inwardEntry.grossWeight}
                      onChange={handleInwardChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Tare Weight
                    </label>
                    <input
                      type="number"
                      name="tareWeight"
                      value={inwardEntry.tareWeight}
                      onChange={handleInwardChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Nett Weight
                    </label>
                    <input
                      type="number"
                      name="nettWeight"
                      value={inwardEntry.nettWeight}
                      onChange={handleInwardChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Remarks (for Remarks tab) */}
              {activeTab === "Remarks" && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Remarks
                    </label>
                    <textarea
                      name="remarks"
                      value={inwardEntry.remarks}
                      onChange={handleInwardChange}
                      rows="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter any remarks here..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleWeightment}
                className="px-6 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-colors"
              >
                Weightment
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </span>
                ) : (
                  'Update'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info Message */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Important Note
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  This entry cannot be modified after the issue entry is created.
                  Please review all details carefully before saving.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InwardLot;