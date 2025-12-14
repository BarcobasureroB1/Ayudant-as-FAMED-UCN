"use client";

import React, { useState, useMemo } from "react";
import { Search, FileText, CheckCircle, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { usePostulantesGlobales, PostulanteCoordinadorData } from "@/hooks/useCoordinadores";
import { ModalVerCurriculum } from "@/components/Coordinador/ModalVerCurriculum";
import { useSeleccionarAyudante } from "@/hooks/useAyudantia";

