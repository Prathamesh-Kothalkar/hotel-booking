/**
 * TypeScript types for Hotel Booking AI System
 * These types match the Java DTOs returned from the backend
 * 
 * Use these in your Next.js application to get full type safety
 * when working with the enhanced chat API responses
 */

// ============= ENUMS =============

export enum ResponseType {
  SEARCH_RESULTS = 'SEARCH_RESULTS',
  BOOKING_CONFIRMATION = 'BOOKING_CONFIRMATION',
  ROOM_SELECTED = 'ROOM_SELECTED',
  QUESTION = 'QUESTION',
  TEXT = 'TEXT',
  ERROR = 'ERROR'
}

export enum BookingStatus {
  CONFIRMED = 'CONFIRMED',
  PENDING = 'PENDING',
  CANCELLED = 'CANCELLED'
}

export enum RoomStatus {
  AVAILABLE = 'AVAILABLE',
  BOOKED = 'BOOKED',
  MAINTENANCE = 'MAINTENANCE'
}

// ============= REQUEST TYPES =============

/**
 * Request sent to the chat API
 * Matches ChatRequest.java
 */
export interface ChatRequest {
  message: string;
  sessionId: string;
}

// ============= RESPONSE TYPES =============

/**
 * Individual room in search results
 * Matches EnhancedChatResponse.RoomResult
 */
export interface RoomResult {
  roomId: number;
  hotelName: string;
  location: string;
  roomType: string;
  noOfBeds: number;
  price: number;
  rating: number;
  status: string;
  images?: string[];
  checkIn?: string;
  checkOut?: string;
}

/**
 * Booking confirmation details
 * Matches EnhancedChatResponse.BookingConfirmation
 */
export interface BookingConfirmation {
  bookingId: number;
  hotel: string;
  roomId?: number;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  numGuests: number;
  totalAmount: number;
  status: string; // CONFIRMED, PENDING, CANCELLED
  bookingDate?: string;
}

/**
 * Enhanced chat response with structured data
 * Matches EnhancedChatResponse.java
 */
export interface EnhancedChatResponse {
  reply: string; // Human-readable text response
  responseType: ResponseType | string;
  searchResults?: RoomResult[];
  bookingConfirmation?: BookingConfirmation;
  suggestedActions?: string[];
  error?: string;
}

/**
 * Message in chat history
 * Extends EnhancedChatResponse with metadata
 */
export interface ChatMessage extends EnhancedChatResponse {
  type?: 'user' | 'bot';
  timestamp?: Date;
}

// ============= API RESPONSE =============

/**
 * Standard API response wrapper (if you use one)
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// ============= FORMATTING & UTILITY TYPES =============

/**
 * Formatted price with currency
 */
export interface FormattedPrice {
  amount: number;
  formatted: string; // e.g., "₹3,000"
  currency: 'INR';
}

/**
 * Formatted date
 */
export interface FormattedDate {
  date: Date | string;
  formatted: string; // e.g., "September 24, 2024"
  iso: string; // e.g., "2024-09-24"
}

// ============= HOOK RETURN TYPES =============

/**
 * Return type for useHotelBookingChat hook
 */
export interface UseHotelBookingChatReturn {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  sendMessage: (message: string, sessionId: string) => Promise<EnhancedChatResponse>;
  clearMessages: () => void;
}

/**
 * Return type for useRoomSearch hook
 */
export interface UseRoomSearchReturn {
  rooms: RoomResult[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  searchRooms: (location: string, checkIn: string, checkOut: string) => Promise<void>;
  loadMore: () => Promise<void>;
}

/**
 * Return type for useBooking hook
 */
export interface UseBookingReturn {
  booking: BookingConfirmation | null;
  loading: boolean;
  error: string | null;
  bookRoom: (roomId: number, checkIn: string, checkOut: string, guests: number) => Promise<BookingConfirmation>;
  getBookingStatus: (bookingId: number) => Promise<BookingConfirmation>;
  cancelBooking: (bookingId: number) => Promise<void>;
}

// ============= CONTEXT TYPES =============

/**
 * Chat context for global state management
 */
export interface ChatContextType {
  messages: ChatMessage[];
  currentSession: string;
  isLoading: boolean;
  selectedRoom: RoomResult | null;
  currentBooking: BookingConfirmation | null;
  sendMessage: (message: string) => Promise<EnhancedChatResponse>;
  selectRoom: (room: RoomResult) => void;
  clearSession: () => void;
}

// ============= COMPONENT PROPS TYPES =============

/**
 * Props for RoomCard component
 */
export interface RoomCardProps {
  room: RoomResult;
  onSelect?: (roomId: number) => void;
  isSelected?: boolean;
}

/**
 * Props for BookingConfirmationCard component
 */
export interface BookingConfirmationCardProps {
  booking: BookingConfirmation;
  onDownload?: () => void;
  onNewSearch?: () => void;
}

/**
 * Props for ChatMessage component
 */
export interface ChatMessageProps {
  message: ChatMessage;
  onAction?: (action: string) => void;
  onRoomSelect?: (roomId: number) => void;
}

/**
 * Props for QuickActionsBar component
 */
export interface QuickActionsBarProps {
  actions: string[];
  onActionSelect: (action: string) => void;
  loading?: boolean;
}

/**
 * Props for SearchResultsView component
 */
export interface SearchResultsViewProps {
  results: RoomResult[];
  onRoomSelect?: (room: RoomResult) => void;
  suggestedActions?: string[];
  onActionSelect?: (action: string) => void;
}

// ============= FORM TYPES =============

/**
 * Hotel search filter form data
 */
export interface HotelSearchFilters {
  location?: string;
  checkInDate?: string;
  checkOutDate?: string;
  numberOfGuests?: number;
  minPrice?: number;
  maxPrice?: number;
  roomType?: string;
  rating?: number;
}

/**
 * Booking form data
 */
export interface BookingFormData {
  roomId: number;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequests?: string;
}

// ============= ERROR TYPES =============

/**
 * Custom error type for API errors
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  statusCode?: number;
}

/**
 * Validation error type for forms
 */
export interface ValidationError {
  field: string;
  message: string;
}

// ============= PAGINATION TYPES =============

/**
 * Pagination info for search results
 */
export interface PaginationInfo {
  page: number;
  pageSize: number;
  totalResults: number;
  totalPages: number;
  hasMore: boolean;
}

// ============= SEARCH STATE TYPES =============

/**
 * Complete search state
 */
export interface SearchState {
  filters: HotelSearchFilters;
  results: RoomResult[];
  pagination: PaginationInfo;
  isLoading: boolean;
  error: ApiError | null;
  selectedRoom: RoomResult | null;
}

// ============= BOOKING STATE TYPES =============

/**
 * Complete booking state
 */
export interface BookingState {
  formData: BookingFormData;
  isSubmitting: boolean;
  error: ApiError | null;
  confirmation: BookingConfirmation | null;
  isConfirmed: boolean;
}

// ============= HELPER TYPES =============

/**
 * Function that transforms a room price
 */
export type PriceFormatter = (price: number) => string;

/**
 * Function that formats a date
 */
export type DateFormatter = (date: string | Date) => string;

/**
 * Function that validates an email
 */
export type EmailValidator = (email: string) => boolean;

/**
 * Async function that sends a chat message
 */
export type SendChatMessage = (message: string) => Promise<EnhancedChatResponse>;

/**
 * Callback when a room is selected
 */
export type OnRoomSelected = (room: RoomResult) => void;

/**
 * Callback when booking is confirmed
 */
export type OnBookingConfirmed = (booking: BookingConfirmation) => void;

// ============= DISCRIMINATED UNION TYPES =============

/**
 * Message discriminator for handling different message types
 */
export type ChatMessageType = 
  | { type: 'SEARCH_RESULTS'; data: RoomResult[] }
  | { type: 'BOOKING_CONFIRMATION'; data: BookingConfirmation }
  | { type: 'QUESTION'; data: { question: string; suggestions: string[] } }
  | { type: 'TEXT'; data: string }
  | { type: 'ERROR'; data: { error: string } };

// ============= API CLIENT CONFIGURATION =============

/**
 * Configuration for API client
 */
export interface ApiClientConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  headers?: Record<string, string>;
}

// ============= LOCAL STORAGE TYPES =============

/**
 * Stored chat session
 */
export interface StoredChatSession {
  id: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Stored search preferences
 */
export interface StoredSearchPreferences {
  lastLocation?: string;
  lastCheckInDate?: string;
  lastCheckOutDate?: string;
  favoriteRooms?: number[];
}

// ============= CONSTANTS FOR TYPE GUARDS =============

export const RESPONSE_TYPES = {
  SEARCH_RESULTS: 'SEARCH_RESULTS',
  BOOKING_CONFIRMATION: 'BOOKING_CONFIRMATION',
  ROOM_SELECTED: 'ROOM_SELECTED',
  QUESTION: 'QUESTION',
  TEXT: 'TEXT',
  ERROR: 'ERROR'
} as const;

export const BOOKING_STATUSES = {
  CONFIRMED: 'CONFIRMED',
  PENDING: 'PENDING',
  CANCELLED: 'CANCELLED'
} as const;

export const ROOM_STATUSES = {
  AVAILABLE: 'AVAILABLE',
  BOOKED: 'BOOKED',
  MAINTENANCE: 'MAINTENANCE'
} as const;

// ============= TYPE GUARDS =============

/**
 * Check if response is a search results response
 */
export function isSearchResultsResponse(
  response: EnhancedChatResponse
): response is EnhancedChatResponse & { searchResults: RoomResult[] } {
  return response.responseType === ResponseType.SEARCH_RESULTS && !!response.searchResults;
}

/**
 * Check if response is a booking confirmation
 */
export function isBookingConfirmationResponse(
  response: EnhancedChatResponse
): response is EnhancedChatResponse & { bookingConfirmation: BookingConfirmation } {
  return response.responseType === ResponseType.BOOKING_CONFIRMATION && !!response.bookingConfirmation;
}

/**
 * Check if response is a question
 */
export function isQuestionResponse(
  response: EnhancedChatResponse
): response is EnhancedChatResponse & { suggestedActions: string[] } {
  return response.responseType === ResponseType.QUESTION && !!response.suggestedActions;
}

/**
 * Check if response is an error
 */
export function isErrorResponse(
  response: EnhancedChatResponse
): response is EnhancedChatResponse & { error: string } {
  return response.responseType === ResponseType.ERROR && !!response.error;
}

/**
 * Check if a room is available
 */
export function isRoomAvailable(room: RoomResult): boolean {
  return room.status === RoomStatus.AVAILABLE;
}

/**
 * Check if booking is confirmed
 */
export function isBookingConfirmed(booking: BookingConfirmation): boolean {
  return booking.status === BookingStatus.CONFIRMED;
}

// Export all types as namespace for convenience
export namespace HotelBooking {
  export type Response = EnhancedChatResponse;
  export type Room = RoomResult;
  export type Booking = BookingConfirmation;
  export type Message = ChatMessage;
}