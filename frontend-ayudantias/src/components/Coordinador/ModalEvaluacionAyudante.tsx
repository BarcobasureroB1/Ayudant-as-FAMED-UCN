import React, { useState, useEffect } from 'react';
import { AyudanteActivoData } from '@/hooks/useCoordinadores';
import { 
    X, 
    Brain, 
    HeartHandshake, 
    Star, 
    Info, 
    Send, 
    Calculator, 
    GraduationCap 
} from 'lucide-react';

interface EvaluacionAyudanteProps {
    ayudante: AyudanteActivoData;
    onClose: () => void;
    onConfirm: (nota: number) => void;
}

export const ModalEvaluacionAyudante = ({ ayudante, onClose, onConfirm }: EvaluacionAyudanteProps) => {
    const [notaCognitiva, setNotaCognitiva] = useState<number>(5.0);
    const [notaActitudinal, setNotaActitudinal] = useState<number>(5.0);
    const [notaGeneral, setNotaGeneral] = useState<number>(5.0);
    
    const [promedioFinal, setPromedioFinal] = useState<number>(5.0);

    useEffect(() => {
        const suma = Number(notaCognitiva) + Number(notaActitudinal) + Number(notaGeneral);
        const promedio = suma / 3;
        setPromedioFinal(parseFloat(promedio.toFixed(1)));
    }, [notaCognitiva, notaActitudinal, notaGeneral]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm(Math.round(promedioFinal * 10));
    };

    const getColorClass = (val: number) => val < 4.0 ? 'text-orange-500' : 'text-blue-600';
    const getColorHex = (val: number) => val < 4.0 ? '#f97316' : '#2563eb'; 

    const renderRangeInput = (
        label: string, 
        value: number, 
        onChange: (val: number) => void,
        Icon: React.ElementType
    ) => {
        const percentage = ((value - 1) / (5 - 1)) * 100;
        const activeColor = getColorHex(value);

        return (
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex gap-4 mb-4">
                    
                    
                    <div className={`shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-gray-50 ${getColorClass(value)} transition-colors`}>
                        <Icon size={20} />
                    </div>

                    <div className="flex-1 pt-0.5">
                        <p className="text-sm font-medium text-gray-700 leading-snug">
                            {label}
                        </p>
                    </div>

                    <div className="shrink-0 text-right">
                        <span className={`text-2xl font-black ${getColorClass(value)} tabular-nums block leading-none`}>
                            {value.toFixed(1)}
                        </span>
                        <span className="text-[10px] font-semibold text-gray-400 uppercase">Nota</span>
                    </div>
                </div>
                
                <div className="relative w-full h-6 flex items-center mt-2">
                    <input 
                        type="range" min="1" max="5" step="0.1"
                        className="relative w-full h-2 rounded-lg appearance-none cursor-pointer z-10 focus:outline-none"
                        value={value}
                        onChange={(e) => onChange(Number(e.target.value))}
                        style={{
                            background: `linear-gradient(to right, ${activeColor} 0%, ${activeColor} ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`
                        }}
                    />

                    <style jsx>{`
                        input[type=range]::-webkit-slider-thumb {
                            -webkit-appearance: none;
                            height: 20px;
                            width: 20px;
                            border-radius: 50%;
                            background: #ffffff;
                            border: 2px solid ${activeColor};
                            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                            transition: transform 0.1s;
                            margin-top: 0px;
                        }
                        input[type=range]::-webkit-slider-thumb:hover {
                            transform: scale(1.1);
                            cursor: grab;
                        }
                        input[type=range]::-moz-range-thumb {
                            height: 20px;
                            width: 20px;
                            border-radius: 50%;
                            background: #ffffff;
                            border: 2px solid ${activeColor};
                            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                            transition: transform 0.1s;
                        }
                    `}</style>
                </div>
                
                <div className="flex justify-between text-[10px] font-medium text-gray-400 mt-1">
                    <span>1.0 (Min)</span>
                    <span>5.0 (Max)</span>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900/60 z-50 p-4 backdrop-blur-sm transition-opacity">
             <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                
                <div className="bg-white px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
                    <div className="flex gap-3 items-center">
                        <div className="bg-blue-50 p-2.5 rounded-xl">
                            <GraduationCap className="text-blue-600" size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 leading-tight">Evaluación de Ayudantía</h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Ayudante: <span className="font-semibold text-gray-700">{ayudante.alumno.nombres} {ayudante.alumno.apellidos}</span>
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                    
                    <div className="overflow-y-auto custom-scrollbar p-6 bg-gray-50/50 flex-1">
                        
                        <div className="flex gap-3 bg-blue-50 border border-blue-100 p-3.5 rounded-lg mb-5 shadow-sm">
                            <Info className="text-blue-500 shrink-0 mt-0.5" size={18} />
                            <p className="text-sm text-slate-700 font-medium leading-relaxed">
                                Califique los siguientes aspectos del desempeño semestral utilizando la escala de 1.0 a 5.0.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {renderRangeInput(
                                "Aspectos cognitivos, cumplimiento de objetivos y actividades, destrezas, participación activa entre otros.", 
                                notaCognitiva, 
                                setNotaCognitiva, 
                                Brain
                            )}
                            {renderRangeInput(
                                "Aspectos de responsabilidad, puntualidad, respeto, confidencialidad (si lo requiere), proactividad, capacidad de autocrítica entre otros.", 
                                notaActitudinal, 
                                setNotaActitudinal, 
                                HeartHandshake
                            )}
                            {renderRangeInput(
                                "Evaluación general del estudiante.", 
                                notaGeneral, 
                                setNotaGeneral, 
                                Star
                            )}
                        </div>
                    </div>

                    <div className="p-4 border-t border-gray-100 bg-white shrink-0">
                        <div className="bg-gray-900 rounded-xl p-3.5 text-white shadow-lg mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-1.5 rounded-lg">
                                    <Calculator size={20} className="text-white" />
                                </div>
                                <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Promedio Final</span>
                            </div>
                            <span className="text-3xl font-extrabold tracking-tight tabular-nums">
                                {promedioFinal.toFixed(1)}
                            </span>
                        </div>

                        <div className="flex gap-3">
                            <button 
                                type="button" 
                                onClick={onClose} 
                                className="flex-1 px-4 py-2.5 text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 rounded-xl text-sm font-semibold transition-all"
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit" 
                                className="flex-[2] px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                            >
                                <Send size={16} />
                                Enviar Evaluación
                            </button>
                        </div>
                    </div>

                </form>

             </div>
        </div>
    
    );
};
