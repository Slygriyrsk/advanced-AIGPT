import { useState } from "react"
import { Drawer } from "vaul"
import { Button } from "@/components/ui/button"
import { Settings, Palette, Zap, Volume2, Monitor } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface SettingsDrawerProps {
  modelTemperature: number
  setModelTemperature: (value: number) => void
  maxTokens: number
  setMaxTokens: (value: number) => void
  theme: string
  toggleTheme: () => void
}

export function SettingsDrawer({
  modelTemperature,
  setModelTemperature,
  maxTokens,
  setMaxTokens,
  theme,
  toggleTheme,
}: SettingsDrawerProps) {
  const [open, setOpen] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [autoScroll, setAutoScroll] = useState(true)

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 mt-24 flex h-[96%] flex-col rounded-t-[10px] bg-background">
          <div className="flex-1 rounded-t-[10px] bg-background p-4">
            <div className="mx-auto max-w-md">
              <Drawer.Title className="mb-4 text-xl font-medium">Settings</Drawer.Title>
              <div className="space-y-6">
                <div>
                  <h3 className="flex items-center text-sm font-medium mb-4">
                    <Zap className="mr-2 h-4 w-4" />
                    AI Model Settings
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Temperature (Creativity): {modelTemperature}</Label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={modelTemperature}
                        onChange={(e) => setModelTemperature(Number.parseFloat(e.target.value))}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">
                        Higher values make the output more creative but less focused
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Max Tokens: {maxTokens}</Label>
                      <input
                        type="range"
                        min="100"
                        max="2000"
                        step="100"
                        value={maxTokens}
                        onChange={(e) => setMaxTokens(Number.parseInt(e.target.value))}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">Controls the maximum length of the AI's response</p>
                    </div>
                  </div>
                </div>
                <Separator />
                <div>
                  <h3 className="flex items-center text-sm font-medium mb-4">
                    <Palette className="mr-2 h-4 w-4" />
                    Appearance
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Dark Mode</Label>
                      <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
                    </div>
                  </div>
                </div>
                <Separator />
                <div>
                  <h3 className="flex items-center text-sm font-medium mb-4">
                    <Monitor className="mr-2 h-4 w-4" />
                    Interface
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Auto-scroll to latest message</Label>
                      <Switch checked={autoScroll} onCheckedChange={setAutoScroll} />
                    </div>
                  </div>
                </div>
                <Separator />
                <div>
                  <h3 className="flex items-center text-sm font-medium mb-4">
                    <Volume2 className="mr-2 h-4 w-4" />
                    Sound
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Message sounds</Label>
                      <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}