export interface Tenant {
  id: number
  unit_id: number
  name: string
  lease_commencement_date: string
  primary_industry_sector: string
  security_deposit: number
  lock_in_period: number
  lock_in_expiry: string
  lease_period: number
  type_of_user: string
  lease_expiry: string
  escalation: number
  current_rent: number
  handover_conditions: string
  car_parking_charges: number
  notice_period: number
  car_parking_ratio: number
  status: string
}
