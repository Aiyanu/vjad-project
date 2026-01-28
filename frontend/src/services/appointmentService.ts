// Centralized appointment service for all appointment-related API calls

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const APPOINTMENT_URLS = {
  SLOTS: "/appointments/slots",
  BOOK: "/appointments/book",
};

async function fetchWithAuth(path: string, options: RequestInit = {}) {
  const token =
    typeof window !== "undefined" ? sessionStorage.getItem("authToken") : null;
  const headers: Record<string, string> = { ...(options.headers as any) };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (options.body && !(options.body instanceof FormData))
    headers["Content-Type"] = "application/json";
  const res = await fetch(`${BACKEND_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok)
    throw new Error(data?.message || data?.error || "Request failed");
  return data;
}

export const appointmentService = {
  fetchCalendar: async (month: string) =>
    fetchWithAuth(`/appointments/calendar?month=${month}`),
  fetchSlots: async () => fetchWithAuth(APPOINTMENT_URLS.SLOTS),
  createSlot: async (data: any) =>
    fetchWithAuth(APPOINTMENT_URLS.SLOTS, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  deleteSlot: async (slotId: string) =>
    fetchWithAuth(`${APPOINTMENT_URLS.SLOTS}?slotId=${slotId}`, {
      method: "DELETE",
    }),
  fetchBookings: async () => fetchWithAuth(APPOINTMENT_URLS.BOOK),
  createBooking: async (data: any) =>
    fetchWithAuth(APPOINTMENT_URLS.BOOK, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  fetchSlotsByDate: async (date: string) =>
    fetchWithAuth(`${APPOINTMENT_URLS.SLOTS}/${date}`),
  fetchBookingByDate: async (date: string) =>
    fetchWithAuth(`${APPOINTMENT_URLS.BOOK}?date=${date}`),
  fetchBookingById: async (id: string) =>
    fetchWithAuth(`${APPOINTMENT_URLS.BOOK}/${id}`),
  fetchAvailability: async (month: string) =>
    fetchWithAuth(
      `/appointments/availability?month=${month}&format=simplified`,
    ),
};
