import { templates } from "@/lib/templates";
import CustomizeClient from "@/app/customize/[templateId]/CustomizeClient";
export default function StudioPage(){return <CustomizeClient initialTemplate={templates[0]} isAdmin/>}
