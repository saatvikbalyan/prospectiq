"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Settings, User, Bell, Key, Shield, Palette } from "lucide-react"

export default function SettingsPage() {
  return (
    <SidebarInset className="gradient-bg">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/10 px-6 backdrop-blur-sm bg-white/5">
        <SidebarTrigger className="-ml-1 text-white hover:bg-white/10" />
        <Separator orientation="vertical" className="mr-2 h-4 bg-white/20" />
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-blue-400" />
          <h1 className="text-lg font-semibold text-white">Settings</h1>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-8 p-6">
        {/* Header Section */}
        <div className="glass-effect rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Account Settings</h2>
              <p className="text-blue-200">Manage your account preferences and settings</p>
            </div>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              <Shield className="h-3 w-3 mr-1" />
              Secure Account
            </Badge>
          </div>
        </div>

        {/* Profile Settings */}
        <Card className="card-gradient border-white/10">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <User className="h-5 w-5 text-blue-400" />
              Profile Information
            </CardTitle>
            <CardDescription className="text-blue-200">
              Update your personal information and profile settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24 ring-4 ring-blue-500/30">
                <AvatarImage src="/placeholder.svg?height=96&width=96" />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xl">
                  JD
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Button variant="outline" className="secondary-button">
                  <Palette className="h-4 w-4 mr-2" />
                  Change Avatar
                </Button>
                <p className="text-sm text-blue-300">JPG, PNG or GIF. Max size 2MB.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="firstName" className="text-white font-medium">
                  First Name
                </Label>
                <Input id="firstName" defaultValue="John" className="bg-white/5 border-white/20 text-white" />
              </div>
              <div className="space-y-3">
                <Label htmlFor="lastName" className="text-white font-medium">
                  Last Name
                </Label>
                <Input id="lastName" defaultValue="Doe" className="bg-white/5 border-white/20 text-white" />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="email" className="text-white font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                defaultValue="john.doe@example.com"
                className="bg-white/5 border-white/20 text-white"
              />
            </div>

            <Button className="primary-button">Save Changes</Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="card-gradient border-white/10">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-400" />
              Notification Preferences
            </CardTitle>
            <CardDescription className="text-blue-200">
              Configure how you receive notifications and updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-6">
              <div className="glass-effect rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Task Completion Alerts</p>
                    <p className="text-sm text-blue-200">Get notified when analysis tasks complete</p>
                  </div>
                  <Switch defaultChecked className="data-[state=checked]:bg-blue-500" />
                </div>
              </div>

              <div className="glass-effect rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Weekly Reports</p>
                    <p className="text-sm text-blue-200">Receive weekly summary reports via email</p>
                  </div>
                  <Switch defaultChecked className="data-[state=checked]:bg-blue-500" />
                </div>
              </div>

              <div className="glass-effect rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Marketing Updates</p>
                    <p className="text-sm text-blue-200">Product updates and feature announcements</p>
                  </div>
                  <Switch className="data-[state=checked]:bg-blue-500" />
                </div>
              </div>

              <div className="glass-effect rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Real-time Notifications</p>
                    <p className="text-sm text-blue-200">Browser notifications for important updates</p>
                  </div>
                  <Switch defaultChecked className="data-[state=checked]:bg-blue-500" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Settings */}
        <Card className="card-gradient border-white/10">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <Key className="h-5 w-5 text-blue-400" />
              API Access & Security
            </CardTitle>
            <CardDescription className="text-blue-200">Manage your API keys and security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="glass-effect rounded-xl p-4 border border-white/10">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="apiKey" className="text-white font-medium">
                    API Key
                  </Label>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
                </div>
                <div className="flex gap-3">
                  <Input
                    id="apiKey"
                    type="password"
                    defaultValue="pk_live_1234567890abcdef"
                    readOnly
                    className="bg-white/5 border-white/20 text-white flex-1"
                  />
                  <Button variant="outline" className="secondary-button">
                    Regenerate
                  </Button>
                </div>
              </div>
            </div>

            <div className="glass-effect rounded-xl p-4 border border-white/10">
              <div className="space-y-3">
                <Label className="text-white font-medium">Rate Limits</Label>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-blue-200">Current plan: Premium</p>
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">1,000 requests/hour</Badge>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full"
                    style={{ width: "35%" }}
                  ></div>
                </div>
                <p className="text-xs text-blue-300">350 of 1,000 requests used this hour</p>
              </div>
            </div>

            <Button className="primary-button">
              <Shield className="h-4 w-4 mr-2" />
              Update Security Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </SidebarInset>
  )
}
