import axios from "axios";

// ✅ Backend base URL (change if your port is different)
const API_URL = "http://localhost:5000/api/lot-entries";

// ✅ Axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔐 Automatically attach JWT token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Service object with all methods
const lotEntryService = {
  // 1. Get the NEXT auto-generated Lot No (e.g., UC/25-26/0270)
  getNextLotNo: async () => {
    try {
      const response = await api.get("/next-lot-no");
      return response.data.nextLotNo; // e.g., "UC/25-26/0270"
    } catch (error) {
      console.error("Error fetching next lot number:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch next lot number"
      );
    }
  },

  // 2. Get all lot entries
  getAll: async () => {
    try {
      const response = await api.get("/");
      return response.data.lotEntries; // array of lot entries
    } catch (error) {
      console.error("Error fetching lot entries:", error);
      throw new Error("Failed to fetch lot entries");
    }
  },

  // 3. Get single lot entry by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/${id}`);
      return response.data.lotEntry;
    } catch (error) {
      console.error("Error fetching lot entry:", error);
      throw new Error("Failed to fetch lot entry");
    }
  },

  // 4. Create new lot entry
  create: async (data) => {
    try {
      const payload = {
        lotNo: data.lotNo, // from getNextLotNo()
        inwardId: Number(data.inwardId),

        setNo: data.setNo || null,
        cessPaidAmt: data.cessPaidAmt !== undefined ? Number(data.cessPaidAmt) : null,
        lotDate: data.lotDate || null,
        type: data.type || null,
        godownId: data.godownId !== undefined ? Number(data.godownId) : null,
        balesQty: data.balesQty !== undefined ? Number(data.balesQty) : null,

        currency: data.currency || "RUPEES",
        candyRate: data.candyRate !== undefined ? Number(data.candyRate) : null,
        quintolRate: data.quintolRate !== undefined ? Number(data.quintolRate) : null,
        rateKg: data.rateKg !== undefined ? Number(data.rateKg) : null,
        invoiceValue: data.invoiceValue !== undefined ? Number(data.invoiceValue) : null,
      };

      const response = await api.post("/", payload);
      return response.data.lotEntry;
    } catch (error) {
      console.error("Error creating lot entry:", error);
      throw new Error(
        error.response?.data?.message || "Failed to create lot entry"
      );
    }
  },

  // 5. Update existing lot entry
  update: async (id, data) => {
    try {
      const payload = {
        lotNo: data.lotNo,
        inwardId: data.inwardId !== undefined ? Number(data.inwardId) : undefined,

        setNo: data.setNo !== undefined ? data.setNo : undefined,
        cessPaidAmt:
          data.cessPaidAmt !== undefined ? Number(data.cessPaidAmt) : undefined,
        lotDate: data.lotDate !== undefined ? data.lotDate : undefined,
        type: data.type !== undefined ? data.type : undefined,
        godownId:
          data.godownId !== undefined ? Number(data.godownId) : undefined,
        balesQty:
          data.balesQty !== undefined ? Number(data.balesQty) : undefined,

        currency: data.currency !== undefined ? data.currency : undefined,
        candyRate:
          data.candyRate !== undefined ? Number(data.candyRate) : undefined,
        quintolRate:
          data.quintolRate !== undefined ? Number(data.quintolRate) : undefined,
        rateKg: data.rateKg !== undefined ? Number(data.rateKg) : undefined,
        invoiceValue:
          data.invoiceValue !== undefined ? Number(data.invoiceValue) : undefined,
      };

      const response = await api.put(`/${id}`, payload);
      return response.data.lotEntry;
    } catch (error) {
      console.error("Error updating lot entry:", error);
      throw new Error(
        error.response?.data?.message || "Failed to update lot entry"
      );
    }
  },

  // 6. Delete lot entry
  delete: async (id) => {
    try {
      const response = await api.delete(`/${id}`);
      return response.data; // { message: "Lot entry deleted successfully" }
    } catch (error) {
      console.error("Error deleting lot entry:", error);
      throw new Error("Failed to delete lot entry");
    }
  },
};

export default lotEntryService;