/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { AlertCircle, Database } from "lucide-react"
import { toast } from "sonner"
import { updateBackupSettings, createBackup } from "@/server/actions/backup"

interface BackupTabProps {
  backupFrequency: string
  backupEnabled: boolean
}

const BackupTab = ({ backupFrequency = "daily", backupEnabled = false }: BackupTabProps) => {
    const [isBackupEnabled, setIsBackupEnabled] = useState(backupEnabled)
    const [frequency, setFrequency] = useState(backupFrequency)
    const [isLoading, setIsLoading] = useState(false)
    const [isBackingUp, setIsBackingUp] = useState(false)
  
    const handleSaveBackupSettings = async () => {
      setIsLoading(true)
      try {
        const result = await updateBackupSettings(isBackupEnabled, frequency as any)
        if (result.success) {
          toast.success("Backup settings saved", {
            description: "Your backup settings have been updated successfully.",
          })
        } else {
          toast.error("Failed to save settings", {
            description: result.message || "There was an error saving your backup settings.",
          })
        }
      } catch (error) {
        toast.error("Error", {
          description: "Failed to save backup settings. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }
  
    const handleCreateBackup = async () => {
      setIsBackingUp(true)
      try {
        const result = await createBackup()
        if (result.success) {
          toast.success("Backup created", {
            description: "Your database has been backed up successfully.",
          })
        } else {
          toast.error("Backup failed", {
            description: result.message || "There was an error creating your backup.",
          })
        }
      } catch (error) {
        toast.error("Error", {
          description: "Failed to create backup. Please try again.",
        })
      } finally {
        setIsBackingUp(false)
      }
    }
  
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between space-x-2 bg-white p-4 rounded-lg border border-[#acc2ef]">
          <div className="space-y-0.5">
            <Label htmlFor="backup-enabled" className="text-sm font-medium">
              Automatic Backups
            </Label>
            <p className="text-xs text-muted-foreground">When enabled, your database will be backed up automatically</p>
          </div>
          <Switch
            id="backup-enabled"
            checked={isBackupEnabled}
            onCheckedChange={setIsBackupEnabled}
            className="data-[state=checked]:bg-blue-600"
          />
        </div>
  
        <div className={`space-y-2 ${!isBackupEnabled && "opacity-50"}`}>
          <Label htmlFor="backup-frequency" className="text-sm font-medium">
            Backup Frequency
          </Label>
          <Select value={frequency} onValueChange={setFrequency} disabled={!isBackupEnabled}>
            <SelectTrigger className="bg-white border-[#acc2ef]">
              <SelectValue placeholder="Select backup frequency" />
            </SelectTrigger>
            <SelectContent className="bg-white border-[#acc2ef]">
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">How often your website data should be backed up</p>
        </div>
  
        <div className="p-4 bg-blue-50 rounded-lg border border-[#acc2ef]">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-700">Backup Information</h4>
              <p className="text-xs text-blue-600 mt-1">
                Backups include all database tables and are stored securely. You can restore from a backup at any time.
              </p>
            </div>
          </div>
        </div>
  
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleSaveBackupSettings}
            disabled={isLoading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? "Saving..." : "Save Backup Settings"}
          </Button>
          <Button onClick={handleCreateBackup} disabled={isBackingUp} className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <Database className="h-4 w-4" />
            {isBackingUp ? "Backing up..." : "Backup Now"}
          </Button>
        </div>
      </div>
    )
}

export default BackupTab