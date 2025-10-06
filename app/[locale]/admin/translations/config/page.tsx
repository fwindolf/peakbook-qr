import { TranslationConfigForm } from "./translation-config-form"

export default function TranslationConfigPage() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Translation Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure brand voice, tone, and style guidelines for each language
        </p>
      </div>

      <TranslationConfigForm />
    </div>
  )
}
