export interface Floor {
  id: string
  building_id: string
  floor_no: number
  floor_plate: number
  no_of_units: number
  efficiency: number
  type_of_space: string
  floor_plan?: string
}
