import { notFound } from "next/navigation";
import { getTemplateById } from "@/lib/templates";
import CustomizeClient from "./CustomizeClient";
export default async function CustomizePage({params}:{params:Promise<{templateId:string}>}){const {templateId}=await params; const template=getTemplateById(templateId); if(!template) notFound(); return <CustomizeClient initialTemplate={template} isAdmin={false}/>}
