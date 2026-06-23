/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
  isTrusted: boolean; // sharing location index
  photoUrl?: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bloodType: string;
  medicalNotes: string;
  avatarUrl: string;
  fallDetection: boolean;
  stealthPin: string;
  alertOnTimerExpiry: boolean;
}

export interface LocationMarker {
  id: string;
  name: string;
  type: 'me' | 'contact' | 'safe_zone' | 'police';
  lat: number; // relative coordinate on our canvas (-100 to 100 or screen percentages)
  lng: number;
  description?: string;
}

export interface SafetyHistoryEntry {
  id: string;
  timestamp: string;
  type: 'sos' | 'wayhome' | 'location_share' | 'checkin';
  details: string;
  successful: boolean;
}
