"use client";
import { useMemo, useState } from "react";
import type { Template } from "@/types";
export function useCustomization(initial: Template){const [template,setTemplate]=useState(initial); return useMemo(()=>({template,setTemplate}),[template]);}
