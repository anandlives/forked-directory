"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { createDeveloper, updateDeveloper, getNextDeveloperId } from "@/app/actions/developer-actions"
import type { Developer } from "@/types/developers"

interface DeveloperFormProps {
  developer?: Developer
  isEditing?: boolean
}

const developerSchema = z.object({
  id: z.string().min(1, "Developer ID is required"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  spoc_name: z.string().optional(),
  spoc_contact_no: z.string().optional(),
  spoc_email_id: z.string().email("Invalid email address").optional().or(z.literal("")),
  additional_contact_name: z.string().optional(),
  additional_contact_details: z.string().optional(),
  additional_contact_email_id: z.string().email("Invalid email address").optional().or(z.literal("")),
})

type DeveloperFormValues = z.infer<typeof developerSchema>

export function DeveloperForm({ developer, isEditing = false }: DeveloperFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(!isEditing)

  const defaultValues: Partial<DeveloperFormValues> = developer
    ? {
        id: developer.id,
        name: developer.name || "",
        spoc_name: developer.spoc_name || "",
        spoc_contact_no: developer.spoc_contact_no || "",
        spoc_email_id: developer.spoc_email_id || "",
        additional_contact_name: developer.additional_contact_name || "",
        additional_contact_details: developer.additional_contact_details || "",
        additional_contact_email_id: developer.additional_contact_email_id || "",
      }
    : {
        id: "",
        name: "",
        spoc_name: "",
        spoc_contact_no: "",
        spoc_email_id: "",
        additional_contact_name: "",
        additional_contact_details: "",
        additional_contact_email_id: "",
      }

  const form = useForm<DeveloperFormValues>({
    resolver: zodResolver(developerSchema),
    defaultValues,
  })

  // Fetch the next developer ID
  useEffect(() => {
    const fetchNextId = async () => {
      try {
        if (!isEditing) {
          const nextId = await getNextDeveloperId()
          form.setValue("id", nextId)
        }
      } catch (error) {
        console.error("Error fetching next developer ID:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNextId()
  }, [form, isEditing])

  async function onSubmit(data: DeveloperFormValues) {
    setIsSubmitting(true)

    try {
      const formData = new FormData()

      // Add all form fields to FormData
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value))
        }
      })

      let result

      if (isEditing && developer) {
        result = await updateDeveloper(developer.id, formData)
      } else {
        result = await createDeveloper(formData)
      }

      if (result.success) {
        toast({
          title: isEditing ? "Developer updated" : "Developer created",
          description: `Successfully ${isEditing ? "updated" : "created"} ${data.name}`,
        })

        // Add a small delay before redirecting to ensure the toast is visible
        setTimeout(() => {
          router.push("/dashboard/kf-supply/manage/developers")
          router.refresh()
        }, 1500)
      } else {
        toast({
          title: "Error",
          description: result.error || "Something went wrong",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Developer" : "Add New Developer"}</CardTitle>
        <CardDescription>
          {isEditing
            ? "Update the information for this developer"
            : "Enter the details to add a new developer to the database"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="id">Developer ID *</Label>
              <Input
                id="id"
                {...form.register("id")}
                placeholder={isLoading ? "Loading suggestion..." : "Enter developer ID"}
                disabled={isEditing || isLoading}
                onChange={(e) => {
                  e.target.value = e.target.value.toUpperCase()
                  form.setValue("id", e.target.value)
                }}
              />
              {form.formState.errors.id && <p className="text-sm text-red-500">{form.formState.errors.id.message}</p>}
              {!isEditing && (
                <p className="text-xs text-muted-foreground">
                  Suggested ID based on existing developers. You can modify if needed.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Developer Name *</Label>
              <Input id="name" {...form.register("name")} placeholder="Enter developer name" />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="spoc_name">SPOC Name</Label>
              <Input id="spoc_name" {...form.register("spoc_name")} placeholder="Enter SPOC name" />
              {form.formState.errors.spoc_name && (
                <p className="text-sm text-red-500">{form.formState.errors.spoc_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="spoc_contact_no">SPOC Contact Number</Label>
              <Input
                id="spoc_contact_no"
                {...form.register("spoc_contact_no")}
                placeholder="Enter SPOC contact number"
              />
              {form.formState.errors.spoc_contact_no && (
                <p className="text-sm text-red-500">{form.formState.errors.spoc_contact_no.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="spoc_email_id">SPOC Email</Label>
              <Input
                id="spoc_email_id"
                type="email"
                {...form.register("spoc_email_id")}
                placeholder="Enter SPOC email address"
              />
              {form.formState.errors.spoc_email_id && (
                <p className="text-sm text-red-500">{form.formState.errors.spoc_email_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="additional_contact_name">Additional Contact Name</Label>
              <Input
                id="additional_contact_name"
                {...form.register("additional_contact_name")}
                placeholder="Enter additional contact name"
              />
              {form.formState.errors.additional_contact_name && (
                <p className="text-sm text-red-500">{form.formState.errors.additional_contact_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="additional_contact_details">Additional Contact Details</Label>
              <Input
                id="additional_contact_details"
                {...form.register("additional_contact_details")}
                placeholder="Enter additional contact details"
              />
              {form.formState.errors.additional_contact_details && (
                <p className="text-sm text-red-500">{form.formState.errors.additional_contact_details.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="additional_contact_email_id">Additional Contact Email</Label>
              <Input
                id="additional_contact_email_id"
                type="email"
                {...form.register("additional_contact_email_id")}
                placeholder="Enter additional contact email"
              />
              {form.formState.errors.additional_contact_email_id && (
                <p className="text-sm text-red-500">{form.formState.errors.additional_contact_email_id.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/kf-supply/manage/developers")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoading}>
              {isSubmitting ? "Saving..." : isEditing ? "Update Developer" : "Add Developer"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
