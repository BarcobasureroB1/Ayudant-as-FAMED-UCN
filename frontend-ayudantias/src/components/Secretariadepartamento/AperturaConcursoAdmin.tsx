"use client";

import React, { useState } from "react";
import Select from "react-select";


const InfoCard = ({ title, children, className = "" }: { title: string; children?: React.ReactNode; className?: string }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">{title}</h3>
        {children}
    </div>
);

export default function AperturaConcursoAdmin() {
  

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 max-w-3xl mx-auto">
      <InfoCard title="Todas las Asignaturas de todos los departamentos">
        
      </InfoCard>
    </div>
  );
}
