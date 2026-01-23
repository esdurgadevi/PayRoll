import axios from "axios";

// ✅ Backend base URL
const API_URL = "http://localhost:5000/api/issues";

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

const issueService = {
  /* =============================
     GET NEXT ISSUE NUMBER
  ============================= */
  getNextIssueNo: async () => {
    const res = await api.get("/next-issue-no");
    return res.data.nextIssueNo;
  },

  /* =============================
     GET ALL ISSUES
  ============================= */
  getAll: async () => {
    const res = await api.get("/");
    return res.data;
  },

  /* =============================
     GET ISSUE BY ID
  ============================= */
  getById: async (id) => {
    const res = await api.get(`/${id}`);
    return res.data;
  },

  /* =============================
     CREATE ISSUE
  ============================= */
  create: async (data) => {
    const payload = {
      issueNo: data.issueNo,
      issueDate: data.issueDate,

      mixingGroupId:
        data.mixingGroupId !== undefined
          ? Number(data.mixingGroupId)
          : null,

      mixingId:
        data.mixingId !== undefined ? Number(data.mixingId) : null,

      lotNo: data.lotNo,

      issuedBales: data.issuedBales.map((b) => ({
        baleNo: b.baleNo,
        baleWeight: Number(b.baleWeight),
        baleValue:
          b.baleValue !== undefined ? Number(b.baleValue) : null,
      })),
    };

    const res = await api.post("/", payload);
    return res.data;
  },

  /* =============================
     UPDATE ISSUE
  ============================= */
  update: async (id, data) => {
    const payload = {
      issueDate: data.issueDate,

      mixingGroupId:
        data.mixingGroupId !== undefined
          ? Number(data.mixingGroupId)
          : undefined,

      mixingId:
        data.mixingId !== undefined ? Number(data.mixingId) : undefined,

      issuedBales: data.issuedBales,
    };

    const res = await api.put(`/${id}`, payload);
    return res.data;
  },

  /* =============================
     DELETE ISSUE
  ============================= */
  delete: async (id) => {
    const res = await api.delete(`/${id}`);
    return res.data;
  },

  /* =============================
     GET LOT WEIGHTMENTS FOR ISSUE
  ============================= */
  getLotWeightments: async (lotNo) => {
    const res = await api.get(`/lot/${lotNo}/weightments`);
    return res.data;
  },
};

export default issueService;
