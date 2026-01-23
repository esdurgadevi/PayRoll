// services/inwardLotService.js
import axios from "axios";

// ✅ Backend base URL
const API_URL = "http://localhost:5000/api/inward-lots"; // Update if your backend URL is different

// ✅ Axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔐 Attach JWT token
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

const inwardLotService = {
  /* =============================
     GET NEXT LOT NO
  ============================= */
  getNextLotNo: async () => {
    const response = await api.get("/next-lot-no");
    console.log(response);
    return response.data.lotNo;
  },

  /* =============================
     GET ALL LOTS
  ============================= */
  getAll: async () => {
    const response = await api.get("/");
    console.log(response);
    return response.data; // returns array of lots
  },

  /* =============================
     GET LOT BY LOT NO
  ============================= */
  getByLotNo: async (lotNo) => {
    const response = await api.get(`/${lotNo}`);
    return response.data;
  },

  /* =============================
     CREATE LOT
  ============================= */
  create: async (data) => {
    console.log(data);
    const payload = {
      inwardId:  Number(data.selectedInwardId) || 0,
      lotNo: data.lotNo,
      setNo: String(data.setNo) || null,
      balesQty: Number(data.balesQty) || 0,
grossWeight: Number(data.grossWeight) || 0,
tareWeight: Number(data.tareWeight) || 0,
nettWeight: Number(data.nettWeight) || 0,
candyRate: Number(data.candyRate) || 0,
quintalRate: Number(data.quintalRate) || 0,
ratePerKg: Number(data.ratePerKg) || 0,
invoiceValue: Number(data.invoiceValue) || 0,
cessPaidAmount: 200
    };

    const response = await api.post("/", payload);
    return response.data.lot;
  },

  /* =============================
     UPDATE LOT
  ============================= */
  update: async (lotNo, data) => {
    const payload = {
      inwardNo: data.inwardNo,
      lotNo: data.lotNo,
      setNo: data.setNo || null,
      balesQty: data.balesQty,
      cessPaidAmount: data.cessPaidAmount || 0,
      grossWeight: data.grossWeight,
      tareWeight: data.tareWeight,
      nettWeight: data.nettWeight,
      candyRate: data.candyRate,
      quintalRate: data.quintalRate,
      ratePerKg: data.ratePerKg,
      invoiceValue: data.invoiceValue,
    };

    const response = await api.put(`/${lotNo}`, payload);
    return response.data.lot;
  },

  /* =============================
     DELETE LOT
  ============================= */
  delete: async (lotNo) => {
    const response = await api.delete(`/${lotNo}`);
    return response.data;
  },
};

export default inwardLotService;
