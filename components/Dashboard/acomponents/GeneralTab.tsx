/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import type React from "react"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Save, Upload, Settings2, AlertCircle, Database } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { saveSettings } from "@/server/actions/websiteaction"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import BackupTab from "../Backup-Tab"

const GeneralSettings = () => {
  const [siteName, setSiteName] = useState("")
  const [siteDescription, setSiteDescription] = useState("")
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [logo, setLogo] = useState<File | null>(null)
  const [contactEmail, setContactEmail] = useState("")
  const [timezone, setTimezone] = useState("")
  const [backupFrequency, setBackupFrequency] = useState("daily")
  const [backupEnabled, setBackupEnabled] = useState(false)
  const [fontFamily, setFontFamily] = useState("Inter")
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setLogo(event.target.files[0])
    }
  }

  const handleSaveSettings = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("siteName", siteName)
      formData.append("siteDescription", siteDescription)
      formData.append("maintenanceMode", String(maintenanceMode))
      formData.append("contactEmail", contactEmail)
      formData.append("timezone", timezone)
      formData.append("backupFrequency", backupFrequency)
      formData.append("backupEnabled", String(backupEnabled))
      formData.append("fontFamily", fontFamily)
      if (logo) {
        formData.append("logo", logo)
      }

      await saveSettings(formData)
      toast.success("Settings saved", {
        description: "Your changes have been successfully saved.",
      })
    } catch (error) {
      toast.error("Error", {
        description: "Failed to save settings. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  }

  return (
    <Card className="w-full shadow-lg border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
      <CardHeader className="bg-white pb-8 pt-8 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" />
            <CardTitle className="text-2xl font-bold">System Settings</CardTitle>
          </div>
          {maintenanceMode && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="destructive" className="gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Maintenance Mode Active
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Your site is currently in maintenance mode and is not accessible to visitors</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <CardDescription className="text-muted-foreground">
          Configure your website&apos;s general settings and preferences
        </CardDescription>
      </CardHeader>

      <Tabs defaultValue="general" className="w-full">
        <div className="px-6 bg-white border-b">
          <TabsList className="h-12 w-full justify-start rounded-none bg-transparent p-0 gap-4">
            <TabsTrigger
              value="general"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none h-12 text-gray-600"
            >
              General
            </TabsTrigger>
            <TabsTrigger
              value="appearance"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none h-12"
            >
              Appearance
            </TabsTrigger>
            <TabsTrigger
              value="backup"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none h-12"
            >
              Backup & Security
            </TabsTrigger>
          </TabsList>
        </div>

        <CardContent className="p-6">
          <form onSubmit={handleSaveSettings}>
            <TabsContent value="general" className="mt-0 space-y-0">
              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
                <motion.div variants={itemVariants} className="space-y-2">
                  <Label htmlFor="site-name" className="text-sm font-medium">
                    Site Name
                  </Label>
                  <Input
                    id="site-name"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    placeholder="Enter your site name"
                    className="w-full bg-white border-gray-200 focus-visible:ring-blue-500"
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-2">
                  <Label htmlFor="site-description" className="text-sm font-medium">
                    Site Description
                  </Label>
                  <Textarea
                    id="site-description"
                    value={siteDescription}
                    onChange={(e) => setSiteDescription(e.target.value)}
                    placeholder="Brief description of your website"
                    className="w-full resize-none bg-white border-gray-200 focus-visible:ring-blue-500"
                    rows={3}
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-2">
                  <Label htmlFor="contact-email" className="text-sm font-medium">
                    Contact Email
                  </Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="contact@example.com"
                    className="w-full bg-white border-gray-200 focus-visible:ring-blue-500"
                  />
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="flex items-center justify-between space-x-2 bg-white p-4 rounded-lg border border-gray-200"
                >
                  <div className="space-y-0.5">
                    <Label htmlFor="maintenance-mode" className="text-sm font-medium">
                      Maintenance Mode
                    </Label>
                    <p className="text-xs text-muted-foreground">When enabled, visitors will see a maintenance page</p>
                  </div>
                  <Switch
                    id="maintenance-mode"
                    checked={maintenanceMode}
                    onCheckedChange={setMaintenanceMode}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </motion.div>
              </motion.div>
            </TabsContent>

            <TabsContent value="appearance" className="mt-0 space-y-0">
              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
                <motion.div variants={itemVariants} className="space-y-2">
                  <Label htmlFor="logo" className="text-sm font-medium">
                    Logo
                  </Label>
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center overflow-hidden border">
                      {logo ? (
                        <img
                          src={URL.createObjectURL(logo) || "/placeholder.svg"}
                          alt="Logo preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Settings2 className="h-8 w-8 text-muted-foreground/50" />
                      )}
                    </div>
                    <div className="flex-1">
                      <Input
                        id="logo"
                        type="file"
                        onChange={handleLogoChange}
                        className="hidden"
                        ref={fileInputRef}
                        accept="image/*"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full mb-1 bg-white border-gray-200 text-gray-700 hover:bg-gray-100"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        {logo ? "Change Logo" : "Upload Logo"}
                      </Button>
                      <p className="text-xs text-muted-foreground">Recommended size: 512x512px (PNG or SVG)</p>
                    </div>
                  </div>
                </motion.div>

                <Separator />

                <motion.div variants={itemVariants} className="space-y-2">
                  <Label htmlFor="font-family" className="text-sm font-medium">
                    Font Family
                  </Label>
                  <Select value={fontFamily} onValueChange={setFontFamily}>
                    <SelectTrigger className="bg-white border-gray-200">
                      <SelectValue placeholder="Select font family" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      <SelectItem value="Inter">Inter</SelectItem>
                      <SelectItem value="Roboto">Roboto</SelectItem>
                      <SelectItem value="Open Sans">Open Sans</SelectItem>
                      <SelectItem value="Montserrat">Montserrat</SelectItem>
                      <SelectItem value="Poppins">Poppins</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="mt-2 p-3 bg-white rounded-md border border-gray-200">
                    <p className={`text-sm ${fontFamily}`}>The quick brown fox jumps over the lazy dog.</p>
                  </div>
                </motion.div>
              </motion.div>
            </TabsContent>

            <TabsContent value="backup" className="mt-0 space-y-0">
              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
                <motion.div variants={itemVariants} className="space-y-2">
                  <Label htmlFor="timezone" className="text-sm font-medium">
                    Timezone
                  </Label>
                  <Input
                    id="timezone"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    placeholder="UTC+0"
                    className="w-full bg-white border-gray-200 focus-visible:ring-blue-500"
                  />
                  <p className="text-xs text-muted-foreground">Enter timezone in UTC format (e.g., UTC+2)</p>
                </motion.div>

                <Separator className="my-6" />

                <motion.div variants={itemVariants}>
                  <div className="flex items-center gap-2 mb-4">
                    <Database className="h-5 w-5 text-blue-500" />
                    <h3 className="text-lg font-medium">Database Backup</h3>
                  </div>

                  <BackupTab backupFrequency={backupFrequency} backupEnabled={backupEnabled} />
                </motion.div>
              </motion.div>
            </TabsContent>
          </form>
        </CardContent>

        <CardFooter className="flex items-center justify-between px-6 py-4 bg-white border-t border-gray-100">
          <p className="text-xs text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          <Button
            type="submit"
            onClick={handleSaveSettings}
            disabled={isLoading}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </CardFooter>
      </Tabs>
    </Card>
  )
}

export default GeneralSettings

