"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format, addMonths, parseISO, isValid, isWithinInterval } from "date-fns"

interface TenantOccupancy {
  name: string
  area: number
}

interface TenantDetails {
  name: string
  current_rent: number
  lease_commencement_date: string
  lock_in_period: number
  lease_expiry: string
  chargeable_area: number
}

interface TenantOccupancyChartProps {
  tenantOccupancy: TenantOccupancy[]
  tenantDetails: TenantDetails[]
}

const COLORS = [
  "#60A5FA",
  "#34D399",
  "#FBBF24",
  "#FB923C",
  "#A78BFA",
  "#4ADE80",
  "#F472B6",
  "#2DD4BF",
  "#FB7185",
  "#818CF8",
]

export function TenantOccupancyChart({ tenantOccupancy, tenantDetails }: TenantOccupancyChartProps) {
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null)

  const totalArea = tenantOccupancy.reduce((sum, tenant) => sum + tenant.area, 0)

  const data = tenantOccupancy.map((tenant, index) => ({
    name: tenant.name.length > 15 ? tenant.name.substring(0, 15) + "..." : tenant.name,
    fullName: tenant.name,
    area: tenant.area,
    percentage: ((tenant.area / totalArea) * 100).toFixed(2),
    fill: COLORS[index % COLORS.length],
  }))

  const handleBarClick = (data: any) => {
    setSelectedTenant(data.fullName)
  }

  const selectedTenantDetails = tenantDetails.filter((tenant) => tenant.name === selectedTenant)

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = parseISO(dateString)
    return isValid(date) ? format(date, "d MMM yyyy") : "Invalid Date"
  }

  const isExpiringWithin18Months = (expiryDate: string) => {
    if (!expiryDate) return false
    const today = new Date()
    const eighteenMonthsFromNow = addMonths(today, 18)
    const expiry = parseISO(expiryDate)

    if (!isValid(expiry)) return false

    return isWithinInterval(expiry, {
      start: today,
      end: eighteenMonthsFromNow,
    })
  }

  const totalChargeableArea = selectedTenantDetails.reduce((sum, tenant) => sum + tenant.chargeable_area, 0)

  return (
    <Card className="rounded-xl shadow-sm bg-white p-6">
      <CardHeader className="px-0">
        <CardTitle className="text-xl font-semibold">Tenant Occupancy</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <div className="h-[400px] mb-8">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 40 }} barSize={32}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="name"
                tick={{ fill: "#666", fontSize: 12 }}
                axisLine={{ stroke: "#E5E7EB" }}
                tickLine={false}
              />
              <YAxis
                width={80}
                tick={{ fill: "#666", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value.toLocaleString()}`}
              />
              <Tooltip
                cursor={{ fill: "#F3F4F6" }}
                contentStyle={{
                  backgroundColor: "white",
                  border: "none",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  padding: "12px",
                }}
                formatter={(
                  value: number,
                  name: string,
                  props: { payload: { fullName: string; percentage: string } },
                ) => [`${value.toLocaleString()} sq ft (${props.payload.percentage}%)`, props.payload.fullName]}
              />
              <Bar dataKey="area" radius={[4, 4, 0, 0]} onClick={handleBarClick} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {selectedTenant && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Lease Details for {selectedTenant}</h3>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Name</TableHead>
                    <TableHead className="text-right">Current Rent (₹/sq ft)</TableHead>
                    <TableHead className="text-center">Lease Commencement</TableHead>
                    <TableHead className="text-center">Lock-in Period (months)</TableHead>
                    <TableHead className="text-center">Lease Expiry</TableHead>
                    <TableHead className="text-right">Chargeable Area (sq ft)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedTenantDetails.map((tenant, index) => (
                    <TableRow
                      key={index}
                      className={isExpiringWithin18Months(tenant.lease_expiry) ? "bg-orange-50" : ""}
                    >
                      <TableCell className="font-medium">{tenant.name}</TableCell>
                      <TableCell className="text-right">{tenant.current_rent.toLocaleString()}</TableCell>
                      <TableCell className="text-center">{formatDate(tenant.lease_commencement_date)}</TableCell>
                      <TableCell className="text-center">{tenant.lock_in_period}</TableCell>
                      <TableCell className="text-center">{formatDate(tenant.lease_expiry)}</TableCell>
                      <TableCell className="text-right">{tenant.chargeable_area.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-medium">
                    <TableCell>Total</TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-right">{totalChargeableArea.toLocaleString()}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
