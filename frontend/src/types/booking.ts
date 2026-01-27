/**
 * Booking System TypeScript Types
 * Based on WordPress booking plugin structure
 */

// ─── Day Status Types ───
export type DayStatus =
  | "available"
  | "unavailable"
  | "weekday_unavailable"
  | "from_today_unavailable"
  | "time_slots_booking";

export type BookingStatus =
  | "pending"
  | "approved"
  | "confirmed"
  | "completed"
  | "cancelled";

// ─── Time Slot Types ───
export interface TimeSlotInSeconds {
  start: number;
  end: number;
}

export interface BookedTimeSlots {
  in_seconds: [number, number][];
  readable24h: string[];
  merged_seconds: [number, number][];
  merged_readable: string[];
}

// ─── Tooltip Types ───
export interface ResourceTooltips {
  resource_title: string;
  times: string;
  details: any[];
}

// ─── Pending/Approved Status Map ───
export type PendingApprovedMap = {
  [key: number]: BookingStatus;
};

// ─── Booking Details ───
export interface BookingDetails {
  approved: string;
  booking_id: string;
  type: string;
  __summary__booking: {
    sql__booking_dates__arr: {
      [timestamp: string]: string;
    };
    __dates_obj: {
      readable_dates: {
        [date: string]: string[];
      };
      is_debug: boolean;
    };
  };
}

export type BookedTimesDetails = {
  [timeRange: string]: BookingDetails;
};

// ─── Resource Data ───
export interface ResourceData {
  is_day_unavailable: boolean;
  _day_status: DayStatus;
  pending_approved: PendingApprovedMap | any[];
  tooltips: ResourceTooltips;
  booked_time_slots: BookedTimeSlots;
  date_cost_rate: number;
  __booked__times__details?: BookedTimesDetails | any[];
}

// ─── Summary Data ───
export interface DaySummary {
  status_for_day: DayStatus;
  status_for_bookings: BookingStatus | "";
  tooltip_times: string;
  tooltip_availability: string;
  tooltip_day_cost: string;
  tooltip_booking_details: string;
  hint__in_day__cost: string;
  hint__in_day__availability: string;
}

// ─── Date Data ───
export interface DateData {
  day_availability: number;
  max_capacity: number;
  statuses: {
    day_status: DayStatus[];
    bookings_status: (BookingStatus | "")[];
  };
  summary: DaySummary;
  [resourceId: string]: ResourceData | number | any;
}

// ─── Dates Collection ───
export interface DatesCollection {
  [date: string]: DateData;
}

// ─── Search Parameters ───
export interface SearchParams {
  resource_id: string;
  booking_hash: string;
  request_uri: string;
  custom_form: string;
  aggregate_resource_id_str: string;
  aggregate_type: string;
}

export interface CleanedParams {
  resource_id: number;
  booking_hash: string;
  request_uri: string;
  custom_form: string;
  aggregate_resource_id_str: string;
  aggregate_type: string;
}

// ─── Main AJX Data Structure ───
export interface AjxData {
  dates: DatesCollection;
  resources_id_arr__in_dates: number[];
  aggregate_resource_id_arr: number[];
}

// ─── Complete Booking Response ───
export interface BookingCalendarData {
  ajx_data: AjxData;
  ajx_search_params: SearchParams;
  ajx_cleaned_params: CleanedParams;
  resource_id: number;
}

// ─── Simplified Frontend Types ───
export interface SimplifiedDateAvailability {
  date: string;
  dayOfWeek: number;
  isAvailable: boolean;
  status: DayStatus;
  availableSlots: TimeSlotInfo[];
  bookedSlots: TimeSlotInfo[];
  maxCapacity: number;
}

export interface TimeSlotInfo {
  startTime: string; // HH:mm:ss format
  endTime: string; // HH:mm:ss format
  startSeconds: number;
  endSeconds: number;
  available: boolean;
  status: BookingStatus | "available";
  bookingId?: string;
}

// ─── Appointment Booking Form ───
export interface AppointmentBookingForm {
  visitorName: string;
  visitorEmail: string;
  visitorPhone: string;
  appointmentDate: Date;
  startTime: string;
  endTime: string;
  message?: string;
}

// ─── API Response Types ───
export interface CalendarAPIResponse {
  success: boolean;
  data?: BookingCalendarData;
  availability?: {
    [date: string]: SimplifiedDateAvailability;
  };
  error?: string;
}

export interface AvailableSlotsAPIResponse {
  success: boolean;
  slots?: TimeSlotInfo[];
  date?: string;
  error?: string;
}

export interface BookingAPIResponse {
  success: boolean;
  booking?: {
    id: string;
    appointmentDate: string;
    startTime: string;
    endTime: string;
    status: BookingStatus;
  };
  error?: string;
  message?: string;
}

// ─── Weekly Schedule Configuration ───
export interface WeeklySchedule {
  [dayOfWeek: number]: DaySchedule;
}

export interface DaySchedule {
  enabled: boolean;
  timeBlocks: TimeBlock[];
}

export interface TimeBlock {
  startTime: string; // HH:mm:ss
  endTime: string; // HH:mm:ss
  slotDuration: number; // minutes
}

// ─── Admin Configuration ───
export interface BookingSettings {
  defaultDuration: number; // minutes
  maxAdvanceBookingDays: number;
  minAdvanceBookingHours: number;
  weeklySchedule: WeeklySchedule;
  holidays: string[]; // Array of dates in YYYY-MM-DD format
  specialAvailability: {
    [date: string]: DaySchedule;
  };
}
