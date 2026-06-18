import { getTemplateById } from "@/lib/templates";
import PreviewRenderer from "./PreviewRenderer";
export default async function PreviewPage({params}:{params:Promise<{templateId:string}>}){const {templateId}=await params; return <PreviewRenderer initialTemplate={getTemplateById(templateId)}/>}
