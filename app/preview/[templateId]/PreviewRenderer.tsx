"use client";
import { useEffect, useState } from "react";
import { SectionRenderer } from "@/lib/registry";
import type { Template } from "@/types";
export default function PreviewRenderer({initialTemplate}:{initialTemplate:Template|null}){const [template,setTemplate]=useState(initialTemplate); useEffect(()=>{const on=(e:MessageEvent)=>{if(e.data?.type==="VIBECODE_UPDATE") setTemplate(e.data.template)}; addEventListener("message",on); return()=>removeEventListener("message",on)},[]); return template?<SectionRenderer template={template}/>:null}
